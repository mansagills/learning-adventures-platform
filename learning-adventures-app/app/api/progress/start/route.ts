import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * POST /api/progress/start
 * Start tracking progress for an adventure
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { adventureId, adventureType, category } = body;

    if (!adventureId || !adventureType || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: adventureId, adventureType, category' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if progress already exists
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_adventureId: {
          userId: user.id,
          adventureId,
        },
      },
    });

    if (existingProgress) {
      // Update last accessed time
      const updated = await prisma.userProgress.update({
        where: {
          userId_adventureId: {
            userId: user.id,
            adventureId,
          },
        },
        data: {
          lastAccessed: new Date(),
          status: existingProgress.status === 'NOT_STARTED' ? 'IN_PROGRESS' : existingProgress.status,
        },
      });

      return NextResponse.json({
        progress: updated,
        isNew: false,
      });
    }

    // Create new progress entry
    const progress = await prisma.userProgress.create({
      data: {
        userId: user.id,
        adventureId,
        adventureType,
        category,
        status: 'IN_PROGRESS',
        lastAccessed: new Date(),
      },
    });

    return NextResponse.json({
      progress,
      isNew: true,
    });
  } catch (error) {
    console.error('Error starting adventure progress:', error);
    return NextResponse.json(
      { error: 'Failed to start adventure progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
