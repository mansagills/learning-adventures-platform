'use client';

/**
 * Agent Card Component
 *
 * Displays an individual AI agent with its capabilities and allows
 * users to start a conversation with the agent.
 */

import { useState } from 'react';
import Link from 'next/link';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    icon: string;
    description: string;
    capabilities: string[];
    skillsRequired: string[];
    color: string;
    bgColor: string;
    borderColor: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export default function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-200
        ${isSelected ? agent.borderColor + ' shadow-lg' : 'border-neutral-200 hover:border-neutral-300'}
        ${agent.bgColor} backdrop-blur-sm
      `}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`
              text-4xl p-3 rounded-xl bg-gradient-to-br ${agent.color}
              flex items-center justify-center
            `}
          >
            <span className="filter drop-shadow-sm">{agent.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{agent.name}</h3>
            {agent.skillsRequired.length > 0 && (
              <div className="flex gap-1 mt-1">
                {agent.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 bg-white/60 text-neutral-600 rounded-full"
                  >
                    {skill.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-neutral-700 mb-4 leading-relaxed">{agent.description}</p>

      {/* Capabilities */}
      <div className="mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-sm font-semibold text-neutral-900 hover:text-brand-600 flex items-center gap-1 mb-2"
        >
          Capabilities
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {isExpanded && (
          <ul className="space-y-1.5 text-sm text-neutral-600">
            {agent.capabilities.map((capability, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-brand-500 font-bold">•</span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action Button */}
      <Link
        href={`/agents/${agent.id}`}
        className={`
          block w-full px-4 py-3 text-center font-semibold rounded-lg
          transition-all duration-200
          bg-gradient-to-r ${agent.color} text-white
          hover:shadow-lg hover:scale-105
        `}
        onClick={(e) => e.stopPropagation()}
      >
        Start Conversation
      </Link>

      {/* Recent Activity Indicator (if applicable) */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
        </div>
      )}
    </div>
  );
}
