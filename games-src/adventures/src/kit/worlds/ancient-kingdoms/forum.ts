import { PixelBuffer } from '../../art/pixel';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene } from '../types';
import { ANC, paintAncientSky, paintCat, type HorizonCtx } from './art';

/**
 * Ancient Kingdoms setting: a Roman forum (W1 proof that one world style can
 * hold many settings). The world's style stays the same as the Mali river
 * market: 24 pixels per tile, the same shading, the same warm sky and dusk,
 * torchlight (here in bronze braziers) and the indigo panel accent. Only the
 * place changes: travertine paving, a black-and-white mosaic, a basalt road,
 * a temple with columns, a basilica arcade, a triumphal arch, a fountain, and
 * the hills of Rome with an aqueduct and the Colosseum on the horizon.
 */

const ROME = {
  travertine: ramp('#e6d9bd'),
  marble: ramp('#f1ece2', { spread: 0.8 }),
  basalt: ramp('#626875'),
  grass: ramp('#86ad52'),
  pine: ramp('#4f7f3a'),
  cypress: ramp('#2f5c3a'),
  plaster: ramp('#c45a44'),
  ochre: ramp('#d89a4c'),
  bronze: ramp('#b07a3a'),
  tile: ramp('#c0603a'),
  bread: ramp('#c98a46'),
  olive: ramp('#6b7a32'),
  grape: ramp('#6b3f8a'),
  water: ramp('#5aaed0'),
  ink: ramp('#2e2a2a'),
} as const;

const U = (T: number) => T / 16;

export const FORUM_LAYOUT = { w: 26, h: 24, floorTop: 4, plaza: { x0: 1.5, y0: 4, x1: 24.5, y1: 14.5 }, road: [15, 17.6] as [number, number], mosaic: { x0: 9.5, y0: 7.2, x1: 16.5, y1: 11.6 } };
const L = FORUM_LAYOUT;

// ------------------------------------------------------------------ ground

export function paintForumGround(T: number): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const R = ROME;
  const bev = Math.max(1, Math.round(u));
  // grass everywhere, with tufts
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = hash(Math.floor(x / (2 * u)), Math.floor(y / (2 * u)), 4);
      p.dot(x, y, R.grass, n < 0.12 ? 3 : n > 0.9 ? 1 : 2);
    }
  // travertine paving: big slabs in rows, each row offset, with a lit edge and a soft joint
  const P = L.plaza;
  const rowH = Math.round(1.25 * T);
  for (let y = Math.round(P.y0 * T); y < P.y1 * T; y++) {
    const row = Math.floor((y - P.y0 * T) / rowH);
    const ly = (y - P.y0 * T) % rowH;
    const slabW = row % 2 ? 2 * T : Math.round(1.5 * T);
    const off = row % 2 ? T : 0;
    for (let x = Math.round(P.x0 * T); x < P.x1 * T; x++) {
      const lx = (x + off) % slabW;
      const slab = Math.floor((x + off) / slabW);
      const tone = hash(slab, row, 12);
      let lv = tone > 0.7 ? 3 : 2;
      if (ly < bev || lx < bev) lv = 3;
      if (ly >= rowH - bev * 2 || lx >= slabW - bev * 2) lv = 1;
      if (ly === rowH - 1 || lx === slabW - 1) lv = 1;
      if (lv === 2 && hash(x, y, 13) < 0.012) lv = 1;
      p.dot(x, y, R.travertine, lv);
    }
  }
  // a mosaic: a black-and-white meander border around a star rosette
  const M = L.mosaic;
  const mx0 = Math.round(M.x0 * T);
  const my0 = Math.round(M.y0 * T);
  const mx1 = Math.round(M.x1 * T);
  const my1 = Math.round(M.y1 * T);
  const cell = Math.max(2, Math.round(2 * u));
  const border = cell * 5;
  const ink = R.ink;
  const white = R.marble;
  for (let y = my0; y < my1; y++)
    for (let x = mx0; x < mx1; x++) {
      const bx = Math.min(x - mx0, mx1 - 1 - x);
      const by = Math.min(y - my0, my1 - 1 - y);
      const edge = Math.min(bx, by);
      // tesserae: a grid of small tiles with thin joints
      const joint = (x - mx0) % cell === cell - 1 || (y - my0) % cell === cell - 1;
      let r: Ramp = white;
      let lv = 2;
      if (edge < cell) r = ink;
      else if (edge < border) {
        // the meander (Greek key): a repeating hook shape along the border
        const along = bx < by ? y - my0 : x - mx0;
        const across = edge - cell;
        const a = Math.floor(along / cell) % 6;
        const b = Math.floor(across / cell);
        const key = (a === 0 && b <= 3) || (b === 3 && a <= 3) || (a === 3 && b >= 1 && b <= 3) || (b === 1 && a >= 2 && a <= 3);
        if (key) r = ink;
      } else if (edge < border + cell) r = ink;
      else {
        // the rosette: an eight-pointed star (two squares, one turned) in terracotta and ochre, in a circle
        const cx = (mx0 + mx1) / 2;
        const cy = (my0 + my1) / 2;
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const rr = Math.min(mx1 - mx0, my1 - my0) / 2 - border - cell * 2;
        const sq = Math.max(Math.abs(dx), Math.abs(dy));
        const dia = (Math.abs(dx) + Math.abs(dy)) / Math.SQRT2;
        const star = Math.max(sq, dia) <= rr * 0.62;
        const inner = Math.max(sq, dia) <= rr * 0.62 - cell;
        const d = Math.hypot(dx, dy);
        if (star && !inner) r = ink;
        else if (inner) r = d < rr * 0.25 ? ROME.ochre : ANC.terra;
        else if (d <= rr && d > rr - cell) r = ink;
        else if (d < rr && Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 8)) % 2 === 0) r = ROME.ochre;
      }
      if (joint) lv = 1;
      p.dot(x, y, r, lv);
    }
  // the road (like the Via Sacra): polygonal basalt blocks between travertine curbs
  const [r0, r1] = L.road;
  const step = Math.round(0.8 * T);
  const pts: Array<[number, number]> = [];
  for (let gy = Math.floor(r0 * T) - step; gy < r1 * T + step; gy += step)
    for (let gx = -step; gx < W + step; gx += step) pts.push([gx + hash(gx, gy, 1) * step, gy + hash(gx, gy, 2) * step]);
  for (let y = Math.round(r0 * T); y < r1 * T; y++)
    for (let x = 0; x < W; x++) {
      let d1 = 1e9;
      let d2 = 1e9;
      let best = 0;
      for (let i = 0; i < pts.length; i++) {
        const [px, py] = pts[i];
        if (Math.abs(px - x) > step * 2 || Math.abs(py - y) > step * 2) continue;
        const d = (px - x) ** 2 + (py - y) ** 2;
        if (d < d1) {
          d2 = d1;
          d1 = d;
          best = i;
        } else if (d < d2) d2 = d;
      }
      const gap = Math.sqrt(d2) - Math.sqrt(d1);
      const lv = gap < 1.4 * u ? 0 : gap < 3 * u ? (pts[best][1] > y ? 1 : 3) : hash(best, 0, 3) > 0.6 ? 2 : 1;
      p.dot(x, y, R.basalt, lv);
    }
  const curb = Math.round(0.35 * T);
  p.rect(0, Math.round(r0 * T) - curb, W, curb, R.travertine, { level: 3 });
  p.rect(0, Math.round(r1 * T), W, curb, R.travertine, { level: 1 });
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the horizon of Rome

/** Rome: green hills, an aqueduct, the Colosseum, stone pines and cypresses. */
export function romeHorizon({ p, T, u, W, H, horizon, far }: HorizonCtx): void {
  const S = (v: number) => v * u;
  const hill = far('#7e9c56', 0.4);
  const hill2 = far('#93a866', 0.55);
  for (let x = 0; x < W; x++) {
    const a = horizon - (Math.sin(x / (40 * u)) * 0.5 + 0.6) * T - Math.sin(x / (13 * u)) * 3 * u;
    const b = horizon + 0.2 * T - (Math.sin(x / (55 * u) + 2) * 0.35 + 0.35) * T;
    for (let y = Math.floor(a); y < H; y++) p.dot(x, y, hill2, y < a + 2 * u ? 3 : 2);
    for (let y = Math.floor(b); y < H; y++) p.dot(x, y, hill, y < b + 2 * u ? 3 : 2);
  }
  // the aqueduct: a long row of arches on tall piers
  const aq = far('#c9a87a', 0.35);
  const ay = horizon - 0.15 * T;
  const ah = 1.15 * T;
  const span = Math.round(0.42 * T);
  for (let x = Math.round(W * 0.04); x < W * 0.4; x++) {
    const lx = x % span;
    for (let y = Math.floor(ay - ah); y < ay; y++) {
      const top = y < ay - ah + 3 * u;
      const archY = ay - ah + 3 * u + span * 0.5;
      const inArch = !top && y > archY - Math.sqrt(Math.max(0, (span * 0.36) ** 2 - (lx - span / 2) ** 2)) && lx > span * 0.14 && lx < span * 0.86;
      if (!inArch) p.dot(x, y, aq, top ? 3 : 2);
    }
  }
  // the Colosseum: an oval of three rows of arches with a top story
  const cx = W * 0.72;
  const cw = 2.6 * T;
  const ch = 1.5 * T;
  const col = far('#d8c09a', 0.3);
  for (let y = Math.floor(horizon - ch); y < horizon + 0.2 * T; y++)
    for (let x = Math.floor(cx - cw / 2); x < cx + cw / 2; x++) {
      const t = (x - (cx - cw / 2)) / cw;
      const curve = Math.sin(t * Math.PI) * 0.12 * T;
      if (y < horizon - ch - curve + 0.15 * T) continue;
      const tier = Math.floor((y - (horizon - ch)) / (ch / 4));
      const lx = (x - (cx - cw / 2)) % Math.round(0.2 * T);
      const ly = (y - (horizon - ch)) % (ch / 4);
      const arch = tier > 0 && tier < 4 && lx > 0.05 * T && lx < 0.15 * T && ly > ch / 4 * 0.3;
      const shade = t > 0.75 ? 1 : t < 0.2 ? 3 : 2;
      p.dot(x, y, col, arch ? 0 : shade);
    }
  // stone pines and cypresses
  const tree = far('#3e6a3a', 0.45);
  for (const [tx, kind] of [
    [0.47, 'pine'],
    [0.52, 'cypress'],
    [0.55, 'cypress'],
    [0.6, 'pine'],
    [0.88, 'pine'],
    [0.93, 'cypress'],
    [0.08, 'cypress'],
  ] as const) {
    const bx = W * tx;
    if (kind === 'pine') {
      p.line(bx, horizon + 0.2 * T, bx + S(2), horizon - 0.9 * T, tree, 1);
      p.ellipse(bx + S(2), horizon - 1.0 * T, 0.55 * T, 0.18 * T, tree, { form: 'flat', level: 2 });
      p.ellipse(bx + S(2), horizon - 1.05 * T, 0.45 * T, 0.1 * T, tree, { form: 'flat', level: 3 });
    } else {
      p.ellipse(bx, horizon - 0.55 * T, 0.12 * T, 0.7 * T, tree, { form: 'flat', level: 1 });
    }
  }
}

// ------------------------------------------------------------------ buildings along the back

export function paintForumBuildings(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = L.w * T;
  const H = Math.round(4.8 * T);
  const p = new Paint(W, H);
  const R = ROME;

  // --- the temple: steps, a podium, six columns, a pediment and a red tile roof
  const tx0 = 2.2 * T;
  const tx1 = 11.4 * T;
  const tw = tx1 - tx0;
  const base = H;
  const podium = base - 0.75 * T;
  // steps
  for (let k = 0; k < 4; k++) {
    const y = base - (k + 1) * S(3);
    p.rect(tx0 + k * S(2), y, tw - k * S(4), S(3), R.marble, { form: 'cylV', box: [tx0, y, tw, S(3)], bias: k % 2 ? 0.05 : 0.15 });
    p.line(tx0 + k * S(2), y + S(3) - 1, tx1 - k * S(2), y + S(3) - 1, R.marble, 1);
  }
  // the cella wall behind the columns, with a bronze door
  const colTop = podium - 2.6 * T;
  p.rect(tx0 + S(10), colTop, tw - S(20), podium - colTop, R.travertine, { level: 1 });
  p.rect(tx0 + tw / 2 - S(7), podium - S(26), S(14), S(26), R.bronze, { form: 'cylV', box: [tx0 + tw / 2 - S(7), 0, S(14), H], sep: true });
  p.line(tx0 + tw / 2, podium - S(26), tx0 + tw / 2, podium - 1, R.bronze, 0);
  // six fluted columns with capitals and bases
  const n = 6;
  const cw = S(9);
  for (let i = 0; i < n; i++) {
    const cx = tx0 + S(8) + (i * (tw - S(16))) / (n - 1);
    p.rect(cx - cw / 2, colTop + S(4), cw, podium - colTop - S(6), R.marble, { form: 'cylV', box: [cx - cw / 2, 0, cw, H], sep: true });
    for (let f = -1; f <= 1; f++) p.line(cx + f * S(2.5), colTop + S(6), cx + f * S(2.5), podium - S(3), R.marble, 1, { onlyOver: true });
    p.rect(cx - cw / 2 - S(2), colTop, cw + S(4), S(4), R.marble, { form: 'cylV', box: [cx - cw / 2 - S(2), 0, cw + S(4), H], bias: 0.2 });
    p.ellipse(cx - cw / 2 - S(1), colTop + S(2.5), S(2), S(2), R.marble, { bias: 0.1 });
    p.ellipse(cx + cw / 2 + S(1), colTop + S(2.5), S(2), S(2), R.marble, { bias: -0.2 });
    p.rect(cx - cw / 2 - S(1.5), podium - S(3), cw + S(3), S(3), R.marble, { level: 3 });
  }
  // the beam above the columns and a frieze
  const beam = colTop - S(8);
  p.rect(tx0 + S(2), beam, tw - S(4), S(8), R.marble, { form: 'cylV', box: [tx0, beam, tw, S(8)] });
  p.line(tx0 + S(2), beam + S(3), tx1 - S(2), beam + S(3), R.marble, 1);
  for (let x = tx0 + S(6); x < tx1 - S(6); x += S(6)) p.rect(x, beam + S(4), S(2), S(3), R.marble, { level: 1 });
  // the pediment (a low triangle) and the roof edge
  const peak = beam - 1.05 * T;
  p.poly(
    [
      [tx0 - S(1), beam],
      [tx1 + S(1), beam],
      [(tx0 + tx1) / 2, peak],
    ],
    R.tile,
    { form: 'flat', level: 2 },
  );
  p.poly(
    [
      [tx0 + S(5), beam - S(1)],
      [tx1 - S(5), beam - S(1)],
      [(tx0 + tx1) / 2, peak + S(5)],
    ],
    R.marble,
    { form: 'flat', level: 2 },
  );
  // a simple carved wreath in the pediment
  p.ellipse((tx0 + tx1) / 2, beam - S(6), S(4), S(3), R.pine, { form: 'flat', level: 2 });
  p.ellipse((tx0 + tx1) / 2, beam - S(6), S(2), S(1.5), R.marble, { form: 'flat', level: 2 });
  for (let x = tx0; x < tx1; x += S(3)) p.dot(x, beam - 1 + Math.max(0, ((x - tx0) / (tw / 2) - 1) * 0), R.tile, 1);

  // --- the basilica: two stories of arches in red plaster with travertine piers
  const bx0 = 15.2 * T;
  const bx1 = 26 * T;
  const bTop = H - 3.9 * T;
  p.rect(bx0, bTop, bx1 - bx0, H - bTop, R.plaster, { form: 'cylV', box: [bx0, 0, bx1 - bx0, H], bias: 0.1 });
  for (const [y0, hgt] of [
    [bTop + S(10), 1.4 * T],
    [bTop + S(10) + 1.4 * T + S(6), H - (bTop + S(10) + 1.4 * T + S(6))],
  ] as Array<[number, number]>) {
    const span = 1.35 * T;
    for (let x = bx0 + S(4); x + span < bx1; x += span) {
      const aw = span * 0.62;
      const ax = x + (span - aw) / 2;
      p.rect(x, y0, S(4), hgt, R.travertine, { level: 3 });
      const top = y0 + aw / 2;
      p.shape((fx, fy) => fx >= ax && fx < ax + aw && fy < y0 + hgt && (fy > top || (fx - (ax + aw / 2)) ** 2 + ((fy - top) * 1.0) ** 2 < (aw / 2) ** 2), [ax, y0, aw, hgt], ramp('#3a2a34'), { form: 'flat', level: 1 });
      p.line(ax, top, ax + aw, top, R.travertine, 2, { onlyOver: false });
    }
    p.rect(bx0, y0 - S(3), bx1 - bx0, S(3), R.travertine, { level: 3 });
  }
  p.rect(bx0 - S(2), bTop - S(5), bx1 - bx0 + S(2), S(6), R.tile, { form: 'cylV', box: [bx0, bTop - S(5), bx1 - bx0, S(6)] });
  for (let x = bx0; x < bx1; x += S(4)) p.line(x, bTop - S(5), x, bTop, R.tile, 1);

  // a low wall and potted cypresses between the two buildings
  p.rect(tx1 + S(4), H - 0.7 * T, bx0 - tx1 - S(8), 0.7 * T, R.travertine, { form: 'cylV', box: [tx1, H - 0.7 * T, bx0 - tx1, 0.7 * T] });
  return p.toBuffer();
}

// ------------------------------------------------------------------ props

/** A fountain: a round marble basin with a jet of water (3 frames). */
export function paintFountain(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(44 * u), Math.round(40 * u));
  const R = ROME;
  p.ellipse(S(22), S(31), S(20), S(7), R.marble, { sep: true });
  p.rect(S(2), S(31), S(40), S(7), R.marble, { form: 'cylV', box: [S(2), S(31), S(40), S(7)] });
  p.ellipse(S(22), S(30.5), S(17), S(5), R.water, { form: 'flat', level: 2 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + frame * 0.7;
    p.dot(S(22) + Math.cos(a) * S(12), S(30.5) + Math.sin(a) * S(3.5), R.water, 4);
  }
  p.rect(S(19), S(14), S(6), S(16), R.marble, { form: 'cylV', box: [S(19), 0, S(6), S(40)] });
  p.ellipse(S(22), S(14), S(7), S(2.4), R.marble, { bias: 0.1 });
  // the jet, falling in two arcs
  for (let k = -1; k <= 1; k += 2)
    for (let t = 0; t <= 1; t += 0.04) {
      const x = S(22) + k * t * S(13);
      const y = S(10) - Math.sin(t * Math.PI) * S(6) + t * t * S(20);
      p.dot(x, y + ((frame + Math.round(t * 10)) % 3 === 0 ? 1 : 0), R.water, t < 0.3 ? 4 : 3);
    }
  p.dot(S(22), S(5) - (frame % 2), R.water, 4);
  p.dot(S(22), S(6), R.water, 3);
  return p.toBuffer();
}

/** A marble statue of a person in a toga on a pedestal (not any real person). */
export function paintStatue(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(64 * u));
  const R = ROME;
  p.rect(S(2), S(44), S(18), S(20), R.travertine, { form: 'cylV', box: [S(2), 0, S(18), S(64)] });
  p.rect(S(1), S(42), S(20), S(3), R.travertine, { level: 3 });
  p.rect(S(1), S(61), S(20), S(3), R.travertine, { level: 1 });
  // the figure
  p.poly(
    [
      [S(7), S(16)],
      [S(15), S(16)],
      [S(16.5), S(42)],
      [S(5.5), S(42)],
    ],
    R.marble,
    { sep: true },
  );
  p.line(S(8), S(18), S(14), S(30), R.marble, 1, { onlyOver: true });
  p.line(S(9), S(22), S(13), S(40), R.marble, 1, { onlyOver: true });
  p.capsule(S(15), S(18), S(18), S(9), S(1.4), R.marble, { sep: true });
  p.ellipse(S(18.2), S(8.5), S(1.5), S(1.5), R.marble, { bias: 0.1 });
  p.capsule(S(7), S(18), S(6), S(28), S(1.4), R.marble, {});
  p.rect(S(9.5), S(13), S(3), S(3.5), R.marble, { level: 1 });
  p.ellipse(S(11), S(10), S(3.6), S(4), R.marble, { sep: true, bias: 0.1 });
  p.ellipse(S(10.5), S(7.5), S(3.6), S(1.8), R.marble, { onlyOver: true, bias: -0.1 });
  return p.toBuffer();
}

/** A bronze brazier on three legs, with a fire (3 frames). */
export function paintBrazier(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(28 * u));
  const R = ROME;
  for (const fx of [3, 8, 13]) p.capsule(S(8), S(15), S(fx), S(27), S(0.8), R.bronze, {});
  p.ellipse(S(8), S(13.5), S(6.5), S(3), R.bronze, { sep: true });
  p.rect(S(1.5), S(11), S(13), S(1.5), R.bronze, { level: 3 });
  const fl = [
    [0, 0],
    [1, -1],
    [-1, 1],
  ][frame % 3];
  p.ellipse(S(8 + fl[0] * 0.6), S(7 + fl[1] * 0.4), S(4.2), S(5.4), ANC.flame, { form: 'flat', level: 2 });
  p.ellipse(S(8 + fl[0] * 0.3), S(8.4), S(2.8), S(3.4), ramp('#ffd25a'), { form: 'flat', level: 3 });
  p.ellipse(S(8), S(9.6), S(1.4), S(1.8), ramp('#fff6c8'), { form: 'flat', level: 3 });
  p.dot(S(6 + fl[1]), S(1.5), ANC.flame, 3);
  return p.toBuffer();
}

/** A rack of clay amphorae (tall jars for oil, wine and grain). */
export function paintAmphorae(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(34 * u), Math.round(30 * u));
  p.rect(S(1), S(10), S(32), S(2), ANC.wood, { level: 2 });
  for (const lx of [2, 31]) p.rect(S(lx - 1), S(10), S(2), S(20), ANC.wood, { form: 'cylV', box: [S(lx - 1), 0, S(2), S(30)] });
  for (const [cx, tone] of [
    [8, ANC.terra],
    [17, ramp('#b86a3e')],
    [26, ANC.terra],
  ] as Array<[number, Ramp]>) {
    p.ellipse(S(cx), S(16), S(4.6), S(8), tone, { sep: true });
    p.capsule(S(cx), S(4), S(cx), S(9), S(1.6), tone, {});
    p.capsule(S(cx), S(23), S(cx), S(28), S(1.1), tone, {});
    for (const k of [-1, 1]) p.capsule(S(cx + k * 1.4), S(5), S(cx + k * 3.6), S(9), S(0.7), tone, { bias: -0.2 });
  }
  return p.toBuffer();
}

/** A market stall with a red-and-cream awning: round loaves, olives, figs and grapes. */
export function paintRomanStall(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(48 * u), Math.round(44 * u));
  const R = ROME;
  for (const px of [4, 44]) p.rect(S(px - 1.5), S(9), S(3), S(34), ANC.wood, { form: 'cylV', box: [S(px - 1.5), 0, S(3), S(44)] });
  p.rect(S(2), S(26), S(44), S(4), ANC.wood, { form: 'cylV', box: [S(2), S(26), S(44), S(4)] });
  p.rect(S(3), S(29), S(42), S(12), R.travertine, { form: 'cylV', box: [S(3), S(29), S(42), S(12)], sep: true });
  // round loaves scored into eight pieces (like the bread found at Pompeii)
  for (const bx of [9, 17]) {
    p.ellipse(S(bx), S(22.5), S(4), S(3.2), R.bread, { sep: true });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI;
      p.line(S(bx) - Math.cos(a) * S(3), S(22.5) - Math.sin(a) * S(2.4), S(bx) + Math.cos(a) * S(3), S(22.5) + Math.sin(a) * S(2.4), R.bread, 1, { onlyOver: true });
    }
  }
  // a bowl of olives, figs and grapes
  p.ellipse(S(27), S(24), S(5), S(2.4), ANC.terra, { sep: true });
  for (let i = 0; i < 6; i++) p.ellipse(S(24 + (i % 3) * 3), S(22 - Math.floor(i / 3) * 1.6), S(1.3), S(1.1), R.olive, {});
  for (let i = 0; i < 7; i++) p.ellipse(S(36 + (i % 3) * 1.8 - (i > 5 ? 0.9 : 0)), S(20 + Math.floor(i / 3) * 1.6), S(1.1), S(1.1), R.grape, {});
  p.ellipse(S(42), S(24), S(2), S(2.2), ramp('#7a4a6a'), { sep: true });
  // the awning
  const top = S(3);
  const bot = S(12);
  for (let y = top; y < bot + S(3); y++)
    for (let x = S(1); x < S(47); x++) {
      const stripe = Math.floor((x - S(1)) / S(5)) % 2;
      const r = stripe ? R.plaster : R.marble;
      if (y >= bot) {
        const cx = Math.floor((x - S(1)) / S(5)) * S(5) + S(3.5);
        if (Math.hypot(x - cx, (y - bot) * 1.4) > S(2.8)) continue;
      }
      p.dot(x, y, r, y < top + S(2) ? 3 : y >= bot ? 1 : 2);
    }
  return p.toBuffer();
}

/** A stone pine (the umbrella-shaped pine of Rome). */
export function paintStonePine(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(56 * u), Math.round(64 * u));
  const R = ROME;
  const lean = (seed % 3) - 1;
  p.capsule(S(28), S(63), S(28 + lean * 4), S(22), S(2), ANC.trunk, { form: 'cylV' });
  p.capsule(S(28 + lean * 3), S(30), S(20), S(20), S(1.2), ANC.trunk, {});
  p.capsule(S(28 + lean * 3), S(28), S(38), S(19), S(1.2), ANC.trunk, {});
  p.ellipse(S(28 + lean * 4), S(15), S(26), S(9), R.pine, { sep: true, dither: true });
  for (let i = 0; i < 7; i++) p.ellipse(S(8 + i * 7 + lean * 2), S(11 + (i % 2) * 2), S(5), S(3), R.pine, { bias: 0.25 });
  return p.toBuffer();
}

/** A tall, narrow cypress. */
export function paintCypress(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(60 * u));
  p.rect(S(7), S(52), S(2), S(8), ANC.trunk, { level: 1 });
  p.ellipse(S(8), S(29), S(6.5), S(24), ROME.cypress, { sep: true, dither: true });
  for (let y = 10; y < 50; y += 6) p.line(S(4), S(y), S(9), S(y - 3), ROME.cypress, 3, { onlyOver: true });
  return p.toBuffer();
}

/** A triumphal arch: one big opening, attached columns and a tall top (an attic). */
export function paintArch(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(56 * u), Math.round(76 * u));
  const R = ROME;
  const stone = ramp('#d9c49c');
  const x0 = S(2);
  const x1 = S(54);
  const top = S(14);
  const bot = S(76);
  p.rect(x0, top, x1 - x0, bot - top, stone, { form: 'cylV', box: [x0, 0, x1 - x0, bot], bias: -0.05 });
  for (let y = top + S(6); y < bot; y += S(6)) p.line(x0, y, x1 - 1, y, stone, 1, { onlyOver: true });
  // the opening
  const ow = S(22);
  const ox = S(28) - ow / 2;
  const oTop = S(40);
  p.shape((fx, fy) => fx >= ox && fx < ox + ow && fy < bot && (fy > oTop || (fx - S(28)) ** 2 + (fy - oTop) ** 2 < (ow / 2) ** 2), [ox, oTop - ow / 2, ow, bot], ramp('#3a3238'), { form: 'flat', level: 1 });
  // attached columns
  for (const cx of [6, 18, 38, 50]) {
    p.rect(S(cx - 2), S(26), S(4), S(48), R.marble, { form: 'cylV', box: [S(cx - 2), 0, S(4), bot], sep: true });
    p.rect(S(cx - 3), S(24), S(6), S(3), R.marble, { level: 3 });
  }
  // cornice and the attic with a plain panel (no writing)
  p.rect(x0 - S(1), S(20), x1 - x0 + S(2), S(5), R.marble, { form: 'cylV', box: [x0, S(20), x1 - x0, S(5)] });
  p.rect(x0 + S(4), S(2), x1 - x0 - S(8), S(18), stone, { form: 'cylV', box: [x0, S(2), x1 - x0, S(18)], bias: 0.05 });
  p.rect(S(14), S(5), S(28), S(11), R.marble, { level: 2 });
  p.rect(x0 + S(3), S(1), x1 - x0 - S(6), S(2), R.marble, { level: 3 });
  // a laurel wreath carved on each side of the opening
  for (const wx of [12, 44]) {
    for (let a = 0; a < Math.PI * 2; a += 0.35) p.dot(S(wx) + Math.cos(a) * S(3.2), S(48) + Math.sin(a) * S(3.2), R.pine, 2);
  }
  return p.toBuffer();
}

/** A clay pot with a round laurel bush. */
export function paintLaurel(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(26 * u));
  p.ellipse(S(10), S(10), S(8), S(8), ramp('#5c8a3e'), { sep: true, dither: true });
  for (let i = 0; i < 5; i++) p.dot(S(6 + i * 2), S(6 + (i % 2) * 3), ramp('#5c8a3e'), 4);
  p.poly(
    [
      [S(4), S(17)],
      [S(16), S(17)],
      [S(14.5), S(26)],
      [S(5.5), S(26)],
    ],
    ANC.terra,
    { sep: true },
  );
  p.rect(S(3.5), S(16.5), S(13), S(2), ANC.terra, { level: 3 });
  return p.toBuffer();
}

// ------------------------------------------------------------------ the setting

export const ROMAN_FORUM: Setting = {
  id: 'roman-forum',
  world: 'ancient-kingdoms',
  name: 'Roman forum',
  inspiredBy: 'The Forum of ancient Rome in the time of the emperors (about 100 CE): temples, a basilica, a triumphal arch and the Via Sacra, with the Colosseum and an aqueduct in the distance.',
  sources: [
    'Parco archeologico del Colosseo: the Roman Forum (colosseo.it)',
    'Smarthistory: the Roman Forum and the Colosseum (smarthistory.org)',
    'Encyclopaedia Britannica: Forum (Roman)',
  ],
  build: buildForum,
};

function buildForum(ctx: SceneCtx): SettingScene {
  const { lighting, px: T, time } = ctx;
  const { add, prop } = placer(ctx);

  add(groundPiece(lighting, T, paintForumGround(T).toCanvas(), 0, 0));
  const sky = add(billboard(null, T, paintAncientSky(T, L.w + 12, 9, time, romeHorizon).toCanvas(), L.w / 2, L.floorTop - 0.4));
  add(billboard(lighting, T, paintForumBuildings(T).toCanvas(), L.w / 2, L.floorTop));

  prop(paintLaurel(T).toCanvas(), 2.0, 4.8, 0.8);
  prop(paintLaurel(T).toCanvas(), 11.6, 4.8, 0.8);
  prop(paintCypress(T).toCanvas(), 13.3, 4.5, 0.6);
  prop(paintArch(T).toCanvas(), 21.4, 9.2, 3.0);
  prop(paintStatue(T).toCanvas(), 3.2, 9.6, 1.0);
  prop(paintRomanStall(T).toCanvas(), 5.4, 13.8, 2.8);
  prop(paintAmphorae(T).toCanvas(), 9.4, 13.9, 1.8);
  prop(paintRomanStall(T).toCanvas(), 19.6, 14.0, 2.8);
  for (const [x, y, s] of [
    [1.6, 20.6, 0],
    [24.2, 21.4, 1],
    [11.4, 23.6, 2],
  ]) prop(paintStonePine(T, s).toCanvas(), x, y, 2.2);
  for (const [x, y] of [
    [6.4, 20.4],
    [17.6, 20.6],
    [20.2, 23.4],
  ]) prop(paintCypress(T).toCanvas(), x, y, 0.8);

  const fountainTex = [0, 1, 2].map((f) => pixelTexture(paintFountain(T, f).toCanvas()));
  const fountain = prop(paintFountain(T, 0).toCanvas(), 16.4, 6.9, 2.4);

  const brazierTex = [0, 1, 2].map((f) => pixelTexture(paintBrazier(T, f).toCanvas()));
  const braziers = [
    [8.8, 9.6],
    [17.4, 10.6],
    [12.9, 6.3],
  ].map(([x, y]) => {
    add(glow(lighting, T, Math.round(T * 1.8), '#ffb050', x, y, 1.4, 0.7));
    add(lightPool(lighting, T, x, y + 0.2, 1.8, '#ff9a40', 0.32));
    return prop(brazierTex[0].image as HTMLCanvasElement, x, y, 0.6);
  });
  // warm light in the temple door and the basilica arches at dusk
  for (const x of [6.8, 17, 19.7, 22.4]) add(lightPool(lighting, T, x, L.floorTop + 0.5, 1.1, '#ffb060', 0.26));

  const catTex = [false, true].map((b) => pixelTexture(paintCat(T, b).toCanvas()));
  const cat = prop(paintCat(T).toCanvas(), 15.4, 12.4, 0.7);

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 11.2, top: -3.2 },
    clear: mixHex('#86ad52', '#d9c8a0', 0.4),
    spots: { player: { x: 12.3, y: 10.8 }, host: { x: 14.1, y: 10.4 } },
    update(t, camX) {
      swapFrame(fountain, fountainTex[Math.floor(t * 5) % 3]);
      braziers.forEach((m, i) => swapFrame(m, brazierTex[(Math.floor(t * 7) + i) % 3]));
      swapFrame(cat, catTex[t % 5 > 4.8 ? 1 : 0]);
      sky.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
  };
}
