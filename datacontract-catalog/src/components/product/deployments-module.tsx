import type { DataProduct } from '@/types'

interface DeploymentsModuleProps {
  product: DataProduct
}

export function DeploymentsModule({ product }: DeploymentsModuleProps) {
  const deployments = product.deployments || []

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="font-semibold mb-3">Recent Deployments</h3>
      
      {deployments.length === 0 && (
        <p className="text-muted-foreground text-sm">No deployments found.</p>
      )}

      {deployments.length > 0 && (
        <div className="space-y-2">
          {deployments.slice(0, 5).map((deployment) => (
            <div key={deployment.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-medium">{deployment.environment}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(deployment.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                deployment.status === 'success' ? 'bg-green-100 text-green-800' :
                deployment.status === 'failure' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {deployment.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}