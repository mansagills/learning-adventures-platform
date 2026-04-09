export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
/**
 * Games Progress API Route
 *
 * GET /api/progress/games
 * Returns user's progress for all games
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { apiUser, error: authError } = await getApiUser();
    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all game progress for user
    const progress = await prisma.userProgress.findMany({
      where: {
        userId: apiUser.id,
        adventureType: 'game', // Only games, not lessons
      },
      select: {
        id: true,
        adventureId: true,
        status: true,
        score: true,
        timeSpent: true,
        completedAt: true,
        lastAccessed: true,
      },
      orderBy: {
        lastAccessed: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Games progress fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch game progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
