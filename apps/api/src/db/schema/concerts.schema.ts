import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Concerts Table
 *
 * Stores information about concerts available for ticket booking.
 * The flow I ended up going with is: Concert -> Ticket with Tiers -> Booking
 * Each concert can have multiple ticket tiers defined in the ticket_tiers table
 *
 * Important details:
 * - Timezone-aware timestamps (non-functional req)
 * -
 *
 * Relationships:
 * - One to many with ticket_tiers (one concert has many ticket tiers)
 * - Cascade delete - deleting a concert removes all associated ticket tiers
 */
export const concerts = pgTable('concerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  artist: text('artist').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  venue: text('venue').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
