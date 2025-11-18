/**
 * EnrollButton Component
 *
 * Handles course enrollment with eligibility checks and error handling.
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PremiumPaywallModal from './PremiumPaywallModal';

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  isEnrolled: boolean;
  isPremium: boolean;
  onEnrollmentChange?: () => void;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  courseTitle,
  isEnrolled,
  isPremium,
  onEnrollmentChange,
}: EnrollButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Premium paywall modal state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'premium_required' | 'free_limit_reached'>('premium_required');
  const [freeCoursesEnrolled, setFreeCoursesEnrolled] = useState(0);
  const [freeCourseLimit, setFreeCourseLimit] = useState(2);

  const handleEnroll = async () => {
    // Check if user is authenticated
    if (status !== 'authenticated') {
      router.push(('/login?redirect=/courses/' + courseSlug) as any);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Success - refresh the page or call callback
        if (onEnrollmentChange) {
          onEnrollmentChange();
        } else {
          router.refresh();
        }
      } else {
        // Show error message
        const errorMessage = data.error?.message || 'Failed to enroll';
        const details = data.error?.details;

        // Customize error messages based on details
        if (details?.prerequisitesMet === false) {
          const missingCourses = details.missingPrerequisites
            ?.map((c: any) => c.title)
            .join(', ');
          setError(
            `You must complete these courses first: ${missingCourses}`
          );
        } else if (details?.requiresPremium && !details?.hasPremiumAccess) {
          // Show premium paywall modal
          setPaywallReason('premium_required');
          setShowPaywall(true);
        } else if (details?.freeCourseLimit && details?.freeCoursesEnrolled >= details.freeCourseLimit) {
          // Show free course limit paywall modal
          setPaywallReason('free_limit_reached');
          setFreeCoursesEnrolled(details.freeCoursesEnrolled);
          setFreeCourseLimit(details.freeCourseLimit);
          setShowPaywall(true);
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Enrollment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to unenroll from this course? Your progress will be lost.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        if (onEnrollmentChange) {
          onEnrollmentChange();
        } else {
          router.refresh();
        }
      } else {
        setError(data.error?.message || 'Failed to unenroll');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Unenrollment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/courses/${courseSlug}/lessons/1`)}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Learning →
          </button>
          <button
            onClick={handleUnenroll}
            disabled={loading}
            className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Unenrolling...' : 'Unenroll'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div>
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Enrolling...
            </span>
          ) : (
            <>
              {status === 'authenticated'
                ? 'Enroll in Course'
                : 'Sign in to Enroll'}
              {isPremium && ' (Premium)'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-semibold mb-1">Cannot Enroll</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Premium Paywall Modal */}
      <PremiumPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        courseTitle={courseTitle}
        reason={paywallReason}
        freeCoursesEnrolled={freeCoursesEnrolled}
        freeCourseLimit={freeCourseLimit}
      />
    </>
  );
}
