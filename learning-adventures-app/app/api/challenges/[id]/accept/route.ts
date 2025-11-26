import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challengeId = params.id;

    // Verify the user is the challenged user
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: challengeId,
        challengedId: session.user.id,
        status: 'PENDING'
      }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found or already accepted' },
        { status: 404 }
      );
    }

    // Accept the challenge
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'ACTIVE',
        startDate: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            gradeLevel: true,
            level: true
          }
        },
        challenged: {
          select: {
            id: true,
            name: true,
            image: true,
            gradeLevel: true,
            level: true
          }
        }
      }
    });

    return NextResponse.json({ challenge: updatedChallenge });

  } catch (error) {
    console.error('Error accepting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to accept challenge' },
      { status: 500 }
    );
  }
}
