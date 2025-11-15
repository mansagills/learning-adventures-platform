/**
 * Lesson Player Page
 *
 * Displays lesson content and handles lesson start/completion.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import XPReward from '@/components/courses/XPReward';
import LevelUpModal from '@/components/courses/LevelUpModal';

interface LessonPlayerProps {
  params: {
    slug: string;
    order: string;
  };
}

export default function LessonPlayerPage({ params }: LessonPlayerProps) {
  const { slug, order } = params;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Completion flow
  const [completing, setCompleting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAwarded, setXPAwarded] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=/courses/${slug}/lessons/${order}`);
      return;
    }

    if (status === 'authenticated') {
      fetchLesson();
    }
  }, [slug, order, status]);

  const fetchLesson = async () => {
    try {
      setLoading(true);

      // Get course first
      const courseResponse = await fetch(`/api/courses?search=${slug}`);
      const courseData = await courseResponse.json();

      if (!courseData.success || courseData.data.courses.length === 0) {
        setError('Course not found');
        return;
      }

      const foundCourse = courseData.data.courses.find((c: any) => c.slug === slug);

      if (!foundCourse) {
        setError('Course not found');
        return;
      }

      // Get full course with progress
      const detailResponse = await fetch(
        `/api/courses/${foundCourse.id}?includeProgress=true`
      );
      const detailData = await detailResponse.json();

      if (!detailData.success) {
        setError('Failed to load course');
        return;
      }

      setCourse(detailData.data.course);

      // Find the lesson by order
      const lessonOrder = parseInt(order, 10);
      const foundLesson = detailData.data.course.lessons?.find(
        (l: any) => l.order === lessonOrder
      );

      if (!foundLesson) {
        setError('Lesson not found');
        return;
      }

      setLesson(foundLesson);

      // Start the lesson automatically
      await startLesson(foundLesson.id, foundCourse.id);
    } catch (err) {
      setError('Failed to load lesson');
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lessonId: string, courseId: string) => {
    try {
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}/start`, {
        method: 'POST',
      });
      setStartTime(Date.now());
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  };

  const handleComplete = async (score?: number) => {
    if (!lesson || !course) return;

    setCompleting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds

      const response = await fetch(
        `/api/courses/${course.id}/lessons/${lesson.id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score,
            timeSpent,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.data.passed) {
          // Show XP reward
          setXPAwarded(data.data.xpAwarded);
          setShowXP(true);

          // Check for level up
          if (data.data.leveledUp) {
            setNewLevel(data.data.newLevel);
            // Will show after XP animation
          }

          // Navigate after animations
          setTimeout(() => {
            if (data.data.nextLesson) {
              router.push(`/courses/${slug}/lessons/${data.data.nextLesson.order}`);
            } else {
              router.push(`/courses/${slug}`);
            }
          }, data.data.leveledUp ? 5000 : 3000);
        } else {
          // Failed - show retry option
          alert(data.data.message || 'You need a higher score to pass. Try again!');
        }
      } else {
        setError(data.error?.message || 'Failed to complete lesson');
      }
    } catch (err) {
      setError('Failed to complete lesson');
      console.error('Error completing lesson:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Lesson not found'}</p>
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lessonTypeIcons: Record<string, string> = {
    VIDEO: '📹',
    INTERACTIVE: '🎮',
    GAME: '🎯',
    QUIZ: '📝',
    READING: '📖',
    PROJECT: '🚀',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/courses/${slug}`)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Course
        </button>

        {/* Lesson Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{lessonTypeIcons[lesson.type] || '📄'}</span>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                Lesson {lesson.order} of {course.lessons?.length || 0}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{lesson.description}</p>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>⏱️ {lesson.duration} minutes</span>
            <span>⭐ {lesson.xpReward} XP</span>
            {lesson.requiredScore && <span>🎯 {lesson.requiredScore}% required to pass</span>}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson Content</h2>

          {/* Placeholder for actual lesson content */}
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              This is a demonstration lesson player. In a production environment, this area would display:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Interactive lesson content from: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{lesson.contentPath}</code></li>
              <li>Videos, quizzes, games, or reading material</li>
              <li>Progress tracking as the user goes through the content</li>
              <li>Interactive elements based on lesson type</li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-blue-800 font-semibold">
                💡 To complete this lesson, click the "Complete Lesson" button below.
              </p>
              {lesson.requiredScore && (
                <p className="text-blue-700 text-sm mt-2">
                  You'll be prompted to enter a score. Make sure to score at least {lesson.requiredScore}% to unlock the next lesson!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <button
            onClick={() => {
              if (lesson.requiredScore) {
                const score = prompt(
                  `Enter your score (0-100). You need at least ${lesson.requiredScore}% to pass:`
                );
                if (score !== null) {
                  const scoreNum = parseInt(score, 10);
                  if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 100) {
                    handleComplete(scoreNum);
                  } else {
                    alert('Please enter a valid score between 0 and 100');
                  }
                }
              } else {
                handleComplete();
              }
            }}
            disabled={completing}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? 'Completing...' : 'Complete Lesson'}
          </button>
        </div>
      </div>

      {/* XP Reward Animation */}
      {showXP && (
        <XPReward
          xp={xpAwarded}
          onComplete={() => {
            setShowXP(false);
            if (newLevel > 0) {
              setShowLevelUp(true);
            }
          }}
        />
      )}

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          level={newLevel}
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}
