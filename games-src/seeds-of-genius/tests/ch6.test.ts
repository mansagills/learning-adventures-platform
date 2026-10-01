import { describe, expect, it } from 'vitest';
import {
  QUESTIONS,
  TEST_LEVELS,
  USUAL,
  checkSetup,
  conclusionChoices,
  hypothesisText,
  nextChoices,
  outcome,
  plannedSetups,
  runTray,
  type Hypothesis,
  type Setup,
  type VarId,
} from '../src/chapters/ch6/data';
import { ch6State, restart, results, step } from '../src/chapters/ch6/state';
import runtime, { SPOTS, experimentSummary } from '../src/chapters/ch6/runtime';
import { QuestEngine } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { CONVERSATIONS } from '../src/content/conversations';
import { ITEMS } from '../src/content/items';
import { MEMORIES } from '../src/content/memories';
import { NPCS } from '../src/content/npcs';
import { freshSave, SaveStore, type StorageLike } from '../src/systems/save';
import { buildGreenhouseMap, buildHubMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { hasPainting } from '../src/art/sceneArt';
import type { RuntimeContext } from '../src/quests/runtime';

const ITEMS6 = ['measuring_tool', 'trial_seeds'];

function ctxWith(data: Record<string, unknown>, items: string[] = ITEMS6) {
  const save = freshSave();
  for (const id of ['practice', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5']) save.progress.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
  const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
  engine.apply({ type: 'acceptQuest', chapterId: 'ch6' });
  items.forEach((i) => engine.grantItem(i, 'test'));
  return { engine, save, data, learner: save.learner } as unknown as RuntimeContext;
}

/** The fair setup for each testable question and level. */
const CASES: Array<{ v: VarId; level: string }> = (['light', 'water', 'soil'] as VarId[]).flatMap((v) => TEST_LEVELS[v].map((t) => ({ v, level: t.id })));

describe('Chapter 6 questions and model', () => {
  it('has three testable questions (one per variable) and three that explain why they are not testable', () => {
    const testable = QUESTIONS.filter((q) => q.variable);
    expect(testable.map((q) => q.variable).sort()).toEqual(['light', 'soil', 'water']);
    for (const q of QUESTIONS.filter((x) => !x.variable)) expect(q.feedback.length).toBeGreaterThan(40);
  });

  it('gives different outcomes for different tests, including a surprise and a "no difference"', () => {
    const got = Object.fromEntries(
      CASES.map(({ v, level }) => {
        const p = plannedSetups(v, { level, prediction: 'taller' });
        return [`${v}:${level}`, outcome(runTray(p.a, 'a'), runTray(p.b, 'b'))];
      }),
    );
    expect(got).toEqual({ 'light:shade': 'taller', 'water:lots': 'shorter', 'water:little': 'shorter', 'soil:compost': 'same' });
    expect(runTray({ ...USUAL, light: 'shade' }, 'b').leaves).toMatch(/pale/);
  });

  it('three pots per tray vary, and the average uses all three', () => {
    const r = runTray(USUAL, 'a');
    expect(new Set(r.heights).size).toBeGreaterThan(1);
    expect(r.average).toBe(10);
  });
});

describe('Chapter 6 fair-test guardrails', () => {
  const h: Hypothesis = { level: 'compost', prediction: 'taller' };
  const s = (x: Partial<Setup>): Setup => ({ ...USUAL, ...x });
  it('accepts exactly one change: the one the question and hypothesis name', () => {
    expect(checkSetup('soil', h, s({}), s({ soil: 'compost' })).kind).toBe('ok');
  });
  it('catches no change, two changes, the wrong change, a changed comparison and the wrong direction', () => {
    expect(checkSetup('soil', h, s({}), s({})).kind).toBe('none');
    expect(checkSetup('soil', h, s({}), s({ soil: 'compost', water: 'lots' }))).toEqual({ kind: 'many', changed: ['water', 'soil'] });
    expect(checkSetup('soil', h, s({}), s({ light: 'shade' }))).toEqual({ kind: 'wrong', changed: 'light' });
    expect(checkSetup('soil', h, s({ soil: 'compost' }), s({})).kind).toBe('comparison');
    expect(checkSetup('water', { level: 'lots', prediction: 'taller' }, s({}), s({ water: 'little' })).kind).toBe('direction');
  });
  it('the planned setups for every case are fair', () => {
    for (const { v, level } of CASES) {
      const hyp = { level, prediction: 'same' as const };
      const p = plannedSetups(v, hyp);
      expect(checkSetup(v, hyp, p.a, p.b).kind, `${v}:${level}`).toBe('ok');
    }
  });
});

describe('Chapter 6 conclusions', () => {
  it('exactly one conclusion matches the data in every case, and it quotes the averages', () => {
    for (const { v, level } of CASES) {
      const p = plannedSetups(v, { level, prediction: 'taller' });
      const a = runTray(p.a, 'a');
      const b = runTray(p.b, 'b');
      const cc = conclusionChoices(v, { level, prediction: 'taller' }, a, b);
      expect(cc.filter((c) => c.ok)).toHaveLength(1);
      expect(cc.find((c) => c.ok)!.text).toContain(`${b.average}`.replace(/\.0$/, ''));
    }
  });
  it('next steps: never ignore the data; supported results still get repeated', () => {
    expect(nextChoices(false).find((c) => c.id === 'ignore')!.ok).toBe(false);
    expect(nextChoices(true).find((c) => c.id === 'done')!.ok).toBe(false);
  });
  it('writes the hypothesis as an if/then sentence', () => {
    expect(hypothesisText('water', { level: 'little', prediction: 'shorter' })).toBe(
      'If bean seedlings get less water (¼ cup), they will grow shorter than seedlings grown the usual way.',
    );
  });
});

describe('Chapter 6 state', () => {
  it('repairs bad saved state without losing good parts', () => {
    const st = ch6State({
      observed: ['sunny', 'sunny', 'moon', 3],
      question: 'pretty',
      hyp: { level: 'shade', prediction: 'taller' },
      a: { light: 'moon', water: 'lots' },
      planted: true,
      measured: [1, 1, 9],
      rung: 7,
      log: [{ question: 'soil', hyp: { level: 'compost', prediction: 'same' }, a: USUAL, b: { ...USUAL, soil: 'compost' }, conclusion: 'data', next: 'repeat' }, { question: 'x' }],
      chosen: 4,
    });
    expect(st.observed).toEqual(['sunny']);
    expect(st.question).toBeNull(); // an untestable question is never saved
    expect(st.hyp).toBeNull();
    expect(st.a).toEqual({ ...USUAL, water: 'lots' });
    expect(st.planted).toBe(false);
    expect(st.measured).toEqual([]);
    expect(st.rung).toBe(3);
    expect(st.log).toHaveLength(1);
    expect(st.chosen).toBeNull();
  });

  it('walks the steps in order, and restart keeps observations and finished experiments', () => {
    const st = ch6State({ observed: ['sunny', 'shady'] });
    expect(step(st)).toBe('question');
    st.question = 'light';
    expect(step(st)).toBe('hypothesis');
    st.hyp = { level: 'shade', prediction: 'shorter' };
    expect(step(st)).toBe('setup');
    st.planted = true;
    st.measured = [0, 1, 2, 3, 4];
    expect(step(st)).toBe('measure');
    st.measured.push(5);
    expect(step(st)).toBe('conclude');
    st.answers = { taller: 'b', supported: false, conclusion: 'data', next: 'revise' };
    expect(step(st)).toBe('done');
    st.log.push({ question: 'light', hyp: st.hyp, a: USUAL, b: { ...USUAL, light: 'shade' }, conclusion: 'data', next: 'revise' });
    restart(st);
    expect(step(st)).toBe('question');
    expect(st.observed).toHaveLength(2);
    expect(st.log).toHaveLength(1);
  });

  it('survives a save and reload mid-experiment', () => {
    const mem = new Map<string, string>();
    const storage: StorageLike = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
    const s = freshSave();
    s.world.scene = 'greenhouse';
    s.chapterData.ch6 = { observed: ['sunny', 'shady'], question: 'water', hyp: { level: 'lots', prediction: 'taller' }, a: USUAL, b: { ...USUAL, water: 'lots' }, planted: true, measured: [0, 3] };
    new SaveStore(storage).save(s);
    const back = new SaveStore(storage).load().data;
    expect(back.world.scene).toBe('greenhouse');
    const st = ch6State(back.chapterData.ch6 as Record<string, unknown>);
    expect(step(st)).toBe('measure');
    expect(st.measured).toEqual([0, 3]);
  });
});

describe('Chapter 6 runtime', () => {
  it('adds the observation spots and the bench in the greenhouse once the chapter starts', () => {
    const save = freshSave();
    const engine = new QuestEngine(CHAPTERS, ITEMS, save.progress);
    expect(runtime.places({ engine, save, data: {}, learner: save.learner } as unknown as RuntimeContext)).toEqual([]);
    const places = runtime.places(ctxWith({}));
    expect(places.map((p) => p.id)).toEqual(['obs:sunny', 'obs:shady', 'bench']);
    expect(places.every((p) => p.scene === 'greenhouse')).toBe(true);
    expect(places[2].marker).toBeNull();
    expect(runtime.places(ctxWith({ observed: ['sunny', 'shady'] }))[2].marker).toBe('sparkle');
    expect(runtime.places(ctxWith({}, ['trial_seeds']))[0].marker).toBeNull(); // no ruler yet
  });

  it('the objective walks through observe → each experiment step', () => {
    expect(runtime.objective!(ctxWith({}, ['trial_seeds']))).toBeNull();
    expect(runtime.objective!(ctxWith({}))!.text).toMatch(/Observe.*0\/2/);
    expect(runtime.objective!(ctxWith({ observed: ['sunny', 'shady'] }))!.text).toMatch(/testable question/);
    expect(runtime.objective!(ctxWith({ observed: ['sunny', 'shady'], question: 'soil', hyp: { level: 'compost', prediction: 'taller' }, planted: true, measured: [0, 1] }))!.text).toMatch(/2\/6/);
  });

  it("Carver's nudge follows what is missing, and his debrief quotes the player's own data", () => {
    expect(runtime.tokens(ctxWith({}, [])).carverNudge6).toMatch(/Mr. Reed/);
    expect(runtime.tokens(ctxWith({}, ['measuring_tool'])).carverNudge6).toMatch(/Hattie/);
    expect(runtime.tokens(ctxWith({})).carverNudge6).toMatch(/observation/);
    const light = { question: 'light', hyp: { level: 'shade', prediction: 'shorter' }, a: USUAL, b: { ...USUAL, light: 'shade' }, conclusion: 'data', next: 'revise' };
    const t = runtime.tokens(ctxWith({ observed: ['sunny', 'shady'], log: [light], chosen: 0 }));
    expect(t.expData).toBe('Tray B, on the shady shelf, averaged 15 cm. Tray A, on the sunny bench, averaged 10 cm.');
    expect(t.expHypo).toMatch(/did not support/);
    expect(t.expExtra).toMatch(/pale and floppy/);
    expect(t.expChanged).toBe('light');
    const soil = { ...light, question: 'soil', hyp: { level: 'compost', prediction: 'same' }, b: { ...USUAL, soil: 'compost' } };
    expect(runtime.tokens(ctxWith({ log: [soil], chosen: 0 })).expHypo).toMatch(/supported your hypothesis/);
  });

  it('summarizes an experiment from its own results', () => {
    const e = { question: 'water', hyp: { level: 'little', prediction: 'shorter' as const }, a: USUAL, b: { ...USUAL, water: 'little' as const }, conclusion: 'data', next: 'repeat' };
    const s = experimentSummary(e);
    expect(s.supported).toBe(true);
    expect(s.data).toMatch(/with ¼ cup of water, averaged 6 cm/);
    expect(results(e).b.heights).toHaveLength(3);
  });
});

describe('Chapter 6 content', () => {
  it('has every conversation, item and memory the chapter needs', () => {
    const ch = CHAPTERS.find((c) => c.id === 'ch6')!;
    expect(ch.status).toBe('playable');
    for (const id of Object.values(ch.carver)) expect(CONVERSATIONS[id], id).toBeDefined();
    for (const s of ch.steps) if (s.kind === 'talk') for (const id of [s.conversation, s.after]) expect(CONVERSATIONS[id!], id).toBeDefined();
    for (const id of [...ITEMS6, 'experiment_card']) expect(ITEMS[id], id).toBeDefined();
    for (const p of MEMORIES.experiment_station.pages) expect(hasPainting(p.art), p.art).toBe(true);
    const q = Object.values(CONVERSATIONS.carver_ch6_closing.nodes).find((n) => n.kind === 'question')!;
    expect(q.kind === 'question' && q.options.filter((o) => o.correct)).toHaveLength(1);
  });
});

describe('Greenhouse room', () => {
  it('can reach both benches, the shelf, Mr. Reed and the door from the entrance', () => {
    const map = buildGreenhouseMap();
    const grid = new CollisionGrid(map);
    NPCS.filter((n) => n.scene === 'greenhouse').forEach((n) => grid.setDynamic(n.id, [[Math.floor(n.pos.x), Math.floor(n.pos.y)]]));
    for (const [name, spot] of Object.entries(SPOTS)) {
      expect(grid.isFree(spot.x, spot.y, 0.28), name).toBe(true);
      expect(findPath(grid, map.entry!, spot), name).not.toBeNull();
    }
    const isaac = NPCS.find((n) => n.id === 'isaac')!;
    expect(findPath(grid, map.entry!, { x: isaac.pos.x, y: isaac.pos.y + 1 })).not.toBeNull();
    for (const p of map.places) expect(findPath(grid, map.entry!, p)).not.toBeNull();
  });

  it('the greenhouse door in town leads here', () => {
    expect(buildHubMap().places.some((p) => p.id === 'greenhouse_door')).toBe(true);
    expect(buildGreenhouseMap().exit!.to).toBe('hub');
  });
});
