import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  DashboardData, 
  UseDashboardDataReturn, 
  DashboardCacheEntry 
} from '../types/dashboard.types';
import { mockDataService } from '../../../services/mockDataService';

// Cache configuration - 5 minutes TTL as per requirements
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// In-memory cache for dashboard data
let dashboardCache: DashboardCacheEntry | null = null;

/**
 * Custom hook for managing dashboard data with auto-refresh and caching
 * 
 * Features:
 * - Automatic data loading on mount
 * - Auto-refresh every 5 minutes (Requirement 6.2)
 * - Manual refresh functionality (Requirement 6.4)
 * - In-memory caching with 5-minute TTL (Requirement 6.1)
 * - Error handling with retry logic (Requirement 5.3)
 * - Loading and refreshing states
 * - Visibility change detection for smart refreshing
 * 
 * Usage:
 * ```tsx
 * const { data, loading, error, refresh, refreshing } = useDashboardData();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refresh} />;
 * 
 * return (
 *   <div>
 *     <button onClick={refresh} disabled={refreshing}>
 *       {refreshing ? 'Refreshing...' : 'Refresh'}
 *     </button>
 *     <MetricsDisplay data={data} />
 *   </div>
 * );
 * ```
 * 
 * Requirements: 6.1, 6.2, 6.4, 5.3
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Refs for cleanup and interval management
  const autoRefreshIntervalRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(true);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((): boolean => {
    if (!dashboardCache) return false;
    return Date.now() < dashboardCache.expiresAt;
  }, []);

  /**
   * Get data from cache if valid
   */
  const getCachedData = useCallback((): DashboardData | null => {
    if (isCacheValid() && dashboardCache) {
      return dashboardCache.data;
    }
    return null;
  }, [isCacheValid]);

  /**
   * Update cache with new data
   */
  const updateCache = useCallback((newData: DashboardData): void => {
    const now = Date.now();
    dashboardCache = {
      data: newData,
      timestamp: now,
      expiresAt: now + CACHE_TTL
    };
  }, []);

  /**
   * Fetch dashboard data with retry logic
   */
  const fetchDashboardData = useCallback(async (
    isRetry: boolean = false,
    retryAttempt: number = 0
  ): Promise<DashboardData | null> => {
    try {
      // Check cache first if not a manual refresh
      if (!isRetry && retryAttempt === 0) {
        const cachedData = getCachedData();
        if (cachedData) {
          return cachedData;
        }
      }

      const dashboardData = await mockDataService.getDashboardMetrics();
      
      // Update cache with fresh data
      updateCache(dashboardData);
      
      return dashboardData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      
      // Retry logic for network errors
      if (retryAttempt < MAX_RETRY_ATTEMPTS && errorMessage.includes('Network')) {
        console.warn(`Dashboard data fetch failed (attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS}):`, errorMessage);
        
        return new Promise((resolve) => {
          retryTimeoutRef.current = setTimeout(async () => {
            if (mountedRef.current) {
              const result = await fetchDashboardData(true, retryAttempt + 1);
              resolve(result);
            }
          }, RETRY_DELAY * (retryAttempt + 1)); // Exponential backoff
        });
      }
      
      // If all retries failed or non-retryable error, try to use cached data as fallback
      if (dashboardCache && dashboardCache.data) {
        console.warn('Using cached data due to fetch failure:', errorMessage);
        return dashboardCache.data;
      }
      
      throw new Error(errorMessage);
    }
  }, [getCachedData, updateCache]);

  /**
   * Load dashboard data
   */
  const loadData = useCallback(async (isManualRefresh: boolean = false): Promise<void> => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);

      const dashboardData = await fetchDashboardData();
      
      if (mountedRef.current && dashboardData) {
        setData(dashboardData);
        setLastRefresh(new Date().toISOString());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (mountedRef.current) {
        setError(errorMessage);
        console.error('Dashboard data loading failed:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchDashboardData]);

  /**
   * Manual refresh function
   * Requirement: 6.4 - Manual refresh functionality
   */
  const refresh = useCallback(async (): Promise<void> => {
    await loadData(true);
  }, [loadData]);

  /**
   * Setup auto-refresh interval
   * Requirement: 6.2 - Auto-refresh every 5 minutes
   */
  const setupAutoRefresh = useCallback((): void => {
    // Clear existing interval
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }

    // Setup new interval
    autoRefreshIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        loadData(false);
      }
    }, AUTO_REFRESH_INTERVAL);
  }, [loadData]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback((): void => {
    mountedRef.current = false;
    
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Initial data load and auto-refresh setup
  useEffect(() => {
    mountedRef.current = true;
    
    // Load initial data
    loadData(false);
    
    // Setup auto-refresh
    setupAutoRefresh();
    
    // Cleanup on unmount
    return cleanup;
  }, [loadData, setupAutoRefresh, cleanup]);

  // Handle visibility change to refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && mountedRef.current) {
        // Check if cache is expired and refresh if needed
        if (!isCacheValid()) {
          loadData(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData, isCacheValid]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    refreshing
  };
};

export default useDashboardData;