import type { DataProduct } from '@/types'

interface ExecutionsModuleProps {
  product: DataProduct
}

export function ExecutionsModule({ product }: ExecutionsModuleProps) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="font-semibold mb-3">Execution Status</h3>
      
      {product.lastExecution ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Last Execution</span>
            <span className={`px-2 py-1 text-xs rounded ${
              product.lastExecution.status === 'success' ? 'bg-green-100 text-green-800' :
              product.lastExecution.status === 'failure' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {product.lastExecution.status}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Date: {new Date(product.lastExecution.date).toLocaleString()}</p>
            <p>Technology: {product.lastExecution.technology}</p>
            {product.lastExecution.duration && (
              <p>Duration: {product.lastExecution.duration}s</p>
            )}
          </div>
          {product.lastExecution.errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <p className="text-red-800">{product.lastExecution.errorMessage}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No execution history available.</p>
      )}
    </div>
  )
}