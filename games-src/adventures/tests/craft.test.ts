import { describe, expect, it } from 'vitest';
import { add, bestDesign, canCraft, count, craft, design, missing, missingText, takeDown, type Recipe } from '../src/kit/craft/workbench';
import { DRAIN_NET, MATERIAL_NAME } from '../src/kit/worlds/wild-lands/coast-craft';
import { NATURE, NATURE_IDS, TRASH, visitorsFor } from '../src/kit/worlds/wild-lands/coast-art';

const R: Recipe = {
  id: 'box',
  name: 'Box',
  needs: { wood: 2, rope: 1 },
  goals: ['Hold things'],
  limits: ['Wood only'],
  designs: [
    { id: 'a', name: 'A', note: '', outcome: 'works', why: '' },
    { id: 'b', name: 'B', note: '', outcome: 'half', why: '' },
  ],
};

describe('the backpack and recipes', () => {
  it('adds without changing the old backpack', () => {
    const a = { wood: 1 };
    const b = add(a, 'wood', 2);
    expect(count(a, 'wood')).toBe(1);
    expect(count(b, 'wood')).toBe(3);
    expect(count(b, 'rope')).toBe(0);
  });

  it('says what is missing, and crafts only when nothing is', () => {
    expect(missing({ wood: 1 }, R)).toEqual({ wood: 1, rope: 1 });
    expect(canCraft({ wood: 1 }, R)).toBe(false);
    expect(() => craft({ wood: 1 }, R)).toThrow();
    const inv = { wood: 3, rope: 1, can: 2 };
    expect(canCraft(inv, R)).toBe(true);
    expect(craft(inv, R)).toEqual({ wood: 1, rope: 0, can: 2 });
  });

  it('gives the materials back when a fix is taken down', () => {
    const built = craft({ wood: 2, rope: 1 }, R);
    expect(takeDown(built, R)).toEqual({ wood: 2, rope: 1 });
  });

  it('finds designs and the one that works', () => {
    expect(design(R, 'b').outcome).toBe('half');
    expect(() => design(R, 'z')).toThrow();
    expect(bestDesign(R).id).toBe('a');
    expect(() => bestDesign({ ...R, designs: R.designs.map((d) => ({ ...d, outcome: 'works' as const })) })).toThrow();
  });

  it('writes what is missing in plain words', () => {
    expect(missingText({ wood: 2 }, { wood: 'Scrap wood' })).toBe('2 scrap wood');
    expect(missingText({ wood: 2, net: 1, rope: 1 }, MATERIAL_NAME)).toBe('2 scrap wood, 1 old fishing net and 1 old rope');
  });
});

describe('the drain net blueprint', () => {
  it('has three designs and exactly one that works (medium holes)', () => {
    expect(DRAIN_NET.designs).toHaveLength(3);
    expect(bestDesign(DRAIN_NET).id).toBe('medium');
    for (const d of DRAIN_NET.designs) expect(d.why.length).toBeGreaterThan(30);
  });

  it('is made only from things found as trash on the beach, with goals and limits', () => {
    for (const id of Object.keys(DRAIN_NET.needs)) expect(TRASH).toHaveProperty(id);
    expect(DRAIN_NET.goals.length).toBeGreaterThanOrEqual(2);
    expect(DRAIN_NET.limits.length).toBeGreaterThanOrEqual(1);
  });
});

describe('the Nature Center', () => {
  it('has a card for every piece', () => {
    for (const id of NATURE_IDS) {
      expect(NATURE[id].helps.length).toBeGreaterThan(20);
      expect(NATURE[id].w).toBeGreaterThanOrEqual(1);
    }
  });

  it('brings visitors for what is built', () => {
    expect(visitorsFor([], false)).toEqual([]);
    expect(visitorsFor(['milkweed'], false)).toEqual(['butterfly']);
    expect(visitorsFor(['sunflower', 'birdbox'], false).sort()).toEqual(['bee', 'wren']);
    // pond animals need the pond (and the heron needs plenty of cattails to hide among)
    expect(visitorsFor(['cattails'], false)).toEqual([]);
    expect(visitorsFor(['cattails'], true)).toEqual(['frog']);
    expect(visitorsFor(['cattails', 'cattails'], true).sort()).toEqual(['frog', 'heron']);
  });
});
