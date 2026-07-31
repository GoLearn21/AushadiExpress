 # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                    # Start dev server (Express + Vite HMR) on port 3001

# Build
npm run build                  # Build client (Vite) + bundle server (esbuild) → dist/

# Production
npm start                      # Run production build from dist/

# Type checking
npm run check                  # TypeScript check (tsc)

# Database
npm run db:push                # Push schema changes via drizzle-kit

# Testing (Playwright E2E)
npm run test:e2e               # Full test suite
npm run test:e2e:headed        # With visible browser
npm run test:e2e:ui            # Interactive Playwright UI
npm run test:e2e:debug         # Debug mode
npm run test:e2e:chromium      # Single browser
npm run test:e2e:report        # View HTML report

# Production smoke tests
npm run test:prod              # Against production URL
npm run test:prod:headed       # Headed production tests
```

## Architecture

**Multi-tenant B2C pharmaceutical marketplace** — customers search medicines and order from local pharmacies. Retailers manage POS/inventory. Wholesalers handle B2B operations. Offline-first with AI-powered document processing.

### Stack

- **Server**: Express.js + TypeScript (ESM), session auth via Passport.js + PostgreSQL-backed sessions
- **Client**: React 18 + Vite, Wouter (routing), TanStack Query (server state), Radix UI + Tailwind CSS
- **Database**: PostgreSQL (Neon serverless) via Drizzle ORM
- **Offline**: IndexedDB (Dexie) with outbox pattern for sync
- **AI**: Google Cloud Vision (OCR), Google Gemini + OpenAI (chat/analysis)
- **PWA**: vite-plugin-pwa + Workbox (service worker, installable)

### Key Directories

- `server/` — Express server, routes, services, middleware
- `server/routes/` — Feature-specific route modules (auth, wholesaler, pharmacy-orders, etc.)
- `server/services/` — AI agents (Gemini, OMS, Excel parser)
- `client/src/pages/` — React pages (~34 files); subfolders: `retailer/`, `wholesaler/`
- `client/src/services/` — Client-side services (camera, AI vision, pharmacy agent)
- `client/src/lib/` — Utilities (offline DB, query client, sync worker, theme)
- `shared/schema.ts` — **Single source of truth** for all DB tables (40+ pgTable definitions) + Zod validators, shared by server and client
- `migrations/` — Drizzle SQL migrations
- `tests/e2e/` — Playwright specs (144+ tests across 9 files)

### How It Connects

1. **Schema-first**: `shared/schema.ts` defines tables with Drizzle and generates Zod insert schemas. Both server and client import types from here.
2. **Data access**: `server/storage.ts` is the data access layer — all DB queries go through this module.
3. **Route registration**: `server/routes.ts` is the main orchestrator (~40KB) containing core business logic (POS, stock FEFO allocation, invoice processing). Feature routes in `server/routes/` are mounted in `server/index.ts`.
4. **Client routing**: `client/src/App.tsx` defines 40+ Wouter routes wrapped in a `SetupGate` auth guard.
5. **API calls**: Client uses TanStack Query with automatic `/api` prefix (configured in `client/src/lib/queryClient.ts`). Credentials are included for session cookies.
6. **Multi-tenancy**: All tables have a `tenantId` column. Tenant context is extracted via middleware (`server/middleware/tenant-context.ts`).
7. **Offline flow**: Writes go to IndexedDB + outbox table → service worker syncs when online → server processes queued operations.

### Roles

- **customer** — search medicines, browse stores, place orders
- **retailer** — POS, inventory, order fulfillment, invoice scanning
- **wholesaler** — B2B catalog, bulk import, pricing tiers, credit management

### Deployment

- **Railway** (`railway.toml`): Docker container, health check at `/api/status`
- **Vercel** (`vercel.json`): Serverless function + SPA rewrites
- **Docker** (`Dockerfile`): Node 22-alpine, multi-stage build

### Path Aliases (tsconfig + vite)

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Environment Variables

Required: `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`
Optional: `GEMINI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `PORT` (default 3001 dev / 5000 prod)
