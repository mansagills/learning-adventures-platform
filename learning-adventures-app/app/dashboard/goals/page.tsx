'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Icon from '@/components/Icon';
import { useActiveGoals } from '@/hooks/useGoals';
import GoalCard from '@/components/goals/GoalCard';
import CreateGoalModal from '@/components/goals/CreateGoalModal';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'daily' | 'weekly' | 'monthly' | 'custom';
type StatusFilter = 'all' | 'active' | 'completed';

function GoalsDashboardContent() {
  const { data: session } = useSession();
  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    updateProgress
  } = useActiveGoals();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    // Type filter
    if (filterType !== 'all' && goal.type.toLowerCase() !== filterType) {
      return false;
    }

    // Status filter
    if (statusFilter === 'active' && goal.status !== 'ACTIVE') {
      return false;
    }
    if (statusFilter === 'completed' && goal.status !== 'COMPLETED') {
      return false;
    }

    return true;
  });

  // Group goals by type
  const dailyGoals = filteredGoals.filter(g => g.type === 'DAILY');
  const weeklyGoals = filteredGoals.filter(g => g.type === 'WEEKLY');
  const monthlyGoals = filteredGoals.filter(g => g.type === 'MONTHLY');
  const customGoals = filteredGoals.filter(g => g.type === 'CUSTOM');

  // Statistics
  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.status === 'ACTIVE').length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const handleUpdateProgress = async (goalId: string, increment: number) => {
    try {
      await updateProgress(goalId, { increment });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Learning Goals</h1>
              <p className="text-white/90">
                Track your progress and achieve your learning objectives
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-brand-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
            >
              <Icon name="add" size={20} />
              <span>New Goal</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Total Goals</div>
              <div className="text-3xl font-bold">{totalGoals}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Active</div>
              <div className="text-3xl font-bold">{activeGoals}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Completed</div>
              <div className="text-3xl font-bold">{completedGoals}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Completion Rate</div>
              <div className="text-3xl font-bold">{completionRate}%</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'custom', label: 'Custom' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFilterType(type.value as FilterType)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      filterType === type.value
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value as StatusFilter)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      statusFilter === status.value
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Icon name="alert" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading goals</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="target" size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {statusFilter === 'completed' ? 'No completed goals yet' : 'No goals yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {statusFilter === 'completed'
                ? 'Complete some goals to see them here!'
                : 'Create your first learning goal to start tracking your progress and stay motivated!'}
            </p>
            {statusFilter !== 'completed' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-semibold"
              >
                <Icon name="add" size={20} />
                <span>Create Your First Goal</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Daily Goals */}
            {dailyGoals.length > 0 && filterType === 'all' && (
              <div>
                <h2 className="text-xl font-bold text-ink-800 mb-4 flex items-center space-x-2">
                  <span>📅</span>
                  <span>Daily Goals</span>
                  <span className="text-sm font-normal text-gray-500">({dailyGoals.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dailyGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={updateGoal}
                      onDelete={deleteGoal}
                      onComplete={completeGoal}
                      onUpdateProgress={handleUpdateProgress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Goals */}
            {weeklyGoals.length > 0 && filterType === 'all' && (
              <div>
                <h2 className="text-xl font-bold text-ink-800 mb-4 flex items-center space-x-2">
                  <span>📆</span>
                  <span>Weekly Goals</span>
                  <span className="text-sm font-normal text-gray-500">({weeklyGoals.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklyGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={updateGoal}
                      onDelete={deleteGoal}
                      onComplete={completeGoal}
                      onUpdateProgress={handleUpdateProgress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Goals */}
            {monthlyGoals.length > 0 && filterType === 'all' && (
              <div>
                <h2 className="text-xl font-bold text-ink-800 mb-4 flex items-center space-x-2">
                  <span>🗓️</span>
                  <span>Monthly Goals</span>
                  <span className="text-sm font-normal text-gray-500">({monthlyGoals.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={updateGoal}
                      onDelete={deleteGoal}
                      onComplete={completeGoal}
                      onUpdateProgress={handleUpdateProgress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Goals */}
            {customGoals.length > 0 && filterType === 'all' && (
              <div>
                <h2 className="text-xl font-bold text-ink-800 mb-4 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Custom Goals</span>
                  <span className="text-sm font-normal text-gray-500">({customGoals.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={updateGoal}
                      onDelete={deleteGoal}
                      onComplete={completeGoal}
                      onUpdateProgress={handleUpdateProgress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Filtered view (not grouped) */}
            {filterType !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                    onComplete={completeGoal}
                    onUpdateProgress={handleUpdateProgress}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createGoal}
      />
    </div>
  );
}

export default function GoalsDashboardPage() {
  return (
    <ProtectedRoute>
      <GoalsDashboardContent />
    </ProtectedRoute>
  );
}
