'use client';

import Icon from '../Icon';
import type { Adventure } from '@/lib/catalogData';
import { getGameUrl, getSubjectDisplay, getDifficultyDisplay } from '@/lib/games/gameHelpers';

interface UserProgress {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  timeSpent: number;
  completedAt: Date | null;
  lastAccessed: Date;
}

interface GameCardProps {
  game: Adventure;
  progress?: UserProgress | null;
}

const subjectColors: Record<string, string> = {
  math: 'bg-gradient-to-r from-ocean-400 to-ocean-500',
  science: 'bg-gradient-to-r from-brand-400 to-brand-500',
  english: 'bg-gradient-to-r from-coral-400 to-coral-500',
  history: 'bg-gradient-to-r from-sunshine-400 to-sunshine-500',
  interdisciplinary: 'bg-gradient-to-r from-accent-400 to-accent-500',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-grass-100 text-grass-700',
  medium: 'bg-sunshine-100 text-sunshine-700',
  hard: 'bg-coral-100 text-coral-700',
};

export default function GameCard({ game, progress }: GameCardProps) {
  const gameUrl = getGameUrl(game);
  const subjectDisplay = getSubjectDisplay(game.category);
  const difficultyDisplay = getDifficultyDisplay(game.difficulty);
  const subjectColor = subjectColors[game.category] || 'bg-gradient-to-r from-gray-400 to-gray-500';
  const difficultyColor = difficultyColors[game.difficulty] || 'bg-gray-100 text-gray-700';

  // Calculate play count from timeSpent (rough estimate)
  const playCount = progress ? Math.max(1, Math.floor(progress.timeSpent / 10)) : 0;

  // Get status badge
  const getStatusBadge = () => {
    if (!progress || progress.status === 'NOT_STARTED') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
          Not Played
        </span>
      );
    }

    if (progress.status === 'COMPLETED') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded flex items-center gap-1">
          <Icon name="check" size={12} />
          Completed
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded">
        In Progress
      </span>
    );
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Subject Color Header */}
      <div className={`h-2 ${subjectColor}`}></div>

      <div className="p-6">
        {/* Subject Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded flex items-center gap-1">
            <span>{subjectDisplay.emoji}</span>
            <span className="capitalize">{game.category}</span>
          </span>
          {getStatusBadge()}
        </div>

        {/* Game Icon/Image */}
        <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-accent-100 rounded-lg flex items-center justify-center mb-4">
          <Icon name="gamepad" size={32} className="text-brand-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-ink-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
          {game.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description}</p>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Difficulty Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${difficultyColor}`}>
            <span>{difficultyDisplay.emoji}</span>
            <span>{difficultyDisplay.label}</span>
          </span>

          {/* Grade Levels */}
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            Grades {game.gradeLevel.join(', ')}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Time Estimate */}
          <div className="bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={16} className="text-ocean-600" />
              <div>
                <div className="text-xs text-gray-600">Time</div>
                <div className="text-sm font-bold text-ink-900">{game.estimatedTime}</div>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          {progress ? (
            <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Icon name={progress.status === 'COMPLETED' ? 'trophy' : 'star'} size={16} className="text-brand-600" />
                <div>
                  <div className="text-xs text-gray-600">
                    {progress.score !== null ? 'Best Score' : 'Played'}
                  </div>
                  <div className="text-sm font-bold text-ink-900">
                    {progress.score !== null ? `${progress.score}%` : `${playCount}x`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-sunshine-50 to-sunshine-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Icon name="star" size={16} className="text-sunshine-600" />
                <div>
                  <div className="text-xs text-gray-600">Status</div>
                  <div className="text-sm font-bold text-ink-900">New</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Preview */}
        {game.skills && game.skills.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-1">Skills:</div>
            <div className="flex flex-wrap gap-1">
              {game.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded">
                  {skill}
                </span>
              ))}
              {game.skills.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{game.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <a
          href={gameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-3 text-center text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-all duration-200 group-hover:shadow-md flex items-center justify-center gap-2"
        >
          <Icon name="gamepad" size={16} />
          <span>Play Game</span>
          <Icon name="external" size={14} className="opacity-70" />
        </a>
      </div>
    </div>
  );
}
