import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { chipScore, FACES, makeArcade, makeBlocks, makeRush, makeShape, onCorner, SIDES, THING, TIERS } from '../src/games/geometry-builder-challenge/problems';

const checkChoices = (choices: { value: string; correct: boolean; misconception?: string }[]) => {
  expect(choices.length).toBeGreaterThanOrEqual(2);
  expect(choices.filter((c) => c.correct)).toHaveLength(1);
  expect(new Set(choices.map((c) => c.value)).size).toBe(choices.length);
  for (const c of choices) if (!c.correct) expect(c.misconception).toBeTruthy();
};

describe('shapes', () => {
  it('draws the right number of corners, inside the box', () => {
    for (const kind of ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'octagon', 'rhombus', 'parallelogram'] as const)
      for (let seed = 1; seed < 40; seed++) {
        const s = makeShape(kind, mulberry32(seed), { turn: seed, irregular: seed % 2 === 0, skinny: seed % 3 === 0 });
        expect(s.pts).toHaveLength(SIDES[kind]);
        for (const [x, y] of s.pts) {
          expect(Math.abs(x)).toBeLessThanOrEqual(1.0001);
          expect(Math.abs(y)).toBeLessThanOrEqual(1.0001);
        }
      }
    expect(makeShape('circle', mulberry32(1)).pts).toHaveLength(0);
  });
  it('knows when a square stands on its corner', () => {
    expect(onCorner(makeShape('square', mulberry32(1), { turn: Math.PI / 4 }))).toBe(true);
    expect(onCorner(makeShape('square', mulberry32(1)))).toBe(false);
  });
});

describe("Kofi's Shape Sorting Arcade", () => {
  it('every level makes a fair question with one right bin', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 400; seed++) {
        const p = makeArcade(tier, mulberry32(seed * 7 + tier));
        checkChoices(p.choices);
        expect(p.explain.length).toBeGreaterThan(10);
        expect(p.shapes.length === 1 || p.shapes.length === 3).toBe(true);
        const right = p.choices.find((c) => c.correct)!.value;
        if (p.kind === 'name') expect(right).toBe(p.shapes[0].kind);
        if (p.kind === 'count') expect(Number(right)).toBe(SIDES[p.shapes[0].kind]);
        if (p.kind === 'closed') {
          const s = p.shapes[0];
          const real = !s.open && !s.curved && s.kind !== 'parallelogram';
          expect(right.startsWith('Yes')).toBe(real);
        }
      }
  });
  it('a turned square is always a square, never a diamond', () => {
    let seen = 0;
    for (let seed = 1; seed < 300; seed++) {
      const p = makeArcade(1, mulberry32(seed));
      if (p.kind === 'name' && onCorner(p.shapes[0])) {
        seen++;
        expect(p.choices.find((c) => c.correct)!.value).toBe('square');
        expect(p.choices.find((c) => c.value === 'diamond')?.misconception).toBe('turned-not-same');
      }
    }
    expect(seen).toBeGreaterThan(10);
  });
  it('level 3 teaches that a square is a rectangle', () => {
    let seen = 0;
    for (let seed = 1; seed < 600; seed++) {
      const p = makeArcade(3, mulberry32(seed));
      if (p.kind === 'rule' && p.prompt.includes('4 square corners') && p.shapes[0].kind === 'square') {
        seen++;
        expect(p.choices.find((c) => c.correct)!.value).toMatch(/^Yes/);
        expect(p.choices.find((c) => !c.correct)!.misconception).toBe('square-not-rectangle');
      }
      if (p.kind === 'odd' && p.prompt.includes('rectangle')) {
        const odd = p.shapes[p.choices.findIndex((c) => c.correct)];
        expect(['rhombus', 'parallelogram']).toContain(odd.kind);
      }
    }
    expect(seen).toBeGreaterThan(3);
  });
  it('rush questions stay quick, and Chip is beatable', () => {
    for (let seed = 1; seed < 100; seed++) expect(['name', 'count']).toContain(makeRush(3, mulberry32(seed)).kind);
    expect(chipScore(60)).toBeGreaterThan(10);
    expect(chipScore(60)).toBeLessThan(20);
  });
});

describe("Lupe's Block Shop", () => {
  it('every level makes a fair question with one right answer', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 400; seed++) {
        const p = makeBlocks(tier, mulberry32(seed * 11 + tier));
        checkChoices(p.choices);
        const right = p.choices.find((c) => c.correct)!.value;
        if (p.kind === 'name') expect(right).toBe(p.picture.solid);
        if (p.kind === 'faces') expect(Number(right)).toBe(FACES[p.picture.solid!]);
        if (p.kind === 'thing') expect(right).toBe(THING[p.picture.thing!].solid);
        if (p.kind === 'flat-solid') expect(right).toBe(p.picture.solid ? 'Solid' : 'Flat');
      }
  });
  it('counting only the faces you can see is a named mistake', () => {
    let seen = 0;
    for (let seed = 1; seed < 300; seed++) {
      const p = makeBlocks(3, mulberry32(seed));
      if (p.kind === 'faces' && p.picture.solid === 'cube') {
        seen++;
        expect(p.choices.find((c) => c.value === '3')?.misconception).toBe('visible-faces-only');
      }
    }
    expect(seen).toBeGreaterThan(5);
  });
  it('a cone face is a circle, not a triangle', () => {
    for (let seed = 1; seed < 300; seed++) {
      const p = makeBlocks(3, mulberry32(seed));
      if (p.kind === 'face-shape' && p.picture.solid === 'cone') {
        expect(p.choices.find((c) => c.correct)!.value).toBe('circle');
        expect(p.choices.find((c) => c.value === 'triangle')?.misconception).toBe('side-view');
      }
    }
  });
});
