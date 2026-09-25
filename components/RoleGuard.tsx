'use client';

import { useAuth } from '@/hooks/useAuth';
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
  const { user, status } = useAuth();

  if (status === 'loading') {
    return null;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role;

  // Role hierarchy for permission checking
  const roleHierarchy = {
    ADMIN: 4,
    TEACHER: 3,
    PARENT: 2,
    STUDENT: 1,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;

  // requireAll=false (default): user needs to clear the *lowest* bar among
  // allowedRoles (any one qualifying role is enough).
  // requireAll=true: user needs to clear the *highest* bar among
  // allowedRoles (must qualify for all of them at once).
  const hasPermission = requireAll
    ? allowedRoles.every((role) => userLevel >= roleHierarchy[role])
    : allowedRoles.some((role) => userLevel >= roleHierarchy[role]);

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
