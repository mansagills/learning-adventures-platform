'use client';

import { useState } from 'react';
import Link from 'next/link';
import ContentCreationForm from './components/ContentCreationForm';
import ContentPreview from './components/ContentPreview';
import ContentPublisher from './components/ContentPublisher';
import { ContentFormData, GeneratedContent } from './types';
import AgentDiscovery from '@/components/agents/AgentDiscovery';
import WorkflowList from '@/components/agents/WorkflowList';
import ConversationHistory from '@/components/agents/ConversationHistory';

type TabType = 'content-creator' | 'ai-agents' | 'workflows' | 'history';

export default function InternalApp() {
  const [activeTab, setActiveTab] = useState<TabType>('content-creator');
  const [currentStep, setCurrentStep] = useState<
    'create' | 'preview' | 'publish'
  >('create');
  const [formData, setFormData] = useState<ContentFormData | null>(null);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);

  const handleFormSubmit = (data: ContentFormData) => {
    setFormData(data);
    setCurrentStep('preview');
  };

  const handleContentGenerated = (content: GeneratedContent) => {
    setGeneratedContent(content);
  };

  const handlePublish = () => {
    setCurrentStep('publish');
  };

  const handleStartOver = () => {
    setCurrentStep('create');
    setFormData(null);
    setGeneratedContent(null);
  };

  const tabs = [
    { id: 'content-creator' as TabType, label: 'Content Creator', icon: '📝' },
    { id: 'ai-agents' as TabType, label: 'AI Agents', icon: '🤖' },
    { id: 'workflows' as TabType, label: 'Workflows', icon: '⚡' },
    { id: 'history' as TabType, label: 'History', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Content Creation Studio
                </h1>
                <p className="mt-1 text-gray-600">
                  Create engaging educational games and interactive lessons
                  {formData?.uploadSource === 'uploaded' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📦 Uploaded Content
                    </span>
                  )}
                  {formData?.uploadSource === 'ai-generated' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🤖 AI-Generated
                    </span>
                  )}
                </p>
                <div className="mt-2">
                  <Link
                    href="/internal/agent-studio"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    🤖 Try AI Agent Studio →
                  </Link>
                </div>
              </div>
              {activeTab === 'content-creator' && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      1
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Create
                    </span>
                  </div>
                  <div className="w-8 h-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      2
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Preview
                    </span>
                  </div>
                  <div className="w-8 h-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'publish' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      3
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Publish
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Creator Tab */}
        {activeTab === 'content-creator' && (
          <>
            {currentStep === 'create' && (
              <ContentCreationForm onSubmit={handleFormSubmit} />
            )}

            {currentStep === 'preview' && formData && (
              <ContentPreview
                formData={formData}
                generatedContent={generatedContent}
                onContentGenerated={handleContentGenerated}
                onPublish={handlePublish}
                onBack={() => setCurrentStep('create')}
              />
            )}

            {currentStep === 'publish' && generatedContent && (
              <ContentPublisher
                content={generatedContent}
                formData={formData!}
                onStartOver={handleStartOver}
              />
            )}
          </>
        )}

        {/* AI Agents Tab */}
        {activeTab === 'ai-agents' && <AgentDiscovery />}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && <WorkflowList />}

        {/* History Tab */}
        {activeTab === 'history' && <ConversationHistory />}
      </main>
    </div>
  );
}
