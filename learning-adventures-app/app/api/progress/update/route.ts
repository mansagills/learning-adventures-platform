import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/progress/update
 * Update progress for an ongoing adventure
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
    const { adventureId, timeSpent, score, status } = body;

    if (!adventureId) {
      return NextResponse.json(
        { error: 'Missing required field: adventureId' },
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

    // Build update data
    const updateData: any = {
      lastAccessed: new Date(),
    };

    if (timeSpent !== undefined) {
      updateData.timeSpent = timeSpent;
    }

    if (score !== undefined) {
      updateData.score = score;
    }

    if (status) {
      updateData.status = status;
    }

    // Update progress
    const progress = await prisma.userProgress.update({
      where: {
        userId_adventureId: {
          userId: user.id,
          adventureId,
        },
      },
      data: updateData,
    });

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error('Error updating adventure progress:', error);

    // Handle case where progress doesn't exist
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Progress not found. Please start the adventure first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update adventure progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
