'use client';

/**
 * Agent Discovery Component
 *
 * Displays all available AI agents with their capabilities and allows
 * users to select an agent to start a conversation.
 */

import { useState } from 'react';
import AgentCard from './AgentCard';

// Agent definitions based on Plan 6 specifications
const agents = [
  {
    id: 'game-idea-generator',
    name: 'Game Idea Generator',
    icon: '🎮',
    description: 'Brainstorm creative educational game concepts aligned with curriculum standards',
    capabilities: [
      'Generate 3-5 unique game concepts per request',
      'Consider grade level, subject, and learning objectives',
      'Analyze existing game patterns for inspiration',
      'Provide educational value assessment',
      'Suggest difficulty levels and estimated play time',
    ],
    skillsRequired: [],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'content-builder',
    name: 'Content Builder',
    icon: '📝',
    description: 'Create complete functional games (HTML or React) following platform standards',
    capabilities: [
      'Build single-file HTML games',
      'Create React component games',
      'Apply 70/30 engagement-to-learning ratio',
      'Implement WCAG 2.1 AA accessibility features',
      'Generate child-friendly, colorful interfaces',
      'Include progress tracking and feedback mechanisms',
    ],
    skillsRequired: ['educational-game-builder', 'react-game-component'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'catalog-manager',
    name: 'Catalog Manager',
    icon: '📊',
    description: 'Format metadata and integrate content into platform catalog',
    capabilities: [
      'Generate properly formatted catalog entries',
      'Validate metadata schema compliance',
      'Ensure all required fields are present',
      'Map to correct target arrays',
      'Verify file paths and URLs',
      'Check for duplicate IDs',
    ],
    skillsRequired: ['catalog-metadata-formatter'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    icon: '✅',
    description: 'Validate content quality, accessibility, and educational effectiveness',
    capabilities: [
      'Run WCAG 2.1 AA compliance checks',
      'Test keyboard navigation',
      'Verify screen reader compatibility',
      'Assess educational value and learning objectives',
      'Check 70/30 engagement ratio',
      'Generate detailed QA reports with specific fixes',
    ],
    skillsRequired: ['accessibility-validator'],
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

export default function AgentDiscovery() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div>
      {/* Introduction */}
      <div className="mb-8 p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Welcome to the AI Agent Studio
        </h2>
        <p className="text-neutral-600">
          Choose a specialized AI agent below to start creating educational content.
          Each agent is trained with specific skills to help you build high-quality
          games, lessons, and learning experiences.
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgent === agent.id}
            onSelect={() => setSelectedAgent(agent.id)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl text-white">
        <h3 className="text-xl font-semibold mb-2">Need help choosing?</h3>
        <p className="mb-4 text-white/90">
          Not sure which agent to use? Here's a quick guide:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">💡</span>
            <span><strong>Just starting?</strong> Use Game Idea Generator to brainstorm concepts</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🚀</span>
            <span><strong>Ready to build?</strong> Use Content Builder to create games</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📋</span>
            <span><strong>Need to publish?</strong> Use Catalog Manager to format metadata</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔍</span>
            <span><strong>Want to validate?</strong> Use Quality Assurance to check quality</span>
          </li>
        </ul>
        <div className="mt-6">
          <p className="text-sm text-white/90">
            💡 <strong>Tip:</strong> Switch to the "Workflows" tab above to use complete multi-agent workflows that combine these agents automatically!
          </p>
        </div>
      </div>
    </div>
  );
}
