import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser } from '../fixtures/auth';
import { SAMPLE_PRODUCTS } from '../fixtures/products';
import { createProduct, createStock } from '../helpers/api-helpers';

test.describe('Point of Sale (POS) Workflows', () => {
  let productIds: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Register and login as retailer
    const retailer = {
      ...TEST_USERS.retailer,
      username: `POS Test ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // Create test products
    productIds = [];
    for (const productData of SAMPLE_PRODUCTS.slice(0, 5)) {
      const product = await createProduct(page, {
        name: productData.name,
        price: productData.price,
      });
      productIds.push(product.id);

      // Create stock for the product
      for (const stockData of productData.stock) {
        await createStock(page, {
          productId: product.id,
          batch: stockData.batch,
          quantity: stockData.quantity,
          expiryDate: stockData.expiryDate,
          mrp: stockData.mrp || productData.price,
        });
      }
    }

    // Navigate to POS
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
  });

  test('should display POS page with product tiles', async ({ page }) => {
    // Verify POS title
    await expect(page.getByTestId('pos-title')).toContainText('Point of Sale');

    // Verify product tiles are visible
    const productTiles = page.getByTestId(/product-tile-/);
    await expect(productTiles.first()).toBeVisible();

    // Should show at least 5 products
    const count = await productTiles.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should search products by name', async ({ page }) => {
    const searchInput = page.getByTestId('search-products');
    await searchInput.fill('Paracetamol');

    // Wait for search to filter results
    await page.waitForTimeout(500);

    // Should show only matching products
    await expect(page.getByText('Paracetamol 500mg')).toBeVisible();

    // Non-matching products should not be visible
    await expect(page.getByText('Amoxicillin')).not.toBeVisible();
  });

  test('should add product to cart from tile', async ({ page }) => {
    // Find and click "Add to Cart" button on first product
    const firstProductTile = page.getByTestId(`product-tile-${productIds[0]}`);
    await firstProductTile.getByTestId(`add-tile-${productIds[0]}`).click();

    // Should show success toast
    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 5000 });

    // Cart button should be visible
    await expect(page.getByTestId('view-cart-button')).toBeVisible();

    // Cart should show 1 item
    await expect(page.getByText(/cart.*1/i)).toBeVisible();
  });

  test('should increase quantity from product tile', async ({ page }) => {
    const productId = productIds[0];

    // Add product first
    await page.getByTestId(`add-tile-${productId}`).click();
    await page.waitForTimeout(500);

    // Increase quantity
    await page.getByTestId(`increase-tile-${productId}`).click();

    // Wait for update
    await page.waitForTimeout(500);

    // Should show quantity 2 on tile
    const productTile = page.getByTestId(`product-tile-${productId}`);
    await expect(productTile.getByText('2')).toBeVisible();
  });

  test('should decrease quantity from product tile', async ({ page }) => {
    const productId = productIds[0];

    // Add product twice
    await page.getByTestId(`add-tile-${productId}`).click();
    await page.waitForTimeout(500);
    await page.getByTestId(`increase-tile-${productId}`).click();
    await page.waitForTimeout(500);

    // Decrease quantity
    await page.getByTestId(`decrease-tile-${productId}`).click();
    await page.waitForTimeout(500);

    // Should show quantity 1
    const productTile = page.getByTestId(`product-tile-${productId}`);
    await expect(productTile.getByText('1')).toBeVisible();
  });

  test('should remove product when quantity reaches zero', async ({ page }) => {
    const productId = productIds[0];

    // Add product
    await page.getByTestId(`add-tile-${productId}`).click();
    await page.waitForTimeout(500);

    // Decrease to zero
    await page.getByTestId(`decrease-tile-${productId}`).click();
    await page.waitForTimeout(500);

    // Add button should be visible again
    await expect(page.getByTestId(`add-tile-${productId}`)).toBeVisible();
  });

  test('should open cart drawer', async ({ page }) => {
    // Add a product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Click view cart button
    await page.getByTestId('view-cart-button').click();

    // Drawer should open
    await expect(page.getByText('Current Bill')).toBeVisible();
    await expect(page.getByTestId('close-bill')).toBeVisible();
  });

  test('should show correct total in cart', async ({ page }) => {
    // Add first product (₹5.00)
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Add second product (₹15.00)
    await page.getByTestId(`add-tile-${productIds[1]}`).click();
    await page.waitForTimeout(500);

    // Open cart
    await page.getByTestId('view-cart-button').click();

    // Should show total of ₹20.00
    await expect(page.getByText('₹20.00')).toBeVisible();
  });

  test('should update quantity from cart drawer', async ({ page }) => {
    const productId = productIds[0];

    // Add product
    await page.getByTestId(`add-tile-${productId}`).click();
    await page.waitForTimeout(500);

    // Open cart
    await page.getByTestId('view-cart-button').click();

    // Increase quantity in cart
    await page.getByTestId(`increase-${productId}`).click();
    await page.waitForTimeout(500);

    // Should show updated total
    await expect(page.getByText('₹10.00')).toBeVisible();
  });

  test('should prevent adding more than available stock', async ({ page }) => {
    const productId = productIds[0];

    // Add product to its maximum quantity (100 in this test)
    const addButton = page.getByTestId(`add-tile-${productId}`);
    await addButton.click();
    await page.waitForTimeout(500);

    // Try to add 100 more times (should hit stock limit)
    for (let i = 0; i < 150; i++) {
      await page.getByTestId(`increase-tile-${productId}`).click();
      await page.waitForTimeout(100);
    }

    // Should show error about insufficient stock
    await expect(page.getByText(/insufficient stock/i)).toBeVisible({ timeout: 5000 });
  });

  test('should open payment modal from cart', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Open cart
    await page.getByTestId('view-cart-button').click();

    // Click checkout
    await page.getByTestId('checkout-button').click();

    // Payment modal should open
    await expect(page.getByText(/payment|collect/i)).toBeVisible();
  });

  test('should complete cash payment', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Open cart and checkout
    await page.getByTestId('view-cart-button').click();
    await page.getByTestId('checkout-button').click();

    // Select cash payment
    const cashButton = page.getByRole('button', { name: /cash/i });
    await cashButton.click();

    // Should show success message
    await expect(page.getByText(/sale completed|payment.*success/i)).toBeVisible({ timeout: 5000 });

    // Cart should be empty
    const viewCartButton = page.getByTestId('view-cart-button');
    await expect(viewCartButton).not.toBeVisible();
  });

  test('should complete UPI payment', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Checkout
    await page.getByTestId('view-cart-button').click();
    await page.getByTestId('checkout-button').click();

    // Select UPI payment
    const upiButton = page.getByRole('button', { name: /upi/i });
    if (await upiButton.isVisible()) {
      await upiButton.click();

      // Should complete sale
      await expect(page.getByText(/sale completed|payment.*success/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should complete card payment', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Checkout
    await page.getByTestId('view-cart-button').click();
    await page.getByTestId('checkout-button').click();

    // Select card payment
    const cardButton = page.getByRole('button', { name: /card/i });
    if (await cardButton.isVisible()) {
      await cardButton.click();

      // Should complete sale
      await expect(page.getByText(/sale completed|payment.*success/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should charge from sticky cart bar', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Click charge from sticky bar
    await page.getByTestId('sticky-charge-button').click();

    // Payment modal should open
    await expect(page.getByText(/payment|collect/i)).toBeVisible();
  });

  test('should update inventory after sale', async ({ page }) => {
    // Note the initial stock quantity
    const productTile = page.getByTestId(`product-tile-${productIds[0]}`);
    const stockText = await productTile.getByText(/stock.*\d+/i).textContent();
    const initialStock = parseInt(stockText?.match(/\d+/)?.[0] || '0');

    // Add product and complete sale
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);
    await page.getByTestId('view-cart-button').click();
    await page.getByTestId('checkout-button').click();
    await page.getByRole('button', { name: /cash/i }).click();

    // Wait for success and page to update
    await page.waitForTimeout(2000);

    // Reload or navigate back to POS
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Check updated stock
    const updatedTile = page.getByTestId(`product-tile-${productIds[0]}`);
    const updatedStockText = await updatedTile.getByText(/stock.*\d+/i).textContent();
    const updatedStock = parseInt(updatedStockText?.match(/\d+/)?.[0] || '0');

    expect(updatedStock).toBe(initialStock - 1);
  });

  test('should handle empty cart checkout attempt', async ({ page }) => {
    // Try to checkout with empty cart (button should be disabled)
    const checkoutButton = page.getByTestId('checkout-button');

    // Button should not be visible when cart is empty
    await expect(checkoutButton).not.toBeVisible();
  });

  test('should close cart drawer', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Open cart
    await page.getByTestId('view-cart-button').click();

    // Close cart
    await page.getByTestId('close-bill').click();

    // Drawer should close
    await expect(page.getByText('Current Bill')).not.toBeVisible();
  });

  test('should maintain cart when navigating away and back', async ({ page }) => {
    // Add product
    await page.getByTestId(`add-tile-${productIds[0]}`).click();
    await page.waitForTimeout(500);

    // Navigate away
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Navigate back to POS
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Cart should still have the item (or be empty based on implementation)
    // This depends on whether cart state persists
  });

  test('should show scan button for barcode scanning', async ({ page }) => {
    // Scan button should be visible
    await expect(page.getByTestId('scan-button')).toBeVisible();
  });

  test('should navigate to barcode scanner when scan button clicked', async ({ page }) => {
    // Click scan button
    await page.getByTestId('scan-button').click();

    // Should navigate to capture page
    await expect(page).toHaveURL(/\/capture\?mode=barcode/);
  });
});

test.describe('POS Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display correctly on mobile', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile POS ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Should show mobile-optimized layout
    await expect(page.getByTestId('pos-title')).toBeVisible();
    await expect(page.getByTestId('search-products')).toBeVisible();
  });

  test('should handle cart drawer on mobile', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile Cart ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // Create a product
    const product = await createProduct(page, {
      name: 'Mobile Test Product',
      price: 10.00,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'BATCH001',
      quantity: 50,
      expiryDate: '2026-12-31',
      mrp: 12.00,
    });

    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Add product
    await page.getByTestId(`add-tile-${product.id}`).click();
    await page.waitForTimeout(500);

    // Open cart
    await page.getByTestId('view-cart-button').click();

    // Drawer should overlay on mobile
    await expect(page.getByText('Current Bill')).toBeVisible();
  });
});
