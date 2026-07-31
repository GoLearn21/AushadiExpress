import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6),
  tenantName: z.string().optional(),
  role: z.enum(['customer', 'retailer', 'wholesaler', 'doctor']).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').optional(),
  // Wholesaler-specific fields
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format').optional(),
  businessAddress: z.string().max(500).optional(),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional(),
  specialization: z.string().max(100).optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, tenantName, role, pincode, gstNumber, businessAddress, contactPhone, specialization } = registerSchema.parse(req.body);

    // Validate role-specific requirements
    const userRole = role || 'retailer';

    // Determine the final username based on role
    let finalUsername: string;

    if (userRole === 'customer') {
      // Customers: use username (their name)
      if (!username) {
        return res.status(400).json({ error: 'Name is required for customer registration' });
      }
      finalUsername = username;
    } else {
      // Business roles (retailer, wholesaler, doctor): use tenantName (business name)
      if (!tenantName) {
        return res.status(400).json({ error: 'Business name is required for business registration' });
      }
      finalUsername = tenantName;
    }

    // Additional validation for doctor
    if (userRole === 'doctor') {
      if (!contactPhone) {
        return res.status(400).json({ error: 'Contact phone is required for doctor registration' });
      }
    }

    // Additional validation for wholesaler
    if (userRole === 'wholesaler') {
      if (!gstNumber) {
        return res.status(400).json({ error: 'GST number is required for wholesaler registration' });
      }
      if (!businessAddress) {
        return res.status(400).json({ error: 'Business address is required for wholesaler registration' });
      }
      if (!contactPhone) {
        return res.status(400).json({ error: 'Contact phone is required for wholesaler registration' });
      }
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(finalUsername);
    if (existingUser) {
      return res.status(400).json({
        error: userRole === 'customer'
          ? 'This name is already registered'
          : 'This business name is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await storage.createUser({
      username: finalUsername,
      password: hashedPassword,
      role: userRole,
      pincode: pincode || null,
      onboarded: userRole === 'customer' ? false : true,
      // Wholesaler-specific fields
      gstNumber: userRole === 'wholesaler' ? gstNumber : null,
      businessAddress: userRole === 'wholesaler' ? businessAddress : null,
      contactPhone: (userRole === 'wholesaler' || userRole === 'doctor') ? contactPhone : null,
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
        tenantId: user.tenantId,
        onboarded: user.onboarded,
        pincode: user.pincode
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
        tenantId: user.tenantId,
        onboarded: user.onboarded,
        pincode: user.pincode
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
      tenantId: user.tenantId,
      onboarded: user.onboarded,
      pincode: user.pincode
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
    
    // Determine the final role (current or updated)
    const finalRole = role || user.role;

    // Validate pincode requirement for all roles
    const finalPincode = pincode !== undefined ? pincode : user.pincode;
    if (!finalPincode || !/^\d{6}$/.test(finalPincode)) {
      return res.status(400).json({ error: 'Valid 6-digit pincode is required' });
    }
    user.pincode = finalPincode;

    // Mark user as onboarded once they provide pincode
    if (pincode && !user.onboarded) {
      user.onboarded = true;
    }
    
    // Update user role if provided
    if (role) {
      user.role = role;
    }
    
    // Update business name (username) if provided
    if (businessName) {
      user.username = businessName;
    }
    
    await storage.updateUser(user);
    
    console.log('[AUTH] Updated profile for user:', user.username);
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
      onboarded: user.onboarded,
      pincode: user.pincode
    });
  } catch (error) {
    console.error('[AUTH ERROR] Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
