'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Icon from '../Icon';

export interface Skill {
  id: string;
  name: string;
  category: string;
  progress: number; // 0-100
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completedActivities: number;
  totalActivities: number;
  lastPracticed?: Date;
  mastered: boolean;
}

interface SkillProgressProps {
  skills: Skill[];
  isLoading?: boolean;
  showMasteredOnly?: boolean;
  className?: string;
}

const levelConfig = {
  beginner: { color: 'bg-blue-500', label: 'Beginner', icon: '🌱' },
  intermediate: { color: 'bg-green-500', label: 'Intermediate', icon: '🌿' },
  advanced: { color: 'bg-purple-500', label: 'Advanced', icon: '🌳' },
  expert: { color: 'bg-yellow-500', label: 'Expert', icon: '⭐' },
};

export default function SkillProgress({
  skills,
  isLoading,
  showMasteredOnly = false,
  className,
}: SkillProgressProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const filteredSkills = showMasteredOnly
    ? skills.filter((skill) => skill.mastered)
    : skills;

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredSkills.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Icon
          name="lightbulb"
          size={48}
          className="text-gray-400 mx-auto mb-3"
        />
        <p className="text-gray-600">
          {showMasteredOnly
            ? 'No mastered skills yet. Keep practicing!'
            : 'Start learning to track your skill progress'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {filteredSkills.map((skill) => {
        const config = levelConfig[skill.level];
        const isExpanded = expandedSkill === skill.id;

        return (
          <div
            key={skill.id}
            className="bg-white border border-gray-200 rounded-lg hover:border-brand-300 transition-colors overflow-hidden"
          >
            {/* Skill Header */}
            <button
              onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h4 className="font-medium text-ink-800 flex items-center space-x-2">
                      <span>{skill.name}</span>
                      {skill.mastered && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Icon name="check" size={12} className="mr-1" />
                          Mastered
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {config.label} • {skill.completedActivities}/
                      {skill.totalActivities} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-brand-600">
                    {skill.progress}%
                  </span>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    className="text-gray-400"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    config.color
                  )}
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 animate-in slide-in-from-top">
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-ink-800">
                      {skill.category}
                    </span>
                  </div>
                  {skill.lastPracticed && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Practiced</span>
                      <span className="font-medium text-ink-800">
                        {new Date(skill.lastPracticed).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Level Progress</span>
                    <div className="flex items-center space-x-1">
                      {['beginner', 'intermediate', 'advanced', 'expert'].map(
                        (level, idx) => {
                          const currentLevelIndex = Object.keys(
                            levelConfig
                          ).indexOf(skill.level);
                          const isCompleted = idx <= currentLevelIndex;
                          return (
                            <div
                              key={level}
                              className={cn(
                                'w-8 h-1.5 rounded-full transition-colors',
                                isCompleted
                                  ? levelConfig[
                                      level as keyof typeof levelConfig
                                    ].color
                                  : 'bg-gray-200'
                              )}
                            />
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
