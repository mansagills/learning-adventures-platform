'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Icon from '../Icon';
import { LearningGoal } from '@/hooks/useGoals';

interface GoalCardProps {
  goal: LearningGoal;
  onUpdate?: (goalId: string, updates: Partial<LearningGoal>) => Promise<void>;
  onDelete?: (goalId: string) => Promise<void>;
  onComplete?: (goalId: string) => Promise<void>;
  onUpdateProgress?: (goalId: string, increment: number) => Promise<void>;
}

const goalTypeConfig = {
  DAILY: { label: 'Daily', color: 'bg-blue-500', icon: '📅' },
  WEEKLY: { label: 'Weekly', color: 'bg-purple-500', icon: '📆' },
  MONTHLY: { label: 'Monthly', color: 'bg-pink-500', icon: '🗓️' },
  CUSTOM: { label: 'Custom', color: 'bg-gray-500', icon: '🎯' },
};

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-50' },
  COMPLETED: {
    label: 'Completed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  EXPIRED: { label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' },
  PAUSED: {
    label: 'Paused',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export default function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onComplete,
  onUpdateProgress,
}: GoalCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const typeConfig = goalTypeConfig[goal.type];
  const status = statusConfig[goal.status];
  const progressPercent = goal.progressPercent || 0;
  const isComplete = goal.isComplete || goal.status === 'COMPLETED';

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    setLoading(true);
    try {
      await onComplete(goal.id);
    } catch (error) {
      console.error('Failed to complete goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm('Are you sure you want to delete this goal?'))
      return;
    setLoading(true);
    try {
      await onDelete(goal.id);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const deadlineText = formatDeadline(goal.deadline);

  return (
    <div
      className={cn(
        'relative bg-white border-2 rounded-xl p-5 transition-all hover:shadow-md',
        isComplete ? 'border-green-300 bg-green-50/30' : 'border-gray-200',
        goal.priority === 2 ? 'border-l-4 border-l-red-500' : '',
        goal.priority === 1 ? 'border-l-4 border-l-yellow-500' : ''
      )}
      style={{ borderColor: goal.color || undefined }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-3xl">{goal.icon || typeConfig.icon}</span>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-lg text-ink-800">{goal.title}</h3>
              {isComplete && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <Icon name="check" size={12} className="mr-1" />
                  Complete
                </span>
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={cn(
                  'px-2 py-1 rounded-full font-medium',
                  typeConfig.color,
                  'text-white'
                )}
              >
                {typeConfig.label}
              </span>
              {goal.category && (
                <span className="px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700 capitalize">
                  {goal.category}
                </span>
              )}
              {deadlineText && (
                <span
                  className={cn(
                    'px-2 py-1 rounded-full font-medium flex items-center space-x-1',
                    deadlineText.includes('Overdue')
                      ? 'bg-red-100 text-red-700'
                      : deadlineText.includes('today')
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                  )}
                >
                  <Icon name="clock" size={12} />
                  <span>{deadlineText}</span>
                </span>
              )}
              {goal.streakCount > 0 && (
                <span className="px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700 flex items-center space-x-1">
                  <span>🔥</span>
                  <span>{goal.streakCount} streak</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <Icon name="more-vertical" size={18} className="text-gray-600" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              {goal.status === 'ACTIVE' && !isComplete && onComplete && (
                <button
                  onClick={handleComplete}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
                  disabled={loading}
                >
                  <Icon name="check" size={16} className="text-green-600" />
                  <span>Mark Complete</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm text-red-600"
                  disabled={loading}
                >
                  <Icon name="delete" size={16} />
                  <span>Delete Goal</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="font-bold text-brand-600">
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 rounded-full',
              isComplete
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-brand-500 to-accent-500'
            )}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{progressPercent}% complete</span>
          {!isComplete && goal.targetValue > goal.currentValue && (
            <span>
              {goal.targetValue - goal.currentValue} {goal.unit} to go
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions (for active goals) */}
      {goal.status === 'ACTIVE' && !isComplete && onUpdateProgress && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Quick Update
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateProgress(goal.id, 1)}
                className="px-3 py-1 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                disabled={loading}
              >
                +1
              </button>
              {goal.targetValue >= 5 && (
                <button
                  onClick={() => onUpdateProgress(goal.id, 5)}
                  className="px-3 py-1 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  +5
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completion Badge */}
      {isComplete && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <span className="text-2xl">🎉</span>
            <span className="text-sm font-semibold">Goal Achieved!</span>
            {goal.completedAt && (
              <span className="text-xs text-green-600">
                ({new Date(goal.completedAt).toLocaleDateString()})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
