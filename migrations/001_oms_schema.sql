-- OMS Schema Migration
-- Run this manually in your Neon database console or via psql

-- Step 1: Add OMS fields to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS store_address TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS estimated_ready_time INTEGER;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE sales ADD COLUMN IF NOT EXISTS pickup_time TIMESTAMP;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Step 2: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  type VARCHAR NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id VARCHAR REFERENCES sales(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Step 3: Create order_events table
CREATE TABLE IF NOT EXISTS order_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR NOT NULL REFERENCES sales(id),
  event_type VARCHAR NOT NULL,
  actor_id VARCHAR REFERENCES users(id),
  actor_role VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_tenant_status ON sales(tenant_id, status, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_expires ON sales(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user ON notifications(tenant_id, user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id, created_at);

-- Step 5: Set default values for existing orders
UPDATE sales
SET
  status = COALESCE(status, 'completed'),
  payment_status = COALESCE(payment_status, 'paid'),
  updated_at = COALESCE(updated_at, date)
WHERE status IS NULL OR payment_status IS NULL;

-- Step 6: Set expiration for existing pending orders
UPDATE sales
SET expires_at = date + INTERVAL '30 minutes'
WHERE status = 'pending' AND expires_at IS NULL;

COMMENT ON TABLE notifications IS 'OMS: Stores order notifications for customers and pharmacies';
COMMENT ON TABLE order_events IS 'OMS: Audit trail for all order status changes';
COMMENT ON COLUMN sales.status IS 'Order status: pending, confirmed, preparing, ready, completed, rejected, cancelled, expired';
COMMENT ON COLUMN sales.payment_status IS 'Payment status: unpaid, paid, refunded';
