import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/test-games - List all test games
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const games = await prisma.testGame.findMany({
      include: {
        _count: {
          select: {
            approvals: true,
            feedback: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching test games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test games' },
      { status: 500 }
    );
  }
}

// POST /api/admin/test-games - Create new test game entry
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      gameId,
      title,
      description,
      category,
      type,
      gradeLevel,
      difficulty,
      skills,
      estimatedTime,
      filePath,
      isHtmlGame,
      isReactComponent,
    } = body;

    // Check if game already exists
    const existing = await prisma.testGame.findUnique({
      where: { gameId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Game with this ID already exists' },
        { status: 400 }
      );
    }

    const game = await prisma.testGame.create({
      data: {
        gameId,
        title,
        description,
        category,
        type,
        gradeLevel,
        difficulty,
        skills,
        estimatedTime,
        filePath,
        isHtmlGame: isHtmlGame ?? true,
        isReactComponent: isReactComponent ?? false,
        createdBy: session.user.id,
        status: 'NOT_TESTED',
      },
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    console.error('Error creating test game:', error);
    return NextResponse.json(
      { error: 'Failed to create test game' },
      { status: 500 }
    );
  }
}
