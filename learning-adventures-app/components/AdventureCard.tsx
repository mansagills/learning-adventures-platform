'use client';

import { Adventure } from '@/lib/catalogData';
import { cn } from '@/lib/utils';
import Icon from './Icon';
import { analytics } from '@/lib/analytics';

interface AdventureCardProps {
  adventure: Adventure;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function AdventureCard({
  adventure,
  className,
  size = 'medium'
}: AdventureCardProps) {
  const handleCardClick = () => {
    analytics.clickCTA(`View ${adventure.title}`, 'adventure-catalog');

    if (adventure.componentGame) {
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

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const titleSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-250 cursor-pointer group relative overflow-hidden',
        sizeClasses[size],
        className
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${adventure.title} - ${adventure.type}`}
    >
      {/* Featured Badge */}
      {adventure.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-sun-400 text-ink-900 px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        </div>
      )}

      {/* Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          getTypeColor(adventure.type)
        )}>
          <Icon name={getTypeIcon(adventure.type)} size={16} className="mr-2" />
          {adventure.type === 'game' ? 'Game' : 'Lesson'}
        </div>

        {/* Difficulty Badge */}
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium capitalize',
          getDifficultyColor(adventure.difficulty)
        )}>
          {adventure.difficulty}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className={cn(
          'font-display font-bold text-ink-900 mb-2 group-hover:text-brand-500 transition-colors duration-250',
          titleSizes[size]
        )}>
          {adventure.title}
        </h3>
        <p className="text-ink-600 text-sm leading-relaxed overflow-hidden max-h-[60px]">
          {adventure.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        {/* Grade Levels */}
        <div className="flex items-center text-sm text-ink-600">
          <Icon name="users" size={16} className="mr-2 flex-shrink-0" />
          <span>Grades: {adventure.gradeLevel.join(', ')}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center text-sm text-ink-600">
          <Icon name="clock" size={16} className="mr-2 flex-shrink-0" />
          <span>{adventure.estimatedTime}</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {adventure.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {skill}
            </span>
          ))}
          {adventure.skills.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              +{adventure.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" />

      {/* Play Now Button or Interactive Arrow */}
      {(adventure.htmlPath || adventure.componentGame) ? (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-250">
          <button
            className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <Icon name="play" size={16} />
            Play Now
          </button>
        </div>
      ) : (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-250">
          <Icon name="chevronRight" size={20} className="text-brand-500" />
        </div>
      )}
    </div>
  );
}