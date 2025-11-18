/**
 * Course Enrollment Helper Functions
 *
 * Functions for managing course enrollments, checking eligibility,
 * and handling enrollment lifecycle.
 */

import { prisma } from '@/lib/prisma';
import { CourseStatus, LessonProgressStatus } from '@prisma/client';
import type { CourseEnrollment, User } from '@prisma/client';
import type {
  EnrollmentEligibility,
  EnrollmentWithDetails,
  CompletionRequirements,
} from './types';
import { checkPrerequisites, getMissingPrerequisites, getCourseById } from './courseQueries';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum free courses a non-premium user can enroll in
 */
export const MAX_FREE_COURSE_ENROLLMENTS = 2;

// ============================================================================
// ENROLLMENT ELIGIBILITY
// ============================================================================

/**
 * Check if user can enroll in a course
 */
export async function checkEnrollmentEligibility(
  userId: string,
  courseId: string
): Promise<EnrollmentEligibility> {
  // Get course details
  const course = await getCourseById(courseId);
  if (!course) {
    return {
      canEnroll: false,
      reason: 'Course not found',
      prerequisitesMet: false,
      requiresPremium: false,
      hasPremiumAccess: false,
    };
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      canEnroll: false,
      reason: 'User not found',
      prerequisitesMet: false,
      requiresPremium: course.isPremium,
      hasPremiumAccess: false,
    };
  }

  // TODO: Implement premium access check based on subscription system
  const hasPremiumAccess = false;

  // Check if already enrolled
  const existingEnrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    return {
      canEnroll: false,
      reason: 'Already enrolled in this course',
      prerequisitesMet: true,
      requiresPremium: course.isPremium,
      hasPremiumAccess,
    };
  }

  // Check prerequisites
  const prerequisitesMet = await checkPrerequisites(userId, course.prerequisiteCourseIds);

  if (!prerequisitesMet) {
    const missingPrerequisites = await getMissingPrerequisites(
      userId,
      course.prerequisiteCourseIds
    );

    return {
      canEnroll: false,
      reason: 'Prerequisites not met',
      prerequisitesMet: false,
      missingPrerequisites,
      requiresPremium: course.isPremium,
      hasPremiumAccess,
    };
  }

  // Check premium access for premium courses
  if (course.isPremium && !hasPremiumAccess) {
    return {
      canEnroll: false,
      reason: 'Premium subscription required',
      prerequisitesMet: true,
      requiresPremium: true,
      hasPremiumAccess: false,
    };
  }

  // Check free course limit for non-premium users
  if (!course.isPremium && !hasPremiumAccess) {
    const freeEnrollmentCount = await prisma.courseEnrollment.count({
      where: {
        userId,
        course: {
          isPremium: false,
        },
      },
    });

    if (freeEnrollmentCount >= MAX_FREE_COURSE_ENROLLMENTS) {
      return {
        canEnroll: false,
        reason: `Free users can only enroll in ${MAX_FREE_COURSE_ENROLLMENTS} free courses. Upgrade to premium for unlimited access.`,
        prerequisitesMet: true,
        requiresPremium: false,
        hasPremiumAccess: false,
        freeCourseLimit: MAX_FREE_COURSE_ENROLLMENTS,
        freeCoursesEnrolled: freeEnrollmentCount,
      };
    }
  }

  // All checks passed!
  return {
    canEnroll: true,
    prerequisitesMet: true,
    requiresPremium: course.isPremium,
    hasPremiumAccess,
  };
}

// ============================================================================
// ENROLLMENT MANAGEMENT
// ============================================================================

/**
 * Enroll user in a course
 */
export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<{
  success: boolean;
  enrollment?: CourseEnrollment;
  error?: string;
}> {
  // Check eligibility
  const eligibility = await checkEnrollmentEligibility(userId, courseId);

  if (!eligibility.canEnroll) {
    return {
      success: false,
      error: eligibility.reason,
    };
  }

  try {
    // Get course to access lessons
    const course = await getCourseById(courseId, { includeLessons: true });
    if (!course) {
      return {
        success: false,
        error: 'Course not found',
      };
    }

    const lessons = (course as any).lessons || [];

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
        status: CourseStatus.IN_PROGRESS,
        totalLessons: lessons.length,
      },
    });

    // Create lesson progress records for all lessons
    const lessonProgressData = lessons.map((lesson: any, index: number) => ({
      userId,
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      status: index === 0 ? LessonProgressStatus.NOT_STARTED : LessonProgressStatus.LOCKED,
    }));

    await prisma.courseLessonProgress.createMany({
      data: lessonProgressData,
    });

    return {
      success: true,
      enrollment,
    };
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create enrollment',
    };
  }
}

/**
 * Unenroll user from a course
 */
export async function unenrollFromCourse(
  userId: string,
  courseId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Find enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'Not enrolled in this course',
      };
    }

    // Delete lesson progress first (due to foreign key constraint)
    await prisma.courseLessonProgress.deleteMany({
      where: {
        enrollmentId: enrollment.id,
      },
    });

    // Delete enrollment
    await prisma.courseEnrollment.delete({
      where: {
        id: enrollment.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to unenroll from course',
    };
  }
}

// ============================================================================
// ENROLLMENT QUERIES
// ============================================================================

/**
 * Get user's enrollment for a specific course
 */
export async function getUserEnrollment(
  userId: string,
  courseId: string
): Promise<CourseEnrollment | null> {
  return prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
      lessonProgress: {
        orderBy: {
          lesson: {
            order: 'asc',
          },
        },
      },
    },
  });
}

/**
 * Get all enrollments for a user
 */
export async function getUserEnrollments(
  userId: string,
  status?: CourseStatus
): Promise<CourseEnrollment[]> {
  const where: any = { userId };

  if (status) {
    where.status = status;
  }

  return prisma.courseEnrollment.findMany({
    where,
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
      lessonProgress: true,
    },
    orderBy: {
      lastAccessedAt: 'desc',
    },
  });
}

/**
 * Get enrollment with detailed progress
 */
export async function getEnrollmentWithDetails(
  enrollmentId: string
): Promise<EnrollmentWithDetails | null> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
      lessonProgress: {
        include: {
          lesson: true,
        },
        orderBy: {
          lesson: {
            order: 'asc',
          },
        },
      },
    },
  });

  if (!enrollment) return null;

  const lessons = enrollment.course.lessons;
  const completedCount = enrollment.completedLessons;
  const totalLessons = lessons.length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Find next incomplete lesson
  const nextLesson = lessons.find((lesson) => {
    const progress = enrollment.lessonProgress.find(
      (p: any) => p.lessonId === lesson.id
    );
    return progress?.status !== LessonProgressStatus.COMPLETED;
  });

  // Calculate estimated time remaining
  const remainingLessons = lessons.filter((lesson) => {
    const progress = enrollment.lessonProgress.find(
      (p: any) => p.lessonId === lesson.id
    );
    return progress?.status !== LessonProgressStatus.COMPLETED;
  });

  const estimatedTimeRemaining = remainingLessons.reduce(
    (total, lesson) => total + lesson.duration,
    0
  );

  return {
    ...enrollment,
    progressPercentage,
    nextLesson: nextLesson || null,
    estimatedTimeRemaining,
  };
}

/**
 * Get in-progress courses for a user
 */
export async function getInProgressCourses(userId: string): Promise<CourseEnrollment[]> {
  return getUserEnrollments(userId, CourseStatus.IN_PROGRESS);
}

/**
 * Get completed courses for a user
 */
export async function getCompletedCourses(userId: string): Promise<CourseEnrollment[]> {
  return getUserEnrollments(userId, CourseStatus.COMPLETED);
}

// ============================================================================
// COMPLETION TRACKING
// ============================================================================

/**
 * Check if course completion requirements are met
 */
export async function checkCompletionRequirements(
  enrollmentId: string
): Promise<CompletionRequirements> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          lessons: true,
        },
      },
      lessonProgress: {
        include: {
          lesson: true,
        },
      },
    },
  });

  if (!enrollment) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      requiredLessons: 0,
      passedRequiredLessons: 0,
      isComplete: false,
      canEarnCertificate: false,
    };
  }

  const lessons = enrollment.course.lessons;
  const totalLessons = lessons.length;
  const completedLessons = enrollment.lessonProgress.filter(
    (p: any) => p.status === LessonProgressStatus.COMPLETED
  ).length;

  // Count lessons with required scores
  const requiredLessons = lessons.filter((l) => l.requiredScore !== null);
  const passedRequiredLessons = requiredLessons.filter((lesson) => {
    const progress = enrollment.lessonProgress.find(
      (p: any) => p.lessonId === lesson.id
    );
    return (
      progress?.status === LessonProgressStatus.COMPLETED &&
      progress.score !== null &&
      progress.score >= (lesson.requiredScore || 0)
    );
  });

  const isComplete = completedLessons === totalLessons;
  const canEarnCertificate =
    isComplete && passedRequiredLessons.length === requiredLessons.length;

  return {
    totalLessons,
    completedLessons,
    requiredLessons: requiredLessons.length,
    passedRequiredLessons: passedRequiredLessons.length,
    isComplete,
    canEarnCertificate,
  };
}

/**
 * Mark course as completed and award certificate
 */
export async function completeCourse(
  enrollmentId: string
): Promise<{
  success: boolean;
  certificateEarned: boolean;
  error?: string;
}> {
  const requirements = await checkCompletionRequirements(enrollmentId);

  if (!requirements.isComplete) {
    return {
      success: false,
      certificateEarned: false,
      error: 'Course not fully completed',
    };
  }

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: CourseStatus.COMPLETED,
      completedAt: new Date(),
      certificateEarned: requirements.canEarnCertificate,
    },
  });

  return {
    success: true,
    certificateEarned: requirements.canEarnCertificate,
  };
}

/**
 * Update last activity timestamp
 */
export async function updateEnrollmentActivity(enrollmentId: string): Promise<void> {
  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      lastAccessedAt: new Date(),
    },
  });
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get enrollment count for a course
 */
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  return prisma.courseEnrollment.count({
    where: { courseId },
  });
}

/**
 * Get course completion rate
 */
export async function getCourseCompletionRate(courseId: string): Promise<number> {
  const totalEnrollments = await prisma.courseEnrollment.count({
    where: { courseId },
  });

  if (totalEnrollments === 0) return 0;

  const completedEnrollments = await prisma.courseEnrollment.count({
    where: {
      courseId,
      status: CourseStatus.COMPLETED,
    },
  });

  return Math.round((completedEnrollments / totalEnrollments) * 100);
}

/**
 * Cleanup function
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
