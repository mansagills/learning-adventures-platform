import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/test-courses/[id]/approve - Submit approval decision
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
      curriculumQuality,
      contentAccuracy,
      technicalQuality,
      accessibilityCompliant,
      ageAppropriate,
      engagementLevel
    } = await req.json();

    // Validate decision
    if (!['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVE, REJECT, or REQUEST_CHANGES' },
        { status: 400 }
      );
    }

    // Create approval record
    const approval = await prisma.courseApproval.create({
      data: {
        testCourseId: params.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Unknown',
        decision,
        notes,
        curriculumQuality,
        contentAccuracy,
        technicalQuality,
        accessibilityCompliant,
        ageAppropriate,
        engagementLevel
      }
    });

    // Update course status based on decision
    let newStatus = 'IN_TESTING';
    if (decision === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (decision === 'REQUEST_CHANGES') {
      newStatus = 'NEEDS_REVISION';
    }

    await prisma.testCourse.update({
      where: { id: params.id },
      data: { status: newStatus }
    });

    return NextResponse.json({ approval, newStatus });
  } catch (error) {
    console.error('Error submitting approval:', error);
    return NextResponse.json(
      { error: 'Failed to submit approval' },
      { status: 500 }
    );
  }
}
