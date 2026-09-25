'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Maximize2, Minimize2, PartyPopper, X } from 'lucide-react';
import type { PlayableGame } from '@/lib/content/games';
import type { Book } from '@/lib/content/books';

interface GamePlayerProps {
  game: PlayableGame;
  /** A companion ebook to suggest when the game is finished */
  book?: Book;
}

/**
 * Plays a self-contained HTML game in a same-origin iframe.
 *
 * Some games announce when they're finished with
 * `window.parent.postMessage({ type: 'game-complete', score })`; when that
 * happens we show a small celebration banner with next steps.
 */
export default function GamePlayer({ game, book }: GamePlayerProps) {
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [finished, setFinished] = useState<{ score?: number } | null>(null);

  // Track fullscreen changes (including the user pressing Escape)
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === frameWrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Listen for the game's completion message
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; score?: unknown } | null;
      if (data?.type !== 'game-complete') return;
      setFinished({
        score: typeof data.score === 'number' ? data.score : undefined,
      });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const toggleFullscreen = async () => {
    const el = frameWrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      // Fullscreen can be blocked (e.g. iOS Safari); the game still plays inline.
    }
  };

  return (
    <div>
      <div
        ref={frameWrapRef}
        className="relative overflow-hidden rounded-2xl border-2 border-pg-border bg-ink-900 shadow-pop"
      >
        <div
          className={
            isFullscreen
              ? 'relative h-screen w-full'
              : 'relative h-[75vh] min-h-[480px] w-full md:h-auto md:min-h-0 md:aspect-[16/10]'
          }
        >
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-50 text-ink-700">
              <span className="animate-bounce text-5xl" aria-hidden>
                {game.emoji}
              </span>
              <p className="font-bold">Loading {game.title}…</p>
            </div>
          )}
          <iframe
            src={game.htmlPath}
            title={`${game.title} game`}
            className="absolute inset-0 h-full w-full border-0 bg-white"
            onLoad={() => setLoaded(true)}
            allow="autoplay; fullscreen"
          />
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border-2 border-pg-border bg-white/95 px-3 py-1.5 text-sm font-bold text-ink-800 shadow-pop-active hover:bg-pg-yellow"
          aria-label={isFullscreen ? 'Exit full screen' : 'Play full screen'}
        >
          {isFullscreen ? (
            <Minimize2 size={16} aria-hidden />
          ) : (
            <Maximize2 size={16} aria-hidden />
          )}
          <span className="hidden sm:inline">
            {isFullscreen ? 'Exit full screen' : 'Full screen'}
          </span>
        </button>
      </div>

      {finished && (
        <div
          className="mt-4 flex flex-col gap-3 rounded-2xl border-2 border-pg-border bg-pg-mint/20 p-4 sm:flex-row sm:items-center"
          role="status"
        >
          <PartyPopper
            className="shrink-0 text-grass-600"
            size={28}
            aria-hidden
          />
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-ink-900">
              Nice work!
              {finished.score !== undefined && ` You scored ${finished.score}.`}
            </p>
            <p className="text-sm text-ink-600">
              {book
                ? `Want to find out what happens next? Read "${book.title}".`
                : 'Ready for another challenge?'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {book && (
              <Link
                href={`/books/${book.slug}`}
                className="rounded-full border-2 border-pg-border bg-pg-violet px-4 py-1.5 text-sm font-bold text-white"
              >
                Read the story
              </Link>
            )}
            <Link
              href={`/subjects/${game.subject}`}
              className="rounded-full border-2 border-pg-border bg-white px-4 py-1.5 text-sm font-bold text-ink-800"
            >
              More games
            </Link>
            <button
              type="button"
              onClick={() => setFinished(null)}
              className="rounded-full p-1.5 text-ink-500 hover:bg-white"
              aria-label="Dismiss"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
