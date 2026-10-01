import { describe, expect, it } from 'vitest';
import {
  CONTAINER_ORDER,
  CROP_ORDER,
  DECOR,
  EXAMPLE,
  STEP_ORDER,
  changesText,
  evaluate,
  mainProblem,
  type Design,
  type StepId,
} from '../src/chapters/ch4/data';
import { ch4State, hasRevision, isRevision } from '../src/chapters/ch4/state';
import runtime, { SPOTS } from '../src/chapters/ch4/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { CONVERSATIONS } from '../src/content/conversations';
import { ITEMS } from '../src/content/items';
import { MEMORIES } from '../src/content/memories';
import { freshSave, SaveStore, type StorageLike } from '../src/systems/save';
import { WORKSHOP_DECOR_SPOTS, buildWorkshopMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { hasPainting } from '../src/art/sceneArt';
import type { RuntimeContext } from '../src/quests/runtime';

const STEP_SETS: StepId[][] = [...STEP_ORDER.map((s) => [s]), ...STEP_ORDER.flatMap((a) => STEP_ORDER.filter((b) => b !== a).map((b) => [a, b]))];
const ALL: Design[] = [];
for (const crop of CROP_ORDER) for (const steps of STEP_SETS) for (const container of CONTAINER_ORDER) for (const label of [false, true]) ALL.push({ crop, steps, container, label });

const d = (crop: Design['crop'], steps: StepId[], container: Design['container'] = 'jar', label = false): Design => ({ crop, steps, container, label });

function ctxWith(data: Record<string, unknown>, items: string[] = ['need_card', 'materials_kit']) {
  const save = freshSave();
  for (const id of ['practice', 'ch1', 'ch2', 'ch3']) save.progress.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch4' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  return { engine, save, data, learner: save.learner } as unknown as RuntimeContext;
}
const EXPLORED = { peanuts: ['press'], sweetpotato: ['cut'], cowpeas: ['bite'] };

describe('Chapter 4 invention rules', () => {
  it('there is no single right recipe: many designs pass, from every crop', () => {
    const passing = ALL.filter((x) => evaluate(x).passes);
    expect(passing.length).toBeGreaterThanOrEqual(20);
    for (const crop of CROP_ORDER) expect(passing.some((x) => x.crop === crop), crop).toBe(true);
  });

  it('follows real kitchen science', () => {
    expect(evaluate(d('peanuts', ['boil'])).keepDays).toBeLessThan(7); // wet food spoils
    expect(evaluate(d('cowpeas', ['roast'])).safety).toBe('unsafe'); // dry beans must be cooked in water first
    expect(evaluate(d('cowpeas', ['boil', 'roast'])).edible).toBe(true);
    expect(evaluate(d('sweetpotato', ['roast'])).keepDays).toBeLessThan(7); // still moist inside
    expect(evaluate(d('sweetpotato', ['boil', 'dry'])).passes).toBe(true);
    expect(evaluate(d('sweetpotato', ['grind'])).edible).toBe(false); // flour is not a snack
    expect(evaluate(d('peanuts', ['roast', 'grind'])).effort).toBe(3); // grinding by hand is a lot of work
    expect(evaluate(d('peanuts', ['roast'], 'bowl', true)).keepDays).toBe(1);
    expect(evaluate(d('peanuts', ['roast', 'grind'], 'bag', true)).keepDays).toBe(1); // oily spread soaks the bag
  });

  it('peanut food always needs the allergy label to be safe to share', () => {
    for (const x of ALL.filter((y) => y.crop === 'peanuts' && !y.label)) expect(evaluate(x).passes).toBe(false);
    expect(evaluate(d('peanuts', ['roast'], 'jar', true)).passes).toBe(true);
  });

  it('every failing design explains its first problem', () => {
    for (const x of ALL) {
      const r = evaluate(x);
      if (!r.passes) expect(mainProblem(r), JSON.stringify(x)).toBeTruthy();
      else expect(mainProblem(r)).toBeNull();
    }
  });

  it('describes what changed between two designs', () => {
    expect(changesText(d('peanuts', ['boil'], 'bowl'), d('peanuts', ['boil', 'roast'], 'jar', true))).toEqual([
      'changed the steps from "boil" to "boil, then roast"',
      'used a jar with a lid instead of an open bowl',
      'added an allergy label',
    ]);
    expect(evaluate(EXAMPLE).passes).toBe(true);
  });

  it('the prototypes are labeled as game inventions, and Carver never claims peanut butter', () => {
    const opening = Object.values(CONVERSATIONS.carver_ch4_opening.nodes).map((n) => n.text).join(' ');
    expect(opening).toMatch(/No, I did not/);
    expect(MEMORIES.peanut_lab.pages[1].caption).toMatch(/he did not/);
    for (const p of MEMORIES.peanut_lab.pages) expect(hasPainting(p.art)).toBe(true);
  });
});

describe('Chapter 4 state and revisions', () => {
  it('repairs bad saved state without losing good parts', () => {
    const st = ch4State({
      explored: { peanuts: ['press', 'press', 3], nope: ['x'] },
      draft: { crop: 'banana', steps: [], container: 'jar' },
      trials: [{ design: d('peanuts', ['boil'], 'bowl'), from: null }, { design: { crop: 'x' } }, { design: d('peanuts', ['roast'], 'jar', true), from: 0 }],
      chosen: 9,
      rung: 7,
    });
    expect(st.explored.peanuts).toEqual(['press']);
    expect(st.draft.crop).toBe('peanuts');
    expect(st.trials).toHaveLength(2);
    expect(st.trials[1].from).toBe(0);
    expect(st.chosen).toBeNull();
    expect(st.rung).toBe(3);
  });

  it('a revision must improve on its base and pass the need', () => {
    const trials = [
      { design: d('peanuts', ['boil'], 'bowl'), from: null },
      { design: d('peanuts', ['boil'], 'bowl'), from: 0 }, // same design: not a revision
      { design: d('peanuts', ['roast'], 'jar'), from: 0 }, // still fails (no label)
      { design: d('peanuts', ['roast'], 'jar', true), from: 0 }, // passes: a revision
      { design: d('sweetpotato', ['boil', 'dry'], 'jar'), from: null }, // passes, but not a revision
    ];
    expect(trials.map((_, i) => isRevision(trials, i))).toEqual([false, false, false, true, false]);
    const st = ch4State({ trials });
    expect(hasRevision(st)).toBe(true);
  });

  it('improving a design that already passed still counts if it is at least as good', () => {
    const trials = [
      { design: d('sweetpotato', ['boil', 'dry'], 'bag'), from: null },
      { design: d('sweetpotato', ['boil', 'dry'], 'jar'), from: 0 },
    ];
    expect(isRevision(trials, 1)).toBe(true);
  });
});

describe('Chapter 4 runtime', () => {
  it('opens the workshop places once the chapter starts', () => {
    const save = freshSave();
    const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
    expect(runtime.places({ engine, save, data: {}, learner: save.learner } as unknown as RuntimeContext)).toEqual([]);
    const places = runtime.places(ctxWith({}));
    expect(places.map((p) => p.id)).toEqual(['shelf', 'bench', 'decor']);
    expect(places.every((p) => p.scene === 'workshop')).toBe(true);
    expect(places[0].marker).toBe('sparkle');
    expect(places[1].marker).toBeNull();
    expect(runtime.places(ctxWith({ explored: EXPLORED }))[1].marker).toBe('sparkle');
  });

  it('the objective walks through explore → two trials → improve', () => {
    expect(runtime.objective!(ctxWith({}))!.text).toMatch(/0\/3/);
    expect(runtime.objective!(ctxWith({ explored: EXPLORED }))!.text).toMatch(/0\/2 tried/);
    const two = { explored: EXPLORED, trials: [{ design: d('peanuts', ['boil'], 'bowl'), from: null }, { design: d('cowpeas', ['roast']), from: null }] };
    expect(runtime.objective!(ctxWith(two))!.text).toMatch(/Improve one idea/);
  });

  it("Carver's nudge follows what is missing, and his debrief tells the revision story", () => {
    expect(runtime.tokens(ctxWith({}, [])).carverNudge4).toMatch(/Miss Lottie/);
    expect(runtime.tokens(ctxWith({}, ['need_card'])).carverNudge4).toMatch(/Mr. Brooks/);
    expect(runtime.tokens(ctxWith({})).carverNudge4).toMatch(/crop shelf/);
    const trials = [
      { design: d('peanuts', ['boil'], 'bowl'), from: null },
      { design: d('cowpeas', ['roast']), from: null },
      { design: d('peanuts', ['boil', 'roast'], 'jar', true), from: 0 },
    ];
    const t = runtime.tokens(ctxWith({ explored: EXPLORED, trials, chosen: 2 }));
    expect(t.protoName).toBe('boiled, then roasted peanuts');
    expect(t.revisionText).toMatch(/You started with boiled peanuts/);
    expect(t.revisionText).toMatch(/added an allergy label/);
    expect(t.trialText).toMatch(/You tested 3 ideas, and 1 of them fit/);
    expect(t.trialText).toMatch(/allergy label/);
  });
});

describe('Workshop room and decorations', () => {
  it('can reach the shelf, the bench, the decorations and the door from the entrance', () => {
    const map = buildWorkshopMap();
    const grid = new CollisionGrid(map);
    for (const [name, spot] of Object.entries(SPOTS)) {
      expect(grid.isFree(spot.x, spot.y, 0.28), name).toBe(true);
      expect(findPath(grid, map.entry!, spot), name).not.toBeNull();
    }
    for (const p of map.places) expect(findPath(grid, map.entry!, p)).not.toBeNull();
  });

  it('every decoration has a place in the workshop and a price in Seeds', () => {
    for (const item of DECOR) {
      expect(WORKSHOP_DECOR_SPOTS[item.id], item.id).toBeDefined();
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it('saves bought decorations, and old saves start with none', () => {
    const mem = new Map<string, string>();
    const storage: StorageLike = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
    const s = freshSave();
    s.cosmetics = ['fern', 'fern', 'poster'];
    new SaveStore(storage).save(s);
    expect(new SaveStore(storage).load().data.cosmetics).toEqual(['fern', 'poster']);
    const old = freshSave() as unknown as Record<string, unknown>;
    delete old.cosmetics;
    new SaveStore(storage).save(old as never);
    expect(new SaveStore(storage).load().data.cosmetics).toEqual([]);
  });
});
