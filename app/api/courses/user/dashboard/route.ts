/**
 * GET /api/courses/user/dashboard
 *
 * Get user's recent courses and progress for dashboard
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/responses';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get user's recent course enrollments (last accessed)
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        userId: user.id,
        status: {
          in: ['IN_PROGRESS', 'COMPLETED'],
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            subject: true,
            difficulty: true,
            totalXP: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
      take: 5, // Show top 5 recent courses
    });

    // Get in-progress courses
    const inProgressCourses = enrollments.filter(
      (e: any) => e.status === 'IN_PROGRESS'
    );

    // Get completed courses count
    const completedCount = await prisma.courseEnrollment.count({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
    });

    // Calculate total XP earned from courses
    const totalCourseXP = enrollments.reduce(
      (sum: number, enrollment: any) => sum + enrollment.totalXPEarned,
      0
    );

    return successResponse({
      recentCourses: enrollments,
      inProgressCount: inProgressCourses.length,
      completedCount,
      totalCourseXP,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
