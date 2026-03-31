'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Icon from '../Icon';

export interface PathNode {
  id: string;
  title: string;
  description: string;
  type: 'completed' | 'current' | 'locked' | 'available';
  adventureId?: string;
  skills: string[];
  estimatedTime: number;
  prerequisiteIds?: string[];
}

interface LearningPathProps {
  nodes: PathNode[];
  title?: string;
  description?: string;
  className?: string;
}

const nodeIcons = {
  completed: {
    icon: 'check',
    color: 'bg-green-500',
    border: 'border-green-500',
    text: 'text-green-700',
  },
  current: {
    icon: 'play',
    color: 'bg-brand-500',
    border: 'border-brand-500',
    text: 'text-brand-700',
  },
  available: {
    icon: 'unlock',
    color: 'bg-blue-500',
    border: 'border-blue-300',
    text: 'text-blue-700',
  },
  locked: {
    icon: 'lock',
    color: 'bg-gray-400',
    border: 'border-gray-300',
    text: 'text-gray-500',
  },
};

export default function LearningPath({
  nodes,
  title = 'Your Learning Path',
  description,
  className,
}: LearningPathProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-ink-800 flex items-center space-x-2">
          <Icon name="map" size={24} className="text-brand-600" />
          <span>{title}</span>
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Path Visualization */}
      <div className="relative">
        {/* Vertical line connecting nodes */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Nodes */}
        <div className="space-y-6">
          {nodes.map((node, index) => {
            const config = nodeIcons[node.type];
            const isClickable = node.type !== 'locked' && node.adventureId;

            const NodeContent = (
              <>
                {/* Node Circle */}
                <div
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all',
                    config.color,
                    config.border,
                    'shadow-sm'
                  )}
                >
                  <Icon name={config.icon} size={20} className="text-white" />
                </div>

                {/* Node Info */}
                <div className="flex-1 ml-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-brand-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={cn('font-semibold mb-1', config.text)}>
                          {node.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {node.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {node.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {node.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                              +{node.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      {node.type !== 'locked' && (
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className="text-xs text-gray-500">
                            <Icon
                              name="clock"
                              size={14}
                              className="inline mr-1"
                            />
                            {node.estimatedTime} min
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {node.type === 'completed' && (
                      <div className="flex items-center space-x-2 text-xs text-green-600">
                        <Icon name="check" size={14} />
                        <span className="font-medium">Completed</span>
                      </div>
                    )}
                    {node.type === 'current' && isClickable && (
                      <div className="flex items-center space-x-2 text-sm text-brand-600 font-medium">
                        <Icon name="play" size={16} />
                        <span>Continue Learning →</span>
                      </div>
                    )}
                    {node.type === 'available' && isClickable && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
                        <Icon name="play" size={16} />
                        <span>Start Adventure →</span>
                      </div>
                    )}
                    {node.type === 'locked' && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Icon name="lock" size={14} />
                        <span>Complete previous adventures to unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );

            if (isClickable && node.adventureId) {
              return (
                <Link
                  key={node.id}
                  href={`/adventures/${node.adventureId}` as any}
                  className="flex items-start group"
                >
                  {NodeContent}
                </Link>
              );
            }

            return (
              <div key={node.id} className="flex items-start">
                {NodeContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(nodeIcons).map(([type, config]) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={cn('w-3 h-3 rounded-full', config.color)} />
              <span className="text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
