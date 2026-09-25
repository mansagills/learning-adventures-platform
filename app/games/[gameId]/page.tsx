import Link from 'next/link';
import { ChevronRight, Clock, GraduationCap } from 'lucide-react';
import Container from '@/components/Container';
import GamePlayer from '@/components/play/GamePlayer';
import PlayableGameCard from '@/components/play/PlayableGameCard';
import BookCard from '@/components/books/BookCard';
import { cn } from '@/lib/utils';
import { games, getGame, getGamesBySubject } from '@/lib/content/games';
import { getBooksForGame } from '@/lib/content/books';
import { getSubject } from '@/lib/content/subjects';
import { generateMetadata as seoMetadata } from '@/lib/seo';
import ReactGamePage from './ReactGamePage';

interface GamePageProps {
  params: { gameId: string };
}

// Pre-build a page for every HTML game. Other ids (React component games
// registered in lib/gameLoader.ts) still render on demand.
export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.slug }));
}

export function generateMetadata({ params }: GamePageProps) {
  const game = getGame(params.gameId);
  if (!game) return {};
  return seoMetadata({
    title: `${game.title} | Free ${getSubject(game.subject)?.name ?? ''} Game | Learning Adventures`,
    description: `${game.description} Free to play for grades ${game.grades}.`,
    path: `/games/${game.slug}`,
  });
}

const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Challenging' };

export default function GamePage({ params }: GamePageProps) {
  const game = getGame(params.gameId);
  if (!game) return <ReactGamePage gameId={params.gameId} />;

  const subject = getSubject(game.subject);
  const [book] = getBooksForGame(game.slug);
  const moreGames = getGamesBySubject(game.subject)
    .filter((other) => other.slug !== game.slug)
    .slice(0, 4);

  return (
    <div className="pb-20">
      <Container className="pt-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm font-semibold text-ink-500"
        >
          <Link href="/games" className="hover:text-brand-600">
            Games
          </Link>
          <ChevronRight size={14} aria-hidden />
          {subject && (
            <>
              <Link
                href={`/subjects/${subject.id}`}
                className="hover:text-brand-600"
              >
                {subject.name}
              </Link>
              <ChevronRight size={14} aria-hidden />
            </>
          )}
          <span className="truncate text-ink-800" aria-current="page">
            {game.title}
          </span>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-ink-900 md:text-4xl">
            <span aria-hidden>{game.emoji} </span>
            {game.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {subject && (
              <span
                className={cn(
                  'rounded-full px-3 py-1',
                  subject.theme.soft,
                  subject.theme.text
                )}
              >
                {subject.emoji} {subject.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-ink-700 ring-1 ring-ink-200">
              <GraduationCap size={14} aria-hidden /> Grades {game.grades}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-ink-700 ring-1 ring-ink-200">
              <Clock size={14} aria-hidden /> {game.estimatedTime}
            </span>
          </div>
        </div>
      </Container>

      <Container className="mt-5">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <GamePlayer game={game} book={book} />

          <aside className="space-y-6">
            <div className="rounded-2xl border-2 border-pg-border bg-white p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">
                About this {game.kind}
              </h2>
              <p className="mt-2 text-sm text-ink-600">{game.description}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-400">
                Skills practiced
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {game.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs font-semibold text-ink-500">
                Level: {difficultyLabel[game.difficulty]}
              </p>
            </div>

            {book && (
              <div>
                <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                  Read the story
                </h2>
                <BookCard book={book} layout="horizontal" />
              </div>
            )}
          </aside>
        </div>
      </Container>

      {moreGames.length > 0 && subject && (
        <Container className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-ink-900">
              More {subject.name} games
            </h2>
            <Link
              href={`/subjects/${subject.id}`}
              className="text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              See all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {moreGames.map((other) => (
              <PlayableGameCard key={other.slug} game={other} />
            ))}
          </div>
        </Container>
      )}
    </div>
  );
}
