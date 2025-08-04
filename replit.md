# OfficeTrack - Employee Attendance System

## Overview

OfficeTrack is a modern employee attendance tracking system built with a full-stack TypeScript architecture. The system monitors employee presence through Wi-Fi device detection and provides comprehensive attendance management capabilities. It features a React frontend with shadcn/ui components, an Express.js backend, and uses Drizzle ORM for database operations with PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side navigation
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas shared between frontend and backend
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Design
- **Primary Database**: PostgreSQL via Neon Database serverless
- **Schema Management**: Drizzle Kit for migrations and schema pushing
- **ORM**: Drizzle ORM with type-safe queries and operations
- **Connection**: Neon serverless connection pool with WebSocket support
- **Core Tables**:
  - `employees`: Staff information, work schedules, and active status
  - `devices`: Wi-Fi device registration and connectivity tracking
  - `attendance_records`: Daily attendance logs with automatic check-in/out times
- **Sample Data**: Automatically initialized on first startup with employees, devices, and attendance records

## Key Components

### Employee Management
- **Purpose**: Manage staff roster and employee information
- **Features**: CRUD operations, department organization, active status tracking, search/filter functionality, bulk CSV import
- **Implementation**: Form-based interface with real-time validation and advanced filtering

### Device Registration
- **Purpose**: Link employee devices (phones, laptops) to attendance tracking
- **Features**: MAC address registration, connectivity status monitoring, live status indicators
- **Implementation**: Device-employee association with connection simulation and real-time monitoring

### Attendance Tracking
- **Purpose**: Monitor daily attendance through device presence detection
- **Features**: Automatic check-in/out, late arrival detection, attendance statistics, detailed analytics
- **Implementation**: Real-time status updates with configurable refresh intervals and comprehensive tracking

### Dashboard & Analytics
- **Purpose**: Provide overview of daily attendance and key metrics
- **Features**: Live statistics, attendance charts, recent activity feed, network health monitoring, notification system
- **Implementation**: Auto-refreshing components with interactive visualizations and real-time alerts

### Enhanced Reporting
- **Purpose**: Generate detailed employee attendance analytics
- **Features**: Individual employee reports, late arrival analysis, work hours tracking, punctuality metrics
- **Implementation**: Interactive charts, CSV export, comprehensive statistics with historical data

### Reporting System
- **Purpose**: Generate comprehensive attendance reports and analytics
- **Features**: Date range filtering, CSV export, employee-specific reports, detailed analytics
- **Extended Features**: Employee detail reports with late arrival tracking, hours analysis, punctuality metrics
- **Implementation**: Server-side report generation with client-side export and interactive charts

## Data Flow

### Attendance Detection Flow
1. Devices connect to office Wi-Fi network
2. System simulates device connectivity changes every 2 minutes
3. Connected devices trigger automatic check-in for associated employees
4. Disconnection after work hours triggers check-out
5. Attendance records are created/updated in real-time
6. Dashboard reflects changes within 30-second refresh cycle

### User Interface Flow
1. Sidebar navigation provides access to all modules
2. Header displays real-time clock and Wi-Fi connectivity status
3. Forms use React Hook Form with Zod validation
4. API calls managed through TanStack Query for caching and synchronization
5. Toast notifications provide user feedback for all operations

## External Dependencies

### UI Framework Dependencies
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Backend Dependencies
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Express.js**: Web application framework
- **Zod**: Runtime type validation and schema definition

### Development Dependencies
- **Vite**: Fast build tool with Hot Module Replacement
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and error overlay
- **Backend**: tsx for TypeScript execution with automatic restarts
- **Database**: Drizzle Kit for schema migrations and database pushing
- **Asset Handling**: Vite handles static assets and bundling

### Production Build Process
1. Frontend builds to `dist/public` directory via Vite
2. Backend compiles to `dist` directory via ESBuild
3. Static files served by Express in production mode
4. Database migrations applied via Drizzle Kit commands

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Static Assets**: Express serves built frontend assets in production
- **Error Handling**: Comprehensive error boundaries and API error responses

### Scalability Considerations
- PostgreSQL database implementation with persistent data storage
- Database storage interface optimized for performance with proper indexing
- Session management configured for multi-instance deployment
- Real-time features implemented via polling (can be upgraded to WebSockets)
- Automatic database initialization with sample data on first startup