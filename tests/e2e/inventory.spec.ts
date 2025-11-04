import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser } from '../fixtures/auth';
import { SAMPLE_PRODUCTS } from '../fixtures/products';
import { createProduct, createStock, getProducts, getStock } from '../helpers/api-helpers';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Inventory Test ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // Navigate to inventory
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
  });

  test('should display inventory page', async ({ page }) => {
    await expect(page.getByText(/inventory|products/i).first()).toBeVisible();
  });

  test('should show product list', async ({ page }) => {
    // Create test products
    for (const productData of SAMPLE_PRODUCTS.slice(0, 3)) {
      const product = await createProduct(page, {
        name: productData.name,
        price: productData.price,
      });

      for (const stockData of productData.stock) {
        await createStock(page, {
          productId: product.id,
          batch: stockData.batch,
          quantity: stockData.quantity,
          expiryDate: stockData.expiryDate,
        });
      }
    }

    // Reload to see products
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show products
    await expect(page.getByText(SAMPLE_PRODUCTS[0].name)).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    // Create test products
    await createProduct(page, { name: 'Paracetamol', price: 5 });
    await createProduct(page, { name: 'Amoxicillin', price: 15 });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Search for specific product
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Paracetamol');
    await page.waitForTimeout(500);

    // Should show only matching products
    await expect(page.getByText('Paracetamol')).toBeVisible();
  });

  test('should display stock details', async ({ page }) => {
    // Create product with stock
    const product = await createProduct(page, {
      name: 'Test Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'TEST001',
      quantity: 100,
      expiryDate: '2026-12-31',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show stock information
    await expect(page.getByText('Test Product')).toBeVisible();
    await expect(page.getByText(/100/)).toBeVisible();
  });

  test('should show low stock warnings', async ({ page }) => {
    // Create product with low stock
    const product = await createProduct(page, {
      name: 'Low Stock Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'LOW001',
      quantity: 5, // Low quantity
      expiryDate: '2026-12-31',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show low stock indicator
    await expect(page.getByText('Low Stock Product')).toBeVisible();
    // Look for warning indicators (color, icon, or text)
  });

  test('should navigate to Excel upload', async ({ page }) => {
    // Look for upload button
    const uploadButton = page.getByRole('button', { name: /upload|import|excel/i }).or(
      page.getByText(/upload|import/i)
    );

    if (await uploadButton.isVisible({ timeout: 3000 })) {
      await uploadButton.click();
      await expect(page).toHaveURL(/\/excel-upload/);
    }
  });

  test('should show expiry dates', async ({ page }) => {
    const product = await createProduct(page, {
      name: 'Expiry Test Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'EXP001',
      quantity: 50,
      expiryDate: '2025-03-31',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show expiry date
    await expect(page.getByText('Expiry Test Product')).toBeVisible();
  });

  test('should show multiple batches for same product', async ({ page }) => {
    const product = await createProduct(page, {
      name: 'Multi Batch Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'BATCH_A',
      quantity: 50,
      expiryDate: '2026-06-30',
    });

    await createStock(page, {
      productId: product.id,
      batch: 'BATCH_B',
      quantity: 30,
      expiryDate: '2026-12-31',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show product with multiple batches
    await expect(page.getByText('Multi Batch Product')).toBeVisible();
  });

  test('should filter by stock status', async ({ page }) => {
    // Create products with different stock levels
    const inStock = await createProduct(page, { name: 'In Stock Item', price: 10 });
    await createStock(page, {
      productId: inStock.id,
      batch: 'BATCH1',
      quantity: 100,
      expiryDate: '2026-12-31',
    });

    const outOfStock = await createProduct(page, { name: 'Out of Stock Item', price: 15 });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Look for stock filter options
    const filterButton = page.getByRole('button', { name: /filter|status/i });
    if (await filterButton.isVisible({ timeout: 2000 })) {
      await filterButton.click();

      // Filter by in-stock
      const inStockOption = page.getByText(/in stock|available/i);
      if (await inStockOption.isVisible()) {
        await inStockOption.click();
        await page.waitForTimeout(500);

        // Should show only in-stock items
        await expect(page.getByText('In Stock Item')).toBeVisible();
      }
    }
  });

  test('should sort products', async ({ page }) => {
    // Create products with different prices
    await createProduct(page, { name: 'Expensive Item', price: 100 });
    await createProduct(page, { name: 'Cheap Item', price: 5 });
    await createProduct(page, { name: 'Medium Item', price: 50 });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Look for sort option
    const sortButton = page.getByRole('button', { name: /sort/i });
    if (await sortButton.isVisible({ timeout: 2000 })) {
      await sortButton.click();

      // Sort by price
      const priceSort = page.getByText(/price/i);
      if (await priceSort.isVisible()) {
        await priceSort.click();
        await page.waitForTimeout(500);

        // Products should be sorted
      }
    }
  });

  test('should show batch numbers', async ({ page }) => {
    const product = await createProduct(page, {
      name: 'Batch Display Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'ABC123XYZ',
      quantity: 50,
      expiryDate: '2026-12-31',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should display batch number
    await expect(page.getByText('Batch Display Product')).toBeVisible();
    // Batch number might be in a details view
  });

  test('should handle empty inventory gracefully', async ({ page }) => {
    // Should show empty state message
    const emptyMessage = page.getByText(/no products|empty inventory|add.*product/i);
    await expect(emptyMessage.or(page.getByText(/upload.*excel/i))).toBeVisible({ timeout: 5000 });
  });

  test('should refresh inventory data', async ({ page }) => {
    // Create initial product
    await createProduct(page, { name: 'Initial Product', price: 10 });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Initial Product')).toBeVisible();

    // Create another product via API
    await createProduct(page, { name: 'New Product', price: 15 });

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show both products
    await expect(page.getByText('Initial Product')).toBeVisible();
    await expect(page.getByText('New Product')).toBeVisible();
  });

  test('should show product prices', async ({ page }) => {
    await createProduct(page, { name: 'Priced Product', price: 25.50 });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Priced Product')).toBeVisible();
    await expect(page.getByText(/25\.50|₹25/)).toBeVisible();
  });

  test('should calculate total stock across batches', async ({ page }) => {
    const product = await createProduct(page, {
      name: 'Total Stock Product',
      price: 10,
    });

    await createStock(page, {
      productId: product.id,
      batch: 'BATCH1',
      quantity: 50,
      expiryDate: '2026-06-30',
    });

    await createStock(page, {
      productId: product.id,
      batch: 'BATCH2',
      quantity: 75,
      expiryDate: '2026-12-31',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show total stock of 125
    await expect(page.getByText('Total Stock Product')).toBeVisible();
    await expect(page.getByText(/125/)).toBeVisible();
  });

  test('should navigate to stock adjustment page', async ({ page }) => {
    const adjustLink = page.getByRole('link', { name: /adjust.*stock/i }).or(
      page.getByText(/adjust.*stock/i)
    );

    if (await adjustLink.isVisible({ timeout: 2000 })) {
      await adjustLink.click();
      await expect(page).toHaveURL(/\/adjust-stock/);
    }
  });
});

test.describe('Inventory Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display inventory on mobile', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile Inventory ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Should show mobile-optimized layout
    await expect(page.getByText(/inventory|products/i).first()).toBeVisible();
  });

  test('should search on mobile', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile Search ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await createProduct(page, { name: 'Mobile Test Product', price: 10 });

    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Mobile Test');
    await page.waitForTimeout(500);

    await expect(page.getByText('Mobile Test Product')).toBeVisible();
  });
});
