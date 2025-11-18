/**
 * GET /api/certificates/[certificateId]
 *
 * Get certificate data by ID (public - for viewing/verification)
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/responses';
import { getCertificateById } from '@/lib/certificates/certificateGenerator';

interface RouteParams {
  params: {
    certificateId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { certificateId } = params;

    const certificate = await getCertificateById(certificateId);

    if (!certificate) {
      return errorResponse('NOT_FOUND', 'Certificate not found', 404);
    }

    return successResponse({
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        verificationCode: certificate.verificationCode,
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
