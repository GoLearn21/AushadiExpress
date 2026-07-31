-- Migration: Add Wholesaler persona support
-- Adds new columns to users table and creates wholesaler-specific tables

-- Add new columns to users table for wholesaler fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gst_number" varchar(15);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "business_address" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "contact_phone" varchar(15);

-- Create wholesaler products table
CREATE TABLE IF NOT EXISTS "wholesaler_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"manufacturer" text,
	"category" text,
	"pack_size" text,
	"min_order_qty" integer DEFAULT 1,
	"max_order_qty" integer,
	"base_price" real NOT NULL,
	"mrp" real,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"hsn_code" varchar(10),
	"gst_percentage" real DEFAULT 12,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create quote requests table
CREATE TABLE IF NOT EXISTS "quote_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"retailer_id" varchar NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"wholesaler_id" varchar NOT NULL,
	"status" text DEFAULT 'pending',
	"total_items" integer DEFAULT 0,
	"notes" text,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create quote request items table
CREATE TABLE IF NOT EXISTS "quote_request_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_request_id" varchar NOT NULL,
	"product_id" varchar,
	"product_name" text NOT NULL,
	"requested_quantity" integer NOT NULL,
	"preferred_manufacturer" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS "quotes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_request_id" varchar NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"status" text DEFAULT 'sent',
	"subtotal" real DEFAULT 0 NOT NULL,
	"gst_amount" real DEFAULT 0,
	"discount_amount" real DEFAULT 0,
	"total_amount" real DEFAULT 0 NOT NULL,
	"valid_until" timestamp NOT NULL,
	"payment_terms" text,
	"delivery_terms" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create quote items table
CREATE TABLE IF NOT EXISTS "quote_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" varchar NOT NULL,
	"quote_request_item_id" varchar,
	"product_id" varchar,
	"product_name" text NOT NULL,
	"manufacturer" text,
	"pack_size" text,
	"quantity" integer NOT NULL,
	"unit_price" real NOT NULL,
	"gst_percentage" real DEFAULT 12,
	"total_price" real NOT NULL,
	"is_available" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);

-- Create wholesaler orders table
CREATE TABLE IF NOT EXISTS "wholesaler_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL UNIQUE,
	"quote_id" varchar,
	"retailer_tenant_id" varchar NOT NULL,
	"retailer_id" varchar NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"wholesaler_id" varchar NOT NULL,
	"status" text DEFAULT 'pending',
	"payment_status" text DEFAULT 'unpaid',
	"subtotal" real NOT NULL,
	"gst_amount" real DEFAULT 0,
	"discount_amount" real DEFAULT 0,
	"shipping_amount" real DEFAULT 0,
	"total_amount" real NOT NULL,
	"payment_terms" text,
	"delivery_address" text,
	"expected_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"tracking_number" varchar(100),
	"notes" text,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create wholesaler order items table
CREATE TABLE IF NOT EXISTS "wholesaler_order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"product_id" varchar,
	"product_name" text NOT NULL,
	"manufacturer" text,
	"batch_number" text,
	"expiry_date" timestamp,
	"pack_size" text,
	"quantity" integer NOT NULL,
	"unit_price" real NOT NULL,
	"gst_percentage" real DEFAULT 12,
	"total_price" real NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Create wholesaler order events table
CREATE TABLE IF NOT EXISTS "wholesaler_order_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"actor_id" varchar,
	"actor_role" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Create retailer-wholesaler connections table
CREATE TABLE IF NOT EXISTS "retailer_wholesaler_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"retailer_id" varchar NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"wholesaler_id" varchar NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_wholesaler_id_users_id_fk" FOREIGN KEY ("wholesaler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "quote_request_items" ADD CONSTRAINT "quote_request_items_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quote_request_items" ADD CONSTRAINT "quote_request_items_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "quotes" ADD CONSTRAINT "quotes_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_request_item_id_quote_request_items_id_fk" FOREIGN KEY ("quote_request_item_id") REFERENCES "public"."quote_request_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "wholesaler_orders" ADD CONSTRAINT "wholesaler_orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wholesaler_orders" ADD CONSTRAINT "wholesaler_orders_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wholesaler_orders" ADD CONSTRAINT "wholesaler_orders_wholesaler_id_users_id_fk" FOREIGN KEY ("wholesaler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "wholesaler_order_items" ADD CONSTRAINT "wholesaler_order_items_order_id_wholesaler_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."wholesaler_orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wholesaler_order_items" ADD CONSTRAINT "wholesaler_order_items_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "wholesaler_order_events" ADD CONSTRAINT "wholesaler_order_events_order_id_wholesaler_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."wholesaler_orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wholesaler_order_events" ADD CONSTRAINT "wholesaler_order_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "retailer_wholesaler_connections" ADD CONSTRAINT "retailer_wholesaler_connections_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "retailer_wholesaler_connections" ADD CONSTRAINT "retailer_wholesaler_connections_wholesaler_id_users_id_fk" FOREIGN KEY ("wholesaler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
