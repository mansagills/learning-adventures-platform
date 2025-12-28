export function GameCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Color header */}
      <div className="h-2 bg-gray-200 animate-pulse"></div>

      <div className="p-6">
        {/* Badges row */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>

        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>

        {/* Metadata badges */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="h-3 w-12 bg-gray-200 rounded mb-1 animate-pulse"></div>
          <div className="flex gap-1">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Button */}
        <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export function GamesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
