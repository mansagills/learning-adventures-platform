'use client';

import React, { useState } from 'react';
import DashboardCard from './DashboardCard';
import Icon from '../Icon';
import Link from 'next/link';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'completion' | 'streak' | 'score' | 'time' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

interface AchievementShowcaseProps {
  achievements: Achievement[];
  totalAchievements: number;
  isLoading?: boolean;
  showLocked?: boolean;
  maxDisplay?: number;
}

export default function AchievementShowcase({
  achievements,
  totalAchievements,
  isLoading = false,
  showLocked = true,
  maxDisplay = 6
}: AchievementShowcaseProps) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const earnedAchievements = achievements.filter(a => a.earnedAt);
  const lockedAchievements = achievements.filter(a => !a.earnedAt);

  const filteredAchievements =
    filter === 'earned'
      ? earnedAchievements
      : filter === 'locked'
      ? lockedAchievements
      : achievements;

  const displayedAchievements = filteredAchievements.slice(0, maxDisplay);

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadge = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'rare':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (achievements.length === 0 && !isLoading) {
    return (
      <DashboardCard title="Achievements" icon={<Icon name="trophy" />}>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Icon name="trophy" className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Achievements Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Complete adventures to unlock your first achievement!
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Achievements"
      icon={<Icon name="trophy" />}
      action={
        achievements.length > maxDisplay ? (
          <Link
            href="/dashboard/achievements"
            className="text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            View All
          </Link>
        ) : undefined
      }
      isLoading={isLoading}
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Achievement Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {earnedAchievements.length} / {totalAchievements}
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
            style={{
              width: `${(earnedAchievements.length / totalAchievements) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          All ({achievements.length})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'earned'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Earned ({earnedAchievements.length})
        </button>
        {showLocked && (
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'locked'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Locked ({lockedAchievements.length})
          </button>
        )}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg border transition-all ${
              achievement.earnedAt
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
            }`}
          >
            {/* Rarity Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityBadge(achievement.rarity)}`}
              >
                {achievement.rarity}
              </span>
            </div>

            {/* Icon */}
            <div className="mb-3">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} ${
                  !achievement.earnedAt && 'grayscale'
                }`}
              >
                <span className="text-3xl">{achievement.icon}</span>
              </div>
            </div>

            {/* Content */}
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {achievement.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {achievement.description}
            </p>

            {/* Progress or Date */}
            {achievement.earnedAt ? (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="check" className="text-success" />
                Earned {formatDate(achievement.earnedAt)}
              </div>
            ) : achievement.progress ? (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>
                    {achievement.progress.current} / {achievement.progress.target}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-300"
                    style={{
                      width: `${(achievement.progress.current / achievement.progress.target) * 100}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="lock" />
                Locked
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      {filteredAchievements.length > maxDisplay && (
        <div className="mt-6 text-center">
          <Link
            href="/dashboard/achievements"
            className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium"
          >
            View All Achievements
            <Icon name="arrow-right" />
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}
