'use client';

/**
 * Message Bubble Component
 *
 * Displays a single message in the chat interface with role-based styling.
 */

import ReactMarkdown from 'react-markdown';

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
        <div
          className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold">
              AI
            </div>
          )}
          <span className="text-xs text-neutral-500">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
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
          <div className="prose prose-sm max-w-none break-words">
            {isUser ? (
              // User messages: plain text with line breaks
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              // Assistant messages: render markdown
              <ReactMarkdown
                components={{
                  // Style headings
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl font-bold mb-2" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg font-semibold mb-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base font-semibold mb-1" {...props} />
                  ),
                  // Style lists
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-4 mb-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal ml-4 mb-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  // Style paragraphs
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  // Style code
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-neutral-200 px-1 rounded text-sm"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-neutral-200 p-2 rounded text-sm overflow-x-auto"
                        {...props}
                      />
                    ),
                  // Style links
                  a: ({ node, ...props }) => (
                    <a
                      className="text-brand-600 underline hover:text-brand-700"
                      {...props}
                    />
                  ),
                  // Style blockquotes
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-neutral-300 pl-3 italic"
                      {...props}
                    />
                  ),
                  // Style strong/bold
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold" {...props} />
                  ),
                  // Style emphasis/italic
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Attachments */}
          {message.metadata?.attachments &&
            message.metadata.attachments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                {message.metadata.attachments.map((attachment, index) => (
                  <div key={index} className="text-sm opacity-90">
                    📎 {attachment}
                  </div>
                ))}
              </div>
            )}

          {/* Tool Calls */}
          {message.metadata?.toolCalls &&
            message.metadata.toolCalls.length > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-200">
                <div className="text-xs text-neutral-500 mb-1">Tools used:</div>
                {message.metadata.toolCalls.map((tool, index) => (
                  <div
                    key={index}
                    className="text-xs bg-white/50 px-2 py-1 rounded inline-block mr-1"
                  >
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
