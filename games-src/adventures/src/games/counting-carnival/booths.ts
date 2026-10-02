import type { PixelBuffer } from '../../kit/art/pixel';
import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { settings } from '../../kit/systems/settings';
import { speak } from '../../kit/systems/speech';
import { h } from '../../kit/ui/dom';
import { paintCookie, paintDuck, paintMunch, paintPeg, paintPlate, paintPrize, paintRing, paintTicket, paintTicketStrip } from './art';
import { diagnoseBuild, tenFrame, type DuckProblem, type Misconception, type Problem, type RingProblem, type SnackProblem, type TicketProblem } from './problems';

/**
 * The booth games. Each booth draws its challenge into a "stage" and reports
 * the player's answer. The panel around it (prompt, hints, feedback, stars)
 * lives in game.ts; a stage only knows its own pictures and controls.
 */

export interface Answer {
  correct: boolean;
  /** the number picked or built (for the explanation) */
  value: number;
  misconception: Misconception | null;
}

export interface Stage {
  el: HTMLElement;
  /** Show the visual helper for this hint rung (2 = model, 3 = worked answer). */
  hint(rung: number): void;
  /** After a wrong answer: put things back so the player can try again. */
  reset(): void;
  /** After the right answer: a small celebration in the stage. */
  celebrate(): void;
}

const urlCache = new Map<string, string>();
/** A pixel picture as an <img> scaled up with crisp pixels. */
export function pix(key: string, paint: () => PixelBuffer, scale = 3, alt = ''): HTMLImageElement {
  let url = urlCache.get(key);
  let size = urlCache.get(`${key}#size`);
  if (!url) {
    const b = paint();
    url = b.toDataURL(1);
    size = `${b.w}x${b.h}`;
    urlCache.set(key, url);
    urlCache.set(`${key}#size`, size);
  }
  const [w, hgt] = size!.split('x').map(Number);
  const img = h('img', { src: url, alt, width: w * scale, height: hgt * scale, class: 'px-icon', draggable: 'false' });
  if (!alt) img.setAttribute('aria-hidden', 'true');
  return img;
}

/** The row of big number buttons most challenges use. */
function optionButtons(p: Problem, onPick: (a: Answer) => void): { el: HTMLElement; outline(value: number): void; disable(value: number): void } {
  const row = h('div', { class: 'cc-options', role: 'group', 'aria-label': 'Answers' });
  const btns = new Map<number, HTMLButtonElement>();
  p.options.forEach((o, i) => {
    const b = h('button', { class: 'btn cc-option', type: 'button', 'data-value': String(o.value), 'aria-keyshortcuts': String(i + 1) }, h('span', { class: 'cc-num', text: o.label }));
    b.addEventListener('click', () => {
      audio.click();
      onPick({ correct: o.correct, value: o.value, misconception: o.correct ? null : (o.misconception ?? 'other') });
    });
    btns.set(o.value, b);
    row.append(b);
  });
  return {
    el: row,
    outline: (v) => btns.get(v)?.classList.add('worked'),
    disable: (v) => {
      const b = btns.get(v);
      if (b) b.disabled = true;
    },
  };
}

// ------------------------------------------------------------------ Duck Pond

export function duckStage(p: DuckProblem, onPick: (a: Answer) => void): Stage & { options: ReturnType<typeof optionButtons> } {
  const pond = h('div', { class: `cc-pond layout-${p.layout}`, role: 'group', 'aria-label': `Duck pond with ${p.layout === 'ten-and-more' ? 'a row of ten ducks and more ducks below' : 'ducks to count'}` });
  const r = mulberry32(p.count * 31 + p.tier);
  let counted = 0;
  const ducks: HTMLButtonElement[] = [];
  // scattered positions on a loose grid so ducks never overlap
  const spots = Array.from({ length: 12 }, (_, i) => i).sort(() => r() - 0.5);
  for (let i = 0; i < p.count; i++) {
    const tag = h('span', { class: 'cc-tag', 'aria-hidden': 'true' });
    const d = h('button', { class: 'cc-duck', type: 'button', 'aria-label': `Duck ${i + 1}, not counted yet` }, pix('duck0', () => paintDuck(0), 3), tag);
    d.style.animationDelay = `${(i % 5) * 0.3}s`;
    if (p.layout === 'scatter') {
      const s = spots[i];
      d.style.left = `${6 + (s % 4) * 23 + r() * 6}%`;
      d.style.top = `${10 + Math.floor(s / 4) * 30 + r() * 8}%`;
    }
    d.addEventListener('click', () => {
      if (d.classList.contains('counted')) return;
      counted++;
      d.classList.add('counted');
      tag.textContent = String(counted);
      d.setAttribute('aria-label', `Duck counted: ${counted}`);
      speak(String(counted), { force: settings.readAloud !== 'off' });
      audio.fx([[64 + Math.min(counted, 20), 0, 0.08]], 'triangle', 0.08);
      if (p.tags === 'fade') window.setTimeout(() => tag.classList.add('faded'), 1100);
    });
    ducks.push(d);
    pond.append(d);
  }
  if (p.layout === 'ten-and-more') {
    // first ten in the top row, the rest below
    ducks.forEach((d, i) => d.classList.add(i < 10 ? 'top-row' : 'bottom-row'));
  }
  const options = optionButtons(p, onPick);
  const el = h('div', { class: 'cc-stage' }, pond, options.el);
  return {
    el,
    options,
    hint(rung) {
      if (rung === 2) {
        // ten-and-more: box the full row of ten and sparkle only the ducks to count on
        if (p.layout === 'ten-and-more') pond.classList.add('show-ten');
        ducks.forEach((d, i) => !d.classList.contains('counted') && (p.layout !== 'ten-and-more' || i >= 10) && d.classList.add('sparkle'));
      }
      if (rung >= 3) {
        ducks.forEach((d, i) => {
          d.classList.add('counted');
          const t = d.querySelector('.cc-tag')!;
          t.textContent = String(i + 1);
          t.classList.remove('faded');
        });
        options.outline(p.count);
      }
    },
    reset() {
      counted = 0;
      ducks.forEach((d, i) => {
        d.classList.remove('counted');
        d.querySelector('.cc-tag')!.textContent = '';
        d.setAttribute('aria-label', `Duck ${i + 1}, not counted yet`);
      });
    },
    celebrate() {
      pond.classList.add('happy');
    },
  };
}

// ------------------------------------------------------------------ Ring Toss

const RED = '#d23b33';
const BLUE = '#3d8fd6';

export function ringStage(p: RingProblem, onPick: (a: Answer) => void): Stage {
  const frame = h('div', { class: 'cc-frame', role: 'img', 'aria-label': p.flash ? 'A ten-frame of pegs with rings. Look quickly!' : `A ten-frame of pegs. ${p.count} pegs have rings.` });
  const pegImg = (color: string | null) => pix(`peg-${color ?? 'none'}`, () => paintPeg(color), 4);
  const cells = tenFrame(p.count).map((has, i) => {
    const num = h('span', { class: 'cc-pegnum', text: String(i + 1) });
    const c = h('div', { class: `cc-peg${has ? ' has' : ''}` }, pegImg(has ? RED : null), num);
    frame.append(c);
    return c;
  });
  const cover = h('div', { class: 'cc-cover', hidden: true }, h('span', { text: 'How many did you see?' }));
  const again = h('button', { class: 'btn small', type: 'button', hidden: true, text: 'Look again', onclick: () => show() });
  const wrap = h('div', { class: 'cc-frame-wrap' }, frame, cover);
  const options = optionButtons(p, onPick);
  let timer = 0;
  const show = () => {
    cover.hidden = true;
    again.hidden = true;
    if (!p.flash) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      cover.hidden = false;
      again.hidden = false;
    }, settings.reducedMotion ? 3000 : 1800);
  };
  show();
  const el = h('div', { class: 'cc-stage' }, wrap, again, options.el);
  return {
    el,
    hint(rung) {
      if (rung === 2) {
        cover.hidden = true;
        again.hidden = true;
        window.clearTimeout(timer);
        frame.classList.add(p.mode === 'make-ten' ? 'number-empty' : 'number-rings');
      }
      if (rung >= 3) {
        cover.hidden = true;
        window.clearTimeout(timer);
        frame.classList.add('number-empty', 'number-rings');
        options.outline(p.answer);
      }
    },
    reset() {
      show();
    },
    celebrate() {
      window.clearTimeout(timer);
      cover.hidden = true;
      again.hidden = true;
      if (p.mode === 'make-ten')
        cells.forEach((c, i) => {
          if (c.classList.contains('has')) return;
          // a blue ring flies in, then the peg shows it sitting around the post
          const ring = pix('ring-blue', () => paintRing(BLUE), 4);
          ring.classList.add('cc-ring', 'tossed');
          const delay = (i - p.count) * 120;
          ring.style.animationDelay = `${delay}ms`;
          c.append(ring);
          window.setTimeout(() => {
            ring.remove();
            c.firstElementChild?.replaceWith(pegImg(BLUE));
          }, delay + 520);
        });
    },
  };
}

// ------------------------------------------------------------------ Munch's Snack Stand

export function snackStage(p: SnackProblem, onPick: (a: Answer) => void): Stage {
  const munch = h('div', { class: 'cc-munch' }, pix('munch0', () => paintMunch(0), 4, 'Munch the monster'));
  const setMunch = (open: boolean) => munch.replaceChildren(pix(open ? 'munch1' : 'munch0', () => paintMunch(open ? 1 : 0), 4, 'Munch the monster'));
  if (p.mode === 'compare' && p.plates) {
    const plates = p.plates.map((pl, i) => {
      const cookies = h('div', { class: 'cc-cookies' });
      for (let k = 0; k < pl.count; k++) cookies.append(pix(`cookie-${pl.size}`, () => paintCookie(pl.size), pl.size === 'big' ? 2 : 3));
      const label = h('span', { class: 'cc-platecount', text: String(pl.count) });
      const b = h('button', { class: 'cc-plate', type: 'button', 'data-value': String(i), 'aria-label': `Plate ${i + 1}: ${pl.count} ${pl.size} cookies` }, pix('plate', () => paintPlate(), 3), cookies, label);
      b.addEventListener('click', () => {
        audio.click();
        const o = p.options[i];
        onPick({ correct: o.correct, value: i, misconception: o.correct ? null : (o.misconception ?? 'other') });
      });
      return b;
    });
    const row = h('div', { class: 'cc-plates' }, ...plates);
    return {
      el: h('div', { class: 'cc-stage' }, munch, row),
      hint(rung) {
        if (rung >= 2) row.classList.add('show-counts');
        if (rung >= 3) plates[p.answer].classList.add('worked');
      },
      reset() {
        setMunch(false);
      },
      celebrate() {
        setMunch(true);
        plates[p.answer].classList.add('eaten');
        window.setTimeout(() => setMunch(false), 600);
      },
    };
  }
  const helper = h('div', { class: 'cc-helper', hidden: true });
  const base = p.base!;
  if (p.mode === 'one-more') {
    for (let n = Math.max(0, base - 3); n <= base + 3; n++) helper.append(h('span', { class: `cc-tick${n === base ? ' here' : ''}`, text: String(n) }));
  } else {
    const tens = Math.floor(base / 10);
    const ones = base % 10;
    const group = h('div', { class: 'cc-tens' });
    for (let i = 0; i < tens; i++) group.append(pix('strip', () => paintTicketStrip(), 2));
    for (let i = 0; i < ones; i++) group.append(pix('ticket', () => paintTicket(), 2));
    helper.append(group, h('span', { class: 'cc-helper-note', text: `${base} is ${tens} tens and ${ones} ones` }));
  }
  const sign = h('div', { class: 'cc-sign' }, h('span', { text: `${(p.delta ?? 0) > 0 ? (Math.abs(p.delta!) === 10 ? '10 more than' : '1 more than') : Math.abs(p.delta!) === 10 ? '10 less than' : '1 less than'}` }), h('strong', { text: String(base) }));
  const options = optionButtons(p, onPick);
  return {
    el: h('div', { class: 'cc-stage' }, h('div', { class: 'cc-munch-row' }, munch, sign), helper, options.el),
    hint(rung) {
      if (rung >= 2) helper.hidden = false;
      if (rung >= 3) options.outline(p.answer);
    },
    reset() {
      setMunch(false);
    },
    celebrate() {
      setMunch(true);
      window.setTimeout(() => setMunch(false), 600);
    },
  };
}

// ------------------------------------------------------------------ Prize Counter

export function ticketStage(p: TicketProblem, onPick: (a: Answer) => void): Stage {
  if (p.mode !== 'build') {
    const table = h('div', { class: 'cc-tickets', role: 'img', 'aria-label': `${p.tens} strips of ten tickets${p.ones ? ` and ${p.ones} single tickets` : ''}` });
    const strips: HTMLElement[] = [];
    for (let i = 0; i < p.tens; i++) {
      const s = h('div', { class: 'cc-strip' }, pix('strip', () => paintTicketStrip(), 3), h('span', { class: 'cc-stripnum', text: String((i + 1) * 10) }));
      strips.push(s);
      table.append(s);
    }
    const singles = h('div', { class: 'cc-singles' });
    for (let i = 0; i < p.ones; i++) singles.append(h('div', { class: 'cc-single' }, pix('ticket', () => paintTicket(), 3), h('span', { class: 'cc-stripnum', text: String(p.tens * 10 + i + 1) })));
    if (p.ones) table.append(singles);
    const options = optionButtons(p, onPick);
    return {
      el: h('div', { class: 'cc-stage' }, table, options.el),
      hint(rung) {
        if (rung >= 2) table.classList.add('show-counts');
        if (rung >= 3) options.outline(p.answer);
      },
      reset() {},
      celebrate() {
        table.classList.add('happy');
      },
    };
  }
  // Build: put out exactly the price with strips of 10 and single tickets.
  let tens = 0;
  let ones = 0;
  const tray = h('div', { class: 'cc-tray', 'aria-live': 'polite' });
  const total = h('div', { class: 'cc-total', hidden: true });
  const redraw = () => {
    tray.replaceChildren();
    for (let i = 0; i < tens; i++) tray.append(pix('strip', () => paintTicketStrip(), 2));
    for (let i = 0; i < ones; i++) tray.append(pix('ticket', () => paintTicket(), 2));
    tray.setAttribute('aria-label', `On the counter: ${tens} strips and ${ones} single tickets`);
    total.textContent = `${tens} tens and ${ones} ones = ${tens * 10 + ones}`;
  };
  const btn = (label: string, aria: string, fn: () => void) =>
    h('button', {
      class: 'btn cc-build-btn',
      type: 'button',
      'aria-label': aria,
      onclick: () => {
        fn();
        audio.click();
        redraw();
      },
    }, label);
  const controls = h(
    'div',
    { class: 'cc-build', role: 'group', 'aria-label': 'Put out tickets' },
    btn('+ strip of 10', 'Add a strip of 10 tickets', () => (tens = Math.min(12, tens + 1))),
    btn('+ 1 ticket', 'Add 1 ticket', () => (ones = Math.min(19, ones + 1))),
    btn('− strip', 'Take back a strip of 10', () => (tens = Math.max(0, tens - 1))),
    btn('− 1', 'Take back 1 ticket', () => (ones = Math.max(0, ones - 1))),
  );
  const pay = h('button', { class: 'btn primary cc-pay', type: 'button', text: 'Pay' });
  pay.addEventListener('click', () => {
    const built = tens * 10 + ones;
    const m = diagnoseBuild(p.answer, built);
    onPick({ correct: m === null, value: built, misconception: m });
  });
  const prize = h('div', { class: 'cc-prize' }, pix(`prize-${p.prize}`, () => paintPrize(p.prize ?? ''), 4, p.prize ?? 'a prize'), h('div', { class: 'cc-price' }, h('span', { text: 'Price' }), h('strong', { text: `${p.answer} tickets` })));
  redraw();
  return {
    el: h('div', { class: 'cc-stage' }, prize, tray, total, controls, pay),
    hint(rung) {
      if (rung >= 2) total.hidden = false;
      if (rung >= 3) {
        tens = Math.floor(p.answer / 10);
        ones = p.answer % 10;
        redraw();
        pay.classList.add('worked');
      }
    },
    reset() {},
    celebrate() {
      tray.classList.add('happy');
    },
  };
}

export function makeStage(p: Problem, onPick: (a: Answer) => void): Stage {
  switch (p.booth) {
    case 'ducks':
      return duckStage(p, onPick);
    case 'rings':
      return ringStage(p, onPick);
    case 'snacks':
      return snackStage(p, onPick);
    case 'tickets':
      return ticketStage(p, onPick);
  }
}

