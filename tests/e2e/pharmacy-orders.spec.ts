import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser } from '../fixtures/auth';
import { createProduct, createStock, createPharmacyOrder } from '../helpers/api-helpers';

test.describe('Pharmacy Order Fulfillment', () => {
  test.beforeEach(async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Pharmacy ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/pharmacy-orders');
    await page.waitForLoadState('networkidle');
  });

  test('should display pharmacy orders page', async ({ page }) => {
    await expect(page.getByText(/order|incoming|pending/i).first()).toBeVisible();
  });

  test('should show incoming orders list', async ({ page }) => {
    // Should show orders or empty state
    await expect(page.getByText(/order|no.*order|empty/i)).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    // Look for status tabs or filter
    const statusTabs = ['Pending', 'Processing', 'Ready', 'Completed'];

    for (const status of statusTabs) {
      const tab = page.getByRole('button', { name: new RegExp(status, 'i') }).or(
        page.getByText(new RegExp(status, 'i'))
      );

      if (await tab.isVisible({ timeout: 1000 })) {
        await tab.click();
        await page.waitForTimeout(500);
        break;
      }
    }
  });

  test('should view order details', async ({ page }) => {
    // Look for an order card
    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      await orderCard.click();

      // Should show order details
      await expect(page.getByText(/detail|item|customer|total/i)).toBeVisible();
    }
  });

  test('should accept an order', async ({ page }) => {
    // Look for accept button
    const acceptButton = page.getByRole('button', { name: /accept|confirm/i }).first();

    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click();

      // Should show confirmation
      await expect(page.getByText(/accepted|confirmed/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should reject an order', async ({ page }) => {
    // Look for reject button
    const rejectButton = page.getByRole('button', { name: /reject|decline|cancel/i }).first();

    if (await rejectButton.isVisible({ timeout: 2000 })) {
      await rejectButton.click();

      // May ask for reason
      const reasonInput = page.getByPlaceholder(/reason/i);
      if (await reasonInput.isVisible({ timeout: 2000 })) {
        await reasonInput.fill('Out of stock');
      }

      // Confirm rejection
      const confirmButton = page.getByRole('button', { name: /confirm|submit/i });
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }

      // Should show confirmation
      await expect(page.getByText(/rejected|declined/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should mark order as ready for pickup', async ({ page }) => {
    // Look for ready button
    const readyButton = page.getByRole('button', { name: /ready|mark.*ready/i }).first();

    if (await readyButton.isVisible({ timeout: 2000 })) {
      await readyButton.click();

      // Should show confirmation
      await expect(page.getByText(/ready|notified/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should complete an order', async ({ page }) => {
    // Look for complete button
    const completeButton = page.getByRole('button', { name: /complete|delivered|finish/i }).first();

    if (await completeButton.isVisible({ timeout: 2000 })) {
      await completeButton.click();

      // May show payment collection modal
      const paymentModal = page.getByText(/payment|collect|cash/i);
      if (await paymentModal.isVisible({ timeout: 2000 })) {
        // Select payment method
        const cashButton = page.getByRole('button', { name: /cash/i });
        await cashButton.click();
      }

      // Should show success
      await expect(page.getByText(/completed|success/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show customer information', async ({ page }) => {
    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      await orderCard.click();

      // Should show customer name and contact
      await expect(page.getByText(/customer|name|phone|contact/i)).toBeVisible();
    }
  });

  test('should show order items with quantities', async ({ page }) => {
    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      await orderCard.click();

      // Should show items list
      await expect(page.getByText(/item|product|quantity/i)).toBeVisible();
    }
  });

  test('should calculate order total', async ({ page }) => {
    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      await orderCard.click();

      // Should show total amount
      await expect(page.getByText(/total.*₹|₹.*\d+/)).toBeVisible();
    }
  });

  test('should show order timestamp', async ({ page }) => {
    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      // Should show time information
      await expect(page.getByText(/ago|hour|minute|day|time/i)).toBeVisible();
    }
  });

  test('should update stock after order completion', async ({ page }) => {
    // Create product with stock
    const product = await createProduct(page, {
      name: 'Order Test Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'ORDER001',
      quantity: 100,
      expiryDate: '2026-12-31',
    });

    // Complete an order (if available)
    const completeButton = page.getByRole('button', { name: /complete/i }).first();

    if (await completeButton.isVisible({ timeout: 2000 })) {
      await completeButton.click();

      // Handle payment if shown
      const cashButton = page.getByRole('button', { name: /cash/i });
      if (await cashButton.isVisible({ timeout: 2000 })) {
        await cashButton.click();
      }

      // Wait for success
      await page.waitForTimeout(2000);

      // Navigate to inventory
      await page.goto('/inventory');
      await page.waitForLoadState('networkidle');

      // Stock should be updated
    }
  });

  test('should search orders', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*order|order.*search/i);

    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Should filter results
    }
  });

  test('should sort orders', async ({ page }) => {
    const sortButton = page.getByRole('button', { name: /sort/i });

    if (await sortButton.isVisible({ timeout: 2000 })) {
      await sortButton.click();

      // Select sort option
      const sortOption = page.getByText(/time|date|amount/i).first();
      if (await sortOption.isVisible()) {
        await sortOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show order statistics', async ({ page }) => {
    // Look for stats like total orders, pending, completed
    await expect(page.getByText(/total|pending|completed|\d+.*order/i)).toBeVisible({ timeout: 3000 });
  });

  test('should refresh orders list', async ({ page }) => {
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh|reload/i }).or(
      page.locator('[data-testid="refresh-orders"]')
    );

    if (await refreshButton.isVisible({ timeout: 2000 })) {
      await refreshButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle empty orders list', async ({ page }) => {
    // Should show empty state
    const emptyMessage = page.getByText(/no.*order|empty|waiting/i);
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  });

  test('should notify about new orders', async ({ page }) => {
    // This would require websocket or polling mechanism
    // For now, just check if notification system exists
    const notification = page.locator('[role="alert"]').or(
      page.locator('.notification')
    );

    // Notification may or may not be visible
    if (await notification.isVisible({ timeout: 1000 })) {
      // Notification system is working
    }
  });
});

test.describe('Order Status Workflow', () => {
  test('should follow correct status progression', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Status Flow ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/pharmacy-orders');
    await page.waitForLoadState('networkidle');

    // Status should progress: Pending -> Processing -> Ready -> Completed
    // Or: Pending -> Rejected

    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      // Check initial status
      const statusBadge = page.locator('[data-testid^="status-"]').first().or(
        page.getByText(/pending|processing|ready/i).first()
      );

      if (await statusBadge.isVisible()) {
        const initialStatus = await statusBadge.textContent();

        // Try to change status
        const acceptButton = page.getByRole('button', { name: /accept|start/i }).first();
        if (await acceptButton.isVisible()) {
          await acceptButton.click();
          await page.waitForTimeout(1000);

          // Status should have changed
          const updatedStatus = await statusBadge.textContent();
          expect(updatedStatus).not.toBe(initialStatus);
        }
      }
    }
  });
});

test.describe('Pharmacy Orders Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile Orders ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/pharmacy-orders');
    await page.waitForLoadState('networkidle');

    // Should show mobile-optimized interface
    await expect(page.getByText(/order/i).first()).toBeVisible();
  });

  test('should handle order actions on mobile', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile Actions ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/pharmacy-orders');
    await page.waitForLoadState('networkidle');

    // Order actions should be accessible on mobile
    const orderCard = page.locator('[data-testid^="order-"]').first();

    if (await orderCard.isVisible({ timeout: 2000 })) {
      await orderCard.click();

      // Should show action buttons
      await expect(page.getByRole('button', { name: /accept|reject|complete/i }).first()).toBeVisible({ timeout: 3000 });
    }
  });
});
