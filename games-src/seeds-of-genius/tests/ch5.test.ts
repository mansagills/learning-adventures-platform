import { describe, expect, it } from 'vitest';
import {
  EXAMPLE,
  FARMER_ORDER,
  FARMERS,
  OPTION_ORDER,
  OPTIONS,
  SPOTS,
  TABLE,
  goodPairs,
  judgePlan,
  reasonOptions,
  whyFor,
} from '../src/chapters/ch5/data';
import { bothHelped, ch5State, looksDone, triedFertilizer } from '../src/chapters/ch5/state';
import runtime from '../src/chapters/ch5/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { CONVERSATIONS } from '../src/content/conversations';
import { ITEMS } from '../src/content/items';
import { MEMORIES } from '../src/content/memories';
import { NPCS } from '../src/content/npcs';
import { freshSave, SaveStore, type StorageLike } from '../src/systems/save';
import { buildCreekMap, buildHubMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { hasPainting } from '../src/art/sceneArt';
import type { RuntimeContext } from '../src/quests/runtime';

const ITEMS5 = ['farm_report_a', 'farm_report_b', 'resource_map'];

function ctxWith(data: Record<string, unknown>, items: string[] = ITEMS5) {
  const save = freshSave();
  for (const id of ['practice', 'ch1', 'ch2', 'ch3', 'ch4']) save.progress.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch5' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  return { engine, save, data, learner: save.learner } as unknown as RuntimeContext;
}
const LOOKED = ['gully', 'cow', 'muck', 'leaves'];

describe('Chapter 5 recommendations', () => {
  it('has more than one fitting plan per farmer, and they differ between farmers', () => {
    const key = (p: string[]) => [...p].sort().join('+');
    const watts = goodPairs('watts').map(key);
    const pryor = goodPairs('pryor').map(key);
    expect(watts.sort()).toEqual(['compost+contour', 'contour+cowpeas']);
    expect(pryor.sort()).toEqual(['compost+cowpeas', 'compost+garden', 'cowpeas+garden']);
    expect(watts.some((p) => pryor.includes(p))).toBe(false);
    for (const f of FARMER_ORDER) expect(judgePlan(f, EXAMPLE[f]).passes, f).toBe(true);
  });

  it('checks every one of the 15 pairs for both farmers and always explains the result', () => {
    for (const f of FARMER_ORDER)
      OPTION_ORDER.forEach((a, i) =>
        OPTION_ORDER.slice(i + 1).forEach((b) => {
          const r = judgePlan(f, [a, b]);
          expect(r.summary.length).toBeGreaterThan(20);
          for (const p of r.picks) expect(p.why.length, `${f} ${p.id}`).toBeGreaterThan(20);
          if (!r.passes) expect(r.picks.some((p) => p.verdict !== 'fits') || r.missing.length > 0).toBe(true);
        }),
      );
  });

  it('explains the tempting store fertilizer instead of just marking it wrong', () => {
    expect(OPTIONS.fertilizer.tempting).toBe(true);
    for (const f of FARMER_ORDER) {
      const w = whyFor(f, 'fertilizer');
      expect(w.verdict).toBe('impractical');
      expect(w.why).toMatch(/money|\$12/);
      expect(w.why).toMatch(/next year/);
      // Even paired with a good card, the plan does not pass and says why.
      const r = judgePlan(f, ['fertilizer', f === 'watts' ? 'contour' : 'garden']);
      expect(r.passes).toBe(false);
      expect(r.summary).toMatch(/cannot really do/);
    }
  });

  it("matches each farmer's own limits", () => {
    expect(whyFor('watts', 'wall').why).toMatch(/alone/);
    expect(whyFor('pryor', 'contour').verdict).toBe('not-needed');
    expect(whyFor('watts', 'garden').verdict).toBe('not-needed');
    expect(judgePlan('watts', ['compost', 'cowpeas']).missing).toEqual(['erosion']);
    expect(judgePlan('pryor', ['compost', 'contour']).missing).toEqual(['food']);
    expect(judgePlan('watts', ['contour']).passes).toBe(false); // one card is not a plan
  });

  it('says who benefits, and has exactly one right reason per farmer', () => {
    for (const f of FARMER_ORDER) {
      expect(FARMERS[f].benefits).toMatch(new RegExp(FARMERS[f].short));
      expect(reasonOptions(f).filter((o) => o.ok)).toHaveLength(1);
    }
    expect(FARMERS.watts.benefits).toMatch(/Mr. Pryor/); // helping one neighbor helps the other
  });
});

describe('Chapter 5 state', () => {
  it('repairs bad saved state without losing good parts', () => {
    const st = ch5State({
      looked: ['gully', 'gully', 'nowhere', 7],
      draft: { watts: ['contour', 'contour', 'rocket', 'compost', 'cowpeas'], pryor: 'x' },
      plan: { watts: ['compost', 'cowpeas'], pryor: ['cowpeas', 'garden'] },
      explained: { watts: true, pryor: true },
      rung: { watts: 9, pryor: -2 },
      attempts: [{ farmer: 'watts', picks: ['fertilizer', 'contour'] }, { farmer: 'nobody', picks: [] }, 'junk'],
    });
    expect(st.looked).toEqual(['gully']);
    expect(st.draft).toEqual({ watts: ['contour', 'compost'], pryor: [] });
    expect(st.plan).toEqual({ watts: null, pryor: ['cowpeas', 'garden'] }); // a plan that does not fit is dropped
    expect(st.explained).toEqual({ watts: false, pryor: true });
    expect(st.rung).toEqual({ watts: 3, pryor: 0 });
    expect(st.attempts).toHaveLength(1);
    expect(triedFertilizer(st)).toBe(true);
    expect(bothHelped(st)).toBe(false);
  });

  it('needs two looks at each farm', () => {
    expect(looksDone(ch5State({ looked: ['gully', 'hill', 'cow'] }))).toBe(false);
    expect(looksDone(ch5State({ looked: LOOKED }))).toBe(true);
  });

  it('survives a save and reload', () => {
    const mem = new Map<string, string>();
    const storage: StorageLike = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
    const s = freshSave();
    const data = { looked: LOOKED, plan: { watts: ['contour', 'compost'], pryor: null }, explained: { watts: true } };
    s.chapterData.ch5 = data;
    ch5State(s.chapterData.ch5);
    new SaveStore(storage).save(s);
    const back = ch5State(new SaveStore(storage).load().data.chapterData.ch5 as Record<string, unknown>);
    expect(back.plan.watts).toEqual(['contour', 'compost']);
    expect(back.explained).toEqual({ watts: true, pryor: false });
    expect(back.looked).toEqual(LOOKED);
  });
});

describe('Chapter 5 runtime', () => {
  it('adds the farm spots and the table at Two Creeks once the chapter starts', () => {
    const save = freshSave();
    const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
    expect(runtime.places({ engine, save, data: {}, learner: save.learner } as unknown as RuntimeContext)).toEqual([]);
    const places = runtime.places(ctxWith({}));
    expect(places.map((p) => p.id)).toEqual([...SPOTS.map((s) => `spot:${s.id}`), 'table']);
    expect(places.every((p) => p.scene === 'creek')).toBe(true);
    expect(places.find((p) => p.id === 'table')!.marker).toBeNull();
    expect(runtime.places(ctxWith({ looked: LOOKED })).find((p) => p.id === 'table')!.marker).toBe('sparkle');
    expect(runtime.places(ctxWith({ looked: LOOKED }, ['resource_map'])).find((p) => p.id === 'table')!.marker).toBeNull();
  });

  it('the objective walks through look around → plan and explain', () => {
    expect(runtime.objective!(ctxWith({}, ['resource_map']))).toBeNull();
    expect(runtime.objective!(ctxWith({}))!.text).toMatch(/0\/4 clues/);
    expect(runtime.objective!(ctxWith({ looked: ['gully', 'hill', 'cow'] }))!.text).toMatch(/2\/4 clues/);
    const o = runtime.objective!(ctxWith({ looked: LOOKED, plan: { watts: ['contour', 'compost'] }, explained: { watts: true } }))!;
    expect(o).toMatchObject({ scene: 'creek', x: TABLE.x, y: TABLE.y });
    expect(o.text).toMatch(/1\/2 farmers helped/);
  });

  it("Carver's nudge and debrief follow what the player did", () => {
    expect(runtime.tokens(ctxWith({}, [])).carverNudge5).toMatch(/Miss Clara/);
    expect(runtime.tokens(ctxWith({}, ['resource_map'])).carverNudge5).toMatch(/farm reports/);
    expect(runtime.tokens(ctxWith({})).carverNudge5).toMatch(/Look around both farms/);
    const done = { looked: LOOKED, plan: { watts: ['contour', 'cowpeas'], pryor: ['compost', 'garden'] }, explained: { watts: true, pryor: true } };
    const t = runtime.tokens(ctxWith({ ...done, attempts: [{ farmer: 'pryor', picks: ['fertilizer', 'garden'] }] }));
    expect(t.wattsPlan).toMatch(/plow across the slope and plant cowpeas/);
    expect(t.pryorPlan).toMatch(/make compost and vegetable garden/);
    expect(t.fertilizerNote).toMatch(/changed your mind/);
    expect(runtime.tokens(ctxWith(done)).fertilizerNote).toMatch(/never reached/);
    expect(t.wattsAfter).toMatch(/cowpeas/);
    expect(runtime.tokens(ctxWith({})).wattsAfter).toMatch(/look around/);
  });
});

describe('Chapter 5 content', () => {
  it('has every conversation, item and memory the chapter needs', () => {
    const ch = CHAPTERS.find((c) => c.id === 'ch5')!;
    expect(ch.status).toBe('playable');
    for (const id of Object.values(ch.carver)) expect(CONVERSATIONS[id], id).toBeDefined();
    for (const s of ch.steps) if (s.kind === 'talk') for (const id of [s.conversation, s.after]) expect(CONVERSATIONS[id!], id).toBeDefined();
    for (const id of [...ITEMS5, 'interview_card']) expect(ITEMS[id], id).toBeDefined();
    for (const p of MEMORIES.movable_school.pages) expect(hasPainting(p.art), p.art).toBe(true);
    expect(MEMORIES.movable_school.pages.map((p) => p.caption).join(' ')).toMatch(/1906/);
    const closing = CONVERSATIONS.carver_ch5_closing;
    const q = Object.values(closing.nodes).find((n) => n.kind === 'question')!;
    expect(q.kind === 'question' && q.options.filter((o) => o.correct)).toHaveLength(1);
    expect(q.kind === 'question' && q.hints).toHaveLength(3);
  });

  it('Carver says advice is shared, not sold', () => {
    const lines = Object.values(CONVERSATIONS.carver_ch5_opening.nodes).map((n) => n.text).join(' ');
    expect(lines).toMatch(/do not sell advice/);
  });
});

describe('Two Creeks map', () => {
  it('can reach every spot, the table, both farmers and the wagon back from the entry', () => {
    const map = buildCreekMap();
    const grid = new CollisionGrid(map);
    NPCS.filter((n) => n.scene === 'creek').forEach((n) => grid.setDynamic(n.id, [[Math.floor(n.pos.x), Math.floor(n.pos.y)]]));
    for (const s of [...SPOTS, { id: 'table', ...TABLE }]) {
      expect(grid.isFree(s.x, s.y, 0.28), s.id).toBe(true);
      expect(findPath(grid, map.entry!, s), s.id).not.toBeNull();
    }
    for (const n of NPCS.filter((n) => n.scene === 'creek')) {
      const front = { x: n.pos.x, y: n.pos.y - 1 };
      expect(findPath(grid, map.entry!, front), n.id).not.toBeNull();
    }
    for (const p of map.places) expect(findPath(grid, map.entry!, p)).not.toBeNull();
  });

  it('the wagon in town is reachable and Miss Clara stands beside it', () => {
    const hub = buildHubMap();
    const door = hub.places.find((p) => p.id === 'creek_door')!;
    expect(door).toBeDefined();
    const clara = NPCS.find((n) => n.id === 'clara')!;
    expect(Math.hypot(clara.pos.x - door.x, clara.pos.y - door.y)).toBeLessThan(4);
  });
});
