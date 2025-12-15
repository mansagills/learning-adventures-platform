'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import LearningBuilderChat from '@/components/agents/LearningBuilderChat';
import ConversationHistory from '@/components/agents/ConversationHistory';

type TabType = 'learning-builder' | 'history';

export default function AIAgentStudioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('learning-builder');

  const tabs = [
    { id: 'learning-builder' as TabType, label: 'Learning Builder', icon: '🎓', description: 'Create interactive learning content' },
    { id: 'history' as TabType, label: 'History', icon: '📚', description: 'Past conversations' },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href="/internal"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Back to Content Studio"
                    >
                      ← Content Studio
                    </Link>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">🎓 Learning Builder Studio</h1>
                  <p className="mt-1 text-gray-600">
                    Create interactive learning content and educational games with AI assistance
                  </p>
                </div>

                {/* Status Badge */}
                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-300">
                  <p className="text-sm font-semibold text-green-700">
                    ✨ Upgraded
                  </p>
                  <p className="text-xs text-green-600">
                    Intelligent Skill Detection
                  </p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      <span>{tab.label}</span>
                      <span className="ml-2 text-xs hidden group-hover:inline-block">
                        {activeTab !== tab.id && `· ${tab.description}`}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Learning Builder Tab */}
          {activeTab === 'learning-builder' && (
            <div>
              <div className="mb-6 p-6 bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl border border-brand-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  Welcome to the Learning Builder Agent
                </h2>
                <p className="text-neutral-700 mb-4">
                  This intelligent agent automatically detects what you need and uses the right skills to help you create educational content.
                  No need to choose between different agents - just tell me what you want to create!
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-brand-700 border border-brand-200">
                    💡 Game Ideation
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-brand-700 border border-brand-200">
                    🎮 HTML Game Builder
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-brand-700 border border-brand-200">
                    ⚛️ React Components
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-brand-700 border border-brand-200">
                    📋 Metadata Formatting
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-brand-700 border border-brand-200">
                    ✅ Accessibility Validation
                  </span>
                </div>
              </div>
              <LearningBuilderChat />
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <ConversationHistory />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
