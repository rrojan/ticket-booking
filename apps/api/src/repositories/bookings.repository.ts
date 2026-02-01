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
   * Find all bookings for a user with concert and tier details
   */
  async findByUserId(userId: string) {
    const results = await db
      .select({
        // Booking fields
        id: bookings.id,
        userId: bookings.userId,
        ticketTierId: bookings.ticketTierId,
        quantity: bookings.quantity,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        idempotencyKey: bookings.idempotencyKey,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        // Concert fields
        concertId: concerts.id,
        concertName: concerts.name,
        concertArtist: concerts.artist,
        concertDate: concerts.date,
        concertVenue: concerts.venue,
        concertDescription: concerts.description,
        concertCreatedAt: concerts.createdAt,
        concertUpdatedAt: concerts.updatedAt,
        // Tier fields
        tierType: ticketTiers.tierType,
        tierPrice: ticketTiers.price,
        tierTotalQuantity: ticketTiers.totalQuantity,
        tierAvailableQuantity: ticketTiers.availableQuantity,
        tierCreatedAt: ticketTiers.createdAt,
        tierUpdatedAt: ticketTiers.updatedAt,
      })
      .from(bookings)
      .innerJoin(ticketTiers, eq(bookings.ticketTierId, ticketTiers.id))
      .innerJoin(concerts, eq(ticketTiers.concertId, concerts.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))

    // Transform to BookingWithDetails format
    return results.map((row) => ({
      id: row.id,
      userId: row.userId,
      ticketTierId: row.ticketTierId,
      quantity: row.quantity,
      totalPrice: row.totalPrice,
      status: row.status,
      paymentStatus: row.paymentStatus,
      idempotencyKey: row.idempotencyKey,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      concert: {
        id: row.concertId,
        name: row.concertName,
        artist: row.concertArtist,
        date: row.concertDate.toISOString(),
        venue: row.concertVenue,
        description: row.concertDescription,
        createdAt: row.concertCreatedAt.toISOString(),
        updatedAt: row.concertUpdatedAt.toISOString(),
      },
      ticketTier: {
        id: row.ticketTierId,
        concertId: row.concertId,
        tierType: row.tierType,
        price: row.tierPrice,
        totalQuantity: row.tierTotalQuantity,
        availableQuantity: row.tierAvailableQuantity,
        createdAt: row.tierCreatedAt.toISOString(),
        updatedAt: row.tierUpdatedAt.toISOString(),
      },
    }))
  }

  /**
   * Find booking by ID
   */
  async findById(id: string) {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
    return result[0] || null
  }
}
