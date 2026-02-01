export * from './concerts.schema.js'
export * from './ticket-tiers.schema.js'
export * from './bookings.schema.js'

import { concerts } from './concerts.schema.js'
import { ticketTiers } from './ticket-tiers.schema.js'
import { bookings, bookingStatusEnum } from './bookings.schema.js'

export const schema = {
  concerts,
  ticketTiers,
  bookings,
  bookingStatusEnum,
}
