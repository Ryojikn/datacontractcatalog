import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { DataContract } from '@/types'

interface ContractListProps {
  contracts: DataContract[]
}

export function ContractList({ contracts }: ContractListProps) {
  const navigate = useNavigate()

  const handleContractClick = (contractId: string) => {
    navigate(`/contract/${contractId}`)
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No contracts found in this collection.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contracts.map((contract) => (
        <div 
          key={contract.id} 
          className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleContractClick(contract.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{contract.fundamentals.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              contract.tags.status === 'published' ? 'bg-green-100 text-green-800' :
              contract.tags.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {contract.tags.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Version {contract.fundamentals.version} • {contract.fundamentals.owner}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {contract.schema.columns.length} columns • {contract.qualityRules.length} quality rules
          </p>
          <div className="flex justify-between items-center">
            <span className={`px-2 py-1 text-xs rounded ${
              contract.tags.layer === 'Bronze' ? 'bg-orange-100 text-orange-800' :
              contract.tags.layer === 'Silver' ? 'bg-gray-100 text-gray-800' :
              contract.tags.layer === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {contract.tags.layer}
            </span>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}