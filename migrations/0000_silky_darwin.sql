CREATE TABLE "assistant_beta_leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "captures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uri" text NOT NULL,
	"mode" text NOT NULL,
	"owner_id" varchar NOT NULL,
	"persona" text NOT NULL,
	"sale_id" varchar,
	"processed" boolean DEFAULT false,
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" varchar DEFAULT 'default' NOT NULL,
	"user_id" varchar NOT NULL,
	"file_name" text NOT NULL,
	"doc_type" text NOT NULL,
	"confirmed_type" text,
	"confidence" double precision NOT NULL,
	"raw_text" text NOT NULL,
	"model_summary" text NOT NULL,
	"header" jsonb,
	"line_items" jsonb,
	"totals" jsonb,
	"extracted_data" jsonb,
	"file_url" text,
	"processing_time" integer,
	"ocr_duration_ms" integer,
	"mongo_write_ms" integer,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorite_stores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"store_tenant_id" varchar NOT NULL,
	"store_name" text NOT NULL,
	"store_address" text,
	"store_phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_headers" (
	"document_id" varchar NOT NULL,
	"supplier_name" text,
	"supplier_address" text,
	"supplier_gstin" text,
	"supplier_dl_number" text,
	"buyer_name" text,
	"buyer_address" text,
	"buyer_gstin" text,
	"buyer_phone" text,
	"invoice_number" text,
	"invoice_date" timestamp,
	"due_date" timestamp,
	"payment_terms" text,
	"payment_conditions" text,
	"subtotal" double precision,
	"grand_total" double precision,
	"additional_charges" double precision,
	"discounts" double precision,
	"payment_information" text,
	"terms_and_conditions" text,
	"igst" double precision,
	"cgst" double precision,
	"sgst" double precision,
	"extra" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoice_headers_document_id_pk" PRIMARY KEY("document_id")
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"document_id" varchar NOT NULL,
	"line_index" integer NOT NULL,
	"product_name" text,
	"pack_size" text,
	"manufacturer" text,
	"hsn_sac" text,
	"batch_number" text,
	"expiry_date" text,
	"mrp" double precision,
	"ptr" double precision,
	"pts" double precision,
	"quantity" double precision,
	"units" text,
	"discount_percentage" double precision,
	"discount_amount" double precision,
	"igst" double precision,
	"cgst" double precision,
	"sgst" double precision,
	"total_amount" double precision,
	"extra" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoice_line_items_document_id_line_index_pk" PRIMARY KEY("document_id","line_index")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"order_id" varchar,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"actor_id" varchar,
	"actor_role" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"row_id" varchar NOT NULL,
	"operation" text NOT NULL,
	"payload" text NOT NULL,
	"owner_id" varchar,
	"persona" text,
	"timestamp" timestamp DEFAULT now(),
	"synced" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pending_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"message_id" varchar NOT NULL,
	"summary_text" text,
	"summary" jsonb,
	"invoice_data" jsonb,
	"raw_analysis" jsonb,
	"image_file_name" text,
	"image_data" text,
	"submission_state" varchar DEFAULT 'idle' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pending_invoices_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"img_id" varchar NOT NULL,
	"patient" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" real DEFAULT 0 NOT NULL,
	"total_quantity" real DEFAULT 0 NOT NULL,
	"batch_number" text,
	"tenant_id" varchar DEFAULT 'default' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_id" varchar,
	"product_id" varchar,
	"quantity" integer NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar,
	"date" timestamp DEFAULT now(),
	"status" text DEFAULT 'draft' NOT NULL,
	"total_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
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
--> statement-breakpoint
CREATE TABLE "quote_request_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_request_id" varchar NOT NULL,
	"product_id" varchar,
	"product_name" text NOT NULL,
	"requested_quantity" integer NOT NULL,
	"preferred_manufacturer" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
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
--> statement-breakpoint
CREATE TABLE "quotes" (
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
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_id" varchar,
	"received_at" timestamp DEFAULT now(),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "receive_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"img_id" varchar NOT NULL,
	"vendor" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "receive_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"drug" text NOT NULL,
	"qty" integer NOT NULL,
	"mrp" real NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer_wholesaler_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_tenant_id" varchar NOT NULL,
	"retailer_id" varchar NOT NULL,
	"wholesaler_tenant_id" varchar NOT NULL,
	"wholesaler_id" varchar NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total" real NOT NULL,
	"date" timestamp DEFAULT now(),
	"items" text,
	"synced" boolean DEFAULT false,
	"tenant_id" varchar DEFAULT 'default' NOT NULL,
	"customer_id" varchar,
	"customer_tenant_id" varchar,
	"status" text DEFAULT 'pending',
	"payment_status" text DEFAULT 'unpaid',
	"payment_method" text,
	"store_name" text,
	"store_address" text,
	"customer_name" text,
	"customer_phone" text,
	"rejection_reason" text,
	"estimated_ready_time" integer,
	"updated_at" timestamp DEFAULT now(),
	"pickup_time" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "stock" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"product_name" text NOT NULL,
	"batch_number" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"expiry_date" timestamp,
	"tenant_id" varchar DEFAULT 'default' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_learning_patterns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"document_features" jsonb,
	"ai_prediction" text NOT NULL,
	"user_correction" text,
	"confidence_score" double precision,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY DEFAULT 'ME' NOT NULL,
	"role" text DEFAULT 'retailer' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'retailer',
	"tenant_id" varchar NOT NULL,
	"pharmacy_name" text,
	"pincode" varchar(10),
	"onboarded" boolean DEFAULT false,
	"gst_number" varchar(15),
	"business_address" text,
	"contact_phone" varchar(15),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"gst_no" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wholesaler_order_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"actor_id" varchar,
	"actor_role" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wholesaler_order_items" (
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
--> statement-breakpoint
CREATE TABLE "wholesaler_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL,
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wholesaler_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "wholesaler_products" (
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
--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_stores" ADD CONSTRAINT "favorite_stores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_headers" ADD CONSTRAINT "invoice_headers_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_sales_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_sales_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_img_id_captures_id_fk" FOREIGN KEY ("img_id") REFERENCES "public"."captures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_lines" ADD CONSTRAINT "purchase_lines_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_lines" ADD CONSTRAINT "purchase_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_request_item_id_quote_request_items_id_fk" FOREIGN KEY ("quote_request_item_id") REFERENCES "public"."quote_request_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_request_items" ADD CONSTRAINT "quote_request_items_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_request_items" ADD CONSTRAINT "quote_request_items_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_wholesaler_id_users_id_fk" FOREIGN KEY ("wholesaler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receive_invoices" ADD CONSTRAINT "receive_invoices_img_id_captures_id_fk" FOREIGN KEY ("img_id") REFERENCES "public"."captures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receive_items" ADD CONSTRAINT "receive_items_invoice_id_receive_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."receive_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_wholesaler_connections" ADD CONSTRAINT "retailer_wholesaler_connections_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_wholesaler_connections" ADD CONSTRAINT "retailer_wholesaler_connections_wholesaler_id_users_id_fk" FOREIGN KEY ("wholesaler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_patterns" ADD CONSTRAINT "user_learning_patterns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_order_events" ADD CONSTRAINT "wholesaler_order_events_order_id_wholesaler_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."wholesaler_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_order_events" ADD CONSTRAINT "wholesaler_order_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_order_items" ADD CONSTRAINT "wholesaler_order_items_order_id_wholesaler_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."wholesaler_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_order_items" ADD CONSTRAINT "wholesaler_order_items_product_id_wholesaler_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."wholesaler_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_orders" ADD CONSTRAINT "wholesaler_orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_orders" ADD CONSTRAINT "wholesaler_orders_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaler_orders" ADD CONSTRAINT "wholesaler_orders_wholesaler_id_users_id_fk" FOREIGN KEY ("wholesaler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;