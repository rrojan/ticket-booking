import { type FastifyInstance } from 'fastify'
import type {
  ApiResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingWithDetails,
} from '@repo/shared-types'
import { BookingsController } from '../controllers/bookings.controller.js'

/**
 * Register booking routes with type-safe request/response schemas
 */
export async function registerBookingsRoutes(app: FastifyInstance) {
  const controller = new BookingsController()

  // POST /bookings - Create a new booking
  app.post<{
    Body: CreateBookingRequest
    Reply: CreateBookingResponse
  }>('/bookings', async (request, reply) => {
    return controller.createBooking(request, reply)
  })

  // GET /bookings/:userId - Get user's booking history
  app.get<{
    Params: { userId: string }
    Reply: ApiResponse<BookingWithDetails[]>
  }>('/bookings/:userId', async (request, reply) => {
    return controller.getUserBookings(request, reply)
  })
}
