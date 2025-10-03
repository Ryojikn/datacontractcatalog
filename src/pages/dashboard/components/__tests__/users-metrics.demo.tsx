import React from 'react';
import { UsersMetrics } from '../users-metrics';
import type { UserMetrics } from '../../types/dashboard.types';

/**
 * Demo component to showcase UsersMetrics functionality
 * This file demonstrates the component with various data scenarios
 */

// Sample data scenarios for demonstration
const sampleData: UserMetrics = {
  totalUsers: 342,
  activeUsers: 287,
  totalGroups: 18,
  trend: {
    value: 23,
    direction: 'up',
    period: 'mês anterior',
    percentage: 7.2
  }
};

const emptyData: UserMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  totalGroups: 0
};

const newSystemData: UserMetrics = {
  totalUsers: 45,
  activeUsers: 38,
  totalGroups: 0 // No groups configured yet
};

const highVolumeData: UserMetrics = {
  totalUsers: 1847,
  activeUsers: 1203,
  totalGroups: 67,
  trend: {
    value: -12,
    direction: 'down',
    period: 'vs semana anterior',
    percentage: -2.8
  }
};

const perfectActiveData: UserMetrics = {
  totalUsers: 150,
  activeUsers: 150, // 100% active
  totalGroups: 12
};

const edgeCaseData: UserMetrics = {
  totalUsers: 100,
  activeUsers: 120, // More active than total (edge case)
  totalGroups: 5
};

export const UsersMetricsDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">UsersMetrics Component Demo</h1>
        
        {/* Normal Data Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Normal Data Scenario</h2>
          <p className="text-muted-foreground">
            Typical production environment with good user engagement (83.9% active)
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <UsersMetrics
              data={sampleData}
              loading={false}
            />
          </div>
        </section>

        {/* Empty Data Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Empty Data Scenario</h2>
          <p className="text-muted-foreground">
            New platform or system with no users yet
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <UsersMetrics
              data={emptyData}
              loading={false}
            />
          </div>
        </section>

        {/* New System Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New System Scenario</h2>
          <p className="text-muted-foreground">
            Early stage platform with users but no access groups configured yet
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <UsersMetrics
              data={newSystemData}
              loading={false}
            />
          </div>
        </section>

        {/* High Volume Data Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">High Volume Data Scenario</h2>
          <p className="text-muted-foreground">
            Large enterprise platform with many users and groups, showing negative trend
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <UsersMetrics
              data={highVolumeData}
              loading={false}
            />
          </div>
        </section>

        {/* Perfect Active Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Perfect Active Scenario</h2>
          <p className="text-muted-foreground">
            Ideal scenario with 100% user engagement
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <UsersMetrics
              data={perfectActiveData}
              loading={false}
            />
          </div>
        </section>

        {/* Edge Case Scenario */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Edge Case Scenario</h2>
          <p className="text-muted-foreground">
            Data inconsistency where active users exceed total users (handled gracefully)
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <UsersMetrics
              data={edgeCaseData}
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
            <UsersMetrics
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
            <UsersMetrics
              data={sampleData}
              loading={false}
              error="Failed to load user metrics from API"
            />
          </div>
        </section>

        {/* Color Theme Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Color Theme Reference</h2>
          <p className="text-muted-foreground">
            Visual reference for user metrics color themes and icons
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Total Users</h3>
              <p className="text-sm text-muted-foreground">Users icon, no border color</p>
            </div>
            <div className="border rounded-lg p-4 bg-card border-l-4 border-l-green-500">
              <h3 className="font-semibold text-green-600 dark:text-green-400">Active Users</h3>
              <p className="text-sm text-muted-foreground">UserCheck icon, green theme</p>
            </div>
            <div className="border rounded-lg p-4 bg-card border-l-4 border-l-blue-500">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">Access Groups</h3>
              <p className="text-sm text-muted-foreground">Shield icon, blue theme</p>
            </div>
          </div>
        </section>

        {/* Calculation Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Calculation Examples</h2>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Sample Data Calculations:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Active User Percentage:</h4>
                <p className="text-muted-foreground">287 active / 342 total = 83.9%</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Inactive Users:</h4>
                <p className="text-muted-foreground">342 total - 287 active = 55 inactive</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Average Users per Group:</h4>
                <p className="text-muted-foreground">342 users / 18 groups = ~19 users/group</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fallback Handling:</h4>
                <p className="text-muted-foreground">Zero groups → "Sistema em configuração"</p>
              </div>
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
                <span>✅ Criar UsersMetrics component</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Exibir total de usuários e usuários ativos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Mostrar número de grupos de acesso</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Implementar fallbacks para dados não disponíveis</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>✅ Requirements: 3.1, 3.2, 3.3, 3.4</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UsersMetricsDemo;