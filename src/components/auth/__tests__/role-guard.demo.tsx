import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoleGuard, ConditionalRender } from '../role-guard';
import { useUserStore } from '@/stores/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, Eye, User } from 'lucide-react';

export function RoleGuardDemo() {
  const { currentUser, setUser, clearUser } = useUserStore();

  const mockUsers = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin' as const,
      permissions: [
        'admin.access',
        'admin.approve_requests',
        'admin.manage_access',
        'admin.view_audit_logs',
        'admin.export_reports'
      ]
    },
    {
      id: 'user-1',
      name: 'Regular User',
      email: 'user@example.com',
      role: 'user' as const,
      permissions: ['user.access', 'user.request_access']
    },
    {
      id: 'viewer-1',
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: 'viewer' as const,
      permissions: ['viewer.access']
    }
  ];

  const switchUser = (user: typeof mockUsers[0]) => {
    setUser(user);
  };

  const logout = () => {
    clearUser();
  };

  return (
    <BrowserRouter>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Role-Based Access Control Demo</h1>
          <p className="text-muted-foreground">
            Switch between different user roles to see how access control works
          </p>
        </div>

        {/* Current User Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
            <CardDescription>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span>{currentUser.name} ({currentUser.email})</span>
                  <Badge variant="secondary">{currentUser.role}</Badge>
                </div>
              ) : (
                'Not authenticated'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockUsers.map((user) => (
                <Button
                  key={user.id}
                  variant={currentUser?.id === user.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchUser(user)}
                  className="flex items-center gap-2"
                >
                  {user.role === 'admin' && <Settings className="h-4 w-4" />}
                  {user.role === 'user' && <Shield className="h-4 w-4" />}
                  {user.role === 'viewer' && <Eye className="h-4 w-4" />}
                  {user.name}
                </Button>
              ))}
              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Content Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Only Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Admin Only</CardTitle>
              <CardDescription>
                Content that only admin users can see
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConditionalRender 
                requiredRole="admin"
                fallback={
                  <div className="text-muted-foreground italic">
                    Access denied - Admin role required
                  </div>
                }
              >
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ Admin access granted!</p>
                  <Button size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </div>
              </ConditionalRender>
            </CardContent>
          </Card>

          {/* Permission-Based Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Permission-Based</CardTitle>
              <CardDescription>
                Content based on specific permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ConditionalRender 
                  requiredPermission="admin.approve_requests"
                  fallback={
                    <div className="text-muted-foreground text-sm">
                      ✗ Cannot approve requests
                    </div>
                  }
                >
                  <div className="text-green-600 text-sm">
                    ✓ Can approve requests
                  </div>
                </ConditionalRender>

                <ConditionalRender 
                  requiredPermission="admin.view_audit_logs"
                  fallback={
                    <div className="text-muted-foreground text-sm">
                      ✗ Cannot view audit logs
                    </div>
                  }
                >
                  <div className="text-green-600 text-sm">
                    ✓ Can view audit logs
                  </div>
                </ConditionalRender>

                <ConditionalRender 
                  requiredPermission="user.request_access"
                  fallback={
                    <div className="text-muted-foreground text-sm">
                      ✗ Cannot request access
                    </div>
                  }
                >
                  <div className="text-green-600 text-sm">
                    ✓ Can request access
                  </div>
                </ConditionalRender>
              </div>
            </CardContent>
          </Card>

          {/* User and Above Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">User+ Content</CardTitle>
              <CardDescription>
                Content for users and admins (not viewers)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConditionalRender 
                requiredPermission="user.request_access"
                fallback={
                  <div className="text-muted-foreground italic">
                    Access denied - User permissions required
                  </div>
                }
              >
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ User access granted!</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Request Data Access
                  </Button>
                </div>
              </ConditionalRender>
            </CardContent>
          </Card>

          {/* All Users Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600">All Users</CardTitle>
              <CardDescription>
                Content visible to all authenticated users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ Authenticated user!</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Browse Catalog
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground italic">
                  Please log in to access content
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Route Guard Example */}
        <Card>
          <CardHeader>
            <CardTitle>Route Protection Example</CardTitle>
            <CardDescription>
              This simulates how the admin route is protected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoleGuard 
              requiredRole="admin"
              fallback={
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                  <p className="font-medium">Access Denied</p>
                  <p className="text-sm">You need admin privileges to access the administration page.</p>
                </div>
              }
            >
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-green-700">
                <p className="font-medium">Admin Route Access Granted</p>
                <p className="text-sm">You can access the administration page.</p>
              </div>
            </RoleGuard>
          </CardContent>
        </Card>

        {/* Current Permissions Display */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle>Current User Permissions</CardTitle>
              <CardDescription>
                All permissions for {currentUser.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentUser.permissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BrowserRouter>
  );
}

export default RoleGuardDemo;