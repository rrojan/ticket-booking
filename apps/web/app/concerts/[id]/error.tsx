'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const ConcertError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('Concert details error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-semibold text-text mb-2">Failed to load concert</h2>
      <p className="text-text-muted mb-6 max-w-md">
        We couldn&apos;t load this concert&apos;s details. Please try again or return to the concert list.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
        <Link href="/concerts">
          <Button variant="outline">Back to Concerts</Button>
        </Link>
      </div>
    </div>
  )
}

export default ConcertError
