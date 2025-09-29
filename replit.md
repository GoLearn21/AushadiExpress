# Pharma-Empire OS

## Overview

Pharma-Empire OS is an offline-first pharmacy Point of Sale (POS) and compliance platform built as a full-stack web application. The system is designed to function seamlessly in offline environments with background synchronization capabilities, making it ideal for pharmacy operations with unreliable internet connectivity. The application features a React frontend with TypeScript, an Express.js backend, and uses PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Mobile-First Design**: Responsive design with bottom navigation optimized for mobile/tablet usage

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for products, stock, sales, and sync operations
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development**: Hot reload with Vite integration for seamless development experience

### Data Storage Solutions
- **Primary Database**: PostgreSQL with connection via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Local Storage**: Browser localStorage for offline data persistence
- **Offline-First Design**: Outbox pattern implementation for handling offline operations
- **Schema**: Structured tables for users, products, stock, sales, sync outbox, purchase orders, and receiving items

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User Management**: User authentication system with username/password
- **Data Isolation**: User-scoped data access patterns

### External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS with custom design system variables
- **Development Tools**: Replit-specific tooling and error handling
- **Build System**: Vite for frontend bundling and esbuild for backend compilation
- **Type Safety**: Zod for runtime validation and schema inference

### Offline-First Sync Architecture
- **Sync Worker**: Background synchronization service that monitors network status
- **Outbox Pattern**: Local queue for operations performed while offline
- **Conflict Resolution**: Timestamp-based conflict resolution for data synchronization
- **Network Detection**: Automatic sync resumption when connectivity is restored

### AI Integration (Stubbed)
- **Assistant Interface**: Prepared hooks for future on-device LLM integration
- **Voice Recognition**: Stubbed voice input capabilities for future implementation
- **OCR Integration**: Placeholder for optical character recognition features
- **Remote AI**: Configurable OpenAI API integration for remote AI assistance

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment while maintaining type safety across the entire stack.

## Recent Changes

### September 05, 2025 - AushadiExpress Rebrand & UX Improvements

**Payment Sheet Implementation:**
- Added CollectPaymentSheet component with Cash/UPI/Card payment options
- Integrated cash-only mode toggle in settings (localStorage persistence)
- Fixed outbox persistence to ensure sales are queued for offline sync
- UPI Lite payment stub for offline transactions with analytics tracking

**Receiving Workflow Beta:**
- Added purchaseOrders and receivingItems tables to database schema
- Created receiving workflow page with invoice scan and PO entry modes
- Implemented receiving beta toggle in settings with localStorage persistence  
- Added conditional receiving FAB that appears only when beta is enabled
- OCR invoice scanning placeholder for future implementation

**Navigation & UX Improvements:**
- Fixed swipe-right gesture on home screen to navigate directly to POS
- Added capability tier badge to header showing VALUE/MAINSTREAM/PREMIUM
- Responsive bill drawer with max-width constraints for mobile devices
- Enhanced settings page with toggle switches for payment and receiving options

**Technical Enhancements:**
- Camera permission handling with fallback modals for graceful degradation
- Device capability detection service for performance optimization
- FAB tooltip system with first-launch persistence using localStorage
- Improved error handling and TypeScript schema definitions

### September 06, 2025 - Camera Service & Scanner Flow Improvements

**Camera Permission Service Enhancements:**
- Updated ensureCamera API with backward compatibility for both onGranted/onDenied and onOK/onFail callback patterns
- Added comprehensive error handling with user-friendly messages for different camera error types (NotFoundError, NotReadableError, OverconstrainedError, etc.)
- Improved permission status management with better localStorage structure and legacy compatibility
- Enhanced permission state tracking with timestamps and automatic cleanup of stale permissions

**Barcode Scanner Flow Improvements:**
- Fixed scanner fallback flow to show file input option instead of immediately navigating away on camera failure
- Implemented proper barcode result passing from BarcodeScannerScreen to POS using URL query parameters
- Added seamless handoff between scanner and POS with automatic URL cleanup and product addition
- Enhanced user feedback with contextual toast messages for different scanner states

**User Experience Improvements:**
- Better error messages guide users through camera permission issues with specific instructions
- File input fallback ensures scanning functionality works even without camera access
- Improved toast notifications with distinct styling for errors vs success messages
- Scanner remains functional and provides alternatives when camera is unavailable