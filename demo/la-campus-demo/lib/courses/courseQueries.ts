/**
 * Course Database Query Functions
 *
 * Functions for fetching courses from the database with filters,
 * sorting, and user-specific progress data.
 */

import { prisma } from '@/lib/prisma';
import type {
  Course,
  CourseLesson,
  CourseEnrollment,
  Difficulty,
} from '@prisma/client';
import type {
  CourseFilters,
  CourseQueryOptions,
  CourseSortBy,
  SortDirection,
  CourseWithProgress,
  PaginatedResponse,
} from './types';

// ============================================================================
// COURSE QUERIES
// ============================================================================

/**
 * Get all published courses with optional filtering
 */
export async function getCourses(
  filters: CourseFilters = {},
  options: CourseQueryOptions = {}
): Promise<Course[]> {
  const {
    subject,
    gradeLevel,
    difficulty,
    isPremium,
    isPublished = true,
    searchQuery,
  } = filters;

  const { includeLessons = false } = options;

  // Build where clause
  const where: any = {
    isPublished,
  };

  // Filter by subject
  if (subject) {
    where.subject = Array.isArray(subject) ? { in: subject } : subject;
  }

  // Filter by difficulty
  if (difficulty) {
    where.difficulty = Array.isArray(difficulty)
      ? { in: difficulty }
      : difficulty;
  }

  // Filter by premium status
  if (isPremium !== undefined) {
    where.isPremium = isPremium;
  }

  // Filter by grade level (array contains)
  if (gradeLevel) {
    const gradeLevels = Array.isArray(gradeLevel) ? gradeLevel : [gradeLevel];
    where.gradeLevel = {
      hasSome: gradeLevels,
    };
  }

  // Search in title or description
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      lessons: includeLessons
        ? {
            orderBy: { order: 'asc' },
          }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return courses;
}

/**
 * Get courses with user-specific progress data
 */
export async function getCoursesWithProgress(
  userId: string,
  filters: CourseFilters = {}
): Promise<CourseWithProgress[]> {
  const courses = await getCourses(filters, { includeLessons: true });

  // Fetch user's enrollments
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    include: {
      lessonProgress: true,
    },
  });

  // Create enrollment map for quick lookup
  const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

  // Enrich courses with progress data
  const coursesWithProgress: CourseWithProgress[] = await Promise.all(
    courses.map(async (course) => {
      const enrollment = enrollmentMap.get(course.id);
      const lessons = (course as any).lessons || [];
      const lessonsCompleted = enrollment?.completedLessons || 0;
      const totalLessons = lessons.length;
      const progressPercentage =
        totalLessons > 0
          ? Math.round((lessonsCompleted / totalLessons) * 100)
          : 0;

      // Check prerequisites
      const prerequisitesMet = await checkPrerequisites(
        userId,
        course.prerequisiteCourseIds
      );

      return {
        ...course,
        lessons,
        enrollment: enrollment || null,
        progressPercentage,
        isLocked: !prerequisitesMet,
        prerequisitesMet,
        lessonsCompleted,
        totalLessons,
      };
    })
  );

  return coursesWithProgress;
}

/**
 * Get a single course by ID
 */
export async function getCourseById(
  courseId: string,
  options: CourseQueryOptions = {}
): Promise<Course | null> {
  const { includeLessons = true } = options;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: includeLessons
        ? {
            orderBy: { order: 'asc' },
          }
        : false,
    },
  });

  return course;
}

/**
 * Get a single course by slug
 */
export async function getCourseBySlug(
  slug: string,
  options: CourseQueryOptions = {}
): Promise<Course | null> {
  const { includeLessons = true } = options;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: includeLessons
        ? {
            orderBy: { order: 'asc' },
          }
        : false,
    },
  });

  return course;
}

/**
 * Get course with user progress
 */
export async function getCourseWithProgress(
  courseId: string,
  userId: string
): Promise<CourseWithProgress | null> {
  const course = await getCourseById(courseId, { includeLessons: true });
  if (!course) return null;

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    include: {
      lessonProgress: {
        orderBy: { lesson: { order: 'asc' } },
      },
    },
  });

  const lessons = (course as any).lessons || [];
  const lessonsCompleted = enrollment?.completedLessons || 0;
  const totalLessons = lessons.length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const prerequisitesMet = await checkPrerequisites(
    userId,
    course.prerequisiteCourseIds
  );

  return {
    ...course,
    lessons,
    enrollment: enrollment || null,
    progressPercentage,
    isLocked: !prerequisitesMet,
    prerequisitesMet,
    lessonsCompleted,
    totalLessons,
  };
}

/**
 * Get courses by subject
 */
export async function getCoursesBySubject(
  subject: string,
  options: CourseQueryOptions = {}
): Promise<Course[]> {
  return getCourses({ subject, isPublished: true }, options);
}

/**
 * Get courses by difficulty
 */
export async function getCoursesByDifficulty(
  difficulty: Difficulty,
  options: CourseQueryOptions = {}
): Promise<Course[]> {
  return getCourses({ difficulty, isPublished: true }, options);
}

/**
 * Get free courses
 */
export async function getFreeCourses(
  options: CourseQueryOptions = {}
): Promise<Course[]> {
  return getCourses({ isPremium: false, isPublished: true }, options);
}

/**
 * Get premium courses
 */
export async function getPremiumCourses(
  options: CourseQueryOptions = {}
): Promise<Course[]> {
  return getCourses({ isPremium: true, isPublished: true }, options);
}

/**
 * Search courses by keyword
 */
export async function searchCourses(
  searchQuery: string,
  filters: Omit<CourseFilters, 'searchQuery'> = {},
  options: CourseQueryOptions = {}
): Promise<Course[]> {
  return getCourses({ ...filters, searchQuery, isPublished: true }, options);
}

/**
 * Get courses sorted by criteria
 */
export async function getSortedCourses(
  sortBy: CourseSortBy = 'recent',
  direction: SortDirection = 'desc',
  filters: CourseFilters = {}
): Promise<Course[]> {
  const where: any = {
    isPublished: filters.isPublished ?? true,
  };

  // Apply filters (similar to getCourses)
  if (filters.subject) {
    where.subject = Array.isArray(filters.subject)
      ? { in: filters.subject }
      : filters.subject;
  }
  if (filters.difficulty) {
    where.difficulty = Array.isArray(filters.difficulty)
      ? { in: filters.difficulty }
      : filters.difficulty;
  }
  if (filters.isPremium !== undefined) {
    where.isPremium = filters.isPremium;
  }
  if (filters.gradeLevel) {
    const gradeLevels = Array.isArray(filters.gradeLevel)
      ? filters.gradeLevel
      : [filters.gradeLevel];
    where.gradeLevel = { hasSome: gradeLevels };
  }

  // Determine orderBy clause
  let orderBy: any = { createdAt: 'desc' }; // default: recent

  switch (sortBy) {
    case 'title':
      orderBy = { title: direction };
      break;
    case 'difficulty':
      orderBy = { difficulty: direction };
      break;
    case 'estimatedMinutes':
      orderBy = { estimatedMinutes: direction };
      break;
    case 'totalXP':
      orderBy = { totalXP: direction };
      break;
    case 'recent':
      orderBy = { createdAt: direction };
      break;
    case 'popularity':
      // For popularity, we'd need to count enrollments
      // For now, fall back to recent
      orderBy = { createdAt: 'desc' };
      break;
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy,
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return courses;
}

/**
 * Get paginated courses
 */
export async function getPaginatedCourses(
  page: number = 1,
  pageSize: number = 10,
  filters: CourseFilters = {},
  sortBy: CourseSortBy = 'recent',
  direction: SortDirection = 'desc'
): Promise<PaginatedResponse<Course>> {
  const skip = (page - 1) * pageSize;

  const where: any = {
    isPublished: filters.isPublished ?? true,
  };

  // Apply filters
  if (filters.subject) {
    where.subject = Array.isArray(filters.subject)
      ? { in: filters.subject }
      : filters.subject;
  }
  if (filters.difficulty) {
    where.difficulty = Array.isArray(filters.difficulty)
      ? { in: filters.difficulty }
      : filters.difficulty;
  }
  if (filters.isPremium !== undefined) {
    where.isPremium = filters.isPremium;
  }

  // Get total count
  const totalItems = await prisma.course.count({ where });

  // Determine orderBy
  let orderBy: any = { createdAt: 'desc' };
  switch (sortBy) {
    case 'title':
      orderBy = { title: direction };
      break;
    case 'difficulty':
      orderBy = { difficulty: direction };
      break;
    case 'estimatedMinutes':
      orderBy = { estimatedMinutes: direction };
      break;
    case 'totalXP':
      orderBy = { totalXP: direction };
      break;
  }

  // Get paginated data
  const data = await prisma.course.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

// ============================================================================
// LESSON QUERIES
// ============================================================================

/**
 * Get lesson by ID
 */
export async function getLessonById(
  lessonId: string
): Promise<CourseLesson | null> {
  return prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: {
      course: true,
    },
  });
}

/**
 * Get lessons for a course
 */
export async function getCourseLessons(
  courseId: string
): Promise<CourseLesson[]> {
  return prisma.courseLesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });
}

/**
 * Get next lesson in sequence
 */
export async function getNextLesson(
  courseId: string,
  currentOrder: number
): Promise<CourseLesson | null> {
  return prisma.courseLesson.findFirst({
    where: {
      courseId,
      order: { gt: currentOrder },
    },
    orderBy: { order: 'asc' },
  });
}

/**
 * Get previous lesson in sequence
 */
export async function getPreviousLesson(
  courseId: string,
  currentOrder: number
): Promise<CourseLesson | null> {
  return prisma.courseLesson.findFirst({
    where: {
      courseId,
      order: { lt: currentOrder },
    },
    orderBy: { order: 'desc' },
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user has completed prerequisite courses
 */
export async function checkPrerequisites(
  userId: string,
  prerequisiteCourseIds: string[]
): Promise<boolean> {
  if (prerequisiteCourseIds.length === 0) return true;

  const completedPrerequisites = await prisma.courseEnrollment.count({
    where: {
      userId,
      courseId: { in: prerequisiteCourseIds },
      status: 'COMPLETED',
    },
  });

  return completedPrerequisites === prerequisiteCourseIds.length;
}

/**
 * Get prerequisite courses that user hasn't completed
 */
export async function getMissingPrerequisites(
  userId: string,
  prerequisiteCourseIds: string[]
): Promise<Course[]> {
  if (prerequisiteCourseIds.length === 0) return [];

  const completed = await prisma.courseEnrollment.findMany({
    where: {
      userId,
      courseId: { in: prerequisiteCourseIds },
      status: 'COMPLETED',
    },
    select: { courseId: true },
  });

  const completedIds = completed.map((e) => e.courseId);
  const missingIds = prerequisiteCourseIds.filter(
    (id) => !completedIds.includes(id)
  );

  if (missingIds.length === 0) return [];

  return prisma.course.findMany({
    where: { id: { in: missingIds } },
  });
}
