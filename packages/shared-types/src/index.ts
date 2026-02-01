// Enums
export type TierType = 'VIP' | 'FRONT_ROW' | 'GA'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

// Entity Types
export interface Concert {
  id: string
  name: string
  artist: string
  date: string
  venue: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketTier {
  id: string
  concertId: string
  tierType: TierType
  price: string
  totalQuantity: number
  availableQuantity: number
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  userId: string
  ticketTierId: string
  quantity: number
  totalPrice: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  idempotencyKey: string
  createdAt: string
  updatedAt: string
}

// Composite Types
export interface ConcertWithTiers extends Concert {
  ticketTiers: TicketTier[]
}

export interface ConcertWithAvailability extends Concert {
  ticketTiers: TicketTier[]
  hasAvailableTickets: boolean
}

export interface BookingWithDetails extends Booking {
  concert: Concert
  ticketTier: TicketTier
}

// API Request Types
export interface CreateBookingRequest {
  userId: string
  ticketTierId: string
  quantity: number
  idempotencyKey: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  count?: number
  error?: string
}

export interface CreateBookingResponse {
  success: boolean
  booking: Booking | null
  message: string
}

export interface TierAvailability {
  tierId: string
  tierType: TierType
  availableQuantity: number
  totalQuantity: number
  price: string
}
