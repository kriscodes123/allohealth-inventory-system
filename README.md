# Inventory Reservation System

A full-stack inventory reservation system built for the Allo Health engineering take-home assignment.

## Problem Statement

This project solves the inventory race-condition problem during e-commerce checkout flows.

When payment takes time, multiple users may attempt to purchase the same product simultaneously. To prevent overselling, the system introduces temporary inventory reservations that expire automatically if payment is not completed.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Tailwind CSS

## Features Implemented So Far

- Next.js project setup
- Prisma + Neon PostgreSQL integration
- Database schema for:
  - Products
  - Warehouses
  - Inventory
  - Reservations
- Initial database migration setup

## Database Design

### Product
Stores product information.

### Warehouse
Represents physical warehouse locations.

### Inventory
Tracks:
- total stock
- reserved stock
for each product per warehouse.

Available stock is calculated as:

```txt
availableStock = totalStock - reservedStock
```

### Reservation
Stores temporary checkout reservations with:
- status
- expiry time
- quantity reserved

## Setup Instructions

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npx next dev
```

### Run migrations

```bash
npx prisma migrate dev
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="your_database_url"
```

## Current Progress

Currently implementing:
- database seeding
- API routes
- reservation workflow
- concurrency-safe reservation handling
- frontend checkout flow