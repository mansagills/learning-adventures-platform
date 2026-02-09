/**
 * Quiz Answer Reveal API Route
 *
 * POST /api/courses/[courseId]/lessons/[lessonId]/quiz/reveal
 * Reveals quiz answer in exchange for XP cost
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  revealAnswerWithXP,
  calculateRevealCost,
  type QuizData,
} from '@/lib/courses/quizHelpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { questionId, xpCost } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    // Get lesson with quiz data
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: params.lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (!lesson.quizData) {
      return NextResponse.json(
        { error: 'No quiz found for this lesson' },
        { status: 404 }
      );
    }

    const quizData = lesson.quizData as unknown as QuizData;
    const question = quizData.questions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Get user level to calculate cost
    const userLevel = await prisma.userLevel.findUnique({
      where: { userId: session.user.id },
      select: { currentLevel: true },
    });

    // Calculate XP cost if not provided
    const finalXpCost =
      xpCost ||
      calculateRevealCost(question.points, userLevel?.currentLevel || 1);

    // Deduct XP and reveal answer
    const result = await revealAnswerWithXP(session.user.id, finalXpCost);

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    // Return correct answer and explanation
    return NextResponse.json({
      success: true,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      xpCost: finalXpCost,
      xpRemaining: result.xpRemaining,
    });
  } catch (error) {
    console.error('Quiz reveal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reveal answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
