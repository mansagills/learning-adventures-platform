import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  category: string | null;
  targetType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'PAUSED' | 'ARCHIVED';
  startDate: string;
  deadline: string | null;
  completedAt: string | null;
  streakCount: number;
  icon: string | null;
  color: string | null;
  priority: number;
  createdAt: string;
  updatedAt: string;
  progressPercent?: number;
  isComplete?: boolean;
  isExpired?: boolean;
}

interface GoalsResponse {
  goals: LearningGoal[];
  count: number;
}

interface UseGoalsOptions {
  status?: string;
  type?: string;
  autoRefresh?: boolean;
}

export function useGoals(options: UseGoalsOptions = {}) {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.type) params.append('type', options.type);

      const response = await fetch(`/api/goals?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const data: GoalsResponse = await response.json();
      setGoals(data.goals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  }, [session, options.status, options.type]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(fetchGoals, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, fetchGoals]);

  const createGoal = async (goalData: {
    title: string;
    description?: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    category?: string;
    targetType: string;
    targetValue: number;
    unit: string;
    deadline?: string;
    icon?: string;
    color?: string;
    priority?: number;
  }) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create goal');
      }

      const data = await response.json();
      await fetchGoals(); // Refresh goals list
      return data.goal;
    } catch (err) {
      throw err;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<LearningGoal>) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update goal');
      }

      const data = await response.json();
      await fetchGoals(); // Refresh goals list
      return data.goal;
    } catch (err) {
      throw err;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete goal');
      }

      await fetchGoals(); // Refresh goals list
    } catch (err) {
      throw err;
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/complete`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete goal');
      }

      const data = await response.json();
      await fetchGoals(); // Refresh goals list
      return data.goal;
    } catch (err) {
      throw err;
    }
  };

  const updateProgress = async (goalId: string, options: { increment?: number; value?: number }) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update progress');
      }

      const data = await response.json();
      await fetchGoals(); // Refresh goals list
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    goals,
    loading,
    error,
    refresh: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    updateProgress
  };
}

// Helper hooks for specific goal types
export function useActiveGoals() {
  return useGoals({ status: 'ACTIVE', autoRefresh: true });
}

export function useDailyGoals() {
  return useGoals({ type: 'DAILY', status: 'ACTIVE', autoRefresh: true });
}

export function useWeeklyGoals() {
  return useGoals({ type: 'WEEKLY', status: 'ACTIVE' });
}

export function useCompletedGoals() {
  return useGoals({ status: 'COMPLETED' });
}
