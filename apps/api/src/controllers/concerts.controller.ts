import { type FastifyRequest, type FastifyReply } from 'fastify'
import type {
  ApiResponse,
  ConcertWithAvailability,
  ConcertWithTiers,
  TierAvailability,
} from '@repo/shared-types'
import { ConcertsService } from '../services/concerts.service.js'

export class ConcertsController {
  private concertsService: ConcertsService

  constructor() {
    this.concertsService = new ConcertsService()
  }

  /**
   * GET /api/v1/concerts
   *
   * Get all concerts with availability info
   */
  async getAllConcerts(
    request: FastifyRequest,
    reply: FastifyReply<{ Reply: ApiResponse<ConcertWithAvailability[]> }>
  ) {
    try {
      const concerts = await this.concertsService.getAllConcerts()

      return reply.status(200).send({
        success: true,
        data: concerts,
        count: concerts.length,
      })
    } catch (error) {
      request.log.error(error, 'Error fetching concerts')
      return reply.status(500).send({
        success: false,
        data: [],
        error: 'Failed to fetch concerts',
      })
    }
  }

  /**
   * GET /api/v1/concerts/:concertId
   *
   * Get concert details with ticket tiers
   */
  async getConcertById(
    request: FastifyRequest<{ Params: { concertId: string } }>,
    reply: FastifyReply<{ Reply: ApiResponse<ConcertWithTiers> }>
  ) {
    try {
      const { concertId } = request.params

      const concert = await this.concertsService.getConcertById(concertId)

      if (!concert) {
        return reply.status(404).send({
          success: false,
          data: {} as ConcertWithTiers,
          error: `No concert found with ID: ${concertId}`,
        })
      }

      return reply.status(200).send({
        success: true,
        data: concert,
      })
    } catch (error) {
      request.log.error(error, 'Error fetching concert by ID')
      return reply.status(500).send({
        success: false,
        data: {} as ConcertWithTiers,
        error: 'Failed to fetch concert',
      })
    }
  }

  /**
   * GET /api/v1/concerts/:concertId/availability
   *
   * Get real-time ticket availability for a concert
   */
  async getConcertAvailability(
    request: FastifyRequest<{ Params: { concertId: string } }>,
    reply: FastifyReply<{
      Reply: ApiResponse<{
        concertId: string
        concertName: string
        tiers: TierAvailability[]
      }>
    }>
  ) {
    try {
      const { concertId } = request.params

      const availability = await this.concertsService.getConcertAvailability(concertId)

      if (!availability) {
        return reply.status(404).send({
          success: false,
          data: { concertId: '', concertName: '', tiers: [] },
          error: `No concert found with ID: ${concertId}`,
        })
      }

      return reply.status(200).send({
        success: true,
        data: availability,
      })
    } catch (error) {
      request.log.error(error, 'Error fetching concert availability')
      return reply.status(500).send({
        success: false,
        data: { concertId: '', concertName: '', tiers: [] },
        error: 'Failed to fetch concert availability',
      })
    }
  }
}
