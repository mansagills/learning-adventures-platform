'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

function CourseRequestSuccessContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');

  return (
    <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-ocean-50 py-16">
        <Container>
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-ocean-500 mb-6 shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
                Request Submitted Successfully!
              </h1>
              <p className="text-lg text-gray-600">
                Thank you for submitting your custom course request
              </p>
            </div>

            {/* Request ID */}
            {requestId && (
              <div className="bg-white border-2 border-brand-200 rounded-xl p-6 mb-8 text-center">
                <p className="text-sm text-gray-600 mb-2">Your Request ID</p>
                <p className="text-2xl font-mono font-bold text-brand-600">
                  {requestId}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Save this ID for future reference
                </p>
              </div>
            )}

            {/* What Happens Next */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📬</span>
                What Happens Next?
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Confirmation Email</p>
                    <p className="text-sm text-gray-600">
                      You'll receive an email confirmation within the next few minutes
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Review (24-48 hours)</p>
                    <p className="text-sm text-gray-600">
                      Our team will review your request and may reach out with questions
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Quote & Timeline</p>
                    <p className="text-sm text-gray-600">
                      We'll send a detailed quote and development timeline for approval
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Course Creation</p>
                    <p className="text-sm text-gray-600">
                      Our AI + human team will create your custom content
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center">
                    5
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Delivery & Support</p>
                    <p className="text-sm text-gray-600">
                      You'll receive your course with ongoing support and updates
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Link
                href="/my-requests"
                className="
                  px-6 py-4 rounded-xl border-2 border-brand-500
                  bg-brand-500 text-white font-semibold text-center
                  hover:bg-brand-600 hover:border-brand-600
                  transition-all shadow-md hover:shadow-lg
                "
              >
                View My Requests
              </Link>
              <Link
                href="/dashboard"
                className="
                  px-6 py-4 rounded-xl border-2 border-gray-300
                  text-gray-700 font-semibold text-center
                  hover:border-gray-400 hover:bg-gray-50
                  transition-all
                "
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-semibold text-ink-900 mb-1">
                      Questions?
                    </h3>
                    <p className="text-sm text-gray-700">
                      Email us at{' '}
                      <a
                        href="mailto:support@learningadventures.org"
                        className="text-ocean-600 hover:underline"
                      >
                        support@learningadventures.org
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-sunshine-50 border border-sunshine-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold text-ink-900 mb-1">
                      Track Progress
                    </h3>
                    <p className="text-sm text-gray-700">
                      View request status anytime in{' '}
                      <Link href="/my-requests" className="text-sunshine-700 hover:underline font-semibold">
                        My Requests
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Want Another Course */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Need to request another custom course?
              </p>
              <Link
                href="/course-request"
                className="
                  inline-flex items-center gap-2 px-6 py-3 rounded-lg
                  border-2 border-accent-300 text-accent-700 font-semibold
                  hover:border-accent-400 hover:bg-accent-50
                  transition-all
                "
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Request Another Course
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}

export default function CourseRequestSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CourseRequestSuccessContent />
    </Suspense>
  );
}
