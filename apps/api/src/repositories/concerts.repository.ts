import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { concerts, ticketTiers } from '../db/schema/index.js'

export class ConcertsRepository {
  /**
   * Find all concerts ordered by dat
   */
  async findAll() {
    return await db.select().from(concerts).orderBy(concerts.date)
  }

  /**
   * Find concert by ID
   */
  async findById(id: string) {
    const result = await db.select().from(concerts).where(eq(concerts.id, id)).limit(1)
    return result[0] || null
  }

  /**
   * Find concert with all ticket tiers and availability
   */
  async findWithTicketTiers(concertId: string) {
    const concert = await this.findById(concertId)
    if (!concert) return null

    const tiers = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.concertId, concertId))
      .orderBy(ticketTiers.price)

    return {
      ...concert,
      ticketTiers: tiers,
    }
  }

  /**
   * Find all concerts with their ticket tier availability
   * Useful for listing page to show which concerts have tickets available
   */
  async findAllWithAvailability() {
    const allConcerts = await this.findAll()
    const concertsWithTiers = await Promise.all(
      allConcerts.map(async (concert) => {
        const tiers = await db
          .select()
          .from(ticketTiers)
          .where(eq(ticketTiers.concertId, concert.id))
          .orderBy(ticketTiers.price)

        // TODO: optimize this to query from db.. if time allows
        const hasAvailableTickets = tiers.some((tier) => tier.availableQuantity > 0)

        return {
          ...concert,
          ticketTiers: tiers,
          hasAvailableTickets,
        }
      })
    )

    return concertsWithTiers
  }
}
