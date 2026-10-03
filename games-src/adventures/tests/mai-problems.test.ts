import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import {
  addNoCarry,
  CATEGORIES,
  digMistake,
  digSquares,
  GRID,
  isReasonable,
  makeClue,
  makeQuizQuestion,
  makeWordProblem,
  opMistake,
  quizWinner,
  squareName,
  subSmallerFromBigger,
  TIERS,
  VALUES,
  ZONES,
} from '../src/games/math-adventure-island/problems';

const compute = (a: number, op: string, b: number) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);

describe('helpers', () => {
  it('makes the classic column mistakes', () => {
    expect(addNoCarry(47, 38)).toBe(75);
    expect(subSmallerFromBigger(52, 27)).toBe(35);
  });
  it('names grid squares both ways', () => {
    expect(squareName({ col: 1, row: 2 }, false)).toBe('B3');
    expect(squareName({ col: 1, row: 2 }, true)).toBe('(2, 3)');
  });
  it('diagnoses a dig in the wrong square', () => {
    expect(digMistake({ col: 1, row: 2 }, { col: 1, row: 2 })).toBeNull();
    expect(digMistake({ col: 2, row: 1 }, { col: 1, row: 2 })).toBe('swapped-xy');
    expect(digMistake({ col: 0, row: 0 }, { col: 1, row: 2 })).toBe('wrong-square');
  });
  it('picks four different dig squares on the grid', () => {
    const sq = digSquares(mulberry32(4));
    expect(sq).toHaveLength(4);
    expect(new Set(sq.map((s) => `${s.col},${s.row}`)).size).toBe(4);
    for (const s of sq) {
      expect(s.col).toBeLessThan(GRID.cols);
      expect(s.row).toBeLessThan(GRID.rows);
    }
  });
});

describe('word problems', () => {
  it('every zone and tier makes a solvable three-step problem', () => {
    for (const zone of ZONES)
      for (const tier of TIERS)
        for (let seed = 1; seed < 300; seed++) {
          const p = makeWordProblem(zone, tier, mulberry32(seed * 17 + tier));
          expect(p.answer).toBeGreaterThan(0);
          expect(Number.isInteger(p.answer)).toBe(true);
          expect(p.ask).toHaveLength(3);
          expect(p.ask.filter((c) => c.correct)).toHaveLength(1);
          expect(p.choices).toHaveLength(3);
          expect(p.choices.filter((c) => c.correct)).toHaveLength(1);
          expect(p.choices.find((c) => c.correct)!.value).toBe(p.answer);
          expect(new Set(p.choices.map((c) => c.value)).size).toBe(3);
          for (const c of p.choices) {
            expect(c.value).toBeGreaterThanOrEqual(0);
            if (!c.correct) expect(c.misconception).toBeTruthy();
          }
          expect(p.strategy).toContain(String(p.answer));
          if (p.trap) expect(p.trap).not.toBe(p.op);
          // the story's numbers really give the answer with the chosen operation
          const nums = p.story.match(/\d+/g)!.map(Number);
          if (p.model.kind === 'share' && zone === 'div' && tier === 3) continue;
          const ok = nums.some((a, i) => nums.some((b, j) => i !== j && compute(a, p.op, b) === p.answer));
          expect(ok).toBe(true);
        }
  });
  it('tier 2 addition and subtraction carry a key-word trap', () => {
    const p = makeWordProblem('add', 2, mulberry32(3));
    expect(p.op).toBe('−');
    expect(opMistake(p, '+')).toBe('keyword-trap');
    expect(opMistake(p, '×')).toBe('wrong-op');
    expect(opMistake(p, '−')).toBeNull();
    const c = makeWordProblem('sub', 2, mulberry32(3));
    expect(c.story).toContain('How many more');
    expect(c.trap).toBe('+');
  });
  it('remainder problems round up for boats and drop the rest for full bags', () => {
    let boats = 0;
    let bags = 0;
    for (let seed = 1; seed < 60; seed++) {
      const p = makeWordProblem('div', 3, mulberry32(seed));
      const [total, size] = p.story.match(/\d+/g)!.map(Number);
      if (p.story.includes('boat')) {
        boats++;
        expect(p.answer).toBe(Math.ceil(total / size));
      } else {
        bags++;
        expect(p.answer).toBe(Math.floor(total / size));
      }
    }
    expect(boats).toBeGreaterThan(0);
    expect(bags).toBeGreaterThan(0);
  });
});

describe('treasure clues', () => {
  it('estimates, exact answers and reasonableness agree', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 300; seed++) {
        const c = makeClue(tier, mulberry32(seed * 5 + tier), { col: 2, row: 1 });
        expect(c.estimateChoices.find((x) => x.correct)!.value).toBe(c.estimate);
        expect(c.computeChoices.find((x) => x.correct)!.value).toBe(c.exact);
        expect(new Set(c.estimateChoices.map((x) => x.value)).size).toBe(3);
        expect(new Set(c.computeChoices.map((x) => x.value)).size).toBe(3);
        // the exact answer is always close to the estimate
        expect(isReasonable(c.exact, c.estimate, c.tolerance)).toBe(true);
        expect(c.reasonable).toBe(isReasonable(c.pipAnswer, c.estimate, c.tolerance));
        expect(c.ordered).toBe(tier === 3);
      }
  });
  it('Pip is sometimes right and sometimes way off', () => {
    const results = Array.from({ length: 40 }, (_, i) => makeClue(2, mulberry32(i + 1), { col: 0, row: 0 }).reasonable);
    expect(results).toContain(true);
    expect(results).toContain(false);
  });
});

describe('quiz show', () => {
  it('every tile has a question with one right answer, and bonuses on 200 and 300', () => {
    for (const cat of CATEGORIES)
      for (const v of VALUES)
        for (let seed = 1; seed < 80; seed++) {
          const q = makeQuizQuestion(cat, v, mulberry32(seed * 3 + v));
          expect(q.choices).toHaveLength(3);
          expect(q.choices.filter((c) => c.correct)).toHaveLength(1);
          if (q.bonus) {
            expect(v).toBeGreaterThanOrEqual(200);
            expect(q.bonus.options.filter((o) => o.correct)).toHaveLength(1);
            expect(new Set(q.bonus.options.map((o) => o.value)).size).toBe(3);
          }
          if ((cat === 'addsub' || cat === 'muldiv') && v >= 200) expect(q.bonus).not.toBeNull();
        }
  });
  it('the right strategy really gives the right answer', () => {
    for (let seed = 1; seed < 100; seed++) {
      const q = makeQuizQuestion('addsub', 300, mulberry32(seed));
      const right = q.bonus!.options.find((o) => o.correct)!.value;
      // evaluate "a + b − c" style expressions
      const val = Function(`return ${right.replace(/−/g, '-').replace(/×/g, '*')}`)() as number;
      expect(val).toBe(q.choices.find((c) => c.correct)!.value);
    }
  });
  it('you win by beating Pip', () => {
    expect(quizWinner(900, 400)).toBe('you');
    expect(quizWinner(300, 500)).toBe('pip');
    expect(quizWinner(300, 300)).toBe('tie');
  });
});
