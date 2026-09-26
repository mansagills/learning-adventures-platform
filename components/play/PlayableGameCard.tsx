import Link from 'next/link';
import { Clock, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayableGame } from '@/lib/content/games';
import { getSubject } from '@/lib/content/subjects';
import GameArt from './GameArt';

interface PlayableGameCardProps {
  game: PlayableGame;
  /** Show the subject chip (useful on mixed-subject lists) */
  showSubject?: boolean;
  className?: string;
}

export default function PlayableGameCard({
  game,
  showSubject = false,
  className,
}: PlayableGameCardProps) {
  const subject = getSubject(game.subject);

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border-2 border-pg-border bg-white shadow-pop transition-all duration-200 ease-bounce',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40',
        className
      )}
    >
      <div className="relative">
        <GameArt game={game} className="h-36 border-b-2 border-pg-border" />
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full border-2 border-pg-border px-2.5 py-0.5 text-xs font-bold',
            game.kind === 'game'
              ? 'bg-pg-yellow text-ink-900'
              : 'bg-white text-ink-800'
          )}
        >
          {game.kind === 'game' ? 'Game' : 'Activity'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {showSubject && subject && (
          <span
            className={cn(
              'mb-2 self-start rounded-full px-2 py-0.5 text-xs font-semibold',
              subject.theme.soft,
              subject.theme.text
            )}
          >
            {subject.emoji} {subject.name}
          </span>
        )}
        <h3 className="font-display text-lg font-bold leading-snug text-ink-900 group-hover:text-brand-600">
          {game.title}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-600">
          {game.description}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-ink-500">
          <span className="inline-flex items-center gap-1">
            <GraduationCap size={14} aria-hidden />
            Grades {game.grades}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden />
            {game.estimatedTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
