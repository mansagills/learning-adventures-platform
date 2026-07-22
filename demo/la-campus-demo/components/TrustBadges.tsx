export default function TrustBadges() {
  const badges = [
    { emoji: '🛡️', text: 'COPPA Compliant', color: 'violet' as const },
    { emoji: '📚', text: 'Curriculum Aligned', color: 'pink' as const },
    { emoji: '❤️', text: 'Parent Approved', color: 'mint' as const },
  ];

  const colorClasses = {
    violet: 'bg-pg-violet/10 border-pg-violet/30 text-pg-violet',
    pink: 'bg-pg-pink/10 border-pg-pink/30 text-pg-pink',
    mint: 'bg-pg-mint/10 border-pg-mint/30 text-pg-mint',
    yellow: 'bg-pg-yellow/10 border-pg-yellow/30 text-pg-yellow',
  };

  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
      {badges.map((badge) => (
        <div
          key={badge.text}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-plus-jakarta text-sm font-semibold ${colorClasses[badge.color]}`}
        >
          <span>{badge.emoji}</span>
          <span>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
