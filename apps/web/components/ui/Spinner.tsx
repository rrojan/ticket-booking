import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner = ({ size = 'md', className, ...props }: SpinnerProps) => {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-primary border-t-transparent',
        {
          'h-4 w-4 border-2': size === 'sm',
          'h-8 w-8 border-3': size === 'md',
          'h-12 w-12 border-4': size === 'lg',
        },
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
