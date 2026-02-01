import { db } from '../db/index.js'
import { bookings, ticketTiers } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'
import { BookingsRepository } from '../repositories/bookings.repository.js'

export class BookingsService {
  private bookingsRepo: BookingsRepository

  constructor() {
    this.bookingsRepo = new BookingsRepository()
  }

  /**
   * Creates a new booking with full transaction support
   *
   * CRITICAL CONCURRENCY STRATEGY:
   * This method implements pessimistic locking using PostgreSQL's SELECT FOR UPDATE
   * to prevent double-booking and overselling in race conditions
   *
   * Core flow:
   * 1. Check idempotency key - return existing booking if found
   * 2. BEGIN TRANSACTION for booking creation
   * 3. SELECT FOR UPDATE - Locks the ticket_tier row
   * 4. Validate availability
   * 5. INSERT booking with ON CONFLICT DO NOTHING (backup idempotency check)
   * 6. UPDATE ticket_tier to decrement available_quantity
   * 7. Simulate payment
   * 8. Update booking status based on payment result(!)
   * 9. COMMIT or ROLLBACK
   *
   * Race condition handling:
   * - Multiple users booking same tier: FOR UPDATE creates a queue, processes serially (pg internals)
   * - Network retries: Idempotency key prevents duplicate bookings
   * - Overselling: CHECK constraint prevents negative available_quantity
   */
  async createBooking(
    userId: string,
    ticketTierId: string,
    quantity: number,
    idempotencyKey: string
  ) {
    // STEP 1: Check if booking already exists with this idempotency key
    // This handles network retries - return the existing booking instead of creating duplicate
    const existingBooking = await this.bookingsRepo.findByIdempotencyKey(idempotencyKey)
    if (existingBooking) {
      return {
        success: true,
        booking: existingBooking,
        message: 'Booking already exists (idempotency key matched)',
      }
    }

    // STEP 2-9: Execute booking transaction with row-level locking
    const result = await db.transaction(async (tx) => {
      // STEP 3: Lock the ticket tier row using SELECT FOR UPDATE
      // This is CRITICAL for preventing race conditions
      // - Blocks other transactions from reading/updating this row until we commit
      // - Creates a queue internally and concurrent requests wait their turn (might affect qps tho??)
      // - Guarantees serializable access to ticket inventory
      const [lockedTier] = await tx
        .select()
        .from(ticketTiers)
        .where(eq(ticketTiers.id, ticketTierId))
        .for('update') // Drizzle provides good support for SELECT FOR UPDATE

      if (!lockedTier) {
        throw new Error('Ticket tier not found')
      }

      // STEP 4: Validate availability
      if (lockedTier.availableQuantity < quantity) {
        throw new Error(
          `Insufficient tickets. Requested: ${quantity}, Available: ${lockedTier.availableQuantity}`
        )
      }

      // Calculate total price
      const totalPrice = (parseFloat(lockedTier.price) * quantity).toFixed(2)

      // STEP 5: Insert booking record with idempotency protection
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
        .onConflictDoNothing({ target: bookings.idempotencyKey })
        .returning() // TODO: only select / return needed fields

      // If ON CONFLICT was triggered, the booking already exists - fetch it
      let newBooking = bookingResult[0]
      if (!newBooking) {
        const existing = await tx
          .select()
          .from(bookings)
          .where(eq(bookings.idempotencyKey, idempotencyKey))
          .limit(1)

        if (existing[0]) {
          // Booking was created by concurrent request, return it
          throw new Error('CONCURRENT_BOOKING_EXISTS')
        }
        throw new Error('Failed to create booking')
      }

      // STEP 6: Atomically decrement available tickets count
      const newAvailableQuantity = lockedTier.availableQuantity - quantity
      await tx
        .update(ticketTiers)
        .set({
          availableQuantity: newAvailableQuantity,
          updatedAt: new Date(),
        })
        .where(eq(ticketTiers.id, ticketTierId))

      // STEP 7: Simulate payment processing
      const paymentSuccess = this.simulatePayment()

      // STEP 8: Update booking status based on payment result
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
            availableQuantity: lockedTier.availableQuantity, // Restore original quantity
            updatedAt: new Date(),
          })
          .where(eq(ticketTiers.id, ticketTierId))

        // Mark booking as faile
        await tx
          .update(bookings)
          .set({
            status: 'FAILED',
            paymentStatus: 'FAILED',
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, newBooking.id))

        throw new Error('Payment failed!')
      }
    })

    // STEP 9: Transaction committed successfully
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
   *
   * @returns true if payment succeeds, else false
   */
  private simulatePayment(): boolean {
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
