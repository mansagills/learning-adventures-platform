'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import Icon from '@/components/Icon';
import { useUserProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import DashboardHero from '@/components/dashboard/DashboardHero';
import QuickActions from '@/components/dashboard/QuickActions';
import SubjectCards, { defaultSubjects } from '@/components/dashboard/SubjectCards';
import ContinueLearningCards from '@/components/dashboard/ContinueLearningCards';
import AchievementCelebration from '@/components/dashboard/AchievementCelebration';
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

  // Transform subject data for SubjectCards
  const getSubjectCardsData = () => {
    if (!progressData) return defaultSubjects;

    const stats = progressData.stats.byCategory;
    const allAdventures = getAllAdventures();

    return defaultSubjects.map(subject => {
      const categoryStats = stats[subject.id.toLowerCase()] || { completed: 0, total: 0 };
      const categoryAdventures = allAdventures.filter(adv => adv.category === subject.id);

      return {
        ...subject,
        completedCount: categoryStats.completed,
        totalCount: categoryAdventures.length,
        recentlyPlayed: progressData.progress.some(p => {
          const adventure = getAdventureById(p.adventureId);
          return adventure?.category === subject.id && p.lastAccessed;
        })
      };
    });
  };

  // Transform progress data for continue learning
  const getContinueLearningData = () => {
    if (!progressData) return [];

    return progressData.progress
      .filter(p => p.progress > 0 && p.progress < 100)
      .map(p => {
        const adventure = getAdventureById(p.adventureId);
        return {
          id: p.adventureId,
          title: adventure?.title || p.adventureId.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' '),
          category: adventure?.category || 'math',
          progress: p.progress,
          timeSpent: p.timeSpent,
          lastAccessed: new Date(p.lastAccessed),
          difficulty: adventure?.difficulty as any,
        };
      })
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  };

  // Transform achievements for celebration
  const getRecentAchievements = () => {
    if (!achievementData) return [];

    return achievementData.achievements
      .filter((a: any) => a.earnedAt)
      .sort((a: any, b: any) =>
        new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      )
      .slice(0, 6)
      .map((achievement: any) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon || '🏆',
        rarity: achievement.rarity || 'common',
        earnedAt: achievement.earnedAt ? new Date(achievement.earnedAt) : undefined,
      }));
  };

  const subjectCardsData = getSubjectCardsData();
  const continueLearning = getContinueLearningData();
  const recentAchievements = getRecentAchievements();

  // Calculate user stats for hero
  const userLevel = progressData ? Math.floor(progressData.stats.completed / 5) + 1 : 1;
  const totalXP = progressData ? progressData.stats.completed * 100 : 0;
  const streak = 3; // TODO: Calculate actual streak

  // Empty state - no progress yet
  if (progressData && progressData.progress.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <DashboardHero
            userName={session?.user?.name}
            userLevel={1}
            totalXP={0}
            streak={0}
          />

          {/* Welcome message */}
          <div className="mb-8 bg-gradient-to-br from-brand-50 to-accent-50 rounded-3xl border-2 border-brand-200 p-12 text-center animate-bounce-in">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-fun text-6xl animate-float">
              🚀
            </div>
            <h3 className="text-3xl font-display font-bold text-ink-900 mb-3">
              Start Your Learning Journey!
            </h3>
            <p className="text-ink-600 text-lg mb-8 max-w-md mx-auto">
              Explore our catalog of fun educational games and interactive lessons to begin earning achievements!
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl hover:shadow-fun-lg transition-all transform hover:scale-105 font-display font-bold text-lg"
            >
              <Icon name="explore" size={24} />
              <span>Explore Adventures</span>
            </Link>
          </div>

          {/* Subject Cards */}
          <SubjectCards subjects={defaultSubjects} />

          {/* Show recommendations even for new users */}
          <div className="mt-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-6">
              Start With These! ⭐
            </h2>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <DashboardHero
          userName={session?.user?.name}
          userLevel={userLevel}
          totalXP={totalXP}
          streak={streak}
        />

        {/* Quick Actions */}
        <QuickActions
          continueCount={continueLearning.length}
          newAdventuresCount={recommendations.length}
          achievementsCount={achievementData?.achievements?.length || 0}
        />

        {/* Continue Learning Section */}
        {continueLearning.length > 0 && (
          <ContinueLearningCards
            adventures={continueLearning}
            maxDisplay={4}
          />
        )}

        {/* Subject Category Cards */}
        <SubjectCards subjects={subjectCardsData} />

        {/* Achievement Celebration */}
        {recentAchievements.length > 0 && (
          <AchievementCelebration
            recentAchievements={recentAchievements}
            totalAchievements={achievementData?.totalAchievements || 15}
            earnedCount={achievementData?.achievements?.length || 0}
          />
        )}

        {/* Recommended Content */}
        <div className="mt-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-6">
            Try These Next! 🌟
          </h2>
          <RecommendedContent
            recommendations={recommendations}
            reason="subject"
            maxDisplay={4}
          />
        </div>
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
