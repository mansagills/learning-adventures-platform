'use client';

/**
 * Workflow List Component
 *
 * Displays available multi-agent workflows with their steps and capabilities.
 */

import { useState } from 'react';

const workflows = [
  {
    id: 'html-game-creation',
    name: 'HTML Game Creation',
    description: 'Complete pipeline to create a single-file HTML educational game',
    steps: [
      { agent: 'Game Idea Generator', action: 'Brainstorm game concepts' },
      { agent: 'Content Builder', action: 'Build HTML game file' },
      { agent: 'Quality Assurance', action: 'Validate accessibility and quality' },
      { agent: 'Content Builder', action: 'Apply fixes if needed' },
      { agent: 'Catalog Manager', action: 'Format catalog metadata' },
    ],
    estimatedTime: '3-5 minutes',
    icon: '🎮',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'react-game-creation',
    name: 'React Component Game Creation',
    description: 'Create a React-based educational game with platform integration',
    steps: [
      { agent: 'Game Idea Generator', action: 'Generate game concept' },
      { agent: 'Content Builder', action: 'Build React component' },
      { agent: 'Quality Assurance', action: 'Validate and test component' },
      { agent: 'Catalog Manager', action: 'Create catalog entry' },
    ],
    estimatedTime: '5-7 minutes',
    icon: '⚛️',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'validation-only',
    name: 'Quality Validation',
    description: 'Validate existing content for accessibility and quality standards',
    steps: [
      { agent: 'Quality Assurance', action: 'Run accessibility checks' },
      { agent: 'Quality Assurance', action: 'Generate QA report' },
      { agent: 'Content Builder', action: 'Apply recommended fixes (optional)' },
    ],
    estimatedTime: '2-3 minutes',
    icon: '✅',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'batch-creation',
    name: 'Batch Content Creation',
    description: 'Create multiple games simultaneously from a list of ideas',
    steps: [
      { agent: 'Game Idea Generator', action: 'Generate ideas from brief' },
      { agent: 'Content Builder', action: 'Build all games (parallel)' },
      { agent: 'Quality Assurance', action: 'Validate all games' },
      { agent: 'Catalog Manager', action: 'Format all metadata' },
    ],
    estimatedTime: '10-15 minutes',
    icon: '📦',
    color: 'from-orange-500 to-red-500',
  },
];

export default function WorkflowList() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-6 bg-white rounded-xl border-2 border-neutral-200 hover:border-brand-300 transition-all cursor-pointer group"
            onClick={() => setSelectedWorkflow(workflow.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${workflow.color}`}
                >
                  {workflow.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{workflow.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">⏱️ {workflow.estimatedTime}</p>
                </div>
              </div>
            </div>

            <p className="text-neutral-700 mb-4">{workflow.description}</p>

            <div className="space-y-2 mb-4">
              <div className="text-sm font-semibold text-neutral-900">Workflow Steps:</div>
              {workflow.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="font-semibold text-brand-500">{index + 1}.</span>
                  <div>
                    <span className="font-medium text-neutral-700">{step.agent}</span>
                    <span className="text-neutral-500"> → {step.action}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`
                w-full px-4 py-3 text-center font-semibold rounded-lg
                bg-gradient-to-r ${workflow.color} text-white
                hover:shadow-lg transition-all
                group-hover:scale-105
              `}
            >
              Start Workflow
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-white rounded-xl border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">What are workflows?</h3>
        <p className="text-neutral-600 mb-4">
          Workflows are pre-configured sequences of AI agents working together to complete
          complex tasks. Instead of manually coordinating multiple agents, workflows automate
          the entire process from concept to finished content.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-brand-50 rounded-lg">
            <div className="font-semibold text-brand-900 mb-1">✨ Benefits</div>
            <ul className="space-y-1 text-brand-700">
              <li>• Automated multi-step processes</li>
              <li>• Quality checks at each stage</li>
              <li>• Consistent output format</li>
              <li>• Time savings of 70%+</li>
            </ul>
          </div>
          <div className="p-4 bg-accent-50 rounded-lg">
            <div className="font-semibold text-accent-900 mb-1">🎯 Use Cases</div>
            <ul className="space-y-1 text-accent-700">
              <li>• Rapid content creation</li>
              <li>• Quality validation</li>
              <li>• Bulk game generation</li>
              <li>• Catalog integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
