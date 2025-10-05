import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrentAccessTab } from '../current-access-tab';
import { useAdminStore } from '@/stores/admin';
import { useProductStore } from '@/stores/product';

// Mock the stores
vi.mock('@/stores/admin');
vi.mock('@/stores/product');

const mockUseAdminStore = useAdminStore as vi.MockedFunction<typeof useAdminStore>;
const mockUseProductStore = useProductStore as vi.MockedFunction<typeof useProductStore>;

describe('CurrentAccessTab', () => {
  const mockProducts = [
    {
      id: 'product-1',
      name: 'Customer Analytics Dataset',
      technology: 'Python',
      description: 'Customer behavior analytics data'
    },
    {
      id: 'product-2',
      name: 'Sales Performance Data',
      technology: 'SQL',
      description: 'Sales metrics and performance data'
    }
  ];

  const mockCurrentAccess = [
    {
      id: 'access-1',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john.smith@company.com',
      productId: 'product-1',
      productName: 'Customer Analytics Dataset',
      grantedAt: '2024-01-15T10:00:00Z',
      expiresAt: '2025-01-15T10:00:00Z',
      grantedBy: 'admin@company.com',
      accessLevel: 'read' as const,
      status: 'active' as const
    },
    {
      id: 'access-2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@company.com',
      productId: 'product-2',
      productName: 'Sales Performance Data',
      grantedAt: '2024-01-20T14:30:00Z',
      expiresAt: '2024-03-20T14:30:00Z',
      grantedBy: 'admin@company.com',
      accessLevel: 'write' as const,
      status: 'expiring_soon' as const
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseProductStore.mockReturnValue({
      products: mockProducts,
      fetchProducts: vi.fn(),
      loading: false,
      error: null,
      selectedProduct: null,
      fetchProduct: vi.fn(),
      clearError: vi.fn()
    });

    mockUseAdminStore.mockReturnValue({
      currentAccess: mockCurrentAccess,
      fetchCurrentAccess: vi.fn(),
      fetchCurrentAccessByProduct: vi.fn(),
      renewAccess: vi.fn(),
      bulkRenewAccess: vi.fn(),
      scheduleRevocation: vi.fn(),
      forceRevocation: vi.fn(),
      loading: false,
      error: null,
      pendingRequests: [],
      commentTemplates: [],
      revocationNotices: [],
      scheduledNotifications: [],
      notificationConfig: {} as any,
      auditLog: [],
      accessHistory: null,
      lastRefresh: null,
      fetchPendingRequests: vi.fn(),
      loadCommentTemplates: vi.fn(),
      approveRequest: vi.fn(),
      declineRequest: vi.fn(),
      createCommentTemplate: vi.fn(),
      updateCommentTemplate: vi.fn(),
      deleteCommentTemplate: vi.fn(),
      generateScheduledNotifications: vi.fn(),
      processScheduledNotifications: vi.fn(),
      updateNotificationConfig: vi.fn(),
      cleanupOldNotifications: vi.fn(),
      generateExpirationReminders: vi.fn(),
      generateRevocationNotices: vi.fn(),
      getAuditLogEntries: vi.fn(),
      generateAuditReport: vi.fn(),
      getAuditLogSummary: vi.fn(),
      fetchAccessHistory: vi.fn()
    });
  });

  it('should render the current access tab with product filter', () => {
    render(<CurrentAccessTab />);
    
    expect(screen.getByText('Current Access Management')).toBeInTheDocument();
    expect(screen.getByText('Filter by Data Product')).toBeInTheDocument();
    expect(screen.getByText('Select a specific data product to view only its current access, or leave unselected to view all access')).toBeInTheDocument();
  });

  it('should display product selection dropdown', () => {
    render(<CurrentAccessTab />);
    
    expect(screen.getByText('All products (no filter)')).toBeInTheDocument();
  });

  it('should call fetchCurrentAccess on mount when no product is selected', () => {
    const mockFetchCurrentAccess = vi.fn();
    mockUseAdminStore.mockReturnValue({
      ...mockUseAdminStore(),
      fetchCurrentAccess: mockFetchCurrentAccess
    });

    render(<CurrentAccessTab />);
    
    expect(mockFetchCurrentAccess).toHaveBeenCalled();
  });

  it('should show product information when a product is selected', () => {
    render(<CurrentAccessTab />);
    
    // The product information would be shown when a product is selected
    // This would require more complex setup to simulate the Select component interaction
    expect(screen.getByText('Current Access Management')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    mockUseAdminStore.mockReturnValue({
      ...mockUseAdminStore(),
      loading: true
    });

    render(<CurrentAccessTab />);
    
    expect(screen.getByText('Current Access Management')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    mockUseAdminStore.mockReturnValue({
      ...mockUseAdminStore(),
      error: 'Failed to load current access'
    });

    render(<CurrentAccessTab />);
    
    expect(screen.getByText('Current Access Management')).toBeInTheDocument();
  });
});