import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/test-courses/[id] - Get course details with approvals and feedback
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const course = await prisma.testCourse.findUnique({
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

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      course,
      approvals: course.approvals,
      feedback: course.feedback,
    });
  } catch (error) {
    console.error('Error fetching test course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/test-courses/[id] - Delete a test course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Files in staging directory should be cleaned up too
    // This is handled by cascading deletes for related records
    await prisma.testCourse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test course:', error);
    return NextResponse.json(
      { error: 'Failed to delete test course' },
      { status: 500 }
    );
  }
}
