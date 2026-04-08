import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export interface ApiUser {
  supabaseId: string;
  email: string;
  id: string;       // Prisma User.id
  name: string | null;
  role: string;
  gradeLevel: string | null;
  subjects: string[];
  image: string | null;
}

/**
 * Call at the top of every authenticated API route.
 * Returns { apiUser } on success, or { error: NextResponse } with 401 on failure.
 *
 * Usage:
 *   const { apiUser, error } = await getApiUser();
 *   if (error) return error;
 */
export async function getApiUser(): Promise<
  { apiUser: ApiUser; error: null } | { apiUser: null; error: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      apiUser: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const profile = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      name: true,
      role: true,
      gradeLevel: true,
      subjects: true,
      image: true,
    },
  });

  if (!profile) {
    return {
      apiUser: null,
      error: NextResponse.json({ error: 'User profile not found' }, { status: 404 }),
    };
  }

  return {
    apiUser: {
      supabaseId: user.id,
      email: user.email ?? '',
      id: profile.id,
      name: profile.name,
      role: profile.role,
      gradeLevel: profile.gradeLevel,
      subjects: profile.subjects,
      image: profile.image,
    },
    error: null,
  };
}

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
