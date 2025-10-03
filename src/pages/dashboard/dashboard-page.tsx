import React from 'react';
import { useDashboardData } from './hooks/use-dashboard-data';
import { ContractsMetrics, ProductsMetrics, UsersMetrics, DashboardHeader } from './components';

const DashboardPage: React.FC = () => {
  const { data, loading, error, refresh, refreshing, lastRefresh } = useDashboardData();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <DashboardHeader
        lastUpdated={lastRefresh || undefined}
        onRefresh={refresh}
        refreshing={refreshing}
        autoRefreshEnabled={true}
      />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-destructive">{error}</p>
              <button
                onClick={refresh}
                disabled={refreshing}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
              >
                {refreshing ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {/* Metrics Grid - Responsive Layout */}
        <div className="space-y-6 lg:space-y-8">
          {/* Data Contracts Section */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Data Contracts</h2>
            <ContractsMetrics
              data={data?.contracts}
              loading={loading}
              error={error || undefined}
            />
          </section>

          {/* Data Products Section */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Data Products</h2>
            <ProductsMetrics
              data={data?.products}
              loading={loading}
              error={error || undefined}
            />
          </section>

          {/* Users & Groups Section */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Users & Groups</h2>
            <UsersMetrics
              data={data?.users}
              loading={loading}
              error={error || undefined}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;