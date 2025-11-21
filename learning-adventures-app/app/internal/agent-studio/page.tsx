'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AIAgentStudioPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const workflows = [
    {
      id: 'html-game',
      name: 'HTML Game Creation',
      description: 'Multi-agent workflow for creating complete HTML games',
      agents: ['Idea Generator', 'Code Builder', 'QA Validator', 'Metadata Formatter'],
      status: 'coming-soon',
    },
    {
      id: 'react-game',
      name: 'React Game Creation',
      description: 'Build interactive React-based educational games',
      agents: ['Component Designer', 'State Manager', 'Accessibility Agent', 'Performance Optimizer'],
      status: 'coming-soon',
    },
    {
      id: 'interactive-lesson',
      name: 'Interactive Lesson Builder',
      description: 'Create scaffolded educational lessons with multiple learning modalities',
      agents: ['Lesson Planner', 'Content Writer', 'Assessment Builder', 'Accessibility Checker'],
      status: 'coming-soon',
    },
    {
      id: 'content-refinement',
      name: 'Content Refinement',
      description: 'Iteratively improve existing games and lessons',
      agents: ['Code Reviewer', 'UI/UX Enhancer', 'Educational Validator', 'Performance Tuner'],
      status: 'coming-soon',
    },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="max-w-[1800px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 mb-2">
                🚀 AI Agent Studio
              </h1>
              <p className="text-ink-600">
                Orchestrate multi-agent workflows for sophisticated content creation
              </p>
            </div>

            {/* Status Badge */}
            <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
              <p className="text-sm font-semibold text-purple-700">
                Plan 6 - In Development
              </p>
              <p className="text-xs text-purple-600">
                Advanced AI Workflows
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-ink-900 mb-4">
            🤖 What is AI Agent Studio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-ink-700">
            <div>
              <h3 className="font-semibold text-ink-800 mb-2">Multi-Agent Collaboration</h3>
              <p className="text-sm">
                Instead of a single AI generating content, multiple specialized agents work together,
                each focusing on their expertise (code generation, accessibility, QA, metadata).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink-800 mb-2">Workflow Orchestration</h3>
              <p className="text-sm">
                Define complex workflows where agents hand off work to each other, review each other's
                output, and iterate until quality standards are met.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink-800 mb-2">Quality Assurance</h3>
              <p className="text-sm">
                Built-in validation at every step ensures accessibility compliance, educational value,
                performance standards, and code quality before content is published.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink-800 mb-2">Conversation History</h3>
              <p className="text-sm">
                All agent interactions are tracked and saved, allowing you to resume workflows,
                review decisions, and understand how content was created.
              </p>
            </div>
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Available Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer"
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-ink-900">{workflow.name}</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-ink-600 mb-4">{workflow.description}</p>
                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Agents Involved:</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.agents.map((agent) => (
                      <span
                        key={agent}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-ink-900 mb-4">🏗️ Architecture Overview</h2>
          <div className="space-y-4 text-sm text-ink-700">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <h4 className="font-semibold text-ink-800">Agent Conversations</h4>
                <p>Each workflow maintains a conversation history where agents can communicate, ask for clarification, and iterate on content.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <h4 className="font-semibold text-ink-800">Workflow Execution</h4>
                <p>Workflows track progress through multiple steps, allowing for pause/resume functionality and error recovery.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <h4 className="font-semibold text-ink-800">File Management</h4>
                <p>Upload reference documents (prompts, style guides) that agents can use as context during content creation.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <h4 className="font-semibold text-ink-800">Usage Tracking</h4>
                <p>Monitor token usage, agent performance, and costs across all workflows to optimize efficiency.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Schema Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-2 text-sm text-ink-600">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="font-medium text-ink-800 mb-1">Database Schema Ready</p>
              <p>
                The database models for AI Agent Studio are already in place (AgentConversation, ConversationMessage,
                WorkflowExecution, GeneratedContent, UploadedFile). The UI and API implementation is part of Plan 6.
              </p>
              <p className="mt-2">
                <strong>Next Steps:</strong> Build the agent orchestration system, create workflow execution engine,
                and implement the interactive UI for monitoring agent collaboration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
