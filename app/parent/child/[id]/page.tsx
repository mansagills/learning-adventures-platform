'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useStudentDetail } from '@/hooks/useOversight';
import { formatDistanceToNow } from 'date-fns';
import ProgressReport from '@/components/oversight/ProgressReport';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon name={icon} size={24} className={iconColor} />
        </div>
      </div>
      <p className="text-sm text-ink-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-ink-800">{value}</p>
      {subtitle && <p className="text-xs text-ink-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function ChildDetailView() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const { student: child, loading, error } = useStudentDetail(childId);
  const [showReport, setShowReport] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-ink-500">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="info" size={24} className="text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Unable to Load Progress
            </h3>
          </div>
          <p className="text-red-800 mb-4">{error || 'Child not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
            >
              <Icon name="arrow-left" size={20} />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <Icon name="printer" size={16} />
              <span>Generate Report</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {child.name}'s Progress
              </h1>
              <div className="flex items-center space-x-4 text-brand-100">
                <span>Grade {child.gradeLevel}</span>
                <span>•</span>
                <span>{child.email}</span>
              </div>
            </div>
            <div className="text-center bg-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-6xl font-bold mb-1">
                {child.stats.completionRate}%
              </div>
              <div className="text-sm text-brand-100">Overall Progress</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Adventures Completed"
            value={child.stats.completedAdventures}
            subtitle={`of ${child.stats.totalAdventures} started`}
            icon="check"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatCard
            label="Average Score"
            value={`${child.stats.averageScore}%`}
            icon="star"
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatCard
            label="Learning Time"
            value={formatTime(child.stats.totalTimeSpent)}
            subtitle="total time invested"
            icon="clock"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatCard
            label="Current Streak"
            value={`${child.stats.currentStreak} days`}
            subtitle="Keep it up! 🔥"
            icon="chart"
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-ink-800 mb-6 flex items-center space-x-2">
                <Icon name="book" size={24} className="text-brand-600" />
                <span>Progress by Subject</span>
              </h2>
              {Object.keys(child.stats.byCategory).length > 0 ? (
                <div className="space-y-5">
                  {Object.entries(child.stats.byCategory).map(
                    ([category, stats]) => {
                      const completion =
                        stats.total > 0
                          ? Math.round((stats.completed / stats.total) * 100)
                          : 0;
                      const avgScore =
                        stats.completed > 0
                          ? Math.round(stats.totalScore / stats.completed)
                          : 0;

                      return (
                        <div
                          key={category}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-ink-800 capitalize">
                              {category}
                            </h3>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-ink-700">
                                  {stats.completed}/{stats.total} completed
                                </p>
                                <p className="text-xs text-amber-600">
                                  {avgScore}% average score
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                completion >= 75
                                  ? 'bg-green-500'
                                  : completion >= 50
                                    ? 'bg-blue-500'
                                    : completion >= 25
                                      ? 'bg-amber-500'
                                      : 'bg-gray-400'
                              }`}
                              style={{ width: `${completion}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-600 font-medium">
                              {completion}% complete
                            </span>
                            <span className="text-ink-500">
                              {formatTime(stats.totalTime)} spent
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon
                    name="book"
                    size={48}
                    className="text-ink-300 mx-auto mb-3"
                  />
                  <p className="text-ink-500">No learning activities yet</p>
                  <p className="text-sm text-ink-400 mt-1">
                    Encourage your child to start an adventure!
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-ink-800 mb-6 flex items-center space-x-2">
                <Icon name="clock" size={24} className="text-brand-600" />
                <span>Recent Activity</span>
              </h2>
              {child.recentActivity && child.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {child.recentActivity.slice(0, 8).map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.status === 'COMPLETED'
                            ? 'bg-green-100'
                            : activity.status === 'IN_PROGRESS'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          name={
                            activity.status === 'COMPLETED' ? 'check' : 'play'
                          }
                          size={18}
                          className={
                            activity.status === 'COMPLETED'
                              ? 'text-green-600'
                              : activity.status === 'IN_PROGRESS'
                                ? 'text-blue-600'
                                : 'text-gray-600'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-800 mb-1">
                          {activity.adventureId}
                        </p>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-ink-600 capitalize">
                            {activity.category}
                          </span>
                          {activity.status === 'COMPLETED' &&
                            activity.score > 0 && (
                              <>
                                <span className="text-ink-300">•</span>
                                <span className="text-amber-600 font-medium">
                                  {activity.score}% score
                                </span>
                              </>
                            )}
                          <span className="text-ink-300">•</span>
                          <span className="text-ink-400">
                            {formatDistanceToNow(
                              new Date(activity.lastAccessed),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon
                    name="clock"
                    size={48}
                    className="text-ink-300 mx-auto mb-3"
                  />
                  <p className="text-ink-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Badge */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg p-6 text-white">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-5xl font-bold">
                    {child.stats.currentLevel}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Level {child.stats.currentLevel}
                </h3>
                <p className="text-brand-100 text-sm mb-4">
                  {child.stats.totalXP.toLocaleString()} XP earned
                </p>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center space-x-2 text-2xl">
                    <span>🔥</span>
                    <span className="font-bold">
                      {child.stats.currentStreak}
                    </span>
                    <span className="text-sm text-brand-100">day streak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center space-x-2">
                <Icon name="star" size={20} className="text-amber-600" />
                <span>Achievements</span>
              </h3>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-amber-600 mb-1">
                  {child.achievements.length}
                </p>
                <p className="text-sm text-ink-500">Badges Earned</p>
              </div>
              {child.achievements.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {child.achievements.slice(0, 6).map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg"
                    >
                      <span className="text-3xl">
                        {achievement.icon || '🏆'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">
                          {achievement.achievementId}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatDistanceToNow(new Date(achievement.earnedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center space-x-2">
                <Icon name="check" size={20} className="text-green-600" />
                <span>Learning Goals</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {child.stats.activeGoals}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Active</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {child.stats.completedGoals}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Completed</p>
                </div>
              </div>
              {child.goals &&
                child.goals.filter((g: any) => g.status === 'ACTIVE').length >
                  0 && (
                  <div className="space-y-3">
                    {child.goals
                      .filter((g: any) => g.status === 'ACTIVE')
                      .slice(0, 4)
                      .map((goal: any) => {
                        const progress = Math.round(
                          (goal.currentValue / goal.targetValue) * 100
                        );
                        return (
                          <div
                            key={goal.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <span>{goal.icon || '🎯'}</span>
                              <p className="text-sm font-semibold text-ink-800 flex-1">
                                {goal.title}
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div
                                className="bg-brand-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-ink-500">
                              {goal.currentValue}/{goal.targetValue} {goal.unit}{' '}
                              ({progress}%)
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Progress Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink-800">
                Progress Report
              </h2>
              <button
                onClick={() => setShowReport(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="close" size={20} className="text-ink-600" />
              </button>
            </div>
            <div className="p-4">
              <ProgressReport student={child} reportType="detailed" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChildDetailPage() {
  return (
    <ProtectedRoute requiredRole="PARENT">
      <ChildDetailView />
    </ProtectedRoute>
  );
}
