import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PlayableGame } from '@/lib/content/games';
import { getSubject } from '@/lib/content/subjects';

interface GameArtProps {
  game: PlayableGame;
  className?: string;
  /** Emoji size class, e.g. "text-5xl" */
  emojiClassName?: string;
}

/**
 * Artwork tile for a game: its thumbnail when one exists, otherwise a
 * subject-colored panel with the game's emoji on a dotted background.
 */
export default function GameArt({
  game,
  className,
  emojiClassName = 'text-5xl',
}: GameArtProps) {
  const subject = getSubject(game.subject);

  if (game.thumbnail) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={game.thumbnail}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-dot-grid',
        subject?.theme.soft,
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          'absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-60',
          subject?.theme.solid
        )}
      />
      <span
        className={cn(
          'absolute -bottom-4 -left-4 h-12 w-12 rotate-12 rounded-lg opacity-40',
          subject?.theme.solid
        )}
      />
      <span
        className={cn(
          'relative drop-shadow-sm transition-transform duration-300 ease-bounce group-hover:scale-110 group-hover:-rotate-6',
          emojiClassName
        )}
      >
        {game.emoji}
      </span>
    </div>
  );
}
