# AushadiExpress - Technical Architecture Documentation

**Version:** 1.0
**Last Updated:** October 10, 2025
**Prepared By:** Senior Solutions Architect

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [High-Level Architecture](#high-level-architecture)
5. [Technology Stack](#technology-stack)
6. [Data Architecture](#data-architecture)
7. [Application Architecture](#application-architecture)
8. [Security Architecture](#security-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Deployment Architecture](#deployment-architecture)
11. [Critical Recommendations](#critical-recommendations)
12. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
13. [Future Roadmap](#future-roadmap)

---

## 1. Executive Summary

**AushadiExpress** is a multi-tenant, B2C pharmaceutical marketplace platform that connects customers with local pharmacies. The system employs an offline-first architecture with real-time synchronization, enabling operation in low-connectivity environments while maintaining data integrity across distributed nodes.

### Key Capabilities
- **Multi-tenancy**: Isolated data per pharmacy/store with shared infrastructure
- **Offline-first**: IndexedDB-powered local storage with background sync
- **AI-powered**: Document OCR, intelligent search, and conversational AI assistance
- **Location-based**: Geospatial store discovery and inventory matching
- **Real-time**: WebSocket-powered notifications and order updates

---

## 2. System Overview

### Business Context
The platform addresses critical challenges in pharmaceutical distribution:
- **Inventory visibility** for small pharmacies
- **Customer convenience** through digital ordering
- **Compliance** with pharmaceutical regulations
- **Operational efficiency** through automation

### Core User Personas

```
┌──────────────────────────────────────────────────────────┐
│                    System Actors                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [Customers]           [Pharmacy Owners]     [System]    │
│    - Browse             - Manage Inventory    - AI Agent │
│    - Order              - Process Orders      - Analytics│
│    - Track              - Track Stock         - Sync     │
│    - Review             - Generate Reports    - Security │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Architecture Principles

### 3.1 Design Philosophy

1. **Offline-First Architecture**
   - All read operations work without network
   - Write operations queue locally and sync when online
   - Conflict resolution with last-write-wins strategy

2. **Progressive Enhancement**
   - Core features work on basic devices
   - Enhanced features for modern browsers
   - Graceful degradation for unsupported features

3. **Multi-tenancy with Data Isolation**
   - Row-Level Security (RLS) by tenant_id
   - Shared schema, isolated data
   - Tenant-specific rate limiting

4. **Mobile-First Responsive Design**
   - Touch-optimized interfaces
   - Minimal data transfer
   - Native-like interactions

5. **Security by Default**
   - Authentication required for all operations
   - Authorization checks at API and database layers
   - Encrypted data in transit and at rest

---

## 4. High-Level Architecture

### 4.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React SPA  │  │  IndexedDB   │  │ Service      │          │
│  │  (Vite/TSX)  │──│  (Dexie)     │  │ Worker       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                   │                 │
│         └──────────────────┴───────────────────┘                │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS/WSS
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    APPLICATION LAYER                             │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                     │
│  ┌──────────────────────────────────────────────────┐           │
│  │         Express.js Server (Node.js)              │           │
│  ├──────────────────────────────────────────────────┤           │
│  │  API Routes  │ Auth │ WebSocket │ File Upload    │           │
│  └──────────────────────────────────────────────────┘           │
│         │              │           │          │                  │
│  ┌──────┴────┐  ┌──────┴─────┐ ┌──┴────┐ ┌──┴─────┐            │
│  │ Business  │  │ Session    │ │ Real  │ │ AI     │            │
│  │ Logic     │  │ Mgmt       │ │ Time  │ │ Agent  │            │
│  └───────────┘  └────────────┘ └───────┘ └────────┘            │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                       DATA LAYER                                 │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │  File Storage │  │   AI APIs    │         │
│  │  (Neon DB)   │  │  (Cloud)      │  │  (Gemini)    │         │
│  │              │  │               │  │              │         │
│  │ - Products   │  │ - Invoices    │  │ - Vision OCR │         │
│  │ - Orders     │  │ - Docs        │  │ - NLP Chat   │         │
│  │ - Users      │  │ - Images      │  │ - Analysis   │         │
│  └──────────────┘  └───────────────┘  └──────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                              │
└─────────────────────────────────────────────────────────────┘

[Customer App]
      │
      │ 1. HTTP Request
      ▼
[API Gateway / Express Router]
      │
      │ 2. Session Validation
      ▼
[Authentication Middleware]
      │
      │ 3. Check Permissions
      ▼
[Authorization Middleware]
      │
      │ 4. Business Logic
      ▼
[Service Layer]
      │
      ├─────────────┬──────────────┐
      │             │              │
      ▼             ▼              ▼
[Database]   [AI Service]   [File Storage]
      │             │              │
      └─────────────┴──────────────┘
                    │
      5. Response / Error Handling
                    ▼
            [Response Formatting]
                    │
                    ▼
            [Customer App]
```

---

## 5. Technology Stack

### 5.1 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI Component Library |
| **Build Tool** | Vite | 5.4.19 | Fast HMR & Bundling |
| **Language** | TypeScript | 5.6.3 | Type Safety |
| **Routing** | Wouter | 3.3.5 | Lightweight SPA Routing |
| **State Management** | React Query | 5.60.5 | Server State & Caching |
| **Offline DB** | Dexie.js | 4.2.0 | IndexedDB Wrapper |
| **UI Components** | Radix UI | Various | Accessible Primitives |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-First CSS |
| **Forms** | React Hook Form | 7.55.0 | Form State Management |
| **Validation** | Zod | 3.24.2 | Schema Validation |
| **Charts** | Recharts | 2.15.2 | Data Visualization |
| **Icons** | Material Icons | - | Icon System |

### 5.2 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | JavaScript Runtime |
| **Framework** | Express.js | 4.21.2 | Web Server |
| **Language** | TypeScript | 5.6.3 | Type Safety |
| **Database ORM** | Drizzle ORM | 0.39.1 | Type-Safe SQL |
| **Database** | PostgreSQL | 14+ (Neon) | Primary Datastore |
| **Session Store** | connect-pg-simple | 10.0.0 | PostgreSQL Sessions |
| **Auth** | Passport.js | 0.7.0 | Authentication |
| **Password Hash** | bcrypt | 6.0.0 | Secure Hashing |
| **AI/ML** | Google Gemini API | 1.17.0 | Generative AI |
| **OCR** | Google Cloud Vision | 5.3.3 | Document OCR |
| **File Upload** | Multer | 2.0.2 | Multipart Handling |
| **WebSocket** | ws | 8.18.0 | Real-time Communication |

### 5.3 Infrastructure

```
┌─────────────────────────────────────────────────────┐
│              DEPLOYMENT ARCHITECTURE                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Replit / Cloud Platform]                          │
│    │                                                 │
│    ├─ Node.js Application Server                    │
│    │    - Express API                                │
│    │    - WebSocket Server                           │
│    │    - Static Asset Serving                       │
│    │                                                 │
│    ├─ Database (Neon PostgreSQL)                     │
│    │    - Connection Pooling                         │
│    │    - Auto-scaling                               │
│    │                                                 │
│    ├─ External Services                              │
│    │    - Google Cloud Vision (OCR)                  │
│    │    - Google Gemini (AI)                         │
│    │    - File Storage (Cloud)                       │
│    │                                                 │
│    └─ Session Store (PostgreSQL)                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 6. Data Architecture

### 6.1 Database Schema Design

#### Core Entities

```sql
-- Multi-tenant User Management
users
  ├─ id (UUID, PK)
  ├─ username (unique)
  ├─ password (bcrypt hashed)
  ├─ role (customer | retailer)
  ├─ tenantId (isolation key)
  ├─ pharmacyName
  ├─ pincode (geolocation)
  └─ onboarded (boolean)

-- Product Catalog (per tenant)
products
  ├─ id (UUID, PK)
  ├─ name
  ├─ description
  ├─ price
  ├─ totalQuantity
  ├─ batchNumber
  ├─ tenantId (FK to users.tenantId)
  └─ createdAt

-- Inventory Management
stock
  ├─ id (UUID, PK)
  ├─ productId (FK to products)
  ├─ productName
  ├─ batchNumber
  ├─ quantity
  ├─ expiryDate
  ├─ tenantId (isolation)
  └─ createdAt

-- Order Management
orders
  ├─ id (UUID, PK)
  ├─ customerId (FK to users)
  ├─ storeTenantId (seller)
  ├─ items (JSONB)
  ├─ totalAmount
  ├─ status (pending|confirmed|completed|cancelled)
  ├─ createdAt
  └─ updatedAt

-- Sales Tracking
sales
  ├─ id (UUID, PK)
  ├─ total
  ├─ items (JSON)
  ├─ tenantId (seller)
  ├─ customerId
  ├─ customerTenantId
  ├─ synced (offline sync flag)
  └─ date

-- Document Capture (AI-powered)
captures
  ├─ id (UUID, PK)
  ├─ uri (file path/base64)
  ├─ mode (barcode|invoice|prescription)
  ├─ ownerId (FK to users)
  ├─ persona (retailer|customer)
  ├─ saleId (optional FK)
  ├─ processed (boolean)
  ├─ metadata (JSON - extracted data)
  └─ createdAt
```

### 6.2 Multi-Tenancy Strategy

**Implementation Pattern: Shared Schema, Isolated Rows**

```typescript
// Every query MUST include tenant isolation
const getProducts = async (tenantId: string) => {
  return db.select()
    .from(products)
    .where(eq(products.tenantId, tenantId));
};

// Database-level enforcement (Future Enhancement)
// ALTER TABLE products ENABLE ROW LEVEL SECURITY;
// CREATE POLICY tenant_isolation ON products
//   FOR ALL TO authenticated
//   USING (tenant_id = current_setting('app.current_tenant')::text);
```

**Benefits:**
- Simple deployment and maintenance
- Cost-effective for small-medium scale
- Easy cross-tenant analytics (admin)

**Risks:**
- Potential for data leakage if tenant_id omitted
- Scaling limits per database
- Backup/restore affects all tenants

**Mitigation:**
- TypeScript types enforce tenantId parameter
- Middleware auto-injects tenantId from session
- Comprehensive integration tests for isolation
- Consider database-level RLS for production

### 6.3 Offline Storage (Client-Side)

**IndexedDB Schema (Dexie.js)**

```typescript
// client/src/lib/db.ts
AushadiExpressDB
  ├─ captures
  │    └─ Indexes: id, category, createdAt
  ├─ invoices
  │    └─ Indexes: id, captureId, createdAt
  ├─ invoiceLines
  │    └─ Indexes: id, invoiceId
  ├─ prescriptions
  │    └─ Indexes: id, captureId, createdAt
  ├─ bills
  │    └─ Indexes: id, captureId, createdAt
  └─ [category]Images (blob storage)
       └─ Index: id
```

**Synchronization Strategy:**

1. **Write-Through Pattern**
   ```
   User Action → Local Write → Background Sync → Server Write
   ```

2. **Conflict Resolution**
   - Last-write-wins (timestamp-based)
   - No complex CRDT implementation (simplicity over perfect consistency)
   - Manual conflict resolution for critical data

3. **Sync Worker Implementation**
   ```typescript
   // client/src/lib/sync-worker.ts
   - Monitors online/offline state
   - Queues failed writes
   - Retries with exponential backoff
   - Notifies user of sync status
   ```

---

## 7. Application Architecture

### 7.1 Frontend Architecture

**Pattern: Component-Based Architecture with Hooks**

```
client/src/
├─ components/           # Reusable UI components
│  ├─ ui/               # Shadcn/Radix primitives
│  ├─ customer-header.tsx
│  ├─ offline-indicator.tsx
│  └─ payment/
│
├─ pages/               # Route-level components
│  ├─ customer-cart.tsx
│  ├─ nearby-stores.tsx
│  ├─ orders.tsx
│  └─ scan-invoice.tsx
│
├─ hooks/               # Business logic hooks
│  ├─ use-auth.ts
│  ├─ use-cart.ts
│  ├─ use-favorites.ts
│  └─ use-offline.ts
│
├─ services/            # API & External Services
│  ├─ ai-vision.ts
│  ├─ pharmacy-agent.ts
│  └─ camera-capture.ts
│
├─ lib/                 # Core utilities
│  ├─ db.ts            # IndexedDB setup
│  ├─ sync-worker.ts   # Background sync
│  └─ utils.ts         # Helpers
│
└─ utils/               # Parsers & Formatters
   ├─ invoice-parser.ts
   └─ app-logger.ts
```

### 7.2 Backend Architecture

**Pattern: Layered Architecture (MVC-inspired)**

```
server/
├─ index.ts             # Application entry point
├─ vite.ts              # Dev server setup
│
├─ routes/              # API route handlers
│  ├─ auth.ts           # Authentication endpoints
│  ├─ intelligent-agent.ts
│  └─ api-key-management.ts
│
├─ routes.ts            # Main route registration
├─ ai-routes.ts         # AI-specific routes
│
├─ middleware/          # Request processing
│  └─ [auth, validation, error handling]
│
├─ services/            # Business logic
│  └─ gemini-agent.ts   # AI service integration
│
├─ utils/               # Helpers
│  └─ [various utilities]
│
├─ db.ts                # Database connection
└─ storage.ts           # File storage logic
```

### 7.3 API Design Patterns

**RESTful Conventions**

```
Authentication
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Products (Multi-tenant)
  GET    /api/products           # List (filtered by tenantId)
  GET    /api/products/:id       # Detail
  POST   /api/products           # Create (retailer only)
  PUT    /api/products/:id       # Update (retailer only)
  DELETE /api/products/:id       # Delete (retailer only)

Orders
  GET    /api/orders             # List (customer: my orders, retailer: incoming)
  POST   /api/orders             # Create (customer only)
  PUT    /api/orders/:id         # Update status (retailer only)
  GET    /api/orders/:id         # Order details

Nearby Stores (Location-based)
  GET    /api/nearby-stores?lat={lat}&lon={lon}&radius={km}

AI Services
  POST   /api/ai/analyze-invoice
  POST   /api/ai/chat
  POST   /api/ai/extract-prescription

File Upload
  POST   /api/upload
```

**Response Format Standardization**

```typescript
// Success Response
{
  "success": true,
  "data": { /* response payload */ },
  "meta": {
    "page": 1,
    "total": 100,
    "timestamp": "2025-10-10T12:00:00Z"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product name is required",
    "field": "name"
  }
}
```

---

## 8. Security Architecture

### 8.1 Authentication & Authorization

**Authentication Flow**

```
┌─────────────────────────────────────────────────────┐
│         SESSION-BASED AUTHENTICATION                 │
└─────────────────────────────────────────────────────┘

1. User submits credentials
   │
   ▼
2. Server validates with bcrypt
   │
   ▼
3. Passport.js creates session
   │
   ▼
4. Session stored in PostgreSQL
   │
   ▼
5. Session cookie sent to client
   │
   ▼
6. Subsequent requests include cookie
   │
   ▼
7. Server validates session on each request
```

**Current Implementation:**
```typescript
// server/index.ts
app.use(session({
  store: new PgSession({ pool: pgPool }),
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JavaScript access
    maxAge: 7 days,
    sameSite: 'none'     // Cross-origin (iframe support)
  }
}));
```

### 8.2 Security Vulnerabilities & Fixes

#### CRITICAL ISSUES

1. **Missing Rate Limiting**
   - **Risk**: Brute force attacks, DDoS
   - **Impact**: Account compromise, service downtime
   - **Fix**: Implement express-rate-limit
   ```typescript
   import rateLimit from 'express-rate-limit';

   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 attempts
     message: 'Too many login attempts'
   });

   app.post('/api/auth/login', authLimiter, loginHandler);
   ```

2. **SQL Injection via ORM**
   - **Current**: Drizzle ORM provides protection
   - **Risk**: Raw SQL queries bypass protection
   - **Action**: Audit for `sql` template usage
   - **Recommendation**: Always use parameterized queries

3. **XSS Attack Surface**
   - **Risk**: User-generated content rendering
   - **Mitigation**: React escapes by default
   - **Action Required**: Sanitize `dangerouslySetInnerHTML` usage

4. **CSRF Protection**
   - **Status**: NOT IMPLEMENTED
   - **Risk**: Unauthorized actions via malicious sites
   - **Fix**: Add CSRF tokens
   ```typescript
   import csrf from 'csurf';
   app.use(csrf({ cookie: true }));
   ```

5. **File Upload Security**
   - **Risk**: Malicious file uploads (shell scripts, malware)
   - **Fix**: Implement strict validation
   ```typescript
   const fileFilter = (req, file, cb) => {
     const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
     if (allowedTypes.includes(file.mimetype)) {
       cb(null, true);
     } else {
       cb(new Error('Invalid file type'));
     }
   };

   const upload = multer({
     storage,
     fileFilter,
     limits: { fileSize: 10 * 1024 * 1024 } // 10MB
   });
   ```

### 8.3 Data Protection

**Encryption Strategy**

| Data Type | At Rest | In Transit | Method |
|-----------|---------|------------|--------|
| Passwords | ✅ bcrypt (cost=10) | ✅ HTTPS | Salted hash |
| Sessions | ✅ PostgreSQL | ✅ HTTPS | Encrypted cookie |
| API Keys | ⚠️ Env vars | ✅ HTTPS | Need vault |
| User Data | ✅ Database | ✅ HTTPS | TLS 1.3 |
| Files | ❌ Plain | ✅ HTTPS | **Need encryption** |

**Recommendations:**
1. Use AWS KMS or HashiCorp Vault for secrets
2. Implement field-level encryption for PII
3. Enable database encryption at rest (Neon supports)

### 8.4 OWASP Top 10 Compliance

| Vulnerability | Status | Mitigation |
|--------------|--------|------------|
| A01: Broken Access Control | ⚠️ Partial | Need RBAC enforcement |
| A02: Cryptographic Failures | ⚠️ Partial | Need file encryption |
| A03: Injection | ✅ Protected | Drizzle ORM |
| A04: Insecure Design | ⚠️ Review | Need threat modeling |
| A05: Security Misconfiguration | ⚠️ Partial | Audit configs |
| A06: Vulnerable Components | ⚠️ Ongoing | Dependabot alerts |
| A07: Auth Failures | ❌ High Risk | No rate limiting |
| A08: Data Integrity Failures | ⚠️ Partial | Need checksums |
| A09: Logging Failures | ❌ Missing | Implement audit logs |
| A10: SSRF | ✅ Low Risk | No external fetches |

---

## 9. Scalability & Performance

### 9.1 Current Bottlenecks

1. **Database Connection Pool**
   - Single PostgreSQL instance
   - No read replicas
   - Connection exhaustion possible at scale

2. **File Storage**
   - No CDN integration
   - Large files served from app server
   - High bandwidth consumption

3. **AI API Rate Limits**
   - Google Gemini quota limits
   - No request queuing
   - Potential service degradation

4. **Session Storage**
   - PostgreSQL session table grows unbounded
   - No automatic cleanup

### 9.2 Scalability Recommendations

#### Immediate Actions (0-3 months)

```typescript
// 1. Implement Database Connection Pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,  // Close idle after 30s
  connectionTimeoutMillis: 2000,
});

// 2. Add Response Caching
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

const cacheMiddleware = async (req, res, next) => {
  const key = `cache:${req.url}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Store original res.json
  const originalJson = res.json;
  res.json = function(data) {
    redis.setEx(key, 300, JSON.stringify(data)); // 5 min TTL
    return originalJson.call(this, data);
  };

  next();
};

// 3. Implement Request Queuing for AI
import Queue from 'bull';

const aiQueue = new Queue('ai-processing', {
  redis: process.env.REDIS_URL
});

aiQueue.process(async (job) => {
  return await processAIRequest(job.data);
});

// 4. Add Health Checks
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: process.memoryUsage(),
  };
  res.json(health);
});
```

#### Medium-term (3-6 months)

1. **Horizontal Scaling**
   ```
   [Load Balancer]
         │
         ├─ [App Server 1]
         ├─ [App Server 2]
         └─ [App Server N]
              │
              ├─ [Database Primary]
              │     └─ [Read Replicas]
              │
              ├─ [Redis Cluster]
              └─ [File Storage CDN]
   ```

2. **Database Sharding (by tenantId)**
   - Shard 1: tenants A-M
   - Shard 2: tenants N-Z
   - Route queries based on tenant

3. **Microservices Extraction**
   ```
   - API Gateway
   - Auth Service
   - Product Service
   - Order Service
   - AI Service
   - Notification Service
   ```

#### Long-term (6-12 months)

1. **Event-Driven Architecture**
   ```
   Order Created → [Event Bus] → [Inventory Service]
                               → [Notification Service]
                               → [Analytics Service]
   ```

2. **Global Distribution**
   - Multi-region deployment
   - Edge caching (CloudFlare/Fastly)
   - Geo-routing

### 9.3 Performance Optimization

**Frontend Optimizations**

```typescript
// 1. Code Splitting
const CustomerCart = lazy(() => import('./pages/customer-cart'));
const NearbyStores = lazy(() => import('./pages/nearby-stores'));

// 2. Image Optimization
<img
  src={thumbnail}
  srcSet={`${thumbnail} 320w, ${medium} 768w, ${large} 1024w`}
  loading="lazy"
  decoding="async"
/>

// 3. Virtual Scrolling for Long Lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={80}
>
  {ProductRow}
</FixedSizeList>

// 4. Memoization
const expensiveCalculation = useMemo(() => {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
}, [products]);

// 5. Debounced Search
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Backend Optimizations**

```typescript
// 1. Database Query Optimization
// Bad: N+1 query
const orders = await db.select().from(orders);
for (const order of orders) {
  order.items = await db.select().from(orderItems)
    .where(eq(orderItems.orderId, order.id));
}

// Good: Single query with join
const orders = await db
  .select()
  .from(orders)
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId));

// 2. Indexing Strategy
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);
CREATE INDEX idx_stock_product ON stock(product_id, expiry_date);

// 3. Response Compression
import compression from 'compression';
app.use(compression());

// 4. ETags for Caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 min
  next();
});
```

### 9.4 Performance Metrics & Monitoring

**Key Metrics to Track**

```typescript
// Application Performance
- Response Time (p50, p95, p99)
- Throughput (req/sec)
- Error Rate (%)
- Apdex Score

// Infrastructure
- CPU Usage
- Memory Usage
- Database Connections
- Queue Depth

// Business Metrics
- Orders/hour
- Search latency
- Cart abandonment rate
- Checkout success rate
```

**Recommended Tools**
- **APM**: New Relic, DataDog, or Sentry
- **Logging**: Winston + Elasticsearch/Loki
- **Tracing**: OpenTelemetry
- **Uptime**: UptimeRobot, Pingdom

---

## 10. Deployment Architecture

### 10.1 Current Deployment

```
┌──────────────────────────────────────────┐
│         Replit Deployment                 │
├──────────────────────────────────────────┤
│                                           │
│  Single Container:                        │
│    - Node.js (Express + Vite)            │
│    - Static files served from /dist      │
│                                           │
│  External Services:                       │
│    - Neon PostgreSQL (managed)           │
│    - Google Cloud APIs                    │
│                                           │
└──────────────────────────────────────────┘
```

**Limitations:**
- Single point of failure
- No auto-scaling
- Limited resource allocation
- Downtime during deployments

### 10.2 Production-Ready Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CDN (CloudFlare)                        │
│              Static Assets + DDoS Protection            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Load Balancer (AWS ALB/NLB)                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
┌────────▼─────┐ ┌──▼─────┐ ┌───▼──────┐
│ App Server 1 │ │ Server │ │ Server N │  (Auto-scaling)
└────────┬─────┘ └────┬───┘ └────┬─────┘
         │            │          │
         └────────────┼──────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
┌────────▼────┐ ┌─────▼────┐ ┌────▼─────┐
│ PostgreSQL  │ │  Redis   │ │  Object  │
│ Primary +   │ │ Cluster  │ │ Storage  │
│ Replicas    │ │          │ │ (S3/GCS) │
└─────────────┘ └──────────┘ └──────────┘
```

### 10.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Type check
        run: npm run check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build application
        run: npm run build
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy to cloud platform
          # Run database migrations
          # Health check
          # Rollback if failed
```

### 10.4 Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://host:6379
REDIS_TLS=true

# Session
SESSION_SECRET=<strong-random-string>
SESSION_TTL=604800

# AI Services
GEMINI_API_KEY=<key>
GEMINI_RATE_LIMIT=100

# File Storage
STORAGE_BUCKET=aushadiexpress-prod
STORAGE_CDN=https://cdn.aushadiexpress.com

# Monitoring
SENTRY_DSN=https://...
DATADOG_API_KEY=<key>

# Feature Flags
FEATURE_AI_ASSISTANT=true
FEATURE_PRESCRIPTION_UPLOAD=true
```

---

## 11. Critical Recommendations

### 11.1 Immediate Actions (Priority: CRITICAL)

1. **Implement Rate Limiting**
   - **Timeline**: 1 week
   - **Effort**: 4 hours
   - **Impact**: Prevents brute force, reduces server load

2. **Add CSRF Protection**
   - **Timeline**: 1 week
   - **Effort**: 2 hours
   - **Impact**: Prevents unauthorized actions

3. **Setup Error Logging & Monitoring**
   - **Timeline**: 2 weeks
   - **Effort**: 1 day
   - **Impact**: Detect issues before users report

4. **Implement Health Checks**
   - **Timeline**: 1 week
   - **Effort**: 3 hours
   - **Impact**: Enable automated monitoring

5. **Add Input Validation**
   - **Timeline**: 2 weeks
   - **Effort**: 3 days
   - **Impact**: Prevent injection attacks

### 11.2 Short-term Improvements (Priority: HIGH)

1. **Database Optimization**
   - Add missing indexes
   - Implement query result caching
   - Setup read replicas

2. **File Storage Migration**
   - Move to cloud object storage (S3/GCS)
   - Implement CDN
   - Add virus scanning

3. **API Documentation**
   - Implement OpenAPI/Swagger
   - Generate interactive docs
   - Version API endpoints

4. **Automated Testing**
   - Unit tests (70% coverage target)
   - Integration tests
   - E2E tests (Playwright/Cypress)

5. **Performance Optimization**
   - Frontend code splitting
   - Image optimization
   - API response compression

### 11.3 Long-term Enhancements (Priority: MEDIUM)

1. **Microservices Migration**
   - Extract AI service
   - Separate notification service
   - Implement API gateway

2. **Advanced Analytics**
   - User behavior tracking
   - Business intelligence dashboard
   - Predictive inventory management

3. **Mobile Native Apps**
   - React Native for iOS/Android
   - Push notifications
   - Offline capabilities

4. **Compliance & Certifications**
   - HIPAA compliance (if handling prescriptions)
   - SOC 2 Type II
   - ISO 27001

---

## 12. Risk Assessment & Mitigation

### 12.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Database failure | Medium | Critical | Automated backups, read replicas, failover |
| DDoS attack | High | High | CDN, rate limiting, WAF |
| Data breach | Medium | Critical | Encryption, auditing, penetration testing |
| Third-party API outage | High | Medium | Circuit breakers, fallback mechanisms |
| Scaling bottleneck | High | High | Horizontal scaling, caching, load balancing |
| Session hijacking | Low | High | Secure cookies, HTTPS only, short TTL |
| Dependency vulnerability | High | Medium | Dependabot, automated updates, security scans |

### 12.2 Business Risks

| Risk | Mitigation |
|------|------------|
| **Regulatory Compliance** | Consult legal, implement audit logs, data retention policies |
| **Vendor Lock-in** | Use abstraction layers, prefer open standards |
| **Key Personnel Loss** | Documentation, code reviews, knowledge sharing |
| **Market Competition** | Continuous innovation, user feedback loops |

### 12.3 Operational Risks

**Disaster Recovery Plan**

```
Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour

Backup Strategy:
- Database: Continuous replication + hourly snapshots
- Files: Versioned object storage
- Code: Git repository (GitHub)

Incident Response:
1. Detection (automated monitoring)
2. Triage (on-call engineer)
3. Mitigation (runbook execution)
4. Communication (status page)
5. Post-mortem (root cause analysis)
```

---

## 13. Future Roadmap

### Phase 1: Stabilization (Q4 2025)
- ✅ Fix critical security vulnerabilities
- ✅ Implement monitoring & alerting
- ✅ Optimize database performance
- ✅ Setup CI/CD pipeline
- ✅ Achieve 80% test coverage

### Phase 2: Scale (Q1 2026)
- Horizontal scaling with load balancer
- Redis caching layer
- CDN for static assets
- Read replicas for database
- API versioning

### Phase 3: Advanced Features (Q2 2026)
- AI-powered inventory prediction
- Real-time order tracking (GPS)
- Video consultation with pharmacists
- Subscription model for chronic medications
- Loyalty program integration

### Phase 4: Expansion (Q3-Q4 2026)
- Multi-language support (i18n)
- Multi-currency support
- International shipping
- Partner API for third-party integrations
- White-label solution for pharmacy chains

---

## Appendix

### A. Glossary

- **Multi-tenancy**: Architecture where single instance serves multiple customers (tenants)
- **Offline-first**: Application works without network, syncs when online
- **ORM**: Object-Relational Mapping (Drizzle ORM in this case)
- **RLS**: Row-Level Security (database-level access control)
- **CRDT**: Conflict-free Replicated Data Type (for distributed systems)
- **Circuit Breaker**: Pattern to prevent cascading failures

### B. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### C. Contact & Support

- **Architecture Review**: Monthly review meetings
- **Security Audits**: Quarterly penetration testing
- **Performance Reviews**: Continuous monitoring with monthly reports
- **Technology Updates**: Quarterly dependency updates

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-10 | Senior Architect | Initial comprehensive architecture documentation |

**Approval**

- [ ] Technical Lead
- [ ] CTO
- [ ] Security Officer
- [ ] DevOps Lead

---

*This document is confidential and proprietary to AushadiExpress. Unauthorized distribution is prohibited.*
