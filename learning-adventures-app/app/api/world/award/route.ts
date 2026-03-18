import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/world/award
 * Returns the player's current world status (level, XP, currency).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const level = await prisma.userLevel.findUnique({
      where: { userId: user.id },
      select: { currentLevel: true, totalXP: true, currency: true, xpToNextLevel: true },
    });

    return NextResponse.json({
      level: level ?? { currentLevel: 1, totalXP: 0, currency: 0, xpToNextLevel: 100 },
    });
  } catch (error) {
    console.error('Error fetching world status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

/**
 * POST /api/world/award
 * Body: { xp?: number, coins?: number }
 * Awards XP and/or coins to the authenticated user after a world adventure completes.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { xp = 0, coins = 0 } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert UserLevel — create if first time, otherwise increment
    const updatedLevel = await prisma.userLevel.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalXP: xp,
        currency: coins,
        currentLevel: 1,
        xpToNextLevel: 100,
      },
      update: {
        totalXP: { increment: xp },
        currency: { increment: coins },
      },
    });

    // Simple level-up check: every 100 XP = 1 level
    const newLevel = Math.floor(updatedLevel.totalXP / 100) + 1;
    if (newLevel !== updatedLevel.currentLevel) {
      const levelUpBonus = (newLevel - updatedLevel.currentLevel) * 100;
      await prisma.userLevel.update({
        where: { userId: user.id },
        data: {
          currentLevel: newLevel,
          xpToNextLevel: newLevel * 100,
          currency: { increment: levelUpBonus },
        },
      });
    }

    const finalLevel = await prisma.userLevel.findUnique({
      where: { userId: user.id },
      select: { currentLevel: true, totalXP: true, currency: true, xpToNextLevel: true },
    });

    return NextResponse.json({
      success: true,
      xpAwarded: xp,
      coinsAwarded: coins,
      level: finalLevel,
      leveledUp: newLevel !== updatedLevel.currentLevel,
    });
  } catch (error) {
    console.error('Error awarding world XP/coins:', error);
    return NextResponse.json({ error: 'Award failed' }, { status: 500 });
  }
}
