import React from 'react';
import { FileText, FileCheck, Archive, AlertCircle } from 'lucide-react';
import { MetricsCard } from './metrics-card';
import { ContractsMetricsSkeleton } from '@/components/loading/skeleton-loaders';
import type { ContractsMetricsProps } from '../types/dashboard.types';

/**
 * ContractsMetrics - Componente para exibir métricas de Data Contracts
 * 
 * Requirements: 1.1, 1.2, 1.3, 7.1, 7.2
 * - Exibir total de contracts e distribuição por status
 * - Implementar visualização com cores distintas para cada status
 * - Adicionar indicadores de trend quando disponível
 */
export const ContractsMetrics: React.FC<ContractsMetricsProps> = ({
  data,
  loading,
  error,
}) => {
  // Show skeleton loading state
  if (loading || !data) {
    return <ContractsMetricsSkeleton />;
  }

  // Função para calcular percentual de distribuição
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };



  // Função para obter ícone do status
  const getStatusIcon = (status: 'draft' | 'published' | 'archived') => {
    switch (status) {
      case 'draft':
        return FileText;
      case 'published':
        return FileCheck;
      case 'archived':
        return Archive;
      default:
        return AlertCircle;
    }
  };

  // Função para obter label do status
  const getStatusLabel = (status: 'draft' | 'published' | 'archived'): string => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Card principal com total de contracts */}
      <MetricsCard
        title="Total Data Contracts"
        value={data?.total || 0}
        icon={FileText}
        trend={data?.trend}
        subtitle={data ? `${data.byStatus.published} published, ${data.byStatus.draft} draft, ${data.byStatus.archived} archived` : 'Loading...'}
        loading={loading}
        error={error}
        className="col-span-full"
      />

      {/* Cards de distribuição por status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data ? (Object.entries(data.byStatus) as Array<[keyof typeof data.byStatus, number]>).map(([status, count]) => {
          const StatusIcon = getStatusIcon(status);
          const percentage = calculatePercentage(count, data.total);
          
          return (
            <MetricsCard
              key={status}
              title={`${getStatusLabel(status)} Contracts`}
              value={count}
              icon={StatusIcon}
              subtitle={`${percentage} of total`}
              loading={loading}
              error={error}
              className={`border-l-4 ${
                status === 'draft' 
                  ? 'border-l-yellow-500' 
                  : status === 'published' 
                  ? 'border-l-green-500' 
                  : 'border-l-gray-500'
              }`}
            />
          );
        }) : (
          // Render skeleton cards when no data
          Array.from({ length: 3 }).map((_, index) => (
            <MetricsCard
              key={index}
              title="Loading..."
              value={0}
              icon={FileText}
              loading={true}
              className="border-l-4 border-l-gray-300"
            />
          ))
        )}
      </div>
    </div>
  );
};

ContractsMetrics.displayName = 'ContractsMetrics';

export default ContractsMetrics;