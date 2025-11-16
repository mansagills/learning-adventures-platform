/**
 * CourseCard Component
 *
 * Displays a course card with title, description, difficulty, XP, and progress.
 */

'use client';

import Link from 'next/link';
import { Course } from '@/lib/courses';

interface CourseCardProps {
  course: Course & {
    progressPercentage?: number;
    enrollment?: any;
    lessonsCompleted?: number;
    totalLessons?: number;
    isLocked?: boolean;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const {
    slug,
    title,
    description,
    subject,
    difficulty,
    isPremium,
    totalXP,
    estimatedMinutes,
    gradeLevel,
    progressPercentage,
    enrollment,
    lessonsCompleted = 0,
    totalLessons = 0,
    isLocked = false,
  } = course;

  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  const timeEstimate = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
  };

  const subjectColors = {
    math: 'bg-blue-500',
    science: 'bg-purple-500',
    english: 'bg-pink-500',
    history: 'bg-orange-500',
    interdisciplinary: 'bg-teal-500',
  };

  return (
    <Link
      href={isLocked ? '#' : `/courses/${slug}`}
      className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
        isLocked ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {/* Header with subject color */}
      <div
        className={`h-2 ${subjectColors[subject as keyof typeof subjectColors] || 'bg-gray-500'}`}
      />

      <div className="p-6">
        {/* Title and Premium Badge */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{title}</h3>
          {isPremium && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
              Premium
            </span>
          )}
          {isLocked && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
              🔒 Locked
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Difficulty */}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              difficultyColors[difficulty as keyof typeof difficultyColors]
            }`}
          >
            {difficulty}
          </span>

          {/* Grade Level */}
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
            Grades {gradeLevel.join(', ')}
          </span>

          {/* Subject */}
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded capitalize">
            {subject}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-semibold">{totalXP} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{timeEstimate}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrollment && progressPercentage !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {lessonsCompleted} / {totalLessons} lessons
              </span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="flex items-center justify-between">
          {enrollment ? (
            <span className="text-blue-600 font-semibold text-sm">
              {progressPercentage === 100 ? '✓ Completed' : 'Continue Learning →'}
            </span>
          ) : (
            <span className="text-gray-600 font-semibold text-sm">View Course →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
