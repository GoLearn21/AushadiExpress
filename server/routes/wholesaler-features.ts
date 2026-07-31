import { Router } from 'express';
import { db } from '../db';
import {
  wholesalerProducts,
  wholesalerPriceTiers,
  wholesalerTierPricing,
  retailerPriceTierAssignments,
  retailerCreditAccounts,
  creditTransactions,
  deliveryRoutes,
  deliverySchedules,
  deliveryScheduleOrders,
  wholesalerOrders,
  users
} from '../../shared/schema';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
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
// BULK PRODUCT IMPORT
// ==========================================

router.post('/products/bulk-import', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { products: productList } = req.body;

    if (!Array.isArray(productList) || productList.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const product of productList) {
      try {
        await db.insert(wholesalerProducts).values({
          wholesalerTenantId: tenantId,
          name: product.name,
          description: product.description || null,
          manufacturer: product.manufacturer || null,
          category: product.category || null,
          packSize: product.packSize || null,
          minOrderQuantity: product.minOrderQuantity || 1,
          maxOrderQuantity: product.maxOrderQuantity || null,
          basePrice: parseFloat(product.basePrice) || 0,
          mrp: product.mrp ? parseFloat(product.mrp) : null,
          stockQuantity: parseInt(product.stockQuantity) || 0,
          reorderLevel: product.reorderLevel ? parseInt(product.reorderLevel) : 10,
          batchNumber: product.batchNumber || null,
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
          hsnCode: product.hsnCode || null,
          gstPercentage: product.gstPercentage ? parseFloat(product.gstPercentage) : 12,
          isActive: true
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${results.success + results.failed}: ${error.message}`);
      }
    }

    res.json({
      message: `Imported ${results.success} products, ${results.failed} failed`,
      ...results
    });
  } catch (error) {
    console.error('[WHOLESALER] Bulk import failed:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

// ==========================================
// PRICE TIERS
// ==========================================

// Get all price tiers
router.get('/price-tiers', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const tiers = await db
      .select()
      .from(wholesalerPriceTiers)
      .where(eq(wholesalerPriceTiers.wholesalerTenantId, tenantId))
      .orderBy(desc(wholesalerPriceTiers.discountPercentage));

    res.json(tiers);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch price tiers:', error);
    res.status(500).json({ error: 'Failed to fetch price tiers' });
  }
});

// Create price tier
router.post('/price-tiers', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, description, discountPercentage, minOrderValue, creditDays, isDefault } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tier name is required' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(wholesalerPriceTiers)
        .set({ isDefault: false })
        .where(eq(wholesalerPriceTiers.wholesalerTenantId, tenantId));
    }

    const [tier] = await db.insert(wholesalerPriceTiers).values({
      wholesalerTenantId: tenantId,
      name,
      description,
      discountPercentage: discountPercentage || 0,
      minOrderValue: minOrderValue || 0,
      creditDays: creditDays || 0,
      isDefault: isDefault || false
    }).returning();

    res.json(tier);
  } catch (error) {
    console.error('[WHOLESALER] Failed to create price tier:', error);
    res.status(500).json({ error: 'Failed to create price tier' });
  }
});

// Update price tier
router.put('/price-tiers/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { name, description, discountPercentage, minOrderValue, creditDays, isDefault } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(wholesalerPriceTiers)
        .set({ isDefault: false })
        .where(eq(wholesalerPriceTiers.wholesalerTenantId, tenantId));
    }

    const [tier] = await db
      .update(wholesalerPriceTiers)
      .set({
        name,
        description,
        discountPercentage,
        minOrderValue,
        creditDays,
        isDefault,
        updatedAt: new Date()
      })
      .where(and(
        eq(wholesalerPriceTiers.id, id),
        eq(wholesalerPriceTiers.wholesalerTenantId, tenantId)
      ))
      .returning();

    res.json(tier);
  } catch (error) {
    console.error('[WHOLESALER] Failed to update price tier:', error);
    res.status(500).json({ error: 'Failed to update price tier' });
  }
});

// Delete price tier
router.delete('/price-tiers/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    await db
      .delete(wholesalerPriceTiers)
      .where(and(
        eq(wholesalerPriceTiers.id, id),
        eq(wholesalerPriceTiers.wholesalerTenantId, tenantId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('[WHOLESALER] Failed to delete price tier:', error);
    res.status(500).json({ error: 'Failed to delete price tier' });
  }
});

// Assign retailer to tier
router.post('/price-tiers/:tierId/assign', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { tierId } = req.params;
    const { retailerId, retailerTenantId } = req.body;

    // Remove existing assignment
    await db
      .delete(retailerPriceTierAssignments)
      .where(and(
        eq(retailerPriceTierAssignments.wholesalerTenantId, tenantId),
        eq(retailerPriceTierAssignments.retailerTenantId, retailerTenantId)
      ));

    // Create new assignment
    const [assignment] = await db.insert(retailerPriceTierAssignments).values({
      wholesalerTenantId: tenantId,
      retailerTenantId,
      retailerId,
      tierId
    }).returning();

    res.json(assignment);
  } catch (error) {
    console.error('[WHOLESALER] Failed to assign retailer to tier:', error);
    res.status(500).json({ error: 'Failed to assign retailer to tier' });
  }
});

// ==========================================
// CREDIT MANAGEMENT
// ==========================================

// Get all credit accounts
router.get('/credit-accounts', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const accounts = await db
      .select({
        account: retailerCreditAccounts,
        retailer: {
          id: users.id,
          username: users.username,
          pharmacyName: users.pharmacyName
        }
      })
      .from(retailerCreditAccounts)
      .leftJoin(users, eq(retailerCreditAccounts.retailerId, users.id))
      .where(eq(retailerCreditAccounts.wholesalerTenantId, tenantId))
      .orderBy(desc(retailerCreditAccounts.currentBalance));

    res.json(accounts);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch credit accounts:', error);
    res.status(500).json({ error: 'Failed to fetch credit accounts' });
  }
});

// Get credit account details
router.get('/credit-accounts/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const [account] = await db
      .select()
      .from(retailerCreditAccounts)
      .where(and(
        eq(retailerCreditAccounts.id, id),
        eq(retailerCreditAccounts.wholesalerTenantId, tenantId)
      ));

    if (!account) {
      return res.status(404).json({ error: 'Credit account not found' });
    }

    // Get recent transactions
    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.creditAccountId, id))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50);

    res.json({ account, transactions });
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch credit account:', error);
    res.status(500).json({ error: 'Failed to fetch credit account' });
  }
});

// Create or update credit account for a retailer
router.post('/credit-accounts', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { retailerId, retailerTenantId, creditLimit, creditDays } = req.body;

    if (!retailerId || !retailerTenantId) {
      return res.status(400).json({ error: 'Retailer information is required' });
    }

    // Check if account already exists
    const [existing] = await db
      .select()
      .from(retailerCreditAccounts)
      .where(and(
        eq(retailerCreditAccounts.wholesalerTenantId, tenantId),
        eq(retailerCreditAccounts.retailerTenantId, retailerTenantId)
      ));

    if (existing) {
      // Update existing
      const [account] = await db
        .update(retailerCreditAccounts)
        .set({
          creditLimit: creditLimit || existing.creditLimit,
          creditDays: creditDays || existing.creditDays,
          availableCredit: (creditLimit || existing.creditLimit) - existing.currentBalance,
          updatedAt: new Date()
        })
        .where(eq(retailerCreditAccounts.id, existing.id))
        .returning();

      return res.json(account);
    }

    // Create new account
    const [account] = await db.insert(retailerCreditAccounts).values({
      wholesalerTenantId: tenantId,
      retailerTenantId,
      retailerId,
      creditLimit: creditLimit || 0,
      creditDays: creditDays || 30,
      currentBalance: 0,
      availableCredit: creditLimit || 0
    }).returning();

    res.json(account);
  } catch (error) {
    console.error('[WHOLESALER] Failed to create credit account:', error);
    res.status(500).json({ error: 'Failed to create credit account' });
  }
});

// Record payment
router.post('/credit-accounts/:id/payment', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    // Get current account
    const [account] = await db
      .select()
      .from(retailerCreditAccounts)
      .where(and(
        eq(retailerCreditAccounts.id, id),
        eq(retailerCreditAccounts.wholesalerTenantId, tenantId)
      ));

    if (!account) {
      return res.status(404).json({ error: 'Credit account not found' });
    }

    const newBalance = account.currentBalance - amount;
    const newAvailableCredit = account.creditLimit - newBalance;

    // Update account
    await db
      .update(retailerCreditAccounts)
      .set({
        currentBalance: newBalance,
        availableCredit: newAvailableCredit,
        lastPaymentDate: new Date(),
        lastPaymentAmount: amount,
        totalPayments: (account.totalPayments || 0) + amount,
        updatedAt: new Date()
      })
      .where(eq(retailerCreditAccounts.id, id));

    // Record transaction
    const [transaction] = await db.insert(creditTransactions).values({
      creditAccountId: id,
      wholesalerTenantId: tenantId,
      retailerTenantId: account.retailerTenantId,
      type: 'payment',
      amount: -amount, // Negative because it reduces balance
      balanceAfter: newBalance,
      paymentMethod,
      referenceNumber,
      notes,
      createdBy: req.user.id
    }).returning();

    res.json({ account: { ...account, currentBalance: newBalance }, transaction });
  } catch (error) {
    console.error('[WHOLESALER] Failed to record payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// ==========================================
// DELIVERY ROUTES
// ==========================================

// Get all routes
router.get('/delivery-routes', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const routes = await db
      .select()
      .from(deliveryRoutes)
      .where(eq(deliveryRoutes.wholesalerTenantId, tenantId))
      .orderBy(asc(deliveryRoutes.sortOrder));

    res.json(routes);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch delivery routes:', error);
    res.status(500).json({ error: 'Failed to fetch delivery routes' });
  }
});

// Create route
router.post('/delivery-routes', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, description, pincodes, deliveryDays, deliveryTime, driverName, driverPhone, vehicleNumber } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Route name is required' });
    }

    const [route] = await db.insert(deliveryRoutes).values({
      wholesalerTenantId: tenantId,
      name,
      description,
      pincodes,
      deliveryDays,
      deliveryTime,
      driverName,
      driverPhone,
      vehicleNumber,
      isActive: true
    }).returning();

    res.json(route);
  } catch (error) {
    console.error('[WHOLESALER] Failed to create delivery route:', error);
    res.status(500).json({ error: 'Failed to create delivery route' });
  }
});

// Update route
router.put('/delivery-routes/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const updates = req.body;

    const [route] = await db
      .update(deliveryRoutes)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(
        eq(deliveryRoutes.id, id),
        eq(deliveryRoutes.wholesalerTenantId, tenantId)
      ))
      .returning();

    res.json(route);
  } catch (error) {
    console.error('[WHOLESALER] Failed to update delivery route:', error);
    res.status(500).json({ error: 'Failed to update delivery route' });
  }
});

// Delete route
router.delete('/delivery-routes/:id', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    await db
      .delete(deliveryRoutes)
      .where(and(
        eq(deliveryRoutes.id, id),
        eq(deliveryRoutes.wholesalerTenantId, tenantId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('[WHOLESALER] Failed to delete delivery route:', error);
    res.status(500).json({ error: 'Failed to delete delivery route' });
  }
});

// Get orders grouped by pincode for route planning
router.get('/delivery-routes/pending-orders', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Get pending/confirmed orders with delivery address
    const orders = await db
      .select({
        order: wholesalerOrders,
        retailer: {
          id: users.id,
          username: users.username,
          pharmacyName: users.pharmacyName,
          pincode: users.pincode
        }
      })
      .from(wholesalerOrders)
      .leftJoin(users, eq(wholesalerOrders.retailerId, users.id))
      .where(and(
        eq(wholesalerOrders.wholesalerTenantId, tenantId),
        sql`${wholesalerOrders.status} IN ('confirmed', 'processing')`
      ))
      .orderBy(desc(wholesalerOrders.createdAt));

    // Group by pincode
    const groupedByPincode: Record<string, typeof orders> = {};
    orders.forEach(order => {
      const pincode = order.retailer?.pincode || 'Unknown';
      if (!groupedByPincode[pincode]) {
        groupedByPincode[pincode] = [];
      }
      groupedByPincode[pincode].push(order);
    });

    res.json({ orders, groupedByPincode });
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch pending orders:', error);
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

// Create delivery schedule
router.post('/delivery-schedules', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { routeId, scheduledDate, orderIds, notes } = req.body;

    if (!scheduledDate || !orderIds?.length) {
      return res.status(400).json({ error: 'Scheduled date and orders are required' });
    }

    // Calculate totals
    const orders = await db
      .select()
      .from(wholesalerOrders)
      .where(sql`${wholesalerOrders.id} IN (${sql.join(orderIds.map((id: string) => sql`${id}`), sql`, `)})`);

    const totalValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Create schedule
    const [schedule] = await db.insert(deliverySchedules).values({
      wholesalerTenantId: tenantId,
      routeId,
      scheduledDate: new Date(scheduledDate),
      totalOrders: orderIds.length,
      totalValue,
      notes,
      status: 'planned'
    }).returning();

    // Link orders to schedule
    for (let i = 0; i < orderIds.length; i++) {
      await db.insert(deliveryScheduleOrders).values({
        scheduleId: schedule.id,
        orderId: orderIds[i],
        deliverySequence: i + 1,
        status: 'pending'
      });

      // Update order status to shipped
      await db
        .update(wholesalerOrders)
        .set({ status: 'shipped' })
        .where(eq(wholesalerOrders.id, orderIds[i]));
    }

    res.json(schedule);
  } catch (error) {
    console.error('[WHOLESALER] Failed to create delivery schedule:', error);
    res.status(500).json({ error: 'Failed to create delivery schedule' });
  }
});

// Get delivery schedules
router.get('/delivery-schedules', requireWholesaler, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status, date } = req.query;

    let query = db
      .select({
        schedule: deliverySchedules,
        route: deliveryRoutes
      })
      .from(deliverySchedules)
      .leftJoin(deliveryRoutes, eq(deliverySchedules.routeId, deliveryRoutes.id))
      .where(eq(deliverySchedules.wholesalerTenantId, tenantId));

    const schedules = await query.orderBy(desc(deliverySchedules.scheduledDate));

    res.json(schedules);
  } catch (error) {
    console.error('[WHOLESALER] Failed to fetch delivery schedules:', error);
    res.status(500).json({ error: 'Failed to fetch delivery schedules' });
  }
});

export default router;
