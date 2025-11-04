import { defineConfig, devices } from '@playwright/test';

/**
 * Production Testing Configuration for Railway
 *
 * This configuration is specifically for testing against your Railway production server.
 * It disables the local dev server and uses the production URL.
 */

export default defineConfig({
  testDir: './tests/e2e',

  // Run tests in serial for production (safer)
  fullyParallel: false,
  workers: 1,

  // More retries for production (network can be flaky)
  retries: 2,

  // Longer timeout for production
  timeout: 60000, // 60 seconds per test

  reporter: [
    ['html', { outputFolder: 'playwright-report-production' }],
    ['json', { outputFile: 'test-results/production-results.json' }],
    ['list']
  ],

  use: {
    // Set your Railway production URL here
    baseURL: process.env.PRODUCTION_URL || 'https://aushadiexpress-production.up.railway.app',

    // Production settings
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Longer action timeout for production
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium-production',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Uncomment to test on mobile
    // {
    //   name: 'mobile-production',
    //   use: {
    //     ...devices['Pixel 5']
    //   },
    // },
  ],

  // DO NOT start a local server for production tests
  // webServer: undefined,
});
