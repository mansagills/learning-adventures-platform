/**
 * GET /api/users/dashboard
 *
 * Get comprehensive dashboard data for the authenticated user.
 *
 * Returns:
 * - In-progress courses
 * - Completed courses
 * - User statistics
 * - Level information
 * - Current streak
 * - Recent XP (last 7 days)
 */

import { NextRequest } from 'next/server';
import { getUserDashboardData } from '@/lib/courses';
import { requireAuth } from '../../lib/auth';
import { successResponse, handleApiError } from '../../lib/responses';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const dashboardData = await getUserDashboardData(user.id);

    return successResponse(dashboardData);
  } catch (error) {
    return handleApiError(error);
  }
}
