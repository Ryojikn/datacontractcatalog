import React, { useState, useMemo } from 'react';
import type { PendingAccessRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingApprovalsListProps {
  requests: PendingAccessRequest[];
  loading?: boolean;
  error?: string | null;
  onApprove?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  className?: string;
}

type SortField = 'requesterName' | 'createdAt' | 'priority' | 'daysWaiting';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

const PendingApprovalsList: React.FC<PendingApprovalsListProps> = ({
  requests,
  loading = false,
  error = null,
  onApprove,
  onDecline,
  className
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    order: 'desc'
  });

  // Sort requests based on current sort configuration
  const sortedRequests = useMemo(() => {
    if (!requests || requests.length === 0) return [];

    return [...requests].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.field) {
        case 'requesterName':
          aValue = a.requesterName.toLowerCase();
          bValue = b.requesterName.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority': {
          // Convert priority to numeric value for sorting
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 1;
          bValue = priorityOrder[b.priority] || 1;
          break;
        }
        case 'daysWaiting':
          aValue = a.daysWaiting;
          bValue = b.daysWaiting;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [requests, sortConfig]);

  // Handle sort column click
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      order: prevConfig.field === field && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortConfig.order === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
      : <ChevronDown className="h-4 w-4 text-muted-foreground" />;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Less than 1 hour ago';
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      }
    } catch {
      return 'Unknown time';
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">Failed to load pending requests</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!requests || requests.length === 0) {
    return (
      <div className={className}>
        <div className="border rounded-lg p-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Pending Requests
          </h3>
          <p className="text-sm text-muted-foreground">
            All access requests have been processed. New requests will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header with sorting controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pending Access Requests</h2>
            <p className="text-sm text-muted-foreground">
              {requests.length} request{requests.length === 1 ? '' : 's'} awaiting approval
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="h-8 px-2 text-xs"
              >
                Date {getSortIcon('createdAt')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('priority')}
                className="h-8 px-2 text-xs"
              >
                Priority {getSortIcon('priority')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('requesterName')}
                className="h-8 px-2 text-xs"
              >
                Name {getSortIcon('requesterName')}
              </Button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {sortedRequests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Request Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{request.requesterName}</span>
                    <Badge 
                      variant={getPriorityVariant(request.priority || 'low')}
                      className="text-xs"
                    >
                      {request.priority || 'low'} priority
                    </Badge>
                    {request.escalated && (
                      <Badge variant="destructive" className="text-xs">
                        Escalated
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>BDAC: {request.bdac || 'Not specified'}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Product:</span>
                    <span className="text-muted-foreground ml-1">{request.productName}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Business Justification:</span>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {request.businessJustification || 'No justification provided'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Requested {formatTimestamp(request.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Waiting {request.daysWaiting} day{request.daysWaiting === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  
                  {request.adminNotes && (
                    <div className="text-xs bg-muted/50 rounded p-2">
                      <span className="font-medium">Admin Notes:</span>
                      <span className="text-muted-foreground ml-1">{request.adminNotes}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onApprove?.(request.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => onDecline?.(request.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalsList;
export { PendingApprovalsList };