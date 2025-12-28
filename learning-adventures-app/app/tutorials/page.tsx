'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import Icon from '@/components/Icon';
import Link from 'next/link';

function TutorialsContent() {
  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Tutorials</h1>
          <p className="text-lg text-ink-600">
            Step-by-step guides to help you master new concepts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutorials..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
            <option>All Subjects</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>History</option>
          </select>
        </div>

        {/* Tutorial Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tutorial Card */}
          <Link
            href={"/tutorials/fractions-intro" as any}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
              <Icon name="lightbulb" size={48} className="text-white/80" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  10 min
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded">
                  Math
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Beginner
                </span>
              </div>
              <h3 className="font-bold text-lg text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                Introduction to Fractions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn what fractions are and how to identify numerators and denominators
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">6 steps</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Icon name="star" size={14} />
                  <span className="text-gray-700 font-medium">4.9</span>
                </div>
              </div>
            </div>
          </Link>

          {/* More Tutorial Cards */}
          <Link
            href={"/tutorials/plant-photosynthesis" as any}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="h-32 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center relative">
              <Icon name="flask" size={48} className="text-white/80" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  15 min
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Science
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  Intermediate
                </span>
              </div>
              <h3 className="font-bold text-lg text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                How Photosynthesis Works
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Discover how plants make their own food using sunlight, water, and CO₂
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">8 steps</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Icon name="star" size={14} />
                  <span className="text-gray-700 font-medium">4.8</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href={"/tutorials/sentence-structure" as any}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="h-32 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center relative">
              <Icon name="book" size={48} className="text-white/80" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  12 min
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                  English
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Beginner
                </span>
              </div>
              <h3 className="font-bold text-lg text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                Building Better Sentences
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Master the basics of sentence structure with subjects, verbs, and objects
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">5 steps</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Icon name="star" size={14} />
                  <span className="text-gray-700 font-medium">4.7</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Continue Learning */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Continue Learning</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="lightbulb" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-ink-900">Introduction to Fractions</h3>
                <p className="text-sm text-gray-600">Step 3 of 6 • 5 min remaining</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              <Link
                href={"/tutorials/fractions-intro" as any}
                className="px-4 py-2 bg-brand-500 text-white font-medium text-sm rounded-lg hover:bg-brand-600 transition-colors"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Tutorials */}
        <div>
          <h2 className="text-xl font-bold text-ink-900 mb-4">Popular Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="calculator" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-ink-900">Multiplication Tables</h3>
                <p className="text-sm text-gray-600">12 steps • 20 min</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Icon name="star" size={16} />
                <span className="text-sm font-medium text-gray-700">5.0</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="globe" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-ink-900">Water Cycle Explained</h3>
                <p className="text-sm text-gray-600">7 steps • 12 min</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Icon name="star" size={16} />
                <span className="text-sm font-medium text-gray-700">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function TutorialsPage() {
  return (
    <ProtectedRoute>
      <TutorialsContent />
    </ProtectedRoute>
  );
}
