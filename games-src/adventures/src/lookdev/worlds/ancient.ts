import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';

/**
 * Ancient Kingdoms test art for W0: a river market in a warm, sunlit
 * kingdom inspired by Mali, Egypt and Kush. Mud-brick buildings in the
 * Djenne style (rounded pillars, wooden "toron" beams sticking out of the
 * walls), steep Kushite pyramids on the horizon, palms, a striped market
 * stall, an obelisk, clay pots, torches at dusk and a river with reeds.
 * Every painter takes T, the world's pixels per tile (16, 24 or 32).
 */

export const ANC = {
  sand: ramp('#e3b06c'),
  stone: ramp('#ecd3a2'),
  stone2: ramp('#e4c690'),
  adobe: ramp('#c9844c'),
  adobe2: ramp('#d89a5c'),
  adobe3: ramp('#b8703f'),
  wood: ramp('#8a5532'),
  indigo: ramp('#33509e'),
  ochre: ramp('#e7a63a'),
  terra: ramp('#c2603a'),
  teal: ramp('#2f8f86'),
  cream: ramp('#f1e3c2'),
  leaf: ramp('#4f9a3a'),
  leaf2: ramp('#6db84a'),
  trunk: ramp('#9a6a3e'),
  water: ramp('#3a9cc2'),
  reed: ramp('#7fae4a'),
  gold: ramp('#f2b53a'),
  mango: ramp('#f08a2a'),
  grain: ramp('#e9c45a'),
  ink: ramp('#4a2e22'),
  flame: ramp('#ff9a2a'),
} as const;

const U = (T: number) => T / 16;

export interface AncientLayout {
  w: number;
  h: number;
  floorTop: number;
  plaza: { x0: number; y0: number; x1: number; y1: number };
  river: [number, number];
}

export const ANC_LAYOUT: AncientLayout = { w: 26, h: 24, floorTop: 4, plaza: { x0: 3, y0: 5, x1: 23, y1: 15 }, river: [18, 21] };

// ------------------------------------------------------------------ ground

export function paintAncientGround(T: number, L: AncientLayout = ANC_LAYOUT): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const a = ANC;
  const P = L.plaza;
  const bev = Math.max(1, Math.round(u));
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tx = x / T;
      const ty = y / T;
      // sand everywhere, with soft ripples
      const rip = Math.sin(x / (9 * u) + Math.sin(y / (14 * u)) * 2.5 + y / (2.2 * u));
      let lv = rip > 0.94 ? 3 : 2;
      if (hash(x, y, 5) < 0.02) lv = 3;
      p.dot(x, y, a.sand, lv);
      const inPlaza = tx >= P.x0 && tx < P.x1 && ty >= P.y0 && ty < P.y1;
      const onPath = tx >= 11.5 && tx < 14.5 && ty >= P.y1 && ty < L.river[0];
      if (inPlaza || onPath) {
        // sandstone blocks: two per tile, offset every other row, with a bevel
        const bw = T * 2;
        const bh = T;
        const row = Math.floor(y / bh);
        const ox = row % 2 ? bw / 2 : 0;
        const lx = (x + ox) % bw;
        const ly = y % bh;
        const r: Ramp = hash(Math.floor((x + ox) / bw), row, 8) > 0.5 ? a.stone : a.stone2;
        let l2 = 2;
        if (ly < bev || lx < bev) l2 = 3;
        if (ly >= bh - bev * 2 || lx >= bw - bev * 2) l2 = 1;
        if (ly === bh - 1 || lx === bw - 1) l2 = 1;
        // worn edges let sand show through
        const edge = Math.min(tx - P.x0, P.x1 - tx, ty - P.y0, onPath ? 9 : P.y1 - ty);
        if (!onPath && edge < 0.6 && hash(Math.floor((x + ox) / bw), row, 9) < 0.5) continue;
        if (hash(x, y, 6) < 0.015 && l2 === 2) l2 = 1;
        p.dot(x, y, r, l2);
      }
    }
  // a sun mosaic in the middle of the plaza
  const cx = 13 * T;
  const cy = 10 * T;
  const R = 2.2 * T;
  for (let y = cy - R; y < cy + R; y++)
    for (let x = cx - R; x < cx + R; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > R) continue;
      const ang = Math.atan2(y - cy, x - cx);
      const ray = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 16) % 2;
      if (d < R * 0.32) p.dot(x, y, a.gold, d < R * 0.22 ? 3 : 2);
      else if (d < R * 0.4) p.dot(x, y, a.terra, 1);
      else if (d > R * 0.88) p.dot(x, y, a.indigo, d > R * 0.95 ? 1 : 2);
      else p.dot(x, y, ray ? a.ochre : a.cream, ray ? 2 : 2);
    }
  // the river: banks, water, lotus pads
  const [r0, r1] = L.river;
  for (let y = (r0 - 0.4) * T; y < (r1 + 1.4) * T; y++)
    for (let x = 0; x < W; x++) {
      const wob = Math.sin(x / (7 * u)) * 2 * u;
      const top = r0 * T + wob;
      const bot = (r1 + 1) * T - wob;
      if (y >= top && y < bot) continue; // water is a separate animated piece
      if (y > top - 4 * u && y < top) p.dot(x, y, a.adobe3, 1);
      if (y >= bot && y < bot + 3 * u) p.dot(x, y, a.adobe3, 2);
    }
  return p.toBuffer({ outline: false });
}

/** The river's water (3 frames of gentle ripples). */
export function paintRiver(T: number, frame: number, L: AncientLayout = ANC_LAYOUT): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const [r0, r1] = L.river;
  const H = (r1 - r0 + 1) * T;
  const p = new Paint(W, H);
  const a = ANC;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const wob = Math.sin(x / (7 * u)) * 2 * u;
      if (y < wob || y >= H - wob) continue;
      const depth = Math.min(y - wob, H - wob - y) / (H / 2);
      let lv = depth < 0.15 ? 3 : depth < 0.5 ? 2 : 1;
      const w = Math.sin((x + frame * 3 * u) / (6 * u) + y / (2.5 * u)) + Math.sin((x - frame * 2 * u) / (11 * u) - y / (4 * u));
      if (w > 1.55) lv = 4;
      else if (w > 1.2 && (x + y) % 2) lv = 3;
      p.dot(x, y, a.water, lv);
    }
  // lotus pads with a pink flower
  for (const [lx, ly] of [
    [3.2, 0.8],
    [7.5, 2.6],
    [17.4, 1.2],
    [22.6, 3.0],
  ]) {
    const x0 = lx * T;
    const y0 = ly * T;
    p.ellipse(x0, y0, 5 * u, 3 * u, a.leaf, { form: 'flat', level: 2 });
    p.ellipse(x0 - u, y0 - u, 3 * u, 1.5 * u, a.leaf, { form: 'flat', level: 3 });
    p.ellipse(x0 + 2 * u, y0 - 2 * u, 2 * u, 1.6 * u, ramp('#f08ab8'), { form: 'flat', level: 3 });
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the sky and the far horizon

export function paintAncientSky(T: number, wTiles: number, hTiles: number, time: 'day' | 'evening'): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const dusk = time === 'evening';
  const sky = dusk ? ['#2c2a62', '#4a3576', '#7a3f86', '#b5527e', '#e2706a', '#f3995a', '#f9c27a'] : ['#5fb6e4', '#76c3ea', '#8fd0ee', '#a9dcf0', '#c4e6ee', '#e4ecd8', '#f6e6be'];
  const horizon = H - 3.1 * T;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / horizon) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.6 && (x + y) % 2) band++;
      if (t - band > 0.85) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
    }
  if (dusk)
    for (let i = 0; i < W * H * 0.0012; i++) {
      const x = Math.floor(hash(i, 1, 3) * W);
      const y = Math.floor(hash(i, 2, 3) * horizon * 0.5);
      p.pix(x, y, '#fff3d6');
    }
  // the sun: high and bright by day, low and huge at dusk
  const sx = W * (dusk ? 0.3 : 0.78);
  const sy = dusk ? horizon - 0.2 * T : 1.1 * T;
  const sr = (dusk ? 1.15 : 0.6) * T;
  const sun = ramp(dusk ? '#ffb35a' : '#fff1b0');
  for (let y = sy - sr * 1.8; y < sy + sr * 1.8; y++)
    for (let x = sx - sr * 1.8; x < sx + sr * 1.8; x++) {
      const d = Math.hypot(x - sx, y - sy) / sr;
      if (d <= 1) p.dot(x, y, sun, d < 0.7 ? 4 : 3);
      else if (d < 1.4 && (x + y) % 2 === 0) p.pix(x, y, mixHex(sky[Math.min(sky.length - 1, Math.floor((y / horizon) * (sky.length - 1)))], dusk ? '#ffc070' : '#ffffff', 0.45));
    }
  // a few long clouds
  const cloud = dusk ? ramp('#e88a7a') : ramp('#ffffff', { spread: 0.5 });
  for (const [cx, cy, cw] of [
    [0.15, 0.25, 3.2],
    [0.52, 0.18, 2.4],
    [0.88, 0.4, 2.8],
  ]) {
    p.ellipse(W * cx, H * cy, cw * T, 0.28 * T, cloud, { form: 'flat', level: 3 });
    p.ellipse(W * cx + 0.6 * T, H * cy - 0.2 * T, cw * 0.5 * T, 0.3 * T, cloud, { form: 'flat', level: 4 });
    p.ellipse(W * cx, H * cy + 0.15 * T, cw * 0.9 * T, 0.12 * T, cloud, { form: 'flat', level: 2 });
  }
  // far things fade toward the sky color (atmospheric perspective)
  const far = (c: string, k: number) => ramp(mixHex(c, dusk ? '#7a4a8a' : '#cfe3e6', k), { spread: 0.7 });
  // low dunes
  const dune = far('#d8a868', 0.35);
  for (let x = 0; x < W; x++) {
    const top = horizon + Math.sin(x / (14 * u)) * 3 * u + Math.sin(x / (37 * u)) * 5 * u;
    for (let y = Math.floor(top); y < H; y++) p.dot(x, y, dune, y < top + 2 * u ? 3 : 2);
  }
  // steep Kushite pyramids (like those at Meroe), each with a small chapel at its foot
  const pyr = far('#b9784a', 0.3);
  for (const [px, ph, pw] of [
    [0.08, 2.6, 1.3],
    [0.14, 3.3, 1.6],
    [0.21, 2.2, 1.1],
    [0.62, 2.0, 1.0],
  ]) {
    const bx = W * px;
    const base = horizon + 0.5 * T;
    const top = base - ph * T;
    const half = (pw * T) / 2;
    for (let y = Math.floor(top); y < base; y++) {
      const k = (y - top) / (base - top);
      const hw = half * k;
      for (let x = Math.floor(bx - hw); x <= bx + hw; x++) p.dot(x, y, pyr, x < bx ? 3 : 1);
    }
    p.rect(bx - half * 0.35, base - 0.45 * T, half * 0.7, 0.45 * T, pyr, { level: 2 });
  }
  // the great mud-brick mosque of Djenne: three towers topped with ostrich eggs, rows of wooden beams
  const mq = far('#c47f4a', 0.22);
  const mx = W * 0.43;
  const base = horizon + 0.6 * T;
  const mw = 4.6 * T;
  p.rect(mx - mw / 2, base - 2.0 * T, mw, 2.0 * T, mq, { level: 2 });
  for (let k = 0; k < 3; k++) {
    const tx = mx - mw / 2 + mw * (0.18 + k * 0.32);
    const tw = 0.62 * T;
    const th = (k === 1 ? 3.3 : 2.8) * T;
    p.rect(tx - tw / 2, base - th, tw, th, mq, { form: 'cylV', box: [tx - tw / 2, 0, tw, 1] });
    p.ellipse(tx, base - th, tw / 2, 0.2 * T, mq, { form: 'flat', level: 3 });
    p.ellipse(tx, base - th - 0.25 * T, 0.12 * T + u, 0.16 * T + u, ramp('#fff6e4'), { form: 'flat', level: 3 });
    for (let yy = base - th + 0.4 * T; yy < base - 0.3 * T; yy += 0.45 * T) p.fillPix(tx - tw / 2 - u, yy, Math.max(1, Math.round(u)), Math.max(1, Math.round(u)), mixHex('#5a3522', dusk ? '#7a4a8a' : '#cfe3e6', 0.2));
  }
  for (let xx = mx - mw / 2 + 0.3 * T; xx < mx + mw / 2; xx += 0.35 * T) p.rect(xx, base - 2.2 * T, 0.16 * T, 0.25 * T, mq, { level: 3 });
  // palm silhouettes
  const palm = far('#3f7a3a', dusk ? 0.55 : 0.4);
  for (const px of [0.3, 0.34, 0.55, 0.74, 0.92]) {
    const bx = W * px;
    const top = horizon - 1.4 * T - hash(px * 100, 1, 4) * 0.6 * T;
    p.capsule(bx, horizon + 0.5 * T, bx + 0.2 * T, top, Math.max(1, 0.06 * T), palm, { form: 'flat', level: 1 });
    for (let k = 0; k < 7; k++) {
      const ang = Math.PI * 1.05 + (k / 6) * Math.PI * 0.9;
      const ex = bx + 0.2 * T + Math.cos(ang) * 0.75 * T;
      const ey = top + Math.sin(ang) * 0.35 * T + 0.3 * T;
      p.capsule(bx + 0.2 * T, top, (bx + 0.2 * T + ex) / 2, top + Math.sin(ang) * 0.3 * T, Math.max(1, 0.07 * T), palm, { form: 'flat', level: 2 });
      p.capsule((bx + 0.2 * T + ex) / 2, top + Math.sin(ang) * 0.3 * T, ex, ey, Math.max(0.6, 0.05 * T), palm, { form: 'flat', level: 2 });
    }
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the row of mud-brick buildings

interface Building {
  x0: number;
  w: number;
  h: number;
  r: Ramp;
  door: Ramp;
  djenne?: boolean;
}

export function paintHouses(T: number, L: AncientLayout = ANC_LAYOUT): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = Math.round(4.2 * T);
  const p = new Paint(W, H);
  const a = ANC;
  const S = (v: number) => v * u;
  const list: Building[] = [
    { x0: 0, w: 4.2, h: 3.0, r: a.adobe, door: a.teal },
    { x0: 4.6, w: 5.4, h: 3.9, r: a.adobe2, door: a.wood, djenne: true },
    { x0: 13.4, w: 3.6, h: 2.8, r: a.adobe3, door: a.indigo },
    { x0: 17.2, w: 4.4, h: 3.4, r: a.adobe, door: a.terra, djenne: true },
    { x0: 22.4, w: 3.6, h: 2.7, r: a.adobe2, door: a.teal },
  ];
  for (const b of list) {
    const x0 = b.x0 * T;
    const bw = b.w * T;
    const top = H - b.h * T;
    // the wall, softly rounded like smoothed mud plaster
    p.rect(x0, top, bw, H - top, b.r, { form: 'cylV', box: [x0, top, bw, H - top], bias: 0.1 });
    // a parapet of rounded bumps along the roof
    const step = b.djenne ? 0.9 * T : 0.7 * T;
    for (let x = x0 + step / 2; x < x0 + bw - S(3); x += step) p.ellipse(x, top, S(3), S(4), b.r, { bias: 0.25 });
    if (b.djenne) {
      // pillars with cone tops and toron beams
      for (let k = 0; k <= 4; k++) {
        const px = x0 + (bw - S(6)) * (k / 4) + S(3);
        p.rect(px - S(2.5), top - S(4), S(5), H - top + S(4), b.r, { form: 'cylV', box: [px - S(2.5), 0, S(5), H], sep: true });
        p.ellipse(px, top - S(4), S(2.5), S(3.5), b.r, { bias: 0.2 });
      }
      for (let yy = top + S(6); yy < H - S(10); yy += S(9))
        for (let k = 0; k < 4; k++) {
          const bx = x0 + (bw - S(6)) * ((k + 0.5) / 4) + S(3);
          p.rect(bx - S(1), yy, S(3), S(1.6), a.wood, { level: 2 });
          p.dot(bx + S(1.6), yy + S(1.4), a.wood, 0);
        }
    }
    // a wooden or painted door with a lintel, and small windows
    const dx = x0 + bw * (b.djenne ? 0.5 : 0.35);
    const dw = S(10);
    const dh = S(17);
    p.rect(dx - dw / 2 - S(2), H - dh - S(3), dw + S(4), S(3), a.wood, { level: 2 });
    p.rect(dx - dw / 2, H - dh, dw, dh, b.door, { form: 'cylV', box: [dx - dw / 2, H - dh, dw, dh], sep: true });
    for (let yy = H - dh + S(3); yy < H - S(2); yy += S(4)) p.line(dx - dw / 2 + S(1), yy, dx + dw / 2 - S(2), yy, b.door, 1);
    p.ellipse(dx + dw / 2 - S(2.5), H - dh / 2, S(1), S(1), a.gold, { form: 'flat', level: 4 });
    if (!b.djenne)
      for (const wx of [x0 + bw * 0.72]) {
        p.rect(wx - S(3), top + S(10), S(6), S(6), b.r, { level: 0 });
        p.rect(wx - S(2), top + S(11), S(4), S(4), ramp('#3a2a3a'), { level: 1 });
      }
  }
  // cloth hung between two houses, and rooftop pots
  for (let x = 2.6 * T; x < 5.2 * T; x++) {
    const sag = Math.sin(((x - 2.6 * T) / (2.6 * T)) * Math.PI) * S(4);
    const yy = H - 2.6 * T + sag;
    p.dot(x, yy, a.wood, 1);
    if (Math.floor(x / S(5)) % 2 === 0) for (let k = 1; k < S(6); k++) p.dot(x, yy + k, Math.floor(x / S(10)) % 2 ? a.indigo : a.ochre, k < S(2) ? 3 : 2);
  }
  for (const px of [1.2, 15.6, 24.2]) {
    const bx = px * T;
    const by = H - (px < 2 ? 3.0 : px < 16 ? 2.8 : 2.7) * T;
    p.ellipse(bx, by - S(3), S(3.2), S(3.6), a.terra, { sep: true });
    p.rect(bx - S(1.6), by - S(7.5), S(3.2), S(1.4), a.terra, { level: 1 });
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ props

/** A date palm with a ringed trunk and drooping fronds. */
export function paintPalm(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(44 * u), Math.round(60 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  const lean = (seed % 3) - 1;
  const top = { x: S(22 + lean * 4), y: S(14) };
  // trunk: a slight curve, with a ring every few pixels
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    pts.push([S(22) + (top.x - S(22)) * t * t, S(58) - (S(58) - top.y) * t]);
  }
  for (let i = 0; i < 12; i++) p.capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], S(2.4 - i * 0.06), a.trunk, { form: 'cylV' });
  for (let i = 1; i < 12; i++) p.line(pts[i][0] - S(2), pts[i][1], pts[i][0] + S(2), pts[i][1] + S(0.6), a.trunk, 0, { onlyOver: true });
  // date clusters
  for (const k of [-1, 1]) p.ellipse(top.x + k * S(2.5), top.y + S(4), S(2.2), S(2.8), a.terra, { sep: true });
  // fronds: arching leaf strips with a lit top edge
  const fronds = [-2.7, -2.2, -1.6, -1.0, -0.5, 0, 0.5, 2.6];
  for (const ang0 of fronds) {
    const ang = -Math.PI / 2 + ang0 * 0.62;
    const len = S(17 - Math.abs(ang0) * 0.8);
    let px = top.x;
    let py = top.y;
    for (let i = 0; i < 10; i++) {
      const t = i / 10;
      const droop = t * t * S(12);
      const nx = top.x + Math.cos(ang) * len * (t + 0.1);
      const ny = top.y + Math.sin(ang) * len * (t + 0.1) + droop;
      p.capsule(px, py, nx, ny, S(2.2 - t * 1.3), ang0 % 2 ? a.leaf : a.leaf2, { form: 'flat', level: 2 });
      // little leaflets
      if (i % 2 === 0 && u >= 1.5) p.dot(nx, ny + S(2), a.leaf, 1);
      px = nx;
      py = ny;
    }
  }
  p.relevel((x, y, lv, r) => (r === a.leaf || r === a.leaf2) && !p.filled(x, y - 1) && lv < 4, 2);
  p.relevel((x, y, lv, r) => (r === a.leaf || r === a.leaf2) && !p.filled(x, y + 1) && lv > 0, -1);
  return p.toBuffer();
}

/** A market stall with a striped awning, baskets and pots (3 tiles wide). */
export function paintStall(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(52 * u), Math.round(48 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  for (const px of [5, 47]) p.rect(S(px - 1.5), S(10), S(3), S(36), a.wood, { form: 'cylV', box: [S(px - 1.5), 0, S(3), S(48)] });
  // the table with a mud-cloth cover
  p.rect(S(3), S(28), S(46), S(4), a.wood, { form: 'cylV', box: [S(3), S(28), S(46), S(4)] });
  p.rect(S(4), S(31), S(44), S(13), a.cream, { form: 'cylV', box: [S(4), S(31), S(44), S(13)], sep: true });
  for (let yy = S(33); yy < S(43); yy += S(3.4))
    for (let xx = S(5); xx < S(47); xx++) {
      const k = Math.floor((yy - S(33)) / S(3.4)) % 3;
      if (k === 0 && Math.floor(xx / S(2)) % 2) p.dot(xx, yy + ((Math.floor(xx / S(2)) % 4) < 2 ? 0 : 1), a.ink, 1);
      if (k === 1 && Math.floor(xx / S(4)) % 2 === 0 && (xx % Math.max(2, Math.round(S(4)))) < S(1.5)) p.dot(xx, yy, a.ink, 1);
      if (k === 2) p.dot(xx, yy, a.ink, 2);
    }
  // goods: a basket of mangoes, a basket of grain, two pots and a gourd
  const basket = (x: number, fill: Ramp) => {
    p.ellipse(S(x), S(26), S(6), S(4), a.ochre, { sep: true });
    for (let yy = S(24); yy < S(29); yy += S(2)) p.line(S(x - 5), yy, S(x + 5), yy, a.ochre, 1, { onlyOver: true });
    if (fill === a.mango) for (const [ox, oy] of [[-3, -1], [0, -2], [3, -1], [-1.5, 0.5], [1.5, 0.5]]) p.ellipse(S(x + ox), S(23 + oy), S(1.8), S(1.6), fill, { sep: true });
    else p.ellipse(S(x), S(23), S(5), S(2.2), fill, { dither: true });
  };
  basket(11, a.mango);
  basket(25, a.grain);
  p.ellipse(S(37), S(23), S(4.4), S(5.4), a.terra, { sep: true });
  p.rect(S(35), S(16.5), S(4), S(2), a.terra, { level: 1 });
  p.line(S(33), S(23), S(41), S(23), a.cream, 3, { onlyOver: true });
  p.ellipse(S(44), S(25), S(3), S(3.4), ramp('#c9a24a'), { sep: true });
  p.capsule(S(44), S(21.5), S(44), S(19.5), S(1), ramp('#8a6a2a'), { form: 'flat', level: 2 });
  // the awning: indigo and ochre stripes with a scalloped edge
  const top = S(4);
  const bot = S(14);
  for (let y = top; y < bot + S(3); y++)
    for (let x = S(1); x < S(51); x++) {
      const k = (y - top) / (bot - top);
      const sl = S(4) * (1 - k);
      if (x < S(1) + sl * 0.3 || x > S(51) - sl * 0.3) continue;
      const stripe = Math.floor((x - S(1)) / S(5)) % 2;
      const r = stripe ? a.indigo : a.ochre;
      if (y >= bot) {
        const cx = Math.floor((x - S(1)) / S(5)) * S(5) + S(3.5);
        if (Math.hypot(x - cx, (y - bot) * 1.4) > S(2.8)) continue;
      }
      p.dot(x, y, r, y < top + S(2) ? 3 : y >= bot ? 1 : 2);
    }
  return p.toBuffer();
}

/** A stone obelisk with a gold cap and carved bands. */
export function paintObelisk(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(22 * u), Math.round(76 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  p.rect(S(1), S(68), S(20), S(8), a.stone2, { form: 'cylV', box: [S(1), S(68), S(20), S(8)] });
  p.rect(S(3), S(65), S(16), S(4), a.stone, { level: 3 });
  p.poly(
    [
      [S(7.5), S(12)],
      [S(14.5), S(12)],
      [S(16.5), S(65)],
      [S(5.5), S(65)],
    ],
    a.stone,
    { sep: true },
  );
  p.poly(
    [
      [S(11), S(3)],
      [S(14.5), S(12.5)],
      [S(7.5), S(12.5)],
    ],
    a.gold,
    { form: 'cylV', box: [S(7.5), S(3), S(7), S(10)] },
  );
  // carved decoration: bands of diamonds and zigzags (patterns, not writing)
  for (let yy = S(17); yy < S(60); yy += S(7)) {
    const zig = Math.round(yy / S(7)) % 2;
    for (let i = 0; i < 4; i++) {
      const x = S(8.6) + i * S(1.6);
      if (zig) p.dot(x, yy + (i % 2 ? S(1.5) : 0), a.stone, 0);
      else {
        p.dot(S(11), yy, a.stone, 0);
        p.dot(S(10), yy + S(1.2), a.stone, 0);
        p.dot(S(12), yy + S(1.2), a.stone, 0);
        p.dot(S(11), yy + S(2.4), a.stone, 0);
      }
    }
    p.line(S(8), yy + S(4.5), S(14), yy + S(4.5), a.stone, 1, { onlyOver: true });
  }
  return p.toBuffer();
}

/** A standing torch: a bowl on a pole with a flickering flame (3 frames). */
export function paintTorch(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(14 * u), Math.round(40 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  p.rect(S(6), S(14), S(2.4), S(25), a.wood, { form: 'cylV', box: [S(6), 0, S(2.4), S(40)] });
  p.ellipse(S(7.2), S(38.5), S(4), S(1.5), a.stone2, { form: 'flat', level: 1 });
  p.ellipse(S(7.2), S(13), S(5), S(2.6), a.terra, { sep: true });
  p.rect(S(2.2), S(11), S(10), S(2), a.gold, { level: 3 });
  const fl = [
    [0, 0],
    [1, -1],
    [-1, 1],
  ][frame % 3];
  p.ellipse(S(7 + fl[0] * 0.6), S(6.5 + fl[1] * 0.4), S(3.6), S(5.6), a.flame, { form: 'flat', level: 2 });
  p.ellipse(S(7.2 + fl[0] * 0.3), S(7.8), S(2.4), S(3.6), ramp('#ffd25a'), { form: 'flat', level: 3 });
  p.ellipse(S(7.2), S(9), S(1.2), S(1.8), ramp('#fff6c8'), { form: 'flat', level: 3 });
  p.dot(S(5 + fl[1]), S(1.5), a.flame, 3);
  return p.toBuffer();
}

/** A group of clay pots and a tall water jar. */
export function paintPots(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(30 * u), Math.round(26 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  p.ellipse(S(9), S(13), S(6), S(9.5), a.terra, { sep: true });
  p.rect(S(6.5), S(2.5), S(5), S(2.4), a.terra, { level: 2 });
  for (const yy of [9, 15]) p.line(S(4), S(yy), S(14), S(yy), a.cream, 3, { onlyOver: true });
  for (let xx = S(4); xx < S(14); xx += S(2.5)) p.dot(xx, S(12), a.ink, 1);
  p.ellipse(S(20), S(18), S(6.5), S(6), ramp('#b86a3e'), { sep: true });
  p.line(S(14.5), S(17), S(25.5), S(17), a.indigo, 2, { onlyOver: true });
  p.ellipse(S(26), S(21.5), S(3.6), S(3.4), a.ochre, { sep: true });
  return p.toBuffer();
}

/** A stone well with a wooden frame and a bucket. */
export function paintWell(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(32 * u), Math.round(38 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  for (const px of [6, 26]) p.rect(S(px - 1.5), S(4), S(3), S(26), a.wood, { form: 'cylV', box: [S(px - 1.5), 0, S(3), S(38)] });
  p.rect(S(3), S(3), S(26), S(3), a.wood, { form: 'cylV', box: [S(3), S(3), S(26), S(3)] });
  p.line(S(16), S(6), S(16), S(15), ramp('#d8c08a'), 2);
  p.rect(S(13.5), S(14), S(5), S(5), a.wood, { form: 'cylV', box: [S(13.5), S(14), S(5), S(5)], sep: true });
  p.ellipse(S(16), S(24), S(14), S(4.5), a.stone, {});
  p.ellipse(S(16), S(24), S(10.5), S(2.8), ramp('#2a4a6a'), { form: 'flat', level: 1 });
  p.rect(S(2), S(24), S(28), S(11), a.stone2, { form: 'cylV', box: [S(2), S(24), S(28), S(11)] });
  for (let yy = S(26); yy < S(35); yy += S(4.5))
    for (let xx = S(2) + ((yy / S(4.5)) % 2) * S(3); xx < S(30); xx += S(6)) p.line(xx, yy, xx, yy + S(4), a.stone2, 0, { onlyOver: true });
  return p.toBuffer();
}

/** A woven mat with cloth and gourds laid out to sell. */
export function paintMat(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(44 * u), Math.round(22 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  p.poly(
    [
      [S(4), S(8)],
      [S(40), S(8)],
      [S(43), S(21)],
      [S(1), S(21)],
    ],
    a.grain,
    { form: 'flat', level: 2 },
  );
  for (let yy = S(9); yy < S(21); yy += S(2)) p.line(S(2), yy, S(42), yy, a.grain, 1, { onlyOver: true });
  // folded cloths: kente-like stripes and indigo
  p.rect(S(6), S(9), S(12), S(6), a.indigo, { form: 'cylV', box: [S(6), S(9), S(12), S(6)], sep: true });
  for (let xx = S(7); xx < S(18); xx += S(3)) p.line(xx, S(9), xx, S(15), a.cream, 3, { onlyOver: true });
  p.rect(S(20), S(10), S(10), S(5), a.terra, { form: 'cylV', box: [S(20), S(10), S(10), S(5)], sep: true });
  for (let xx = S(21); xx < S(30); xx += S(2)) p.dot(xx, S(12), a.gold, 3);
  p.ellipse(S(35), S(10), S(4), S(4.4), ramp('#c9a24a'), { sep: true });
  p.ellipse(S(36), S(4.5), S(1.6), S(2.6), ramp('#c9a24a'), {});
  p.ellipse(S(28), S(17), S(3), S(2.4), a.mango, { sep: true });
  return p.toBuffer();
}

/** A cat sitting in the sun. */
export function paintCat(T: number, blink = false): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(16 * u), Math.round(16 * u));
  const fur = ramp('#d89a4a');
  const S = (v: number) => v * u;
  p.capsule(S(12), S(14), S(14.5), S(8), S(1), fur, {});
  p.ellipse(S(8), S(11), S(5), S(4.5), fur, { sep: true });
  p.ellipse(S(7), S(6), S(3.8), S(3.4), fur, { sep: true });
  for (const k of [-1, 1]) p.poly([[S(7 + k * 3.4), S(1.5)], [S(7 + k * 1.2), S(4)], [S(7 + k * 3.6), S(5)]], fur, { form: 'flat', level: 3 });
  for (let i = 0; i < 3; i++) p.line(S(6 + i * 2.5), S(8.5), S(7 + i * 2.5), S(13), fur, 1, { onlyOver: true });
  if (blink) {
    p.pix(S(5.5), S(6.2), '#3a2a26');
    p.pix(S(8.5), S(6.2), '#3a2a26');
  } else {
    p.pix(S(5.5), S(5.6), '#3a8a3a');
    p.pix(S(8.5), S(5.6), '#3a8a3a');
    p.pix(S(5.5), S(6.4), '#2a1a1c');
    p.pix(S(8.5), S(6.4), '#2a1a1c');
  }
  p.pix(S(7), S(7.4), '#c0505a');
  return p.toBuffer();
}

/** A clump of papyrus reeds for the river bank. */
export function paintReeds(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(20 * u), Math.round(26 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  for (let i = 0; i < 5; i++) {
    const bx = S(4 + i * 2.8);
    const tx = bx + S((hash(i, seed, 2) - 0.5) * 8);
    const ty = S(6 + hash(i, seed, 3) * 8);
    p.line(bx, S(25), tx, ty, a.reed, i % 2 ? 1 : 2);
    // the papyrus head: a little fan of fine leaves
    for (let k = -3; k <= 3; k++) p.line(tx, ty, tx + k * S(1.1), ty - S(3) + Math.abs(k) * S(0.5), a.reed, k < 0 ? 4 : 3);
  }
  for (let i = 0; i < 4; i++) p.ellipse(S(4 + i * 4), S(24), S(2.4), S(1.6), a.leaf, { form: 'flat', level: 2 });
  return p.toBuffer();
}

/** A small reed boat. */
export function paintBoat(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(46 * u), Math.round(14 * u));
  const a = ANC;
  const S = (v: number) => v * u;
  for (let x = S(2); x < S(44); x++) {
    const t = (x - S(23)) / S(21);
    const lift = t * t * S(6);
    p.capsule(x, S(8) - lift, x, S(11) - lift * 0.4, S(1.6), ramp('#c9a24a'), { form: 'cylV', box: [0, S(5), 1, S(8)] });
  }
  for (let x = S(6); x < S(40); x += S(3)) p.line(x, S(6), x, S(11), ramp('#c9a24a'), 1, { onlyOver: true });
  p.rect(S(15), S(5.4), S(14), S(2), a.indigo, { level: 2 });
  return p.toBuffer();
}
