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

    const friendshipId = params.id;

    // Verify the user is the recipient of this friend request
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        friendId: session.user.id, // User must be the recipient
        status: 'PENDING',
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // Accept the friendship
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            gradeLevel: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({
      friendship: {
        id: updatedFriendship.id,
        friendId: updatedFriendship.user.id,
        name: updatedFriendship.user.name,
        email: updatedFriendship.user.email,
        image: updatedFriendship.user.image,
        gradeLevel: updatedFriendship.user.gradeLevel,
        currentLevel: updatedFriendship.user.level?.currentLevel || 1,
        currentStreak: updatedFriendship.user.level?.currentStreak || 0,
        totalXP: updatedFriendship.user.level?.totalXP || 0,
        status: updatedFriendship.status,
        acceptedAt: updatedFriendship.acceptedAt,
      },
    });
  } catch (error) {
    console.error('Error accepting friendship:', error);
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}
