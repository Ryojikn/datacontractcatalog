import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStore } from '@/stores/product'
import { Button, Badge } from '@/components/ui'
import { InlineError } from '@/components/error'
import { useOnlineStatus } from '@/hooks/use-online-status'
import type { ExecutionStatus } from '@/types'

interface DataProductsModuleProps {
  contractId: string
}

export function DataProductsModule({ contractId }: DataProductsModuleProps) {
  const navigate = useNavigate()
  const { 
    products, 
    loading, 
    error, 
    fetchProductsByContract,
    clearError 
  } = useProductStore()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    fetchProductsByContract(contractId)
  }, [contractId, fetchProductsByContract])

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  const handleRetry = () => {
    clearError()
    fetchProductsByContract(contractId)
  }

  const getExecutionStatusBadge = (status: ExecutionStatus) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>
      case 'failure':
        return <Badge variant="destructive">Failed</Badge>
      case 'running':
        return <Badge variant="warning">Running</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatExecutionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Less than 1 hour ago'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Data Products</h2>
        {!loading && !error && products.length > 0 && (
          <Badge variant="outline">{products.length} product{products.length > 1 ? 's' : ''}</Badge>
        )}
      </div>
      
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 bg-muted animate-pulse rounded w-32" />
                <div className="h-5 bg-muted animate-pulse rounded w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-36" />
              </div>
              <div className="mt-3">
                <div className="h-8 bg-muted animate-pulse rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <InlineError 
          message={!isOnline ? "Sem conexão com a internet" : error}
          onRetry={handleRetry}
          className="mb-4"
        />
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No products associated with this contract</p>
          <p className="text-muted-foreground text-xs mt-1">
            Products will appear here when they are created for this data contract
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-base mb-1">{product.name}</h4>
                  {/* Description suppressed to optimize space usage in narrower column */}
                </div>
                {product.technology && (
                  <Badge variant="model" className="ml-2 shrink-0">
                    {product.technology}
                  </Badge>
                )}
              </div>

              {product.lastExecution && (
                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Last execution:</span>
                    {getExecutionStatusBadge(product.lastExecution.status)}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatExecutionDate(product.lastExecution.date)}
                  </span>
                </div>
              )}

              {product.github && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground">
                    Repository: <span className="font-mono">{product.github.repoName}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {product.id}</span>
                  {product.lastExecution?.duration && (
                    <>
                      <span>•</span>
                      <span>Duration: {Math.round(product.lastExecution.duration / 60)}min</span>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}