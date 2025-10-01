import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { Collection } from '@/types'

interface CollectionListProps {
  collections: Collection[]
  domainId: string
}

export function CollectionList({ collections, domainId }: CollectionListProps) {
  const navigate = useNavigate()

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/domain/${domainId}/collection/${collectionId}`)
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No collections found in this domain.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <div 
          key={collection.id} 
          className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleCollectionClick(collection.id)}
        >
          <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {collection.contracts.length} contracts
            </span>
            <Button variant="outline" size="sm">
              View Contracts
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}