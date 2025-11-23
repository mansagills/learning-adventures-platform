import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/goals/[id]/progress - Update goal progress
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
    const body = await request.json();
    const { increment, value } = body;

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

    if (existingGoal.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot update progress on non-active goal' },
        { status: 400 }
      );
    }

    // Calculate new current value
    let newCurrentValue = existingGoal.currentValue;

    if (increment !== undefined) {
      newCurrentValue += parseInt(increment);
    } else if (value !== undefined) {
      newCurrentValue = parseInt(value);
    } else {
      return NextResponse.json(
        { error: 'Must provide either increment or value' },
        { status: 400 }
      );
    }

    // Ensure it doesn't go negative
    newCurrentValue = Math.max(0, newCurrentValue);

    // Check if goal is now complete
    const isComplete = newCurrentValue >= existingGoal.targetValue;
    const updateData: any = {
      currentValue: newCurrentValue
    };

    if (isComplete && existingGoal.status === 'ACTIVE') {
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
      updateData.streakCount = existingGoal.streakCount + 1;
    }

    const updatedGoal = await prisma.learningGoal.update({
      where: { id: goalId },
      data: updateData
    });

    return NextResponse.json({
      goal: updatedGoal,
      isComplete,
      message: isComplete ? '🎉 Goal completed!' : 'Progress updated'
    });

  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
}
