import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { bingoLine, bingoMistake, evalSentence, factKey, factorPairs, factTrue, family, flipDigits, FREE, makeBingoCall, makeBingoCard, makeMeteor, makeProblem, PRIMES, rightChoice, SECTORS, TIERS, type Problem } from '../src/games/multiplication-space-quest/problems';

const SEEDS = 500;

const MULT = ['formations', 'engines'] as const;

function each(fn: (p: Problem, seed: number) => void, sectors: readonly string[] = SECTORS): void {
  for (const sector of SECTORS.filter((x) => sectors.includes(x)))
    for (const tier of TIERS)
      for (let seed = 1; seed <= SEEDS; seed++) fn(makeProblem(sector, tier, mulberry32(seed * 7 + tier)), seed);
}

/** The number a choice stands for: a plain number, or a sentence worked out. */
const valueOf = (label: string) => (/^\d+$/.test(label) ? Number(label) : evalSentence(label));

describe('Multiplication Space Quest problems', () => {
  it('every step has exactly three rocks, one right, all different, and every wrong rock names its mistake', () => {
    each((p) => {
      expect(p.steps.length).toBeGreaterThanOrEqual(1);
      for (const s of p.steps) {
        expect(s.choices).toHaveLength(3);
        expect(s.choices.filter((c) => c.correct)).toHaveLength(1);
        expect(new Set(s.choices.map((c) => c.value)).size).toBe(3);
        for (const c of s.choices.filter((c) => !c.correct)) expect(c.misconception).toBeTruthy();
        for (const c of s.choices) expect(c.label.length).toBeLessThanOrEqual(16);
      }
    });
  });

  it('the answer is the product, and the last step’s right rock is the answer', () => {
    each((p) => {
      expect(p.answer).toBe(p.a * p.b);
      const last = rightChoice(p.steps[p.steps.length - 1]);
      if (/^\d+$/.test(last.value)) expect(Number(last.value)).toBe(p.answer);
      else expect(evalSentence(last.value)).toBe(p.answer);
    }, MULT);
  });

  it('right sentences are worth the answer, and wrong sentences are not', () => {
    each((p) => {
      for (const s of p.steps)
        for (const c of s.choices)
          if (!/^\d+$/.test(c.value)) {
            if (c.correct) expect(valueOf(c.value)).toBe(p.answer);
            else expect(valueOf(c.value)).not.toBe(p.answer);
          }
    }, MULT);
  });

  it('wrong numbers are never negative, never the answer, and come from the mistake they name', () => {
    each((p) => {
      for (const s of p.steps)
        for (const c of s.choices.filter((x) => !x.correct && /^\d+$/.test(x.value))) {
          const v = Number(c.value);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).not.toBe(p.answer);
          if (c.misconception === 'added') expect([p.a + p.b, p.a + 2, p.a + 3, p.b + 2, p.b + 3, p.a + 4, p.b + 4, p.a + 5, p.b + 5, p.a + 10, p.b + 10, p.a + 1, p.b + 1, p.a + 12, p.b + 12, p.a + 11, p.b + 11]).toContain(v);
          if (c.misconception === 'zero-keeps') expect(v).toBe(Math.max(p.a, p.b));
          if (c.misconception === 'nines-flipped') expect(flipDigits(p.answer)).toBe(v);
          if (c.misconception === 'counted-edge') expect(v).toBe(2 * p.a + 2 * p.b - 4);
          if (c.misconception === 'double-once') expect(v).toBe(p.answer / 2);
          if (c.misconception === 'nine-minus-one') expect(v).toBe((p.answer / 9) * 10 - 1);
        }
    }, MULT);
  });

  it('each sector stays in its level’s part of the grade band', () => {
    each((p) => {
      if (p.sector === 'formations') {
        if (p.tier === 1) expect(Math.max(p.a, p.b)).toBeLessThanOrEqual(6);
        if (p.tier === 2) expect(p.answer).toBeLessThanOrEqual(48);
        if (p.tier === 3) {
          expect(p.kind).toBe('split');
          expect(p.steps).toHaveLength(2);
          expect(Math.min(p.a, p.b)).toBeGreaterThanOrEqual(6);
        }
      } else {
        const t = [p.a, p.b];
        if (p.tier === 1) expect(t.some((x) => [0, 1, 2, 5, 10].includes(x))).toBe(true);
        if (p.tier === 2) {
          expect(t.some((x) => [3, 4, 9].includes(x))).toBe(true);
          expect(p.steps).toHaveLength(2);
        }
        if (p.tier === 3) expect(p.kind === 'break-apart' ? Math.min(...t) >= 6 : t.some((x) => x >= 11)).toBe(true);
      }
    }, MULT);
  });

  it('pictures match the question: groups and formations have the right number of ships', () => {
    each((p) => {
      const pic = p.picture;
      if (!pic) return expect(p.sector).toBe('engines');
      if (pic.kind === 'groups') expect(pic.groups * pic.each).toBe(p.answer);
      if (pic.kind === 'array') expect(pic.rows * pic.cols).toBe(p.answer);
      if (pic.kind === 'split') {
        expect(pic.rows * pic.cols).toBe(p.answer);
        expect(pic.at).toBeLessThan(pic.cols);
      }
    }, MULT);
  });

  it('a turned formation really is turned, with the same number of ships', () => {
    each((p) => {
      if (p.kind !== 'array-turn' || p.picture?.kind !== 'array') return;
      expect(p.picture.rows).toBe(p.b);
      expect(p.picture.cols).toBe(p.a);
    });
  });

  it('records the Star Map facts it uses (1 to 10, smaller number first)', () => {
    expect(factKey(7, 3)).toBe('3x7');
    expect(factKey(0, 5)).toBeNull();
    expect(factKey(11, 4)).toBeNull();
    each((p) => {
      for (const f of p.facts) {
        const [x, y] = f.split('x').map(Number);
        expect(x).toBeLessThanOrEqual(y);
        expect(x).toBeGreaterThanOrEqual(1);
        expect(y).toBeLessThanOrEqual(10);
      }
      if ((MULT as readonly string[]).includes(p.sector) && Math.max(p.a, p.b) <= 10 && Math.min(p.a, p.b) >= 1) expect(p.facts).toContain(factKey(p.a, p.b));
    });
  });

  it('works sentences out the way the rocks show them', () => {
    expect(evalSentence('7 × 5 + 7 × 3')).toBe(56);
    expect(evalSentence('10 × 6 − 6')).toBe(54);
    expect(evalSentence('6 × 2 × 2')).toBe(24);
    expect(evalSentence('4 + 3')).toBe(7);
    expect(flipDigits(63)).toBe(36);
    expect(flipDigits(55)).toBeNull();
    expect(flipDigits(9)).toBeNull();
  });

  it('every level offers each kind of question it promises', () => {
    const kinds = new Set<string>();
    each((p) => kinds.add(`${p.sector}-${p.tier}-${p.kind}`));
    for (const k of ['cargo-1-share', 'cargo-2-missing-factor', 'cargo-2-how-many-groups', 'cargo-3-round-up', 'cargo-3-full', 'cargo-3-left-over', 'constellations-1-family-missing', 'constellations-2-odd-fact', 'constellations-3-missing-pair', 'constellations-3-is-factor', 'constellations-3-prime']) expect(kinds).toContain(k);
    for (const k of ['formations-1-groups-count', 'formations-1-groups-sentence', 'formations-2-array-count', 'formations-2-array-turn', 'formations-3-split', 'engines-1-basic', 'engines-2-shortcut', 'engines-3-break-apart', 'engines-3-big']) expect(kinds).toContain(k);
  });

  it('Cargo: every answer is worked out by division, with leftovers only at level 3', () => {
    each((p) => {
      const right = Number(rightChoice(p.steps[0]).value);
      expect(right).toBe(p.answer);
      if (p.tier < 3) {
        expect(p.a % p.b).toBe(0);
        expect(p.answer).toBe(p.a / p.b);
      } else {
        const q = Math.floor(p.a / p.b);
        const rem = p.a % p.b;
        expect(rem).toBeGreaterThan(0);
        expect(p.answer).toBe(p.kind === 'round-up' ? q + 1 : p.kind === 'full' ? q : rem);
      }
      for (const c of p.steps[0].choices.filter((x) => !x.correct)) {
        const v = Number(c.value);
        expect(v).toBeGreaterThanOrEqual(0);
        if (c.misconception === 'subtracted') expect(v).toBe(p.a - p.b);
        if (c.misconception === 'multiplied') expect(v).toBe(p.a * p.b);
        if (c.misconception === 'leftover-ignored') expect(v).toBe(Math.floor(p.a / p.b));
        if (c.misconception === 'remainder-answer') expect(v).toBe(p.a % p.b);
        if (c.misconception === 'rounded-up') expect(v).toBe(Math.floor(p.a / p.b) + 1);
        if (c.misconception === 'missing-to-fill') expect(v).toBe(p.b - (p.a % p.b));
      }
      if (p.picture?.kind === 'crates') expect(p.picture.crates).toBe(p.a);
    }, ['cargo']);
  });

  it('Constellations: the right fact is true and in the family; wrong ones are false or from another family', () => {
    each((p) => {
      const step = p.steps[0];
      if (p.kind === 'family-missing') {
        const fam = family(p.a, p.b);
        expect(fam).toContain(rightChoice(step).value);
        for (const c of step.choices.filter((x) => !x.correct)) expect(fam).not.toContain(c.value);
        for (const f of fam.filter((x) => x !== rightChoice(step).value)) expect(step.ask).toContain(f);
      }
      if (p.kind === 'odd-fact') {
        const fam = family(p.a, p.b);
        expect(fam).not.toContain(rightChoice(step).value);
        for (const c of step.choices.filter((x) => !x.correct)) {
          expect(fam).toContain(c.value);
          expect(factTrue(c.value)).toBe(true);
        }
      }
      if (p.kind === 'missing-pair') {
        const pairs = factorPairs(p.a).map(([x, y]) => `${x} × ${y}`);
        expect(pairs).toContain(rightChoice(step).value);
        expect(step.ask).not.toContain(rightChoice(step).value + ',');
        for (const c of step.choices.filter((x) => !x.correct)) expect(pairs).not.toContain(c.value);
      }
      if (p.kind === 'is-factor') {
        expect(p.a % Number(rightChoice(step).value)).toBe(0);
        for (const c of step.choices.filter((x) => !x.correct)) expect(p.a % Number(c.value)).not.toBe(0);
      }
      if (p.kind === 'prime') {
        expect(PRIMES).toContain(Number(rightChoice(step).value));
        for (const c of step.choices.filter((x) => !x.correct)) expect(PRIMES).not.toContain(Number(c.value));
      }
    }, ['constellations']);
    expect(factTrue('12 ÷ 4 = 3')).toBe(true);
    expect(factTrue('4 ÷ 12 = 3')).toBe(false);
    expect(factTrue('3 + 4 = 7')).toBe(true);
  });

  it('Bingo: every call’s answer is on the card and not marked, and a card always ends in a Bingo', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed <= 300; seed++) {
        const r = mulberry32(seed * 13 + tier);
        const card = makeBingoCard(tier, r);
        expect(card.values).toHaveLength(25);
        expect(card.values[FREE]).toBe(0);
        expect(new Set(card.values).size).toBe(25);
        const marked = card.values.map((_, i) => i === FREE);
        let calls = 0;
        while (!bingoLine(marked)) {
          const c = makeBingoCall(card, marked, r);
          const i = card.values.indexOf(c.answer);
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).not.toBe(FREE);
          expect(marked[i]).toBe(false);
          // the call is a true fact
          if (c.kind === 'times') expect(c.a * c.b).toBe(c.answer);
          else expect(c.a / c.b).toBe(c.answer);
          marked[i] = true;
          calls++;
          expect(calls).toBeLessThanOrEqual(24);
        }
      }
  });

  it('Bingo: a wrong square names the likely mistake', () => {
    expect(bingoMistake({ text: '6 × 7 = ?', answer: 42, kind: 'times', a: 6, b: 7 }, 13)).toBe('added');
    expect(bingoMistake({ text: '6 × 7 = ?', answer: 42, kind: 'times', a: 6, b: 7 }, 36)).toBe('one-group-off');
    expect(bingoMistake({ text: '42 ÷ 6 = ?', answer: 7, kind: 'divide', a: 42, b: 6 }, 36)).toBe('subtracted');
    expect(bingoMistake({ text: '42 ÷ 6 = ?', answer: 7, kind: 'divide', a: 42, b: 6 }, 6)).toBe('swapped');
  });

  it('Meteor Run: true facts, mostly ones not yet on the Star Map', () => {
    const lit = ['2x3', '2x4', '5x5'];
    let dark = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const p = makeMeteor(lit, mulberry32(seed));
      expect(Number(rightChoice(p.steps[0]).value)).toBe(p.a * p.b);
      expect(p.steps[0].choices).toHaveLength(3);
      if (!lit.includes(factKey(p.a, p.b)!)) dark++;
    }
    expect(dark).toBeGreaterThan(300);
  });
});
