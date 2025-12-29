import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch single request by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseRequest = await prisma.courseRequest.findUnique({
      where: { id: params.id },
    });

    if (!courseRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verify ownership (or admin access)
    if (courseRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to view this request' }, { status: 403 });
    }

    return NextResponse.json(courseRequest);
  } catch (error) {
    console.error('Request fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
