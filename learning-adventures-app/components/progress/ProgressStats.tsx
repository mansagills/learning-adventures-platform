'use client';

import Icon from '../Icon';
import { CircularProgress } from './ProgressIndicator';

interface ProgressStatsProps {
  stats: {
    totalAdventures: number;
    completed: number;
    inProgress: number;
    totalTimeSpent: number;
    averageScore: number;
    byCategory?: Record<string, {
      total: number;
      completed: number;
      averageScore: number;
    }>;
  };
  showCategories?: boolean;
}

export default function ProgressStats({ stats, showCategories = true }: ProgressStatsProps) {
  const completionRate = stats.totalAdventures > 0
    ? Math.round((stats.completed / stats.totalAdventures) * 100)
    : 0;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Adventures */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500">Total Adventures</p>
              <p className="text-3xl font-bold text-ink-800 mt-2">{stats.totalAdventures}</p>
            </div>
            <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
              <Icon name="book" size={24} className="text-brand-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500">Completed</p>
              <p className="text-3xl font-bold text-ink-800 mt-2">{stats.completed}</p>
              <p className="text-xs text-green-600 font-medium mt-1">{completionRate}% complete</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="check" size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500">Average Score</p>
              <p className="text-3xl font-bold text-ink-800 mt-2">{stats.averageScore}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="star" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500">Time Spent</p>
              <p className="text-3xl font-bold text-ink-800 mt-2">{formatTime(stats.totalTimeSpent)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="clock" size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-ink-800 mb-4">Overall Progress</h3>
        <div className="flex items-center justify-center">
          <CircularProgress
            percentage={completionRate}
            size={150}
            color="#4F46E5"
            showLabel={true}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-ink-800">{stats.completed}</p>
            <p className="text-sm text-ink-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-ink-800">{stats.inProgress}</p>
            <p className="text-sm text-ink-500">In Progress</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {showCategories && stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-ink-800 mb-4">Progress by Subject</h3>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([category, data]) => {
              const categoryCompletion = data.total > 0
                ? Math.round((data.completed / data.total) * 100)
                : 0;
              const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink-700">{categoryName}</span>
                    <span className="text-sm text-ink-500">
                      {data.completed}/{data.total} • {data.averageScore}% avg
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${categoryCompletion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
