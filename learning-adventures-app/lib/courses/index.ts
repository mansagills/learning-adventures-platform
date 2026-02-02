/**
 * Course System Data Layer
 *
 * Main export file for all course-related functions and types.
 *
 * Usage:
 * import { getCourses, enrollInCourse, completeLesson } from '@/lib/courses';
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Extended Course Types
  CourseWithProgress,
  LessonWithProgress,
  EnrollmentWithDetails,

  // Filter & Query Types
  CourseFilters,
  CourseQueryOptions,
  CourseSortBy,
  SortDirection,

  // XP & Progression Types
  StreakMultiplier,
  XPCalculation,
  LevelInfo,
  DailyXPBreakdown,

  // Enrollment & Access Types
  EnrollmentEligibility,
  LessonAccessCheck,
  CompletionRequirements,

  // Statistics Types
  UserCourseStats,
  CourseAnalytics,
  LessonAnalytics,

  // Response Types
  PaginatedResponse,
  ApiResponse,

  // Certificate Types
  Certificate,

  // Prisma Types
  Difficulty,
  LessonType,
  CourseStatus,
  LessonProgressStatus,
  Course,
  CourseLesson,
  CourseEnrollment,
  CourseLessonProgress,
  DailyXP,
  UserLevel,
} from './types';

// ============================================================================
// COURSE QUERY EXPORTS
// ============================================================================

export {
  // Core Course Queries
  getCourses,
  getCoursesWithProgress,
  getCourseById,
  getCourseBySlug,
  getCourseWithProgress,

  // Filtered Course Queries
  getCoursesBySubject,
  getCoursesByDifficulty,
  getFreeCourses,
  getPremiumCourses,

  // Search & Sort
  searchCourses,
  getSortedCourses,
  getPaginatedCourses,

  // Lesson Queries
  getLessonById,
  getCourseLessons,
  getNextLesson,
  getPreviousLesson,

  // Helper Functions
  checkPrerequisites,
  getMissingPrerequisites,
} from './courseQueries';

// ============================================================================
// XP CALCULATION EXPORTS
// ============================================================================

export {
  // Constants
  STREAK_MULTIPLIERS,
  BASE_XP_MULTIPLIER,
  LEVEL_EXPONENT,

  // Streak Functions
  getStreakMultiplier,
  calculateXPWithStreak,
  getUserStreak,
  updateUserStreak,

  // Level Functions
  getXPRequiredForLevel,
  getTotalXPForLevel,
  getLevelFromXP,
  getLevelInfo,
  getUserLevelInfo,
  awardXP,

  // Daily XP Functions
  recordDailyXP,
  getDailyXP,
  getXPHistory,
  getRecentXP,

  // Utility Functions
  formatXP,
  getXPColor,
  getLevelBadge,
} from './xpCalculations';

// ============================================================================
// ENROLLMENT HELPER EXPORTS
// ============================================================================

export {
  // Constants
  MAX_FREE_COURSE_ENROLLMENTS,

  // Enrollment Eligibility
  checkEnrollmentEligibility,

  // Enrollment Management
  enrollInCourse,
  unenrollFromCourse,

  // Enrollment Queries
  getUserEnrollment,
  getUserEnrollments,
  getEnrollmentWithDetails,
  getInProgressCourses,
  getCompletedCourses,

  // Completion Tracking
  checkCompletionRequirements,
  completeCourse,
  updateEnrollmentActivity,

  // Statistics
  getCourseEnrollmentCount,
  getCourseCompletionRate,
} from './enrollmentHelpers';

// ============================================================================
// PROGRESS HELPER EXPORTS
// ============================================================================

export {
  // Lesson Access Control
  checkLessonAccess,
  getLessonWithProgress,
  getCourseLessonsWithProgress,

  // Lesson Progress Tracking
  startLesson,
  completeLesson,
  retryLesson,

  // Progress Statistics
  getUserCourseStats,
  getEnrollmentProgress,
} from './progressHelpers';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get complete course data for display
 * Includes course info, lessons, user progress, and access checks
 */
export async function getCoursePageData(courseId: string, userId?: string) {
  const { getCourseById } = await import('./courseQueries');
  const { getCourseWithProgress } = await import('./courseQueries');
  const { getCourseLessonsWithProgress } = await import('./progressHelpers');
  const { getUserEnrollment } = await import('./enrollmentHelpers');
  const { checkEnrollmentEligibility } = await import('./enrollmentHelpers');

  if (!userId) {
    const course = await getCourseById(courseId, { includeLessons: true });
    return {
      course,
      enrollment: null,
      lessons: [],
      canEnroll: null,
    };
  }

  const [course, enrollment, eligibility] = await Promise.all([
    getCourseWithProgress(courseId, userId),
    getUserEnrollment(userId, courseId),
    checkEnrollmentEligibility(userId, courseId),
  ]);

  const lessons = await getCourseLessonsWithProgress(userId, courseId);

  return {
    course,
    enrollment,
    lessons,
    canEnroll: eligibility,
  };
}

/**
 * Get user dashboard data
 * Includes enrollments, progress, stats, and XP info
 */
export async function getUserDashboardData(userId: string) {
  const { getInProgressCourses, getCompletedCourses } =
    await import('./enrollmentHelpers');
  const { getUserCourseStats } = await import('./progressHelpers');
  const { getUserLevelInfo, getUserStreak } = await import('./xpCalculations');
  const { getRecentXP } = await import('./xpCalculations');

  const [inProgress, completed, stats, levelInfo, streak, recentXP] =
    await Promise.all([
      getInProgressCourses(userId),
      getCompletedCourses(userId),
      getUserCourseStats(userId),
      getUserLevelInfo(userId),
      getUserStreak(userId),
      getRecentXP(userId, 7),
    ]);

  return {
    inProgress,
    completed,
    stats,
    levelInfo,
    streak,
    recentXP,
  };
}

/**
 * Get catalog page data
 * Includes all published courses with user progress if authenticated
 */
export async function getCourseCatalogData(userId?: string, subject?: string) {
  const { getCourses, getCoursesWithProgress } =
    await import('./courseQueries');

  const filters = {
    isPublished: true,
    ...(subject && { subject }),
  };

  if (userId) {
    return getCoursesWithProgress(userId, filters);
  }

  return getCourses(filters, { includeLessons: true });
}
