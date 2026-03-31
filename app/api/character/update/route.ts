import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/character/update
 * Update character position and other data
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with character
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { character: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { position, lastScene, equipment } = body;

    // Build update data
    const updateData: any = {};

    if (position) {
      // Validate position
      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        return NextResponse.json(
          { error: 'Invalid position format' },
          { status: 400 }
        );
      }
      updateData.position = position;
    }

    if (lastScene) {
      updateData.lastScene = lastScene;
    }

    if (equipment !== undefined) {
      updateData.equipment = equipment;
    }

    // Update character
    const updatedCharacter = await prisma.character.update({
      where: { id: user.character.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      character: {
        id: updatedCharacter.id,
        position: updatedCharacter.position,
        lastScene: updatedCharacter.lastScene,
        equipment: updatedCharacter.equipment,
      },
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}
