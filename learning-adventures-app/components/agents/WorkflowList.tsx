'use client';

/**
 * Workflow List Component
 *
 * Displays available multi-agent workflows with their steps and capabilities.
 * Allows users to execute workflows and track real-time progress.
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

interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  agent: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
}

export default function WorkflowList() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [workflowInput, setWorkflowInput] = useState({
    topic: '',
    gradeLevel: '',
    subject: '',
  });
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  const handleStartWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    setShowConfigModal(true);
    setExecutionResults([]);
    setProgress(null);
  };

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) return;

    setShowConfigModal(false);
    setIsExecuting(true);
    setProgress(null);
    setExecutionResults([]);

    try {
      const response = await fetch('/api/agents/workflows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: selectedWorkflow,
          input: workflowInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              setProgress({
                currentStep: data.currentStep,
                totalSteps: data.totalSteps,
                stepName: data.stepName,
                agent: data.agent,
                status: data.status,
                output: data.output,
              });

              if (data.status === 'completed' && data.output) {
                setExecutionResults((prev) => [...prev, data]);
              }
            } else if (data.type === 'complete') {
              setIsExecuting(false);
            } else if (data.type === 'error') {
              console.error('Workflow error:', data.error);
              alert(`Workflow failed: ${data.error}`);
              setIsExecuting(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      alert('Failed to execute workflow');
      setIsExecuting(false);
    }
  };

  const selectedWorkflowData = workflows.find((w) => w.id === selectedWorkflow);

  return (
    <div>
      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-6 bg-white rounded-xl border-2 border-neutral-200 hover:border-brand-300 transition-all group"
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
              onClick={() => handleStartWorkflow(workflow.id)}
              disabled={isExecuting}
              className={`
                w-full px-4 py-3 text-center font-semibold rounded-lg
                bg-gradient-to-r ${workflow.color} text-white
                hover:shadow-lg transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!isExecuting && 'group-hover:scale-105'}
              `}
            >
              {isExecuting && selectedWorkflow === workflow.id
                ? 'Running...'
                : 'Start Workflow'}
            </button>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedWorkflowData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              {selectedWorkflowData.icon} {selectedWorkflowData.name}
            </h3>
            <p className="text-neutral-600 mb-6">{selectedWorkflowData.description}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Topic (Optional)
                </label>
                <input
                  type="text"
                  value={workflowInput.topic}
                  onChange={(e) =>
                    setWorkflowInput({ ...workflowInput, topic: e.target.value })
                  }
                  placeholder="e.g., Fractions, Solar System, Grammar"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Grade Level (Optional)
                  </label>
                  <input
                    type="text"
                    value={workflowInput.gradeLevel}
                    onChange={(e) =>
                      setWorkflowInput({ ...workflowInput, gradeLevel: e.target.value })
                    }
                    placeholder="e.g., 3-5"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subject (Optional)
                  </label>
                  <select
                    value={workflowInput.subject}
                    onChange={(e) =>
                      setWorkflowInput({ ...workflowInput, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Any</option>
                    <option value="math">Math</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteWorkflow}
                className={`flex-1 px-4 py-2 bg-gradient-to-r ${selectedWorkflowData.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
              >
                Execute Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {isExecuting && progress && (
        <div className="mt-8 p-6 bg-white rounded-xl border-2 border-brand-300 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Workflow In Progress...
            </h3>
            <span className="text-sm text-neutral-500">
              Step {progress.currentStep} of {progress.totalSteps}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-neutral-900">{progress.agent}</span>
            </div>
            <p className="text-sm text-neutral-600 ml-6">{progress.stepName}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(progress.currentStep / progress.totalSteps) * 100}%`,
              }}
            ></div>
          </div>

          {/* Results So Far */}
          {executionResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-semibold text-neutral-900">Completed Steps:</div>
              {executionResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600">✓</span>
                    <span className="font-medium text-sm text-neutral-900">
                      {result.agent}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 ml-6">{result.stepName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {!isExecuting && executionResults.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-xl border-2 border-green-300 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h3 className="text-lg font-semibold text-neutral-900">Workflow Completed!</h3>
          </div>

          <div className="space-y-4">
            {executionResults.map((result, index) => (
              <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="font-medium text-neutral-900 mb-2">
                  Step {index + 1}: {result.agent}
                </div>
                <div className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {result.output}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setExecutionResults([]);
              setProgress(null);
              setSelectedWorkflow(null);
            }}
            className="mt-4 w-full px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors"
          >
            Start New Workflow
          </button>
        </div>
      )}

      {/* Info Section */}
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
