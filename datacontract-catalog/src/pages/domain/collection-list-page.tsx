import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useDomainStore } from '@/stores/domain'
import { CollectionList } from '@/components/domain'
import { Breadcrumb } from '@/components/layout'
import type { BreadcrumbItem } from '@/types'

export function CollectionListPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const { domains, selectedDomain, loading, error, fetchDomains, selectDomain } = useDomainStore()

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

  if (!domainId) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-64" />
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
          <p className="text-destructive">Error loading domain: {error}</p>
        </div>
      </div>
    )
  }

  if (!selectedDomain) {
    return <Navigate to="/" replace />
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Domains', path: '/' },
    { label: selectedDomain.name, active: true }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{selectedDomain.name}</h1>
        <p className="text-muted-foreground mt-2">{selectedDomain.description}</p>
      </div>
      
      <CollectionList collections={selectedDomain.collections} domainId={domainId} />
    </div>
  )
}