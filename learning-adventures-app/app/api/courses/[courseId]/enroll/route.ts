/**
 * POST /api/courses/[courseId]/enroll
 *
 * Enroll the authenticated user in a course.
 *
 * DELETE /api/courses/[courseId]/enroll
 *
 * Unenroll the authenticated user from a course.
 */

import { NextRequest } from 'next/server';
import {
  enrollInCourse,
  unenrollFromCourse,
  checkEnrollmentEligibility,
} from '@/lib/courses';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, handleApiError } from '../../../lib/responses';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await requireAuth(request);
    const { courseId } = params;

    // Check eligibility first
    const eligibility = await checkEnrollmentEligibility(user.id, courseId);

    if (!eligibility.canEnroll) {
      return errorResponse(
        eligibility.reason || 'Cannot enroll in this course',
        'ENROLLMENT_NOT_ALLOWED',
        403,
        {
          prerequisitesMet: eligibility.prerequisitesMet,
          missingPrerequisites: eligibility.missingPrerequisites,
          requiresPremium: eligibility.requiresPremium,
          hasPremiumAccess: eligibility.hasPremiumAccess,
          freeCourseLimit: eligibility.freeCourseLimit,
          freeCoursesEnrolled: eligibility.freeCoursesEnrolled,
        }
      );
    }

    // Enroll the user
    const result = await enrollInCourse(user.id, courseId);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to enroll', 'ENROLLMENT_FAILED', 500);
    }

    return successResponse(
      {
        enrollment: result.enrollment,
        message: 'Successfully enrolled in course',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await requireAuth(request);
    const { courseId } = params;

    const result = await unenrollFromCourse(user.id, courseId);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to unenroll', 'UNENROLL_FAILED', 500);
    }

    return successResponse({
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
