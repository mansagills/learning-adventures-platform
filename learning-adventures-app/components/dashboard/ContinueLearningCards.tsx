'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../Icon';

interface AdventureProgress {
  id: string;
  title: string;
  category: string;
  progress: number; // 0-100
  timeSpent?: number; // in minutes
  lastAccessed: Date;
  thumbnail?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ContinueLearningCardsProps {
  adventures: AdventureProgress[];
  maxDisplay?: number;
}

export default function ContinueLearningCards({ adventures, maxDisplay = 4 }: ContinueLearningCardsProps) {
  if (adventures.length === 0) {
    return null;
  }

  const displayedAdventures = adventures.slice(0, maxDisplay);

  return (
    <div className="mb-8" id="continue-learning">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 flex items-center gap-2">
            <span>Continue Your Journey</span>
            <span className="text-3xl animate-wiggle">🚀</span>
          </h2>
          <p className="text-ink-600 mt-1">Pick up where you left off!</p>
        </div>
        {adventures.length > maxDisplay && (
          <Link
            href="/progress"
            className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <Icon name="chevronRight" size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedAdventures.map((adventure, index) => (
          <AdventureCard
            key={adventure.id}
            adventure={adventure}
            animationDelay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}

function AdventureCard({ adventure, animationDelay }: { adventure: AdventureProgress; animationDelay: number }) {
  const categoryConfig = getCategoryConfig(adventure.category);

  return (
    <Link
      href={`/games/${adventure.id}`}
      className="group block animate-bounce-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-fun-lg transition-all duration-300 hover:scale-105 border-2 border-gray-100 hover:border-brand-200">
        {/* Category badge */}
        <div className={`absolute top-3 right-3 ${categoryConfig.bgColor} ${categoryConfig.textColor} rounded-full px-3 py-1 text-xs font-bold shadow-md z-10`}>
          {categoryConfig.emoji} {categoryConfig.name}
        </div>

        {/* Thumbnail/Icon area */}
        <div className={`h-40 ${categoryConfig.gradient} flex items-center justify-center relative overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

          {/* Large emoji */}
          <div className="text-7xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg">
            {categoryConfig.emoji}
          </div>

          {/* Progress overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-8 pb-3 px-4">
            <div className="flex items-center justify-between text-white text-xs font-semibold mb-1">
              <span>{adventure.progress}% Complete</span>
              {adventure.timeSpent && (
                <span className="flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  {adventure.timeSpent}m
                </span>
              )}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${adventure.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-lg text-ink-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {adventure.title}
          </h3>

          {/* Difficulty badge */}
          {adventure.difficulty && (
            <div className="flex items-center gap-2 mb-3">
              <DifficultyBadge difficulty={adventure.difficulty} />
            </div>
          )}

          {/* Action button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:gap-3 transition-all">
              <span>Continue</span>
              <Icon name="play" size={16} />
            </div>

            {/* Last accessed */}
            <span className="text-xs text-ink-400">
              {getRelativeTime(adventure.lastAccessed)}
            </span>
          </div>
        </div>

        {/* Pulse animation on progress */}
        {adventure.progress > 0 && adventure.progress < 100 && (
          <div className="absolute top-1 left-1 w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </div>
        )}
      </div>
    </Link>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const config = {
    easy: { text: 'Easy', color: 'text-grass-600', bgColor: 'bg-grass-100', dots: 1 },
    medium: { text: 'Medium', color: 'text-sunshine-600', bgColor: 'bg-sunshine-100', dots: 2 },
    hard: { text: 'Hard', color: 'text-coral-600', bgColor: 'bg-coral-100', dots: 3 },
  };

  const { text, color, bgColor, dots } = config[difficulty];

  return (
    <div className={`inline-flex items-center gap-1.5 ${bgColor} ${color} rounded-full px-3 py-1`}>
      <div className="flex gap-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i < dots ? 'bg-current' : 'bg-current opacity-30'}`}
          />
        ))}
      </div>
      <span className="text-xs font-bold">{text}</span>
    </div>
  );
}

function getCategoryConfig(category: string) {
  const configs: Record<string, any> = {
    math: {
      name: 'Math',
      emoji: '🔢',
      gradient: 'bg-gradient-to-br from-ocean-400 to-ocean-600',
      bgColor: 'bg-ocean-100',
      textColor: 'text-ocean-700',
    },
    science: {
      name: 'Science',
      emoji: '🔬',
      gradient: 'bg-gradient-to-br from-grass-400 to-grass-600',
      bgColor: 'bg-grass-100',
      textColor: 'text-grass-700',
    },
    english: {
      name: 'English',
      emoji: '📚',
      gradient: 'bg-gradient-to-br from-brand-400 to-brand-600',
      bgColor: 'bg-brand-100',
      textColor: 'text-brand-700',
    },
    history: {
      name: 'History',
      emoji: '🏛️',
      gradient: 'bg-gradient-to-br from-sunshine-400 to-sunshine-600',
      bgColor: 'bg-sunshine-100',
      textColor: 'text-sunshine-700',
    },
    interdisciplinary: {
      name: 'Mixed',
      emoji: '🎨',
      gradient: 'bg-gradient-to-br from-coral-400 to-coral-600',
      bgColor: 'bg-coral-100',
      textColor: 'text-coral-700',
    },
  };

  return configs[category.toLowerCase()] || configs.math;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
