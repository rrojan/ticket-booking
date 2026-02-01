import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export const Card = ({
  children,
  padding = 'md',
  hover = false,
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg',
        {
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
          'transition-shadow hover:shadow-lg': hover,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
