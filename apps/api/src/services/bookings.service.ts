import { db } from '../db/index.js'
import { bookings, ticketTiers } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'
import { BookingsRepository } from '../repositories/bookings.repository.js'
import { TicketTiersRepository } from '../repositories/ticket-tiers.repository.js'

export class BookingsService {
  private bookingsRepo: BookingsRepository
  private ticketTiersRepo: TicketTiersRepository

  constructor() {
    this.bookingsRepo = new BookingsRepository()
    this.ticketTiersRepo = new TicketTiersRepository()
  }

  /**
   * Creates a new booking
   *
   * Concurrency plan:
   * This method implements pessimistic locking using PostgreSQL's SELECT FOR UPDATE
   * to prevent double-booking and overselling in race conditions
   *
   * Race condition handling:
   * - Network retries: Idempotency key prevents duplicate bookings
   * - Overselling: CHECK constraint prevents negative available_quantity
   */
  async createBooking(
    userId: string,
    ticketTierId: string,
    quantity: number,
    idempotencyKey: string
  ) {
    // Check if booking already exists with this idempotency key
    const existingBooking = await this.bookingsRepo.findByIdempotencyKey(idempotencyKey)
    console.log('ebbbbbbb', existingBooking)
    if (existingBooking) {
      return {
        success: true,
        booking: existingBooking,
        message: 'Booking already exists (idempotency key matched)',
      }
    }

    // ----------

    // Execute booking transaction with row-level locking
    const result = await db.transaction(async (tx) => {
      // Lock the ticket tier row using SELECT FOR UPDATE
      const [lockedTier] = await tx
        .select()
        .from(ticketTiers)
        .where(eq(ticketTiers.id, ticketTierId))
        .for('update') // Drizzle provides good support for iSELETE FOR UPDATE

      if (!lockedTier) {
        throw new Error('Ticket tier not found')
      }

      console.log('ltt', lockedTier)

      // Validate availability
      if (lockedTier.availableQuantity < quantity) {
        throw new Error(
          `Insufficient tickets. Requested: ${quantity}, Available: ${lockedTier.availableQuantity}`
        )
      }

      // Calculate total price
      const totalPrice = (parseFloat(lockedTier.price) * quantity).toFixed(2)

      console.log('tpmeowmeowmeowmow', totalPrice)

      // Insert booking record with idempotency protection
      // ON CONFLICT DO NOTHING: If another concurrent request with same idempotency key
      // somehow got past our pre-check, this prevents duplicate inserts at DB level
      const bookingResult = await tx
        .insert(bookings)
        .values({
          userId,
          ticketTierId,
          quantity,
          totalPrice,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          idempotencyKey,
        })
        .returning() // TODO: only return needed fields

      const newBooking = bookingResult[0]
      if (!newBooking) {
        const existing = await tx
          .select()
          .from(bookings)
          .where(eq(bookings.idempotencyKey, idempotencyKey))
          .limit(1)

        if (existing[0]) {
          throw new Error('CONCURRENT_BOOKING_EXISTS')
        }
        throw new Error('Failed to create booking')
      }

      // Atomically decrement available tickets count
      const newAvailableQuantity = lockedTier.availableQuantity - quantity
      await tx
        .update(ticketTiers)
        .set({
          availableQuantity: newAvailableQuantity,
          updatedAt: new Date(),
        })
        .where(eq(ticketTiers.id, ticketTierId))

      console.log('newAvail', newAvailableQuantity)

      // Simulate payment processing
      const paymentSuccess = this.simulatePayment()

      // Update booking status based on payment result
      if (paymentSuccess) {
        console.log('success!!!!')
        await tx
          .update(bookings)
          .set({
            status: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, newBooking.id))

        return {
          ...newBooking,
          status: 'CONFIRMED' as const,
          paymentStatus: 'SUCCESS' as const,
        }
      } else {
        // Payment failed - release tickets back to inventory
        console.log('failed!!!!')
        await tx
          .update(ticketTiers)
          .set({
            availableQuantity: lockedTier.availableQuantity,
            updatedAt: new Date(),
          })
          .where(eq(ticketTiers.id, ticketTierId))

        throw new Error('Payment failed')
      }
    })

    return {
      success: true,
      booking: result,
      message: 'Booking confirmed successfully',
    }
  }

  /**
   * Simulate payment processing
   *
   * For testing purposes, we randomly succeed/fail to simulate different scenarios
   * Currently its 80% chance of success
   */
  private simulatePayment() {
    // 80% success rate for testing
    return Math.random() > 0.2
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string) {
    return await this.bookingsRepo.findByUserId(userId)
  }

  /**
   * Get booking by idempotency key
   * Useful for checking if a booking already exists before attempting creation
   */
  async getBookingByIdempotencyKey(idempotencyKey: string) {
    return await this.bookingsRepo.findByIdempotencyKey(idempotencyKey)
  }
}
