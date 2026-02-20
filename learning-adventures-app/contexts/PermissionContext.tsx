'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Permission types available in the platform
 */
export interface Permissions {
  canUploadGames: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canCreateClassrooms: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canViewAllProgress: boolean;
  canManageSettings: boolean;
}

interface PermissionContextType {
  permissions: Permissions;
  hasPermission: (permission: keyof Permissions) => boolean;
  hasAnyPermission: (permissions: (keyof Permissions)[]) => boolean;
  hasAllPermissions: (permissions: (keyof Permissions)[]) => boolean;
  userRole: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | null;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

/**
 * Get permissions based on user role
 */
function getPermissionsForRole(role: string | undefined): Permissions {
  switch (role) {
    case 'ADMIN':
      return {
        canUploadGames: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canCreateClassrooms: true,
        canEditContent: true,
        canDeleteContent: true,
        canViewAllProgress: true,
        canManageSettings: true,
      };

    case 'TEACHER':
      return {
        canUploadGames: false,
        canManageUsers: false,
        canViewAnalytics: true, // Can view their own classroom analytics
        canCreateClassrooms: true,
        canEditContent: false,
        canDeleteContent: false,
        canViewAllProgress: false, // Can only view their students' progress
        canManageSettings: false,
      };

    case 'PARENT':
      return {
        canUploadGames: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canCreateClassrooms: false,
        canEditContent: false,
        canDeleteContent: false,
        canViewAllProgress: false, // Can only view their children's progress
        canManageSettings: false,
      };

    case 'STUDENT':
    default:
      return {
        canUploadGames: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canCreateClassrooms: false,
        canEditContent: false,
        canDeleteContent: false,
        canViewAllProgress: false,
        canManageSettings: false,
      };
  }
}

/**
 * PermissionProvider - Provides permission checking throughout the app
 *
 * @example
 * // Wrap your app
 * <PermissionProvider>
 *   <App />
 * </PermissionProvider>
 *
 * // Use in components
 * const { hasPermission } = usePermissions();
 * if (hasPermission('canUploadGames')) {
 *   // Show upload button
 * }
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as
    | 'ADMIN'
    | 'TEACHER'
    | 'PARENT'
    | 'STUDENT'
    | null;
  const permissions = getPermissionsForRole(userRole || undefined);

  const hasPermission = (permission: keyof Permissions): boolean => {
    return permissions[permission];
  };

  const hasAnyPermission = (permissionList: (keyof Permissions)[]): boolean => {
    return permissionList.some((permission) => permissions[permission]);
  };

  const hasAllPermissions = (
    permissionList: (keyof Permissions)[]
  ): boolean => {
    return permissionList.every((permission) => permissions[permission]);
  };

  const value: PermissionContextType = {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to access permissions
 *
 * @example
 * const { hasPermission, permissions, userRole } = usePermissions();
 *
 * if (hasPermission('canManageUsers')) {
 *   // Render admin content
 * }
 */
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

/**
 * Hook to check a specific permission
 *
 * @example
 * const canUpload = useHasPermission('canUploadGames');
 *
 * return (
 *   <button disabled={!canUpload}>Upload Game</button>
 * );
 */
export function useHasPermission(permission: keyof Permissions): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook to get current user role
 *
 * @example
 * const role = useUserRole();
 * const isAdmin = role === 'ADMIN';
 */
export function useUserRole() {
  const { userRole } = usePermissions();
  return userRole;
}
