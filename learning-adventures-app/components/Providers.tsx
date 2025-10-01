'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { PermissionProvider } from '@/contexts/PermissionContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </SessionProvider>
  );
}