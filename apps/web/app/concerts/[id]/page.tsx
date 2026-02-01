import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getConcert } from '@/lib/api'
import { TicketTierCard } from '@/components/TicketTierCard'
import { BookingForm } from '@/components/BookingForm'
import { formatDate } from '@/lib/utils'

interface ConcertPageProps {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({ params }: ConcertPageProps): Promise<Metadata> => {
  const { id } = await params

  try {
    const concert = await getConcert(id)
    return {
      title: `${concert.name} - ${concert.artist}`,
      description: concert.description || `Buy tickets for ${concert.name} by ${concert.artist}`,
    }
  } catch {
    return {
      title: 'Concert Not Found',
    }
  }
}

const ConcertPage = async ({ params }: ConcertPageProps) => {
  const { id } = await params

  let concert
  try {
    concert = await getConcert(id)
  } catch {
    notFound()
  }

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/concerts"
        className="inline-flex items-center text-sm text-text-muted hover:text-text transition-colors mb-6"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to concerts
      </Link>

      {/* Concert Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-text mb-2">
          {concert.name}
        </h1>
        <p className="text-xl text-text-muted mb-4">{concert.artist}</p>

        <div className="space-y-2 text-text-muted">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(concert.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{concert.venue}</span>
          </div>
        </div>

        {concert.description && (
          <p className="text-text-muted mt-4 max-w-2xl">{concert.description}</p>
        )}
      </div>

      {/* Ticket Tiers */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text mb-4">
          Select Your Tickets
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {concert.ticketTiers.map((tier) => (
            <TicketTierCard key={tier.id} tier={tier}>
              <BookingForm tier={tier} />
            </TicketTierCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConcertPage
