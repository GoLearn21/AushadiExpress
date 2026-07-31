import { Router } from 'express';
import { db } from '../db';
import {
  wholesalerProducts,
  quoteRequests,
  quoteRequestItems,
  quotes,
  quoteItems,
  wholesalerOrders,
  wholesalerOrderItems,
  wholesalerOrderEvents,
  users
} from '../../shared/schema';
import { eq, and, desc, count, sql, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Middleware to check if user is a wholesaler
const requireWholesaler = async (req: any, res: any, next: any) => {
  const session = req.session;
  if (!session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user[0] || user[0].role !== 'wholesaler') {
    return res.status(403).json({ error: 'Access denied. Wholesaler role required.' });
  }

  req.user = user[0];
  next();
};

// ==========================================
// DASHBOARD / STATS
// ==========================================

router.get('/stats', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Get total products count
    const productsResult = await db
      .select({ count: count() })
      .from(wholesalerProducts)
      .where(eq(wholesalerProducts.wholesalerTenantId, tenantId));

    // Get pending quotes count
    const pendingQuotesResult = await db
      .select({ count: count() })
      .from(quoteRequests)
      .where(and(
        eq(quoteRequests.wholesalerTenantId, tenantId),
        eq(quoteRequests.status, 'pending')
      ));

    // Get active orders count
    const activeOrdersResult = await db
      .select({ count: count() })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        sql`${wholesalerOrders.status} IN ('confirmed', 'processing', 'shipped')`
      ));

    // Get this month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${wholesalerOrders.totalAmount}), 0)` })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        eq(wholesalerOrders.status, 'delivered'),
        gte(wholesalerOrders.createdAt, startOfMonth)
      ));

    // Get unique retailers count
    const retailersResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${wholesalerOrders.retailerTenantId})` })
      .from(wholesalerOrders)
      .where(eq(wholesalerOrders.wholesalerTenantId, tenantId));

    // Get quotes this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const quotesThisWeekResult = await db
      .select({ count: count() })
      .from(quoteRequests)
      .where(and(
        eq(quoteRequests.wholesalerTenantId, tenantId),
        gte(quoteRequests.createdAt, startOfWeek)
      ));

    // Get low stock items (stock below reorder level or below 10 if reorder level not set)
    const lowStockItems = await db
      .select({
        id: wholesalerProducts.id,
        name: wholesalerProducts.name,
        manufacturer: wholesalerProducts.manufacturer,
        stockQuantity: wholesalerProducts.stockQuantity,
        reorderLevel: wholesalerProducts.reorderLevel,
      })
      .from(wholesalerProducts)
      .where(and(
        eq(wholesalerProducts.wholesalerTenantId, tenantId),
        eq(wholesalerProducts.isActive, true),
        sql`${wholesalerProducts.stockQuantity} <= COALESCE(${wholesalerProducts.reorderLevel}, 10)`
      ))
      .orderBy(wholesalerProducts.stockQuantity)
      .limit(10);

    // Get items expiring within 90 days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const expiringItems = await db
      .select({
        id: wholesalerProducts.id,
        name: wholesalerProducts.name,
        manufacturer: wholesalerProducts.manufacturer,
        batchNumber: wholesalerProducts.batchNumber,
        expiryDate: wholesalerProducts.expiryDate,
        stockQuantity: wholesalerProducts.stockQuantity,
      })
      .from(wholesalerProducts)
      .where(and(
        eq(wholesalerProducts.wholesalerTenantId, tenantId),
        eq(wholesalerProducts.isActive, true),
        sql`${wholesalerProducts.expiryDate} IS NOT NULL`,
        lte(wholesalerProducts.expiryDate, ninetyDaysFromNow)
      ))
      .orderBy(wholesalerProducts.expiryDate)
      .limit(10);

    res.json({
      totalProducts: productsResult[0]?.count || 0,
      pendingQuotes: pendingQuotesResult[0]?.count || 0,
      activeOrders: activeOrdersResult[0]?.count || 0,
      totalRevenue: revenueResult[0]?.total || 0,
      totalRetailers: retailersResult[0]?.count || 0,
      quotesThisWeek: quotesThisWeekResult[0]?.count || 0,
      lowStockItems,
      expiringItems,
      lowStockCount: lowStockItems.length,
      expiringCount: expiringItems.length,
    });
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ==========================================
// PRODUCTS
// ==========================================

// Get all products for wholesaler
router.get('/products', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const products = await db
      .select()
      .from(wholesalerProducts)
      .where(eq(wholesalerProducts.wholesalerTenantId, tenantId))
      .orderBy(desc(wholesalerProducts.createdAt));

    res.json(products);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create a new product
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().optional(),
  packSize: z.string().optional(),
  minOrderQuantity: z.number().int().min(1).default(1),
  maxOrderQuantity: z.number().int().optional(),
  basePrice: z.number().positive(),
  mrp: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  hsnCode: z.string().optional(),
  gstPercentage: z.number().default(12),
});

router.post('/products', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const data = createProductSchema.parse(req.body);

    const [product] = await db
      .insert(wholesalerProducts)
      .values({
        wholesalerTenantId: tenantId,
        ...data,
      })
      .returning();

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[WHOLESALER] Failed to create product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.patch('/products/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const data = createProductSchema.partial().parse(req.body);

    const [product] = await db
      .update(wholesalerProducts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(wholesalerProducts.id, id),
        eq(wholesalerProducts.wholesalerTenantId, tenantId)
      ))
      .returning();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[WHOLESALER] Failed to update product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/products/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [deleted] = await db
      .delete(wholesalerProducts)
      .where(and(
        eq(wholesalerProducts.id, id),
        eq(wholesalerProducts.wholesalerTenantId, tenantId)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[WHOLESALER] Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==========================================
// QUOTES
// ==========================================

// Get all quote requests for wholesaler
router.get('/quotes', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const quoteReqs = await db
      .select({
        id: quoteRequests.id,
        retailerTenantId: quoteRequests.retailerTenantId,
        status: quoteRequests.status,
        totalItems: quoteRequests.totalItems,
        notes: quoteRequests.notes,
        validUntil: quoteRequests.validUntil,
        createdAt: quoteRequests.createdAt,
        retailerName: users.username,
        retailerPhone: users.contactPhone,
      })
      .from(quoteRequests)
      .leftJoin(users, eq(quoteRequests.retailerId, users.id))
      .where(eq(quoteRequests.wholesalerTenantId, tenantId))
      .orderBy(desc(quoteRequests.createdAt));

    // Get items for each quote request
    const result = await Promise.all(quoteReqs.map(async (qr) => {
      const items = await db
        .select()
        .from(quoteRequestItems)
        .where(eq(quoteRequestItems.quoteRequestId, qr.id));

      // Calculate estimate based on items
      let totalEstimate = 0;
      for (const item of items) {
        if (item.productId) {
          const [product] = await db
            .select()
            .from(wholesalerProducts)
            .where(eq(wholesalerProducts.id, item.productId));
          if (product) {
            totalEstimate += product.basePrice * item.requestedQuantity;
          }
        }
      }

      return {
        ...qr,
        itemCount: items.length,
        totalEstimate,
        items: items.map(i => ({
          productName: i.productName,
          quantity: i.requestedQuantity,
        })),
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get a single quote request with details
router.get('/quotes/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [quoteReq] = await db
      .select({
        id: quoteRequests.id,
        retailerTenantId: quoteRequests.retailerTenantId,
        status: quoteRequests.status,
        totalItems: quoteRequests.totalItems,
        notes: quoteRequests.notes,
        validUntil: quoteRequests.validUntil,
        createdAt: quoteRequests.createdAt,
        retailerName: users.username,
        retailerPhone: users.contactPhone,
        retailerAddress: users.businessAddress,
      })
      .from(quoteRequests)
      .leftJoin(users, eq(quoteRequests.retailerId, users.id))
      .where(and(
        eq(quoteRequests.id, id),
        eq(quoteRequests.wholesalerTenantId, tenantId)
      ));

    if (!quoteReq) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    const items = await db
      .select()
      .from(quoteRequestItems)
      .where(eq(quoteRequestItems.quoteRequestId, id));

    res.json({ ...quoteReq, items });
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Send a quote in response to a quote request
const sendQuoteSchema = z.object({
  quoteRequestId: z.string(),
  items: z.array(z.object({
    quoteRequestItemId: z.string().optional(),
    productId: z.string().optional(),
    productName: z.string(),
    manufacturer: z.string().optional(),
    packSize: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    gstPercentage: z.number().default(12),
    isAvailable: z.boolean().default(true),
    notes: z.string().optional(),
  })),
  validDays: z.number().int().positive().default(7),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  discountAmount: z.number().default(0),
});

router.post('/quotes/send', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const data = sendQuoteSchema.parse(req.body);

    // Verify quote request exists and belongs to this wholesaler
    const [quoteReq] = await db
      .select()
      .from(quoteRequests)
      .where(and(
        eq(quoteRequests.id, data.quoteRequestId),
        eq(quoteRequests.wholesalerTenantId, tenantId)
      ));

    if (!quoteReq) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    // Calculate totals
    let subtotal = 0;
    let gstAmount = 0;

    const quoteItemsData = data.items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemGst = itemTotal * (item.gstPercentage / 100);
      subtotal += itemTotal;
      gstAmount += itemGst;

      return {
        ...item,
        totalPrice: itemTotal + itemGst,
      };
    });

    const totalAmount = subtotal + gstAmount - data.discountAmount;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + data.validDays);

    // Create quote
    const [quote] = await db
      .insert(quotes)
      .values({
        quoteRequestId: data.quoteRequestId,
        wholesalerTenantId: tenantId,
        retailerTenantId: quoteReq.retailerTenantId,
        subtotal,
        gstAmount,
        discountAmount: data.discountAmount,
        totalAmount,
        validUntil,
        paymentTerms: data.paymentTerms,
        deliveryTerms: data.deliveryTerms,
        notes: data.notes,
      })
      .returning();

    // Create quote items
    await db.insert(quoteItems).values(
      quoteItemsData.map(item => ({
        quoteId: quote.id,
        quoteRequestItemId: item.quoteRequestItemId,
        productId: item.productId,
        productName: item.productName,
        manufacturer: item.manufacturer,
        packSize: item.packSize,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstPercentage: item.gstPercentage,
        totalPrice: item.totalPrice,
        isAvailable: item.isAvailable,
        notes: item.notes,
      }))
    );

    // Update quote request status
    await db
      .update(quoteRequests)
      .set({ status: 'quoted', updatedAt: new Date() })
      .where(eq(quoteRequests.id, data.quoteRequestId));

    res.status(201).json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[WHOLESALER] Failed to send quote:', error);
    res.status(500).json({ error: 'Failed to send quote' });
  }
});

// Reject a quote request
router.post('/quotes/:id/reject', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [updated] = await db
      .update(quoteRequests)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(and(
        eq(quoteRequests.id, id),
        eq(quoteRequests.wholesalerTenantId, tenantId)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[WHOLESALER] Failed to reject quote:', error);
    res.status(500).json({ error: 'Failed to reject quote' });
  }
});

// ==========================================
// ORDERS
// ==========================================

// Get all orders for wholesaler
router.get('/orders', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const orders = await db
      .select({
        id: wholesalerOrders.id,
        orderNumber: wholesalerOrders.orderNumber,
        retailerTenantId: wholesalerOrders.retailerTenantId,
        status: wholesalerOrders.status,
        paymentStatus: wholesalerOrders.paymentStatus,
        totalAmount: wholesalerOrders.totalAmount,
        createdAt: wholesalerOrders.createdAt,
        expectedDeliveryDate: wholesalerOrders.expectedDeliveryDate,
        retailerName: users.username,
        retailerPhone: users.contactPhone,
        retailerAddress: users.businessAddress,
      })
      .from(wholesalerOrders)
      .leftJoin(users, eq(wholesalerOrders.retailerId, users.id))
      .where(eq(wholesalerOrders.wholesalerTenantId, tenantId))
      .orderBy(desc(wholesalerOrders.createdAt));

    // Get item count for each order
    const result = await Promise.all(orders.map(async (order) => {
      const items = await db
        .select({ count: count() })
        .from(wholesalerOrderItems)
        .where(eq(wholesalerOrderItems.orderId, order.id));

      return {
        ...order,
        itemCount: items[0]?.count || 0,
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a single order with details
router.get('/orders/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [order] = await db
      .select({
        id: wholesalerOrders.id,
        orderNumber: wholesalerOrders.orderNumber,
        retailerTenantId: wholesalerOrders.retailerTenantId,
        status: wholesalerOrders.status,
        paymentStatus: wholesalerOrders.paymentStatus,
        subtotal: wholesalerOrders.subtotal,
        gstAmount: wholesalerOrders.gstAmount,
        discountAmount: wholesalerOrders.discountAmount,
        shippingAmount: wholesalerOrders.shippingAmount,
        totalAmount: wholesalerOrders.totalAmount,
        paymentTerms: wholesalerOrders.paymentTerms,
        deliveryAddress: wholesalerOrders.deliveryAddress,
        expectedDeliveryDate: wholesalerOrders.expectedDeliveryDate,
        trackingNumber: wholesalerOrders.trackingNumber,
        notes: wholesalerOrders.notes,
        createdAt: wholesalerOrders.createdAt,
        retailerName: users.username,
        retailerPhone: users.contactPhone,
      })
      .from(wholesalerOrders)
      .leftJoin(users, eq(wholesalerOrders.retailerId, users.id))
      .where(and(
        eq(wholesalerOrders.id, id),
        eq(wholesalerOrders.wholesalerTenantId, tenantId)
      ));

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db
      .select()
      .from(wholesalerOrderItems)
      .where(eq(wholesalerOrderItems.orderId, id));

    const events = await db
      .select()
      .from(wholesalerOrderEvents)
      .where(eq(wholesalerOrderEvents.orderId, id))
      .orderBy(desc(wholesalerOrderEvents.createdAt));

    res.json({ ...order, items, events });
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

router.patch('/orders/:id/status', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { id } = req.params;
    const data = updateOrderStatusSchema.parse(req.body);

    const updateData: any = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.trackingNumber) {
      updateData.trackingNumber = data.trackingNumber;
    }

    if (data.status === 'delivered') {
      updateData.actualDeliveryDate = new Date();
    }

    const [order] = await db
      .update(wholesalerOrders)
      .set(updateData)
      .where(and(
        eq(wholesalerOrders.id, id),
        eq(wholesalerOrders.wholesalerTenantId, tenantId)
      ))
      .returning();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Log event
    await db.insert(wholesalerOrderEvents).values({
      orderId: id,
      eventType: data.status,
      actorId: userId,
      actorRole: 'wholesaler',
      metadata: data.notes ? { notes: data.notes } : null,
    });

    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[WHOLESALER] Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==========================================
// INVOICE PROCESSING (AI)
// ==========================================

// Process invoice image to update inventory
router.post('/invoices/process', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock data for demo purposes
      console.log('[WHOLESALER] No OpenAI key configured, returning mock response');

      // Add some sample products for demo
      const sampleProducts = [
        { name: 'Paracetamol 500mg', manufacturer: 'Cipla', packSize: '10 tablets', basePrice: 25, mrp: 35, stockQuantity: 100 },
        { name: 'Amoxicillin 250mg', manufacturer: 'Sun Pharma', packSize: '10 capsules', basePrice: 85, mrp: 120, stockQuantity: 50 },
        { name: 'Omeprazole 20mg', manufacturer: 'Dr Reddy\'s', packSize: '10 capsules', basePrice: 45, mrp: 65, stockQuantity: 75 },
      ];

      let addedCount = 0;
      for (const product of sampleProducts) {
        // Check if product already exists
        const existing = await db
          .select()
          .from(wholesalerProducts)
          .where(and(
            eq(wholesalerProducts.wholesalerTenantId, tenantId),
            eq(wholesalerProducts.name, product.name)
          ))
          .limit(1);

        if (existing.length > 0) {
          // Update stock quantity
          await db
            .update(wholesalerProducts)
            .set({
              stockQuantity: sql`${wholesalerProducts.stockQuantity} + ${product.stockQuantity}`,
              updatedAt: new Date()
            })
            .where(eq(wholesalerProducts.id, existing[0].id));
        } else {
          // Add new product
          await db
            .insert(wholesalerProducts)
            .values({
              wholesalerTenantId: tenantId,
              ...product,
              minOrderQuantity: 1,
              isActive: true,
              gstPercentage: 12,
            });
          addedCount++;
        }
      }

      return res.json({
        success: true,
        message: 'Invoice processed successfully (demo mode)',
        itemCount: sampleProducts.length,
        newProducts: addedCount,
        updatedProducts: sampleProducts.length - addedCount,
      });
    }

    // Use OpenAI Vision API to extract product data from invoice
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting product information from pharmaceutical purchase invoices.
Extract the following details for each product:
- name (medicine name with strength)
- manufacturer (company name)
- packSize (e.g., "10 tablets", "100ml")
- basePrice (cost price per unit/pack)
- mrp (maximum retail price)
- quantity (number of units received)
- hsnCode (if visible)
- gstPercentage (if visible, default to 12)

Return the data as a JSON array of products. Only include products that are clearly visible and readable.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all product details from this pharmaceutical purchase invoice:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      console.error('[WHOLESALER] OpenAI API error:', await response.text());
      throw new Error('Failed to process invoice with AI');
    }

    const aiResult = await response.json();
    const content = aiResult.choices[0]?.message?.content;

    // Extract JSON from response
    let products = [];
    try {
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[WHOLESALER] Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse invoice data' });
    }

    // Process each product
    let addedCount = 0;
    let updatedCount = 0;

    for (const product of products) {
      // Validate required fields
      if (!product.name || !product.basePrice) {
        continue;
      }

      // Check if product already exists
      const existing = await db
        .select()
        .from(wholesalerProducts)
        .where(and(
          eq(wholesalerProducts.wholesalerTenantId, tenantId),
          eq(wholesalerProducts.name, product.name)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing product's stock
        await db
          .update(wholesalerProducts)
          .set({
            stockQuantity: sql`${wholesalerProducts.stockQuantity} + ${product.quantity || 0}`,
            basePrice: product.basePrice,
            mrp: product.mrp || product.basePrice * 1.4,
            updatedAt: new Date()
          })
          .where(eq(wholesalerProducts.id, existing[0].id));
        updatedCount++;
      } else {
        // Add new product
        await db
          .insert(wholesalerProducts)
          .values({
            wholesalerTenantId: tenantId,
            name: product.name,
            manufacturer: product.manufacturer || '',
            packSize: product.packSize || '',
            basePrice: product.basePrice,
            mrp: product.mrp || product.basePrice * 1.4,
            stockQuantity: product.quantity || 0,
            minOrderQuantity: 1,
            isActive: true,
            hsnCode: product.hsnCode || '',
            gstPercentage: product.gstPercentage || 12,
          });
        addedCount++;
      }
    }

    res.json({
      success: true,
      message: 'Invoice processed successfully',
      itemCount: products.length,
      newProducts: addedCount,
      updatedProducts: updatedCount,
    });
  } catch (error) {
    console.error('[WHOLESALER] Failed to process invoice:', error);
    res.status(500).json({ error: 'Failed to process invoice' });
  }
});

// ==========================================
// ANALYTICS
// ==========================================

router.get('/analytics', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const period = req.query.period || 'month';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
    }

    // Current period revenue
    const currentRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${wholesalerOrders.totalAmount}), 0)` })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        eq(wholesalerOrders.status, 'delivered'),
        gte(wholesalerOrders.createdAt, startDate)
      ));

    // Previous period revenue for comparison
    const previousRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${wholesalerOrders.totalAmount}), 0)` })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        eq(wholesalerOrders.status, 'delivered'),
        gte(wholesalerOrders.createdAt, previousStartDate),
        lte(wholesalerOrders.createdAt, startDate)
      ));

    // Current period orders
    const currentOrdersResult = await db
      .select({ count: count() })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        gte(wholesalerOrders.createdAt, startDate)
      ));

    // Previous period orders
    const previousOrdersResult = await db
      .select({ count: count() })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        gte(wholesalerOrders.createdAt, previousStartDate),
        lte(wholesalerOrders.createdAt, startDate)
      ));

    // Unique retailers current period
    const currentRetailersResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${wholesalerOrders.retailerTenantId})` })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        gte(wholesalerOrders.createdAt, startDate)
      ));

    // Previous period retailers
    const previousRetailersResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${wholesalerOrders.retailerTenantId})` })
      .from(wholesalerOrders)
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        gte(wholesalerOrders.createdAt, previousStartDate),
        lte(wholesalerOrders.createdAt, startDate)
      ));

    // Calculate percentage changes
    const currentRevenue = currentRevenueResult[0]?.total || 0;
    const previousRevenue = previousRevenueResult[0]?.total || 0;
    const revenueChange = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    const currentOrders = currentOrdersResult[0]?.count || 0;
    const previousOrders = previousOrdersResult[0]?.count || 0;
    const ordersChange = previousOrders > 0
      ? Math.round(((currentOrders - previousOrders) / previousOrders) * 100)
      : 0;

    const currentRetailers = currentRetailersResult[0]?.count || 0;
    const previousRetailers = previousRetailersResult[0]?.count || 0;
    const retailersChange = previousRetailers > 0
      ? Math.round(((currentRetailers - previousRetailers) / previousRetailers) * 100)
      : 0;

    // Average order value
    const averageOrderValue = currentOrders > 0 ? Math.round(currentRevenue / currentOrders) : 0;
    const previousAOV = previousOrders > 0 ? Math.round(previousRevenue / previousOrders) : 0;
    const aovChange = previousAOV > 0
      ? Math.round(((averageOrderValue - previousAOV) / previousAOV) * 100)
      : 0;

    // Top products (by revenue)
    const topProductsResult = await db
      .select({
        name: wholesalerOrderItems.productName,
        quantity: sql<number>`SUM(${wholesalerOrderItems.quantity})`,
        revenue: sql<number>`SUM(${wholesalerOrderItems.totalPrice})`,
      })
      .from(wholesalerOrderItems)
      .innerJoin(wholesalerOrders, eq(wholesalerOrderItems.orderId, wholesalerOrders.id))
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        eq(wholesalerOrders.status, 'delivered'),
        gte(wholesalerOrders.createdAt, startDate)
      ))
      .groupBy(wholesalerOrderItems.productName)
      .orderBy(sql`SUM(${wholesalerOrderItems.totalPrice}) DESC`)
      .limit(5);

    // Top retailers (by revenue)
    const topRetailersResult = await db
      .select({
        name: users.username,
        orders: count(),
        revenue: sql<number>`SUM(${wholesalerOrders.totalAmount})`,
      })
      .from(wholesalerOrders)
      .innerJoin(users, eq(wholesalerOrders.retailerId, users.id))
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        eq(wholesalerOrders.status, 'delivered'),
        gte(wholesalerOrders.createdAt, startDate)
      ))
      .groupBy(users.username)
      .orderBy(sql`SUM(${wholesalerOrders.totalAmount}) DESC`)
      .limit(5);

    res.json({
      totalRevenue: currentRevenue,
      revenueChange,
      totalOrders: currentOrders,
      ordersChange,
      totalRetailers: currentRetailers,
      retailersChange,
      averageOrderValue,
      aovChange,
      topProducts: topProductsResult,
      topRetailers: topRetailersResult,
      monthlyRevenue: [], // Can add monthly breakdown if needed
    });
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
