import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/test-games/[id]/feedback - Add feedback to game
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      feedbackType,
      message,
      issueSeverity
    } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.gameFeedback.create({
      data: {
        testGameId: params.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Unknown',
        feedbackType,
        message,
        issueSeverity
      }
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
