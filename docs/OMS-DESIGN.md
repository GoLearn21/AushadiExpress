# Order Management System (OMS) - Design Document

## Overview

The Order Management System (OMS) manages the complete order lifecycle from placement to fulfillment, including notifications, inventory management, and payment tracking.

## Order Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORDER LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

1. CUSTOMER PLACES ORDER
   │
   ├─ Customer adds items to cart
   ├─ Selects pharmacy
   ├─ Places order (offline payment)
   │
   ▼
2. ORDER CREATED (status: pending)
   │
   ├─ Store in database
   ├─ Send notification to pharmacy
   ├─ Update customer UI
   │
   ▼
3. PHARMACY RECEIVES NOTIFICATION
   │
   ├─ Real-time WebSocket notification
   ├─ Sound alert
   ├─ Push notification (future)
   │
   ▼
4. PHARMACY REVIEWS ORDER
   │
   ├─ Check inventory availability
   ├─ Verify customer details
   ├─ Decision: Accept or Reject
   │
   ├─────────────────────────┬─────────────────────────┐
   │                         │                         │
   ▼                         ▼                         ▼
5a. ACCEPT ORDER       5b. REJECT ORDER         5c. TIMEOUT
   │                         │                         │
   ├─ Status: confirmed      ├─ Status: rejected      ├─ Status: expired
   ├─ Deduct inventory       ├─ Notify customer       ├─ Notify customer
   ├─ Notify customer        ├─ Refund if paid       ├─ Auto-reject
   │                         │                         │
   ▼                         ▼                         │
6. CUSTOMER PICKUP          END                       END
   │
   ├─ Customer arrives
   ├─ Verify order
   ├─ Customer pays offline (cash/UPI)
   │
   ▼
7. MARK AS COMPLETED
   │
   ├─ Status: completed
   ├─ Record payment
   ├─ Generate receipt
   │
   ▼
8. POST-FULFILLMENT
   │
   ├─ Request review
   ├─ Update analytics
   └─ Archive order
```

## Order States

```typescript
type OrderStatus =
  | 'pending'      // Customer placed, waiting for pharmacy
  | 'confirmed'    // Pharmacy accepted
  | 'preparing'    // Pharmacy preparing order
  | 'ready'        // Ready for pickup
  | 'completed'    // Customer picked up & paid
  | 'rejected'     // Pharmacy rejected
  | 'cancelled'    // Customer cancelled
  | 'expired';     // Timeout (30 min auto-reject)

type PaymentStatus =
  | 'unpaid'       // Default state
  | 'paid'         // Paid at pickup
  | 'refunded';    // If order cancelled after payment

type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'card'
  | 'online';
```

## Database Schema Enhancement

```sql
-- Extend sales table (rename to orders in future migration)
ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE sales ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE sales ADD COLUMN payment_method TEXT;
ALTER TABLE sales ADD COLUMN store_name TEXT;
ALTER TABLE sales ADD COLUMN store_address TEXT;
ALTER TABLE sales ADD COLUMN customer_name TEXT;
ALTER TABLE sales ADD COLUMN customer_phone TEXT;
ALTER TABLE sales ADD COLUMN rejection_reason TEXT;
ALTER TABLE sales ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE sales ADD COLUMN pickup_time TIMESTAMP;
ALTER TABLE sales ADD COLUMN expires_at TIMESTAMP;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  type VARCHAR NOT NULL, -- 'order_placed', 'order_accepted', 'order_rejected', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id VARCHAR REFERENCES sales(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_tenant_user ON notifications(tenant_id, user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Create order events log
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR NOT NULL REFERENCES sales(id),
  event_type VARCHAR NOT NULL, -- 'created', 'accepted', 'rejected', 'completed', etc.
  actor_id VARCHAR REFERENCES users(id),
  actor_role VARCHAR, -- 'customer', 'retailer'
  metadata JSONB, -- Additional event data
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_events_order ON order_events(order_id, created_at);
```

## API Endpoints

### Pharmacy Endpoints

```typescript
// Get incoming orders for pharmacy
GET /api/pharmacy/orders
  Query: ?status=pending&limit=20
  Response: {
    orders: Order[],
    counts: { pending: 5, confirmed: 10, ready: 2 }
  }

// Accept order
POST /api/pharmacy/orders/:orderId/accept
  Body: { estimatedTime?: number } // minutes
  Response: { success: true, order: Order }

// Reject order
POST /api/pharmacy/orders/:orderId/reject
  Body: { reason: string }
  Response: { success: true, order: Order }

// Mark as preparing
POST /api/pharmacy/orders/:orderId/preparing
  Response: { success: true, order: Order }

// Mark as ready for pickup
POST /api/pharmacy/orders/:orderId/ready
  Response: { success: true, order: Order }

// Mark as completed (after payment)
POST /api/pharmacy/orders/:orderId/complete
  Body: { paymentMethod: 'cash' | 'upi' | 'card' }
  Response: { success: true, order: Order }
```

### Customer Endpoints

```typescript
// Get order details
GET /api/orders/:orderId
  Response: { order: Order, events: OrderEvent[] }

// Cancel order (before confirmation)
POST /api/orders/:orderId/cancel
  Response: { success: true, order: Order }

// Track order status
GET /api/orders/:orderId/track
  Response: {
    status: OrderStatus,
    timeline: OrderEvent[],
    estimatedReady?: Date
  }
```

### WebSocket Events

```typescript
// Server → Client
{
  type: 'order:new',
  data: { orderId, customerName, itemCount, total }
}

{
  type: 'order:updated',
  data: { orderId, status, message }
}

{
  type: 'notification',
  data: { title, message, type, orderId }
}

// Client → Server
{
  type: 'subscribe:orders',
  tenantId: string
}

{
  type: 'unsubscribe:orders'
}
```

## OMS Sub-Agent Service

The OMS Agent handles:
1. Order validation
2. Inventory checking
3. Auto-rejection on timeout
4. Notification routing
5. Event logging
6. Analytics

```typescript
class OMSAgent {
  // Auto-reject orders after timeout
  async monitorOrderTimeouts(): Promise<void>

  // Check inventory availability
  async validateInventory(orderId: string): Promise<boolean>

  // Send notifications
  async notifyPharmacy(orderId: string): Promise<void>
  async notifyCustomer(orderId: string, event: string): Promise<void>

  // Update inventory on order confirmation
  async deductInventory(orderId: string): Promise<void>

  // Restore inventory on rejection/cancellation
  async restoreInventory(orderId: string): Promise<void>

  // Log order events
  async logEvent(orderId: string, event: OrderEvent): Promise<void>

  // Analytics
  async getOrderMetrics(tenantId: string): Promise<OrderMetrics>
}
```

## Notification Templates

```typescript
const NOTIFICATION_TEMPLATES = {
  ORDER_PLACED_PHARMACY: {
    title: 'New Order Received',
    message: (data) => `Order #${data.orderNo} from ${data.customerName} - ₹${data.total}`
  },
  ORDER_ACCEPTED_CUSTOMER: {
    title: 'Order Confirmed',
    message: (data) => `${data.storeName} confirmed your order. Ready in ${data.estimatedTime} mins.`
  },
  ORDER_REJECTED_CUSTOMER: {
    title: 'Order Rejected',
    message: (data) => `${data.storeName} couldn't fulfill your order. Reason: ${data.reason}`
  },
  ORDER_READY_CUSTOMER: {
    title: 'Order Ready for Pickup',
    message: (data) => `Your order is ready at ${data.storeName}!`
  },
  ORDER_COMPLETED: {
    title: 'Order Completed',
    message: (data) => `Thank you for your order! ₹${data.total} paid.`
  }
};
```

## Inventory Management

```typescript
// On order acceptance
async function deductInventoryOnAccept(orderId: string) {
  const order = await getOrder(orderId);

  for (const item of order.items) {
    // Reduce available stock
    await db.update(products)
      .set({
        totalQuantity: sql`total_quantity - ${item.quantity}`
      })
      .where(
        and(
          eq(products.id, item.productId),
          eq(products.tenantId, order.storeTenantId)
        )
      );

    // Log inventory transaction
    await logInventoryTransaction({
      productId: item.productId,
      quantity: -item.quantity,
      reason: 'ORDER_FULFILLMENT',
      orderId: orderId
    });
  }
}

// On order rejection/cancellation
async function restoreInventoryOnCancel(orderId: string) {
  const order = await getOrder(orderId);

  // Only restore if order was confirmed (inventory was deducted)
  if (order.status !== 'confirmed' && order.status !== 'preparing') {
    return;
  }

  for (const item of order.items) {
    await db.update(products)
      .set({
        totalQuantity: sql`total_quantity + ${item.quantity}`
      })
      .where(
        and(
          eq(products.id, item.productId),
          eq(products.tenantId, order.storeTenantId)
        )
      );

    await logInventoryTransaction({
      productId: item.productId,
      quantity: item.quantity,
      reason: 'ORDER_CANCELLED',
      orderId: orderId
    });
  }
}
```

## Auto-Rejection Mechanism

```typescript
// Background job (runs every minute)
async function autoRejectExpiredOrders() {
  const expiredOrders = await db.select()
    .from(sales)
    .where(
      and(
        eq(sales.status, 'pending'),
        lt(sales.expiresAt, new Date())
      )
    );

  for (const order of expiredOrders) {
    await rejectOrder(order.id, {
      reason: 'Order expired - pharmacy did not respond in time',
      autoRejected: true
    });

    await notifyCustomer(order.customerId, {
      type: 'ORDER_EXPIRED',
      orderId: order.id
    });
  }
}

// Set cron job
setInterval(autoRejectExpiredOrders, 60 * 1000); // Every minute
```

## UI Components

### Pharmacy Order Dashboard

```
┌──────────────────────────────────────────────────────┐
│  Incoming Orders (3)                    [Filter ▾]   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ Order #12345  •  ₹498.20         [2 min ago]   │ │
│  │ Ramesh Kumar  •  9876543210                     │ │
│  │ 5 items                                         │ │
│  │                                                 │ │
│  │ [✓ Accept]  [✗ Reject]         [View Details] │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ Order #12344  •  ₹1,245.00      [15 min ago]   │ │
│  │ Priya Shah  •  8765432109        ⚠️ Expiring!  │ │
│  │ 12 items                                        │ │
│  │                                                 │ │
│  │ [✓ Accept]  [✗ Reject]         [View Details] │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Customer Order Tracking

```
┌──────────────────────────────────────────────────────┐
│  Order #12345                                         │
│  ₹498.20  •  SAI BABA MEDICALS                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ● Order Placed          ✓ 10:30 AM                  │
│  │                                                    │
│  ● Confirmed by Store    ✓ 10:32 AM                  │
│  │                                                    │
│  ● Preparing Order       🔄 In Progress               │
│  │                                                    │
│  ○ Ready for Pickup      Estimated: 11:00 AM         │
│  │                                                    │
│  ○ Completed                                         │
│                                                       │
│  [Contact Store]  [Cancel Order]                     │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Performance Considerations

1. **Database Indexing**
   - Index on (tenant_id, status, created_at)
   - Index on (customer_id, created_at)
   - Index on expires_at for auto-rejection

2. **Caching**
   - Cache order counts by status
   - Cache pharmacy details
   - TTL: 30 seconds

3. **WebSocket Optimization**
   - Room-based subscriptions per tenant
   - Disconnect idle connections after 5 minutes
   - Reconnection with exponential backoff

4. **Background Jobs**
   - Auto-rejection check: Every 1 minute
   - Notification cleanup: Daily
   - Analytics aggregation: Hourly

## Security

1. **Authorization**
   - Pharmacies can only manage their own orders
   - Customers can only view their own orders
   - Validate tenant isolation

2. **Rate Limiting**
   - Order placement: 5 orders/minute per customer
   - Order updates: 60 requests/minute per pharmacy

3. **Validation**
   - Verify inventory before acceptance
   - Validate payment amount matches order total
   - Check order expiration before status updates

## Testing Strategy

```typescript
// Unit Tests
- Order state transitions
- Inventory calculations
- Notification generation

// Integration Tests
- Full order lifecycle
- WebSocket notifications
- Auto-rejection mechanism

// E2E Tests
- Customer places order → Pharmacy accepts → Complete
- Customer places order → Pharmacy rejects
- Order timeout auto-rejection
```

## Monitoring & Alerts

```typescript
// Metrics to Track
- Order placement rate
- Order acceptance rate
- Order rejection rate
- Average acceptance time
- Order completion rate
- Payment success rate

// Alerts
- High rejection rate (>30%)
- Slow acceptance time (>10 min average)
- WebSocket connection failures
- Inventory sync failures
```

## Future Enhancements

1. **Phase 2: Advanced Features**
   - Order modifications (add/remove items before confirmation)
   - Partial fulfillment
   - Prescription verification
   - Driver assignment for delivery

2. **Phase 3: Payment Integration**
   - Online payment (Razorpay/Stripe)
   - Wallet integration
   - COD with OTP verification

3. **Phase 4: Analytics**
   - Order heatmaps
   - Peak hours analysis
   - Customer lifetime value
   - Inventory optimization ML

---

**Status:** Design Complete
**Next Steps:** Implementation
**Estimated Effort:** 40-50 hours
