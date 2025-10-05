# Role-Based Access Control (RBAC)

This module provides role-based access control functionality for the DataContract Catalog application.

## Components

### RoleGuard

A higher-order component that protects routes and components based on user roles or permissions.

```tsx
import { RoleGuard } from '@/components/auth';

// Protect by role
<RoleGuard requiredRole="admin">
  <AdminDashboard />
</RoleGuard>

// Protect by permission
<RoleGuard requiredPermission="admin.approve_requests">
  <ApprovalButton />
</RoleGuard>

// With fallback content
<RoleGuard 
  requiredRole="admin" 
  fallback={<div>Access Denied</div>}
>
  <AdminContent />
</RoleGuard>

// With redirect
<RoleGuard 
  requiredRole="admin" 
  redirectTo="/unauthorized"
>
  <AdminContent />
</RoleGuard>
```

### ConditionalRender

A component for conditionally rendering content based on user roles or permissions without route protection.

```tsx
import { ConditionalRender } from '@/components/auth';

// Show/hide based on role
<ConditionalRender requiredRole="admin">
  <AdminButton />
</ConditionalRender>

// Show/hide based on permission
<ConditionalRender requiredPermission="admin.approve_requests">
  <ApprovalButton />
</ConditionalRender>

// With fallback content
<ConditionalRender 
  requiredRole="admin"
  fallback={<div>Limited access</div>}
>
  <FullAccessContent />
</ConditionalRender>
```

## User Store

The user store manages authentication state and user information.

```tsx
import { useUserStore } from '@/stores/user';

function MyComponent() {
  const { 
    currentUser, 
    isAuthenticated, 
    hasRole, 
    hasPermission, 
    isAdmin 
  } = useUserStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>Welcome, {currentUser?.name}!</h1>
      {isAdmin() && <AdminPanel />}
    </div>
  );
}
```

## Permissions Hook

A utility hook that provides convenient permission checking functions.

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function AdminComponent() {
  const { 
    canApproveRequests, 
    canManageAccess, 
    canViewAuditLogs,
    isAdminUser 
  } = usePermissions();

  return (
    <div>
      {canApproveRequests() && <ApprovalSection />}
      {canManageAccess() && <AccessManagement />}
      {canViewAuditLogs() && <AuditLogs />}
    </div>
  );
}
```

## User Roles

The system supports three main roles:

- **admin**: Full access to all features including administration
- **user**: Standard user with access to request data and use the catalog
- **viewer**: Read-only access to the catalog

## Permissions

Admin permissions:
- `admin.access`: Access to admin areas
- `admin.approve_requests`: Approve/decline access requests
- `admin.manage_access`: Manage current access permissions
- `admin.view_audit_logs`: View audit logs and reports
- `admin.export_reports`: Export audit reports

User permissions:
- `user.access`: Access to user features
- `user.request_access`: Request access to data products

Viewer permissions:
- `viewer.access`: Read-only access to catalog

## Development Setup

For development, the user store is initialized with a mock admin user. In production, this would be replaced with actual authentication integration.

```typescript
// Mock user for development
const mockAdminUser: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  permissions: [
    'admin.access',
    'admin.approve_requests',
    'admin.manage_access',
    'admin.view_audit_logs',
    'admin.export_reports'
  ]
};
```

## Integration with Routes

Routes can be protected using the RoleGuard component:

```tsx
import { RoleGuard } from '@/components/auth';

<Route 
  path="/admin" 
  element={
    <RoleGuard requiredRole="admin">
      <AdminPage />
    </RoleGuard>
  } 
/>
```

## Testing

The module includes comprehensive tests for both components and integration scenarios. Run tests with:

```bash
npm test src/components/auth
```

## Future Enhancements

- Integration with external authentication providers (OAuth, SAML)
- Dynamic permission loading from backend
- Role hierarchy and inheritance
- Session management and token refresh
- Multi-factor authentication support