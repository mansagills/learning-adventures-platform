import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border px-7 py-3.5 text-lg font-bold shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40';

const facts = [
  {
    emoji: '🏫',
    value: '1 campus',
    label: 'to explore',
    color: 'text-pg-violet',
    circle: 'icon-circle-violet',
  },
  {
    emoji: '🎟️',
    value: 'Free',
    label: 'No sign-up needed',
    color: 'text-pg-pink',
    circle: 'icon-circle-pink',
  },
  {
    emoji: '💻',
    value: 'Browser',
    label: 'Nothing to install',
    color: 'text-pg-yellow',
    circle: 'icon-circle-yellow',
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pb-24 pt-16 md:pt-20">
      {/* Dot grid pattern background */}
      <div
        className="absolute inset-0 bg-dot-grid opacity-40"
        aria-hidden
      ></div>

      {/* Large decorative glow behind content */}
      <div
        className="absolute left-0 top-10 h-[500px] w-[500px] rounded-full bg-pg-violet/20 blur-3xl"
        aria-hidden
      ></div>
      <div
        className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-pg-mint/20 blur-3xl"
        aria-hidden
      ></div>

      <Container>
        <div className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-white px-5 py-2.5 shadow-pop">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-sm bg-pg-violet text-lg"
                aria-hidden
              >
                🧪
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-foreground">
                Early preview demo
              </span>
            </div>

            <h1 className="mb-6 font-outfit text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
              Explore the{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-pg-violet">
                  Learning Adventures
                </span>
                {/* Squiggle underline */}
                <svg
                  className="absolute -bottom-2 left-0 h-4 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
              World
            </h1>

            <p className="mb-10 font-plus-jakarta text-xl leading-relaxed text-foreground/80 md:text-2xl">
              Take an early look at the pixel-art Academy campus we&apos;re
              building. Walk between the subject buildings, meet Jaylen and
              SPARK, and jump into games along the way.
            </p>

            {/* CTAs */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/demo/play"
                className={`${primaryButton} bg-pg-violet text-white`}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-sm bg-white/20"
                  aria-hidden
                >
                  🎮
                </span>
                Play the demo
              </Link>
              <Link
                href="/games"
                className={`${primaryButton} bg-white text-ink-900`}
              >
                Back to the games
              </Link>
            </div>
            <p className="mt-4 text-sm font-medium text-ink-500 md:hidden">
              The demo works best on a computer or tablet. On phones, use the
              on-screen joystick.
            </p>
          </div>

          {/* Hero visual: a real screenshot of the demo */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border-2 border-pg-border bg-ink-900 shadow-pop">
              <Image
                src="/demo/campus-preview.png"
                alt="Screenshot of the Learning Adventures World demo: a pixel-art Academy campus with subject buildings and students walking around"
                width={1280}
                height={720}
                className="h-auto w-full"
                priority
              />
            </div>
            <div className="absolute -right-4 -top-6 z-20 flex h-20 w-24 rotate-12 animate-float flex-col items-center justify-center rounded-xl border-2 border-pg-border bg-pg-yellow shadow-pop">
              <span className="text-xl" aria-hidden>
                🚧
              </span>
              <span className="font-outfit text-xs font-extrabold text-foreground">
                In progress
              </span>
            </div>
          </div>
        </div>

        {/* Honest quick facts */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3 lg:mx-0">
          {facts.map((fact) => (
            <div
              key={fact.value}
              className="card-sticker group p-4 transition-transform duration-200 ease-bounce hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className={fact.circle}>
                  <span className="text-lg" aria-hidden>
                    {fact.emoji}
                  </span>
                </div>
                <div>
                  <div
                    className={`font-outfit text-2xl font-bold ${fact.color}`}
                  >
                    {fact.value}
                  </div>
                  <div className="text-sm font-medium text-foreground/70">
                    {fact.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
