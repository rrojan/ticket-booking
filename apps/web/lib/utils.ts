import type { TierType } from '@repo/shared-types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const getTierLabel = (tierType: TierType): string => {
  const labels: Record<TierType, string> = {
    VIP: 'VIP',
    FRONT_ROW: 'Front Row',
    GA: 'General Admission',
  }
  return labels[tierType]
}

export const getTierDescription = (tierType: TierType): string => {
  const descriptions: Record<TierType, string> = {
    VIP: 'VIP seat with premium amenities',
    FRONT_ROW: 'Best front-row views of the concert',
    GA: 'General admission',
  }
  return descriptions[tierType]
}
