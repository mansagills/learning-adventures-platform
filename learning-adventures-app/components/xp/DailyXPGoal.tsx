/**
 * Daily XP Goal Component
 *
 * Shows progress toward daily XP goal (default: 200 XP)
 */

'use client';

import { useEffect, useState } from 'react';

interface DailyXPData {
  totalXP: number;
  xpFromLessons: number;
  xpFromGames: number;
  lessonsCompleted: number;
  gamesCompleted: number;
}

const DAILY_XP_GOAL = 200;

export default function DailyXPGoal() {
  const [dailyXP, setDailyXP] = useState<DailyXPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyXP();
  }, []);

  const fetchDailyXP = async () => {
    try {
      const response = await fetch('/api/level/status');
      if (response.ok) {
        const data = await response.json();
        setDailyXP(data.dailyXP || {
          totalXP: 0,
          xpFromLessons: 0,
          xpFromGames: 0,
          lessonsCompleted: 0,
          gamesCompleted: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch daily XP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!dailyXP) {
    return null;
  }

  const progressPercentage = Math.min(100, (dailyXP.totalXP / DAILY_XP_GOAL) * 100);
  const isGoalReached = dailyXP.totalXP >= DAILY_XP_GOAL;

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
      isGoalReached
        ? 'border-green-300 bg-green-50'
        : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Today's Progress</h3>
        {isGoalReached && (
          <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Goal Reached!
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold text-indigo-600">
            {dailyXP.totalXP}
          </span>
          <span className="text-sm text-gray-500">/ {DAILY_XP_GOAL} XP</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isGoalReached
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="text-xs text-gray-600">
          {isGoalReached ? (
            <span className="text-green-700 font-medium">
              🎉 Amazing! You've exceeded your daily goal by {dailyXP.totalXP - DAILY_XP_GOAL} XP!
            </span>
          ) : (
            <span>
              {DAILY_XP_GOAL - dailyXP.totalXP} XP to reach your daily goal
            </span>
          )}
        </div>
      </div>

      {(dailyXP.lessonsCompleted > 0 || dailyXP.gamesCompleted > 0) && (
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {dailyXP.lessonsCompleted > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-500">📚</span>
                <div>
                  <div className="font-medium text-gray-700">
                    {dailyXP.lessonsCompleted}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dailyXP.lessonsCompleted === 1 ? 'Lesson' : 'Lessons'}
                  </div>
                </div>
              </div>
            )}
            {dailyXP.gamesCompleted > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-purple-500">🎮</span>
                <div>
                  <div className="font-medium text-gray-700">
                    {dailyXP.gamesCompleted}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dailyXP.gamesCompleted === 1 ? 'Game' : 'Games'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
