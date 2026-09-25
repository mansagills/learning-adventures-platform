import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Container from '@/components/Container';
import PlayableGameCard from '@/components/play/PlayableGameCard';
import BookCard from '@/components/books/BookCard';
import { cn } from '@/lib/utils';
import { getGamesBySubject } from '@/lib/content/games';
import { getBooksBySubject } from '@/lib/content/books';
import { getSubject, subjects } from '@/lib/content/subjects';
import { generateMetadata as seoMetadata } from '@/lib/seo';

interface SubjectPageProps {
  params: { subject: string };
}

// Pre-build one page per subject; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return subjects.map((subject) => ({ subject: subject.id }));
}

export function generateMetadata({ params }: SubjectPageProps) {
  const subject = getSubject(params.subject);
  if (!subject) return {};
  return seoMetadata({
    title: `${subject.name} Games for Kids | Learning Adventures`,
    description: `${subject.description} Free to play, grades K–5.`,
    path: `/subjects/${subject.id}`,
  });
}

export default function SubjectPage({ params }: SubjectPageProps) {
  const subject = getSubject(params.subject);
  if (!subject) notFound();

  const subjectGames = getGamesBySubject(subject.id);
  const subjectBooks = getBooksBySubject(subject.id);
  const gameCount = subjectGames.filter((g) => g.kind === 'game').length;
  const activityCount = subjectGames.length - gameCount;

  return (
    <div className="pb-20">
      {/* Themed header */}
      <section
        className={cn(
          'border-b-2 border-pg-border bg-dot-grid',
          subject.theme.soft
        )}
      >
        <Container className="py-10 md:py-14">
          <Link
            href="/games"
            className="inline-flex items-center gap-1 text-sm font-bold text-ink-600 hover:text-brand-600"
          >
            <ArrowLeft size={16} aria-hidden /> All games
          </Link>
          <div className="mt-4 flex items-center gap-5">
            <span
              className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-2 border-pg-border text-4xl shadow-pop',
                subject.theme.solid
              )}
              aria-hidden
            >
              {subject.emoji}
            </span>
            <div>
              <h1 className="font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
                {subject.name}
              </h1>
              <p
                className={cn('mt-1 text-lg font-semibold', subject.theme.text)}
              >
                {subject.tagline}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-lg text-ink-700">
            {subject.description}
          </p>
          {subjectGames.length > 0 && (
            <p className="mt-3 text-sm font-bold text-ink-600">
              {[
                gameCount > 0 &&
                  `${gameCount} game${gameCount === 1 ? '' : 's'}`,
                activityCount > 0 &&
                  `${activityCount} activit${activityCount === 1 ? 'y' : 'ies'}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </Container>
      </section>

      <Container className="pt-10">
        {subjectGames.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjectGames.map((game) => (
              <PlayableGameCard key={game.slug} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-ink-300 bg-white px-6 py-16 text-center">
            <p className="text-5xl" aria-hidden>
              🛠️
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink-900">
              {subject.name} games are on the way
            </h2>
            <p className="mx-auto mt-2 max-w-md text-ink-600">
              We&apos;re building new adventures for this subject. In the
              meantime, try one of our other games!
            </p>
            <Link
              href="/games"
              className="mt-6 inline-flex rounded-full border-2 border-pg-border bg-pg-violet px-6 py-2.5 font-bold text-white shadow-pop transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover"
            >
              Browse all games
            </Link>
          </div>
        )}

        {subjectBooks.length > 0 && (
          <section className="mt-16" aria-labelledby="subject-books">
            <h2
              id="subject-books"
              className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
            >
              Read the story
            </h2>
            <p className="mt-1 text-ink-600">
              Interactive ebooks that continue the adventure from these games.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subjectBooks.map((book) => (
                <BookCard key={book.slug} book={book} layout="horizontal" />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
