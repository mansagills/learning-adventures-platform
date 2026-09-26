import Container from '@/components/Container';

export default function Benefits() {
  // Planned features for the full Learning Adventures World (see
  // docs/lore/SEASON_1_ARC.md). None of these are in the demo yet.
  const benefits = [
    {
      emoji: '📖',
      title: 'A Season-Long Story',
      description:
        'Help Jaylen and SPARK uncover the mystery behind the Hush across the Math, Science, English and History wings.',
      color: 'violet' as const,
    },
    {
      emoji: '🏫',
      title: 'Games in Every Building',
      description:
        'Every subject building filled with games and challenges that tie into the story.',
      color: 'pink' as const,
    },
    {
      emoji: '📚',
      title: 'Characters From the Books',
      description:
        'Meet the heroes and villains from our interactive ebooks, right on campus.',
      color: 'mint' as const,
    },
    {
      emoji: '💾',
      title: 'Progress That Travels',
      description: 'Keep your character, XP and story progress on any device.',
      color: 'yellow' as const,
    },
    {
      emoji: '🤝',
      title: 'Explore Together',
      description: 'A shared campus where classmates can explore side by side.',
      color: 'violet' as const,
    },
    {
      emoji: '👪',
      title: 'Parent View',
      description:
        'See which skills your child is practicing and how far they have come.',
      color: 'pink' as const,
    },
  ];

  const colorClasses = {
    violet: {
      iconBg: 'bg-pg-violet',
      titleColor: 'text-pg-violet',
    },
    pink: {
      iconBg: 'bg-pg-pink',
      titleColor: 'text-coral-600',
    },
    yellow: {
      iconBg: 'bg-pg-yellow',
      titleColor: 'text-sunshine-700',
    },
    mint: {
      iconBg: 'bg-pg-mint',
      titleColor: 'text-grass-700',
    },
  };

  return (
    <section
      id="whats-coming"
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-16 h-16 bg-pg-yellow/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-pg-pink/20 rounded-full blur-xl"></div>

      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white border-2 border-pg-border rounded-full shadow-pop">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
              What&apos;s Coming
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            The Full World Is{' '}
            <span className="relative inline-block">
              <span className="text-pg-violet">On Its Way</span>
              <svg
                className="absolute -bottom-1 left-0 w-full h-3"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4C20 2 40 6 60 4C80 2 100 6 120 4C140 2 160 6 180 4C190 3 198 4 198 4"
                  stroke="#FBBF24"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="font-plus-jakarta text-xl text-foreground/70 max-w-2xl mx-auto">
            The demo is just the first step. Here&apos;s what we&apos;re
            building next. These features are in development and not in the demo
            yet.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {benefits.map((benefit, index) => {
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={benefit.title}
                className="card-sticker group p-6 hover:-rotate-1 hover:scale-[1.02] transition-all duration-200 ease-bounce relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`absolute -top-5 left-6 w-14 h-14 ${colors.iconBg} border-2 border-pg-border rounded-xl shadow-pop flex items-center justify-center text-2xl group-hover:animate-wiggle`}
                >
                  {benefit.emoji}
                </div>

                <div className="pt-8">
                  <h3
                    className={`font-outfit text-xl font-bold ${colors.titleColor} mb-3`}
                  >
                    {benefit.title}
                  </h3>
                  <p className="font-plus-jakarta text-foreground/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div
                  className={`absolute bottom-4 right-4 w-2 h-2 ${colors.iconBg} rounded-full opacity-50`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Bottom trust badge */}
        <div className="mt-16 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white border-2 border-pg-border px-6 py-3 rounded-full shadow-pop">
            <div className="w-8 h-8 bg-pg-mint rounded-full flex items-center justify-center">
              <span className="text-sm">🚧</span>
            </div>
            <span className="font-outfit font-bold text-foreground">
              In development: the demo shows where we&apos;re headed
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
