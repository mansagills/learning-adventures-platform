/**
 * XP Widget Component
 *
 * Displays user's current level, XP, and progress to next level
 */

'use client';

import { useEffect, useState } from 'react';

interface UserLevel {
  currentLevel: number;
  totalXP: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
}

export default function XPWidget() {
  const [levelData, setLevelData] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevelData();
  }, []);

  const fetchLevelData = async () => {
    try {
      const response = await fetch('/api/level/status');
      if (response.ok) {
        const data = await response.json();
        setLevelData(data.level);
      }
    } catch (error) {
      console.error('Failed to fetch level data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!levelData) {
    return null;
  }

  const progressPercentage = Math.min(
    100,
    (levelData.xpInCurrentLevel /
      (levelData.xpInCurrentLevel + levelData.xpToNextLevel)) *
      100
  );

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-purple-100">Your Level</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl font-bold">{levelData.currentLevel}</span>
            <span className="ml-2 text-purple-200">Level</span>
          </div>
        </div>
        <div className="bg-white/20 rounded-full p-4">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-purple-100">
            Progress to Level {levelData.currentLevel + 1}
          </span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-purple-100 mt-1">
          <span>{levelData.totalXP.toLocaleString()} Total XP</span>
          <span>{levelData.xpToNextLevel} XP needed</span>
        </div>
      </div>
    </div>
  );
}
