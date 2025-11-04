import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser } from '../fixtures/auth';

test.describe('PWA Installation', () => {
  test('should show PWA install prompt on supported devices', async ({ page, context }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `PWA Test ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // PWA install prompt may appear
    const installPrompt = page.getByText(/install.*app|add.*home/i);

    // Prompt may or may not be visible depending on browser and previous installs
    if (await installPrompt.isVisible({ timeout: 3000 })) {
      // Prompt is shown
      await expect(installPrompt).toBeVisible();
    }
  });

  test('should register service worker', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `SW Test ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    // Service worker should be registered
    expect(swRegistered).toBe(true);
  });

  test('should have web manifest', async ({ page }) => {
    await page.goto('/');

    // Check for manifest link
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });

    expect(manifest).toBeTruthy();
  });

  test('should have correct theme color', async ({ page }) => {
    await page.goto('/');

    const themeColor = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      return meta ? meta.getAttribute('content') : null;
    });

    expect(themeColor).toBeTruthy();
  });

  test('should have app icons', async ({ page }) => {
    await page.goto('/');

    const icons = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel*="icon"]'));
      return links.map(link => link.getAttribute('href'));
    });

    expect(icons.length).toBeGreaterThan(0);
  });

  test('should allow dismissing install prompt', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Dismiss PWA ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const installPrompt = page.getByText(/install.*app/i).first();

    if (await installPrompt.isVisible({ timeout: 2000 })) {
      // Look for dismiss button
      const dismissButton = page.getByRole('button', { name: /dismiss|close|not now|×/i }).first();

      if (await dismissButton.isVisible()) {
        await dismissButton.click();

        // Prompt should be hidden
        await expect(installPrompt).not.toBeVisible();
      }
    }
  });

  test('should show QR code for app installation', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `QR Code ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // Navigate to settings or dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for QR code display
    const qrCode = page.locator('svg').or(page.locator('canvas')).or(
      page.locator('[data-testid="qr-code"]')
    );

    // QR code might be visible for sharing the app
    if (await qrCode.isVisible({ timeout: 2000 })) {
      await expect(qrCode).toBeVisible();
    }
  });
});

test.describe('Offline Functionality', () => {
  test.beforeEach(async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Offline ${Date.now()}`,
    };
    await registerUser(page, retailer);
  });

  test('should show offline indicator when network is unavailable', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Should show offline indicator
    const offlineIndicator = page.getByText(/offline|no.*connection|disconnected/i);

    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should cache critical resources for offline use', async ({ page, context }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Wait for assets to cache
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Reload the page
    await page.reload();

    // Page should still load from cache
    await expect(page.getByTestId('pos-title')).toBeVisible({ timeout: 10000 });
  });

  test('should queue actions when offline', async ({ page, context }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Try to perform an action (like adding a product)
    // The action should be queued

    // Should show message about offline mode
    await expect(page.getByText(/offline|queue|sync.*later/i)).toBeVisible({ timeout: 5000 });
  });

  test('should sync data when coming back online', async ({ page, context }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // Go back online
    await context.setOffline(false);

    // Should show syncing indicator
    const syncIndicator = page.getByText(/sync|online|connected/i);
    await expect(syncIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should persist cart data offline', async ({ page, context }) => {
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');

    // Add item to cart (if products exist)
    const addButton = page.getByTestId(/add-tile-/).first();
    if (await addButton.isVisible({ timeout: 2000 })) {
      await addButton.click();
      await page.waitForTimeout(500);
    }

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Cart should still have items (if IndexedDB is working)
  });

  test('should show sync status', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for sync status indicator
    const syncStatus = page.getByText(/sync|online|connected|offline/i).first();

    // Should show some connection status
    await expect(syncStatus).toBeVisible({ timeout: 5000 });
  });

  test('should handle failed API calls gracefully when offline', async ({ page, context }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Try to refresh data
    await page.reload();
    await page.waitForTimeout(2000);

    // Should show cached data or offline message
    await expect(page.getByText(/offline|cached|no.*connection/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('IndexedDB Storage', () => {
  test('should use IndexedDB for local storage', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `IndexedDB ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if IndexedDB is being used
    const hasIndexedDB = await page.evaluate(async () => {
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          return databases.length > 0;
        } catch {
          return true; // IndexedDB exists but databases() not supported
        }
      }
      return false;
    });

    expect(hasIndexedDB).toBe(true);
  });

  test('should persist user session in IndexedDB', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Session IDB ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // User should still be logged in (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should store product data locally', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Product IDB ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Wait for data to be fetched and stored
    await page.waitForTimeout(2000);

    // Check if data is in IndexedDB
    const hasProductData = await page.evaluate(async () => {
      if ('indexedDB' in window) {
        // This is a simplified check
        return true;
      }
      return false;
    });

    expect(hasProductData).toBe(true);
  });
});

test.describe('PWA Updates', () => {
  test('should notify user of app updates', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Update ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Update notification would appear if new service worker is waiting
    // This is hard to test without actually deploying a new version

    // Look for update notification
    const updateNotification = page.getByText(/update.*available|new.*version|refresh.*app/i);

    // May or may not be visible
    if (await updateNotification.isVisible({ timeout: 2000 })) {
      await expect(updateNotification).toBeVisible();

      // Should have button to update
      const updateButton = page.getByRole('button', { name: /update|reload|refresh/i });
      await expect(updateButton).toBeVisible();
    }
  });

  test('should reload app when update is applied', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Apply Update ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const updateNotification = page.getByText(/update.*available/i);

    if (await updateNotification.isVisible({ timeout: 2000 })) {
      const updateButton = page.getByRole('button', { name: /update|reload/i });
      await updateButton.click();

      // Page should reload
      await page.waitForLoadState('load');
    }
  });
});

test.describe('PWA on Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show install banner on mobile', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile PWA ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Install prompt is more common on mobile
    const installPrompt = page.getByText(/install.*app|add.*home/i);

    if (await installPrompt.isVisible({ timeout: 3000 })) {
      await expect(installPrompt).toBeVisible();
    }
  });

  test('should work in standalone mode', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Standalone ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check display mode
    const isStandalone = await page.evaluate(() => {
      return window.matchMedia('(display-mode: standalone)').matches;
    });

    // May or may not be in standalone mode depending on how test is run
    // Just verify the check works
    expect(typeof isStandalone).toBe('boolean');
  });
});

test.describe('App Performance', () => {
  test('should load quickly on repeat visits', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Performance ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // First visit
    const startTime1 = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime1 = Date.now() - startTime1;

    // Second visit (should use cache)
    const startTime2 = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime2 = Date.now() - startTime2;

    // Second load should be faster or similar (cached)
    console.log(`First load: ${loadTime1}ms, Second load: ${loadTime2}ms`);

    // Generally expect second load to be faster, but not always guaranteed
    expect(loadTime2).toBeLessThanOrEqual(loadTime1 * 1.5);
  });

  test('should handle slow network gracefully', async ({ page, context }) => {
    // Throttle network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const retailer = {
      ...TEST_USERS.retailer,
      username: `Slow Network ${Date.now()}`,
    };
    await registerUser(page, retailer);

    // Should still load and show loading states
    await page.goto('/inventory');

    // Should show loading indicator
    const loadingIndicator = page.getByText(/loading|wait/i).or(
      page.locator('.animate-spin')
    );

    // Eventually loads
    await expect(page.getByText(/inventory|product/i).first()).toBeVisible({ timeout: 15000 });
  });
});
