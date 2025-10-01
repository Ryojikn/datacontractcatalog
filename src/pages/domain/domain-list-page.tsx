import { useEffect } from 'react'
import { useDomainStore } from '@/stores/domain'
import { DomainCard } from '@/components/domain'

export function DomainListPage() {
  const { domains, loading, error, fetchDomains } = useDomainStore()

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Error loading domains: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Domains</h1>
        <p className="text-muted-foreground mt-2">
          Browse through different data domains to explore collections and contracts
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  )
}