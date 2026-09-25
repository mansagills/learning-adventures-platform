import Link from 'next/link';
import Container from '@/components/Container';

const facts = [
  { label: 'Free to play', color: 'bg-pg-mint', text: '' },
  { label: 'No sign-up needed', color: 'bg-pg-pink', text: '' },
  { label: 'Restart any time', color: 'bg-pg-yellow', text: 'text-foreground' },
];

export default function SecondaryCta() {
  return (
    <section className="relative overflow-hidden bg-pg-violet py-24">
      <div
        className="absolute inset-0 bg-dot-grid opacity-10"
        aria-hidden
      ></div>

      {/* Decorative glows */}
      <div
        className="absolute left-10 top-10 h-32 w-32 rounded-full bg-pg-pink/30 blur-2xl"
        aria-hidden
      ></div>
      <div
        className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-pg-yellow/20 blur-2xl"
        aria-hidden
      ></div>

      {/* Floating pixel decorations */}
      <div
        className="absolute right-20 top-20 hidden h-12 w-12 rotate-12 items-center justify-center rounded-sm border-2 border-white/30 bg-pg-yellow opacity-80 lg:flex"
        aria-hidden
      >
        <span className="text-xl">🏫</span>
      </div>
      <div
        className="absolute bottom-16 left-16 hidden h-10 w-10 items-center justify-center rounded-sm border-2 border-white/30 bg-pg-mint opacity-80 lg:flex"
        aria-hidden
      >
        <span className="text-lg">🤖</span>
      </div>

      <Container>
        <div className="relative z-10 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-white px-5 py-2.5 shadow-pop">
            <span className="text-lg" aria-hidden>
              🧪
            </span>
            <span className="text-sm font-bold uppercase tracking-wide text-foreground">
              Early preview demo
            </span>
          </div>

          <h2 className="mb-6 font-outfit text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            Ready to{' '}
            <span className="relative inline-block">
              Explore?
              <svg
                className="absolute -bottom-2 left-0 h-4 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M2 6C20 2 40 10 60 6C80 2 100 10 120 6C140 2 160 10 180 6C190 4 198 6 198 6"
                  stroke="#FBBF24"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-2xl font-plus-jakarta text-xl leading-relaxed text-white/90 md:text-2xl">
            Step onto the Academy campus, say hi to Jaylen and SPARK, and see
            what the Learning Adventures World is becoming.
          </p>

          <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/demo/play"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-white px-7 py-3.5 text-lg font-bold text-pg-violet shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pg-yellow hover:text-foreground hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:w-auto"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-sm bg-pg-violet/20"
                aria-hidden
              >
                🎮
              </span>
              Play the demo
            </Link>
            <Link
              href="/games"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-lg font-bold text-white transition-all duration-200 hover:border-pg-border hover:bg-pg-yellow hover:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:w-auto"
            >
              Play the mini-games
            </Link>
          </div>

          {/* Quick facts */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-sm ${fact.color}`}
                >
                  <span className={`text-xs ${fact.text}`} aria-hidden>
                    ✓
                  </span>
                </div>
                <span className="font-plus-jakarta text-sm font-medium">
                  {fact.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
