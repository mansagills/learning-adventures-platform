import { describe, expect, it } from 'vitest';
import { BOOTHS, diagnoseBuild, makeProblem, tenFrame, type Problem } from '../src/games/counting-carnival/problems';

const SEEDS = Array.from({ length: 500 }, (_, i) => i * 104729 + 7);
const all = (booth: (typeof BOOTHS)[number], tier: number): Problem[] => SEEDS.map((s) => makeProblem(booth, tier, s));

describe('Counting Carnival challenges', () => {
  it('every multiple-choice challenge has exactly one right answer among distinct options', () => {
    for (const booth of BOOTHS)
      for (const tier of [1, 2, 3])
        for (const p of all(booth, tier)) {
          if (p.booth === 'tickets' && p.mode === 'build') {
            expect(p.options).toHaveLength(0);
            continue;
          }
          expect(p.options.filter((o) => o.correct)).toHaveLength(1);
          const values = p.options.map((o) => o.value);
          expect(new Set(values).size).toBe(values.length);
          for (const o of p.options) {
            expect(o.value).toBeGreaterThanOrEqual(0);
            if (!o.correct) expect(o.misconception).toBeTruthy();
          }
          expect(p.prompt.length).toBeGreaterThan(10);
        }
  });

  it('is reproducible from its seed', () => {
    expect(makeProblem('snacks', 2, 99)).toEqual(makeProblem('snacks', 2, 99));
  });

  it('Duck Pond counts 2-5, then 6-10, then 11-20, and the right option is the count', () => {
    const ranges: Record<number, [number, number]> = { 1: [2, 5], 2: [6, 10], 3: [11, 20] };
    for (const tier of [1, 2, 3])
      for (const p of all('ducks', tier)) {
        if (p.booth !== 'ducks') throw new Error();
        expect(p.count).toBeGreaterThanOrEqual(ranges[tier][0]);
        expect(p.count).toBeLessThanOrEqual(ranges[tier][1]);
        expect(p.options.find((o) => o.correct)!.value).toBe(p.count);
      }
  });

  it('Ring Toss: quick looks within 10, and "make ten" answers always add up to 10', () => {
    for (const p of all('rings', 1)) if (p.booth === 'rings') expect(p.count).toBeLessThanOrEqual(5);
    for (const p of all('rings', 2)) if (p.booth === 'rings') expect(p.flash).toBe(true);
    for (const p of all('rings', 3)) {
      if (p.booth !== 'rings') throw new Error();
      expect(p.mode).toBe('make-ten');
      expect(p.count + p.answer).toBe(10);
      expect(p.answer).toBeGreaterThan(0);
    }
    expect(tenFrame(7).filter(Boolean)).toHaveLength(7);
  });

  it("Munch's Snacks: compare plates (with the big-cookie trap), then 1 more/less, then 10 more/less", () => {
    let traps = 0;
    for (const p of all('snacks', 1)) {
      if (p.booth !== 'snacks' || !p.plates) throw new Error();
      const [a, b] = p.plates;
      expect(a.count).not.toBe(b.count);
      const want = p.ask === 'more' ? (a.count > b.count ? 0 : 1) : a.count < b.count ? 0 : 1;
      expect(p.answer).toBe(want);
      if (a.size === 'big' || b.size === 'big') {
        traps++;
        // the big cookies are always on the plate with fewer
        const big = a.size === 'big' ? a : b;
        expect(big.count).toBe(Math.min(a.count, b.count));
      }
    }
    expect(traps).toBeGreaterThan(100);
    for (const p of all('snacks', 2)) {
      if (p.booth !== 'snacks') throw new Error();
      expect(Math.abs(p.delta!)).toBe(1);
      expect(p.answer).toBe(p.base! + p.delta!);
      expect(p.answer).toBeLessThanOrEqual(20);
    }
    for (const p of all('snacks', 3)) {
      if (p.booth !== 'snacks') throw new Error();
      expect(Math.abs(p.delta!)).toBe(10);
      expect(p.answer).toBeGreaterThanOrEqual(1);
      expect(p.answer).toBeLessThanOrEqual(99);
    }
  });

  it('Prize Counter: tens, then tens and ones, then building a price up to 120', () => {
    for (const p of all('tickets', 1)) if (p.booth === 'tickets') expect(p.answer % 10).toBe(0);
    for (const p of all('tickets', 2)) {
      if (p.booth !== 'tickets') throw new Error();
      expect(p.answer).toBe(p.tens * 10 + p.ones);
      expect(p.options.some((o) => o.misconception === 'reversed')).toBe(true);
    }
    for (const p of all('tickets', 3)) {
      if (p.booth !== 'tickets') throw new Error();
      expect(p.mode).toBe('build');
      expect(p.answer).toBeGreaterThanOrEqual(21);
      expect(p.answer).toBeLessThanOrEqual(120);
      expect(p.prize).toBeTruthy();
    }
  });
});

describe('diagnosing a built ticket amount', () => {
  it('names the likely mistake', () => {
    expect(diagnoseBuild(47, 47)).toBeNull();
    expect(diagnoseBuild(47, 74)).toBe('reversed');
    expect(diagnoseBuild(47, 57)).toBe('tens-off');
    expect(diagnoseBuild(47, 46)).toBe('skipped');
    expect(diagnoseBuild(47, 11)).toBe('added-digits');
  });
});
