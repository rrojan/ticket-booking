'use client'

import { useState, useCallback } from 'react'

interface UseIdempotencyKeyReturn {
  key: string
  regenerate: () => void
}

export const useIdempotencyKey = (): UseIdempotencyKeyReturn => {
  const [key, setKey] = useState<string>(() => crypto.randomUUID())

  const regenerate = useCallback(() => {
    setKey(crypto.randomUUID())
  }, [])

  return { key, regenerate }
}
