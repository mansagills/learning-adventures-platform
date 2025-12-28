'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubjectDashboard from '@/components/dashboard/SubjectDashboard';
import { useUserProgress } from '@/hooks/useProgress';
import { getAllAdventures } from '@/lib/catalogData';
import { Skill } from '@/components/dashboard/SkillProgress';
import { PathNode } from '@/components/dashboard/LearningPath';

function InterdisciplinaryDashboardContent() {
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
  const interdisciplinaryAdventures = allAdventures.filter(adv => adv.category === 'interdisciplinary');

  const interdisciplinaryProgress = progressData?.progress.filter(p => {
    const adventure = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
    return !!adventure;
  }) || [];

  const completedInterdisciplinary = interdisciplinaryProgress.filter(p => p.status === 'COMPLETED');
  const inProgressInterdisciplinary = interdisciplinaryProgress.filter(p => p.status === 'IN_PROGRESS');

  const averageScore = completedInterdisciplinary.length > 0
    ? Math.round(completedInterdisciplinary.reduce((sum, p) => sum + (p.score || 0), 0) / completedInterdisciplinary.length)
    : 0;

  const totalTimeSpent = interdisciplinaryProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

  // Interdisciplinary-specific skills
  const interdisciplinarySkills: Skill[] = [
    {
      id: 'cross-subject-connections',
      name: 'Cross-Subject Connections',
      category: 'Integration',
      progress: Math.min(100, (completedInterdisciplinary.length / Math.max(1, interdisciplinaryAdventures.length)) * 100),
      level: completedInterdisciplinary.length < 3 ? 'beginner' : completedInterdisciplinary.length < 7 ? 'intermediate' : 'advanced',
      completedActivities: completedInterdisciplinary.length,
      totalActivities: interdisciplinaryAdventures.length,
      mastered: completedInterdisciplinary.length >= 10
    },
    {
      id: 'creative-problem-solving',
      name: 'Creative Problem Solving',
      category: 'Innovation',
      progress: Math.min(100, (completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('problem') || s.toLowerCase().includes('creative'));
      }).length / Math.max(1, interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('problem') || s.toLowerCase().includes('creative'))
      ).length)) * 100),
      level: completedInterdisciplinary.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('problem'));
      }).length,
      totalActivities: interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('problem'))
      ).length,
      mastered: false
    },
    {
      id: 'systems-thinking',
      name: 'Systems Thinking',
      category: 'Holistic Understanding',
      progress: Math.min(100, (completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('systems') || s.toLowerCase().includes('connections'));
      }).length / Math.max(1, interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('systems') || s.toLowerCase().includes('connections'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('systems'));
      }).length,
      totalActivities: interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('systems'))
      ).length,
      mastered: false
    },
    {
      id: 'project-based-learning',
      name: 'Project-Based Learning',
      category: 'Applied Knowledge',
      progress: Math.min(100, (completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('project') || s.toLowerCase().includes('design'));
      }).length / Math.max(1, interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('project') || s.toLowerCase().includes('design'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('project'));
      }).length,
      totalActivities: interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('project'))
      ).length,
      mastered: false
    },
    {
      id: 'global-awareness',
      name: 'Global Awareness',
      category: '21st Century Skills',
      progress: Math.min(100, (completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('global') || s.toLowerCase().includes('culture'));
      }).length / Math.max(1, interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('global') || s.toLowerCase().includes('culture'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedInterdisciplinary.filter(p => {
        const adv = interdisciplinaryAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('global'));
      }).length,
      totalActivities: interdisciplinaryAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('global'))
      ).length,
      mastered: false
    }
  ];

  // Interdisciplinary learning path
  const learningPath: PathNode[] = [
    {
      id: 'connections-intro',
      title: 'Finding Connections',
      description: 'Discover how different subjects relate to each other',
      type: completedInterdisciplinary.length > 0 ? 'completed' : 'current',
      skills: ['Critical Thinking', 'Pattern Recognition', 'Integration'],
      estimatedTime: 35,
      adventureId: interdisciplinaryAdventures.find(a => a.difficulty === 'easy')?.id
    },
    {
      id: 'real-world-applications',
      title: 'Real-World Applications',
      description: 'Apply knowledge from multiple subjects to real scenarios',
      type: completedInterdisciplinary.length >= 3 ? (completedInterdisciplinary.length >= 5 ? 'completed' : 'current') : (completedInterdisciplinary.length > 0 ? 'available' : 'locked'),
      skills: ['Application', 'Problem Solving', 'Synthesis'],
      estimatedTime: 40,
      adventureId: interdisciplinaryAdventures.find(a => a.difficulty === 'medium')?.id,
      prerequisiteIds: ['connections-intro']
    },
    {
      id: 'stem-steam-projects',
      title: 'STEM & STEAM Projects',
      description: 'Combine science, technology, engineering, arts, and math',
      type: completedInterdisciplinary.length >= 5 ? (completedInterdisciplinary.length >= 8 ? 'completed' : 'current') : (completedInterdisciplinary.length >= 3 ? 'available' : 'locked'),
      skills: ['STEM', 'STEAM', 'Innovation', 'Design'],
      estimatedTime: 50,
      adventureId: interdisciplinaryAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('stem')))?.id,
      prerequisiteIds: ['real-world-applications']
    },
    {
      id: 'complex-challenges',
      title: 'Complex Challenge Solving',
      description: 'Tackle multi-faceted problems requiring diverse knowledge',
      type: completedInterdisciplinary.length >= 8 ? (completedInterdisciplinary.length >= 12 ? 'completed' : 'current') : (completedInterdisciplinary.length >= 5 ? 'available' : 'locked'),
      skills: ['Systems Thinking', 'Collaboration', 'Communication'],
      estimatedTime: 55,
      adventureId: interdisciplinaryAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('complex')))?.id,
      prerequisiteIds: ['stem-steam-projects']
    },
    {
      id: 'capstone-project',
      title: 'Capstone Innovation Project',
      description: 'Design and execute an original interdisciplinary project',
      type: completedInterdisciplinary.length >= 12 ? 'current' : (completedInterdisciplinary.length >= 8 ? 'available' : 'locked'),
      skills: ['Innovation', 'Research', 'Presentation', 'Leadership'],
      estimatedTime: 90,
      adventureId: interdisciplinaryAdventures.find(a => a.difficulty === 'hard')?.id,
      prerequisiteIds: ['complex-challenges']
    }
  ];

  const completedIds = new Set(completedInterdisciplinary.map(p => p.adventureId));
  const recommendedAdventures = interdisciplinaryAdventures
    .filter(adv => !completedIds.has(adv.id))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const metrics = {
    totalAdventures: interdisciplinaryAdventures.length,
    completedAdventures: completedInterdisciplinary.length,
    inProgressAdventures: inProgressInterdisciplinary.length,
    averageScore,
    timeSpent: totalTimeSpent,
    skillsMastered: interdisciplinarySkills.filter(s => s.mastered).length,
    totalSkills: interdisciplinarySkills.length,
    currentStreak: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubjectDashboard
          subject="interdisciplinary"
          metrics={metrics}
          skills={interdisciplinarySkills}
          learningPath={learningPath}
          recommendedAdventures={recommendedAdventures}
          recentActivity={[]}
          isLoading={progressLoading}
        />
      </div>
    </div>
  );
}

export default function InterdisciplinaryDashboardPage() {
  return (
    <ProtectedRoute>
      <InterdisciplinaryDashboardContent />
    </ProtectedRoute>
  );
}
