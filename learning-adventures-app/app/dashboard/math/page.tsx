'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubjectDashboard from '@/components/dashboard/SubjectDashboard';
import { useUserProgress } from '@/hooks/useProgress';
import { getAllAdventures } from '@/lib/catalogData';
import { Skill } from '@/components/dashboard/SkillProgress';
import { PathNode } from '@/components/dashboard/LearningPath';

function MathDashboardContent() {
  const { data: session } = useSession();
  const { data: progressData, loading: progressLoading } = useUserProgress();

  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get all math adventures
  const allAdventures = getAllAdventures();
  const mathAdventures = allAdventures.filter(adv => adv.category === 'math');

  // Calculate math-specific metrics
  const mathProgress = progressData?.progress.filter(p => {
    const adventure = mathAdventures.find(a => a.id === p.adventureId);
    return !!adventure;
  }) || [];

  const completedMath = mathProgress.filter(p => p.status === 'COMPLETED');
  const inProgressMath = mathProgress.filter(p => p.status === 'IN_PROGRESS');

  const averageScore = completedMath.length > 0
    ? Math.round(completedMath.reduce((sum, p) => sum + (p.score || 0), 0) / completedMath.length)
    : 0;

  const totalTimeSpent = mathProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

  // Define math-specific skills
  const mathSkills: Skill[] = [
    {
      id: 'arithmetic',
      name: 'Arithmetic Operations',
      category: 'Number Sense',
      progress: Math.min(100, (completedMath.length / Math.max(1, mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('arithmetic') || s.toLowerCase().includes('addition') || s.toLowerCase().includes('subtraction'))
      ).length)) * 100),
      level: completedMath.length < 3 ? 'beginner' : completedMath.length < 7 ? 'intermediate' : 'advanced',
      completedActivities: completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('arithmetic'));
      }).length,
      totalActivities: mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('arithmetic'))
      ).length,
      mastered: completedMath.length >= 10,
      lastPracticed: mathProgress[0]?.lastAccessed ? new Date(mathProgress[0].lastAccessed) : undefined
    },
    {
      id: 'fractions',
      name: 'Fractions & Decimals',
      category: 'Number Operations',
      progress: Math.min(100, (completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('fraction') || s.toLowerCase().includes('decimal'));
      }).length / Math.max(1, mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('fraction') || s.toLowerCase().includes('decimal'))
      ).length)) * 100),
      level: completedMath.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('fraction'));
      }).length,
      totalActivities: mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('fraction'))
      ).length,
      mastered: false
    },
    {
      id: 'geometry',
      name: 'Geometry & Shapes',
      category: 'Spatial Reasoning',
      progress: Math.min(100, (completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('geometry') || s.toLowerCase().includes('shape'));
      }).length / Math.max(1, mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('geometry') || s.toLowerCase().includes('shape'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('geometry'));
      }).length,
      totalActivities: mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('geometry'))
      ).length,
      mastered: false
    },
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      category: 'Critical Thinking',
      progress: Math.min(100, (completedMath.length / Math.max(1, mathAdventures.length)) * 100),
      level: completedMath.length < 5 ? 'beginner' : completedMath.length < 10 ? 'intermediate' : 'advanced',
      completedActivities: completedMath.length,
      totalActivities: mathAdventures.length,
      mastered: completedMath.length >= 15
    },
    {
      id: 'patterns',
      name: 'Patterns & Sequences',
      category: 'Algebraic Thinking',
      progress: Math.min(100, (completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('pattern') || s.toLowerCase().includes('sequence'));
      }).length / Math.max(1, mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('pattern') || s.toLowerCase().includes('sequence'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedMath.filter(p => {
        const adv = mathAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('pattern'));
      }).length,
      totalActivities: mathAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('pattern'))
      ).length,
      mastered: false
    }
  ];

  // Create learning path for math
  const learningPath: PathNode[] = [
    {
      id: 'basics',
      title: 'Number Basics',
      description: 'Master counting, addition, and subtraction',
      type: completedMath.length > 0 ? 'completed' : 'current',
      skills: ['Counting', 'Addition', 'Subtraction'],
      estimatedTime: 30,
      adventureId: mathAdventures.find(a => a.difficulty === 'easy')?.id
    },
    {
      id: 'operations',
      title: 'Advanced Operations',
      description: 'Learn multiplication, division, and order of operations',
      type: completedMath.length >= 3 ? (completedMath.length >= 5 ? 'completed' : 'current') : (completedMath.length > 0 ? 'available' : 'locked'),
      skills: ['Multiplication', 'Division', 'Order of Operations'],
      estimatedTime: 45,
      adventureId: mathAdventures.find(a => a.difficulty === 'medium')?.id,
      prerequisiteIds: ['basics']
    },
    {
      id: 'fractions-path',
      title: 'Fractions Mastery',
      description: 'Understand and work with fractions and decimals',
      type: completedMath.length >= 5 ? (completedMath.length >= 8 ? 'completed' : 'current') : (completedMath.length >= 3 ? 'available' : 'locked'),
      skills: ['Fractions', 'Decimals', 'Percentages'],
      estimatedTime: 40,
      adventureId: mathAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('fraction')))?.id,
      prerequisiteIds: ['operations']
    },
    {
      id: 'geometry-path',
      title: 'Geometry Explorer',
      description: 'Discover shapes, angles, and spatial relationships',
      type: completedMath.length >= 8 ? (completedMath.length >= 12 ? 'completed' : 'current') : (completedMath.length >= 5 ? 'available' : 'locked'),
      skills: ['Shapes', 'Angles', 'Measurement'],
      estimatedTime: 35,
      adventureId: mathAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('geometry')))?.id,
      prerequisiteIds: ['fractions-path']
    },
    {
      id: 'advanced',
      title: 'Advanced Problem Solving',
      description: 'Apply mathematical thinking to complex challenges',
      type: completedMath.length >= 12 ? 'current' : (completedMath.length >= 8 ? 'available' : 'locked'),
      skills: ['Critical Thinking', 'Logic', 'Real-world Applications'],
      estimatedTime: 50,
      adventureId: mathAdventures.find(a => a.difficulty === 'hard')?.id,
      prerequisiteIds: ['geometry-path']
    }
  ];

  // Get recommended adventures (not completed)
  const completedIds = new Set(completedMath.map(p => p.adventureId));
  const recommendedAdventures = mathAdventures
    .filter(adv => !completedIds.has(adv.id))
    .sort((a, b) => {
      // Prioritize featured
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then by difficulty (easier first)
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const metrics = {
    totalAdventures: mathAdventures.length,
    completedAdventures: completedMath.length,
    inProgressAdventures: inProgressMath.length,
    averageScore,
    timeSpent: totalTimeSpent,
    skillsMastered: mathSkills.filter(s => s.mastered).length,
    totalSkills: mathSkills.length,
    currentStreak: progressData?.stats.currentStreak || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubjectDashboard
          subject="math"
          metrics={metrics}
          skills={mathSkills}
          learningPath={learningPath}
          recommendedAdventures={recommendedAdventures}
          recentActivity={[]}
          isLoading={progressLoading}
        />
      </div>
    </div>
  );
}

export default function MathDashboardPage() {
  return (
    <ProtectedRoute>
      <MathDashboardContent />
    </ProtectedRoute>
  );
}
