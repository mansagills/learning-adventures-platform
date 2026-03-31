'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AppSideNav from './AppSideNav';

/**
 * Routes that should show the side navigation
 */
const APP_ROUTES = [
  '/progress',
  '/my-library',
  '/courses',
  '/games',
  '/practice',
  '/assessments',
  '/tutorials',
  '/dashboard',
  '/profile',
];

/**
 * Routes that should NOT show the side navigation (landing pages, public pages, admin)
 */
const EXCLUDE_ROUTES = ['/', '/catalog', '/internal', '/lessons'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Check if current route should show side nav
  const shouldShowSideNav =
    session &&
    status === 'authenticated' &&
    (APP_ROUTES.some((route) => pathname.startsWith(route)) ||
      !EXCLUDE_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      ));

  // Don't show on internal/admin routes
  const isInternalRoute = pathname.startsWith('/internal');

  if (isInternalRoute || !shouldShowSideNav) {
    return <>{children}</>;
  }

  return (
    <>
      <AppSideNav />
      <div className="lg:ml-64 lg:pb-0 pb-16">{children}</div>
    </>
  );
}
