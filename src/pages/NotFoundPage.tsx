import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-white px-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl font-bold text-burgundy">404</span>
        <p className="text-lg font-semibold">Page not found</p>
        <p className="text-body text-ink-muted">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="mt-2">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
