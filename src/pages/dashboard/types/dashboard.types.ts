// Dashboard-specific types and interfaces
// Requirements: 1.1, 2.1, 3.1

import type { Status } from '../../../types';

// Core metric trend interface
export interface MetricTrend {
  value: number;
  direction: 'up' | 'down' | 'stable';
  period: string;
  percentage: number;
}

// Contract metrics interfaces (Requirement 1.1)
export interface ContractMetrics {
  total: number;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
  trend?: MetricTrend;
}

// Product metrics interfaces (Requirement 2.1)
export interface ProductMetrics {
  total: number;
  byEnvironment: {
    dev: number;
    pre: number;
    pro: number;
    undefined: number;
  };
  trend?: MetricTrend;
}

// User metrics interfaces (Requirement 3.1)
export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  trend?: MetricTrend;
}

// Main dashboard data interface
export interface DashboardData {
  contracts: ContractMetrics;
  products: ProductMetrics;
  users: UserMetrics;
  lastUpdated: string;
}

// Dashboard state management
export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastRefresh: string | null;
}

// API response types
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}

// Component prop interfaces
export interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: MetricTrend;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface ContractsMetricsProps {
  data?: ContractMetrics;
  loading: boolean;
  error?: string;
}

export interface ProductsMetricsProps {
  data?: ProductMetrics;
  loading: boolean;
  error?: string;
}

export interface UsersMetricsProps {
  data?: UserMetrics;
  loading: boolean;
  error?: string;
}

export interface DashboardHeaderProps {
  lastUpdated?: string;
  onRefresh: () => void;
  refreshing: boolean;
  autoRefreshEnabled: boolean;
}

// Hook return types
export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastRefresh: string | null;
  refresh: () => Promise<void>;
  refreshing: boolean;
}

// Environment types for products
export type ProductEnvironment = 'dev' | 'pre' | 'pro' | 'undefined';

// Status distribution type for contracts
export type StatusDistribution = {
  [K in Status]: number;
}

// Environment distribution type for products
export type EnvironmentDistribution = {
  [K in ProductEnvironment]: number;
}

// Error types specific to dashboard
export interface DashboardError {
  type: 'network' | 'parsing' | 'partial' | 'complete';
  message: string;
  component?: string;
  retryable: boolean;
}

// Loading states for individual components
export interface ComponentLoadingState {
  contracts: boolean;
  products: boolean;
  users: boolean;
}

// Refresh configuration
export interface RefreshConfig {
  autoRefreshInterval: number; // in milliseconds
  retryAttempts: number;
  retryDelay: number; // in milliseconds
  cacheTimeout: number; // in milliseconds
}

// Cache entry for dashboard data
export interface DashboardCacheEntry {
  data: DashboardData;
  timestamp: number;
  expiresAt: number;
}

// Service method types
export interface DashboardService {
  getDashboardMetrics(): Promise<DashboardData>;
  getContractMetrics(): Promise<ContractMetrics>;
  getProductMetrics(): Promise<ProductMetrics>;
  getUserMetrics(): Promise<UserMetrics>;
}

// Mock data generation types
export interface MockDataConfig {
  includeHistoricalData: boolean;
  simulateErrors: boolean;
  errorRate: number; // 0-1
  responseDelay: number; // in milliseconds
}