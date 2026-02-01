import { type FastifyInstance } from 'fastify'
import { ConcertsController } from '../controllers/concerts.controller.js'

/**
 * Register concert routes
 */
export async function registerConcertsRoutes(app: FastifyInstance) {
  const controller = new ConcertsController()

  // GET /api/v1/concerts - List all concerts with availability
  app.get('/concerts', async (request, reply) => {
    return controller.getAllConcerts(request, reply)
  })

  // GET /api/v1/concerts/:concertId - Get concert details with ticket tiers
  app.get<{ Params: { concertId: string } }>('/concerts/:concertId', async (request, reply) => {
    return controller.getConcertById(request, reply)
  })

  // GET /api/v1/concerts/:concertId/availability - Get real time availability of concerts
  app.get<{ Params: { concertId: string } }>(
    '/concerts/:concertId/availability',
    async (request, reply) => {
      return controller.getConcertAvailability(request, reply)
    }
  )
}
