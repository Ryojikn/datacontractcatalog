import React from 'react';
import { CurrentAccessList } from '../current-access-list';
import type { CurrentAccess } from '@/types';

// Demo data showing different access states
const demoCurrentAccess: CurrentAccess[] = [
  {
    id: 'access-001',
    userId: 'user-001',
    userName: 'Ana Costa',
    userEmail: 'ana.costa@company.com',
    productId: 'product-001',
    productName: 'Credit Card Transactions ETL',
    grantedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z', // Active - expires in future
    grantedBy: 'admin-001',
    accessLevel: 'read',
    status: 'active'
  },
  {
    id: 'access-002',
    userId: 'user-002',
    userName: 'Pedro Almeida',
    userEmail: 'pedro.almeida@company.com',
    productId: 'product-002',
    productName: 'Customer Segmentation Data',
    grantedAt: '2024-01-20T14:30:00Z',
    expiresAt: '2024-03-20T14:30:00Z', // Expiring soon
    grantedBy: 'admin-002',
    accessLevel: 'write',
    status: 'expiring_soon'
  },
  {
    id: 'access-003',
    userId: 'user-003',
    userName: 'Sofia Rodrigues',
    userEmail: 'sofia.rodrigues@company.com',
    productId: 'product-003',
    productName: 'Financial Risk Metrics',
    grantedAt: '2024-01-10T08:15:00Z',
    expiresAt: '2024-03-10T08:15:00Z',
    grantedBy: 'admin-001',
    accessLevel: 'admin',
    status: 'scheduled_for_revocation',
    revocationScheduledAt: '2024-03-10T08:15:00Z',
    revocationNotificationSent: true
  },
  {
    id: 'access-004',
    userId: 'user-004',
    userName: 'Carlos Oliveira',
    userEmail: 'carlos.oliveira@company.com',
    productId: 'product-004',
    productName: 'Marketing Analytics Dashboard',
    grantedAt: '2024-02-01T09:00:00Z',
    expiresAt: '2024-02-15T09:00:00Z', // Expired
    grantedBy: 'admin-003',
    accessLevel: 'read',
    status: 'active'
  },
  {
    id: 'access-005',
    userId: 'user-005',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@company.com',
    productId: 'product-005',
    productName: 'HR Data Warehouse',
    grantedAt: '2024-01-25T11:30:00Z',
    expiresAt: '2025-01-25T11:30:00Z',
    grantedBy: 'admin-002',
    accessLevel: 'write',
    status: 'active'
  }
];

/**
 * Demo component showing CurrentAccessList functionality
 * 
 * Features demonstrated:
 * - Display of current access permissions with user details
 * - Access level badges (read, write, admin)
 * - Status indicators (active, expiring soon, scheduled for revocation)
 * - Expiration date formatting with context
 * - Filtering by status and access level
 * - Sorting by user name and expiration date
 * - Action buttons (Renew, Revoke, Force Remove)
 * - Responsive design
 */
const CurrentAccessListDemo: React.FC = () => {
  const handleRenewAccess = (accessId: string) => {
    console.log('Demo: Renewing access for:', accessId);
    alert(`Demo: Would renew access for ${accessId}`);
  };

  const handleScheduleRevocation = (accessId: string) => {
    console.log('Demo: Scheduling revocation for:', accessId);
    alert(`Demo: Would schedule revocation for ${accessId}`);
  };

  const handleForceRevocation = (accessId: string) => {
    console.log('Demo: Force revoking access for:', accessId);
    alert(`Demo: Would force revoke access for ${accessId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">CurrentAccessList Component Demo</h1>
        <p className="text-muted-foreground">
          This demo shows the CurrentAccessList component with sample data demonstrating
          various access states, filtering, and sorting capabilities.
        </p>
      </div>

      <div className="space-y-8">
        {/* Normal state with data */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Normal State</h2>
          <CurrentAccessList
            currentAccess={demoCurrentAccess}
            onRenewAccess={handleRenewAccess}
            onScheduleRevocation={handleScheduleRevocation}
            onForceRevocation={handleForceRevocation}
          />
        </section>

        {/* Loading state */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Loading State</h2>
          <CurrentAccessList
            currentAccess={[]}
            loading={true}
            onRenewAccess={handleRenewAccess}
            onScheduleRevocation={handleScheduleRevocation}
            onForceRevocation={handleForceRevocation}
          />
        </section>

        {/* Error state */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Error State</h2>
          <CurrentAccessList
            currentAccess={[]}
            error="Failed to load current access permissions from the server"
            onRenewAccess={handleRenewAccess}
            onScheduleRevocation={handleScheduleRevocation}
            onForceRevocation={handleForceRevocation}
          />
        </section>

        {/* Empty state */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Empty State</h2>
          <CurrentAccessList
            currentAccess={[]}
            onRenewAccess={handleRenewAccess}
            onScheduleRevocation={handleScheduleRevocation}
            onForceRevocation={handleForceRevocation}
          />
        </section>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Component Features:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Displays user details, product names, and access levels</li>
          <li>• Shows expiration dates with contextual formatting</li>
          <li>• Status badges with appropriate colors and icons</li>
          <li>• Filtering by access status and access level</li>
          <li>• Sorting by user name and expiration date</li>
          <li>• Action buttons for renewal, revocation, and force removal</li>
          <li>• Responsive design for mobile and desktop</li>
          <li>• Loading, error, and empty states</li>
          <li>• Proper handling of scheduled revocations</li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentAccessListDemo;