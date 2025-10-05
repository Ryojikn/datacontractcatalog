import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AccessRenewalDialog } from '../access-renewal-dialog'
import type { CurrentAccess } from '@/types'

// Mock the UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="dialog-title">{children}</h2>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  )
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon" />,
  User: () => <span data-testid="user-icon" />,
  Shield: () => <span data-testid="shield-icon" />,
  AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
  CheckCircle: () => <span data-testid="check-circle-icon" />
}));

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
  }
];

describe('AccessRenewalDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open with single access item', () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={[mockCurrentAccess[0]]}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Renew Access Permission')).toBeInTheDocument();
    expect(screen.getByText('This will extend the access permission by one year from today.')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Credit Card Transactions ETL')).toBeInTheDocument();
  });

  it('renders correctly when open with multiple access items', () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={mockCurrentAccess}
      />
    );

    expect(screen.getByText('Renew 2 Access Permissions')).toBeInTheDocument();
    expect(screen.getByText('This will extend all selected access permissions by one year from today.')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Renew 2 Permissions')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AccessRenewalDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={mockCurrentAccess}
      />
    );

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('displays new expiration date correctly', () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={[mockCurrentAccess[0]]}
      />
    );

    expect(screen.getByText('New Expiration Date')).toBeInTheDocument();
    // The exact date will depend on when the test runs, so we just check that a date is displayed
    const dateElements = screen.getAllByText(/\d{4}/); // Look for year in date
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('shows warning for scheduled revocations', () => {
    const accessWithRevocation: CurrentAccess = {
      ...mockCurrentAccess[0],
      status: 'scheduled_for_revocation',
      revocationScheduledAt: '2024-04-15T10:00:00Z'
    };

    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={[accessWithRevocation]}
      />
    );

    expect(screen.getByText('Scheduled Revocations Will Be Cancelled')).toBeInTheDocument();
    expect(screen.getByText(/One of the selected permissions is scheduled for revocation/)).toBeInTheDocument();
  });

  it('calls onConfirm with correct access IDs when confirmed', async () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={mockCurrentAccess}
      />
    );

    const confirmButton = screen.getByText('Renew 2 Permissions');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(['access-001', 'access-002']);
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={mockCurrentAccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={[mockCurrentAccess[0]]}
        loading={true}
      />
    );

    const confirmButton = screen.getByText('Renew Access');
    expect(confirmButton).toBeDisabled();
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });

  it('displays access level badges correctly', () => {
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={mockCurrentAccess}
      />
    );

    const readBadge = screen.getByText('read');
    const writeBadge = screen.getByText('write');
    
    expect(readBadge).toBeInTheDocument();
    expect(writeBadge).toBeInTheDocument();
  });

  it('formats expiration dates correctly', () => {
    // Test with expired access
    const expiredAccess: CurrentAccess = {
      ...mockCurrentAccess[0],
      expiresAt: '2024-01-01T10:00:00Z' // Past date
    };

    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        accessItems={[expiredAccess]}
      />
    );

    expect(screen.getByText(/Expired \d+ day/)).toBeInTheDocument();
  });

  it('prevents actions when confirming', async () => {
    const slowOnConfirm = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <AccessRenewalDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={slowOnConfirm}
        accessItems={[mockCurrentAccess[0]]}
      />
    );

    const confirmButton = screen.getByText('Renew Access');
    fireEvent.click(confirmButton);

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText('Renewing...')).toBeInTheDocument();
    });

    // Cancel button should be disabled
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });
});