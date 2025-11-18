/**
 * POST /api/courses/[courseId]/lessons/[lessonId]/complete
 *
 * Complete a lesson for the authenticated user.
 *
 * Request Body:
 * {
 *   score?: number,        // Score percentage (0-100)
 *   timeSpent?: number     // Time spent in seconds
 * }
 */

import { NextRequest } from 'next/server';
import { completeLesson } from '@/lib/courses';
import { requireAuth, ValidationError } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequestBody,
} from '@/lib/responses';

interface CompleteLessonBody {
  score?: number;
  timeSpent?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await requireAuth(request);
    const { lessonId } = params;

    // Parse request body (optional fields)
    let body: CompleteLessonBody = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional, use defaults
    }

    const { score, timeSpent = 0 } = body;

    // Validate score if provided
    if (score !== undefined && (score < 0 || score > 100)) {
      throw new ValidationError('Score must be between 0 and 100');
    }

    // Validate timeSpent if provided
    if (timeSpent < 0) {
      throw new ValidationError('Time spent cannot be negative');
    }

    const result = await completeLesson(user.id, lessonId, score, timeSpent);

    if (!result.success) {
      return errorResponse(
        result.error || 'Failed to complete lesson',
        'COMPLETE_LESSON_FAILED',
        400
      );
    }

    if (!result.passed) {
      // User failed the lesson - can retry
      return successResponse(
        {
          passed: false,
          message: result.error || 'Lesson not passed. Try again!',
          score,
        },
        200
      );
    }

    // Success - lesson completed and passed!
    return successResponse({
      passed: true,
      xpAwarded: result.xpAwarded,
      nextLessonUnlocked: result.nextLessonUnlocked,
      nextLesson: result.nextLesson,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      message: `Lesson completed! +${result.xpAwarded} XP`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
