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
  icon: string;
  iconColor: string;
  iconBg: string;
}

function StatCard({ label, value, icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-ink-800">{value}</p>
        </div>
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon name={icon} size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

function StudentDetailView() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { student, loading, error } = useStudentDetail(studentId);
  const [showReport, setShowReport] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-ink-500">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="info" size={24} className="text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Error Loading Student
            </h3>
          </div>
          <p className="text-red-800 mb-4">{error || 'Student not found'}</p>
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-ink-600 hover:text-ink-800 transition-colors"
              >
                <Icon name="arrow-left" size={20} />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student.name}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-600">{student.email}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-gray-600">Grade {student.gradeLevel}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Icon name="printer" size={16} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Adventures Completed"
            value={`${student.stats.completedAdventures}/${student.stats.totalAdventures}`}
            icon="check"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatCard
            label="Completion Rate"
            value={`${student.stats.completionRate}%`}
            icon="chart"
            iconColor="text-brand-600"
            iconBg="bg-brand-100"
          />
          <StatCard
            label="Average Score"
            value={`${student.stats.averageScore}%`}
            icon="star"
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatCard
            label="Total Time"
            value={formatTime(student.stats.totalTimeSpent)}
            icon="clock"
            iconColor="text-accent-600"
            iconBg="bg-accent-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-ink-800 mb-4">
                Progress by Category
              </h2>
              {Object.keys(student.stats.byCategory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(student.stats.byCategory).map(
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
                          className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-ink-800 capitalize">
                              {category}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-ink-600">
                                {stats.completed}/{stats.total} completed
                              </span>
                              <span className="text-amber-600">
                                {avgScore}% avg
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-brand-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${completion}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
                            <span>{completion}% complete</span>
                            <span>{formatTime(stats.totalTime)} spent</span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon
                    name="chart"
                    size={48}
                    className="text-ink-300 mx-auto mb-2"
                  />
                  <p className="text-ink-500">No progress data yet</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-ink-800 mb-4">
                Recent Activity
              </h2>
              {student.recentActivity && student.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {student.recentActivity.slice(0, 10).map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                          size={16}
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
                        <p className="text-sm font-medium text-ink-800 truncate">
                          {activity.adventureId}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-ink-500 capitalize">
                            {activity.category}
                          </span>
                          {activity.score > 0 && (
                            <>
                              <span className="text-ink-300">•</span>
                              <span className="text-xs text-amber-600">
                                {activity.score}% score
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-ink-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(activity.lastAccessed), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon
                    name="clock"
                    size={48}
                    className="text-ink-300 mx-auto mb-2"
                  />
                  <p className="text-ink-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level & XP */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-ink-800 mb-4">
                Level & Progress
              </h3>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl font-bold text-brand-600">
                    {student.stats.currentLevel}
                  </span>
                </div>
                <p className="text-sm text-ink-500">Current Level</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-ink-600">Total XP</span>
                    <span className="text-sm font-semibold text-brand-600">
                      {student.stats.totalXP.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-ink-600">Current Streak</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {student.stats.currentStreak} days 🔥
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-ink-800 mb-4">Achievements</h3>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="star" size={32} className="text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-ink-800">
                  {student.achievements.length}
                </p>
                <p className="text-sm text-ink-500">Badges Earned</p>
              </div>
              {student.achievements.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {student.achievements.slice(0, 5).map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">
                        {achievement.icon || '🏆'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">
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

            {/* Active Goals */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-ink-800 mb-4">
                Learning Goals
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-600">Active Goals</span>
                  <span className="text-lg font-bold text-brand-600">
                    {student.stats.activeGoals}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-600">Completed Goals</span>
                  <span className="text-lg font-bold text-green-600">
                    {student.stats.completedGoals}
                  </span>
                </div>
              </div>
              {student.goals && student.goals.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {student.goals
                    .filter((g: any) => g.status === 'ACTIVE')
                    .slice(0, 5)
                    .map((goal: any) => {
                      const progress = Math.round(
                        (goal.currentValue / goal.targetValue) * 100
                      );
                      return (
                        <div
                          key={goal.id}
                          className="p-2 bg-gray-50 rounded-lg"
                        >
                          <p className="text-sm font-medium text-ink-800 mb-1">
                            {goal.title}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-brand-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-ink-500 mt-1">
                            {goal.currentValue}/{goal.targetValue} {goal.unit}
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
              <ProgressReport student={student} reportType="detailed" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDetailPage() {
  return (
    <ProtectedRoute requiredRole="TEACHER">
      <StudentDetailView />
    </ProtectedRoute>
  );
}
