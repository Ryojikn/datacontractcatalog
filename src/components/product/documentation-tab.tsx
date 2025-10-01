import { useState, useEffect } from 'react'
import type { DataProduct } from '@/types'
import { Button } from '@/components/ui'

interface DocumentationTabProps {
  product: DataProduct
}

export function DocumentationTab({ product }: DocumentationTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setHasError(false)
    setRetryCount(prev => prev + 1)
  }

  useEffect(() => {
    // Reset states when product changes
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)
  }, [product.id])

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Documentation</h2>
        {product.github.pagesUrl && (
          <a 
            href={product.github.pagesUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Open in new tab ↗
          </a>
        )}
      </div>
      
      {product.github.pagesUrl ? (
        <div className="relative">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading documentation...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
              <div className="text-center space-y-4 p-6">
                <div className="text-destructive">
                  <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Failed to load documentation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The GitHub Pages documentation could not be loaded. This might be due to network issues or the documentation site being unavailable.
                  </p>
                  <div className="space-y-2">
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      Try Again
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Attempt {retryCount + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Iframe container */}
          <div className="h-[600px] border rounded-lg overflow-hidden">
            <iframe
              key={`${product.id}-${retryCount}`} // Force re-render on retry
              src={product.github.pagesUrl}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={`Documentation for ${product.name}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        // Fallback content when no GitHub Pages URL is available
        <div className="text-center py-16 space-y-4">
          <div className="text-muted-foreground">
            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">No documentation available</h3>
            <p className="text-muted-foreground mb-6">
              This product doesn't have GitHub Pages documentation configured yet.
            </p>
            <div className="space-y-3">
              {product.github.repoUrl && (
                <div>
                  <Button asChild variant="outline">
                    <a 
                      href={product.github.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Repository
                    </a>
                  </Button>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>To add documentation:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-left max-w-md mx-auto">
                  <li>Enable GitHub Pages in your repository settings</li>
                  <li>Add documentation files to your repository</li>
                  <li>Update the product configuration with the Pages URL</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}