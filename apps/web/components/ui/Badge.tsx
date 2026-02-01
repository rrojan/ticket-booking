import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'neutral'
  children: ReactNode
}

export const Badge = ({ variant = 'neutral', children, className, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-success-light text-success': variant === 'success',
          'bg-warning-light text-warning': variant === 'warning',
          'bg-error-light text-error': variant === 'error',
          'bg-gray-100 text-gray-700': variant === 'neutral',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
