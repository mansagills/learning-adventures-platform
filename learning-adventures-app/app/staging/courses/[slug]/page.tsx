'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LessonData {
  order: number;
  title: string;
  description?: string;
  type: string;
  file: string;
  duration: number;
  xpReward: number;
}

interface TestCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string[];
  difficulty: string;
  isPremium: boolean;
  estimatedMinutes: number;
  totalXP: number;
  stagingPath: string;
  lessonsData: LessonData[];
  status: string;
  createdAt: string;
}

export default function StagingCoursePreviewPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [course, setCourse] = useState<TestCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }

    fetchCourse();
  }, [session, status, slug]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/test-courses?slug=${slug}`);
      const data = await res.json();
      
      if (data.courses && data.courses.length > 0) {
        const foundCourse = data.courses.find((c: TestCourse) => c.slug === slug);
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          setError('Course not found in staging');
        }
      } else {
        setError('Course not found in staging');
      }
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This course does not exist in staging.'}</p>
          <Link 
            href="/internal/testing"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Testing
          </Link>
        </div>
      </div>
    );
  }

  const selectedLesson = course.lessonsData[selectedLessonIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Bar */}
      <div className="bg-purple-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-purple-700 rounded-full text-sm font-medium">
              STAGING PREVIEW
            </span>
            <h1 className="font-bold">{course.title}</h1>
            <span className="text-purple-200 text-sm">
              Status: {course.status.replace('_', ' ')}
            </span>
            {course.isPremium && (
              <span className="px-2 py-1 bg-yellow-500 text-yellow-900 rounded text-xs font-medium">
                PREMIUM
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/internal/testing"
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm"
            >
              Back to Testing
            </Link>
          </div>
        </div>
      </div>

      {/* Course Info Bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm text-gray-600">
          <span><strong>Subject:</strong> {course.subject}</span>
          <span><strong>Grade:</strong> {course.gradeLevel.join(', ')}</span>
          <span><strong>Difficulty:</strong> {course.difficulty}</span>
          <span><strong>Duration:</strong> {course.estimatedMinutes} mins</span>
          <span><strong>Total XP:</strong> {course.totalXP}</span>
          <span><strong>Lessons:</strong> {course.lessonsData.length}</span>
        </div>
      </div>

      <div className="flex">
        {/* Lesson Sidebar */}
        <div className="w-80 bg-white border-r min-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-900">Course Lessons</h2>
            <p className="text-sm text-gray-500">{course.lessonsData.length} lessons total</p>
          </div>
          <div className="divide-y">
            {course.lessonsData
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedLessonIndex(index)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedLessonIndex === index ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {lesson.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{lesson.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{lesson.type}</span>
                        <span>{lesson.duration} min</span>
                        <span>{lesson.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Lesson Preview */}
        <div className="flex-1 p-4">
          {selectedLesson ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      Lesson {selectedLesson.order}: {selectedLesson.title}
                    </h2>
                    {selectedLesson.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedLesson.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-200 rounded">{selectedLesson.type}</span>
                    <span>{selectedLesson.duration} min</span>
                    <span>{selectedLesson.xpReward} XP</span>
                  </div>
                </div>
              </div>
              <iframe
                src={selectedLesson.file}
                className="w-full h-[calc(100vh-300px)] min-h-[500px]"
                title={selectedLesson.title}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select a lesson to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with quick actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Staging path: <code className="bg-gray-100 px-2 py-1 rounded">{course.stagingPath}</code>
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/internal/testing?tab=courses&select=${course.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              Review & Approve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
