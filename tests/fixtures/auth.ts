import { Page } from '@playwright/test';

export interface TestUser {
  username: string;
  password: string;
  role: 'retailer' | 'customer' | 'wholesaler' | 'distributor';
  pincode: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  retailer: {
    username: 'Test Pharmacy',
    password: 'test123456',
    role: 'retailer',
    pincode: '560001'
  },
  customer: {
    username: 'Test Customer',
    password: 'test123456',
    role: 'customer',
    pincode: '560001'
  },
  wholesaler: {
    username: 'Test Wholesaler',
    password: 'test123456',
    role: 'wholesaler',
    pincode: '560001'
  },
  distributor: {
    username: 'Test Distributor',
    password: 'test123456',
    role: 'distributor',
    pincode: '560001'
  }
};

export async function registerUser(page: Page, user: TestUser) {
  await page.goto('/');

  // Wait for setup gate to load
  await page.waitForLoadState('networkidle');

  // Check if we need to register (look for role selector)
  const roleSelector = page.getByText('Select Your Role');
  if (await roleSelector.isVisible()) {
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
  }
}

export async function loginUser(page: Page, user: TestUser) {
  await page.goto('/');

  // Wait for setup gate to load
  await page.waitForLoadState('networkidle');

  // Check if already logged in
  try {
    await page.waitForURL('/dashboard', { timeout: 2000 });
    return; // Already logged in
  } catch {
    // Not logged in, continue with login
  }

  // Look for login form or switch to login
  const loginLink = page.getByText('Already have an account?').or(
    page.getByText('Sign In')
  );

  if (await loginLink.isVisible({ timeout: 2000 })) {
    await loginLink.click();
  }

  // Fill login form
  await page.getByPlaceholder('Enter your business name').or(
    page.getByPlaceholder('Enter your name').or(
      page.getByPlaceholder('Username')
    )
  ).fill(user.username);

  await page.getByPlaceholder('Enter your password').or(
    page.getByPlaceholder('Password')
  ).fill(user.password);

  // Submit login
  await page.getByRole('button', { name: /login|sign in/i }).click();

  // Wait for dashboard to load
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

export async function logoutUser(page: Page) {
  // Navigate to settings
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');

  // Find and click logout button
  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  await logoutButton.click();

  // Wait for redirect to login/home
  await page.waitForURL(/\/(login|)$/, { timeout: 5000 });
}

export async function ensureLoggedOut(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Clear all storage
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      });
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
}
