// NextAuth has been replaced by Supabase Auth.
// This stub exists to avoid breaking legacy imports during migration.
// Auth logic lives in: lib/supabase/, hooks/useAuth.ts, lib/api-auth.ts

export const authOptions = {};

// Stubs for legacy imports — redirect to lib/api-auth.ts for new code
export async function getAuthenticatedUser(..._args: any[]) {
  const { getApiUser } = await import('@/lib/api-auth');
  const { apiUser, error } = await getApiUser();
  if (error || !apiUser) throw new AuthenticationError();
  return apiUser;
}

export async function requireAuth(..._args: any[]) {
  return getAuthenticatedUser();
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Not authorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
