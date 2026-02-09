'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT')[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * RoleGuard - Component for conditional rendering based on user roles
 *
 * @example
 * // Show content only to admins and teachers
 * <RoleGuard allowedRoles={['ADMIN', 'TEACHER']}>
 *   <AdminContent />
 * </RoleGuard>
 *
 * @example
 * // With fallback content
 * <RoleGuard allowedRoles={['ADMIN']} fallback={<p>Access denied</p>}>
 *   <SensitiveData />
 * </RoleGuard>
 */
export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  // Don't render anything while loading
  if (status === 'loading') {
    return null;
  }

  // If user is not authenticated, show fallback
  if (!session?.user) {
    return <>{fallback}</>;
  }

  const userRole = session.user.role;

  // Role hierarchy for permission checking
  const roleHierarchy = {
    ADMIN: 4,
    TEACHER: 3,
    PARENT: 2,
    STUDENT: 1,
  };

  // Check if user has permission
  const hasPermission = allowedRoles.some((role) => {
    const userLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[role];
    // Users with higher or equal role level have access
    return userLevel >= requiredLevel;
  });

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Convenience components for specific roles
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function TeacherOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['TEACHER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ParentOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['PARENT']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function StudentOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['STUDENT']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * TeacherAndAdmin - Shows content to both teachers and admins
 */
export function TeacherAndAdmin({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'TEACHER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
