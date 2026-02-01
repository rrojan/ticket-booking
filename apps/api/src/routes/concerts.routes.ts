import { type FastifyInstance } from 'fastify'
import type {
  ApiResponse,
  ConcertWithAvailability,
  ConcertWithTiers,
  TierAvailability,
} from '@repo/shared-types'
import { ConcertsController } from '../controllers/concerts.controller.js'

/**
 * Register concert routes with type-safe request/response schemas
 */
export async function registerConcertsRoutes(app: FastifyInstance) {
  const controller = new ConcertsController()

  // GET /concerts - List all concerts with availability
  app.get<{
    Reply: ApiResponse<ConcertWithAvailability[]>
  }>('/concerts', async (request, reply) => {
    return controller.getAllConcerts(request, reply)
  })

  // GET /concerts/:concertId - Get concert details with ticket tiers
  app.get<{
    Params: { concertId: string }
    Reply: ApiResponse<ConcertWithTiers>
  }>('/concerts/:concertId', async (request, reply) => {
    return controller.getConcertById(request, reply)
  })

  // GET /concerts/:concertId/availability - Get real-time availability per tier
  app.get<{
    Params: { concertId: string }
    Reply: ApiResponse<{
      concertId: string
      concertName: string
      tiers: TierAvailability[]
    }>
  }>('/concerts/:concertId/availability', async (request, reply) => {
    return controller.getConcertAvailability(request, reply)
  })
}
