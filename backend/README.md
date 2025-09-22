# BarFlow Backend

A NestJS-based backend for nightclub inventory management and table service system.

## Features

- **Role-based Authentication**: Admin, Bar, and Waiter roles with JWT authentication
- **Database Models**: Complete PostgreSQL schema with TypeORM entities
- **Inventory Management**: Track drinks, categories, pricing, and stock levels
- **Order Management**: Handle table orders from clients to delivery
- **Payment System**: Support for QR code and cash payments with verification
- **Comprehensive Logging**: Track all payment and order activities

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend folder
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=barflow_db
   JWT_SECRET=your-super-secret-jwt-key
   ```

5. Create the database (PostgreSQL):
   ```sql
   CREATE DATABASE barflow_db;
   ```

6. Run the application:
   ```bash
   npm run start:dev
   ```

### Database Setup

The application uses TypeORM with `synchronize: true` in development mode, which will automatically create tables based on the entities.

To seed the database with default users:
```bash
npm run ts-node src/database/seed.ts
```

This creates:
- Admin user: `admin` / `admin123`
- Bar user: `baruser` / `bar123`
- Waiter user: `waiter` / `waiter123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/profile` - Get current user profile

### User Roles

1. **Administrator**:
   - Manage inventory (CRUD operations)
   - View cost prices and profit margins
   - Assign waiters to bars and tables
   - View reports and analytics
   - Register new users

2. **Bar User**:
   - Verify payments via bank API
   - Approve drink delivery
   - View payment logs
   - Cannot see cost prices

3. **Waiter User**:
   - Confirm client payments
   - Deliver drinks to assigned tables
   - View assigned tables and orders
   - Cannot see cost prices

## Database Schema

The system includes the following main entities:

- **Users**: System users with role-based access
- **Bars**: Bar locations with assigned waiters
- **Waiters**: Links users to bars and tables
- **Tables**: Individual tables with QR codes
- **Inventory**: Drink products with pricing and stock
- **Orders**: Customer orders with status tracking
- **OrderItems**: Individual items within orders
- **Payments**: Payment tracking with verification
- **PaymentLogs**: Complete payment activity history

## Development

### Build
```bash
npm run build
```

### Testing
```bash
npm run test
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## Next Steps

1. Implement inventory CRUD operations with role-based access control
2. Create order management system (client → waiter → bar verification)
3. Integrate bank API for QR payment processing
4. Add comprehensive logging and reporting features
5. Build the Next.js frontend

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator
- **Environment**: Node.js