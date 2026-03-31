'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import Icon from '@/components/Icon';
import Link from 'next/link';

function PracticeContent() {
  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Practice</h1>
          <p className="text-lg text-ink-600">
            Sharpen your skills with interactive games and activities
          </p>
        </div>

        {/* Subject Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              name: 'Math',
              icon: 'calculator',
              color: 'from-blue-500 to-purple-600',
              count: 45,
            },
            {
              name: 'Science',
              icon: 'flask',
              color: 'from-green-500 to-teal-600',
              count: 32,
            },
            {
              name: 'English',
              icon: 'book',
              color: 'from-orange-500 to-red-600',
              count: 28,
            },
            {
              name: 'History',
              icon: 'globe',
              color: 'from-amber-500 to-yellow-600',
              count: 20,
            },
            {
              name: 'All',
              icon: 'grid',
              color: 'from-gray-600 to-gray-800',
              count: 125,
            },
          ].map((category) => (
            <button
              key={category.name}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}
              >
                <Icon
                  name={category.icon as any}
                  size={24}
                  className="text-white"
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-ink-900">{category.name}</div>
                <div className="text-xs text-gray-500">
                  {category.count} games
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recommended for You */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Game Card */}
            <Link
              href="/games/fraction-pizza"
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                <Icon name="gamepad" size={48} className="text-white/80" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded">
                    15 min
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded">
                    Math
                  </span>
                  <div className="flex items-center gap-1">
                    <Icon name="star" size={14} className="text-amber-500" />
                    <span className="text-xs font-medium text-gray-700">
                      4.8
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                  Fraction Pizza Party
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Practice fractions by slicing pizzas into equal parts
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Grade 4-6</span>
                  <span>Played 3 times</span>
                </div>
              </div>
            </Link>

            {/* More game cards */}
            <Link
              href="/games/element-matcher"
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="h-40 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center relative">
                <Icon name="flask" size={48} className="text-white/80" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded">
                    10 min
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    Science
                  </span>
                  <div className="flex items-center gap-1">
                    <Icon name="star" size={14} className="text-amber-500" />
                    <span className="text-xs font-medium text-gray-700">
                      4.9
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                  Element Matcher
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Match chemical elements with their symbols and properties
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Grade 5-7</span>
                  <span>Not played yet</span>
                </div>
              </div>
            </Link>

            <Link
              href="/games/grammar-quest"
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="h-40 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center relative">
                <Icon name="book" size={48} className="text-white/80" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded">
                    20 min
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                    English
                  </span>
                  <div className="flex items-center gap-1">
                    <Icon name="star" size={14} className="text-amber-500" />
                    <span className="text-xs font-medium text-gray-700">
                      4.7
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                  Grammar Quest
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Adventure through grammar rules and sentence structure
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Grade 3-5</span>
                  <span>Played 1 time</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Daily Challenge</h2>
              <p className="text-white/90 text-sm">
                Complete today's challenge to earn bonus XP
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="trophy" size={32} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={'/practice/daily-challenge' as any}
              className="px-6 py-3 bg-white text-brand-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Challenge
            </Link>
            <span className="text-sm text-white/90">Earn 100 XP</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function PracticePage() {
  return (
    <ProtectedRoute>
      <PracticeContent />
    </ProtectedRoute>
  );
}
