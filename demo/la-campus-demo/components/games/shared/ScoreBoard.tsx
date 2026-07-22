import React from 'react';

interface ScoreBoardProps {
  score: number;
  level?: number;
  lives?: number;
  timeRemaining?: number;
  badges?: string[];
  className?: string;
}

export function ScoreBoard({
  score,
  level,
  lives,
  timeRemaining,
  badges = [],
  className = '',
}: ScoreBoardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {score.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Score
          </div>
        </div>

        {/* Level */}
        {level !== undefined && (
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{level}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Level
            </div>
          </div>
        )}

        {/* Lives */}
        {lives !== undefined && (
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-1">
              {Array.from({ length: Math.max(5, lives) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < lives ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Lives
            </div>
          </div>
        )}

        {/* Time */}
        {timeRemaining !== undefined && (
          <div className="text-center">
            <div
              className={`text-xl font-bold ${timeRemaining <= 30 ? 'text-red-600' : 'text-green-600'}`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Time
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-1">
              {badges.slice(0, 3).map((badge, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold"
                  title={badge}
                >
                  🏆
                </div>
              ))}
              {badges.length > 3 && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                  +{badges.length - 3}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Badges
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
