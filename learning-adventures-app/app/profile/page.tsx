'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Container from '@/components/Container';
import ProfileSettings from '@/components/ProfileSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export default function ProfilePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-ink-800 mb-2">Profile</h1>
              <p className="text-ink-600">Manage your account settings and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User avatar'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl font-medium">
                        {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-ink-800">
                      {session?.user?.name || 'User'}
                    </h2>
                    <p className="text-ink-600 mb-1">{session?.user?.email}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                      {session?.user?.role?.charAt(0) + session?.user?.role?.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsSettingsOpen(true)}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Icon name="settings" size={16} />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-ink-800 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-ink-600">Full Name</label>
                    <p className="text-ink-800">{session?.user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink-600">Email</label>
                    <p className="text-ink-800">{session?.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink-600">Account Type</label>
                    <p className="text-ink-800">
                      {session?.user?.role?.charAt(0) + session?.user?.role?.slice(1).toLowerCase()}
                    </p>
                  </div>
                  {session?.user?.role === 'STUDENT' && (
                    <div>
                      <label className="text-sm font-medium text-ink-600">Grade Level</label>
                      <p className="text-ink-800">{session?.user?.gradeLevel || 'Not set'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Preferences */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-ink-800 mb-4">Learning Preferences</h3>
                <div>
                  <label className="text-sm font-medium text-ink-600">Subject Interests</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {session?.user?.subjects && session.user.subjects.length > 0 ? (
                      session.user.subjects.map((subject: string) => (
                        <span
                          key={subject}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800"
                        >
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </span>
                      ))
                    ) : (
                      <p className="text-ink-500 text-sm">No subjects selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-ink-800 mb-4">Quick Actions</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center space-x-3">
                    <Icon name="dashboard" size={24} className="text-brand-500" />
                    <div>
                      <h4 className="font-medium text-ink-800">Dashboard</h4>
                      <p className="text-sm text-ink-600">View your progress</p>
                    </div>
                  </div>
                </button>
                <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center space-x-3">
                    <Icon name="trophy" size={24} className="text-accent-500" />
                    <div>
                      <h4 className="font-medium text-ink-800">Achievements</h4>
                      <p className="text-sm text-ink-600">See your badges</p>
                    </div>
                  </div>
                </button>
                <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center space-x-3">
                    <Icon name="book" size={24} className="text-green-500" />
                    <div>
                      <h4 className="font-medium text-ink-800">Catalog</h4>
                      <p className="text-sm text-ink-600">Explore adventures</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Container>

        {/* Profile Settings Modal */}
        <ProfileSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}