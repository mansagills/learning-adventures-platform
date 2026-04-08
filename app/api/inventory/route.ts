export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/inventory
 * Returns the character's inventory items and equipped gear.
 */
export async function GET() {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: apiUser.email },
      include: {
        character: {
          include: { inventory: true },
        },
        level: { select: { currency: true } },
      },
    });

    if (!user?.character) {
      return NextResponse.json({ error: 'No character found' }, { status: 404 });
    }

    return NextResponse.json({
      items: (user.character.inventory?.items as any[]) ?? [],
      equipment: user.character.equipment ?? {},
      currency: user.level?.currency ?? 0,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
