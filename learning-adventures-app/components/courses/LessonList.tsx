/**
 * LessonList Component
 *
 * Displays course lessons with progress indicators and lock status.
 */

'use client';

import Link from 'next/link';

interface Lesson {
  id: string;
  order: number;
  title: string;
  description: string;
  type: string;
  duration: number;
  xpReward: number;
  requiredScore: number | null;
  progress?: {
    status: string;
    score: number | null;
    completedAt: Date | null;
  };
  isLocked?: boolean;
  isPassed?: boolean;
  canAccess?: boolean;
}

interface LessonListProps {
  lessons: Lesson[];
  courseSlug: string;
  isEnrolled: boolean;
}

export default function LessonList({ lessons, courseSlug, isEnrolled }: LessonListProps) {
  const lessonTypeIcons: Record<string, string> = {
    VIDEO: '📹',
    INTERACTIVE: '🎮',
    GAME: '🎯',
    QUIZ: '📝',
    READING: '📖',
    PROJECT: '🚀',
  };

  const getStatusIcon = (lesson: Lesson) => {
    if (!isEnrolled) return null;

    if (lesson.progress?.status === 'COMPLETED') {
      return lesson.isPassed ? '✅' : '⚠️';
    }
    if (lesson.progress?.status === 'IN_PROGRESS') {
      return '▶️';
    }
    if (lesson.isLocked) {
      return '🔒';
    }
    return '⭕';
  };

  const getStatusText = (lesson: Lesson) => {
    if (!isEnrolled) return null;

    if (lesson.progress?.status === 'COMPLETED') {
      if (lesson.isPassed) {
        return lesson.progress.score ? `Completed (${lesson.progress.score}%)` : 'Completed';
      }
      return `Failed (${lesson.progress.score}%) - Retry`;
    }
    if (lesson.progress?.status === 'IN_PROGRESS') {
      return 'In Progress';
    }
    if (lesson.isLocked) {
      return 'Locked';
    }
    return 'Not Started';
  };

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const canClick = isEnrolled && !lesson.isLocked;
        const href = canClick ? `/courses/${courseSlug}/lessons/${lesson.order}` : '#';

        const lessonComponent = (
          <div
            className={`
              flex items-center gap-4 p-4 rounded-lg border transition-all
              ${canClick ? 'bg-white hover:shadow-md cursor-pointer' : 'bg-gray-50 border-gray-200'}
              ${lesson.progress?.status === 'COMPLETED' && lesson.isPassed ? 'border-green-200' : 'border-gray-200'}
              ${lesson.isLocked ? 'opacity-60' : ''}
            `}
          >
            {/* Order Number */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {lesson.order}
            </div>

            {/* Lesson Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {lessonTypeIcons[lesson.type] || '📄'}
                </span>
                <h3 className="font-semibold text-gray-900 truncate">{lesson.title}</h3>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1">{lesson.description}</p>

              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>⏱️ {lesson.duration} min</span>
                <span>⭐ {lesson.xpReward} XP</span>
                {lesson.requiredScore && (
                  <span>🎯 {lesson.requiredScore}% required</span>
                )}
              </div>
            </div>

            {/* Status */}
            {isEnrolled && (
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl mb-1">{getStatusIcon(lesson)}</div>
                <div className="text-xs font-medium text-gray-600">
                  {getStatusText(lesson)}
                </div>
              </div>
            )}
          </div>
        );

        return canClick ? (
          <Link key={lesson.id} href={href as any}>
            {lessonComponent}
          </Link>
        ) : (
          <div key={lesson.id}>{lessonComponent}</div>
        );
      })}
    </div>
  );
}
