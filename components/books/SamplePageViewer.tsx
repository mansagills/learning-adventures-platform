'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SamplePageViewerProps {
  title: string;
  pages: string[];
}

/** Minimum horizontal drag (px) that counts as a swipe */
const SWIPE_THRESHOLD = 40;

/**
 * Flip through a book's free sample pages: Previous/Next buttons, dot
 * indicators, arrow keys (when the viewer has focus) and swipe on touch
 * screens.
 */
export default function SamplePageViewer({
  title,
  pages,
}: SamplePageViewerProps) {
  const [index, setIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  if (pages.length === 0) {
    return (
      <div className="flex aspect-[3/2] items-center justify-center rounded-3xl border-2 border-dashed border-ink-300 bg-white text-center">
        <p className="font-display text-xl font-bold text-ink-500">
          Sample pages coming soon
        </p>
      </div>
    );
  }

  const last = pages.length - 1;
  const go = (next: number) => setIndex(Math.min(Math.max(next, 0), last));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const delta = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (delta <= -SWIPE_THRESHOLD) go(index + 1);
    else if (delta >= SWIPE_THRESHOLD) go(index - 1);
  };

  const arrowClass = (enabled: boolean) =>
    cn(
      'inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-pg-border bg-white shadow-pop-active transition',
      enabled ? 'hover:bg-pg-yellow' : 'cursor-not-allowed opacity-40'
    );

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`Free sample of ${title}. Use the left and right arrow keys to turn pages.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragStartX.current = null)}
        className="relative aspect-[3/2] touch-pan-y select-none overflow-hidden rounded-3xl border-2 border-pg-border bg-white shadow-pop focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40"
      >
        {pages.map((src, pageIndex) => (
          <Image
            key={src}
            src={src}
            alt={`${title}, sample page ${pageIndex + 1} of ${pages.length}`}
            fill
            unoptimized
            draggable={false}
            priority={pageIndex === 0}
            aria-hidden={pageIndex !== index}
            className={cn(
              'object-contain transition-opacity duration-300',
              pageIndex === index ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          className={arrowClass(index > 0)}
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={22} aria-hidden />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {pages.map((src, dotIndex) => (
              <button
                key={src}
                type="button"
                onClick={() => go(dotIndex)}
                aria-label={`Go to page ${dotIndex + 1}`}
                aria-current={dotIndex === index ? 'true' : undefined}
                className={cn(
                  'h-3 rounded-full border-2 border-pg-border transition-all',
                  dotIndex === index ? 'w-8 bg-pg-violet' : 'w-3 bg-white'
                )}
              />
            ))}
          </div>
          <p className="text-sm font-bold text-ink-500" aria-live="polite">
            Page {index + 1} of {pages.length}
          </p>
        </div>

        <button
          type="button"
          className={arrowClass(index < last)}
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label="Next page"
        >
          <ChevronRight size={22} aria-hidden />
        </button>
      </div>
    </div>
  );
}
