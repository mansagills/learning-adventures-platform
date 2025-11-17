/**
 * API Response Helpers
 *
 * Standardized response formats for API endpoints.
 */

import { NextResponse } from 'next/server';

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

/**
 * Success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Handle API errors with appropriate status codes
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AuthenticationError) {
    return errorResponse('AUTHENTICATION_ERROR', error.message, 401);
  }

  if (error instanceof AuthorizationError) {
    return errorResponse('AUTHORIZATION_ERROR', error.message, 403);
  }

  if (error instanceof ValidationError) {
    return errorResponse('VALIDATION_ERROR', error.message, 400);
  }

  if (error instanceof Error) {
    return errorResponse('INTERNAL_ERROR', error.message, 500);
  }

  return errorResponse('UNKNOWN_ERROR', 'An unexpected error occurred', 500);
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: Request,
  requiredFields: string[]
): Promise<T> {
  let body: any;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  return body as T;
}

/**
 * Get query parameter
 */
export function getQueryParam(url: URL, param: string): string | null {
  return url.searchParams.get(param);
}

/**
 * Get query parameter as number
 */
export function getQueryParamAsNumber(
  url: URL,
  param: string,
  defaultValue?: number
): number | undefined {
  const value = url.searchParams.get(param);
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new ValidationError(`Invalid number for parameter: ${param}`);
  }

  return parsed;
}

/**
 * Get query parameter as boolean
 */
export function getQueryParamAsBoolean(
  url: URL,
  param: string,
  defaultValue?: boolean
): boolean | undefined {
  const value = url.searchParams.get(param);
  if (!value) return defaultValue;

  return value === 'true' || value === '1';
}
