import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  tenantName: z.string().optional(),
  role: z.string().optional(),
  pincode: z.string().max(10).optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, tenantName, role, pincode } = registerSchema.parse(req.body);
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      role: role || 'retailer',
      pincode: pincode || null,
      onboarded: true,
    });
    
    (req.session as any).userId = user.id;
    (req.session as any).userRole = user.role;
    (req.session as any).tenantId = user.tenantId;
    
    // Save session explicitly before responding
    req.session.save((err) => {
      if (err) {
        console.error('[AUTH ERROR] Session save failed:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }
      
      console.log(`[AUTH] User registered: ${user.username} (${user.id}) - Tenant: ${user.tenantId}`);
      console.log('[AUTH DEBUG] Session after save:', {
        sessionID: req.sessionID,
        userId: (req.session as any).userId,
        hasCookie: !!req.headers.cookie
      });
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[AUTH ERROR] Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    (req.session as any).userId = user.id;
    (req.session as any).userRole = user.role;
    (req.session as any).tenantId = user.tenantId;
    
    // Save session explicitly before responding
    req.session.save((err) => {
      if (err) {
        console.error('[AUTH ERROR] Session save failed:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      
      console.log(`[AUTH] User logged in: ${user.username} (${user.id}) - Tenant: ${user.tenantId}`);
      
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[AUTH ERROR] Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[AUTH ERROR] Logout failed:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', async (req, res) => {
  try {
    const session = (req as any).session;
    console.log('[AUTH DEBUG] Session check:', {
      hasSession: !!session,
      userId: session?.userId,
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
    
    if (!session?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('[AUTH] Session valid for user:', user.username);
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId
    });
  } catch (error) {
    console.error('[AUTH ERROR] Failed to get current user:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Update user role and business name
router.patch('/update-profile', async (req, res) => {
  try {
    const session = (req as any).session;
    
    if (!session?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { role, businessName, pincode } = req.body;
    const user = await storage.getUser(session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user role if provided
    if (role) {
      user.role = role;
    }
    
    // Update business name (username) if provided
    if (businessName) {
      user.username = businessName;
    }
    
    // Update pincode if provided
    if (pincode !== undefined) {
      user.pincode = pincode || null;
    }
    
    await storage.updateUser(user);
    
    console.log('[AUTH] Updated profile for user:', user.username);
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId
    });
  } catch (error) {
    console.error('[AUTH ERROR] Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
