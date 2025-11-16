/**
 * GET /api/certificates/user
 *
 * Get all certificates for the authenticated user
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '../../lib/auth';
import { successResponse, handleApiError } from '../../lib/responses';
import { getUserCertificates } from '@/lib/certificates/certificateGenerator';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const certificates = await getUserCertificates(user.id);

    return successResponse({
      certificates: certificates.map((cert) => ({
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        completionDate: cert.completionDate,
        totalXPEarned: cert.totalXPEarned,
        averageScore: cert.averageScore,
        totalLessons: cert.totalLessons,
        timeSpent: cert.timeSpent,
        issuedAt: cert.issuedAt,
      })),
      count: certificates.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
