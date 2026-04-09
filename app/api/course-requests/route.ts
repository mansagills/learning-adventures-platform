export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List user's requests
export async function GET(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { userId: apiUser.id, isDraft: false };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.courseRequest.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        studentName: true,
        studentAge: true,
        primarySubject: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        urgencyLevel: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Request listing error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
