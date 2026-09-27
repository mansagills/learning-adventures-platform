import { PixelBuffer } from './pixel';
import { P } from './palette';

/**
 * 16x16 pixel icons for items and the interface. They are rendered once to
 * data URLs and shown as <img> with pixelated scaling, so they stay sharp.
 */

type Painter = (b: PixelBuffer) => void;

const PAINTERS: Record<string, Painter> = {
  seedPacket: (b) => {
    b.rect(3, 2, 10, 12, P.paper2);
    b.rect(4, 3, 8, 10, P.paper);
    b.hline(3, 12, 2, '#b89a68');
    b.rect(5, 5, 6, 4, P.leaf2);
    b.set(8, 4, P.leaf3);
    b.set(6, 6, P.flowerYellow);
    b.hline(5, 10, 11, P.ink);
  },
  notebook: (b) => {
    b.rect(3, 1, 10, 14, '#3f7f3a');
    b.rect(4, 2, 8, 12, '#4f9a4a');
    b.vline(3, 1, 14, '#2e5f2b');
    b.rect(6, 4, 5, 3, P.paper);
    b.hline(6, 10, 9, P.paper2);
    b.hline(6, 9, 11, P.paper2);
    b.rect(12, 0, 1, 5, P.flowerYellow);
    b.set(12, 5, P.ink);
  },
  lens: (b) => {
    b.ellipse(1, 1, 10, 10, P.metal);
    b.ellipse(2, 2, 8, 8, '#cfeaf5');
    b.set(4, 4, P.white);
    b.set(5, 4, P.white);
    b.set(4, 5, P.white);
    [[10, 10], [11, 11], [12, 12], [13, 13], [14, 14]].forEach(([x, y]) => b.rect(x, y, 2, 1, P.wood2));
  },
  card: (b) => {
    b.rect(1, 3, 14, 10, P.paper);
    b.rect(1, 3, 14, 2, '#4f9a4a');
    b.rect(3, 7, 3, 3, P.paper2);
    b.rect(7, 7, 3, 3, P.paper2);
    b.rect(11, 7, 2, 3, P.paper2);
    b.set(4, 8, P.leaf2);
    b.set(8, 8, P.flowerBlue);
  },
  seed: (b) => {
    b.ellipse(4, 3, 8, 11, '#c98c4a');
    b.ellipse(5, 4, 4, 6, '#e0ad6a');
    b.vline(8, 5, 12, '#9a6a36');
    b.set(8, 2, P.leaf2);
    b.set(9, 1, P.leaf3);
    b.set(7, 1, P.leaf3);
  },
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
  journal: (b) => {
    b.rect(2, 2, 12, 12, '#7a3f2c');
    b.rect(4, 3, 9, 10, '#a4553d');
    b.vline(4, 2, 13, '#5c2f22');
    b.rect(7, 5, 4, 3, P.paper);
    b.hline(12, 13, 9, P.gold);
    b.set(8, 6, P.leaf2);
  },
  bag: (b) => {
    b.rect(2, 5, 12, 9, '#9a6a36');
    b.rect(3, 6, 10, 7, '#b88046');
    b.hline(5, 10, 2, '#7a4f2a');
    b.vline(4, 3, 5, '#7a4f2a');
    b.vline(11, 3, 5, '#7a4f2a');
    b.rect(6, 8, 4, 3, '#7a4f2a');
    b.set(7, 9, P.gold);
  },
  gear: (b) => {
    b.ellipse(3, 3, 10, 10, P.metalLight);
    [[7, 1], [8, 1], [7, 14], [8, 14], [1, 7], [1, 8], [14, 7], [14, 8], [3, 3], [12, 3], [3, 12], [12, 12]].forEach(
      ([x, y]) => b.rect(x, y, 1, 1, P.metalLight),
    );
    b.rect(7, 0, 2, 2, P.metalLight);
    b.rect(7, 14, 2, 2, P.metalLight);
    b.rect(0, 7, 2, 2, P.metalLight);
    b.rect(14, 7, 2, 2, P.metalLight);
    b.ellipse(6, 6, 4, 4, P.metal);
  },
  sun: (b) => {
    b.ellipse(4, 4, 8, 8, P.gold);
    b.ellipse(5, 5, 4, 4, '#ffe08a');
    [[7, 0], [8, 0], [7, 14], [8, 14], [0, 7], [0, 8], [14, 7], [14, 8], [2, 2], [13, 2], [2, 13], [13, 13]].forEach(([x, y]) =>
      b.rect(x, y, 1, 2, P.gold),
    );
  },
  moon: (b) => {
    b.ellipse(3, 2, 11, 11, '#f3e3b5');
    b.ellipse(7, 1, 9, 9, null);
    b.set(6, 9, '#d9c68e');
    b.set(8, 11, '#d9c68e');
  },
  sunset: (b) => {
    b.ellipse(3, 5, 10, 10, '#f08a4b');
    b.rect(0, 11, 16, 4, null);
    b.hline(1, 14, 11, '#c9483f');
    b.hline(3, 12, 13, '#c9483f');
  },
  map: (b) => {
    b.rect(1, 3, 14, 10, P.paper);
    b.vline(5, 3, 12, P.paper2);
    b.vline(10, 3, 12, P.paper2);
    b.set(3, 6, P.leaf2);
    b.set(7, 9, P.water1);
    b.set(8, 9, P.water1);
    b.rect(11, 5, 2, 2, '#c9483f');
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
  talk: (b) => {
    b.rect(1, 2, 14, 9, P.white);
    b.rect(3, 11, 3, 2, P.white);
    b.set(3, 13, P.white);
    b.hline(4, 11, 5, P.ink);
    b.hline(4, 9, 8, P.ink);
  },
  leaf: (b) => {
    b.ellipse(3, 2, 10, 11, P.leaf2);
    b.vline(8, 3, 14, P.leaf1);
    b.set(6, 6, P.leaf1);
    b.set(10, 8, P.leaf1);
    b.set(5, 4, P.leaf3);
  },
  lock: (b) => {
    b.rect(3, 7, 10, 8, P.gold);
    b.rect(5, 2, 6, 6, null);
    b.vline(4, 3, 7, P.metal);
    b.vline(11, 3, 7, P.metal);
    b.hline(5, 10, 2, P.metal);
    b.rect(7, 9, 2, 3, P.gold2);
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
