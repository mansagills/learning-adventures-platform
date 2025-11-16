/**
 * GET /api/courses/[courseId]
 *
 * Get detailed information about a specific course.
 *
 * Query Parameters:
 * - includeProgress: Include user progress (requires authentication)
 */

import { NextRequest } from 'next/server';
import { getCourseById, getCourseWithProgress } from '@/lib/courses';
import { getAuthenticatedUser } from '../../lib/auth';
import {
  successResponse,
  errorResponse,
  handleApiError,
  getQueryParamAsBoolean,
} from '../../lib/responses';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const { searchParams } = new URL(request.url);

    // Get user if authenticated
    const user = await getAuthenticatedUser(request);
    const userId = user?.id;

    const includeProgress = getQueryParamAsBoolean(searchParams, 'includeProgress', false);

    // If user progress requested and user is authenticated
    if (includeProgress && userId) {
      const course = await getCourseWithProgress(courseId, userId);

      if (!course) {
        return errorResponse('Course not found', 'NOT_FOUND', 404);
      }

      return successResponse({ course });
    }

    // Default: return course without progress
    const course = await getCourseById(courseId, { includeLessons: true });

    if (!course) {
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    return successResponse({ course });
  } catch (error) {
    return handleApiError(error);
  }
}
