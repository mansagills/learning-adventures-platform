import { describe, expect, it } from 'vitest';
import { BARRIERS, BOARD, STAGES, SUPPORTS, shuffledOrder } from '../src/chapters/ch2/data';
import { ch2State, isCorrect, lockNextCard, moveCard, rightPlaces } from '../src/chapters/ch2/state';
import runtime from '../src/chapters/ch2/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { CONVERSATIONS } from '../src/content/conversations';
import { ITEMS } from '../src/content/items';
import { freshSave } from '../src/systems/save';
import { SCHOOL_EASEL_ART, SCHOOL_EASELS, buildSchoolMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { hasPainting } from '../src/art/sceneArt';
import type { RuntimeContext } from '../src/quests/runtime';

function ctxWith(data: Record<string, unknown>, items: string[] = ['school_record', 'botanical_sketch']) {
  const save = freshSave();
  for (const id of ['practice', 'ch1']) save.progress.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch2' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  return { engine, save, data, learner: save.learner } as unknown as RuntimeContext;
}

describe('Chapter 2 data', () => {
  it('has six stages in order, and each has its painting', () => {
    expect(STAGES.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const s of STAGES) expect(hasPainting(s.art), s.art).toBe(true);
    expect(hasPainting('ch2-tuskegee')).toBe(true);
  });

  it('can be solved from the clues alone: every stage has a record date or a clue', () => {
    for (const s of STAGES) expect(!!s.recordDate || !!s.clue, s.id).toBe(true);
    // The two undated stages are exactly the ones Ms. Nelson says have no date.
    expect(STAGES.filter((s) => !s.recordDate).map((s) => s.id)).toEqual(['neosho', 'kansas']);
  });

  it('names racism plainly on the sensitive displays', () => {
    const sensitive = STAGES.filter((s) => s.sensitive);
    expect(sensitive.map((s) => s.id)).toEqual(['reading', 'highland']);
    expect(STAGES.find((s) => s.id === 'highland')!.caption).toMatch(/racism/);
  });

  it('offers two right answers and one wrong answer for barrier and support', () => {
    for (const set of [BARRIERS, SUPPORTS]) {
      expect(set.filter((p) => p.ok)).toHaveLength(2);
      for (const p of set.filter((p) => p.ok)) expect(p.carver).toBeTruthy();
    }
  });

  it('shuffles reproducibly and never starts already solved', () => {
    expect(shuffledOrder(5)).toEqual(shuffledOrder(5));
    for (let seed = 0; seed < 300; seed++) {
      const o = shuffledOrder(seed);
      expect([...o].sort()).toEqual(STAGES.map((s) => s.id).sort());
      expect(isCorrect(o)).toBe(false);
    }
  });
});

describe('Chapter 2 state and timeline', () => {
  it('repairs bad saved state without losing good parts', () => {
    const st = ch2State({ visited: ['reading', 'nope', 'reading', 4], order: ['reading'], locked: 99, rung: -2, phase: 'weird', barrier: 'painting', wrongPicks: ['painting', 'x'] });
    expect(st.visited).toEqual(['reading']);
    expect(st.order).toHaveLength(6);
    expect(st.locked).toBe(6);
    expect(st.rung).toBe(0);
    expect(st.phase).toBe('order');
    expect(st.barrier).toBeNull(); // a wrong answer is never saved as the pick
    expect(st.wrongPicks).toEqual(['painting']);
  });

  it('never lets a save skip ahead of the right answers', () => {
    const st = ch2State({ order: shuffledOrder(3), phase: 'done', barrier: 'highland', support: 'budd' });
    expect(st.phase).toBe('order');
    const st2 = ch2State({ order: STAGES.map((s) => s.id), phase: 'done', barrier: 'highland' });
    expect(st2.phase).toBe('support');
  });

  it('moves cards, but never a locked one', () => {
    const st = ch2State({ order: ['neosho', 'reading', 'kansas', 'highland', 'simpson', 'iowastate'] });
    expect(rightPlaces(st.order)).toBe(4);
    expect(moveCard(st, 1, -1)).toBe(true);
    expect(isCorrect(st.order)).toBe(true);
    st.locked = 2;
    expect(moveCard(st, 1, 1)).toBe(false);
    expect(moveCard(st, 2, -1)).toBe(false);
    expect(moveCard(st, 5, 1)).toBe(false);
    expect(moveCard(st, 2, 1)).toBe(true);
  });

  it('hint rung 2 fixes the first wrong card and locks it; repeating it solves the timeline', () => {
    const st = ch2State({ order: ['iowastate', 'simpson', 'highland', 'kansas', 'neosho', 'reading'] });
    expect(lockNextCard(st)).toBe('reading');
    expect(st.order[0]).toBe('reading');
    expect(st.locked).toBe(1);
    for (let i = 0; i < 6; i++) lockNextCard(st);
    expect(isCorrect(st.order)).toBe(true);
    expect(lockNextCard(st)).toBeNull();
  });
});

describe('Chapter 2 runtime', () => {
  it('shows displays and the board in the schoolhouse only once the chapter is open', () => {
    const save = freshSave();
    const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
    const closed = { engine, save, data: {}, learner: save.learner } as unknown as RuntimeContext;
    expect(runtime.places(closed)).toEqual([]);
    const ctx = ctxWith({});
    const places = runtime.places(ctx);
    expect(places).toHaveLength(7);
    expect(places.every((p) => p.scene === 'school')).toBe(true);
    expect(places.filter((p) => p.marker === 'sparkle')).toHaveLength(6); // board waits for all displays
  });

  it('sparkles the board once every display is visited, and points the objective at it', () => {
    const ctx = ctxWith({ visited: STAGES.map((s) => s.id) });
    const board = runtime.places(ctx).find((p) => p.id === 'board')!;
    expect(board.marker).toBe('sparkle');
    expect(runtime.objective!(ctx)).toMatchObject({ x: BOARD.x, y: BOARD.y, scene: 'school' });
  });

  it('points the objective at the next unvisited display, counting skipped ones as visited', () => {
    const ctx = ctxWith({ visited: ['reading'], skipped: ['reading'] });
    const o = runtime.objective!(ctx)!;
    expect(o.text).toMatch(/1\/6/);
    expect(o).toMatchObject({ x: STAGES[1].stand.x, y: STAGES[1].stand.y, scene: 'school', label: 'Schoolhouse' });
  });

  it("Carver's nudge follows what is still missing", () => {
    expect(runtime.tokens(ctxWith({}, [])).carverNudge2).toMatch(/Ms. Nelson/);
    expect(runtime.tokens(ctxWith({}, ['school_record'])).carverNudge2).toMatch(/Ada/);
    expect(runtime.tokens(ctxWith({ visited: ['reading', 'neosho'] })).carverNudge2).toMatch(/2 of 6/);
    expect(runtime.tokens(ctxWith({ visited: STAGES.map((s) => s.id) })).carverNudge2).toMatch(/chalkboard/);
  });

  it("Carver's reflection uses the barrier and support the player chose", () => {
    const t = runtime.tokens(ctxWith({ order: STAGES.map((s) => s.id), barrier: 'diamond', support: 'watkins' }));
    expect(t.barrierText).toMatch(/Diamond/);
    expect(t.supportText).toMatch(/Mariah Watkins/);
    expect(t.supportThanks).toMatch(/learn all I could/);
    const d = runtime.tokens(ctxWith({}));
    expect(d.barrierText).toMatch(/Highland/);
    expect(d.supportText).toMatch(/Etta Budd/);
  });
});

describe('Chapter 2 schoolhouse and dialogue', () => {
  it('can reach every display, the board and the way out from the entrance', () => {
    const map = buildSchoolMap();
    const grid = new CollisionGrid(map);
    expect(grid.isFree(map.entry!.x, map.entry!.y, 0.28)).toBe(true);
    for (const s of STAGES) {
      expect(grid.isFree(s.stand.x, s.stand.y, 0.28), s.id).toBe(true);
      expect(findPath(grid, map.entry!, s.stand), s.id).not.toBeNull();
    }
    expect(findPath(grid, map.entry!, { x: BOARD.x, y: BOARD.y + 0.6 })).not.toBeNull();
    for (const p of map.places) expect(findPath(grid, map.entry!, p), p.id).not.toBeNull();
  });

  it('each easel shows its own stage painting, and each stand is right beside its easel', () => {
    expect(SCHOOL_EASEL_ART).toEqual(STAGES.map((s) => s.art));
    STAGES.forEach((s, i) => {
      const [ex, ey] = SCHOOL_EASELS[i];
      expect(Math.hypot(s.stand.x - (ex + 0.5), s.stand.y - (ey + 0.8)), s.id).toBeLessThan(1.8);
    });
  });

  it('sensitive lines can be skipped safely: they and the lines they skip carry no effects', () => {
    let count = 0;
    for (const conv of Object.values(CONVERSATIONS)) {
      for (const n of Object.values(conv.nodes)) {
        if (n.kind === 'question' || !n.sensitive) continue;
        count++;
        expect(n.effects ?? [], `${conv.id}.${n.id}`).toEqual([]);
        const skipTo = n.sensitive.skipTo;
        if (skipTo) expect(conv.nodes[skipTo], `${conv.id}.${n.id} → ${skipTo}`).toBeDefined();
        // Walk every path from this line to skipTo: nothing on the way may have effects.
        const seen = new Set<string>();
        const walk = (id: string | null | undefined) => {
          if (!id || id === skipTo || seen.has(id)) return;
          seen.add(id);
          const m = conv.nodes[id];
          if (m.kind === 'question') throw new Error(`${conv.id}: a question inside a skippable part`);
          expect(m.effects ?? [], `${conv.id}.${id}`).toEqual([]);
          for (const c of m.choices ?? []) expect(c.effects ?? []).toEqual([]);
          walk(m.next);
          for (const c of m.choices ?? []) walk(c.next);
        };
        walk(n.id);
      }
    }
    expect(count).toBe(3);
  });
});
