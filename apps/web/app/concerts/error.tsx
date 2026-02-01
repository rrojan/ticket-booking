'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

const ConcertsError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('Concert list error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-semibold text-text mb-2">Something went wrong</h2>
      <p className="text-text-muted mb-6 max-w-md">
        Failed to load concerts
      </p>
      <Button onClick={reset} variant="primary">
        Try Again
      </Button>
    </div>
  )
}

export default ConcertsError
