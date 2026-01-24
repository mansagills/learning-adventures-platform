import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPIN } from '@/lib/childAuth';

const AVATARS = [
  'tiger', 'dragon', 'eagle', 'dolphin', 'fox', 'lion', 'bear', 'wolf',
  'panda', 'owl', 'phoenix', 'turtle', 'penguin', 'koala', 'cheetah', 'rocket'
];

/**
 * GET /api/parent/children/[id]
 * Get a specific child's details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const child = await prisma.childProfile.findFirst({
      where: {
        id: params.id,
        parentId: session.user.id, // Ensure parent owns this child
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        gradeLevel: true,
        avatarId: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ child });
  } catch (error: any) {
    console.error('Error fetching child:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/parent/children/[id]
 * Update a child's profile (displayName, gradeLevel, avatarId, or PIN)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify child belongs to parent
    const existingChild = await prisma.childProfile.findFirst({
      where: {
        id: params.id,
        parentId: session.user.id,
      }
    });

    if (!existingChild) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { displayName, gradeLevel, avatarId, pin } = body;

    // Build update data
    const updateData: any = {};

    if (displayName) {
      updateData.displayName = displayName;
    }

    if (gradeLevel) {
      const validGrades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      if (!validGrades.includes(gradeLevel)) {
        return NextResponse.json(
          { error: 'Invalid grade level' },
          { status: 400 }
        );
      }
      updateData.gradeLevel = gradeLevel;
    }

    if (avatarId) {
      if (!AVATARS.includes(avatarId)) {
        return NextResponse.json(
          { error: 'Invalid avatar' },
          { status: 400 }
        );
      }
      updateData.avatarId = avatarId;
    }

    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: 'PIN must be exactly 4 digits' },
          { status: 400 }
        );
      }
      updateData.authCode = await hashPIN(pin);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const child = await prisma.childProfile.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        displayName: true,
        username: true,
        gradeLevel: true,
        avatarId: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });

    return NextResponse.json({
      child,
      message: 'Child profile updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Failed to update child' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/parent/children/[id]
 * Delete a child profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify child belongs to parent
    const existingChild = await prisma.childProfile.findFirst({
      where: {
        id: params.id,
        parentId: session.user.id,
      }
    });

    if (!existingChild) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    // Delete all sessions first (cascade should handle this, but being explicit)
    await prisma.childSession.deleteMany({
      where: { childId: params.id }
    });

    // Delete child profile
    await prisma.childProfile.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Child profile deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    );
  }
}
