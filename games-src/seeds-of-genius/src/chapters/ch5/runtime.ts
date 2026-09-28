import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { h } from '../../ui/dom';
import { EXAMPLE, FARMER_ORDER, FARMERS, LOOKS_NEEDED, NEED_TEXT, SPOTS, TABLE, judgePlan, planText, whyFor, type FarmerId } from './data';
import { bothHelped, ch5State, lookedAt, looksDone, triedFertilizer } from './state';
import { inspectSpot, openInterviewCard, openTable } from './ui';

/**
 * Chapter 5: Science for the People / Farm Helper.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch5';
const ITEMS = ['farm_report_a', 'farm_report_b', 'resource_map'];

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('help');
}

function opened(ctx: RuntimeContext): boolean {
  const s = ctx.engine.progress(CH).stage;
  return s === 'active' || s === 'complete';
}

const hasAll = (ctx: RuntimeContext) => ITEMS.every((i) => ctx.engine.hasItem(i));

/** What a farmer says once the player has helped (or is still working). */
function afterLine(ctx: RuntimeContext, f: FarmerId): string {
  const st = ch5State(ctx.data);
  const plan = st.plan[f];
  if (plan && st.explained[f])
    return f === 'watts'
      ? `I've started plowing across the hill, and I'm going to ${plan.includes('compost') ? 'pile up compost from Buttercup and the leaves' : 'plant cowpeas from the seed swap'}. Rain came last night, and the soil stayed put!`
      : `We're going to ${planText(plan)}. The children already picked out a spot for the greens.`;
  if (!ctx.engine.hasItem('resource_map')) return 'Miss Clara has a map of what is free around here. Did you get it yet?';
  return `Take your time and look around my ${f === 'watts' ? 'hill' : 'field'}. Then use the table by the wagon to plan.`;
}

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!opened(ctx)) return [];
    const st = ch5State(ctx.data);
    const active = stepOpen(ctx);
    const out: RuntimePlace[] = SPOTS.map((s) => ({
      id: `spot:${s.id}`,
      label: s.label,
      x: s.x,
      y: s.y,
      radius: 1.1,
      marker: active && !st.looked.includes(s.id) && lookedAt(st, s.farmer) < LOOKS_NEEDED ? 'sparkle' : null,
      scene: 'creek',
    }));
    const ready = hasAll(ctx) && looksDone(st);
    out.push({
      id: 'table',
      label: ready || !active ? 'Plan at the demonstration table' : 'Demonstration table (not ready yet)',
      x: TABLE.x,
      y: TABLE.y,
      radius: 1.1,
      marker: active && ready ? 'sparkle' : null,
      scene: 'creek',
    });
    return out;
  },

  async usePlace(id, ctx) {
    const st = ch5State(ctx.data);
    if (id.startsWith('spot:')) {
      const spot = SPOTS.find((s) => s.id === id.slice(5));
      if (spot) await inspectSpot(ctx, spot);
      return;
    }
    if (id !== 'table') return;
    const missing: string[] = [];
    if (!ctx.engine.hasItem('resource_map')) missing.push("Miss Clara's resource map (she drives the wagon, in town)");
    if (!ctx.engine.hasItem('farm_report_a')) missing.push("Mrs. Watts's farm report (she is by her hillside field)");
    if (!ctx.engine.hasItem('farm_report_b')) missing.push("Mr. Pryor's farm report (he is by his field near the creek)");
    for (const f of FARMER_ORDER)
      if (lookedAt(st, f) < LOOKS_NEEDED) missing.push(`to look around ${FARMERS[f].short}'s farm (${lookedAt(st, f)} of ${LOOKS_NEEDED} clues)`);
    if (missing.length) {
      await ctx.say([{ speaker: 'narrator', text: `The demonstration table has seed samples, a shovel and a stack of idea cards. Before you plan, you need: ${missing.join('; ')}.` }]);
      return;
    }
    await openTable(ctx, () => {
      if (stepOpen(ctx) && bothHelped(st)) {
        ctx.apply({ type: 'useItem', itemId: 'farm_report_a', usedIn: "Used to match Mrs. Watts's plan to her problems" });
        ctx.apply({ type: 'useItem', itemId: 'farm_report_b', usedIn: "Used to match Mr. Pryor's plan to his problems" });
        ctx.apply({ type: 'useItem', itemId: 'resource_map', usedIn: 'Used to choose ideas that cost nothing' });
        ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'help' });
        ctx.toast('Both neighbors helped! Tell Carver in town.', 'reward');
      }
    });
  },

  tokens(ctx) {
    const st = ch5State(ctx.data);
    const e = ctx.engine;
    let nudge: string;
    if (!e.hasItem('resource_map')) nudge = 'Miss Clara is by the demonstration wagon, at the north end of the town square. She has a map of free resources.';
    else if (!e.hasItem('farm_report_a') || !e.hasItem('farm_report_b'))
      nudge = 'Ride the wagon out to Two Creeks and ask both farmers for their farm reports. Mrs. Watts is on the hill; Mr. Pryor is by the creek.';
    else if (!looksDone(st)) nudge = 'Look around both farms with your own eyes. What do you notice on the hill? What is free by the creek?';
    else if (!st.plan.watts || !st.plan.pryor) nudge = 'Use the table by the wagon. Pick ideas that fix each farmer\'s problems with things they really have.';
    else nudge = 'Explain each plan to its farmer at the table, so they know why it fits.';

    const plan = (f: FarmerId) => {
      const fm = FARMERS[f];
      const p = st.plan[f] ?? EXAMPLE[f];
      return `For ${fm.short}, you chose to ${planText(p)}. That helps with ${fm.needs.map((n) => NEED_TEXT[n]).join(' and ')}, using only free things ${fm.pronoun.they} has.`;
    };
    const fert = triedFertilizer(st)
      ? 'I saw you try store fertilizer at first, and then you changed your mind. That is what good scientists do.'
      : 'I noticed you never reached for store fertilizer, even with that shiny poster.';
    return {
      carverNudge5: nudge,
      wattsPlan: plan('watts'),
      pryorPlan: plan('pryor'),
      fertilizerNote: fert,
      wattsAfter: afterLine(ctx, 'watts'),
      pryorAfter: afterLine(ctx, 'pryor'),
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasAll(ctx)) return null;
    const st = ch5State(ctx.data);
    if (!looksDone(st)) {
      const next = SPOTS.find((s) => !st.looked.includes(s.id) && lookedAt(st, s.farmer) < LOOKS_NEEDED)!;
      const n = FARMER_ORDER.reduce((a, f) => a + Math.min(LOOKS_NEEDED, lookedAt(st, f)), 0);
      return { text: `Look around both farms at Two Creeks (${n}/${LOOKS_NEEDED * 2} clues)`, x: next.x, y: next.y, scene: 'creek', label: 'Two Creeks' };
    }
    const planned = FARMER_ORDER.filter((f) => st.explained[f]).length;
    return { text: `Plan and explain at the demonstration table (${planned}/2 farmers helped)`, ...TABLE, scene: 'creek', label: 'Demonstration table' };
  },

  journal(ctx) {
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const st = ch5State(ctx.data);
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('report', '', 22), ' Farm helper notes'));
    const notes = SPOTS.filter((s) => st.looked.includes(s.id)).map((s) => h('li', { text: s.note }));
    wrap.append(notes.length ? h('ul', { class: 'notebook-list' }, ...notes) : h('p', { text: 'No clues yet. Ride the wagon to Two Creeks and look around both farms.' }));
    const plans = FARMER_ORDER.filter((f) => st.plan[f]).map((f) => {
      const r = judgePlan(f, st.plan[f]!);
      return h(
        'li',
        {},
        h('strong', { text: `${FARMERS[f].short}: ` }),
        `${planText(st.plan[f]!)}. Why: ${r.picks.map((x) => x.why).join(' ')}${st.explained[f] ? ` Who benefits: ${FARMERS[f].benefits}` : ''}`,
      );
    });
    if (plans.length) {
      wrap.append(h('p', { style: 'margin:8px 0 4px', text: 'Your recommendations:' }));
      wrap.append(h('ul', { class: 'notebook-list' }, ...plans));
    }
    if (triedFertilizer(st) || st.plan.watts || st.plan.pryor)
      wrap.append(h('p', { class: 'small', text: `Why not store fertilizer: ${whyFor('pryor', 'fertilizer').why}` }));
    if (ctx.engine.hasItem('interview_card')) {
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: Growing-Need Interview. ' }),
          h('span', { text: 'Ask someone you know about growing food or plants. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the printable card', onclick: () => void openInterviewCard(ctx) }),
        ),
      );
    }
    return wrap;
  },
};

export default runtime;
