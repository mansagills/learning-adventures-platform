import AdmZip from 'adm-zip';
import { prisma } from '@/lib/prisma';
import { routeFileUpload } from '@/lib/storage/storageRouter';
import path from 'path';
import { Difficulty, LessonType } from '@prisma/client';

interface CourseManifest {
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
    type: string;
    file: string;
    duration: number;
    xpReward: number;
    requiredScore?: number;
  }>;
}

/**
 * Process a course package (.zip file) and create Course + Lessons in database
 * @param zipFile - The uploaded .zip File object
 * @param uploaderId - User ID of the admin uploading
 * @returns Object with courseId, slug, and lesson count
 */
export async function processCoursePackage(
  zipFile: File,
  uploaderId: string
) {
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

  // Map difficulty string to Prisma enum
  const difficultyMap: Record<string, Difficulty> = {
    easy: 'BEGINNER',
    beginner: 'BEGINNER',
    medium: 'INTERMEDIATE',
    intermediate: 'INTERMEDIATE',
    hard: 'ADVANCED',
    advanced: 'ADVANCED',
  };
  const difficulty = difficultyMap[manifest.difficulty.toLowerCase()] || 'INTERMEDIATE';

  // Create Course
  const course = await prisma.course.create({
    data: {
      title: manifest.title,
      slug: manifest.slug,
      subject: manifest.subject,
      gradeLevel: manifest.gradeLevel,
      difficulty,
      isPremium: manifest.isPremium,
      isPublished: true,
      description: manifest.description,
      estimatedMinutes: manifest.estimatedMinutes,
      totalXP: manifest.totalXP,
    },
  });

  // Process each lesson file
  const lessonPromises = manifest.lessons.map(async (lessonMeta) => {
    const lessonEntry = zip.getEntry(lessonMeta.file);
    if (!lessonEntry) {
      console.warn(`Lesson file not found: ${lessonMeta.file}`);
      return null;
    }

    const lessonData = lessonEntry.getData();
    // Convert Buffer to Uint8Array for File constructor
    const lessonBytes = new Uint8Array(lessonData);
    const lessonFile = new File([lessonBytes], path.basename(lessonMeta.file));

    // Upload lesson file
    const targetPath = `lessons/courses/${manifest.slug}/${lessonFile.name}`;
    const { url, storageType } = await routeFileUpload(lessonFile, targetPath);

    // Map lesson type string to Prisma enum
    const typeMap: Record<string, LessonType> = {
      video: 'VIDEO',
      interactive: 'INTERACTIVE',
      game: 'GAME',
      quiz: 'QUIZ',
      reading: 'READING',
      project: 'PROJECT',
    };
    const lessonType = typeMap[lessonMeta.type.toLowerCase()] || 'INTERACTIVE';

    // Create CourseLesson
    return prisma.courseLesson.create({
      data: {
        courseId: course.id,
        order: lessonMeta.order,
        title: lessonMeta.title,
        type: lessonType,
        contentPath: url,
        duration: lessonMeta.duration,
        xpReward: lessonMeta.xpReward,
        requiredScore: lessonMeta.requiredScore,
      },
    });
  });

  await Promise.all(lessonPromises);

  return {
    success: true,
    courseId: course.id,
    slug: course.slug,
    lessonsCreated: manifest.lessons.length,
  };
}
