'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserAchievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  category: string | null;
  earnedAt: Date;
}

export interface AchievementData {
  achievements: UserAchievement[];
  grouped: {
    completion: UserAchievement[];
    streak: UserAchievement[];
    score: UserAchievement[];
    time: UserAchievement[];
  };
  byCategory: Record<string, UserAchievement[]>;
  totalCount: number;
}

/**
 * Hook to fetch and manage user achievements
 */
export function useAchievements() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/achievements/user');

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load achievements');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [session, status]);

  return {
    data,
    loading,
    error,
    refetch: fetchAchievements,
  };
}

/**
 * Hook to get achievements by type
 */
export function useAchievementsByType(
  type: 'completion' | 'streak' | 'score' | 'time'
) {
  const { data } = useAchievements();

  if (!data) {
    return [];
  }

  return data.grouped[type] || [];
}

/**
 * Hook to get achievements by category
 */
export function useAchievementsByCategory(category: string) {
  const { data } = useAchievements();

  if (!data || !category) {
    return [];
  }

  return data.byCategory[category] || [];
}

/**
 * Hook to get recent achievements (last N)
 */
export function useRecentAchievements(limit: number = 5) {
  const { data } = useAchievements();

  if (!data) {
    return [];
  }

  return data.achievements.slice(0, limit);
}
