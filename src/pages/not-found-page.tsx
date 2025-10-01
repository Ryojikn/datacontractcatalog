import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/">
              Go to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/" onClick={() => window.history.back()}>
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}