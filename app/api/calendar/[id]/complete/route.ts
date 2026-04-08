import { getApiUser } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/calendar/[id]/complete - Mark event as completed
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (existingEvent.userId !== apiUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark as complete
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      event: updatedEvent,
      message: 'Event marked as completed! ✓',
    });
  } catch (error) {
    console.error('Error completing event:', error);
    return NextResponse.json(
      { error: 'Failed to complete event' },
      { status: 500 }
    );
  }
}
