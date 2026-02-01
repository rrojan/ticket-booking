export * from './concerts.schema.js'
export * from './ticket-tiers.schema.js'
export * from './bookings.schema.js'

import { concerts } from './concerts.schema.js'
import { ticketTiers, tierTypeEnum } from './ticket-tiers.schema.js'
import { bookings, bookingStatusEnum, paymentStatusEnum } from './bookings.schema.js'

export const schema = {
  concerts,
  ticketTiers,
  bookings,
  tierTypeEnum,
  bookingStatusEnum,
  paymentStatusEnum,
}
