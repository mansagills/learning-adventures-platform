import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PlayableGame } from '@/lib/content/games';

interface GameArtProps {
  game: PlayableGame;
  className?: string;
}

/**
 * Card picture for a game: a screenshot of the game itself, lined up to the
 * top so the game's title stays in view. It zooms in a little when the card
 * (a `group`) is hovered.
 */
export default function GameArt({ game, className }: GameArtProps) {
  return (
    <div className={cn('relative overflow-hidden bg-ink-100', className)}>
      <Image
        src={game.thumbnail}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top transition-transform duration-300 ease-bounce group-hover:scale-105"
      />
    </div>
  );
}
