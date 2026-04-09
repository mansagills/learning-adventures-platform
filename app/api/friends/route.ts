import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';

// GET /api/friends - Get user's friends and pending requests
export async function GET(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();
    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'ACCEPTED';
    const status = statusParam as FriendshipStatus;

    // Get friendships where user is either the initiator or the friend
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: apiUser.id, status },
          { friendId: apiUser.id, status },
        ],
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
        friend: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to always show the "other" user
    const formattedFriendships = friendships.map((friendship) => {
      const isInitiator = friendship.userId === apiUser.id;
      const friendData = isInitiator ? friendship.friend : friendship.user;

      return {
        id: friendship.id,
        friendId: friendData.id,
        name: friendData.name,
        email: friendData.email,
        image: friendData.image,
        gradeLevel: friendData.gradeLevel,
        currentLevel: friendData.level?.currentLevel || 1,
        currentStreak: friendData.level?.currentStreak || 0,
        totalXP: friendData.level?.totalXP || 0,
        status: friendship.status,
        createdAt: friendship.createdAt,
        acceptedAt: friendship.acceptedAt,
        isInitiator,
      };
    });

    return NextResponse.json({
      friends: formattedFriendships,
      count: formattedFriendships.length,
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();
    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      );
    }

    if (friendId === apiUser.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a friend' },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: apiUser.id, friendId },
          { userId: friendId, friendId: apiUser.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Friendship already exists' },
        { status: 400 }
      );
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        userId: apiUser.id,
        friendId,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            gradeLevel: true,
          },
        },
      },
    });

    return NextResponse.json({
      friendship: {
        id: friendship.id,
        friendId: friendship.friend.id,
        name: friendship.friend.name,
        email: friendship.friend.email,
        image: friendship.friend.image,
        gradeLevel: friendship.friend.gradeLevel,
        status: friendship.status,
        createdAt: friendship.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating friendship:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}

// DELETE /api/friends?friendshipId=xxx - Remove friend or reject request
export async function DELETE(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();
    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get('friendshipId');

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      );
    }

    // Verify the user is part of this friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        OR: [{ userId: apiUser.id }, { friendId: apiUser.id }],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting friendship:', error);
    return NextResponse.json(
      { error: 'Failed to remove friendship' },
      { status: 500 }
    );
  }
}
