import React from 'react';
import { MetricsCard } from '../metrics-card';
import { Users, FileText, Package, TrendingUp } from 'lucide-react';
import type { MetricTrend } from '../../types/dashboard.types';

/**
 * Demo component to showcase MetricsCard functionality
 * This demonstrates all the different states and props of the MetricsCard
 */
export const MetricsCardDemo: React.FC = () => {
  const upTrend: MetricTrend = {
    value: 15,
    direction: 'up',
    period: 'last month',
    percentage: 15.5,
  };

  const downTrend: MetricTrend = {
    value: -10,
    direction: 'down',
    period: 'last week',
    percentage: -10.2,
  };

  const stableTrend: MetricTrend = {
    value: 0,
    direction: 'stable',
    period: 'last month',
    percentage: 0,
  };

  return (
    <div className="p-8 space-y-8 bg-background">
      <h1 className="text-2xl font-bold">MetricsCard Demo</h1>
      
      {/* Basic Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Basic Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Users"
            value={1234}
            icon={Users}
            subtitle="Active users"
          />
          
          <MetricsCard
            title="Data Contracts"
            value={56}
            icon={FileText}
            subtitle="Published contracts"
          />
          
          <MetricsCard
            title="Data Products"
            value={789}
            icon={Package}
            subtitle="Deployed products"
          />
          
          <MetricsCard
            title="Growth Rate"
            value="12.5%"
            icon={TrendingUp}
            subtitle="Monthly growth"
          />
        </div>
      </section>

      {/* Cards with Trends */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Cards with Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricsCard
            title="Positive Trend"
            value={1500}
            icon={Users}
            trend={upTrend}
            subtitle="Growing user base"
          />
          
          <MetricsCard
            title="Negative Trend"
            value={850}
            icon={FileText}
            trend={downTrend}
            subtitle="Contracts this week"
          />
          
          <MetricsCard
            title="Stable Trend"
            value={2000}
            icon={Package}
            trend={stableTrend}
            subtitle="Consistent performance"
          />
        </div>
      </section>

      {/* Large Numbers */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Large Number Formatting</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricsCard
            title="Thousands"
            value={1500}
            icon={Users}
            subtitle="1.5K format"
          />
          
          <MetricsCard
            title="Millions"
            value={2500000}
            icon={FileText}
            subtitle="2.5M format"
          />
          
          <MetricsCard
            title="Billions"
            value={1200000000}
            icon={Package}
            subtitle="1.2B format"
          />
          
          <MetricsCard
            title="Small Numbers"
            value={999}
            icon={TrendingUp}
            subtitle="No formatting"
          />
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricsCard
            title="Loading Card 1"
            value={0}
            icon={Users}
            loading={true}
          />
          
          <MetricsCard
            title="Loading Card 2"
            value={0}
            icon={FileText}
            loading={true}
          />
          
          <MetricsCard
            title="Loading Card 3"
            value={0}
            icon={Package}
            loading={true}
          />
        </div>
      </section>

      {/* Error States */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Error States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricsCard
            title="Network Error"
            value={0}
            icon={Users}
            error="Failed to load data"
          />
          
          <MetricsCard
            title="Timeout Error"
            value={0}
            icon={FileText}
            error="Request timeout"
          />
          
          <MetricsCard
            title="Server Error"
            value={0}
            icon={Package}
            error="Internal server error"
          />
        </div>
      </section>
    </div>
  );
};

export default MetricsCardDemo;