import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-semibold text-text tracking-tight mb-4">
            The best place to find tickets for
            <span className="block text-accent mt-2">the best concerts</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto">
            Book tickets to the best concerts at the best prices. Secure, fast, and reliable
            ticketing for music lovers worldwide!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/concerts"
            className="px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
          >
            Browse Concerts
          </Link>
          <Link
            href="/bookings"
            className="px-8 py-4 bg-surface border-2 border-primary text-primary rounded-lg hover:bg-primary-light transition-colors font-semibold text-lg"
          >
            My Bookings
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-2">🎫</div>
            <h3 className="font-semibold text-text mb-1">Secure Booking</h3>
            <p className="text-sm text-text-muted">
              No double-booking with our advanced reservation system
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-text mb-1">Lightning Fast</h3>
            <p className="text-sm text-text-muted">Book your tickets in seconds, not minutes</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🌍</div>
            <h3 className="font-semibold text-text mb-1">Global Access</h3>
            <p className="text-sm text-text-muted">Book from anywhere in the world</p>
          </div>
        </div>
      </div>
    </div>
  )
}
