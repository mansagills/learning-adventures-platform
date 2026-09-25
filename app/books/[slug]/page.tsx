import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Container from '@/components/Container';
import BookCard from '@/components/books/BookCard';
import BookCover from '@/components/books/BookCover';
import GetEbookButton from '@/components/books/GetEbookButton';
import SamplePageViewer from '@/components/books/SamplePageViewer';
import PlayableGameCard from '@/components/play/PlayableGameCard';
import { cn } from '@/lib/utils';
import { books, getBook } from '@/lib/content/books';
import { getGame, type PlayableGame } from '@/lib/content/games';
import { getSubject } from '@/lib/content/subjects';
import { generateMetadata as seoMetadata } from '@/lib/seo';

interface BookPageProps {
  params: { slug: string };
}

// Pre-build one page per book; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export function generateMetadata({ params }: BookPageProps) {
  const book = getBook(params.slug);
  if (!book) return {};
  return seoMetadata({
    title: `${book.title} | Interactive Ebook | Learning Adventures`,
    description: `${book.hook} A ${book.series} interactive ebook for ${book.ageRange.toLowerCase()}. Read a free sample.`,
    path: `/books/${book.slug}`,
  });
}

export default function BookPage({ params }: BookPageProps) {
  const book = getBook(params.slug);
  if (!book) notFound();

  const subject = getSubject(book.subject);
  const companionGames = book.companionGameSlugs
    .map(getGame)
    .filter((game): game is PlayableGame => Boolean(game));
  const otherBooks = books.filter((other) => other.slug !== book.slug);

  return (
    <div className="pb-20">
      <section
        className={cn('border-b-2 border-pg-border', subject?.theme.soft)}
      >
        <Container className="py-8 md:py-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm font-semibold text-ink-500"
          >
            <Link href="/books" className="hover:text-brand-600">
              Books
            </Link>
            <ChevronRight size={14} aria-hidden />
            <span className="truncate text-ink-800" aria-current="page">
              {book.title}
            </span>
          </nav>

          <div className="mt-6 grid items-center gap-10 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr]">
            <BookCover
              book={book}
              sizes="300px"
              className="mx-auto w-56 -rotate-2 shadow-pop md:w-full"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-ink-500">
                {book.series}
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight text-ink-900 md:text-5xl">
                {book.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border-2 border-pg-border bg-pg-yellow px-3 py-1 text-ink-900">
                  {book.status === 'available'
                    ? 'Interactive ebook'
                    : 'Coming soon'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-ink-700 ring-1 ring-ink-200">
                  {book.ageRange}
                </span>
                {subject && (
                  <span
                    className={cn(
                      'rounded-full bg-white px-3 py-1',
                      subject.theme.text
                    )}
                  >
                    {subject.emoji} {subject.name}
                  </span>
                )}
              </div>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-700">
                {book.synopsis}
              </p>
              <p className="mt-4 text-sm text-ink-600">
                <span className="font-bold text-ink-800">Characters: </span>
                {book.characters.join(', ')}
              </p>
              <div className="mt-6">
                <GetEbookButton book={book} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pt-12">
        <section aria-labelledby="free-sample" className="mx-auto max-w-4xl">
          <h2
            id="free-sample"
            className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
          >
            Read a free sample
          </h2>
          <p className="mb-6 mt-1 text-ink-600">
            Flip through the first pages. Swipe, tap the arrows, or use your
            keyboard&apos;s arrow keys.
          </p>
          <SamplePageViewer title={book.title} pages={book.samplePages} />
        </section>

        {companionGames.length > 0 && (
          <section className="mt-16" aria-labelledby="companion-games">
            <h2
              id="companion-games"
              className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
            >
              Play the games from this story
            </h2>
            <p className="mt-1 text-ink-600">
              Free to play, no sign-up needed.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companionGames.map((game) => (
                <PlayableGameCard key={game.slug} game={game} />
              ))}
            </div>
          </section>
        )}

        {otherBooks.length > 0 && (
          <section className="mt-16" aria-labelledby="more-books">
            <h2
              id="more-books"
              className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
            >
              More interactive ebooks
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {otherBooks.map((other) => (
                <BookCard key={other.slug} book={other} layout="horizontal" />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
