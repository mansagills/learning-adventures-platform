import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/test-games/[id]/approve - Submit approval decision
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      decision,
      notes,
      educationalQuality,
      technicalQuality,
      accessibilityCompliant,
      ageAppropriate,
      engagementLevel
    } = await req.json();

    // Create approval record
    const approval = await prisma.gameApproval.create({
      data: {
        testGameId: params.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Unknown',
        decision,
        notes,
        educationalQuality,
        technicalQuality,
        accessibilityCompliant,
        ageAppropriate,
        engagementLevel
      }
    });

    // Update game status based on decision
    let newStatus: string;
    switch (decision) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        break;
      case 'REQUEST_CHANGES':
        newStatus = 'NEEDS_REVISION';
        break;
      default:
        newStatus = 'IN_TESTING';
    }

    await prisma.testGame.update({
      where: { id: params.id },
      data: { status: newStatus }
    });

    return NextResponse.json({ approval });
  } catch (error) {
    console.error('Error submitting approval:', error);
    return NextResponse.json(
      { error: 'Failed to submit approval' },
      { status: 500 }
    );
  }
}
