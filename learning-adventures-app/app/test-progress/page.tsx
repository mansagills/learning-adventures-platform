'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useStartAdventure, useUpdateProgress, useCompleteAdventure, useUserProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AchievementGrid } from '@/components/progress/AchievementBadge';
import ProgressStats from '@/components/progress/ProgressStats';

function ProgressTestContent() {
  const { data: session } = useSession();
  const [adventureId, setAdventureId] = useState('test-adventure-' + Date.now());
  const [score, setScore] = useState(85);
  const [timeSpent, setTimeSpent] = useState(15);
  const [message, setMessage] = useState('');

  const { data: progressData, loading: progressLoading, refetch: refetchProgress } = useUserProgress();
  const { data: achievementData, loading: achievementsLoading, refetch: refetchAchievements } = useAchievements();
  const { startAdventure } = useStartAdventure();
  const { updateProgress } = useUpdateProgress();
  const { completeAdventure } = useCompleteAdventure();

  const handleStart = async () => {
    try {
      const result = await startAdventure(adventureId, 'game', 'math');
      setMessage(`✅ Started tracking: ${adventureId}`);
      await refetchProgress();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProgress(adventureId, { timeSpent, score });
      setMessage(`✅ Updated progress: ${timeSpent}m, ${score}%`);
      await refetchProgress();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleComplete = async () => {
    try {
      const result = await completeAdventure(adventureId, score, timeSpent);
      setMessage(`✅ Completed! Earned ${result.newAchievements?.length || 0} new achievements!`);
      await refetchProgress();
      await refetchAchievements();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  if (progressLoading || achievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-800 mb-2">Progress Tracking Test Page</h1>
          <p className="text-ink-600">
            Logged in as: <span className="font-medium">{session?.user?.email}</span>
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-ink-800 mb-4">Test Progress Tracking</h2>

          <div className="space-y-4">
            {/* Adventure ID */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Adventure ID
              </label>
              <input
                type="text"
                value={adventureId}
                onChange={(e) => setAdventureId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="test-adventure-123"
              />
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Score: {score}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Time Spent */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Time Spent: {timeSpent} minutes
              </label>
              <input
                type="range"
                min="1"
                max="60"
                value={timeSpent}
                onChange={(e) => setTimeSpent(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                1. Start Adventure
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
              >
                2. Update Progress
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                3. Complete Adventure
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-ink-700">{message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Progress Stats */}
        {progressData && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-ink-800 mb-4">Your Current Progress</h2>
            <ProgressStats stats={progressData.stats} showCategories={true} />
          </div>
        )}

        {/* Achievements */}
        {achievementData && achievementData.achievements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-ink-800 mb-4">
              Your Achievements ({achievementData.totalCount})
            </h2>
            <AchievementGrid
              achievements={achievementData.achievements}
              columns={2}
              size="md"
              showDates={true}
            />
          </div>
        )}

        {/* Recent Activity */}
        {progressData && progressData.progress.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-ink-800 mb-4">All Progress Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-ink-700">Adventure ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-ink-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-ink-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-ink-700">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-ink-700">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-ink-700">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.progress.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-ink-800">{p.adventureId}</td>
                      <td className="py-3 px-4 text-sm text-ink-600">{p.category}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          p.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-ink-800">{p.score || '-'}%</td>
                      <td className="py-3 px-4 text-sm text-ink-600">{p.timeSpent}m</td>
                      <td className="py-3 px-4 text-sm text-ink-600">
                        {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">How to Use This Test Page</h3>
          <ol className="space-y-2 text-blue-800">
            <li><strong>1. Start Adventure:</strong> Creates a new progress record with IN_PROGRESS status</li>
            <li><strong>2. Update Progress:</strong> Updates score and time spent (optional step)</li>
            <li><strong>3. Complete Adventure:</strong> Marks as COMPLETED and checks for new achievements!</li>
            <li className="mt-4 pt-4 border-t border-blue-200">
              💡 <strong>Tip:</strong> Try completing adventures with different scores (100% for Perfect Score achievement!)
              or complete multiple adventures to earn milestone achievements.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function ProgressTestPage() {
  return (
    <ProtectedRoute>
      <ProgressTestContent />
    </ProtectedRoute>
  );
}
