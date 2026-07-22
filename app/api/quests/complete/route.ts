import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { apiUser, error } = await getApiUser();
  if (error) return error;

  const body = await req.json();
  const { questId } = body;

  if (!questId || typeof questId !== 'string') {
    return NextResponse.json({ error: 'questId is required' }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { questId } });
  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
  }

  // Check already completed
  const existing = await prisma.questCompletion.findUnique({
    where: { userId_questId: { userId: apiUser.id, questId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Quest already completed' }, { status: 409 });
  }

  // Validate prerequisites
  const prereqs = quest.prerequisites as string[];
  if (prereqs.length > 0) {
    const completedPrereqs = await prisma.questCompletion.findMany({
      where: { userId: apiUser.id, questId: { in: prereqs } },
      select: { questId: true },
    });
    const completedIds = new Set(completedPrereqs.map((c) => c.questId));
    const unmet = prereqs.filter((id) => !completedIds.has(id));
    if (unmet.length > 0) {
      return NextResponse.json(
        { error: 'Prerequisites not met', unmet },
        { status: 422 }
      );
    }
  }

  // Record completion and award XP + coins in a transaction
  const [completion, level] = await prisma.$transaction(async (tx) => {
    const comp = await tx.questCompletion.create({
      data: { userId: apiUser.id, questId },
    });

    const updated = await tx.userLevel.upsert({
      where: { userId: apiUser.id },
      update: {
        totalXP: { increment: quest.xpReward },
        currency: { increment: quest.coinReward },
      },
      create: {
        userId: apiUser.id,
        totalXP: quest.xpReward,
        currency: quest.coinReward,
        currentLevel: 1,
      },
    });

    return [comp, updated];
  });

  return NextResponse.json({
    success: true,
    questId,
    xpAwarded: quest.xpReward,
    coinsAwarded: quest.coinReward,
    completedAt: completion.completedAt,
    level: {
      totalXP: level.totalXP,
      currency: level.currency,
      currentLevel: level.currentLevel,
    },
  });
}
