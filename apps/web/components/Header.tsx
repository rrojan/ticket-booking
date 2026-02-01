'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export const Header = () => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-semibold text-text tracking-tight">
            TicketBook
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/concerts"
              className={cn(
                'text-base font-medium transition-colors',
                isActive('/concerts') ? 'text-primary' : 'text-text-muted hover:text-text'
              )}
            >
              Concerts
            </Link>
            <Link
              href="/bookings"
              className={cn(
                'text-base font-medium transition-colors',
                isActive('/bookings') ? 'text-primary' : 'text-text-muted hover:text-text'
              )}
            >
              My Bookings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
