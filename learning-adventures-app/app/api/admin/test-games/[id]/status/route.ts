import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestGameStatus } from '@prisma/client';

// PATCH /api/admin/test-games/[id]/status - Update game status
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

    const validStatuses: TestGameStatus[] = [
      TestGameStatus.NOT_TESTED,
      TestGameStatus.IN_TESTING,
      TestGameStatus.APPROVED,
      TestGameStatus.REJECTED,
      TestGameStatus.NEEDS_REVISION,
    ];
    if (!validStatuses.includes(status as TestGameStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const game = await prisma.testGame.update({
      where: { id: params.id },
      data: { status: status as TestGameStatus },
    });

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Error updating game status:', error);
    return NextResponse.json(
      { error: 'Failed to update game status' },
      { status: 500 }
    );
  }
}
