import React from 'react';
import { Users, UserCheck, Shield } from 'lucide-react';
import { MetricsCard } from './metrics-card';
import { UsersMetricsSkeleton } from '@/components/loading/skeleton-loaders';
import type { UsersMetricsProps } from '../types/dashboard.types';

/**
 * UsersMetrics - Componente para exibir métricas de Usuários e Grupos
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * - Exibir total de usuários e usuários ativos
 * - Mostrar número de grupos de acesso
 * - Implementar fallbacks para dados não disponíveis
 */
export const UsersMetrics: React.FC<UsersMetricsProps> = ({
  data,
  loading,
  error,
}) => {
  // Show skeleton loading state
  if (loading || !data) {
    return <UsersMetricsSkeleton />;
  }

  // Função para calcular percentual de usuários ativos
  const calculateActivePercentage = (active: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((active / total) * 100).toFixed(1)}%`;
  };

  // Função para calcular usuários inativos
  const getInactiveUsers = (total: number, active: number): number => {
    return Math.max(0, total - active);
  };

  // Função para obter subtitle do card principal
  const getMainSubtitle = (): string => {
    const activePercentage = calculateActivePercentage(data.activeUsers, data.totalUsers);
    const inactiveUsers = getInactiveUsers(data.totalUsers, data.activeUsers);
    
    return `${data.activeUsers} active (${activePercentage}), ${inactiveUsers} inactive`;
  };

  // Função para obter subtitle dos grupos
  const getGroupsSubtitle = (): string => {
    if (data.totalGroups === 0) {
      return 'Sistema em configuração';
    }
    
    const avgUsersPerGroup = data.totalUsers > 0 && data.totalGroups > 0 
      ? Math.round(data.totalUsers / data.totalGroups)
      : 0;
    
    return `~${avgUsersPerGroup} usuários por grupo`;
  };

  return (
    <div className="space-y-4">
      {/* Card principal com total de usuários */}
      <MetricsCard
        title="Total Users"
        value={data?.totalUsers || 0}
        icon={Users}
        trend={data?.trend}
        subtitle={data ? getMainSubtitle() : 'Loading...'}
        loading={loading}
        error={error}
        className="col-span-full"
      />

      {/* Cards de detalhamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data ? (
          <>
            {/* Card de usuários ativos */}
            <MetricsCard
              title="Active Users"
              value={data.activeUsers}
              icon={UserCheck}
              subtitle={`${calculateActivePercentage(data.activeUsers, data.totalUsers)} of total users`}
              loading={loading}
              error={error}
              className="border-l-4 border-l-green-500"
            />

            {/* Card de grupos de acesso */}
            <MetricsCard
              title="Access Groups"
              value={data.totalGroups}
              icon={Shield}
              subtitle={getGroupsSubtitle()}
              loading={loading}
              error={error}
              className="border-l-4 border-l-blue-500"
            />
          </>
        ) : (
          // Render skeleton cards when no data
          <>
            <MetricsCard
              title="Active Users"
              value={0}
              icon={UserCheck}
              loading={true}
              className="border-l-4 border-l-gray-300"
            />
            <MetricsCard
              title="Access Groups"
              value={0}
              icon={Shield}
              loading={true}
              className="border-l-4 border-l-gray-300"
            />
          </>
        )}
      </div>
    </div>
  );
};

UsersMetrics.displayName = 'UsersMetrics';

export default UsersMetrics;