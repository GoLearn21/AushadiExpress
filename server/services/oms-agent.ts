/**
 * Order Management System (OMS) Agent
 *
 * Handles all order lifecycle operations including:
 * - Order validation
 * - Inventory management
 * - Status transitions
 * - Notifications
 * - Event logging
 */

import { db } from "../db";
import { sales, products, stock, notifications, orderEvents, users } from "../../shared/schema";
import { eq, and, lt, sql } from "drizzle-orm";

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'rejected' | 'cancelled' | 'expired';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'online';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface NotificationData {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  orderId: string;
}

export class OMSAgent {
  /**
   * Accept an order and deduct inventory
   */
  async acceptOrder(orderId: string, actorId: string, estimatedTime?: number): Promise<any> {
    try {
      // Get order details
      const [order] = await db.select().from(sales).where(eq(sales.id, orderId));

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending') {
        throw new Error(`Cannot accept order with status: ${order.status}`);
      }

      // Check if order has expired
      if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
        await this.expireOrder(orderId);
        throw new Error('Order has expired');
      }

      // Parse order items
      const items: OrderItem[] = typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items || [];

      // Verify inventory availability
      const inventoryCheck = await this.validateInventory(order.tenantId, items);
      if (!inventoryCheck.available) {
        throw new Error(`Insufficient inventory for: ${inventoryCheck.unavailableItems.join(', ')}`);
      }

      // Deduct inventory
      await this.deductInventory(order.tenantId, items, orderId);

      // Update order status
      await db.update(sales)
        .set({
          status: 'confirmed',
          estimatedReadyTime: estimatedTime || 30,
          updatedAt: new Date(),
        })
        .where(eq(sales.id, orderId));

      // Log event
      await this.logEvent({
        orderId,
        eventType: 'accepted',
        actorId,
        actorRole: 'retailer',
        metadata: { estimatedTime }
      });

      // Send notification to customer
      await this.notifyCustomer(order, 'ORDER_ACCEPTED', {
        estimatedTime: estimatedTime || 30
      });

      console.log(`[OMS] Order ${orderId} accepted`);

      return { success: true, order };
    } catch (error) {
      console.error('[OMS] Accept order failed:', error);
      throw error;
    }
  }

  /**
   * Reject an order and notify customer
   */
  async rejectOrder(orderId: string, actorId: string, reason: string): Promise<any> {
    try {
      const [order] = await db.select().from(sales).where(eq(sales.id, orderId));

      if (!order) {
        throw new Error('Order not found');
      }

      if (!['pending', 'confirmed'].includes(order.status as string)) {
        throw new Error(`Cannot reject order with status: ${order.status}`);
      }

      // If inventory was deducted (confirmed status), restore it
      if (order.status === 'confirmed') {
        const items: OrderItem[] = typeof order.items === 'string'
          ? JSON.parse(order.items)
          : order.items || [];
        await this.restoreInventory(order.tenantId, items, orderId);
      }

      // Update order status
      await db.update(sales)
        .set({
          status: 'rejected',
          rejectionReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(sales.id, orderId));

      // Log event
      await this.logEvent({
        orderId,
        eventType: 'rejected',
        actorId,
        actorRole: 'retailer',
        metadata: { reason }
      });

      // Send notification to customer
      await this.notifyCustomer(order, 'ORDER_REJECTED', { reason });

      console.log(`[OMS] Order ${orderId} rejected: ${reason}`);

      return { success: true, order };
    } catch (error) {
      console.error('[OMS] Reject order failed:', error);
      throw error;
    }
  }

  /**
   * Mark order as preparing
   */
  async markPreparing(orderId: string, actorId: string): Promise<any> {
    return this.updateOrderStatus(orderId, 'preparing', actorId, 'retailer');
  }

  /**
   * Mark order as ready for pickup
   */
  async markReady(orderId: string, actorId: string): Promise<any> {
    const result = await this.updateOrderStatus(orderId, 'ready', actorId, 'retailer');

    // Notify customer
    const [order] = await db.select().from(sales).where(eq(sales.id, orderId));
    if (order) {
      await this.notifyCustomer(order, 'ORDER_READY', {});
    }

    return result;
  }

  /**
   * Complete order (after customer picks up and pays)
   */
  async completeOrder(orderId: string, actorId: string, paymentMethod: PaymentMethod): Promise<any> {
    try {
      await db.update(sales)
        .set({
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod,
          pickupTime: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sales.id, orderId));

      await this.logEvent({
        orderId,
        eventType: 'completed',
        actorId,
        actorRole: 'retailer',
        metadata: { paymentMethod }
      });

      const [order] = await db.select().from(sales).where(eq(sales.id, orderId));
      if (order) {
        await this.notifyCustomer(order, 'ORDER_COMPLETED', { paymentMethod });
      }

      console.log(`[OMS] Order ${orderId} completed`);

      return { success: true };
    } catch (error) {
      console.error('[OMS] Complete order failed:', error);
      throw error;
    }
  }

  /**
   * Cancel order (customer-initiated before confirmation)
   */
  async cancelOrder(orderId: string, customerId: string): Promise<any> {
    try {
      const [order] = await db.select().from(sales).where(eq(sales.id, orderId));

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.customerId !== customerId) {
        throw new Error('Unauthorized');
      }

      if (!['pending'].includes(order.status as string)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      await db.update(sales)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(sales.id, orderId));

      await this.logEvent({
        orderId,
        eventType: 'cancelled',
        actorId: customerId,
        actorRole: 'customer',
        metadata: {}
      });

      // Notify pharmacy
      await this.notifyPharmacy(order, 'ORDER_CANCELLED', {});

      console.log(`[OMS] Order ${orderId} cancelled by customer`);

      return { success: true };
    } catch (error) {
      console.error('[OMS] Cancel order failed:', error);
      throw error;
    }
  }

  /**
   * Auto-expire orders that haven't been accepted within timeout
   */
  async expireOrder(orderId: string): Promise<any> {
    try {
      const [order] = await db.select().from(sales).where(eq(sales.id, orderId));

      if (!order || order.status !== 'pending') {
        return { success: false };
      }

      await db.update(sales)
        .set({
          status: 'expired',
          rejectionReason: 'Order expired - pharmacy did not respond in time',
          updatedAt: new Date(),
        })
        .where(eq(sales.id, orderId));

      await this.logEvent({
        orderId,
        eventType: 'expired',
        actorId: null,
        actorRole: null,
        metadata: { autoRejected: true }
      });

      await this.notifyCustomer(order, 'ORDER_EXPIRED', {});

      console.log(`[OMS] Order ${orderId} expired`);

      return { success: true };
    } catch (error) {
      console.error('[OMS] Expire order failed:', error);
      throw error;
    }
  }

  /**
   * Monitor and auto-reject expired orders
   */
  async monitorOrderTimeouts(): Promise<void> {
    try {
      const expiredOrders = await db.select()
        .from(sales)
        .where(
          and(
            eq(sales.status, 'pending'),
            lt(sales.expiresAt as any, new Date())
          )
        );

      for (const order of expiredOrders) {
        await this.expireOrder(order.id);
      }

      if (expiredOrders.length > 0) {
        console.log(`[OMS] Auto-rejected ${expiredOrders.length} expired orders`);
      }
    } catch (error) {
      console.error('[OMS] Monitor timeouts failed:', error);
    }
  }

  /**
   * Validate inventory availability
   */
  private async validateInventory(tenantId: string, items: OrderItem[]): Promise<{
    available: boolean;
    unavailableItems: string[];
  }> {
    const unavailableItems: string[] = [];

    for (const item of items) {
      const [product] = await db.select()
        .from(products)
        .where(
          and(
            eq(products.id, item.productId),
            eq(products.tenantId, tenantId)
          )
        );

      if (!product || product.totalQuantity < item.quantity) {
        unavailableItems.push(item.productName);
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
  }

  /**
   * Deduct inventory on order acceptance
   */
  private async deductInventory(tenantId: string, items: OrderItem[], orderId: string): Promise<void> {
    for (const item of items) {
      // Update product totalQuantity
      await db.update(products)
        .set({
          totalQuantity: sql`total_quantity - ${item.quantity}`
        })
        .where(
          and(
            eq(products.id, item.productId),
            eq(products.tenantId, tenantId)
          )
        );

      // Deduct from stock batches (FEFO - First Expired, First Out)
      let remainingQty = item.quantity;

      // Get all stock items for this product, sorted by expiry date
      const stockItems = await db.select()
        .from(stock)
        .where(
          and(
            eq(stock.productId, item.productId),
            eq(stock.tenantId, tenantId),
            sql`${stock.quantity} > 0`
          )
        )
        .orderBy(stock.expiryDate);

      for (const stockItem of stockItems) {
        if (remainingQty <= 0) break;

        const deductQty = Math.min(remainingQty, stockItem.quantity);

        await db.update(stock)
          .set({
            quantity: stockItem.quantity - deductQty
          })
          .where(eq(stock.id, stockItem.id));

        remainingQty -= deductQty;
        console.log(`[OMS] Deducted ${deductQty} units from stock batch ${stockItem.batchNumber}`);
      }

      console.log(`[OMS] Deducted ${item.quantity} units of ${item.productName} for order ${orderId}`);
    }
  }

  /**
   * Restore inventory on order rejection/cancellation
   */
  private async restoreInventory(tenantId: string, items: OrderItem[], orderId: string): Promise<void> {
    for (const item of items) {
      // Update product totalQuantity
      await db.update(products)
        .set({
          totalQuantity: sql`total_quantity + ${item.quantity}`
        })
        .where(
          and(
            eq(products.id, item.productId),
            eq(products.tenantId, tenantId)
          )
        );

      // Restore to stock batches (add back to the first available batch)
      // In a real-world scenario, you might want to track which batches were deducted
      // For now, we'll add back to the earliest expiring batch with available space
      const stockItems = await db.select()
        .from(stock)
        .where(
          and(
            eq(stock.productId, item.productId),
            eq(stock.tenantId, tenantId)
          )
        )
        .orderBy(stock.expiryDate);

      if (stockItems.length > 0) {
        // Add back to the first batch (earliest expiring)
        const firstBatch = stockItems[0];
        await db.update(stock)
          .set({
            quantity: firstBatch.quantity + item.quantity
          })
          .where(eq(stock.id, firstBatch.id));

        console.log(`[OMS] Restored ${item.quantity} units to stock batch ${firstBatch.batchNumber}`);
      }

      console.log(`[OMS] Restored ${item.quantity} units of ${item.productName} for order ${orderId}`);
    }
  }

  /**
   * Update order status
   */
  private async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    actorId: string,
    actorRole: string
  ): Promise<any> {
    await db.update(sales)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(sales.id, orderId));

    await this.logEvent({
      orderId,
      eventType: status,
      actorId,
      actorRole,
      metadata: {}
    });

    return { success: true };
  }

  /**
   * Log order event for audit trail
   */
  private async logEvent(event: {
    orderId: string;
    eventType: string;
    actorId: string | null;
    actorRole: string | null;
    metadata: any;
  }): Promise<void> {
    await db.insert(orderEvents).values({
      orderId: event.orderId,
      eventType: event.eventType,
      actorId: event.actorId,
      actorRole: event.actorRole,
      metadata: event.metadata,
    });
  }

  /**
   * Send notification to customer
   */
  private async notifyCustomer(order: any, type: string, data: any): Promise<void> {
    if (!order.customerId) return;

    const templates: Record<string, (data: any) => { title: string; message: string }> = {
      ORDER_ACCEPTED: (d) => ({
        title: 'Order Confirmed',
        message: `${order.storeName} confirmed your order. Ready in ${d.estimatedTime} mins.`
      }),
      ORDER_REJECTED: (d) => ({
        title: 'Order Rejected',
        message: `${order.storeName} couldn't fulfill your order. Reason: ${d.reason}`
      }),
      ORDER_READY: () => ({
        title: 'Order Ready for Pickup',
        message: `Your order is ready at ${order.storeName}!`
      }),
      ORDER_COMPLETED: (d) => ({
        title: 'Order Completed',
        message: `Thank you for your order! ₹${order.total} paid via ${d.paymentMethod}.`
      }),
      ORDER_EXPIRED: () => ({
        title: 'Order Expired',
        message: `Your order at ${order.storeName} expired. Please place a new order.`
      }),
    };

    const template = templates[type];
    if (!template) return;

    const { title, message } = template(data);

    await db.insert(notifications).values({
      tenantId: order.customerTenantId || 'default',
      userId: order.customerId,
      type: type.toLowerCase(),
      title,
      message,
      orderId: order.id,
    });

    console.log(`[OMS] Notification sent to customer: ${type}`);
  }

  /**
   * Send notification to pharmacy
   */
  async notifyPharmacy(order: any, type: string, data: any): Promise<void> {
    // Get pharmacy owner user
    const [pharmacyOwner] = await db.select()
      .from(users)
      .where(
        and(
          eq(users.tenantId, order.tenantId),
          eq(users.role, 'retailer')
        )
      )
      .limit(1);

    if (!pharmacyOwner) return;

    const templates: Record<string, (data: any) => { title: string; message: string }> = {
      ORDER_PLACED: (d) => ({
        title: 'New Order Received',
        message: `Order #${order.id.slice(0, 8)} from ${order.customerName || 'Customer'} - ₹${order.total}`
      }),
      ORDER_CANCELLED: () => ({
        title: 'Order Cancelled',
        message: `Customer cancelled order #${order.id.slice(0, 8)}`
      }),
    };

    const template = templates[type];
    if (!template) return;

    const { title, message } = template(data);

    await db.insert(notifications).values({
      tenantId: order.tenantId,
      userId: pharmacyOwner.id,
      type: type.toLowerCase(),
      title,
      message,
      orderId: order.id,
    });

    console.log(`[OMS] Notification sent to pharmacy: ${type}`);
  }

  /**
   * Get order events (audit trail)
   */
  async getOrderEvents(orderId: string): Promise<any[]> {
    return await db.select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(orderEvents.createdAt);
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string, tenantId: string): Promise<any[]> {
    return await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.tenantId, tenantId)
        )
      )
      .orderBy(sql`${notifications.createdAt} DESC`)
      .limit(50);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }
}

// Export singleton instance
export const omsAgent = new OMSAgent();
