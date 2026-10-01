import { iconImg } from '../../art/icons';
import { PixelBuffer } from '../../art/pixel';
import { P } from '../../art/palette';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import { h, Modal } from '../../ui/dom';
import {
  CONTAINER_ORDER,
  CONTAINERS,
  CROP_ORDER,
  CROPS,
  DECOR,
  EXAMPLE,
  NEED,
  STEP_ORDER,
  STEPS,
  designText,
  effortWord,
  evaluate,
  fillingWord,
  mainProblem,
  withArticle,
  type CropId,
  type Design,
  type Result,
  type StepId,
} from './data';
import { ch4State, exploredAll, hasRevision, isRevision, type Ch4State } from './state';

function fill(el: HTMLElement, ...kids: Array<Node | null | false>): void {
  el.replaceChildren(...kids.filter((k): k is Node => !!k));
}

function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

const CROP_ICON: Record<CropId, string> = { peanuts: 'peanut', sweetpotato: 'sweetpotato', cowpeas: 'cowpea' };
const INVENTION_NOTE = 'Game invention: made up for this story. Carver did not invent it.';

// ================================================================ the crop shelf

/** Try simple tests on each crop to find out its properties. */
export function openCropShelf(ctx: RuntimeContext): Promise<void> {
  const st = ch4State(ctx.data);
  ctx.sound('open');
  return whenClosed((done) => {
    const body = h('div', { class: 'content crop-shelf' });
    const render = (focus?: string) => {
      fill(
        body,
        h('p', { class: 'intro', text: 'Before you invent, find out what each crop is like. Try at least one test on every crop.' }),
        h(
          'div',
          { class: 'crop-tests' },
          ...CROP_ORDER.map((id) => {
            const c = CROPS[id];
            const seen = st.explored[id];
            return h(
              'section',
              { class: `crop-test-card${seen.length ? ' seen' : ''}`, 'aria-label': c.name },
              h('h3', {}, iconImg(CROP_ICON[id], '', 28), ` ${c.name}`),
              h(
                'div',
                { class: 'test-buttons' },
                ...c.tests.map((t) =>
                  h('button', {
                    class: `btn small${seen.includes(t.id) ? ' done' : ''}`,
                    type: 'button',
                    text: t.label,
                    'data-test': `${id}:${t.id}`,
                    onclick: () => {
                      if (!seen.includes(t.id)) {
                        seen.push(t.id);
                        ctx.sound('item');
                        ctx.persist();
                      }
                      render(`[data-test="${id}:${t.id}"]`);
                    },
                  }),
                ),
              ),
              h('ul', { class: 'test-results' }, ...c.tests.filter((t) => seen.includes(t.id)).map((t) => h('li', { text: t.result }))),
            );
          }),
        ),
        exploredAll(st)
          ? h('div', { class: 'feedback good', role: 'status', text: 'You know all three crops now. Try your ideas at the workbench.' })
          : null,
      );
      if (focus) body.querySelector<HTMLElement>(focus)?.focus();
    };
    const root = h(
      'div',
      { class: 'panel modal shelf-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'shelf-title' },
      h('header', {}, h('h2', { id: 'shelf-title', text: 'The crop shelf' }), h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() })),
      body,
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ results

const CHECK_LABELS: Array<[keyof Result['checks'], string]> = [
  ['edible', 'Ready to eat'],
  ['keeps', `Keeps ${NEED.keepDays}+ days without a fridge`],
  ['filling', 'Filling'],
  ['effort', 'Easy enough for volunteers'],
  ['safe', 'Safe for every kid'],
];

function checkDetail(r: Result, key: keyof Result['checks']): string {
  switch (key) {
    case 'edible':
      return r.edibleWhy;
    case 'keeps':
      return `About ${r.keepDays} day${r.keepDays === 1 ? '' : 's'}. ${r.keepWhy}`;
    case 'filling':
      return `${fillingWord(r.filling).replace(/^./, (c) => c.toUpperCase())} filling.`;
    case 'effort':
      return `${effortWord(r.effort).replace(/^./, (c) => c.toUpperCase())}. ${r.effortWhy}`;
    case 'safe':
      return r.safetyWhy;
  }
}

const CROP_COLOR: Record<CropId, [string, string]> = {
  peanuts: ['#d9a45a', '#b8864a'],
  sweetpotato: ['#e08a4a', '#c8643a'],
  cowpeas: ['#efe6cf', '#3a2a26'],
};

/** A little picture of the prototype: its container, what is inside, steam if it is wet, and the label. */
export function prototypePicture(d: Design): HTMLCanvasElement {
  const r = evaluate(d);
  const b = new PixelBuffer(40, 36);
  const [c1, c2] = CROP_COLOR[d.crop];
  const last = d.steps[d.steps.length - 1];
  const paste = r.name.endsWith('Spread');
  const flour = r.name.endsWith('Flour');
  const chips = r.name.endsWith('Chips');
  const wet = r.keepDays <= 2 && d.container !== 'bowl' ? true : d.steps.includes('boil') && last === 'boil';
  // what is inside, drawn into a box area, then the container over it
  const fillArea = (x0: number, y0: number, w: number, hgt: number) => {
    if (paste) b.rect(x0, y0, w, hgt, '#9a6a3a');
    else if (flour) b.rect(x0, y0, w, hgt, d.crop === 'sweetpotato' ? '#f0c89a' : '#efe6cf');
    else
      for (let y = y0; y < y0 + hgt; y += 3)
        for (let x = x0 + ((y / 3) % 2); x < x0 + w - 1; x += 3) {
          if (chips) b.ellipse(x, y, 3, 2, c1);
          else {
            b.rect(x, y, 2, 2, c1);
            b.set(x + 1, y + 1, c2);
          }
        }
  };
  if (d.container === 'jar') {
    b.rect(10, 8, 20, 24, '#d8ecf2');
    fillArea(11, 16, 18, 15);
    b.rect(9, 5, 22, 4, P.wood2);
    b.vline(12, 10, 28, '#ffffff');
  } else if (d.container === 'bag') {
    b.rect(9, 10, 22, 22, '#c9a878');
    b.hline(9, 30, 10, '#b89468');
    fillArea(11, 6, 18, 5);
    if (paste) for (let i = 0; i < 6; i++) b.set(12 + i * 3, 20 + (i % 3), '#8a5a2a'); // grease spots
  } else {
    b.ellipse(5, 20, 30, 12, '#e8dcc0');
    b.ellipse(7, 18, 26, 8, '#f6ecd3');
    fillArea(10, 17, 20, 5);
  }
  if (wet) for (const x of [14, 20, 26]) for (let y = 0; y < 5; y++) b.set(x + (y % 2), y, '#dfe8f0');
  if (d.label) {
    b.rect(13, 24, 14, 6, P.white);
    b.hline(15, 25, 26, '#d95f5f');
    b.hline(15, 22, 28, P.ink);
  }
  b.outline();
  const cv = b.toCanvas();
  cv.className = 'proto-pic';
  cv.setAttribute('role', 'img');
  cv.setAttribute('aria-label', `Picture of the prototype: ${r.name} in ${withArticle(CONTAINERS[d.container].name.toLowerCase())}${d.label ? ', with a label' : ''}`);
  return cv;
}

export function resultCard(d: Design, n: number): HTMLElement {
  const r = evaluate(d);
  return h(
    'div',
    { class: `result-card${r.passes ? ' pass' : ''}` },
    h(
      'div',
      { class: 'result-head' },
      prototypePicture(d),
      h('div', {}, h('strong', { text: `Trial ${n}: ${r.name}` }), h('span', { class: 'small', text: designText(d) })),
    ),
    h('span', { class: 'badge invention', text: INVENTION_NOTE }),
    h(
      'ul',
      { class: 'checks' },
      ...CHECK_LABELS.map(([key, label]) =>
        h(
          'li',
          { class: r.checks[key] ? 'ok' : 'no' },
          h('span', { class: 'mark', 'aria-hidden': 'true', text: r.checks[key] ? '✓' : '✗' }),
          h('span', {}, h('strong', { text: `${label}: ` }), h('span', { class: 'sr-only', text: r.checks[key] ? 'yes. ' : 'no. ' }), checkDetail(r, key)),
        ),
      ),
    ),
    h('p', { class: 'verdict', text: r.passes ? 'It fits the kitchen\'s need!' : 'Not yet. Look at the ✗ to see what to change.' }),
  );
}

// ================================================================ the workbench

const HINT_2: Record<keyof Result['checks'], string> = {
  edible: 'Hint: dry beans must be cooked in water (boil) first; raw crops need cooking; flour is not a snack. Change the steps.',
  keeps: 'Hint: moist food spoils. After cooking, take the water out by roasting or drying, and use a container with a lid.',
  filling: 'Hint: choose a crop that is more filling.',
  effort: 'Hint: use fewer steps. Grinding by hand takes a long time.',
  safe: 'Hint: rock-hard beans are unsafe, and peanut food needs an allergy label from the kit.',
};

/**
 * Mr. Brooks's workbench: choose a crop, up to two steps and a container
 * (plus an allergy label), then build and test it against the need card.
 * Every trial is kept in a log; "Improve this idea" starts a revision.
 */
export function openWorkbench(ctx: RuntimeContext, onChosen: (firstTime: boolean) => void): Promise<void> {
  const st = ch4State(ctx.data);
  ctx.sound('open');

  return whenClosed((done) => {
    const body = h('div', { class: 'content bench-body' });
    let message: { kind: 'good' | 'try'; text: string } | null = null;
    let latest: number | null = null;

    const set = (fn: (d: Design) => void, focus: string) => {
      fn(st.draft);
      message = null;
      ctx.persist();
      render(focus);
    };

    const option = (group: string, id: string, label: string, on: boolean, pick: (d: Design) => void, icon?: string) =>
      h(
        'button',
        {
          class: `btn small opt${on ? ' on' : ''}`,
          type: 'button',
          'aria-pressed': on ? 'true' : 'false',
          'data-opt': `${group}:${id}`,
          onclick: () => set(pick, `[data-opt="${group}:${id}"]`),
        },
        icon ? iconImg(icon, '', 20) : null,
        ` ${label}`,
      );

    const builder = () => {
      const d = st.draft;
      const stepRow = (slot: 0 | 1) =>
        h(
          'div',
          { class: 'opt-row', role: 'group', 'aria-label': slot === 0 ? 'Step 1' : 'Step 2 (optional)' },
          h('span', { class: 'opt-label', text: slot === 0 ? 'Step 1' : 'Step 2' }),
          slot === 1
            ? option('step2', 'none', 'None', d.steps.length < 2, (x) => {
                x.steps = x.steps.slice(0, 1);
              })
            : null,
          ...STEP_ORDER.map((s) =>
            option(`step${slot + 1}`, s, STEPS[s].name, d.steps[slot] === s, (x) => {
              const next = [...x.steps];
              next[slot] = s;
              if (slot === 0 && next[1] === s) next.splice(1, 1);
              if (slot === 1 && next[0] === s) return;
              x.steps = next.filter(Boolean) as StepId[];
            }),
          ),
        );
      return h(
        'div',
        { class: 'builder' },
        h(
          'div',
          { class: 'opt-row', role: 'group', 'aria-label': 'Crop' },
          h('span', { class: 'opt-label', text: 'Crop' }),
          ...CROP_ORDER.map((c) =>
            option('crop', c, CROPS[c].name, d.crop === c, (x) => {
              x.crop = c;
            }, CROP_ICON[c]),
          ),
        ),
        stepRow(0),
        stepRow(1),
        h(
          'div',
          { class: 'opt-row', role: 'group', 'aria-label': 'Container' },
          h('span', { class: 'opt-label', text: 'Container' }),
          ...CONTAINER_ORDER.map((c) =>
            option('box', c, CONTAINERS[c].name, d.container === c, (x) => {
              x.container = c;
            }),
          ),
        ),
        h(
          'div',
          { class: 'opt-row', role: 'group', 'aria-label': 'Label' },
          h('span', { class: 'opt-label', text: 'Label' }),
          option('label', 'yes', 'Add "Contains peanuts" label', d.label, (x) => {
            x.label = !x.label;
          }),
        ),
        h('p', { class: 'small step-notes', text: d.steps.map((s) => `${STEPS[s].name}: ${STEPS[s].note}`).join(' ') }),
      );
    };

    const trialLog = () => {
      if (!st.trials.length) return null;
      return h(
        'div',
        { class: 'trial-log' },
        h('h3', { text: 'Your trial log' }),
        h(
          'div',
          { class: 'table-wrap' },
          h(
            'table',
            { class: 'compare-table' },
            h(
              'thead',
              {},
              h(
                'tr',
                {},
                ...['Trial', 'Keeps', 'Filling', 'Effort', 'Safe', 'Fits?', ''].map((t) => h('th', { scope: 'col', text: t })),
              ),
            ),
            h(
              'tbody',
              {},
              ...st.trials.map((t, i) => {
                const r = evaluate(t.design);
                const rev = isRevision(st.trials, i);
                return h(
                  'tr',
                  { class: st.chosen === i ? 'chosen' : '' },
                  h('td', {}, h('strong', { text: `${i + 1}. ${r.name}` }), t.from !== null ? h('span', { class: 'small', text: ` (improves trial ${t.from + 1})` }) : null),
                  h('td', { text: `${r.keepDays} d` }),
                  h('td', { text: fillingWord(r.filling) }),
                  h('td', { text: effortWord(r.effort) }),
                  h('td', { text: r.safety === 'safe' ? 'yes' : r.safety === 'needs-label' ? 'needs label' : 'no' }),
                  h('td', { text: r.passes ? '✓ yes' : '✗ not yet' }),
                  h(
                    'td',
                    { class: 'row-actions' },
                    h('button', {
                      class: 'btn small',
                      type: 'button',
                      text: 'Improve this idea',
                      'data-improve': String(i),
                      'aria-label': `Improve trial ${i + 1}: ${r.name}`,
                      onclick: () => {
                        st.improving = i;
                        st.draft = { ...t.design, steps: [...t.design.steps] };
                        message = { kind: 'good', text: `Improving trial ${i + 1}. Change what the test showed, then build and test again.` };
                        ctx.persist();
                        render('[data-build]');
                      },
                    }),
                    rev
                      ? h('button', {
                          class: 'btn small primary',
                          type: 'button',
                          text: st.chosen === i ? 'Chosen' : 'Bring to Carver',
                          'data-choose': String(i),
                          'aria-label': `Bring trial ${i + 1} to Carver: ${r.name}`,
                          disabled: st.chosen === i,
                          onclick: () => choose(i),
                        })
                      : null,
                  ),
                );
              }),
            ),
          ),
        ),
      );
    };

    const guidance = (): string => {
      if (!st.trials.length) return 'Build your first idea and test it. It does not have to be perfect!';
      if (st.trials.length < 2) return 'Try a second, different idea. Comparing ideas teaches you more.';
      if (!hasRevision(st)) return 'Now improve one idea: press "Improve this idea" on a trial, change what the test showed, and test it again.';
      if (st.chosen === null) return 'You improved an idea and it fits the need. Choose the one to bring to Carver.';
      return 'Your invention is ready for Carver.';
    };

    const render = (focus?: string) => {
      const improving = st.improving !== null ? st.trials[st.improving] : null;
      fill(
        body,
        h(
          'div',
          { class: 'need-strip', role: 'note' },
          iconImg('needcard', '', 24),
          h(
            'span',
            {},
            h('strong', { text: 'The need: ' }),
            `an after-school snack that keeps ${NEED.keepDays}+ days without a fridge, is filling, is easy enough for volunteers, and is safe for every kid. `,
            h('strong', { text: 'Workshop rules: ' }),
            'no frying, no electricity, a few steps.',
          ),
        ),
        improving ? h('p', { class: 'improving', text: `Improving trial ${st.improving! + 1}: ${evaluate(improving.design).name}. Change one or more parts.` }) : null,
        builder(),
        h(
          'div',
          { class: 'planner-actions' },
          h('button', { class: 'btn primary', type: 'button', text: 'Build and test', 'data-build': true, onclick: () => build() }),
          improving
            ? h('button', {
                class: 'btn',
                type: 'button',
                text: 'Stop improving (start a new idea)',
                onclick: () => {
                  st.improving = null;
                  ctx.persist();
                  render('[data-build]');
                },
              })
            : null,
          st.rung >= 3
            ? h('button', {
                class: 'btn',
                type: 'button',
                text: 'Fill in the example',
                onclick: () => {
                  st.draft = { ...EXAMPLE, steps: [...EXAMPLE.steps] };
                  ctx.persist();
                  render('[data-build]');
                },
              })
            : null,
        ),
        latest !== null ? resultCard(st.trials[latest].design, latest + 1) : null,
        message ? h('div', { class: `feedback ${message.kind}`, role: 'status', 'data-msg': true, text: message.text }) : null,
        h('p', { class: 'next-hint', text: guidance() }),
        trialLog(),
      );
      if (focus) body.querySelector<HTMLElement>(focus)?.focus();
    };

    const build = () => {
      const d: Design = { ...st.draft, steps: [...st.draft.steps] };
      if (!d.steps.length) {
        message = { kind: 'try', text: 'Choose at least one step. A raw crop in a jar is not an invention yet!' };
        render('[data-msg]');
        return;
      }
      st.trials.push({ design: d, from: st.improving });
      const i = st.trials.length - 1;
      latest = i;
      const r = evaluate(d);
      const rev = isRevision(st.trials, i);
      if (r.passes) {
        recordAttempt(ctx.learner, 'invent', { correct: true, evidence: `Tested ${r.name}: it fits the need` });
        ctx.sound('correct');
        message = rev
          ? { kind: 'good', text: `Your improved design works! You changed it using what the test showed. You can bring it to Carver.` }
          : { kind: 'good', text: st.trials.length < 2 ? 'It fits the need! Now try a different idea to compare.' : 'It fits the need! To finish, improve one of your ideas.' };
        st.improving = rev ? null : st.improving;
      } else {
        const failKey = CHECK_LABELS.find(([k]) => !r.checks[k])![0];
        st.rung = Math.min(3, st.rung + 1);
        recordAttempt(ctx.learner, 'invent', { correct: false, misconception: `design-${failKey}` });
        escalateHint(ctx.learner, 'invent');
        ctx.sound('retry');
        const hint =
          st.rung === 1
            ? `Look at what the test showed: ${mainProblem(r)}`
            : st.rung === 2
              ? HINT_2[failKey]
              : 'Worked example: sweet potatoes, boiled then dried, in a jar with a lid, make chips that keep for weeks. Press "Fill in the example" to try it, or keep experimenting.';
        message = { kind: 'try', text: `A useful test! ${hint}` };
        if (st.improving === null) st.improving = i;
      }
      ctx.persist();
      render('[data-msg]');
      body.querySelector('.result-card')?.scrollIntoView({ block: 'nearest' });
    };

    const choose = (i: number) => {
      const firstTime = st.chosen === null;
      st.chosen = i;
      const r = evaluate(st.trials[i].design);
      recordAttempt(ctx.learner, 'invent', { correct: true, evidence: `Improved an idea into ${r.name}` });
      ctx.sound('complete');
      message = { kind: 'good', text: `${r.name} is ready. Take it to Carver and tell him why it fits the need.` };
      ctx.persist();
      render('[data-msg]');
      onChosen(firstTime);
    };

    const root = h(
      'div',
      { class: 'panel modal planner-modal bench-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bench-title' },
      h(
        'header',
        {},
        h('h2', { id: 'bench-title' }, iconImg('kit', '', 24), ' The workbench'),
        h('button', { class: 'btn small', type: 'button', text: 'Close (progress is saved)', onclick: () => modal.close() }),
      ),
      body,
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ decorations shop

/** Spend Seeds on decorations for the workshop. Cosmetic only: Seeds never buy answers. */
export function openDecorShop(ctx: RuntimeContext): Promise<void> {
  ctx.sound('open');
  return whenClosed((done) => {
    const body = h('div', { class: 'content decor-body' });
    let message: string | null = null;
    const render = (focus?: string) => {
      const seeds = ctx.save.progress.seeds;
      fill(
        body,
        h('p', { class: 'intro' }, h('strong', { text: `You have ${seeds} Seeds. ` }), 'Decorations are just for fun. Seeds never buy answers or lessons.'),
        h(
          'ul',
          { class: 'decor-list' },
          ...DECOR.map((item) => {
            const owned = ctx.save.cosmetics.includes(item.id);
            return h(
              'li',
              { class: `decor-item${owned ? ' owned' : ''}` },
              h('div', {}, h('strong', { text: item.name }), h('span', { class: 'small', text: item.text })),
              h('button', {
                class: `btn small${owned ? '' : ' primary'}`,
                type: 'button',
                'data-buy': item.id,
                text: owned ? 'In your workshop' : `Buy for ${item.price} Seeds`,
                disabled: owned || seeds < item.price,
                onclick: () => {
                  if (ctx.save.cosmetics.includes(item.id) || ctx.save.progress.seeds < item.price) return;
                  ctx.save.progress.seeds -= item.price;
                  ctx.save.cosmetics.push(item.id);
                  ctx.sound('item');
                  message = `${item.name} is now in the workshop!`;
                  ctx.persist();
                  render(`[data-buy="${item.id}"]`);
                },
              }),
            );
          }),
        ),
        message ? h('div', { class: 'feedback good', role: 'status', text: message }) : null,
      );
      if (focus) (body.querySelector<HTMLElement>(focus) ?? body.querySelector<HTMLElement>('button:not([disabled])'))?.focus();
    };
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'decor-title', style: 'width:min(560px,100%)' },
      h('header', {}, h('h2', { id: 'decor-title', text: 'Workshop decorations' }), h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() })),
      body,
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ printable card

export function openInventionCard(ctx: RuntimeContext): Promise<void> {
  return whenClosed((done) => {
    const box = (label: string) => h('div', { class: 'pc-box' }, h('div', { class: 'pc-label', text: label }), h('div', { class: 'pc-lines short' }));
    const card = h(
      'div',
      { class: 'print-card' },
      h('h2', { text: 'My Invention Sketch Card' }),
      h('p', { text: 'Find a need at home or at school. Sketch an invention you could build from things you already have (cardboard, jars, string, tape).' }),
      h('div', { class: 'pc-grid jc-pair' }, box('The need (who needs it, and why?)'), box('My idea (sketch it)')),
      h('div', { class: 'pc-grid jc-pair' }, box('What I will use'), box('How I will test it')),
      box('What I changed after testing'),
      h('p', { class: 'pc-tip', text: 'Ask a grown-up to help with anything sharp or hot.' }),
      h('p', { class: 'pc-foot', text: "Seeds of Genius · Chapter 4: The Peanut Isn't Just a Peanut. Doing this card is optional." }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ic-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'ic-title', text: 'Off-screen activity' }),
        h(
          'div',
          { style: 'display:flex;gap:8px' },
          h('button', { class: 'btn small primary', type: 'button', text: 'Print', onclick: () => window.print() }),
          h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() }),
        ),
      ),
      h('div', { class: 'content' }, card),
    );
    const modal = new Modal(ctx.host, root, done);
    return modal;
  });
}

export type { Ch4State };
