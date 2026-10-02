import { PixelBuffer } from './pixel';
import { P } from './palette';

/**
 * 16x16 pixel icons for the interface, painted in code (no emoji, no stock
 * icon sets). They are rendered once to data URLs and shown as <img> with
 * pixelated scaling, so they stay sharp. Several come from Seeds of Genius.
 */

type Painter = (b: PixelBuffer) => void;

const PAINTERS: Record<string, Painter> = {
  star: (b) => {
    const pts = [
      [7, 1], [8, 1], [7, 2], [8, 2], [6, 3], [9, 3], [6, 4], [9, 4],
    ];
    b.rect(6, 3, 4, 3, P.gold);
    pts.forEach(([x, y]) => b.set(x, y, P.gold));
    b.rect(1, 5, 14, 3, P.gold);
    b.rect(3, 8, 10, 2, P.gold);
    b.rect(4, 10, 8, 2, P.gold);
    b.rect(3, 12, 3, 2, P.gold);
    b.rect(10, 12, 3, 2, P.gold);
    b.rect(6, 4, 2, 3, '#fff1b8');
  },
  starEmpty: (b) => {
    const c = '#b9a58a';
    const pts = [
      [7, 1], [8, 1], [7, 2], [8, 2], [6, 3], [9, 3], [6, 4], [9, 4],
    ];
    b.rect(6, 3, 4, 3, c);
    pts.forEach(([x, y]) => b.set(x, y, c));
    b.rect(1, 5, 14, 3, c);
    b.rect(3, 8, 10, 2, c);
    b.rect(4, 10, 8, 2, c);
    b.rect(3, 12, 3, 2, c);
    b.rect(10, 12, 3, 2, c);
    b.rect(5, 6, 6, 3, '#d8cbb4');
  },
  gear: (b) => {
    b.ellipse(3, 3, 10, 10, P.metalLight);
    [[7, 1], [8, 1], [7, 14], [8, 14], [1, 7], [1, 8], [14, 7], [14, 8], [3, 3], [12, 3], [3, 12], [12, 12]].forEach(([x, y]) => b.rect(x, y, 1, 1, P.metalLight));
    b.rect(7, 0, 2, 2, P.metalLight);
    b.rect(7, 14, 2, 2, P.metalLight);
    b.rect(0, 7, 2, 2, P.metalLight);
    b.rect(14, 7, 2, 2, P.metalLight);
    b.ellipse(6, 6, 4, 4, P.metal);
  },
  check: (b) => {
    b.ellipse(1, 1, 14, 14, P.leaf2);
    [[4, 8], [5, 9], [6, 10], [7, 9], [8, 8], [9, 7], [10, 6], [11, 5]].forEach(([x, y]) => b.rect(x, y, 1, 2, P.white));
  },
  soundOn: (b) => {
    b.rect(2, 6, 3, 4, P.ink);
    b.rect(5, 4, 2, 8, P.ink);
    b.rect(7, 2, 1, 12, P.ink);
    b.vline(10, 5, 10, P.ink);
    b.vline(12, 3, 12, P.ink);
  },
  soundOff: (b) => {
    b.rect(2, 6, 3, 4, P.ink);
    b.rect(5, 4, 2, 8, P.ink);
    b.rect(7, 2, 1, 12, P.ink);
    [[10, 5], [11, 6], [12, 7], [13, 8], [14, 9], [14, 5], [13, 6], [11, 8], [10, 9]].forEach(([x, y]) => b.rect(x, y, 1, 1, '#c9483f'));
  },
  lock: (b) => {
    b.rect(3, 7, 10, 8, P.gold);
    b.vline(4, 3, 7, P.metal);
    b.vline(11, 3, 7, P.metal);
    b.hline(5, 10, 2, P.metal);
    b.rect(7, 9, 2, 3, P.gold2);
  },
  /** A light bulb: ask for a hint. */
  bulb: (b) => {
    b.ellipse(3, 1, 10, 10, '#ffe27a');
    b.ellipse(5, 2, 4, 4, '#fff6cf');
    b.rect(5, 10, 6, 2, '#ffd35e');
    b.rect(6, 12, 4, 1, P.metalLight);
    b.rect(6, 13, 4, 1, P.metal);
    b.rect(7, 14, 2, 1, P.metal);
    b.vline(8, 6, 10, P.gold2);
  },
  /** Two people: the page for parents and teachers. */
  grownups: (b) => {
    b.ellipse(2, 1, 5, 5, '#9c6440');
    b.rect(1, 6, 7, 8, '#4b7fcf');
    b.ellipse(9, 4, 5, 5, '#dcaa7e');
    b.rect(8, 9, 7, 6, '#4f9a4a');
    b.rect(2, 0, 5, 2, '#2a1f1d');
    b.rect(9, 3, 5, 2, '#7a4a2a');
  },
  /** A rolled scroll: the list of levels. */
  scroll: (b) => {
    b.rect(3, 3, 10, 10, P.paper);
    b.rect(1, 2, 14, 2, P.paper2);
    b.rect(1, 12, 14, 2, P.paper2);
    b.vline(1, 2, 3, P.wood2);
    b.vline(14, 12, 13, P.wood2);
    b.hline(5, 10, 6, P.ink);
    b.hline(5, 9, 8, P.ink);
    b.hline(5, 11, 10, P.ink);
  },
  arrowLeft: (b) => {
    b.rect(6, 6, 8, 4, P.white);
    for (let i = 0; i < 6; i++) b.vline(1 + i, 7 - i, 8 + i, P.white);
  },
  arrowRight: (b) => {
    b.rect(2, 6, 8, 4, P.white);
    for (let i = 0; i < 6; i++) b.vline(14 - i, 7 - i, 8 + i, P.white);
  },
  arrowLeft2: (b) => {
    for (let i = 0; i < 6; i++) {
      b.vline(1 + i, 7 - i, 8 + i, P.white);
      b.vline(8 + i, 7 - i, 8 + i, P.white);
    }
  },
  arrowRight2: (b) => {
    for (let i = 0; i < 6; i++) {
      b.vline(14 - i, 7 - i, 8 + i, P.white);
      b.vline(7 - i, 7 - i, 8 + i, P.white);
    }
  },
  /** A down-pointing landing marker. */
  land: (b) => {
    b.rect(5, 1, 6, 6, P.white);
    for (let i = 0; i < 6; i++) b.hline(2 + i, 13 - i, 7 + i, P.white);
  },
  question: (b) => {
    b.hline(5, 10, 2, P.gold);
    b.rect(10, 3, 2, 3, P.gold);
    b.rect(8, 6, 2, 2, P.gold);
    b.rect(7, 8, 2, 2, P.gold);
    b.rect(7, 12, 2, 2, P.gold);
    b.rect(4, 3, 2, 2, P.gold);
  },
};

const cache = new Map<string, string>();

export function iconURL(name: string, scale = 1): string {
  const key = `${name}@${scale}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const b = new PixelBuffer(16, 16);
  (PAINTERS[name] ?? PAINTERS.question)(b);
  b.outline();
  const url = b.toDataURL(scale);
  cache.set(key, url);
  return url;
}

export function iconImg(name: string, alt = '', size = 24): HTMLImageElement {
  const img = document.createElement('img');
  img.src = iconURL(name, 2);
  img.alt = alt;
  img.width = size;
  img.height = size;
  img.className = 'px-icon';
  img.draggable = false;
  if (!alt) img.setAttribute('aria-hidden', 'true');
  return img;
}
