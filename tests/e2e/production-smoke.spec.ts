import { test, expect } from '@playwright/test';
import { PRODUCTION_TEST_USERS, loginProductionUser, logoutProductionUser } from '../fixtures/production-auth';

/**
 * Production Smoke Tests
 *
 * These tests verify critical functionality on your Railway production server.
 * They use pre-existing test accounts and don't create any data.
 */

test.describe('Production Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Should load without errors
    await expect(page).toHaveTitle(/AushadiExpress|Aushadi/i);

    // Should show login or dashboard
    await expect(
      page.getByText(/login|register|dashboard/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should login as retailer', async ({ page }) => {
    const retailer = PRODUCTION_TEST_USERS.retailer;

    await loginProductionUser(page, retailer);

    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should access POS page', async ({ page }) => {
    const retailer = PRODUCTION_TEST_USERS.retailer;
    await loginProductionUser(page, retailer);

    // Navigate to POS
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Should show POS interface
    await expect(page.getByTestId('pos-title')).toBeVisible();
    await expect(page.getByTestId('search-products')).toBeVisible();
  });

  test('should access inventory page', async ({ page }) => {
    const retailer = PRODUCTION_TEST_USERS.retailer;
    await loginProductionUser(page, retailer);

    // Navigate to inventory
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Should show inventory interface
    await expect(page.getByText(/inventory|products/i).first()).toBeVisible();
  });

  test('should login as customer', async ({ page }) => {
    const customer = PRODUCTION_TEST_USERS.customer;

    await loginProductionUser(page, customer);

    // Should be logged in
    await expect(page).toHaveURL(/\/(dashboard|search)/);
  });

  test('should access customer search', async ({ page }) => {
    const customer = PRODUCTION_TEST_USERS.customer;
    await loginProductionUser(page, customer);

    // Navigate to search
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Should show search interface
    await expect(page.getByPlaceholder(/search.*medicine/i)).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    const retailer = PRODUCTION_TEST_USERS.retailer;
    await loginProductionUser(page, retailer);

    await logoutProductionUser(page);

    // Should be logged out
    await expect(page).toHaveURL(/\/(login|)$/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Should load on mobile
    await expect(
      page.getByText(/login|register|dashboard/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should load static assets', async ({ page }) => {
    const response = await page.goto('/');

    // Should return 200 OK
    expect(response?.status()).toBe(200);

    // Check for critical resources (no 404s)
    const failedRequests: string[] = [];

    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });

    await page.waitForLoadState('networkidle');

    // Should have no critical failures
    expect(failedRequests.length).toBe(0);
  });

  test('should have valid SSL certificate', async ({ page }) => {
    const response = await page.goto('/');

    // Should use HTTPS
    expect(page.url()).toMatch(/^https:\/\//);

    // Should load successfully (SSL valid)
    expect(response?.status()).toBe(200);
  });
});

test.describe('Production Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load dashboard within acceptable time', async ({ page }) => {
    const retailer = PRODUCTION_TEST_USERS.retailer;
    await loginProductionUser(page, retailer);

    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Dashboard load time: ${loadTime}ms`);

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
