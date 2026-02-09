'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Link from 'next/link';
import { useOversight, Student } from '@/hooks/useOversight';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-ink-800 group-hover:text-brand-600 transition-colors">
            {student.name}
          </h3>
          <p className="text-sm text-ink-500">{student.email}</p>
          <p className="text-xs text-ink-400 mt-1">
            Grade {student.gradeLevel}
          </p>
        </div>
        <Icon
          name="arrow-right"
          size={20}
          className="text-ink-300 group-hover:text-brand-500 transition-colors"
        />
      </div>

      {student.classroomName && (
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="book" size={14} className="text-ink-400" />
          <span className="text-xs text-ink-500">{student.classroomName}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-ink-500 mb-1">Adventures</p>
          <p className="text-lg font-bold text-ink-800">
            {student.stats.completedAdventures}/{student.stats.totalAdventures}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-ink-500 mb-1">Completion</p>
          <p className="text-lg font-bold text-green-600">
            {student.stats.completionRate}%
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-amber-600">
          <Icon name="star" size={14} />
          <span>{student.stats.achievements} badges</span>
        </div>
        <div className="flex items-center space-x-1 text-brand-600">
          <Icon name="check" size={14} />
          <span>{student.stats.activeGoals} active goals</span>
        </div>
      </div>
    </div>
  );
}

function ClassroomDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { students, loading, error } = useOversight();

  // Calculate overall stats
  const totalStudents = students.length;
  const avgCompletion =
    totalStudents > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.stats.completionRate, 0) /
            totalStudents
        )
      : 0;
  const totalAdventures = students.reduce(
    (sum, s) => sum + s.stats.totalAdventures,
    0
  );
  const totalCompleted = students.reduce(
    (sum, s) => sum + s.stats.completedAdventures,
    0
  );
  const totalAchievements = students.reduce(
    (sum, s) => sum + s.stats.achievements,
    0
  );

  const handleStudentClick = (studentId: string) => {
    router.push(`/teacher/student/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Classroom</h1>
              <p className="mt-1 text-gray-600">
                Welcome back, {session?.user?.name || 'Teacher'}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Icon name="arrow-left" size={16} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-ink-800 mt-2">
                  {totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                <Icon name="users" size={24} className="text-brand-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">
                  Adventures Completed
                </p>
                <p className="text-3xl font-bold text-ink-800 mt-2">
                  {totalCompleted}
                </p>
                <p className="text-xs text-ink-400 mt-1">
                  of {totalAdventures} total
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="check" size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">
                  Avg. Completion
                </p>
                <p className="text-3xl font-bold text-ink-800 mt-2">
                  {avgCompletion}%
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <Icon name="chart" size={24} className="text-accent-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">Total Badges</p>
                <p className="text-3xl font-bold text-ink-800 mt-2">
                  {totalAchievements}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Icon name="star" size={24} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-ink-800">Students</h2>
              <p className="text-sm text-ink-500 mt-1">
                Click on a student to view detailed progress
              </p>
            </div>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm flex items-center space-x-2">
              <Icon name="plus" size={16} />
              <span>Manage Classrooms</span>
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
              <p className="mt-4 text-ink-500">Loading students...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="info" size={20} className="text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && students.length === 0 && (
            <div className="text-center py-12">
              <Icon
                name="users"
                size={48}
                className="text-ink-300 mx-auto mb-4"
              />
              <p className="text-ink-500 mb-2">No students yet</p>
              <p className="text-sm text-ink-400 mb-4">
                Students will appear here when they enroll in your classrooms
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Icon name="book" size={16} />
                <span>Browse Catalog</span>
              </Link>
            </div>
          )}

          {!loading && !error && students.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => handleStudentClick(student.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        {!loading && students.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="info" size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Monitoring Student Progress
                </h3>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      Click on any student card to view detailed progress and
                      analytics
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      Track completion rates, time spent, and achievement badges
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      Monitor active learning goals and help students stay on
                      track
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      View subject-specific breakdowns to identify strengths and
                      areas for improvement
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TeacherClassroomPage() {
  return (
    <ProtectedRoute requiredRole="TEACHER">
      <ClassroomDashboard />
    </ProtectedRoute>
  );
}
