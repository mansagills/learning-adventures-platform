import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/test-games/[id]/feedback - Add feedback to game
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser || apiUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackType, message, issueSeverity } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.gameFeedback.create({
      data: {
        testGameId: params.id,
        userId: apiUser.id,
        userName: apiUser.name || apiUser.email || 'Unknown',
        feedbackType,
        message,
        issueSeverity,
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
