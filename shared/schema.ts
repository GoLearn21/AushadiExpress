import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, decimal, doublePrecision, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("retailer"), // customer, retailer, wholesaler
  tenantId: varchar("tenant_id").notNull(),
  pharmacyName: text("pharmacy_name"),
  pincode: varchar("pincode", { length: 10 }), // for customers and retailers (serviceability)
  onboarded: boolean("onboarded").default(false),
  // Wholesaler-specific fields
  gstNumber: varchar("gst_number", { length: 15 }), // GST registration number
  businessAddress: text("business_address"), // Full business address
  contactPhone: varchar("contact_phone", { length: 15 }), // Business contact number
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull().default(0),
  totalQuantity: real("total_quantity").notNull().default(0),
  batchNumber: text("batch_number"),
  tenantId: varchar("tenant_id").notNull().default("default"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stock = pgTable("stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  batchNumber: text("batch_number").notNull(),
  quantity: integer("quantity").notNull().default(0),
  expiryDate: timestamp("expiry_date"),
  tenantId: varchar("tenant_id").notNull().default("default"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  total: real("total").notNull(),
  date: timestamp("date").defaultNow(),
  items: text("items"), // JSON string of sale items
  synced: boolean("synced").default(false),
  tenantId: varchar("tenant_id").notNull().default("default"), // Seller's tenant ID
  customerId: varchar("customer_id").references(() => users.id), // Customer who placed the order
  customerTenantId: varchar("customer_tenant_id"), // Customer's tenant ID for tracking

  // OMS fields
  status: text("status").default("pending"), // pending, confirmed, preparing, ready, completed, rejected, cancelled, expired
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, paid, refunded
  paymentMethod: text("payment_method"), // cash, upi, card, online
  storeName: text("store_name"),
  storeAddress: text("store_address"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  rejectionReason: text("rejection_reason"),
  estimatedReadyTime: integer("estimated_ready_time"), // minutes
  updatedAt: timestamp("updated_at").defaultNow(),
  pickupTime: timestamp("pickup_time"),
  expiresAt: timestamp("expires_at"),
});

export const pendingInvoices = pgTable("pending_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  messageId: varchar("message_id").notNull().unique(),
  summaryText: text("summary_text"),
  summary: jsonb("summary"),
  invoiceData: jsonb("invoice_data"),
  rawAnalysis: jsonb("raw_analysis"),
  imageFileName: text("image_file_name"),
  imageData: text("image_data"),
  submissionState: varchar("submission_state").notNull().default("idle"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const captures = pgTable("captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uri: text("uri").notNull(), // file path or base64
  mode: text("mode").notNull(), // 'barcode', 'invoice', 'prescription'
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  persona: text("persona").notNull(), // retailer, customer
  saleId: varchar("sale_id").references(() => sales.id), // optional link to sale
  processed: boolean("processed").default(false),
  metadata: text("metadata"), // JSON string for extracted data
  createdAt: timestamp("created_at").defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imgId: varchar("img_id").references(() => captures.id).notNull(),
  patient: text("patient").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const receiveInvoices = pgTable("receive_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imgId: varchar("img_id").references(() => captures.id).notNull(),
  vendor: text("vendor").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey().default("ME"),
  role: text("role").notNull().default("retailer"), // retailer, customer
  createdAt: timestamp("created_at").defaultNow(),
});

export const receiveItems = pgTable("receive_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => receiveInvoices.id).notNull(),
  drug: text("drug").notNull(),
  qty: integer("qty").notNull(),
  mrp: real("mrp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const outbox = pgTable("outbox", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: text("table_name").notNull(),
  rowId: varchar("row_id").notNull(),
  operation: text("operation").notNull(), // 'create', 'update', 'delete'
  payload: text("payload").notNull(), // JSON string
  ownerId: varchar("owner_id").references(() => users.id), // track ownership
  persona: text("persona"), // track user role
  timestamp: timestamp("timestamp").defaultNow(),
  synced: boolean("synced").default(false),
});

export const assistantBetaLeads = pgTable("assistant_beta_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Receiving workflow tables
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  gstNo: text("gst_no"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  date: timestamp("date").defaultNow(),
  status: text("status").notNull().default("draft"), // draft, sent, received, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseLines = pgTable("purchase_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poId: varchar("po_id").references(() => purchaseOrders.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poId: varchar("po_id").references(() => purchaseOrders.id),
  receivedAt: timestamp("received_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// OMS: Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // order_placed, order_accepted, order_rejected, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: varchar("order_id").references(() => sales.id),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// OMS: Order events log for audit trail
export const orderEvents = pgTable("order_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => sales.id),
  eventType: varchar("event_type").notNull(), // created, accepted, rejected, completed, etc.
  actorId: varchar("actor_id").references(() => users.id),
  actorRole: varchar("actor_role"), // customer, retailer
  metadata: jsonb("metadata"), // Additional event data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Capture schema is defined below with other new schemas

export const insertProductSchema = createInsertSchema(products, {
  tenantId: (schema) => schema.optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertStockSchema = createInsertSchema(stock, {
  productName: (schema) => schema.optional(),
  tenantId: (schema) => schema.optional(),
  expiryDate: z.union([
    z.date(),
    z.string().transform((val, ctx) => {
      const parsed = new Date(val);
      if (isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date format",
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales, {
  tenantId: (schema) => schema.optional(),
}).omit({
  id: true,
  date: true,
  synced: true,
});

export const insertPendingInvoiceSchema = createInsertSchema(pendingInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOutboxSchema = createInsertSchema(outbox).omit({
  id: true,
  timestamp: true,
  synced: true,
});

export const insertAssistantBetaLeadSchema = createInsertSchema(assistantBetaLeads).omit({
  id: true,
  timestamp: true,
});

// Receiving schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  totalAmount: true,
});

export const insertPurchaseLineSchema = createInsertSchema(purchaseLines).omit({
  id: true,
  createdAt: true,
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
});

export const insertCaptureSchema = createInsertSchema(captures).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertReceiveInvoiceSchema = createInsertSchema(receiveInvoices).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfile).omit({
  createdAt: true,
});

export const insertReceiveItemSchema = createInsertSchema(receiveItems).omit({
  id: true,
  createdAt: true,
});

// Document storage for AI analysis and retrieval with full-fidelity compliance
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enterpriseId: varchar("enterprise_id").default("default").notNull(), // For multi-tenant support
  userId: varchar("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  docType: text("doc_type").notNull(), // 'bill', 'prescription', 'invoice', 'other'
  confirmedType: text("confirmed_type"), // User-confirmed type for learning
  confidence: doublePrecision("confidence").notNull(),
  rawText: text("raw_text").notNull(), // COMPLETE OCR text with line-breaks
  modelSummary: text("model_summary").notNull(), // ≤150-word natural-language summary
  header: jsonb("header"), // { supplier, buyer, docNo, gstin, date }
  lineItems: jsonb("line_items"), // [{ name, qty, mrp, rate, gstPct, amount }]
  totals: jsonb("totals"), // { taxable, cgst, sgst, igst, net }
  extractedData: jsonb("extracted_data"), // Legacy compatibility
  fileUrl: text("file_url"), // S3/local storage path
  processingTime: integer("processing_time"),
  ocrDurationMs: integer("ocr_duration_ms"), // For audit logging
  mongoWriteMs: integer("mongo_write_ms"), // For audit logging
  tags: text("tags").array(), // For search and categorization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceHeaders = pgTable("invoice_headers", {
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  supplierName: text("supplier_name"),
  supplierAddress: text("supplier_address"),
  supplierGstin: text("supplier_gstin"),
  supplierDlNumber: text("supplier_dl_number"),
  buyerName: text("buyer_name"),
  buyerAddress: text("buyer_address"),
  buyerGstin: text("buyer_gstin"),
  buyerPhone: text("buyer_phone"),
  invoiceNumber: text("invoice_number"),
  invoiceDate: timestamp("invoice_date"),
  dueDate: timestamp("due_date"),
  paymentTerms: text("payment_terms"),
  paymentConditions: text("payment_conditions"),
  subtotal: doublePrecision("subtotal"),
  grandTotal: doublePrecision("grand_total"),
  additionalCharges: doublePrecision("additional_charges"),
  discounts: doublePrecision("discounts"),
  paymentInformation: text("payment_information"),
  termsAndConditions: text("terms_and_conditions"),
  igst: doublePrecision("igst"),
  cgst: doublePrecision("cgst"),
  sgst: doublePrecision("sgst"),
  extra: jsonb("extra"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.documentId] }),
}));

export const invoiceLineItems = pgTable("invoice_line_items", {
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  lineIndex: integer("line_index").notNull(),
  productName: text("product_name"),
  packSize: text("pack_size"),
  manufacturer: text("manufacturer"),
  hsnSac: text("hsn_sac"),
  batchNumber: text("batch_number"),
  expiryDate: text("expiry_date"),
  mrp: doublePrecision("mrp"),
  ptr: doublePrecision("ptr"),
  pts: doublePrecision("pts"),
  quantity: doublePrecision("quantity"),
  units: text("units"),
  discountPercentage: doublePrecision("discount_percentage"),
  discountAmount: doublePrecision("discount_amount"),
  igst: doublePrecision("igst"),
  cgst: doublePrecision("cgst"),
  sgst: doublePrecision("sgst"),
  totalAmount: doublePrecision("total_amount"),
  extra: jsonb("extra"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.documentId, table.lineIndex] }),
}));

// User learning patterns for improving AI accuracy
export const userLearningPatterns = pgTable("user_learning_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  documentFeatures: jsonb("document_features"), // Features that led to classification
  aiPrediction: text("ai_prediction").notNull(),
  userCorrection: text("user_correction"),
  confidenceScore: doublePrecision("confidence_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorite stores for customers
export const favoriteStores = pgTable("favorite_stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(), // Customer who favorited the store
  storeTenantId: varchar("store_tenant_id").notNull(), // The store's tenant ID
  storeName: text("store_name").notNull(),
  storeAddress: text("store_address"),
  storePhone: text("store_phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLearningPatternSchema = createInsertSchema(userLearningPatterns).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteStoreSchema = createInsertSchema(favoriteStores).omit({
  id: true,
  createdAt: true,
});

// OMS schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertOrderEventSchema = createInsertSchema(orderEvents).omit({
  id: true,
  createdAt: true,
});

// ==========================================
// WHOLESALER TABLES
// ==========================================

// Wholesaler products catalog (separate from retailer products for B2B pricing)
export const wholesalerProducts = pgTable("wholesaler_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(), // The wholesaler's tenant ID
  name: text("name").notNull(),
  description: text("description"),
  manufacturer: text("manufacturer"),
  category: text("category"), // e.g., "antibiotics", "analgesics", etc.
  packSize: text("pack_size"), // e.g., "10 tablets", "100ml"
  minOrderQuantity: integer("min_order_qty").default(1), // Minimum order quantity for retailers
  maxOrderQuantity: integer("max_order_qty"), // Maximum order quantity per order
  basePrice: real("base_price").notNull(), // Base price per unit (PTR - Price to Retailer)
  mrp: real("mrp"), // Maximum Retail Price for reference
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").default(10), // Alert when stock falls below this
  batchNumber: text("batch_number"), // Batch number for tracking
  expiryDate: timestamp("expiry_date"), // Expiry date for batch
  isActive: boolean("is_active").default(true),
  hsnCode: varchar("hsn_code", { length: 10 }), // HSN code for GST
  gstPercentage: real("gst_percentage").default(12), // GST percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quote requests from retailers to wholesalers
export const quoteRequests = pgTable("quote_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailerTenantId: varchar("retailer_tenant_id").notNull(), // Retailer requesting quote
  retailerId: varchar("retailer_id").references(() => users.id).notNull(),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(), // Wholesaler receiving request
  wholesalerId: varchar("wholesaler_id").references(() => users.id).notNull(),
  status: text("status").default("pending"), // pending, quoted, accepted, rejected, expired, cancelled
  totalItems: integer("total_items").default(0),
  notes: text("notes"), // Additional notes from retailer
  validUntil: timestamp("valid_until"), // Quote request validity
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual items in a quote request
export const quoteRequestItems = pgTable("quote_request_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteRequestId: varchar("quote_request_id").references(() => quoteRequests.id).notNull(),
  productId: varchar("product_id").references(() => wholesalerProducts.id), // Optional - if selecting from catalog
  productName: text("product_name").notNull(), // Product name (can be custom if not in catalog)
  requestedQuantity: integer("requested_quantity").notNull(),
  preferredManufacturer: text("preferred_manufacturer"), // Retailer's preference
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotes sent by wholesalers in response to quote requests
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteRequestId: varchar("quote_request_id").references(() => quoteRequests.id).notNull(),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  retailerTenantId: varchar("retailer_tenant_id").notNull(),
  status: text("status").default("sent"), // sent, viewed, accepted, rejected, expired, revised
  subtotal: real("subtotal").notNull().default(0),
  gstAmount: real("gst_amount").default(0),
  discountAmount: real("discount_amount").default(0),
  totalAmount: real("total_amount").notNull().default(0),
  validUntil: timestamp("valid_until").notNull(), // Quote validity period
  paymentTerms: text("payment_terms"), // e.g., "Net 30", "COD", etc.
  deliveryTerms: text("delivery_terms"), // e.g., "2-3 business days"
  notes: text("notes"), // Additional notes from wholesaler
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual items in a quote
export const quoteItems = pgTable("quote_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").references(() => quotes.id).notNull(),
  quoteRequestItemId: varchar("quote_request_item_id").references(() => quoteRequestItems.id),
  productId: varchar("product_id").references(() => wholesalerProducts.id),
  productName: text("product_name").notNull(),
  manufacturer: text("manufacturer"),
  packSize: text("pack_size"),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(), // Price per unit offered
  gstPercentage: real("gst_percentage").default(12),
  totalPrice: real("total_price").notNull(),
  isAvailable: boolean("is_available").default(true), // Whether item is in stock
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wholesaler orders (B2B orders from retailers)
export const wholesalerOrders = pgTable("wholesaler_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(), // Human-readable order number
  quoteId: varchar("quote_id").references(() => quotes.id), // Link to accepted quote
  retailerTenantId: varchar("retailer_tenant_id").notNull(),
  retailerId: varchar("retailer_id").references(() => users.id).notNull(),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  wholesalerId: varchar("wholesaler_id").references(() => users.id).notNull(),
  status: text("status").default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled, returned
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, partial, paid, refunded
  subtotal: real("subtotal").notNull(),
  gstAmount: real("gst_amount").default(0),
  discountAmount: real("discount_amount").default(0),
  shippingAmount: real("shipping_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentTerms: text("payment_terms"),
  deliveryAddress: text("delivery_address"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual items in a wholesaler order
export const wholesalerOrderItems = pgTable("wholesaler_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => wholesalerOrders.id).notNull(),
  productId: varchar("product_id").references(() => wholesalerProducts.id),
  productName: text("product_name").notNull(),
  manufacturer: text("manufacturer"),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date"),
  packSize: text("pack_size"),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  gstPercentage: real("gst_percentage").default(12),
  totalPrice: real("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wholesaler order events for audit trail
export const wholesalerOrderEvents = pgTable("wholesaler_order_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => wholesalerOrders.id).notNull(),
  eventType: varchar("event_type").notNull(), // created, confirmed, shipped, delivered, cancelled, etc.
  actorId: varchar("actor_id").references(() => users.id),
  actorRole: varchar("actor_role"), // retailer, wholesaler
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Retailer-Wholesaler connections (for favorite/connected wholesalers)
export const retailerWholesalerConnections = pgTable("retailer_wholesaler_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailerTenantId: varchar("retailer_tenant_id").notNull(),
  retailerId: varchar("retailer_id").references(() => users.id).notNull(),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  wholesalerId: varchar("wholesaler_id").references(() => users.id).notNull(),
  status: text("status").default("active"), // active, blocked
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// WHOLESALER PRICE LISTS
// ==========================================

// Price tiers for different retailer categories
export const wholesalerPriceTiers = pgTable("wholesaler_price_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  name: text("name").notNull(), // e.g., "Gold", "Silver", "Bronze", "Standard"
  description: text("description"),
  discountPercentage: real("discount_percentage").default(0), // Default discount for this tier
  minOrderValue: real("min_order_value").default(0), // Minimum order value to qualify
  creditDays: integer("credit_days").default(0), // Credit period in days
  isDefault: boolean("is_default").default(false), // Is this the default tier for new retailers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product-specific pricing for each tier
export const wholesalerTierPricing = pgTable("wholesaler_tier_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tierId: varchar("tier_id").references(() => wholesalerPriceTiers.id).notNull(),
  productId: varchar("product_id").references(() => wholesalerProducts.id).notNull(),
  specialPrice: real("special_price"), // Override price for this tier (null = use base price with tier discount)
  discountPercentage: real("discount_percentage"), // Override discount for this product in this tier
  createdAt: timestamp("created_at").defaultNow(),
});

// Assign retailers to price tiers
export const retailerPriceTierAssignments = pgTable("retailer_price_tier_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  retailerTenantId: varchar("retailer_tenant_id").notNull(),
  retailerId: varchar("retailer_id").references(() => users.id).notNull(),
  tierId: varchar("tier_id").references(() => wholesalerPriceTiers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// WHOLESALER CREDIT MANAGEMENT
// ==========================================

// Retailer credit accounts
export const retailerCreditAccounts = pgTable("retailer_credit_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  retailerTenantId: varchar("retailer_tenant_id").notNull(),
  retailerId: varchar("retailer_id").references(() => users.id).notNull(),
  creditLimit: real("credit_limit").default(0), // Maximum credit allowed
  currentBalance: real("current_balance").default(0), // Current outstanding amount (positive = retailer owes)
  availableCredit: real("available_credit").default(0), // credit_limit - current_balance
  creditDays: integer("credit_days").default(30), // Payment due in X days
  status: text("status").default("active"), // active, suspended, blocked
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmount: real("last_payment_amount"),
  totalPurchases: real("total_purchases").default(0), // Lifetime purchases
  totalPayments: real("total_payments").default(0), // Lifetime payments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit transactions (invoices, payments, adjustments)
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creditAccountId: varchar("credit_account_id").references(() => retailerCreditAccounts.id).notNull(),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  retailerTenantId: varchar("retailer_tenant_id").notNull(),
  type: text("type").notNull(), // invoice, payment, credit_note, debit_note, adjustment
  referenceId: varchar("reference_id"), // Order ID or payment reference
  referenceNumber: varchar("reference_number"), // Invoice number or payment receipt
  amount: real("amount").notNull(), // Positive for debit (owes more), negative for credit (paid)
  balanceAfter: real("balance_after").notNull(), // Balance after this transaction
  dueDate: timestamp("due_date"), // For invoices
  paymentMethod: text("payment_method"), // cash, upi, neft, cheque, etc.
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// DELIVERY ROUTES
// ==========================================

// Delivery routes/zones
export const deliveryRoutes = pgTable("delivery_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  name: text("name").notNull(), // e.g., "North Zone", "MG Road Area"
  description: text("description"),
  pincodes: text("pincodes"), // Comma-separated list of pincodes
  deliveryDays: text("delivery_days"), // e.g., "mon,wed,fri" or "daily"
  deliveryTime: text("delivery_time"), // e.g., "9:00 AM - 12:00 PM"
  driverName: text("driver_name"),
  driverPhone: varchar("driver_phone", { length: 15 }),
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0), // For ordering routes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery schedules (planned deliveries)
export const deliverySchedules = pgTable("delivery_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerTenantId: varchar("wholesaler_tenant_id").notNull(),
  routeId: varchar("route_id").references(() => deliveryRoutes.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").default("planned"), // planned, in_progress, completed, cancelled
  totalOrders: integer("total_orders").default(0),
  totalValue: real("total_value").default(0),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Link orders to delivery schedules
export const deliveryScheduleOrders = pgTable("delivery_schedule_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scheduleId: varchar("schedule_id").references(() => deliverySchedules.id).notNull(),
  orderId: varchar("order_id").references(() => wholesalerOrders.id).notNull(),
  deliverySequence: integer("delivery_sequence").default(0), // Order of delivery
  status: text("status").default("pending"), // pending, delivered, failed, skipped
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// WHOLESALER SCHEMAS
// ==========================================

export const insertWholesalerProductSchema = createInsertSchema(wholesalerProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteRequestItemSchema = createInsertSchema(quoteRequestItems).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
  id: true,
  createdAt: true,
});

export const insertWholesalerOrderSchema = createInsertSchema(wholesalerOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWholesalerOrderItemSchema = createInsertSchema(wholesalerOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertWholesalerOrderEventSchema = createInsertSchema(wholesalerOrderEvents).omit({
  id: true,
  createdAt: true,
});

export const insertRetailerWholesalerConnectionSchema = createInsertSchema(retailerWholesalerConnections).omit({
  id: true,
  createdAt: true,
});

// Price tier schemas
export const insertWholesalerPriceTierSchema = createInsertSchema(wholesalerPriceTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWholesalerTierPricingSchema = createInsertSchema(wholesalerTierPricing).omit({
  id: true,
  createdAt: true,
});

export const insertRetailerPriceTierAssignmentSchema = createInsertSchema(retailerPriceTierAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Credit management schemas
export const insertRetailerCreditAccountSchema = createInsertSchema(retailerCreditAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

// Delivery route schemas
export const insertDeliveryRouteSchema = createInsertSchema(deliveryRoutes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryScheduleSchema = createInsertSchema(deliverySchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryScheduleOrderSchema = createInsertSchema(deliveryScheduleOrders).omit({
  id: true,
  createdAt: true,
});

// ==========================================
// DOCTOR TABLES
// ==========================================

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorTenantId: varchar("doctor_tenant_id").notNull(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 15 }),
  age: integer("age"),
  gender: text("gender"), // male, female, other
  bloodGroup: text("blood_group"),
  allergies: text("allergies").array(),
  medicalHistory: text("medical_history"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctorAppointments = pgTable("doctor_appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorTenantId: varchar("doctor_tenant_id").notNull(),
  doctorId: varchar("doctor_id").references(() => users.id).notNull(),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  appointmentDate: text("appointment_date").notNull(), // stored as YYYY-MM-DD string
  appointmentTime: text("appointment_time").notNull(), // stored as HH:MM string
  durationMinutes: integer("duration_minutes").default(15),
  status: text("status").default("scheduled"), // scheduled, confirmed, visited, cancelled, no_show
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctorPrescriptions = pgTable("doctor_prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorTenantId: varchar("doctor_tenant_id").notNull(),
  doctorId: varchar("doctor_id").references(() => users.id).notNull(),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  appointmentId: varchar("appointment_id").references(() => doctorAppointments.id),
  medicines: jsonb("medicines"), // [{name, dosage, frequency, duration, instructions}]
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  status: text("status").default("draft"), // draft, issued, fulfilled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const labTestRequests = pgTable("lab_test_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labTenantId: varchar("lab_tenant_id"),
  doctorTenantId: varchar("doctor_tenant_id").notNull(),
  doctorId: varchar("doctor_id").references(() => users.id).notNull(),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  prescriptionId: varchar("prescription_id").references(() => doctorPrescriptions.id),
  tests: jsonb("tests"), // [{testName, notes}]
  status: text("status").default("pending"), // pending, accepted, sample_collected, processing, completed, rejected, cancelled
  notes: text("notes"),
  rejectionReason: text("rejection_reason"),
  collectionDate: text("collection_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// DOCTOR SCHEMAS
// ==========================================

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorAppointmentSchema = createInsertSchema(doctorAppointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorPrescriptionSchema = createInsertSchema(doctorPrescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLabTestRequestSchema = createInsertSchema(labTestRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Stock = typeof stock.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Capture = typeof captures.$inferSelect;
export type InsertCapture = z.infer<typeof insertCaptureSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type ReceiveInvoice = typeof receiveInvoices.$inferSelect;
export type InsertReceiveInvoice = z.infer<typeof insertReceiveInvoiceSchema>;
export type UserProfile = typeof userProfile.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type ReceiveItem = typeof receiveItems.$inferSelect;
export type InsertReceiveItem = z.infer<typeof insertReceiveItemSchema>;
export type Outbox = typeof outbox.$inferSelect;
export type InsertOutbox = z.infer<typeof insertOutboxSchema>;
export type AssistantBetaLead = typeof assistantBetaLeads.$inferSelect;
export type InsertAssistantBetaLead = z.infer<typeof insertAssistantBetaLeadSchema>;

// Receiving types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseLine = typeof purchaseLines.$inferSelect;
export type InsertPurchaseLine = z.infer<typeof insertPurchaseLineSchema>;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

// Document types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InvoiceHeader = typeof invoiceHeaders.$inferSelect;
export type InsertInvoiceHeader = typeof invoiceHeaders.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = typeof invoiceLineItems.$inferInsert;
export type PendingInvoice = typeof pendingInvoices.$inferSelect;
export type InsertPendingInvoice = typeof pendingInvoices.$inferInsert;
export type UserLearningPattern = typeof userLearningPatterns.$inferSelect;
export type InsertUserLearningPattern = z.infer<typeof insertUserLearningPatternSchema>;
export type FavoriteStore = typeof favoriteStores.$inferSelect;
export type InsertFavoriteStore = z.infer<typeof insertFavoriteStoreSchema>;

// OMS types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type InsertOrderEvent = z.infer<typeof insertOrderEventSchema>;

// Wholesaler types
export type WholesalerProduct = typeof wholesalerProducts.$inferSelect;
export type InsertWholesalerProduct = z.infer<typeof insertWholesalerProductSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequestItem = typeof quoteRequestItems.$inferSelect;
export type InsertQuoteRequestItem = z.infer<typeof insertQuoteRequestItemSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;
export type WholesalerOrder = typeof wholesalerOrders.$inferSelect;
export type InsertWholesalerOrder = z.infer<typeof insertWholesalerOrderSchema>;
export type WholesalerOrderItem = typeof wholesalerOrderItems.$inferSelect;
export type InsertWholesalerOrderItem = z.infer<typeof insertWholesalerOrderItemSchema>;
export type WholesalerOrderEvent = typeof wholesalerOrderEvents.$inferSelect;
export type InsertWholesalerOrderEvent = z.infer<typeof insertWholesalerOrderEventSchema>;
export type RetailerWholesalerConnection = typeof retailerWholesalerConnections.$inferSelect;
export type InsertRetailerWholesalerConnection = z.infer<typeof insertRetailerWholesalerConnectionSchema>;

// Price tier types
export type WholesalerPriceTier = typeof wholesalerPriceTiers.$inferSelect;
export type InsertWholesalerPriceTier = z.infer<typeof insertWholesalerPriceTierSchema>;
export type WholesalerTierPricing = typeof wholesalerTierPricing.$inferSelect;
export type InsertWholesalerTierPricing = z.infer<typeof insertWholesalerTierPricingSchema>;
export type RetailerPriceTierAssignment = typeof retailerPriceTierAssignments.$inferSelect;
export type InsertRetailerPriceTierAssignment = z.infer<typeof insertRetailerPriceTierAssignmentSchema>;

// Credit management types
export type RetailerCreditAccount = typeof retailerCreditAccounts.$inferSelect;
export type InsertRetailerCreditAccount = z.infer<typeof insertRetailerCreditAccountSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;

// Delivery route types
export type DeliveryRoute = typeof deliveryRoutes.$inferSelect;
export type InsertDeliveryRoute = z.infer<typeof insertDeliveryRouteSchema>;
export type DeliverySchedule = typeof deliverySchedules.$inferSelect;
export type InsertDeliverySchedule = z.infer<typeof insertDeliveryScheduleSchema>;
export type DeliveryScheduleOrder = typeof deliveryScheduleOrders.$inferSelect;
export type InsertDeliveryScheduleOrder = z.infer<typeof insertDeliveryScheduleOrderSchema>;

// Doctor types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type DoctorAppointment = typeof doctorAppointments.$inferSelect;
export type InsertDoctorAppointment = z.infer<typeof insertDoctorAppointmentSchema>;
export type DoctorPrescription = typeof doctorPrescriptions.$inferSelect;
export type InsertDoctorPrescription = z.infer<typeof insertDoctorPrescriptionSchema>;
export type LabTestRequest = typeof labTestRequests.$inferSelect;
export type InsertLabTestRequest = z.infer<typeof insertLabTestRequestSchema>;
