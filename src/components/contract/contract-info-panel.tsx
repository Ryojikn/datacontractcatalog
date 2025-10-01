import type { DataContract } from '@/types'
import { Badge } from '@/components/ui'

interface ContractInfoPanelProps {
  contract: DataContract
}

export function ContractInfoPanel({ contract }: ContractInfoPanelProps) {
  const getLayerVariant = (layer: string) => {
    switch (layer.toLowerCase()) {
      case 'bronze': return 'bronze'
      case 'silver': return 'silver'
      case 'gold': return 'gold'
      case 'model': return 'model'
      default: return 'secondary'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'published'
      case 'draft': return 'draft'
      case 'archived': return 'archived'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Contract Fundamentals */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3 text-base">Fundamentals</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                  <span className="text-sm">{contract.fundamentals.name}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Version</span>
                  <span className="text-sm font-mono">{contract.fundamentals.version}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Owner</span>
                  <span className="text-sm">{contract.fundamentals.owner}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Domain</span>
                  <span className="text-sm capitalize">{contract.fundamentals.domain}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Collection</span>
                  <span className="text-sm">{contract.fundamentals.collection}</span>
                </div>
              </div>

              {contract.fundamentals.description && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Description</span>
                  <span className="text-sm text-muted-foreground">{contract.fundamentals.description}</span>
                </div>
              )}

              {(contract.fundamentals.createdAt || contract.fundamentals.updatedAt) && (
                <div className="grid grid-cols-2 gap-4">
                  {contract.fundamentals.createdAt && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Created</span>
                      <span className="text-sm">{new Date(contract.fundamentals.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {contract.fundamentals.updatedAt && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Updated</span>
                      <span className="text-sm">{new Date(contract.fundamentals.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3 text-base">Tags</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Layer:</span>
                <Badge variant={getLayerVariant(contract.tags.layer)}>
                  {contract.tags.layer}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={getStatusVariant(contract.tags.status)}>
                  {contract.tags.status}
                </Badge>
              </div>
              {/* Additional tags */}
              {Object.entries(contract.tags)
                .filter(([key]) => !['layer', 'status'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{key}:</span>
                    <Badge variant="outline">{value}</Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      {contract.terms && Object.keys(contract.terms).length > 0 && (
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="font-medium mb-4 text-base">Contract Terms</h3>
          <div className="space-y-3">
            {Object.entries(contract.terms).map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}