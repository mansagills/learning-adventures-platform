'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AgentDiscovery from '@/components/agents/AgentDiscovery';
import WorkflowList from '@/components/agents/WorkflowList';
import ConversationHistory from '@/components/agents/ConversationHistory';

type TabType = 'ai-agents' | 'workflows' | 'history';

export default function AIAgentStudioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ai-agents');

  const tabs = [
    { id: 'ai-agents' as TabType, label: 'AI Agents', icon: '🤖', description: 'Chat with specialized AI agents' },
    { id: 'workflows' as TabType, label: 'Workflows', icon: '⚡', description: 'Multi-agent orchestration' },
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
                  <h1 className="text-3xl font-bold text-gray-900">🚀 AI Agent Studio</h1>
                  <p className="mt-1 text-gray-600">
                    Orchestrate multi-agent workflows for sophisticated content creation
                  </p>
                </div>

                {/* Status Badge */}
                <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                  <p className="text-sm font-semibold text-purple-700">
                    Now Available
                  </p>
                  <p className="text-xs text-purple-600">
                    Advanced AI Workflows
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
          {/* AI Agents Tab */}
          {activeTab === 'ai-agents' && (
            <AgentDiscovery />
          )}

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <WorkflowList />
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
