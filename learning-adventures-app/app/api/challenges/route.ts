import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays, addWeeks } from 'date-fns';

// GET /api/challenges - Get user's challenges
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';

    // Get challenges where user is either creator or challenged
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { challengedId: session.user.id }
        ],
        status: status as any
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      challenges,
      count: challenges.length
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Create a new challenge
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      challengedId,
      type,
      category,
      adventureId,
      goalValue,
      unit,
      duration = 7 // days
    } = body;

    if (!challengedId || !type || !goalValue || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (challengedId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot challenge yourself' },
        { status: 400 }
      );
    }

    // Verify the challenged user exists
    const challengedUser = await prisma.user.findUnique({
      where: { id: challengedId }
    });

    if (!challengedUser) {
      return NextResponse.json(
        { error: 'Challenged user not found' },
        { status: 404 }
      );
    }

    // Create the challenge
    const endDate = addDays(new Date(), duration);

    const challenge = await prisma.challenge.create({
      data: {
        creatorId: session.user.id,
        challengedId,
        type,
        category,
        adventureId,
        goalValue,
        unit,
        endDate,
        status: 'PENDING'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            gradeLevel: true
          }
        },
        challenged: {
          select: {
            id: true,
            name: true,
            image: true,
            gradeLevel: true
          }
        }
      }
    });

    return NextResponse.json({ challenge });

  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges?id=xxx - Cancel/decline a challenge
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Verify the user is part of this challenge
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: challengeId,
        OR: [
          { creatorId: session.user.id },
          { challengedId: session.user.id }
        ]
      }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // If challenged user declines, mark as DECLINED
    // If creator cancels, delete the challenge
    if (challenge.challengedId === session.user.id && challenge.status === 'PENDING') {
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { status: 'DECLINED' }
      });
    } else {
      await prisma.challenge.delete({
        where: { id: challengeId }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to remove challenge' },
      { status: 500 }
    );
  }
}
