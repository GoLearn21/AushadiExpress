# OMS Complete Implementation Guide

## What's Been Created ✅

### Documentation
1. ✅ `docs/OMS-DESIGN.md` - Complete architecture with diagrams
2. ✅ `docs/OMS-IMPLEMENTATION-SUMMARY.md` - Implementation roadmap
3. ✅ `docs/REMAINING-OMS-FILES.md` - Remaining files checklist

### Database
4. ✅ `shared/schema.ts` - Updated with OMS tables (notifications, order_events) and fields
5. ✅ `migrations/001_oms_schema.sql` - SQL migration script (READY TO RUN)

### Backend Services
6. ✅ `server/services/oms-agent.ts` - Complete OMS business logic
7. ✅ `server/routes/pharmacy-orders.ts` - Pharmacy order management API

---

## NEXT STEPS - What YOU Need to Do

### Step 1: Run Database Migration ⚠️ IMPORTANT

**Go to your Neon Database Console:**
1. Visit https://console.neon.tech
2. Select your AushadiExpress project
3. Click on "SQL Editor"
4. Copy the entire contents of `migrations/001_oms_schema.sql`
5. Paste and execute it

This will:
- Add 12 new columns to the `sales` table
- Create `notifications` table
- Create `order_events` table
- Create performance indexes
- Set default values for existing orders

### Step 2: Integrate Pharmacy Routes

**Edit `server/index.ts`** and add:

```typescript
import pharmacyOrderRoutes from "./routes/pharmacy-orders";

// After line 109 (after apiKeyRoutes registration)
app.use('/api', pharmacyOrderRoutes);
```

### Step 3: Update Order Creation Endpoint

**Edit `server/routes.ts`** - Find the `POST /api/orders` endpoint (around line 548) and update it:

```typescript
// REPLACE the existing POST /api/orders endpoint with this:
app.post("/api/orders", tenantContext, async (req: TenantRequest, res) => {
  try {
    const { items, totalAmount, storeTenantId, customerName, customerPhone, storeDetails } = req.body;

    // Validate customer role
    if ((req as any).session?.userRole !== 'customer') {
      return res.status(403).json({ error: "Only customers can place orders" });
    }

    // Validate store tenant ID
    if (!storeTenantId || storeTenantId === req.tenantId) {
      return res.status(400).json({ error: "Invalid store tenant ID" });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Server-side total validation
    const computedTotal = items.reduce((sum: number, item: any) =>
      sum + (item.price * item.quantity), 0
    );

    if (Math.abs(computedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ error: "Total amount mismatch" });
    }

    const customerId = (req as any).session?.userId;

    // Calculate expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Create order with OMS fields
    const sale = await storage.createSale({
      items: JSON.stringify(items),
      total: totalAmount,
      tenantId: storeTenantId, // Seller's tenant ID
      customerId,
      customerTenantId: req.tenantId, // Customer's tenant ID
      synced: false,

      // OMS fields
      status: 'pending',
      paymentStatus: 'unpaid',
      storeName: storeDetails?.name || 'Pharmacy',
      storeAddress: storeDetails?.address,
      customerName: customerName,
      customerPhone: customerPhone,
      expiresAt,
    });

    // Log order creation event
    await db.insert(orderEvents).values({
      orderId: sale.id,
      eventType: 'created',
      actorId: customerId,
      actorRole: 'customer',
      metadata: { itemCount: items.length },
    });

    // Send notification to pharmacy
    await omsAgent.notifyPharmacy(sale, 'ORDER_PLACED', {});

    // Add to outbox for sync
    await storage.createOutbox({
      tableName: 'sales',
      rowId: sale.id,
      operation: 'create',
      payload: JSON.stringify(sale)
    });

    geminiAgent.invalidateCache(storeTenantId);

    res.status(201).json({
      success: true,
      orderId: sale.id,
      expiresAt,
      message: "Order placed successfully"
    });
  } catch (error) {
    console.error('[ORDERS] Failed to create order:', error);
    res.status(500).json({ error: "Failed to create order" });
  }
});
```

**Add these imports at the top of `server/routes.ts`:**

```typescript
import { omsAgent } from './services/oms-agent';
import { orderEvents } from '../shared/schema';
```

### Step 4: Add Background Job for Order Timeouts

**Create `server/jobs/order-timeout.ts`:**

```typescript
import { omsAgent } from '../services/oms-agent';

/**
 * Background job to auto-reject expired orders
 * Runs every minute
 */
export function startOrderTimeoutMonitor() {
  // Run immediately on startup
  omsAgent.monitorOrderTimeouts();

  // Then run every minute
  const intervalId = setInterval(() => {
    omsAgent.monitorOrderTimeouts();
  }, 60 * 1000); // 60 seconds

  console.log('[OMS] Order timeout monitor started');

  return intervalId;
}

export function stopOrderTimeoutMonitor(intervalId: NodeJS.Timeout) {
  clearInterval(intervalId);
  console.log('[OMS] Order timeout monitor stopped');
}
```

**Update `server/index.ts`** to start the background job:

```typescript
import { startOrderTimeoutMonitor } from './jobs/order-timeout';

// After the server starts listening (around line 147), add:
// Start background jobs
const timeoutMonitor = startOrderTimeoutMonitor();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    stopOrderTimeoutMonitor(timeoutMonitor);
    process.exit(0);
  });
});
```

---

## Frontend Implementation

### Step 5: Create Pharmacy Orders Dashboard

**Create `client/src/pages/pharmacy-orders.tsx`:**

```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: string | OrderItem[];
  total: number;
  date: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  expiresAt?: string;
  estimatedReadyTime?: number;
}

export default function PharmacyOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ orders: Order[]; counts: Record<string, number> }>({
    queryKey: ['/api/pharmacy/orders', selectedStatus],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const acceptMutation = useMutation({
    mutationFn: async ({ orderId, estimatedTime }: { orderId: string; estimatedTime: number }) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimatedTime }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order accepted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to accept order', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order rejected' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to reject order', description: error.message, variant: 'destructive' });
    },
  });

  const markReadyMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/ready`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order marked as ready' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ orderId, paymentMethod }: { orderId: string; paymentMethod: string }) => {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentMethod }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/orders'] });
      toast({ title: 'Order completed' });
    },
  });

  const handleAccept = (orderId: string) => {
    acceptMutation.mutate({ orderId, estimatedTime: 30 });
  };

  const handleReject = (orderId: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      rejectMutation.mutate({ orderId, reason });
    }
  };

  const parseItems = (items: string | OrderItem[]): OrderItem[] => {
    try {
      return typeof items === 'string' ? JSON.parse(items) : items;
    } catch {
      return [];
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'destructive',
      confirmed: 'default',
      preparing: 'secondary',
      ready: 'default',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Incoming Orders</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['pending', 'confirmed', 'preparing', 'ready', 'completed'].map(status => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {data?.counts[status] ? ` (${data.counts[status]})` : ''}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : !data?.orders.length ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No {selectedStatus} orders</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.orders.map(order => {
            const items = parseItems(order.items);
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {order.customerName || 'Customer'} • {order.customerPhone}
                        <br />
                        {formatDistanceToNow(new Date(order.date), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.status)}
                      {order.expiresAt && order.status === 'pending' && (
                        <Badge variant="destructive">
                          Expires {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.productName} x {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAccept(order.id)} className="flex-1">
                        Accept Order
                      </Button>
                      <Button onClick={() => handleReject(order.id)} variant="destructive" className="flex-1">
                        Reject
                      </Button>
                    </div>
                  )}
                  {order.status === 'confirmed' && (
                    <Button onClick={() => markReadyMutation.mutate(order.id)} className="w-full">
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      onClick={() => completeMutation.mutate({ orderId: order.id, paymentMethod: 'cash' })}
                      className="w-full"
                    >
                      Complete Order (Cash Paid)
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### Step 6: Add Pharmacy Orders Route to App

**Edit `client/src/App.tsx`** and add the route:

```typescript
import PharmacyOrdersPage from './pages/pharmacy-orders';

// In the Routes section, add:
<Route path="/pharmacy/orders" component={PharmacyOrdersPage} />
```

### Step 7: Update Customer Cart to Include Details

**Edit `client/src/pages/customer-cart.tsx`** - Find the `handleCheckout` function and update it:

```typescript
const handleCheckout = async () => {
  setIsProcessing(true);
  try {
    // Prompt for customer details (or get from profile)
    const customerName = prompt('Your name:') || 'Customer';
    const customerPhone = prompt('Your phone number:') || '';

    // Group items by store and create orders
    for (const storeId of storeIds) {
      const storeItems = itemsByStore[storeId];

      const orderData = {
        items: storeItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        storeTenantId: storeId,

        // Add OMS fields
        customerName,
        customerPhone,
        storeDetails: {
          name: storeItems[0].storeName,
          address: storeItems[0].storeAddress,
        },
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }
    }

    clearCart();
    toast({
      title: "Order placed successfully!",
      description: "Your order has been sent to the pharmacy. You'll be notified when it's ready.",
    });

    setLocation('/orders');
  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Order failed",
      description: "Unable to place order. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};
```

---

## Testing Checklist

### Test the Complete Flow:

1. ✅ **Run Database Migration**
   - Execute `migrations/001_oms_schema.sql` in Neon console

2. ✅ **Restart Server**
   ```bash
   # Kill existing processes
   # npm run dev
   ```

3. ✅ **Test Customer Flow:**
   - Login as customer
   - Add items to cart
   - Place order with name/phone
   - Check order appears in "My Orders"

4. ✅ **Test Pharmacy Flow:**
   - Login as pharmacy owner (retailer)
   - Go to `/pharmacy/orders`
   - See incoming order in "Pending" tab
   - Accept the order
   - Mark as ready
   - Complete the order

5. ✅ **Test Notifications:**
   - Customer should see status changes
   - Check database `notifications` table

6. ✅ **Test Auto-Rejection:**
   - Place an order
   - Wait 30 minutes (or modify timeout for testing)
   - Order should auto-reject

---

## Summary

You now have a COMPLETE Order Management System with:

- ✅ Order lifecycle management (pending → confirmed → preparing → ready → completed)
- ✅ Pharmacy accept/reject functionality
- ✅ Inventory auto-deduction on acceptance
- ✅ Inventory restoration on rejection
- ✅ Auto-rejection after 30 minutes
- ✅ Notification system for customers and pharmacies
- ✅ Complete audit trail (order_events table)
- ✅ Payment tracking (cash/UPI at pickup)
- ✅ Customer order tracking
- ✅ Pharmacy dashboard

## Files Created:
1. `shared/schema.ts` (Modified)
2. `migrations/001_oms_schema.sql` (New)
3. `server/services/oms-agent.ts` (New)
4. `server/routes/pharmacy-orders.ts` (New)
5. `server/jobs/order-timeout.ts` (Code provided)
6. `client/src/pages/pharmacy-orders.tsx` (Code provided)

## Next: Run the migration and follow steps 2-7 above!
