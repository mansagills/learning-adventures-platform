'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Icon from '@/components/Icon';
import { useCalendar, getWeekStart, getWeekEnd } from '@/hooks/useCalendar';
import { cn } from '@/lib/utils';

function CalendarDashboardContent() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);

  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent
  } = useCalendar({
    startDate: weekStart,
    endDate: weekEnd,
    includeGoals: true
  });

  const eventTypeColors: Record<string, string> = {
    LEARNING_SESSION: 'bg-blue-500',
    ASSIGNMENT: 'bg-orange-500',
    GOAL_DEADLINE: 'bg-purple-500',
    ACHIEVEMENT: 'bg-green-500',
    LIVE_CLASS: 'bg-red-500',
    ASSESSMENT: 'bg-yellow-500',
    REMINDER: 'bg-gray-500',
    CUSTOM: 'bg-pink-500'
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group events by day
  const getEventsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-ink-800">Calendar</h1>
              <p className="text-gray-600 mt-1">Schedule and track your learning activities</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-semibold"
            >
              <Icon name="add" size={20} />
              <span>New Event</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="chevron-left" size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="chevron-right" size={20} />
              </button>
              <h2 className="text-xl font-semibold text-ink-800">
                {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {events.length} event{events.length !== 1 ? 's' : ''} this week
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Icon name="alert" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading calendar</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Week View Grid */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map(date => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'p-4 text-center border-r border-gray-200 last:border-r-0',
                    isToday && 'bg-brand-50'
                  )}
                >
                  <div className="text-xs font-medium text-gray-600 uppercase">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={cn(
                    'text-2xl font-bold mt-1',
                    isToday ? 'text-brand-600' : 'text-ink-800'
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {weekDays.map(date => {
              const dayEvents = getEventsForDay(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'min-h-[300px] p-2',
                    isToday && 'bg-brand-50/30'
                  )}
                >
                  <div className="space-y-1">
                    {dayEvents.map(event => {
                      const color = event.color || eventTypeColors[event.eventType] || 'bg-gray-500';

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            'p-2 rounded text-white text-xs cursor-pointer hover:opacity-90 transition-opacity',
                            color
                          )}
                          onClick={() => {
                            // TODO: Open event details modal
                            console.log('Event clicked:', event);
                          }}
                        >
                          <div className="font-medium truncate flex items-center space-x-1">
                            {event.icon && <span>{event.icon}</span>}
                            <span>{event.title}</span>
                          </div>
                          {!event.allDay && (
                            <div className="text-white/80 mt-1">
                              {formatTime(event.startTime)}
                            </div>
                          )}
                          {event.isGoal && (
                            <div className="text-xs text-white/80 mt-1">Goal Deadline</div>
                          )}
                        </div>
                      );
                    })}
                    {dayEvents.length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-4">
                        No events
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Legend */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(eventTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center space-x-2">
                <div className={cn('w-3 h-3 rounded', color)} />
                <span className="text-xs text-gray-700 capitalize">
                  {type.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="calendar" size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink-800">{events.length}</div>
                <div className="text-sm text-gray-600">Events This Week</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="check" size={24} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink-800">
                  {events.filter(e => e.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="target" size={24} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink-800">
                  {events.filter(e => e.eventType === 'GOAL_DEADLINE').length}
                </div>
                <div className="text-sm text-gray-600">Goal Deadlines</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Create Event Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink-800">Create Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Full event creation form coming soon!</p>
              <p className="text-sm text-gray-500">
                For now, you can view your scheduled events and goal deadlines on the calendar.
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarDashboardContent />
    </ProtectedRoute>
  );
}
