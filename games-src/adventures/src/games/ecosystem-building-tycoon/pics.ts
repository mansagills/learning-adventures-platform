import { iconImg } from '../../kit/art/icons';
import { PixelBuffer } from '../../kit/art/pixel';
import { h } from '../../kit/ui/dom';
import { paintNeedIcon, paintPiece, PIECES, type PieceId } from '../../kit/worlds/wild-lands/eco-art';
import { pix } from './pix';
import { POND_WEB, type Model, type Pic, type Question } from './problems';

const T = 24;

const tile = (id: PieceId, scale = 2, faded = false, label?: string) => {
  const name = label ?? PIECES[id].name;
  const img = pix(`q-${id}${faded ? '-gone' : ''}`, () => (faded ? fade(paintPiece(id, T)) : paintPiece(id, T)), scale, name);
  return h('figure', { class: `ebt-qtile${faded ? ' gone' : ''}` }, img, h('figcaption', { text: faded ? `No ${name.toLowerCase()}` : name }));
};

const sun = (scale = 2) =>
  h(
    'figure',
    { class: 'ebt-qtile' },
    pix('q-sun', () => paintNeedIcon(T, 'sun'), scale, 'The Sun'),
    h('figcaption', { text: 'The Sun' }),
  );
const arrow = () => h('span', { class: 'ebt-qarrow' }, iconImg('arrowRight', 'is eaten by', 28));

/** A plant faded to grey (taken away from the web, or kept in the dark). */
function fade(b: PixelBuffer, dark = false): PixelBuffer {
  const out = new PixelBuffer(b.w, b.h);
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      const c = b.get(x, y);
      if (!c || !c.startsWith('#') || c.length !== 7) continue;
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const bl = parseInt(c.slice(5, 7), 16);
      const v = Math.round((r + g + bl) / 3);
      const k = (n: number) =>
        Math.max(0, Math.min(255, dark ? Math.round(n * 0.55 + 70) : Math.round(v * 0.6 + 90)))
          .toString(16)
          .padStart(2, '0');
      out.set(x, y, dark ? `#${k(r)}${k(Math.round(g * 0.75 + r * 0.25))}${k(bl * 0.6)}` : `#${k(v)}${k(v)}${k(v)}`);
    }
  return out;
}

/** The picture above a question. `labels` adds the words a hint shows. */
export function buildPic(p: Pic, labels: boolean): HTMLElement {
  switch (p.k) {
    case 'bars':
      return barsPic(p.rows, labels);
    case 'pop':
      return popPic(p.prey, p.hunter, labels);
    case 'cycle':
      return cyclePic(labels);
    case 'chain': {
      const parts: HTMLElement[] = [];
      if (p.sun) parts.push(sun(), arrow());
      p.ids.forEach((id, i) => {
        if (i) parts.push(p.arrows ? arrow() : h('span', { class: 'ebt-qgap' }));
        parts.push(tile(id, 2, false, p.labels?.[i]));
      });
      return h(
        'div',
        { class: 'ebt-qrow' },
        ...parts,
        labels && p.arrows ? h('p', { class: 'ebt-qnote', text: 'Each arrow points to the eater: the energy goes from the food into the eater.' }) : null,
      );
    }
    case 'needs':
      return h(
        'div',
        { class: 'ebt-qrow' },
        sun(),
        h(
          'figure',
          { class: 'ebt-qtile' },
          pix('q-rain', () => paintNeedIcon(T, 'water'), 2, 'Rain'),
          h('figcaption', { text: 'Water' }),
        ),
        h(
          'figure',
          { class: 'ebt-qtile' },
          pix('q-wind', () => paintNeedIcon(T, 'air'), 2, 'Air'),
          h('figcaption', { text: 'Air' }),
        ),
        arrow(),
        tile('oak', 3),
        labels ? h('p', { class: 'ebt-qnote', text: 'A plant uses the energy in sunlight to turn water and air into food (a sugar). It gives off oxygen.' }) : null,
      );
    case 'web':
      return webPic(p.gone, labels);
    case 'pot':
      return h(
        'div',
        { class: 'ebt-qrow' },
        h(
          'figure',
          { class: 'ebt-qtile' },
          pix('q-willow', () => paintPiece('oak', T), 3, 'A tree in a big pot'),
          h('figcaption', { text: 'The tree: 74 kg heavier' }),
        ),
        h(
          'figure',
          { class: 'ebt-qtile' },
          pix('q-soil', () => paintPiece('stones', T), 2, 'The soil in the pot'),
          h('figcaption', { text: 'The soil: less than 1 kg lighter' }),
        ),
        labels ? h('p', { class: 'ebt-qnote', text: 'The tree got heavier by much more than the soil got lighter.' }) : null,
      );
    case 'dark':
      return h(
        'div',
        { class: 'ebt-qrow' },
        h(
          'figure',
          { class: 'ebt-qtile ebt-sunny' },
          pix('q-bean', () => paintPiece('grass', T), 3, 'A bean plant on a sunny window'),
          h('figcaption', { text: 'Sunny window' }),
        ),
        h(
          'figure',
          { class: 'ebt-qtile ebt-cupboard' },
          pix('q-bean-dark', () => fade(paintPiece('grass', T), true), 3, 'A bean plant in a dark cupboard'),
          h('figcaption', { text: 'Dark cupboard' }),
        ),
        labels ? h('p', { class: 'ebt-qnote', text: 'Both get water. Only one gets light.' }) : null,
      );
  }
}

/** Where each living thing sits in the pond web picture (columns and rows of a 5 by 4 grid). */
const WEB_AT: Partial<Record<PieceId, [number, number]>> = {
  heron: [2, 0],
  fish: [1, 1],
  frog: [2, 1],
  duck: [3, 1],
  snail: [1.5, 2],
  butterfly: [3.4, 2],
  lilies: [1, 3],
  reeds: [2.2, 3],
};

function webPic(gone: PieceId | undefined, labels: boolean): HTMLElement {
  const W = 5 * 34;
  const H = 4 * 30;
  const box = h('div', { class: 'ebt-web', role: 'img', 'aria-label': `The pond food web${gone ? `, with the ${PIECES[gone].name.toLowerCase()} taken away` : ''}` });
  const c = h('canvas', { class: 'px ebt-web-lines', width: W, height: H });
  const ctx = c.getContext('2d');
  const at = (id: PieceId) => [WEB_AT[id]![0] * 34 + 17, WEB_AT[id]![1] * 30 + 15];
  if (ctx)
    for (const [food, eater] of POND_WEB) {
      const [x1, y1] = at(food);
      const [x2, y2] = at(eater);
      const len = Math.hypot(x2 - x1, y2 - y1);
      const dx = (x2 - x1) / len;
      const dy = (y2 - y1) / len;
      const cut = food === gone || eater === gone;
      ctx.fillStyle = cut ? '#b8aa98' : '#7a4a1a';
      for (let t = 10; t < len - 10; t += cut ? 5 : 3) ctx.fillRect(Math.round(x1 + dx * t), Math.round(y1 + dy * t), 2, 2);
      if (!cut)
        for (let s = 0; s < 4; s++) {
          const hx = x2 - dx * 10;
          const hy = y2 - dy * 10;
          ctx.fillRect(Math.round(hx - dx * s - dy * s * 0.8), Math.round(hy - dy * s + dx * s * 0.8), 2, 2);
          ctx.fillRect(Math.round(hx - dx * s + dy * s * 0.8), Math.round(hy - dy * s - dx * s * 0.8), 2, 2);
        }
    }
  box.append(c);
  for (const id of Object.keys(WEB_AT) as PieceId[]) {
    const [x, y] = WEB_AT[id]!;
    const img = pix(`web-${id}${id === gone ? '-gone' : ''}`, () => (id === gone ? fade(paintPiece(id, T)) : paintPiece(id, T)), 1, PIECES[id].name);
    const el = h('span', { class: `ebt-web-node${id === gone ? ' gone' : ''}` }, img, labels ? h('small', { text: PIECES[id].name }) : null);
    el.style.left = `${((x * 34 + 17) / W) * 100}%`;
    el.style.top = `${((y * 30 + 15) / H) * 100}%`;
    box.append(el);
  }
  return h(
    'div',
    { class: 'ebt-qcol' },
    box,
    labels ? h('p', { class: 'ebt-qnote', text: 'Arrows point to the eaters. Follow them from the plants at the bottom up to the heron at the top.' }) : null,
  );
}

/** The picture model a second hint adds (if the question’s own picture is not already it). */
export function buildModel(q: Question): HTMLElement | null {
  const m: Model = q.model;
  if (m === 'chain' && !(q.pic.k === 'chain' && q.pic.arrows)) return buildPic({ k: 'chain', ids: ['grass', 'rabbit', 'fox'], arrows: true, sun: true }, true);
  if (m === 'web' && q.pic.k !== 'web') return buildPic({ k: 'web' }, true);
  if (m === 'needs' && q.pic.k !== 'needs') return buildPic({ k: 'needs' }, true);
  if (m === 'cycle' && q.pic.k !== 'cycle') return cyclePic(true);
  if (m === 'pyramid' && q.pic.k !== 'bars')
    return barsPic(
      [
        ['Plants', 20, '#3fae5a'],
        ['Plant-eaters', 8, '#f2c94c'],
        ['Meat-eaters', 2, '#e0503a'],
      ],
      true,
    );
  if (m === 'fact') return h('p', { class: 'ebt-model-fact', text: q.hints[1] });
  return null;
}

/** A ranger's count as a bar chart. With `labels`, a note about the energy pyramid. */
function barsPic(rows: Array<[string, number, string]>, labels: boolean): HTMLElement {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return h(
    'div',
    { class: 'ebt-qcol ebt-qbars', role: 'img', 'aria-label': rows.map(([l, n]) => `${l}: ${n}`).join(', ') },
    ...rows.map(([label, n, color]) => {
      const fill = h('span', { class: 'ebt-bar-fill' });
      fill.style.width = `${(n / max) * 100}%`;
      fill.style.background = color;
      return h('div', { class: 'ebt-bar' }, h('span', { class: 'ebt-bar-label', text: label }), h('span', { class: 'ebt-bar-track' }, fill), h('strong', { text: String(n) }));
    }),
    labels ? h('p', { class: 'ebt-qnote', text: 'A healthy island: the most plants, fewer plant-eaters, the fewest meat-eaters (the energy pyramid).' }) : null,
  );
}

/** Prey and hunter numbers over ten years: the prey rises and falls, and the hunter follows about two years later. */
function popPic(prey: PieceId, hunter: PieceId, labels: boolean): HTMLElement {
  const W = 220;
  const H = 110;
  const c = h('canvas', {
    class: 'ebt-pop-graph',
    width: W * 2,
    height: H * 2,
    role: 'img',
    'aria-label': `A graph of ${PIECES[prey].name.toLowerCase()} and ${PIECES[hunter].name.toLowerCase()} numbers over ten years`,
  });
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.scale(2, 2);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 8);
    ctx.lineTo(24, H - 18);
    ctx.lineTo(W - 6, H - 18);
    ctx.stroke();
    const line = (f: (t: number) => number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let t = 0; t <= 10; t += 0.1) {
        const x = 24 + (t / 10) * (W - 34);
        const y = H - 18 - f(t) * (H - 30);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    line((t) => 0.55 + 0.4 * Math.sin((t / 10) * Math.PI * 2.4), '#c08a2a');
    line((t) => 0.3 + 0.22 * Math.sin(((t - 1.6) / 10) * Math.PI * 2.4), '#c8402a');
    ctx.fillStyle = '#3a2414';
    ctx.font = '10px sans-serif';
    ctx.fillText('Years', W / 2 - 14, H - 4);
  }
  return h(
    'div',
    { class: 'ebt-qcol' },
    c,
    h(
      'div',
      { class: 'ebt-legend' },
      h('span', { class: 'ebt-key', style: 'background:#c08a2a' }),
      h('span', { text: PIECES[prey].name }),
      h('span', { class: 'ebt-key', style: 'background:#c8402a' }),
      h('span', { text: PIECES[hunter].name }),
    ),
    labels ? h('p', { class: 'ebt-qnote', text: 'The hunters’ line follows the prey’s line, a little later.' }) : null,
  );
}

/** The decomposer cycle: an oak drops leaves, mushrooms break them down, the rich soil feeds the oak again. */
function cyclePic(labels: boolean): HTMLElement {
  const step = (id: PieceId | 'soil', name: string) =>
    id === 'soil' ? h('figure', { class: 'ebt-qtile' }, h('span', { class: 'ebt-soil', 'aria-hidden': 'true' }), h('figcaption', { text: name })) : tile(id, 2, false, name);
  return h(
    'div',
    { class: 'ebt-qrow ebt-cycle' },
    step('oak', 'Oak tree'),
    arrow(),
    step('leaves', 'Fallen leaves'),
    arrow(),
    step('mushrooms', 'Decomposers'),
    arrow(),
    step('soil', 'Rich soil'),
    h('span', { class: 'ebt-cycle-back', text: 'back to the oak' }),
    labels ? h('p', { class: 'ebt-qnote', text: 'Matter goes round and round. Energy comes in new from the Sun every day.' }) : null,
  );
}
