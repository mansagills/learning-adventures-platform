'use client';

import { createContext, ReactNode } from 'react';

interface AuthContextType {}

const AuthContext = createContext<AuthContextType>({});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}
