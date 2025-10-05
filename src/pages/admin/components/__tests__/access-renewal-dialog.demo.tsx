import React, { useState } from 'react';
import { AccessRenewalDialog } from '../access-renewal-dialog';
import { Button } from '@/components/ui/button';
import type { CurrentAccess } from '@/types';

// Mock data for demonstration
const mockCurrentAccess: CurrentAccess[] = [
  {
    id: 'access-001',
    userId: 'user-001',
    userName: 'João Silva',
    userEmail: 'joao.silva@company.com',
    productId: 'product-001',
    productName: 'Credit Card Transactions ETL',
    grantedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-03-15T10:00:00Z', // Expiring soon
    grantedBy: 'admin-001',
    accessLevel: 'read',
    status: 'expiring_soon'
  },
  {
    id: 'access-002',
    userId: 'user-002',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@company.com',
    productId: 'product-002',
    productName: 'Customer Segmentation Data',
    grantedAt: '2024-01-20T14:30:00Z',
    expiresAt: '2025-01-20T14:30:00Z',
    grantedBy: 'admin-002',
    accessLevel: 'write',
    status: 'active'
  },
  {
    id: 'access-003',
    userId: 'user-003',
    userName: 'Carlos Oliveira',
    userEmail: 'carlos.oliveira@company.com',
    productId: 'product-003',
    productName: 'Financial Risk Metrics',
    grantedAt: '2024-01-10T08:15:00Z',
    expiresAt: '2024-03-10T08:15:00Z',
    grantedBy: 'admin-001',
    accessLevel: 'admin',
    status: 'scheduled_for_revocation',
    revocationScheduledAt: '2024-03-10T08:15:00Z',
    revocationNotificationSent: true
  }
];

const expiredAccess: CurrentAccess = {
  id: 'access-004',
  userId: 'user-004',
  userName: 'Ana Costa',
  userEmail: 'ana.costa@company.com',
  productId: 'product-004',
  productName: 'Transaction Monitoring',
  grantedAt: '2023-12-01T10:00:00Z',
  expiresAt: '2024-01-01T10:00:00Z', // Expired
  grantedBy: 'admin-001',
  accessLevel: 'read',
  status: 'active'
};

/**
 * Demo component for AccessRenewalDialog
 * 
 * This component demonstrates various scenarios:
 * - Single access renewal
 * - Bulk access renewal
 * - Renewal with scheduled revocations
 * - Renewal of expired access
 * - Loading states
 */
export const AccessRenewalDialogDemo: React.FC = () => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    accessItems: CurrentAccess[];
    loading: boolean;
  }>({
    isOpen: false,
    accessItems: [],
    loading: false
  });

  const openDialog = (accessItems: CurrentAccess[], loading = false) => {
    setDialogState({
      isOpen: true,
      accessItems,
      loading
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = async (accessIds: string[]) => {
    console.log('Renewing access for IDs:', accessIds);
    
    // Simulate API call
    setDialogState(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDialogState(prev => ({ ...prev, loading: false }));
    
    console.log('Access renewal completed for:', accessIds);
    closeDialog();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Access Renewal Dialog Demo</h1>
        <p className="text-muted-foreground mb-6">
          This demo showcases the AccessRenewalDialog component in various scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Single Access Renewal */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Single Access Renewal</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Renew a single access permission that's expiring soon.
          </p>
          <Button 
            onClick={() => openDialog([mockCurrentAccess[0]])}
            className="w-full"
          >
            Renew Single Access
          </Button>
        </div>

        {/* Bulk Access Renewal */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Bulk Access Renewal</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Renew multiple access permissions at once.
          </p>
          <Button 
            onClick={() => openDialog(mockCurrentAccess.slice(0, 2))}
            className="w-full"
          >
            Renew Multiple Access
          </Button>
        </div>

        {/* Renewal with Scheduled Revocation */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Renewal with Revocation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Renew access that's scheduled for revocation (cancels revocation).
          </p>
          <Button 
            onClick={() => openDialog([mockCurrentAccess[2]])}
            className="w-full"
            variant="outline"
          >
            Renew Scheduled Revocation
          </Button>
        </div>

        {/* Expired Access Renewal */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Expired Access Renewal</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Renew access that has already expired.
          </p>
          <Button 
            onClick={() => openDialog([expiredAccess])}
            className="w-full"
            variant="outline"
          >
            Renew Expired Access
          </Button>
        </div>

        {/* Mixed Scenarios */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Mixed Scenarios</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bulk renewal with mixed access states and levels.
          </p>
          <Button 
            onClick={() => openDialog([...mockCurrentAccess, expiredAccess])}
            className="w-full"
            variant="outline"
          >
            Renew Mixed Access
          </Button>
        </div>

        {/* Loading State */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Loading State</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Dialog with loading state (buttons disabled).
          </p>
          <Button 
            onClick={() => openDialog([mockCurrentAccess[0]], true)}
            className="w-full"
            variant="outline"
          >
            Show Loading State
          </Button>
        </div>
      </div>

      {/* Current Dialog State Info */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Current Dialog State</h3>
        <div className="text-sm space-y-1">
          <p><strong>Open:</strong> {dialogState.isOpen ? 'Yes' : 'No'}</p>
          <p><strong>Access Items:</strong> {dialogState.accessItems.length}</p>
          <p><strong>Loading:</strong> {dialogState.loading ? 'Yes' : 'No'}</p>
          {dialogState.accessItems.length > 0 && (
            <div>
              <strong>Items:</strong>
              <ul className="ml-4 mt-1">
                {dialogState.accessItems.map(access => (
                  <li key={access.id} className="text-xs">
                    {access.userName} - {access.productName} ({access.accessLevel})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Component */}
      <AccessRenewalDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        accessItems={dialogState.accessItems}
        loading={dialogState.loading}
      />
    </div>
  );
};

export default AccessRenewalDialogDemo;