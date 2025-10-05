import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CurrentAccessList } from '../current-access-list';
import type { CurrentAccess } from '@/types';

// Mock data for testing
const mockCurrentAccess: CurrentAccess[] = [
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
    expiresAt: '2024-03-10T08:15:00Z',
    grantedBy: 'admin-001',
    accessLevel: 'admin',
    status: 'scheduled_for_revocation',
    revocationScheduledAt: '2024-03-10T08:15:00Z',
    revocationNotificationSent: true
  }
];

describe('CurrentAccessList', () => {
  const mockCallbacks = {
    onRenewAccess: vi.fn(),
    onScheduleRevocation: vi.fn(),
    onForceRevocation: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current access list correctly', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Check if all users are displayed
    expect(screen.getByText('Ana Costa')).toBeInTheDocument();
    expect(screen.getByText('Pedro Almeida')).toBeInTheDocument();
    expect(screen.getByText('Sofia Rodrigues')).toBeInTheDocument();

    // Check if products are displayed
    expect(screen.getByText('Credit Card Transactions ETL')).toBeInTheDocument();
    expect(screen.getByText('Customer Segmentation Data')).toBeInTheDocument();
    expect(screen.getByText('Financial Risk Metrics')).toBeInTheDocument();
  });

  it('displays access levels correctly', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Check access level badges
    expect(screen.getByText('read')).toBeInTheDocument();
    expect(screen.getByText('write')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('displays status badges correctly', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Check status badges
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('Scheduled for Revocation')).toBeInTheDocument();
  });

  it('filters by status correctly', async () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Open status filter
    const statusFilter = screen.getByDisplayValue('All Status');
    fireEvent.click(statusFilter);

    // Select "Active" filter
    const activeOption = screen.getByText('Active');
    fireEvent.click(activeOption);

    await waitFor(() => {
      // Should only show active access
      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
      expect(screen.queryByText('Pedro Almeida')).not.toBeInTheDocument();
      expect(screen.queryByText('Sofia Rodrigues')).not.toBeInTheDocument();
    });
  });

  it('filters by access level correctly', async () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Open access level filter
    const accessLevelFilter = screen.getByDisplayValue('All Levels');
    fireEvent.click(accessLevelFilter);

    // Select "admin" filter
    const adminOption = screen.getByText('Admin');
    fireEvent.click(adminOption);

    await waitFor(() => {
      // Should only show admin access
      expect(screen.queryByText('Ana Costa')).not.toBeInTheDocument();
      expect(screen.queryByText('Pedro Almeida')).not.toBeInTheDocument();
      expect(screen.getByText('Sofia Rodrigues')).toBeInTheDocument();
    });
  });

  it('sorts by user name correctly', async () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Click on User sort button
    const userSortButton = screen.getByText(/User/);
    fireEvent.click(userSortButton);

    await waitFor(() => {
      const userNames = screen.getAllByText(/Ana Costa|Pedro Almeida|Sofia Rodrigues/);
      // Should be sorted alphabetically: Ana, Pedro, Sofia
      expect(userNames[0]).toHaveTextContent('Ana Costa');
    });
  });

  it('calls onRenewAccess when Renew button is clicked', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Find and click the first Renew button (should be for Ana Costa)
    const renewButtons = screen.getAllByText('Renew');
    fireEvent.click(renewButtons[0]);

    expect(mockCallbacks.onRenewAccess).toHaveBeenCalledWith('access-001');
  });

  it('calls onScheduleRevocation when Revoke button is clicked', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Find and click the first Revoke button
    const revokeButtons = screen.getAllByText('Revoke');
    fireEvent.click(revokeButtons[0]);

    expect(mockCallbacks.onScheduleRevocation).toHaveBeenCalledWith('access-001');
  });

  it('calls onForceRevocation when Force Remove button is clicked', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Find and click the first Force Remove button
    const forceRemoveButtons = screen.getAllByText('Force Remove');
    fireEvent.click(forceRemoveButtons[0]);

    expect(mockCallbacks.onForceRevocation).toHaveBeenCalledWith('access-001');
  });

  it('shows loading state correctly', () => {
    render(
      <CurrentAccessList
        currentAccess={[]}
        loading={true}
        {...mockCallbacks}
      />
    );

    // Should show skeleton loaders - check for skeleton class
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state correctly', () => {
    const errorMessage = 'Failed to load access data';
    render(
      <CurrentAccessList
        currentAccess={[]}
        error={errorMessage}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('Failed to load current access')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows empty state correctly', () => {
    render(
      <CurrentAccessList
        currentAccess={[]}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('No Active Access Permissions')).toBeInTheDocument();
    expect(screen.getByText('No users currently have active access to data products.')).toBeInTheDocument();
  });

  it('shows filtered empty state correctly', () => {
    render(
      <CurrentAccessList
        currentAccess={mockCurrentAccess}
        {...mockCallbacks}
      />
    );

    // Apply a filter that returns no results
    const statusFilter = screen.getByDisplayValue('All Status');
    fireEvent.click(statusFilter);
    
    // This should result in no matches since we don't have any with this exact status
    const expiringSoonOption = screen.getByText('Expiring Soon');
    fireEvent.click(expiringSoonOption);

    // Should show filtered empty state
    expect(screen.getByText('No Access Permissions Match Filters')).toBeInTheDocument();
  });

  it('does not show Renew and Revoke buttons for scheduled_for_revocation status', () => {
    const scheduledAccess: CurrentAccess[] = [{
      id: 'access-scheduled',
      userId: 'user-scheduled',
      userName: 'Scheduled User',
      userEmail: 'scheduled@company.com',
      productId: 'product-scheduled',
      productName: 'Scheduled Product',
      grantedAt: '2024-01-10T08:15:00Z',
      expiresAt: '2024-03-10T08:15:00Z',
      grantedBy: 'admin-001',
      accessLevel: 'read',
      status: 'scheduled_for_revocation',
      revocationScheduledAt: '2024-03-10T08:15:00Z'
    }];

    render(
      <CurrentAccessList
        currentAccess={scheduledAccess}
        {...mockCallbacks}
      />
    );

    // Should not show Renew and Revoke buttons
    expect(screen.queryByText('Renew')).not.toBeInTheDocument();
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
    
    // Should still show Force Remove button
    expect(screen.getByText('Force Remove')).toBeInTheDocument();
  });
});