import Container from './Container';

export default function Benefits() {
  const benefits = [
    {
      emoji: '🎯',
      title: 'Personalized Learning',
      description:
        "AI-powered adaptive content that adjusts to your child's learning pace and style.",
      color: 'violet' as const,
    },
    {
      emoji: '🎮',
      title: 'Engaging Content',
      description:
        'Interactive games and hands-on activities that make complex concepts easy to understand.',
      color: 'pink' as const,
    },
    {
      emoji: '❤️',
      title: 'Accessibility First',
      description:
        'Designed for all learners with support for different abilities and learning styles.',
      color: 'mint' as const,
    },
    {
      emoji: '📚',
      title: 'Multi-Subject Curriculum',
      description:
        'Comprehensive coverage of math, science, reading, and critical thinking skills.',
      color: 'yellow' as const,
    },
    {
      emoji: '⭐',
      title: 'Proven Results',
      description:
        'Backed by educational research and proven to improve learning outcomes.',
      color: 'violet' as const,
    },
    {
      emoji: '🚀',
      title: 'Progress Tracking',
      description:
        "Real-time insights into your child's learning journey and achievements.",
      color: 'pink' as const,
    },
  ];

  const colorClasses = {
    violet: {
      iconBg: 'bg-pg-violet',
      iconBorder: 'border-pg-violet',
      titleColor: 'text-pg-violet',
    },
    pink: {
      iconBg: 'bg-pg-pink',
      iconBorder: 'border-pg-pink',
      titleColor: 'text-pg-pink',
    },
    yellow: {
      iconBg: 'bg-pg-yellow',
      iconBorder: 'border-pg-yellow',
      titleColor: 'text-pg-yellow',
    },
    mint: {
      iconBg: 'bg-pg-mint',
      iconBorder: 'border-pg-mint',
      titleColor: 'text-pg-mint',
    },
  };

  return (
    <section
      id="benefits"
      className="py-20 bg-background relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-20"></div>

      {/* Decorative floating shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-pg-yellow/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-pg-pink/20 rounded-full blur-xl"></div>

      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white border-2 border-pg-border rounded-full shadow-pop">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
              Why Choose Us
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Why Parents Choose{' '}
            <span className="relative inline-block">
              <span className="text-pg-violet">Learning Adventures</span>
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
            Our platform combines cutting-edge educational technology with
            proven teaching methods.
          </p>
        </div>

        {/* Benefits Grid - Sticker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {benefits.map((benefit, index) => {
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={benefit.title}
                className="card-sticker group hover:-rotate-1 hover:scale-[1.02] transition-all duration-200 ease-bounce relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Floating Icon Badge - Half in/half out of top */}
                <div
                  className={`absolute -top-5 left-6 w-14 h-14 ${colors.iconBg} border-2 border-pg-border rounded-xl shadow-pop flex items-center justify-center text-2xl group-hover:animate-wiggle`}
                >
                  {benefit.emoji}
                </div>

                {/* Card Content */}
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

                {/* Decorative corner accent */}
                <div
                  className={`absolute bottom-4 right-4 w-2 h-2 ${colors.iconBg} rounded-full opacity-50`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white border-2 border-pg-border px-6 py-3 rounded-full shadow-pop">
            <div className="w-8 h-8 bg-pg-mint rounded-full flex items-center justify-center">
              <span className="text-sm">🛡️</span>
            </div>
            <span className="font-outfit font-bold text-foreground">
              Trusted by 50,000+ families worldwide
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
