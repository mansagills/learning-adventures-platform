import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, score } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const DAILY_JOB_LIMIT = 5;

    const job = await prisma.job.findUnique({ where: { jobId } });
    if (!job || !job.isActive) {
      return NextResponse.json({ error: 'Job not found or inactive' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      select: { id: true, level: { select: { currentLevel: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userLevel = user.level?.currentLevel ?? 1;
    if (userLevel < job.minLevel) {
      return NextResponse.json({ error: `Requires Level ${job.minLevel}` }, { status: 400 });
    }

    const now = new Date();

    const lastCompletion = await prisma.jobCompletion.findFirst({
      where: { userId: user.id, jobId },
      orderBy: { completedAt: 'desc' },
    });

    if (lastCompletion) {
      const cooldownMs = job.cooldownHours * 60 * 60 * 1000;
      const cooldownEndsAt = new Date(lastCompletion.completedAt.getTime() + cooldownMs);
      if (cooldownEndsAt > now) {
        const minutesLeft = Math.ceil((cooldownEndsAt.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { error: `Job on cooldown. Available in ${minutesLeft} minutes.`, cooldownEndsAt },
          { status: 400 }
        );
      }
    }

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const completedToday = await prisma.jobCompletion.count({
      where: { userId: user.id, completedAt: { gte: startOfToday } },
    });

    if (completedToday >= DAILY_JOB_LIMIT) {
      return NextResponse.json({ error: 'Daily job limit reached. Come back tomorrow!' }, { status: 400 });
    }

    const [, updatedLevel] = await prisma.$transaction([
      prisma.jobCompletion.create({
        data: {
          userId: user.id,
          jobId,
          currencyEarned: job.currencyReward,
          xpEarned: job.xpReward,
          score: score ?? null,
        },
      }),
      prisma.userLevel.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalXP: job.xpReward,
          currency: job.currencyReward,
          currentLevel: 1,
          xpToNextLevel: 100,
        },
        update: {
          totalXP: { increment: job.xpReward },
          currency: { increment: job.currencyReward },
        },
      }),
    ]);

    const newLevel = Math.floor(updatedLevel.totalXP / 100) + 1;
    let leveledUp = false;
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
      leveledUp = true;
    }

    const finalLevel = await prisma.userLevel.findUnique({
      where: { userId: user.id },
      select: { currentLevel: true, totalXP: true, currency: true, xpToNextLevel: true },
    });

    return NextResponse.json({
      success: true,
      jobId,
      currencyEarned: job.currencyReward,
      xpEarned: job.xpReward,
      completedToday: completedToday + 1,
      dailyLimit: DAILY_JOB_LIMIT,
      leveledUp,
      level: finalLevel,
    });
  } catch (error) {
    console.error('Error completing job:', error);
    return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 });
  }
}
