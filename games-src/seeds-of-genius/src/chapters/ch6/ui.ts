import { iconImg } from '../../art/icons';
import { PixelBuffer } from '../../art/pixel';
import { npcById } from '../../content/npcs';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import { portraitURL } from '../../ui/dialogue';
import { h, Modal } from '../../ui/dom';
import {
  EXAMPLE,
  PREDICTION_TEXT,
  QUESTIONS,
  TEST_LEVELS,
  VAR_ORDER,
  VARS,
  checkSetup,
  cm,
  conclusionChoices,
  hypothesisText,
  levelName,
  nextChoices,
  outcome,
  plannedSetups,
  questionById,
  setupText,
  type Choice,
  type Prediction,
  type Setup,
  type TrayResult,
  type VarId,
} from './data';
import { ch6State, restart, results, step, type Ch6State, type Step } from './state';

function fill(el: HTMLElement, ...kids: Array<Node | null | false>): void {
  el.replaceChildren(...kids.filter((k): k is Node => !!k));
}

function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

// ================================================================ observing

export const OBSERVATIONS: Record<'sunny' | 'shady', { label: string; lines: string[]; note: string }> = {
  sunny: {
    label: "Measure Hattie's seedling on the sunny bench",
    lines: [
      'You hold the ruler against the soil and read the top leaf: 9 centimeters.',
      'The leaves are dark green, and the stem is thick and sturdy.',
    ],
    note: 'Sunny bench: 9 cm tall, dark green leaves, thick stem.',
  },
  shady: {
    label: "Measure Hattie's seedling on the shady shelf",
    lines: [
      'You measure the same way: 16 centimeters! Much taller.',
      'But the leaves are pale yellow-green, and the stem is thin and floppy. Interesting...',
    ],
    note: 'Shady shelf: 16 cm tall, but pale leaves and a thin, floppy stem.',
  },
};

export async function observe(ctx: RuntimeContext, which: 'sunny' | 'shady'): Promise<void> {
  const st = ch6State(ctx.data);
  if (!ctx.engine.hasItem('measuring_tool')) {
    await ctx.say([{ speaker: 'narrator', text: 'A row of bean seedlings from Hattie. To measure them fairly you need a ruler. Mr. Reed, the lab assistant, has one.' }]);
    return;
  }
  await ctx.say(OBSERVATIONS[which].lines.map((text) => ({ speaker: 'narrator' as const, text })));
  if (!st.observed.includes(which)) {
    st.observed.push(which);
    ctx.persist();
    ctx.sound('item');
    ctx.toast(`Observation added to your journal (${st.observed.length}/2)`, 'info');
  }
}

// ================================================================ pictures

/** A pot with a seedling of this height and look. */
function potPicture(height: number | null, leaves: string): HTMLCanvasElement {
  const b = new PixelBuffer(24, 40);
  b.rect(5, 32, 14, 8, '#c0643a');
  b.hline(4, 19, 31, '#d97a4a');
  b.hline(5, 18, 32, '#5a3a26');
  if (height !== null) {
    const tall = Math.round(height * 1.6);
    const pale = /pale/.test(leaves);
    const leaf = pale ? '#c8d67a' : /yellow/.test(leaves) ? '#b9b848' : /dark/.test(leaves) ? '#2f7a2f' : '#4f9a3a';
    const top = 31 - tall;
    b.vline(11, top, 31, pale ? '#b8c77a' : '#4f8a3a');
    if (!pale) b.vline(12, top + 2, 31, '#3f7030');
    const droop = /droopy/.test(leaves) ? 2 : 0;
    b.rect(6, top + droop, 5, 3, leaf);
    b.rect(13, top - 1 + droop, 5, 3, leaf);
  } else {
    b.set(11, 30, '#6b4a2a');
  }
  const cv = b.outline().toCanvas();
  cv.className = 'pot-pic';
  cv.setAttribute('aria-hidden', 'true');
  return cv;
}

// ================================================================ results table and chart

function resultsTable(st: Pick<Ch6State, 'a' | 'b' | 'measured'>, r: { a: TrayResult; b: TrayResult }): HTMLElement {
  const all = st.measured.length === 6;
  const row = (tray: 'a' | 'b', s: Setup, res: TrayResult) =>
    h(
      'tr',
      {},
      h(
        'th',
        { scope: 'row' },
        h('strong', { text: `Tray ${tray.toUpperCase()}` }),
        h('span', { class: 'small', text: tray === 'a' ? ' (usual way)' : ' (your test)' }),
        h('span', { class: 'tray-setup', text: setupText(s) }),
      ),
      ...res.heights.map((v, i) => h('td', { text: st.measured.includes((tray === 'a' ? 0 : 3) + i) ? cm(v) : '?' })),
      h('td', {}, all ? h('strong', { text: cm(res.average) }) : '?'),
      h('td', { text: all ? res.leaves : '?' }),
    );
  return h(
    'div',
    { class: 'results-block' },
    h('p', { class: 'small', id: 'results-caption', text: 'Seedling heights after 14 days, measured from the soil to the top leaf.' }),
    h(
      'div',
      { class: 'table-wrap' },
      h(
        'table',
        { class: 'compare-table results-table', 'aria-describedby': 'results-caption' },
        h('thead', {}, h('tr', {}, ...['Tray', 'Pot 1', 'Pot 2', 'Pot 3', 'Average', 'Leaves'].map((t) => h('th', { scope: 'col', text: t })))),
        h('tbody', {}, row('a', st.a, r.a), row('b', st.b, r.b)),
      ),
    ),
  );
}

/** A bar chart of the averages, with the three pots as dots. Every number is written as text too. */
export function resultsChart(r: { a: TrayResult; b: TrayResult }): HTMLElement {
  const W = 300;
  const H = 180;
  const max = 20;
  const y = (v: number) => H - 30 - (v / max) * (H - 62);
  const ns = 'http://www.w3.org/2000/svg';
  const el = (tag: string, attrs: Record<string, string | number>, text?: string) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'results-chart', role: 'img', 'aria-label': `Bar chart. Tray A averaged ${cm(r.a.average)}. Tray B averaged ${cm(r.b.average)}.` });
  for (const v of [0, 5, 10, 15, 20]) {
    svg.append(el('line', { x1: 40, x2: W - 10, y1: y(v), y2: y(v), stroke: '#e4d0a6', 'stroke-width': 1 }));
    svg.append(el('text', { x: 34, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5c463a' }, `${v}`));
  }
  svg.append(el('text', { x: 40, y: 14, 'font-size': 11, 'font-weight': 700, fill: '#5c463a' }, 'Height (cm)'));
  ([['a', r.a, 90, '#d9a54a'], ['b', r.b, 200, '#4f9a4a']] as Array<['a' | 'b', TrayResult, number, string]>).forEach(([id, res, x, color]) => {
    svg.append(el('rect', { x: x - 30, y: y(res.average), width: 60, height: y(0) - y(res.average), fill: color, stroke: '#2f2320', 'stroke-width': 2 }));
    svg.append(el('text', { x, y: y(Math.max(res.average, ...res.heights)) - 8, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#2f2320' }, cm(res.average)));
    res.heights.forEach((v, i) => svg.append(el('circle', { cx: x - 16 + i * 16, cy: y(v), r: 3.5, fill: '#fffaf0', stroke: '#2f2320', 'stroke-width': 1.5 })));
    svg.append(el('text', { x, y: H - 10, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#2f2320' }, `Tray ${id.toUpperCase()}`));
  });
  return h(
    'figure',
    { class: 'chart-fig' },
    svg as unknown as HTMLElement,
    h('figcaption', { class: 'small', text: `Bars show each tray's average. Dots show the three pots. Tray A: ${r.a.heights.map(cm).join(', ')}. Tray B: ${r.b.heights.map(cm).join(', ')}.` }),
  );
}

// ================================================================ the experiment bench

const STEPS: Array<[Step, string]> = [
  ['question', 'Question'],
  ['hypothesis', 'Hypothesis'],
  ['setup', 'Fair test'],
  ['measure', 'Grow and measure'],
  ['conclude', 'Conclusion'],
];

const SETUP_HINT_2: Record<string, string> = {
  none: 'Both trays are exactly the same, so they will grow the same. Change the one thing your question is about, in tray B only.',
  many: 'Make tray B match tray A in every row except one: the row your question is about.',
  wrong: 'Your question names one thing to change. Put the other rows back to match tray A, and change that one row instead.',
  comparison: 'Tray A is the comparison. Keep it the usual way: sunny bench, ½ cup of water, plain soil.',
  direction: 'Look at your hypothesis: it says what tray B gets. Set that row of tray B to match it.',
};

export function openLabBench(ctx: RuntimeContext, onChosen: (firstTime: boolean) => void): Promise<void> {
  const st = ch6State(ctx.data);
  ctx.sound('open');

  return whenClosed((done) => {
    const body = h('div', { class: 'content lab-body' });
    let message: { kind: 'good' | 'try'; text: string } | null = null;
    let warning: { text: string } | null = null;
    let pickedLevel: string | null = st.hyp?.level ?? null;

    const fail = (objective: string, misconception: string, text: string) => {
      st.rung = Math.min(3, st.rung + 1);
      recordAttempt(ctx.learner, 'method', { correct: false, misconception });
      escalateHint(ctx.learner, objective);
      ctx.sound('retry');
      message = { kind: 'try', text };
    };
    const pass = (evidence: string, text: string) => {
      recordAttempt(ctx.learner, 'method', { correct: true, evidence });
      st.rung = 0;
      ctx.sound('correct');
      message = { kind: 'good', text };
    };

    const stepper = (cur: Step) => {
      const at = STEPS.findIndex(([s]) => s === cur);
      return h(
        'ol',
        { class: 'stepper', 'aria-label': 'Experiment steps' },
        ...STEPS.map(([, name], i) =>
          h('li', { class: i < at || cur === 'done' ? 'done' : i === at ? 'now' : '', 'aria-current': i === at ? 'step' : undefined, text: `${i + 1}. ${name}` }),
        ),
      );
    };

    const observations = () =>
      h(
        'div',
        { class: 'obs-strip', role: 'note' },
        iconImg('ruler', '', 22),
        h(
          'span',
          {},
          h('strong', { text: 'Your observations: ' }),
          'sunny bench seedling 9 cm, dark green; shady shelf seedling 16 cm, pale and floppy. ',
          h('strong', { text: "Hattie's notes: " }),
          'Mae says compost makes beans grow taller; Mr. Hill says water them a lot. Nobody has tested it fairly.',
        ),
      );

    // ------------------------------------------------ step views
    const questionView = () =>
      h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: 'Choose a question you can test' }),
        h('p', { class: 'small', text: 'A testable question changes one thing and measures what happens.' }),
        h(
          'div',
          { class: 'reason-list', role: 'group', 'aria-label': 'Questions' },
          ...QUESTIONS.map((q) =>
            h('button', {
              class: `btn small reason${st.rung >= 3 && q.id === EXAMPLE.question ? ' hinted' : ''}`,
              type: 'button',
              'data-q': q.id,
              text: q.text,
              onclick: () => {
                if (!q.variable) {
                  fail('method', `question-${q.id}`, st.rung >= 2 ? `${q.feedback} Hint: look for a question that names light, water or compost.` : q.feedback);
                  if (st.rung >= 3) message = { kind: 'try', text: `${q.feedback} Worked example: "${questionById(EXAMPLE.question)!.text}" changes one thing (compost) and measures height.` };
                } else {
                  st.question = q.id;
                  pass(`Chose a testable question: ${q.text}`, `${q.feedback} Now make a prediction.`);
                }
                ctx.persist();
                render('[data-msg]');
              },
            }),
          ),
        ),
      );

    const hypothesisView = () => {
      const q = questionById(st.question)!;
      const v = q.variable!;
      const levels = TEST_LEVELS[v];
      const level = levels.length === 1 ? levels[0].id : pickedLevel;
      const pred = (p: Prediction) =>
        h('button', {
          class: 'btn small opt',
          type: 'button',
          'data-pred': p,
          disabled: !level,
          text: PREDICTION_TEXT[p],
          onclick: () => {
            st.hyp = { level: level!, prediction: p };
            const plan = plannedSetups(v, st.hyp);
            st.a = { ...plan.a };
            st.b = { ...plan.a }; // the player makes tray B different themselves
            pass(`Wrote a hypothesis: ${hypothesisText(v, st.hyp)}`, 'Hypothesis saved. Any prediction is fine: the data will tell you. Now set up a fair test.');
            ctx.persist();
            render('[data-msg]');
          },
        });
      return h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: 'Make a prediction (your hypothesis)' }),
        h('p', {}, h('strong', { text: 'Your question: ' }), q.text),
        levels.length > 1
          ? h(
              'div',
              { class: 'opt-row', role: 'group', 'aria-label': 'What tray B will test' },
              h('span', { class: 'opt-label', text: 'Tray B will' }),
              ...levels.map((l) =>
                h('button', {
                  class: `btn small opt${pickedLevel === l.id ? ' on' : ''}`,
                  type: 'button',
                  'aria-pressed': pickedLevel === l.id ? 'true' : 'false',
                  'data-level': l.id,
                  text: l.phrase,
                  onclick: () => {
                    pickedLevel = l.id;
                    render(`[data-level="${l.id}"]`);
                  },
                }),
              ),
            )
          : null,
        h(
          'div',
          { class: 'opt-row', role: 'group', 'aria-label': 'Prediction' },
          h('span', { class: 'opt-label', text: 'They will' }),
          pred('taller'),
          pred('shorter'),
          pred('same'),
        ),
        h('p', { class: 'small', text: level ? `"If bean seedlings ${levels.find((l) => l.id === level)!.phrase}, they will ... than seedlings grown the usual way."` : 'First choose what tray B will test.' }),
      );
    };

    const setupView = () => {
      const q = questionById(st.question)!;
      const v = q.variable!;
      const trayCol = (tray: 'a' | 'b') => {
        const s = st[tray];
        return h(
          'div',
          { class: `tray-col tray-${tray}` },
          h('h4', { text: tray === 'a' ? 'Tray A: the comparison (usual way)' : 'Tray B: your test' }),
          ...VAR_ORDER.map((k) =>
            h(
              'div',
              { class: `opt-row${tray === 'b' && s[k] !== st.a[k] ? ' changed' : ''}`, role: 'group', 'aria-label': `Tray ${tray.toUpperCase()} ${VARS[k].name}` },
              h('span', { class: 'opt-label', text: VARS[k].name }),
              ...VARS[k].levels.map((l) =>
                h('button', {
                  class: `btn small opt${s[k] === l.id ? ' on' : ''}`,
                  type: 'button',
                  'aria-pressed': s[k] === l.id ? 'true' : 'false',
                  'data-set': `${tray}:${k}:${l.id}`,
                  text: l.name,
                  onclick: () => {
                    (s as unknown as Record<string, string>)[k] = l.id;
                    message = null;
                    ctx.persist();
                    render(`[data-set="${tray}:${k}:${l.id}"]`);
                  },
                }),
              ),
            ),
          ),
        );
      };
      return h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: 'Set up a fair test' }),
        h('p', {}, h('strong', { text: 'Hypothesis: ' }), hypothesisText(v, st.hyp!)),
        h('p', { class: 'small', text: 'Each tray gets three pots of Hattie\'s bean seeds. A fair test changes only ONE thing between the trays.' }),
        h('div', { class: 'trays' }, trayCol('a'), trayCol('b')),
        warning
          ? h(
              'div',
              { class: 'carver-warn', role: 'alert', 'data-warn': true },
              h('img', { class: 'warn-portrait', src: portraitURL(npcById('carver')!, 'thinking'), alt: 'Carver, thinking' }),
              h(
                'div',
                {},
                h('p', {}, h('strong', { text: 'Carver: ' }), warning.text),
                h('button', {
                  class: 'btn small primary',
                  type: 'button',
                  'data-reset': true,
                  text: `Reset: make tray B match tray A except ${VARS[v].name.toLowerCase()}`,
                  onclick: () => {
                    for (const k of VAR_ORDER) if (k !== v) (st.b as unknown as Record<string, string>)[k] = st.a[k];
                    warning = null;
                    message = { kind: 'good', text: 'Tray B now matches tray A in every row but one. Check it again.' };
                    ctx.persist();
                    render('[data-plant]');
                  },
                }),
              ),
            )
          : null,
        h(
          'div',
          { class: 'planner-actions' },
          h('button', { class: 'btn primary', type: 'button', text: 'Check the test and plant the seeds', 'data-plant': true, onclick: () => plant() }),
          st.rung >= 3
            ? h('button', {
                class: 'btn',
                type: 'button',
                text: 'Fill in a fair setup',
                onclick: () => {
                  const p = plannedSetups(v, st.hyp!);
                  st.a = p.a;
                  st.b = p.b;
                  warning = null;
                  ctx.persist();
                  render('[data-plant]');
                },
              })
            : null,
        ),
      );
    };

    const plant = () => {
      const q = questionById(st.question)!;
      const v = q.variable!;
      const p = checkSetup(v, st.hyp!, st.a, st.b);
      warning = null;
      if (p.kind === 'ok') {
        st.planted = true;
        st.measured = [];
        pass(`Set up a fair test: only ${VARS[v].name.toLowerCase()} changed`, 'A fair test! Only one thing is different. You planted the seeds and waited 14 days. Now measure every pot.');
        ctx.persist();
        render('[data-msg]');
        return;
      }
      const names = (vs: VarId[]) => vs.map((x) => VARS[x].name.toLowerCase()).join(' and ');
      if (p.kind === 'many') {
        st.warnings += 1;
        warning = {
          text: `Hold on! Tray B has a different ${names(p.changed)}. If tray B grows differently, which change caused it? We could not tell. Change only one thing, so the data can answer your question.`,
        };
        fail('method', 'changed-many', st.rung >= 2 ? SETUP_HINT_2.many : 'More than one thing is different between the trays.');
      } else if (p.kind === 'none') fail('method', 'changed-none', st.rung >= 2 ? SETUP_HINT_2.none : 'Both trays are the same, so this test cannot answer your question.');
      else if (p.kind === 'wrong')
        fail('method', 'changed-wrong', st.rung >= 2 ? SETUP_HINT_2.wrong : `Your question is about ${VARS[v].name.toLowerCase()}, but you changed the ${names([p.changed])}.`);
      else if (p.kind === 'comparison') fail('method', 'changed-comparison', st.rung >= 2 ? SETUP_HINT_2.comparison : 'Tray A should stay the usual way, so you have something to compare with.');
      else fail('method', 'changed-direction', st.rung >= 2 ? SETUP_HINT_2.direction : `Your hypothesis is about seedlings that ${TEST_LEVELS[v].find((t) => t.id === st.hyp!.level)!.phrase}. Set tray B to match it.`);
      if (st.rung >= 3) message = { kind: 'try', text: `${message!.text} Worked example: tray A stays sunny, ½ cup, plain soil; tray B is the same except ${VARS[v].name.toLowerCase()}. Press "Fill in a fair setup" to try it.` };
      ctx.persist();
      render(warning ? '[data-reset]' : '[data-msg]');
    };

    const measureView = () => {
      const r = results(st);
      const pot = (tray: 'a' | 'b', i: number) => {
        const idx = (tray === 'a' ? 0 : 3) + i;
        const res = r[tray];
        const done = st.measured.includes(idx);
        return h(
          'li',
          { class: `pot${done ? ' measured' : ''}` },
          potPicture(res.heights[i], res.leaves),
          done
            ? h('span', { class: 'pot-value', text: cm(res.heights[i]) })
            : h('button', {
                class: 'btn small',
                type: 'button',
                'data-measure': String(idx),
                'aria-label': `Measure tray ${tray.toUpperCase()} pot ${i + 1}`,
                text: 'Measure',
                onclick: () => {
                  st.measured.push(idx);
                  ctx.sound('item');
                  message = st.measured.length === 6 ? { kind: 'good', text: 'Every pot is measured. Look at your results.' } : null;
                  ctx.persist();
                  const next = [0, 1, 2, 3, 4, 5].find((n) => !st.measured.includes(n));
                  render(next !== undefined ? `[data-measure="${next}"]` : '[data-msg]');
                },
              }),
        );
      };
      return h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: '14 days later: measure every pot' }),
        h('p', { class: 'small', text: 'Use the ruler the same way each time: from the soil to the top leaf.' }),
        h(
          'div',
          { class: 'trays' },
          ...(['a', 'b'] as const).map((t) =>
            h('div', { class: `tray-col tray-${t}` }, h('h4', { text: `Tray ${t.toUpperCase()}: ${setupText(st[t])}` }), h('ul', { class: 'pots' }, pot(t, 0), pot(t, 1), pot(t, 2))),
          ),
        ),
        resultsTable(st, r),
      );
    };

    const conclusionView = () => {
      const q = questionById(st.question)!;
      const v = q.variable!;
      const r = results(st);
      const o = outcome(r.a, r.b);
      const supported = o === st.hyp!.prediction;
      const want = o === 'same' ? 'same' : o === 'taller' ? 'b' : 'a';
      const ask = (id: string, title: string, choices: Choice[], answered: string | null, onRight: (c: Choice) => void, hint: string, example: string) =>
        h(
          'div',
          { class: 'conclude-q', 'data-cq': id },
          h('h4', { text: title }),
          answered
            ? h('p', { class: 'answer' }, h('span', { class: 'mark', text: '✓ ' }), answered)
            : h(
                'div',
                { class: 'reason-list', role: 'group', 'aria-label': title },
                ...choices.map((c) =>
                  h('button', {
                    class: `btn small reason${st.rung >= 3 && c.ok ? ' hinted' : ''}`,
                    type: 'button',
                    'data-choice': `${id}:${c.id}`,
                    text: c.text,
                    onclick: () => {
                      if (c.ok) {
                        onRight(c);
                        pass(`${title} ${c.text}`, c.feedback);
                      } else {
                        fail('method', `conclude-${id}-${c.id}`, st.rung === 1 ? c.feedback : st.rung === 2 ? `${c.feedback} ${hint}` : `${c.feedback} ${example}`);
                      }
                      ctx.persist();
                      render('[data-msg]');
                    },
                  }),
                ),
              ),
        );
      const avgHint = `Tray B averaged ${cm(r.b.average)} and tray A averaged ${cm(r.a.average)}. A difference of less than 1 cm counts as about the same.`;
      const trayChoices: Choice[] = [
        { id: 'a', text: 'Tray A (the usual way)', ok: want === 'a', feedback: 'Look again at the Average column.' },
        { id: 'b', text: 'Tray B (your test)', ok: want === 'b', feedback: 'Look again at the Average column.' },
        { id: 'same', text: 'About the same (less than 1 cm apart)', ok: want === 'same', feedback: 'Look again at the Average column.' },
      ];
      const hypChoices: Choice[] = [
        { id: 'yes', text: 'Yes, the data supported it.', ok: supported, feedback: `Your hypothesis said "${PREDICTION_TEXT[st.hyp!.prediction]}". Did tray B do that?` },
        { id: 'no', text: 'No, the data did not support it.', ok: !supported, feedback: `Your hypothesis said "${PREDICTION_TEXT[st.hyp!.prediction]}". Did tray B do that?` },
      ];
      const a = st.answers;
      const cc = conclusionChoices(v, st.hyp!, r.a, r.b);
      const nc = nextChoices(supported);
      return h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: 'Your results' }),
        resultsTable(st, r),
        resultsChart(r),
        h('h3', { text: 'Draw a conclusion' }),
        ask('taller', 'Which tray grew taller on average?', trayChoices, a.taller ? trayChoices.find((c) => c.id === a.taller)!.text : null, (c) => (a.taller = c.id), avgHint, `The answer: ${trayChoices.find((c) => c.ok)!.text}.`),
        a.taller
          ? ask(
              'supported',
              `Your hypothesis: "${hypothesisText(v, st.hyp!)}" Did the data support it?`,
              hypChoices,
              a.supported === null ? null : hypChoices.find((c) => c.ok)!.text,
              () => (a.supported = supported),
              `Tray B grew ${o === 'same' ? 'about the same' : o}. You predicted ${PREDICTION_TEXT[st.hyp!.prediction]}.`,
              `The answer: ${hypChoices.find((c) => c.ok)!.text}`,
            )
          : null,
        a.supported !== null
          ? ask('conclusion', 'Which conclusion matches ALL your data?', cc, a.conclusion ? cc.find((c) => c.id === a.conclusion)!.text : null, (c) => (a.conclusion = c.id), 'Use the averages, and only talk about what you tested.', `The answer: "${cc.find((c) => c.ok)!.text}"`)
          : null,
        a.conclusion
          ? ask('next', supported ? 'What would a scientist do next?' : 'Your guess was not supported. What would a scientist do next?', nc, a.next ? nc.find((c) => c.id === a.next)!.text : null, (c) => {
              a.next = c.id;
              st.log.push({ question: st.question!, hyp: { ...st.hyp! }, a: { ...st.a }, b: { ...st.b }, conclusion: a.conclusion!, next: c.id });
            }, 'Scientists never change the data, and one test is only a start.', `The answer: "${nc.find((c) => c.ok)!.text}"`)
          : null,
      );
    };

    const doneView = () => {
      const i = st.log.length - 1;
      const chosen = st.chosen === i;
      return h(
        'section',
        { class: 'lab-step done-step' },
        h('p', { class: 'verdict', text: 'Experiment complete: observation, question, hypothesis, fair test, results and conclusion.' }),
        h(
          'div',
          { class: 'planner-actions' },
          h('button', {
            class: 'btn primary',
            type: 'button',
            'data-bring': true,
            disabled: chosen,
            text: chosen ? 'Ready for Carver' : 'Bring this experiment to Carver',
            onclick: () => {
              const first = st.chosen === null;
              st.chosen = i;
              ctx.sound('complete');
              message = { kind: 'good', text: 'Your experiment is ready. Take your conclusion to Carver, beside his greenhouse.' };
              ctx.persist();
              render('[data-msg]');
              onChosen(first);
            },
          }),
          h('button', {
            class: 'btn',
            type: 'button',
            'data-new': true,
            text: 'Start a new experiment',
            onclick: () => {
              restart(st);
              message = { kind: 'good', text: 'A fresh start. Your finished experiments are kept in your journal.' };
              ctx.persist();
              render('[data-q]');
            },
          }),
        ),
      );
    };

    const render = (focus?: string) => {
      const cur = step(st);
      const view = { question: questionView, hypothesis: hypothesisView, setup: setupView, measure: measureView, conclude: conclusionView, done: () => h('div', {}, conclusionView(), doneView()) }[cur]();
      fill(
        body,
        stepper(cur),
        observations(),
        view,
        message ? h('div', { class: `feedback ${message.kind}`, role: 'status', 'data-msg': true, text: message.text }) : null,
        cur !== 'question' && cur !== 'done'
          ? h(
              'p',
              { class: 'small restart-row' },
              h('button', {
                class: 'btn small',
                type: 'button',
                'data-restart': true,
                text: 'Start over with a new question',
                onclick: () => {
                  restart(st);
                  warning = null;
                  pickedLevel = null;
                  message = { kind: 'good', text: 'Starting over. Choose a question to test.' };
                  ctx.persist();
                  render('[data-q]');
                },
              }),
            )
          : null,
      );
      if (focus) body.querySelector<HTMLElement>(focus)?.focus();
    };

    const root = h(
      'div',
      { class: 'panel modal planner-modal lab-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lab-title' },
      h(
        'header',
        {},
        h('h2', { id: 'lab-title' }, iconImg('ruler', '', 24), ' Experiment bench'),
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

// ================================================================ printable card

export function openExperimentCard(ctx: RuntimeContext): Promise<void> {
  return whenClosed((done) => {
    const box = (label: string) => h('div', { class: 'pc-box' }, h('div', { class: 'pc-label', text: label }), h('div', { class: 'pc-lines short' }));
    const card = h(
      'div',
      { class: 'print-card' },
      h('h2', { text: 'My Fair-Test Plan' }),
      h('p', { text: 'Plan a safe seed experiment with a grown-up: bean seeds, cups of soil, water and a ruler.' }),
      h('div', { class: 'pc-grid jc-pair' }, box('My question'), box('My hypothesis (my guess)')),
      h('div', { class: 'pc-grid jc-pair' }, box('The ONE thing I will change'), box('Everything that stays the same')),
      box('How I will measure (and how many cups in each group)'),
      h('p', { class: 'pc-tip', text: 'Wash your hands after touching soil and seeds. Do not eat the seeds.' }),
      h('p', { class: 'pc-foot', text: "Seeds of Genius · Chapter 6: A Scientist's Method. Doing this card is optional." }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fc-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'fc-title', text: 'Off-screen activity' }),
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

export { levelName };
