# POS Flow Documentation

## Overview

The Point of Sale (POS) flow is designed for sub-15-second sales completion on VALUE tier devices, with progressive enhancement for higher-tier devices.

## User Journey

```
[Home] → [POS Screen] → [Scan/Select] → [Review Bill] → [Payment] → [Receipt]
  2s       3s            5s            2s          2s        1s
```

## Flow Sequence

### 1. Entry Points
- **Primary**: Bottom navigation POS tab
- **Quick**: FAB button from home screen
- **Gesture**: Swipe right on Bill Fast tile (mobile)

### 2. Product Selection

#### VALUE Tier (≤2GB RAM)
```
┌─────────────────┐
│ Search Products │
├─────────────────┤
│ [Grid of Items] │
│ ┌─────┬─────┐   │
│ │Item1│Item2│   │
│ └─────┴─────┘   │
│ [Camera Button] │
│  Single Capture │
└─────────────────┘
```

#### MAINSTREAM/PREMIUM Tier (≥4GB RAM)
```
┌─────────────────┐
│ Search Products │
├─────────────────┤
│ [Camera Preview]│
│ ┌─────────────┐ │
│ │ Live Video  │ │
│ │ Scanning... │ │
│ └─────────────┘ │
│ [Product Grid]  │
└─────────────────┘
```

### 3. Bill Management

```
┌─── Bill Drawer ───┐
│ Item 1     ₹50.00 │
│ [-] 2 [+]         │
│ ─────────────────  │
│ Item 2     ₹25.00 │
│ [-] 1 [+]         │
│ ─────────────────  │
│ Total:     ₹75.00 │
│ [Pay & Complete]  │
└───────────────────┘
```

### 4. Payment Flow

```
┌─── Payment Modal ───┐
│     ₹75.00          │
│ ┌─────┬─────┐       │
│ │ UPI │Cash │       │
│ └─────┴─────┘       │
│                     │
│ [Pay ₹75.00]       │
│ [Cancel]            │
└─────────────────────┘
```

## Performance Targets

| Action | VALUE | MAINSTREAM | PREMIUM |
|--------|-------|------------|---------|
| Screen Load | ≤3s | ≤2s | ≤1s |
| Barcode Scan | Manual | ≤2s | ≤1s |
| Add to Bill | ≤1s | ≤0.5s | ≤0.3s |
| Payment | ≤2s | ≤1.5s | ≤1s |
| **Total Sale** | **≤15s** | **≤10s** | **≤5s** |

## FEFO Stock Logic

First Expired, First Out (FEFO) is automatically applied:

```typescript
// Stock selection priority:
1. Earliest expiry date
2. Lowest stock quantity  
3. Most recent batch
```

### Stock Scenarios

#### Single Batch Available
```
Product: Paracetamol 500mg
Batch A: 50 units, Exp: 2025-12-01
→ Use Batch A
```

#### Multiple Batches Available
```
Product: Paracetamol 500mg  
Batch A: 20 units, Exp: 2025-10-15
Batch B: 80 units, Exp: 2025-12-01
→ Use Batch A first (FEFO)
```

#### Insufficient Stock
```
Product: Paracetamol 500mg
Batch A: 5 units, Exp: 2025-10-15
Request: 10 units
→ Error: "Only 5 units available"
```

## Error Handling

### Network Errors
- Offline mode: Queue in outbox
- Auto-retry when online
- User notification: "Working offline"

### Camera Errors
- Permission denied: Show manual entry
- No camera: Fallback to product grid
- Scan timeout: Manual barcode entry

### Stock Errors
- Out of stock: Show alert, suggest alternatives
- Low stock: Warning but allow sale
- Expired stock: Block sale, show warning

## Accessibility

### Keyboard Navigation
- Tab order: Search → Scan → Products → Bill
- Enter key: Add to bill / Checkout
- Escape key: Close modals

### Screen Reader Support
- ARIA labels on all interactive elements
- Live regions for dynamic content
- Descriptive button text

### Touch Targets
- Minimum 44px touch targets
- Swipe gestures for common actions
- Long press for additional options

## Testing Scenarios

### Happy Path (≤15s)
1. Open POS screen (3s)
2. Scan barcode or tap product (5s)
3. Review bill items (2s)
4. Select payment method (2s)
5. Complete payment (2s)
6. Return to dashboard (1s)

### Edge Cases
- Multiple items with quantity changes
- Payment method switching
- Network interruption during sale
- Camera permission denied
- Low battery scanning

## Analytics Events

```typescript
// Track performance metrics
track('pos_sale_completed', {
  duration_ms: 12000,
  device_tier: 'VALUE',
  items_count: 3,
  payment_method: 'upi',
  scan_method: 'manual'
});
```

## Future Enhancements

### Voice Commands (PREMIUM)
- "Add paracetamol to bill"
- "Set quantity to 5"
- "Checkout with UPI"

### AI Suggestions (PREMIUM)
- Recommend frequently bought together
- Suggest alternatives for out-of-stock
- Predict next purchase

### Bulk Operations (ALL)
- Multi-select products
- Bulk quantity adjustment
- Quick preset combinations