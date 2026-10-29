import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintPebblePortrait, type FossilId } from '../../kit/worlds/wild-lands/dig-art';
import { paintQuarryView, quarryGrid } from '../../kit/worlds/wild-lands/dig-views';
import { paintTool } from './art';
import { QUARRY_TEXT } from './content';
import { dig, digDone, gridName, layerOf, newDig, sniff, TOOLS, type Dig, type DigResult, type Tool } from './dig-logic';
import { aFossil, FOSSILS } from './fossils';
import { pix } from './pix';

/**
 * The Quarry's dig: a square of the quarry from above, marked into a grid
 * with strings (columns A to H, rows 1 to 6). Pick a tool, then a square:
 * the shovel moves loose dirt, the rock pick breaks hard rock, and only the
 * brush is gentle enough for the thin last layer over a fossil (the others
 * chip it). Pebble can sniff out the nearest find three times a dig.
 */

export interface QuarryOptions {
  finds: FossilId[];
  seed: number;
  /** Called for each find, with its grid square (the map). */
  onFind: (id: FossilId, chipped: boolean, square: string) => void;
  /** A tool used on the wrong layer, or a fossil chipped (for the grown-ups page). */
  onSlip: (kind: 'too-hard' | 'too-soft' | 'chipped') => void;
  /** Every find is out. */
  onDone: () => void;
  /** Left early or finished. */
  onClose: (finished: boolean) => void;
}

export const SNIFFS = 3;
const W = 216;
const H = 168;
const TOOL_NAME: Record<Tool, string> = { shovel: 'Shovel', pick: 'Rock pick', brush: 'Brush' };
const LAYER_WORD: Record<ReturnType<typeof layerOf>, string> = { dirt: 'loose dirt', rock: 'hard rock', last: 'a thin last layer', dug: 'dug' };

export interface QuarryHandle {
  modal: Modal;
  /** For the browser test: the dig itself. */
  dig: Dig;
  use: (i: number, tool: Tool) => DigResult;
}

export function openQuarry(host: HTMLElement, o: QuarryOptions): QuarryHandle {
  const d = newDig(o.finds, mulberry32(o.seed));
  let tool: Tool = 'shovel';
  let cur = d.cols + 1;
  let sniffs = SNIFFS;
  let finished = false;
  const touch = isTouchDevice();
  const board = h('div', { class: 'fda-board' });
  const img = h('img', { class: 'px-icon', alt: '', width: W * 3, height: H * 3, draggable: 'false' }) as HTMLImageElement;
  const cells = h('div', { class: 'fda-cells', role: 'grid', 'aria-label': 'The quarry square, marked into a grid' });
  board.append(img, cells);
  const status = h('p', { class: 'fda-dig-status', role: 'status', 'aria-live': 'polite' });
  const findsEl = h('div', { class: 'fda-finds' });
  const toolBtns = new Map<Tool, HTMLButtonElement>();
  const tools = h(
    'div',
    { class: 'fda-tools', role: 'group', 'aria-label': 'Tools' },
    ...TOOLS.map((t, i) => {
      const b = h(
        'button',
        { class: 'btn fda-tool', type: 'button', 'aria-pressed': 'false', 'aria-keyshortcuts': String(i + 1), onclick: () => pickTool(t) },
        pix(`tool-${t}`, () => paintTool(t), 1.5),
        h('span', { text: TOOL_NAME[t] }),
        ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) })]),
      );
      toolBtns.set(t, b);
      return b;
    }),
  );
  const sniffBtn = h(
    'button',
    { class: 'btn fda-tool', type: 'button', 'aria-keyshortcuts': 'P', onclick: () => doSniff() },
    pix('pebble-face', () => paintPebblePortrait(true), 0.5),
    h('span', {}),
    ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'P' })]),
  );
  const leave = h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() });
  const root = h(
    'div',
    { class: 'panel modal fda-dig', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dig-title' },
    h('header', {}, h('h2', { id: 'dig-title', text: 'The Quarry' }), leave),
    h('div', { class: 'content' }, h('div', { class: 'fda-dig-top' }, tools, sniffBtn), board, status, findsEl),
  );

  const btns: HTMLButtonElement[] = d.cells.map((_, i) => {
    const b = h('button', { class: 'fda-cell', type: 'button', role: 'gridcell', tabindex: '-1' }) as HTMLButtonElement;
    b.addEventListener('click', () => {
      cur = i;
      use(i, tool);
    });
    return b;
  });
  const g = quarryGrid(W, H, d.cols, d.rows);
  btns.forEach((b, i) => {
    const x = i % d.cols;
    const y = Math.floor(i / d.cols);
    b.style.left = `${((g.ox + x * g.cw) / W) * 100}%`;
    b.style.top = `${((g.oy + y * g.ch) / H) * 100}%`;
    b.style.width = `${(g.cw / W) * 100}%`;
    b.style.height = `${(g.ch / H) * 100}%`;
  });
  cells.append(...btns);

  const say = (text: string, aloud = true) => {
    status.textContent = text;
    if (aloud) speak(text);
  };

  function render(): void {
    img.src = paintQuarryView(W, H, d.cells, d.cols, d.rows).toDataURL(1);
    img.alt = `The quarry square. ${found().length} of ${d.finds.length} finds out so far.`;
    btns.forEach((b, i) => {
      const c = d.cells[i];
      const what = c.left === 0 ? (c.find ? `${FOSSILS[c.find].name}${c.chipped ? ', chipped' : ''}` : 'dug, nothing here') : LAYER_WORD[layerOf(c.left)];
      b.setAttribute('aria-label', `${gridName(d, i)}: ${what}${c.sniffed && c.left > 0 ? '. Pebble sniffed here' : ''}`);
      b.classList.toggle('cur', i === cur);
      b.tabIndex = i === cur ? 0 : -1;
    });
    for (const [t, b] of toolBtns) {
      b.classList.toggle('on', t === tool);
      b.setAttribute('aria-pressed', String(t === tool));
    }
    (sniffBtn.children[1] as HTMLElement).textContent = `Pebble, sniff! (${sniffs} left)`;
    sniffBtn.disabled = sniffs <= 0 || finished;
    const got = found();
    findsEl.replaceChildren(
      h('strong', { text: `Finds: ${got.length} of ${d.finds.length}` }),
      ...d.finds.map((id) => {
        const has = got.includes(id);
        return h('span', { class: `fda-find${has ? ' got' : ''}`, text: has ? FOSSILS[id].name : '?' });
      }),
    );
  }

  function found(): FossilId[] {
    return d.cells.filter((c) => c.find && c.left === 0).map((c) => c.find!);
  }

  function pickTool(t: Tool): void {
    tool = t;
    audio.click();
    render();
  }

  function doSniff(): void {
    if (sniffs <= 0 || finished) return;
    const marked = sniff(d, cur);
    if (!marked.length) return;
    sniffs--;
    audio.hint();
    render();
    say(QUARRY_TEXT.sniff);
  }

  function use(i: number, t: Tool): DigResult {
    if (finished) return { k: 'done-here' };
    const name = gridName(d, i);
    const layer = layerOf(d.cells[i].left);
    const r = dig(d, i, t);
    if (r.k === 'dug') {
      audio.land();
      say(r.left === 2 ? QUARRY_TEXT.dirtOff(name) : QUARRY_TEXT.rockOff(name), false);
    } else if (r.k === 'too-hard') {
      audio.retry();
      o.onSlip('too-hard');
      say(QUARRY_TEXT.tooHard);
    } else if (r.k === 'too-soft') {
      audio.retry();
      o.onSlip('too-soft');
      say(layer === 'dirt' ? QUARRY_TEXT.brushDirt : QUARRY_TEXT.brushRock);
    } else if (r.k === 'empty') {
      say(QUARRY_TEXT.empty(name), false);
    } else if (r.k === 'done-here') {
      say(QUARRY_TEXT.doneHere(name), false);
    } else {
      if (r.chipped) {
        audio.retry();
        o.onSlip('chipped');
      } else audio.itemGet();
      o.onFind(r.id, r.chipped, name);
      say(r.chipped ? QUARRY_TEXT.chipped(aFossil(r.id), name, TOOL_NAME[t].toLowerCase()) : QUARRY_TEXT.found(aFossil(r.id), name));
    }
    render();
    if (digDone(d) && !finished) {
      finished = true;
      setTimeout(() => o.onDone(), 900);
    }
    return r;
  }

  const onKey = (e: KeyboardEvent) => {
    if (modal.closed || !root.contains(document.activeElement ?? null)) return;
    const k = e.key.toLowerCase();
    const move = (dx: number, dy: number) => {
      const x = Math.max(0, Math.min(d.cols - 1, (cur % d.cols) + dx));
      const y = Math.max(0, Math.min(d.rows - 1, Math.floor(cur / d.cols) + dy));
      cur = y * d.cols + x;
      render();
      btns[cur].focus();
      e.preventDefault();
    };
    if (k === 'arrowleft') move(-1, 0);
    else if (k === 'arrowright') move(1, 0);
    else if (k === 'arrowup') move(0, -1);
    else if (k === 'arrowdown') move(0, 1);
    else if (/^[1-3]$/.test(k) && !e.repeat) pickTool(TOOLS[Number(k) - 1]);
    else if (k === 'p' && !e.repeat) doSniff();
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
  say(touch ? QUARRY_TEXT.startTouch : QUARRY_TEXT.startKeys);
  requestAnimationFrame(() => btns[cur].focus());
  return { modal, dig: d, use };
}
