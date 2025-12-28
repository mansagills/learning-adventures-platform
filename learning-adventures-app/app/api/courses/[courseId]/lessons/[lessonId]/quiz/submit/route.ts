/**
 * Quiz Submission API Route
 *
 * POST /api/courses/[courseId]/lessons/[lessonId]/quiz/submit
 * Validates quiz answers and returns results with hints for incorrect answers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  validateQuizAnswers,
  type QuizData,
} from '@/lib/courses/quizHelpers';
import { completeLesson } from '@/lib/courses/progressHelpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { answers, attemptNumber = 0 } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Get lesson with quiz data
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: params.lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (!lesson.quizData) {
      return NextResponse.json(
        { error: 'No quiz found for this lesson' },
        { status: 404 }
      );
    }

    // Validate quiz structure
    const quizData = lesson.quizData as unknown as QuizData;
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return NextResponse.json(
        { error: 'Invalid quiz data structure' },
        { status: 500 }
      );
    }

    // Validate answers and get results
    const result = await validateQuizAnswers(
      quizData,
      answers,
      attemptNumber
    );

    // Award XP if passed (progression not blocked by quiz failures)
    // Users can still complete the lesson even if they don't pass the quiz
    if (result.passed) {
      const completionResult = await completeLesson(
        session.user.id,
        params.lessonId,
        result.score
      );

      return NextResponse.json({
        ...result,
        xpAwarded: completionResult.xpAwarded,
        nextLessonUnlocked: completionResult.nextLessonUnlocked,
        nextLesson: completionResult.nextLesson,
        leveledUp: completionResult.leveledUp,
        newLevel: completionResult.newLevel,
      });
    }

    // Return results with hints for failed quiz
    return NextResponse.json(result);
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process quiz submission',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
