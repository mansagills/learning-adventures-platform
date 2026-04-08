export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
/**
 * Debug endpoint to check session data
 * DELETE THIS FILE after debugging
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    return NextResponse.json(
      {
        session: apiUser,
        hasSession: !!apiUser,
        user: apiUser || null,
        role: apiUser?.role || null,
        roleType: typeof apiUser?.role,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error fetching session',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
