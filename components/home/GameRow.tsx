'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayableGame } from '@/lib/content/games';
import PlayableGameCard from '@/components/play/PlayableGameCard';

interface GameRowProps {
  title: string;
  emoji?: string;
  /** "See all" link target */
  href: string;
  games: PlayableGame[];
  showSubject?: boolean;
}

/**
 * A horizontally scrolling row of game cards (swipe on touch screens,
 * arrow buttons on larger screens), in the spirit of the original homepage's
 * subject preview rows.
 */
export default function GameRow({
  title,
  emoji,
  href,
  games,
  showSubject = false,
}: GameRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const arrowClass = (enabled: boolean) =>
    cn(
      'hidden h-10 w-10 items-center justify-center rounded-full border-2 border-pg-border bg-white shadow-pop-active transition md:inline-flex',
      enabled ? 'hover:bg-pg-yellow' : 'cursor-not-allowed opacity-40'
    );

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h3 className="font-display text-2xl font-bold text-ink-900">
          {emoji && <span aria-hidden>{emoji} </span>}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <Link
            href={href}
            className="mr-2 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            See all →
          </Link>
          <button
            type="button"
            className={arrowClass(canScroll.left)}
            onClick={() => scrollBy(-1)}
            disabled={!canScroll.left}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            className={arrowClass(canScroll.right)}
            onClick={() => scrollBy(1)}
            disabled={!canScroll.right}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>

      {/* Negative margin + padding lets card shadows show and cards bleed to the edge on phones */}
      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {games.map((game) => (
          <PlayableGameCard
            key={game.slug}
            game={game}
            showSubject={showSubject}
            className="w-64 shrink-0 snap-start sm:w-72"
          />
        ))}
      </div>
    </section>
  );
}
