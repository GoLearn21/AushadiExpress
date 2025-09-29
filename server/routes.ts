import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiAgent } from "./services/gemini-agent";
import { insertProductSchema, insertStockSchema, insertSaleSchema, insertCaptureSchema, insertUserLearningPatternSchema, insertPendingInvoiceSchema } from "@shared/schema";
import { z } from "zod";
import aiRoutes from "./routes/ai";
import multer from 'multer';
import { normalizeInvoiceExtraction, NormalizedInvoice } from "./utils/invoice-normalizer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced comprehensive logging middleware for debug visibility in Replit console
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n=== [${timestamp}] ${req.method} ${req.path} ===`);
    
    if (req.query && Object.keys(req.query).length > 0) {
      console.log(`[QUERY PARAMS]`, JSON.stringify(req.query, null, 2));
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[REQUEST BODY]`, JSON.stringify(req.body, null, 2));
    }
    
    if (req.headers.authorization) {
      console.log(`[AUTH]`, 'Bearer token present');
    }
    
    // Log session info if available  
    if ((req as any).session?.userId) {
      console.log(`[SESSION]`, { userId: (req as any).session.userId, userRole: (req as any).session.userRole });
    }
    
    // Intercept response to log status and response body
    const originalSend = res.send;
    res.send = function(body) {
      console.log(`[RESPONSE ${res.statusCode}]`, typeof body === 'string' ? body.substring(0, 200) + (body.length > 200 ? '...' : '') : body);
      console.log(`=== END ${req.method} ${req.path} ===\n`);
      return originalSend.call(this, body);
    };
    
    next();
  });

  // AI routes
  app.use("/api/ai", aiRoutes);

  // Document storage setup
  const documentUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });


  // Business Intelligence Generator
  function generateBusinessIntelligence(invoice: NormalizedInvoice | null) {
    if (!invoice) {
      return {
        businessRelationship: 'unknown',
        entityTypes: { supplier: 'unknown', buyer: 'unknown' },
        transactionMetrics: {
          totalValue: 0,
          itemCount: 0,
          avgItemValue: 0,
          medicineCategories: {}
        },
        riskProfile: 'standard',
        suggestedTags: [] as string[]
      };
    }

    const supplier = invoice.header.supplierName?.toLowerCase() || '';
    const buyer = invoice.header.buyerName?.toLowerCase() || '';

    const entityTypes = {
      supplier: classifyEntity(supplier),
      buyer: classifyEntity(buyer)
    };

    const businessRelationship = deriveRelationship(entityTypes);

    const totalValue = invoice.totals.grandTotal ?? invoice.totals.subtotal ?? 0;
    const itemCount = invoice.lineItems.length;
    const avgItemValue = itemCount > 0 && totalValue ? totalValue / itemCount : 0;

    const medicineCategories = invoice.lineItems.reduce<Record<string, number>>((acc, item) => {
      const name = (item.productName || '').toLowerCase();
      let category = 'other';
      if (name.includes('tab')) category = 'tablet';
      else if (name.includes('syrup') || name.includes('liquid')) category = 'liquid';
      else if (name.includes('gel') || name.includes('cream')) category = 'topical';
      else if (name.includes('inject')) category = 'injection';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const suggestedTags = [
      invoice.summary.invoiceNumber ? `invoice:${invoice.summary.invoiceNumber}` : null,
      entityTypes.supplier !== 'unknown' ? `supplier:${entityTypes.supplier}` : null,
      entityTypes.buyer !== 'unknown' ? `buyer:${entityTypes.buyer}` : null,
      businessRelationship,
      invoice.summary.grandTotal && invoice.summary.grandTotal > 10000 ? 'high_value' : null,
      ...invoice.gstins.map(gstn => `gstn:${gstn}`)
    ].filter(Boolean) as string[];

    return {
      businessRelationship,
      entityTypes,
      transactionMetrics: {
        totalValue: totalValue || 0,
        itemCount,
        avgItemValue: avgItemValue || 0,
        medicineCategories
      },
      riskProfile: totalValue && totalValue > 10000 ? 'high_value' : totalValue && totalValue > 5000 ? 'medium_value' : 'standard',
      suggestedTags
    };
  }

  function generateComplianceMetadata(
    invoice: NormalizedInvoice | null,
    fileName: string | null,
    documentType: string,
    rawText: string | undefined,
    confidence: number | undefined
  ) {
    return {
      auditTrail: {
        uploadTimestamp: new Date().toISOString(),
        fileName,
        ocrVersion: 'gpt-4o-mini',
        extractionTimestamp: new Date().toISOString()
      },
      regulatoryData: {
        documentType,
        supplier: invoice?.header.supplierName ?? null,
        buyer: invoice?.header.buyerName ?? null,
        gstins: invoice?.gstins ?? [],
        medicineCount: invoice?.lineItems.length ?? 0,
        totals: {
          subtotal: invoice?.totals.subtotal,
          grandTotal: invoice?.totals.grandTotal,
          taxes: invoice?.totals.taxTotals
        }
      },
      dataIntegrity: {
        originalTextLength: rawText?.length ?? 0,
        confidence: confidence ?? null,
        normalized: !!invoice
      }
    };
  }
  function generateSearchableText(invoice: NormalizedInvoice | null, rawData: any): string {
    const parts: Array<string | null | undefined> = [];

    if (invoice) {
      parts.push(
        invoice.header.supplierName,
        invoice.header.buyerName,
        invoice.header.invoiceNumber,
        invoice.header.supplierGstin,
        invoice.header.buyerGstin,
        ...invoice.gstins,
        invoice.lineItems.map((item) => item.productName).join(' ')
      );
    }

    if (rawData?.rawText) {
      parts.push(rawData.rawText);
    }

    if (rawData?.extractedData?.header?.gstn) {
      parts.push(rawData.extractedData.header.gstn);
    }

    return parts
      .flat()
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(' ')
      .toLowerCase();
  }

  function buildModelSummary(docType: string, invoice: NormalizedInvoice | null, gstins: string[]): string {
    if (!invoice) {
      return `${docType} document processed`;
    }

    const supplier = invoice.header.supplierName || 'Unknown supplier';
    const total = invoice.totals.grandTotal ?? invoice.totals.subtotal ?? null;
    const totalText = total ? `Total ₹${total.toFixed(2)}` : 'Total unavailable';
    const gstnText = gstins.length > 0 ? `GSTIN ${gstins.join(', ')}` : 'GSTIN unavailable';

    return `${docType} invoice for ${supplier}. ${totalText}. ${gstnText}.`;
  }

  function classifyEntity(name: string): string {
    if (!name) return 'unknown';
    if (name.includes('pharma') || name.includes('pharmaceutical')) return 'manufacturer';
    if (name.includes('distributor') || name.includes('agencies') || name.includes('wholesale')) return 'wholesaler';
    if (name.includes('medical') || name.includes('pharmacy') || name.includes('store')) return 'retailer';
    return 'unknown';
  }

  function deriveRelationship(entityTypes: { supplier: string; buyer: string }): string {
    if (entityTypes.supplier === 'wholesaler' && entityTypes.buyer === 'retailer') {
      return 'wholesaler_to_retailer';
    }
    if (entityTypes.supplier === 'manufacturer' && entityTypes.buyer === 'wholesaler') {
      return 'manufacturer_to_wholesaler';
    }
    if (entityTypes.supplier === 'manufacturer' && entityTypes.buyer === 'retailer') {
      return 'manufacturer_to_retailer';
    }
    return 'unknown';
  }

  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      console.log('[DOCUMENTS] Fetching documents:', documents.length);
      res.json(documents);
    } catch (error) {
      console.error('[DOCUMENTS] Error fetching documents:', error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  
  app.post("/api/documents", documentUpload.single('image'), async (req, res) => {
    const processingStartTime = Date.now();

    try {
      const { confirmedType, extractedData, userRole = 'retailer', deviceType = 'desktop' } = req.body;
      const file = req.file ?? null;

      if (!confirmedType) {
        return res.status(400).json({
          error: 'Document type confirmation required',
          details: 'The confirmedType field is missing from request'
        });
      }

      let parsedExtractedData: any = {};
      try {
        if (typeof extractedData === 'string') {
          parsedExtractedData = JSON.parse(extractedData || '{}');
        } else if (typeof extractedData === 'object' && extractedData !== null) {
          parsedExtractedData = extractedData;
        }
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid extracted data format',
          details: parseError instanceof Error ? parseError.message : 'JSON parse failed'
        });
      }

      const normalizedInvoice = normalizeInvoiceExtraction(parsedExtractedData, parsedExtractedData.rawText || '');
      const gstins = normalizedInvoice?.gstins ?? [];
      const businessIntelligence = generateBusinessIntelligence(normalizedInvoice);
      const complianceMetadata = generateComplianceMetadata(normalizedInvoice, file?.originalname ?? null, confirmedType, parsedExtractedData.rawText, parsedExtractedData.confidence);
      const searchableText = generateSearchableText(normalizedInvoice, parsedExtractedData);

      const roleMetadata = {
        userRole,
        deviceType,
        timestamp: new Date().toISOString()
      };

      const fileName = file?.originalname ?? `${confirmedType}-${Date.now()}.json`;
      const fileUrl = file ? `/uploads/${file.originalname}` : null;
      const processingTimeSoFar = Date.now() - processingStartTime;

      const savedDocument = await storage.createDocument({
        fileName,
        docType: parsedExtractedData.documentType || confirmedType || 'other',
        confirmedType,
        confidence: parsedExtractedData.confidence ?? 0.8,
        rawText: parsedExtractedData.rawText ?? '',
        modelSummary: parsedExtractedData.modelSummary || buildModelSummary(confirmedType, normalizedInvoice, gstins),
        header: normalizedInvoice ? normalizedInvoice.header : {},
        lineItems: normalizedInvoice ? normalizedInvoice.lineItems : [],
        totals: normalizedInvoice ? normalizedInvoice.totals : {},
        extractedData: parsedExtractedData,
        fileUrl,
        processingTime: processingTimeSoFar,
        ocrDurationMs: parsedExtractedData.metadata?.ocrDurationMs ?? null,
        mongoWriteMs: null,
        tags: [...(businessIntelligence?.suggestedTags ?? []), ...gstins.map((gstn) => `gstn:${gstn}`)],
        userId: (req as any).user?.id,
        enterpriseId: 'pharm_007'
      });

      res.json({
        document: savedDocument,
        metadata: {
          businessIntelligence,
          complianceMetadata,
          roleMetadata,
          gstins,
          invoiceSummary: normalizedInvoice?.summary ?? null,
          searchableText
        }
      });
    } catch (error) {
      console.error('[DOCUMENTS-POST] Storage failed:', error);
      res.status(500).json({ error: 'Failed to store document' });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      console.log('[API] Fetching products...');
      const products = await storage.getProducts();
      console.log(`[API] Found ${products.length} products`);
      res.json(products);
    } catch (error) {
      console.error('[API ERROR] Failed to fetch products:', error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Stock routes
  app.get("/api/stock", async (req, res) => {
    try {
      const stock = await storage.getStock();
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  app.post("/api/stock", async (req, res) => {
    try {
      const stockData = insertStockSchema.parse(req.body);
      const stock = await storage.createStock(stockData);
      res.status(201).json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid stock data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create stock" });
      }
    }
  });

  app.get("/api/stock/product/:productId", async (req, res) => {
    try {
      const stock = await storage.getStockByProduct(req.params.productId);
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  // Barcode lookup route
  app.post("/api/barcode/lookup", async (req, res) => {
    try {
      const { barcode } = req.body;
      
      // Mock barcode lookup - in production this would query a drug database
      const mockProductMapping: Record<string, string> = {
        '1234567890123': 'prod-1', // Paracetamol
        '9876543210987': 'prod-2', // Cough Syrup  
        '1111222233334': 'prod-1', // Another barcode for Paracetamol
      };
      
      const productId = mockProductMapping[barcode];
      
      if (productId) {
        // Get product details
        const products = await storage.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
          res.json({
            barcode,
            productId,
            product,
            found: true
          });
        } else {
          res.json({
            barcode,
            found: false,
            message: 'Product not found in inventory'
          });
        }
      } else {
        res.json({
          barcode,
          found: false,
          message: 'Barcode not recognized'
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Barcode lookup failed' });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  const pendingInvoiceCreateSchema = insertPendingInvoiceSchema.pick({
    tenantId: true,
    messageId: true,
    summaryText: true,
    summary: true,
    invoiceData: true,
    rawAnalysis: true,
    imageFileName: true,
    imageData: true,
    submissionState: true,
  });

  const pendingInvoiceUpdateSchema = pendingInvoiceCreateSchema.partial().extend({
    messageId: z.string().optional(),
  });

  app.get('/api/pending-invoices', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      if (!tenantId) {
        return res.status(400).json({ error: 'tenantId query parameter is required' });
      }
      const invoices = await storage.getPendingInvoices(tenantId);
      res.json(invoices);
    } catch (error) {
      console.error('[PENDING-INVOICE] Fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch pending invoices' });
    }
  });

  app.post('/api/pending-invoices', async (req, res) => {
    try {
      const data = pendingInvoiceCreateSchema.parse(req.body);
      const pending = await storage.upsertPendingInvoice({
        ...data,
        updatedAt: new Date()
      });
      res.status(201).json(pending);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid payload', details: error.errors });
      }
      console.error('[PENDING-INVOICE] Upsert failed:', error);
      res.status(500).json({ error: 'Failed to save pending invoice' });
    }
  });

  app.patch('/api/pending-invoices/:messageId', async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const updates = pendingInvoiceUpdateSchema.parse(req.body);
      const pending = await storage.updatePendingInvoice(messageId, {
        ...updates,
        updatedAt: new Date()
      });
      if (!pending) {
        return res.status(404).json({ error: 'Pending invoice not found' });
      }
      res.json(pending);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid payload', details: error.errors });
      }
      console.error('[PENDING-INVOICE] Update failed:', error);
      res.status(500).json({ error: 'Failed to update pending invoice' });
    }
  });

  app.delete('/api/pending-invoices/:messageId', async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const deleted = await storage.deletePendingInvoice(messageId);
      if (!deleted) {
        return res.status(404).json({ error: 'Pending invoice not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('[PENDING-INVOICE] Delete failed:', error);
      res.status(500).json({ error: 'Failed to delete pending invoice' });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);

      let rawItems: any[] = [];
      if (saleData.items) {
        try {
          rawItems = JSON.parse(saleData.items);
        } catch (parseError) {
          console.error('[SALES] Failed to parse sale items JSON:', parseError);
          return res.status(400).json({ error: 'Invalid sale items payload' });
        }
      }

      const enrichedItems = await Promise.all(
        rawItems.map(async (item) => {
          const quantity = Number(item.quantity) || 0;
          let productName = item.productName;

          if (!productName && item.productId) {
            const product = await storage.getProduct(item.productId);
            productName = product?.name ?? 'Unknown Product';
          }

          return {
            ...item,
            quantity,
            productName,
          };
        })
      );

      const saleTenantId = saleData.tenantId ?? req.body?.tenantId ?? 'default';

      const saleWithNames = {
        ...saleData,
        tenantId: saleTenantId,
        items: JSON.stringify(enrichedItems),
      };

      const sale = await storage.createSale(saleWithNames, enrichedItems.map(item => ({
        ...item,
        productName: item.productName,
      })));

      // Create outbox entry for offline sync
      await storage.createOutboxItem({
        tableName: 'sales',
        rowId: sale.id,
        operation: 'create',
        payload: JSON.stringify(sale)
      });

      geminiAgent.invalidateCache(saleTenantId);
      
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid sale data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create sale" });
      }
    }
  });

  app.get("/api/sales/today", async (req, res) => {
    try {
      const todaysSales = await storage.getTodaysSales();
      res.json({ total: todaysSales });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's sales" });
    }
  });

  // Stock bulk insert endpoint for OCR processing
  app.post('/api/stock/bulk', async (req, res) => {
    try {
      console.log('[STOCK-BULK] Processing bulk stock insert');
      console.log('[STOCK-BULK] Request body:', JSON.stringify(req.body, null, 2));
      
      const items = req.body.items as Array<{
        name: string;
        batch: string;
        qty: number;
        exp: string;
        mrp: number;
      }>;
      
      const { billNumber, date, tenantId: requestTenantId } = req.body;
      const tenantId = requestTenantId ?? 'default';
      
      if (!items || !Array.isArray(items)) {
        throw new Error('Items array is required');
      }
      
      // Log duplicate check info (actual duplicate prevention done on frontend with document storage)
      if (billNumber && date) {
        console.log(`[STOCK-BULK] Processing invoice: ${billNumber} dated ${date}`);
      }
      
      console.log('[STOCK-BULK] Items to process:', items.length);
      
      for (const item of items) {
        // Find or create product
        const products = await storage.getProducts();
        let product = products.find(p => p.name === item.name);
        
        if (!product) {
          const productData = {
            name: item.name,
            description: `Added from OCR scan`,
            price: item.mrp,
            tenantId
          };
          
          product = await storage.createProduct(productData);
          console.log('[STOCK-BULK] Created new product:', product.name);
        }

        // Create stock entry
        const stockData = {
          productId: product.id,
          productName: product.name,
          batchNumber: item.batch,
          quantity: item.qty,
          expiryDate: new Date(item.exp),
          tenantId: product.tenantId ?? tenantId
        };

        await storage.createStock(stockData);
        console.log('[STOCK-BULK] Added stock:', item.name, 'qty:', item.qty);
      }
      
      console.log('[STOCK-BULK] Completed successfully - items processed:', items.length);
      res.status(201).json({ 
        success: true, 
        itemsProcessed: items.length,
        message: `${items.length} items added to stock from OCR scan`
      });
      
    } catch (error) {
      console.error('[STOCK-BULK] Error:', error);
      res.status(500).json({ error: 'Failed to process bulk stock insert' });
    }
  });

  // Captures API
  app.post("/api/captures", async (req, res) => {
    try {
      console.log('[API] Creating capture with data:', req.body);
      
      // Basic capture logging (storage method will be added later)
      const captureData = {
        id: `capture-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      console.log('[API] Capture logged successfully:', captureData.id);
      res.status(201).json(captureData);
    } catch (error) {
      console.error('[API ERROR] Failed to create capture:', error);
      res.status(500).json({ error: "Failed to create capture" });
    }
  });

  app.get("/api/captures", async (req, res) => {
    try {
      console.log('[API] Fetching captures...');
      res.json([]);
    } catch (error) {
      console.error('[API ERROR] Failed to fetch captures:', error);
      res.status(500).json({ error: "Failed to fetch captures" });
    }
  });

  // Sync routes
  app.post("/api/sync/batch", async (req, res) => {
    try {
      const unsyncedItems = await storage.getUnsyncedOutboxItems();
      
      // Process each unsynced item idempotently
      for (const item of unsyncedItems) {
        // Mark as synced (in real implementation, this would sync to remote)
        await storage.markOutboxItemSynced(item.id);
      }
      
      res.json({ 
        processed: unsyncedItems.length,
        message: "Batch sync completed successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process sync batch" });
    }
  });

  app.get("/api/sync/status", async (req, res) => {
    try {
      const unsyncedItems = await storage.getUnsyncedOutboxItems();
      res.json({
        pendingItems: unsyncedItems.length,
        lastSync: new Date().toISOString(),
        online: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get sync status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
