import Link from 'next/link';
import Container from '@/components/Container';

export const metadata = {
  title: 'Page not found | Learning Adventures',
};

export default function NotFound() {
  return (
    <Container size="sm" className="py-20 text-center md:py-28">
      <p className="text-6xl" aria-hidden>
        🧭
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
        This path leads nowhere
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-ink-600">
        We couldn&apos;t find that page. It may have moved, or the link might
        have a typo.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href="/games"
          className="inline-flex items-center justify-center rounded-full border-2 border-pg-border bg-pg-violet px-7 py-3 font-bold text-white shadow-pop transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover"
        >
          🎮 Play a game
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border-2 border-pg-border bg-white px-7 py-3 font-bold text-ink-900 hover:bg-pg-yellow"
        >
          Go to the homepage
        </Link>
      </div>
    </Container>
  );
}
