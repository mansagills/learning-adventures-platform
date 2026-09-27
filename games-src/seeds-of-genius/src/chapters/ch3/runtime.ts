import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { h } from '../../ui/dom';
import { BENCH, FARMER_PLAN, PLOTS, WHY_OPTIONS, planText, plotById, simulate, soilLabel, trendText } from './data';
import { bothPlotsDone, ch3State, plotDone } from './state';
import { cottonTotal, inspectPlot, openPlanner, openRotationCard } from './ui';

/**
 * Chapter 3: The Soil Speaks / Virtual Soil Lab.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch3';

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('soil_lab');
}

function opened(ctx: RuntimeContext): boolean {
  const s = ctx.engine.progress(CH).stage;
  return s === 'active' || s === 'complete';
}

const hasAll = (ctx: RuntimeContext) => ['soil_samples', 'crop_history', 'crop_cards'].every((i) => ctx.engine.hasItem(i));

/** The plan the player chose, or a sensible default for replays of the talk. */
function chosenResult(ctx: RuntimeContext) {
  const st = ch3State(ctx.data);
  const plan = st.chosen !== null ? st.tested[st.chosen] : ['cowpeas', 'cotton', 'peanuts', 'cotton'];
  return simulate(plan as Parameters<typeof simulate>[0]);
}

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!opened(ctx) || !ctx.engine.hasItem('soil_samples')) return [];
    const st = ch3State(ctx.data);
    const active = stepOpen(ctx);
    const out: RuntimePlace[] = PLOTS.map((p) => ({
      id: `plot:${p.id}`,
      label: `Look at the ${p.name.toLowerCase()} soil up close`,
      x: p.stand.x,
      y: p.stand.y,
      radius: 1.2,
      marker: active && !plotDone(st, p.id) ? 'sparkle' : null,
      scene: 'farm',
    }));
    const ready = bothPlotsDone(st) && hasAll(ctx);
    out.push({
      id: 'bench',
      label: ready || !active ? 'Plan the seasons' : 'Planning bench (not ready yet)',
      x: BENCH.x,
      y: BENCH.y,
      radius: 1.2,
      marker: active && ready ? 'sparkle' : null,
      scene: 'farm',
    });
    return out;
  },

  async usePlace(id, ctx) {
    const st = ch3State(ctx.data);
    if (id.startsWith('plot:')) {
      const plot = plotById(id.slice(5));
      if (plot) await inspectPlot(ctx, plot);
      return;
    }
    if (id !== 'bench') return;
    const missing: string[] = [];
    if (!plotDone(st, 'west')) missing.push('a close look at the west plot soil');
    if (!plotDone(st, 'east')) missing.push('a close look at the east plot soil');
    if (!ctx.engine.hasItem('crop_cards')) missing.push("Mae's crop cards (from the Seed & Mail)");
    if (missing.length) {
      await ctx.say([{ speaker: 'narrator', text: `Mr. Hill's planning bench has a chalk slate with four season boxes. Before you plan, you need: ${missing.join('; ')}.` }]);
      return;
    }
    await openPlanner(ctx, (firstTime) => {
      if (firstTime && stepOpen(ctx)) {
        ctx.apply({ type: 'useItem', itemId: 'soil_samples', usedIn: 'Used to compare the two plots up close' });
        ctx.apply({ type: 'useItem', itemId: 'crop_history', usedIn: 'Used to see what each plot grew before' });
        ctx.apply({ type: 'useItem', itemId: 'crop_cards', usedIn: 'Used to plan four seasons for the west plot' });
        ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'soil_lab' });
        ctx.toast('Plan chosen! Take it to Carver.', 'reward');
      }
    });
  },

  tokens(ctx) {
    const st = ch3State(ctx.data);
    const e = ctx.engine;
    let nudge: string;
    if (!e.hasItem('soil_samples')) nudge = 'Mr. Hill is by the Hilltop Farm gate, north of the road. Ask him about his west plot.';
    else if (!e.hasItem('crop_cards')) nudge = 'Mae at the Seed & Mail has the crop cards you need for planning.';
    else if (!bothPlotsDone(st))
      nudge = 'Go through the farm gate and look at both soil samples up close. Compare the west plot with the east plot.';
    else if (!st.whyDone) nudge = "Test Mr. Hill's plan and a plan of your own at the planning bench. What happens to the soil?";
    else nudge = 'Now choose the plan you want to bring me, one that still grows some cotton.';

    const r = chosenResult(ctx);
    const f = simulate(FARMER_PLAN);
    const mine = Math.round(cottonTotal(r));
    const theirs = Math.round(cottonTotal(f));
    const amount =
      mine >= theirs
        ? 'more cotton in all'
        : mine >= theirs * 0.8
          ? 'nearly as much cotton in all'
          : 'less cotton for now, but healthier soil for the years after';
    return {
      carverNudge3: nudge,
      planText: planText(r.plan),
      planCompare: `Cotton every season would take the west plot's soil from ${f.start} down to ${f.end}: ${soilLabel(f.end)}. Your plan ends at ${r.end}, ${soilLabel(r.end)}, and ${trendText(r)} from where it started.`,
      cottonCompare: `Your plan plants cotton ${r.cottonSeasons === 1 ? 'once' : `${r.cottonSeasons} times`}, and the model expects about ${mine} cotton, compared with about ${theirs} from cotton every season. That is ${amount}, and Mr. Hill keeps his cash crop.`,
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasAll(ctx)) return null;
    const st = ch3State(ctx.data);
    const left = PLOTS.filter((p) => !plotDone(st, p.id));
    if (left.length) {
      const next = left[0];
      return {
        text: `Look at both soil samples up close in Hilltop Farm (${PLOTS.length - left.length}/${PLOTS.length})`,
        x: next.stand.x,
        y: next.stand.y,
        scene: 'farm',
        label: 'Hilltop Farm',
      };
    }
    return {
      text: st.whyDone ? 'Choose a plan for Carver at the planning bench' : 'Test planting plans at the bench in Hilltop Farm',
      x: BENCH.x,
      y: BENCH.y,
      scene: 'farm',
      label: 'Planning bench',
    };
  },

  journal(ctx) {
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const st = ch3State(ctx.data);
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('jar', '', 22), ' Soil lab notes'));
    const notes = PLOTS.flatMap((plot) =>
      plot.zones.filter((z) => st.looked[plot.id].includes(z.id)).map((z) => h('li', {}, h('strong', { text: `${plot.name}: ` }), z.detail)),
    );
    wrap.append(notes.length ? h('ul', { class: 'notebook-list' }, ...notes) : h('p', { text: 'No notes yet. Get the soil samples from Mr. Hill and look at them up close in Hilltop Farm.' }));
    if (st.tested.length) {
      wrap.append(h('p', { style: 'margin:8px 0 4px', text: 'Plans you tested (west plot, starting soil 28 of 100):' }));
      wrap.append(
        h(
          'ul',
          { class: 'notebook-list' },
          ...st.tested.map((plan, i) => {
            const r = simulate(plan);
            return h('li', {}, `${planText(plan)}: soil ${r.start} → ${r.end} (${soilLabel(r.end)})${st.chosen === i ? '. Your chosen plan.' : ''}`);
          }),
        ),
      );
    }
    if (st.whyDone) wrap.append(h('p', { class: 'small', text: `Why cotton every year wore the soil out: ${WHY_OPTIONS.find((o) => o.ok)!.text}` }));
    if (ctx.engine.hasItem('rotation_card')) {
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: Crop-Rotation Planner. ' }),
          h('span', { text: 'Plan four seasons on paper, or try the cup-of-soil experiment with a grown-up. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the printable card', onclick: () => void openRotationCard(ctx) }),
        ),
      );
    }
    return wrap;
  },
};

export default runtime;
