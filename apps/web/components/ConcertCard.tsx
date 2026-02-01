import Link from 'next/link'
import type { ConcertWithAvailability } from '@repo/shared-types'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { formatPrice, formatShortDate } from '@/lib/utils'

interface ConcertCardProps {
  concert: ConcertWithAvailability
}

export const ConcertCard = ({ concert }: ConcertCardProps) => {
  // Gets cheapest available price for ticket tier. Even though it is hardcoded for vip, front & ga, calculating it so its more future proof
  const minPrice = concert.ticketTiers.reduce((min, tier) => {
    const price = parseFloat(tier.price)
    return price < min ? price : min
  }, Infinity)

  return (
    <Link href={`/concerts/${concert.id}`} className="block">
      <Card hover padding="md" className="h-full">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-text line-clamp-1">
              {concert.name}
            </h3>
            <p className="text-sm text-text-muted mt-1">{concert.artist}</p>
          </div>

          <div className="space-y-1 text-sm text-text-muted">
            <p>{formatShortDate(concert.date)}</p>
            <p>{concert.venue}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Badge variant={concert.hasAvailableTickets ? 'success' : 'error'}>
              {concert.hasAvailableTickets ? 'Available' : 'Sold Out'}
            </Badge>
            {concert.hasAvailableTickets && (
              <p className="text-sm font-medium text-text">
                From {formatPrice(minPrice)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
