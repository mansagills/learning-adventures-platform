'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: '📬' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-700', icon: '👀' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: '⚙️' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: '✅' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: '❌' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: '🚫' },
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/course-requests/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch request');
        }

        const data = await response.json();
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load request');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ocean-50 py-16">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading request details...</p>
            </div>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !request) {
    return (
      <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ocean-50 py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="bg-coral-50 border-2 border-coral-200 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-ink-900 mb-2">Request Not Found</h2>
                <p className="text-gray-600 mb-6">{error || 'The requested course request could not be found.'}</p>
                <Link
                  href="/my-requests"
                  className="inline-block px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600"
                >
                  Back to My Requests
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  const status = statusConfig[request.status as keyof typeof statusConfig];

  return (
    <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ocean-50 py-8">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/my-requests"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-6"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to My Requests
            </Link>

            {/* Header */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8 mb-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-ink-900 mb-2">
                    Course Request for {request.studentName}
                  </h1>
                  <p className="text-gray-600">Request ID: {request.id}</p>
                </div>
                <span
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
                    ${status?.color}
                  `}
                >
                  {status?.icon} {status?.label}
                </span>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Submitted</p>
                  <p className="text-sm font-semibold text-ink-900">
                    {formatDate(request.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-semibold text-ink-900">
                    {formatDate(request.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Urgency</p>
                  <p className="text-sm font-semibold text-ink-900">
                    {request.urgencyLevel?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-6">
              {/* Section 1: Requestor Information */}
              <DetailSection title="Requestor Information" icon="👤">
                <DetailRow label="Name" value={request.fullName} />
                <DetailRow label="Role" value={request.role} />
                <DetailRow label="Email" value={request.email} />
                <DetailRow label="Phone" value={request.phone || 'Not provided'} />
                <DetailRow label="Organization" value={request.organization || 'Not provided'} />
                <DetailRow label="Preferred Contact" value={request.preferredContact} />
              </DetailSection>

              {/* Section 2: Student Profile */}
              <DetailSection title="Student Profile" icon="🎓">
                <DetailRow label="Student Name" value={request.studentName} />
                <DetailRow label="Age" value={request.studentAge} />
                <DetailRow label="Grade Level" value={request.gradeLevel} />
                <DetailRow label="Number of Students" value={request.numberOfStudents} />
                {request.learningAccommodations && request.learningAccommodations.length > 0 && (
                  <DetailRow
                    label="Learning Accommodations"
                    value={request.learningAccommodations.join(', ')}
                  />
                )}
                {request.accommodationNotes && (
                  <DetailRow label="Accommodation Notes" value={request.accommodationNotes} />
                )}
              </DetailSection>

              {/* Section 3: Subject & Focus */}
              <DetailSection title="Subject & Focus" icon="📚">
                <DetailRow label="Primary Subject" value={request.primarySubject?.replace('_', ' ')} />
                {request.specificTopics && request.specificTopics.length > 0 && (
                  <DetailRow label="Topics" value={request.specificTopics.join(', ')} />
                )}
                {request.customTopics && (
                  <DetailRow label="Custom Topics" value={request.customTopics} />
                )}
                <DetailRow label="Learning Goal" value={request.learningGoal?.replace('_', ' ')} />
              </DetailSection>

              {/* Section 4: Learning Challenges */}
              {request.learningChallenges && request.learningChallenges.length > 0 && (
                <DetailSection title="Learning Challenges" icon="🎯">
                  <DetailRow label="Challenges" value={request.learningChallenges.join(', ')} />
                  {request.challengeObservations && (
                    <DetailRow label="Observations" value={request.challengeObservations} />
                  )}
                </DetailSection>
              )}

              {/* Section 5: Learning Style */}
              <DetailSection title="Learning Style & Interests" icon="🎨">
                {request.learningStyles && request.learningStyles.length > 0 && (
                  <DetailRow label="Learning Styles" value={request.learningStyles.join(', ')} />
                )}
                {request.studentInterests && request.studentInterests.length > 0 && (
                  <DetailRow label="Interests" value={request.studentInterests.join(', ')} />
                )}
                {request.favoriteCharacters && (
                  <DetailRow label="Favorite Characters/Themes" value={request.favoriteCharacters} />
                )}
              </DetailSection>

              {/* Section 6: Course Format */}
              <DetailSection title="Course Format" icon="📅">
                <DetailRow label="Course Length" value={request.courseLength?.replace('_', ' ')} />
                {request.courseComponents && request.courseComponents.length > 0 && (
                  <DetailRow label="Components" value={request.courseComponents.join(', ')} />
                )}
                <DetailRow label="Session Duration" value={request.sessionDuration} />
              </DetailSection>

              {/* Section 7: Assessment */}
              {(request.successIndicators?.length > 0 || request.reportingPreferences?.length > 0) && (
                <DetailSection title="Assessment & Success Criteria" icon="📊">
                  {request.successIndicators && request.successIndicators.length > 0 && (
                    <DetailRow label="Success Indicators" value={request.successIndicators.join(', ')} />
                  )}
                  {request.reportingPreferences && request.reportingPreferences.length > 0 && (
                    <DetailRow label="Reporting Preferences" value={request.reportingPreferences.join(', ')} />
                  )}
                </DetailSection>
              )}

              {/* Section 8: Delivery */}
              <DetailSection title="Delivery & Logistics" icon="🚀">
                <DetailRow label="Start Date" value={request.preferredStartDate ? formatDate(request.preferredStartDate) : 'Flexible'} />
                <DetailRow label="Urgency" value={request.urgencyLevel?.replace('_', ' ')} />
                {request.devicePreferences && request.devicePreferences.length > 0 && (
                  <DetailRow label="Devices" value={request.devicePreferences.join(', ')} />
                )}
                <DetailRow label="Offline Materials" value={request.offlinePacketsNeeded} />
              </DetailSection>

              {/* Section 9: Budget */}
              <DetailSection title="Budget & Reusability" icon="💰">
                <DetailRow label="Budget Tier" value={request.budgetTier} />
                <DetailRow label="Course Reuse Permission" value={request.allowCourseReuse} />
              </DetailSection>

              {/* Section 10: Notes */}
              {request.additionalNotes && (
                <DetailSection title="Additional Notes" icon="📝">
                  <p className="text-gray-700 whitespace-pre-wrap">{request.additionalNotes}</p>
                </DetailSection>
              )}
            </div>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  if (!value) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
      <dt className="text-sm font-semibold text-gray-600 sm:w-1/3">{label}:</dt>
      <dd className="text-sm text-gray-900 sm:w-2/3">{value}</dd>
    </div>
  );
}
