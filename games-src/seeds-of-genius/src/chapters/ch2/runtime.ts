import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { CH2_NOTE } from '../../content/grownups';
import { h } from '../../ui/dom';
import { BOARD, STAGES, stageById } from './data';
import { ch2State } from './state';
import { barrierPick, buildTimeline, openJourneyCard, supportPick, timelineSummary, viewDisplay } from './ui';

/**
 * Chapter 2: Science Against the Odds / Choose the Path.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch2';

function hasItems(ctx: RuntimeContext): boolean {
  return ctx.engine.hasItem('school_record') && ctx.engine.hasItem('botanical_sketch');
}

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('build_timeline');
}

function opened(ctx: RuntimeContext): boolean {
  const s = ctx.engine.progress(CH).stage;
  return s === 'active' || s === 'complete';
}

const THANKS: Record<string, string> = {
  budd: 'She looked at my paintings of plants and saw a scientist.',
  watkins: 'She encouraged me to learn all I could, and then to share it with others.',
};

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!opened(ctx)) return [];
    const st = ch2State(ctx.data);
    const active = stepOpen(ctx);
    const out: RuntimePlace[] = STAGES.map((s) => ({
      id: `display:${s.id}`,
      label: `Read the display: ${s.title}`,
      x: s.stand.x,
      y: s.stand.y,
      radius: 1.1,
      marker: active && !st.visited.includes(s.id) ? 'sparkle' : null,
      scene: 'school',
    }));
    const ready = st.visited.length >= STAGES.length && hasItems(ctx);
    out.push({
      id: 'board',
      label: active ? (ready ? 'Build the timeline' : 'Chalkboard timeline (not ready yet)') : 'Chalkboard timeline',
      x: BOARD.x,
      y: BOARD.y,
      radius: 1.3,
      marker: active && ready ? 'sparkle' : null,
      scene: 'school',
    });
    return out;
  },

  async usePlace(id, ctx) {
    const st = ch2State(ctx.data);
    if (id.startsWith('display:')) {
      const stage = stageById(id.slice(8));
      if (stage) await viewDisplay(ctx, stage);
      return;
    }
    if (id !== 'board') return;
    const missing: string[] = [];
    if (!ctx.engine.hasItem('school_record')) missing.push("Ms. Nelson's school records (she is outside, by the schoolhouse door)");
    if (!ctx.engine.hasItem('botanical_sketch')) missing.push("Ada's botanical sketch (she is drawing in the town square)");
    const left = STAGES.length - st.visited.length;
    if (left > 0) missing.push(`${left} more display${left === 1 ? '' : 's'} to visit (look for the sparkles)`);
    if (missing.length) {
      await ctx.say([{ speaker: 'narrator', text: `The chalkboard has six empty spaces. Before you build the timeline, you need: ${missing.join('; ')}.` }]);
      return;
    }
    await buildTimeline(ctx, (firstTime) => {
      if (firstTime && stepOpen(ctx)) {
        ctx.apply({ type: 'useItem', itemId: 'school_record', usedIn: 'Used to date the stages on the timeline' });
        ctx.apply({ type: 'useItem', itemId: 'botanical_sketch', usedIn: 'Used to place art before botany on the timeline' });
        ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'build_timeline' });
        ctx.sound('complete');
        ctx.toast('Timeline built! Take it back to Carver.', 'reward');
      }
    });
  },

  tokens(ctx) {
    const st = ch2State(ctx.data);
    const e = ctx.engine;
    const seen = st.visited.length;
    let nudge: string;
    if (!e.hasItem('school_record')) nudge = 'Ms. Nelson is by the schoolhouse door. Her school records will give you dates.';
    else if (!e.hasItem('botanical_sketch')) nudge = 'Ada is sketching in the town square. Ask her about my art teacher.';
    else if (seen < STAGES.length)
      nudge = `You have visited ${seen} of ${STAGES.length} displays in the schoolhouse. Each one has a clue for the timeline.`;
    else nudge = "You have seen every display. Now put the journey in order on Ms. Nelson's chalkboard.";
    const b = barrierPick(st);
    const s = supportPick(st);
    return {
      carverNudge2: nudge,
      barrierText: b?.carver ?? 'Highland College turned me away when they saw I was Black.',
      supportText: s?.carver ?? 'Etta Budd, my art teacher.',
      supportThanks: THANKS[s?.id ?? 'budd'],
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasItems(ctx)) return null;
    const st = ch2State(ctx.data);
    const seen = st.visited.length;
    if (seen < STAGES.length) {
      const next = STAGES.find((s) => !st.visited.includes(s.id)) ?? STAGES[0];
      return {
        text: `Visit the storybook displays in the schoolhouse (${seen}/${STAGES.length})`,
        x: next.stand.x,
        y: next.stand.y,
        scene: 'school',
        label: 'Schoolhouse',
      };
    }
    return { text: "Build the timeline on Ms. Nelson's chalkboard", x: BOARD.x, y: BOARD.y, scene: 'school', label: 'Chalkboard' };
  },

  journal(ctx) {
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const st = ch2State(ctx.data);
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('folder', '', 22), " Carver's journey"));
    if (st.phase === 'done' || p.stepsDone.includes('build_timeline')) {
      wrap.append(timelineSummary());
      const b = barrierPick(st);
      const s = supportPick(st);
      if (b && s)
        wrap.append(
          h('dl', { class: 'tl-picks' }, h('dt', { text: 'A barrier you named' }), h('dd', { text: b.text }), h('dt', { text: 'A support you named' }), h('dd', { text: s.text })),
        );
    } else {
      wrap.append(
        h('p', {
          text: `Displays visited: ${st.visited.length} of ${STAGES.length}. ${
            hasItems(ctx) ? "When you've seen them all, build the timeline on the chalkboard." : 'Collect the school records and the sketch to build the timeline.'
          }`,
        }),
      );
    }
    if (st.skipped.length)
      wrap.append(
        h('p', { class: 'small', text: `You skipped ${st.skipped.length} display${st.skipped.length === 1 ? '' : 's'} for now. You can read ${st.skipped.length === 1 ? 'it' : 'them'} any time in the schoolhouse.` }),
      );
    wrap.append(
      h(
        'details',
        { class: 'grownups' },
        h('summary', { text: 'For grown-ups: about this chapter' }),
        ...CH2_NOTE.map((text) => h('p', { text })),
      ),
    );
    if (ctx.engine.hasItem('journey_card')) {
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: Journey Card. ' }),
          h('span', { text: 'Draw the steps of something you learned and name one person who helped. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the printable card', onclick: () => void openJourneyCard(ctx) }),
        ),
      );
    }
    return wrap;
  },

  printable: (ctx) => openJourneyCard(ctx),
};

export default runtime;
