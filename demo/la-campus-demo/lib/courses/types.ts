/**
 * Course System Type Definitions
 *
 * These types extend Prisma's generated types with additional computed fields
 * and helper types for the course system.
 */

import type {
  Course,
  CourseLesson,
  CourseEnrollment,
  CourseLessonProgress,
  DailyXP,
  UserLevel,
  Difficulty,
  LessonType,
  CourseStatus,
  LessonProgressStatus,
} from '@prisma/client';

// ============================================================================
// EXTENDED COURSE TYPES (with computed fields)
// ============================================================================

/**
 * Course with additional computed information
 */
export interface CourseWithProgress extends Course {
  lessons: CourseLesson[];
  enrollment?: CourseEnrollment | null;
  progressPercentage: number; // 0-100
  isLocked: boolean; // Prerequisites not met
  prerequisitesMet: boolean;
  lessonsCompleted: number;
  totalLessons: number;
}

/**
 * Lesson with progress information
 */
export interface LessonWithProgress extends CourseLesson {
  progress?: CourseLessonProgress | null;
  isLocked: boolean; // Previous lesson not completed
  isPassed: boolean; // Meets required score
  canAccess: boolean; // User can start/continue this lesson
}

/**
 * Course enrollment with detailed progress
 */
export interface EnrollmentWithDetails extends CourseEnrollment {
  course: Course & { lessons: CourseLesson[] };
  lessonProgress: CourseLessonProgress[];
  nextLesson?: CourseLesson | null;
  progressPercentage: number;
  estimatedTimeRemaining: number; // minutes
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

/**
 * Filters for querying courses
 */
export interface CourseFilters {
  subject?: string | string[];
  gradeLevel?: string | string[];
  difficulty?: Difficulty | Difficulty[];
  isPremium?: boolean;
  isPublished?: boolean;
  searchQuery?: string; // Search in title/description
}

/**
 * Options for course queries
 */
export interface CourseQueryOptions {
  userId?: string; // Include user-specific data
  includeProgress?: boolean;
  includeEnrollment?: boolean;
  includeLessons?: boolean;
}

/**
 * Sort options for courses
 */
export type CourseSortBy =
  | 'title'
  | 'difficulty'
  | 'estimatedMinutes'
  | 'totalXP'
  | 'popularity'
  | 'recent';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

// ============================================================================
// XP & PROGRESSION TYPES
// ============================================================================

/**
 * Streak multiplier information
 */
export interface StreakMultiplier {
  days: number;
  multiplier: number; // 1.0, 1.2, 1.5, 2.0
  bonusPercentage: number; // 0, 20, 50, 100
}

/**
 * XP calculation result
 */
export interface XPCalculation {
  baseXP: number;
  streakMultiplier: number;
  streakBonusXP: number;
  totalXP: number;
  source: 'lesson' | 'game' | 'quiz' | 'project';
}

/**
 * Level progression information
 */
export interface LevelInfo {
  currentLevel: number;
  totalXP: number;
  xpForCurrentLevel: number; // XP earned in this level
  xpRequiredForNextLevel: number; // XP needed to reach next level
  progressToNextLevel: number; // 0-100 percentage
}

/**
 * Daily XP breakdown
 */
export interface DailyXPBreakdown extends DailyXP {
  percentFromLessons: number;
  percentFromGames: number;
  percentFromStreak: number;
}

// ============================================================================
// ENROLLMENT & ACCESS TYPES
// ============================================================================

/**
 * Enrollment eligibility check result
 */
export interface EnrollmentEligibility {
  canEnroll: boolean;
  reason?: string;
  prerequisitesMet: boolean;
  missingPrerequisites?: Course[];
  requiresPremium: boolean;
  hasPremiumAccess: boolean;
  freeCourseLimit?: number; // For free users
  freeCoursesEnrolled?: number;
}

/**
 * Lesson access check result
 */
export interface LessonAccessCheck {
  canAccess: boolean;
  reason?: string;
  isLocked: boolean;
  previousLessonCompleted: boolean;
  previousLessonPassed: boolean;
  requiredScore?: number;
  userScore?: number;
  requiresPremium?: boolean; // Indicates if premium subscription is needed
}

/**
 * Course completion requirements
 */
export interface CompletionRequirements {
  totalLessons: number;
  completedLessons: number;
  requiredLessons: number; // Lessons with required scores
  passedRequiredLessons: number;
  isComplete: boolean;
  canEarnCertificate: boolean;
}

// ============================================================================
// STATISTICS & ANALYTICS TYPES
// ============================================================================

/**
 * User course statistics
 */
export interface UserCourseStats {
  totalCoursesEnrolled: number;
  coursesInProgress: number;
  coursesCompleted: number;
  totalXPEarned: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  totalTimeSpent: number; // minutes
  certificatesEarned: number;
}

/**
 * Course analytics
 */
export interface CourseAnalytics {
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number; // percentage
  averageCompletionTime: number; // minutes
  averageScore: number;
  popularityScore: number;
}

/**
 * Lesson analytics
 */
export interface LessonAnalytics {
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  averageTimeSpent: number; // minutes
  retryRate: number; // percentage who retry
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

/**
 * Certificate information
 */
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  completedAt: Date;
  finalScore: number;
  totalXPEarned: number;
  certificateUrl?: string;
}

// ============================================================================
// RE-EXPORT PRISMA ENUMS
// ============================================================================

export type {
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
};

// ============================================================================
// HELPER TYPE UTILITIES
// ============================================================================

/**
 * Make specified fields optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified fields required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
