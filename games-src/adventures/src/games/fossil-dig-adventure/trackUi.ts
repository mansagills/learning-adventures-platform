import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintTrackwayView, trackwayLayout } from '../../kit/worlds/wild-lands/dig-views';
import { TRACK_TEXT } from './content';
import { hipHeightCm, sayLength, TRACK } from './dig-logic';
import { pix } from './pix';
import { mulberry32 } from '../../kit/core/rng';
import { shuffle, type Misconception, type Tier } from './problems';

/**
 * Ranger Tala's trackway: the footprint slab from above, with a tape
 * measure. Tap a print's toe tip, then its heel, to measure it; tap one
 * print, then the next, to measure a walking step and then a running step;
 * then work out what the tracks tell us (it started to run, comparing with
 * Pebble's prints in the mud; from level 2, which animal walked there
 * first; at level 3, the hip height rule).
 */

export interface TrackOptions {
  tier: Tier;
  seed: number;
  onSlip: (m: Misconception) => void;
  onDone: (clean: number, total: number) => void;
  onClose: (finished: boolean) => void;
}

type Step =
  | { k: 'measure'; what: 'print' | 'walk' | 'run'; a: [number, number]; b: [number, number]; aName: string; bName: string }
  | { k: 'choose'; ask: string; options: Array<{ text: string; right?: boolean; why?: string; m?: Misconception }>; done: string };

export interface TrackHandle {
  modal: Modal;
  state: () => { step: number; kind: 'measure' | 'choose' | 'done'; tap: number; right: number };
}

const W = 240;
const H = 140;

export function openTrack(host: HTMLElement, o: TrackOptions): TrackHandle {
  const L = trackwayLayout(W, H);
  const P = L.three;
  const steps: Step[] = [
    { k: 'measure', what: 'print', a: P[1].toe, b: P[1].heel, aName: 'the toe tip', bName: 'the heel' },
    { k: 'measure', what: 'walk', a: P[1].heel, b: P[2].heel, aName: 'this print', bName: 'the next print' },
    { k: 'measure', what: 'run', a: P[5].heel, b: P[6].heel, aName: 'this print', bName: 'the next print' },
    {
      k: 'choose',
      ask: TRACK_TEXT.runAsk,
      options: [
        { text: 'Running', right: true },
        { text: 'Walking slowly', why: 'Slow walking makes short steps. These got longer.', m: 'far-walk' },
        { text: 'Standing still', why: 'Standing still leaves no new steps at all.', m: 'wrong-reason' },
      ],
      done: TRACK_TEXT.runDone,
    },
  ];
  if (o.tier >= 2)
    steps.push({
      k: 'choose',
      ask: TRACK_TEXT.crossAsk,
      options: [
        { text: 'The three-toed dinosaur', right: true },
        { text: 'The round-footed dinosaur', why: 'Its prints are pressed on top, so they came later.', m: 'crossing-order' },
        { text: 'Both at the very same moment', why: 'One print squashed the other, so one came first.', m: 'crossing-order' },
      ],
      done: TRACK_TEXT.crossDone,
    });
  if (o.tier >= 3)
    steps.push({
      k: 'choose',
      ask: TRACK_TEXT.hipAsk(TRACK.printCm),
      options: [
        { text: `About ${sayLength(hipHeightCm(TRACK.printCm))}`, right: true },
        { text: `About ${sayLength(TRACK.printCm + 4)}`, why: 'That adds 4. The rule says 4 times.', m: 'hip-rule' },
        { text: `About ${sayLength(TRACK.printCm)}`, why: 'That is the print itself. The hips are about 4 times higher.', m: 'hip-rule' },
      ],
      done: TRACK_TEXT.hipDone(sayLength(hipHeightCm(TRACK.printCm))),
    });

  const r = mulberry32(o.seed);
  for (const st of steps) if (st.k === 'choose') st.options = shuffle(r, st.options);
  let si = 0;
  let tapped = 0;
  let clean = 0;
  let total = 0;
  let missed = false;
  let finished = false;
  const touch = isTouchDevice();
  const NS = 'http://www.w3.org/2000/svg';
  const board = h('div', { class: 'fda-board fda-slab' });
  const img = pix(
    'trackway-view',
    () => paintTrackwayView(W, H),
    3,
    'The footprint slab from above: three-toed prints in a line, big round prints crossing them, and Pebble’s paw prints in the creek mud',
  );
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'fda-tape');
  svg.setAttribute('aria-hidden', 'true');
  const spots = h('div', { class: 'fda-cells' });
  board.append(img, svg, spots);
  const ask = h('h3', { class: 'fda-track-ask' });
  const choices = h('div', { class: 'fda-cards' });
  const status = h('p', { class: 'fda-dig-status', role: 'status', 'aria-live': 'polite' });
  const readings = h('ul', { class: 'fda-readings' });
  const leave = h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() });
  const root = h(
    'div',
    { class: 'panel modal fda-dig fda-track', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'track-title' },
    h('header', {}, h('h2', { id: 'track-title', text: 'The Trackway' }), leave),
    h('div', { class: 'content' }, ask, board, choices, status, readings),
  );
  const say = (text: string) => {
    status.textContent = text;
    speak(text);
  };
  const line = (a: [number, number], b: [number, number], cls: string) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', String(a[0]));
    l.setAttribute('y1', String(a[1]));
    l.setAttribute('x2', String(b[0]));
    l.setAttribute('y2', String(b[1]));
    l.setAttribute('class', cls);
    svg.append(l);
  };
  const reading = (text: string) => readings.append(h('li', { text }));

  function spot(at: [number, number], label: string, onTap: () => void): HTMLButtonElement {
    const b = h('button', { class: 'fda-spot', type: 'button', 'aria-label': label }) as HTMLButtonElement;
    b.style.left = `${(at[0] / W) * 100}%`;
    b.style.top = `${(at[1] / H) * 100}%`;
    b.addEventListener('click', onTap);
    return b;
  }

  function render(): void {
    const st = steps[si];
    spots.replaceChildren();
    choices.replaceChildren();
    if (!st) return;
    if (st.k === 'measure') {
      ask.textContent = TRACK_TEXT.measureAsk(st.what, tapped === 0 ? st.aName : st.bName);
      const target = tapped === 0 ? st.a : st.b;
      spots.append(
        spot(target, tapped === 0 ? `Tap ${st.aName}` : `Tap ${st.bName}`, () => {
          audio.click();
          if (tapped === 0) {
            tapped = 1;
            render();
            spots.querySelector<HTMLButtonElement>('.fda-spot')?.focus();
            return;
          }
          line(st.a, st.b, 'tape');
          const text = st.what === 'print' ? TRACK_TEXT.printRead(TRACK.printCm) : st.what === 'walk' ? TRACK_TEXT.walkRead(TRACK.walkStepM) : TRACK_TEXT.runRead(TRACK.runStepM);
          audio.correct();
          reading(text);
          status.textContent = '';
          speak(text);
          next();
        }),
      );
      requestAnimationFrame(() => spots.querySelector<HTMLButtonElement>('.fda-spot')?.focus());
      return;
    }
    ask.textContent = st.ask;
    choices.append(
      ...st.options.map((op, i) => {
        const b = h(
          'button',
          { class: 'btn fda-card-btn fda-choice', type: 'button', 'aria-keyshortcuts': String(i + 1) },
          ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) })]),
          h('span', { text: op.text }),
        ) as HTMLButtonElement;
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (op.right) {
            audio.correct();
            total++;
            if (!missed) clean++;
            missed = false;
            reading(st.done);
            status.textContent = '';
            speak(st.done);
            next();
          } else {
            missed = true;
            audio.retry();
            o.onSlip(op.m ?? 'wrong-reason');
            b.disabled = true;
            b.classList.add('nope');
            say(`Not quite. ${op.why ?? ''}`);
          }
        });
        return b;
      }),
    );
    requestAnimationFrame(() => choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  function next(): void {
    si++;
    tapped = 0;
    if (si >= steps.length) {
      finished = true;
      audio.itemGet();
      ask.textContent = TRACK_TEXT.allDone;
      choices.replaceChildren(h('button', { class: 'btn primary', type: 'button', text: 'Back to Ranger Tala', onclick: () => modal.close() }));
      spots.replaceChildren();
      requestAnimationFrame(() => choices.querySelector<HTMLButtonElement>('button')?.focus());
      o.onDone(clean, total);
      return;
    }
    render();
  }

  const onKey = (e: KeyboardEvent) => {
    if (modal.closed || e.repeat || !/^[1-3]$/.test(e.key)) return;
    const b = choices.querySelectorAll<HTMLButtonElement>('.fda-choice')[Number(e.key) - 1];
    if (b && !b.disabled) {
      e.preventDefault();
      b.click();
    }
  };
  window.addEventListener('keydown', onKey);
  const modal = new Modal(
    host,
    root,
    () => {
      window.removeEventListener('keydown', onKey);
      stopSpeaking();
      o.onClose(finished);
    },
    { closeOnBackdrop: false },
  );
  render();
  say(TRACK_TEXT.start);
  return {
    modal,
    state: () => {
      const st = steps[si];
      if (!st) return { step: si, kind: 'done', tap: 0, right: -1 };
      return { step: si, kind: st.k, tap: tapped, right: st.k === 'choose' ? st.options.findIndex((x) => x.right) : -1 };
    },
  };
}
