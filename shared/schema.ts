import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, decimal, doublePrecision, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("retailer"), // retailer, wholesaler, distributor
  onboarded: boolean("onboarded").default(false),
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
  tenantId: varchar("tenant_id").notNull().default("default"),
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
  persona: text("persona").notNull(), // retailer, wholesaler, distributor
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
  role: text("role").notNull().default("retailer"), // retailer, wholesaler, distributor
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

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLearningPatternSchema = createInsertSchema(userLearningPatterns).omit({
  id: true,
  createdAt: true,
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
