import { Router } from 'express';
import { db } from '../db';
import {
  users,
  wholesalerProducts,
  quoteRequests,
  quoteRequestItems,
  quotes,
  quoteItems,
  wholesalerOrders,
  wholesalerOrderItems,
  wholesalerOrderEvents,
  retailerWholesalerConnections
} from '../../shared/schema';
import { eq, and, desc, ilike, or, count, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Middleware to check if user is a retailer
const requireRetailer = async (req: any, res: any, next: any) => {
  const session = req.session;
  if (!session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user[0] || user[0].role !== 'retailer') {
    return res.status(403).json({ error: 'Access denied. Retailer role required.' });
  }

  req.user = user[0];
  next();
};

// ==========================================
// BROWSE WHOLESALERS
// ==========================================

// Get all wholesalers
router.get('/wholesalers', requireRetailer, async (req: any, res) => {
  try {
    const search = req.query.search as string || '';

    let query = db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        name: users.username,
        businessAddress: users.businessAddress,
        contactPhone: users.contactPhone,
        gstNumber: users.gstNumber,
      })
      .from(users)
      .where(eq(users.role, 'wholesaler'));

    if (search) {
      query = query.where(and(
        eq(users.role, 'wholesaler'),
        or(
          ilike(users.username, `%${search}%`),
          ilike(users.businessAddress, `%${search}%`)
        )
      ));
    }

    const wholesalers = await query.orderBy(users.username);

    // Get product counts for each wholesaler
    const result = await Promise.all(wholesalers.map(async (w) => {
      const productCount = await db
        .select({ count: count() })
        .from(wholesalerProducts)
        .where(and(
          eq(wholesalerProducts.wholesalerTenantId, w.tenantId),
          eq(wholesalerProducts.isActive, true)
        ));

      return {
        ...w,
        productCount: productCount[0]?.count || 0,
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('[RETAILER] Failed to fetch wholesalers:', error);
    res.status(500).json({ error: 'Failed to fetch wholesalers' });
  }
});

// Get a single wholesaler with their catalog
router.get('/wholesalers/:tenantId', requireRetailer, async (req: any, res) => {
  try {
    const { tenantId } = req.params;

    const [wholesaler] = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        name: users.username,
        businessAddress: users.businessAddress,
        contactPhone: users.contactPhone,
        gstNumber: users.gstNumber,
      })
      .from(users)
      .where(and(
        eq(users.tenantId, tenantId),
        eq(users.role, 'wholesaler')
      ));

    if (!wholesaler) {
      return res.status(404).json({ error: 'Wholesaler not found' });
    }

    // Get their active products
    const products = await db
      .select()
      .from(wholesalerProducts)
      .where(and(
        eq(wholesalerProducts.wholesalerTenantId, tenantId),
        eq(wholesalerProducts.isActive, true)
      ))
      .orderBy(wholesalerProducts.name);

    res.json({ ...wholesaler, products });
  } catch (error) {
    console.error('[RETAILER] Failed to fetch wholesaler:', error);
    res.status(500).json({ error: 'Failed to fetch wholesaler' });
  }
});

// ==========================================
// QUOTE REQUESTS
// ==========================================

// Get retailer's quote requests
router.get('/my-quote-requests', requireRetailer, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const requests = await db
      .select({
        id: quoteRequests.id,
        wholesalerTenantId: quoteRequests.wholesalerTenantId,
        status: quoteRequests.status,
        totalItems: quoteRequests.totalItems,
        notes: quoteRequests.notes,
        createdAt: quoteRequests.createdAt,
        wholesalerName: users.username,
        wholesalerPhone: users.contactPhone,
      })
      .from(quoteRequests)
      .leftJoin(users, eq(quoteRequests.wholesalerId, users.id))
      .where(eq(quoteRequests.retailerTenantId, tenantId))
      .orderBy(desc(quoteRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error('[RETAILER] Failed to fetch quote requests:', error);
    res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

// Create a quote request
const createQuoteRequestSchema = z.object({
  wholesalerTenantId: z.string(),
  items: z.array(z.object({
    productId: z.string().optional(),
    productName: z.string(),
    requestedQuantity: z.number().int().positive(),
    preferredManufacturer: z.string().optional(),
    notes: z.string().optional(),
  })),
  notes: z.string().optional(),
});

router.post('/quote-requests', requireRetailer, async (req: any, res) => {
  try {
    const retailerTenantId = req.user.tenantId;
    const retailerId = req.user.id;
    const data = createQuoteRequestSchema.parse(req.body);

    // Find the wholesaler user
    const [wholesaler] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.tenantId, data.wholesalerTenantId),
        eq(users.role, 'wholesaler')
      ));

    if (!wholesaler) {
      return res.status(404).json({ error: 'Wholesaler not found' });
    }

    // Create quote request
    const [quoteRequest] = await db
      .insert(quoteRequests)
      .values({
        retailerTenantId,
        retailerId,
        wholesalerTenantId: data.wholesalerTenantId,
        wholesalerId: wholesaler.id,
        totalItems: data.items.length,
        notes: data.notes,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .returning();

    // Create quote request items
    await db.insert(quoteRequestItems).values(
      data.items.map(item => ({
        quoteRequestId: quoteRequest.id,
        productId: item.productId,
        productName: item.productName,
        requestedQuantity: item.requestedQuantity,
        preferredManufacturer: item.preferredManufacturer,
        notes: item.notes,
      }))
    );

    res.status(201).json(quoteRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[RETAILER] Failed to create quote request:', error);
    res.status(500).json({ error: 'Failed to create quote request' });
  }
});

// Get quotes received for a quote request
router.get('/quote-requests/:id/quotes', requireRetailer, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    // Verify quote request belongs to retailer
    const [quoteRequest] = await db
      .select()
      .from(quoteRequests)
      .where(and(
        eq(quoteRequests.id, id),
        eq(quoteRequests.retailerTenantId, tenantId)
      ));

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    // Get quotes for this request
    const receivedQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.quoteRequestId, id))
      .orderBy(desc(quotes.createdAt));

    // Get items for each quote
    const result = await Promise.all(receivedQuotes.map(async (q) => {
      const items = await db
        .select()
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, q.id));

      return { ...q, items };
    }));

    res.json(result);
  } catch (error) {
    console.error('[RETAILER] Failed to fetch quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Accept a quote (creates an order)
router.post('/quotes/:id/accept', requireRetailer, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { id } = req.params;
    const { deliveryAddress } = req.body;

    // Verify quote belongs to retailer
    const [quote] = await db
      .select()
      .from(quotes)
      .where(and(
        eq(quotes.id, id),
        eq(quotes.retailerTenantId, tenantId)
      ));

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.status !== 'sent') {
      return res.status(400).json({ error: 'Quote has already been processed' });
    }

    // Check if quote is still valid
    if (new Date(quote.validUntil) < new Date()) {
      return res.status(400).json({ error: 'Quote has expired' });
    }

    // Get wholesaler info
    const [wholesaler] = await db
      .select()
      .from(users)
      .where(eq(users.tenantId, quote.wholesalerTenantId));

    // Get quote items
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id));

    // Generate order number
    const orderNumber = `WO-${Date.now().toString(36).toUpperCase()}`;

    // Create order
    const [order] = await db
      .insert(wholesalerOrders)
      .values({
        orderNumber,
        quoteId: id,
        retailerTenantId: tenantId,
        retailerId: userId,
        wholesalerTenantId: quote.wholesalerTenantId,
        wholesalerId: wholesaler.id,
        subtotal: quote.subtotal,
        gstAmount: quote.gstAmount,
        discountAmount: quote.discountAmount,
        totalAmount: quote.totalAmount,
        paymentTerms: quote.paymentTerms,
        deliveryAddress: deliveryAddress || req.user.businessAddress,
      })
      .returning();

    // Create order items
    await db.insert(wholesalerOrderItems).values(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        manufacturer: item.manufacturer,
        packSize: item.packSize,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstPercentage: item.gstPercentage,
        totalPrice: item.totalPrice,
      }))
    );

    // Log event
    await db.insert(wholesalerOrderEvents).values({
      orderId: order.id,
      eventType: 'created',
      actorId: userId,
      actorRole: 'retailer',
      metadata: { fromQuote: id },
    });

    // Update quote status
    await db
      .update(quotes)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(quotes.id, id));

    // Update quote request status
    await db
      .update(quoteRequests)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(quoteRequests.id, quote.quoteRequestId));

    res.status(201).json(order);
  } catch (error) {
    console.error('[RETAILER] Failed to accept quote:', error);
    res.status(500).json({ error: 'Failed to accept quote' });
  }
});

// Reject a quote
router.post('/quotes/:id/reject', requireRetailer, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [updated] = await db
      .update(quotes)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(and(
        eq(quotes.id, id),
        eq(quotes.retailerTenantId, tenantId)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[RETAILER] Failed to reject quote:', error);
    res.status(500).json({ error: 'Failed to reject quote' });
  }
});

// ==========================================
// RETAILER ORDERS (B2B)
// ==========================================

// Get retailer's B2B orders
router.get('/my-orders', requireRetailer, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const orders = await db
      .select({
        id: wholesalerOrders.id,
        orderNumber: wholesalerOrders.orderNumber,
        wholesalerTenantId: wholesalerOrders.wholesalerTenantId,
        status: wholesalerOrders.status,
        paymentStatus: wholesalerOrders.paymentStatus,
        totalAmount: wholesalerOrders.totalAmount,
        createdAt: wholesalerOrders.createdAt,
        expectedDeliveryDate: wholesalerOrders.expectedDeliveryDate,
        trackingNumber: wholesalerOrders.trackingNumber,
        wholesalerName: users.username,
        wholesalerPhone: users.contactPhone,
      })
      .from(wholesalerOrders)
      .leftJoin(users, eq(wholesalerOrders.wholesalerId, users.id))
      .where(eq(wholesalerOrders.retailerTenantId, tenantId))
      .orderBy(desc(wholesalerOrders.createdAt));

    res.json(orders);
  } catch (error) {
    console.error('[RETAILER] Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a single order with details
router.get('/my-orders/:id', requireRetailer, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [order] = await db
      .select({
        id: wholesalerOrders.id,
        orderNumber: wholesalerOrders.orderNumber,
        wholesalerTenantId: wholesalerOrders.wholesalerTenantId,
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
        actualDeliveryDate: wholesalerOrders.actualDeliveryDate,
        trackingNumber: wholesalerOrders.trackingNumber,
        notes: wholesalerOrders.notes,
        createdAt: wholesalerOrders.createdAt,
        wholesalerName: users.username,
        wholesalerPhone: users.contactPhone,
        wholesalerAddress: users.businessAddress,
      })
      .from(wholesalerOrders)
      .leftJoin(users, eq(wholesalerOrders.wholesalerId, users.id))
      .where(and(
        eq(wholesalerOrders.id, id),
        eq(wholesalerOrders.retailerTenantId, tenantId)
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
    console.error('[RETAILER] Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
