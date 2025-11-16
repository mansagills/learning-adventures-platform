/**
 * Course Catalog Page
 *
 * Displays all available courses with filtering and search.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CourseCard from '@/components/courses/CourseCard';
import { CourseCatalogSkeleton } from '@/components/LoadingSkeleton';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string[];
  difficulty: string;
  isPremium: boolean;
  totalXP: number;
  estimatedMinutes: number;
  progressPercentage?: number;
  enrollment?: any;
  lessonsCompleted?: number;
  totalLessons?: number;
  isLocked?: boolean;
}

export default function CourseCatalogPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [status]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const includeProgress = status === 'authenticated';
      const url = `/api/courses?includeProgress=${includeProgress}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Handle both paginated (data.data.data) and non-paginated (data.data.courses) responses
        const coursesData = data.data.data || data.data.courses || [];
        setCourses(coursesData);

        // Calculate enrollment count and check premium status
        if (status === 'authenticated') {
          const enrolledCourses = coursesData.filter((c: Course) => c.enrollment);
          setEnrollmentCount(enrolledCourses.length);

          // Check if user has premium access (from session or user profile)
          // For now, we'll use a simple check - you may want to add this to the API response
          const hasPremium = session?.user?.role === 'ADMIN' || false; // TODO: Add premium field to user
          setIsPremiumUser(hasPremium);
        }
      } else {
        setError(data.error?.message || 'Failed to load courses');
      }
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    // Subject filter
    if (selectedSubject !== 'all' && course.subject !== selectedSubject) {
      return false;
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all' && course.difficulty !== selectedDifficulty) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get unique subjects
  const subjects = Array.from(new Set(courses.map((c) => c.subject)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Catalog</h1>
            <p className="text-gray-600">
              Explore our courses and start your learning adventure!
            </p>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Results count skeleton */}
          <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />

          {/* Course grid skeleton */}
          <CourseCatalogSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Catalog</h1>
          <p className="text-gray-600">
            Explore our courses and start your learning adventure!
          </p>
        </div>

        {/* Premium Upgrade CTA - Show for authenticated free users */}
        {status === 'authenticated' && !isPremiumUser && (
          <div className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Upgrade to Premium</h3>
                  </div>
                  <p className="text-white text-sm md:text-base mb-3">
                    You're currently enrolled in <span className="font-bold">{enrollmentCount} of 2 free courses</span>.
                    Upgrade to Premium for unlimited course access and exclusive content!
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs md:text-sm text-white justify-center md:justify-start">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Unlimited Enrollments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Premium Courses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Certificates</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Priority Support</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/pricing"
                    className="inline-block px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject} className="capitalize">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedSubject !== 'all' ||
            selectedDifficulty !== 'all' ||
            searchQuery) && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Active filters:</span>
              {selectedSubject !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {selectedSubject}
                </span>
              )}
              {selectedDifficulty !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {selectedDifficulty}
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedSubject('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
