'use client';

import Icon from '../Icon';

interface AchievementBadgeProps {
  title: string;
  description: string;
  type: 'completion' | 'streak' | 'score' | 'time';
  category?: string | null;
  earnedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
}

export default function AchievementBadge({
  title,
  description,
  type,
  category,
  earnedAt,
  size = 'md',
  showDate = false,
}: AchievementBadgeProps) {
  const typeConfig = {
    completion: {
      icon: 'trophy',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    streak: {
      icon: 'fire',
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    score: {
      icon: 'star',
      color: 'from-blue-400 to-purple-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    time: {
      icon: 'clock',
      color: 'from-green-400 to-teal-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
  };

  const config = typeConfig[type] || typeConfig.completion;

  const sizeConfig = {
    sm: {
      badge: 'w-12 h-12',
      icon: 24,
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      badge: 'w-16 h-16',
      icon: 32,
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      badge: 'w-20 h-20',
      icon: 40,
      title: 'text-lg',
      description: 'text-base',
    },
  };

  const sizeStyle = sizeConfig[size];

  return (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Badge Icon */}
      <div
        className={`${sizeStyle.badge} rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-md`}
      >
        <Icon name={config.icon} size={sizeStyle.icon} className="text-white" />
      </div>

      {/* Achievement Details */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-ink-800 ${sizeStyle.title} truncate`}>
          {title}
        </h4>
        <p className={`text-ink-600 ${sizeStyle.description} mt-0.5`}>
          {description}
        </p>

        {/* Category Badge */}
        {category && (
          <span
            className={`inline-block mt-2 px-2 py-0.5 ${config.bgColor} ${config.textColor} text-xs font-medium rounded`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        )}

        {/* Earned Date */}
        {showDate && earnedAt && (
          <p className="text-xs text-ink-400 mt-2">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * AchievementGrid - Display multiple achievements in a grid
 */
interface AchievementGridProps {
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    type: 'completion' | 'streak' | 'score' | 'time';
    category?: string | null;
    earnedAt?: Date;
  }>;
  columns?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  showDates?: boolean;
}

export function AchievementGrid({
  achievements,
  columns = 2,
  size = 'md',
  showDates = false,
}: AchievementGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Icon name="trophy" size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-ink-500">No achievements yet</p>
        <p className="text-sm text-ink-400 mt-1">
          Complete adventures to earn badges!
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          title={achievement.title}
          description={achievement.description}
          type={achievement.type as any}
          category={achievement.category}
          earnedAt={achievement.earnedAt}
          size={size}
          showDate={showDates}
        />
      ))}
    </div>
  );
}
