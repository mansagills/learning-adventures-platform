'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import Icon from '@/components/Icon';
import Link from 'next/link';

function MyLibraryContent() {
  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">My Library</h1>
          <p className="text-lg text-ink-600">
            Your enrolled courses and saved content
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-brand-600 border-b-2 border-brand-600">
            All Courses
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            In Progress
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Completed
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Saved
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Course Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute top-3 right-3">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                  <Icon name="bookmark" size={16} className="text-gray-700" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded">
                  Mathematics
                </span>
                <span className="text-xs text-gray-500">Grade 4-6</span>
              </div>
              <h3 className="font-bold text-lg text-ink-900 mb-2">
                Fractions & Decimals Mastery
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Master fractions and decimals through interactive lessons and games
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-900">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <Link
                href="/courses/fractions-decimals"
                className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
              >
                Continue Learning
              </Link>
            </div>
          </div>

          {/* More course cards would go here */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gradient-to-br from-green-500 to-teal-600 relative">
              <div className="absolute top-3 right-3">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                  <Icon name="bookmark" size={16} className="text-gray-700" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Science
                </span>
                <span className="text-xs text-gray-500">Grade 3-5</span>
              </div>
              <h3 className="font-bold text-lg text-ink-900 mb-2">
                Plant Life Cycles
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore how plants grow and reproduce through interactive simulations
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-900">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <Link
                href="/courses/plant-life-cycles"
                className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        </div>

        {/* Empty State (show when no courses) */}
        {/*
        <div className="text-center py-12">
          <Icon name="book" size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-ink-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-6">
            Start learning by enrolling in your first course
          </p>
          <Link
            href="/courses"
            className="inline-block px-6 py-3 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
        */}
      </div>
    </Container>
  );
}

export default function MyLibraryPage() {
  return (
    <ProtectedRoute>
      <MyLibraryContent />
    </ProtectedRoute>
  );
}
