import { describe, expect, it } from 'vitest';
import { MAINS, MAIN_ORDER, NEEDS, TRYOUT, allOk, checkTyped, example, rubric, type Category, type Design } from '../src/chapters/ch7/data';
import { ch7State, need, passesRevision, restart, step } from '../src/chapters/ch7/state';
import { cardText, projectCard } from '../src/chapters/ch7/ui';
import runtime, { TABLE } from '../src/chapters/ch7/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { CONVERSATIONS } from '../src/content/conversations';
import { ITEMS } from '../src/content/items';
import { MEMORIES } from '../src/content/memories';
import { buildHubMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { hasPainting } from '../src/art/sceneArt';
import type { RuntimeContext } from '../src/quests/runtime';

const ITEMS7 = ['need_cards', 'neighbor_needs', 'prototype_kit'];
const CATS: Category[] = ['water', 'shade', 'waste', 'nature'];

function ctxWith(data: Record<string, unknown>, items: string[] = ITEMS7) {
  const save = { ...freshish() };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch7' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  return { engine, save, data, learner: {} } as unknown as RuntimeContext;
}
function freshish() {
  const chapters: Record<string, unknown> = {};
  for (const id of ['practice', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6']) chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
  return { progress: { xp: 0, seeds: 0, chapters, inventory: [] }, memories: [] } as never as { progress: never };
}

/** A garden (water) project: first version with problems, then a fixed one. */
const FIRST: Design = { main: 'barrel', material: 'new', extra: 'lock', evidence: ['free'], measure: 'likes', compare: 'before_after', repeat: 'once', upgrade: null };
const FIXED: Design = { main: 'barrel', material: 'scrap', extra: 'signup', evidence: ['free', 'fair'], measure: 'soil', compare: 'before_after', repeat: 'several', upgrade: 'overflow' };

describe('Chapter 7 project rules', () => {
  it('has four needs from two neighbors, one per kind of problem, and a main part for each', () => {
    expect(NEEDS.map((n) => n.from).sort()).toEqual(['lottie', 'lottie', 'theo', 'theo']);
    expect(NEEDS.map((n) => n.category).sort()).toEqual([...CATS].sort());
    expect(MAIN_ORDER.map((m) => MAINS[m].fixes).sort()).toEqual([...CATS].sort());
  });

  it('the feedback rubric explains every problem in a first version', () => {
    const r = rubric(FIRST, 'water');
    expect(r.map((c) => c.ok)).toEqual([true, false, false, false]);
    expect(r[1].note).toMatch(/costs money/);
    expect(r[2].note).toMatch(/lock keeps neighbors out/);
    expect(r[3].note).toMatch(/hard to measure/);
    expect(rubric({ ...FIXED, repeat: 'once' }, 'water')[3].note).toMatch(/more than once/);
    expect(rubric(FIXED, 'shade')[0].ok).toBe(false); // a rain barrel does not make shade
    expect(allOk(rubric(FIXED, 'water'))).toBe(true);
  });

  it('every tryout has one real fix and two that are explained', () => {
    for (const m of MAIN_ORDER) {
      const ups = TRYOUT[m].upgrades;
      expect(ups.filter((u) => u.ok)).toHaveLength(1);
      for (const u of ups) expect(u.why.length).toBeGreaterThan(20);
    }
  });

  it('a revision passes only with every check met AND the tryout problem fixed', () => {
    expect(passesRevision({ ...FIXED, upgrade: null }, 'water')).toBe(false);
    expect(passesRevision({ ...FIXED, upgrade: 'paint' }, 'water')).toBe(false);
    expect(passesRevision(FIXED, 'water')).toBe(true);
    for (const c of CATS) {
      const ex = example(c);
      ex.upgrade = TRYOUT[ex.main!].upgrades.find((u) => u.ok)!.id;
      expect(passesRevision(ex, c), c).toBe(true);
    }
  });
});

describe('Typed answers', () => {
  const opts = { min: 10, max: 120, words: 3 };
  it('handles blank, short, long and messy input', () => {
    expect(checkTyped('   ', opts)).toMatchObject({ ok: false, reason: expect.stringMatching(/empty/) });
    expect(checkTyped('trash', opts)).toMatchObject({ ok: false, reason: expect.stringMatching(/Tell a little more/) });
    expect(checkTyped('a'.repeat(121), opts)).toMatchObject({ ok: false });
    expect(checkTyped('  The   park <b>has</b> no recycling bins  ', opts)).toEqual({ ok: true, text: 'The park has no recycling bins' });
  });
  it('keeps out personal information and unkind or unsafe words', () => {
    expect(checkTyped('Call me at 5551234567 about the park', opts)).toMatchObject({ ok: false, reason: expect.stringMatching(/phone numbers/) });
    expect(checkTyped('Email me at kid@example.com please', opts)).toMatchObject({ ok: false });
    expect(checkTyped('The mean kids at the park are stupid', opts)).toMatchObject({ ok: false, reason: expect.stringMatching(/kind and safe/) });
    expect(checkTyped('Press the button on the hello sign', opts).ok).toBe(true); // no false alarms on "button" or "hello"
  });
});

describe('Chapter 7 state and project card', () => {
  it('repairs bad saved state', () => {
    const st = ch7State({ needId: 'custom', customNeed: 'kill it', customCategory: 'water', name: '<>', draft: { main: 'rocket', evidence: ['free', 'free', 'x', 'fair', 'soil'] }, first: FIRST, final: { ...FIXED, upgrade: 'paint' }, presented: true, rung: 9 });
    expect(st.needId).toBeNull(); // the unsafe custom need was dropped
    expect(st.name).toBeNull();
    expect(st.draft.main).toBeNull();
    expect(st.draft.evidence).toEqual(['free', 'fair']);
    expect(st.first).toBeNull();
    expect(st.final).toBeNull();
    expect(st.presented).toBe(false);
    expect(st.rung).toBe(3);
  });

  it('walks need → build → revise → card, and restart clears the project', () => {
    const st = ch7State({});
    expect(step(st)).toBe('need');
    st.needId = 'garden';
    expect(step(st)).toBe('build');
    st.first = FIRST;
    expect(step(st)).toBe('revise');
    st.final = FIXED;
    expect(step(st)).toBe('card');
    restart(st);
    expect(step(st)).toBe('need');
  });

  it('a custom need gets a neighbor to test it', () => {
    const st = ch7State({ needId: 'custom', customNeed: 'The park has nowhere to recycle bottles', customCategory: 'waste' });
    expect(need(st)).toMatchObject({ from: 'lottie', category: 'waste' });
  });

  it('the project card has the need, idea, evidence, test plan and one revision', () => {
    const st = ch7State({ needId: 'garden', name: 'The Rain Saver', first: FIRST, final: FIXED, draft: FIXED });
    const c = projectCard(st)!;
    expect(c.name).toBe('The Rain Saver');
    expect(c.need).toMatch(/school garden/);
    expect(c.idea).toMatch(/Rain barrel/);
    expect(c.evidence).toHaveLength(2);
    expect(c.test).toMatch(/damp/);
    expect(c.revision).toMatch(/overflowed/);
    expect(c.revision).toMatch(/overflow hose/);
    expect(c.revision).toMatch(/free, shared materials/);
    const t = cardText(c);
    for (const label of ['The need:', 'My idea:', 'Why I think it will work:', 'How I will test it:', 'What I changed after testing:']) expect(t).toContain(label);
  });
});

describe('Chapter 7 runtime', () => {
  it('adds the fair table in the town square once the chapter starts', () => {
    const places = runtime.places(ctxWith({}));
    expect(places.map((p) => p.id)).toEqual(['project']);
    expect(places[0]).toMatchObject({ scene: 'hub', marker: 'sparkle' });
    expect(runtime.places(ctxWith({}, ['need_cards']))[0].marker).toBeNull();
  });

  it('the objective and nudges follow the project steps', () => {
    expect(runtime.objective!(ctxWith({}, ['need_cards']))).toBeNull();
    expect(runtime.objective!(ctxWith({}))!.text).toMatch(/choose a need/);
    expect(runtime.objective!(ctxWith({ needId: 'bus', first: FIRST }))!.text).toMatch(/improve/);
    expect(runtime.tokens(ctxWith({}, [])).carverNudge7).toMatch(/Theo/);
    expect(runtime.tokens(ctxWith({}, ['need_cards'])).carverNudge7).toMatch(/Miss Lottie/);
    expect(runtime.tokens(ctxWith({}, ['need_cards', 'neighbor_needs'])).carverNudge7).toMatch(/Mr. Brooks/);
  });

  it("Carver's debrief tells the player's own project story", () => {
    const t = runtime.tokens(ctxWith({ needId: 'garden', first: FIRST, final: FIXED, draft: FIXED }));
    expect(t.projNeed).toMatch(/You listened to Theo/);
    expect(t.projRevision).toMatch(/overflowed all over the path/);
    expect(t.projRevision).toMatch(/add an overflow hose/);
    expect(t.projTest).toMatch(/several times/);
    const own = runtime.tokens(ctxWith({ needId: 'custom', customNeed: 'The park has nowhere to recycle bottles', customCategory: 'waste' }));
    expect(own.projNeed).toMatch(/noticed a need yourself/);
  });
});

describe('Chapter 7 content and the ending', () => {
  it('has every conversation, item and memory the chapter needs', () => {
    const ch = CHAPTERS.find((c) => c.id === 'ch7')!;
    expect(ch.status).toBe('playable');
    for (const id of Object.values(ch.carver)) expect(CONVERSATIONS[id], id).toBeDefined();
    for (const s of ch.steps) if (s.kind === 'talk') for (const id of [s.conversation, s.after]) expect(CONVERSATIONS[id!], id).toBeDefined();
    for (const id of [...ITEMS7, 'golden_seed']) expect(ITEMS[id], id).toBeDefined();
    for (const p of MEMORIES.legacy.pages) expect(hasPainting(p.art), p.art).toBe(true);
    expect(CHAPTERS.every((c) => c.status === 'playable')).toBe(true);
  });

  it('the finale completes the story, opens the journey, and never claims the player equals Carver', () => {
    const nodes = Object.values(CONVERSATIONS.carver_ch7_closing.nodes);
    const effects = nodes.flatMap((n) => ('effects' in n ? (n.effects ?? []) : []));
    expect(effects.map((e) => e.type)).toEqual(expect.arrayContaining(['completeChapter', 'showJourney', 'grantItem']));
    const text = nodes.map((n) => n.text).join(' ');
    expect(text).toMatch(/not the same as my life's work/);
  });

  it('the fair table stands in the square and can be reached from the road', () => {
    const hub = buildHubMap();
    const grid = new CollisionGrid(hub);
    expect(hub.props.some((p) => p.kind === 'fairtable')).toBe(true);
    expect(grid.isFree(TABLE.x, TABLE.y, 0.28)).toBe(true);
    expect(findPath(grid, { x: 19.5, y: 9.6 }, TABLE)).not.toBeNull();
  });
});
