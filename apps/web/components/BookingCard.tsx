import type { BookingWithDetails, BookingStatus } from '@repo/shared-types'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { formatPrice, formatShortDate, getTierLabel } from '@/lib/utils'

interface BookingCardProps {
  booking: BookingWithDetails
}

const getStatusVariant = (status: BookingStatus): 'success' | 'warning' | 'error' | 'neutral' => {
  const statusMap: Record<BookingStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
    CONFIRMED: 'success',
    PENDING: 'warning',
    FAILED: 'error',
    CANCELLED: 'neutral',
  }
  return statusMap[status]
}

export const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        {/* Header: Concert Name & Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-text tracking-tight truncate">
              {booking.concert.name}
            </h3>
            <p className="text-sm text-text-muted mt-0.5">{booking.concert.artist}</p>
          </div>
          <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
        </div>

        {/* Booking Details */}
        <div className="flex flex-col gap-2 text-sm">
          {/* Tier Type */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Tier:</span>
            <Badge variant="neutral">{getTierLabel(booking.ticketTier.tierType)}</Badge>
          </div>

          {/* Quantity & Total Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Quantity:</span>
              <span className="font-medium text-text">{booking.quantity}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-text">
                {formatPrice(booking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Booking Date */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <span className="text-text-muted text-xs">Booked on:</span>
            <span className="text-xs text-text">{formatShortDate(booking.createdAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
