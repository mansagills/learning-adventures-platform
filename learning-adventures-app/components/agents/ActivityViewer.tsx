'use client';

/**
 * Activity Viewer Component
 *
 * Displays real-time agent activity and workflow progress.
 */

interface ActivityViewerProps {
  agentName: string;
  activities: string[];
  isActive: boolean;
}

export default function ActivityViewer({
  agentName,
  activities,
  isActive,
}: ActivityViewerProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Agent Activity</h3>
          {isActive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-sm text-neutral-500">
              {agentName} is ready to help
            </p>
          </div>
        ) : (
          <>
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200 animate-fade-in"
              >
                <div className="flex-shrink-0">
                  {index === activities.length - 1 && isActive ? (
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-700">{activity}</p>
                  <span className="text-xs text-neutral-400">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Agent Info */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="text-xs text-neutral-500 space-y-1">
          <div className="flex justify-between">
            <span>Agent:</span>
            <span className="font-medium text-neutral-700">{agentName}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`font-medium ${isActive ? 'text-green-600' : 'text-neutral-400'}`}>
              {isActive ? 'Processing' : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
