import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RoleGuard, ConditionalRender } from '../role-guard';
import { useUserStore } from '@/stores/user';

// Mock the user store
jest.mock('@/stores/user');
const mockUseUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;

// Test component wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user has required role', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['admin.access']
      },
      isAuthenticated: true,
      hasRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
      isAdmin: jest.fn().mockReturnValue(true),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <TestWrapper>
        <RoleGuard requiredRole="admin">
          <div>Admin Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should render children when user has required permission', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['admin.access']
      },
      isAuthenticated: true,
      hasRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
      isAdmin: jest.fn().mockReturnValue(true),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <TestWrapper>
        <RoleGuard requiredPermission="admin.access">
          <div>Protected Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks required role', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        permissions: []
      },
      isAuthenticated: true,
      hasRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn().mockReturnValue(false),
      isAdmin: jest.fn().mockReturnValue(false),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <TestWrapper>
        <RoleGuard 
          requiredRole="admin" 
          fallback={<div>Access Denied</div>}
        >
          <div>Admin Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect when user is not authenticated', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: null,
      isAuthenticated: false,
      hasRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn().mockReturnValue(false),
      isAdmin: jest.fn().mockReturnValue(false),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <TestWrapper>
        <RoleGuard requiredRole="admin">
          <div>Admin Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    // Should redirect to home, so admin content should not be present
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});

describe('ConditionalRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user has required role', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['admin.access']
      },
      isAuthenticated: true,
      hasRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
      isAdmin: jest.fn().mockReturnValue(true),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <ConditionalRender requiredRole="admin">
        <div>Admin Button</div>
      </ConditionalRender>
    );

    expect(screen.getByText('Admin Button')).toBeInTheDocument();
  });

  it('should not render children when user lacks required role', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        permissions: []
      },
      isAuthenticated: true,
      hasRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn().mockReturnValue(false),
      isAdmin: jest.fn().mockReturnValue(false),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <ConditionalRender requiredRole="admin">
        <div>Admin Button</div>
      </ConditionalRender>
    );

    expect(screen.queryByText('Admin Button')).not.toBeInTheDocument();
  });

  it('should render fallback when user lacks required permission', () => {
    mockUseUserStore.mockReturnValue({
      currentUser: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        permissions: []
      },
      isAuthenticated: true,
      hasRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn().mockReturnValue(false),
      isAdmin: jest.fn().mockReturnValue(false),
      setUser: jest.fn(),
      clearUser: jest.fn()
    });

    render(
      <ConditionalRender 
        requiredPermission="admin.access"
        fallback={<div>Limited Access</div>}
      >
        <div>Full Access</div>
      </ConditionalRender>
    );

    expect(screen.getByText('Limited Access')).toBeInTheDocument();
    expect(screen.queryByText('Full Access')).not.toBeInTheDocument();
  });
});