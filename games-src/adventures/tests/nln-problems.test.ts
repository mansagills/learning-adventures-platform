import { describe, expect, it } from 'vitest';
import { BELTS, checkLanding, diagnose, gapOptions, isLabelled, makeProblem, workedHops, type Problem } from '../src/games/number-line-ninja/problems';

const SEEDS = Array.from({ length: 600 }, (_, i) => i * 7919 + 13);

function all(belt: (typeof BELTS)[number], tier: number): Problem[] {
  return SEEDS.map((s) => makeProblem(belt, tier, s));
}

describe('Number Line Ninja challenges', () => {
  it('every challenge stays on the line and its numbers add up', () => {
    for (const belt of BELTS)
      for (const tier of [1, 2, 3])
        for (const p of all(belt, tier)) {
          expect(p.start).toBeGreaterThanOrEqual(0);
          expect(p.target).toBeGreaterThanOrEqual(0);
          expect(p.start).toBeLessThanOrEqual(p.lineMax);
          expect(p.target).toBeLessThanOrEqual(p.lineMax);
          expect(p.target - p.start).toBe(p.change);
          expect(p.change).not.toBe(0);
          expect(p.tier).toBe(tier);
        }
  });

  it('is reproducible from its seed', () => {
    expect(makeProblem('green', 2, 42)).toEqual(makeProblem('green', 2, 42));
  });

  it('white belt hides the number being looked for', () => {
    for (const tier of [1, 2, 3])
      for (const p of all('white', tier)) {
        expect(p.start).toBe(0);
        expect(isLabelled(p, p.target)).toBe(false);
      }
    // tier 3 only shows 0, 10 and 20
    const p = all('white', 3)[0];
    expect([0, 5, 10, 15, 20].filter((n) => isLabelled(p, n))).toEqual([0, 10, 20]);
  });

  it('yellow and orange belts are addition and subtraction within 20, with tier 3 crossing ten', () => {
    for (const [belt, sign] of [
      ['yellow', 1],
      ['orange', -1],
    ] as const) {
      for (const p of all(belt, 1)) expect(Math.abs(p.change)).toBeLessThanOrEqual(4);
      for (const p of all(belt, 2)) expect(Math.floor(p.start / 10)).toBe(Math.floor(p.target / 10) - (p.target === 10 ? 1 : 0));
      for (const p of all(belt, 3)) {
        expect(Math.sign(p.change)).toBe(sign);
        // one of them is below 10 and the other above: the make-a-ten step
        expect(Math.min(p.start, p.target)).toBeLessThan(10);
        expect(Math.max(p.start, p.target)).toBeGreaterThan(10);
      }
      for (const tier of [1, 2, 3]) for (const p of all(belt, tier)) expect(p.lineMax).toBe(20);
    }
  });

  it('green belt uses tens: tier 1 whole tens, tier 2 no regrouping, tier 3 crosses a ten', () => {
    for (const p of all('green', 1)) expect(Math.abs(p.change) % 10).toBe(0);
    for (const p of all('green', 2)) {
      const ones = Math.abs(p.change) % 10;
      expect(ones).toBeGreaterThan(0);
      expect(Math.floor(p.target / 10) - Math.floor(p.start / 10)).toBe(Math.trunc(p.change / 10));
    }
    for (const p of all('green', 3)) expect(Math.floor(p.target / 10) - Math.floor(p.start / 10)).not.toBe(Math.trunc(p.change / 10));
  });

  it('black belt: tier 1 stays within 20, later tiers within 100 and can go back', () => {
    for (const p of all('black', 1)) expect(p.lineMax).toBe(20);
    expect(all('black', 3).some((p) => p.change < 0)).toBe(true);
    for (const p of all('black', 3)) expect(Math.abs(p.change)).toBeGreaterThanOrEqual(13);
  });

  it('the worked example always lands on the answer and stays on the line', () => {
    for (const belt of BELTS)
      for (const tier of [1, 2, 3])
        for (const p of all(belt, tier)) {
          const hops = workedHops(p);
          let at = p.start;
          for (const h of hops) {
            at += h;
            expect(at).toBeGreaterThanOrEqual(0);
            expect(at).toBeLessThanOrEqual(p.lineMax);
          }
          expect(at).toBe(p.target);
        }
  });

  it('the make-a-ten worked example stops on 10', () => {
    const p = makeProblem('yellow', 3, 5);
    const hops = workedHops(p);
    let at = p.start;
    const visited = hops.map((h) => (at += h));
    expect(visited).toContain(10);
  });
});

describe('diagnosing a wrong landing', () => {
  const add: Problem = { belt: 'yellow', kind: 'add', tier: 1, lineMax: 20, start: 8, target: 11, change: 3, labels: 'all', bigHop: 0, equation: '', prompt: '' };
  const sub: Problem = { ...add, belt: 'orange', kind: 'sub', start: 13, target: 8, change: -5 };
  const tens: Problem = { ...add, belt: 'green', kind: 'tens', lineMax: 100, start: 34, target: 59, change: 25, bigHop: 10 };
  const find: Problem = { ...add, belt: 'white', kind: 'find', start: 0, target: 14, change: 14, labels: 'fives', bigHop: 5 };

  it('right is right', () => {
    expect(checkLanding(add, 11)).toEqual({ correct: true, misconception: null });
  });
  it('counting the starting stone lands one short (or one past, going back)', () => {
    expect(diagnose(add, 10)).toBe('counted-start');
    expect(diagnose(sub, 9)).toBe('counted-start');
  });
  it('hopping the wrong way', () => {
    expect(diagnose(add, 5)).toBe('wrong-way');
    expect(diagnose(sub, 18)).toBe('wrong-way');
  });
  it('place value: 2 hops for 20', () => {
    expect(diagnose(tens, 34 + 7)).toBe('tens-as-ones');
    expect(diagnose(tens, 69)).toBe('ten-off');
    expect(diagnose(tens, 95)).toBe('reversed');
  });
  it('landmarks and not moving', () => {
    expect(diagnose(find, 9)).toBe('landmark');
    expect(diagnose(find, 13)).toBe('one-off');
    expect(diagnose(find, 0)).toBe('no-hop');
  });
});

describe('"How far was it?" choices', () => {
  it('always has the answer, three different numbers, and distractors from real mistakes', () => {
    for (const tier of [1, 2, 3])
      for (const p of all('black', tier)) {
        const opts = gapOptions(p, workedHops(p), p.start);
        expect(opts).toHaveLength(3);
        expect(new Set(opts.map((o) => o.value)).size).toBe(3);
        expect(opts.filter((o) => o.correct)).toHaveLength(1);
        expect(opts.find((o) => o.correct)!.value).toBe(Math.abs(p.change));
        for (const o of opts) if (!o.correct) expect(o.misconception).toBeTruthy();
      }
  });
});
