import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const ConcertNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-semibold text-text mb-2">Concert Not Found</h2>
      <p className="text-text-muted mb-6 max-w-md">
        The concert you are looking for does not exist.
      </p>
      <Link href="/concerts">
        <Button variant="primary">Browse All Concerts</Button>
      </Link>
    </div>
  )
}

export default ConcertNotFound
