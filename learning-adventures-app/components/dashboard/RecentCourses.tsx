/**
 * Recent Courses Component
 *
 * Shows user's recently accessed courses with progress
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CourseEnrollment {
  id: string;
  courseId: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    subject: string;
    difficulty: string;
    totalXP: number;
  };
}

export default function RecentCourses() {
  const [courses, setCourses] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentCourses();
  }, []);

  const fetchRecentCourses = async () => {
    try {
      const response = await fetch('/api/courses/user/dashboard');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.recentCourses || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Courses Yet
        </h3>
        <p className="text-gray-600 mb-4">
          Start your learning journey by enrolling in a course!
        </p>
        <Link
          href="/courses"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      math: 'bg-blue-500',
      science: 'bg-green-500',
      english: 'bg-purple-500',
      history: 'bg-orange-500',
      interdisciplinary: 'bg-pink-500',
    };
    return colors[subject.toLowerCase()] || 'bg-gray-500';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      BEGINNER: { color: 'bg-green-100 text-green-800', text: 'Beginner' },
      INTERMEDIATE: { color: 'bg-yellow-100 text-yellow-800', text: 'Intermediate' },
      ADVANCED: { color: 'bg-red-100 text-red-800', text: 'Advanced' },
    };
    const badge = badges[difficulty] || badges.BEGINNER;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Continue Learning</h2>
        <Link
          href="/courses"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View All →
        </Link>
      </div>

      {courses.map((enrollment) => (
        <Link
          key={enrollment.id}
          href={`/courses/${enrollment.course.slug}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div className="flex">
            {/* Subject color bar */}
            <div className={`w-2 ${getSubjectColor(enrollment.course.subject)}`} />

            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {enrollment.course.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getDifficultyBadge(enrollment.course.difficulty)}
                    <span className="text-xs text-gray-500">
                      {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                    </span>
                    <span className="text-xs text-gray-500">
                      ⭐ {enrollment.course.totalXP} XP
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-indigo-600">
                    {enrollment.progressPercent}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${enrollment.progressPercent}%` }}
                />
              </div>

              {enrollment.progressPercent === 100 && (
                <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Course Completed!
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
