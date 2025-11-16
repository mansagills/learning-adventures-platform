/**
 * Loading Skeleton Components
 *
 * Reusable skeleton loaders to prevent layout shift during loading
 */

'use client';

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Color bar */}
      <div className="h-2 bg-gray-200" />

      <div className="p-6">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>

        {/* CTA */}
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}

export function CourseCatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse" />

        {/* Course header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg">
                <div className="h-8 bg-gray-200 rounded mb-1" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          {/* Enroll button */}
          <div className="h-12 bg-gray-200 rounded" />
        </div>

        {/* Lessons section */}
        <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LessonListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}

export function DashboardWidgetSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

export function CertificateCardSkeleton() {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-6 bg-gray-100 rounded" />
        <div className="h-6 bg-gray-100 rounded" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mt-3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`h-4 bg-gray-200 rounded animate-pulse ${className}`} />;
}

export function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <div className={`h-10 bg-gray-200 rounded animate-pulse ${className}`} />;
}
