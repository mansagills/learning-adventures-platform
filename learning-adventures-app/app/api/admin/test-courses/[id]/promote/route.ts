import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promoteCourseToProduction } from '@/lib/upload/coursePackageHandler';

// POST /api/admin/test-courses/[id]/promote - Promote course to production
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the course exists and is approved
    const testCourse = await prisma.testCourse.findUnique({
      where: { id: params.id }
    });

    if (!testCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (testCourse.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Course must be approved before promoting to production' },
        { status: 400 }
      );
    }

    if (testCourse.promotedToCourseId) {
      return NextResponse.json(
        { error: 'Course has already been promoted to production' },
        { status: 400 }
      );
    }

    // Promote the course
    const result = await promoteCourseToProduction(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Course promoted to production successfully',
      ...result
    });
  } catch (error) {
    console.error('Error promoting course to production:', error);
    return NextResponse.json(
      { 
        error: 'Failed to promote course to production',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
