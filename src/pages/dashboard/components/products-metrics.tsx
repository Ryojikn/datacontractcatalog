import React from 'react';
import { Package, Server, Globe, HelpCircle } from 'lucide-react';
import { MetricsCard } from './metrics-card';
import { ProductsMetricsSkeleton } from '@/components/loading/skeleton-loaders';
import type { ProductsMetricsProps } from '../types/dashboard.types';

/**
 * ProductsMetrics - Componente para exibir métricas de Data Products
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2
 * - Exibir total de products e distribuição por ambiente
 * - Implementar cores específicas para dev/pre/pro
 * - Tratar produtos sem ambiente definido
 * - Adicionar indicadores de trend quando disponível
 */
export const ProductsMetrics: React.FC<ProductsMetricsProps> = ({
  data,
  loading,
  error,
}) => {
  // Show skeleton loading state
  if (loading || !data) {
    return <ProductsMetricsSkeleton />;
  }

  // Função para calcular percentual de distribuição
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };



  // Função para obter ícone do ambiente
  const getEnvironmentIcon = (env: 'dev' | 'pre' | 'pro' | 'undefined') => {
    switch (env) {
      case 'dev':
        return Server;
      case 'pre':
        return Globe;
      case 'pro':
        return Package;
      case 'undefined':
        return HelpCircle;
      default:
        return Package;
    }
  };

  // Função para obter label do ambiente
  const getEnvironmentLabel = (env: 'dev' | 'pre' | 'pro' | 'undefined'): string => {
    switch (env) {
      case 'dev':
        return 'Development';
      case 'pre':
        return 'Pre-production';
      case 'pro':
        return 'Production';
      case 'undefined':
        return 'Undefined';
      default:
        return 'Unknown';
    }
  };

  // Função para obter cor da borda do card
  const getEnvironmentBorderColor = (env: 'dev' | 'pre' | 'pro' | 'undefined'): string => {
    switch (env) {
      case 'dev':
        return 'border-l-blue-500';
      case 'pre':
        return 'border-l-yellow-500';
      case 'pro':
        return 'border-l-green-500';
      case 'undefined':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Card principal com total de products */}
      <MetricsCard
        title="Total Data Products"
        value={data?.total || 0}
        icon={Package}
        trend={data?.trend}
        subtitle={data ? `${data.byEnvironment.pro} production, ${data.byEnvironment.pre} pre-prod, ${data.byEnvironment.dev} development` : 'Loading...'}
        loading={loading}
        error={error}
        className="col-span-full"
      />

      {/* Cards de distribuição por ambiente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data ? (Object.entries(data.byEnvironment) as Array<[keyof typeof data.byEnvironment, number]>).map(([environment, count]) => {
          const EnvironmentIcon = getEnvironmentIcon(environment);
          const percentage = calculatePercentage(count, data.total);
          
          return (
            <MetricsCard
              key={environment}
              title={`${getEnvironmentLabel(environment)} Products`}
              value={count}
              icon={EnvironmentIcon}
              subtitle={`${percentage} of total`}
              loading={loading}
              error={error}
              className={`border-l-4 ${getEnvironmentBorderColor(environment)}`}
            />
          );
        }) : (
          // Render skeleton cards when no data
          Array.from({ length: 4 }).map((_, index) => (
            <MetricsCard
              key={index}
              title="Loading..."
              value={0}
              icon={Package}
              loading={true}
              className="border-l-4 border-l-gray-300"
            />
          ))
        )}
      </div>
    </div>
  );
};

ProductsMetrics.displayName = 'ProductsMetrics';

export default ProductsMetrics;