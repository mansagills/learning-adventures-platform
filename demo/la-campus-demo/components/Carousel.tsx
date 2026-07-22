'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Icon from './Icon';

interface CarouselProps {
  children: ReactNode[];
  title?: string;
  className?: string;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  gap?: string;
}

export default function Carousel({
  children,
  title,
  className,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  gap = 'gap-4',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const totalItems = children.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView.desktop);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && autoPlay) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, autoPlay, autoPlayInterval, maxIndex]);

  // Pause on hover/focus
  const handleMouseEnter = () => {
    if (autoPlay) setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    if (autoPlay) setIsPlaying(true);
  };

  const handleFocus = () => {
    if (autoPlay) setIsPlaying(false);
  };

  const handleBlur = () => {
    if (autoPlay) setIsPlaying(true);
  };

  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      case 'Home':
        event.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        event.preventDefault();
        goToSlide(maxIndex);
        break;
    }
  };

  // Calculate transform based on current index and screen size
  const getTransform = () => {
    const percentage = (currentIndex * 100) / itemsPerView.desktop;
    return `translateX(-${percentage}%)`;
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Title */}
      {title && (
        <h3 className="font-display text-xl font-bold text-ink-900 mb-4">
          {title}
        </h3>
      )}

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Main carousel */}
        <div
          ref={carouselRef}
          className={cn(
            'flex transition-transform duration-300 ease-in-out',
            gap
          )}
          style={{
            transform: getTransform(),
            width: `${(totalItems * 100) / itemsPerView.desktop}%`,
          }}
          role="region"
          aria-label={title ? `${title} carousel` : 'Content carousel'}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `${100 / totalItems}%`,
              }}
              role="group"
              aria-label={`${index + 1} of ${totalItems}`}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalItems > itemsPerView.mobile && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous items"
              disabled={currentIndex === 0}
            >
              <Icon name="chevronLeft" size={20} className="text-ink-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next items"
              disabled={currentIndex === maxIndex}
            >
              <Icon name="chevronRight" size={20} className="text-ink-600" />
            </button>
          </>
        )}
      </div>

      {/* Dots Navigation */}
      {showDots && totalItems > itemsPerView.mobile && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                index === currentIndex
                  ? 'bg-brand-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing items {currentIndex + 1} to{' '}
        {Math.min(currentIndex + itemsPerView.desktop, totalItems)} of{' '}
        {totalItems}
      </div>
    </div>
  );
}
