import { useEffect, useState } from 'react';

interface CourseRequest {
  id: string;
  fullName: string;
  studentName: string;
  studentAge: number;
  primarySubject: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  urgencyLevel: string;
  createdAt: string;
}

interface UseCourseRequestsOptions {
  status?: string;
  autoFetch?: boolean;
}

export function useCourseRequests(options: UseCourseRequestsOptions = {}) {
  const { status, autoFetch = true } = options;

  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL('/api/course-requests', window.location.origin);
      if (status) {
        url.searchParams.set('status', status);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchRequests();
    }
  }, [status, autoFetch]);

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests,
  };
}
