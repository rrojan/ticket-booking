# TicketBook

> A full-stack ticket booking system for concerts built with NextJS & Fastify

### Core Features

- **Prevents Double Booking Scenarios**: Guarantees that two users cannot book the same ticket simultaneously (via pessimistic locking)
- **Idempotent Requests**: Network retries don't create duplicate bookings (via idempotency keys)
- **Guarenteed Data Correctness (DB Level)**: Ensures data integrity beyond application level (via proper transaction management, conflict handling and CHECK constraints).
- **Optimized Indexing**: Ensures fast data retrieval and prevents performance degradation at scale
- **Monorepo**: The project is built as a monorepo (via Turborepo), with shared types between frontend and backend (via `shared-types` package). Not only does the performance scale, the maintainability of the project (should) be consistent as well.
- **Lightning fast backend server**: Even though DB / event management is the real bottleneck in our project, I still went with Fastify to ensure that the API layer is as fast as possible under load (see [benchmarks](https://fastify.dev/benchmarks/))
- **Payment Simulation**: Simulates a real-life payment gateway with 80% success rate

## Tech Stack

- **Frontend**: NextJS 16, React 19, TypeScript (NextJS allows server side rendering which is great for performance)
- **Backend**: Fastify, Drizzle, TypeScript, Node.js (Fastify provides fast and low overhead web framework for Node, provides much better responsiveness under load. )
- **Database**: PostgreSQL 18.1
- **ORM**: Drizzle ORM (Drizzle is consistently one of the fastest ORMs out there, much better than something like Prisma which also ships its own query engine)
- **Package Manager**: pnpm 10.28.2 (Fast package manager supporting parallel download, disk space efficiency and high security)
- **Containerization**: Docker (only for running local db for now since I have not covered deployment of next/node apps here yet)

## Setup instructions

### Prerequisites

- **Node.js** >= 18 (v22 preferred)
- **pnpm** 10.28.2 (package manager)
- **Docker** (for PostgreSQL 18.1 database)

## Development

1. Clone the repository

```sh
git clone git@github.com:rrojan/ticket-booking.git
```

2. Install dependencies

```sh
pnpm i
```

This will install dependencies for all apps / packages in the monorepo

3. Copy environment files

````sh
cp apps/api/.env.example apps/api.env && cp apps/web/.env.example apps/web.env && cp docker/.env.example docker/.env

4. Run DB & migrations

```sh
pnpm db:up # Make sure 5433 is available, else change the port in docker/.env
````

4. Run migrations & seed data

```sh
cd apps/api
pnpm db:migrate
pnpm db:seed
cd ../.. # go back to root of monorepo
```

5. Start the development servers

```sh
# From root of monorepo
pnpm dev
# OR
turbo dev

# OR start individual apps
pnpm --filter=api dev # Run API  only
pnpm --filter=web dev # Run Next app only
```

You can now browse the frontend app at http://localhost:3000/, API at http://localhost:3001 and DB (Postgres).

You can also look into scripts/prepare-\* for more pointers (wip)

## Build Instructions

1. Run `pnpm build` to build all apps from the root of the monorepo

### All Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps for production
pnpm lint             # Lint all code (0 warnings enforced)
pnpm check-types      # TypeScript type checking

# Database
pnpm db:up            # Start PostgreSQL container
pnpm db:down          # Stop PostgreSQL container
cd apps/api && pnpm db:studio  # Open Drizzle Studio (visual DB editor)

# Individual apps
pnpm --filter=api dev     # Run API server only
pnpm --filter=web dev     # Run Next.js app only
```

# Key Design Decisions

## Concurrency & Double-Booking Prevention (Race Problems)

**Scenario 1**: Two users can simultaneously try to book the last available ticket under high traffic. Without proper concurrency control, both users might read the same available quantity (e.g., 1), both proceed to book, and both succeed - resulting in 2 bookings for 1 ticket.

**Scenario 2**: A user tries to book a ticket, but the payment fails. However, the ticket is still marked as reserved, preventing other users from booking it (improper transaction releases)

**Scenario 3**: Network retries from frontend (due to timeout or network issues) lead to duplicate requests. If not properly habndled this will lead to duplicate bookings for same user

**Scenario 4**: Bad Data Integrity - Two users book a last remaining ticket at same time, due to poor transaction management the end quantity of tickets might be -1

### My Solution: Pessimistic Locking with `SELECT FOR UPDATE`

I implemented **row-level pessimistic locking** using PostgreSQL's `SELECT FOR UPDATE` within ACID transactions.

#### How It Works

```typescript
// File: apps/api/src/services/bookings.service.ts

await db.transaction(async (tx) => {
  // Lock the ticket tier row using SELECT FOR UPDATE
  // This is CRITICAL for preventing race conditions
  // - Blocks other transactions from reading/updating this row until we commit
  // - Creates a queue internally and concurrent requests wait their turn (might affect qps tho??)
  // - Guarantees serializable access to ticket inventory
  const [lockedTier] = await tx
    .select()
    .from(ticketTiers)
    .where(eq(ticketTiers.id, ticketTierId))
    .for('update') // Drizzle provides good support for SELECT FOR UPDATE

  // ...

  // Validate availability (guaranteed accurate due to lock)
  if (lockedTier.availableQuantity < quantity) {
    throw new Error('Insufficient tickets')
  }

  // Create booking
  await tx.insert(bookings).values({...})

  // ...

  // Atomically decrement available quantity
  await tx.update(ticketTiers).set({
    availableQuantity: lockedTier.availableQuantity - quantity
  })

  // Simulate payment
  // Update booking status based on payment result
  // Lock released after commit
})
```

In case of race conditions (multiple users try to book tickets at same time):

1. **User A** executes `SELECT FOR UPDATE` → **Acquires lock** on the tier row
2. **User B** executes `SELECT FOR UPDATE` → **Waits in queue** (PostgreSQL manages this internally)
3. **User A** completes transaction → **Lock released**, User B proceeds
4. **User B** sees updated `availableQuantity` → Fails if insufficient tickets

Requests are serialized at the database level, eliminating race conditions.

### Multi-Layered Defense

I implemented further defense in depth strategies to handle edge cases:

#### 1. Idempotency Keys (Client-Generated UUIDs)

Prevents duplicate bookings from network retries.

```typescript
// Frontend generates UUID
const idempotencyKey = crypto.randomUUID()

// Backend checks before processing
const existingBooking = await findByIdempotencyKey(idempotencyKey)
if (existingBooking) {
  return existingBooking // Return existing, don't create duplicate
}

// Database enforces uniqueness (apps/api/src/db/schema/bookings.schema.ts)
idempotencyKey: text().notNull().unique()
```

As a result:

- Client can safely retry failed requests
- Network timeouts don't cause duplicate bookings
- Handles edge cases like browser back/refresh elegantly

#### 2. Database Constraints

PostgreSQL CHECK constraints provide a final safety net for us:

```sql
-- Prevents negative inventory (can't oversell)
CHECK (available_quantity >= 0)

-- Prevents exceeding total inventory
CHECK (available_quantity <= total_quantity)

-- Prevents duplicate idempotency keys
UNIQUE (idempotency_key)
```

If our application logic somehow fails, the database will still reject invalid operations. A good database design must be an accurate modelling of the business logic as well, not just the application level.

#### 3. `ON CONFLICT DO NOTHING`

Backup idempotency protection at the database level:

```typescript
await tx.insert(bookings)
  .values({idempotencyKey, ...})
  .onConflictDoNothing({ target: bookings.idempotencyKey })
```

Even if two concurrent requests pass the pre-check, only one will insert successfully.
