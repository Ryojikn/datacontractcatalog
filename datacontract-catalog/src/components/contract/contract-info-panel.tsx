import type { DataContract } from '@/types'

interface ContractInfoPanelProps {
  contract: DataContract
}

export function ContractInfoPanel({ contract }: ContractInfoPanelProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Fundamentals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{contract.fundamentals.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>{contract.fundamentals.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner:</span>
              <span>{contract.fundamentals.owner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domain:</span>
              <span>{contract.fundamentals.domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Collection:</span>
              <span>{contract.fundamentals.collection}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs rounded ${
              contract.tags.layer === 'Bronze' ? 'bg-orange-100 text-orange-800' :
              contract.tags.layer === 'Silver' ? 'bg-gray-100 text-gray-800' :
              contract.tags.layer === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {contract.tags.layer}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${
              contract.tags.status === 'published' ? 'bg-green-100 text-green-800' :
              contract.tags.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {contract.tags.status}
            </span>
          </div>
        </div>

        {contract.terms && Object.keys(contract.terms).length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Terms</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(contract.terms).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}