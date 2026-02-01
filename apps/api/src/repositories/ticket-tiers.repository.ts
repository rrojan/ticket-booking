import { db } from '../db/index.js'
import { ticketTiers } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'

export class TicketTiersRepository {
  async findById(id: string) {
    const result = await db.select().from(ticketTiers).where(eq(ticketTiers.id, id)).limit(1)
    return result[0] || null
  }

  async findByConcertId(concertId: string) {
    return await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.concertId, concertId))
      .orderBy(ticketTiers.price)
  }

  /**
   * Get current availability for a ticket tier
   * We must use this before attempting a booking for concurrency conflict handling
   */
  async getAvailability(tierId: string) {
    const tier = await this.findById(tierId)
    if (!tier) return null

    return {
      tierId: tier.id,
      availableQuantity: tier.availableQuantity,
      totalQuantity: tier.totalQuantity,
      price: tier.price,
    }
  }

  /**
   * Update the available quantity for a ticket tier
   * Used to decrement tickets after a successful booking
   */
  async updateAvailability(tierId: string, newAvailableQuantity: number) {
    const result = await db
      .update(ticketTiers)
      .set({
        availableQuantity: newAvailableQuantity,
        updatedAt: new Date(),
      })
      .where(eq(ticketTiers.id, tierId))
      .returning()

    return result[0] || null
  }
}
