'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { games } from '@/lib/content/games';
import { subjects, type SubjectId } from '@/lib/content/subjects';
import PlayableGameCard from './PlayableGameCard';

type SubjectFilter = SubjectId | 'all';

const counts = subjects.reduce<Record<string, number>>((acc, subject) => {
  acc[subject.id] = games.filter((game) => game.subject === subject.id).length;
  return acc;
}, {});

function matchesSearch(text: string, query: string) {
  return text.toLowerCase().includes(query);
}

/**
 * Filterable grid of every playable game. The selected subject is kept in the
 * URL (?subject=math) so filtered views can be shared and bookmarked.
 */
export default function GameBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subjectParam = searchParams.get('subject');
  const subjectFilter: SubjectFilter =
    subjectParam && counts[subjectParam] ? (subjectParam as SubjectId) : 'all';
  const [query, setQuery] = useState('');

  const setSubject = (subject: SubjectFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subject === 'all') params.delete('subject');
    else params.set('subject', subject);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visibleGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter(
      (game) =>
        (subjectFilter === 'all' || game.subject === subjectFilter) &&
        (!q ||
          matchesSearch(game.title, q) ||
          matchesSearch(game.description, q) ||
          game.skills.some((skill) => matchesSearch(skill, q)))
    );
  }, [subjectFilter, query]);

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-full border-2 border-pg-border px-4 py-1.5 text-sm font-bold transition-all duration-200',
      active
        ? 'bg-pg-violet text-white shadow-pop'
        : 'bg-white text-ink-700 hover:bg-brand-50'
    );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by subject"
        >
          <button
            type="button"
            className={chipClass(subjectFilter === 'all')}
            aria-pressed={subjectFilter === 'all'}
            onClick={() => setSubject('all')}
          >
            All <span>{games.length}</span>
          </button>
          {subjects.map((subject) => {
            const count = counts[subject.id];
            const active = subjectFilter === subject.id;
            return (
              <button
                key={subject.id}
                type="button"
                className={cn(
                  chipClass(active),
                  count === 0 && 'cursor-not-allowed opacity-50 hover:bg-white'
                )}
                aria-pressed={active}
                disabled={count === 0}
                onClick={() => setSubject(subject.id)}
                title={count === 0 ? 'Coming soon' : undefined}
              >
                <span aria-hidden>{subject.emoji}</span>
                {subject.name}
                <span>{count === 0 ? 'soon' : count}</span>
              </button>
            );
          })}
        </div>

        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search games</span>
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games or skills…"
            className="w-full rounded-full border-2 border-pg-border bg-white py-2 pl-10 pr-4 text-sm font-medium placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-pg-violet/30"
          />
        </label>
      </div>

      <p className="mb-4 text-sm font-medium text-ink-500" aria-live="polite">
        Showing {visibleGames.length} of {games.length}
      </p>

      {visibleGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleGames.map((game) => (
            <PlayableGameCard
              key={game.slug}
              game={game}
              showSubject={subjectFilter === 'all'}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden>
            🔍
          </p>
          <p className="mt-3 font-display text-xl font-bold text-ink-900">
            No games match &ldquo;{query}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSubject('all');
            }}
            className="mt-4 inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
          >
            <X size={16} aria-hidden /> Clear search
          </button>
        </div>
      )}
    </div>
  );
}
