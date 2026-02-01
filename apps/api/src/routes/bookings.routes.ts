import { type FastifyInstance } from 'fastify'
import { BookingsController } from '../controllers/bookings.controller.js'

/**
 * Register booking routes
 */
export async function registerBookingsRoutes(app: FastifyInstance) {
  const controller = new BookingsController()

  // POST /api/v1/bookings - Create a new booking
  app.post('/bookings', async (request, reply) => {
    return controller.createBooking(request, reply)
  })

  // GET /api/v1/bookings/:userId - Get user's booking history
  app.get<{ Params: { userId: string } }>('/bookings/:userId', async (request, reply) => {
    return controller.getUserBookings(request, reply)
  })
}
