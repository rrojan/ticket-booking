'use client'

import { useState, useCallback } from 'react'
import type { TicketTier, CreateBookingResponse } from '@repo/shared-types'
import { useUserId } from '@/hooks/useUserId'
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey'
import { createBooking } from '@/lib/api'
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

  const [quantity, setQuantity] = useState(1)
  const [state, setState] = useState<BookingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null)

  const totalPrice = parseFloat(tier.price) * quantity
  const isSoldOut = tier.availableQuantity === 0
  const maxQuantity = Math.min(tier.availableQuantity, 10)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!userId || isSoldOut) return

      setState('loading')
      setError(null)

      try {
        const result = await createBooking({
          userId,
          ticketTierId: tier.id,
          quantity,
          idempotencyKey,
        })

        if (result.success) {
          setState('success')
          setBookingResult(result)
          onSuccess?.(result)
        } else {
          setState('error')
          setError(result.message || 'Booking failed. Please try again.')
        }
      } catch (err) {
        setState('error')
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    },
    [userId, tier.id, quantity, idempotencyKey, isSoldOut, onSuccess]
  )

  const handleRetry = useCallback(() => {
    setState('idle')
    setError(null)
    setBookingResult(null)
    regenerate()
  }, [regenerate])

  if (state === 'success' && bookingResult?.booking) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-success-light p-4">
          <h4 className="font-semibold text-success mb-2">Booking Confirmed! 🎉</h4>
          <div className="text-sm text-text space-y-1">
            <p>
              <span className="font-medium">Quantity:</span> {bookingResult.booking.quantity}{' '}
              {bookingResult.booking.quantity === 1 ? 'ticket' : 'tickets'}
            </p>
            <p>
              <span className="font-medium">Total:</span> {formatPrice(bookingResult.booking.totalPrice)}
            </p>
            <p className="text-text-muted mt-2">
              Check your bookings page for more details.
            </p>
          </div>
        </div>
        <Button onClick={handleRetry} variant="outline" className="w-full">
          Book Another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Quantity"
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={maxQuantity}
        disabled={isSoldOut || state === 'loading' || !userId}
      />

      <div className="flex items-baseline justify-between text-sm">
        <span className="text-text-muted">Total Price:</span>
        <span className="text-xl font-semibold text-text">{formatPrice(totalPrice)}</span>
      </div>

      {error && (
        <div className="rounded-lg bg-error-light p-3">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          loading={state === 'loading'}
          disabled={isSoldOut || !userId || state === 'loading'}
          className="flex-1"
        >
          {isSoldOut ? 'Sold Out' : 'Book Now'}
        </Button>
        {state === 'error' && (
          <Button type="button" variant="outline" onClick={handleRetry}>
            Retry
          </Button>
        )}
      </div>

      {!userId && (
        <p className="text-xs text-text-muted text-center">
          Loading...
        </p>
      )}
    </form>
  )
}
