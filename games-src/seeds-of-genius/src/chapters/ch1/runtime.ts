import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { h } from '../../ui/dom';
import { BENCH, MAIN_SPOTS, REQUIRED_OBSERVATIONS, SPOTS, spotById } from './data';
import { ch1State } from './state';
import { inspectSpot, openActivityCard, sortCards } from './ui';

/**
 * Chapter 1: A Seed Is Planted / Curiosity Collector.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch1';

function hasTools(ctx: RuntimeContext): boolean {
  return ctx.engine.hasItem('field_notebook') && ctx.engine.hasItem('magnifying_lens');
}

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('observe_sort');
}

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!hasTools(ctx)) return [];
    const st = ch1State(ctx.data);
    const active = stepOpen(ctx);
    const out: RuntimePlace[] = SPOTS.map((s) => ({
      id: `spot:${s.id}`,
      label: `Look closely: ${s.title}`,
      x: s.x,
      y: s.y,
      radius: 1.1,
      marker: s.bonus ? (st.spots[s.id]?.recorded ? null : 'faint') : active && !st.spots[s.id]?.recorded ? 'sparkle' : null,
    }));
    const ready = st.observations.length >= REQUIRED_OBSERVATIONS;
    out.push({
      id: 'bench',
      label: ready ? "Play Hattie's card game" : 'Potting bench (needs 3 observations)',
      x: BENCH.x,
      y: BENCH.y,
      radius: 1.1,
      marker: active && ready ? 'sparkle' : null,
    });
    return out;
  },

  async usePlace(id, ctx) {
    const st = ch1State(ctx.data);
    if (id.startsWith('spot:')) {
      const spot = spotById(id.slice(5));
      if (spot) await inspectSpot(ctx, spot);
      return;
    }
    if (id === 'bench') {
      if (st.observations.length < REQUIRED_OBSERVATIONS) {
        await ctx.say([
          {
            speaker: 'narrator',
            text: `Hattie's card game is set out on the bench. You need ${REQUIRED_OBSERVATIONS} observations in your notebook first (you have ${st.observations.length}). Look for the sparkles in the garden.`,
          },
        ]);
        return;
      }
      await sortCards(ctx, (_mistakes, firstTime) => {
        if (firstTime && stepOpen(ctx)) {
          ctx.apply({ type: 'useItem', itemId: 'magnifying_lens', usedIn: 'Used to look closely at the garden' });
          ctx.apply({ type: 'useItem', itemId: 'field_notebook', usedIn: 'Used to record and sort observations' });
          ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'observe_sort' });
          ctx.sound('complete');
          ctx.toast('Notebook sorted! Take it back to Carver.', 'reward');
        }
      });
    }
  },

  tokens(ctx) {
    const st = ch1State(ctx.data);
    const n = st.observations.length;
    const e = ctx.engine;
    let nudge: string;
    if (!e.hasItem('field_notebook')) nudge = 'Have you found Hattie by the garden gate? She has the field notebook.';
    else if (!e.hasItem('magnifying_lens')) nudge = 'Theo is on the east side of the pond with his magnifying lens.';
    else if (n < REQUIRED_OBSERVATIONS)
      nudge = `You have ${n} of ${REQUIRED_OBSERVATIONS} observations so far. Look where the garden sparkles, and use the lens on the small details.`;
    else nudge = "Now try Hattie's card game on the potting bench. Which notes are observations, and which are guesses?";
    const mistakes = st.firstSortMistakes ?? 0;
    return {
      carverNudge: nudge,
      obsFirst: st.observations[0]?.text ?? 'The soil by the fence is dark and damp.',
      obsCount: String(n),
      sortReflection:
        mistakes === 0
          ? `You sorted every card right the first time, and you wrote ${n} observations. Your eyes are sharp!`
          : `You moved ${mistakes} card${mistakes === 1 ? '' : 's'} after checking again. Noticing a mistake and fixing it is part of doing science.`,
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasTools(ctx)) return null;
    const st = ch1State(ctx.data);
    const n = st.observations.length;
    if (n < REQUIRED_OBSERVATIONS) {
      const next = MAIN_SPOTS.find((s) => !st.spots[s.id]?.recorded) ?? MAIN_SPOTS[0];
      return { text: `Look closely at the sparkling garden spots (${n}/${REQUIRED_OBSERVATIONS} observations)`, x: next.x, y: next.y };
    }
    return { text: "Sort your notes with Hattie's card game at the potting bench", x: BENCH.x, y: BENCH.y };
  },

  journal(ctx) {
    const st = ch1State(ctx.data);
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('notebook', '', 22), ' Your field notebook'));
    if (!st.observations.length) wrap.append(h('p', { text: 'No observations yet. Get the notebook and lens, then look closely at the garden.' }));
    else
      wrap.append(
        h(
          'ol',
          { class: 'notebook-list' },
          ...st.observations.map((o) => h('li', {}, h('strong', { text: `${spotById(o.spot)?.title ?? o.spot}: ` }), o.text)),
        ),
      );
    const found = MAIN_SPOTS.filter((s) => st.spots[s.id]?.recorded).length;
    wrap.append(
      h('p', {
        class: 'small',
        text: `Garden spots recorded: ${found} of ${MAIN_SPOTS.length}. Bonus finds: ${st.bonus.length} of ${SPOTS.length - MAIN_SPOTS.length}.${
          st.firstSortMistakes !== null ? ` Card game: sorted${st.firstSortMistakes === 0 ? ' with no mistakes' : `, ${st.firstSortMistakes} fixed along the way`}.` : ''
        }`,
      }),
    );
    if (ctx.engine.hasItem('nature_card')) {
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: Nature Observation Card. ' }),
          h('span', { text: 'Record one thing you see, hear and touch outside. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the printable card', onclick: () => void openActivityCard(ctx) }),
        ),
      );
    }
    return wrap;
  },

  printable: (ctx) => openActivityCard(ctx),
};

export default runtime;
