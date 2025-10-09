# Pharma-Empire OS

## Overview

Pharma-Empire OS is an offline-first pharmacy Point of Sale (POS) and compliance platform designed as a full-stack web application. It ensures seamless operation in offline environments with background synchronization, making it ideal for pharmacies with unreliable internet. The system supports multi-tenancy for data isolation, a dual-role architecture for B2B (retailer/wholesaler/distributor) and B2C (customer) users, and integrates AI for enhanced business intelligence and compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend**: React with TypeScript and Vite.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Routing**: Wouter for lightweight client-side routing.
- **Mobile-First**: Responsive design with bottom navigation optimized for mobile/tablet.
- **PWA Support**: Full Progressive Web App capabilities including installable app experience.
- **Dual-Role UX**: Separate user experiences for customers (B2C) and businesses (B2B).
- **Cart Experience**: Full-page cart (not modal), modern mobile ecommerce design with store grouping, sticky checkout, and instant add-to-cart via +/- buttons.
- **Accessibility**: All interactive elements meet 44px minimum tap target requirement for mobile accessibility.

### Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript, and ES modules.
- **API**: RESTful API endpoints for products, stock, sales, and sync operations.
- **Error Handling**: Centralized middleware with structured responses.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations and migrations.
- **Offline-First**: Outbox pattern for offline operations, browser localStorage for local data persistence, and background sync worker.
- **Authentication**: Express sessions with PostgreSQL session store, user authentication, and multi-tenancy with user-scoped data access and unique tenant IDs.
- **Role-Based Access**: Supports customer, retailer, wholesaler, distributor roles with distinct UX flows and validation.
- **Receiving Workflow**: Beta feature for managing purchase orders and receiving items with invoice scanning.
- **Payment Sheet**: CollectPaymentSheet with Cash/UPI/Card options.
- **Camera Service**: Enhanced camera permission handling and barcode scanner integration.

### System Design Choices
- **Monorepo Structure**: Clear separation between client, server, and shared code for efficient development and type safety.
- **Data Isolation**: Comprehensive multi-tenant architecture ensuring full data isolation between tenants.
- **Security**: Robust authentication middleware, tenant context validation, and immutability protection for tenant IDs.
- **AI Integration**: Gemini AI Agent for database querying and business intelligence with a database-driven fallback system.
- **PWA Features**: Web app manifest, multi-sized icons, PWA meta tags, and an install prompt component for an app-like experience.

## External Dependencies

- **Database**: Neon PostgreSQL serverless database.
- **UI Components**: Radix UI primitives, Tailwind CSS.
- **AI**: Google Gemini API, Google Cloud Vision API (for OCR), OpenAI API (for general chat/document analysis).
- **Validation**: Zod for runtime validation.
- **Build Tools**: Vite (frontend), esbuild (backend).
- **Session Management**: `connect-pg-simple` for PostgreSQL session store.