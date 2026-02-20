import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/character/create
 * Create a new character for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { character: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a character
    if (user.character) {
      return NextResponse.json(
        { error: 'Character already exists' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, avatarId } = body;

    // Validate input
    if (!name || !avatarId) {
      return NextResponse.json(
        { error: 'Name and avatarId are required' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 20) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 20 characters' },
        { status: 400 }
      );
    }

    // Create character with default spawn position
    const character = await prisma.character.create({
      data: {
        userId: user.id,
        name: name.trim(),
        avatarId,
        position: { x: 640, y: 360, scene: 'WorldScene' }, // Center of campus
        lastScene: 'WorldScene',
        equipment: null, // No equipment yet
      },
    });

    // Create empty inventory
    await prisma.inventory.create({
      data: {
        characterId: character.id,
        items: [], // Empty inventory
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
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
