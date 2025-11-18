/**
 * API Authentication Helpers
 *
 * Utilities for authenticating API requests and getting the current user.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Get the authenticated user from the request
 */
export async function getAuthenticatedUser(request?: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request?: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  return user;
}

/**
 * Check if user has premium access
 * Note: Premium access logic would need to be implemented based on your subscription system
 */
export function hasPremiumAccess(user: { id: string }) {
  // TODO: Implement premium access check based on user subscriptions
  return false;
}

/**
 * Custom error classes
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Not authorized') {
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
