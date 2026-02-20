import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/test-courses/[id]/status - Update course status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    const validStatuses = [
      'NOT_TESTED',
      'IN_TESTING',
      'APPROVED',
      'REJECTED',
      'NEEDS_REVISION',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 }
      );
    }

    const course = await prisma.testCourse.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error updating course status:', error);
    return NextResponse.json(
      { error: 'Failed to update course status' },
      { status: 500 }
    );
  }
}
