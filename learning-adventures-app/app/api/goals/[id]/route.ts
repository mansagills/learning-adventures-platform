import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/goals/[id] - Update a goal
export async function PUT(
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

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.learningGoal.findUnique({
      where: { id: goalId },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update goal
    const updatedGoal = await prisma.learningGoal.update({
      where: { id: goalId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.targetValue && { targetValue: parseInt(body.targetValue) }),
        ...(body.currentValue !== undefined && {
          currentValue: parseInt(body.currentValue),
        }),
        ...(body.deadline && { deadline: new Date(body.deadline) }),
        ...(body.status && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.color !== undefined && { color: body.color }),
      },
    });

    return NextResponse.json({ goal: updatedGoal });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(
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
      where: { id: goalId },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.learningGoal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
