import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated') {
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

/**
 * Returns the authenticated user's Prisma profile, or null if not logged in.
 * Use in Server Components and Route Handlers.
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gradeLevel: true,
      subjects: true,
      image: true,
      hasCompletedOnboarding: true,
    },
  });

  return profile;
}

/**
 * Like getAuthenticatedUser but throws AuthenticationError if not logged in.
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) throw new AuthenticationError();
  return user;
}
