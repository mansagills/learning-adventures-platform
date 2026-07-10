export const FIRST_MATH_LAB_QUEST = {
  jobId: 'math-race-rally',
  title: 'Math Race Rally',
  description:
    'Professor Ivy sends you to Professor Numbers, then you race through math challenges in the Math Lab.',
  type: 'MINI_GAME' as const,
  iconEmoji: '🏁',
  currencyReward: 25,
  xpReward: 100,
  cooldownHours: 24,
  isActive: true,
  minLevel: 1,
  gamePath: '/games/math-race-rally.html',
};

export const MATH_EXPLORER_BADGE = {
  type: 'completion',
  title: 'Math Explorer',
  description: 'Completed your first Math Lab quest!',
  category: 'math',
};
