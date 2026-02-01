import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-text tracking-tight mb-2">Page Not Found</h2>
          <p className="text-text-muted">The page you are looking for not exist</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
          >
            Go Home
          </Link>
          <Link
            href="/concerts"
            className="px-6 py-3 bg-surface border border-border text-text rounded-md hover:bg-border/20 transition-colors font-medium"
          >
            Browse Concerts
          </Link>
        </div>
      </div>
    </div>
  )
}
