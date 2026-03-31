import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Admin domain for automatic admin access
const ADMIN_DOMAIN = '@learningadventures.org';

// Child session cookie name
const CHILD_SESSION_COOKIE = 'child_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the NextAuth token to check user role
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check for child session cookie
  const childSessionToken = request.cookies.get(CHILD_SESSION_COOKIE)?.value;

  // ========================================================================
  // CHILD ROUTES PROTECTION
  // ========================================================================

  if (pathname.startsWith('/child/dashboard')) {
    if (!childSessionToken) {
      return NextResponse.redirect(new URL('/child/login', request.url));
    }
  }

  // ========================================================================
  // PROTECTED ROUTES — require authentication
  // ========================================================================

  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/progress',
    '/my-library',
    '/my-requests',
    '/courses',
    '/practice',
    '/assessments',
    '/tutorials',
    '/course-request',
    '/parent',
    '/teacher',
    '/world',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ========================================================================
  // ROLE-BASED PROTECTION
  // ========================================================================

  // After successful login, redirect admins to /internal
  if (pathname === '/dashboard' && token) {
    const userRole = token.role as string;
    const userEmail = token.email as string;
    const isAdmin = userRole === 'ADMIN' || userEmail?.endsWith(ADMIN_DOMAIN);
    const referer = request.headers.get('referer') || '';
    const isFromAuth =
      referer.includes('/api/auth') || referer.includes('/auth/signin');

    if (isAdmin && isFromAuth) {
      return NextResponse.redirect(new URL('/internal', request.url));
    }
  }

  // Protect /internal and /staging — ADMIN only
  if (pathname.startsWith('/internal') || pathname.startsWith('/staging')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    const userEmail = token.email as string;
    const isAdmin = userRole === 'ADMIN' || userEmail?.endsWith(ADMIN_DOMAIN);

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect /parent routes — PARENT or ADMIN only
  if (pathname.startsWith('/parent')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    if (userRole !== 'PARENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|games|lessons|api(?!/auth)).*)',
    '/dashboard',
    '/internal/:path*',
    '/staging/:path*',
    '/child/:path*',
    '/parent/:path*',
  ],
};
