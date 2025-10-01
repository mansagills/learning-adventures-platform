'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProgressStats from '@/components/progress/ProgressStats';
import { AchievementGrid } from '@/components/progress/AchievementBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import Icon from '@/components/Icon';
import { useUserProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: progressData, loading: progressLoading } = useUserProgress();
  const { data: achievementData, loading: achievementsLoading } = useAchievements();

  if (progressLoading || achievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recentAchievements = achievementData?.achievements.slice(0, 3) || [];
  const recentActivity = progressData?.stats.recentActivity.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Welcome back, {session?.user?.name || 'Learner'}!
              </p>
            </div>
            <Link
              href="/catalog"
              className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Icon name="explore" size={20} />
              <span>Explore Adventures</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stats */}
        {progressData && (
          <ProgressStats stats={progressData.stats} showCategories={true} />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink-800">Recent Achievements</h2>
              <Link
                href="/dashboard/achievements"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                View All
              </Link>
            </div>

            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                <AchievementGrid
                  achievements={recentAchievements}
                  columns={1}
                  size="sm"
                  showDates={true}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="trophy" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-ink-500">No achievements yet</p>
                <p className="text-sm text-ink-400 mt-1">
                  Complete your first adventure to earn a badge!
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-ink-800 mb-4">Recent Activity</h2>

            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon name="check" size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-ink-800 text-sm">
                          {activity.adventureId.split('-').map((word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                        <p className="text-xs text-ink-500">
                          {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)} •{' '}
                          {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {activity.score !== null && (
                      <div className="text-right">
                        <p className="font-bold text-ink-800">{activity.score}%</p>
                        <p className="text-xs text-ink-500">{activity.timeSpent}m</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="chart" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-ink-500">No activity yet</p>
                <p className="text-sm text-ink-400 mt-1">
                  Start an adventure to see your progress here!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Continue Learning Section */}
        {progressData && progressData.progress.filter(p => p.status === 'IN_PROGRESS').length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-ink-800 mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressData.progress
                .filter(p => p.status === 'IN_PROGRESS')
                .slice(0, 3)
                .map((progress) => (
                  <div
                    key={progress.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/games/${progress.adventureId}`)}
                  >
                    <p className="font-semibold text-ink-800 mb-2">
                      {progress.adventureId.split('-').map((word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-ink-500">
                        {progress.category.charAt(0).toUpperCase() + progress.category.slice(1)}
                      </span>
                      <span className="text-ink-500">{progress.timeSpent}m spent</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full"
                        style={{ width: '50%' }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {progressData && progressData.progress.length === 0 && (
          <div className="mt-6 bg-gradient-to-br from-brand-50 to-accent-50 rounded-lg border border-brand-200 p-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Icon name="rocket" size={40} className="text-brand-600" />
            </div>
            <h3 className="text-2xl font-bold text-ink-800 mb-2">
              Start Your Learning Journey!
            </h3>
            <p className="text-ink-600 mb-6 max-w-md mx-auto">
              Explore our catalog of educational games and interactive lessons to begin earning achievements and tracking your progress.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              <Icon name="explore" size={20} />
              <span>Explore Adventures</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
