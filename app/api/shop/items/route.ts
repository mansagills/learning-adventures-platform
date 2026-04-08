import { NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [items, user] = await Promise.all([
      prisma.shopItem.findMany({
        where: { isAvailable: true },
        orderBy: [{ type: 'asc' }, { price: 'asc' }],
      }),
      prisma.user.findUnique({
        where: { id: apiUser.id },
        include: {
          level: { select: { currency: true } },
          character: { include: { inventory: true } },
        },
      }),
    ]);

    const currency = user?.level?.currency ?? 0;
    const inventory = (user?.character?.inventory?.items as any[]) ?? [];

    return NextResponse.json({ items, currency, inventory });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json({ error: 'Failed to fetch shop items' }, { status: 500 });
  }
}
