# AushadiExpress - Playwright Testing Design Principles

## Overview
This document outlines the testing strategy and design principles for comprehensive end-to-end testing of the AushadiExpress pharmacy management application using Playwright.

## Application Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Wouter (routing), TanStack Query
- **Backend**: Express.js with session-based authentication
- **Database**: PostgreSQL (via Neon) with Drizzle ORM
- **AI Integration**: Google GenAI for Excel schema detection
- **State Management**: TanStack Query for server state, React Context for local state
- **UI Components**: Radix UI + Custom components with Tailwind CSS
- **PWA**: Progressive Web App with offline capabilities

### User Roles
1. **Customer** - Search and order medicines from nearby pharmacies
2. **Retailer** - Manage pharmacy, process POS sales, fulfill online orders
3. **Wholesaler** - Bulk inventory management
4. **Distributor** - Supply chain management

## Testing Strategy

### 1. Test Organization
```
tests/
├── e2e/                    # End-to-end test suites
│   ├── auth.spec.ts        # Authentication flows
│   ├── pos.spec.ts         # Point of Sale workflows
│   ├── inventory.spec.ts   # Inventory management
│   ├── excel-upload.spec.ts # AI-powered Excel uploads
│   ├── customer.spec.ts    # Customer journey tests
│   ├── pharmacy-orders.spec.ts # Order fulfillment
│   └── pwa.spec.ts         # PWA and offline features
├── fixtures/               # Test data and setup
│   ├── auth.ts            # Authentication fixtures
│   ├── products.ts        # Sample product data
│   └── excel/             # Sample Excel files
└── helpers/               # Test utilities
    ├── auth-helpers.ts    # Login/logout helpers
    ├── db-helpers.ts      # Database seeding
    └── api-helpers.ts     # API mocking utilities
```

### 2. Core Testing Principles

#### Test Independence
- Each test should be completely independent
- Use `beforeEach` for setup, `afterEach` for cleanup
- Seed database with fresh data for each test
- Clear browser storage between tests

#### Role-Based Testing
- Create separate test contexts for each user role
- Use authentication fixtures to set up user sessions
- Test role-specific permissions and UI elements

#### Real User Workflows
- Test complete user journeys, not just individual features
- Include happy paths and error scenarios
- Test mobile and desktop viewports

#### Performance & Reliability
- Use explicit waits for dynamic content
- Implement retry logic for flaky operations
- Test under various network conditions
- Monitor test execution time

### 3. Key Features to Test

#### Authentication & Authorization
- User registration with role selection
- Login/logout flows
- Session persistence
- Role-based access control
- Onboarding flow for new customers

#### POS (Point of Sale)
- Product search and selection
- Barcode scanning (via camera or manual)
- Cart management (add, update, remove items)
- Quantity controls with stock validation
- Payment collection (cash, UPI, card)
- Sale completion and inventory deduction
- FEFO (First Expired, First Out) stock allocation

#### Inventory Management
- Product listing and search
- Stock viewing with batch/expiry tracking
- Low stock alerts
- Excel bulk upload with AI schema detection
- Manual product/stock entry
- Stock adjustments

#### Excel Upload with AI
- File upload (drag-and-drop and click)
- AI column detection accuracy
- Processing of various Excel formats
- Error handling for invalid files
- Preview of detected data
- Bulk inventory creation

#### Customer Journey
- Medicine search by name
- Nearby pharmacy discovery (location-based)
- Store product browsing
- Cart management
- Order placement
- Saved stores and orders
- Order history

#### Pharmacy Order Fulfillment
- Incoming order notifications
- Order acceptance/rejection
- Order preparation workflow
- Payment collection
- Order completion
- Status updates

#### PWA & Offline Features
- App installation prompt
- Service worker registration
- Offline data persistence (IndexedDB)
- Sync when online
- App update notifications

### 4. Test Data Management

#### Fixtures
```typescript
// Standard test users
const TEST_USERS = {
  retailer: {
    username: "Test Pharmacy",
    password: "test123456",
    role: "retailer",
    pincode: "560001"
  },
  customer: {
    username: "Test Customer",
    password: "test123456",
    role: "customer",
    pincode: "560001"
  }
};

// Sample products
const SAMPLE_PRODUCTS = [
  {
    name: "Paracetamol 500mg",
    price: 5.00,
    stock: [
      { batch: "BATCH001", quantity: 100, expiryDate: "2026-12-31" }
    ]
  }
];
```

#### Database Seeding
- Clear database before test suite
- Seed with minimal required data
- Create role-specific test accounts
- Generate realistic product catalog

### 5. Page Object Model

Use Page Object Model for maintainability:

```typescript
class POSPage {
  constructor(private page: Page) {}

  async searchProduct(name: string) {
    await this.page.getByTestId('search-products').fill(name);
  }

  async addProductToCart(productId: string) {
    await this.page.getByTestId(`add-tile-${productId}`).click();
  }

  async checkout() {
    await this.page.getByTestId('view-cart-button').click();
    await this.page.getByTestId('checkout-button').click();
  }
}
```

### 6. Testing Best Practices

#### Locator Strategy
1. **Prefer**: `data-testid` attributes for stable selectors
2. **Use**: Accessible roles and labels (`getByRole`, `getByLabel`)
3. **Avoid**: CSS selectors based on implementation details
4. **Never**: XPath or brittle selectors

#### Assertions
- Use Playwright's auto-waiting assertions
- Check both positive and negative cases
- Verify visual elements and data accuracy
- Test error messages and validation

#### Network Handling
- Mock external API calls when needed
- Test offline scenarios
- Validate API request/response payloads
- Test rate limiting and error responses

#### Mobile Testing
- Test responsive layouts
- Verify touch interactions
- Test PWA installation on mobile
- Check mobile-specific features

### 7. CI/CD Integration

#### Pipeline Configuration
```yaml
# Example GitHub Actions
test:
  - name: Install Playwright
    run: npx playwright install --with-deps

  - name: Run E2E tests
    run: npm run test:e2e

  - name: Upload test results
    uses: actions/upload-artifact@v3
    with:
      name: playwright-report
```

#### Parallel Execution
- Run tests in parallel across multiple workers
- Isolate database per worker
- Use different browser contexts

#### Test Reports
- Generate HTML reports with screenshots
- Capture video for failed tests
- Track test metrics and trends
- Set up alerts for test failures

### 8. Accessibility Testing

#### WCAG Compliance
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Validate ARIA labels

#### Inclusive Design
- Test with various viewport sizes
- Verify text scaling
- Test with browser zoom
- Check for touch target sizes

### 9. Performance Testing

#### Key Metrics
- Page load time (< 3s)
- Time to interactive (< 5s)
- API response times (< 500ms)
- Large list rendering performance

#### Lighthouse Integration
```typescript
// Run Lighthouse audit
await page.goto('/pos');
const lighthouse = await page.lighthouse();
expect(lighthouse.performance).toBeGreaterThan(90);
```

### 10. Security Testing

#### Authentication Security
- Test for XSS vulnerabilities
- Verify CSRF protection
- Check session timeout
- Test password requirements
- Validate role-based permissions

#### Data Security
- Test SQL injection prevention
- Verify sensitive data encryption
- Check for exposed API keys
- Test file upload validation

## Test Execution

### Local Development
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/pos.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test --debug tests/e2e/pos.spec.ts
```

### Test Environments
1. **Local**: Full test suite on developer machine
2. **Staging**: Automated tests on staging server
3. **Production**: Smoke tests on production (non-destructive)

## Maintenance

### Regular Updates
- Update test data quarterly
- Review and refactor flaky tests
- Update screenshots for visual regression
- Keep Playwright and dependencies updated

### Documentation
- Document complex test scenarios
- Maintain test data catalog
- Keep this design doc updated
- Share learnings from test failures

## Metrics & Goals

### Coverage Goals
- **Feature Coverage**: 100% of user-facing features
- **Code Coverage**: >80% of critical paths
- **Role Coverage**: All user roles tested
- **Browser Coverage**: Chrome, Firefox, Safari, Mobile browsers

### Performance Goals
- **Test Suite Duration**: < 15 minutes
- **Individual Test**: < 30 seconds
- **Flaky Test Rate**: < 1%
- **Pass Rate**: > 98%

## Future Enhancements

1. **Visual Regression Testing**: Implement screenshot comparison
2. **Load Testing**: Simulate concurrent users
3. **Chaos Engineering**: Test resilience under failures
4. **Multi-language Testing**: Test i18n if implemented
5. **API Contract Testing**: Validate API schemas
6. **Component Testing**: Unit tests for React components

## Conclusion

This testing strategy ensures comprehensive coverage of AushadiExpress while maintaining fast, reliable, and maintainable tests. By following these principles, we can confidently deploy features knowing they work as expected across all user roles and scenarios.
