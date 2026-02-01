import type { Metadata } from 'next'
import { getConcerts } from '@/lib/api'
import { ConcertCard } from '@/components/ConcertCard'

export const metadata: Metadata = {
  title: 'Upcoming Concerts',
}

// Disable caching to ensure fresh data after bookings
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ConcertsPage = async () => {
  const concerts = await getConcerts()

  if (concerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-semibold text-text mb-2">No concerts available right now</h2>
        <p className="text-text-muted">Check back soon for upcoming concerts!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-text">Upcoming Concerts</h1>
        <p className="text-text-muted mt-2">
          Browse and book tickets for the hottest new concerts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concerts.map((concert) => (
          <ConcertCard key={concert.id} concert={concert} />
        ))}
      </div>
    </div>
  )
}

export default ConcertsPage
