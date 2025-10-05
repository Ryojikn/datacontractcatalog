import { useUserStore } from '@/stores/user';

export function usePermissions() {
  const { currentUser, isAuthenticated, hasRole, hasPermission, isAdmin } = useUserStore();

  return {
    currentUser,
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    
    // Admin-specific permission checks
    canApproveRequests: () => hasPermission('admin.approve_requests'),
    canManageAccess: () => hasPermission('admin.manage_access'),
    canViewAuditLogs: () => hasPermission('admin.view_audit_logs'),
    canExportReports: () => hasPermission('admin.export_reports'),
    
    // Role checks
    isAdminUser: () => hasRole('admin'),
    isRegularUser: () => hasRole('user'),
    isViewer: () => hasRole('viewer'),
  };
}