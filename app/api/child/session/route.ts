import { NextRequest, NextResponse } from 'next/server';
import { verifyChildSession } from '@/lib/childAuth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const CHILD_SESSION_COOKIE = 'child_session';

/**
 * GET /api/child/session
 * Get current child session information
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CHILD_SESSION_COOKIE)?.value;

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        child: null,
      });
    }

    // Verify session
    const sessionData = await verifyChildSession(sessionToken);

    if (!sessionData) {
      // Session is invalid or expired - clear cookie
      cookieStore.delete(CHILD_SESSION_COOKIE);
      return NextResponse.json({
        authenticated: false,
        child: null,
      });
    }

    // Get current child data
    const child = await prisma.childProfile.findUnique({
      where: { id: sessionData.childId },
      select: {
        id: true,
        displayName: true,
        username: true,
        gradeLevel: true,
        avatarId: true,
        lastLoginAt: true,
      },
    });

    if (!child) {
      cookieStore.delete(CHILD_SESSION_COOKIE);
      return NextResponse.json({
        authenticated: false,
        child: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      child,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({
      authenticated: false,
      child: null,
    });
  }
}
