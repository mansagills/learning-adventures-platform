import Link from 'next/link';
import Container from '@/components/Container';
import SiteIcon from '@/components/icons/SiteIcon';
import TechPrepGameCard from '@/components/tech-prep/TechPrepGameCard';
import {
  getFeaturedTechPrepGames,
  techPrepGames,
} from '@/lib/content/techPrepGames';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Powered by Tech Prep | Learning Adventures',
  description:
    'Deeper, more in-depth learning games built by our partners at Tech Prep.',
  path: '/tech-prep',
});

export default function TechPrepPage() {
  const featured = getFeaturedTechPrepGames();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-pg-border bg-background pb-16 pt-14 md:pt-20">
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
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink-800 shadow-pop">
              <SiteIcon name="sparkle" size={22} />
              Powered by Tech Prep
            </p>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-ink-900 md:text-6xl lg:text-7xl">
              Go{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-pg-violet">deeper.</span>
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
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-ink-700">
              Longer, richer games from our Tech Prep team, made for learners
              ready to go beyond the arcade.
            </p>
          </div>

          {/*
            TODO(UX): "About Tech Prep" slot. Add details on what Tech Prep is
            and what they specialize in, then replace the placeholder inside
            this section. The wrapper keeps the card styling and spacing.
          */}
          <div
            id="about-tech-prep"
            className="mx-auto mt-12 max-w-3xl rounded-3xl border-2 border-dashed border-pg-border bg-white/80 p-8 text-left"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
              About Tech Prep
            </p>
            <p className="mt-2 italic text-ink-500">
              Space reserved for UX: describe what Tech Prep is and what they
              specialize in (mission, team, approach and highlights).
            </p>
          </div>
        </Container>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16" aria-labelledby="featured-heading">
          <Container>
            <h2
              id="featured-heading"
              className="font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
            >
              Featured games
            </h2>
            <p className="mt-2 text-lg text-ink-600">
              Our biggest adventures from the Tech Prep team.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {featured.map((game) => (
                <TechPrepGameCard key={game.slug} game={game} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── All games ────────────────────────────────────────────────── */}
      <section
        className="bg-dot-grid pb-20 pt-4"
        aria-labelledby="all-games-heading"
      >
        <Container>
          <h2
            id="all-games-heading"
            className="font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
          >
            All Tech Prep games
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {techPrepGames.map((game) => (
              <TechPrepGameCard key={game.slug} game={game} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-lg text-ink-600">
              Want something quick? Try the arcade.
            </p>
            <Link
              href="/games"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-white px-7 py-3.5 text-lg font-bold text-ink-900 shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40"
            >
              <SiteIcon name="controller" size={30} /> Browse arcade games
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
