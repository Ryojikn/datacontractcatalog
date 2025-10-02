import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useDomainStore } from '@/stores/domain'
import { CollectionList } from '@/components/domain'
import { Breadcrumb } from '@/components/layout'
import type { BreadcrumbItem } from '@/types'

export function CollectionListPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const { domains, selectedDomain, loading, error, fetchDomains, selectDomain } = useDomainStore()

  // Load domains if not already loaded
  useEffect(() => {
    if (domains.length === 0) {
      fetchDomains()
    }
  }, [domains.length, fetchDomains])

  // Select domain when domains are loaded and domainId changes
  useEffect(() => {
    if (domainId && domains.length > 0 && (!selectedDomain || selectedDomain.id !== domainId)) {
      selectDomain(domainId)
    }
  }, [domainId, domains.length, selectedDomain?.id, selectDomain])

  if (!domainId) {
    return <Navigate to="/" replace />
  }

  // Show loading only when domains are being fetched for the first time
  // Don't show loading when just selecting a domain from already loaded domains
  if (loading && domains.length === 0) {
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

  // If domains are loaded but selectedDomain is not yet set, try to find it in the domains array
  const currentDomain = selectedDomain || domains.find(d => d.id === domainId)
  
  if (!currentDomain) {
    return <Navigate to="/" replace />
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Domains', path: '/' },
    { label: currentDomain.name, active: true }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{currentDomain.name}</h1>
        <p className="text-muted-foreground mt-2">{currentDomain.description}</p>
      </div>
      
      <CollectionList collections={currentDomain.collections} domainId={domainId} />
    </div>
  )
}