import { describe, expect, it } from 'vitest';
import { bestDesign } from '../src/kit/craft/workbench';
import { mulberry32 } from '../src/kit/core/rng';
import { TRASH, TRASH_IDS } from '../src/kit/worlds/wild-lands/coast-art';
import { bank, binFor, isMaterial, makeQuestion, MATERIALS, RECIPES, sortWhy, STATIONS, TIERS, type RecipeId } from '../src/games/pollution-solution-squad/problems';

describe('Pollution Solution Squad questions', () => {
  for (const s of STATIONS)
    describe(s, () => {
      it('has six questions at every level', () => {
        for (const t of TIERS) expect(bank(s).filter((d) => d.tier === t)).toHaveLength(6);
      });

      it('has unique ids, three different answers, and a reason for every wrong one', () => {
        const ids = bank(s).map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const d of bank(s)) {
          const labels = [d.right, ...d.wrong.map((w) => w[0])];
          expect(new Set(labels).size, d.id).toBe(3);
          for (const [, mis, why] of d.wrong) {
            expect(mis, d.id).toBeTruthy();
            expect(why.length, d.id).toBeGreaterThan(20);
            // a wrong answer's sentence never names the right answer
            expect(why.toLowerCase().includes(d.right.toLowerCase()), d.id).toBe(false);
          }
          expect(d.explain.length).toBeGreaterThan(30);
          expect(d.hints[0]).not.toBe(d.hints[1]);
          // short sentences (the owner's wording rule)
          for (const sentence of d.ask.split(/[.?!]\s/)) expect(sentence.split(' ').length, d.id).toBeLessThanOrEqual(26);
        }
      });

      it('builds questions with the right answer in a random place, avoiding recent ones', () => {
        const r = mulberry32(7);
        const places = new Set<number>();
        for (let i = 0; i < 40; i++) {
          const q = makeQuestion(s, TIERS[i % 3], r);
          expect(q.choices.filter((c) => c.correct)).toHaveLength(1);
          places.add(q.choices.findIndex((c) => c.correct));
        }
        expect(places.size).toBe(3);
        const pool = bank(s).filter((d) => d.tier === 1);
        const recent = pool.slice(0, 5).map((d) => d.id);
        for (let i = 0; i < 20; i++) expect(makeQuestion(s, 1, r, recent).id).toBe(pool[5].id);
      });
    });

  it('the bar graphs fit their questions', () => {
    const beach = bank('beach').find((d) => d.id === 'b-bars')!;
    if (beach.pic.k !== 'bars') throw new Error('expected bars');
    const before = beach.pic.vals.slice(0, beach.pic.mark);
    const after = beach.pic.vals.slice(beach.pic.mark);
    expect(Math.min(...before)).toBeGreaterThan(Math.max(...after) * 3);
    const harbor = bank('harbor').find((d) => d.id === 'h-graph')!;
    if (harbor.pic.k !== 'bars') throw new Error('expected bars');
    for (let i = 1; i < harbor.pic.vals.length; i++) expect(harbor.pic.vals[i]).toBeLessThan(harbor.pic.vals[i - 1]);
  });

  it('the families sum is right', () => {
    const d = bank('beach').find((x) => x.id === 'b-together')!;
    expect(d.right).toContain((200 * 10).toLocaleString('en-US'));
  });
});

describe('the sorting station', () => {
  it('keeps the crafting materials out of the bins', () => {
    for (const id of MATERIALS) {
      expect(isMaterial(id)).toBe(true);
      expect(() => binFor(id)).toThrow();
    }
  });

  it('has a bin for everything else, with a reason for the right bin and for every wrong one', () => {
    for (const id of TRASH_IDS.filter((x) => !isMaterial(x) && x !== 'tire')) {
      const right = binFor(id);
      expect(['recycle', 'compost', 'trash', 'hazard']).toContain(right);
      expect(sortWhy(id, right).length, id).toBeGreaterThan(20);
      for (const b of ['recycle', 'compost', 'trash', 'hazard'] as const) if (b !== right) expect(sortWhy(id, b).length, `${id} in ${b}`).toBeGreaterThan(20);
    }
    expect(binFor('can')).toBe('recycle');
    expect(binFor('peel')).toBe('compost');
    expect(binFor('battery')).toBe('hazard');
    expect(binFor('wrapper')).toBe('trash');
  });
});

describe('the blueprints', () => {
  for (const id of Object.keys(RECIPES) as RecipeId[])
    it(`${id}: three designs, one that works, made from things found as trash`, () => {
      const r = RECIPES[id];
      expect(r.designs).toHaveLength(3);
      expect(bestDesign(r).outcome).toBe('works');
      for (const m of Object.keys(r.needs)) expect(TRASH).toHaveProperty(m);
      for (const d of r.designs) expect(d.why.length).toBeGreaterThan(40);
      expect(r.goals.length).toBeGreaterThanOrEqual(2);
    });
});

import { parseLevel } from '../src/kit/scroller/physics';
import { CAMP, LEVELS, LITTER, LOT } from '../src/games/pollution-solution-squad/levels';
import { canAfford, NATURE_COST, pay, placeProblem, unlocked, visitors } from '../src/games/pollution-solution-squad/nature';
import { cleanSave, freshSave } from '../src/games/pollution-solution-squad/save';
import { NATURE_IDS } from '../src/kit/worlds/wild-lands/coast-art';

describe('the levels', () => {
  for (const def of LEVELS)
    it(`${def.id}: a start, a flag, a stake for every fix, and the materials for every fix`, () => {
      const lv = parseLevel(def.rows);
      const kinds = lv.things.map((t) => t.kind);
      expect(kinds.filter((k) => k === 'F')).toHaveLength(1);
      expect(kinds.filter((k) => k === 'X')).toHaveLength(def.builds.length);
      expect(kinds.filter((k) => k === 'W').length).toBeGreaterThanOrEqual(1);
      // the trash in this level (and the ghost nets, which give a net and a rope each) covers what the fixes need
      const have: Record<string, number> = {};
      for (const t of lv.things) {
        const id = LITTER[t.kind];
        if (id) have[id] = (have[id] ?? 0) + 1;
        if (t.kind === 'G') {
          have.net = (have.net ?? 0) + 1;
          have.rope = (have.rope ?? 0) + 1;
        }
      }
      const need: Record<string, number> = {};
      for (const r of def.builds) for (const [m, n] of Object.entries(RECIPES[r].needs)) need[m] = (need[m] ?? 0) + n;
      for (const [m, n] of Object.entries(need)) expect(have[m] ?? 0, `${def.id} needs ${n} ${m}`).toBeGreaterThanOrEqual(n);
      // every thing stands on something (ground, a ledge or water)
      for (const t of lv.things.filter((x) => x.kind !== 'u')) expect(lv.map.get(t.x, t.y + 1), `${def.id} ${t.kind} at ${t.x}`).not.toBe(0);
    });

  it('the camp has everyone, and the lot is plain ground', () => {
    const kinds = parseLevel(CAMP.rows).things.map((t) => t.kind);
    for (const k of 'MRSJQNT') expect(kinds).toContain(k);
    const lv = parseLevel(CAMP.rows);
    for (let x = LOT.x0; x <= LOT.x1; x++) expect(lv.map.get(x, 10)).toBe(1);
  });
});

describe('the Nature Center rules', () => {
  it('unlocks pieces as levels are finished', () => {
    expect(unlocked([])).toEqual([]);
    expect(unlocked(['beach-1'])).toContain('beachgrass');
    expect(unlocked(LEVELS.map((l) => l.id)).length).toBe(14);
  });

  it('charges materials, and gives them back', () => {
    expect(canAfford({}, 'birdbox')).toBe(false);
    expect(canAfford({ wood: 2 }, 'birdbox')).toBe(true);
    const after = pay({ wood: 3 }, 'birdbox');
    expect(after.wood).toBe(1);
    expect(pay(after, 'birdbox', -1).wood).toBe(3);
    expect(canAfford({}, 'milkweed')).toBe(true);
    for (const id of NATURE_IDS) expect(NATURE_COST[id]).toBeDefined();
  });

  it('keeps pond plants in the pond and everything else on dry ground', () => {
    expect(placeProblem([], 'cattails', LOT.pond[0])).toBeNull();
    expect(placeProblem([], 'cattails', 3)).toMatch(/pond/);
    expect(placeProblem([], 'bench', LOT.pond[0] - 1)).toMatch(/pond/);
    expect(placeProblem([], 'milkweed', 3)).toBeNull();
    expect(placeProblem([{ id: 'milkweed', x: 3 }], 'sunflower', 3)).toMatch(/already/);
    expect(placeProblem([], 'milkweed', LOT.x1)).toMatch(/fit/);
    expect(visitors([{ id: 'milkweed', x: 3 }])).toEqual(['butterfly']);
  });
});

describe('the save', () => {
  it('cleans a broken or tampered save', () => {
    expect(cleanSave(null)).toMatchObject({ levelsDone: [], bag: {} });
    const s = cleanSave({ levelsDone: ['beach-1', 'nope'], bag: { wood: 5, gold: 9, bottle: -3 }, stars: { beach: 99 }, nature: [{ id: 'milkweed', x: 3 }, { id: 'castle', x: 2 }, { id: 'bench', x: 500 }], tried: { 'drain-net': ['big', 'huge'] } });
    expect(s.levelsDone).toEqual(['beach-1']);
    expect(s.bag).toEqual({ wood: 5 });
    expect(s.stars.beach).toBe(5);
    expect(s.nature).toEqual([{ id: 'milkweed', x: 3 }]);
    expect(s.tried['drain-net']).toEqual(['big']);
    expect(freshSave().appearance.outfit).toBe('green');
  });
});
