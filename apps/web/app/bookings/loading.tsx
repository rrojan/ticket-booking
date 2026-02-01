import { Spinner } from '@/components/ui/Spinner'

export default function BookingsLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-border/50 rounded-lg mb-2 animate-pulse" />
          <div className="h-5 w-32 bg-border/50 rounded-lg animate-pulse" />
        </div>

        {/* Booking Cards Skeleton */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-border/50 rounded-lg mb-2" />
                  <div className="h-4 w-1/2 bg-border/50 rounded-lg" />
                </div>
                <div className="h-6 w-20 bg-border/50 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-1/3 bg-border/50 rounded-lg" />
                <div className="h-5 w-full bg-border/50 rounded-lg" />
                <div className="h-4 w-1/4 bg-border/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <Spinner size="lg" />
      </div>
    </div>
  )
}
