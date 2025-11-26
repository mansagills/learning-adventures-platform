import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Leaderboard Hook
export function useLeaderboard(options: {
  period?: 'weekly' | 'monthly' | 'all-time';
  category?: string;
  type?: 'xp' | 'adventures' | 'score';
  limit?: number;
} = {}) {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    period = 'all-time',
    category,
    type = 'xp',
    limit = 50
  } = options;

  const fetchLeaderboard = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period,
        type,
        limit: limit.toString()
      });

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/leaderboard?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.currentUserRank);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, period, category, type, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    currentUserRank,
    loading,
    error,
    refetch: fetchLeaderboard
  };
}

// Friends Hook
export function useFriends(status: 'ACCEPTED' | 'PENDING' | 'BLOCKED' = 'ACCEPTED') {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/friends?status=${status}`);

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const data = await response.json();
      setFriends(data.friends || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status]);

  const sendFriendRequest = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send friend request');
      }

      await fetchFriends();
      return true;
    } catch (err) {
      console.error('Error sending friend request:', err);
      throw err;
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}/accept`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }

      await fetchFriends();
      return true;
    } catch (err) {
      console.error('Error accepting friend request:', err);
      throw err;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends?friendshipId=${friendshipId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      await fetchFriends();
      return true;
    } catch (err) {
      console.error('Error removing friend:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    loading,
    error,
    refetch: fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend
  };
}

// Challenges Hook
export function useChallenges(status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DECLINED' = 'ACTIVE') {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/challenges?status=${status}`);

      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }

      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status]);

  const createChallenge = async (challengeData: {
    challengedId: string;
    type: string;
    category?: string;
    adventureId?: string;
    goalValue: number;
    unit: string;
    duration?: number;
  }) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create challenge');
      }

      await fetchChallenges();
      return true;
    } catch (err) {
      console.error('Error creating challenge:', err);
      throw err;
    }
  };

  const acceptChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/accept`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to accept challenge');
      }

      await fetchChallenges();
      return true;
    } catch (err) {
      console.error('Error accepting challenge:', err);
      throw err;
    }
  };

  const declineChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges?id=${challengeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to decline challenge');
      }

      await fetchChallenges();
      return true;
    } catch (err) {
      console.error('Error declining challenge:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return {
    challenges,
    loading,
    error,
    refetch: fetchChallenges,
    createChallenge,
    acceptChallenge,
    declineChallenge
  };
}
