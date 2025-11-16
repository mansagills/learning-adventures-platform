/**
 * GET /api/courses
 *
 * List all published courses with optional filtering and pagination.
 *
 * Query Parameters:
 * - subject: Filter by subject (math, science, etc.)
 * - difficulty: Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED)
 * - isPremium: Filter by premium status (true/false)
 * - search: Search in title/description
 * - sortBy: Sort field (title, difficulty, estimatedMinutes, totalXP, recent)
 * - sortDirection: Sort direction (asc, desc)
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 10)
 * - includeProgress: Include user progress (requires authentication)
 */

import { NextRequest } from 'next/server';
import {
  getCourses,
  getCoursesWithProgress,
  getPaginatedCourses,
  type CourseSortBy,
  type SortDirection,
} from '@/lib/courses';
import { getAuthenticatedUser } from '../lib/auth';
import {
  successResponse,
  handleApiError,
  getQueryParam,
  getQueryParamAsNumber,
  getQueryParamAsBoolean,
} from '../lib/responses';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Get user if authenticated
    const user = await getAuthenticatedUser(request);
    const userId = user?.id;

    // Parse query parameters
    const subject = getQueryParam(url, 'subject') || undefined;
    const difficulty = getQueryParam(url, 'difficulty') as any;
    const isPremium = getQueryParamAsBoolean(url, 'isPremium');
    const search = getQueryParam(url, 'search') || undefined;
    const sortBy = (getQueryParam(url, 'sortBy') || 'recent') as CourseSortBy;
    const sortDirection = (getQueryParam(url, 'sortDirection') ||
      'desc') as SortDirection;
    const page = getQueryParamAsNumber(url, 'page', 1);
    const pageSize = getQueryParamAsNumber(url, 'pageSize', 10);
    const includeProgress = getQueryParamAsBoolean(url, 'includeProgress', false);

    // Build filters
    const filters = {
      subject,
      difficulty,
      isPremium,
      searchQuery: search,
      isPublished: true,
    };

    // If pagination requested
    if (page && pageSize) {
      const result = await getPaginatedCourses(page, pageSize, filters, sortBy, sortDirection);
      return successResponse(result);
    }

    // If user progress requested and user is authenticated
    if (includeProgress && userId) {
      const courses = await getCoursesWithProgress(userId, filters);
      return successResponse({ courses });
    }

    // Default: return all courses
    const courses = await getCourses(filters, { includeLessons: true });
    return successResponse({ courses });
  } catch (error) {
    return handleApiError(error);
  }
}
