import { NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { apiUser, error } = await getApiUser();
  if (error) return error;

  const [allQuests, completions] = await Promise.all([
    prisma.quest.findMany({ orderBy: [{ subject: 'asc' }, { order: 'asc' }] }),
    prisma.questCompletion.findMany({
      where: { userId: apiUser.id },
      select: { questId: true },
    }),
  ]);

  const completedIds = new Set(completions.map((c) => c.questId));

  const quests = allQuests.map((q) => {
    const prereqs = q.prerequisites as string[];
    const prerequisitesMet = prereqs.every((id) => completedIds.has(id));
    const isCompleted = completedIds.has(q.questId);

    let status: 'completed' | 'active' | 'available' | 'locked';
    if (isCompleted) status = 'completed';
    else if (!prerequisitesMet) status = 'locked';
    else if (prereqs.length === 0 || prereqs.some((id) => completedIds.has(id))) status = 'active';
    else status = 'available';

    return {
      id: q.id,
      questId: q.questId,
      title: q.title,
      description: q.description,
      subject: q.subject,
      buildingId: q.buildingId,
      xpReward: q.xpReward,
      coinReward: q.coinReward,
      objectives: q.objectives,
      prerequisites: q.prerequisites,
      order: q.order,
      status,
    };
  });

  return NextResponse.json({ quests });
}
