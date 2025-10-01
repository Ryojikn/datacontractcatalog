import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStore } from '@/stores/product'
import { Button } from '@/components/ui'

interface DataProductsModuleProps {
  contractId: string
}

export function DataProductsModule({ contractId }: DataProductsModuleProps) {
  const navigate = useNavigate()
  const { products, loading, error, fetchProductsByContract } = useProductStore()

  useEffect(() => {
    fetchProductsByContract(contractId)
  }, [contractId, fetchProductsByContract])

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Data Products</h2>
      
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm">Error loading products: {error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-muted-foreground text-sm">No products associated with this contract.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-3">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="border rounded p-3 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{product.name}</h4>
                {product.technology && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {product.technology}
                  </span>
                )}
              </div>
              {product.lastExecution && (
                <p className="text-xs text-muted-foreground">
                  Last execution: {new Date(product.lastExecution.date).toLocaleDateString()} 
                  ({product.lastExecution.status})
                </p>
              )}
              <div className="mt-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}