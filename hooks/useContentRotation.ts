'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseContentRotationOptions {
  totalItems: number;
  itemsPerPage: number;
  autoRotate?: boolean;
  rotationInterval?: number; // in milliseconds
  pauseOnHover?: boolean;
}

export function useContentRotation({
  totalItems,
  itemsPerPage,
  autoRotate = true,
  rotationInterval = 5000,
  pauseOnHover = true,
}: UseContentRotationOptions) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || totalPages <= 1) return;
    if (isPaused) return;
    if (pauseOnHover && isHovered) return;

    const interval = setInterval(() => {
      nextPage();
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [
    autoRotate,
    isPaused,
    isHovered,
    pauseOnHover,
    rotationInterval,
    nextPage,
    totalPages,
  ]);

  // Calculate visible items
  const getVisibleItems = useCallback(
    (items: any[]) => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, items.length);
      return items.slice(startIndex, endIndex);
    },
    [currentPage, itemsPerPage]
  );

  return {
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    pause,
    resume,
    isPaused,
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    getVisibleItems,
  };
}
