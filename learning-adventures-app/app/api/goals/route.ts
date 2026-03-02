import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/goals - Get all goals for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const goals = await prisma.learningGoal.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progressPercent:
        goal.targetValue > 0
          ? Math.round((goal.currentValue / goal.targetValue) * 100)
          : 0,
      isComplete: goal.currentValue >= goal.targetValue,
      isExpired:
        goal.deadline &&
        new Date(goal.deadline) < new Date() &&
        goal.status === 'ACTIVE',
    }));

    return NextResponse.json({
      goals: goalsWithProgress,
      count: goals.length,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      category,
      targetType,
      targetValue,
      unit,
      deadline,
      icon,
      color,
      priority,
    } = body;

    // Validation
    if (!title || !type || !targetType || !targetValue || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (targetValue <= 0) {
      return NextResponse.json(
        { error: 'Target value must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate deadline based on goal type if not provided
    let goalDeadline = deadline ? new Date(deadline) : undefined;

    if (!goalDeadline && type !== 'CUSTOM') {
      const now = new Date();
      if (type === 'DAILY') {
        goalDeadline = new Date(now);
        goalDeadline.setHours(23, 59, 59, 999);
      } else if (type === 'WEEKLY') {
        goalDeadline = new Date(now);
        goalDeadline.setDate(now.getDate() + (7 - now.getDay())); // End of week (Sunday)
        goalDeadline.setHours(23, 59, 59, 999);
      } else if (type === 'MONTHLY') {
        goalDeadline = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        goalDeadline.setHours(23, 59, 59, 999);
      }
    }

    const goal = await prisma.learningGoal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        type,
        category,
        targetType,
        targetValue: parseInt(targetValue),
        currentValue: 0,
        unit,
        deadline: goalDeadline,
        icon: icon || null,
        color: color || null,
        priority: priority || 0,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
