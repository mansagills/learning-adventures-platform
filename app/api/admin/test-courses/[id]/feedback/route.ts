import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/test-courses/[id]/feedback - Add feedback to a course
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser || apiUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackType, message, lessonIndex, issueSeverity, screenshotUrl } =
      await req.json();

    // Validate feedback type
    const validTypes = [
      'BUG',
      'SUGGESTION',
      'PRAISE',
      'ACCESSIBILITY_ISSUE',
      'CONTENT_ERROR',
      'GENERAL',
    ];
    if (!validTypes.includes(feedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.courseFeedback.create({
      data: {
        testCourseId: params.id,
        userId: apiUser.id,
        userName: apiUser.name || apiUser.email || 'Unknown',
        feedbackType,
        message,
        lessonIndex,
        issueSeverity,
        screenshotUrl,
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error adding feedback:', error);
    return NextResponse.json(
      { error: 'Failed to add feedback' },
      { status: 500 }
    );
  }
}
