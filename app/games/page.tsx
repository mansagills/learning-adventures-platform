import { Suspense } from 'react';
import Container from '@/components/Container';
import GameBrowser from '@/components/play/GameBrowser';
import PlayableGameCard from '@/components/play/PlayableGameCard';
import { games } from '@/lib/content/games';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Free Learning Games for Kids | Learning Adventures',
  description: `Play ${games.length} free math, science, reading and history games for grades K–5. No sign-up needed.`,
  path: '/games',
});

export default function GamesPage() {
  return (
    <div className="bg-dot-grid pb-20">
      <Container className="pt-12 pb-8">
        <p className="font-bold uppercase tracking-wider text-brand-600">
          Free to play · No sign-up
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
          Pick a game and play!
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-600">
          {games.length} mini-games and activities for grades K–5. Choose a
          subject or search for a skill you want to practice.
        </p>
      </Container>
      <Container>
        {/* GameBrowser reads the URL (?subject=), so it renders on the
            client. The fallback is the full grid, so the page's HTML still
            lists every game for first paint and search engines. */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 pt-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game) => (
                <PlayableGameCard key={game.slug} game={game} showSubject />
              ))}
            </div>
          }
        >
          <GameBrowser />
        </Suspense>
      </Container>
    </div>
  );
}
