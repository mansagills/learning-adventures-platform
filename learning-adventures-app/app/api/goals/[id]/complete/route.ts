import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/goals/[id]/complete - Mark goal as complete
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.learningGoal.findUnique({
      where: { id: goalId }
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark as complete
    const updatedGoal = await prisma.learningGoal.update({
      where: { id: goalId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        currentValue: existingGoal.targetValue, // Ensure it's at target
        streakCount: existingGoal.streakCount + 1
      }
    });

    // TODO: Award achievement for goal completion
    // Could create an achievement here for completing goals

    return NextResponse.json({
      goal: updatedGoal,
      message: 'Goal completed! 🎉'
    });

  } catch (error) {
    console.error('Error completing goal:', error);
    return NextResponse.json(
      { error: 'Failed to complete goal' },
      { status: 500 }
    );
  }
}
