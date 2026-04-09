'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  gradeLevel: string | null;
  subjects: string[];
}

interface UseAuthReturn {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

/**
 * Drop-in replacement for NextAuth's useSession().
 * Returns the same shape: { user, status }
 * Components can switch from useSession() to useAuth() with no other changes.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const supabase = createClient();

  useEffect(() => {
    // Fetch current session + profile on mount
    const loadUser = async (supabaseUser: User | null) => {
      if (!supabaseUser) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const profile = await res.json();
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            name: profile.name ?? supabaseUser.user_metadata?.full_name ?? null,
            image: profile.image ?? supabaseUser.user_metadata?.avatar_url ?? null,
            role: profile.role ?? 'STUDENT',
            gradeLevel: profile.gradeLevel ?? null,
            subjects: profile.subjects ?? [],
          });
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } catch {
        setUser(null);
        setStatus('unauthenticated');
      }
    };

    // Check initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => loadUser(u));

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, status };
}
