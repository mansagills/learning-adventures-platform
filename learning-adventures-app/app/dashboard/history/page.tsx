'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubjectDashboard from '@/components/dashboard/SubjectDashboard';
import { useUserProgress } from '@/hooks/useProgress';
import { getAllAdventures } from '@/lib/catalogData';
import { Skill } from '@/components/dashboard/SkillProgress';
import { PathNode } from '@/components/dashboard/LearningPath';

function HistoryDashboardContent() {
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
  const historyAdventures = allAdventures.filter(adv => adv.category === 'history');

  const historyProgress = progressData?.progress.filter(p => {
    const adventure = historyAdventures.find(a => a.id === p.adventureId);
    return !!adventure;
  }) || [];

  const completedHistory = historyProgress.filter(p => p.status === 'COMPLETED');
  const inProgressHistory = historyProgress.filter(p => p.status === 'IN_PROGRESS');

  const averageScore = completedHistory.length > 0
    ? Math.round(completedHistory.reduce((sum, p) => sum + (p.score || 0), 0) / completedHistory.length)
    : 0;

  const totalTimeSpent = historyProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

  // History-specific skills
  const historySkills: Skill[] = [
    {
      id: 'chronology',
      name: 'Chronology & Timelines',
      category: 'Historical Thinking',
      progress: Math.min(100, (completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('chronology') || s.toLowerCase().includes('timeline'));
      }).length / Math.max(1, historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('chronology') || s.toLowerCase().includes('timeline'))
      ).length)) * 100),
      level: completedHistory.length < 3 ? 'beginner' : 'intermediate',
      completedActivities: completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('chronology'));
      }).length,
      totalActivities: historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('chronology'))
      ).length,
      mastered: completedHistory.length >= 8
    },
    {
      id: 'historical-analysis',
      name: 'Historical Analysis',
      category: 'Critical Thinking',
      progress: Math.min(100, (completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('analysis') || s.toLowerCase().includes('evidence'));
      }).length / Math.max(1, historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('analysis') || s.toLowerCase().includes('evidence'))
      ).length)) * 100),
      level: completedHistory.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('analysis'));
      }).length,
      totalActivities: historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('analysis'))
      ).length,
      mastered: false
    },
    {
      id: 'cultural-understanding',
      name: 'Cultural Understanding',
      category: 'Global Awareness',
      progress: Math.min(100, (completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('culture') || s.toLowerCase().includes('civilization'));
      }).length / Math.max(1, historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('culture') || s.toLowerCase().includes('civilization'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('culture'));
      }).length,
      totalActivities: historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('culture'))
      ).length,
      mastered: false
    },
    {
      id: 'geography',
      name: 'Geography & Maps',
      category: 'Spatial Understanding',
      progress: Math.min(100, (completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('geography') || s.toLowerCase().includes('map'));
      }).length / Math.max(1, historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('geography') || s.toLowerCase().includes('map'))
      ).length)) * 100),
      level: 'beginner',
      completedActivities: completedHistory.filter(p => {
        const adv = historyAdventures.find(a => a.id === p.adventureId);
        return adv?.skills.some(s => s.toLowerCase().includes('geography'));
      }).length,
      totalActivities: historyAdventures.filter(a =>
        a.skills.some(s => s.toLowerCase().includes('geography'))
      ).length,
      mastered: false
    },
    {
      id: 'historical-research',
      name: 'Historical Research',
      category: 'Research Skills',
      progress: Math.min(100, (completedHistory.length / Math.max(1, historyAdventures.length)) * 100),
      level: completedHistory.length < 5 ? 'beginner' : 'intermediate',
      completedActivities: completedHistory.length,
      totalActivities: historyAdventures.length,
      mastered: completedHistory.length >= 12
    }
  ];

  // History learning path
  const learningPath: PathNode[] = [
    {
      id: 'community-history',
      title: 'My Community & Family History',
      description: 'Explore the history of your community and family',
      type: completedHistory.length > 0 ? 'completed' : 'current',
      skills: ['Personal History', 'Community', 'Traditions'],
      estimatedTime: 30,
      adventureId: historyAdventures.find(a => a.difficulty === 'easy')?.id
    },
    {
      id: 'ancient-civilizations',
      title: 'Ancient Civilizations',
      description: 'Discover early human societies and cultures',
      type: completedHistory.length >= 3 ? (completedHistory.length >= 5 ? 'completed' : 'current') : (completedHistory.length > 0 ? 'available' : 'locked'),
      skills: ['Ancient History', 'Civilizations', 'Archaeology'],
      estimatedTime: 40,
      adventureId: historyAdventures.find(a => a.difficulty === 'medium')?.id,
      prerequisiteIds: ['community-history']
    },
    {
      id: 'world-exploration',
      title: 'Age of Exploration',
      description: 'Journey through the era of global exploration',
      type: completedHistory.length >= 5 ? (completedHistory.length >= 8 ? 'completed' : 'current') : (completedHistory.length >= 3 ? 'available' : 'locked'),
      skills: ['Exploration', 'Navigation', 'Cultural Exchange'],
      estimatedTime: 35,
      adventureId: historyAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('exploration')))?.id,
      prerequisiteIds: ['ancient-civilizations']
    },
    {
      id: 'modern-history',
      title: 'Modern World History',
      description: 'Understand recent historical events and their impact',
      type: completedHistory.length >= 8 ? (completedHistory.length >= 12 ? 'completed' : 'current') : (completedHistory.length >= 5 ? 'available' : 'locked'),
      skills: ['Modern History', 'Social Change', 'Global Events'],
      estimatedTime: 45,
      adventureId: historyAdventures.find(a => a.skills.some(s => s.toLowerCase().includes('modern')))?.id,
      prerequisiteIds: ['world-exploration']
    },
    {
      id: 'historian-project',
      title: 'Become a Historian',
      description: 'Conduct original historical research and analysis',
      type: completedHistory.length >= 12 ? 'current' : (completedHistory.length >= 8 ? 'available' : 'locked'),
      skills: ['Primary Sources', 'Research Methods', 'Historical Writing'],
      estimatedTime: 60,
      adventureId: historyAdventures.find(a => a.difficulty === 'hard')?.id,
      prerequisiteIds: ['modern-history']
    }
  ];

  const completedIds = new Set(completedHistory.map(p => p.adventureId));
  const recommendedAdventures = historyAdventures
    .filter(adv => !completedIds.has(adv.id))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const metrics = {
    totalAdventures: historyAdventures.length,
    completedAdventures: completedHistory.length,
    inProgressAdventures: inProgressHistory.length,
    averageScore,
    timeSpent: totalTimeSpent,
    skillsMastered: historySkills.filter(s => s.mastered).length,
    totalSkills: historySkills.length,
    currentStreak: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubjectDashboard
          subject="history"
          metrics={metrics}
          skills={historySkills}
          learningPath={learningPath}
          recommendedAdventures={recommendedAdventures}
          recentActivity={[]}
          isLoading={progressLoading}
        />
      </div>
    </div>
  );
}

export default function HistoryDashboardPage() {
  return (
    <ProtectedRoute>
      <HistoryDashboardContent />
    </ProtectedRoute>
  );
}
