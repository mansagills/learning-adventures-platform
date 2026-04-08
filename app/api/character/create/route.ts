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

    if (user.character) {
      return NextResponse.json({ error: 'Character already exists' }, { status: 400 });
    }

    const body = await request.json();
    const { name, avatarId } = body;

    if (!name || !avatarId) {
      return NextResponse.json({ error: 'Name and avatarId are required' }, { status: 400 });
    }

    if (name.length < 2 || name.length > 20) {
      return NextResponse.json({ error: 'Name must be between 2 and 20 characters' }, { status: 400 });
    }

    const character = await prisma.character.create({
      data: {
        userId: user.id,
        name: name.trim(),
        avatarId,
        position: { x: 640, y: 360, scene: 'WorldScene' },
        lastScene: 'WorldScene',
        equipment: undefined,
      },
    });

    await prisma.inventory.create({
      data: {
        characterId: character.id,
        items: [],
        capacity: 20,
      },
    });

    return NextResponse.json({
      success: true,
      character: {
        id: character.id,
        name: character.name,
        avatarId: character.avatarId,
        position: character.position,
      },
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
