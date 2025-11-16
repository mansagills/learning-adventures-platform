/**
 * CourseCard Component
 *
 * Displays a course card with title, description, difficulty, XP, and progress.
 */

'use client';

import Link from 'next/link';
import { Course } from '@/lib/courses';
import PremiumBadge from './PremiumBadge';

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
    BEGINNER: 'bg-gradient-to-r from-grass-300 to-grass-400 text-white',
    INTERMEDIATE: 'bg-gradient-to-r from-sunshine-300 to-sunshine-400 text-white',
    ADVANCED: 'bg-gradient-to-r from-coral-300 to-coral-400 text-white',
  };

  const subjectColors = {
    math: 'bg-gradient-to-r from-ocean-400 to-ocean-500',
    science: 'bg-gradient-to-r from-brand-400 to-brand-500',
    english: 'bg-gradient-to-r from-coral-400 to-coral-500',
    history: 'bg-gradient-to-r from-sunshine-400 to-sunshine-500',
    interdisciplinary: 'bg-gradient-to-r from-accent-400 to-accent-500',
  };

  const subjectEmojis = {
    math: '🔢',
    science: '🔬',
    english: '📚',
    history: '🏛️',
    interdisciplinary: '🌈',
  };

  return (
    <Link
      href={isLocked ? '#' : `/courses/${slug}`}
      className={`block card-fun group ${
        isLocked ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {/* Colorful header with subject indicator */}
      <div className={`h-1 ${subjectColors[subject as keyof typeof subjectColors] || 'bg-gray-500'}`} />

      {/* Subject badge on top right */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full shadow-md text-white font-bold text-sm ${subjectColors[subject as keyof typeof subjectColors]}`}>
          <span className="text-lg">{subjectEmojis[subject as keyof typeof subjectEmojis]}</span>
          <span className="capitalize">{subject}</span>
        </div>
      </div>

      <div className="p-6 pt-14">
        {/* Title and Premium Badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-2xl font-bold text-ink-900 flex-1 group-hover:text-brand-600 transition-colors">{title}</h3>
          <div className="flex items-center gap-2 ml-2">
            {isPremium && <PremiumBadge size="sm" showLabel={false} />}
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 text-xs font-bold rounded-lg shadow">
                🔒 Locked
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-ink-600 text-base mb-4 line-clamp-2 leading-relaxed">{description}</p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-5">
          {/* Difficulty */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${
              difficultyColors[difficulty as keyof typeof difficultyColors]
            }`}
          >
            {difficulty === 'BEGINNER' && '🌱'}
            {difficulty === 'INTERMEDIATE' && '⚡'}
            {difficulty === 'ADVANCED' && '🔥'}
            {difficulty}
          </span>

          {/* Grade Level */}
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-ink-100 to-ink-200 text-ink-700 text-xs font-bold rounded-full shadow-sm">
            🎓 Grades {gradeLevel.join(', ')}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-ink-700 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-sunshine-100 to-sunshine-200 rounded-xl shadow-sm">
            <span className="text-lg">⭐</span>
            <span className="font-bold">{totalXP} XP</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-ocean-100 to-ocean-200 rounded-xl shadow-sm">
            <span className="text-lg">⏱️</span>
            <span className="font-bold">{timeEstimate}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrollment && progressPercentage !== undefined && (
          <div className="mb-5 p-4 bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl border-2 border-brand-200">
            <div className="flex justify-between text-sm text-ink-700 font-bold mb-2">
              <span className="flex items-center gap-1">
                📖 {lessonsCompleted} / {totalLessons} lessons
              </span>
              <span className="text-brand-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-3 shadow-inner overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-accent-500 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 10 && (
                  <div className="absolute right-2 top-0.5 text-xs text-white font-bold">
                    {progressPercentage === 100 && '🎉'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
          {enrollment ? (
            <span className="inline-flex items-center gap-2 text-brand-600 font-bold text-base group-hover:gap-3 transition-all">
              {progressPercentage === 100 ? (
                <>
                  <span className="text-lg">🎉</span>
                  <span>Completed!</span>
                </>
              ) : (
                <>
                  <span className="text-lg">▶️</span>
                  <span>Continue Learning</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-ink-600 font-bold text-base group-hover:text-brand-600 group-hover:gap-3 transition-all">
              <span className="text-lg">👀</span>
              <span>View Course</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
