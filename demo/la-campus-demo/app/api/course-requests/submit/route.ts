export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Basic validation function
function validateCourseRequest(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Section 1: Requestor Information
  if (!data.fullName?.trim()) errors.push('Full name is required');
  if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    errors.push('Valid email is required');
  if (!data.role) errors.push('Role is required');

  // Section 2: Student Profile
  if (!data.studentName?.trim()) errors.push('Student name is required');
  if (!data.studentAge || data.studentAge < 1)
    errors.push('Valid student age is required');
  if (!data.gradeLevel) errors.push('Grade level is required');

  // Section 3: Subject & Focus
  if (!data.primarySubject) errors.push('Primary subject is required');

  // Section 10: Consent
  if (!data.consentGiven)
    errors.push('You must provide consent to submit the request');

  return { isValid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has PARENT or TEACHER role
    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      select: { role: true, email: true },
    });

    if (
      !user ||
      (user.role !== 'PARENT' &&
        user.role !== 'TEACHER' &&
        user.role !== 'ADMIN')
    ) {
      return NextResponse.json(
        { error: 'Only parents and teachers can create course requests' },
        { status: 403 }
      );
    }

    const body = await request.json();
    // Destructure id and userId out so they can't be injected via the body
    const { id: requestId, userId: _ignoredUserId, ...safeBody } = body;

    // Validate all required fields
    const validation = validateCourseRequest(safeBody);
    if (!validation.isValid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    // Create or update course request
    let courseRequest;

    if (requestId) {
      // Verify ownership before updating
      const existing = await prisma.courseRequest.findUnique({
        where: { id: requestId },
        select: { userId: true },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      if (existing.userId !== apiUser.id && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      courseRequest = await prisma.courseRequest.update({
        where: { id: requestId },
        data: {
          ...safeBody,
          isDraft: false,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
    } else {
      // Create new submitted request — userId always comes from session
      courseRequest = await prisma.courseRequest.create({
        data: {
          ...safeBody,
          userId: apiUser.id,
          isDraft: false,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
    }

    // TODO: Send email notifications
    // await sendConfirmationEmail(user.email, courseRequest);
    // await sendAdminNotification(courseRequest);

    return NextResponse.json({
      success: true,
      requestId: courseRequest.id,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
