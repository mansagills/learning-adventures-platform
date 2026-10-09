import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { PARTY_PROBLEMS, STATIONS, TIERS, fstr, makeProblem, partName, partyProblem, postCount, postMistake, rightChoice, type Problem } from '../src/games/pizza-fraction-frenzy/problems';

const SEEDS = 400;
const val = (s: string) => {
  const [n, d] = s.split('/').map(Number);
  return n / d;
};

/** What the right answer must be, worked out again from the problem's own numbers. */
function expected(p: Problem): string {
  switch (p.kind) {
    case 'fair':
      return 'fair';
    case 'name-cut':
      return partName(p.d);
    case 'eaten':
      return `${p.a}/${p.d}`;
    case 'left':
      return `${p.d - p.a}/${p.d}`;
    case 'share':
      return `1/${p.d}`;
    case 'whole':
      return `${p.d}/${p.d}`;
    case 'build':
      return String(p.d);
    case 'unit-count':
      return String(p.n);
    case 'place':
      return `post-${p.target.n}`;
    case 'name':
      return fstr(p.target);
  }
}

describe('every job, every level', () => {
  for (const station of STATIONS)
    for (const tier of TIERS)
      it(`${station} level ${tier}: one right answer, distinct choices, every wrong one tagged with its mistake`, () => {
        const kinds = new Set<string>();
        for (let s = 1; s <= SEEDS; s++) {
          const p = makeProblem(station, tier, mulberry32(s * 7919 + tier));
          kinds.add(p.kind);
          expect(p.tier).toBe(tier);
          expect(p.choices.filter((c) => c.correct)).toHaveLength(1);
          expect(new Set(p.choices.map((c) => c.value)).size).toBe(p.choices.length);
          expect(new Set(p.choices.map((c) => c.label)).size).toBe(p.choices.length);
          expect(p.choices.length).toBeGreaterThanOrEqual(3);
          for (const c of p.choices) if (!c.correct) expect(c.misconception).toBeTruthy();
          expect(rightChoice(p).value).toBe(expected(p));
        }
        expect(kinds.size).toBeGreaterThanOrEqual(2);
      });
});

describe('the bakery', () => {
  it('level 1: the fair loaf has equal pieces; the unfair one has the same count but not the same sizes', () => {
    for (let s = 1; s <= SEEDS; s++) {
      const p = makeProblem('bakery', 1, mulberry32(s));
      if (p.kind !== 'fair') continue;
      const fair = p.choices.find((c) => c.correct)!.loaf!;
      expect(fair.sizes).toHaveLength(p.d);
      expect(new Set(fair.sizes).size).toBe(1);
      const unfair = p.choices.find((c) => c.misconception === 'unequal-parts')!.loaf!;
      expect(unfair.sizes).toHaveLength(p.d);
      expect(new Set(unfair.sizes).size).toBeGreaterThan(1);
      const count = p.choices.find((c) => c.misconception === 'wrong-count')!.loaf!;
      expect(count.sizes.length).not.toBe(p.d);
    }
  });

  it('level 2: the picture matches the story (pieces gone = pieces eaten), and the part-over-part trap is eaten over left', () => {
    for (let s = 1; s <= SEEDS; s++) {
      const p = makeProblem('bakery', 2, mulberry32(s));
      if (p.kind !== 'eaten' && p.kind !== 'left') continue;
      expect(p.loaf.gone).toHaveLength(p.a);
      expect(p.a).toBeGreaterThan(0);
      expect(p.a).toBeLessThan(p.d);
      const pop = p.choices.find((c) => c.misconception === 'part-over-part');
      if (pop) {
        const [, den] = pop.value.split('/').map(Number);
        expect(den).toBe(p.kind === 'eaten' ? p.d - p.a : p.a);
      }
    }
  });

  it('the ten Fraction Pizza Party problems are all answered correctly', () => {
    PARTY_PROBLEMS.forEach((q, i) => {
      const p = partyProblem(i, mulberry32(i + 1));
      expect(rightChoice(p).value).toBe(q.answer);
      expect(p.choices.filter((c) => c.correct)).toHaveLength(1);
      for (const c of p.choices) if (!c.correct) expect(c.misconception).toBeTruthy();
      // check the answer key itself: eaten / left / share / whole from the story's numbers
      const want = q.ask === 'eaten' ? q.eaten / q.d : q.ask === 'left' ? (q.d - q.eaten) / q.d : q.ask === 'share' ? 1 / q.d : 1;
      expect(val(q.answer)).toBeCloseTo(want, 10);
    });
  });

  it('names the parts', () => {
    expect(partName(2)).toBe('halves');
    expect(partName(4, false)).toBe('fourth');
    expect(partName(8)).toBe('eighths');
  });
});

describe('the milestone road', () => {
  it('has one post at each end of every stretch', () => {
    expect(postCount({ d: 4, end: 1 })).toBe(5);
    expect(postCount({ d: 3, end: 2 })).toBe(7);
  });

  it('level 3 goes past milestone 1 (or asks for the whole at milestone 1)', () => {
    for (let s = 1; s <= SEEDS; s++) {
      const p = makeProblem('road', 3, mulberry32(s));
      if (p.kind !== 'place' && p.kind !== 'name') throw new Error('not a road problem');
      expect(p.road.end).toBe(2);
      expect(p.target.n).toBeGreaterThanOrEqual(p.target.d);
      expect(p.target.n).toBeLessThan(2 * p.target.d);
    }
  });

  it('every post on the road is a choice when placing the marker, and the right post is n stretches from 0', () => {
    for (let s = 1; s <= SEEDS; s++) {
      for (const tier of TIERS) {
        const p = makeProblem('road', tier, mulberry32(s * 31 + tier));
        if (p.kind !== 'place') continue;
        expect(p.choices).toHaveLength(postCount(p.road));
        expect(val(fstr(p.target))).toBeCloseTo(p.target.n / p.road.d, 10);
      }
    }
  });

  it('diagnoses the classic road mistakes', () => {
    const road = { d: 4, end: 1 as const };
    expect(postMistake({ n: 3, d: 4 }, road, 2)).toBe('start-at-one');
    expect(postMistake({ n: 3, d: 4 }, road, 4)).toBe('off-by-one');
    expect(postMistake({ n: 1, d: 4 }, road, 3)).toBe('from-end');
    const long = { d: 4, end: 2 as const };
    expect(postMistake({ n: 4, d: 4 }, long, 8)).toBe('whole-at-end');
    expect(postMistake({ n: 5, d: 4 }, long, 1)).toBe('past-one-only');
  });

  it('naming a marker past 1 offers the "whole road" trap (5/8 for 5/4)', () => {
    let seen = 0;
    for (let s = 1; s <= SEEDS; s++) {
      const p = makeProblem('road', 3, mulberry32(s));
      if (p.kind !== 'name') continue;
      const trap = p.choices.find((c) => c.misconception === 'whole-road');
      if (trap) {
        seen++;
        expect(trap.value).toBe(`${p.target.n}/${2 * p.target.d}`);
      }
      expect(p.road.marker).toBe(p.target.n);
    }
    expect(seen).toBeGreaterThan(20);
  });
});
