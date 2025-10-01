'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminPanel from '@/components/admin/AdminPanel';

interface InternalLayoutProps {
  children: ReactNode;
}

export default function InternalLayout({ children }: InternalLayoutProps) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="flex min-h-screen bg-gray-50">
        <AdminPanel />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
