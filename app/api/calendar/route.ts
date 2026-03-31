import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/calendar - Get calendar events for a date range
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const includeGoals = searchParams.get('includeGoals') === 'true';

    const where: any = {
      userId: session.user.id,
    };

    // Date range filter
    if (startDate && endDate) {
      where.AND = [
        { startTime: { gte: new Date(startDate) } },
        { startTime: { lte: new Date(endDate) } },
      ];
    }

    // Event type filter
    if (eventType) {
      where.eventType = eventType;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    // Optionally include goal deadlines as events
    let goalEvents: any[] = [];
    if (includeGoals) {
      const goals = await prisma.learningGoal.findMany({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
          deadline: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
        },
      });

      goalEvents = goals.map((goal) => ({
        id: `goal-${goal.id}`,
        title: `Goal: ${goal.title}`,
        description: goal.description,
        eventType: 'GOAL_DEADLINE',
        startTime: goal.deadline,
        endTime: goal.deadline,
        allDay: true,
        color: goal.color,
        icon: goal.icon || '🎯',
        goalId: goal.id,
        isGoal: true, // Flag to differentiate from regular events
      }));
    }

    return NextResponse.json({
      events: [...events, ...goalEvents],
      count: events.length + goalEvents.length,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Create a new calendar event
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
      eventType,
      category,
      startTime,
      endTime,
      allDay,
      adventureId,
      goalId,
      classroomId,
      isRecurring,
      recurrenceRule,
      recurrenceEnd,
      reminderMinutes,
      color,
      icon,
      priority,
      location,
      url,
    } = body;

    // Validation
    if (!title || !eventType || !startTime || !endTime) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: title, eventType, startTime, endTime',
        },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end < start) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        title,
        description,
        eventType,
        category,
        startTime: start,
        endTime: end,
        allDay: allDay || false,
        adventureId,
        goalId,
        classroomId,
        isRecurring: isRecurring || false,
        recurrenceRule,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        reminderMinutes: reminderMinutes || [],
        color,
        icon,
        priority: priority || 0,
        location,
        url,
        status: 'SCHEDULED',
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
