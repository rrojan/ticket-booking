'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserBookings } from '@/lib/api'
import { useUserId } from '@/hooks/useUserId'
import { BookingCard } from '@/components/BookingCard'
import { Spinner } from '@/components/ui/Spinner'
import type { BookingWithDetails } from '@repo/shared-types'

export default function BookingsPage() {
  const userId = useUserId()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await getUserBookings(userId)
        setBookings(data)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load your bookings. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [userId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-text-muted">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  const handleRetry = () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    getUserBookings(userId)
      .then((data) => setBookings(data))
      .catch((err) => {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load your bookings. Please try again.')
      })
      .finally(() => setIsLoading(false))
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-error/10 border border-error/20 rounded-lg p-6 mb-4">
            <p className="text-error font-medium mb-2">Error</p>
            <p className="text-text-muted text-sm">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-text tracking-tight mb-2">My Bookings</h1>
            <p className="text-text-muted">You haven&apos;t made any bookings yet.</p>
          </div>
          <Link
            href="/concerts"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
          >
            Browse Concerts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-text tracking-tight mb-2">My Bookings</h1>
          <p className="text-text-muted">
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
          </p>
        </div>

        {/* Bookings List */}
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/concerts"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            ← Back to Concerts
          </Link>
        </div>
      </div>
    </div>
  )
}
