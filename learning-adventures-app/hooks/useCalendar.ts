import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  eventType: string;
  category: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  timeZone: string | null;
  adventureId: string | null;
  goalId: string | null;
  classroomId: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  recurrenceEnd: string | null;
  reminderMinutes: number[];
  status: string;
  completedAt: string | null;
  color: string | null;
  icon: string | null;
  priority: number;
  location: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  isGoal?: boolean; // For goal deadline events
}

interface EventsResponse {
  events: CalendarEvent[];
  count: number;
}

interface UseCalendarOptions {
  startDate?: Date;
  endDate?: Date;
  eventType?: string;
  includeGoals?: boolean;
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.startDate)
        params.append('startDate', options.startDate.toISOString());
      if (options.endDate)
        params.append('endDate', options.endDate.toISOString());
      if (options.eventType) params.append('eventType', options.eventType);
      if (options.includeGoals) params.append('includeGoals', 'true');

      const response = await fetch(`/api/calendar?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [
    session,
    options.startDate,
    options.endDate,
    options.eventType,
    options.includeGoals,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    eventType: string;
    category?: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    adventureId?: string;
    goalId?: string;
    classroomId?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
    recurrenceEnd?: Date;
    reminderMinutes?: number[];
    color?: string;
    icon?: string;
    priority?: number;
    location?: string;
    url?: string;
  }) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          startTime: eventData.startTime.toISOString(),
          endTime: eventData.endTime.toISOString(),
          recurrenceEnd: eventData.recurrenceEnd?.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      const data = await response.json();
      await fetchEvents(); // Refresh events list
      return data.event;
    } catch (err) {
      throw err;
    }
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }

      const data = await response.json();
      await fetchEvents(); // Refresh events list
      return data.event;
    } catch (err) {
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      await fetchEvents(); // Refresh events list
    } catch (err) {
      throw err;
    }
  };

  const completeEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete event');
      }

      const data = await response.json();
      await fetchEvents(); // Refresh events list
      return data.event;
    } catch (err) {
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
  };
}

// Helper functions for calendar navigation
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
