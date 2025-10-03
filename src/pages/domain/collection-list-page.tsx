import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useDomainStore } from '@/stores/domain'
import { CollectionList } from '@/components/domain'
import { Breadcrumb } from '@/components/layout'
import { CollectionListSkeleton } from '@/components/loading'
import { ErrorMessage, NetworkError, NotFoundError } from '@/components/error'
import { OfflineBanner } from '@/components/offline'
import { useOnlineStatus } from '@/hooks/use-online-status'
import type { BreadcrumbItem } from '@/types'

export function CollectionListPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const { 
    domains, 
    selectedDomain, 
    loading, 
    error, 
    fetchDomains, 
    selectDomain,
    clearError 
  } = useDomainStore()
  const isOnline = useOnlineStatus()

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

  const handleRetry = () => {
    clearError()
    if (domains.length === 0) {
      fetchDomains()
    } else if (domainId) {
      selectDomain(domainId)
    }
  }

  // Show loading only when domains are being fetched for the first time
  if (loading && domains.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-64" />
        <CollectionListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OfflineBanner />
        <div className="min-h-[400px]">
          {!isOnline ? (
            <NetworkError onRetry={handleRetry} />
          ) : (
            <ErrorMessage
              title="Erro ao carregar domínio"
              message={error}
              onRetry={handleRetry}
            />
          )}
        </div>
      </div>
    )
  }

  // If domains are loaded but selectedDomain is not yet set, try to find it in the domains array
  const currentDomain = selectedDomain || domains.find(d => d.id === domainId)
  
  if (!currentDomain) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OfflineBanner />
        <div className="min-h-[400px]">
          <NotFoundError 
            message="O domínio solicitado não foi encontrado."
            onRetry={() => window.history.back()}
          />
        </div>
      </div>
    )
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Domains', path: '/' },
    { label: currentDomain.name, active: true }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <OfflineBanner />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{currentDomain.name}</h1>
        <p className="text-muted-foreground mt-2">{currentDomain.description}</p>
      </div>
      
      <CollectionList collections={currentDomain.collections} domainId={domainId} />
    </div>
  )
}