/**
 * Homepage - Subdomain-aware routing
 *
 * This page serves different content based on the domain:
 * - learningadventures.org → Landing page (marketing content)
 * - app.learningadventures.org → Redirect to dashboard
 * - localhost → Landing page (for development)
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

export default async function HomePage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const subdomain = headersList.get('x-subdomain') || 'marketing';

  // Get session for personalization
  const session = await getServerSession(authOptions);

  // On app subdomain, redirect to dashboard
  if (subdomain === 'app' || host.startsWith('app.')) {
    redirect('/dashboard');
  }

  // On marketing domain or localhost, show landing page
  // Pass auth info for personalized welcome banner
  return (
    <LandingPage
      isAuthenticated={!!session?.user}
      userName={session?.user?.name}
    />
  );
}
