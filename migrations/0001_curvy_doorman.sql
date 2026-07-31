CREATE TABLE "credit_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_account_id" varchar NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"type" text NOT NULL,
	"reference_id" varchar,
	"reference_number" varchar,
	"amount" real NOT NULL,
	"balance_after" real NOT NULL,
	"due_date" timestamp,
	"payment_method" text,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_routes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pincodes" text,
	"delivery_days" text,
	"delivery_time" text,
	"driver_name" text,
	"driver_phone" varchar(15),
	"vehicle_number" varchar(20),
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_schedule_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" varchar NOT NULL,
	"order_id" varchar NOT NULL,
	"delivery_sequence" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"delivered_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_schedules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"route_id" varchar,
	"scheduled_date" timestamp NOT NULL,
	"status" text DEFAULT 'planned',
	"total_orders" integer DEFAULT 0,
	"total_value" real DEFAULT 0,
	"start_time" timestamp,
	"end_time" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer_credit_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"retailer_id" varchar NOT NULL,
	"credit_limit" real DEFAULT 0,
	"current_balance" real DEFAULT 0,
	"available_credit" real DEFAULT 0,
	"credit_days" integer DEFAULT 30,
	"status" text DEFAULT 'active',
	"last_payment_date" timestamp,
	"last_payment_amount" real,
	"total_purchases" real DEFAULT 0,
	"total_payments" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer_price_tier_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"retailer_id" varchar NOT NULL,
	"tier_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wholesaler_price_tiers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"discount_percentage" real DEFAULT 0,
	"min_order_value" real DEFAULT 0,
	"credit_days" integer DEFAULT 0,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wholesaler_tier_pricing" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"special_price" real,
	"discount_percentage" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "wholesaler_products" ADD COLUMN "reorder_level" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ADD COLUMN "batch_number" text;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ADD COLUMN "expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_credit_account_id_retailer_credit_accounts_id_fk" FOREIGN KEY ("credit_account_id") REFERENCES "public"."retailer_credit_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_schedule_orders" ADD CONSTRAINT "delivery_schedule_orders_schedule_id_delivery_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."delivery_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_schedule_orders" ADD CONSTRAINT "delivery_schedule_orders_order_id_wholesaler_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."wholesaler_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_route_id_delivery_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."delivery_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_credit_accounts" ADD CONSTRAINT "retailer_credit_accounts_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_price_tier_assignments" ADD CONSTRAINT "retailer_price_tier_assignments_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_price_tier_assignments" ADD CONSTRAINT "retailer_price_tier_assignments_tier_id_wholesaler_price_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."wholesaler_price_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_tier_pricing" ADD CONSTRAINT "wholesaler_tier_pricing_tier_id_wholesaler_price_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."wholesaler_price_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_tier_pricing" ADD CONSTRAINT "wholesaler_tier_pricing_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;