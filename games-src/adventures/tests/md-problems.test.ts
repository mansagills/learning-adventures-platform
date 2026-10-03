import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { booksForLevel, MAX_LEVEL, offerChoices, startingPowers, stats } from '../src/games/math-dash/powers';
import { BOOKS_PER_STAGE, diagnose, digits, makeBookNumber, makeShelves, shelfFor, stageAfter, STAGES } from '../src/games/math-dash/problems';

describe('Library Rush shelves', () => {
  it('cover every book with exactly one shelf, in order, for every stage', () => {
    for (const stage of STAGES)
      for (let seed = 1; seed < 60; seed++) {
        const r = mulberry32(seed);
        const shelves = makeShelves(stage, r);
        for (let i = 1; i < shelves.length; i++) expect(shelves[i].lo).toBe(shelves[i - 1].hi + 1);
        for (let k = 0; k < 40; k++) {
          const n = makeBookNumber(stage, shelves, r);
          const matches = shelves.filter((s) => n >= s.lo && n <= s.hi);
          expect(matches.length, `stage ${stage} book ${n}`).toBe(1);
        }
      }
  });

  it('stage ranges match the grade-level plan', () => {
    const r = mulberry32(3);
    for (let k = 0; k < 500; k++) {
      const a = makeBookNumber(1, makeShelves(1), r);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(59);
      const b = makeBookNumber(2, makeShelves(2), r);
      expect(b).toBeGreaterThanOrEqual(100);
      expect(b).toBeLessThanOrEqual(599);
    }
    const s3 = makeShelves(3, mulberry32(9));
    expect(s3[0].label.startsWith('<')).toBe(true);
    expect(s3[3].label.startsWith('>')).toBe(true);
    expect(s3[0].lo).toBe(0);
    expect(s3[3].hi).toBe(999);
    // signs use only characters the pixel font has
    for (const st of STAGES) for (const sh of makeShelves(st, mulberry32(2))) expect(sh.sign).toMatch(/^[0-9<>s-]+$/);
  });

  it('many books are traps where the usual mistake lands on a real shelf', () => {
    const r = mulberry32(5);
    const sh1 = makeShelves(1);
    let traps1 = 0;
    for (let k = 0; k < 400; k++) {
      const n = makeBookNumber(1, sh1, r);
      const wrong = sh1.find((s) => s.lo === (n % 10) * 10);
      if (wrong && wrong !== shelfFor(n, sh1)) traps1++;
    }
    expect(traps1).toBeGreaterThan(150);
    const sh2 = makeShelves(2);
    let traps2 = 0;
    for (let k = 0; k < 400; k++) {
      const { t, o } = digits(makeBookNumber(2, sh2, r));
      if ((t >= 1 && t <= 5) || (o >= 1 && o <= 5)) traps2++;
    }
    expect(traps2).toBeGreaterThan(200);
  });
});

describe('diagnose', () => {
  const sh1 = makeShelves(1);
  const sh2 = makeShelves(2);
  const by = (sh: typeof sh1, lo: number) => sh.find((s) => s.lo === lo)!;

  it('right shelf is not a mistake', () => {
    expect(diagnose(23, by(sh1, 20), sh1, 1)).toBeNull();
    expect(diagnose(347, by(sh2, 300), sh2, 2)).toBeNull();
  });
  it('tens stage: the ones digit, a neighbour, anything else', () => {
    expect(diagnose(23, by(sh1, 30), sh1, 1)).toBe('last-digit');
    expect(diagnose(27, by(sh1, 30), sh1, 1)).toBe('next-shelf');
    expect(diagnose(27, by(sh1, 50), sh1, 1)).toBe('other');
  });
  it('hundreds stage: last digit, middle digit, neighbour', () => {
    expect(diagnose(214, by(sh2, 400), sh2, 2)).toBe('last-digit');
    expect(diagnose(247, by(sh2, 400), sh2, 2)).toBe('middle-digit');
    expect(diagnose(288, by(sh2, 300), sh2, 2)).toBe('next-shelf');
  });
  it('compare stage: 98 is not big, boundaries, < and > flipped', () => {
    const sh3 = [
      { id: 'c0', lo: 0, hi: 249, label: '< 250', sign: '<250', spoken: '' },
      { id: 'c1', lo: 250, hi: 499, label: '250 to 499', sign: '250-499', spoken: '' },
      { id: 'c2', lo: 500, hi: 749, label: '500 to 749', sign: '500-749', spoken: '' },
      { id: 'c3', lo: 750, hi: 999, label: '> 749', sign: '>749', spoken: '' },
    ];
    expect(diagnose(98, sh3[3], sh3, 3)).toBe('two-digit-big');
    expect(diagnose(245, sh3[1], sh3, 3)).toBe('boundary');
    expect(diagnose(252, sh3[0], sh3, 3)).toBe('boundary');
    expect(diagnose(400, sh3[0], sh3, 3)).toBe('next-shelf');
    expect(diagnose(820, sh3[0], sh3, 3)).toBe('symbol-flip');
  });
});

describe('stages', () => {
  it('move on every BOOKS_PER_STAGE right answers and stop at 3', () => {
    expect(stageAfter(1, 0)).toBe(1);
    expect(stageAfter(1, BOOKS_PER_STAGE)).toBe(2);
    expect(stageAfter(1, BOOKS_PER_STAGE * 2)).toBe(3);
    expect(stageAfter(2, 999)).toBe(3);
  });
});

describe('power-ups', () => {
  it('start with the Shush Bell only', () => {
    const p = startingPowers();
    expect(p.bell).toBe(1);
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBe(1);
  });
  it('offer three different choices and never a maxed power', () => {
    const r = mulberry32(4);
    const p = startingPowers();
    p.bell = MAX_LEVEL;
    for (let k = 0; k < 200; k++) {
      const c = offerChoices(p, r);
      expect(c.length).toBe(3);
      expect(new Set(c).size).toBe(3);
      expect(c).not.toContain('bell');
    }
  });
  it('fill with snacks when almost everything is maxed', () => {
    const p = startingPowers();
    for (const k of Object.keys(p) as Array<keyof typeof p>) p[k] = MAX_LEVEL;
    p.cocoa = 2;
    expect(offerChoices(p, mulberry32(1))).toEqual(['cocoa', 'snack', 'snack']);
  });
  it('stats grow with levels and level-ups get slowly longer', () => {
    const a = stats(startingPowers());
    const p = startingPowers();
    p.cart = 5;
    p.sneakers = 3;
    p.bell = 5;
    const b = stats(p);
    expect(b.capacity).toBeGreaterThan(a.capacity);
    expect(b.speed).toBeGreaterThan(a.speed);
    expect(b.bellEvery).toBeLessThan(a.bellEvery);
    expect(b.bellRadius).toBeGreaterThan(a.bellRadius);
    expect(booksForLevel(1)).toBeLessThanOrEqual(booksForLevel(8));
  });
});
