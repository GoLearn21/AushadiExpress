# Testing on Railway Production Server

This guide explains how to run Playwright tests against your Railway production server.

## Quick Start

### 1. Configure Your Production URL and Test Data

Edit `.env.test.production` and add your Railway URL and test credentials:

```bash
# Your Railway production URL
PRODUCTION_URL=https://your-app.railway.app

# Test user credentials (use dedicated test accounts!)
TEST_RETAILER_USERNAME=TestPharmacyProd
TEST_RETAILER_PASSWORD=YourSecurePassword123!
TEST_RETAILER_PINCODE=560001

TEST_CUSTOMER_USERNAME=TestCustomerProd
TEST_CUSTOMER_PASSWORD=YourSecurePassword123!
TEST_CUSTOMER_PINCODE=560001
```

### 2. Create Test Users on Production

**Option A: Use the app UI** (Recommended)
1. Go to your Railway app: `https://your-app.railway.app`
2. Register a retailer account with the test credentials above
3. Register a customer account with the test credentials above

**Option B: Use the database directly**
- Insert test users directly into your production database
- Make sure passwords are properly hashed

### 3. Run Production Smoke Tests

```bash
# Run smoke tests (quick validation)
npm run test:prod

# Run with visible browser
npm run test:prod:headed

# Run in interactive UI mode
npm run test:prod:ui

# View test report
npm run test:prod:report
```

## What Gets Tested

The production smoke tests verify:

✅ **Homepage loads** - SSL certificate, no 404s
✅ **Authentication** - Login as retailer and customer
✅ **POS System** - Access POS interface
✅ **Inventory** - Access inventory management
✅ **Customer Search** - Access medicine search
✅ **Logout** - Session management
✅ **Mobile Responsiveness** - Works on mobile viewport
✅ **Performance** - Pages load within 5 seconds

## Test Files

- **Config**: `playwright.config.production.ts` - Production-specific settings
- **Tests**: `tests/e2e/production-smoke.spec.ts` - Smoke tests
- **Auth Helpers**: `tests/fixtures/production-auth.ts` - Production login utilities
- **Environment**: `.env.test.production` - Production credentials

## Important Notes

### Safety First
- ⚠️ **Use dedicated test accounts** - Don't use real user credentials
- ⚠️ **Read-only tests** - Smoke tests don't create/modify data
- ⚠️ **Test during off-peak** - Minimize impact on real users

### Test Data Requirements

Before running tests, ensure you have:
1. ✅ Test retailer account created
2. ✅ Test customer account created
3. ✅ At least a few products in inventory (for display tests)

### Configuration

Production tests use different settings:
- **Serial execution** (workers: 1) - Safer for production
- **More retries** (2) - Account for network latency
- **Longer timeouts** (60s test, 30s navigation) - Production is slower
- **Full traces on failure** - Better debugging

## Running Full Test Suite on Production

⚠️ **Warning**: Running the full test suite on production will:
- Create test data (products, orders, sales)
- Use Excel upload features
- Test cart and checkout flows

Only do this if you're comfortable with test data in production!

```bash
# Run ALL tests on production (use with caution!)
npm run test:prod:all
```

## Selective Testing

Run specific test files:

```bash
# Just authentication tests
npx playwright test --config=playwright.config.production.ts tests/e2e/auth.spec.ts

# Just POS tests
npx playwright test --config=playwright.config.production.ts tests/e2e/pos.spec.ts

# Just inventory tests
npx playwright test --config=playwright.config.production.ts tests/e2e/inventory.spec.ts
```

## Environment Variables

Set production URL dynamically:

```bash
# Override URL for different environments
PRODUCTION_URL=https://staging.railway.app npm run test:prod

# Use different test credentials
TEST_RETAILER_USERNAME=DifferentUser npm run test:prod
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Production Smoke Tests

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps chromium

      - name: Run production tests
        env:
          PRODUCTION_URL: ${{ secrets.PRODUCTION_URL }}
          TEST_RETAILER_USERNAME: ${{ secrets.TEST_RETAILER_USERNAME }}
          TEST_RETAILER_PASSWORD: ${{ secrets.TEST_RETAILER_PASSWORD }}
        run: npm run test:prod

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: production-test-report
          path: playwright-report-production/
```

## Troubleshooting

### Tests fail with "Not authenticated"
- Verify test users exist on production
- Check credentials in `.env.test.production`
- Ensure session cookies are enabled

### Tests timeout
- Railway might be in a cold start
- Increase timeout in `playwright.config.production.ts`
- Check Railway logs for errors

### SSL certificate errors
- Ensure your Railway domain has valid SSL
- Check that HTTPS is properly configured

### Products not found in inventory
- Seed some test products on production
- Or create products through the Excel upload feature

## Best Practices

1. **Schedule Regular Tests**
   - Run smoke tests every few hours
   - Alert on failures

2. **Use Separate Test Users**
   - Create dedicated `test-*` accounts
   - Don't use real customer/business names

3. **Monitor Test Impact**
   - Watch database/server metrics during tests
   - Limit concurrent test runs

4. **Clean Up Test Data**
   - Periodically remove old test data
   - Or use separate test database

5. **Version Control**
   - Don't commit `.env.test.production` with real credentials
   - Use secrets manager for CI/CD

## Support

If tests fail unexpectedly:
1. Check Railway logs
2. Review Playwright traces: `npm run test:prod:report`
3. Run tests in headed mode: `npm run test:prod:headed`
4. Check network tab in browser DevTools

## Example Test Run

```bash
$ npm run test:prod

Running 10 tests using 1 worker

[1/10] Production Smoke Tests › should load the homepage
[PROD TEST] Logging in as retailer: TestPharmacyProd
[2/10] Production Smoke Tests › should login as retailer
[PROD TEST] Login successful
[3/10] Production Smoke Tests › should access POS page
...

  10 passed (45s)

To open last HTML report run:
  npm run test:prod:report
```

## Next Steps

After smoke tests pass:
1. Run additional feature-specific tests
2. Set up monitoring for test failures
3. Integrate with your CI/CD pipeline
4. Schedule regular test runs
