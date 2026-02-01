import { db } from '../db/index.js'
import { bookings, ticketTiers, concerts } from '../db/schema/index.js'
import { eq, desc } from 'drizzle-orm'

export class BookingsRepository {
  /**
   * Create a new booking
   * Note: This is a simple insert... The copmlete transaction logic with FOR UPDATE locking will be in the BookingsService
   */
  async create(bookingData: {
    userId: string
    ticketTierId: string
    quantity: number
    totalPrice: string
    status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED'
    idempotencyKey: string
  }) {
    const result = await db.insert(bookings).values(bookingData).returning()
    return result[0]
  }

  /**
   * Find booking by idempotency key
   * This is used to prevent duplicate bookings from retries.
   */
  async findByIdempotencyKey(idempotencyKey: string) {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.idempotencyKey, idempotencyKey))
      .limit(1)
    return result[0] || null
  }

  /**
   * Find all bookings for a user
   */
  async findByUserId(userId: string) {
    return await db
      .select({
        id: bookings.id,
        quantity: bookings.quantity,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        createdAt: bookings.createdAt,
        tierType: ticketTiers.tierType,
        tierPrice: ticketTiers.price,
        concertName: concerts.name,
        concertArtist: concerts.artist,
        concertDate: concerts.date,
        concertVenue: concerts.venue,
      })
      .from(bookings)
      .innerJoin(ticketTiers, eq(bookings.ticketTierId, ticketTiers.id))
      .innerJoin(concerts, eq(ticketTiers.concertId, concerts.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))
  }

  /**
   * Find booking by ID
   */
  async findById(id: string) {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
    return result[0] || null
  }
}
