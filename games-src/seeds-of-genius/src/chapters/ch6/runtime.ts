import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { h } from '../../ui/dom';
import { GREENHOUSE } from '../../world/map';
import { PREDICTION_TEXT, VARS, cm, conclusionChoices, hypothesisText, levelName, outcome, questionById } from './data';
import { ch6State, observedAll, results, step, type Experiment } from './state';
import { OBSERVATIONS, observe, openExperimentCard, openLabBench } from './ui';

/**
 * Chapter 6: A Scientist's Method / Design Your Own Experiment.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch6';

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('experiment');
}

function opened(ctx: RuntimeContext): boolean {
  const s = ctx.engine.progress(CH).stage;
  return s === 'active' || s === 'complete';
}

const hasItems = (ctx: RuntimeContext) => ctx.engine.hasItem('measuring_tool') && ctx.engine.hasItem('trial_seeds');

/** Where to stand for each piece of furniture. */
export const SPOTS = {
  sunny: { x: GREENHOUSE.sunnyBench[0] + 1, y: GREENHOUSE.sunnyBench[1] + 1.3 },
  shady: { x: GREENHOUSE.shadyShelf[0] + 1, y: GREENHOUSE.shadyShelf[1] + 1.3 },
  bench: { x: GREENHOUSE.labBench[0] + 1, y: GREENHOUSE.labBench[1] + 1.3 },
};

/** The experiment Carver hears about (or a sample, for replays). */
function brought(ctx: RuntimeContext): Experiment | null {
  const st = ch6State(ctx.data);
  return st.chosen !== null ? st.log[st.chosen] : (st.log[st.log.length - 1] ?? null);
}

/** One sentence about an experiment, for the journal and Carver. */
export function experimentSummary(e: Experiment): { question: string; data: string; hypo: string; supported: boolean; conclusion: string } {
  const q = questionById(e.question)!;
  const v = q.variable!;
  const r = results(e);
  const o = outcome(r.a, r.b);
  const supported = o === e.hyp.prediction;
  const where = (level: string) => {
    const name = levelName(v, level);
    return v === 'light' ? `on the ${name.toLowerCase()}` : v === 'water' ? `with ${name} of water` : `in ${name.toLowerCase()}`;
  };
  return {
    question: q.text,
    data: `Tray B, ${where(e.b[v])}, averaged ${cm(r.b.average)}. Tray A, ${where(e.a[v])}, averaged ${cm(r.a.average)}.`,
    hypo: supported
      ? `You predicted they would ${PREDICTION_TEXT[e.hyp.prediction]}, and the data supported your hypothesis.`
      : `You predicted they would ${PREDICTION_TEXT[e.hyp.prediction]}, but they grew ${o === 'same' ? 'about the same' : o}. The data did not support your hypothesis, and you said so honestly. That is real science.`,
    supported,
    conclusion: conclusionChoices(v, e.hyp, r.a, r.b).find((c) => c.ok)!.text,
  };
}

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!opened(ctx)) return [];
    const st = ch6State(ctx.data);
    const active = stepOpen(ctx);
    const tool = ctx.engine.hasItem('measuring_tool');
    const out: RuntimePlace[] = (['sunny', 'shady'] as const).map((w) => ({
      id: `obs:${w}`,
      label: OBSERVATIONS[w].label,
      ...SPOTS[w],
      radius: 1.2,
      marker: active && tool && !st.observed.includes(w) ? 'sparkle' : null,
      scene: 'greenhouse',
    }));
    const ready = hasItems(ctx) && observedAll(st);
    out.push({
      id: 'bench',
      label: ready || !active ? 'Use the experiment bench' : 'Experiment bench (not ready yet)',
      ...SPOTS.bench,
      radius: 1.2,
      marker: active && ready ? 'sparkle' : null,
      scene: 'greenhouse',
    });
    return out;
  },

  async usePlace(id, ctx) {
    const st = ch6State(ctx.data);
    if (id === 'obs:sunny' || id === 'obs:shady') return observe(ctx, id.slice(4) as 'sunny' | 'shady');
    if (id !== 'bench') return;
    const missing: string[] = [];
    if (!ctx.engine.hasItem('measuring_tool')) missing.push("Mr. Reed's measuring kit (he is here in the greenhouse)");
    if (!ctx.engine.hasItem('trial_seeds')) missing.push("Hattie's trial notes and bean seeds (she is at the community garden)");
    if (st.observed.length < 2) missing.push(`to measure Hattie's seedlings on the sunny bench and the shady shelf (${st.observed.length} of 2)`);
    if (missing.length) {
      await ctx.say([{ speaker: 'narrator', text: `The experiment bench has two empty seed trays. Before you start, you need: ${missing.join('; ')}.` }]);
      return;
    }
    await openLabBench(ctx, (firstTime) => {
      if (firstTime && stepOpen(ctx)) {
        ctx.apply({ type: 'useItem', itemId: 'measuring_tool', usedIn: 'Used to measure every seedling the same way' });
        ctx.apply({ type: 'useItem', itemId: 'trial_seeds', usedIn: 'Planted in both trays of the fair test' });
        ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'experiment' });
        ctx.toast('Experiment done! Tell Carver your conclusion.', 'reward');
      }
    });
  },

  tokens(ctx) {
    const st = ch6State(ctx.data);
    const e = ctx.engine;
    let nudge: string;
    if (!e.hasItem('measuring_tool')) nudge = 'Mr. Reed, my lab assistant, is inside the greenhouse. He has a measuring kit for you.';
    else if (!e.hasItem('trial_seeds')) nudge = 'Hattie at the community garden has noticed something odd about her bean seedlings. Ask her about it.';
    else if (!observedAll(st)) nudge = 'Start with observation: measure Hattie\'s seedlings on the sunny bench and on the shady shelf in the greenhouse.';
    else {
      const s = step(st);
      nudge =
        s === 'question'
          ? 'At the experiment bench, choose a question you can really test.'
          : s === 'hypothesis'
            ? 'Make a prediction. It is fine if it turns out wrong!'
            : s === 'setup'
              ? 'Set up your trays so only ONE thing is different. Everything else must match.'
              : s === 'measure'
                ? 'Measure every pot, the same way each time.'
                : 'Look at your averages and decide what the data says.';
    }
    const ex = brought(ctx);
    const sum = ex ? experimentSummary(ex) : null;
    const v = ex ? questionById(ex.question)!.variable! : 'soil';
    const extra: Record<string, string> = {
      light: 'And you noticed the shady seedlings were tall but pale and floppy. Taller is not always healthier. That is a new question to test!',
      water: 'Too much or too little water both hold a seedling back. Just right is somewhere in between.',
      soil: 'In two weeks a bean mostly lives on the food stored in its seed. Maybe compost matters more later. How could you test that?',
    };
    return {
      carverNudge6: nudge,
      expQuestion: sum ? `Your question was: "${sum.question}"` : 'Your question was a good one.',
      expData: sum ? sum.data : 'You measured every pot.',
      expHypo: sum ? sum.hypo : 'You compared your data with your prediction.',
      expExtra: extra[v],
      expChanged: VARS[v].name.toLowerCase(),
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasItems(ctx)) return null;
    const st = ch6State(ctx.data);
    if (!observedAll(st)) {
      const w = st.observed.includes('sunny') ? 'shady' : 'sunny';
      return { text: `Observe: measure Hattie's seedlings in the greenhouse (${st.observed.length}/2)`, ...SPOTS[w], scene: 'greenhouse', label: 'Greenhouse' };
    }
    const names: Record<string, string> = {
      question: 'choose a testable question',
      hypothesis: 'make a hypothesis',
      setup: 'set up a fair test',
      measure: `measure every pot (${st.measured.length}/6)`,
      conclude: 'draw a conclusion from your data',
      done: 'bring your experiment to Carver',
    };
    return { text: `At the experiment bench: ${names[step(st)]}`, ...SPOTS.bench, scene: 'greenhouse', label: 'Experiment bench' };
  },

  journal(ctx) {
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const st = ch6State(ctx.data);
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('ruler', '', 22), ' Lab notebook'));
    const obs = (['sunny', 'shady'] as const).filter((w) => st.observed.includes(w)).map((w) => h('li', { text: OBSERVATIONS[w].note }));
    wrap.append(obs.length ? h('ul', { class: 'notebook-list' }, ...obs) : h('p', { text: "No observations yet. Get Mr. Reed's measuring kit and measure Hattie's seedlings in the greenhouse." }));
    if (st.log.length) {
      wrap.append(h('p', { style: 'margin:8px 0 4px', text: 'Finished experiments:' }));
      wrap.append(
        h(
          'ol',
          { class: 'notebook-list' },
          ...st.log.map((e, i) => {
            const s = experimentSummary(e);
            return h(
              'li',
              {},
              h('strong', { text: `${s.question} ` }),
              `Hypothesis: ${hypothesisText(questionById(e.question)!.variable!, e.hyp)} ${s.data} ${s.supported ? 'Supported.' : 'Not supported.'} Conclusion: ${s.conclusion}${st.chosen === i ? ' (Brought to Carver.)' : ''}`,
            );
          }),
        ),
      );
    }
    if (ctx.engine.hasItem('experiment_card')) {
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: Fair-Test Plan Card. ' }),
          h('span', { text: 'Plan a safe seed experiment that changes just one thing. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the printable card', onclick: () => void openExperimentCard(ctx) }),
        ),
      );
    }
    return wrap;
  },
};

export default runtime;
