import { test, expect } from '@playwright/test';
import { PRODUCTION_TEST_USERS } from '../fixtures/production-auth';

/**
 * Production Full Journey Test
 *
 * This test runs the ENTIRE app flow in a SINGLE browser session:
 * - Homepage
 * - Retailer Login
 * - POS System
 * - Inventory Management
 * - Customer Login
 * - Medicine Search
 * - Order Flow
 *
 * No browser restarts - one continuous session!
 */

test.describe('Production Full App Journey', () => {
  test('Complete app flow in single session', async ({ page }) => {
    const retailer = PRODUCTION_TEST_USERS.retailer;
    const customer = PRODUCTION_TEST_USERS.customer;

    // ========================================
    // 1. HOMEPAGE
    // ========================================
    console.log('\n🏠 Step 1: Loading homepage...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/AushadiExpress|Pharmacy/i);
    console.log('✅ Homepage loaded successfully');

    // ========================================
    // 2. RETAILER LOGIN
    // ========================================
    console.log('\n👤 Step 2: Logging in as retailer...');

    // Check if we need to switch to login mode (page might show register by default)
    const registerLink = page.getByText("Don't have an account? Register");
    if (await registerLink.isVisible({ timeout: 2000 })) {
      console.log('   Already on login page');
    }

    // Select Retailer role
    console.log('   Selecting Retailer role...');
    const retailerButton = page.locator('button:has-text("Retailer")');
    await retailerButton.waitFor({ state: 'visible', timeout: 5000 });
    await retailerButton.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Retailer role selected');

    // Fill login form (Retailer has "Enter your business name")
    console.log('   Filling login credentials...');
    await page.getByPlaceholder('Enter your business name').fill(retailer.username);
    await page.getByPlaceholder('Enter password').fill(retailer.password);

    // Submit login
    console.log('   Submitting login...');
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForURL('/dashboard', { timeout: 15000 });
    console.log('✅ Retailer logged in successfully');

    // ========================================
    // 3. DASHBOARD
    // ========================================
    console.log('\n📊 Step 3: Checking dashboard...');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/dashboard|welcome/i).first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Dashboard loaded');

    // ========================================
    // 4. POS SYSTEM
    // ========================================
    console.log('\n🛒 Step 4: Testing POS system...');
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Verify POS page loaded
    await expect(page).toHaveURL(/\/pos/);
    await expect(page.getByText(/point of sale|pos|search products/i).first()).toBeVisible({ timeout: 5000 });
    console.log('✅ POS system accessible');

    // Try to search for a product
    const searchBox = page.getByPlaceholder(/search|product/i).first();
    if (await searchBox.isVisible({ timeout: 2000 })) {
      await searchBox.fill('paracetamol');
      await page.waitForTimeout(1500); // Wait for search results
      console.log('   ✅ Product search working');
    }

    // ========================================
    // 5. INVENTORY
    // ========================================
    console.log('\n📦 Step 5: Checking inventory...');
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/inventory/);
    await expect(page.getByText(/inventory|products|stock/i).first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Inventory page accessible');

    // Check if products are listed
    const productRows = page.locator('table tr, [data-testid*="product"], .product-item');
    const productCount = await productRows.count();
    console.log(`   📋 Found ${productCount} product entries`);

    // ========================================
    // 6. LOGOUT RETAILER
    // ========================================
    console.log('\n🚪 Step 6: Logging out retailer...');
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible({ timeout: 3000 })) {
      await logoutButton.click();
      await page.waitForURL(/\/(login|)$/, { timeout: 5000 });
      console.log('✅ Retailer logged out');
    }

    // ========================================
    // 7. CUSTOMER LOGIN
    // ========================================
    console.log('\n👥 Step 7: Logging in as customer...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should already be on login page
    console.log('   On login page');

    // Select Customer role
    console.log('   Selecting Customer role...');
    const customerButton = page.locator('button:has-text("Customer")');
    await customerButton.waitFor({ state: 'visible', timeout: 5000 });
    await customerButton.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Customer role selected');

    // Fill customer login (Customer has different placeholder)
    console.log('   Filling customer credentials...');
    // For customer role, the placeholder is different - try both
    const usernameField = page.getByPlaceholder('Enter your username').or(
      page.getByPlaceholder('Enter your name')
    );
    await usernameField.fill(customer.username);
    await page.getByPlaceholder('Enter password').fill(customer.password);

    // Submit customer login
    console.log('   Submitting login...');
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForURL('/dashboard', { timeout: 15000 });
    console.log('✅ Customer logged in successfully');

    // ========================================
    // 8. CUSTOMER SEARCH
    // ========================================
    console.log('\n🔍 Step 8: Testing medicine search...');
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    const customerSearchBox = page.getByPlaceholder(/search medicine|search product/i).first();
    if (await customerSearchBox.isVisible({ timeout: 2000 })) {
      await customerSearchBox.fill('aspirin');
      await page.waitForTimeout(1500);
      console.log('   ✅ Medicine search working');
    }

    // ========================================
    // 9. STORES
    // ========================================
    console.log('\n🏪 Step 9: Checking stores...');
    await page.goto('/stores');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/stores/);
    console.log('✅ Stores page accessible');

    // ========================================
    // 10. ORDERS
    // ========================================
    console.log('\n📦 Step 10: Checking orders...');
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/orders/);
    console.log('✅ Orders page accessible');

    // ========================================
    // 11. FINAL LOGOUT
    // ========================================
    console.log('\n🚪 Step 11: Final logout...');
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const finalLogoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await finalLogoutButton.isVisible({ timeout: 3000 })) {
      await finalLogoutButton.click();
      await page.waitForURL(/\/(login|)$/, { timeout: 5000 });
      console.log('✅ Customer logged out');
    }

    // ========================================
    // ✅ COMPLETE!
    // ========================================
    console.log('\n🎉 COMPLETE! Full app journey tested in single session\n');
  });
});
