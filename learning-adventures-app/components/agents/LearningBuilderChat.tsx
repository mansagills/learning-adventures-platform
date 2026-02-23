'use client';

/**
 * Learning Builder Agent Chat Component
 *
 * Single intelligent agent that automatically detects and uses appropriate skills
 * to create interactive learning content and educational games.
 */

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  skillUsed?: string;
  confidence?: number;
  timestamp: Date;
}

interface AgentResponse {
  response: string;
  skillsUsed: string[];
  confidence: number;
  output?: any;
  metadata?: {
    totalExecutionTime?: number;
    skillChain?: string[];
    suggestedNextSteps?: string[];
    warnings?: string[];
  };
}

const skillIcons: Record<string, string> = {
  'game-ideation': '💡',
  'game-builder': '🎮',
  'react-component': '⚛️',
  'metadata-formatter': '📋',
  'accessibility-validator': '✅',
};

const skillNames: Record<string, string> = {
  'game-ideation': 'Game Ideation',
  'game-builder': 'HTML Game Builder',
  'react-component': 'React Component Builder',
  'metadata-formatter': 'Metadata Formatter',
  'accessibility-validator': 'Accessibility Validator',
};

export default function LearningBuilderChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm the Learning Builder Agent. I can help you create interactive learning content and educational games.

I have 5 specialized skills:
💡 **Game Ideation** - Brainstorm creative game concepts
🎮 **HTML Game Builder** - Create complete HTML games
⚛️ **React Component Builder** - Build React-based games
📋 **Metadata Formatter** - Format catalog entries
✅ **Accessibility Validator** - Check WCAG compliance

Just tell me what you'd like to create, and I'll automatically use the right skills to help you!

**Example requests:**
- "Create a math game for 3rd graders"
- "Build an HTML game about fractions"
- "Brainstorm science game ideas for photosynthesis"
- "Check the accessibility of my game"`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data: AgentResponse = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.response,
        skillUsed: data.skillsUsed[0],
        confidence: data.confidence,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show suggested next steps if available
      if (
        data.metadata?.suggestedNextSteps &&
        data.metadata.suggestedNextSteps.length > 0
      ) {
        const suggestions = data.metadata.suggestedNextSteps.join('\n- ');
        const suggestionMessage: Message = {
          id: `msg-${Date.now()}-suggestions`,
          role: 'assistant',
          content: `**Suggested next steps:**\n- ${suggestions}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, suggestionMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: '💡 Brainstorm game ideas',
      prompt: 'Brainstorm 3 math game ideas for 4th graders',
    },
    {
      label: '🎮 Build HTML game',
      prompt: 'Build an HTML game for teaching multiplication',
    },
    {
      label: '⚛️ Create React game',
      prompt: 'Create a React game about fractions',
    },
    {
      label: '✅ Check accessibility',
      prompt: 'How can I check if my game is accessible?',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-xl border border-neutral-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-r from-brand-500 to-accent-500 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
            🎓
          </div>
          <div>
            <h2 className="font-semibold text-white">Learning Builder Agent</h2>
            <p className="text-xs text-white/80">
              Intelligent content creation assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-white/90">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-neutral-100 text-neutral-900'
              }`}
            >
              {message.role === 'assistant' && message.skillUsed && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-200">
                  <span className="text-lg">
                    {skillIcons[message.skillUsed]}
                  </span>
                  <span className="text-xs font-medium text-neutral-600">
                    {skillNames[message.skillUsed]} · {message.confidence}%
                    confidence
                  </span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-neutral-500'}`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
                <span className="text-sm text-neutral-600 ml-2">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
          <p className="text-xs text-neutral-600 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(action.prompt);
                }}
                className="px-3 py-1 text-sm bg-white border border-neutral-300 rounded-full hover:bg-neutral-100 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to create learning content..."
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
