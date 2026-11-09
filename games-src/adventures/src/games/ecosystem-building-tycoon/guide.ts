import { iconImg } from '../../kit/art/icons';
import { audio } from '../../kit/systems/audio';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { toast } from '../../kit/ui/hud';
import { paintPiece, PIECE_IDS, PIECES, ROLE_COLOR, ROLE_NAME, type PieceId, type Role } from '../../kit/worlds/wild-lands/eco-art';
import { PIECE_FACT } from './content';
import { pix } from './pix';
import { BREAKS_DOWN, EATS } from './rules';

/**
 * The research hut: the Field Guide (a page for every living thing and
 * habitat feature the child has placed) and the food web board (the child
 * draws the arrows from each food to its eater, for the living things they
 * have found).
 */

const ROLE_ORDER: Role[] = ['producer', 'herbivore', 'omnivore', 'carnivore', 'decomposer', 'feature', 'invasive'];

const nameOf = (id: PieceId) => PIECES[id].name.toLowerCase();
const list = (ids: PieceId[]) => (ids.length <= 1 ? ids.map(nameOf).join('') : `${ids.slice(0, -1).map(nameOf).join(', ')} and ${nameOf(ids[ids.length - 1])}`);

/** What eats this tile (from the tiles in the game). */
function eatenBy(id: PieceId): PieceId[] {
  return PIECE_IDS.filter((x) => EATS[x]?.includes(id));
}

/** The decomposers that break this tile down (dead things and dung). */
function brokenBy(id: PieceId): PieceId[] {
  return PIECE_IDS.filter((x) => BREAKS_DOWN[x]?.includes(id));
}

/** Every true arrow (food>eater) between two tiles the child has found. */
export function webLinksAmong(seen: readonly PieceId[]): string[] {
  const out: string[] = [];
  for (const eater of seen) {
    for (const food of EATS[eater] ?? []) if (seen.includes(food)) out.push(`${food}>${eater}`);
    for (const dead of BREAKS_DOWN[eater] ?? []) if (seen.includes(dead)) out.push(`${dead}>${eater}`);
  }
  return out;
}

/** Is `food>eater` a true arrow? 'yes', 'backwards' (the eater and the food swapped) or 'no'. */
export function checkArrow(food: PieceId, eater: PieceId): 'yes' | 'backwards' | 'no' {
  const ok = (a: PieceId, b: PieceId) => !!EATS[b]?.includes(a) || !!BREAKS_DOWN[b]?.includes(a);
  if (ok(food, eater)) return 'yes';
  if (ok(eater, food)) return 'backwards';
  return 'no';
}

// ------------------------------------------------------------------ the Field Guide

export function openFieldGuide(host: HTMLElement, seen: readonly PieceId[], onClose: () => void): Modal {
  const ids = [...PIECE_IDS].sort((a, b) => ROLE_ORDER.indexOf(PIECES[a].role) - ROLE_ORDER.indexOf(PIECES[b].role));
  const page = (id: PieceId) => {
    const found = seen.includes(id);
    const role = PIECES[id].role;
    if (!found)
      return h(
        'article',
        { class: 'ebt-guide-card locked', 'data-guide': id },
        h('span', { class: 'ebt-guide-q', 'aria-hidden': 'true', text: '?' }),
        h('strong', { text: 'Not found yet' }),
        h('span', { text: 'Place it on an island to add its page.' }),
      );
    const eats = EATS[id] ?? [];
    const by = eatenBy(id);
    const breaks = BREAKS_DOWN[id] ?? [];
    const broken = brokenBy(id);
    const card = h(
      'article',
      { class: 'ebt-guide-card', 'data-guide': id },
      h('div', { class: 'ebt-guide-band' }),
      pix(`guide-${id}`, () => paintPiece(id, 24), 2, PIECES[id].name),
      h('strong', { text: PIECES[id].name }),
      h('span', { class: 'ebt-guide-role', text: ROLE_NAME[role] }),
      h('p', { text: PIECE_FACT[id] }),
      eats.length ? h('p', { class: 'ebt-guide-line', text: `Eats: ${list(eats)}.` }) : null,
      breaks.length ? h('p', { class: 'ebt-guide-line', text: `Breaks down: ${list(breaks.map((x) => x))}${breaks.includes('deer') ? ' (their dung)' : ''}.` }) : null,
      by.length ? h('p', { class: 'ebt-guide-line', text: `Eaten by: ${list(by)}.` }) : null,
      broken.length ? h('p', { class: 'ebt-guide-line', text: `Broken down by: ${list(broken)}.` }) : null,
    );
    (card.firstChild as HTMLElement).style.background = ROLE_COLOR[role];
    return card;
  };
  const found = PIECE_IDS.filter((id) => seen.includes(id)).length;
  const root = h(
    'div',
    { class: 'panel modal ebt-guide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ebt-guide-title' },
    h(
      'header',
      {},
      h('h2', { id: 'ebt-guide-title', text: `Field Guide: ${found} of ${PIECE_IDS.length} found` }),
      h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() }),
    ),
    h('p', { class: 'ebt-guide-intro', text: 'Every living thing and habitat feature you place on an island gets a page here. The colored band shows its role in the ecosystem.' }),
    h('div', { class: 'ebt-guide-grid' }, ...ids.map(page)),
  );
  const modal = new Modal(host, root, () => {
    stopSpeaking();
    onClose();
  });
  return modal;
}

// ------------------------------------------------------------------ the food web board

interface WebHooks {
  /** A right arrow was drawn (saved as "food>eater"). */
  found(link: string): void;
  close(): void;
}

/** Which row of the board a tile goes in: hunters at the top, then plant-eaters, plants, and decomposers with dead things at the bottom. */
function rowOf(id: PieceId): number {
  const r = PIECES[id].role;
  if (r === 'carnivore') return 0;
  if (r === 'herbivore' || r === 'omnivore') return 1;
  if (r === 'producer') return 2;
  return 3;
}

export function openWebBoard(host: HTMLElement, seen: readonly PieceId[], drawn: string[], hooks: WebHooks): Modal {
  const links = webLinksAmong(seen);
  const ids = PIECE_IDS.filter((id) => seen.includes(id) && links.some((l) => l.split('>').includes(id)));
  let picked: PieceId | null = null;
  const feedback = h('div', { class: 'ebt-feedback hint', role: 'status', 'aria-live': 'polite' });
  const count = h('span', { class: 'ebt-level' });
  const board = h('div', { class: 'ebt-web-board' });
  const lines = h('canvas', { class: 'ebt-web-board-lines', 'aria-hidden': 'true' });
  const buttons = new Map<PieceId, HTMLButtonElement>();
  const rowNames = ['Hunters', 'Plant-eaters', 'Plants', 'Decomposers and dead things'];
  for (let r = 0; r < 4; r++) {
    const row = ids.filter((id) => rowOf(id) === r);
    if (!row.length) continue;
    board.append(
      h(
        'div',
        { class: 'ebt-web-row' },
        h('span', { class: 'ebt-web-rowname', text: rowNames[r] }),
        ...row.map((id) => {
          const b = h(
            'button',
            { class: 'btn ebt-web-tile', type: 'button', 'data-web': id, 'aria-pressed': 'false', onclick: () => tap(id) },
            pix(`webb-${id}`, () => paintPiece(id, 24), 2, ''),
            h('span', { text: PIECES[id].name }),
          ) as HTMLButtonElement;
          buttons.set(id, b);
          return b;
        }),
      ),
    );
  }
  const wrap = h('div', { class: 'ebt-web-wrap' }, board, lines);
  const say = (text: string, kind: 'good' | 'try' | 'hint') => {
    feedback.className = `ebt-feedback ${kind}`;
    feedback.replaceChildren(iconImg(kind === 'good' ? 'star' : 'bulb', '', 22), h('span', { text }));
    speak(text);
  };
  const render = () => {
    const done = links.filter((l) => drawn.includes(l)).length;
    count.textContent = `${done} of ${links.length} arrows`;
    for (const [id, b] of buttons) {
      b.classList.toggle('on', id === picked);
      b.setAttribute('aria-pressed', String(id === picked));
    }
    drawLines();
  };
  const drawLines = () => {
    const box = wrap.getBoundingClientRect();
    const dpr = 2;
    lines.width = Math.max(1, Math.round(box.width * dpr));
    lines.height = Math.max(1, Math.round(box.height * dpr));
    const ctx = lines.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, box.width, box.height);
    for (const l of drawn) {
      const [a, z] = l.split('>') as [PieceId, PieceId];
      const ea = buttons.get(a);
      const ez = buttons.get(z);
      if (!ea || !ez) continue;
      const ra = ea.getBoundingClientRect();
      const rz = ez.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - box.left;
      const y1 = ra.top + ra.height / 2 - box.top;
      const x2 = rz.left + rz.width / 2 - box.left;
      const y2 = rz.top + rz.height / 2 - box.top;
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 1) continue;
      const dx = (x2 - x1) / len;
      const dy = (y2 - y1) / len;
      // stop at the edge of the tiles, then an arrow head
      const sx = x1 + dx * 30;
      const sy = y1 + dy * 30;
      const ex = x2 - dx * 34;
      const ey = y2 - dy * 34;
      const decomposer = PIECES[z].role === 'decomposer';
      ctx.strokeStyle = decomposer ? '#9a62d0' : '#c87a1a';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex + dx * 8, ey + dy * 8);
      ctx.lineTo(ex - dy * 6, ey + dx * 6);
      ctx.lineTo(ex + dy * 6, ey - dx * 6);
      ctx.closePath();
      ctx.fill();
    }
  };
  const tap = (id: PieceId) => {
    if (!picked) {
      picked = id;
      audio.click();
      say(`Now tap who eats the ${nameOf(id)}${brokenBy(id).length ? ', or who breaks it down' : ''}.`, 'hint');
      render();
      return;
    }
    if (picked === id) {
      picked = null;
      render();
      return;
    }
    const food = picked;
    picked = null;
    const link = `${food}>${id}`;
    const res = checkArrow(food, id);
    if (res === 'yes') {
      if (!drawn.includes(link)) {
        drawn.push(link);
        hooks.found(link);
      }
      audio.correct();
      const done = links.filter((l) => drawn.includes(l)).length;
      if (done === links.length) {
        audio.itemGet();
        toast('Food web complete!', 'reward');
        say(`Yes! The ${nameOf(food)} feeds the ${nameOf(id)}. That is every arrow: your food web is complete!`, 'good');
      } else say(`Yes! The arrow goes from the ${nameOf(food)} to the ${nameOf(id)}: the energy goes into the eater.`, 'good');
    } else if (res === 'backwards') {
      audio.retry();
      say(`Close! The ${nameOf(id)} is eaten by the ${nameOf(food)}, so the arrow starts at the ${nameOf(id)}. Arrows point to the eater.`, 'try');
    } else {
      audio.retry();
      say(`Not that one: the ${nameOf(id)} does not eat the ${nameOf(food)}. ${PIECE_FACT[id]}`, 'try');
    }
    render();
  };
  const root = h(
    'div',
    { class: 'panel modal ebt-webpanel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ebt-web-title' },
    h(
      'header',
      {},
      h('h2', { id: 'ebt-web-title', text: 'Food web board' }),
      h('div', { class: 'ebt-head-right' }, count, h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() })),
    ),
    h('p', { class: 'ebt-guide-intro', text: 'Draw the food web of the living things you have found. Tap a food, then tap who eats it (or who breaks it down). Arrows point to the eater.' }),
    ids.length ? wrap : h('p', { class: 'ebt-guide-intro', text: 'Place some plants and animals on an island first. Every tile you place joins this board.' }),
    feedback,
  );
  const modal = new Modal(host, root, () => {
    window.removeEventListener('resize', drawLines);
    stopSpeaking();
    hooks.close();
  });
  window.addEventListener('resize', drawLines);
  say('Tap a food, then tap who eats it.', 'hint');
  requestAnimationFrame(render);
  return modal;
}
