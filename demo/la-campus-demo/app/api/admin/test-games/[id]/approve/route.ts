export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestGameStatus } from '@prisma/client';

// POST /api/admin/test-games/[id]/approve - Submit approval decision
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser || apiUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      decision,
      notes,
      educationalQuality,
      technicalQuality,
      accessibilityCompliant,
      ageAppropriate,
      engagementLevel,
    } = await req.json();

    // Create approval record
    const approval = await prisma.gameApproval.create({
      data: {
        testGameId: params.id,
        userId: apiUser.id,
        userName: apiUser.name || apiUser.email || 'Unknown',
        decision,
        notes,
        educationalQuality,
        technicalQuality,
        accessibilityCompliant,
        ageAppropriate,
        engagementLevel,
      },
    });

    // Update game status based on decision
    let newStatus: TestGameStatus;
    switch (decision) {
      case 'APPROVE':
        newStatus = TestGameStatus.APPROVED;
        break;
      case 'REJECT':
        newStatus = TestGameStatus.REJECTED;
        break;
      case 'REQUEST_CHANGES':
        newStatus = TestGameStatus.NEEDS_REVISION;
        break;
      default:
        newStatus = TestGameStatus.IN_TESTING;
    }

    await prisma.testGame.update({
      where: { id: params.id },
      data: { status: newStatus },
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
