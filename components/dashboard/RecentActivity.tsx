'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import Icon from '../Icon';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'completed' | 'achievement' | 'started' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    category?: string;
    adventureId?: string;
    achievementIcon?: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
  maxItems?: number;
}

export default function RecentActivity({
  activities,
  isLoading = false,
  maxItems = 10,
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: Activity['type']): React.ReactNode => {
    switch (type) {
      case 'completed':
        return <Icon name="check" className="text-success" />;
      case 'achievement':
        return <Icon name="trophy" className="text-warning" />;
      case 'started':
        return <Icon name="rocket" className="text-brand-500" />;
      case 'milestone':
        return <Icon name="star" className="text-accent-500" />;
      default:
        return <Icon name="info" className="text-gray-400" />;
    }
  };

  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'completed':
        return 'bg-success/10 border-success/20';
      case 'achievement':
        return 'bg-warning/10 border-warning/20';
      case 'started':
        return 'bg-brand-500/10 border-brand-500/20';
      case 'milestone':
        return 'bg-accent-500/10 border-accent-500/20';
      default:
        return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (displayedActivities.length === 0 && !isLoading) {
    return (
      <DashboardCard title="Recent Activity" icon={<Icon name="clock" />}>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Icon name="info" className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Activity Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start exploring adventures to see your activity here!
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Icon name="explore" />
            Explore Adventures
          </Link>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Recent Activity"
      icon={<Icon name="clock" />}
      action={
        activities.length > maxItems ? (
          <Link
            href={'/dashboard/activity' as any}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            View All
          </Link>
        ) : undefined
      }
      isLoading={isLoading}
    >
      <div className="space-y-3">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${getActivityColor(activity.type)}`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>

                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {activity.metadata.score !== undefined && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          <Icon name="star" className="text-warning" />
                          {activity.metadata.score}%
                        </span>
                      )}
                      {activity.metadata.category && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          <Icon name="explore" className="text-brand-500" />
                          {activity.metadata.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>

            {/* Action Link (if adventure) */}
            {activity.metadata?.adventureId && (
              <Link
                href={`/catalog?adventure=${activity.metadata.adventureId}`}
                className="flex-shrink-0 text-brand-500 hover:text-brand-600 transition-colors"
              >
                <Icon name="arrow-right" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      {!isLoading && displayedActivities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Showing {displayedActivities.length} of {activities.length}{' '}
              activities
            </span>
            {activities.length > displayedActivities.length && (
              <Link
                href={'/dashboard/activity' as any}
                className="text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
              >
                View All
                <Icon name="arrow-right" className="text-sm" />
              </Link>
            )}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
