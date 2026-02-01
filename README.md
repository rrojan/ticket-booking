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
- **Package Manager**: pnpm 10.28.2
- **Containerization**: Docker (only for running local db for now since I have not covered deployment of next/node apps here yet)

## Setup instructions

### Prerequisites

- **Node.js** >= 18 (v22 preferred)
- **pnpm** 10.28.2 (package manager)
- **Docker** (for PostgreSQL 18.1 database)

## Setup Steps

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

You can now browse the frontend app at http://localhost:3000/, API at http://localhost:3001 and DB (Postgres)

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
