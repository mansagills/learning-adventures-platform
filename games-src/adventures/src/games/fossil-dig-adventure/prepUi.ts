import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import type { FossilId } from '../../kit/worlds/wild-lands/dig-art';
import { paintPrepBench, paintPrepTool, prepFossil } from './art';
import { PREP_TEXT } from './content';
import { newPrep, PREP_TOOLS, prepDone, prepLeft, prepUse, type Prep, type PrepResult, type PrepTool } from './dig-logic';
import { nameInText } from './fossils';
import { pix } from './pix';

/**
 * Sam's prep bench: one of the child's quarry finds, still in its block of
 * rock, split into squares. The tiny air chisel takes off plain rock fast,
 * the brush clears the rock touching the bone and the dust on it, and glue
 * fixes the cracks. A chisel too close to the bone cracks it (the glue
 * mends it, but the bench counts it).
 */

export interface PrepOptions {
  fossil: FossilId;
  seed: number;
  /** A tool used where it does not work, or a crack made (for the grown-ups page). */
  onSlip: (kind: 'too-slow' | 'cracked') => void;
  onDone: (accidents: number) => void;
  onClose: (finished: boolean) => void;
}

export interface PrepHandle {
  modal: Modal;
  prep: Prep;
  use: (i: number, tool: PrepTool) => PrepResult;
}

const COLS = 10;
const ROWS = 7;
const CELL = 10;
const TOOL_NAME: Record<PrepTool, string> = { chisel: 'Air chisel', brush: 'Brush', glue: 'Glue' };

export function openPrep(host: HTMLElement, o: PrepOptions): PrepHandle {
  const { mask } = prepFossil(o.fossil, COLS, ROWS, CELL);
  const p = newPrep(mask, COLS, ROWS, mulberry32(o.seed), 2);
  let tool: PrepTool = 'chisel';
  let cur = 0;
  let finished = false;
  const touch = isTouchDevice();
  const W = COLS * CELL;
  const H = ROWS * CELL;
  const board = h('div', { class: 'fda-board fda-bench' });
  const img = h('img', { class: 'px-icon', alt: '', width: W * 5, height: H * 5, draggable: 'false' }) as HTMLImageElement;
  const cells = h('div', { class: 'fda-cells', role: 'grid', 'aria-label': 'The block of rock on the bench, in squares' });
  board.append(img, cells);
  const status = h('p', { class: 'fda-dig-status', role: 'status', 'aria-live': 'polite' });
  const left = h('p', { class: 'fda-finds' });
  const toolBtns = new Map<PrepTool, HTMLButtonElement>();
  const tools = h(
    'div',
    { class: 'fda-tools', role: 'group', 'aria-label': 'Tools' },
    ...PREP_TOOLS.map((t, i) => {
      const b = h(
        'button',
        { class: 'btn fda-tool', type: 'button', 'aria-pressed': 'false', 'aria-keyshortcuts': String(i + 1), onclick: () => pickTool(t) },
        pix(`prep-tool-${t}`, () => paintPrepTool(t), 1.5),
        h('span', { text: TOOL_NAME[t] }),
        ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) })]),
      );
      toolBtns.set(t, b);
      return b;
    }),
  );
  const leave = h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() });
  const root = h(
    'div',
    { class: 'panel modal fda-dig', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'prep-title' },
    h('header', {}, h('h2', { id: 'prep-title', text: 'The Prep Lab' }), leave),
    h('div', { class: 'content' }, h('div', { class: 'fda-dig-top' }, tools), board, status, left),
  );
  const btns: HTMLButtonElement[] = p.cells.map((_, i) => {
    const b = h('button', { class: 'fda-cell', type: 'button', role: 'gridcell', tabindex: '-1' }) as HTMLButtonElement;
    b.style.left = `${((i % COLS) / COLS) * 100}%`;
    b.style.top = `${(Math.floor(i / COLS) / ROWS) * 100}%`;
    b.style.width = `${100 / COLS}%`;
    b.style.height = `${100 / ROWS}%`;
    b.addEventListener('click', () => {
      cur = i;
      use(i, tool);
    });
    return b;
  });
  cells.append(...btns);

  const say = (text: string, aloud = true) => {
    status.textContent = text;
    if (aloud) speak(text);
  };
  const what = (i: number) => {
    const c = p.cells[i];
    if (c.covered) return c.kind === 'rock' ? 'rock' : c.kind === 'near' ? 'rock touching the fossil' : 'dust on the fossil';
    return c.cracked ? 'a crack in the fossil' : c.kind === 'bone' ? (c.glued ? 'clean fossil, glued' : 'clean fossil') : 'clear';
  };

  function render(): void {
    img.src = paintPrepBench(o.fossil, p.cells, COLS, ROWS, CELL).toDataURL(1);
    img.alt = `The ${nameInText(o.fossil)} in its block of rock. ${prepLeft(p)} squares still to do.`;
    btns.forEach((b, i) => {
      b.setAttribute('aria-label', `Row ${Math.floor(i / COLS) + 1}, square ${(i % COLS) + 1}: ${what(i)}`);
      b.classList.toggle('cur', i === cur);
      b.tabIndex = i === cur ? 0 : -1;
    });
    for (const [t, b] of toolBtns) {
      b.classList.toggle('on', t === tool);
      b.setAttribute('aria-pressed', String(t === tool));
    }
    const n = prepLeft(p);
    left.textContent = n ? PREP_TEXT.left(n) : PREP_TEXT.clean;
  }

  function pickTool(t: PrepTool): void {
    tool = t;
    audio.click();
    render();
  }

  function use(i: number, t: PrepTool): PrepResult {
    if (finished) return { k: 'done-here' };
    const r = prepUse(p, i, t);
    if (r.k === 'cleared') {
      audio.land();
      say(PREP_TEXT.cleared, false);
    } else if (r.k === 'revealed') {
      audio.correct();
      say(r.cracked ? PREP_TEXT.oldCrack : PREP_TEXT.revealed, r.cracked);
    } else if (r.k === 'cracked') {
      audio.retry();
      o.onSlip('cracked');
      say(PREP_TEXT.cracked);
    } else if (r.k === 'glued') {
      audio.itemGet();
      say(PREP_TEXT.glued, false);
    } else if (r.k === 'too-slow') {
      audio.retry();
      o.onSlip('too-slow');
      say(PREP_TEXT.tooSlow);
    } else if (r.k === 'no-crack') say(PREP_TEXT.noCrack);
    else if (r.k === 'crack-here') say(PREP_TEXT.crackHere);
    else say(PREP_TEXT.doneHere, false);
    render();
    if (prepDone(p) && !finished) {
      finished = true;
      audio.levelUp();
      say(PREP_TEXT.done(nameInText(o.fossil)));
      setTimeout(() => o.onDone(p.accidents), 900);
    }
    return r;
  }

  const onKey = (e: KeyboardEvent) => {
    if (modal.closed || !root.contains(document.activeElement ?? null)) return;
    const k = e.key.toLowerCase();
    const move = (dx: number, dy: number) => {
      const x = Math.max(0, Math.min(COLS - 1, (cur % COLS) + dx));
      const y = Math.max(0, Math.min(ROWS - 1, Math.floor(cur / COLS) + dy));
      cur = y * COLS + x;
      render();
      btns[cur].focus();
      e.preventDefault();
    };
    if (k === 'arrowleft') move(-1, 0);
    else if (k === 'arrowright') move(1, 0);
    else if (k === 'arrowup') move(0, -1);
    else if (k === 'arrowdown') move(0, 1);
    else if (/^[1-3]$/.test(k) && !e.repeat) pickTool(PREP_TOOLS[Number(k) - 1]);
    else if ((k === ' ' || k === 'enter') && btns.includes(document.activeElement as HTMLButtonElement)) {
      e.preventDefault();
      if (!e.repeat) use(cur, tool);
    }
  };
  window.addEventListener('keydown', onKey);
  const modal = new Modal(host, root, () => {
    window.removeEventListener('keydown', onKey);
    stopSpeaking();
    o.onClose(finished);
  });
  render();
  say(touch ? PREP_TEXT.startTouch : PREP_TEXT.startKeys);
  requestAnimationFrame(() => btns[cur].focus());
  return { modal, prep: p, use };
}
