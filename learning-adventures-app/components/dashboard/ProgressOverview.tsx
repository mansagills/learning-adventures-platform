'use client';

import React from 'react';
import DashboardCard, { MetricCard } from './DashboardCard';
import ProgressChart from './ProgressChart';
import Icon from '../Icon';

interface ProgressData {
  totalAdventures: number;
  completedAdventures: number;
  timeSpent: number; // in minutes
  averageScore: number;
  streak: number;
  weeklyActivity: {
    day: string;
    count: number;
  }[];
  subjectProgress: {
    subject: string;
    completed: number;
    total: number;
    color: string;
  }[];
}

interface ProgressOverviewProps {
  data: ProgressData;
  isLoading?: boolean;
}

export default function ProgressOverview({
  data,
  isLoading = false,
}: ProgressOverviewProps) {
  const completionRate =
    data.totalAdventures > 0
      ? Math.round((data.completedAdventures / data.totalAdventures) * 100)
      : 0;

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Adventures Completed"
          value={data.completedAdventures}
          icon={<Icon name="check" className="text-success" />}
          trend={{ value: 12, direction: 'up' }}
          isLoading={isLoading}
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<Icon name="chart" className="text-brand-500" />}
          trend={{ value: 8, direction: 'up' }}
          isLoading={isLoading}
        />
        <MetricCard
          title="Time Learning"
          value={formatTime(data.timeSpent)}
          icon={<Icon name="clock" className="text-accent-500" />}
          trend={{ value: 15, direction: 'up' }}
          isLoading={isLoading}
        />
        <MetricCard
          title="Current Streak"
          value={`${data.streak} days`}
          icon={<Icon name="rocket" className="text-warning" />}
          trend={{ value: 3, direction: 'up' }}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <DashboardCard
          title="Weekly Activity"
          icon={<Icon name="chart" />}
          isLoading={isLoading}
        >
          <ProgressChart
            type="bar"
            data={data.weeklyActivity as any}
            height={250}
          />
        </DashboardCard>

        {/* Subject Progress Donut */}
        <DashboardCard
          title="Progress by Subject"
          icon={<Icon name="explore" />}
          isLoading={isLoading}
        >
          <ProgressChart
            type="pie"
            data={data.subjectProgress.map((s) => ({
              label: s.subject,
              value: s.completed,
              color: s.color,
            }))}
            height={250}
          />
        </DashboardCard>
      </div>

      {/* Subject Progress Bars */}
      <DashboardCard
        title="Subject Breakdown"
        icon={<Icon name="explore" />}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          {data.subjectProgress.map((subject) => (
            <div key={subject.subject}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {subject.subject}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {subject.completed} / {subject.total} (
                  {Math.round((subject.completed / subject.total) * 100)}%)
                </span>
              </div>
              <ProgressChart
                type="bar"
                data={[
                  {
                    label: subject.subject,
                    value: subject.completed,
                    max: subject.total,
                    color: subject.color,
                  },
                ]}
                height={30}
              />
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Overall Progress Summary */}
      <DashboardCard
        title="Overall Progress"
        variant="gradient"
        isLoading={isLoading}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-white mb-2">
              {data.completedAdventures} / {data.totalAdventures}
            </p>
            <p className="text-white/80">Adventures Completed</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white mb-2">
              {data.averageScore}%
            </p>
            <p className="text-white/80">Average Score</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressChart
            type="bar"
            data={[
              {
                label: 'Overall Progress',
                value: data.completedAdventures,
                max: data.totalAdventures,
                color: '#fff',
              },
            ]}
            height={40}
          />
        </div>
      </DashboardCard>
    </div>
  );
}
