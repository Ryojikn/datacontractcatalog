/**
 * Integration test for ContractsMetrics component
 * Verifies that the component can be imported and used correctly
 */

import React from 'react';
import { ContractsMetrics } from '../contracts-metrics';
import type { ContractMetrics } from '../../types/dashboard.types';

// Test that the component can be imported and instantiated
const testData: ContractMetrics = {
  total: 100,
  byStatus: {
    draft: 30,
    published: 60,
    archived: 10,
  },
  trend: {
    value: 5,
    direction: 'up',
    period: 'last week',
    percentage: 5.3,
  },
};

// Integration test component
export const ContractsMetricsIntegrationTest: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">ContractsMetrics Integration Test</h2>
      
      {/* Test normal usage */}
      <ContractsMetrics 
        data={testData}
        loading={false}
      />
      
      {/* Test with loading */}
      <div className="mt-8">
        <h3 className="text-md font-medium mb-2">Loading State</h3>
        <ContractsMetrics 
          data={testData}
          loading={true}
        />
      </div>
      
      {/* Test with error */}
      <div className="mt-8">
        <h3 className="text-md font-medium mb-2">Error State</h3>
        <ContractsMetrics 
          data={testData}
          loading={false}
          error="Test error message"
        />
      </div>
    </div>
  );
};

// Verify exports work correctly
export { ContractsMetrics } from '../contracts-metrics';
export type { ContractsMetricsProps } from '../../types/dashboard.types';

// Test that the component can be used in different contexts
export const usage = {
  // Basic usage
  basic: () => (
    <ContractsMetrics 
      data={testData}
      loading={false}
    />
  ),
  
  // With error handling
  withError: () => (
    <ContractsMetrics 
      data={testData}
      loading={false}
      error="Connection failed"
    />
  ),
  
  // Loading state
  loading: () => (
    <ContractsMetrics 
      data={testData}
      loading={true}
    />
  ),
};

export default ContractsMetricsIntegrationTest;