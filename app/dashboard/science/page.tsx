'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubjectDashboard from '@/components/dashboard/SubjectDashboard';
import { useUserProgress } from '@/hooks/useProgress';
import { getAllAdventures } from '@/lib/catalogData';
import { Skill } from '@/components/dashboard/SkillProgress';
import { PathNode } from '@/components/dashboard/LearningPath';

function ScienceDashboardContent() {
  const { data: session } = useSession();
  const { data: progressData, loading: progressLoading } = useUserProgress();

  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const allAdventures = getAllAdventures();
  const scienceAdventures = allAdventures.filter(
    (adv) => adv.category === 'science'
  );

  const scienceProgress =
    progressData?.progress.filter((p) => {
      const adventure = scienceAdventures.find((a) => a.id === p.adventureId);
      return !!adventure;
    }) || [];

  const completedScience = scienceProgress.filter(
    (p) => p.status === 'COMPLETED'
  );
  const inProgressScience = scienceProgress.filter(
    (p) => p.status === 'IN_PROGRESS'
  );

  const averageScore =
    completedScience.length > 0
      ? Math.round(
          completedScience.reduce((sum, p) => sum + (p.score || 0), 0) /
            completedScience.length
        )
      : 0;

  const totalTimeSpent = scienceProgress.reduce(
    (sum, p) => sum + (p.timeSpent || 0),
    0
  );

  // Science-specific skills
  const scienceSkills: Skill[] = [
    {
      id: 'biology',
      name: 'Life Science & Biology',
      category: 'Living Systems',
      progress: Math.min(
        100,
        (completedScience.filter((p) => {
          const adv = scienceAdventures.find((a) => a.id === p.adventureId);
          return adv?.skills.some(
            (s) =>
              s.toLowerCase().includes('biology') ||
              s.toLowerCase().includes('life')
          );
        }).length /
          Math.max(
            1,
            scienceAdventures.filter((a) =>
              a.skills.some(
                (s) =>
                  s.toLowerCase().includes('biology') ||
                  s.toLowerCase().includes('life')
              )
            ).length
          )) *
          100
      ),
      level: completedScience.length < 3 ? 'beginner' : 'intermediate',
      completedActivities: completedScience.filter((p) => {
        const adv = scienceAdventures.find((a) => a.id === p.adventureId);
        return adv?.skills.some((s) => s.toLowerCase().includes('biology'));
      }).length,
      totalActivities: scienceAdventures.filter((a) =>
        a.skills.some((s) => s.toLowerCase().includes('biology'))
      ).length,
      mastered: false,
    },
    {
      id: 'chemistry',
      name: 'Chemistry & Matter',
      category: 'Physical Science',
      progress: Math.min(
        100,
        (completedScience.filter((p) => {
          const adv = scienceAdventures.find((a) => a.id === p.adventureId);
          return adv?.skills.some(
            (s) =>
              s.toLowerCase().includes('chemistry') ||
              s.toLowerCase().includes('matter')
          );
        }).length /
          Math.max(
            1,
            scienceAdventures.filter((a) =>
              a.skills.some(
                (s) =>
                  s.toLowerCase().includes('chemistry') ||
                  s.toLowerCase().includes('matter')
              )
            ).length
          )) *
          100
      ),
      level: 'beginner',
      completedActivities: completedScience.filter((p) => {
        const adv = scienceAdventures.find((a) => a.id === p.adventureId);
        return adv?.skills.some((s) => s.toLowerCase().includes('chemistry'));
      }).length,
      totalActivities: scienceAdventures.filter((a) =>
        a.skills.some((s) => s.toLowerCase().includes('chemistry'))
      ).length,
      mastered: false,
    },
    {
      id: 'physics',
      name: 'Physics & Energy',
      category: 'Physical Science',
      progress: Math.min(
        100,
        (completedScience.filter((p) => {
          const adv = scienceAdventures.find((a) => a.id === p.adventureId);
          return adv?.skills.some(
            (s) =>
              s.toLowerCase().includes('physics') ||
              s.toLowerCase().includes('energy')
          );
        }).length /
          Math.max(
            1,
            scienceAdventures.filter((a) =>
              a.skills.some(
                (s) =>
                  s.toLowerCase().includes('physics') ||
                  s.toLowerCase().includes('energy')
              )
            ).length
          )) *
          100
      ),
      level: 'beginner',
      completedActivities: completedScience.filter((p) => {
        const adv = scienceAdventures.find((a) => a.id === p.adventureId);
        return adv?.skills.some((s) => s.toLowerCase().includes('physics'));
      }).length,
      totalActivities: scienceAdventures.filter((a) =>
        a.skills.some((s) => s.toLowerCase().includes('physics'))
      ).length,
      mastered: false,
    },
    {
      id: 'earth-science',
      name: 'Earth & Space Science',
      category: 'Earth Systems',
      progress: Math.min(
        100,
        (completedScience.filter((p) => {
          const adv = scienceAdventures.find((a) => a.id === p.adventureId);
          return adv?.skills.some(
            (s) =>
              s.toLowerCase().includes('earth') ||
              s.toLowerCase().includes('space')
          );
        }).length /
          Math.max(
            1,
            scienceAdventures.filter((a) =>
              a.skills.some(
                (s) =>
                  s.toLowerCase().includes('earth') ||
                  s.toLowerCase().includes('space')
              )
            ).length
          )) *
          100
      ),
      level: 'beginner',
      completedActivities: completedScience.filter((p) => {
        const adv = scienceAdventures.find((a) => a.id === p.adventureId);
        return adv?.skills.some((s) => s.toLowerCase().includes('earth'));
      }).length,
      totalActivities: scienceAdventures.filter((a) =>
        a.skills.some((s) => s.toLowerCase().includes('earth'))
      ).length,
      mastered: false,
    },
    {
      id: 'scientific-method',
      name: 'Scientific Method & Investigation',
      category: 'Process Skills',
      progress: Math.min(
        100,
        (completedScience.length / Math.max(1, scienceAdventures.length)) * 100
      ),
      level: completedScience.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedScience.length,
      totalActivities: scienceAdventures.length,
      mastered: completedScience.length >= 10,
    },
  ];

  // Science learning path
  const learningPath: PathNode[] = [
    {
      id: 'observation',
      title: 'Observation & Discovery',
      description: 'Learn to observe and ask scientific questions',
      type: completedScience.length > 0 ? 'completed' : 'current',
      skills: ['Observation', 'Questions', 'Predictions'],
      estimatedTime: 25,
      adventureId: scienceAdventures.find((a) => a.difficulty === 'easy')?.id,
    },
    {
      id: 'experimentation',
      title: 'Hands-On Experiments',
      description: 'Conduct simple experiments and record results',
      type:
        completedScience.length >= 3
          ? completedScience.length >= 5
            ? 'completed'
            : 'current'
          : completedScience.length > 0
            ? 'available'
            : 'locked',
      skills: ['Experimentation', 'Data Collection', 'Recording'],
      estimatedTime: 40,
      adventureId: scienceAdventures.find((a) => a.difficulty === 'medium')?.id,
      prerequisiteIds: ['observation'],
    },
    {
      id: 'life-science',
      title: 'Living Things Lab',
      description: 'Explore biology and living organisms',
      type:
        completedScience.length >= 5
          ? completedScience.length >= 8
            ? 'completed'
            : 'current'
          : completedScience.length >= 3
            ? 'available'
            : 'locked',
      skills: ['Biology', 'Ecosystems', 'Life Cycles'],
      estimatedTime: 35,
      adventureId: scienceAdventures.find((a) =>
        a.skills.some((s) => s.toLowerCase().includes('biology'))
      )?.id,
      prerequisiteIds: ['experimentation'],
    },
    {
      id: 'physical-science',
      title: 'Matter & Energy Workshop',
      description: 'Understand chemistry and physics fundamentals',
      type:
        completedScience.length >= 8
          ? completedScience.length >= 12
            ? 'completed'
            : 'current'
          : completedScience.length >= 5
            ? 'available'
            : 'locked',
      skills: ['Chemistry', 'Physics', 'Energy'],
      estimatedTime: 45,
      adventureId: scienceAdventures.find((a) =>
        a.skills.some((s) => s.toLowerCase().includes('chemistry'))
      )?.id,
      prerequisiteIds: ['life-science'],
    },
    {
      id: 'advanced-research',
      title: 'Scientific Research Project',
      description: 'Design and execute independent investigations',
      type:
        completedScience.length >= 12
          ? 'current'
          : completedScience.length >= 8
            ? 'available'
            : 'locked',
      skills: ['Research', 'Analysis', 'Presentation'],
      estimatedTime: 60,
      adventureId: scienceAdventures.find((a) => a.difficulty === 'hard')?.id,
      prerequisiteIds: ['physical-science'],
    },
  ];

  const completedIds = new Set(completedScience.map((p) => p.adventureId));
  const recommendedAdventures = scienceAdventures
    .filter((adv) => !completedIds.has(adv.id))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const metrics = {
    totalAdventures: scienceAdventures.length,
    completedAdventures: completedScience.length,
    inProgressAdventures: inProgressScience.length,
    averageScore,
    timeSpent: totalTimeSpent,
    skillsMastered: scienceSkills.filter((s) => s.mastered).length,
    totalSkills: scienceSkills.length,
    currentStreak: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubjectDashboard
          subject="science"
          metrics={metrics}
          skills={scienceSkills}
          learningPath={learningPath}
          recommendedAdventures={recommendedAdventures}
          recentActivity={[]}
          isLoading={progressLoading}
        />
      </div>
    </div>
  );
}

export default function ScienceDashboardPage() {
  return (
    <ProtectedRoute>
      <ScienceDashboardContent />
    </ProtectedRoute>
  );
}
