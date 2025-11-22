/**
 * Homepage - Authentication-based routing
 *
 * This page implements the separation between marketing and platform:
 * - Unauthenticated users → Marketing site (Webflow at learningadventures.com)
 * - Authenticated users → Platform dashboard (app.learningadventures.com/dashboard)
 */

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

// Marketing site URL (will be Webflow in production)
const MARKETING_SITE_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://learningadventures.org';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth status to be determined
    if (status === 'loading') return;

    if (status === 'authenticated') {
      // Authenticated users go directly to their dashboard
      router.push('/dashboard');
    } else {
      // Unauthenticated users see marketing content
      // TODO: Once Webflow is live at learningadventures.org, uncomment the line below
      // window.location.href = MARKETING_SITE_URL;

      // For now, show marketing preview on this domain
      router.push('/marketing-preview');
    }
  }, [status, router]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-lg">
          {status === 'loading' ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
