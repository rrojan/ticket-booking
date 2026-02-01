import type { ConcertWithAvailability, ConcertWithTiers } from '@repo/shared-types'
import { ConcertsRepository } from '../repositories/concerts.repository.js'
import { TicketTiersRepository } from '../repositories/ticket-tiers.repository.js'

export class ConcertsService {
  private concertsRepo: ConcertsRepository
  private ticketTiersRepo: TicketTiersRepository

  constructor() {
    this.concertsRepo = new ConcertsRepository()
    this.ticketTiersRepo = new TicketTiersRepository()
  }

  /**
   * Get all concerts with availability info
   */
  async getAllConcerts(): Promise<ConcertWithAvailability[]> {
    const concerts = await this.concertsRepo.findAllWithAvailability()
    // Type assertion: Drizzle returns Date objects, but they serialize to ISO strings over HTTP
    return concerts as unknown as ConcertWithAvailability[]
  }

  /**
   * Get a single concert by ID with ticket tiers
   */
  async getConcertById(concertId: string): Promise<ConcertWithTiers | null> {
    const concert = await this.concertsRepo.findWithTicketTiers(concertId)
    if (!concert) return null
    return concert as unknown as ConcertWithTiers
  }

  /**
   * Get reliable availability for a specific concert under load
   * Can use this later to show ticket counts in ui
   */
  async getConcertAvailability(concertId: string) {
    const concert = await this.concertsRepo.findById(concertId)
    if (!concert) return null

    const tiers = await this.ticketTiersRepo.findByConcertId(concertId)

    return {
      concertId: concert.id,
      concertName: concert.name,
      tiers: tiers.map((tier) => ({
        tierId: tier.id,
        tierType: tier.tierType,
        price: tier.price,
        availableQuantity: tier.availableQuantity,
        totalQuantity: tier.totalQuantity,
      })),
    }
  }
}
