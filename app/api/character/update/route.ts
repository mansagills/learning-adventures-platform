export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      include: { character: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const body = await request.json();
    const { position, lastScene, equipment } = body;

    const updateData: any = {};

    if (position) {
      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        return NextResponse.json({ error: 'Invalid position format' }, { status: 400 });
      }
      updateData.position = position;
    }

    if (lastScene) {
      updateData.lastScene = lastScene;
    }

    if (equipment !== undefined) {
      updateData.equipment = equipment;
    }

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
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}
