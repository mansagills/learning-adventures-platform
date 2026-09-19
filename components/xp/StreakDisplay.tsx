/**
 * Streak Display Component
 *
 * Shows the user's current learning streak with fire icon
 */

'use client';

import { useEffect, useState } from 'react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export default function StreakDisplay() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const response = await fetch('/api/level/status');
      if (response.ok) {
        const data = await response.json();
        setStreakData({
          currentStreak: data.level?.currentStreak || 0,
          longestStreak: data.level?.longestStreak || 0,
          lastActivityDate: data.level?.lastActivityDate || null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '🌱';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 30) return '🔥🔥🔥';
    return '🔥🔥🔥🏆';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'Great start! Keep it going!';
    if (streak < 7) return "You're on fire!";
    if (streak < 30) return 'Amazing streak!';
    return 'Legendary dedication!';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-orange-200 hover:border-orange-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">
              {getStreakEmoji(streakData.currentStreak)}
            </span>
            <h3 className="text-sm font-medium text-gray-600">Daily Streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-500">
              {streakData.currentStreak}
            </span>
            <span className="text-gray-500">
              {streakData.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {getStreakMessage(streakData.currentStreak)}
          </p>
        </div>

        {streakData.longestStreak > streakData.currentStreak && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Personal Best</div>
            <div className="text-lg font-semibold text-gray-700">
              {streakData.longestStreak} days
            </div>
          </div>
        )}
      </div>

      {streakData.currentStreak >= 3 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-600">
            💡 <span className="font-medium">Streak Bonus:</span> You're earning{' '}
            <span className="text-orange-600 font-semibold">
              {streakData.currentStreak >= 30
                ? '2x'
                : streakData.currentStreak >= 7
                  ? '1.5x'
                  : '1.2x'}
            </span>{' '}
            XP on all lessons!
          </div>
        </div>
      )}
    </div>
  );
}
