/**
 * GET /api/users/stats
 *
 * Get detailed statistics for the authenticated user.
 *
 * Returns:
 * - Total courses enrolled, in progress, completed
 * - Total XP earned
 * - Current and longest streak
 * - Average score
 * - Total time spent (minutes)
 * - Certificates earned
 */

import { NextRequest } from 'next/server';
import { getUserCourseStats } from '@/lib/courses';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/responses';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const stats = await getUserCourseStats(user.id);

    return successResponse({ stats });
  } catch (error) {
    return handleApiError(error);
  }
}
