import React from 'react';
import { MetricsCard } from '../metrics-card';
import { MetricTrend } from '../../types/dashboard.types';
import { TrendingUp, Package, Users } from 'lucide-react';

/**
 * Demo component to showcase enhanced trend indicators
 * This demonstrates the improvements made in task 13:
 * - Realistic trend calculation based on historical patterns
 * - Enhanced visualization with arrows and percentages
 * - Color configuration for positive/negative trends
 * - Tooltips with explanatory information
 */
export const TrendIndicatorsDemo: React.FC = () => {
  // Sample trend data showcasing different scenarios
  const upTrend: MetricTrend = {
    value: 25,
    direction: 'up',
    period: 'mês anterior',
    percentage: 12.5,
  };

  const downTrend: MetricTrend = {
    value: -8,
    direction: 'down',
    period: 'últimas 4 semanas',
    percentage: -5.2,
  };

  const stableTrend: MetricTrend = {
    value: 2,
    direction: 'stable',
    period: 'período anterior',
    percentage: 1.1,
  };

  const highGrowthTrend: MetricTrend = {
    value: 45,
    direction: 'up',
    period: 'trimestre anterior',
    percentage: 28.7,
  };

  const significantDeclineTrend: MetricTrend = {
    value: -15,
    direction: 'down',
    period: 'mês anterior',
    percentage: -18.3,
  };

  return (
    <div className="p-8 space-y-8 bg-background">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Enhanced Trend Indicators Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating the enhanced trend indicators with realistic data, improved colors, and tooltips.
          Hover over the trend badges to see detailed explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Positive Growth Trend */}
        <MetricsCard
          title="Data Contracts"
          value={225}
          icon={TrendingUp}
          trend={upTrend}
          subtitle="125 published, 75 draft, 25 archived"
          className="border-l-4 border-l-emerald-500"
        />

        {/* Negative Trend */}
        <MetricsCard
          title="Data Products"
          value={145}
          icon={Package}
          trend={downTrend}
          subtitle="85 production, 35 pre-prod, 25 development"
          className="border-l-4 border-l-red-500"
        />

        {/* Stable Trend */}
        <MetricsCard
          title="Active Users"
          value={1850}
          icon={Users}
          trend={stableTrend}
          subtitle="1.7K active (92%), 150 inactive"
          className="border-l-4 border-l-slate-500"
        />

        {/* High Growth */}
        <MetricsCard
          title="Platform Adoption"
          value={202}
          icon={TrendingUp}
          trend={highGrowthTrend}
          subtitle="Rapid expansion across teams"
          className="border-l-4 border-l-emerald-600"
        />

        {/* Significant Decline */}
        <MetricsCard
          title="Legacy Systems"
          value={67}
          icon={Package}
          trend={significantDeclineTrend}
          subtitle="Migration to new platform"
          className="border-l-4 border-l-red-600"
        />

        {/* No Trend */}
        <MetricsCard
          title="System Health"
          value="99.9%"
          icon={TrendingUp}
          subtitle="All systems operational"
          className="border-l-4 border-l-green-500"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Trend Indicator Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-emerald-600">✅ Implemented Features</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Realistic trend calculation based on metric type</li>
              <li>• Enhanced color scheme (emerald/red/slate)</li>
              <li>• Rounded pill-style trend badges</li>
              <li>• Interactive tooltips with detailed explanations</li>
              <li>• Absolute and percentage change display</li>
              <li>• Contextual period descriptions</li>
              <li>• Emoji indicators in tooltips</li>
              <li>• Improved accessibility with cursor hints</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-600">🎨 Visual Improvements</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Background colors for trend badges</li>
              <li>• Better spacing and typography</li>
              <li>• Consistent icon sizing</li>
              <li>• Hover states and transitions</li>
              <li>• Dark mode compatibility</li>
              <li>• Responsive design</li>
              <li>• Clear visual hierarchy</li>
              <li>• Professional color palette</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Usage Instructions</h3>
        <p className="text-sm text-muted-foreground">
          Hover over any trend indicator (the colored badges with percentages) to see detailed 
          information about the change, including the absolute value change, trend direction 
          explanation, and contextual insights about what the trend might indicate.
        </p>
      </div>
    </div>
  );
};

export default TrendIndicatorsDemo;