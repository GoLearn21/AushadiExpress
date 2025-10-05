import { type Request, type Response, type NextFunction } from 'express';
import { storage } from '../storage';

export interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
}

export async function tenantContext(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const session = (req as any).session;
    
    if (session?.userId) {
      const user = await storage.getUser(session.userId);
      if (user && user.tenantId) {
        req.tenantId = user.tenantId;
        req.userId = user.id;
        console.log(`[TENANT-CONTEXT] User ${user.username} (${user.id}) - Tenant: ${user.tenantId}`);
      } else {
        console.warn(`[TENANT-CONTEXT] User ${session.userId} has no tenant ID`);
        req.tenantId = 'default';
      }
    } else {
      req.tenantId = 'default';
      console.log('[TENANT-CONTEXT] No user session, using default tenant');
    }
    
    next();
  } catch (error) {
    console.error('[TENANT-CONTEXT] Error getting tenant context:', error);
    req.tenantId = 'default';
    next();
  }
}
