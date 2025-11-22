/**
 * AI Agent Studio - Main Discovery Page
 *
 * This page displays all available AI agents for content creation.
 * Users can select an agent to start a new conversation or continue existing ones.
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AgentDiscovery from '@/components/agents/AgentDiscovery';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'AI Agent Studio | Learning Adventures',
  description: 'Create educational content with specialized AI agents',
};

export default async function AgentStudioPage() {
  const session = await getServerSession(authOptions);

  // DEBUG: Log session data
  console.log('🔍 Agent Studio Access Attempt:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    roleType: typeof session?.user?.role,
  });

  // Redirect non-authenticated users
  if (!session) {
    console.log('❌ No session - redirecting to login');
    redirect('/auth/login?callbackUrl=/agents');
  }

  // Check if user has permission to access Agent Studio
  const userRole = session.user?.role;
  console.log('🔐 Role check:', { userRole, isAdmin: userRole === 'ADMIN', isTeacher: userRole === 'TEACHER' });

  const hasAccess = userRole === 'ADMIN' || userRole === 'TEACHER';

  if (!hasAccess) {
    console.log('❌ Access denied - role:', userRole);
    redirect('/unauthorized');
  }

  console.log('✅ Access granted to Agent Studio');

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                AI Agent Studio
              </h1>
              <p className="mt-2 text-neutral-600">
                Create educational content with specialized AI agents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/agents/history"
                className="px-4 py-2 text-neutral-700 hover:text-brand-600 font-medium transition-colors"
              >
                History
              </a>
              <a
                href="/agents/workflows"
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium transition-colors"
              >
                Workflows
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AgentDiscovery />
      </div>
    </div>
  );
}
