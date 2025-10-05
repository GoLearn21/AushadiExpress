import { type Request, type Response, type NextFunction } from 'express';
import { storage } from '../storage';

export interface TenantRequest extends Request {
  tenantId: string;
  userId: string;
}

export async function requireAuth(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const session = (req as any).session;
    
    if (!session?.userId) {
      console.warn('[AUTH] Unauthorized request - no session');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (session.tenantId) {
      req.tenantId = session.tenantId;
      req.userId = session.userId;
      console.log(`[AUTH] Session found - User: ${session.userId} - Tenant: ${session.tenantId}`);
      return next();
    }
    
    const user = await storage.getUser(session.userId);
    if (!user || !user.tenantId) {
      console.error(`[AUTH] User ${session.userId} has no tenant ID`);
      return res.status(403).json({ error: 'Invalid user account' });
    }
    
    req.tenantId = user.tenantId;
    req.userId = user.id;
    session.tenantId = user.tenantId;
    console.log(`[AUTH] Loaded tenant from DB - User ${user.username} (${user.id}) - Tenant: ${user.tenantId}`);
    
    next();
  } catch (error) {
    console.error('[AUTH] Error in authentication middleware:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

export const tenantContext = requireAuth;
