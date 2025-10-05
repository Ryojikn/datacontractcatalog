import React from 'react';
import { useUserStore, type UserRole } from '@/stores/user';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback,
  redirectTo = '/'
}: RoleGuardProps) {
  const { currentUser, isAuthenticated, hasRole, hasPermission } = useUserStore();

  // If not authenticated, redirect to home
  if (!isAuthenticated || !currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Utility component for conditional rendering based on permissions
interface ConditionalRenderProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function ConditionalRender({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback 
}: ConditionalRenderProps) {
  const { currentUser, isAuthenticated, hasRole, hasPermission } = useUserStore();

  // If not authenticated, show fallback or nothing
  if (!isAuthenticated || !currentUser) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}