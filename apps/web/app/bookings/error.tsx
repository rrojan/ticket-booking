'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Bookings page error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-text tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-text-muted">We couldn&apos;t load your bookings.</p>
        </div>

        <div className="bg-error/10 border border-error/20 rounded-lg p-6 mb-6">
          <p className="text-error font-medium mb-2">Error Details</p>
          <p className="text-text-muted text-sm">{error.message || 'An unexpected error occurred'}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/concerts"
            className="px-6 py-3 bg-surface border border-border text-text rounded-md hover:bg-border/20 transition-colors font-medium"
          >
            Browse Concerts
          </Link>
        </div>
      </div>
    </div>
  )
}
