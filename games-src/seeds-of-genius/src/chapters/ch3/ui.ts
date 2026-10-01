import { iconImg } from '../../art/icons';
import { mix, PixelBuffer } from '../../art/pixel';
import { paintProp } from '../../art/props';
import { PAINT_H, PAINT_W, paintingCanvas } from '../../art/sceneArt';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import { settings } from '../../systems/settings';
import { h, Modal } from '../../ui/dom';
import {
  CROP_ORDER,
  CROPS,
  EXAMPLE_PLAN,
  FARMER_PLAN,
  PLOTS,
  SEASONS,
  WEST_START,
  WHY_OPTIONS,
  isFarmerPlan,
  judgePlan,
  planText,
  simulate,
  soilLabel,
  trendText,
  type CropId,
  type PlanResult,
  type PlotInfo,
  type SeasonResult,
} from './data';
import { addTested, bothPlotsDone, ch3State, comparedPlans, plotDone } from './state';

/** Replace an element's children, skipping empty slots. */
function fill(el: HTMLElement, ...kids: Array<Node | null | false>): void {
  el.replaceChildren(...kids.filter((k): k is Node => !!k));
}

function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

const MODEL_NOTE =
  'This is a simple model, not a promise. Real fields also depend on rain, weather and care, so every harvest is shown as a range.';

// ================================================================ the magnified soil view

/**
 * One plot's soil sample, magnified. The player looks at each part of the
 * picture through the lens; once both samples are seen, a side-by-side
 * comparison appears.
 */
export function inspectPlot(ctx: RuntimeContext, plot: PlotInfo): Promise<void> {
  const st = ch3State(ctx.data);
  const looked = st.looked[plot.id];
  ctx.sound('open');

  return whenClosed((done) => {
    const titleId = `plot-${plot.id}`;
    const paint = paintingCanvas(plot.art);
    const view = document.createElement('canvas');
    view.width = PAINT_W;
    view.height = PAINT_H;
    view.getContext('2d')!.drawImage(paint, 0, 0);
    view.className = 'painting';
    view.setAttribute('role', 'img');
    view.setAttribute('aria-label', `Magnified soil from the ${plot.name.toLowerCase()}`);

    const lens = document.createElement('canvas');
    lens.width = 120;
    lens.height = 120;
    lens.className = 'lens-view';
    lens.setAttribute('aria-hidden', 'true');
    const lensText = h('p', { class: 'lens-text', 'aria-live': 'polite', text: 'Choose a part of the sample to look at it closely.' });
    const noticed = h('ul', { class: 'noticed' });
    const status = h('div', { class: 'feedback', hidden: true, role: 'status' });
    const compare = h('div', { class: 'soil-compare', hidden: true });
    const zonesWrap = h('div', { class: 'paint-wrap' }, view);

    const drawLens = (z: PlotInfo['zones'][number]) => {
      const g = lens.getContext('2d')!;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, 120, 120);
      g.save();
      g.beginPath();
      g.arc(60, 60, 56, 0, Math.PI * 2);
      g.clip();
      const size = Math.max(z.w, z.h) + 6;
      g.drawImage(paint, z.x + z.w / 2 - size / 2, z.y + z.h / 2 - size / 2, size, size, 0, 0, 120, 120);
      g.restore();
      g.lineWidth = 6;
      g.strokeStyle = '#5b5f6b';
      g.beginPath();
      g.arc(60, 60, 56, 0, Math.PI * 2);
      g.stroke();
    };

    const render = () => {
      fill(noticed, ...plot.zones.filter((z) => looked.includes(z.id)).map((z) => h('li', { text: z.detail })));
      if (plotDone(st, plot.id)) {
        status.hidden = false;
        status.className = 'feedback good';
        const other = PLOTS.find((p) => p.id !== plot.id)!;
        status.textContent = bothPlotsDone(st)
          ? 'You have looked closely at both samples. Compare them below, then plan the seasons at the bench.'
          : `Notes saved. Now look at the ${other.name.toLowerCase()} and compare.`;
      }
      if (bothPlotsDone(st)) {
        compare.hidden = false;
        const row = (label: string, west: string, east: string) =>
          h('tr', {}, h('th', { scope: 'row', text: label }), h('td', { text: west }), h('td', { text: east }));
        fill(
          compare,
          h('h3', { text: 'West and east, side by side' }),
          h(
            'table',
            { class: 'compare-table' },
            h('thead', {}, h('tr', {}, h('th', { text: '' }), h('th', { scope: 'col', text: 'West plot' }), h('th', { scope: 'col', text: 'East plot' }))),
            h(
              'tbody',
              {},
              row('Color', 'Pale and dusty', 'Dark and crumbly'),
              row('On top', 'Hard crust, cracks', 'Soft crumbs'),
              row('Life', 'Almost none', 'A worm, root bumps'),
              row('Past crops', 'Cotton every year', 'Took turns with legumes'),
            ),
          ),
        );
      }
    };

    plot.zones.forEach((z) => {
      const btn = h('button', {
        class: `zone${looked.includes(z.id) ? ' seen' : ''}`,
        type: 'button',
        'aria-label': z.label,
        style: `left:${(z.x / PAINT_W) * 100}%;top:${(z.y / PAINT_H) * 100}%;width:${(z.w / PAINT_W) * 100}%;height:${(z.h / PAINT_H) * 100}%`,
        onclick: () => {
          drawLens(z);
          lensText.textContent = z.detail;
          btn.classList.add('seen');
          let justDone = false;
          if (!looked.includes(z.id)) {
            looked.push(z.id);
            ctx.sound('item');
            if (plotDone(st, plot.id)) {
              justDone = true;
              recordAttempt(ctx.learner, 'soil', { correct: true, evidence: `Looked closely at the ${plot.name.toLowerCase()}'s soil` });
              ctx.sound('correct');
            }
            ctx.persist();
          }
          render();
          if (justDone) status.scrollIntoView({ block: 'nearest' });
        },
      });
      zonesWrap.append(btn);
    });

    const root = h(
      'div',
      { class: 'panel modal inspect-modal soil-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
      h(
        'header',
        {},
        h('h2', { id: titleId }, iconImg('jar', '', 24), ` ${plot.name}: soil up close`),
        h('button', { class: 'btn small', type: 'button', text: 'Back to the field', onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', { class: 'intro', text: `You pour a little of Mr. Hill's ${plot.name.toLowerCase()} sample onto a tray and look closely.` }),
        h(
          'div',
          { class: 'inspect-grid' },
          zonesWrap,
          h(
            'div',
            { class: 'lens-side' },
            lens,
            lensText,
            h('div', { class: 'ledger-note' }, iconImg('ledger', '', 20), h('span', {}, h('strong', { text: "Mr. Hill's ledger: " }), plot.history)),
            h('h3', { text: 'What you noticed' }),
            noticed,
          ),
        ),
        status,
        compare,
      ),
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ pictures and meters

/** A small picture of the west plot in one season: soil color from its health, and the crop. */
export function plotPicture(soil: number, crop: CropId | null): HTMLCanvasElement {
  const b = new PixelBuffer(64, 28);
  const t = Math.max(0, Math.min(1, (soil - 5) / 60));
  const base = mix('#c7a57a', '#4e3222', t);
  b.rect(0, 8, 64, 20, base);
  for (let y = 11; y < 28; y += 4) b.hline(0, 63, y, mix(base, '#2a1a10', 0.25));
  b.rect(0, 0, 64, 8, '#bfe3f2');
  if (crop) {
    const variant = crop === 'cotton' ? (soil < 35 ? 4 : 6) : CROPS[crop].sprite;
    const sprite = paintProp('crop', variant);
    for (const x of [2, 24, 46]) b.blit(sprite, x, 28 - sprite.h);
  }
  const cv = b.toCanvas();
  cv.className = 'plot-pic';
  cv.setAttribute('aria-hidden', 'true');
  return cv;
}

function meter(value: number, max: number, cls: string, label: string): HTMLElement {
  return h(
    'div',
    { class: `meter ${cls}`, role: 'img', 'aria-label': label },
    h('div', { class: 'meter-fill', style: `width:${Math.max(2, (value / max) * 100)}%` }),
  );
}

function rangeMeter(s: SeasonResult): HTMLElement {
  const label = `Harvest about ${Math.round(s.low)} to ${Math.round(s.high)} out of 10`;
  return h(
    'div',
    { class: 'meter harvest', role: 'img', 'aria-label': label },
    h('div', { class: 'meter-range', style: `left:${s.low * 10}%;width:${Math.max(3, (s.high - s.low) * 10)}%` }),
    h('div', { class: 'meter-mark', style: `left:${s.harvest * 10}%` }),
  );
}

const soilWords = (n: number) => `${n} of 100 (${soilLabel(n)})`;

function seasonRow(s: SeasonResult, firstOfCrop = true): HTMLElement {
  const crop = CROPS[s.crop];
  const notes = firstOfCrop ? [crop.why] : [];
  if (s.repeated) notes.push(`${crop.name} followed ${crop.name.toLowerCase()}: pests and diseases that like it built up, so the harvest was smaller.`);
  return h(
    'li',
    { class: 'season-row' },
    plotPicture(s.soilAfter, s.crop),
    h(
      'div',
      { class: 'season-text' },
      h('strong', { text: `Season ${s.season}: ${crop.name}${crop.legume ? ' (legume)' : ''}` }),
      h('span', { class: 'small', text: `Soil ${s.soilBefore} → ${s.soilAfter}, ${soilLabel(s.soilAfter)}` }),
      meter(s.soilAfter, 100, 'soil', `Soil ${soilWords(s.soilAfter)}`),
      h('span', { class: 'small', text: `Harvest: about ${Math.round(s.low)} to ${Math.round(s.high)} out of 10` }),
      rangeMeter(s),
      notes.length ? h('span', { class: 'small why', text: notes.join(' ') }) : null,
    ),
  );
}

/** Season rows for a whole plan, explaining each crop the first time it appears. */
function seasonRows(r: PlanResult): HTMLElement[] {
  return r.seasons.map((s, i) => seasonRow(s, r.plan.indexOf(s.crop) === i));
}

const SVG = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}

/**
 * "Soil over four seasons": one line per tested plan on labeled bands
 * (worn out, tired, okay, healthy), so the difference shows at a glance.
 * The table next to it has the same numbers in words.
 */
export function soilChart(plans: CropId[][], latest: number): HTMLElement {
  const W = 360;
  const H = 158;
  const left = 70;
  const right = 130;
  const top = 18;
  const bottom = 24;
  const x = (i: number) => left + (i * (W - left - right)) / SEASONS;
  const y = (soil: number) => top + ((70 - Math.min(70, soil)) / 70) * (H - top - bottom);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'soil-chart', role: 'img' });
  const bands: Array<[number, number, string, string]> = [
    [55, 70, 'healthy', '#dcecc8'],
    [35, 55, 'okay', '#ecf0d2'],
    [20, 35, 'tired', '#f4e6c8'],
    [0, 20, 'worn out', '#f1d6bf'],
  ];
  bands.forEach(([lo, hi, name, color]) => {
    root.append(svg('rect', { x: left, y: y(hi), width: W - left - right, height: y(lo) - y(hi), fill: color }));
    root.append(svg('text', { x: left - 6, y: (y(lo) + y(hi)) / 2 + 4, 'text-anchor': 'end', class: 'chart-label' }, name));
  });
  ['Start', '1', '2', '3', '4'].forEach((t, i) => root.append(svg('text', { x: x(i), y: H - 6, 'text-anchor': 'middle', class: 'chart-label' }, t)));
  root.append(svg('text', { x: left, y: 11, class: 'chart-label' }, 'Soil health'));
  const summary: string[] = [];
  const shown = plans.map((p, i) => ({ p, i })).filter(({ i }) => i === latest || isFarmerPlan(plans[i]) || i >= plans.length - 3);
  const ends: number[] = [];
  shown.forEach(({ p, i }) => {
    const r = simulate(p);
    const pts = [r.start, ...r.seasons.map((s) => s.soilAfter)];
    const farmer = isFarmerPlan(p);
    const color = farmer ? '#9a4a2a' : i === latest ? '#2f6b2c' : '#7a8a9a';
    root.append(
      svg('polyline', {
        points: pts.map((v, k) => `${x(k)},${y(v)}`).join(' '),
        fill: 'none',
        stroke: color,
        'stroke-width': i === latest ? 3.5 : 2.5,
        'stroke-dasharray': farmer ? '6 4' : '',
        'stroke-linejoin': 'round',
      }),
    );
    pts.forEach((v, k) => root.append(svg('circle', { cx: x(k), cy: y(v), r: 2.6, fill: color })));
    let ly = y(r.end) + 4;
    while (ends.some((e) => Math.abs(e - ly) < 11)) ly += 11;
    ends.push(ly);
    const name = farmer ? "Mr. Hill's plan" : `Plan ${i + 1}`;
    root.append(svg('text', { x: x(SEASONS) + 6, y: ly, class: 'chart-label line', fill: color }, `${name}: ${soilLabel(r.end)}`));
    summary.push(`${name} (${planText(p)}): soil ${r.start} to ${r.end}, ${soilLabel(r.end)}`);
  });
  root.setAttribute('aria-label', `Soil over four seasons. ${summary.join('. ')}.`);
  return h('figure', { class: 'chart-wrap' }, root, h('figcaption', { class: 'small', text: 'Soil over four seasons (dashed: cotton every season)' }));
}

export function cottonTotal(r: PlanResult): number {
  return r.seasons.filter((s) => s.crop === 'cotton').reduce((a, s) => a + s.harvest, 0);
}

// ================================================================ the planner

const VERDICT_TEXT: Record<Exclude<ReturnType<typeof judgePlan>, 'ok'>, string> = {
  'no-cotton': 'Mr. Hill needs some cotton to pay his bills. Choose a plan that still grows cotton at least once.',
  'no-legume': 'This plan has no legume, so nothing puts nitrogen back. The soil keeps getting more tired.',
  'soil-falls': 'The soil ends lower than it started. Mr. Hill needs the west plot to get healthier, not more tired.',
};

const PLAN_HINTS = {
  1: 'Hint: look at your crop cards. Peanuts and cowpeas are legumes, and they add a little to the soil.',
  2: 'Hint: try a legume right before each cotton season: legume, cotton, legume, cotton.',
  3: 'Worked example: cowpeas, cotton, peanuts, cotton. It is filled in for you. Test it and see.',
} as const;

/**
 * The planning bench: plan four seasons for the west plot, watch the model
 * run season by season, compare plans, answer why cotton every year wore the
 * soil out, then choose a plan for Carver. Everything is saved as you go.
 */
export function openPlanner(ctx: RuntimeContext, onChosen: (firstTime: boolean) => void): Promise<void> {
  const st = ch3State(ctx.data);
  ctx.sound('open');

  return whenClosed((done) => {
    const body = h('div', { class: 'content planner-body' });
    let running = false;
    let closed = false;
    let lastResult: PlanResult | null = null;
    let lastIndex = -1;
    let message: { kind: 'good' | 'try'; text: string } | null = null;
    let whyMsg: { kind: 'good' | 'try'; text: string } | null = null;

    const cropCards = () =>
      h(
        'ul',
        { class: 'crop-cards', 'aria-label': 'Your crop cards' },
        ...CROP_ORDER.map((id) => {
          const c = CROPS[id];
          return h(
            'li',
            { class: `crop-card${c.legume ? ' legume' : ''}` },
            h('strong', { text: c.name }),
            c.legume ? h('span', { class: 'badge', text: 'Legume' }) : null,
            h('span', { class: 'small', text: c.use }),
            h('span', { class: 'small', text: c.soil > 0 ? `Soil: adds a little (+${c.soil})` : `Soil: uses ${c.soil < -4 ? 'a lot' : 'a little'} (${c.soil})` }),
          );
        }),
      );

    const seasonPicker = () =>
      h(
        'div',
        { class: 'season-picker' },
        ...st.draft.map((crop, i) =>
          h(
            'fieldset',
            { class: 'season-slot' },
            h('legend', { text: `Season ${i + 1}` }),
            ...CROP_ORDER.map((id) =>
              h('button', {
                class: `btn small crop-pick${crop === id ? ' on' : ''}`,
                type: 'button',
                'aria-pressed': crop === id ? 'true' : 'false',
                'data-slot': String(i),
                'data-crop': id,
                text: CROPS[id].name,
                disabled: running,
                onclick: () => {
                  st.draft[i] = id;
                  message = null;
                  ctx.persist();
                  render(`[data-slot="${i}"][data-crop="${id}"]`);
                },
              }),
            ),
          ),
        ),
      );

    const testedTable = () => {
      if (!st.tested.length) return null;
      const farmer = simulate(FARMER_PLAN);
      const rows = st.tested.map((plan, i) => {
        const r = simulate(plan);
        const fits = judgePlan(r) === 'ok';
        return h(
          'tr',
          { class: st.chosen === i ? 'chosen' : '' },
          h('td', {}, h('strong', { text: isFarmerPlan(plan) ? "Mr. Hill's plan: " : `Plan ${i + 1}: ` }), planText(plan)),
          h('td', { text: `${r.start} → ${r.end} (${soilLabel(r.end)}), ${trendText(r)}` }),
          h('td', { text: r.cottonSeasons ? `about ${Math.round(cottonTotal(r))}` : 'none' }),
          h(
            'td',
            {},
            st.whyDone
              ? h('button', {
                  class: `btn small${fits ? ' primary' : ''}`,
                  type: 'button',
                  text: st.chosen === i ? 'Chosen' : 'Bring this plan',
                  'data-choose': String(i),
                  'aria-label': `Bring this plan to Carver: ${planText(plan)}`,
                  disabled: running || st.chosen === i,
                  onclick: () => choose(i),
                })
              : h('span', { class: 'small', text: '' }),
          ),
        );
      });
      return h(
        'div',
        { class: 'tested' },
        h('h3', { text: 'Plans you tested' }),
        soilChart(st.tested, lastIndex),
        h(
          'div',
          { class: 'table-wrap' },
          h(
            'table',
            { class: 'compare-table plans-table' },
            h(
              'thead',
              {},
              h('tr', {}, h('th', { scope: 'col', text: 'Plan' }), h('th', { scope: 'col', text: 'West soil' }), h('th', { scope: 'col', text: 'Cotton picked' }), h('th', { scope: 'col', text: '' })),
            ),
            h('tbody', {}, ...rows),
          ),
        ),
        h('p', { class: 'small', text: `For comparison, cotton every season picks about ${Math.round(cottonTotal(farmer))} cotton in all and leaves the soil ${soilLabel(farmer.end)}.` }),
      );
    };

    const nextStepText = (): string | null => {
      const hasFarmer = st.tested.some(isFarmerPlan);
      const hasLegume = st.tested.some((p) => p.some((c) => CROPS[c].legume));
      if (!hasFarmer && !hasLegume) return "Start by testing Mr. Hill's plan (cotton every season), then a plan of your own.";
      if (!hasFarmer) return "Now test Mr. Hill's plan (cotton every season), so you can compare.";
      if (!hasLegume) return 'Now build a plan with a legume (peanuts or cowpeas) and test it.';
      if (!st.whyDone) return null;
      if (st.chosen === null) return 'Choose the plan you want to bring to Carver.';
      return null;
    };

    const whyPanel = () => {
      if (!comparedPlans(st) || st.whyDone) {
        if (st.whyDone)
          return h('div', { class: 'feedback good', text: 'You explained it: cotton kept taking nitrogen out, and nothing put it back.' });
        return null;
      }
      return h(
        'div',
        { class: 'why-panel' },
        h('h3', { text: 'Look at your results. Why did cotton every season wear out the soil?' }),
        h(
          'ul',
          { class: 'choices' },
          ...WHY_OPTIONS.map((o, i) =>
            h(
              'li',
              {},
              h(
                'button',
                {
                  class: 'btn',
                  type: 'button',
                  disabled: running || st.whyWrong.includes(o.id),
                  'data-why': o.id,
                  onclick: () => answerWhy(o.id),
                },
                h('span', { class: 'num', text: `${i + 1}.` }),
                ` ${o.text}`,
              ),
            ),
          ),
        ),
        whyMsg ? h('div', { class: `feedback ${whyMsg.kind}`, role: 'status', text: whyMsg.text }) : null,
      );
    };

    const results = h('ol', { class: 'season-results', 'aria-live': 'polite', 'aria-label': 'Season results' });

    const render = (focusSel?: string) => {
      const next = nextStepText();
      fill(
        body,
        h(
          'div',
          { class: 'planner-top' },
          h('p', {}, h('strong', { text: 'West plot soil today: ' }), soilWords(WEST_START)),
          h('p', {}, h('strong', { text: "Mr. Hill's need: " }), 'grow some cotton, because it pays the bills.'),
        ),
        cropCards(),
        h('h3', { text: 'Plan the next four seasons' }),
        seasonPicker(),
        h(
          'div',
          { class: 'planner-actions' },
          h('button', { class: 'btn primary', type: 'button', text: 'Test this plan', 'data-test': true, disabled: running, onclick: () => void runPlan() }),
          h('button', {
            class: 'btn',
            type: 'button',
            text: "Use Mr. Hill's plan (cotton every season)",
            disabled: running,
            onclick: () => {
              st.draft = [...FARMER_PLAN];
              ctx.persist();
              render('[data-test]');
            },
          }),
          st.rung >= 3
            ? h('button', {
                class: 'btn',
                type: 'button',
                text: 'Fill in the example plan',
                disabled: running,
                onclick: () => {
                  st.draft = [...EXAMPLE_PLAN];
                  ctx.persist();
                  render('[data-test]');
                },
              })
            : null,
        ),
        results,
        h('p', { class: 'small model-note', text: MODEL_NOTE }),
        next ? h('p', { class: 'next-hint', text: next }) : null,
        testedTable(),
        message ? h('div', { class: `feedback ${message.kind}`, role: 'status', 'data-msg': true, text: message.text }) : null,
        whyPanel(),
      );
      if (focusSel) body.querySelector<HTMLElement>(focusSel)?.focus();
    };

    const runPlan = async () => {
      if (running) return;
      running = true;
      message = null;
      const plan = [...st.draft];
      const r = simulate(plan);
      lastResult = r;
      lastIndex = addTested(st, plan);
      ctx.persist();
      render();
      results.replaceChildren();
      const step = settings.reducedMotion ? 0 : 450;
      for (const row of seasonRows(r)) {
        if (closed) return;
        results.append(row);
        ctx.sound('item');
        if (step) await new Promise((res) => setTimeout(res, step));
      }
      if (closed) return;
      running = false;
      const verdict = judgePlan(r);
      if (isFarmerPlan(plan)) {
        message = { kind: 'try', text: `Cotton every season: the soil fell from ${r.start} to ${r.end} (${soilLabel(r.end)}), and each cotton harvest was smaller than the one before.` };
        ctx.sound('retry');
      } else if (verdict === 'ok') {
        message = { kind: 'good', text: `The soil went from ${r.start} to ${r.end}: ${trendText(r)}. It gets better slowly, a little each legume season.` };
        ctx.sound('correct');
      } else {
        message = { kind: 'try', text: `${VERDICT_TEXT[verdict]} Try changing a season and test again.` };
      }
      render('[data-test]');
      // Keep this plan's season results on screen after the re-render.
      const kept = body.querySelector('.season-results');
      if (kept && lastResult) kept.replaceChildren(...seasonRows(lastResult));
      body.querySelector('[data-msg]')?.scrollIntoView({ block: 'nearest' });
    };

    const answerWhy = (id: string) => {
      const o = WHY_OPTIONS.find((x) => x.id === id)!;
      if (o.ok) {
        st.whyDone = true;
        recordAttempt(ctx.learner, 'soil', { correct: true, evidence: 'Explained why cotton every year wears soil out' });
        ctx.sound('correct');
        whyMsg = null;
        message = { kind: 'good', text: `${o.feedback} Now choose the plan you want to bring to Carver.` };
      } else {
        if (!st.whyWrong.includes(o.id)) st.whyWrong.push(o.id);
        recordAttempt(ctx.learner, 'soil', { correct: false, misconception: 'misconception' in o ? o.misconception : undefined });
        escalateHint(ctx.learner, 'soil');
        ctx.sound('retry');
        whyMsg = { kind: 'try', text: `Not quite. ${o.feedback}` };
      }
      ctx.persist();
      keepResults(o.ok ? '[data-choose]' : '.why-panel .btn:not([disabled])');
    };

    const keepResults = (focusSel?: string) => {
      render(focusSel);
      const kept = body.querySelector('.season-results');
      if (kept && lastResult) kept.replaceChildren(...seasonRows(lastResult));
    };

    const choose = (i: number) => {
      const r = simulate(st.tested[i]);
      const verdict = judgePlan(r);
      if (verdict !== 'ok') {
        st.rejected += 1;
        st.rung = Math.min(3, st.rung + 1);
        recordAttempt(ctx.learner, 'soil', { correct: false, misconception: verdict });
        escalateHint(ctx.learner, 'soil');
        if (st.rung >= 3) st.draft = [...EXAMPLE_PLAN];
        ctx.sound('retry');
        message = { kind: 'try', text: `${VERDICT_TEXT[verdict]} ${PLAN_HINTS[st.rung as 1 | 2 | 3]}` };
        ctx.persist();
        keepResults('[data-msg]');
        return;
      }
      const firstTime = st.chosen === null;
      st.chosen = i;
      recordAttempt(ctx.learner, 'soil', { correct: true, evidence: `Chose a rotation: ${planText(r.plan)}` });
      ctx.sound('complete');
      message = { kind: 'good', text: `Great plan! It grows cotton ${r.cottonSeasons === 1 ? 'once' : `${r.cottonSeasons} times`}, and the soil ends ${soilLabel(r.end)} (${trendText(r)}). Take it to Carver.` };
      ctx.persist();
      keepResults('[data-msg]');
      onChosen(firstTime);
    };

    const root = h(
      'div',
      { class: 'panel modal planner-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'plan-title' },
      h(
        'header',
        {},
        h('h2', { id: 'plan-title' }, iconImg('cropcards', '', 24), ' Plan the west plot'),
        h('button', { class: 'btn small', type: 'button', text: 'Close (progress is saved)', onclick: () => modal.close() }),
      ),
      body,
    );
    const modal = new Modal(ctx.host, root, () => {
      closed = true;
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ printable planner

export function openRotationCard(ctx: RuntimeContext): Promise<void> {
  return whenClosed((done) => {
    const box = (n: number) => h('div', { class: 'pc-box' }, h('div', { class: 'pc-label', text: `Season ${n}` }), h('div', { class: 'pc-lines short' }));
    const card = h(
      'div',
      { class: 'print-card' },
      h('h2', { text: 'My Crop-Rotation Planner' }),
      h('p', { text: 'Plan four seasons for one garden bed. Take turns: follow a hungry crop with a legume, like beans or peas.' }),
      h('div', { class: 'pc-grid jc-grid' }, box(1), box(2), box(3), box(4)),
      h(
        'div',
        { class: 'pc-box' },
        h('div', { class: 'pc-label' }, iconImg('jar', '', 22), ' Cup-of-soil experiment (with a grown-up)'),
        h('p', {
          class: 'pc-tip',
          text: 'Fill two cups with soil from the same place. Grow bean plants in cup A. When they are done, mix the plants into cup A\'s soil. Then plant the same kind of seed in both cups and write down how they grow for two weeks.',
        }),
      ),
      h('p', { class: 'pc-foot', text: 'Seeds of Genius · Chapter 3: The Soil Speaks. Doing this card is optional.' }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rc-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'rc-title', text: 'Off-screen activity' }),
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

export { SEASONS };
