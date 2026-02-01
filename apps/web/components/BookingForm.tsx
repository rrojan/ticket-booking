'use client'

import { useCallback } from 'react'
import type { TicketTier, CreateBookingResponse } from '@repo/shared-types'
import { useUserId } from '@/hooks/useUserId'
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { formatPrice } from '@/lib/utils'

interface BookingFormProps {
  tier: TicketTier
  onSuccess?: (booking: CreateBookingResponse) => void
}

type BookingState = 'idle' | 'loading' | 'success' | 'error'

export const BookingForm = ({ tier, onSuccess }: BookingFormProps) => {
  const userId = useUserId()
  const { key: idempotencyKey, regenerate } = useIdempotencyKey()

  const totalPrice = parseFloat(tier.price)
  const isSoldOut = tier.availableQuantity === 0
  const maxQuantity = Math.min(tier.availableQuantity, 10)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!userId || isSoldOut) return

    console.log('submit', e)
    },
    [userId, tier.id, idempotencyKey, isSoldOut, onSuccess]
  )

  const handleRetry = useCallback(() => {
    regenerate()
    console.log('retry')
  }, [regenerate])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Quantity"
        value={1}
        onChange={() => null}
        min={1}
        max={maxQuantity}
        disabled={false}
      />

      <div className="flex items-baseline justify-between text-sm">
        <span className="text-text-muted">Total Price:</span>
        <span className="text-xl font-semibold text-text">{formatPrice(totalPrice)}</span>
      </div>


      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isSoldOut || !userId}
          className="flex-1"
        >
          {isSoldOut ? 'Sold Out' : 'Book Now'}
        </Button>
      </div>

      {!userId && (
        <p className="text-xs text-text-muted text-center">
          Loading...
        </p>
      )}
    </form>
  )
}
