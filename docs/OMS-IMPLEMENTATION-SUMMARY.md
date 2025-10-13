# OMS Implementation Summary

## Completed

### 1. Database Schema Updates ✅

**File:** `shared/schema.ts`

**Changes Made:**
- Extended `sales` table with OMS fields:
  - `status`, `paymentStatus`, `paymentMethod`
  - `storeName`, `storeAddress`, `customerName`, `customerPhone`
  - `rejectionReason`, `estimatedReadyTime`
  - `updatedAt`, `pickupTime`, `expiresAt`

- Added `notifications` table for real-time alerts
- Added `orderEvents` table for audit trail
- Created insert schemas and TypeScript types

**Next Step:** Run `npm run db:push` to apply schema changes

---

## Implementation Plan

### Phase 1: Core OMS Service (Current)

**File:** `server/services/oms-agent.ts`

Creates the OMS Agent with:
- Order status management
- Inventory tracking/deduction
- Notification sending
- Auto-rejection on timeout
- Event logging

### Phase 2: API Endpoints

**Files to Create/Modify:**
- `server/routes/pharmacy-orders.ts` - Pharmacy order management
- `server/routes.ts` - Integrate pharmacy routes
- Extend existing `/api/orders` endpoints

**Endpoints:**
```
POST   /api/pharmacy/orders/:id/accept
POST   /api/pharmacy/orders/:id/reject
POST   /api/pharmacy/orders/:id/preparing
POST   /api/pharmacy/orders/:id/ready
POST   /api/pharmacy/orders/:id/complete
GET    /api/pharmacy/orders
GET    /api/notifications
PUT    /api/notifications/:id/read
```

### Phase 3: WebSocket Real-time Notifications

**File:** `server/websocket-handler.ts`

Implements:
- Order notifications to pharmacy
- Status updates to customers
- Room-based pub/sub

### Phase 4: UI Components

**Customer Components:**
- `client/src/pages/customer-order-tracking.tsx`
- Update `client/src/pages/customer-cart.tsx` with order enrichment

**Pharmacy Components:**
- `client/src/pages/pharmacy-orders.tsx` - Incoming orders dashboard
- `client/src/components/order-card.tsx` - Reusable order card

### Phase 5: Background Jobs

**File:** `server/jobs/order-timeout.ts`

- Auto-reject expired orders every minute
- Cleanup old notifications

---

## Next Steps

### Immediate (Run These Commands):

```bash
# 1. Push schema changes to database
npm run db:push

# 2. Verify schema was applied
# (Check your Neon dashboard or use psql)
```

### Implementation Order:

1. **OMS Agent Service** (20 min)
   - Create `server/services/oms-agent.ts`
   - Implement core business logic

2. **Pharmacy Order Routes** (30 min)
   - Create `server/routes/pharmacy-orders.ts`
   - Integrate with OMS Agent

3. **Update Order Creation** (15 min)
   - Modify existing `/api/orders` POST endpoint
   - Add customer/store details
   - Set expiration time
   - Trigger notification

4. **Pharmacy Orders Dashboard UI** (45 min)
   - Create `client/src/pages/pharmacy-orders.tsx`
   - Real-time order list
   - Accept/Reject actions

5. **Customer Order Tracking UI** (30 min)
   - Enhance `client/src/pages/customer-orders.tsx`
   - Add status timeline
   - Real-time updates

6. **WebSocket Integration** (40 min)
   - Setup WebSocket server
   - Connect clients
   - Push notifications

7. **Auto-Rejection Job** (15 min)
   - Background job
   - Timeout monitoring

**Total Estimated Time:** 3-4 hours

---

## Testing Plan

### Manual Testing Checklist:

- [ ] Customer places order
- [ ] Pharmacy receives notification
- [ ] Pharmacy accepts order
  - [ ] Customer sees "Confirmed" status
  - [ ] Inventory is deducted
- [ ] Pharmacy rejects order
  - [ ] Customer sees "Rejected" status with reason
- [ ] Order times out (30 min)
  - [ ] Auto-rejected
  - [ ] Customer notified
- [ ] Pharmacy marks order as ready
  - [ ] Customer sees "Ready for Pickup"
- [ ] Pharmacy completes order
  - [ ] Payment recorded
  - [ ] Order marked completed

---

## Files Overview

```
AushadiExpress/
├── shared/
│   └── schema.ts                       [MODIFIED] ✅
│
├── server/
│   ├── services/
│   │   └── oms-agent.ts                [CREATE] ⏳
│   │
│   ├── routes/
│   │   └── pharmacy-orders.ts          [CREATE] ⏳
│   │
│   ├── jobs/
│   │   └── order-timeout.ts            [CREATE] ⏳
│   │
│   ├── routes.ts                       [MODIFY] ⏳
│   └── websocket-handler.ts            [CREATE] ⏳
│
├── client/src/
│   ├── pages/
│   │   ├── pharmacy-orders.tsx         [CREATE] ⏳
│   │   ├── customer-order-tracking.tsx [CREATE] ⏳
│   │   ├── customer-orders.tsx         [MODIFY] ⏳
│   │   └── customer-cart.tsx           [MODIFY] ⏳
│   │
│   └── components/
│       ├── order-card.tsx              [CREATE] ⏳
│       └── order-status-timeline.tsx   [CREATE] ⏳
│
└── docs/
    ├── OMS-DESIGN.md                   [CREATED] ✅
    └── OMS-IMPLEMENTATION-SUMMARY.md   [CREATED] ✅
```

---

## Database Migration

After running `npm run db:push`, you may need to manually set default values for existing orders:

```sql
-- Set default values for existing orders
UPDATE sales
SET
  status = 'completed',
  payment_status = 'paid',
  updated_at = date
WHERE status IS NULL;

-- Set expiration for pending orders (30 minutes from creation)
UPDATE sales
SET expires_at = date + INTERVAL '30 minutes'
WHERE status = 'pending' AND expires_at IS NULL;
```

---

## Would you like me to proceed with implementation?

I can create all the files in sequence. Which would you prefer:

**Option A:** I create all files now (provides complete working system)
**Option B:** I create them one phase at a time (allows you to test each component)
**Option C:** You want to implement based on design docs

Let me know and I'll proceed accordingly!
