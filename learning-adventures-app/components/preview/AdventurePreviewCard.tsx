'use client';

import { Adventure } from '@/lib/catalogData';
import { cn } from '@/lib/utils';
import Icon from '../Icon';
import { analytics } from '@/lib/analytics';

interface AdventurePreviewCardProps {
  adventure: Adventure;
  className?: string;
  compact?: boolean;
  showCategory?: boolean;
  onClick?: () => void;
}

export default function AdventurePreviewCard({
  adventure,
  className,
  compact = true,
  showCategory = false,
  onClick
}: AdventurePreviewCardProps) {
  const handleCardClick = () => {
    analytics.clickCTA(`Preview ${adventure.title}`, 'homepage-preview');

    if (onClick) {
      onClick();
    } else if (adventure.componentGame) {
      // Navigate to React component game
      window.location.href = `/games/${adventure.id}`;
    } else if (adventure.htmlPath) {
      window.open(adventure.htmlPath, '_blank');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'game' ? 'play' : 'academic';
  };

  const getTypeColor = (type: string) => {
    return type === 'game'
      ? 'bg-accent-500 text-white'
      : 'bg-brand-500 text-white';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'math':
        return 'bg-blue-100 text-blue-700';
      case 'science':
        return 'bg-green-100 text-green-700';
      case 'english':
        return 'bg-purple-100 text-purple-700';
      case 'history':
        return 'bg-orange-100 text-orange-700';
      case 'interdisciplinary':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-brand-300 hover:-translate-y-0.5 min-w-0 flex-shrink-0',
        compact ? 'w-72 h-40' : 'w-80 h-48',
        className
      )}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      {/* Type Badge */}
      <div className={cn(
        'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
        getTypeColor(adventure.type)
      )}>
        <Icon name={getTypeIcon(adventure.type)} size={12} />
        <span className="capitalize">{adventure.type}</span>
      </div>

      {/* Category Badge (if shown) */}
      {showCategory && (
        <div className={cn(
          'absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium capitalize',
          getCategoryColor(adventure.category)
        )}>
          {adventure.category}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="font-semibold text-ink-800 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {adventure.title}
          </h3>
          <p className="text-xs text-ink-600 line-clamp-2 mb-3">
            {adventure.description}
          </p>
        </div>

        {/* Bottom Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {/* Difficulty */}
            <span className={cn(
              'px-2 py-1 rounded-full font-medium capitalize',
              getDifficultyColor(adventure.difficulty)
            )}>
              {adventure.difficulty}
            </span>

            {/* Grade Level */}
            <span className="text-ink-500">
              Grade {adventure.gradeLevel.join(', ')}
            </span>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center space-x-1 text-ink-500">
            <Icon name="clock" size={12} />
            <span>{adventure.estimatedTime}</span>
          </div>
        </div>

        {/* Skills Preview (on hover) */}
        <div className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-95 transition-opacity duration-200 flex flex-col justify-center p-4">
          <h4 className="font-medium text-ink-800 text-sm mb-2">Skills & Topics:</h4>
          <div className="flex flex-wrap gap-1">
            {adventure.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-brand-100 text-brand-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {adventure.skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{adventure.skills.length - 4} more
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-ink-600 flex items-center">
            <Icon name="arrow-right" size={12} className="mr-1" />
            Click to start {adventure.type}
          </div>
        </div>
      </div>
    </div>
  );
}