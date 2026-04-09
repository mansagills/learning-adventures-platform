import { NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const DAILY_JOB_LIMIT = 5;

    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      select: { id: true, level: { select: { currentLevel: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userLevel = user.level?.currentLevel ?? 1;

    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      orderBy: [{ minLevel: 'asc' }, { currencyReward: 'desc' }],
    });

    const now = new Date();
    const recentCompletions = await prisma.jobCompletion.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
    });

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const completedToday = recentCompletions.filter((c) => c.completedAt >= startOfToday).length;

    const jobsWithStatus = jobs.map((job) => {
      const lastCompletion = recentCompletions.find((c) => c.jobId === job.jobId);
      let cooldownEndsAt: string | null = null;
      let onCooldown = false;

      if (lastCompletion) {
        const cooldownMs = job.cooldownHours * 60 * 60 * 1000;
        const endsAt = new Date(lastCompletion.completedAt.getTime() + cooldownMs);
        if (endsAt > now) {
          onCooldown = true;
          cooldownEndsAt = endsAt.toISOString();
        }
      }

      const meetsLevel = userLevel >= job.minLevel;
      const dailyLimitReached = completedToday >= DAILY_JOB_LIMIT;
      const available = meetsLevel && !onCooldown && !dailyLimitReached;

      return {
        jobId: job.jobId,
        title: job.title,
        description: job.description,
        type: job.type,
        iconEmoji: job.iconEmoji,
        currencyReward: job.currencyReward,
        xpReward: job.xpReward,
        cooldownHours: job.cooldownHours,
        minLevel: job.minLevel,
        gamePath: job.gamePath,
        available,
        onCooldown,
        cooldownEndsAt,
        meetsLevel,
        dailyLimitReached,
      };
    });

    return NextResponse.json({ jobs: jobsWithStatus, completedToday, dailyLimit: DAILY_JOB_LIMIT });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
