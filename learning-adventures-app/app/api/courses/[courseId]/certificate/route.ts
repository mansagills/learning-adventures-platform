/**
 * POST /api/courses/[courseId]/certificate
 *
 * Generate a certificate for a completed course
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/responses';
import { prisma } from '@/lib/prisma';
import { generateCertificate } from '@/lib/certificates/certificateGenerator';

interface RouteParams {
  params: {
    courseId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    const { courseId } = params;

    // Get user's enrollment for this course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return errorResponse('NOT_ENROLLED', 'You are not enrolled in this course', 404);
    }

    if (enrollment.status !== 'COMPLETED') {
      return errorResponse(
        'COURSE_NOT_COMPLETED',
        'You must complete the course before generating a certificate',
        400
      );
    }

    // Generate or retrieve existing certificate
    const certificate = await generateCertificate(enrollment.id);

    return successResponse({
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.completionDate,
        totalXPEarned: certificate.totalXPEarned,
        averageScore: certificate.averageScore,
        totalLessons: certificate.totalLessons,
        timeSpent: certificate.timeSpent,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
