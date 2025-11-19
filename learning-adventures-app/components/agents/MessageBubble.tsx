'use client';

/**
 * Message Bubble Component
 *
 * Displays a single message in the chat interface with role-based styling.
 */

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
      attachments?: string[];
      toolCalls?: string[];
    };
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold">
              AI
            </div>
          )}
          <span className="text-xs text-neutral-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && (
            <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 font-semibold">
              You
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${
              isUser
                ? 'bg-brand-500 text-white rounded-tr-sm'
                : 'bg-neutral-100 text-neutral-900 rounded-tl-sm'
            }
          `}
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>

          {/* Attachments */}
          {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20">
              {message.metadata.attachments.map((attachment, index) => (
                <div key={index} className="text-sm opacity-90">
                  📎 {attachment}
                </div>
              ))}
            </div>
          )}

          {/* Tool Calls */}
          {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-200">
              <div className="text-xs text-neutral-500 mb-1">Tools used:</div>
              {message.metadata.toolCalls.map((tool, index) => (
                <div key={index} className="text-xs bg-white/50 px-2 py-1 rounded inline-block mr-1">
                  {tool}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
