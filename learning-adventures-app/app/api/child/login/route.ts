import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPIN, createChildSession } from '@/lib/childAuth';
import { cookies } from 'next/headers';

const CHILD_SESSION_COOKIE = 'child_session';
const CHILD_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

/**
 * POST /api/child/login
 * Authenticate a child with username + PIN
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, pin } = body;

    // Validate input
    if (!username || !pin) {
      return NextResponse.json(
        { error: 'Username and PIN are required' },
        { status: 400 }
      );
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Find child by username
    const child = await prisma.childProfile.findUnique({
      where: { username },
      include: {
        parent: {
          select: {
            id: true,
            isVerifiedAdult: true,
          }
        }
      }
    });

    if (!child) {
      // Use generic error to prevent username enumeration
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      );
    }

    // Verify parent is still verified (safety check)
    if (!child.parent.isVerifiedAdult) {
      return NextResponse.json(
        { error: 'Parent account verification required' },
        { status: 403 }
      );
    }

    // Verify PIN
    const isValidPIN = await verifyPIN(pin, child.authCode);
    if (!isValidPIN) {
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createChildSession({
      childId: child.id,
      parentId: child.parentId,
      username: child.username,
      gradeLevel: child.gradeLevel,
    });

    // Update last login time
    await prisma.childProfile.update({
      where: { id: child.id },
      data: { lastLoginAt: new Date() }
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(CHILD_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CHILD_SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    });

    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        displayName: child.displayName,
        username: child.username,
        gradeLevel: child.gradeLevel,
        avatarId: child.avatarId,
      },
      message: `Welcome back, ${child.displayName}!`,
    });
  } catch (error: any) {
    console.error('Child login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
