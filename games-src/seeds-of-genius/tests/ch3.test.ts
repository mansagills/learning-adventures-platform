import { describe, expect, it } from 'vitest';
import {
  BENCH,
  CROPS,
  CROP_ORDER,
  EXAMPLE_PLAN,
  FARMER_PLAN,
  PLOTS,
  WEST_START,
  judgePlan,
  simulate,
  soilLabel,
  type CropId,
} from '../src/chapters/ch3/data';
import { addTested, bothPlotsDone, ch3State, comparedPlans } from '../src/chapters/ch3/state';
import runtime from '../src/chapters/ch3/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { ITEMS } from '../src/content/items';
import { MEMORIES } from '../src/content/memories';
import { freshSave } from '../src/systems/save';
import { buildFarmMap, buildHubMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { hasPainting } from '../src/art/sceneArt';
import type { RuntimeContext } from '../src/quests/runtime';

const ALL_PLANS: CropId[][] = [];
for (const a of CROP_ORDER) for (const b of CROP_ORDER) for (const c of CROP_ORDER) for (const d of CROP_ORDER) ALL_PLANS.push([a, b, c, d]);

function ctxWith(data: Record<string, unknown>, items: string[] = ['soil_samples', 'crop_history', 'crop_cards']) {
  const save = freshSave();
  for (const id of ['practice', 'ch1', 'ch2']) save.progress.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch3' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  return { engine, save, data, learner: save.learner } as unknown as RuntimeContext;
}
const LOOKED_ALL = { west: ['color', 'crust', 'life'], east: ['color', 'worm', 'nodules'] };

describe('Chapter 3 soil model', () => {
  it("Mr. Hill's plan (cotton every season) wears the west plot out, and each cotton harvest shrinks", () => {
    const r = simulate(FARMER_PLAN);
    expect(r.start).toBe(WEST_START);
    expect(soilLabel(r.start)).toBe('tired');
    expect(soilLabel(r.end)).toBe('worn out');
    for (let i = 1; i < 4; i++) expect(r.seasons[i].harvest).toBeLessThan(r.seasons[i - 1].harvest);
    expect(judgePlan(r)).toBe('no-legume');
  });

  it('the worked example rotates with legumes: soil ends higher and more cotton is picked in all', () => {
    const r = simulate(EXAMPLE_PLAN);
    const f = simulate(FARMER_PLAN);
    expect(judgePlan(r)).toBe('ok');
    expect(r.end).toBeGreaterThan(r.start);
    const cotton = (x: typeof r) => x.seasons.filter((s) => s.crop === 'cotton').reduce((a, s) => a + s.harvest, 0);
    expect(cotton(r)).toBeGreaterThan(cotton(f));
  });

  it('never restores soil instantly: no season adds more than a little, for all 256 plans', () => {
    const maxGain = Math.max(...CROP_ORDER.map((c) => CROPS[c].soil));
    expect(maxGain).toBeLessThanOrEqual(9);
    for (const p of ALL_PLANS) {
      const r = simulate(p);
      for (const s of r.seasons) expect(s.soilAfter - s.soilBefore).toBeLessThanOrEqual(maxGain);
      // Even four legume seasons in a row cannot make the tired plot "healthy" plus a lot.
      expect(r.end).toBeLessThanOrEqual(WEST_START + 4 * maxGain);
    }
  });

  it('every plan that passes grows cotton, includes a legume and does not let the soil fall', () => {
    const passing = ALL_PLANS.filter((p) => judgePlan(simulate(p)) === 'ok');
    expect(passing.length).toBeGreaterThan(10); // many right answers, not one memorized plan
    for (const p of passing) {
      const r = simulate(p);
      expect(p).toContain('cotton');
      expect(p.some((c) => CROPS[c].legume)).toBe(true);
      expect(r.end).toBeGreaterThanOrEqual(r.start);
    }
    // No plan without a legume keeps the soil from falling.
    for (const p of ALL_PLANS.filter((q) => !q.some((c) => CROPS[c].legume))) expect(simulate(p).end).toBeLessThan(WEST_START);
  });

  it('shows every harvest as a weather range, and repeats cost harvest', () => {
    for (const p of ALL_PLANS.slice(0, 64)) for (const s of simulate(p).seasons) expect(s.low <= s.harvest && s.harvest <= s.high).toBe(true);
    const afterLegume = simulate(['cowpeas', 'cotton', 'cotton', 'cotton']).seasons;
    expect(afterLegume[2].repeated).toBe(true);
    expect(afterLegume[1].repeated).toBe(false);
  });

  it('has paintings for both soil views and the Tuskegee memory', () => {
    for (const p of PLOTS) expect(hasPainting(p.art)).toBe(true);
    for (const page of MEMORIES.tuskegee_soil.pages) expect(hasPainting(page.art)).toBe(true);
    for (const p of PLOTS) for (const z of p.zones) {
      expect(z.x + z.w).toBeLessThanOrEqual(96);
      expect(z.y + z.h).toBeLessThanOrEqual(64);
    }
  });
});

describe('Chapter 3 state', () => {
  it('repairs bad saved state without losing good parts', () => {
    const st = ch3State({ looked: { west: ['color', 'nope', 'color'], east: 5 }, draft: ['cotton'], tested: [['cotton', 'cotton', 'cotton', 'cotton'], ['x']], chosen: 7, rung: 9, whyWrong: ['bored', 'nitrogen'] });
    expect(st.looked).toEqual({ west: ['color'], east: [] });
    expect(st.draft).toEqual(FARMER_PLAN);
    expect(st.tested).toEqual([FARMER_PLAN]);
    expect(st.chosen).toBeNull();
    expect(st.rung).toBe(3);
    expect(st.whyWrong).toEqual(['bored']);
  });

  it('needs both plots looked at, and needs Mr. Hill\'s plan plus a legume plan to compare', () => {
    const st = ch3State({ looked: { west: LOOKED_ALL.west, east: ['color'] } });
    expect(bothPlotsDone(st)).toBe(false);
    st.looked.east = [...LOOKED_ALL.east];
    expect(bothPlotsDone(st)).toBe(true);
    addTested(st, ['peanuts', 'cotton', 'cowpeas', 'cotton']);
    expect(comparedPlans(st)).toBe(false);
    expect(addTested(st, FARMER_PLAN)).toBe(1);
    expect(addTested(st, FARMER_PLAN)).toBe(1); // no duplicates
    expect(comparedPlans(st)).toBe(true);
  });
});

describe('Chapter 3 runtime', () => {
  it('opens the farm places only once the chapter starts and the samples are in hand', () => {
    const save = freshSave();
    const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
    expect(runtime.places({ engine, save, data: {}, learner: save.learner } as unknown as RuntimeContext)).toEqual([]);
    expect(runtime.places(ctxWith({}, []))).toEqual([]);
    const places = runtime.places(ctxWith({}));
    expect(places.map((p) => p.id)).toEqual(['plot:west', 'plot:east', 'bench']);
    expect(places.every((p) => p.scene === 'farm')).toBe(true);
    expect(places.find((p) => p.id === 'bench')!.marker).toBeNull();
  });

  it('sparkles the bench once both samples are seen, and points the objective there', () => {
    const ctx = ctxWith({ looked: LOOKED_ALL });
    expect(runtime.places(ctx).find((p) => p.id === 'bench')!.marker).toBe('sparkle');
    expect(runtime.objective!(ctx)).toMatchObject({ x: BENCH.x, y: BENCH.y, scene: 'farm' });
    const early = runtime.objective!(ctxWith({ looked: { west: LOOKED_ALL.west } }))!;
    expect(early.text).toMatch(/1\/2/);
    expect(early).toMatchObject({ x: PLOTS[1].stand.x, scene: 'farm' });
  });

  it("Carver's nudge follows what is still missing", () => {
    expect(runtime.tokens(ctxWith({}, [])).carverNudge3).toMatch(/Mr. Hill/);
    expect(runtime.tokens(ctxWith({}, ['soil_samples', 'crop_history'])).carverNudge3).toMatch(/Mae/);
    expect(runtime.tokens(ctxWith({})).carverNudge3).toMatch(/soil samples up close/);
    expect(runtime.tokens(ctxWith({ looked: LOOKED_ALL })).carverNudge3).toMatch(/Test Mr. Hill's plan/);
    expect(runtime.tokens(ctxWith({ looked: LOOKED_ALL, whyDone: true })).carverNudge3).toMatch(/choose the plan/);
  });

  it("Carver's debrief compares the player's own plan with cotton every season", () => {
    const plan: CropId[] = ['cotton', 'peanuts', 'cotton', 'cowpeas'];
    const t = runtime.tokens(ctxWith({ tested: [FARMER_PLAN, plan], chosen: 1, whyDone: true }));
    expect(t.planText).toBe('cotton, peanuts, cotton, cowpeas');
    expect(t.planCompare).toMatch(/from 28 down to 5: worn out/);
    expect(t.planCompare).toMatch(/Your plan ends at 31/);
    expect(t.cottonCompare).toMatch(/plants cotton 2 times/);
  });
});

describe('Hilltop Farm fields', () => {
  it('can reach both plots, the bench and the way out from the gate', () => {
    const map = buildFarmMap();
    const grid = new CollisionGrid(map);
    expect(grid.isFree(map.entry!.x, map.entry!.y, 0.28)).toBe(true);
    for (const p of PLOTS) {
      expect(grid.isFree(p.stand.x, p.stand.y, 0.28), p.id).toBe(true);
      expect(findPath(grid, map.entry!, p.stand), p.id).not.toBeNull();
    }
    expect(findPath(grid, map.entry!, { x: BENCH.x + 0.4, y: BENCH.y + 0.4 })).not.toBeNull();
    for (const p of map.places) expect(findPath(grid, map.entry!, p), p.id).not.toBeNull();
  });

  it('the hub has a farm gate the objective arrow can point at', () => {
    expect(buildHubMap().places.some((p) => p.id === 'farm_door')).toBe(true);
    expect(buildFarmMap().exit!.to).toBe('hub');
  });
});
