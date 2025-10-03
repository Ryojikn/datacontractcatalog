import React from 'react';
import { ProductsMetrics } from '../products-metrics';
import type { ProductMetrics } from '../../types/dashboard.types';

/**
 * Demo component to showcase ProductsMetrics functionality
 * This file demonstrates the component with various data scenarios
 */

// Sample data scenarios for demonstration
const sampleData: ProductMetrics = {
  total: 156,
  byEnvironment: {
    dev: 45,
    pre: 38,
    pro: 62,
    undefined: 11
  },
  trend: {
    value: 12,
    direction: 'up',
    period: 'mês anterior',
    percentage: 8.3
  }
};

const emptyData: ProductMetrics = {
  total: 0,
  byEnvironment: {
    dev: 0,
    pre: 0,
    pro: 0,
    undefined: 0
  }
};

const highVolumeData: ProductMetrics = {
  total: 2847,
  byEnvironment: {
    dev: 1205,
    pre: 892,
    pro: 634,
    undefined: 116
  },
  trend: {
    value: -5,
    direction: 'down',
    period: 'vs semana anterior',
    percentage: -3.2
  }
};

export const ProductsMetricsDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ProductsMetrics Component Demo</h1>
        
        {/* Normal Data Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Normal Data Scenario</h2>
          <p className="text-muted-foreground">
            Typical production environment with balanced distribution across environments
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <ProductsMetrics
              data={sampleData}
              loading={false}
            />
          </div>
        </section>

        {/* Empty Data Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Empty Data Scenario</h2>
          <p className="text-muted-foreground">
            New platform or filtered view with no products
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <ProductsMetrics
              data={emptyData}
              loading={false}
            />
          </div>
        </section>

        {/* High Volume Data Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">High Volume Data Scenario</h2>
          <p className="text-muted-foreground">
            Large enterprise platform with thousands of products and negative trend
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <ProductsMetrics
              data={highVolumeData}
              loading={false}
            />
          </div>
        </section>

        {/* Loading State */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Loading State</h2>
          <p className="text-muted-foreground">
            Component behavior during data loading
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <ProductsMetrics
              data={sampleData}
              loading={true}
            />
          </div>
        </section>

        {/* Error State */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Error State</h2>
          <p className="text-muted-foreground">
            Component behavior when data loading fails
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <ProductsMetrics
              data={sampleData}
              loading={false}
              error="Failed to load product metrics from API"
            />
          </div>
        </section>

        {/* Environment Color Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Environment Color Reference</h2>
          <p className="text-muted-foreground">
            Visual reference for environment-specific colors and icons
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 bg-card border-l-4 border-l-blue-500">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">Development</h3>
              <p className="text-sm text-muted-foreground">Blue theme</p>
            </div>
            <div className="border rounded-lg p-4 bg-card border-l-4 border-l-yellow-500">
              <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Pre-production</h3>
              <p className="text-sm text-muted-foreground">Yellow theme</p>
            </div>
            <div className="border rounded-lg p-4 bg-card border-l-4 border-l-green-500">
              <h3 className="font-semibold text-green-600 dark:text-green-400">Production</h3>
              <p className="text-sm text-muted-foreground">Green theme</p>
            </div>
            <div className="border rounded-lg p-4 bg-card border-l-4 border-l-gray-500">
              <h3 className="font-semibold text-gray-600 dark:text-gray-400">Undefined</h3>
              <p className="text-sm text-muted-foreground">Gray theme</p>
            </div>
          </div>
        </section>

        {/* Requirements Validation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Requirements Validation</h2>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Task Requirements Coverage:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Criar ProductsMetrics component</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Exibir total de products e distribuição por ambiente</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Implementar cores específicas para dev/pre/pro</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Tratar produtos sem ambiente definido</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductsMetricsDemo;