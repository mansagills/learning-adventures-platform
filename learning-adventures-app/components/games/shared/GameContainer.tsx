import React from 'react';

interface GameContainerProps {
  title: string;
  children: React.ReactNode;
  onExit?: () => void;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export function GameContainer({
  title,
  children,
  onExit,
  showProgress = false,
  progress = 0,
  className = '',
}: GameContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 ${className}`}>
      {/* Game Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center gap-4">
            {showProgress && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
            {onExit && (
              <button
                onClick={onExit}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Exit Game
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}