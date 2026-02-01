import { integer, pgTable, text, timestamp, uuid, index, pgEnum } from 'drizzle-orm/pg-core'
import { ticketTiers } from './ticket-tiers.schema.js'

/**
 * Booking Status Enum
 *
 * - PENDING: Booking created, payment processing
 * - CONFIRMED: Payment successful, tickets reserved
 * - FAILED: Payment failed, tickets released back to inventory
 */
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'FAILED'])

/**
 * Bookings Table
 *
 * Records all ticket bookings with idempotency support to prevent duplicate purchases.
 * Each booking represents a user purchasing a specific quantity of tickets for one tier
 *
 * Important details:
 * - Idempotency Key (UNIQUE): Prevents duplicate bookings from network retries
 * - Status tracking: PENDING → CONFIRMED or FAILED (enforced via pgEnum)
 * - Indexed for efficient lookups by user and ticket tier
 *
 * Idempotency logic:
 * 1. Client generates uuid and sends to api
 * 2. Same uuid is sent with every retry/duplicate request
 * 3. Database UNIQUE constraint + ON CONFLICT DO NOTHING prevents duplicates
 * 4. User sees their existing booking instead of creating a duplicate
 *
 * Relationships:
 * - Many to one with ticket_tiers (each booking is for one tier)
 *
 */
export const bookings = pgTable(
  'bookings',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull(), // In production, this would be a FK to users table
    ticketTierId: uuid()
      .notNull()
      .references(() => ticketTiers.id, { onDelete: 'cascade' }),
    quantity: integer().notNull(),
    status: bookingStatusEnum().notNull().default('PENDING'),
    // Idempotency key prevents duplicate bookings from network retries
    // Client generates UUID and includes in every request
    idempotencyKey: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Index for efficient user booking lookups
    userIdIdx: index('bookings_user_id_idx').on(table.userId),
    // Index for efficient ticket tier lookups
    ticketTierIdIdx: index('bookings_ticket_tier_id_idx').on(table.ticketTierId),
  })
)
