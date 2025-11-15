/**
 * Lesson Progress Helper Functions
 *
 * Functions for tracking lesson progress, checking lesson access,
 * and enforcing linear progression.
 */

import { PrismaClient, LessonProgressStatus } from '@/lib/generated/prisma';
import type { CourseLessonProgress, CourseLesson } from '@/lib/generated/prisma';
import type {
  LessonWithProgress,
  LessonAccessCheck,
  UserCourseStats,
} from './types';
import { getCourseLessons, getLessonById, getNextLesson } from './courseQueries';
import {
  awardXP,
  recordDailyXP,
  updateUserStreak,
  calculateXPWithStreak,
  getUserStreak,
} from './xpCalculations';
import { updateEnrollmentActivity } from './enrollmentHelpers';

const prisma = new PrismaClient();

// ============================================================================
// LESSON ACCESS CONTROL (Linear Progression)
// ============================================================================

/**
 * Check if user can access a specific lesson
 */
export async function checkLessonAccess(
  userId: string,
  lessonId: string
): Promise<LessonAccessCheck> {
  // Get lesson details
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson) {
    return {
      canAccess: false,
      reason: 'Lesson not found',
      isLocked: true,
      previousLessonCompleted: false,
      previousLessonPassed: false,
    };
  }

  // Get user's enrollment
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
    include: {
      lessonProgress: true,
    },
  });

  if (!enrollment) {
    return {
      canAccess: false,
      reason: 'Not enrolled in this course',
      isLocked: true,
      previousLessonCompleted: false,
      previousLessonPassed: false,
    };
  }

  // Get this lesson's progress
  const thisLessonProgress = enrollment.lessonProgress.find(
    (p) => p.lessonId === lessonId
  );

  // First lesson is always accessible
  if (lesson.order === 1) {
    return {
      canAccess: true,
      isLocked: false,
      previousLessonCompleted: true,
      previousLessonPassed: true,
    };
  }

  // Get previous lesson
  const previousLesson = await prisma.courseLesson.findFirst({
    where: {
      courseId: lesson.courseId,
      order: lesson.order - 1,
    },
  });

  if (!previousLesson) {
    return {
      canAccess: false,
      reason: 'Previous lesson not found',
      isLocked: true,
      previousLessonCompleted: false,
      previousLessonPassed: false,
    };
  }

  // Get previous lesson's progress
  const previousProgress = enrollment.lessonProgress.find(
    (p) => p.lessonId === previousLesson.id
  );

  // Check if previous lesson is completed
  if (!previousProgress || previousProgress.status !== LessonProgressStatus.COMPLETED) {
    return {
      canAccess: false,
      reason: 'Previous lesson not completed',
      isLocked: true,
      previousLessonCompleted: false,
      previousLessonPassed: false,
    };
  }

  // Check if previous lesson met required score
  if (previousLesson.requiredScore !== null) {
    const passed =
      previousProgress.score !== null &&
      previousProgress.score >= previousLesson.requiredScore;

    if (!passed) {
      return {
        canAccess: false,
        reason: `Previous lesson requires ${previousLesson.requiredScore}% to unlock`,
        isLocked: true,
        previousLessonCompleted: true,
        previousLessonPassed: false,
        requiredScore: previousLesson.requiredScore,
        userScore: previousProgress.score || 0,
      };
    }
  }

  // All checks passed - user can access this lesson
  return {
    canAccess: true,
    isLocked: false,
    previousLessonCompleted: true,
    previousLessonPassed: true,
  };
}

/**
 * Get lesson with progress and access information
 */
export async function getLessonWithProgress(
  userId: string,
  lessonId: string
): Promise<LessonWithProgress | null> {
  const lesson = await getLessonById(lessonId);
  if (!lesson) return null;

  // Get progress
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
    include: {
      lessonProgress: true,
    },
  });

  const progress = enrollment?.lessonProgress.find((p) => p.lessonId === lessonId);
  const accessCheck = await checkLessonAccess(userId, lessonId);

  // Check if passed (met required score)
  const isPassed =
    progress?.status === LessonProgressStatus.COMPLETED &&
    (lesson.requiredScore === null ||
      (progress.score !== null && progress.score >= lesson.requiredScore));

  return {
    ...lesson,
    progress: progress || null,
    isLocked: accessCheck.isLocked,
    isPassed,
    canAccess: accessCheck.canAccess,
  };
}

/**
 * Get all lessons with progress for a course
 */
export async function getCourseLessonsWithProgress(
  userId: string,
  courseId: string
): Promise<LessonWithProgress[]> {
  const lessons = await getCourseLessons(courseId);

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    include: {
      lessonProgress: true,
    },
  });

  const lessonsWithProgress: LessonWithProgress[] = [];

  for (const lesson of lessons) {
    const progress = enrollment?.lessonProgress.find((p) => p.lessonId === lesson.id);
    const accessCheck = await checkLessonAccess(userId, lesson.id);

    const isPassed =
      progress?.status === LessonProgressStatus.COMPLETED &&
      (lesson.requiredScore === null ||
        (progress.score !== null && progress.score >= lesson.requiredScore));

    lessonsWithProgress.push({
      ...lesson,
      progress: progress || null,
      isLocked: accessCheck.isLocked,
      isPassed,
      canAccess: accessCheck.canAccess,
    });
  }

  return lessonsWithProgress;
}

// ============================================================================
// LESSON PROGRESS TRACKING
// ============================================================================

/**
 * Start a lesson (mark as in progress)
 */
export async function startLesson(
  userId: string,
  lessonId: string
): Promise<{
  success: boolean;
  progress?: CourseLessonProgress;
  error?: string;
}> {
  // Check access
  const accessCheck = await checkLessonAccess(userId, lessonId);

  if (!accessCheck.canAccess) {
    return {
      success: false,
      error: accessCheck.reason || 'Cannot access this lesson',
    };
  }

  // Get lesson and enrollment
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return {
      success: false,
      error: 'Lesson not found',
    };
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    return {
      success: false,
      error: 'Not enrolled in this course',
    };
  }

  // Update progress to IN_PROGRESS
  const progress = await prisma.courseLessonProgress.update({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    data: {
      status: LessonProgressStatus.IN_PROGRESS,
      startedAt: new Date(),
    },
  });

  // Update enrollment activity
  await updateEnrollmentActivity(enrollment.id);

  return {
    success: true,
    progress,
  };
}

/**
 * Complete a lesson with score
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  score?: number,
  timeSpent: number = 0
): Promise<{
  success: boolean;
  passed: boolean;
  xpAwarded: number;
  nextLessonUnlocked: boolean;
  nextLesson?: CourseLesson | null;
  leveledUp: boolean;
  newLevel?: number;
  error?: string;
}> {
  // Get lesson
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return {
      success: false,
      passed: false,
      xpAwarded: 0,
      nextLessonUnlocked: false,
      leveledUp: false,
      error: 'Lesson not found',
    };
  }

  // Get enrollment
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
    include: {
      lessonProgress: true,
    },
  });

  if (!enrollment) {
    return {
      success: false,
      passed: false,
      xpAwarded: 0,
      nextLessonUnlocked: false,
      leveledUp: false,
      error: 'Not enrolled in this course',
    };
  }

  // Check if lesson has required score
  const passed =
    lesson.requiredScore === null ||
    (score !== null && score !== undefined && score >= lesson.requiredScore);

  if (!passed) {
    // Update progress with failed attempt
    const progress = await prisma.courseLessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
    });

    await prisma.courseLessonProgress.update({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      data: {
        score,
        timeSpent: (progress?.timeSpent || 0) + timeSpent,
        attempts: (progress?.attempts || 0) + 1,
      },
    });

    return {
      success: true,
      passed: false,
      xpAwarded: 0,
      nextLessonUnlocked: false,
      leveledUp: false,
      error: `Requires ${lesson.requiredScore}% to pass. You scored ${score}%. Try again!`,
    };
  }

  // Calculate XP with streak bonus
  const streak = await getUserStreak(userId);
  const xpCalc = calculateXPWithStreak(lesson.xpReward, streak, 'lesson');

  // Update lesson progress to COMPLETED
  const progress = await prisma.courseLessonProgress.findUnique({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
  });

  await prisma.courseLessonProgress.update({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    data: {
      status: LessonProgressStatus.COMPLETED,
      completedAt: new Date(),
      score,
      timeSpent: (progress?.timeSpent || 0) + timeSpent,
      attempts: (progress?.attempts || 0) + 1,
      xpEarned: xpCalc.totalXP,
    },
  });

  // Unlock next lesson
  const nextLesson = await getNextLesson(lesson.courseId, lesson.order);
  if (nextLesson) {
    await prisma.courseLessonProgress.update({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: nextLesson.id,
        },
      },
      data: {
        status: LessonProgressStatus.NOT_STARTED,
      },
    });
  }

  // Update enrollment
  const completedCount = enrollment.lessonProgress.filter(
    (p) => p.status === LessonProgressStatus.COMPLETED
  ).length + 1;

  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: {
      completedLessons: completedCount,
      totalXPEarned: enrollment.totalXPEarned + xpCalc.totalXP,
      currentLessonOrder: nextLesson?.order || lesson.order,
      lastActivityAt: new Date(),
    },
  });

  // Award XP and update level
  const xpResult = await awardXP(userId, xpCalc.totalXP, 'lesson');

  // Record daily XP
  await recordDailyXP(userId, lesson.xpReward, 'lesson');

  // Update streak
  await updateUserStreak(userId);

  return {
    success: true,
    passed: true,
    xpAwarded: xpCalc.totalXP,
    nextLessonUnlocked: nextLesson !== null,
    nextLesson,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
  };
}

/**
 * Retry a failed lesson
 */
export async function retryLesson(
  userId: string,
  lessonId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return {
      success: false,
      error: 'Lesson not found',
    };
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    return {
      success: false,
      error: 'Not enrolled in this course',
    };
  }

  // Reset lesson to IN_PROGRESS
  await prisma.courseLessonProgress.update({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    data: {
      status: LessonProgressStatus.IN_PROGRESS,
      startedAt: new Date(),
    },
  });

  return {
    success: true,
  };
}

// ============================================================================
// PROGRESS STATISTICS
// ============================================================================

/**
 * Get user's overall course statistics
 */
export async function getUserCourseStats(userId: string): Promise<UserCourseStats> {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    include: {
      lessonProgress: true,
    },
  });

  const totalCoursesEnrolled = enrollments.length;
  const coursesInProgress = enrollments.filter(
    (e) => e.status === 'IN_PROGRESS'
  ).length;
  const coursesCompleted = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const totalXPEarned = enrollments.reduce((sum, e) => sum + e.totalXPEarned, 0);
  const certificatesEarned = enrollments.filter((e) => e.certificateEarned).length;

  // Calculate average score
  const allProgress = enrollments.flatMap((e) => e.lessonProgress);
  const completedWithScores = allProgress.filter(
    (p) => p.status === 'COMPLETED' && p.score !== null
  );
  const averageScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce((sum, p) => sum + (p.score || 0), 0) /
        completedWithScores.length
      : 0;

  // Calculate total time spent
  const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const totalTimeMinutes = Math.round(totalTimeSpent / 60);

  // Get streak info
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  return {
    totalCoursesEnrolled,
    coursesInProgress,
    coursesCompleted,
    totalXPEarned,
    currentStreak: userLevel?.currentStreak || 0,
    longestStreak: userLevel?.longestStreak || 0,
    averageScore: Math.round(averageScore),
    totalTimeSpent: totalTimeMinutes,
    certificatesEarned,
  };
}

/**
 * Get progress percentage for a specific enrollment
 */
export async function getEnrollmentProgress(enrollmentId: string): Promise<number> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!enrollment) return 0;

  const totalLessons = enrollment.course.lessons.length;
  if (totalLessons === 0) return 0;

  return Math.round((enrollment.completedLessons / totalLessons) * 100);
}

/**
 * Cleanup function
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
