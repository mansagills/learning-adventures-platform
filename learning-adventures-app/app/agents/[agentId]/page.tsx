/**
 * AI Agent Chat Interface
 *
 * Main conversation page for interacting with a specific AI agent.
 * Provides a split-screen interface with chat and activity viewer.
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/agents/ChatInterface';

interface PageProps {
  params: {
    agentId: string;
  };
}

// Agent metadata
const agentMetadata: Record<string, { name: string; description: string }> = {
  'game-idea-generator': {
    name: 'Game Idea Generator',
    description: 'Brainstorm creative educational game concepts',
  },
  'content-builder': {
    name: 'Content Builder',
    description: 'Create complete HTML or React games',
  },
  'catalog-manager': {
    name: 'Catalog Manager',
    description: 'Format metadata and integrate content',
  },
  'quality-assurance': {
    name: 'Quality Assurance',
    description: 'Validate content quality and accessibility',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const agent = agentMetadata[params.agentId];
  return {
    title: `${agent?.name || 'Agent'} | AI Agent Studio`,
    description: agent?.description || 'AI Agent conversation interface',
  };
}

export default async function AgentChatPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  // Redirect non-authenticated users
  if (!session) {
    redirect('/auth/login?callbackUrl=/agents/' + params.agentId);
  }

  // Check if user has permission
  const userRole = session.user.role;
  const hasAccess = userRole === 'ADMIN' || userRole === 'TEACHER';

  if (!hasAccess) {
    redirect('/unauthorized');
  }

  // Validate agent ID
  const agent = agentMetadata[params.agentId];
  if (!agent) {
    redirect('/agents');
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/agents"
                className="text-neutral-600 hover:text-brand-600 transition-colors"
              >
                ← Back to Agents
              </a>
              <div className="h-6 w-px bg-neutral-300" />
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{agent.name}</h1>
                <p className="text-sm text-neutral-600">{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-neutral-700 hover:text-brand-600 font-medium transition-colors">
                New Conversation
              </button>
              <button className="px-4 py-2 text-neutral-700 hover:text-brand-600 font-medium transition-colors">
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface agentId={params.agentId} agentName={agent.name} />
      </div>
    </div>
  );
}
