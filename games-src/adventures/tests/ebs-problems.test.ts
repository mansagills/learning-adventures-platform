import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { makeProblem, OPEN_JOBS, panWeights, TIERS, VERDICTS, verdictOf, type Job, type Problem } from '../src/games/equation-balance-scale/problems';

const SEEDS = 400;

function each(fn: (p: Problem, seed: number) => void, jobs: readonly Job[] = OPEN_JOBS): void {
  for (const job of jobs)
    for (const tier of TIERS)
      for (let seed = 1; seed <= SEEDS; seed++) fn(makeProblem(job, tier, mulberry32(seed * 11 + tier)), seed);
}

const right = (p: Problem) => p.steps[0].choices.find((c) => c.correct)!;
/** Every number written in a pan's text. */
const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

describe('Equation Balance Scale problems', () => {
  it('every question has three different answers and exactly one is right', () => {
    each((p) => {
      for (const step of p.steps) {
        expect(step.choices).toHaveLength(3);
        expect(step.choices.filter((c) => c.correct)).toHaveLength(1);
        expect(new Set(step.choices.map((c) => c.value)).size).toBe(3);
        for (const c of step.choices.filter((x) => !x.correct)) expect(c.misconception).toBeTruthy();
        expect(step.ask.length).toBeGreaterThan(10);
        expect(step.explain.length).toBeGreaterThan(10);
      }
    });
  });

  it('no number is ever below zero, on a pan or worked out on the way', () => {
    each((p) => {
      for (const pan of [p.left, p.right]) {
        expect(pan.text).not.toMatch(/-\d|− ?-/);
        for (const n of numbersIn(pan.text)) expect(n).toBeGreaterThanOrEqual(0);
      }
      const w = panWeights(p);
      expect(w.left).toBeGreaterThanOrEqual(0);
      expect(w.right).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(w.left) && Number.isInteger(w.right)).toBe(true);
    });
  });

  it('Weigh Station: the right answer is what the scale really does, and the answers keep their order', () => {
    each((p) => {
      expect(p.left.gap || p.right.gap).toBe(false);
      const truth = verdictOf(p.left.weight(0), p.right.weight(0));
      expect(p.answer).toBe(truth);
      expect(right(p).value).toBe(truth);
      expect(p.steps[0].choices.map((c) => c.value)).toEqual(VERDICTS.map((v) => v.v));
      // the two pans never show the very same thing
      expect(p.left.text).not.toBe(p.right.text);
      expect(p.steps[0].ask).toContain(`${p.left.text} = ${p.right.text}`);
    }, ['weigh']);
  });

  it('Weigh Station: each wrong answer is tagged with the mistake that leads to it', () => {
    each((p) => {
      for (const c of p.steps[0].choices.filter((x) => !x.correct)) {
        if (c.misconception === 'backwards') {
          // only when a balanced equation has a number alone on the left (9 = 4 + 5)
          expect(p.answer).toBe('balanced');
          expect(p.left.text).toMatch(/^\d+$/);
        }
        if (c.misconception === 'one-pan') {
          // calling it balanced when one side starts with the other side's total (6 + 4 = 10 + 1)
          expect(c.value).toBe('balanced');
          const lw = p.left.weight(0);
          const rw = p.right.weight(0);
          expect(numbersIn(p.right.text)[0] === lw || numbersIn(p.left.text)[0] === rw).toBe(true);
        }
        if (c.misconception === 'tipped-wrong-way') expect(c.value !== 'balanced' && p.answer !== 'balanced').toBe(true);
      }
    }, ['weigh']);
  });

  it('Weigh Station: level 1 is balanced about half the time and shows real crystals', () => {
    let balanced = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = makeProblem('weigh', 1, mulberry32(seed));
      if (p.answer === 'balanced') balanced++;
      expect(p.left.piles?.length && p.right.piles?.length).toBeTruthy();
      for (const n of [...p.left.piles!, ...p.right.piles!]) expect(n).toBeLessThanOrEqual(12);
    }
    expect(balanced / SEEDS).toBeGreaterThan(0.35);
    expect(balanced / SEEDS).toBeLessThan(0.65);
  });

  it('Weigh Station: level 2 includes the one-pan trap and a number alone on the left', () => {
    const texts = Array.from({ length: SEEDS }, (_, i) => makeProblem('weigh', 2, mulberry32(i + 1)));
    expect(texts.some((p) => p.steps[0].choices.some((c) => c.misconception === 'one-pan'))).toBe(true);
    expect(texts.some((p) => /^\d+$/.test(p.left.text) && p.answer === 'balanced')).toBe(true);
    const lvl3 = Array.from({ length: SEEDS }, (_, i) => makeProblem('weigh', 3, mulberry32(i + 1)));
    expect(lvl3.every((p) => /[×÷]/.test(p.left.text + p.right.text))).toBe(true);
  });

  it('Rover: the right crystal balances the scale and every wrong one tips it', () => {
    each((p) => {
      expect(typeof p.answer).toBe('number');
      expect(Number(right(p).value)).toBe(p.answer);
      const gaps = [p.left, p.right].filter((x) => x.gap);
      expect(gaps).toHaveLength(1);
      expect((gaps[0].text.match(/\?/g) ?? []).length).toBe(1);
      const ok = panWeights(p, p.answer as number);
      expect(ok.left).toBe(ok.right);
      for (const c of p.steps[0].choices) {
        const v = Number(c.value);
        expect(Number.isInteger(v) && v >= 1).toBe(true);
        if (!c.correct) {
          const w = panWeights(p, v);
          expect(w.left).not.toBe(w.right);
        }
      }
    }, ['rover']);
  });

  it('Rover: "the answer comes next" is the other pan\'s weight, and "added everything" adds every number', () => {
    each((p) => {
      const fixedPan = p.left.gap ? p.right : p.left;
      for (const c of p.steps[0].choices.filter((x) => !x.correct)) {
        if (c.misconception === 'answer-next') expect(Number(c.value)).toBe(fixedPan.weight(0));
        if (c.misconception === 'added-all') expect(Number(c.value)).toBe(numbersIn(p.left.text + ' ' + p.right.text).reduce((s, n) => s + n, 0));
      }
    }, ['rover']);
  });

  it('Rover: level 3 has something on both sides, and the gap can be on either side of a sign', () => {
    const lvl3 = Array.from({ length: SEEDS }, (_, i) => makeProblem('rover', 3, mulberry32(i + 1)));
    for (const p of lvl3) {
      expect(p.kind).toBe('both-sides');
      expect(numbersIn(p.left.text).length).toBeGreaterThanOrEqual(2);
      expect(numbersIn(p.right.text).length).toBeGreaterThanOrEqual(1);
    }
    const lvl1 = Array.from({ length: SEEDS }, (_, i) => makeProblem('rover', 1, mulberry32(i + 1)));
    expect(lvl1.some((p) => p.left.text.startsWith('?'))).toBe(true);
    expect(lvl1.some((p) => !p.left.text.startsWith('?'))).toBe(true);
  });
});
