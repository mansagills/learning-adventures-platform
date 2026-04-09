import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Routes that require a logged-in user
const PROTECTED_ROUTES = [
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh Supabase session cookie + get current user
  const { supabaseResponse, user } = await updateSession(request);

  // ── Protected routes ──────────────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based: /internal and /staging — ADMIN only ──────────────────────
  if (pathname.startsWith('/internal') || pathname.startsWith('/staging')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Always check role in DB — no email-domain shortcuts
    try {
      const profile = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: { role: true },
      });
      if (profile?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ── Role-based: /parent — PARENT or ADMIN only ────────────────────────────
  if (pathname.startsWith('/parent') && user) {
    try {
      const profile = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: { role: true },
      });
      if (profile?.role !== 'PARENT' && profile?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
