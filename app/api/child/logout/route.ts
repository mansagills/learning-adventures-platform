import { NextRequest, NextResponse } from 'next/server';
import { deleteChildSession } from '@/lib/childAuth';
import { cookies } from 'next/headers';

const CHILD_SESSION_COOKIE = 'child_session';

/**
 * POST /api/child/logout
 * End a child's session
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CHILD_SESSION_COOKIE)?.value;

    if (sessionToken) {
      // Delete session from database
      await deleteChildSession(sessionToken);

      // Clear the cookie
      cookieStore.delete(CHILD_SESSION_COOKIE);
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Child logout error:', error);
    // Still try to clear the cookie even if database operation fails
    const cookieStore = await cookies();
    cookieStore.delete(CHILD_SESSION_COOKIE);

    return NextResponse.json({
      success: true,
      message: 'Logged out',
    });
  }
}
