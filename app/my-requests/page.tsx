'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import { useCourseRequests } from '@/hooks/useCourseRequests';

type StatusFilter =
  | 'all'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700',
    icon: '📬',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-purple-100 text-purple-700',
    icon: '👀',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '⚙️',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    icon: '✅',
  },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: '❌' },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-700',
    icon: '🚫',
  },
};

const urgencyConfig = {
  LOW: { label: 'No Rush', color: 'text-gray-600' },
  STANDARD: { label: 'Standard', color: 'text-blue-600' },
  HIGH: { label: 'Priority', color: 'text-orange-600' },
  URGENT: { label: 'Urgent', color: 'text-red-600' },
};

export default function MyRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { requests, isLoading, error, refetch } = useCourseRequests({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const getStatusCounts = () => {
    const counts = {
      all: requests.length,
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };

    requests.forEach((req: any) => {
      if (req.status in counts) {
        counts[req.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ocean-50 py-8">
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-2">
                    My Course Requests
                  </h1>
                  <p className="text-gray-600">
                    Track the status of your custom course requests
                  </p>
                </div>
                <Link
                  href="/course-request"
                  className="
                    px-6 py-3 rounded-lg
                    bg-brand-500 text-white font-semibold
                    hover:bg-brand-600 transition-all
                    flex items-center gap-2 shadow-md hover:shadow-lg
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
                  New Request
                </Link>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      statusFilter === 'all'
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-300'
                    }
                  `}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter('SUBMITTED')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      statusFilter === 'SUBMITTED'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                    }
                  `}
                >
                  Submitted ({statusCounts.SUBMITTED})
                </button>
                <button
                  onClick={() => setStatusFilter('UNDER_REVIEW')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      statusFilter === 'UNDER_REVIEW'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                    }
                  `}
                >
                  Under Review ({statusCounts.UNDER_REVIEW})
                </button>
                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      statusFilter === 'IN_PROGRESS'
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-300'
                    }
                  `}
                >
                  In Progress ({statusCounts.IN_PROGRESS})
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      statusFilter === 'COMPLETED'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300'
                    }
                  `}
                >
                  Completed ({statusCounts.COMPLETED})
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">Loading requests...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-coral-50 border-2 border-coral-200 rounded-xl p-6 text-center">
                <p className="text-coral-700 font-semibold mb-2">
                  Failed to load requests
                </p>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && requests.length === 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-ink-900 mb-2">
                  No requests yet
                </h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter === 'all'
                    ? "You haven't submitted any course requests yet."
                    : `No requests with status "${statusConfig[statusFilter as keyof typeof statusConfig]?.label}".`}
                </p>
                <Link
                  href="/course-request"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600"
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
                  Create Your First Request
                </Link>
              </div>
            )}

            {/* Request Cards */}
            {!isLoading && !error && requests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((request: any) => {
                  const status =
                    statusConfig[request.status as keyof typeof statusConfig];
                  const urgency =
                    urgencyConfig[
                      request.urgencyLevel as keyof typeof urgencyConfig
                    ];

                  return (
                    <Link
                      key={request.id}
                      href={`/my-requests/${request.id}`}
                      className="
                        bg-white border-2 border-gray-200 rounded-xl p-6
                        hover:border-brand-300 hover:shadow-lg
                        transition-all cursor-pointer group
                      "
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-sm font-semibold
                            ${status?.color}
                          `}
                        >
                          {status?.icon} {status?.label}
                        </span>
                        {urgency && request.urgencyLevel !== 'STANDARD' && (
                          <span
                            className={`text-sm font-semibold ${urgency.color}`}
                          >
                            ⚡ {urgency.label}
                          </span>
                        )}
                      </div>

                      {/* Student Info */}
                      <h3 className="text-lg font-bold text-ink-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {request.studentName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {request.primarySubject?.replace('_', ' ')} • Age{' '}
                        {request.studentAge}
                      </p>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Submitted {formatDate(request.submittedAt)}</span>
                        <svg
                          className="w-5 h-5 text-brand-500 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
