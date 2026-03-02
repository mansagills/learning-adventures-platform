/**
 * POST /api/courses/[courseId]/lessons/[lessonId]/start
 *
 * Start a lesson for the authenticated user.
 */

import { NextRequest } from 'next/server';
import { startLesson } from '@/lib/courses';
import { requireAuth } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/responses';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await requireAuth(request);
    const { lessonId } = params;

    const result = await startLesson(user.id, lessonId);

    if (!result.success) {
      return errorResponse(
        result.error || 'Failed to start lesson',
        'START_LESSON_FAILED',
        403
      );
    }

    return successResponse({
      progress: result.progress,
      message: 'Lesson started successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
