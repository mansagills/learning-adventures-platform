'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Link from 'next/link';

function ClassroomDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Classroom</h1>
              <p className="mt-1 text-gray-600">
                Welcome back, {session?.user?.name || 'Teacher'}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Icon name="arrow-left" size={16} />
              <span>Back to Platform</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">Total Students</p>
                <p className="text-3xl font-bold text-ink-800 mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                <Icon name="users" size={24} className="text-brand-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">Active Assignments</p>
                <p className="text-3xl font-bold text-ink-800 mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <Icon name="book" size={24} className="text-accent-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">Avg. Completion</p>
                <p className="text-3xl font-bold text-ink-800 mt-2">0%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="chart" size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink-800">Students</h2>
              <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm">
                Add Student
              </button>
            </div>
            <div className="text-center py-12">
              <Icon name="users" size={48} className="text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500 mb-2">No students yet</p>
              <p className="text-sm text-ink-400">
                Add students to start tracking their progress
              </p>
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink-800">Assignments</h2>
              <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm">
                Create Assignment
              </button>
            </div>
            <div className="text-center py-12">
              <Icon name="book" size={48} className="text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500 mb-2">No assignments yet</p>
              <p className="text-sm text-ink-400">
                Create assignments from the catalog
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-ink-800 mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <Icon name="chart" size={48} className="text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500 mb-2">No activity yet</p>
            <p className="text-sm text-ink-400">
              Student activity will appear here
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="info" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Teacher Dashboard - Coming Soon
              </h3>
              <p className="text-blue-800 mb-3">
                This is a placeholder for the teacher classroom management system. Future features will include:
              </p>
              <ul className="space-y-1 text-blue-700">
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">•</span>
                  <span>Student roster management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">•</span>
                  <span>Assignment creation and tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">•</span>
                  <span>Individual student progress monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">•</span>
                  <span>Class-wide analytics and insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">•</span>
                  <span>Communication tools for students and parents</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TeacherClassroomPage() {
  return (
    <ProtectedRoute requiredRole="TEACHER">
      <ClassroomDashboard />
    </ProtectedRoute>
  );
}
