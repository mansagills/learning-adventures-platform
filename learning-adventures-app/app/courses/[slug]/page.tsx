/**
 * Course Detail Page
 *
 * Displays full course information with enrollment button and lesson list.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EnrollButton from '@/components/courses/EnrollButton';
import LessonList from '@/components/courses/LessonList';

interface CourseDetailProps {
  params: {
    slug: string;
  };
}

export default function CourseDetailPage({ params }: CourseDetailProps) {
  const { slug } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [slug, status]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      // First get course by slug from API
      const response = await fetch(`/api/courses?search=${slug}`);
      const data = await response.json();

      if (data.success && data.data.courses.length > 0) {
        const foundCourse = data.data.courses.find((c: any) => c.slug === slug);

        if (foundCourse) {
          // Now get full course details with progress if authenticated
          const includeProgress = status === 'authenticated';
          const detailResponse = await fetch(
            `/api/courses/${foundCourse.id}?includeProgress=${includeProgress}`
          );
          const detailData = await detailResponse.json();

          if (detailData.success) {
            setCourse(detailData.data.course);
          } else {
            setError('Course not found');
          }
        } else {
          setError('Course not found');
        }
      } else {
        setError('Course not found');
      }
    } catch (err) {
      setError('Failed to load course');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Course not found'}</p>
            <button
              onClick={() => router.push('/courses')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse All Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEnrolled = !!course.enrollment;
  const hours = Math.floor(course.estimatedMinutes / 60);
  const minutes = course.estimatedMinutes % 60;
  const timeEstimate = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/courses')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded ${
                    difficultyColors[course.difficulty]
                  }`}
                >
                  {course.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded">
                  Grades {course.gradeLevel.join(', ')}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded capitalize">
                  {course.subject}
                </span>
                {course.isPremium && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded">
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{course.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-lg font-bold text-gray-900">{course.lessons?.length || 0}</div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-lg font-bold text-gray-900">{course.totalXP}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-lg font-bold text-gray-900">{timeEstimate}</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-lg font-bold text-gray-900">
                {isEnrolled ? `${course.progressPercentage || 0}%` : '-'}
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {isEnrolled && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {course.lessonsCompleted || 0} of {course.lessons?.length || 0} lessons completed
                </span>
                <span>{course.progressPercentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${course.progressPercentage || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Enrollment Button */}
          <EnrollButton
            courseId={course.id}
            courseSlug={course.slug}
            isEnrolled={isEnrolled}
            isPremium={course.isPremium}
            onEnrollmentChange={fetchCourse}
          />
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>

          {course.lessons && course.lessons.length > 0 ? (
            <LessonList
              lessons={course.lessons}
              courseSlug={course.slug}
              isEnrolled={isEnrolled}
            />
          ) : (
            <p className="text-gray-600 text-center py-8">No lessons available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
