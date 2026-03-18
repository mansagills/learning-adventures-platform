import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/shop/items
 * Returns all available shop items and the user's current coin balance.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [items, user] = await Promise.all([
      prisma.shopItem.findMany({
        where: { isAvailable: true },
        orderBy: [{ type: 'asc' }, { price: 'asc' }],
      }),
      prisma.user.findUnique({
        where: { email: session.user.email },
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
