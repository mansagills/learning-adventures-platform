import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Gamepad2,
  Heart,
  Shield,
  Sparkles,
  UserX,
} from 'lucide-react';
import Container from '@/components/Container';
import BookCard from '@/components/books/BookCard';
import { cn } from '@/lib/utils';
import { games, getFeaturedGames, getGame } from '@/lib/content/games';
import { books } from '@/lib/content/books';
import { subjects } from '@/lib/content/subjects';
import GameRow from './GameRow';
import HomeFaq from './HomeFaq';

/** Subjects with enough games for a row of their own */
const ROW_MIN_GAMES = 3;

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border px-7 py-3.5 text-lg font-bold shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40';

export default function HomePage() {
  const countFor = (id: string) => games.filter((g) => g.subject === id).length;
  const rowSubjects = subjects.filter((s) => countFor(s.id) >= ROW_MIN_GAMES);
  const otherGames = games.filter((g) =>
    subjects.some((s) => s.id === g.subject && countFor(s.id) < ROW_MIN_GAMES)
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-pg-border bg-background pb-20 pt-14 md:pt-20">
        <div className="absolute inset-0 bg-dot-grid opacity-40" aria-hidden />
        <div
          className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-pg-violet/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 right-0 h-[360px] w-[360px] rounded-full bg-pg-mint/20 blur-3xl"
          aria-hidden
        />

        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink-800 shadow-pop">
                <Sparkles size={16} className="text-pg-violet" aria-hidden />
                Free learning games · Grades K–5
              </p>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-ink-900 md:text-6xl lg:text-7xl">
                Play.{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-pg-violet">Read.</span>
                  <svg
                    className="absolute -bottom-2 left-0 h-4 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 6C20 2 40 10 60 6C80 2 100 10 120 6C140 2 160 10 180 6C190 4 198 6 198 6"
                      stroke="#F472B6"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                Explore.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-ink-700 lg:mx-0">
                Colorful mini-games for math, science, reading and history, plus
                interactive ebooks that turn every game into a story. No sign-up
                needed.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/games"
                  className={cn(primaryButton, 'bg-pg-violet text-white')}
                >
                  <Gamepad2 size={22} aria-hidden /> Play a game
                </Link>
                <Link
                  href="/books"
                  className={cn(primaryButton, 'bg-white text-ink-900')}
                >
                  <BookOpen size={22} aria-hidden /> Meet the books
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="rotate-1 rounded-3xl border-2 border-pg-border bg-white p-2 shadow-pop transition-transform duration-300 hover:rotate-0">
                <Image
                  src="/images/jaylen-and-spark.png"
                  alt="Jaylen and his robot buddy SPARK, the heroes of Learning Adventures"
                  width={1376}
                  height={768}
                  className="h-auto w-full rounded-2xl"
                  priority
                />
              </div>
              <span className="absolute -left-3 -top-4 rotate-[-6deg] rounded-2xl border-2 border-pg-border bg-pg-yellow px-3 py-2 text-sm font-extrabold text-ink-900 shadow-pop md:-left-6">
                {games.length} free games
              </span>
              <span className="absolute -bottom-4 -right-2 rotate-[4deg] rounded-2xl border-2 border-pg-border bg-pg-pink px-3 py-2 text-sm font-extrabold text-white shadow-pop md:-right-5">
                📚 Stories to read
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Subject grid ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20" aria-labelledby="subjects-heading">
        <Container>
          <h2
            id="subjects-heading"
            className="text-center font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
          >
            Pick a subject
          </h2>
          <p className="mt-2 text-center text-lg text-ink-600">
            Every subject is packed with games you can play right now.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {subjects.map((subject, index) => {
              const count = countFor(subject.id);
              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.id}`}
                  className={cn(
                    'group relative flex flex-col items-center rounded-3xl border-2 border-pg-border p-5 text-center shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-pop-hover',
                    subject.theme.soft,
                    // Center the odd fifth tile on the 2-column phone layout
                    index === subjects.length - 1 && 'col-span-2 md:col-span-1'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-pg-border text-3xl transition-transform group-hover:-rotate-6 group-hover:scale-110',
                      subject.theme.solid
                    )}
                    aria-hidden
                  >
                    {subject.emoji}
                  </span>
                  <span className="mt-3 font-display text-xl font-bold text-ink-900">
                    {subject.name}
                  </span>
                  <span className="mt-1 text-sm text-ink-600">
                    {subject.tagline}
                  </span>
                  <span
                    className={cn(
                      'mt-3 rounded-full bg-white px-3 py-0.5 text-xs font-bold',
                      subject.theme.text
                    )}
                  >
                    {count === 0 ? 'Coming soon' : `${count} to play`}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Featured game rows ───────────────────────────────────────── */}
      <section
        className="border-y-2 border-pg-border bg-white py-16 md:py-20"
        aria-labelledby="games-heading"
      >
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="games-heading"
                className="font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
              >
                Jump into a game
              </h2>
              <p className="mt-2 text-lg text-ink-600">
                Quick to start, fun to replay, and every one teaches a real
                skill.
              </p>
            </div>
            <Link
              href="/games"
              className="font-bold text-brand-600 hover:text-brand-700"
            >
              Browse all {games.length} →
            </Link>
          </div>
          <div className="space-y-12">
            {rowSubjects.map((subject) => (
              <GameRow
                key={subject.id}
                title={`${subject.name} games`}
                emoji={subject.emoji}
                href={`/subjects/${subject.id}`}
                games={getFeaturedGames(subject.id, 10)}
              />
            ))}
            {otherGames.length > 0 && (
              <GameRow
                title="Reading, history and more"
                emoji="🧭"
                href="/games"
                games={otherGames}
                showSubject
              />
            )}
          </div>
        </Container>
      </section>

      {/* ── Books ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20" aria-labelledby="books-heading">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold uppercase tracking-wider text-pg-pink">
              Interactive ebooks
            </p>
            <h2
              id="books-heading"
              className="mt-2 font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
            >
              Stories behind the games
            </h2>
            <p className="mt-3 text-lg text-ink-600">
              Follow Jaylen and SPARK through the Academy in interactive ebooks
              that pick up where the games leave off. Read a story, then play
              the games that go with it.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {books.map((book) => (
              <div key={book.slug} className="flex flex-col">
                <BookCard book={book} />
                <div className="mt-4 flex flex-wrap items-center gap-2 px-1 text-sm">
                  <span className="font-semibold text-ink-500">
                    Play along:
                  </span>
                  {book.companionGameSlugs.map((slug) => {
                    const game = getGame(slug);
                    if (!game) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/games/${slug}`}
                        className="rounded-full border-2 border-pg-border bg-white px-2.5 py-0.5 font-semibold text-ink-800 hover:bg-pg-yellow"
                      >
                        {game.emoji} {game.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/books"
              className={cn(primaryButton, 'bg-pg-pink text-white')}
            >
              <BookOpen size={22} aria-hidden /> See all books
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Learning Adventures World demo teaser ───────────────────── */}
      <section className="pb-16 md:pb-20" aria-labelledby="hub-heading">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-pg-border bg-ink-900 p-8 text-white shadow-pop md:p-12">
            <div
              className="absolute inset-0 bg-dot-grid opacity-10"
              aria-hidden
            />
            <div
              className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pg-violet/40 blur-3xl"
              aria-hidden
            />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="inline-block rounded-full border-2 border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pg-yellow">
                  Early preview demo
                </p>
                <h2
                  id="hub-heading"
                  className="mt-4 font-display text-3xl font-extrabold md:text-4xl"
                >
                  Take a peek at the Learning Adventures World
                </h2>
                <p className="mt-3 max-w-2xl text-lg text-white/80">
                  We&apos;re building a pixel-art Academy campus where kids walk
                  between subject buildings, meet characters from the books and
                  play games together. Try the early demo and see where Learning
                  Adventures is headed.
                </p>
              </div>
              <Link
                href="/demo"
                className={cn(
                  primaryButton,
                  'justify-self-start bg-pg-yellow text-ink-900 md:justify-self-end'
                )}
              >
                🗺️ See the demo
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── For parents ──────────────────────────────────────────────── */}
      <section
        className="border-y-2 border-pg-border bg-brand-50 py-16 md:py-20"
        aria-labelledby="parents-heading"
      >
        <Container>
          <h2
            id="parents-heading"
            className="text-center font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
          >
            Made for kids. Easy for parents.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                title: 'Free to play',
                text: `All ${games.length} games and activities are free, with no trials or paywalls.`,
                color: 'bg-pg-pink',
              },
              {
                icon: UserX,
                title: 'No sign-up',
                text: 'No accounts, passwords or personal details. Just press play.',
                color: 'bg-pg-violet',
              },
              {
                icon: Shield,
                title: 'No chat, no ads',
                text: 'Nothing to click away to and no strangers to talk to.',
                color: 'bg-pg-mint',
              },
              {
                icon: Sparkles,
                title: 'Real skills',
                text: 'Fractions, times tables, planets, ecosystems, spelling and more for grades K–5.',
                color: 'bg-pg-yellow',
              },
            ].map(({ icon: Icon, title, text, color }) => (
              <div
                key={title}
                className="rounded-3xl border-2 border-pg-border bg-white p-6 shadow-pop"
              >
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-pg-border text-white',
                    color
                  )}
                  aria-hidden
                >
                  <Icon size={24} />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink-900">
                  {title}
                </h3>
                <p className="mt-2 text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <HomeFaq />
    </>
  );
}
