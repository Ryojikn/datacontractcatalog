import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useContractStore } from '@/stores/contract'
import { useDomainStore } from '@/stores/domain'
import { SchemaVisualizer } from '@/components/contract'
import { ContractInfoPanel } from '@/components/contract'
import { DataProductsModule } from '@/components/contract'
import { QualityRulesModule } from '@/components/contract'
import { Breadcrumb } from '@/components/layout'
import type { BreadcrumbItem } from '@/types'

export function ContractDetailPage() {
  const { contractId } = useParams<{ contractId: string }>()
  const { selectedContract, loading, error, selectContract } = useContractStore()
  const { domains, fetchDomains } = useDomainStore()

  useEffect(() => {
    if (domains.length === 0) {
      fetchDomains()
    }
  }, [domains.length, fetchDomains])

  useEffect(() => {
    if (contractId) {
      selectContract(contractId)
    }
  }, [contractId, selectContract])

  if (!contractId) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Error loading contract: {error}</p>
        </div>
      </div>
    )
  }

  if (!selectedContract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Contract not found</p>
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

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Contract Information */}
        <div>
          <ContractInfoPanel contract={selectedContract} />
        </div>

        {/* Right column - Modules */}
        <div className="space-y-6">
          <DataProductsModule contractId={selectedContract.id} />
          <QualityRulesModule qualityRules={selectedContract.qualityRules} />
        </div>
      </div>
    </div>
  )
}