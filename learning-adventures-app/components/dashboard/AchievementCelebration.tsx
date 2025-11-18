'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../Icon';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
  progress?: number; // For locked achievements
}

interface AchievementCelebrationProps {
  recentAchievements: Achievement[];
  totalAchievements: number;
  earnedCount: number;
}

export default function AchievementCelebration({
  recentAchievements,
  totalAchievements,
  earnedCount
}: AchievementCelebrationProps) {
  const completionPercentage = totalAchievements > 0
    ? Math.round((earnedCount / totalAchievements) * 100)
    : 0;

  if (recentAchievements.length === 0) {
    return null;
  }

  return (
    <div className="mb-8" id="achievements">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 flex items-center gap-2">
            <span>Your Achievements</span>
            <span className="text-3xl animate-bounce-in">🏆</span>
          </h2>
          <p className="text-ink-600 mt-1">
            {earnedCount} of {totalAchievements} badges collected ({completionPercentage}%)
          </p>
        </div>
        <Link
          href="/achievements"
          className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <Icon name="chevronRight" size={16} />
        </Link>
      </div>

      {/* Recent achievements grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {recentAchievements.slice(0, 6).map((achievement, index) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            animationDelay={index * 0.1}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl p-6 border-2 border-brand-100">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-bold text-ink-900">Collection Progress</span>
          <span className="font-bold text-brand-600 text-lg">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-brand-500 to-accent-500 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
            style={{ width: `${completionPercentage}%` }}
          >
            {completionPercentage > 10 && (
              <span className="text-white text-xs font-bold">✨</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement, animationDelay }: { achievement: Achievement; animationDelay: number }) {
  const rarityConfig = getRarityConfig(achievement.rarity);

  return (
    <div
      className="group block animate-bounce-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={`relative overflow-hidden bg-white rounded-2xl p-4 shadow-md hover:shadow-fun transition-all duration-300 hover:scale-110 border-2 ${rarityConfig.borderColor} cursor-pointer`}>
        {/* Rarity glow effect */}
        <div className={`absolute inset-0 ${rarityConfig.glowGradient} opacity-10`}></div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

        {/* Icon */}
        <div className="relative mb-2 text-center">
          <div className="text-5xl transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 filter drop-shadow-lg">
            {achievement.icon}
          </div>

          {/* New badge */}
          {achievement.earnedAt && isRecent(achievement.earnedAt) && (
            <div className="absolute -top-2 -right-2 bg-coral-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              NEW
            </div>
          )}
        </div>

        {/* Name */}
        <h4 className={`font-display font-bold text-xs text-center ${rarityConfig.textColor} mb-1 line-clamp-2`}>
          {achievement.name}
        </h4>

        {/* Rarity indicator */}
        <div className="flex justify-center">
          <div className={`${rarityConfig.bgColor} ${rarityConfig.textColor} rounded-full px-2 py-0.5 text-[10px] font-bold`}>
            {achievement.rarity.toUpperCase()}
          </div>
        </div>

        {/* Progress for locked achievements */}
        {achievement.progress !== undefined && achievement.progress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`${rarityConfig.progressBg} h-full rounded-full transition-all duration-500`}
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Earned timestamp */}
        {achievement.earnedAt && (
          <div className="mt-2 text-center">
            <span className="text-[10px] text-ink-400">
              {formatEarnedDate(achievement.earnedAt)}
            </span>
          </div>
        )}

        {/* Sparkles for legendary */}
        {achievement.rarity === 'legendary' && (
          <>
            <div className="absolute top-2 left-2 text-sunshine-400 text-xs animate-pulse">✨</div>
            <div className="absolute top-2 right-2 text-sunshine-400 text-xs animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
          </>
        )}
      </div>
    </div>
  );
}

function getRarityConfig(rarity: string) {
  const configs: Record<string, any> = {
    common: {
      borderColor: 'border-gray-300',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-100',
      glowGradient: 'bg-gradient-to-br from-gray-300 to-gray-400',
      progressBg: 'bg-gray-400',
    },
    rare: {
      borderColor: 'border-ocean-300',
      textColor: 'text-ocean-700',
      bgColor: 'bg-ocean-100',
      glowGradient: 'bg-gradient-to-br from-ocean-300 to-ocean-500',
      progressBg: 'bg-ocean-500',
    },
    epic: {
      borderColor: 'border-brand-300',
      textColor: 'text-brand-700',
      bgColor: 'bg-brand-100',
      glowGradient: 'bg-gradient-to-br from-brand-300 to-brand-600',
      progressBg: 'bg-brand-500',
    },
    legendary: {
      borderColor: 'border-sunshine-300',
      textColor: 'text-sunshine-700',
      bgColor: 'bg-sunshine-100',
      glowGradient: 'bg-gradient-to-br from-sunshine-300 to-sunshine-600',
      progressBg: 'bg-gradient-to-r from-sunshine-500 to-coral-500',
    },
  };

  return configs[rarity.toLowerCase()] || configs.common;
}

function isRecent(date: Date): boolean {
  const daysSince = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 7; // Consider achievements earned in last 7 days as "new"
}

function formatEarnedDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}
