import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser, loginUser, logoutUser, ensureLoggedOut } from '../fixtures/auth';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedOut(page);
  });

  test('should allow retailer registration with business name', async ({ page }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Test Pharmacy ${Date.now()}`,
    };

    await registerUser(page, user);

    // Verify dashboard is loaded
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should allow customer registration with personal name', async ({ page }) => {
    const user = {
      ...TEST_USERS.customer,
      username: `Test Customer ${Date.now()}`,
    };

    await registerUser(page, user);

    // Verify dashboard or search page is loaded
    await expect(page).toHaveURL(/\/(dashboard|search)/);
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select retailer role
    const roleCard = page.getByText('Retailer').or(page.getByTestId('role-retailer'));
    await roleCard.click();

    // Fill form with weak password
    await page.getByPlaceholder('Enter business name').fill('Test Pharmacy');
    await page.getByPlaceholder('Create a password').fill('123');
    await page.getByPlaceholder('Enter 6-digit pincode').fill('560001');

    // Try to submit
    await page.getByRole('button', { name: /register|sign up/i }).click();

    // Should show validation error
    await expect(page.getByText(/password.*at least 6/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate pincode format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select retailer role
    const roleCard = page.getByText('Retailer').or(page.getByTestId('role-retailer'));
    await roleCard.click();

    // Fill form with invalid pincode
    await page.getByPlaceholder('Enter business name').fill('Test Pharmacy');
    await page.getByPlaceholder('Create a password').fill('test123456');
    await page.getByPlaceholder('Enter 6-digit pincode').fill('123');

    // Try to submit
    await page.getByRole('button', { name: /register|sign up/i }).click();

    // Should show validation error
    await expect(page.getByText(/6.*digit/i)).toBeVisible({ timeout: 5000 });
  });

  test('should prevent duplicate username registration', async ({ page }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Unique Pharmacy ${Date.now()}`,
    };

    // Register first user
    await registerUser(page, user);
    await logoutUser(page);

    // Try to register with same username
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const roleCard = page.getByText('Retailer').or(page.getByTestId('role-retailer'));
    await roleCard.click();

    await page.getByPlaceholder('Enter business name').fill(user.username);
    await page.getByPlaceholder('Create a password').fill(user.password);
    await page.getByPlaceholder('Enter 6-digit pincode').fill(user.pincode);

    await page.getByRole('button', { name: /register|sign up/i }).click();

    // Should show error about existing user
    await expect(page.getByText(/already.*registered/i)).toBeVisible({ timeout: 5000 });
  });

  test('should allow user login', async ({ page }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Login Test ${Date.now()}`,
    };

    // Register user
    await registerUser(page, user);
    await logoutUser(page);

    // Login
    await loginUser(page, user);

    // Verify dashboard is loaded
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to login if needed
    const loginLink = page.getByText('Already have an account?');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
    }

    // Try to login with invalid credentials
    await page.getByPlaceholder(/business name|username/i).fill('InvalidUser');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Should show error
    await expect(page.getByText(/invalid.*credentials/i)).toBeVisible({ timeout: 5000 });
  });

  test('should maintain session on page reload', async ({ page }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Session Test ${Date.now()}`,
    };

    await registerUser(page, user);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Logout Test ${Date.now()}`,
    };

    await registerUser(page, user);
    await logoutUser(page);

    // Should be redirected to login/home
    await expect(page).toHaveURL(/\/(login|)$/);

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should be redirected back to login
    await expect(page).toHaveURL(/\/(login|)$/, { timeout: 5000 });
  });

  test('should show role-specific features for retailer', async ({ page }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Retailer Features ${Date.now()}`,
    };

    await registerUser(page, user);

    // Should see retailer-specific navigation
    await expect(page.getByText('POS').or(page.getByText('Point of Sale'))).toBeVisible();
    await expect(page.getByText('Inventory')).toBeVisible();
    await expect(page.getByText('Orders').or(page.getByText('Pharmacy Orders'))).toBeVisible();
  });

  test('should show role-specific features for customer', async ({ page }) => {
    const user = {
      ...TEST_USERS.customer,
      username: `Customer Features ${Date.now()}`,
    };

    await registerUser(page, user);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Navigate to search if not already there
    await page.goto('/search');

    // Should see customer-specific features
    await expect(page.getByPlaceholder(/search.*medicine/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle session expiry gracefully', async ({ page, context }) => {
    const user = {
      ...TEST_USERS.retailer,
      username: `Session Expiry ${Date.now()}`,
    };

    await registerUser(page, user);

    // Clear cookies to simulate session expiry
    await context.clearCookies();

    // Try to navigate to protected page
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/(login|)$/, { timeout: 5000 });
  });
});

test.describe('Role-Based Access Control', () => {
  test('customer should not access retailer features', async ({ page }) => {
    const customer = {
      ...TEST_USERS.customer,
      username: `RBAC Customer ${Date.now()}`,
    };

    await registerUser(page, customer);

    // Try to access POS
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Should either be blocked or redirected
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/pos/);
  });

  test('retailer should access all business features', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `RBAC Retailer ${Date.now()}`,
    };

    await registerUser(page, retailer);

    // Test access to various features
    const protectedRoutes = ['/pos', '/inventory', '/pharmacy-orders'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Should be able to access
      await expect(page).toHaveURL(route, { timeout: 5000 });
    }
  });
});
