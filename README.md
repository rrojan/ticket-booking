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

## Database Design

Please check `apps/api/src/db/schema/*` for the database schemas. There are three tables here:

- bookings
- ticketTiers
- concerts

### Design Decisions

#### 1. `ticketTiers` table instead of `price` column in `concerts` table?

This design allows for flexible ticket pricing strategies and accomodates VIP, frontrow and GA tickets in our requirements.Each tier can have its own availability and pricing, allowing for more fine-tuned control over ticket sales.

#### 2. Numeric Type for Currency

JavaScript's `Number` type uses floating-point arithmetic, which can cause precision errors with currency (0.1 + 0.2 = 0.30000000000000004, the classic example). PostgreSQL's `numeric` type guarantees exact decimal arithmetic. We also store cents instead of dollars to avoid floating point issues and potential precision errors.

#### 3. Separate `total_quantity` and `available_quantity`

```typescript
totalQuantity: integer().notNull() // Initial inventory (immutable)
availableQuantity: integer().notNull() // Real-time availability (mutable)
```

**Why**:

- `totalQuantity` is the source of truth for initial inventory (never changes)
- `availableQuantity` is decremented on bookings, incremented on cancellations
- Allows analytics like "How many VIP tickets sold?" = `totalQuantity - availableQuantity`

#### 4. Indexes for Performance

```typescript
userIdIdx: index('bookings_user_id_idx').on(table.userId)
ticketTierIdIdx: index('bookings_ticket_tier_id_idx').on(table.ticketTierId)
```

**Why**:

- `user_id` index: Fast lookup for "My Bookings" page (`SELECT WHERE user_id = ?`)
- `ticket_tier_id` index: Fast lookup for analytics and availability checks
- `idempotency_key` index: Automatic (UNIQUE constraint creates index)

## API Design

### REST Endpoints

The API follows RESTful conventions with clear resource naming and HTTP methods

#### Concerts

```http
GET /concerts
```

List all concerts with ticket availability
**Response**: `ConcertWithAvailability[]`

```http
GET /concerts/:concertId
```

Get single concert with full tier details
**Response**: `ConcertWithTiers`

#### Bookings

```http
POST /bookings
```

Create a new booking
**Request Body**:

```json
{
  "userId": "user_123",
  "ticketTierId": "uuid",
  "quantity": 2,
  "idempotencyKey": "client-generated-uuid"
}
```

**Validation** (Zod schema):

- `quantity`: Integer, 1-10 (prevents bulk buying abuse)
- `idempotencyKey`: UUID format
- `ticketTierId`: Valid UUID

```http
GET /bookings/:userId
```

Get user's booking history
**Response**: `BookingWithDetails[]` (includes concert and tier info via JOIN)

# Testing

I was not able to include testing due to time constraints. However, I would have included:

- Integration tests for each endpoint
- E2E tests for the entire booking flow using something like playwright etc.
- Load tests to simulate high traffic via something like k6 etc. K6 also can be hooked to k6 cloud / grafana that allows us to visualize the load test results in a nice dashboard. k6 stories can be chained to stress test the system for various high-traffic scenarios, and we can also run queries to determine if the end ticket inventory is correct. This would be a great addition if I had more time.

# Scaling to Non-Functional Requirements

## Scaling to 99.99% Availability (Four Nines)

**Target**: 52 minutes downtime per year from this SLA

#### Database High Availability

- Use a DB provider that supports multi-AZ deployments (e.g., AWS RDS Multi-AZ, Google Cloud SQL HA)
- Use a DB proxy / LB that supports high volume connection pooling like PgBouncer or HAProxy
- Implement a (Write) Primary + multiple Read Replica setup with async replication. Setup monitoring for replication lag targeting eventual consistency.
- Implement automated HA failover with tools like Patroni for automatic primary promotion in < 30s
- Use read replicas for read-heavy workloads
- Implement automated backups and point-in-time recovery (PITR)

#### Tradeoffs:

- Increased complexity and cost
- Replication lag can lead to stale reads (not an issue for our use case as we only need strong consistency for write operations)

### API Server High Availability

- It helps that we are using fastify which supports a much higher rps than traditional frameworks like Express.
- Setup multiple deployment regions (e.g. US-EAST, EU-WEST, an APAC region) with multiple API servers per region behind a load balancer.
- Use geo-routing to route users to the nearest region.
- Implement health checks for each region and automatically remove unhealthy servers / regions from rotation
- Implement rate limiting to prevent abuse + DDoS protection. We can use something like Cloudflare for this.
- Implement automated scaling to handle traffic spikes
- Implement circuit breakers to fail fast on unhealthy dependencies.

We can use something like k8s to orchestrate this with multiple pods per region, auto-scaling, health checks and recovery / auto-healing, etc.

#### Tradeoffs:

- Increased complexity and cost
- Need to manage multiple regions and deployments, required dedicated DevOps expertise

## Scaling to 1M DAU + 50k Peak Concurrent Users

**Assumptions**:

- 1M DAU with 50k peak is ~5% of users online at a time
- Peak booking rate would be ~14 requests/sec average, with bursts to 1000+ RPS. Burst traffic is especially common during new ticket releases.

#### 1. Database Performance Optimization

**Current Bottleneck**: `SELECT FOR UPDATE` serializes requests for same tier

Possible Solutions:

##### Database Sharding by Concert

- Can geo-shard, hash-sharding with stable key (e.g. artist_id, venue_id, etc if they are stable), etc.

Benefits:

- No / fewer lock contention
- Linear scaling (we add more shards as concerts grow)

Trade-off: Cross-concert queries for things like dashboards, analytics,etc become complex (need to query all shards).

##### Indexes for Fast Locking

```sql
-- Ensure FOR UPDATE uses index (not table scan)
CREATE INDEX idx_ticket_tiers_id ON ticket_tiers(id);
CREATE INDEX idx_bookings_idempotency ON bookings(idempotency_key);
```

Benefit: Lock acquisition <1ms (index seek vs full table scan)

##### Table Partitioning

```sql
-- Partition bookings by date (for example monthly)
CREATE TABLE bookings_2026_02 PARTITION OF bookings
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

Benefits:

- Faster queries (smaller tables)
- Easier archival (drop old partitions)

#### 2. Caching Strategy

- Use Redis for caching hot data like concert details, ticket tier availability, etc
- Use a cache-aside pattern to keep cache in sync with database
- Use TTL (Time To Live) to automatically expire stale cache entries
- Use a proper cache invalidation strategy to proactively remove cache entries when data changes
- Use CDNs for static assets like images, videos, etc in the `web` app
