'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserProgress {
  id: string;
  userId: string;
  adventureId: string;
  adventureType: string;
  category: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
  score: number | null;
  timeSpent: number;
  completedAt: Date | null;
  lastAccessed: Date;
  createdAt: Date;
}

export interface ProgressStats {
  totalAdventures: number;
  completed: number;
  inProgress: number;
  totalTimeSpent: number;
  averageScore: number;
  byCategory: Record<string, {
    total: number;
    completed: number;
    averageScore: number;
  }>;
  recentActivity: UserProgress[];
}

export interface UserProgressData {
  progress: UserProgress[];
  achievements: any[];
  stats: ProgressStats;
}

/**
 * Hook to fetch and manage user progress data
 */
export function useUserProgress() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<UserProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/progress/user');

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [session, status]);

  return {
    data,
    loading,
    error,
    refetch: fetchProgress,
  };
}

/**
 * Hook to get progress for a specific adventure
 */
export function useAdventureProgress(adventureId: string | null) {
  const { data } = useUserProgress();

  if (!adventureId || !data) {
    return null;
  }

  return data.progress.find(p => p.adventureId === adventureId) || null;
}

/**
 * Hook to start tracking an adventure
 */
export function useStartAdventure() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAdventure = async (
    adventureId: string,
    adventureType: 'game' | 'lesson',
    category: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/progress/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adventureId,
          adventureType,
          category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start adventure');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to start adventure');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    startAdventure,
    loading,
    error,
  };
}

/**
 * Hook to update adventure progress
 */
export function useUpdateProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = async (
    adventureId: string,
    updates: {
      timeSpent?: number;
      score?: number;
      status?: 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adventureId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update progress');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProgress,
    loading,
    error,
  };
}

/**
 * Hook to complete an adventure
 */
export function useCompleteAdventure() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeAdventure = async (
    adventureId: string,
    score?: number,
    timeSpent?: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adventureId,
          score,
          timeSpent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete adventure');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to complete adventure');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeAdventure,
    loading,
    error,
  };
}
