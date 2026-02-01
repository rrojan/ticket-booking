import { type FastifyRequest, type FastifyReply } from 'fastify'
import type {
  ApiResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingWithDetails,
} from '@repo/shared-types'
import { BookingsService } from '../services/bookings.service.js'
import { createBookingSchema } from '../validators/booking.validator.js'

export class BookingsController {
  private bookingsService: BookingsService

  constructor() {
    this.bookingsService = new BookingsService()
  }

  /**
   * Create a new booking with concurrency protection
   */
  async createBooking(
    request: FastifyRequest<{ Body: CreateBookingRequest }>,
    reply: FastifyReply<{ Reply: CreateBookingResponse }>
  ) {
    try {
      const validationResult = createBookingSchema.safeParse(request.body)

      if (!validationResult.success) {
        const zodError = validationResult.error
        const errorDetails = zodError.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        return reply.status(400).send({
          success: false,
          booking: null,
          message: `Validation error: ${errorDetails.map((d) => d.message).join(', ')}`,
        })
      }

      const bookingData: CreateBookingRequest = validationResult.data

      // Call service to create booking with transaction
      const result = await this.bookingsService.createBooking(
        bookingData.userId,
        bookingData.ticketTierId,
        bookingData.quantity,
        bookingData.idempotencyKey
      )

      if (result.success) {
        return reply.status(200).send(result)
      }

      // Handle different failure scenarios with appropriate status codes
      const errorMessage = result.message.toLowerCase()

      // Insufficient tickets (handle race condition)
      if (errorMessage.includes('insufficient')) {
        return reply.status(409).send(result)
      }

      // Ticket tier not found
      if (errorMessage.includes('not found')) {
        return reply.status(404).send(result)
      }

      // Payment failed
      if (errorMessage.includes('payment failed')) {
        return reply.status(402).send(result)
      }

      // Generic failure
      return reply.status(500).send(result)
    } catch (error) {
      request.log.error(error, 'Error creating booking')
      return reply.status(500).send({
        success: false,
        booking: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply<{ Reply: ApiResponse<BookingWithDetails[]> }>
  ) {
    try {
      const { userId } = request.params

      if (!userId || userId.trim() === '') {
        return reply.status(400).send({
          success: false,
          data: [],
          error: 'User ID is required',
        })
      }

      const bookings = await this.bookingsService.getUserBookings(userId)

      return reply.status(200).send({
        success: true,
        data: bookings,
        count: bookings.length,
      })
    } catch (error) {
      request.log.error(error, 'Error fetching user bookings')
      return reply.status(500).send({
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
