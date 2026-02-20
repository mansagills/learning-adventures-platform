import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/character
 * Fetch the authenticated user's character data
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with character
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        character: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return null if no character exists (user needs to create one)
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
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}
