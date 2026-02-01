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
   * Get all concerts with availability inof
   */
  async getAllConcerts() {
    return await this.concertsRepo.findAllWithAvailability()
  }

  /**
   * Get a single concert by ID with ticket tiers
   */
  async getConcertById(concertId: string) {
    return await this.concertsRepo.findWithTicketTiers(concertId)
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
        id: tier.id,
        tierType: tier.tierType,
        price: tier.price,
        availableQuantity: tier.availableQuantity,
        totalQuantity: tier.totalQuantity,
      })),
    }
  }
}
