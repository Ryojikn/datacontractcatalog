import { useEffect } from 'react'
import { useDomainStore } from '@/stores/domain'
import { DomainCard } from '@/components/domain'
import { DomainCardSkeleton } from '@/components/loading'
import { ErrorMessage, NetworkError } from '@/components/error'
import { OfflineBanner } from '@/components/offline'
import { SearchShortcut } from '@/components/search'
import { useOnlineStatus } from '@/hooks/use-online-status'

export function DomainListPage() {
  const { domains, loading, error, fetchDomains, clearError } = useDomainStore()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const handleRetry = () => {
    clearError()
    fetchDomains()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Data Domains</h1>
            <p className="text-muted-foreground mt-2">
              Browse through different data domains to explore collections and contracts
            </p>
          </div>
        </div>
        
        {/* Search shortcut */}
        <div className="max-w-md">
          <SearchShortcut 
            placeholder="Search domains, contracts, products..."
            className="w-full"
          />
        </div>
      </div>

      <OfflineBanner />

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DomainCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="min-h-[400px]">
          {!isOnline ? (
            <NetworkError onRetry={handleRetry} />
          ) : (
            <ErrorMessage
              title="Erro ao carregar domínios"
              message={error}
              onRetry={handleRetry}
            />
          )}
        </div>
      )}

      {!loading && !error && domains.length === 0 && (
        <div className="min-h-[400px]">
          <ErrorMessage
            title="Nenhum domínio encontrado"
            message="Não há domínios de dados disponíveis no momento."
            showRetry={false}
          />
        </div>
      )}

      {!loading && !error && domains.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      )}
    </div>
  )
}