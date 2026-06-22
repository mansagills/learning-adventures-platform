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
  /**
   * - `authenticated`   — signed in and profile loaded
   * - `unauthenticated` — no valid session
   * - `error`           — signed in at Supabase, but the profile/DB lookup
   *                       failed (server error). Distinct from logged-out so
   *                       pages can show a real message instead of bouncing.
   */
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
}

/**
 * Drop-in replacement for NextAuth's useSession().
 * Returns the same shape: { user, status }
 * Components can switch from useSession() to useAuth() with no other changes.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'error'>('loading');
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
        } else if (res.status === 401) {
          // Session genuinely invalid server-side → logged out.
          setUser(null);
          setStatus('unauthenticated');
        } else {
          // We DO have a Supabase session, but the profile lookup failed
          // (e.g. 500 from a DB hiccup). Surface as 'error' so the UI can
          // tell the user instead of pretending they're logged out.
          setUser(null);
          setStatus('error');
        }
      } catch {
        // Network/unexpected failure while we have a session → error, not logout.
        setUser(null);
        setStatus('error');
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
