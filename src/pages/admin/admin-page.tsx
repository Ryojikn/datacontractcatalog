import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/admin';
import { usePermissions } from '@/hooks/use-permissions';
import { Breadcrumb } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Clock, Activity, Shield, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PendingApprovalsTab, CurrentAccessTab, AccessHistoryTab } from './components';
import type { BreadcrumbItem } from '@/types';

const AdminPage: React.FC = () => {
  const { lastRefresh, fetchPendingRequests, fetchCurrentAccess } = useAdminStore();
  const { currentUser } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);
  
  // Tab state management with persistence
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem('admin-active-tab') || 'pending';
    } catch (error) {
      console.warn('Failed to load active tab from localStorage:', error);
      return 'pending';
    }
  });

  // Persist tab state changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    try {
      localStorage.setItem('admin-active-tab', value);
    } catch (error) {
      console.warn('Failed to save active tab to localStorage:', error);
    }
  };

  // Breadcrumb items for admin page
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Administration', active: true }
  ];

  // Format the last updated timestamp for display
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

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPendingRequests(),
        fetchCurrentAccess()
      ]);
    } catch (error) {
      console.error('Failed to refresh admin data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setRefreshing(true);
      try {
        await Promise.all([
          fetchPendingRequests(),
          fetchCurrentAccess()
        ]);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    loadData();
  }, [fetchPendingRequests, fetchCurrentAccess]);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title and Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Access Management</h1>
                {currentUser && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {currentUser.name} ({currentUser.role})
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage pending access requests and current user permissions
              </p>
            </div>

            {/* Actions and Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Last Updated Timestamp */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">
                  Last updated: {formatLastUpdated(lastRefresh || undefined)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Auto-refresh Indicator */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Activity className="h-3 w-3" />
                        <span className="hidden sm:inline">Manual refresh</span>
                        <span className="sm:hidden">Manual</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Auto-refresh is not enabled for admin data</p>
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
                        onClick={handleRefresh}
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
                      <p>{refreshing ? 'Refreshing admin data...' : 'Refresh admin data manually'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />



        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pending Approvals</span>
              <span className="sm:hidden">Pending</span>
            </TabsTrigger>
            <TabsTrigger 
              value="current"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Current Access</span>
              <span className="sm:hidden">Current</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Access History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
            <PendingApprovalsTab />
          </TabsContent>
          
          <TabsContent value="current" className="mt-0 focus-visible:outline-none">
            <CurrentAccessTab />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0 focus-visible:outline-none">
            <AccessHistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
export { AdminPage };