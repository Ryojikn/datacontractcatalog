import React, { useState, useMemo } from 'react';
import type { CurrentAccess, CurrentAccessStatus, AccessLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Shield, AlertTriangle, CheckCircle, ChevronUp, ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessRenewalDialog } from './access-renewal-dialog';
import { RevocationNoticeDialog } from './revocation-notice-dialog';

interface CurrentAccessListProps {
  currentAccess: CurrentAccess[];
  loading?: boolean;
  error?: string | null;
  onRenewAccess?: (accessId: string) => void;
  onBulkRenewAccess?: (accessIds: string[]) => void;
  onScheduleRevocation?: (accessId: string) => void;
  onForceRevocation?: (accessId: string) => void;
  className?: string;
}

type SortField = 'userName' | 'expiresAt' | 'grantedAt' | 'productName';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface FilterConfig {
  status: CurrentAccessStatus | 'all';
  accessLevel: AccessLevel | 'all';
}

const CurrentAccessList: React.FC<CurrentAccessListProps> = ({
  currentAccess,
  loading = false,
  error = null,
  onRenewAccess,
  onBulkRenewAccess,
  onScheduleRevocation,
  onForceRevocation,
  className
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'expiresAt',
    order: 'asc'
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: 'all',
    accessLevel: 'all'
  });

  // Bulk selection state
  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [showRevocationDialog, setShowRevocationDialog] = useState(false);
  const [selectedAccessForRevocation, setSelectedAccessForRevocation] = useState<CurrentAccess | null>(null);

  // Reset selection when currentAccess changes
  React.useEffect(() => {
    setSelectedAccessIds([]);
  }, [currentAccess]);

  // Filter and sort current access based on configuration
  const filteredAndSortedAccess = useMemo(() => {
    if (!currentAccess || currentAccess.length === 0) return [];

    // First apply filters
    let filtered = currentAccess.filter(access => {
      // Status filter
      if (filterConfig.status !== 'all' && access.status !== filterConfig.status) {
        return false;
      }

      // Access level filter
      if (filterConfig.accessLevel !== 'all' && access.accessLevel !== filterConfig.accessLevel) {
        return false;
      }

      return true;
    });

    // Then apply sorting
    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.field) {
        case 'userName':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case 'expiresAt':
          aValue = new Date(a.expiresAt).getTime();
          bValue = new Date(b.expiresAt).getTime();
          break;
        case 'grantedAt':
          aValue = new Date(a.grantedAt).getTime();
          bValue = new Date(b.grantedAt).getTime();
          break;
        case 'productName':
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
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
  }, [currentAccess, sortConfig, filterConfig]);

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

  // Format expiration date with context
  const formatExpirationDate = (expiresAt: string): { text: string; isExpiringSoon: boolean; isExpired: boolean } => {
    try {
      const date = new Date(expiresAt);
      const now = new Date();
      const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 0) {
        return {
          text: `Expired ${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} ago`,
          isExpiringSoon: false,
          isExpired: true
        };
      } else if (diffInDays === 0) {
        return {
          text: 'Expires today',
          isExpiringSoon: true,
          isExpired: false
        };
      } else if (diffInDays <= 7) {
        return {
          text: `Expires in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`,
          isExpiringSoon: true,
          isExpired: false
        };
      } else if (diffInDays <= 30) {
        return {
          text: `Expires in ${diffInDays} days`,
          isExpiringSoon: true,
          isExpired: false
        };
      } else {
        return {
          text: date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          isExpiringSoon: false,
          isExpired: false
        };
      }
    } catch (error) {
      return {
        text: 'Invalid date',
        isExpiringSoon: false,
        isExpired: false
      };
    }
  };

  // Get status badge variant and icon
  const getStatusInfo = (status: CurrentAccessStatus, expiresAt: string) => {
    const expirationInfo = formatExpirationDate(expiresAt);

    switch (status) {
      case 'scheduled_for_revocation':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          label: 'Scheduled for Revocation'
        };
      case 'expiring_soon':
        return {
          variant: 'default' as const,
          icon: Calendar,
          label: 'Expiring Soon'
        };
      case 'active':
        if (expirationInfo.isExpired) {
          return {
            variant: 'destructive' as const,
            icon: AlertTriangle,
            label: 'Expired'
          };
        } else if (expirationInfo.isExpiringSoon) {
          return {
            variant: 'default' as const,
            icon: Calendar,
            label: 'Expiring Soon'
          };
        } else {
          return {
            variant: 'secondary' as const,
            icon: CheckCircle,
            label: 'Active'
          };
        }
      default:
        return {
          variant: 'secondary' as const,
          icon: CheckCircle,
          label: 'Active'
        };
    }
  };

  // Get access level badge variant
  const getAccessLevelVariant = (level: AccessLevel) => {
    switch (level) {
      case 'admin':
        return 'destructive';
      case 'write':
        return 'default';
      case 'read':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccessIds(filteredAndSortedAccess.map(access => access.id));
    } else {
      setSelectedAccessIds([]);
    }
  };

  const handleSelectAccess = (accessId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccessIds(prev => [...prev, accessId]);
    } else {
      setSelectedAccessIds(prev => prev.filter(id => id !== accessId));
    }
  };

  const handleBulkRenewal = () => {
    if (selectedAccessIds.length > 0) {
      setShowRenewalDialog(true);
    }
  };

  const handleRenewalConfirm = async (accessIds: string[]) => {
    if (onBulkRenewAccess) {
      await onBulkRenewAccess(accessIds);
      setSelectedAccessIds([]);
    }
  };

  const handleRevocationClick = (access: CurrentAccess) => {
    setSelectedAccessForRevocation(access);
    setShowRevocationDialog(true);
  };

  const handleRevocationDialogClose = () => {
    setShowRevocationDialog(false);
    setSelectedAccessForRevocation(null);
  };

  const selectedAccessItems = currentAccess.filter(access => selectedAccessIds.includes(access.id));
  const isAllSelected = filteredAndSortedAccess.length > 0 && selectedAccessIds.length === filteredAndSortedAccess.length;
  const isPartiallySelected = selectedAccessIds.length > 0 && selectedAccessIds.length < filteredAndSortedAccess.length;

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
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">Failed to load current access</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentAccess || currentAccess.length === 0) {
    return (
      <div className={className}>
        <div className="border rounded-lg p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Active Access Permissions
          </h3>
          <p className="text-sm text-muted-foreground">
            No users currently have active access to data products.
          </p>
        </div>
      </div>
    );
  }

  // Empty filtered state
  if (filteredAndSortedAccess.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {/* Header with filters and sorting */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Current Access Permissions</h2>
              <p className="text-sm text-muted-foreground">
                {currentAccess.length} total permission{currentAccess.length === 1 ? '' : 's'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filterConfig.status}
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, status: value as CurrentAccessStatus | 'all' }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                    <SelectItem value="scheduled_for_revocation">Scheduled for Revocation</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filterConfig.accessLevel}
                  onValueChange={(value) => setFilterConfig(prev => ({ ...prev, accessLevel: value as AccessLevel | 'all' }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('expiresAt')}
                    className="h-8 px-2 text-xs"
                  >
                    Expiration {getSortIcon('expiresAt')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('userName')}
                    className="h-8 px-2 text-xs"
                  >
                    User {getSortIcon('userName')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* No results message */}
          <div className="border rounded-lg p-8 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Access Permissions Match Filters
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header with filters and sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Current Access Permissions</h2>
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedAccess.length} of {currentAccess.length} permission{currentAccess.length === 1 ? '' : 's'}
                {selectedAccessIds.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selectedAccessIds.length} selected
                  </span>
                )}
              </p>
            </div>
            
            {/* Bulk actions */}
            {filteredAndSortedAccess.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600"
                  ref={(ref) => {
                    if (ref && 'indeterminate' in ref) {
                      (ref as any).indeterminate = isPartiallySelected;
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
                
                {selectedAccessIds.length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleBulkRenewal}
                    className="ml-2 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Renew {selectedAccessIds.length} Permission{selectedAccessIds.length === 1 ? '' : 's'}
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filterConfig.status}
                onValueChange={(value) => setFilterConfig(prev => ({ ...prev, status: value as CurrentAccessStatus | 'all' }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="scheduled_for_revocation">Scheduled for Revocation</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filterConfig.accessLevel}
                onValueChange={(value) => setFilterConfig(prev => ({ ...prev, accessLevel: value as AccessLevel | 'all' }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('expiresAt')}
                  className="h-8 px-2 text-xs"
                >
                  Expiration {getSortIcon('expiresAt')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('userName')}
                  className="h-8 px-2 text-xs"
                >
                  User {getSortIcon('userName')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Access List */}
        <div className="space-y-3">
          {filteredAndSortedAccess.map((access) => {
            const statusInfo = getStatusInfo(access.status, access.expiresAt);
            const StatusIcon = statusInfo.icon;
            const expirationInfo = formatExpirationDate(access.expiresAt);
            const isSelected = selectedAccessIds.includes(access.id);
            
            return (
              <div
                key={access.id}
                className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectAccess(access.id, checked as boolean)}
                    />
                  </div>

                  {/* Access Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{access.userName}</span>
                      <Badge 
                        variant={getAccessLevelVariant(access.accessLevel)}
                        className="text-xs"
                      >
                        {access.accessLevel}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Product:</span>
                      <span className="text-muted-foreground ml-1">{access.productName}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Granted: {new Date(access.grantedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="h-4 w-4" />
                        <span className={expirationInfo.isExpired ? 'text-destructive' : expirationInfo.isExpiringSoon ? 'text-orange-600' : ''}>
                          {expirationInfo.text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={statusInfo.variant}
                        className="text-xs"
                      >
                        {statusInfo.label}
                      </Badge>
                      {access.revocationScheduledAt && (
                        <span className="text-xs text-muted-foreground">
                          Revocation scheduled for {new Date(access.revocationScheduledAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {access.status !== 'scheduled_for_revocation' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => onRenewAccess?.(access.id)}
                          disabled={loading}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Renew
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          onClick={() => handleRevocationClick(access)}
                          disabled={loading}
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleRevocationClick(access)}
                      disabled={loading}
                    >
                      Force Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Access Renewal Dialog */}
        <AccessRenewalDialog
          isOpen={showRenewalDialog}
          onClose={() => setShowRenewalDialog(false)}
          onConfirm={handleRenewalConfirm}
          accessItems={selectedAccessItems}
          loading={loading}
        />

        {/* Revocation Notice Dialog */}
        <RevocationNoticeDialog
          isOpen={showRevocationDialog}
          onClose={handleRevocationDialogClose}
          onScheduleRevocation={onScheduleRevocation || (() => {})}
          onForceRevocation={onForceRevocation || (() => {})}
          access={selectedAccessForRevocation}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CurrentAccessList;
export { CurrentAccessList };