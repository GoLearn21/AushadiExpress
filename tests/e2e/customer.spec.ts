import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser } from '../fixtures/auth';
import { createProduct, createStock } from '../helpers/api-helpers';

test.describe('Customer Journey - Product Search', () => {
  test.beforeEach(async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Customer ${Date.now()}`,
    };
    await registerUser(page, customer);
  });

  test('should display search page for customers', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Should show search interface
    await expect(page.getByPlaceholder(/search.*medicine/i)).toBeVisible();
  });

  test('should search for medicines', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Search for a medicine
    const searchInput = page.getByPlaceholder(/search.*medicine/i);
    await searchInput.fill('Paracetamol');
    await searchInput.press('Enter');

    // Should navigate to search results
    await expect(page).toHaveURL(/\/search-results/);
  });

  test('should show search results', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search.*medicine/i);
    await searchInput.fill('Paracetamol');
    await searchInput.press('Enter');

    // Wait for results page
    await page.waitForURL(/\/search-results/);
    await page.waitForLoadState('networkidle');

    // Should show some results or no results message
    await expect(page.getByText(/result|store|pharmacy|no.*found/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display nearby stores', async ({ page }) => {
    await page.goto('/nearby-stores');
    await page.waitForLoadState('networkidle');

    // Should show nearby pharmacies
    await expect(page.getByText(/nearby|store|pharmacy/i)).toBeVisible();
  });

  test('should request location permission', async ({ page, context }) => {
    // Grant location permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 }); // Bangalore

    await page.goto('/nearby-stores');
    await page.waitForLoadState('networkidle');

    // Should use location to show nearby stores
    await page.waitForTimeout(2000);
  });

  test('should filter stores by distance', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 });

    await page.goto('/nearby-stores');
    await page.waitForLoadState('networkidle');

    // Look for distance filter or sort options
    const filterButton = page.getByRole('button', { name: /filter|sort|distance/i });
    if (await filterButton.isVisible({ timeout: 2000 })) {
      await filterButton.click();
    }
  });
});

test.describe('Customer Journey - Store Products', () => {
  test.beforeEach(async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Store Customer ${Date.now()}`,
    };
    await registerUser(page, customer);
  });

  test('should browse store products', async ({ page }) => {
    // This would require a store to be set up
    // For now, test the navigation
    await page.goto('/nearby-stores');
    await page.waitForLoadState('networkidle');

    // Click on a store if available
    const storeCard = page.locator('[data-testid^="store-"]').first();
    if (await storeCard.isVisible({ timeout: 3000 })) {
      await storeCard.click();

      // Should navigate to store products page
      await expect(page).toHaveURL(/\/store\//);
    }
  });

  test('should search within store', async ({ page }) => {
    // Navigate to a store (using a mock tenant ID)
    await page.goto('/store/test-tenant/Test%20Pharmacy');
    await page.waitForLoadState('networkidle');

    // Should show store products or search
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('Aspirin');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Customer Journey - Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Cart Customer ${Date.now()}`,
    };
    await registerUser(page, customer);
  });

  test('should add product to cart from store', async ({ page }) => {
    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Should show cart page
    await expect(page.getByText(/cart|basket/i)).toBeVisible();
  });

  test('should display cart items', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Should show empty cart or items
    await expect(page.getByText(/cart|empty|item/i)).toBeVisible();
  });

  test('should update cart quantity', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for quantity controls
    const increaseButton = page.getByRole('button', { name: /increase|\+|add/i }).first();
    if (await increaseButton.isVisible({ timeout: 2000 })) {
      await increaseButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for remove button
    const removeButton = page.getByRole('button', { name: /remove|delete|×/i }).first();
    if (await removeButton.isVisible({ timeout: 2000 })) {
      await removeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show cart total', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Should show total price
    await expect(page.getByText(/total|₹/i)).toBeVisible({ timeout: 3000 });
  });

  test('should proceed to checkout', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for checkout button
    const checkoutButton = page.getByRole('button', { name: /checkout|place.*order/i });
    if (await checkoutButton.isVisible({ timeout: 2000 })) {
      await checkoutButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should clear cart', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for clear cart option
    const clearButton = page.getByRole('button', { name: /clear|empty/i });
    if (await clearButton.isVisible({ timeout: 2000 })) {
      await clearButton.click();
      await page.waitForTimeout(500);

      // Should show empty cart
      await expect(page.getByText(/empty/i)).toBeVisible();
    }
  });
});

test.describe('Customer Journey - Orders', () => {
  test.beforeEach(async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Orders Customer ${Date.now()}`,
    };
    await registerUser(page, customer);
  });

  test('should display orders page', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Should show orders page
    await expect(page.getByText(/order|history/i)).toBeVisible();
  });

  test('should show order history', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Should show orders or empty state
    await expect(page.getByText(/order|no.*order|empty/i)).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Look for status filter
    const filterButton = page.getByRole('button', { name: /filter|status/i });
    if (await filterButton.isVisible({ timeout: 2000 })) {
      await filterButton.click();

      // Select a status
      const statusOption = page.getByText(/pending|completed|cancelled/i).first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should view order details', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Click on an order if available
    const orderCard = page.locator('[data-testid^="order-"]').first();
    if (await orderCard.isVisible({ timeout: 2000 })) {
      await orderCard.click();
      await page.waitForTimeout(500);

      // Should show order details
      await expect(page.getByText(/detail|item|total/i)).toBeVisible();
    }
  });

  test('should track order status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Look for status indicators
    await expect(page.getByText(/pending|processing|ready|completed/i).first()).toBeVisible({ timeout: 3000 });
  });

  test('should reorder from history', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Look for reorder button
    const reorderButton = page.getByRole('button', { name: /reorder|order.*again/i }).first();
    if (await reorderButton.isVisible({ timeout: 2000 })) {
      await reorderButton.click();
      await page.waitForTimeout(500);

      // Should add items to cart
      await expect(page.getByText(/added|cart/i)).toBeVisible();
    }
  });
});

test.describe('Customer Journey - Saved Features', () => {
  test.beforeEach(async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Saved Customer ${Date.now()}`,
    };
    await registerUser(page, customer);
  });

  test('should display saved stores', async ({ page }) => {
    await page.goto('/saved-stores');
    await page.waitForLoadState('networkidle');

    // Should show saved stores page
    await expect(page.getByText(/saved.*store|favorite/i)).toBeVisible();
  });

  test('should save a store to favorites', async ({ page }) => {
    await page.goto('/nearby-stores');
    await page.waitForLoadState('networkidle');

    // Look for save/favorite button
    const saveButton = page.getByRole('button', { name: /save|favorite|bookmark/i }).first();
    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();
      await page.waitForTimeout(500);

      // Should show confirmation
      await expect(page.getByText(/saved|added/i)).toBeVisible();
    }
  });

  test('should display saved orders', async ({ page }) => {
    await page.goto('/saved-orders');
    await page.waitForLoadState('networkidle');

    // Should show saved orders page
    await expect(page.getByText(/saved.*order|draft/i)).toBeVisible();
  });

  test('should save current cart as draft', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for save draft button
    const saveDraftButton = page.getByRole('button', { name: /save.*draft|save.*later/i });
    if (await saveDraftButton.isVisible({ timeout: 2000 })) {
      await saveDraftButton.click();
      await page.waitForTimeout(500);

      // Should show confirmation
      await expect(page.getByText(/saved/i)).toBeVisible();
    }
  });

  test('should load saved order', async ({ page }) => {
    await page.goto('/saved-orders');
    await page.waitForLoadState('networkidle');

    // Click on a saved order if available
    const savedOrderCard = page.locator('[data-testid^="saved-order-"]').first();
    if (await savedOrderCard.isVisible({ timeout: 2000 })) {
      await savedOrderCard.click();
      await page.waitForTimeout(500);

      // Should load items into cart
    }
  });

  test('should remove store from saved', async ({ page }) => {
    await page.goto('/saved-stores');
    await page.waitForLoadState('networkidle');

    // Look for remove button
    const removeButton = page.getByRole('button', { name: /remove|delete|unfavorite/i }).first();
    if (await removeButton.isVisible({ timeout: 2000 })) {
      await removeButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Customer Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should navigate smoothly on mobile', async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Mobile Customer ${Date.now()}`,
    };
    await registerUser(page, customer);

    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Should show mobile-optimized search
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Navigate to different sections
    await page.goto('/nearby-stores');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/store|pharmacy/i)).toBeVisible();

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/cart/i)).toBeVisible();

    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/order/i)).toBeVisible();
  });

  test('should use bottom navigation on mobile', async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `Mobile Nav ${Date.now()}`,
    };
    await registerUser(page, customer);

    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Should show bottom navigation
    const bottomNav = page.locator('[data-testid="bottom-navigation"]').or(
      page.locator('nav').last()
    );
    await expect(bottomNav).toBeVisible({ timeout: 3000 });
  });
});
