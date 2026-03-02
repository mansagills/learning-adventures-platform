'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Link from 'next/link';
import { useOversight, Student } from '@/hooks/useOversight';

interface ChildCardProps {
  child: Student;
  onClick: () => void;
}

function ChildCard({ child, onClick }: ChildCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-ink-800 group-hover:text-brand-600 transition-colors mb-1">
            {child.name}
          </h3>
          <p className="text-sm text-ink-500">Grade {child.gradeLevel}</p>
        </div>
        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
          <Icon name="user" size={24} className="text-brand-600" />
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center justify-center my-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - child.stats.completionRate / 100)}`}
              className="text-brand-600 transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-ink-800">
              {child.stats.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-600">
            {child.stats.completedAdventures}
          </p>
          <p className="text-xs text-ink-500 mt-1">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">
            {child.stats.achievements}
          </p>
          <p className="text-xs text-ink-500 mt-1">Badges</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {child.stats.activeGoals}
          </p>
          <p className="text-xs text-ink-500 mt-1">Goals</p>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium flex items-center justify-center space-x-2 group-hover:bg-brand-600 group-hover:text-white">
        <span>View Detailed Progress</span>
        <Icon name="arrow-right" size={16} />
      </button>
    </div>
  );
}

function ParentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { students: children, loading, error } = useOversight();

  const handleChildClick = (childId: string) => {
    router.push(`/parent/child/${childId}`);
  };

  // Calculate family stats
  const totalChildren = children.length;
  const avgCompletion =
    totalChildren > 0
      ? Math.round(
          children.reduce((sum, c) => sum + c.stats.completionRate, 0) /
            totalChildren
        )
      : 0;
  const totalAdventures = children.reduce(
    (sum, c) => sum + c.stats.completedAdventures,
    0
  );
  const totalAchievements = children.reduce(
    (sum, c) => sum + c.stats.achievements,
    0
  );
  const totalActiveGoals = children.reduce(
    (sum, c) => sum + c.stats.activeGoals,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Parent Dashboard
              </h1>
              <p className="mt-1 text-gray-600">
                Monitor your {totalChildren === 1 ? "child's" : "children's"}{' '}
                learning journey
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/parent/children"
                className="flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
              >
                <Icon name="plus" size={16} />
                <span>Manage Children</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Icon name="arrow-left" size={16} />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Overview Stats */}
        {totalChildren > 0 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-500">Children</p>
                  <p className="text-3xl font-bold text-ink-800 mt-2">
                    {totalChildren}
                  </p>
                </div>
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Icon name="users" size={24} className="text-brand-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-500">
                    Adventures Completed
                  </p>
                  <p className="text-3xl font-bold text-ink-800 mt-2">
                    {totalAdventures}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="check" size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-500">
                    Total Badges
                  </p>
                  <p className="text-3xl font-bold text-ink-800 mt-2">
                    {totalAchievements}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon name="star" size={24} className="text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-500">
                    Active Goals
                  </p>
                  <p className="text-3xl font-bold text-ink-800 mt-2">
                    {totalActiveGoals}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Icon name="chart" size={24} className="text-accent-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Children List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink-800">Your Children</h2>
            <p className="text-sm text-ink-500 mt-1">
              Click on any card to view detailed progress and learning insights
            </p>
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
              <p className="mt-4 text-ink-500">
                Loading children's progress...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="info" size={20} className="text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && children.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold text-ink-800 mb-2">
                No Children Added Yet
              </h3>
              <p className="text-ink-500 mb-6 max-w-md mx-auto">
                Add your children to start monitoring their learning progress
                and help them achieve their educational goals.
              </p>
              <Link
                href="/parent/children"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
              >
                <Icon name="plus" size={20} />
                <span>Add Your First Child</span>
              </Link>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="info" size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      How It Works
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Create child accounts with COPPA-compliant privacy
                      protections:
                    </p>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li className="flex items-center space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>
                          Children log in with a fun username and 4-digit PIN
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>No email address required for children</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>
                          You control their account and can change their PIN
                          anytime
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>Monitor their progress from this dashboard</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && children.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onClick={() => handleChildClick(child.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Parenting Tips */}
        {!loading && children.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="star" size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Tips for Supporting Your Child's Learning
                </h3>
                <ul className="space-y-2 text-green-700 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>
                      Celebrate small wins and progress, not just perfect scores
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>
                      Ask about what they learned, not just what they completed
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>
                      Help them set realistic goals and break them into smaller
                      steps
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>
                      Encourage regular learning habits with consistent
                      schedules
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>
                      Watch for subject areas where they excel or need extra
                      support
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ParentDashboardPage() {
  return (
    <ProtectedRoute requiredRole="PARENT">
      <ParentDashboard />
    </ProtectedRoute>
  );
}
