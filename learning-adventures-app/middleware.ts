import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Admin domain for automatic admin access
const ADMIN_DOMAIN = '@learningadventures.org';

// Child session cookie name
const CHILD_SESSION_COOKIE = 'child_session';

// Subdomain configuration
const APP_SUBDOMAIN = 'app';
const MARKETING_DOMAIN = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://learningadventures.org';
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://app.learningadventures.org';

/**
 * Detect which subdomain the request is coming from
 */
function getSubdomain(request: NextRequest): 'app' | 'marketing' | 'localhost' {
  const hostname = request.headers.get('host') || '';

  // Local development - treat as marketing (landing page)
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'localhost';
  }

  // Check for app subdomain
  if (hostname.startsWith(`${APP_SUBDOMAIN}.`)) {
    return 'app';
  }

  // Default to marketing (main domain)
  return 'marketing';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = getSubdomain(request);

  // Get the NextAuth token to check user role
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check for child session cookie
  const childSessionToken = request.cookies.get(CHILD_SESSION_COOKIE)?.value;

  // ========================================================================
  // CHILD ROUTES PROTECTION
  // ========================================================================
  
  // Child dashboard requires child session
  if (pathname.startsWith('/child/dashboard')) {
    if (!childSessionToken) {
      return NextResponse.redirect(new URL('/child/login', request.url));
    }
    // Note: Full JWT verification happens in the API/page, not middleware
    // (Edge runtime limitations prevent full crypto operations)
  }

  // Child login page - redirect to dashboard if already logged in as child
  if (pathname === '/child/login' && childSessionToken) {
    // Let the page handle verification - it will redirect if valid
  }

  // ========================================================================
  // ADULT AUTH ROUTES
  // ========================================================================

  // After successful login, redirect based on role
  // This handles the redirect after OAuth callbacks complete
  if (pathname === '/dashboard' || pathname === '/') {
    if (token) {
      const userRole = token.role as string;
      const userEmail = token.email as string;
      
      // Check if user is admin (by role or by email domain)
      const isAdmin = userRole === 'ADMIN' || userEmail?.endsWith(ADMIN_DOMAIN);
      
      // If admin and trying to access main dashboard, redirect to internal
      // But only if they haven't explicitly navigated there (check for referrer)
      const referer = request.headers.get('referer') || '';
      const isFromAuth = referer.includes('/api/auth') || referer.includes('/auth/signin');
      
      if (isAdmin && isFromAuth && pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/internal', request.url));
      }
    }
  }

  // Protect /internal routes - only allow ADMIN users
  if (pathname.startsWith('/internal') || pathname.startsWith('/staging')) {
    if (!token) {
      // Not logged in, redirect to sign in
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = token.role as string;
    const userEmail = token.email as string;
    const isAdmin = userRole === 'ADMIN' || userEmail?.endsWith(ADMIN_DOMAIN);

    if (!isAdmin) {
      // Not an admin, redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect /parent routes - only allow PARENT users
  if (pathname.startsWith('/parent')) {
    if (!token) {
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = token.role as string;
    if (userRole !== 'PARENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ========================================================================
  // SUBDOMAIN-BASED ROUTING
  // ========================================================================

  // On app subdomain, require authentication for most routes
  if (subdomain === 'app') {
    // Allow public routes on app subdomain
    const publicAppRoutes = ['/api/auth', '/unauthorized'];
    const isPublicRoute = publicAppRoutes.some(route => pathname.startsWith(route));

    if (!isPublicRoute && !token) {
      // Redirect to marketing site's NextAuth sign-in page
      const loginUrl = new URL('/api/auth/signin', MARKETING_DOMAIN);
      loginUrl.searchParams.set('callbackUrl', `${APP_DOMAIN}${pathname}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Add subdomain info to response headers for pages to access
  const response = NextResponse.next();
  response.headers.set('x-subdomain', subdomain);

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files and api routes (except auth)
    '/((?!_next/static|_next/image|favicon.ico|public|api(?!/auth)).*)',
    // Include dashboard and internal routes
    '/dashboard',
    '/internal/:path*',
    '/staging/:path*',
    // Child routes
    '/child/:path*',
    // Parent routes
    '/parent/:path*',
  ],
};
