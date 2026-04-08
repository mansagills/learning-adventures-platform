import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const level = await prisma.userLevel.findUnique({
      where: { userId: apiUser.id },
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

export async function POST(request: NextRequest) {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { xp = 0, coins = 0 } = await request.json();

    const updatedLevel = await prisma.userLevel.upsert({
      where: { userId: apiUser.id },
      create: {
        userId: apiUser.id,
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

    const newLevel = Math.floor(updatedLevel.totalXP / 100) + 1;
    if (newLevel !== updatedLevel.currentLevel) {
      const levelUpBonus = (newLevel - updatedLevel.currentLevel) * 100;
      await prisma.userLevel.update({
        where: { userId: apiUser.id },
        data: {
          currentLevel: newLevel,
          xpToNextLevel: newLevel * 100,
          currency: { increment: levelUpBonus },
        },
      });
    }

    const finalLevel = await prisma.userLevel.findUnique({
      where: { userId: apiUser.id },
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
