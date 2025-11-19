/**
 * Debug endpoint to check session data
 * DELETE THIS FILE after debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      session: session,
      hasSession: !!session,
      user: session?.user || null,
      role: session?.user?.role || null,
      roleType: typeof session?.user?.role,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Error fetching session',
      details: String(error)
    }, { status: 500 });
  }
}
