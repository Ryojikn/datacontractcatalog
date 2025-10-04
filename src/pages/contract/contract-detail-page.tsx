import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useContractStore } from '@/stores/contract'
import { useDomainStore } from '@/stores/domain'
import { useProductStore } from '@/stores/product'
import { SchemaVisualizer } from '@/components/contract'
import { ContractInfoPanel } from '@/components/contract'
import { DataProductsModule } from '@/components/contract'
import { QualityRulesModule } from '@/components/contract'

import { Breadcrumb } from '@/components/layout'
import { ContractDetailSkeleton } from '@/components/loading'
import { ErrorMessage, NetworkError, NotFoundError } from '@/components/error'
import { OfflineBanner } from '@/components/offline'
// import { ContextualSearch } from '@/components/search' // Temporarily disabled
import { useOnlineStatus } from '@/hooks/use-online-status'
import type { BreadcrumbItem } from '@/types'

export function ContractDetailPage() {
  const { contractId } = useParams<{ contractId: string }>()
  const { 
    selectedContract, 
    contractLoading, 
    contractError, 
    selectContract,
    clearContractError 
  } = useContractStore()
  const { domains, fetchDomains } = useDomainStore()
  const { products, fetchProducts } = useProductStore()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (domains.length === 0) {
      fetchDomains()
    }
    if (products.length === 0) {
      fetchProducts()
    }
  }, [domains.length, fetchDomains, products.length, fetchProducts])

  useEffect(() => {
    if (contractId) {
      selectContract(contractId)
    }
  }, [contractId, selectContract])

  if (!contractId) {
    return <Navigate to="/" replace />
  }

  const handleRetry = () => {
    clearContractError()
    if (contractId) {
      selectContract(contractId)
    }
  }

  if (contractLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-96" />
        <ContractDetailSkeleton />
      </div>
    )
  }

  if (contractError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OfflineBanner />
        <div className="min-h-[400px]">
          {!isOnline ? (
            <NetworkError onRetry={handleRetry} />
          ) : contractError.includes('not found') ? (
            <NotFoundError 
              message="O contrato solicitado não foi encontrado."
              onRetry={() => window.history.back()}
            />
          ) : (
            <ErrorMessage
              title="Erro ao carregar contrato"
              message={contractError}
              onRetry={handleRetry}
            />
          )}
        </div>
      </div>
    )
  }

  if (!selectedContract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OfflineBanner />
        <div className="min-h-[400px]">
          <NotFoundError 
            message="Contrato não encontrado."
            onRetry={() => window.history.back()}
          />
        </div>
      </div>
    )
  }

  const domain = domains.find(d => d.id === selectedContract.fundamentals.domain)
  const collection = domain?.collections.find(c => c.id === selectedContract.fundamentals.collection)

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Domains', path: '/' },
    ...(domain ? [{ label: domain.name, path: `/domain/${domain.id}` }] : []),
    ...(collection ? [{ label: collection.name, path: `/domain/${domain?.id}/collection/${collection.id}` }] : []),
    { label: selectedContract.fundamentals.name, active: true }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <OfflineBanner />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{selectedContract.fundamentals.name}</h1>
        <p className="text-muted-foreground mt-2">
          Version {selectedContract.fundamentals.version} • {selectedContract.fundamentals.owner}
        </p>
      </div>

      {/* Schema Visualizer - Top row, full width */}
      <div className="mb-8">
        <SchemaVisualizer schema={selectedContract.schema} />
      </div>

      {/* Two-column layout - 70/30 ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left column - Contract Information (70%) */}
        <div className="lg:col-span-7">
          <ContractInfoPanel contract={selectedContract} />
          
          {/* Quality Rules */}
          <div className="mt-8">
            <QualityRulesModule qualityRules={selectedContract.qualityRules} />
          </div>
        </div>

        {/* Right column - Data Products Module (30%) */}
        <div className="lg:col-span-3">
          <DataProductsModule contractId={selectedContract.id} />
        </div>
      </div>
    </div>
  )
}