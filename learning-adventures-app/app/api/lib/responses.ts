/**
 * API Response Helpers
 *
 * Standardized response formats for API endpoints.
 */

import { NextResponse } from 'next/server';
import { AuthenticationError, AuthorizationError, ValidationError } from '@/app/api/lib/auth';

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
  message: string,
  code: string = 'ERROR',
  status: number = 500,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
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
    return errorResponse(error.message, 'AUTHENTICATION_ERROR', 401);
  }

  if (error instanceof AuthorizationError) {
    return errorResponse(error.message, 'AUTHORIZATION_ERROR', 403);
  }

  if (error instanceof ValidationError) {
    return errorResponse(error.message, 'VALIDATION_ERROR', 400);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 'INTERNAL_ERROR', 500);
  }

  return errorResponse('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
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
