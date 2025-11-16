/**
 * Course Catalog Page
 *
 * Displays all available courses with filtering and search.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import CourseCard from '@/components/courses/CourseCard';

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
        setCourses(data.data.courses || []);
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
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
