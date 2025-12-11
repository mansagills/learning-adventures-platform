import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/parent/verify
 * Marks user as verified adult (mock verification for MVP)
 *
 * TODO: Replace with real verification in production:
 * - Stripe Identity verification
 * - OR $0.30 credit card charge for age verification
 * - Update this endpoint to integrate with chosen verification service
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

    // Verify user has PARENT role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Only parent accounts can be verified' },
        { status: 403 }
      );
    }

    // Update user to verified adult
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { isVerifiedAdult: true },
      select: {
        id: true,
        email: true,
        name: true,
        isVerifiedAdult: true,
      },
    });

    return NextResponse.json({
      verified: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Parent verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify parent' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/parent/verify
 * Check if current user is verified adult
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ verified: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isVerifiedAdult: true },
    });

    return NextResponse.json({
      verified: user?.isVerifiedAdult || false,
    });
  } catch (error: any) {
    console.error('Check verification error:', error);
    return NextResponse.json({ verified: false });
  }
}
