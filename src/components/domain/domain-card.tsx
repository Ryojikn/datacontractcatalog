import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { Domain } from '@/types'

interface DomainCardProps {
  domain: Domain
}

export function DomainCard({ domain }: DomainCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/domain/${domain.id}`)
  }

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <h3 className="text-xl font-semibold mb-2">{domain.name}</h3>
      <p className="text-muted-foreground mb-4">{domain.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {domain.collections.length} collections
        </span>
        <Button variant="outline" size="sm">
          Explore
        </Button>
      </div>
    </div>
  )
}