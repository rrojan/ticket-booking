'use client'

import { useState, useEffect } from 'react'

const USER_ID_KEY = 'ticket_booking_user_id'

export const useUserId = (): string => {
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    let storedId = localStorage.getItem(USER_ID_KEY)

    if (!storedId) {
      storedId = `user_${crypto.randomUUID()}`
      localStorage.setItem(USER_ID_KEY, storedId)
    }

    setUserId(storedId)
  }, [])

  return userId
}
