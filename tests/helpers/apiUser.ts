import { NextResponse } from 'next/server';
import type { ApiUser } from '@/lib/api-auth';

/**
 * Helpers for mocking `getApiUser()` from @/lib/api-auth.
 *
 * API routes used to authenticate with NextAuth's getServerSession, and these
 * suites mocked `next-auth/next` to match. The app has since moved to Supabase
 * (see lib/api-auth.ts), and `next-auth` is no longer a dependency at all — so
 * those mocks stopped resolving and took the whole suite down with them, even
 * though what they actually assert (zip-slip, path traversal, route
 * authorization) is unrelated to which auth library is in use.
 *
 * These two helpers build the exact shapes getApiUser() resolves to, so the
 * tests can keep testing the security behaviour they were written for.
 */

/** What getApiUser() returns for a signed-in user with the given role. */
export function authedAs(role: string, overrides: Partial<ApiUser> = {}) {
  return {
    apiUser: {
      supabaseId: 'test-supabase-id',
      email: 'test@example.com',
      id: 'test-user-id',
      name: 'Test User',
      role,
      gradeLevel: null,
      subjects: [],
      image: null,
      ...overrides,
    } satisfies ApiUser,
    error: null,
  };
}

/** What getApiUser() returns when nobody is signed in: the route's 401. */
export function unauthenticated() {
  return {
    apiUser: null,
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };
}
