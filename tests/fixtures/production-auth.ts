import { Page } from '@playwright/test';

/**
 * Production Authentication Helpers
 * Uses environment variables for credentials instead of generating random usernames
 */

export interface ProductionTestUser {
  username: string;
  password: string;
  role: 'retailer' | 'customer' | 'wholesaler' | 'distributor';
  pincode: string;
}

// Load from environment variables
export const PRODUCTION_TEST_USERS: Record<string, ProductionTestUser> = {
  retailer: {
    username: process.env.TEST_RETAILER_USERNAME || 'Sai Clinic',
    password: process.env.TEST_RETAILER_PASSWORD || 'prasad123',
    role: 'retailer',
    pincode: process.env.TEST_RETAILER_PINCODE || '560001'
  },
  customer: {
    username: process.env.TEST_CUSTOMER_USERNAME || 'Prasad',
    password: process.env.TEST_CUSTOMER_PASSWORD || 'prasad123',
    role: 'customer',
    pincode: process.env.TEST_CUSTOMER_PINCODE || '560001'
  }
};

/**
 * Login to production with existing user credentials
 * Does NOT register - assumes user already exists
 */
export async function loginProductionUser(page: Page, user: ProductionTestUser) {
  console.log(`[PROD TEST] Logging in as ${user.role}: ${user.username}`);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check if already logged in
  try {
    await page.waitForURL('/dashboard', { timeout: 2000 });
    console.log('[PROD TEST] Already logged in');
    return;
  } catch {
    // Not logged in, continue with login
  }

  // Page should show login form - no need to toggle

  // IMPORTANT: Select the correct role first
  console.log(`[PROD TEST] Selecting role: ${user.role}`);

  // Select role based on the actual production UI
  if (user.role === 'retailer') {
    // Click "Retailer" button
    const retailerButton = page.locator('button:has-text("Retailer")');
    await retailerButton.waitFor({ state: 'visible', timeout: 5000 });
    await retailerButton.click();
    await page.waitForTimeout(500);
    console.log('[PROD TEST] Retailer role selected');
  } else if (user.role === 'customer') {
    // Click "Customer" button
    const customerButton = page.locator('button:has-text("Customer")');
    await customerButton.waitFor({ state: 'visible', timeout: 5000 });
    await customerButton.click();
    await page.waitForTimeout(500);
    console.log('[PROD TEST] Customer role selected');
  }

  // Fill login form using placeholder selectors (match production UI)
  if (user.role === 'retailer') {
    await page.getByPlaceholder('Enter your business name').fill(user.username);
  } else {
    // Customer has different placeholder
    const usernameField = page.getByPlaceholder('Enter your username').or(
      page.getByPlaceholder('Enter your name')
    );
    await usernameField.fill(user.username);
  }
  await page.getByPlaceholder('Enter password').fill(user.password);

  // Submit login (button says "Log In" in production)
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for dashboard to load
  await page.waitForURL('/dashboard', { timeout: 10000 });
  console.log('[PROD TEST] Login successful');
}

/**
 * Register a new user on production (use with caution)
 * Only use if you want to create fresh test users
 */
export async function registerProductionUser(page: Page, user: ProductionTestUser) {
  console.log(`[PROD TEST] Registering new user: ${user.username}`);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Select role
  const roleCard = page.getByTestId(`role-${user.role}`).or(
    page.locator(`text="${user.role.charAt(0).toUpperCase() + user.role.slice(1)}"`).first()
  );
  await roleCard.click();

  // Fill registration form
  if (user.role === 'customer') {
    await page.getByPlaceholder('Enter your name').fill(user.username);
  } else {
    await page.getByPlaceholder('Enter business name').or(
      page.getByPlaceholder('Enter your business name')
    ).fill(user.username);
  }

  await page.getByPlaceholder('Create a password').or(
    page.getByPlaceholder('Enter password')
  ).fill(user.password);

  await page.getByPlaceholder('Enter 6-digit pincode').or(
    page.getByPlaceholder('Pincode')
  ).fill(user.pincode);

  // Submit registration
  await page.getByRole('button', { name: /register|sign up|get started/i }).click();

  // Wait for dashboard or onboarding to load
  await page.waitForURL(/\/(dashboard|\?onboarding)/, { timeout: 10000 });
  console.log('[PROD TEST] Registration successful');
}

export async function logoutProductionUser(page: Page) {
  console.log('[PROD TEST] Logging out');

  await page.goto('/settings');
  await page.waitForLoadState('networkidle');

  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  await logoutButton.click();

  await page.waitForURL(/\/(login|)$/, { timeout: 5000 });
  console.log('[PROD TEST] Logout successful');
}
