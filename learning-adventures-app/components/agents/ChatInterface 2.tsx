'use client';

/**
 * Chat Interface Component
 *
 * Split-screen conversation interface with:
 * - Left: Chat messages and input
 * - Right: Live agent activity display
 */

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ActivityViewer from './ActivityViewer';
import StreamingIndicator from './StreamingIndicator';
import FileUploader from './FileUploader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    attachments?: string[];
    toolCalls?: string[];
  };
}

interface ChatInterfaceProps {
  agentId: string;
  agentName: string;
  conversationId?: string;
}

export default function ChatInterface({
  agentId,
  agentName,
  conversationId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string[]>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);
    setCurrentActivity(['Processing your request...']);

    try {
      // TODO: Call agent API endpoint
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationId,
          history: messages,
          fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
        }),
      });

      // Clear uploaded files after sending
      if (uploadedFileIds.length > 0) {
        setUploadedFileIds([]);
        setShowFileUploader(false);
      }

      if (!response.ok) throw new Error('Failed to get response');

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content') {
                assistantMessage += data.content;
                // Update the last message
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    newMessages.push({
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date(),
                    });
                  }
                  return newMessages;
                });
              } else if (data.type === 'activity') {
                setCurrentActivity((prev) => [...prev, data.activity]);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      setCurrentActivity([]);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel: Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Welcome to {agentName}
                </h3>
                <p className="text-neutral-600 mb-6">
                  Start a conversation by asking a question or describing what you'd like to create.
                </p>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => setInputValue('Generate 3 game ideas for 3rd grade math - multiplication')}
                    className="block w-full px-4 py-2 text-left bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    💡 Generate 3 game ideas for 3rd grade math - multiplication
                  </button>
                  <button
                    onClick={() => setInputValue('Create a science game about the water cycle for 5th graders')}
                    className="block w-full px-4 py-2 text-left bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    🌊 Create a science game about the water cycle
                  </button>
                  <button
                    onClick={() => setInputValue('Build an English vocabulary quiz with adaptive difficulty')}
                    className="block w-full px-4 py-2 text-left bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    📚 Build an English vocabulary quiz
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && <StreamingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-neutral-200 p-4">
          <div className="max-w-4xl mx-auto">
            {/* File Uploader (collapsible) */}
            {showFileUploader && (
              <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-neutral-900">
                    Upload Reference Documents
                  </h4>
                  <button
                    onClick={() => setShowFileUploader(false)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    ✕
                  </button>
                </div>
                <FileUploader
                  conversationId={conversationId}
                  onFileUploaded={(fileId) => {
                    setUploadedFileIds((prev) => [...prev, fileId]);
                  }}
                />
                {uploadedFileIds.length > 0 && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ {uploadedFileIds.length} file(s) uploaded and will be included
                    in your next message
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${agentName}...`}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={isStreaming}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming}
                  className="px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => setShowFileUploader(!showFileUploader)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                  title="Upload files"
                >
                  📎 Files
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {uploadedFileIds.length > 0 && (
                <span className="text-brand-600">
                  {uploadedFileIds.length} file(s) attached
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Activity Viewer */}
      <div className="w-96 border-l border-neutral-200 bg-neutral-50">
        <ActivityViewer
          agentName={agentName}
          activities={currentActivity}
          isActive={isStreaming}
        />
      </div>
    </div>
  );
}
