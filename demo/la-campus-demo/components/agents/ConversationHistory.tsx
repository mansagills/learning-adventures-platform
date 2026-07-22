'use client';

/**
 * Conversation History Component
 *
 * Lists all past conversations with filtering and search capabilities.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  agentType: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch conversations from API
    // For now, show placeholder
    setIsLoading(false);
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter = filter === 'all' || conv.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const agentIcons: Record<string, string> = {
    'game-idea-generator': '🎮',
    'content-builder': '📝',
    'catalog-manager': '📊',
    'quality-assurance': '✅',
  };

  const agentNames: Record<string, string> = {
    'game-idea-generator': 'Game Idea Generator',
    'content-builder': 'Content Builder',
    'catalog-manager': 'Catalog Manager',
    'quality-assurance': 'Quality Assurance',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'archived'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {conversations.length === 0
              ? 'No conversations yet'
              : 'No matching conversations'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {conversations.length === 0
              ? 'Start a conversation with an AI agent to see it here'
              : 'Try adjusting your search or filter'}
          </p>
          {conversations.length === 0 && (
            <Link
              href="/agents"
              className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors"
            >
              Browse Agents
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={
                `/agents/${conversation.agentType}/chat/${conversation.id}` as any
              }
              className="block p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">
                    {agentIcons[conversation.agentType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-neutral-900 truncate">
                        {conversation.title}
                      </h3>
                      {conversation.status === 'archived' && (
                        <span className="px-2 py-0.5 text-xs bg-neutral-200 text-neutral-600 rounded-full">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">
                      {agentNames[conversation.agentType]} •{' '}
                      {conversation.messageCount} messages
                    </p>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-neutral-500 ml-4">
                  <div>
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="mt-1">
                    {new Date(conversation.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
