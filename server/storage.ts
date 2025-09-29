import { type User, type InsertUser, type Product, type InsertProduct, type Stock, type InsertStock, type Sale, type InsertSale, type Outbox, type InsertOutbox, type AssistantBetaLead, type InsertAssistantBetaLead, type Document, type InsertDocument, invoiceHeaders, invoiceLineItems, pendingInvoices, type PendingInvoice, type InsertPendingInvoice } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { and, eq, sql } from "drizzle-orm";
import { users, products, stock, sales, outbox, assistantBetaLeads, documents, pendingInvoices as pendingInvoicesTable } from "@shared/schema";
import { normalizeInvoiceExtraction } from "./utils/invoice-normalizer";

interface SaleItemPayload {
  productId: string;
  stockId?: string;
  quantity: number;
  price?: number;
  paymentMethod?: string;
  productName?: string;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Stock
  getStock(): Promise<Stock[]>;
  getStockByProduct(productId: string): Promise<Stock[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: string, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  
  // Sales
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale, items?: SaleItemPayload[]): Promise<Sale>;
  getTodaysSales(): Promise<number>;

  // Pending invoices
  getPendingInvoices(tenantId: string): Promise<PendingInvoice[]>;
  upsertPendingInvoice(entry: InsertPendingInvoice): Promise<PendingInvoice>;
  updatePendingInvoice(messageId: string, updates: Partial<InsertPendingInvoice>): Promise<PendingInvoice | undefined>;
  deletePendingInvoice(messageId: string): Promise<boolean>;
  
  // Outbox
  getOutboxItems(): Promise<Outbox[]>;
  createOutboxItem(item: InsertOutbox): Promise<Outbox>;
  markOutboxItemSynced(id: string): Promise<void>;
  getUnsyncedOutboxItems(): Promise<Outbox[]>;
  
  // Assistant Beta Leads
  createAssistantBetaLead(lead: InsertAssistantBetaLead): Promise<AssistantBetaLead>;
  
  // Documents - Critical for AI/GSTN compliance data
  getDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private stock: Map<string, Stock> = new Map();
  private sales: Map<string, Sale> = new Map();
  private outbox: Map<string, Outbox> = new Map();
  private assistantBetaLeads: Map<string, AssistantBetaLead> = new Map();
  private documents: Map<string, Document> = new Map();
  private pendingInvoices: Map<string, PendingInvoice> = new Map();

  constructor() {
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Add demo products
    const product1: Product = {
      id: "prod-1",
      name: "Paracetamol 500mg",
      description: "Pain relief medication",
      price: 25.50,
      totalQuantity: 45,
      batchNumber: null,
      tenantId: 'default',
      createdAt: new Date(),
    };
    
    const product2: Product = {
      id: "prod-2", 
      name: "Cough Syrup",
      description: "For dry cough relief",
      price: 85.00,
      totalQuantity: 5,
      batchNumber: null,
      tenantId: 'default',
      createdAt: new Date(),
    };

    this.products.set(product1.id, product1);
    this.products.set(product2.id, product2);

    // Add demo stock
    const stock1: Stock = {
      id: "stock-1",
      productId: "prod-1",
      productName: product1.name,
      batchNumber: "B2024001",
      quantity: 45,
      expiryDate: new Date("2025-12-31"),
      tenantId: 'default',
      createdAt: new Date(),
    };

    const stock2: Stock = {
      id: "stock-2",
      productId: "prod-2", 
      productName: product2.name,
      batchNumber: "B2024002",
      quantity: 5, // Low stock
      expiryDate: new Date("2025-06-30"),
      tenantId: 'default',
      createdAt: new Date(),
    };

    this.stock.set(stock1.id, stock1);
    this.stock.set(stock2.id, stock2);

    // Add demo sales
    const sale1: Sale = {
      id: "sale-1",
      total: 285.50,
      date: new Date(),
      items: JSON.stringify([{productId: "prod-1", quantity: 2, price: 25.50}]),
      synced: true,
      tenantId: 'default',
    };

    this.sales.set(sale1.id, sale1);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || null,
      onboarded: (insertUser as any).onboarded || false 
    };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { 
      ...product, 
      id, 
      description: product.description || null,
      price: product.price || 0,
      totalQuantity: (product as any).totalQuantity ?? 0,
      batchNumber: product.batchNumber ?? null,
      tenantId: (product as any).tenantId ?? 'default',
      createdAt: new Date() 
    };
    this.products.set(id, newProduct);
    
    // Add to outbox for sync
    await this.createOutboxItem({
      tableName: "products",
      rowId: id,
      operation: "create",
      payload: JSON.stringify(newProduct),
    });
    
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...product,
      totalQuantity: (product as any).totalQuantity !== undefined
        ? (product as any).totalQuantity ?? existing.totalQuantity
        : existing.totalQuantity,
      tenantId: (product as any).tenantId ?? existing.tenantId,
      batchNumber: product.batchNumber !== undefined
        ? product.batchNumber ?? existing.batchNumber
        : existing.batchNumber
    };
    this.products.set(id, updated);
    
    // Add to outbox for sync
    await this.createOutboxItem({
      tableName: "products",
      rowId: id,
      operation: "update", 
      payload: JSON.stringify(updated),
    });
    
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const deleted = this.products.delete(id);
    if (deleted) {
      // Add to outbox for sync
      await this.createOutboxItem({
        tableName: "products",
        rowId: id,
        operation: "delete",
        payload: JSON.stringify({ id }),
      });
    }
    return deleted;
  }

  // Stock
  async getStock(): Promise<Stock[]> {
    return Array.from(this.stock.values());
  }

  async getStockByProduct(productId: string): Promise<Stock[]> {
    return Array.from(this.stock.values()).filter(s => s.productId === productId);
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const id = randomUUID();
    const product = this.products.get(stock.productId);
    const productName = stock.productName ?? product?.name ?? "Unknown Product";
    const tenantId = (stock as any).tenantId ?? product?.tenantId ?? 'default';
    const newStock: Stock = { 
      ...stock,
      id, 
      productName,
      tenantId,
      quantity: stock.quantity || 0,
      expiryDate: stock.expiryDate || null,
      createdAt: new Date() 
    };
    this.stock.set(id, newStock);
    
    // Add to outbox for sync
    await this.createOutboxItem({
      tableName: "stock",
      rowId: id,
      operation: "create",
      payload: JSON.stringify(newStock),
    });
    
    return newStock;
  }

  async updateStock(id: string, stock: Partial<InsertStock>): Promise<Stock | undefined> {
    const existing = this.stock.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...stock };
    if (!(stock as any)?.tenantId) {
      updated.tenantId = existing.tenantId;
    }
    this.stock.set(id, updated);
    
    // Add to outbox for sync
    await this.createOutboxItem({
      tableName: "stock", 
      rowId: id,
      operation: "update",
      payload: JSON.stringify(updated),
    });
    
    return updated;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values()).sort((a, b) => 
      new Date(b.date!).getTime() - new Date(a.date!).getTime()
    );
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(sale: InsertSale, items: SaleItemPayload[] = []): Promise<Sale> {
    const id = randomUUID();
    const newSale: Sale = { 
      ...sale, 
      id, 
      items: sale.items || null,
      date: new Date(),
      synced: false,
      tenantId: (sale as any).tenantId ?? 'default'
    };
    this.sales.set(id, newSale);

    for (const item of items) {
      if (item.stockId) {
        const stockItem = this.stock.get(item.stockId);
        if (stockItem) {
          const newQuantity = Math.max(0, stockItem.quantity - item.quantity);
          await this.updateStock(stockItem.id, { quantity: newQuantity });
        }
      }

      const product = this.products.get(item.productId);
      if (product) {
        const updatedTotal = Math.max(0, (product.totalQuantity ?? 0) - item.quantity);
        await this.updateProduct(product.id, { totalQuantity: updatedTotal });
      }
    }

    // Add to outbox for sync
    await this.createOutboxItem({
      tableName: "sales",
      rowId: id,
      operation: "create", 
      payload: JSON.stringify(newSale),
    });
    
    return newSale;
  }

  async getTodaysSales(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.sales.values())
      .filter(sale => {
        const saleDate = new Date(sale.date!);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      })
      .reduce((total, sale) => total + sale.total, 0);
  }

  async getPendingInvoices(tenantId: string): Promise<PendingInvoice[]> {
    return Array.from(this.pendingInvoices.values()).filter(entry => entry.tenantId === tenantId);
  }

  async upsertPendingInvoice(entry: InsertPendingInvoice): Promise<PendingInvoice> {
    const id = entry.id ?? randomUUID();
    const pending: PendingInvoice = {
      id,
      tenantId: entry.tenantId,
      messageId: entry.messageId,
      summaryText: entry.summaryText ?? null,
      summary: entry.summary ?? null,
      invoiceData: entry.invoiceData ?? null,
      rawAnalysis: entry.rawAnalysis ?? null,
      imageFileName: entry.imageFileName ?? null,
      imageData: entry.imageData ?? null,
      submissionState: entry.submissionState ?? 'idle',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pendingInvoices.set(entry.messageId, pending);
    return pending;
  }

  async updatePendingInvoice(messageId: string, updates: Partial<InsertPendingInvoice>): Promise<PendingInvoice | undefined> {
    const existing = this.pendingInvoices.get(messageId);
    if (!existing) return undefined;
    const updated: PendingInvoice = {
      ...existing,
      ...updates,
      summary: updates.summary ?? existing.summary,
      summaryText: updates.summaryText ?? existing.summaryText,
      invoiceData: updates.invoiceData ?? existing.invoiceData,
      rawAnalysis: updates.rawAnalysis ?? existing.rawAnalysis,
      imageFileName: updates.imageFileName ?? existing.imageFileName,
      imageData: updates.imageData ?? existing.imageData,
      submissionState: updates.submissionState ?? existing.submissionState,
      updatedAt: new Date()
    };
    this.pendingInvoices.set(messageId, updated);
    return updated;
  }

  async deletePendingInvoice(messageId: string): Promise<boolean> {
    return this.pendingInvoices.delete(messageId);
  }

  async getPendingInvoices(tenantId: string): Promise<PendingInvoice[]> {
    return Array.from(this.pendingInvoices.values()).filter(entry => entry.tenantId === tenantId);
  }

  async upsertPendingInvoice(entry: InsertPendingInvoice): Promise<PendingInvoice> {
    const id = entry.id ?? randomUUID();
    const pending: PendingInvoice = {
      id,
      tenantId: entry.tenantId,
      messageId: entry.messageId,
      summaryText: entry.summaryText ?? null,
      summary: entry.summary ?? null,
      invoiceData: entry.invoiceData ?? null,
      rawAnalysis: entry.rawAnalysis ?? null,
      imageFileName: entry.imageFileName ?? null,
      imageData: entry.imageData ?? null,
      submissionState: entry.submissionState ?? 'idle',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pendingInvoices.set(entry.messageId, pending);
    return pending;
  }

  async updatePendingInvoice(messageId: string, updates: Partial<InsertPendingInvoice>): Promise<PendingInvoice | undefined> {
    const existing = this.pendingInvoices.get(messageId);
    if (!existing) return undefined;
    const updated: PendingInvoice = {
      ...existing,
      ...updates,
      summary: updates.summary ?? existing.summary,
      summaryText: updates.summaryText ?? existing.summaryText,
      invoiceData: updates.invoiceData ?? existing.invoiceData,
      rawAnalysis: updates.rawAnalysis ?? existing.rawAnalysis,
      imageFileName: updates.imageFileName ?? existing.imageFileName,
      imageData: updates.imageData ?? existing.imageData,
      submissionState: updates.submissionState ?? existing.submissionState,
      updatedAt: new Date()
    };
    this.pendingInvoices.set(messageId, updated);
    return updated;
  }

  async deletePendingInvoice(messageId: string): Promise<boolean> {
    return this.pendingInvoices.delete(messageId);
  }

  // Documents - Critical for AI/GSTN data
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a: Document, b: Document) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const newDoc: Document = { 
      ...doc, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, newDoc);
    console.log('[STORAGE] Document saved to memory:', id, newDoc.docType);
    return newDoc;
  }

  // Outbox
  async getOutboxItems(): Promise<Outbox[]> {
    return Array.from(this.outbox.values());
  }

  async createOutboxItem(item: InsertOutbox): Promise<Outbox> {
    const id = randomUUID();
    const newItem: Outbox = { 
      ...item, 
      id, 
      timestamp: new Date(),
      synced: false,
      ownerId: item.ownerId || null,
      persona: item.persona || null
    };
    this.outbox.set(id, newItem);
    return newItem;
  }

  async markOutboxItemSynced(id: string): Promise<void> {
    const item = this.outbox.get(id);
    if (item) {
      item.synced = true;
      this.outbox.set(id, item);
    }
  }

  async getUnsyncedOutboxItems(): Promise<Outbox[]> {
    return Array.from(this.outbox.values()).filter(item => !item.synced);
  }

  // Assistant Beta Leads
  async createAssistantBetaLead(lead: InsertAssistantBetaLead): Promise<AssistantBetaLead> {
    const id = randomUUID();
    const newLead: AssistantBetaLead = { 
      ...lead, 
      id, 
      timestamp: new Date()
    };
    this.assistantBetaLeads.set(id, newLead);
    return newLead;
  }
}

// Database storage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUser:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUserByUsername:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values({
        ...insertUser,
        id: randomUUID()
      }).returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error('Database error in getProducts:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    } catch (error) {
      console.error('Database error in getProduct:', error);
      return undefined;
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const [product] = await db.insert(products).values({
        ...insertProduct,
        id: randomUUID(),
        tenantId: insertProduct.tenantId ?? 'default',
        createdAt: new Date()
      }).returning();
      return product;
    } catch (error) {
      console.error('Database error in createProduct:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
      return product || undefined;
    } catch (error) {
      console.error('Database error in updateProduct:', error);
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Database error in deleteProduct:', error);
      return false;
    }
  }

  // Stock
  async getStock(): Promise<Stock[]> {
    try {
      return await db.select().from(stock);
    } catch (error) {
      console.error('Database error in getStock:', error);
      return [];
    }
  }

  async getStockByProduct(productId: string): Promise<Stock[]> {
    try {
      return await db.select().from(stock).where(eq(stock.productId, productId));
    } catch (error) {
      console.error('Database error in getStockByProduct:', error);
      return [];
    }
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    try {
      let tenantId = insertStock.tenantId;
      if (!tenantId && insertStock.productId) {
        const [productTenant] = await db.select({ tenantId: products.tenantId })
          .from(products)
          .where(eq(products.id, insertStock.productId))
          .limit(1);
        tenantId = productTenant?.tenantId;
      }

      let productName = insertStock.productName;
      if (!productName) {
        const [product] = await db.select({ name: products.name })
          .from(products)
          .where(eq(products.id, insertStock.productId))
          .limit(1);
        productName = product?.name ?? "Unknown Product";
      }

      const [stockItem] = await db.insert(stock).values({
        ...insertStock,
        productName,
        id: randomUUID(),
        tenantId: tenantId ?? 'default',
        createdAt: new Date()
      }).returning();
      return stockItem;
    } catch (error) {
      console.error('Database error in createStock:', error);
      throw error;
    }
  }

  async updateStock(id: string, updates: Partial<InsertStock>): Promise<Stock | undefined> {
    try {
      const [stockItem] = await db.update(stock).set(updates).where(eq(stock.id, id)).returning();
      return stockItem || undefined;
    } catch (error) {
      console.error('Database error in updateStock:', error);
      return undefined;
    }
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    try {
      return await db.select().from(sales);
    } catch (error) {
      console.error('Database error in getSales:', error);
      return [];
    }
  }

  async getSale(id: string): Promise<Sale | undefined> {
    try {
      const [sale] = await db.select().from(sales).where(eq(sales.id, id));
      return sale || undefined;
    } catch (error) {
      console.error('Database error in getSale:', error);
      return undefined;
    }
  }

  async createSale(insertSale: InsertSale, items: SaleItemPayload[] = []): Promise<Sale> {
    try {
      const [sale] = await db.transaction(async (tx) => {
        const [createdSale] = await tx.insert(sales).values({
          ...insertSale,
          id: randomUUID(),
          date: new Date(),
          tenantId: insertSale.tenantId ?? 'default'
        }).returning();

        for (const item of items) {
          if (item.stockId) {
            await tx.update(stock)
              .set({
                quantity: sql`GREATEST(${stock.quantity} - ${item.quantity}, 0)`,
                productName: item.productName ?? stock.productName
              })
              .where(eq(stock.id, item.stockId));
          }

          await tx.update(products)
            .set({
              totalQuantity: sql`GREATEST(${products.totalQuantity} - ${item.quantity}, 0)`
            })
            .where(eq(products.id, item.productId));
        }

        return [createdSale];
      });

      return sale;
    } catch (error) {
      console.error('Database error in createSale:', error);
      throw error;
    }
  }

  async getTodaysSales(): Promise<number> {
    try {
      const allSales = await db.select().from(sales);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return allSales
        .filter(sale => {
          const saleDate = new Date(sale.date!);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === today.getTime();
        })
        .reduce((total, sale) => total + sale.total, 0);
    } catch (error) {
      console.error('Database error in getTodaysSales:', error);
      return 0;
    }
  }

  async getPendingInvoices(tenantId: string): Promise<PendingInvoice[]> {
    try {
      return await db.select().from(pendingInvoicesTable)
        .where(eq(pendingInvoicesTable.tenantId, tenantId))
        .orderBy(pendingInvoicesTable.createdAt);
    } catch (error) {
      console.error('Database error in getPendingInvoices:', error);
      return [];
    }
  }

  async upsertPendingInvoice(entry: InsertPendingInvoice): Promise<PendingInvoice> {
    try {
      const now = new Date();
      const [pending] = await db.insert(pendingInvoicesTable)
        .values({
          ...entry,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: pendingInvoicesTable.messageId,
          set: {
            summaryText: entry.summaryText ?? pendingInvoicesTable.summaryText,
            summary: entry.summary ?? pendingInvoicesTable.summary,
            invoiceData: entry.invoiceData ?? pendingInvoicesTable.invoiceData,
            rawAnalysis: entry.rawAnalysis ?? pendingInvoicesTable.rawAnalysis,
            imageFileName: entry.imageFileName ?? pendingInvoicesTable.imageFileName,
            imageData: entry.imageData ?? pendingInvoicesTable.imageData,
            submissionState: entry.submissionState ?? pendingInvoicesTable.submissionState,
            updatedAt: now
          }
        })
        .returning();
      return pending;
    } catch (error) {
      console.error('Database error in upsertPendingInvoice:', error);
      throw error;
    }
  }

  async updatePendingInvoice(messageId: string, updates: Partial<InsertPendingInvoice>): Promise<PendingInvoice | undefined> {
    try {
      const [pending] = await db.update(pendingInvoicesTable)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(pendingInvoicesTable.messageId, messageId))
        .returning();
      return pending || undefined;
    } catch (error) {
      console.error('Database error in updatePendingInvoice:', error);
      return undefined;
    }
  }

  async deletePendingInvoice(messageId: string): Promise<boolean> {
    try {
      const result = await db.delete(pendingInvoicesTable).where(eq(pendingInvoicesTable.messageId, messageId));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Database error in deletePendingInvoice:', error);
      return false;
    }
  }

  // Outbox
  async getOutboxItems(): Promise<Outbox[]> {
    try {
      return await db.select().from(outbox);
    } catch (error) {
      console.error('Database error in getOutboxItems:', error);
      return [];
    }
  }

  async createOutboxItem(insertOutbox: InsertOutbox): Promise<Outbox> {
    try {
      const [outboxItem] = await db.insert(outbox).values({
        ...insertOutbox,
        id: randomUUID(),
        timestamp: new Date()
      }).returning();
      return outboxItem;
    } catch (error) {
      console.error('Database error in createOutboxItem:', error);
      throw error;
    }
  }

  async markOutboxItemSynced(id: string): Promise<void> {
    try {
      await db.update(outbox).set({ synced: true }).where(eq(outbox.id, id));
    } catch (error) {
      console.error('Database error in markOutboxItemSynced:', error);
    }
  }

  async getUnsyncedOutboxItems(): Promise<Outbox[]> {
    try {
      return await db.select().from(outbox).where(eq(outbox.synced, false));
    } catch (error) {
      console.error('Database error in getUnsyncedOutboxItems:', error);
      return [];
    }
  }

  // Assistant Beta Leads
  async createAssistantBetaLead(insertLead: InsertAssistantBetaLead): Promise<AssistantBetaLead> {
    try {
      const [lead] = await db.insert(assistantBetaLeads).values({
        ...insertLead,
        id: randomUUID(),
        timestamp: new Date()
      }).returning();
      return lead;
    } catch (error) {
      console.error('Database error in createAssistantBetaLead:', error);
      throw error;
    }
  }

  // Documents - Critical for AI/GSTN compliance data
  async getDocuments(): Promise<Document[]> {
    try {
      const docs = await db.select().from(documents);
      const sorted = docs.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      console.log('[DATABASE] Loaded', docs.length, 'documents from database');
      return sorted;
    } catch (error) {
      console.error('Database error in getDocuments:', error);
      return [];
    }
  }

  private async ensureDefaultUser(): Promise<string> {
    try {
      // Check if default user exists
      const defaultUser = await db.select()
        .from(users)
        .where(eq(users.username, 'default-user'))
        .limit(1);

      if (defaultUser.length > 0) {
        return defaultUser[0].id;
      }

      // Create default user if not exists
      console.log('[STORAGE] Creating default user for document storage');
      const [newUser] = await db.insert(users)
        .values({
          username: 'default-user',
          password: 'default-password', // In a real app, this should be hashed
          role: 'admin',
          onboarded: true
        })
        .returning();
      
      return newUser.id;
    } catch (error) {
      console.error('Error ensuring default user:', error);
      throw new Error('Failed to ensure default user exists');
    }
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    console.log('[STORAGE] Creating document with data:', {
      docType: insertDoc.docType,
      fileName: insertDoc.fileName,
      hasHeader: !!insertDoc.header,
      hasLineItems: Array.isArray(insertDoc.lineItems) && insertDoc.lineItems.length > 0,
      tags: insertDoc.tags?.length || 0
    });

    const defaultUserId = await this.ensureDefaultUser();

    const docData = {
      id: randomUUID(),
      fileName: insertDoc.fileName,
      docType: insertDoc.docType,
      confirmedType: insertDoc.confirmedType ?? insertDoc.docType,
      confidence: insertDoc.confidence ?? 0,
      rawText: insertDoc.rawText ?? '',
      modelSummary: insertDoc.modelSummary ?? '',
      header: insertDoc.header ?? {},
      lineItems: Array.isArray(insertDoc.lineItems) ? insertDoc.lineItems : [],
      totals: insertDoc.totals ?? {},
      extractedData: insertDoc.extractedData ?? {},
      fileUrl: insertDoc.fileUrl ?? null,
      processingTime: insertDoc.processingTime ?? null,
      ocrDurationMs: insertDoc.ocrDurationMs ?? null,
      mongoWriteMs: insertDoc.mongoWriteMs ?? null,
      tags: Array.isArray(insertDoc.tags) ? insertDoc.tags : [],
      enterpriseId: insertDoc.enterpriseId ?? 'default',
      userId: insertDoc.userId ?? defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const result = await db.transaction(async (tx) => {
        const [doc] = await tx.insert(documents)
          .values(docData)
          .returning();

        if (doc.docType === 'invoice' && doc.extractedData) {
          const normalized = normalizeInvoiceExtraction(doc.extractedData, doc.rawText || '');

          if (normalized) {
            await tx.insert(invoiceHeaders)
              .values({
                documentId: doc.id,
                supplierName: normalized.header.supplierName,
                supplierAddress: normalized.header.supplierAddress,
                supplierGstin: normalized.header.supplierGstin,
                supplierDlNumber: normalized.header.supplierDlNumber,
                buyerName: normalized.header.buyerName,
                buyerAddress: normalized.header.buyerAddress,
                buyerGstin: normalized.header.buyerGstin,
                buyerPhone: normalized.header.buyerPhone,
                invoiceNumber: normalized.header.invoiceNumber,
                invoiceDate: normalized.header.invoiceDate ? new Date(normalized.header.invoiceDate) : null,
                dueDate: normalized.header.dueDate ? new Date(normalized.header.dueDate) : null,
                paymentTerms: normalized.header.paymentTerms,
                paymentConditions: normalized.header.paymentConditions,
                subtotal: normalized.totals.subtotal,
                grandTotal: normalized.totals.grandTotal,
                additionalCharges: normalized.totals.additionalCharges,
                discounts: normalized.totals.discounts,
                paymentInformation: normalized.totals.paymentInformation,
                termsAndConditions: normalized.totals.termsAndConditions,
                igst: normalized.totals.taxTotals.igst,
                cgst: normalized.totals.taxTotals.cgst,
                sgst: normalized.totals.taxTotals.sgst,
                extra: normalized.raw.header,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .onConflictDoNothing();

            if (normalized.lineItems.length > 0) {
            await tx.insert(invoiceLineItems)
              .values(
                normalized.lineItems.map((item) => ({
                  documentId: doc.id,
                  lineIndex: item.lineIndex,
                  productName: item.productName,
                  packSize: item.packSize,
                  manufacturer: item.manufacturer,
                  hsnSac: item.hsnSac,
                  batchNumber: item.batchNumber,
                  expiryDate: item.expiryDate,
                  mrp: item.mrp,
                  ptr: item.ptr,
                  pts: item.pts,
                  quantity: item.quantity,
                  units: item.units,
                  discountPercentage: item.discountPercentage,
                  discountAmount: item.discountAmount,
                  igst: item.igst,
                  cgst: item.cgst,
                  sgst: item.sgst,
                  totalAmount: item.totalAmount,
                  extra: item.extra,
                  createdAt: new Date()
                }))
              )
              .onConflictDoNothing();

            for (const item of normalized.lineItems) {
              const productName = item.productName?.trim();
              if (!productName) {
                continue;
              }

              const quantityToAdd = item.quantity ?? 0;
              const description = [item.packSize, item.manufacturer].filter(Boolean).join(' • ') || null;
              const price = item.mrp ?? item.totalAmount ?? 0;
              const batchNumber = item.batchNumber?.trim();
              const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
              const safeExpiryDate = expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate : null;

              const [productRecord] = await tx.insert(products)
                .values({
                  name: productName,
                  description,
                  price,
                  totalQuantity: quantityToAdd,
                  batchNumber: item.batchNumber ?? null,
                  tenantId: insertDoc.enterpriseId ?? 'default',
                  createdAt: new Date()
                })
                .onConflictDoUpdate({
                  target: [products.name, products.tenantId],
                  set: {
                    description: description ?? products.description,
                    price: price || products.price,
                    totalQuantity: sql`${products.totalQuantity} + ${quantityToAdd}`,
                    batchNumber: item.batchNumber ?? products.batchNumber,
                    tenantId: insertDoc.enterpriseId ?? products.tenantId
                  }
                })
                .returning({ id: products.id, existingBatch: products.batchNumber });

              const productId = productRecord?.id
                ?? (await tx.select({ id: products.id })
                    .from(products)
                    .where(eq(products.name, productName))
                    .limit(1))[0]?.id;

              if (!productId || !batchNumber) {
                continue;
              }

              const [existingStock] = await tx.select({
                id: stock.id,
              })
                .from(stock)
                .where(and(
                  eq(stock.productId, productId),
                  eq(stock.batchNumber, batchNumber)
                ))
                .limit(1);

              if (existingStock) {
                const updatePayload: any = {
                  quantity: sql`${stock.quantity} + ${quantityToAdd}`,
                  productName,
                  tenantId: insertDoc.enterpriseId ?? stock.tenantId
                };

                if (safeExpiryDate) {
                  updatePayload.expiryDate = safeExpiryDate;
                }

                await tx.update(stock)
                  .set(updatePayload)
                  .where(eq(stock.id, existingStock.id));
              } else {
                await tx.insert(stock)
                  .values({
                    productId,
                    productName,
                    batchNumber,
                    quantity: quantityToAdd,
                    expiryDate: safeExpiryDate,
                    tenantId: insertDoc.enterpriseId ?? 'default',
                    createdAt: new Date()
                  });
              }
            }
          }
        }
        }

        return doc;
      });

      console.log('[STORAGE] Document saved successfully:', {
        id: result.id,
        docType: result.docType,
        createdAt: result.createdAt
      });

      return result;
    } catch (error) {
      console.error('Database error in createDocument:', {
        error: error.message,
        stack: error.stack,
        docType: insertDoc?.docType,
        fileName: insertDoc?.fileName,
        hasExtractedData: !!insertDoc?.extractedData
      });
      throw new Error(`Failed to save document: ${error.message}`);
    }
  }
}

// Use database storage with fallback to memory storage if database is unavailable
let storage: IStorage = new MemStorage(); // Default fallback

async function initializeStorage(): Promise<void> {
  try {
    // Test database connectivity
    await db.execute(sql`select 1`);
    await ensureInvoiceTablesExist();
    await backfillStockFromProducts();
    // Simple query to confirm schema alignment
    await db.select().from(products).limit(1);
    storage = new DatabaseStorage();
    console.log('📊 Using PostgreSQL database storage');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('⚠️ Database unavailable, using memory storage:', errorMessage);
    // Keep using MemStorage fallback
  }
}

// Initialize storage on first import
initializeStorage();

export { storage };

async function ensureInvoiceTablesExist(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invoice_headers (
      document_id varchar(255) PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
      supplier_name text,
      supplier_address text,
      supplier_gstin text,
      supplier_dl_number text,
      buyer_name text,
      buyer_address text,
      buyer_gstin text,
      buyer_phone text,
      invoice_number text,
      invoice_date timestamp,
      due_date timestamp,
      payment_terms text,
      payment_conditions text,
      subtotal double precision,
      grand_total double precision,
      additional_charges double precision,
      discounts double precision,
      payment_information text,
      terms_and_conditions text,
      igst double precision,
      cgst double precision,
      sgst double precision,
      extra jsonb,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invoice_line_items (
      document_id varchar(255) REFERENCES documents(id) ON DELETE CASCADE,
      line_index integer NOT NULL,
      product_name text,
      pack_size text,
      manufacturer text,
      hsn_sac text,
      batch_number text,
      expiry_date text,
      mrp double precision,
      ptr double precision,
      pts double precision,
      quantity double precision,
      units text,
      discount_percentage double precision,
      discount_amount double precision,
      igst double precision,
      cgst double precision,
      sgst double precision,
      total_amount double precision,
      extra jsonb,
      created_at timestamp DEFAULT now(),
      PRIMARY KEY (document_id, line_index)
    );
  `);

  await db.execute(sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS total_quantity double precision DEFAULT 0
  `);

  await db.execute(sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS batch_number text
  `);

  await db.execute(sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT 'default'
  `);

  await db.execute(sql`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT 'default'
  `);

  await db.execute(sql`
    ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT 'default'
  `);

  await db.execute(sql`
    ALTER TABLE products
    DROP CONSTRAINT IF EXISTS products_name_unique
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS stock_product_batch_unique
    ON stock (product_id, batch_number)
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pending_invoices (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id varchar(255) NOT NULL,
      message_id varchar(255) UNIQUE NOT NULL,
      summary_text text,
      summary jsonb,
      invoice_data jsonb,
      raw_analysis jsonb,
      image_file_name text,
      image_data text,
      submission_state varchar(32) DEFAULT 'idle',
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
  `);

  try {
    await db.execute(sql`
      DROP INDEX IF EXISTS products_name_key
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS products_name_tenant_idx ON products (name, tenant_id)
    `);
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : '';
    if (!message.includes('already exists') && !message.includes('could not create unique index')) {
      throw error;
    }

    if (message.includes('could not create unique index')) {
      console.warn('[STORAGE] Duplicate product names detected. Normalizing existing records...');

      await db.execute(sql`
        WITH ranked AS (
          SELECT
            id,
            name,
            description,
            price,
            total_quantity,
            created_at,
            ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) AS rn,
            SUM(COALESCE(total_quantity, 0)) OVER (PARTITION BY name) AS total_qty_sum,
            AVG(price) OVER (PARTITION BY name) AS avg_price,
            MAX(description) OVER (PARTITION BY name) AS any_description
          FROM products
        )
        UPDATE products p
        SET total_quantity = ranked.total_qty_sum,
            price = ranked.avg_price,
            description = COALESCE(p.description, ranked.any_description)
        FROM ranked
        WHERE p.id = ranked.id
          AND ranked.rn = 1;
      `);

      await db.execute(sql`
        DELETE FROM products
        WHERE id IN (
          SELECT id
          FROM (
            SELECT
              id,
              ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) AS rn
            FROM products
          ) duplicates
          WHERE duplicates.rn > 1
        );
      `);

      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS products_name_key ON products (name)
      `);
    }
  }
}

async function backfillStockFromProducts(): Promise<void> {
  await db.execute(sql`
    INSERT INTO stock (id, product_id, product_name, batch_number, quantity, expiry_date, created_at)
    SELECT
      gen_random_uuid(),
      p.id,
      p.name,
      p.batch_number,
      COALESCE(p.total_quantity, 0),
      NULL,
      NOW()
    FROM products p
    WHERE p.batch_number IS NOT NULL
    ON CONFLICT (product_id, batch_number) DO UPDATE
    SET quantity = EXCLUDED.quantity,
        product_name = EXCLUDED.product_name
  `);
}
