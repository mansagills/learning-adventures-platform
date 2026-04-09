export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/test-courses - List all test courses
export async function GET(req: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser || apiUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    // If slug is provided, filter by slug
    const where = slug ? { slug } : {};

    const courses = await prisma.testCourse.findMany({
      where,
      include: {
        _count: {
          select: {
            approvals: true,
            feedback: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching test courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/test-courses - Create new test course entry (manual creation)
export async function POST(req: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser || apiUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      title,
      description,
      subject,
      gradeLevel,
      difficulty,
      isPremium,
      estimatedMinutes,
      totalXP,
      stagingPath,
      thumbnailPath,
      lessonsData,
    } = body;

    // Check if course already exists
    const existing = await prisma.testCourse.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 400 }
      );
    }

    const course = await prisma.testCourse.create({
      data: {
        slug,
        title,
        description,
        subject,
        gradeLevel,
        difficulty,
        isPremium: isPremium ?? false,
        estimatedMinutes,
        totalXP: totalXP ?? 0,
        stagingPath,
        thumbnailPath,
        lessonsData,
        createdBy: apiUser.id,
        status: 'NOT_TESTED',
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating test course:', error);
    return NextResponse.json(
      { error: 'Failed to create test course' },
      { status: 500 }
    );
  }
}
