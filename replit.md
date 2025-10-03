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
- **Progressive Web App**: Full PWA support with installable app experience for mobile devices

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

### AI Integration
- **Gemini AI Agent**: Intelligent pharmacy assistant powered by Google Gemini API for database querying and business intelligence
- **Fallback System**: Database-driven fallback responses when AI is unavailable (handles low stock, inventory, sales queries)
- **Voice Recognition**: Stubbed voice input capabilities for future implementation
- **OCR Integration**: Google Cloud Vision API for invoice text extraction (requires service account credentials)
- **Remote AI**: OpenAI API integration for general chat and document analysis

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

### October 03, 2025 - AI Assistant Database Query Improvements

**AI Assistant Fixes:**
- Fixed Gemini AI integration to handle invalid API keys gracefully
- Enhanced fallback system to actually query database instead of returning generic responses
- Low stock queries now show actual products below 20 units with batch information
- Inventory queries display full product list with quantities and prices
- Most expensive product queries show top 5 items sorted by price
- All responses now include relevant quick action suggestions

**Production Deployment Fixes:**
- Fixed Google Cloud Vision service account path resolution for production using process.cwd()
- Fixed static file serving path for bundled production code
- Sales page now properly displays parsed sale items instead of raw JSON
- All path resolutions updated to work correctly in both development and production environments

**Technical Notes:**
- Gemini API key required for full AI functionality (set GEMINI_API_KEY environment variable)
- System gracefully degrades to database-driven responses when AI is unavailable
- Inner-period.json service account file required for Google Cloud Vision OCR features

### October 03, 2025 - Progressive Web App (PWA) Implementation

**PWA Installation Features:**
- Created web app manifest with proper metadata (name, icons, theme colors, display mode)
- Generated SVG app icons in multiple sizes (72x72 to 512x512) for all device types
- Added PWA meta tags to HTML (apple-touch-icon, theme-color, mobile-web-app-capable)
- Implemented install prompt component that detects and guides users through installation
- iOS Safari support with custom "Add to Home Screen" instructions
- Android Chrome support with native install prompt integration

**User Experience:**
- Install prompt appears after 3 seconds on first visit (dismissible and remembers user preference)
- Standalone display mode provides app-like experience without browser UI
- Portrait-primary orientation optimized for mobile pharmacy workflows
- Automatic detection of installed state to hide prompt when already installed

**Technical Implementation:**
- Manifest served from `/manifest.json` with proper MIME types
- Icons served from `/icons/` directory via Vite public folder
- Install prompt uses beforeinstallprompt API for Android/Chrome
- localStorage persistence for user preferences and dismissal state
- Platform detection for iOS vs Android installation flows