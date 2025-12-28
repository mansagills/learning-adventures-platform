'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubjectDashboard from '@/components/dashboard/SubjectDashboard';
import { useUserProgress } from '@/hooks/useProgress';
import { getAllAdventures } from '@/lib/catalogData';
import { Skill } from '@/components/dashboard/SkillProgress';
import { PathNode } from '@/components/dashboard/LearningPath';

function EnglishDashboardContent() {
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
  const englishAdventures = allAdventures.filter(adv => adv.category === 'english');

  const englishProgress = progressData?.progress.filter(p => {
    const adventure = englishAdventures.find(a => a.id === p.adventureId);
    return !!adventure;
  }) || [];

  const completedEnglish = englishProgress.filter(p => p.status === 'COMPLETED');
  const inProgressEnglish = englishProgress.filter(p => p.status === 'IN_PROGRESS');

  const averageScore = completedEnglish.length > 0
    ? Math.round(completedEnglish.reduce((sum, p) => sum + (p.score || 0), 0) / completedEnglish.length)
    : 0;

  const totalTimeSpent = englishProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

  // English-specific skills
  const englishSkills: Skill[] = [
    {
      id: 'reading-comprehension',
      name: 'Reading Comprehension',
      category: 'Reading Skills',
      progress: Math.min(100, (completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('reading') || s.toLowerCase().includes('comprehension'));
      }).length / Math.max(1, englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('reading') || s.toLowerCase().includes('comprehension'))
      ).length)) * 100),
      level: completedEnglish.length < 3 ? 'beginner' : completedEnglish.length < 7 ? 'intermediate' : 'advanced',
      completedActivities: completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('reading'));
      }).length,
      totalActivities: englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('reading'))
      ).length,
      mastered: completedEnglish.length >= 10
    },
    {
      id: 'writing',
      name: 'Writing & Composition',
      category: 'Writing Skills',
      progress: Math.min(100, (completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('writing'));
      }).length / Math.max(1, englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('writing'))
      ).length)) * 100),
      level: completedEnglish.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('writing'));
      }).length,
      totalActivities: englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('writing'))
      ).length,
      mastered: false
    },
    {
      id: 'grammar',
      name: 'Grammar & Mechanics',
      category: 'Language Foundations',
      progress: Math.min(100, (completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('grammar') || s.toLowerCase().includes('punctuation'));
      }).length / Math.max(1, englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('grammar') || s.toLowerCase().includes('punctuation'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('grammar'));
      }).length,
      totalActivities: englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('grammar'))
      ).length,
      mastered: false
    },
    {
      id: 'vocabulary',
      name: 'Vocabulary & Word Knowledge',
      category: 'Language Enrichment',
      progress: Math.min(100, (completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('vocabulary'));
      }).length / Math.max(1, englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('vocabulary'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedEnglish.filter(p => {
        const adv = englishAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('vocabulary'));
      }).length,
      totalActivities: englishAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('vocabulary'))
      ).length,
      mastered: false
    },
    {
      id: 'literary-analysis',
      name: 'Literary Analysis',
      category: 'Critical Reading',
      progress: Math.min(100, (completedEnglish.length / Math.max(1, englishAdventures.length)) * 100),
      level: completedEnglish.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedEnglish.length,
      totalActivities: englishAdventures.length,
      mastered: completedEnglish.length >= 15
    }
  ];

  // English learning path
  const learningPath: PathNode[] = [
    {
      id: 'phonics-basics',
      title: 'Phonics & Fundamentals',
      description: 'Build foundational reading skills with phonics',
      type: completedEnglish.length > 0 ? 'completed' : 'current',
      skills: ['Phonics', 'Letter Sounds', 'Decoding'],
      estimatedTime: 30,
      adventureId: englishAdventures.find(a => a.difficulty === 'easy')?.id
    },
    {
      id: 'reading-fluency',
      title: 'Reading Fluency',
      description: 'Develop smooth, confident reading skills',
      type: completedEnglish.length >= 3 ? (completedEnglish.length >= 5 ? 'completed' : 'current') : (completedEnglish.length > 0 ? 'available' : 'locked'),
      skills: ['Fluency', 'Expression', 'Pacing'],
      estimatedTime: 35,
      adventureId: englishAdventures.find(a => a.difficulty === 'medium')?.id,
      prerequisiteIds: ['phonics-basics']
    },
    {
      id: 'comprehension-strategies',
      title: 'Comprehension Strategies',
      description: 'Learn to understand and analyze what you read',
      type: completedEnglish.length >= 5 ? (completedEnglish.length >= 8 ? 'completed' : 'current') : (completedEnglish.length >= 3 ? 'available' : 'locked'),
      skills: ['Main Idea', 'Inference', 'Summarizing'],
      estimatedTime: 40,
      adventureId: englishAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('comprehension')))?.id,
      prerequisiteIds: ['reading-fluency']
    },
    {
      id: 'writing-skills',
      title: 'Writing Workshop',
      description: 'Express yourself through creative and informative writing',
      type: completedEnglish.length >= 8 ? (completedEnglish.length >= 12 ? 'completed' : 'current') : (completedEnglish.length >= 5 ? 'available' : 'locked'),
      skills: ['Writing', 'Organization', 'Revision'],
      estimatedTime: 45,
      adventureId: englishAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('writing')))?.id,
      prerequisiteIds: ['comprehension-strategies']
    },
    {
      id: 'advanced-literacy',
      title: 'Advanced Literacy',
      description: 'Master complex texts and sophisticated writing',
      type: completedEnglish.length >= 12 ? 'current' : (completedEnglish.length >= 8 ? 'available' : 'locked'),
      skills: ['Literary Analysis', 'Argumentative Writing', 'Research'],
      estimatedTime: 50,
      adventureId: englishAdventures.find(a => a.difficulty === 'hard')?.id,
      prerequisiteIds: ['writing-skills']
    }
  ];

  const completedIds = new Set(completedEnglish.map(p => p.adventureId));
  const recommendedAdventures = englishAdventures
    .filter(adv => !completedIds.has(adv.id))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const metrics = {
    totalAdventures: englishAdventures.length,
    completedAdventures: completedEnglish.length,
    inProgressAdventures: inProgressEnglish.length,
    averageScore,
    timeSpent: totalTimeSpent,
    skillsMastered: englishSkills.filter(s => s.mastered).length,
    totalSkills: englishSkills.length,
    currentStreak: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubjectDashboard
          subject="english"
          metrics={metrics}
          skills={englishSkills}
          learningPath={learningPath}
          recommendedAdventures={recommendedAdventures}
          recentActivity={[]}
          isLoading={progressLoading}
        />
      </div>
    </div>
  );
}

export default function EnglishDashboardPage() {
  return (
    <ProtectedRoute>
      <EnglishDashboardContent />
    </ProtectedRoute>
  );
}
