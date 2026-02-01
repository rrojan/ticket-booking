import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  check,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core'
import { concerts } from './concerts.schema.js'
import { sql } from 'drizzle-orm'

/**
 * Tier Type Enum
 *
 * Defines the three pricing tiers available for our concerts:
 * - VIP: $100
 * - FRONT_ROW: $50
 * - GA: $10
 */
export const tierTypeEnum = pgEnum('tier_type', ['VIP', 'FRONT_ROW', 'GA'])

/**
 * Ticket Tiers Table
 *
 * Defines tickets with different pricing tiers for concert tickets (VIP, front row, GA for our reqs)
 *
 * Important details:
 * - availableQuantity tracks real-time ticket availability
 * - CHECK constraints prevent negative quantities and overselling.
 * - Foreign key to concerts with cascade delete in case concerts are deleted/cancelled
 * - Numeric price type for precise currency handling (10 digits, 2 decimal places)
 *
 * Concurrency Strategy:
 * - Uses SELECT FOR UPDATE in transactions to lock rows during booking (pessimistic locking)
 * - Prevents race conditions when multiple users book simultaneously
 * - CHECK constraints provide database-level validation as a backup safeguard
 *
 * Important Fields:
 * - totalQuantity: Initial inventory (never changes after creation)
 * - availableQuantity: Decremented on each successful booking (real-time availability)
 *
 * Relationships:
 * - Many to one  with concerts (each tier belongs to one concert)
 * - one to many with bookings (one tier can have many bookings)
 */
export const ticketTiers = pgTable(
  'ticket_tiers',
  {
    id: uuid().primaryKey().defaultRandom(),
    concertId: uuid()
      .notNull()
      .references(() => concerts.id, { onDelete: 'cascade' }),
    tierType: tierTypeEnum().notNull(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    totalQuantity: integer().notNull(),
    availableQuantity: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Ensures available_quantity is never negative (very imp for us)
    availableQuantityCheck: check('available_quantity_check', sql`${table.availableQuantity} >= 0`),
    // Ensure availablequantity never exceeds total quantity
    totalQuantityCheck: check(
      'total_quantity_check',
      sql`${table.availableQuantity} <= ${table.totalQuantity}`
    ),
    // Ensures each concert can only have one tier of each type
    concertTierUnique: unique('concert_tier_unique').on(table.concertId, table.tierType),
  })
)
