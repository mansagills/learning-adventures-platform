'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
  fallbackUrl?: string;
  showLoading?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  fallbackUrl = '/',
  showLoading = true,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    // If authentication is required but user is not authenticated
    if (requireAuth && !session) {
      router.push(fallbackUrl);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requiredRole && session?.user?.role !== requiredRole) {
      // Check if user has higher permissions
      const roleHierarchy = {
        ADMIN: 4,
        TEACHER: 3,
        PARENT: 2,
        STUDENT: 1,
      };

      const userRoleLevel = roleHierarchy[session?.user?.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [session, status, requireAuth, requiredRole, router, fallbackUrl]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return showLoading ? (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ) : null;
  }

  // Don't render children if authentication requirements aren't met
  if (requireAuth && !session) {
    return null;
  }

  if (requiredRole) {
    const roleHierarchy = {
      ADMIN: 4,
      TEACHER: 3,
      PARENT: 2,
      STUDENT: 1,
    };

    const userRoleLevel = roleHierarchy[session?.user?.role as keyof typeof roleHierarchy] || 0;
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
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="ADMIN" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function TeacherRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="TEACHER" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function ParentRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="PARENT" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function StudentRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="STUDENT" {...props}>
      {children}
    </ProtectedRoute>
  );
}