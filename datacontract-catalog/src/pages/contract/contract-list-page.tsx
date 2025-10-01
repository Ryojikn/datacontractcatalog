import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useDomainStore } from '@/stores/domain'
import { useContractStore } from '@/stores/contract'
import { ContractList } from '@/components/contract'
import { Breadcrumb } from '@/components/layout'
import type { BreadcrumbItem } from '@/types'

export function ContractListPage() {
  const { domainId, collectionId } = useParams<{ domainId: string; collectionId: string }>()
  const { domains, selectedDomain, fetchDomains, selectDomain } = useDomainStore()
  const { contracts, loading, error, fetchContractsByCollection } = useContractStore()

  useEffect(() => {
    if (domains.length === 0) {
      fetchDomains()
    }
  }, [domains.length, fetchDomains])

  useEffect(() => {
    if (domainId && domains.length > 0) {
      selectDomain(domainId)
    }
  }, [domainId, domains, selectDomain])

  useEffect(() => {
    if (collectionId) {
      fetchContractsByCollection(collectionId)
    }
  }, [collectionId, fetchContractsByCollection])

  if (!domainId || !collectionId) {
    return <Navigate to="/" replace />
  }

  if (loading || !selectedDomain) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-96" />
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
          <p className="text-destructive">Error loading contracts: {error}</p>
        </div>
      </div>
    )
  }

  const collection = selectedDomain.collections.find(c => c.id === collectionId)
  if (!collection) {
    return <Navigate to={`/domain/${domainId}`} replace />
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Domains', path: '/' },
    { label: selectedDomain.name, path: `/domain/${domainId}` },
    { label: collection.name, active: true }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{collection.name}</h1>
        <p className="text-muted-foreground mt-2">
          Data contracts in the {collection.name} collection
        </p>
      </div>
      
      <ContractList contracts={contracts} />
    </div>
  )
}