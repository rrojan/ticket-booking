import { BookingsRepository } from '../repositories/bookings.repository.js'

export class BookingsService {
  private bookingsRepo: BookingsRepository

  constructor() {
    this.bookingsRepo = new BookingsRepository()
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
