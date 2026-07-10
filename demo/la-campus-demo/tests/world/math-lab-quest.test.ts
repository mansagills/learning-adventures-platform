import { describe, expect, it } from 'vitest';

import { FIRST_MATH_LAB_QUEST, MATH_EXPLORER_BADGE } from '@/lib/world/mathLabQuest';

describe('Math Lab MVP quest configuration', () => {
  it('uses Math Race Rally as the first Math Lab quest with the MVP reward', () => {
    expect(FIRST_MATH_LAB_QUEST.jobId).toBe('math-race-rally');
    expect(FIRST_MATH_LAB_QUEST.title).toBe('Math Race Rally');
    expect(FIRST_MATH_LAB_QUEST.gamePath).toBe('/games/math-race-rally.html');
    expect(FIRST_MATH_LAB_QUEST.xpReward).toBe(100);
    expect(FIRST_MATH_LAB_QUEST.minLevel).toBe(1);
    expect(FIRST_MATH_LAB_QUEST.isActive).toBe(true);
  });

  it('defines the Math Explorer achievement as the first quest badge', () => {
    expect(MATH_EXPLORER_BADGE.title).toBe('Math Explorer');
    expect(MATH_EXPLORER_BADGE.category).toBe('math');
    expect(MATH_EXPLORER_BADGE.type).toBe('completion');
  });
});
