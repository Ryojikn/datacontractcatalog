import React, { useState } from 'react';
import { RevocationNoticeDialog } from '../revocation-notice-dialog';
import { Button } from '@/components/ui/button';
import type { CurrentAccess } from '@/types';

/**
 * Demo component for RevocationNoticeDialog
 * 
 * This demo showcases:
 * - Dialog opening and closing
 * - Different access levels and their badge variants
 * - Schedule revocation workflow
 * - Force revocation workflow
 * - Loading states
 * - Different access statuses
 */

const RevocationNoticeDialogDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<CurrentAccess | null>(null);

  // Sample access data with different scenarios
  const sampleAccess: CurrentAccess[] = [
    {
      id: 'access-001',
      userId: 'user-001',
      userName: 'Ana Costa',
      userEmail: 'ana.costa@company.com',
      productId: 'product-001',
      productName: 'Credit Card Transactions ETL',
      grantedAt: '2024-01-15T10:00:00Z',
      expiresAt: '2025-01-15T10:00:00Z',
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
      expiresAt: '2024-03-20T14:30:00Z',
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
      expiresAt: '2024-12-10T08:15:00Z',
      grantedBy: 'admin-001',
      accessLevel: 'admin',
      status: 'active'
    }
  ];

  const handleOpenDialog = (access: CurrentAccess) => {
    setSelectedAccess(access);
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedAccess(null);
    setLoading(false);
  };

  const handleScheduleRevocation = async (accessId: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Scheduled revocation for access:', accessId);
    alert(`Access revocation scheduled for ${selectedAccess?.userName} - ${selectedAccess?.productName}`);
    
    setLoading(false);
    handleCloseDialog();
  };

  const handleForceRevocation = async (accessId: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Force revoked access:', accessId);
    alert(`Access immediately revoked for ${selectedAccess?.userName} - ${selectedAccess?.productName}`);
    
    setLoading(false);
    handleCloseDialog();
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'text-red-600';
      case 'write': return 'text-blue-600';
      case 'read': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expiring_soon': return 'text-orange-600';
      case 'scheduled_for_revocation': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">RevocationNoticeDialog Demo</h1>
        <p className="text-muted-foreground mb-6">
          This demo showcases the RevocationNoticeDialog component with different access scenarios.
          Click on any access item below to open the revocation dialog.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Sample Access Permissions</h2>
        
        {sampleAccess.map((access) => (
          <div
            key={access.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{access.userName}</span>
                  <span className={`text-sm px-2 py-1 rounded ${getAccessLevelColor(access.accessLevel)} bg-muted`}>
                    {access.accessLevel}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${getStatusColor(access.status)} bg-muted`}>
                    {access.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Product:</span> {access.productName}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Granted:</span> {new Date(access.grantedAt).toLocaleDateString()} | 
                  <span className="font-medium ml-2">Expires:</span> {new Date(access.expiresAt).toLocaleDateString()}
                </div>
              </div>
              
              <Button
                onClick={() => handleOpenDialog(access)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Revoke Access
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold mb-2">Demo Features:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Click "Revoke Access" to open the revocation dialog</li>
          <li>• Choose between scheduled revocation (30-day notice) or immediate force revocation</li>
          <li>• See different access levels (read, write, admin) with appropriate badge colors</li>
          <li>• Experience loading states during revocation actions</li>
          <li>• View properly formatted dates and user information</li>
          <li>• Test dialog closing and selection reset functionality</li>
        </ul>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-800">Usage Notes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Scheduled revocation sends a 30-day advance notice to the user</li>
          <li>• Force revocation immediately removes access without notice</li>
          <li>• Use force revocation only for security incidents or policy violations</li>
          <li>• The dialog shows detailed access information before confirmation</li>
          <li>• Loading states prevent multiple submissions during processing</li>
        </ul>
      </div>

      {/* RevocationNoticeDialog */}
      <RevocationNoticeDialog
        isOpen={isOpen}
        onClose={handleCloseDialog}
        onScheduleRevocation={handleScheduleRevocation}
        onForceRevocation={handleForceRevocation}
        access={selectedAccess}
        loading={loading}
      />
    </div>
  );
};

export default RevocationNoticeDialogDemo;