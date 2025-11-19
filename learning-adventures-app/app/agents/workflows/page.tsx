/**
 * Workflow Management Page
 *
 * Displays available multi-agent workflows and allows users to
 * execute complete content creation pipelines.
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import WorkflowList from '@/components/agents/WorkflowList';

export const metadata: Metadata = {
  title: 'Workflows | AI Agent Studio',
  description: 'Multi-agent workflow orchestration',
};

export default async function WorkflowsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/agents/workflows');
  }

  const userRole = session.user.role;
  const hasAccess = userRole === 'ADMIN' || userRole === 'TEACHER';

  if (!hasAccess) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Workflows</h1>
              <p className="mt-2 text-neutral-600">
                Complete multi-agent pipelines for content creation
              </p>
            </div>
            <a
              href="/agents"
              className="px-4 py-2 text-neutral-700 hover:text-brand-600 font-medium transition-colors"
            >
              ← Back to Agents
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <WorkflowList />
      </div>
    </div>
  );
}
