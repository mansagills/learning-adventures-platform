'use client';

import { useState, useRef, useEffect } from 'react';
import { Adventure } from '@/lib/catalogData';
import { useInView } from '@/hooks/useInView';
import { useContentRotation } from '@/hooks/useContentRotation';
import { cn } from '@/lib/utils';
import Icon from '../Icon';
import AdventurePreviewCard from './AdventurePreviewCard';
import ViewMoreButton from './ViewMoreButton';
import { PreviewCardSkeleton } from './PreviewSkeleton';

interface SubjectPreviewSectionProps {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  adventures: Adventure[];
  isLoading?: boolean;
  enableRotation?: boolean; // Enable auto-rotation of content
}

export default function SubjectPreviewSection({
  categoryId,
  categoryName,
  categoryDescription,
  categoryIcon,
  adventures,
  isLoading = false,
  enableRotation = false
}: SubjectPreviewSectionProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for fade-in animation
  const [sectionRef, isInView] = useInView<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true
  });

  // Content rotation hook (shows different sets of adventures)
  const rotation = useContentRotation({
    totalItems: adventures.length,
    itemsPerPage: 5,
    autoRotate: enableRotation,
    rotationInterval: 8000, // 8 seconds per rotation
    pauseOnHover: true
  });

  // Get visible adventures based on rotation
  const visibleAdventures = enableRotation
    ? rotation.getVisibleItems(adventures)
    : adventures;

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Check scroll buttons on mount and when adventures change
  useEffect(() => {
    // Small delay to ensure layout has completed
    const timer = setTimeout(() => {
      checkScrollButtons();
    }, 100);

    return () => clearTimeout(timer);
  }, [visibleAdventures]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300; // Width of approximately one card plus gap
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    // Update button states after scroll animation
    setTimeout(checkScrollButtons, 300);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'math':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600'
        };
      case 'science':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600'
        };
      case 'english':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: 'text-purple-600'
        };
      case 'history':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: 'text-orange-600'
        };
      case 'interdisciplinary':
        return {
          bg: 'bg-pink-50',
          border: 'border-pink-200',
          text: 'text-pink-700',
          icon: 'text-pink-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600'
        };
    }
  };

  const colors = getCategoryColor(categoryId);

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="w-28 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <PreviewCardSkeleton count={5} />
      </div>
    );
  }

  if (!adventures || adventures.length === 0) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-lg p-8 text-center mb-12`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.bg} rounded-lg mb-4`}>
          <Icon name={categoryIcon} size={32} className={colors.icon} />
        </div>
        <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>{categoryName}</h3>
        <p className="text-gray-600 mb-4">No adventures available yet for this category.</p>
        <ViewMoreButton
          category={categoryId}
          categoryName={categoryName}
          variant="outline"
        />
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className={`mb-12 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 ${colors.bg} ${colors.border} border rounded-lg`}>
            <Icon name={categoryIcon} size={24} className={colors.icon} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink-800">{categoryName}</h2>
            <p className="text-ink-600">{categoryDescription}</p>
          </div>
        </div>
        <ViewMoreButton
          category={categoryId}
          categoryName={categoryName}
          variant="outline"
        />
      </div>

      {/* Adventure Cards Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            aria-label="Scroll left"
          >
            <Icon name="chevron-left" size={20} className="text-gray-600" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            aria-label="Scroll right"
          >
            <Icon name="chevron-right" size={20} className="text-gray-600" />
          </button>
        )}

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          onMouseEnter={enableRotation ? rotation.handleMouseEnter : undefined}
          onMouseLeave={enableRotation ? rotation.handleMouseLeave : undefined}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth smooth-scroll touch-pan-x pb-4 px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {visibleAdventures.map((adventure) => (
            <AdventurePreviewCard
              key={adventure.id}
              adventure={adventure}
              compact={true}
            />
          ))}
        </div>

        {/* Fade Gradients for Visual Polish */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      </div>

      {/* Rotation Indicators (if rotation is enabled) */}
      {enableRotation && rotation.totalPages > 1 && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          {Array.from({ length: rotation.totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => rotation.goToPage(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                rotation.currentPage === index
                  ? 'bg-brand-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-center mt-6 text-sm text-gray-500 space-x-4">
        <span>{adventures.length} adventures available</span>
        <span>•</span>
        <span>{adventures.filter(a => a.featured).length} featured</span>
        <span>•</span>
        <span>{adventures.filter(a => a.type === 'game').length} games, {adventures.filter(a => a.type === 'lesson').length} lessons</span>
      </div>
    </div>
  );
}