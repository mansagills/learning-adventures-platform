'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import Icon from '@/components/Icon';
import Link from 'next/link';

function AssessmentsContent() {
  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Assessments</h1>
          <p className="text-lg text-ink-600">
            Test your knowledge and track your mastery
          </p>
        </div>

        {/* Available Assessments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Available Assessments</h2>
          <div className="space-y-4">
            {/* Assessment Item */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="clipboard" size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-ink-900">Math Fundamentals Assessment</h3>
                      <p className="text-sm text-gray-600">Grade 4-6 • 15 questions • 30 minutes</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Evaluate your understanding of basic arithmetic, fractions, and problem-solving skills.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href={"/assessments/math-fundamentals" as any}
                      className="px-6 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      Start Assessment
                    </Link>
                    <span className="text-sm text-gray-600">Not attempted</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink-900">?</div>
                  <div className="text-xs text-gray-500">Your Score</div>
                </div>
              </div>
            </div>

            {/* Completed Assessment */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon name="check" size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-ink-900">Science Basics Assessment</h3>
                      <p className="text-sm text-gray-600">Grade 3-5 • 12 questions • 20 minutes</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Test your knowledge of basic scientific concepts, experiments, and observations.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href={"/assessments/science-basics" as any}
                      className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Retake
                    </Link>
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Icon name="check" size={16} />
                      Completed
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-xs text-gray-500">Your Score</div>
                </div>
              </div>
            </div>

            {/* Locked Assessment */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 opacity-60">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Icon name="lock" size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-ink-900">Advanced Math Assessment</h3>
                      <p className="text-sm text-gray-600">Grade 7-8 • 20 questions • 45 minutes</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Complete Math Fundamentals Assessment to unlock this advanced assessment.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      disabled
                      className="px-6 py-2 bg-gray-200 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                    >
                      Locked
                    </button>
                    <span className="text-sm text-gray-500">Complete prerequisites first</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-400">
                    <Icon name="lock" size={32} />
                  </div>
                  <div className="text-xs text-gray-500">Locked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Recent Attempts</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="check" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-ink-900">Science Basics Assessment</p>
                  <p className="text-sm text-gray-600">Completed on Dec 20, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">85%</div>
                <div className="text-xs text-gray-500">Passed</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon name="clipboard" size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-ink-900">English Grammar Assessment</p>
                  <p className="text-sm text-gray-600">Completed on Dec 15, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-600">72%</div>
                <div className="text-xs text-gray-500">Needs Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function AssessmentsPage() {
  return (
    <ProtectedRoute>
      <AssessmentsContent />
    </ProtectedRoute>
  );
}
