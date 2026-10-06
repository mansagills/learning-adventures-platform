import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { area, BLUEPRINTS, chipScore, COMPOSITIONS, countPieces, FACES, fence, makeArcade, makeBlocks, makeBlueprint, makeGarden, makeProblem, makeRush, makeShape, onCorner, OPEN_STATIONS, SIDES, STATIONS, stepsOf, THING, TIERS } from '../src/games/geometry-builder-challenge/problems';

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

describe("Mr. Haruto's Blueprint Workshop", () => {
  it('blueprints are drawn inside the box, and squares are square', () => {
    for (const bp of BLUEPRINTS)
      for (const p of bp.pieces) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x + p.w).toBeLessThanOrEqual(64);
        expect(p.y + p.h).toBeLessThanOrEqual(64);
        if (p.kind === 'square' || p.kind === 'circle') expect(p.w).toBe(p.h);
      }
    // the original five, with their counts: 1 triangle roof, 2 squares for the robot's body (plus its head), 4 wheels, 4 towers, 3 leaves
    const bp = (id: string) => BLUEPRINTS.find((b) => b.id === id)!;
    expect(countPieces(bp('house'), 'triangle')).toBe(1);
    expect(countPieces(bp('robot'), 'square')).toBe(3);
    expect(countPieces(bp('car'), 'circle')).toBe(4);
    expect(countPieces(bp('castle'), 'rectangle')).toBe(4);
    expect(countPieces(bp('tree'), 'circle')).toBe(3);
  });
  it('the pieces of every composition cover the big shape exactly', () => {
    const polyArea = (pts: Array<[number, number]>) => Math.abs(pts.reduce((s, [x, y], i) => s + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * y, 0)) / 2;
    for (const c of COMPOSITIONS) expect(polyArea(c.pieceShape) * c.count).toBeCloseTo(polyArea(c.outline), 6);
  });
  it('every level makes a fair question whose answer matches the picture', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 400; seed++) {
        const p = makeBlueprint(tier, mulberry32(seed * 11 + tier));
        checkChoices(p.choices);
        expect(p.choices).toHaveLength(3);
        const right = Number(p.choices.find((c) => c.correct)!.value);
        if (p.kind === 'count') {
          expect(right).toBe(countPieces(p.picture.blueprint!, p.picture.ask!));
          // never ask about rectangles when squares are in the picture (a square is a rectangle too)
          if (p.picture.ask === 'rectangle') expect(countPieces(p.picture.blueprint!, 'square')).toBe(0);
        }
        if (p.kind === 'compose') expect(right).toBe(p.picture.comp!.count);
        if (p.kind === 'grid' || p.kind === 'edge') expect(right).toBe(p.picture.grid!.rows * p.picture.grid!.cols);
      }
  });
  it("missing the car's back wheels is caught", () => {
    let seen = 0;
    for (let seed = 1; seed < 400; seed++) {
      const p = makeBlueprint(1, mulberry32(seed));
      if (p.kind === 'count' && p.picture.blueprint!.id === 'car' && p.picture.ask === 'circle') {
        seen++;
        expect(p.choices.find((c) => c.value === '2')?.misconception).toBe('missed-piece');
      }
    }
    expect(seen).toBeGreaterThan(5);
  });
});

describe("Priya's Garden Yard", () => {
  it('every level makes a fair question with the right area or fence', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 400; seed++) {
        const p = makeGarden(tier, mulberry32(seed * 13 + tier));
        const steps = stepsOf(p);
        for (const st of steps) {
          checkChoices(st.choices);
          expect(st.choices).toHaveLength(3);
        }
        const right = steps[steps.length - 1].choices.find((c) => c.correct)!.value;
        const pic = p.picture;
        if (pic.kind === 'grid' || (pic.kind === 'rect' && p.kind !== 'missing')) expect(Number(right)).toBe(p.kind.endsWith('area') ? area(pic.w, pic.h) : fence(pic.w, pic.h));
        if (p.kind === 'missing' && pic.kind === 'rect') expect(Number(right)).toBe(pic.w);
        if (pic.kind === 'L') {
          expect(steps).toHaveLength(3);
          expect(Number(right)).toBe(pic.W * pic.H - (pic.W - pic.a) * (pic.H - pic.b));
          expect(pic.a).toBeLessThan(pic.W);
          expect(pic.b).toBeLessThan(pic.H);
        }
        if (pic.kind === 'pair') {
          expect(area(...pic.A)).toBe(area(...pic.B));
          expect(fence(...pic.A)).not.toBe(fence(...pic.B));
          expect(right).toBe(fence(...pic.A) > fence(...pic.B) ? 'A' : 'B');
        }
      }
  });
  it('swapping area and fence is always a tagged wrong answer', () => {
    for (let seed = 1; seed < 200; seed++) {
      const p = makeGarden(2, mulberry32(seed));
      if (p.picture.kind !== 'rect') continue;
      const swap = String(p.kind === 'rect-area' ? fence(p.picture.w, p.picture.h) : area(p.picture.w, p.picture.h));
      const c = p.choices.find((x) => x.value === swap);
      if (c && !c.correct) expect(c.misconception).toBe('area-perimeter-swap');
    }
  });
});

describe('the whole yard', () => {
  it('all four stations are open and make questions at every level', () => {
    expect(OPEN_STATIONS).toEqual(STATIONS);
    for (const s of STATIONS) for (const tier of TIERS) for (let seed = 1; seed < 50; seed++) checkChoices(makeProblem(s, tier, mulberry32(seed)).choices);
  });
});
