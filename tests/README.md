# AushadiExpress - Playwright E2E Tests

Comprehensive end-to-end testing suite for the AushadiExpress pharmacy management application.

## Overview

This test suite provides complete coverage of all application features including:
- ✅ Authentication & role-based access control
- ✅ Point of Sale (POS) workflows
- ✅ Inventory management
- ✅ Excel upload with AI schema detection
- ✅ Customer journey (search, cart, orders)
- ✅ Pharmacy order fulfillment
- ✅ PWA installation and offline capabilities

## Test Structure

```
tests/
├── e2e/                           # End-to-end test suites
│   ├── auth.spec.ts               # Authentication & authorization (18 tests)
│   ├── pos.spec.ts                # POS workflows (23 tests)
│   ├── inventory.spec.ts          # Inventory management (17 tests)
│   ├── excel-upload.spec.ts       # Excel upload & AI detection (18 tests)
│   ├── customer.spec.ts           # Customer journey (28 tests)
│   ├── pharmacy-orders.spec.ts    # Order fulfillment (20 tests)
│   └── pwa.spec.ts                # PWA & offline features (20 tests)
├── fixtures/                      # Test data and utilities
│   ├── auth.ts                    # Authentication helpers
│   ├── products.ts                # Sample product data
│   └── excel/                     # Sample Excel files
└── helpers/                       # Reusable test utilities
    ├── api-helpers.ts             # API interaction helpers
    └── db-helpers.ts              # Database seeding (to be added)
```

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install --with-deps
```

### Running Tests

#### Run all tests
```bash
npm run test:e2e
```

#### Run specific test file
```bash
npx playwright test tests/e2e/pos.spec.ts
```

#### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

#### Run tests in UI mode (interactive)
```bash
npx playwright test --ui
```

#### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

#### Run tests on mobile viewport
```bash
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

#### Debug tests
```bash
npx playwright test --debug
```

#### Run specific test by name
```bash
npx playwright test -g "should complete cash payment"
```

## Test Configuration

Configuration is defined in `playwright.config.ts`:

- **Base URL**: `http://localhost:5000` (configurable via `BASE_URL` env var)
- **Timeout**: 10 seconds per action
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: Parallel execution (1 worker in CI)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 13
- **Tablet**: iPad Pro

### Environment Variables

```bash
# Set base URL for tests
export BASE_URL=http://localhost:5000

# Run in CI mode (enables retries)
export CI=true
```

## Test Features

### Authentication Tests (`auth.spec.ts`)

Tests user registration, login, logout, and role-based access control:
- ✅ Retailer/Customer registration
- ✅ Password validation
- ✅ Duplicate username prevention
- ✅ Session persistence
- ✅ Role-specific features
- ✅ Session expiry handling

### POS Tests (`pos.spec.ts`)

Tests complete point-of-sale workflows:
- ✅ Product display and search
- ✅ Cart management (add, update, remove)
- ✅ Stock validation
- ✅ Multiple payment methods (cash, UPI, card)
- ✅ Sale completion
- ✅ Inventory deduction
- ✅ Mobile responsiveness

### Inventory Tests (`inventory.spec.ts`)

Tests inventory management features:
- ✅ Product listing
- ✅ Search and filtering
- ✅ Stock details with batches
- ✅ Expiry date tracking
- ✅ Low stock warnings
- ✅ Multiple batch handling
- ✅ Stock calculations

### Excel Upload Tests (`excel-upload.spec.ts`)

Tests AI-powered Excel upload:
- ✅ File upload (click and drag-and-drop)
- ✅ AI column detection
- ✅ Multiple Excel formats (.xlsx, .xls, .xlsm)
- ✅ Custom column names
- ✅ Indian format support
- ✅ Large file handling
- ✅ Error handling
- ✅ Data preview

### Customer Journey Tests (`customer.spec.ts`)

Tests customer shopping experience:
- ✅ Medicine search
- ✅ Nearby store discovery
- ✅ Store product browsing
- ✅ Cart management
- ✅ Order placement
- ✅ Order history
- ✅ Saved stores and orders
- ✅ Mobile optimization

### Pharmacy Orders Tests (`pharmacy-orders.spec.ts`)

Tests order fulfillment workflows:
- ✅ Incoming order display
- ✅ Order acceptance/rejection
- ✅ Status progression
- ✅ Order completion
- ✅ Payment collection
- ✅ Customer information
- ✅ Stock updates
- ✅ Order filtering and sorting

### PWA Tests (`pwa.spec.ts`)

Tests progressive web app features:
- ✅ PWA installation prompt
- ✅ Service worker registration
- ✅ Web manifest
- ✅ Offline functionality
- ✅ Data caching
- ✅ Sync when online
- ✅ IndexedDB storage
- ✅ App updates
- ✅ Performance

## Test Data

### Test Users

Pre-configured test users are available in `fixtures/auth.ts`:

```typescript
TEST_USERS.retailer  // Business user
TEST_USERS.customer  // End customer
TEST_USERS.wholesaler
TEST_USERS.distributor
```

### Sample Products

Sample product data in `fixtures/products.ts`:
- Paracetamol, Amoxicillin, Crocin, etc.
- Multiple batches with expiry dates
- Realistic pricing

### Excel Files

Sample Excel files for testing uploads:
- Standard format
- Custom column names
- Indian format (date, currency)
- Large files (100+ items)

## Best Practices

### Writing Tests

1. **Use Page Object Model** for complex pages
2. **Prefer data-testid** for stable selectors
3. **Use explicit waits** for dynamic content
4. **Test both happy and sad paths**
5. **Keep tests independent** - no dependencies between tests
6. **Clean up after tests** - use beforeEach/afterEach hooks

### Example Test

```typescript
test('should complete a sale', async ({ page }) => {
  // Setup
  const retailer = { ...TEST_USERS.retailer, username: `Test ${Date.now()}` };
  await registerUser(page, retailer);

  // Navigate
  await page.goto('/pos');

  // Add product
  await page.getByTestId('add-tile-product-1').click();

  // Checkout
  await page.getByTestId('view-cart-button').click();
  await page.getByTestId('checkout-button').click();

  // Pay
  await page.getByRole('button', { name: /cash/i }).click();

  // Verify
  await expect(page.getByText(/sale completed/i)).toBeVisible();
});
```

## Debugging Tests

### Visual Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Run in debug mode (pause on each action)
npx playwright test --debug

# Run with UI mode
npx playwright test --ui
```

### Traces & Screenshots

Test failures automatically capture:
- Screenshots
- Videos
- Trace files (timeline of actions)

View trace:
```bash
npx playwright show-trace trace.zip
```

### Console Logs

View browser console in tests:
```typescript
page.on('console', msg => console.log(msg.text()));
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Reports

HTML report is generated after test run:
```bash
npx playwright show-report
```

JSON report for programmatic access:
```bash
cat test-results/results.json
```

## Troubleshooting

### Tests timing out
- Increase timeout in config
- Check network speed
- Ensure server is running

### Flaky tests
- Add explicit waits
- Check for race conditions
- Review test independence

### Browser not found
```bash
npx playwright install
```

### Port already in use
- Kill process on port 5000
- Change BASE_URL in config

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Follow existing patterns
3. Add appropriate test data
4. Update this README
5. Ensure all tests pass

## Test Coverage

Current test coverage:
- **144+ test cases**
- **All major features covered**
- **Multiple browsers and viewports**
- **Mobile and desktop**
- **Online and offline scenarios**

## Performance

Target test suite execution time:
- **Full suite**: < 15 minutes
- **Individual file**: < 2 minutes
- **Single test**: < 30 seconds

## Support

For issues or questions:
1. Check Playwright docs: https://playwright.dev
2. Review design-principles.md
3. Check existing test examples
4. Open an issue in the repository

## License

MIT
