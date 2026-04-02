import Container from './Container';

export default function Benefits() {
  const benefits = [
    {
      emoji: '🌍',
      title: 'A Living Pixel World',
      description:
        'Roam an open campus that grows over time — new zones, hidden paths, and surprises always around the corner.',
      color: 'violet' as const,
    },
    {
      emoji: '⚡',
      title: 'Real XP & Rewards',
      description:
        'Earn experience points, collect coins, and unlock rare gear by completing quests and challenges.',
      color: 'pink' as const,
    },
    {
      emoji: '🎮',
      title: 'Learn Through Play',
      description:
        'Curriculum is woven directly into quests — kids level up their skills without it ever feeling like a lesson.',
      color: 'mint' as const,
    },
    {
      emoji: '🧙',
      title: 'Your Character, Your Story',
      description:
        'Create a unique hero with persistent progress. Every session continues exactly where you left off.',
      color: 'yellow' as const,
    },
    {
      emoji: '🛡️',
      title: 'Safe & Kid-Friendly',
      description:
        'A fully moderated, COPPA-compliant world built from the ground up for kids ages 5–12.',
      color: 'violet' as const,
    },
    {
      emoji: '🤝',
      title: 'A World Full of Others',
      description:
        'See other adventurers, share achievements, and feel part of a community on the same journey.',
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
      titleColor: 'text-pg-pink',
    },
    yellow: {
      iconBg: 'bg-pg-yellow',
      titleColor: 'text-pg-yellow',
    },
    mint: {
      iconBg: 'bg-pg-mint',
      titleColor: 'text-pg-mint',
    },
  };

  return (
    <section
      id="benefits"
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
              Why Kids Love It
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            More Than a Game.{' '}
            <span className="relative inline-block">
              <span className="text-pg-violet">An Adventure.</span>
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
            Everything kids love about games — quests, rewards, exploration —
            with learning built right in.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {benefits.map((benefit, index) => {
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={benefit.title}
                className="card-sticker group hover:-rotate-1 hover:scale-[1.02] transition-all duration-200 ease-bounce relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`absolute -top-5 left-6 w-14 h-14 ${colors.iconBg} border-2 border-pg-border rounded-xl shadow-pop flex items-center justify-center text-2xl group-hover:animate-wiggle`}
                >
                  {benefit.emoji}
                </div>

                <div className="pt-8">
                  <h3 className={`font-outfit text-xl font-bold ${colors.titleColor} mb-3`}>
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
              <span className="text-sm">🛡️</span>
            </div>
            <span className="font-outfit font-bold text-foreground">
              Safe, COPPA-compliant, and built for kids ages 5–12
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
