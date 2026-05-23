# Allo Health Inventory Reservation System

A full-stack inventory reservation system built for the Allo Health engineering take-home assignment.

---

# Live Demo

https://allohealth-inventory-system-9nal9b48n.vercel.app/

---

# GitHub Repository

https://github.com/kriscodes123/allohealth-inventory-system

---

# Problem Statement

This project solves the inventory race-condition problem during e-commerce checkout flows.

When payment takes time (3DS authentication, UPI confirmation, wallet redirects, etc.), multiple customers may simultaneously attempt to purchase the same inventory unit.

If stock is decremented only after payment succeeds:
- multiple customers may successfully pay for the same physical item
- overselling occurs
- refunds and operational issues follow

If stock is decremented too early:
- inventory appears unavailable
- abandoned carts unnecessarily block stock
- conversion rate decreases

To solve this, the system introduces temporary inventory reservations:
- inventory is reserved during checkout
- reservations expire automatically after a short duration
- confirmed payments permanently deduct stock
- failed/cancelled payments release inventory back to availability

---

# Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Backend
- Next.js API Routes
- Prisma ORM

## Database
- PostgreSQL (Neon hosted database)

## Deployment
- Vercel

---

# Features Implemented

## Inventory Management
- Multi-warehouse inventory support
- Product inventory tracking per warehouse
- Dynamic available stock calculation

---

## Reservation Workflow
- Temporary inventory reservation
- Reservation expiry after 10 minutes
- Reservation confirmation flow
- Reservation cancellation/release flow

---

## Concurrency Protection
- Transactional reservation handling using Prisma transactions
- Atomic inventory updates
- Overselling prevention logic

---

## Frontend Features
- Product listing dashboard
- Warehouse-specific inventory display
- Live stock updates
- Reservation countdown timer
- Confirm purchase button
- Cancel reservation button
- Out-of-stock button disabling
- User-visible error handling

---

# Database Design

## Product
Stores product information.

### Fields
- id
- name
- description

---

## Warehouse
Represents physical warehouse locations.

### Fields
- id
- name

---

## Inventory
Tracks stock per product per warehouse.

### Fields
- totalStock
- reservedStock

Available stock is calculated dynamically:

```txt
availableStock = totalStock - reservedStock
```

This avoids duplicated state and prevents inventory inconsistency bugs.

---

## Reservation
Stores temporary checkout reservations.

### Fields
- productId
- warehouseId
- quantity
- status
- expiresAt

### Reservation Statuses
- pending
- confirmed
- released

---

# API Endpoints

## GET /api/products

Returns:
- products
- warehouse inventory
- available stock per warehouse

---

## GET /api/warehouses

Returns all warehouse records.

---

## POST /api/reservations

Creates a temporary inventory reservation.

### Request Body

```json
{
  "productId": 1,
  "warehouseId": 1,
  "quantity": 1
}
```

### Behaviour
- validates available stock
- increments reserved stock
- creates reservation
- returns 409 if insufficient stock

---

## POST /api/reservations/:id/confirm

Confirms reservation after successful payment.

### Behaviour
- validates reservation status
- validates expiry time
- permanently deducts stock
- returns 410 if reservation expired

---

## POST /api/reservations/:id/release

Releases reservation early.

### Behaviour
- restores reserved stock
- updates reservation status to released

Used for:
- payment failures
- user cancellation
- abandoned checkout flows

---

# Concurrency Handling

The reservation creation flow is implemented using Prisma database transactions.

The following operations execute atomically:

1. inventory lookup
2. available stock validation
3. reserved stock increment
4. reservation creation

This reduces the risk of race conditions during simultaneous checkout attempts.

## Why Transactions Matter

Without transactional handling:
- two simultaneous requests could both see the same available stock
- both reservations could succeed
- inventory overselling would occur

Using transactions ensures inventory updates remain consistent.

---

# Reservation Expiry Mechanism

Each reservation is created with:

```ts
expiresAt = currentTime + 10 minutes
```

A live frontend countdown timer displays remaining reservation duration.

During reservation confirmation:
- expired reservations return HTTP 410
- expired reservations cannot be confirmed

---

# Production Expiry Strategy

For this assignment, expiry validation is handled lazily during reservation confirmation and release operations.

In a production-scale system, expired reservations would ideally be cleaned automatically using:
- scheduled cron jobs
- background workers
- queue-based cleanup systems

Examples:
- Vercel Cron Jobs
- BullMQ workers
- Temporal workflows
- serverless scheduled functions

---

# Frontend Workflow

## Reserve Product
1. User clicks "Reserve 1 Item"
2. Reservation API is called
3. Reserved stock increases
4. Countdown timer begins

---

## Confirm Purchase
1. User clicks "Confirm Purchase"
2. Reservation is confirmed
3. Total stock decreases permanently
4. Reserved stock decreases

---

## Cancel Reservation
1. User clicks "Cancel Reservation"
2. Reservation is released
3. Reserved stock is restored
4. Available stock increases again

---

# How to Run Locally

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_neon_postgresql_connection_url"
```

---

## 4. Run Database Migrations

```bash
npx prisma migrate dev
```

---

## 5. Seed Database

```bash
npx tsx prisma/seed.ts
```

This inserts:
- sample products
- warehouses
- inventory stock

---

## 6. Start Development Server

```bash
npx next dev
```

Open:

```txt
http://localhost:3000
```

---

# Important Engineering Decisions

## Separate totalStock and reservedStock

Instead of directly decrementing stock during checkout:
- reservedStock temporarily blocks inventory
- totalStock changes only after payment confirmation

This better models real-world checkout flows.

---

## Shared Prisma Client

A singleton Prisma client pattern was implemented to avoid:
- database connection exhaustion
- repeated Prisma client instantiation
- transaction startup failures

This is especially important in serverless-like environments.

---

# Trade-offs and Limitations

## Current Trade-offs
- Expired reservations are validated lazily instead of background-cleaned
- Frontend state is local-only
- No authentication or payment integration
- No websocket-based real-time synchronization

---

# Improvements With More Time

## Backend Improvements
- Redis-based distributed locking
- Automatic expired reservation cleanup jobs
- Idempotency support for reservation endpoints
- Queue-based background processing
- Automated integration testing

---

## Frontend Improvements
- Toast notifications
- Reservation history dashboard
- Real-time websocket inventory updates
- Better mobile responsiveness

---

# Deployment

## Application Hosting
- Vercel

## Database Hosting
- Neon PostgreSQL

---

# Author

Krishna Meeraa