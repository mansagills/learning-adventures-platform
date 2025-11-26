import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/calendar/[id] - Update a calendar event
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (existingEvent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate date range if updating times
    if (body.startTime && body.endTime) {
      const start = new Date(body.startTime);
      const end = new Date(body.endTime);
      if (end < start) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }

    // Update event
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.eventType && { eventType: body.eventType }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.startTime && { startTime: new Date(body.startTime) }),
        ...(body.endTime && { endTime: new Date(body.endTime) }),
        ...(body.allDay !== undefined && { allDay: body.allDay }),
        ...(body.adventureId !== undefined && { adventureId: body.adventureId }),
        ...(body.goalId !== undefined && { goalId: body.goalId }),
        ...(body.classroomId !== undefined && { classroomId: body.classroomId }),
        ...(body.isRecurring !== undefined && { isRecurring: body.isRecurring }),
        ...(body.recurrenceRule !== undefined && { recurrenceRule: body.recurrenceRule }),
        ...(body.recurrenceEnd && { recurrenceEnd: new Date(body.recurrenceEnd) }),
        ...(body.reminderMinutes !== undefined && { reminderMinutes: body.reminderMinutes }),
        ...(body.status && { status: body.status }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.url !== undefined && { url: body.url })
      }
    });

    return NextResponse.json({ event: updatedEvent });

  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/[id] - Delete a calendar event
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (existingEvent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}
