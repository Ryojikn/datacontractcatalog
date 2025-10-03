import React from 'react';
import { RefreshCw, Clock, Activity } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import type { DashboardHeaderProps } from '../types/dashboard.types';

/**
 * Dashboard Header Component
 * 
 * Provides the header section for the dashboard with:
 * - Page title and description
 * - Last updated timestamp (Requirement 6.3)
 * - Manual refresh button (Requirement 6.4)
 * - Auto-refresh indicator (Requirement 6.4)
 * 
 * Requirements: 4.3, 6.3, 6.4
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  onRefresh,
  refreshing,
  autoRefreshEnabled = true
}) => {
  /**
   * Format the last updated timestamp for display
   */
  const formatLastUpdated = (timestamp?: string): string => {
    if (!timestamp) return 'Never';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
      } else {
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.warn('Invalid timestamp format:', timestamp);
      return 'Unknown';
    }
  };

  /**
   * Get the appropriate tooltip text for the refresh button
   */
  const getRefreshTooltip = (): string => {
    if (refreshing) {
      return 'Refreshing data...';
    }
    return 'Refresh dashboard data manually';
  };

  /**
   * Get the appropriate tooltip text for the auto-refresh indicator
   */
  const getAutoRefreshTooltip = (): string => {
    if (autoRefreshEnabled) {
      return 'Auto-refresh is active (every 5 minutes)';
    }
    return 'Auto-refresh is disabled';
  };

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and Description */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Platform Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Overview of platform metrics and statistics
            </p>
          </div>

          {/* Actions and Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Last Updated Timestamp */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">
                Last updated: {formatLastUpdated(lastUpdated)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-refresh Indicator */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant={autoRefreshEnabled ? "default" : "secondary"}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Activity className="h-3 w-3" />
                      <span className="hidden sm:inline">Auto-refresh</span>
                      <span className="sm:hidden">Auto</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getAutoRefreshTooltip()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Manual Refresh Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRefresh}
                      disabled={refreshing}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw 
                        className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
                      />
                      <span className="hidden sm:inline">
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getRefreshTooltip()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;