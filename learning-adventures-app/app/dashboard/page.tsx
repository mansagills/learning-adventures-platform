'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Icon from '@/components/Icon';
import { useUserProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AchievementShowcase from '@/components/dashboard/AchievementShowcase';
import RecommendedContent from '@/components/dashboard/RecommendedContent';
import { getAllAdventures, getAdventureById } from '@/lib/catalogData';

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

  // Transform data for new components
  const transformProgressData = () => {
    if (!progressData) return null;

    const stats = progressData.stats;

    // Calculate weekly activity (last 7 days)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName = weekDays[date.getDay()];

      // Count completions for this day
      const count = progressData.progress.filter(p => {
        if (!p.completedAt) return false;
        const completedDate = new Date(p.completedAt);
        return completedDate.toDateString() === date.toDateString();
      }).length;

      return { day: dayName, count };
    });

    // Subject progress with colors
    const subjectColors: Record<string, string> = {
      math: '#3b82f6',
      science: '#10b981',
      english: '#8b5cf6',
      history: '#f97316',
      interdisciplinary: '#ec4899'
    };

    const subjectProgress = Object.entries(stats.byCategory).map(([subject, data]) => ({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      completed: data.completed,
      total: data.total,
      color: subjectColors[subject.toLowerCase()] || '#6b7280'
    }));

    return {
      totalAdventures: stats.totalAdventures,
      completedAdventures: stats.completed,
      timeSpent: stats.totalTimeSpent,
      averageScore: Math.round(stats.averageScore),
      streak: 3, // TODO: Calculate actual streak
      weeklyActivity,
      subjectProgress
    };
  };

  // Transform achievements data
  const transformAchievements = () => {
    if (!achievementData) return [];

    return achievementData.achievements.map((achievement: any) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon || '🏆',
      type: achievement.type || 'completion',
      rarity: achievement.rarity || 'common',
      earnedAt: achievement.earnedAt ? new Date(achievement.earnedAt) : undefined,
      progress: achievement.progress
    }));
  };

  // Transform recent activity
  const transformRecentActivity = () => {
    if (!progressData) return [];

    return progressData.stats.recentActivity.slice(0, 10).map((activity: any) => {
      const isCompleted = activity.status === 'COMPLETED' || activity.completedAt;
      const adventure = getAdventureById(activity.adventureId);

      return {
        id: activity.id,
        type: isCompleted ? 'completed' as const : 'started' as const,
        title: adventure?.title || activity.adventureId.split('-').map((w: string) =>
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' '),
        description: isCompleted
          ? `Completed ${adventure?.category || activity.category} adventure`
          : `Started ${adventure?.category || activity.category} adventure`,
        timestamp: new Date(activity.completedAt || activity.lastAccessed),
        metadata: {
          score: activity.score,
          category: adventure?.category || activity.category,
          adventureId: activity.adventureId
        }
      };
    });
  };

  // Get recommended content based on user's progress
  const getRecommendations = () => {
    const allAdventures = getAllAdventures();
    if (!progressData) return allAdventures.slice(0, 4);

    // Get adventures not yet started or completed
    const completedIds = new Set(
      progressData.progress
        .filter(p => p.status === 'COMPLETED')
        .map(p => p.adventureId)
    );

    // Filter out completed ones and prioritize user's favorite categories
    const userCategories = Object.entries(progressData.stats.byCategory)
      .sort(([, a], [, b]) => b.completed - a.completed)
      .slice(0, 2)
      .map(([cat]) => cat);

    const recommended = allAdventures
      .filter(adv => !completedIds.has(adv.id))
      .sort((a, b) => {
        // Prioritize user's favorite categories
        const aScore = userCategories.includes(a.category) ? 1 : 0;
        const bScore = userCategories.includes(b.category) ? 1 : 0;
        if (aScore !== bScore) return bScore - aScore;

        // Then prioritize featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        return 0;
      })
      .slice(0, 4);

    return recommended;
  };

  const progressOverviewData = transformProgressData();
  const achievements = transformAchievements();
  const recentActivity = transformRecentActivity();
  const recommendations = getRecommendations();

  // Empty state - no progress yet
  if (progressData && progressData.progress.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Show recommendations even for new users */}
          <div className="mt-8">
            <RecommendedContent
              recommendations={recommendations}
              reason="new"
              maxDisplay={4}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="My Dashboard"
      description={`Welcome back, ${session?.user?.name || 'Learner'}!`}
      gridColumns={1}
    >
      {/* Progress Overview */}
      {progressOverviewData && (
        <ProgressOverview
          data={progressOverviewData}
          isLoading={progressLoading}
        />
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Activity */}
        <RecentActivity
          activities={recentActivity}
          isLoading={progressLoading}
          maxItems={5}
        />

        {/* Achievement Showcase */}
        <AchievementShowcase
          achievements={achievements}
          totalAchievements={15} // TODO: Get from database
          isLoading={achievementsLoading}
          showLocked={true}
          maxDisplay={6}
        />
      </div>

      {/* Recommended Content */}
      <div className="mt-6">
        <RecommendedContent
          recommendations={recommendations}
          reason="subject"
          maxDisplay={4}
        />
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
