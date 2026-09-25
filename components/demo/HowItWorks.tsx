import Link from 'next/link';
import Container from '@/components/Container';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Pick Your Look',
      description:
        'Choose a name and one of six characters. The demo remembers them on this device.',
      emoji: '🧑‍🎨',
      color: 'violet' as const,
    },
    {
      number: '02',
      title: 'Explore the Campus',
      description:
        'Walk the Academy with the arrow keys or WASD (or the on-screen joystick on a phone) and find every subject building.',
      emoji: '🗺️',
      color: 'pink' as const,
    },
    {
      number: '03',
      title: 'Follow the Story',
      description:
        'Talk to Jaylen, SPARK and the students around campus, and help with the first story quests.',
      emoji: '💬',
      color: 'yellow' as const,
    },
    {
      number: '04',
      title: 'Play and Earn',
      description:
        'Play mini-games inside the buildings, earn demo XP, and spend it in the campus shop.',
      emoji: '🎮',
      color: 'mint' as const,
    },
  ];

  const colorClasses = {
    violet: {
      bg: 'bg-pg-violet',
      text: 'text-pg-violet',
      shadow: 'shadow-pop',
    },
    pink: { bg: 'bg-pg-pink', text: 'text-pg-pink', shadow: 'shadow-pop' },
    yellow: {
      bg: 'bg-pg-yellow',
      text: 'text-pg-yellow',
      shadow: 'shadow-pop',
    },
    mint: { bg: 'bg-pg-mint', text: 'text-pg-mint', shadow: 'shadow-pop' },
  };

  return (
    <section
      id="how-it-works"
      className="py-20 bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-grid opacity-10"></div>

      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white border-2 border-pg-border rounded-full shadow-pop">
            <span className="text-lg">🎮</span>
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
              How the Demo Works
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Your Quest Starts{' '}
            <span className="relative inline-block">
              <span className="text-pg-pink">Here</span>
              <svg
                className="absolute -bottom-1 left-0 w-full h-3"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4C20 2 40 6 60 4C80 2 100 6 120 4C140 2 160 6 180 4C190 3 198 4 198 4"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="font-plus-jakarta text-xl text-foreground/70 max-w-2xl mx-auto">
            Here&apos;s what you can do in the demo today. No sign-up needed.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            return (
              <div key={step.number} className="relative">
                {/* Dashed connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] z-0">
                    <svg
                      className="w-full h-4"
                      viewBox="0 0 100 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 6C15 3 25 9 40 6C55 3 65 9 80 6C90 4 100 6 100 6"
                        stroke="#E2E8F0"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="6 4"
                      />
                    </svg>
                  </div>
                )}

                {/* Step Card */}
                <div className="card-sticker group p-6 hover:-translate-y-1 transition-all duration-200 ease-bounce text-center relative">
                  <div
                    className={`w-20 h-20 ${colors.bg} border-2 border-pg-border rounded-xl ${colors.shadow} flex items-center justify-center mx-auto -mt-2 mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <span className="font-outfit text-2xl font-extrabold text-white">
                      {step.number}
                    </span>
                  </div>

                  <div className="text-4xl mb-4">{step.emoji}</div>

                  <h3
                    className={`font-outfit text-xl font-bold ${colors.text} mb-3`}
                  >
                    {step.title}
                  </h3>
                  <p className="font-plus-jakarta text-foreground/70 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="mt-20 relative z-10">
          <div className="card-sticker-featured max-w-2xl mx-auto text-center p-10">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pg-yellow border-2 border-pg-border rounded-lg shadow-pop rotate-12 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-pg-mint border-2 border-pg-border rounded-full shadow-pop flex items-center justify-center">
              <span className="text-sm">🗡️</span>
            </div>

            <h3 className="font-outfit text-3xl font-extrabold text-foreground mb-4">
              Ready to explore?
            </h3>
            <p className="font-plus-jakarta text-lg text-foreground/70 mb-8">
              The demo runs right in your browser. Progress is saved on this
              device, and you can restart any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo/play"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-pg-violet px-7 py-3.5 text-lg font-bold text-white shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-sm bg-white/20"
                  aria-hidden
                >
                  🎮
                </span>
                Play the demo
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
