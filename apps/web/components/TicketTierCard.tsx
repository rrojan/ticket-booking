import type { TicketTier } from '@repo/shared-types'
import { Card } from './ui/Card'
import { formatPrice, getTierLabel, getTierDescription } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TicketTierCardProps {
  tier: TicketTier
  children?: React.ReactNode
}

export const TicketTierCard = ({ tier, children }: TicketTierCardProps) => {
  const isSoldOut = tier.availableQuantity === 0

  return (
    <Card
      padding="md"
      className={cn('transition-all', {
        'opacity-60': isSoldOut,
      })}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">{getTierLabel(tier.tierType)}</h3>
              <p className="text-sm text-text-muted mt-1">{getTierDescription(tier.tierType)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-text">{formatPrice(tier.price)}</p>
            </div>
          </div>
        </div>

        <div className="text-sm">
          {isSoldOut ? (
            <p className="text-error font-medium">Sold Out</p>
          ) : (
            <p className="text-text-muted">
              {tier.availableQuantity} ticket{tier.availableQuantity === 1 ? '' : 's'} left
            </p>
          )}
        </div>

        {children && <div className="pt-2 border-t border-border">{children}</div>}
      </div>
    </Card>
  )
}
