import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/test-games/[id] - Get game details with approvals and feedback
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser || apiUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.testGame.findUnique({
      where: { id: params.id },
      include: {
        approvals: {
          orderBy: { createdAt: 'desc' },
        },
        feedback: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({
      game,
      approvals: game.approvals,
      feedback: game.feedback,
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
