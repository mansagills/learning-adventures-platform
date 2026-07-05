export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      include: {
        character: {
          include: { inventory: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.character) {
      return NextResponse.json({ character: null });
    }

    return NextResponse.json({
      character: {
        id: user.character.id,
        name: user.character.name,
        avatarId: user.character.avatarId,
        position: user.character.position,
        lastScene: user.character.lastScene,
        equipment: user.character.equipment,
        inventory: user.character.inventory,
      },
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 });
  }
}
