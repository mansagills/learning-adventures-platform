import { iconImg } from '../../art/icons';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from '../../quests/runtime';
import { h } from '../../ui/dom';
import { COMPARES, MEASURES, REPEATS, TRYOUT, upgradeFor } from './data';
import { ch7State, need, step } from './state';
import { openBlankProjectCard, openJourney, openProjectCard, openProjectTable, projectCard } from './ui';

/**
 * Chapter 7: Your Turn to Plant the Seeds / My Carver Project.
 * Loaded lazily the first time the chapter is reached.
 */

const CH = 'ch7';
const ITEMS = ['need_cards', 'neighbor_needs', 'prototype_kit'];

/** Where to stand at the fair table in the town square. */
export const TABLE = { x: 17, y: 16.5 };

function stepOpen(ctx: RuntimeContext): boolean {
  const p = ctx.engine.progress(CH);
  return p.stage === 'active' && !p.stepsDone.includes('project');
}

function opened(ctx: RuntimeContext): boolean {
  const s = ctx.engine.progress(CH).stage;
  return s === 'active' || s === 'complete';
}

const hasAll = (ctx: RuntimeContext) => ITEMS.every((i) => ctx.engine.hasItem(i));
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const runtime: ChapterRuntime = {
  places(ctx) {
    if (!opened(ctx)) return [];
    const active = stepOpen(ctx);
    const out: RuntimePlace[] = [
      {
        id: 'project',
        label: hasAll(ctx) || !active ? 'Work on your Carver Project' : 'Community fair table (not ready yet)',
        ...TABLE,
        radius: 1.2,
        marker: active && hasAll(ctx) ? 'sparkle' : null,
        scene: 'hub',
      },
    ];
    return out;
  },

  async usePlace(id, ctx) {
    if (id === 'journey') return openJourney(ctx);
    if (id !== 'project') return;
    const missing: string[] = [];
    if (!ctx.engine.hasItem('need_cards')) missing.push("Theo's need cards (he is by the pond)");
    if (!ctx.engine.hasItem('neighbor_needs')) missing.push("Miss Lottie's need cards (she is in the town square)");
    if (!ctx.engine.hasItem('prototype_kit')) missing.push("Mr. Brooks's prototype kit (outside his workshop)");
    if (missing.length && stepOpen(ctx)) {
      await ctx.say([{ speaker: 'narrator', text: `A banner reads "Sweetgum Hollow Community Fair." Before you start your project, you need: ${missing.join('; ')}.` }]);
      return;
    }
    await openProjectTable(ctx, (firstTime) => {
      if (firstTime && stepOpen(ctx)) {
        ctx.apply({ type: 'useItem', itemId: 'need_cards', usedIn: 'Used to choose a real need for your project' });
        ctx.apply({ type: 'useItem', itemId: 'neighbor_needs', usedIn: 'Used to choose a real need for your project' });
        ctx.apply({ type: 'useItem', itemId: 'prototype_kit', usedIn: 'Used to build, test and improve your project' });
        ctx.apply({ type: 'completeStep', chapterId: CH, stepId: 'project' });
        ctx.toast('Project card ready! Present it to Carver.', 'reward');
      }
    });
  },

  tokens(ctx) {
    const st = ch7State(ctx.data);
    const e = ctx.engine;
    let nudge: string;
    if (!e.hasItem('need_cards')) nudge = 'Theo is by the pond, south of the square. He and his friends wrote need cards for the town.';
    else if (!e.hasItem('neighbor_needs')) nudge = 'Miss Lottie, in the town square, collected need cards from the grown-ups.';
    else if (!e.hasItem('prototype_kit')) nudge = 'Mr. Brooks, outside his workshop, has a prototype kit for your project.';
    else {
      const s = step(st);
      nudge =
        s === 'need'
          ? 'At the fair table in the square, choose the need you want to help with.'
          : s === 'build'
            ? 'Design your project, then let your neighbor try it.'
            : s === 'revise'
              ? 'Your neighbor found something to fix. Improve it and test it again.'
              : 'Your card is nearly done. Get it ready at the fair table, then bring it to me.';
    }
    const c = projectCard(st);
    const n = need(st);
    const d = st.final;
    const up = d ? upgradeFor(d) : null;
    return {
      carverNudge7: nudge,
      projName: c ? c.name : 'your project',
      projNeed: n
        ? st.needId === 'custom'
          ? `You noticed a need yourself: "${n.text}" That is what a scientist does: look around, and see what people need.`
          : `You listened to ${n.from === 'theo' ? 'Theo' : 'Miss Lottie'}: "${n.text}"`
        : 'You started with a real need.',
      projRevision:
        d && up
          ? `Your first version had a problem: ${lower(TRYOUT[d.main!].finding)} So you decided to ${lower(up.text)}. Build, try, fix, and build again. That is how inventors work.`
          : 'You tried your first version and improved it.',
      projTest: d && d.measure && d.compare && d.repeat ? `And you will test it: ${lower(MEASURES[d.measure].name)}. ${COMPARES[d.compare]}, and ${lower(REPEATS[d.repeat])}.` : 'And you have a plan to test it.',
    };
  },

  objective(ctx) {
    if (!stepOpen(ctx) || !hasAll(ctx)) return null;
    const st = ch7State(ctx.data);
    const names = { need: 'choose a need', build: 'design your project', revise: 'improve your project after feedback', card: 'get your project card ready' };
    return { text: `At the community fair table: ${names[step(st)]}`, ...TABLE, scene: 'hub', label: 'Fair table' };
  },

  journal(ctx) {
    const p = ctx.engine.progress(CH);
    if (p.stage === 'locked' || p.stage === 'available') return null;
    const st = ch7State(ctx.data);
    const wrap = h('div', { class: 'section' });
    wrap.append(h('h3', {}, iconImg('kit', '', 22), ' My Carver Project'));
    const c = projectCard(st);
    const n = need(st);
    if (!n) wrap.append(h('p', { text: 'No need chosen yet. Collect the need cards and the prototype kit, then go to the fair table in the square.' }));
    else if (!c) wrap.append(h('p', {}, h('strong', { text: 'The need: ' }), n.text, st.first ? ' (First version tried; now improve it.)' : ' (Designing.)'));
    else {
      wrap.append(h('p', {}, h('strong', { text: `${c.name}. ` }), c.idea));
      wrap.append(h('p', { class: 'small' }, h('strong', { text: 'What I changed: ' }), c.revision));
      wrap.append(
        h(
          'div',
          { class: 'activity' },
          h('strong', { text: 'Off-screen activity: My project card. ' }),
          h('span', { text: 'Print it or save it as a file, and share it with your family or class. It is optional and never blocks the game.' }),
          h('button', { class: 'btn small', type: 'button', text: 'Open the project card', onclick: () => void openProjectCard(ctx) }),
        ),
      );
    }
    if (p.stage === 'complete')
      wrap.append(h('button', { class: 'btn small', type: 'button', 'data-journey': true, text: 'Look back at your journey', onclick: () => void openJourney(ctx) }));
    return wrap;
  },

  printable: (ctx) => openBlankProjectCard(ctx),
};

export default runtime;
