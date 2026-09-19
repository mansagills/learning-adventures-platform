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
// No Supabase env (e.g. fresh clone / worktree without .env.local): report
// signed-out instead of crashing the whole client tree. Mirrors the guard in
// lib/supabase/middleware.ts.
const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const supabase = hasSupabaseEnv ? createClient() : null;

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }
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
          setUser(fallbackUser(supabaseUser));
          setStatus('authenticated');
        }
      } catch {
        setUser(fallbackUser(supabaseUser));
        setStatus('authenticated');
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
