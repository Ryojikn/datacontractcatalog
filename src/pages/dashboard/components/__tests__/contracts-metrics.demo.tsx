import React from 'react';
import { ContractsMetrics } from '../contracts-metrics';
import type { ContractMetrics } from '../../types/dashboard.types';

/**
 * Demo component to showcase ContractsMetrics functionality
 * This file demonstrates the component with different data scenarios
 */

// Sample data scenarios
const sampleData: ContractMetrics = {
  total: 247,
  byStatus: {
    draft: 89,
    published: 142,
    archived: 16,
  },
  trend: {
    value: 15,
    direction: 'up',
    period: 'last month',
    percentage: 12.3,
  },
};

const emptyData: ContractMetrics = {
  total: 0,
  byStatus: {
    draft: 0,
    published: 0,
    archived: 0,
  },
};

const dataWithoutTrend: ContractMetrics = {
  total: 45,
  byStatus: {
    draft: 12,
    published: 28,
    archived: 5,
  },
};

const negativeGrowthData: ContractMetrics = {
  total: 198,
  byStatus: {
    draft: 67,
    published: 115,
    archived: 16,
  },
  trend: {
    value: -8,
    direction: 'down',
    period: 'last quarter',
    percentage: -4.2,
  },
};

export const ContractsMetricsDemo: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">ContractsMetrics Component Demo</h1>
      
      {/* Normal state with trend */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Normal State with Positive Trend</h2>
        <ContractsMetrics 
          data={sampleData} 
          loading={false} 
        />
      </section>

      {/* Loading state */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Loading State</h2>
        <ContractsMetrics 
          data={sampleData} 
          loading={true} 
        />
      </section>

      {/* Error state */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Error State</h2>
        <ContractsMetrics 
          data={sampleData} 
          loading={false}
          error="Failed to fetch contract metrics"
        />
      </section>

      {/* Empty data */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Empty Data</h2>
        <ContractsMetrics 
          data={emptyData} 
          loading={false} 
        />
      </section>

      {/* Data without trend */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Data Without Trend</h2>
        <ContractsMetrics 
          data={dataWithoutTrend} 
          loading={false} 
        />
      </section>

      {/* Negative growth trend */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Negative Growth Trend</h2>
        <ContractsMetrics 
          data={negativeGrowthData} 
          loading={false} 
        />
      </section>
    </div>
  );
};

export default ContractsMetricsDemo;