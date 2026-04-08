'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';


type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallbackUrl?: string;
  showLoading?: boolean;
}

const roleHierarchy = { ADMIN: 4, TEACHER: 3, PARENT: 2, STUDENT: 1 };

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  allowedRoles,
  fallbackUrl = '/',
  showLoading = true,
}: ProtectedRouteProps) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (requireAuth && !user) {
      window.location.href = '/login';
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user?.role as UserRole;
      if (!allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
        router.push('/unauthorized');
        return;
      }
    }

    if (requiredRole && user?.role !== requiredRole) {
      const userRoleLevel = roleHierarchy[user?.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole];
      if (userRoleLevel < requiredRoleLevel) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, status, requireAuth, requiredRole, allowedRoles, router, fallbackUrl]);

  if (status === 'loading') {
    return showLoading ? (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ) : null;
  }

  if (requireAuth && !user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role as UserRole;
    if (!allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
      return null;
    }
  }

  if (requiredRole) {
    const userRoleLevel = roleHierarchy[user?.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];
    if (userRoleLevel < requiredRoleLevel) {
      return null;
    }
  }

  return <>{children}</>;
}

// Higher-order component version for class components or more flexible usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  const ProtectedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;

  return ProtectedComponent;
}

// Role-specific protection components for convenience
export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="ADMIN" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function TeacherRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="TEACHER" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function ParentRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="PARENT" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function StudentRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="STUDENT" {...props}>
      {children}
    </ProtectedRoute>
  );
}
