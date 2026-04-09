import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch single request by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseRequest = await prisma.courseRequest.findUnique({
      where: { id: params.id },
    });

    if (!courseRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verify ownership (or admin access)
    if (
      courseRequest.userId !== apiUser.id &&
      apiUser.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to view this request' },
        { status: 403 }
      );
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
