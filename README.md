# TicketBook

> A full-stack ticket booking system for concerts and events built with NextJS & Fastify.

This project demonstrates robust concurrency handling, prevents double booking (via pessimistic locking), ensures data integrity through proper transaction management - and all this while maintaining high availability and performance at scale!

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
