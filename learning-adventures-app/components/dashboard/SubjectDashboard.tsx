'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Icon from '../Icon';
import DashboardCard from './DashboardCard';
import ProgressChart from './ProgressChart';
import SkillProgress, { Skill } from './SkillProgress';
import LearningPath, { PathNode } from './LearningPath';
import { Adventure } from '@/lib/catalogData';

export interface SubjectMetrics {
  totalAdventures: number;
  completedAdventures: number;
  inProgressAdventures: number;
  averageScore: number;
  timeSpent: number; // in minutes
  skillsMastered: number;
  totalSkills: number;
  currentStreak: number;
}

interface SubjectDashboardProps {
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  metrics: SubjectMetrics;
  skills: Skill[];
  learningPath: PathNode[];
  recommendedAdventures: Adventure[];
  recentActivity: any[];
  isLoading?: boolean;
  className?: string;
}

const subjectConfig = {
  math: {
    name: 'Mathematics',
    icon: '🔢',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    description: 'Master numbers, patterns, and problem-solving',
  },
  science: {
    name: 'Science',
    icon: '🔬',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    description: 'Explore the natural world through experiments',
  },
  english: {
    name: 'English',
    icon: '📚',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
    description: 'Develop reading, writing, and communication skills',
  },
  history: {
    name: 'History',
    icon: '🏛️',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
    description: 'Discover the past and understand the present',
  },
  interdisciplinary: {
    name: 'Interdisciplinary',
    icon: '🌐',
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    lightBg: 'bg-pink-50',
    description: 'Connect ideas across multiple subjects',
  },
};

export default function SubjectDashboard({
  subject,
  metrics,
  skills,
  learningPath,
  recommendedAdventures,
  recentActivity,
  isLoading,
  className,
}: SubjectDashboardProps) {
  const config = subjectConfig[subject];
  const completionRate =
    metrics.totalAdventures > 0
      ? Math.round(
          (metrics.completedAdventures / metrics.totalAdventures) * 100
        )
      : 0;

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-6', className)}>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Subject Hero Section */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-r text-white p-8',
          config.gradient
        )}
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-6xl">{config.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{config.name}</h1>
              <p className="text-white/90 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{completionRate}%</div>
              <div className="text-sm text-white/80 mt-1">Completion Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {metrics.completedAdventures}
              </div>
              <div className="text-sm text-white/80 mt-1">
                Adventures Completed
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{metrics.skillsMastered}</div>
              <div className="text-sm text-white/80 mt-1">Skills Mastered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{metrics.currentStreak}</div>
              <div className="text-sm text-white/80 mt-1">Day Streak</div>
            </div>
          </div>
        </div>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Average Score">
          <div className="text-3xl font-bold text-yellow-600">{`${metrics.averageScore}%`}</div>
        </DashboardCard>
        <DashboardCard title="Time Spent">
          <div className="text-3xl font-bold text-blue-600">{`${Math.floor(metrics.timeSpent / 60)}h ${metrics.timeSpent % 60}m`}</div>
        </DashboardCard>
        <DashboardCard title="In Progress">
          <div className="text-3xl font-bold text-green-600">
            {metrics.inProgressAdventures}
          </div>
        </DashboardCard>
        <DashboardCard title="Skill Progress">
          <div className="text-3xl font-bold text-purple-600">{`${metrics.skillsMastered}/${metrics.totalSkills}`}</div>
        </DashboardCard>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Skills (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center space-x-2">
              <Icon name="lightbulb" size={24} className="text-yellow-500" />
              <span>Skill Progress</span>
            </h3>
            <SkillProgress skills={skills} />
          </div>

          {/* Learning Path */}
          <LearningPath
            nodes={learningPath}
            title={`${config.name} Learning Path`}
            description="Follow this path to master key concepts"
          />
        </div>

        {/* Right Column - Recommendations (1/3 width) */}
        <div className="space-y-6">
          {/* Recommended Adventures */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center space-x-2">
              <Icon name="explore" size={24} className="text-brand-600" />
              <span>Recommended</span>
            </h3>
            {recommendedAdventures.length === 0 ? (
              <div className="text-center py-8">
                <Icon
                  name="check"
                  size={48}
                  className="text-gray-300 mx-auto mb-3"
                />
                <p className="text-sm text-gray-600">
                  You've completed all available adventures!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedAdventures.slice(0, 5).map((adventure) => (
                  <Link
                    key={adventure.id}
                    href={`/adventures/${adventure.id}` as any}
                    className="block group"
                  >
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-brand-300 hover:bg-brand-50 transition-all">
                      <h4 className="font-medium text-sm text-ink-800 group-hover:text-brand-600 mb-1">
                        {adventure.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center">
                          <Icon name="clock" size={12} className="mr-1" />
                          {adventure.estimatedTime} min
                        </span>
                        <span className="capitalize px-2 py-0.5 bg-white rounded">
                          {adventure.difficulty}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={`/catalog?category=${subject}`}
              className="block mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium text-center"
            >
              View All {config.name} Adventures →
            </Link>
          </div>

          {/* Quick Stats */}
          <div className={cn('rounded-lg p-6', config.lightBg)}>
            <h3 className="font-bold text-ink-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Completion Rate</span>
                <span className="font-semibold text-ink-800">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500 bg-gradient-to-r',
                    config.gradient
                  )}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-700">Next Milestone</span>
                <span className="text-xs font-medium text-gray-600">
                  {metrics.completedAdventures + 5} adventures
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
