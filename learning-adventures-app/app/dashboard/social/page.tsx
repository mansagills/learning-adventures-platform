'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useLeaderboard, useFriends, useChallenges } from '@/hooks/useSocial';
import { format, formatDistanceToNow } from 'date-fns';

interface LeaderboardEntryProps {
  entry: any;
  isCurrentUser: boolean;
  type: string;
}

function LeaderboardEntry({
  entry,
  isCurrentUser,
  type,
}: LeaderboardEntryProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-white text-ink-700 border-gray-200';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
        isCurrentUser
          ? 'bg-brand-50 border-brand-300'
          : getRankColor(entry.rank)
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex items-center justify-center font-bold text-lg">
          {getRankIcon(entry.rank)}
        </div>
        <div>
          <p className="font-semibold text-ink-800">
            {entry.name}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-brand-600">(You)</span>
            )}
          </p>
          <div className="flex items-center space-x-3 text-sm text-ink-600">
            <span>Level {entry.currentLevel}</span>
            {entry.currentStreak > 0 && (
              <>
                <span>•</span>
                <span>🔥 {entry.currentStreak} day streak</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        {type === 'xp' && (
          <>
            <p className="text-2xl font-bold text-brand-600">
              {entry.totalXP.toLocaleString()}
            </p>
            <p className="text-xs text-ink-500">XP</p>
          </>
        )}
        {type === 'adventures' && (
          <>
            <p className="text-2xl font-bold text-green-600">
              {entry.adventuresCompleted}
            </p>
            <p className="text-xs text-ink-500">Adventures</p>
          </>
        )}
        {type === 'score' && (
          <>
            <p className="text-2xl font-bold text-amber-600">
              {entry.averageScore}%
            </p>
            <p className="text-xs text-ink-500">Avg Score</p>
          </>
        )}
      </div>
    </div>
  );
}

function FriendCard({
  friend,
  onRemove,
}: {
  friend: any;
  onRemove?: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
            <Icon name="user" size={24} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-ink-800">{friend.name}</p>
            <p className="text-sm text-ink-500">Level {friend.currentLevel}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm">
            <p className="text-brand-600 font-semibold">
              {friend.totalXP.toLocaleString()} XP
            </p>
            {friend.currentStreak > 0 && (
              <p className="text-orange-600">🔥 {friend.currentStreak} days</p>
            )}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove friend"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  onAccept,
  onDecline,
}: {
  challenge: any;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const { data: session } = useSession();
  const isCreator = challenge.creatorId === session?.user?.id;
  const opponent = isCreator ? challenge.challenged : challenge.creator;
  const myProgress = isCreator
    ? challenge.creatorProgress
    : challenge.challengedProgress;
  const opponentProgress = isCreator
    ? challenge.challengedProgress
    : challenge.creatorProgress;

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'ADVENTURE_RACE':
        return '🏃';
      case 'XP_BATTLE':
        return '⚡';
      case 'SCORE_SHOWDOWN':
        return '🎯';
      case 'STREAK_CHALLENGE':
        return '🔥';
      default:
        return '🏆';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">
              {getChallengeTypeIcon(challenge.type)}
            </span>
            <h3 className="font-semibold text-ink-800">
              {challenge.type
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </h3>
          </div>
          <p className="text-sm text-ink-600">
            vs {opponent.name} • Goal: {challenge.goalValue} {challenge.unit}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            challenge.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : challenge.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : challenge.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {challenge.status}
        </span>
      </div>

      {challenge.status === 'ACTIVE' && (
        <div className="space-y-2 mb-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink-600">You</span>
              <span className="font-semibold text-brand-600">
                {myProgress}/{challenge.goalValue}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((myProgress / challenge.goalValue) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink-600">{opponent.name}</span>
              <span className="font-semibold text-red-600">
                {opponentProgress}/{challenge.goalValue}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((opponentProgress / challenge.goalValue) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>Ends {format(new Date(challenge.endDate), 'MMM dd, yyyy')}</span>
        {challenge.status === 'PENDING' && !isCreator && (
          <div className="flex items-center space-x-2">
            {onAccept && (
              <button
                onClick={onAccept}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            )}
            {onDecline && (
              <button
                onClick={onDecline}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    'leaderboard' | 'friends' | 'challenges'
  >('leaderboard');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<
    'weekly' | 'monthly' | 'all-time'
  >('all-time');
  const [leaderboardType, setLeaderboardType] = useState<
    'xp' | 'adventures' | 'score'
  >('xp');

  const {
    leaderboard,
    currentUserRank,
    loading: leaderboardLoading,
  } = useLeaderboard({
    period: leaderboardPeriod,
    type: leaderboardType,
    limit: 50,
  });

  const {
    friends,
    loading: friendsLoading,
    removeFriend,
  } = useFriends('ACCEPTED');
  const { friends: pendingRequests, acceptFriendRequest } =
    useFriends('PENDING');
  const {
    challenges,
    loading: challengesLoading,
    acceptChallenge,
    declineChallenge,
  } = useChallenges('ACTIVE');
  const { challenges: pendingChallenges } = useChallenges('PENDING');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Social & Competitions
            </h1>
            <p className="mt-1 text-gray-600">
              Compete with friends, climb the leaderboards, and challenge others
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'leaderboard'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-600 hover:text-ink-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="chart" size={20} />
              <span>Leaderboard</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'friends'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-600 hover:text-ink-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="users" size={20} />
              <span>Friends</span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'challenges'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-600 hover:text-ink-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="star" size={20} />
              <span>Challenges</span>
              {pendingChallenges.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingChallenges.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={leaderboardPeriod}
                  onChange={(e) => setLeaderboardPeriod(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="all-time">All Time</option>
                </select>
                <select
                  value={leaderboardType}
                  onChange={(e) => setLeaderboardType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="xp">XP Earned</option>
                  <option value="adventures">Adventures Completed</option>
                  <option value="score">Average Score</option>
                </select>
              </div>
              {currentUserRank && (
                <div className="text-sm text-ink-600">
                  Your rank:{' '}
                  <span className="font-bold text-brand-600">
                    #{currentUserRank}
                  </span>
                </div>
              )}
            </div>

            {leaderboardLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
                <p className="mt-4 text-ink-500">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  name="chart"
                  size={48}
                  className="text-ink-300 mx-auto mb-4"
                />
                <p className="text-ink-500">No leaderboard data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <LeaderboardEntry
                    key={entry.userId}
                    entry={entry}
                    isCurrentUser={entry.userId === session?.user?.id}
                    type={leaderboardType}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-6">
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-ink-800 mb-4">
                  Pending Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-ink-800">
                            {request.name}
                          </p>
                          <p className="text-sm text-ink-500">
                            Grade {request.gradeLevel}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => removeFriend(request.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-ink-800 mb-4">
                Friends ({friends.length})
              </h2>
              {friendsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
                  <p className="mt-4 text-ink-500">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <Icon
                    name="users"
                    size={48}
                    className="text-ink-300 mx-auto mb-4"
                  />
                  <p className="text-ink-500 mb-2">No friends yet</p>
                  <p className="text-sm text-ink-400">
                    Send friend requests to connect with classmates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      friend={friend}
                      onRemove={() => removeFriend(friend.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {pendingChallenges.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-ink-800 mb-4">
                  Incoming Challenges ({pendingChallenges.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onAccept={() => acceptChallenge(challenge.id)}
                      onDecline={() => declineChallenge(challenge.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-ink-800 mb-4">
                Active Challenges ({challenges.length})
              </h2>
              {challengesLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
                  <p className="mt-4 text-ink-500">Loading challenges...</p>
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-12">
                  <Icon
                    name="star"
                    size={48}
                    className="text-ink-300 mx-auto mb-4"
                  />
                  <p className="text-ink-500 mb-2">No active challenges</p>
                  <p className="text-sm text-ink-400">
                    Challenge your friends to learning competitions!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SocialPage() {
  return (
    <ProtectedRoute>
      <SocialDashboard />
    </ProtectedRoute>
  );
}
