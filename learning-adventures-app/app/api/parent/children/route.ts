import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPIN } from '@/lib/childAuth';
import { generateUniqueUsername } from '@/lib/usernameGenerator';

const AVATARS = [
  'tiger', 'dragon', 'eagle', 'dolphin', 'fox', 'lion', 'bear', 'wolf',
  'panda', 'owl', 'phoenix', 'turtle', 'penguin', 'koala', 'cheetah', 'rocket'
];

/**
 * GET /api/parent/children
 * Get all children for the authenticated parent
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user is a parent and is verified
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isVerifiedAdult: true }
    });

    if (user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Only parent accounts can manage children' },
        { status: 403 }
      );
    }

    // Get all children for this parent
    const children = await prisma.childProfile.findMany({
      where: { parentId: session.user.id },
      select: {
        id: true,
        displayName: true,
        username: true,
        gradeLevel: true,
        avatarId: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      children,
      count: children.length,
      isVerifiedAdult: user?.isVerifiedAdult || false,
    });
  } catch (error: any) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/parent/children
 * Create a new child profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user is a verified parent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isVerifiedAdult: true }
    });

    if (user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Only parent accounts can create children' },
        { status: 403 }
      );
    }

    if (!user.isVerifiedAdult) {
      return NextResponse.json(
        { error: 'Parent verification required before adding children' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { displayName, gradeLevel, avatarId, pin } = body;

    // Validate required fields
    if (!displayName || !gradeLevel || !pin) {
      return NextResponse.json(
        { error: 'Display name, grade level, and PIN are required' },
        { status: 400 }
      );
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Validate grade level
    const validGrades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    if (!validGrades.includes(gradeLevel)) {
      return NextResponse.json(
        { error: 'Invalid grade level' },
        { status: 400 }
      );
    }

    // Validate avatar
    const avatar = avatarId && AVATARS.includes(avatarId) ? avatarId : 'tiger';

    // Generate unique username
    const username = await generateUniqueUsername();

    // Hash PIN
    const hashedPIN = await hashPIN(pin);

    // Create child profile
    const child = await prisma.childProfile.create({
      data: {
        parentId: session.user.id,
        displayName,
        username,
        authCode: hashedPIN,
        gradeLevel,
        avatarId: avatar,
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        gradeLevel: true,
        avatarId: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      child,
      message: `Child account created! Username: ${username}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: 'Failed to create child account' },
      { status: 500 }
    );
  }
}
