import type { DataProduct } from '@/types'

interface DocumentationTabProps {
  product: DataProduct
}

export function DocumentationTab({ product }: DocumentationTabProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Documentation</h2>
      
      {product.github.pagesUrl ? (
        <div className="h-96 border rounded">
          <iframe
            src={product.github.pagesUrl}
            className="w-full h-full rounded"
            sandbox="allow-scripts allow-same-origin"
            title={`Documentation for ${product.name}`}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No documentation available for this product.</p>
          {product.github.repoUrl && (
            <a 
              href={product.github.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View Repository
            </a>
          )}
        </div>
      )}
    </div>
  )
}