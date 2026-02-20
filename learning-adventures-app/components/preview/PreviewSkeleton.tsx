'use client';

interface PreviewSkeletonProps {
  count?: number;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="w-72 h-40 bg-white rounded-lg border border-gray-200 p-4 animate-pulse flex-shrink-0">
      {/* Type Badge Skeleton */}
      <div className="absolute top-3 right-3 w-16 h-5 bg-gray-200 rounded-full"></div>

      {/* Content Skeleton */}
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {/* Title Skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-1 mb-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Bottom Info Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Difficulty Badge */}
            <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
            {/* Grade Level */}
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewCardSkeleton({
  count = 5,
  className = '',
}: PreviewSkeletonProps) {
  return (
    <div className={`flex space-x-4 overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function PreviewSectionSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Section Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Cards Skeleton */}
      <PreviewCardSkeleton count={5} />
    </div>
  );
}

export function PreviewGridSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 5 }).map((_, index) => (
        <PreviewSectionSkeleton key={index} />
      ))}
    </div>
  );
}

export default PreviewCardSkeleton;
