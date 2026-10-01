import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { h } from '../../ui/dom';
import { WORKSHOP } from '../../world/map';
import { CROPS, DECOR, changesText, designText, evaluate, mainProblem } from './data';
import { ch4State, exploredAll, exploredCount, hasRevision, isRevision } from './state';
import { openCropShelf, openDecorShop, openInventionCard, openWorkbench } from './ui';

/**
 * Chapter 4: The Peanut Isn't Just a Peanut / Inventor's Workshop.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch4';

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('invent');
}

function opened(ctx: RuntimeContext): boolean {
  const s = ctx.engine.progress(CH).stage;
  return s === 'active' || s === 'complete';
}

/** "a", "a and b", "a, b and c". */
function listText(parts: string[]): string {
  return parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const hasItems = (ctx: RuntimeContext) => ctx.engine.hasItem('need_card') && ctx.engine.hasItem('materials_kit');

/** Where to stand for each piece of furniture. */
export const SPOTS = {
  shelf: { x: WORKSHOP.cropShelf[0] + 1, y: WORKSHOP.cropShelf[1] + 1.3 },
  bench: { x: WORKSHOP.bench[0] + 1, y: WORKSHOP.bench[1] + 1.3 },
  decor: { x: WORKSHOP.decorShelf[0] + 1, y: WORKSHOP.decorShelf[1] + 1.3 },
};

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!opened(ctx)) return [];
    const st = ch4State(ctx.data);
    const active = stepOpen(ctx);
    const out: RuntimePlace[] = [
      {
        id: 'shelf',
        label: 'Look at the crop shelf',
        ...SPOTS.shelf,
        radius: 1.2,
        marker: active && !exploredAll(st) ? 'sparkle' : null,
        scene: 'workshop',
      },
      {
        id: 'bench',
        label: 'Use the workbench',
        ...SPOTS.bench,
        radius: 1.2,
        marker: active && exploredAll(st) && hasItems(ctx) ? 'sparkle' : null,
        scene: 'workshop',
      },
      { id: 'decor', label: 'Workshop decorations (Seeds)', ...SPOTS.decor, radius: 1.2, marker: null, scene: 'workshop' },
    ];
    return out;
  },

  async usePlace(id, ctx) {
    const st = ch4State(ctx.data);
    if (id === 'shelf') return openCropShelf(ctx);
    if (id === 'decor') return openDecorShop(ctx);
    if (id !== 'bench') return;
    const missing: string[] = [];
    if (!ctx.engine.hasItem('need_card')) missing.push("Miss Lottie's need card (she is in the town square)");
    if (!ctx.engine.hasItem('materials_kit')) missing.push("Mr. Brooks's materials kit");
    if (!exploredAll(st)) missing.push(`to try a test on every crop at the crop shelf (${exploredCount(st)} of 3 so far)`);
    if (missing.length) {
      await ctx.say([{ speaker: 'narrator', text: `The workbench is ready, but first you need: ${missing.join('; ')}.` }]);
      return;
    }
    await openWorkbench(ctx, (firstTime) => {
      if (firstTime && stepOpen(ctx)) {
        ctx.apply({ type: 'useItem', itemId: 'need_card', usedIn: 'Used to test every prototype against the kitchen\'s need' });
        ctx.apply({ type: 'useItem', itemId: 'materials_kit', usedIn: 'Used to build and package the prototypes' });
        ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'invent' });
        ctx.toast('Invention ready! Take it to Carver.', 'reward');
      }
    });
  },

  tokens(ctx) {
    const st = ch4State(ctx.data);
    const e = ctx.engine;
    let nudge: string;
    if (!e.hasItem('need_card')) nudge = 'Miss Lottie is on the east side of the town square. Ask her what the community kitchen needs.';
    else if (!e.hasItem('materials_kit')) nudge = 'Mr. Brooks is outside the workshop on the south road. He has the materials kit.';
    else if (!exploredAll(st)) nudge = 'In the workshop, start at the crop shelf. Find out what each crop is like before you invent.';
    else if (st.trials.length < 2) nudge = `Try at least two ideas at the workbench. You have tested ${st.trials.length} so far.`;
    else if (!hasRevision(st)) nudge = 'Now improve one of your ideas. What did the test show? Change that part and test again.';
    else nudge = 'Choose the improved invention you want to bring me.';

    const i = st.chosen ?? st.trials.findIndex((_, k) => isRevision(st.trials, k));
    const t = i >= 0 ? st.trials[i] : null;
    const r = t ? evaluate(t.design) : null;
    const base = t && t.from !== null ? st.trials[t.from] : null;
    let revisionText = 'You tested your ideas and improved one.';
    if (t && base) {
      const b = evaluate(base.design);
      const changes = changesText(base.design, t.design);
      const how = changes.length ? listText(changes) : 'changed it';
      revisionText = b.passes
        ? `Your ${b.name.toLowerCase()} already worked, and you still ${how} to make it even better.`
        : `You started with ${b.name.toLowerCase()}. ${mainProblem(b) ?? ''} So you ${how}, and now it fits the need.`;
    }
    const passed = st.trials.filter((x) => evaluate(x.design).passes).length;
    let trialText = `You tested ${st.trials.length} ideas, and ${passed} of them fit the need. Every test taught you something.`;
    if (t && CROPS[t.design.crop].allergen && t.design.label) trialText += ' And you remembered the allergy label, so kids who cannot eat peanuts are safe.';
    return {
      carverNudge4: nudge,
      protoName: r ? r.name.toLowerCase() : 'invention',
      revisionText,
      trialText,
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasItems(ctx)) return null;
    const st = ch4State(ctx.data);
    if (!exploredAll(st))
      return { text: `Try a test on each crop at the workshop's crop shelf (${exploredCount(st)}/3)`, ...SPOTS.shelf, scene: 'workshop', label: 'Workshop' };
    const text =
      st.trials.length < 2
        ? `Build and test ideas at the workbench (${st.trials.length}/2 tried)`
        : !hasRevision(st)
          ? 'Improve one idea at the workbench'
          : 'Choose your invention at the workbench';
    return { text, ...SPOTS.bench, scene: 'workshop', label: 'Workbench' };
  },

  journal(ctx) {
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const st = ch4State(ctx.data);
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('kit', '', 22), ' Invention log'));
    if (!st.trials.length) wrap.append(h('p', { text: 'No trials yet. Explore the crops, then build and test ideas at the workbench.' }));
    else
      wrap.append(
        h(
          'ol',
          { class: 'notebook-list' },
          ...st.trials.map((t, i) => {
            const r = evaluate(t.design);
            return h(
              'li',
              {},
              h('strong', { text: `${r.name}: ` }),
              `${designText(t.design)}. ${r.passes ? 'Fits the need.' : `Not yet: ${mainProblem(r)}`}${t.from !== null ? ` (Improves trial ${t.from + 1}.)` : ''}${st.chosen === i ? ' Brought to Carver.' : ''}`,
            );
          }),
        ),
      );
    wrap.append(h('p', { class: 'small', text: 'Every prototype here is a game invention, made up for this story.' }));
    const owned = DECOR.filter((d) => ctx.save.cosmetics.includes(d.id));
    if (owned.length) wrap.append(h('p', { class: 'small', text: `Workshop decorations: ${owned.map((d) => d.name.toLowerCase()).join(', ')}.` }));
    if (ctx.engine.hasItem('invention_card')) {
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: Invention Sketch Card. ' }),
          h('span', { text: 'Sketch an invention from things at home and plan how to test it. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the printable card', onclick: () => void openInventionCard(ctx) }),
        ),
      );
    }
    return wrap;
  },

  printable: (ctx) => openInventionCard(ctx),
};

export default runtime;
