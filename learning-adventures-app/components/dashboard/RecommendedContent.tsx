'use client';

import React, { useState } from 'react';
import DashboardCard from './DashboardCard';
import Icon from '../Icon';
import Link from 'next/link';
import { Adventure } from '@/lib/catalogData';

interface RecommendedContentProps {
  recommendations: Adventure[];
  isLoading?: boolean;
  reason?: 'difficulty' | 'subject' | 'peer' | 'continuation' | 'new';
  maxDisplay?: number;
}

export default function RecommendedContent({
  recommendations,
  isLoading = false,
  reason = 'subject',
  maxDisplay = 4
}: RecommendedContentProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const displayedRecommendations = recommendations.slice(0, maxDisplay);

  const getReasonLabel = (reason: string): string => {
    switch (reason) {
      case 'difficulty':
        return 'Based on your skill level';
      case 'subject':
        return 'Based on your interests';
      case 'peer':
        return 'Popular with similar learners';
      case 'continuation':
        return 'Continue your learning path';
      case 'new':
        return 'New adventures for you';
      default:
        return 'Recommended for you';
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      math: 'bg-blue-500',
      science: 'bg-green-500',
      english: 'bg-purple-500',
      history: 'bg-orange-500',
      interdisciplinary: 'bg-pink-500'
    };
    return colors[category.toLowerCase()] || 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (recommendations.length === 0 && !isLoading) {
    return (
      <DashboardCard
        title="Recommended for You"
        icon={<Icon name="explore" />}
      >
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Icon name="explore" className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Complete a few adventures to get personalized recommendations!
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Icon name="explore" />
            Browse Catalog
          </Link>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Recommended for You"
      icon={<Icon name="explore" />}
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            {getReasonLabel(reason)}
          </span>
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Toggle view"
          >
            <Icon name={view === 'grid' ? 'list' : 'grid'} />
          </button>
        </div>
      }
      isLoading={isLoading}
    >
      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
            : 'space-y-3'
        }
      >
        {displayedRecommendations.map((adventure) => (
          <Link
            key={adventure.id}
            href={adventure.htmlPath || `/catalog?adventure=${adventure.id}`}
            className={`block group ${
              view === 'grid'
                ? 'p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-brand-500 transition-all'
                : 'flex items-start gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
            }`}
          >
            {/* Category Badge (Grid) or Indicator (List) */}
            {view === 'grid' ? (
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium text-white rounded ${getCategoryColor(adventure.category)}`}
                >
                  {adventure.category}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(adventure.difficulty)}`}
                >
                  {adventure.difficulty}
                </span>
              </div>
            ) : (
              <div
                className={`flex-shrink-0 w-1 h-20 rounded-full ${getCategoryColor(adventure.category)}`}
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-500 transition-colors line-clamp-1">
                  {adventure.title}
                </h4>
                {view === 'list' && (
                  <Icon
                    name="arrow-right"
                    className="flex-shrink-0 text-gray-400 group-hover:text-brand-500 transition-colors"
                  />
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {adventure.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {view === 'list' && (
                  <>
                    <span
                      className={`inline-block px-2 py-1 text-white rounded ${getCategoryColor(adventure.category)}`}
                    >
                      {adventure.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(adventure.difficulty)}`}
                    >
                      {adventure.difficulty}
                    </span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Icon name="clock" className="text-xs" />
                  {adventure.estimatedTime}
                </span>
                {adventure.gradeLevel && (
                  <span className="flex items-center gap-1">
                    <Icon name="user" className="text-xs" />
                    Grade {adventure.gradeLevel}
                  </span>
                )}
                {adventure.type && (
                  <span className="flex items-center gap-1">
                    <Icon name={adventure.type === 'game' ? 'play' : 'book'} className="text-xs" />
                    {adventure.type}
                  </span>
                )}
              </div>

              {/* Skills Tags */}
              {adventure.skills && adventure.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {adventure.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {adventure.skills.length > 3 && (
                    <span className="inline-block px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                      +{adventure.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow Icon (Grid View) */}
            {view === 'grid' && (
              <div className="flex justify-end mt-2">
                <Icon
                  name="arrow-right"
                  className="text-gray-400 group-hover:text-brand-500 transition-colors"
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {recommendations.length > maxDisplay && (
        <div className="mt-6 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium"
          >
            View More Recommendations
            <Icon name="arrow-right" />
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}
