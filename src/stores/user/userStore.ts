import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
}

// Mock user for development - in production this would come from authentication
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state - for development, we'll set a mock admin user
      currentUser: mockAdminUser,
      isAuthenticated: true,

      // Actions
      setUser: (user: User) => {
        set({ 
          currentUser: user, 
          isAuthenticated: true 
        });
      },

      clearUser: () => {
        set({ 
          currentUser: null, 
          isAuthenticated: false 
        });
      },

      hasPermission: (permission: string) => {
        const { currentUser } = get();
        return currentUser?.permissions.includes(permission) || false;
      },

      hasRole: (role: UserRole) => {
        const { currentUser } = get();
        return currentUser?.role === role;
      },

      isAdmin: () => {
        const { currentUser } = get();
        return currentUser?.role === 'admin';
      }
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);