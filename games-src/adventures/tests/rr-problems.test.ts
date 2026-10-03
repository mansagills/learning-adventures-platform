import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { boltsFor, LEAD_PER_MOMENTUM, nextMomentum, rivalPace, distractors, makeProblem, memoryBoard, needsRegroup, nextLevel, noRegroup, solve, speedFor, strategyFor, TIERS } from '../src/games/math-race-rally/problems';
import { buy, cleanLook, PARTS, SLOTS, STARTING_LOOK, STARTING_OWNED, TRACKS } from '../src/games/math-race-rally/cosmetics';

describe('race math helpers', () => {
  it('knows when regrouping is needed', () => {
    expect(needsRegroup(47, '+', 38)).toBe(true);
    expect(needsRegroup(42, '+', 35)).toBe(false);
    expect(needsRegroup(52, '-', 27)).toBe(true);
    expect(needsRegroup(58, '-', 27)).toBe(false);
  });
  it('makes the classic no-regroup mistakes', () => {
    expect(noRegroup(47, '+', 38)).toBe(75);
    expect(noRegroup(52, '-', 27)).toBe(35);
    expect(noRegroup(523, '-', 187)).toBe(464);
  });
  it('writes a strategy that ends with the answer', () => {
    expect(strategyFor(8, '+', 7, 2)).toBe('Make a ten: 8 + 2 = 10, then 10 + 5 = 15.');
    expect(strategyFor(6, '+', 6, 2)).toBe('Doubles: 6 + 6 = 12.');
    expect(strategyFor(14, '-', 6, 2)).toBe('Take back to ten: 14 - 4 = 10, then 10 - 2 = 8.');
    expect(strategyFor(52, '-', 27, 4)).toContain('So 25.');
    expect(strategyFor(398, '+', 145, 5)).toBe('398 is close to 400: 400 + 145 = 545, then take away 2: 543.');
  });
  it('distractors name their mistakes', () => {
    expect(distractors(47, '+', 38, 4)[0]).toEqual({ value: 75, mis: 'no-regroup' });
    expect(distractors(52, '-', 27, 4)[0]).toEqual({ value: 35, mis: 'smaller-from-bigger' });
    expect(distractors(34, '+', 5, 3)[0]).toEqual({ value: 84, mis: 'tens-ones' });
  });
});

describe('problems by tier', () => {
  it('every tier makes valid questions in its range', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 400; seed++) {
        const p = makeProblem(tier, mulberry32(seed * 13 + tier));
        expect(p.answer).toBe(solve(p.a, p.op, p.b));
        expect(p.answer).toBeGreaterThanOrEqual(0);
        expect(p.choices).toHaveLength(3);
        expect(p.choices.filter((c) => c.correct)).toHaveLength(1);
        expect(p.choices.find((c) => c.correct)!.value).toBe(p.answer);
        expect(new Set(p.choices.map((c) => c.value)).size).toBe(3);
        for (const c of p.choices) {
          expect(c.value).toBeGreaterThanOrEqual(0);
          if (!c.correct) expect(c.misconception).toBeTruthy();
        }
        if (tier === 1) expect(Math.max(p.a, p.b, p.answer)).toBeLessThanOrEqual(10);
        if (tier === 2) {
          expect(Math.max(p.a, p.answer)).toBeLessThanOrEqual(20);
          expect(Math.max(p.a, p.answer)).toBeGreaterThanOrEqual(10);
        }
        if (tier === 3) {
          expect(p.answer).toBeLessThan(100);
          if (p.b < 10) expect(needsRegroup(p.a, p.op, p.b)).toBe(false);
        }
        if (tier === 4) {
          expect(p.a).toBeLessThan(100);
          expect(p.answer).toBeLessThan(100);
          expect(needsRegroup(p.a, p.op, p.b)).toBe(true);
        }
        if (tier === 5) expect(Math.max(p.a, p.answer)).toBeGreaterThanOrEqual(100);
        expect(p.strategy).toContain(String(p.answer));
      }
  });
});

describe('the pit stop', () => {
  it('builds a board with missed facts first and one match per card', () => {
    const r = mulberry32(5);
    const missed = [makeProblem(2, r), makeProblem(2, r)];
    const seen = Array.from({ length: 8 }, () => makeProblem(2, r));
    const board = memoryBoard(6, missed, seen, 2, mulberry32(9));
    expect(board).toHaveLength(12);
    for (let pair = 0; pair < 6; pair++) {
      const cards = board.filter((c) => c.pair === pair);
      expect(cards.map((c) => c.kind).sort()).toEqual(['answer', 'fact']);
    }
    const answers = board.filter((c) => c.kind === 'answer').map((c) => c.face);
    expect(new Set(answers).size).toBe(6);
    expect(board.some((c) => c.face === missed[0].text)).toBe(true);
  });
  it('pays bolts per match with a bonus for a tidy board', () => {
    expect(boltsFor(6, 0, 6)).toBe(10);
    expect(boltsFor(6, 6, 6)).toBe(7);
    expect(boltsFor(4, 2, 6)).toBe(4);
  });
});

describe('speed', () => {
  it('goes up on a right answer and down on a wrong one, never to a stop', () => {
    expect(nextLevel(3, true)).toBe(4);
    expect(nextLevel(6, true)).toBe(6);
    expect(nextLevel(1, false)).toBe(1);
    expect(speedFor(1)).toBeGreaterThan(0);
    expect(speedFor(6)).toBeGreaterThan(speedFor(1));
  });
});

describe('the rival', () => {
  const base = speedFor(3.6);
  it('momentum: +1 for a right answer, -2 for a wrong one, between -3 and 3', () => {
    expect(nextMomentum(0, true)).toBe(1);
    expect(nextMomentum(3, true)).toBe(3);
    expect(nextMomentum(3, false)).toBe(1);
    expect(nextMomentum(-2, false)).toBe(-3);
  });
  it('after a run of right answers Dash aims well behind you; two misses put him ahead', () => {
    let m = 0;
    for (let i = 0; i < 4; i++) m = nextMomentum(m, true);
    expect(-LEAD_PER_MOMENTUM * m).toBeLessThan(-10);
    m = nextMomentum(m, false);
    expect(-LEAD_PER_MOMENTUM * m).toBeLessThan(0); // one miss: close behind you
    m = nextMomentum(m, false);
    expect(-LEAD_PER_MOMENTUM * m).toBeGreaterThan(0); // two misses: he passes
  });
  it('speeds up to reach his spot and eases off when past it, within limits', () => {
    const v = speedFor(5);
    expect(rivalPace(-20, v, base, 0)).toBeGreaterThan(v); // behind where he wants: faster than you
    expect(rivalPace(20, v, base, 0)).toBeLessThan(v); // ahead of where he wants: slower than you
    expect(rivalPace(-200, v, base, 0)).toBeLessThanOrEqual(speedFor(6) * 1.3);
    expect(rivalPace(200, speedFor(1), base, 0)).toBe(base * 0.8);
  });
});

describe('the garage', () => {
  it('starts with one free part per slot', () => {
    for (const s of SLOTS) expect(PARTS.filter((p) => p.slot === s && p.cost === 0)).toHaveLength(1);
    expect(cleanLook({}, STARTING_OWNED)).toEqual(STARTING_LOOK);
  });
  it('buys only what you can afford, once', () => {
    expect(buy(5, STARTING_OWNED, 'blue')).toBeNull();
    const b = buy(10, STARTING_OWNED, 'blue')!;
    expect(b.bolts).toBe(4);
    expect(b.owned).toContain('blue');
    expect(buy(b.bolts, b.owned, 'blue')).toBeNull();
  });
  it('ignores parts that are not owned when loading', () => {
    expect(cleanLook({ paint: 'gold', body: 'nope' }, STARTING_OWNED)).toEqual(STARTING_LOOK);
    expect(cleanLook({ paint: 'gold' }, [...STARTING_OWNED, 'gold']).paint).toBe('gold');
  });
  it('the first track is open from the start', () => {
    expect(TRACKS[0].wins).toBe(0);
  });
});
