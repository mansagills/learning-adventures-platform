'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import Icon from '@/components/Icon';

function ProgressContent() {
  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Your Progress</h1>
          <p className="text-lg text-ink-600">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">XP Earned</span>
              <Icon name="star" size={20} className="text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-ink-900">1,250</div>
            <div className="text-sm text-green-600 mt-1">+150 this week</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Courses Completed</span>
              <Icon name="book" size={20} className="text-brand-500" />
            </div>
            <div className="text-3xl font-bold text-ink-900">3</div>
            <div className="text-sm text-gray-500 mt-1">5 in progress</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Current Streak</span>
              <Icon name="flame" size={20} className="text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-ink-900">7</div>
            <div className="text-sm text-gray-500 mt-1">days</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Badges Earned</span>
              <Icon name="trophy" size={20} className="text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-ink-900">12</div>
            <div className="text-sm text-gray-500 mt-1">3 more to unlock</div>
          </div>
        </div>

        {/* Current Learning Goals */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Learning Goals</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Complete Math Course</span>
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Earn 2000 XP this month</span>
                <span className="text-sm text-gray-600">62%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">30-day Learning Streak</span>
                <span className="text-sm text-gray-600">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon name="check" size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-900">Completed "Fractions Fundamentals"</p>
                <p className="text-sm text-gray-600">Earned 50 XP • 2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Icon name="trophy" size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-900">Earned "Math Master" badge</p>
                <p className="text-sm text-gray-600">Achievement unlocked • Yesterday</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Icon name="book" size={20} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-900">Started "Science Adventures"</p>
                <p className="text-sm text-gray-600">New course enrolled • 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  );
}
