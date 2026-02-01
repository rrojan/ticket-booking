import { Card } from '@/components/ui/Card'

const ConcertLoading = () => {
  return (
    <div>
      {/* Back Link Skeleton */}
      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />

      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-7 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />

        <div className="space-y-2">
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="h-16 w-full max-w-2xl bg-gray-200 rounded animate-pulse mt-4" />
      </div>

      {/* Ticket Tiers Skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} padding="md">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConcertLoading
