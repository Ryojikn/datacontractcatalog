import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RevocationNoticeDialog } from '../revocation-notice-dialog';
import type { CurrentAccess } from '@/types';

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
    <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant} data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  User: () => <div data-testid="user-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
}));

describe('RevocationNoticeDialog', () => {
  const mockAccess: CurrentAccess = {
    id: 'access-001',
    userId: 'user-001',
    userName: 'John Doe',
    userEmail: 'john.doe@company.com',
    productId: 'product-001',
    productName: 'Credit Card Analytics',
    grantedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    grantedBy: 'admin-001',
    accessLevel: 'read',
    status: 'active'
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onScheduleRevocation: vi.fn(),
    onForceRevocation: vi.fn(),
    access: mockAccess,
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open with access details', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Revoke Access Permission')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Credit Card Analytics')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<RevocationNoticeDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('does not render when access is null', () => {
    render(<RevocationNoticeDialog {...defaultProps} access={null} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('displays access details correctly', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Credit Card Analytics')).toBeInTheDocument();
    expect(screen.getByText('read')).toBeInTheDocument();
    expect(screen.getByText(/Granted:/)).toBeInTheDocument();
    expect(screen.getByText(/Expires:/)).toBeInTheDocument();
  });

  it('shows both revocation options initially', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    expect(screen.getByText('Schedule Revocation (Recommended)')).toBeInTheDocument();
    expect(screen.getByText('Force Immediate Revocation')).toBeInTheDocument();
    expect(screen.getByText(/Notify the user 30 days in advance/)).toBeInTheDocument();
    expect(screen.getByText(/Immediately revoke access without advance notice/)).toBeInTheDocument();
  });

  it('allows selecting schedule revocation option', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    const scheduleOption = screen.getByText('Schedule Revocation (Recommended)').closest('div');
    fireEvent.click(scheduleOption!);

    // Should show the schedule revocation button
    expect(screen.getByText('Schedule Revocation (30 days)')).toBeInTheDocument();
  });

  it('allows selecting force revocation option', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    const forceOption = screen.getByText('Force Immediate Revocation').closest('div');
    fireEvent.click(forceOption!);

    // Should show the force revocation button
    expect(screen.getByText('Force Revoke Now')).toBeInTheDocument();
  });

  it('calls onScheduleRevocation when schedule button is clicked', async () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    // Select schedule option
    const scheduleOption = screen.getByText('Schedule Revocation (Recommended)').closest('div');
    fireEvent.click(scheduleOption!);

    // Click schedule button
    const scheduleButton = screen.getByText('Schedule Revocation (30 days)');
    fireEvent.click(scheduleButton);

    await waitFor(() => {
      expect(defaultProps.onScheduleRevocation).toHaveBeenCalledWith('access-001');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('calls onForceRevocation when force button is clicked', async () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    // Select force option
    const forceOption = screen.getByText('Force Immediate Revocation').closest('div');
    fireEvent.click(forceOption!);

    // Click force button
    const forceButton = screen.getByText('Force Revoke Now');
    fireEvent.click(forceButton);

    await waitFor(() => {
      expect(defaultProps.onForceRevocation).toHaveBeenCalledWith('access-001');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    render(<RevocationNoticeDialog {...defaultProps} loading={true} />);

    // Select schedule option
    const scheduleOption = screen.getByText('Schedule Revocation (Recommended)').closest('div');
    fireEvent.click(scheduleOption!);

    expect(screen.getByText('Scheduling...')).toBeInTheDocument();
  });

  it('shows loading state for force revocation', () => {
    render(<RevocationNoticeDialog {...defaultProps} loading={true} />);

    // Select force option
    const forceOption = screen.getByText('Force Immediate Revocation').closest('div');
    fireEvent.click(forceOption!);

    expect(screen.getByText('Revoking...')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    render(<RevocationNoticeDialog {...defaultProps} loading={true} />);

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });

  it('displays correct access level badge variant', () => {
    const adminAccess = { ...mockAccess, accessLevel: 'admin' as const };
    render(<RevocationNoticeDialog {...defaultProps} access={adminAccess} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });

  it('formats dates correctly', () => {
    render(<RevocationNoticeDialog {...defaultProps} />);

    // Check that dates are formatted in a readable way
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument(); // Granted date
    expect(screen.getByText(/January 15, 2025/)).toBeInTheDocument(); // Expires date
  });

  it('handles invalid dates gracefully', () => {
    const invalidAccess = { 
      ...mockAccess, 
      grantedAt: 'invalid-date',
      expiresAt: 'invalid-date'
    };
    
    render(<RevocationNoticeDialog {...defaultProps} access={invalidAccess} />);

    // Should still render without crashing
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('resets selection when dialog closes and reopens', () => {
    const { rerender } = render(<RevocationNoticeDialog {...defaultProps} />);

    // Select an option
    const scheduleOption = screen.getByText('Schedule Revocation (Recommended)').closest('div');
    fireEvent.click(scheduleOption!);
    expect(screen.getByText('Schedule Revocation (30 days)')).toBeInTheDocument();

    // Close dialog
    rerender(<RevocationNoticeDialog {...defaultProps} isOpen={false} />);

    // Reopen dialog
    rerender(<RevocationNoticeDialog {...defaultProps} isOpen={true} />);

    // Selection should be reset
    expect(screen.queryByText('Schedule Revocation (30 days)')).not.toBeInTheDocument();
    expect(screen.queryByText('Force Revoke Now')).not.toBeInTheDocument();
  });
});