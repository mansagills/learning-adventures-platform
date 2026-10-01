import { describe, expect, it } from 'vitest';
import { BENCH, MAIN_SPOTS, SPOTS, buildDeck, cardFor } from '../src/chapters/ch1/data';
import { ch1State } from '../src/chapters/ch1/state';
import runtime from '../src/chapters/ch1/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { ITEMS } from '../src/content/items';
import { MEMORIES } from '../src/content/memories';
import { freshSave } from '../src/systems/save';
import { buildHubMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { NPCS } from '../src/content/npcs';
import type { RuntimeContext } from '../src/quests/runtime';

function ctxWith(data: Record<string, unknown>, items: string[] = ['field_notebook', 'magnifying_lens']) {
  const save = freshSave();
  save.progress.chapters.practice = { stage: 'complete', stepsDone: ['get_seeds'], flags: [], rewarded: true };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch1' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  const ctx = { engine, save, data, learner: save.learner } as unknown as RuntimeContext;
  return ctx;
}

describe('Chapter 1 data', () => {
  it('every spot has details that really appear in its observation, and guess words in its guess', () => {
    for (const s of SPOTS) {
      for (const d of s.observation.details) expect(s.observation.text.toLowerCase(), s.id).toContain(d.toLowerCase());
      for (const w of s.guess.guessWords) expect(s.guess.text.toLowerCase(), s.id).toContain(w.toLowerCase());
      expect(s.zones.length).toBeGreaterThanOrEqual(2);
      for (const z of s.zones) {
        expect(z.x + z.w).toBeLessThanOrEqual(96);
        expect(z.y + z.h).toBeLessThanOrEqual(64);
      }
    }
  });

  it("builds a balanced, reproducible 8-card deck with the player's own notes first", () => {
    const a = buildDeck(['soil', 'bee', 'beans'], 42);
    const b = buildDeck(['soil', 'bee', 'beans'], 42);
    expect(a).toEqual(b);
    expect(a).toHaveLength(8);
    expect(a.filter((c) => c.startsWith('obs:'))).toHaveLength(4);
    expect(a.filter((c) => c.startsWith('guess:'))).toHaveLength(4);
    for (const id of ['obs:soil', 'obs:bee', 'obs:beans']) expect(a).toContain(id);
    for (const id of a) expect(cardFor(id)).toBeDefined();
    expect(buildDeck(['soil'], 7)).not.toEqual(a);
  });

  it('observation cards answer "obs", guess cards answer "guess"', () => {
    expect(cardFor('obs:bee')!.answer).toBe('obs');
    expect(cardFor('guess:bee')!.answer).toBe('guess');
    expect(cardFor('nope:bee')?.answer).toBe('guess');
    expect(cardFor('obs:nothing')).toBeUndefined();
  });

  it('repairs bad saved state without losing good parts', () => {
    const st = ch1State({ spots: { beans: { looked: ['holes', 3], recorded: true }, bad: 5 }, observations: [{ spot: 'beans', text: 'x' }, 'junk'], sort: { placed: { 'obs:bee': 'obs', 'x': 'maybe' }, rung: 9 } });
    expect(st.spots.beans).toEqual({ looked: ['holes'], recorded: true, tries: 0 });
    expect(st.spots.bad).toBeUndefined();
    expect(st.observations).toHaveLength(1);
    expect(st.sort!.placed).toEqual({ 'obs:bee': 'obs' });
    expect(st.sort!.rung).toBe(3);
    expect(typeof st.seed).toBe('number');
  });

  it('the childhood memory is labeled with a place and time and never shows adult Carver', () => {
    const m = MEMORIES.childhood;
    expect(m.setting).toMatch(/Missouri/);
    expect(m.pages.length).toBeGreaterThanOrEqual(3);
    expect(m.pages.map((p) => p.caption).join(' ')).toMatch(/born into slavery around 1864/);
  });
});

describe('Chapter 1 runtime', () => {
  it('shows no garden spots until both tools are collected', () => {
    expect(runtime.places(ctxWith({}, ['field_notebook']))).toEqual([]);
    const places = runtime.places(ctxWith({}));
    expect(places.filter((p) => p.marker === 'sparkle').map((p) => p.id)).toEqual(MAIN_SPOTS.map((s) => `spot:${s.id}`));
    expect(places.filter((p) => p.marker === 'faint')).toHaveLength(2);
    expect(places.find((p) => p.id === 'bench')!.marker).toBeNull(); // needs 3 observations
  });

  it('points the objective at a spot, then at the bench after 3 observations', () => {
    const data: Record<string, unknown> = {};
    const ctx = ctxWith(data);
    expect(runtime.objective!(ctx)!.text).toMatch(/0\/3/);
    const st = ch1State(data);
    ['beans', 'soil', 'bee'].forEach((id) => {
      st.spots[id] = { looked: ['a'], recorded: true, tries: 0 };
      st.observations.push({ spot: id, text: SPOTS.find((s) => s.id === id)!.observation.text });
    });
    expect(runtime.objective!(ctx)).toMatchObject({ x: BENCH.x, y: BENCH.y });
    expect(runtime.places(ctx).find((p) => p.id === 'bench')!.marker).toBe('sparkle');
  });

  it("gives Carver tokens that reflect the player's own notes and mistakes", () => {
    const data: Record<string, unknown> = { observations: [{ spot: 'bee', text: 'A bee with yellow pollen.' }], firstSortMistakes: 2 };
    const t = runtime.tokens(ctxWith(data));
    expect(t.obsFirst).toBe('A bee with yellow pollen.');
    expect(t.sortReflection).toMatch(/moved 2 cards/);
    const t0 = runtime.tokens(ctxWith({ observations: [], firstSortMistakes: 0 }, []));
    expect(t0.carverNudge).toMatch(/Hattie/);
    expect(t0.sortReflection).toMatch(/first time/);
  });

  it('every spot and the bench can be reached on foot', () => {
    const map = buildHubMap();
    const grid = new CollisionGrid(map);
    NPCS.forEach((n) => grid.setDynamic(n.id, [[Math.floor(n.pos.x), Math.floor(n.pos.y)]]));
    for (const p of [...SPOTS, BENCH]) expect(findPath(grid, map.spawn, p), JSON.stringify(p)).not.toBeNull();
  });
});
