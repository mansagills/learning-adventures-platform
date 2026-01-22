import AdmZip from 'adm-zip';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import { Difficulty, LessonType } from '@prisma/client';

export interface CourseManifest {
  title: string;
  slug: string;
  subject: string;
  gradeLevel: string[];
  difficulty: string;
  isPremium: boolean;
  description: string;
  estimatedMinutes: number;
  totalXP: number;
  thumbnail?: string;
  lessons: Array<{
    order: number;
    title: string;
    description?: string;
    type: string;
    file: string;
    duration: number;
    xpReward: number;
    requiredScore?: number;
  }>;
}

interface ProcessCourseResult {
  success: boolean;
  testCourseId?: string;
  slug?: string;
  stagingPath?: string;
  lessonsStaged?: number;
  error?: string;
}

/**
 * Process a course package (.zip file) and create TestCourse entry in staging
 * Courses are stored in staging until approved and promoted to production
 * @param zipFile - The uploaded .zip File object
 * @param uploaderId - User ID of the admin uploading
 * @returns Object with testCourseId, slug, and staging info
 */
export async function processCoursePackage(
  zipFile: File,
  uploaderId: string
): Promise<ProcessCourseResult> {
  // Extract .zip
  const buffer = Buffer.from(await zipFile.arrayBuffer());
  const zip = new AdmZip(buffer);

  // Find metadata.json
  const manifestEntry = zip.getEntry('metadata.json');
  if (!manifestEntry) {
    throw new Error('metadata.json not found in .zip package');
  }

  const manifest: CourseManifest = JSON.parse(
    manifestEntry.getData().toString('utf8')
  );

  // Validate manifest
  if (!manifest.title || !manifest.lessons || manifest.lessons.length === 0) {
    throw new Error('Invalid manifest: missing title or lessons');
  }

  // Generate slug if not provided
  const slug = manifest.slug || generateSlug(manifest.title);

  // Check if course already exists in TestCourse
  const existing = await prisma.testCourse.findUnique({
    where: { slug }
  });

  if (existing) {
    throw new Error(`Course with slug "${slug}" already exists in staging`);
  }

  // Create staging directory for this course
  const stagingDir = path.join(process.cwd(), 'public', 'staging', 'lessons', 'courses', slug);
  await fs.mkdir(stagingDir, { recursive: true });

  // Process and stage each lesson file
  const stagedLessons: CourseManifest['lessons'] = [];
  
  for (const lessonMeta of manifest.lessons) {
    const lessonEntry = zip.getEntry(lessonMeta.file);
    if (!lessonEntry) {
      console.warn(`Lesson file not found: ${lessonMeta.file}`);
      continue;
    }

    const lessonData = lessonEntry.getData();
    const lessonFileName = path.basename(lessonMeta.file);
    const stagingFilePath = path.join(stagingDir, lessonFileName);

    // Write lesson file to staging
    await fs.writeFile(stagingFilePath, lessonData);

    // Update lesson metadata with staging path
    stagedLessons.push({
      ...lessonMeta,
      file: `/staging/lessons/courses/${slug}/${lessonFileName}`,
    });
  }

  // Handle thumbnail if present
  let thumbnailPath: string | undefined;
  if (manifest.thumbnail) {
    const thumbnailEntry = zip.getEntry(manifest.thumbnail);
    if (thumbnailEntry) {
      const thumbnailFileName = path.basename(manifest.thumbnail);
      const thumbnailStagingPath = path.join(stagingDir, thumbnailFileName);
      await fs.writeFile(thumbnailStagingPath, thumbnailEntry.getData());
      thumbnailPath = `/staging/lessons/courses/${slug}/${thumbnailFileName}`;
    }
  }

  // Create TestCourse entry with lesson data stored as JSON
  const testCourse = await prisma.testCourse.create({
    data: {
      slug,
      title: manifest.title,
      description: manifest.description,
      subject: manifest.subject,
      gradeLevel: manifest.gradeLevel,
      difficulty: manifest.difficulty,
      isPremium: manifest.isPremium,
      estimatedMinutes: manifest.estimatedMinutes,
      totalXP: manifest.totalXP,
      stagingPath: `/staging/lessons/courses/${slug}`,
      thumbnailPath,
      lessonsData: stagedLessons, // Store lessons as JSON
      createdBy: uploaderId,
      status: 'NOT_TESTED',
    }
  });

  return {
    success: true,
    testCourseId: testCourse.id,
    slug: testCourse.slug,
    stagingPath: `/staging/lessons/courses/${slug}`,
    lessonsStaged: stagedLessons.length,
  };
}

/**
 * Promote a TestCourse to production Course
 * This moves files from staging to production and creates database entries
 * @param testCourseId - The TestCourse ID to promote
 * @param promoterId - User ID of the admin promoting
 */
export async function promoteCourseToProduction(
  testCourseId: string,
  promoterId: string
) {
  // Get the test course
  const testCourse = await prisma.testCourse.findUnique({
    where: { id: testCourseId }
  });

  if (!testCourse) {
    throw new Error('Test course not found');
  }

  if (testCourse.status !== 'APPROVED') {
    throw new Error('Course must be approved before promoting to production');
  }

  if (testCourse.promotedToCourseId) {
    throw new Error('Course has already been promoted to production');
  }

  const lessonsData = testCourse.lessonsData as CourseManifest['lessons'];

  // Map difficulty string to Prisma enum
  const difficultyMap: Record<string, Difficulty> = {
    easy: 'BEGINNER',
    beginner: 'BEGINNER',
    medium: 'INTERMEDIATE',
    intermediate: 'INTERMEDIATE',
    hard: 'ADVANCED',
    advanced: 'ADVANCED',
  };
  const difficulty = difficultyMap[testCourse.difficulty.toLowerCase()] || 'INTERMEDIATE';

  // Create production directory
  const productionDir = path.join(process.cwd(), 'public', 'lessons', 'courses', testCourse.slug);
  await fs.mkdir(productionDir, { recursive: true });

  // Move files from staging to production
  const stagingDir = path.join(process.cwd(), 'public', 'staging', 'lessons', 'courses', testCourse.slug);

  // Copy all files from staging to production
  const stagingFiles = await fs.readdir(stagingDir);
  for (const file of stagingFiles) {
    const srcPath = path.join(stagingDir, file);
    const destPath = path.join(productionDir, file);
    await fs.copyFile(srcPath, destPath);
  }

  // Create Course in database
  const course = await prisma.course.create({
    data: {
      title: testCourse.title,
      slug: testCourse.slug,
      subject: testCourse.subject,
      gradeLevel: testCourse.gradeLevel,
      difficulty,
      isPremium: testCourse.isPremium,
      isPublished: true,
      description: testCourse.description,
      estimatedMinutes: testCourse.estimatedMinutes,
      totalXP: testCourse.totalXP,
      thumbnailUrl: testCourse.thumbnailPath?.replace('/staging/', '/'),
    },
  });

  // Create CourseLesson entries
  const typeMap: Record<string, LessonType> = {
    video: 'VIDEO',
    interactive: 'INTERACTIVE',
    game: 'GAME',
    quiz: 'QUIZ',
    reading: 'READING',
    project: 'PROJECT',
  };

  for (const lessonMeta of lessonsData) {
    const lessonType = typeMap[lessonMeta.type.toLowerCase()] || 'INTERACTIVE';
    const productionPath = lessonMeta.file.replace('/staging/', '/');

    await prisma.courseLesson.create({
      data: {
        courseId: course.id,
        order: lessonMeta.order,
        title: lessonMeta.title,
        description: lessonMeta.description,
        type: lessonType,
        contentPath: productionPath,
        duration: lessonMeta.duration,
        xpReward: lessonMeta.xpReward,
        requiredScore: lessonMeta.requiredScore,
      },
    });
  }

  // Update TestCourse with promotion info
  await prisma.testCourse.update({
    where: { id: testCourseId },
    data: {
      promotedToCourseId: course.id,
      promotedAt: new Date(),
      promotedBy: promoterId,
    }
  });

  // Optionally clean up staging directory
  await fs.rm(stagingDir, { recursive: true, force: true });

  return {
    success: true,
    courseId: course.id,
    slug: course.slug,
    lessonsCreated: lessonsData.length,
  };
}

/**
 * Generate a URL-safe slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Determine if a ZIP file is a course package (has lessons array in manifest)
 */
export function isCoursePackage(zip: AdmZip): boolean {
  const manifest = zip.getEntry('metadata.json');
  if (!manifest) return false;

  try {
    const data = JSON.parse(manifest.getData().toString('utf8'));
    return Array.isArray(data.lessons) && data.lessons.length > 0;
  } catch {
    return false;
  }
}

/**
 * Validate course package structure before processing
 */
export function validateCoursePackage(zip: AdmZip): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for metadata.json
  const manifest = zip.getEntry('metadata.json');
  if (!manifest) {
    errors.push('Missing metadata.json file');
    return { valid: false, errors };
  }

  let manifestData: CourseManifest;
  try {
    manifestData = JSON.parse(manifest.getData().toString('utf8'));
  } catch {
    errors.push('Invalid JSON in metadata.json');
    return { valid: false, errors };
  }

  // Required fields
  if (!manifestData.title) errors.push('Missing required field: title');
  if (!manifestData.description) errors.push('Missing required field: description');
  if (!manifestData.subject) errors.push('Missing required field: subject');
  if (!manifestData.lessons || manifestData.lessons.length === 0) {
    errors.push('Missing or empty lessons array');
  }

  // Validate each lesson
  if (manifestData.lessons) {
    for (const lesson of manifestData.lessons) {
      if (!lesson.title) errors.push(`Lesson at order ${lesson.order}: missing title`);
      if (!lesson.file) errors.push(`Lesson "${lesson.title}": missing file`);
      
      // Check if lesson file exists in ZIP
      if (lesson.file) {
        const lessonFile = zip.getEntry(lesson.file);
        if (!lessonFile) {
          errors.push(`Lesson file not found in ZIP: ${lesson.file}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
