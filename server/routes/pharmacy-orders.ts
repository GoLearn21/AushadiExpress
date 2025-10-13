/**
 * Pharmacy Order Management Routes
 *
 * Endpoints for pharmacies to manage incoming orders
 */

import { Router, type Request, type Response } from 'express';
import { omsAgent } from '../services/oms-agent';
import { db } from '../db';
import { sales } from '../../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { tenantContext, type TenantRequest } from '../middleware/tenant-context';

const router = Router();

// Middleware to check retailer role
const requireRetailer = (req: any, res: Response, next: Function) => {
  if (req.session?.userRole !== 'retailer') {
    return res.status(403).json({ error: 'Only pharmacies can access this endpoint' });
  }
  next();
};

/**
 * GET /api/pharmacy/orders
 * Get orders for the pharmacy
 */
router.get('/pharmacy/orders', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const status = req.query.status as string | undefined;

    console.log('[PHARMACY-ORDERS] Fetching orders for tenantId:', tenantId);

    let query = db.select()
      .from(sales)
      .where(eq(sales.tenantId, tenantId))
      .orderBy(desc(sales.date));

    // Filter by status if provided
    if (status) {
      const orders = await query;
      const filteredOrders = orders.filter(o => o.status === status);

      // Get counts for all statuses
      const counts = orders.reduce((acc: any, order) => {
        const orderStatus = order.status || 'pending';
        acc[orderStatus] = (acc[orderStatus] || 0) + 1;
        return acc;
      }, {});

      return res.json({ orders: filteredOrders, counts });
    }

    const orders = await query;

    console.log('[PHARMACY-ORDERS] Found orders:', orders.length);
    console.log('[PHARMACY-ORDERS] Orders:', orders.map(o => ({ id: o.id, status: o.status, customerName: o.customerName })));

    // Calculate counts by status
    const counts = orders.reduce((acc: any, order) => {
      const orderStatus = order.status || 'pending';
      acc[orderStatus] = (acc[orderStatus] || 0) + 1;
      return acc;
    }, {});

    res.json({ orders, counts });
  } catch (error) {
    console.error('[PHARMACY-ORDERS] Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * POST /api/pharmacy/orders/:id/accept
 * Accept an order
 */
router.post('/pharmacy/orders/:id/accept', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const actorId = req.session?.userId;
    const { estimatedTime } = req.body;

    const result = await omsAgent.acceptOrder(orderId, actorId, estimatedTime);

    res.json(result);
  } catch (error: any) {
    console.error('[PHARMACY-ORDERS] Accept failed:', error);
    res.status(400).json({ error: error.message || 'Failed to accept order' });
  }
});

/**
 * POST /api/pharmacy/orders/:id/reject
 * Reject an order
 */
router.post('/pharmacy/orders/:id/reject', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const actorId = req.session?.userId;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await omsAgent.rejectOrder(orderId, actorId, reason);

    res.json(result);
  } catch (error: any) {
    console.error('[PHARMACY-ORDERS] Reject failed:', error);
    res.status(400).json({ error: error.message || 'Failed to reject order' });
  }
});

/**
 * POST /api/pharmacy/orders/:id/preparing
 * Mark order as being prepared
 */
router.post('/pharmacy/orders/:id/preparing', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const actorId = req.session?.userId;

    const result = await omsAgent.markPreparing(orderId, actorId);

    res.json(result);
  } catch (error: any) {
    console.error('[PHARMACY-ORDERS] Mark preparing failed:', error);
    res.status(400).json({ error: error.message || 'Failed to update order' });
  }
});

/**
 * POST /api/pharmacy/orders/:id/ready
 * Mark order as ready for pickup
 */
router.post('/pharmacy/orders/:id/ready', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const actorId = req.session?.userId;

    const result = await omsAgent.markReady(orderId, actorId);

    res.json(result);
  } catch (error: any) {
    console.error('[PHARMACY-ORDERS] Mark ready failed:', error);
    res.status(400).json({ error: error.message || 'Failed to update order' });
  }
});

/**
 * POST /api/pharmacy/orders/:id/complete
 * Complete an order (customer paid and picked up)
 */
router.post('/pharmacy/orders/:id/complete', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const actorId = req.session?.userId;
    const { paymentMethod } = req.body;

    if (!paymentMethod || !['cash', 'upi', 'card', 'online'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Valid payment method is required' });
    }

    const result = await omsAgent.completeOrder(orderId, actorId, paymentMethod);

    res.json(result);
  } catch (error: any) {
    console.error('[PHARMACY-ORDERS] Complete failed:', error);
    res.status(400).json({ error: error.message || 'Failed to complete order' });
  }
});

/**
 * GET /api/pharmacy/orders/:id
 * Get order details with event history
 */
router.get('/pharmacy/orders/:id', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const tenantId = req.tenantId;

    const [order] = await db.select()
      .from(sales)
      .where(
        and(
          eq(sales.id, orderId),
          eq(sales.tenantId, tenantId)
        )
      );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const events = await omsAgent.getOrderEvents(orderId);

    res.json({ order, events });
  } catch (error) {
    console.error('[PHARMACY-ORDERS] Get order failed:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * GET /api/pharmacy/dashboard/stats
 * Get pharmacy dashboard statistics
 */
router.get('/pharmacy/dashboard/stats', tenantContext, requireRetailer, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;

    const orders = await db.select()
      .from(sales)
      .where(eq(sales.tenantId, tenantId));

    const stats = {
      totalOrders: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length,
      rejected: orders.filter(o => o.status === 'rejected').length,
      totalRevenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    console.error('[PHARMACY-ORDERS] Get stats failed:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
