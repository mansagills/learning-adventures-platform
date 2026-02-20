'use client';

/**
 * Streaming Indicator Component
 *
 * Shows a loading indicator while the agent is generating a response.
 */

export default function StreamingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold">
            AI
          </div>
          <span className="text-xs text-neutral-500">Thinking...</span>
        </div>

        <div className="bg-neutral-100 px-4 py-3 rounded-2xl rounded-tl-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
