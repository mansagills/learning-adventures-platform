import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, mixHex, ramp } from '../../kit/worlds/shade';
import { paintFrog, paintHeron, paintTurtle, WILD } from '../../kit/worlds/wild-lands/art';
import {
  COAST,
  paintBin,
  paintBoat,
  paintBufferStrip,
  paintBus,
  paintCoastBackdrop,
  paintCoastTile,
  paintField,
  paintFilter,
  paintFish,
  paintMill,
  paintNature,
  paintRainBarrel,
  paintRainGarden,
  paintReeds,
  paintSquadFlag,
  paintBoom,
  paintDrainPipe,
  paintGhostNet,
  paintNatural,
  paintNetBin,
  paintOilSlick,
  paintPads,
  paintStormDrain,
  paintTownHouse,
  paintTrash,
  type BinKind,
  type FilterLayer,
  type Stretch,
  type NetDesign,
} from '../../kit/worlds/wild-lands/coast-art';
import { paintHero } from '../../kit/worlds/hero16';
import { MARISOL_VEGA, RAFI_HADDAD, ROSA_DELGADO, TOWNSFOLK, WEN_LI } from '../../kit/worlds/wild-lands/coast-art';
import type { Scene } from './problems';

/**
 * Pollution Solution Squad’s own pictures: the fixes as they are built and
 * tested (bin lids, the tank fixes, the net bins), the camp’s boards and
 * sorting station, and the pictures above the questions (176 x 96, drawn in
 * the coast style).
 */

const U = (T: number) => T / 16;
const INK = '#1e1a24';

// ------------------------------------------------------------------ the fixes

/** Two picnic bins with a lid design ('none' open, 'loose' a board, 'clip' a board held by a rope loop); `lift` raises a loose lid in the wind. */
export function paintLidBins(T: number, lid: 'none' | 'loose' | 'clip', lift = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(30 * u);
  const H = Math.round(26 * u);
  const out = new PixelBuffer(W, H);
  const bins: BinKind[] = ['recycle', 'trash'];
  bins.forEach((k, i) => {
    const b = paintBin(T, k);
    // drop the bin's own lid when it has no lid (open bins)
    const bx = Math.round(S(1 + i * 15));
    const by = H - b.h;
    for (let y = lid === 'none' ? Math.round(S(4)) : 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (b.get(x, y)) out.set(bx + x, by + y, b.get(x, y));
    const p = new Paint(W, H);
    if (lid === 'none') {
      // trash poking out of the open top
      p.rect(bx + S(3), by + S(2.4), S(3), S(2), ramp('#9a62d0'), { form: 'flat', level: 3 });
      p.rect(bx + S(7), by + S(2), S(2.4), S(2.4), COAST.bag, { form: 'flat', level: 3 });
    } else {
      const ly = by + S(1.6) - lift * S(5);
      const tilt = lift * S(2);
      p.poly(
        [
          [bx + S(0.4), ly + tilt],
          [bx + S(13.6), ly - tilt],
          [bx + S(13.6), ly - tilt + S(1.6)],
          [bx + S(0.4), ly + tilt + S(1.6)],
        ],
        COAST.driftwood,
        { sep: true },
      );
      if (lid === 'clip') {
        p.line(bx + S(7), ly + S(1.6), bx + S(7), by + S(6), COAST.rope, 2);
        p.line(bx + S(7.6), ly + S(1.6), bx + S(7.6), by + S(6), COAST.rope, 3);
      }
    }
    out.blit(p.toBuffer(), 0, 0);
  });
  return out;
}

/** A fix on the boat’s leaking tank: tape (peeling off), a bucket under the drip (filling), or a sealed metal patch. */
export function paintTankFix(T: number, design: 'tape' | 'bucket' | 'patch', fill = 0, peel = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(18 * u));
  // the tank
  p.rect(S(1), S(1), S(14), S(8), COAST.rust, { form: 'cylH', sep: true });
  if (design === 'tape') {
    const lift = peel * S(4);
    p.poly(
      [
        [S(5), S(3)],
        [S(11), S(3) - lift * 0.3],
        [S(11), S(6) - lift],
        [S(5), S(6)],
      ],
      ramp('#c8c8b8'),
      { form: 'flat', level: 3, sep: true },
    );
    if (peel > 0.4) p.ellipse(S(8), S(10) + peel * S(5), S(0.8), S(1.1), COAST.oil, { form: 'flat', level: 1 });
  } else if (design === 'bucket') {
    p.ellipse(S(8), S(10.4), S(0.8), S(1.1), COAST.oil, { form: 'flat', level: 1 });
    p.poly(
      [
        [S(3.5), S(12)],
        [S(12.5), S(12)],
        [S(11.5), S(18)],
        [S(4.5), S(18)],
      ],
      ramp('#e0503a'),
      { sep: true },
    );
    const level = S(17.6) - fill * S(5);
    p.rect(S(4.2), level, S(7.6), S(17.6) - level, COAST.oil, { form: 'flat', level: 1, onlyOver: true });
    if (fill >= 1) p.ellipse(S(13.4), S(17), S(2), S(0.8), COAST.oil, { form: 'flat', level: 2 });
  } else {
    p.rect(S(4.5), S(2.6), S(7), S(4.8), ramp('#b8bec8', { cool: 1.2 }), { form: 'flat', level: 3, sep: true });
    for (const [x, y] of [
      [5.4, 3.4],
      [10.4, 3.4],
      [5.4, 6.4],
      [10.4, 6.4],
    ])
      p.pix(S(x), S(y), '#4a4a52');
    p.rect(S(4.2), S(2.4), S(7.6), S(0.6), ramp('#5a5a62'), { form: 'flat', level: 2 });
  }
  return p.toBuffer();
}

/** A place for old nets on the dock: an open crate (nets blowing out), a plastic sack (tearing), or a slatted bin with a lid. */
export function paintCrate(T: number, design: 'crate' | 'sack' | 'lid', t = 0): PixelBuffer {
  if (design === 'lid') return paintNetBin(T);
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(18 * u));
  if (design === 'crate') {
    p.rect(S(2), S(7), S(16), S(11), COAST.wood, { form: 'flat', level: 2, sep: true });
    for (let y = 9; y < 18; y += 3) p.line(S(2.4), S(y), S(17.6), S(y), ramp('#8a5a36'), 1, { onlyOver: true });
    p.ellipse(S(10), S(7), S(7), S(2.4), COAST.net, { form: 'flat', level: 3 });
    // a net blowing out over the edge
    const k = t * S(4);
    p.capsule(S(15), S(6), S(19) + k * 0.3, S(4) - k * 0.2, S(0.8), COAST.net, { sep: true });
    p.ellipse(S(19.5) + k * 0.3, S(3.4) - k * 0.2, S(1), S(1), COAST.float, { sep: true });
  } else {
    p.rect(S(9.4), S(1), S(1.4), S(17), COAST.wood, { form: 'cylV', sep: true });
    p.ellipse(S(10), S(12), S(7), S(6), ramp('#d8dce0', { cool: 1.3 }), { sep: true });
    p.ellipse(S(10), S(6.6), S(3), S(1.4), ramp('#b8bcc0'), { form: 'flat', level: 2 });
    if (t > 0.3) {
      // a tear, with net poking out
      p.line(S(6), S(10), S(9), S(15), ramp(INK), 1);
      p.capsule(S(7), S(13), S(4), S(17), S(0.8), COAST.net, { sep: true });
    }
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ the camp

/** The sorting station: the four bins in a row under a little roof. */
export function paintSortStation(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(54 * u);
  const H = Math.round(30 * u);
  const out = new PixelBuffer(W, H);
  const roof = new Paint(W, H);
  for (const x of [1, 51]) roof.rect(S(x), S(6), S(2), S(24), COAST.wood, { form: 'cylV', sep: true });
  roof.poly(
    [
      [0, S(7)],
      [S(27), S(1)],
      [W, S(7)],
    ],
    ramp('#3aa65a'),
    { sep: true },
  );
  out.blit(roof.toBuffer(), 0, 0);
  (['recycle', 'compost', 'trash', 'hazard'] as BinKind[]).forEach((k, i) => {
    const b = paintBin(T, k);
    out.blit(b, Math.round(S(4 + i * 12)), H - b.h);
  });
  return out;
}

/** A board on a post: the Squad Journal (a notebook), the map, or the Nature Center sign (a leaf). */
export function paintBoard(T: number, kind: 'journal' | 'map' | 'nature'): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(28 * u));
  for (const x of [4, 16.5]) p.rect(S(x), S(14), S(1.6), S(14), COAST.wood, { form: 'cylV', sep: true });
  p.rect(S(1), S(2), S(20), S(14), kind === 'nature' ? ramp('#5aa84a') : COAST.plank, { form: 'flat', level: 2, sep: true });
  if (kind === 'journal') {
    p.rect(S(5), S(4), S(12), S(10), ramp('#f2f4ec', { cool: 1.2 }), { form: 'flat', level: 3, sep: true });
    for (let y = 6; y < 13; y += 2) p.line(S(7), S(y), S(15), S(y), ramp('#9aa0aa'), 1, { onlyOver: true });
    p.rect(S(5), S(4), S(1.4), S(10), ramp('#e0503a'), { form: 'flat', level: 2 });
  } else if (kind === 'map') {
    p.rect(S(3), S(4), S(16), S(10), ramp('#f2e6c8'), { form: 'flat', level: 3, sep: true });
    p.rect(S(13), S(4), S(6), S(10), ramp('#7ab4d8'), { form: 'flat', level: 3 });
    for (let k = 0; k < 10; k++) p.pix(S(4 + k * 1.2), S(12 - k * 0.6) + Math.round(Math.sin(k) * u), '#2f8fc8');
    p.pix(S(13), S(9), '#e0503a');
  } else {
    p.ellipse(S(11), S(9), S(5), S(4), ramp('#a8d870'), { sep: true });
    p.line(S(7), S(12), S(14), S(6), ramp('#3a7a3a'), 1);
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ the question pictures (176 x 96)

const PW = 176;
const PH = 96;

function canvas(sky: 'day' | 'sea' | 'dock' | 'plain' = 'day'): PixelBuffer {
  const b = new PixelBuffer(PW, PH);
  for (let y = 0; y < PH; y++)
    for (let x = 0; x < PW; x++) {
      let c: string;
      if (sky === 'plain') c = y < PH * 0.8 ? '#e6f2f6' : '#d8c8a0';
      else if (y < PH * 0.55) c = mixHex('#7ab8e8', '#d8eef2', y / (PH * 0.55));
      else if (sky === 'sea') c = y < PH * 0.58 ? '#bfe8f2' : COAST.sea[(x * 3 + y * 7) % 29 === 0 ? 4 : 2];
      else if (sky === 'dock') c = y < PH * 0.7 ? COAST.sea[2] : COAST.plank[(x % 14 === 0 ? 1 : 2) + (y === Math.ceil(PH * 0.7) ? 2 : 0)];
      else c = y < PH * 0.75 ? (y < PH * 0.6 ? COAST.sea[3] : COAST.sea[2]) : COAST.sand[hash(x, y, 3) > 0.9 ? 3 : 2];
      b.set(x, y, c);
    }
  return b;
}

function stamp(b: PixelBuffer, s: PixelBuffer, cx: number, bottom: number, scale = 1): void {
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const c = s.get(x, y);
      if (!c) continue;
      for (let j = 0; j < scale; j++) for (let i = 0; i < scale; i++) b.set(Math.round(cx - (s.w * scale) / 2) + x * scale + i, Math.round(bottom - s.h * scale) + y * scale + j, c);
    }
}

function jelly(): PixelBuffer {
  const p = new Paint(20, 24);
  const r = ramp('#e8c8f0', { cool: 1.2 });
  p.ellipse(10, 7, 8, 6, r, { sep: true });
  for (let k = 0; k < 4; k++) p.capsule(5 + k * 3.4, 11, 4 + k * 3.4 + (k % 2), 22, 0.6, r, {});
  return p.toBuffer();
}

function bottleStage(k: number): PixelBuffer {
  const b = paintTrash('bottle', 24);
  if (k === 0) return b;
  const out = new PixelBuffer(b.w, b.h);
  // break the bottle into pieces that get smaller
  const step = k === 1 ? 4 : 2;
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      const c = b.get(x, y);
      if (!c) continue;
      const bx = Math.floor(x / step);
      const by = Math.floor(y / step);
      if (hash(bx, by, k) > (k === 1 ? 0.25 : 0.6)) out.set(x + bx * (k === 1 ? 2 : 3), y + (k === 2 ? (bx % 2) * 3 : 0), c);
    }
  return out;
}

function glassOfOil(): PixelBuffer {
  const p = new Paint(40, 56);
  const g = ramp('#e8f6fa', { cool: 1.3 });
  p.rect(4, 4, 32, 50, g, { form: 'flat', level: 4, sep: true });
  p.rect(6, 22, 28, 30, COAST.river, { form: 'flat', level: 3 });
  p.rect(6, 15, 28, 7, ramp('#f2c94c'), { form: 'flat', level: 3 });
  return p.toBuffer();
}

function feather(oily: boolean): PixelBuffer {
  const p = new Paint(30, 56);
  const r = oily ? ramp('#5a5a62', { cool: 1.2 }) : ramp('#f2f4ec', { cool: 1.3 });
  p.line(15, 54, 15, 4, ramp('#c8b890'), 2);
  for (let y = 6; y < 48; y += 2) {
    const w = 11 - Math.abs(y - 26) * 0.3;
    if (oily && y % 6 === 0) continue;
    p.line(15, y + 2, 15 - w, y - 3, r, 3);
    p.line(15, y + 2, 15 + w, y - 3, r, 3);
  }
  if (oily) for (let k = 0; k < 4; k++) p.ellipse(10 + k * 3, 20 + k * 6, 3, 2, COAST.oil, { form: 'flat', level: 1 });
  return p.toBuffer();
}

function refillBottle(): PixelBuffer {
  const p = new Paint(18, 40);
  p.rect(3, 8, 12, 30, ramp('#3aa6b8'), { form: 'cylV', sep: true });
  p.rect(5, 2, 8, 7, ramp('#2a6a7a'), { form: 'cylV', sep: true });
  p.rect(3, 18, 12, 6, ramp('#f2c94c'), { form: 'flat', level: 3, onlyOver: true });
  return p.toBuffer();
}

function yogurt(): PixelBuffer {
  const p = new Paint(30, 30);
  p.poly(
    [
      [3, 6],
      [27, 6],
      [24, 28],
      [6, 28],
    ],
    ramp('#f2f4ec', { cool: 1.2 }),
    { sep: true },
  );
  p.ellipse(15, 7, 11, 3, ramp('#f8e8f0'), { form: 'flat', level: 3 });
  p.ellipse(13, 7, 5, 2, ramp('#e8a0c0'), { form: 'flat', level: 2 });
  // the recycling arrows
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    p.line(15 + Math.cos(a) * 5, 18 + Math.sin(a) * 5, 15 + Math.cos(a + 1.6) * 5, 18 + Math.sin(a + 1.6) * 5, ramp('#3a7ad8'), 2);
  }
  return p.toBuffer();
}

function cutRing(cut: boolean): PixelBuffer {
  const b = new PixelBuffer(46, 16);
  for (let k = 0; k < 3; k++)
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      if (cut && Math.abs(a - Math.PI / 2) < 0.4) continue;
      b.set(Math.round(8 + k * 15 + Math.cos(a) * 6), Math.round(8 + Math.sin(a) * 5), a < Math.PI ? '#f4f0e0' : '#c8c0a8');
    }
  if (cut) for (let k = 0; k < 2; k++) for (let y = 2; y < 14; y++) b.set(15 + k * 15, y, null);
  return b;
}

function personSmall(look: Parameters<typeof paintHero>[0]): PixelBuffer {
  return paintHero(look, 1, 'down');
}

function soapBowl(): PixelBuffer {
  const p = new Paint(60, 36);
  p.ellipse(30, 22, 28, 12, ramp('#f2f4ec', { cool: 1.2 }), { sep: true });
  p.ellipse(30, 16, 24, 5, ramp('#bfe8f2', { cool: 1.2 }), { form: 'flat', level: 3 });
  for (let k = 0; k < 9; k++) p.ellipse(12 + k * 4.4, 15 + (k % 2), 1.4, 1, ramp('#f2c94c'), { form: 'flat', level: 3 });
  for (let k = 0; k < 6; k++) p.ellipse(14 + k * 6, 10 - (k % 3), 2.4, 2.4, ramp('#e8f4ff', { cool: 1.4 }), { sep: true });
  return p.toBuffer();
}

function skirtBoom(): PixelBuffer {
  const b = new PixelBuffer(120, 40);
  const boom = paintBoom(24, 5, 0);
  for (let y = 0; y < boom.h; y++) for (let x = 0; x < boom.w; x++) if (boom.get(x, y)) b.set(x, 8 + y, boom.get(x, y));
  for (let x = 2; x < 118; x++) for (let y = 18; y < 34; y++) b.set(x, y, y === 33 || x % 12 === 0 ? '#a87a20' : '#e0a030');
  return b;
}

function bars(vals: number[], labels: string[], unit: string, mark?: number): PixelBuffer {
  const b = new PixelBuffer(PW, PH);
  b.rect(0, 0, PW, PH, '#f6f2e6');
  const max = Math.max(...vals);
  const bw = Math.floor(120 / vals.length);
  const base = 78;
  for (let y = 10; y <= base; y += 17) b.hline(28, 168, y, '#e0d8c4');
  b.vline(26, 8, base, '#8a7a60');
  b.hline(26, 168, base, '#8a7a60');
  vals.forEach((v, i) => {
    const hgt = Math.round((v / max) * 62);
    const x = 36 + i * bw;
    const after = mark !== undefined && i >= mark;
    b.rect(x, base - hgt, bw - 8, hgt, after ? '#3aa65a' : '#2f8fc8');
    b.rect(x, base - hgt, bw - 8, 2, after ? '#7cd08a' : '#7ac0ec');
  });
  if (mark !== undefined) for (let y = 8; y < base; y += 3) b.set(32 + mark * bw - 4, y, '#e0503a');
  void labels;
  void unit;
  return b;
}

/** The picture above a question. Labels (days, units) are added on top as text by the game. */
export function paintScene(s: Scene): PixelBuffer {
  const sandY = Math.round(PH * 0.88);
  const two = scene2(s);
  if (two) return two;
  switch (s) {
    case 'turtle': {
      const b = canvas('sea');
      for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) b.set(x, y, mixHex('#5ab4e0', '#1f5a8a', y / PH));
      stamp(b, paintTurtle(2, 0), 46, 80);
      stamp(b, paintTrash('bag', 24, 0), 120, 46, 2);
      stamp(b, jelly(), 154, 64);
      return b;
    }
    case 'shell': {
      const b = canvas();
      stamp(b, paintNatural('shell', 24, 1), 56, sandY, 2);
      stamp(b, paintTrash('cap', 24), 120, sandY, 2);
      return b;
    }
    case 'park':
    case 'rivermouth':
      return paintPath(null, 176, 96);
    case 'can':
    case 'peel':
    case 'battery': {
      const b = canvas();
      stamp(b, paintTrash(s === 'can' ? 'can' : s === 'peel' ? 'peel' : 'battery', 24), 88, sandY, 3);
      return b;
    }
    case 'bottle-years': {
      const b = canvas();
      for (let k = 0; k < 3; k++) stamp(b, bottleStage(k), 32 + k * 56, sandY, 2);
      return b;
    }
    case 'refill': {
      const b = canvas('plain');
      stamp(b, refillBottle(), 44, 82, 1);
      for (let k = 0; k < 7; k++) stamp(b, paintTrash('bottle', 16), 110 + (k % 4) * 15, 82 - Math.floor(k / 4) * 10, 1);
      return b;
    }
    case 'yogurt': {
      const b = canvas('plain');
      stamp(b, yogurt(), 88, 82, 2);
      return b;
    }
    case 'ring': {
      const b = canvas('plain');
      stamp(b, cutRing(false), 50, 60, 1);
      stamp(b, cutRing(true), 126, 60, 1);
      return b;
    }
    case 'drain': {
      const b = canvas('plain');
      for (let y = 60; y < PH; y++) for (let x = 0; x < PW; x++) b.set(x, y, COAST.road[y === 60 ? 4 : 2]);
      stamp(b, paintStormDrain(24, true), 88, 76, 2);
      return b;
    }
    case 'beach-again': {
      const b = canvas();
      for (let y = 0; y < PH; y++) b.set(88, y, '#ffffff');
      stamp(b, paintNatural('shell', 16, 0), 40, sandY, 1);
      for (const [k, x] of [
        ['bottle', 104],
        ['can', 124],
        ['bag', 144],
        ['wrapper', 162],
        ['cap', 116],
      ] as const)
        stamp(b, paintTrash(k, 16, 0), x, sandY - (x % 3), 1);
      return b;
    }
    case 'nets': {
      const b = canvas('plain');
      (['big', 'small', 'medium'] as NetDesign[]).forEach((d, i) => {
        const full = paintDrainPipe(24, d, 0, false);
        const crop = new PixelBuffer(24, 26);
        for (let y = 0; y < 26; y++) for (let x = 0; x < 24; x++) crop.set(x, y, full.get(34 + x, 14 + y) ?? '#e6f2f6');
        stamp(b, crop, 30 + i * 58, 80, 2);
      });
      return b;
    }
    case 'blocked': {
      const b = canvas();
      stamp(b, paintDrainPipe(24, 'small', 2, true, 1), 88, sandY, 1);
      return b;
    }
    case 'families': {
      const b = canvas('plain');
      for (let k = 0; k < 5; k++) {
        stamp(b, paintTownHouse(16, k), 18 + k * 35, 60);
        stamp(b, paintTrash('bag', 16, 0), 18 + k * 35, 80);
      }
      return b;
    }
    case 'oil-glass': {
      const b = canvas('plain');
      stamp(b, glassOfOil(), 88, 88, 1);
      return b;
    }
    case 'feather': {
      const b = canvas('plain');
      stamp(b, feather(false), 56, 86);
      stamp(b, feather(true), 120, 86);
      return b;
    }
    case 'boat': {
      const b = canvas('dock');
      for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) b.set(x, y, y < 56 ? mixHex('#7ab8e8', '#d8eef2', y / 56) : COAST.sea[2]);
      stamp(b, paintBoat(24, false, 0), 96, 74);
      stamp(b, paintOilSlick(24, 3, 0), 140, 64);
      return b;
    }
    case 'ghost': {
      const b = canvas('sea');
      stamp(b, paintGhostNet(24, 0), 70, 82, 2);
      stamp(b, paintTurtle(1, 0), 140, 70);
      return b;
    }
    case 'boom': {
      const b = canvas('sea');
      stamp(b, paintOilSlick(24, 4, 0), 88, 62);
      stamp(b, paintBoom(24, 6, 0), 88, 66, 1);
      return b;
    }
    case 'pads': {
      const b = canvas('dock');
      stamp(b, paintPads(24, 0.9), 88, 76, 2);
      return b;
    }
    case 'spread': {
      const b = canvas('sea');
      stamp(b, paintOilSlick(24, 1, 0), 30, 60);
      stamp(b, paintOilSlick(24, 2, 1), 80, 60);
      stamp(b, paintOilSlick(24, 3, 2), 140, 60);
      return b;
    }
    case 'bottles': {
      const b = canvas('sea');
      stamp(b, paintTrash('bottle', 24), 56, 58, 2);
      const open = paintTrash('bottle', 24);
      stamp(b, open, 124, 88, 2);
      for (let k = 0; k < 4; k++) b.set(140 + k * 2, 66 - k * 4, '#ffffff');
      return b;
    }
    case 'patches': {
      const b = canvas('plain');
      (['tape', 'bucket', 'patch'] as const).forEach((d, i) => stamp(b, paintTankFix(24, d, 0.6, d === 'tape' ? 0.8 : 0), 30 + i * 58, 84, 2));
      return b;
    }
    case 'netbin': {
      const b = canvas('dock');
      stamp(b, paintNetBin(24), 88, 80, 2);
      return b;
    }
    case 'soap': {
      const b = canvas('plain');
      stamp(b, soapBowl(), 88, 84, 2);
      return b;
    }
    case 'booms': {
      const b = canvas('plain');
      for (let y = 40; y < PH; y++) for (let x = 0; x < PW; x++) b.set(x, y, COAST.sea[y === 40 ? 4 : 2]);
      for (let x = 6; x < 52; x++) b.set(x, 50, '#c8a060');
      stamp(b, paintBoom(16, 3, 0), 88, 58, 1);
      for (let k = 0; k < 4; k++) b.set(72 + k * 10, 46, '#ffffff');
      stamp(b, paintBoom(16, 3, 0), 148, 46, 1);
      return b;
    }
    case 'skirt': {
      const b = canvas('plain');
      for (let y = 28; y < PH; y++) for (let x = 0; x < PW; x++) b.set(x, y, mixHex('#5ab4e0', '#2a6a9a', (y - 28) / 68));
      stamp(b, skirtBoom(), 88, 64, 1);
      return b;
    }
    case 'harbor-people': {
      const b = canvas('dock');
      [RAFI_HADDAD, ...TOWNSFOLK, MARISOL_VEGA, ROSA_DELGADO].forEach((l, i) => stamp(b, personSmall(l), 18 + i * 28, 88));
      return b;
    }
  }
  return canvas();
}

/** The bar graph above a question (bars only; the game writes the labels). */
export function paintBars(vals: number[], labels: string[], unit: string, mark?: number): PixelBuffer {
  return bars(vals, labels, unit, mark);
}

/**
 * The model for hint 2 about where trash goes: the town on the hill, a street
 * drain, the river, the beach and the sea, with arrows downhill. `mark` lights
 * one part.
 */
export function paintPath(mark: 'town' | 'drain' | 'river' | 'beach' | null, w = 176, hgt = 96): PixelBuffer {
  const b = new PixelBuffer(w, hgt);
  const ground = (x: number) => Math.round(30 + (x / w) * 46);
  for (let y = 0; y < hgt; y++)
    for (let x = 0; x < w; x++) {
      const g = ground(x);
      let c = y < g ? mixHex('#8ac8ec', '#d8eef2', y / g) : x > w * 0.8 ? COAST.sea[2] : x > w * 0.62 ? COAST.sand[2] : WILD.grass[y === g ? 3 : 2];
      if (y >= g && x > w * 0.8 && y === g) c = COAST.sea[4];
      b.set(x, y, c);
    }
  // the town
  for (let k = 0; k < 3; k++) {
    const hx = 8 + k * 16;
    const gy = ground(hx);
    b.rect(hx, gy - 10, 12, 10, ['#ead8b0', '#bfe0d0', '#f2c8b0'][k]);
    for (let j = 0; j < 6; j++) b.hline(hx - 1 + j, hx + 12 - j, gy - 11 - j, '#c8584a');
  }
  // the river from the town to the sea
  for (let x = 40; x < w * 0.8; x++) {
    const y = ground(x) + 4 + Math.round(Math.sin(x / 9) * 2);
    for (let k = 0; k < 3; k++) b.set(x, y + k, COAST.river[k === 0 ? 4 : 2]);
  }
  // the street drain
  const dx = 54;
  b.rect(dx, ground(dx) - 2, 6, 3, '#3a3a40');
  // trash along the way
  for (const x of [30, 70, 98, 124, 148]) b.rect(x, ground(x) + 2, 3, 2, x % 2 ? '#7ac8e0' : '#9a62d0');
  // arrows downhill
  for (const x of [34, 84, 116]) {
    const y = ground(x) - 10;
    for (let k = 0; k < 9; k++) b.set(x + k, y + Math.round(k * 0.4), '#1e1a24');
    b.set(x + 7, y + 1, '#1e1a24');
    b.set(x + 7, y + 4, '#1e1a24');
  }
  if (mark) {
    const at = { town: 22, drain: 57, river: 96, beach: 128 }[mark];
    for (let a = 0; a < Math.PI * 2; a += 0.1) b.set(Math.round(at + Math.cos(a) * 14), Math.round(ground(at) + Math.sin(a) * 10), '#e0503a');
  }
  return b;
}

/** The model for sorting: the four bins in a row. */
export function paintBins4(): PixelBuffer {
  const b = new PixelBuffer(176, 72);
  b.rect(0, 0, 176, 72, '#f6f2e6');
  (['recycle', 'compost', 'trash', 'hazard'] as BinKind[]).forEach((k, i) => stamp(b, paintBin(24, k), 22 + i * 44, 64, 1));
  return b;
}

/** The model for engineering: the loop problem → design → test → improve (the step lit). */
export function paintLoop(lit = -1): PixelBuffer {
  const b = new PixelBuffer(176, 80);
  b.rect(0, 0, 176, 80, '#f6f2e6');
  const cx = 88;
  const cy = 40;
  for (let a = 0; a < Math.PI * 2; a += 0.02) b.set(Math.round(cx + Math.cos(a) * 52), Math.round(cy + Math.sin(a) * 26), '#8a7a60');
  const pos: Array<[number, number]> = [
    [cx, cy - 26],
    [cx + 52, cy],
    [cx, cy + 26],
    [cx - 52, cy],
  ];
  const colors = ['#e0503a', '#3a7ad8', '#f2c94c', '#3aa65a'];
  pos.forEach(([x, y], i) => {
    for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= 36) b.set(x + xx, y + yy, i === lit ? '#ffffff' : colors[i]);
    for (let yy = -7; yy <= 7; yy++) for (let xx = -7; xx <= 7; xx++) if (Math.abs(xx * xx + yy * yy - 49) < 7) b.set(x + xx, y + yy, '#1e1a24');
  });
  return b;
}

// ------------------------------------------------------------------ half 2: the wetland and the town

/** Fill the bottom of a picture with water (clear, algae or mud) from row `top`. */
function water(b: PixelBuffer, top: number, kind: 'clear' | 'algae' | 'mud', x0 = 0, x1 = PW): void {
  const r = kind === 'algae' ? COAST.algae : kind === 'mud' ? COAST.mudWater : COAST.river;
  for (let y = top; y < b.h; y++)
    for (let x = x0; x < x1; x++) {
      let c = r[y === top ? 4 : y < top + 3 ? 3 : 2];
      if (kind === 'algae' && y < top + 3 && hash(x, y, 9) > 0.55) c = '#6ab84a';
      if (kind === 'mud' && hash(x, y, 4) > 0.93) c = r[1];
      b.set(x, y, c);
    }
}

/** Grass ground from row `top`. */
function grass(b: PixelBuffer, top: number, x0 = 0, x1 = PW): void {
  for (let y = top; y < b.h; y++) for (let x = x0; x < x1; x++) b.set(x, y, y === top ? WILD.grass[4] : y < top + 3 ? WILD.grass[3] : COAST.soil[hash(x, y, 2) > 0.85 ? 3 : 2]);
}

/** Rain streaks over a picture. */
function rain(b: PixelBuffer, seed = 0, n = 60): void {
  for (let k = 0; k < n; k++) {
    const x = Math.floor(hash(k, seed, 1) * b.w);
    const y = Math.floor(hash(k, seed, 2) * b.h);
    for (let j = 0; j < 4; j++) if (b.get(x - j, y + j * 2) !== undefined) b.set(x - Math.floor(j / 2), y + j * 2, '#cfe6f6');
  }
}

/** A storm sky: dark clouds across the top. */
function stormSky(b: PixelBuffer, h: number): void {
  for (let y = 0; y < h; y++) for (let x = 0; x < b.w; x++) b.set(x, y, mixHex('#4a5466', '#8a96a6', y / h));
  for (let k = 0; k < 9; k++) {
    const cx = hash(k, 3, 3) * b.w;
    const cy = 6 + hash(k, 4, 4) * h * 0.4;
    for (let y = -8; y <= 8; y++) for (let x = -22; x <= 22; x++) if ((x * x) / 484 + (y * y) / 64 < 1) b.set(Math.round(cx + x), Math.round(cy + y), y < 0 ? '#6a7486' : '#545e70');
  }
}

/** A small arrow pointing right (or down), drawn in ink. */
function arrow(b: PixelBuffer, x: number, y: number, len = 10, down = false): void {
  for (let k = 0; k < len; k++) down ? b.set(x, y + k, INK) : b.set(x + k, y, INK);
  for (let k = 1; k < 4; k++) {
    if (down) {
      b.set(x - k, y + len - k, INK);
      b.set(x + k, y + len - k, INK);
    } else {
      b.set(x + len - k, y - k, INK);
      b.set(x + len - k, y + k, INK);
    }
  }
}

/** A glass of water (clear), with an optional test strip beside it. */
function glass(strip: 'good' | 'bad' | null): PixelBuffer {
  const p = new Paint(30, 40);
  p.rect(4, 6, 18, 32, ramp('#e8f4f8', { cool: 1.3 }), { form: 'flat', level: 4, sep: true });
  p.rect(5, 12, 16, 25, ramp('#bfe8f2', { cool: 1.3 }), { form: 'flat', level: 3 });
  if (strip) {
    p.rect(25, 8, 3, 26, ramp('#f6f2e6'), { form: 'flat', level: 4, sep: true });
    p.rect(25, 26, 3, 6, strip === 'good' ? ramp('#3aa65a') : ramp('#e0503a'), { form: 'flat', level: 3 });
  }
  return p.toBuffer();
}

/** A sack of fertilizer. */
function sack(): PixelBuffer {
  const p = new Paint(24, 28);
  p.poly(
    [
      [3, 6],
      [21, 6],
      [22, 27],
      [2, 27],
    ],
    ramp('#d8c48a'),
    { sep: true },
  );
  p.rect(6, 12, 12, 8, ramp('#3aa65a'), { form: 'flat', level: 3 });
  p.ellipse(12, 16, 3, 3, ramp('#f2c94c'), { form: 'flat', level: 4 });
  return p.toBuffer();
}

/** Short lawn grass (a tuft), for the designs that only half work. */
function tufts(T: number, wTiles: number, brown = false): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const p = new Paint(W, Math.round(6 * u));
  const r = brown ? ramp('#a89a5a') : ramp('#7cc44a');
  for (let x = 0; x < W; x += Math.max(2, Math.round(u * 1.5))) p.line(x, Math.round(6 * u), x + (x % 3) - 1, Math.round((2 + (x % 4)) * u * 0.8), r, 2);
  return p.toBuffer();
}

/** A tall or white chimney, with or without a filter, smoking or not. */
function chimney(T: number, design: 'tall' | 'paint' | 'filter', frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const tall = design === 'tall';
  const H = Math.round((tall ? 44 : 30) * u);
  const p = new Paint(Math.round(22 * u), H);
  const top = tall ? S(14) : S(12);
  p.rect(S(7), top, S(8), H - top, design === 'paint' ? ramp('#eef0f2', { cool: 1.2 }) : COAST.brick, { form: 'cylV', sep: true });
  if (design === 'filter') {
    p.rect(S(5), top - S(4), S(12), S(5), ramp('#8a9298', { cool: 1.1 }), { form: 'flat', level: 3, sep: true });
    for (let k = 0; k < 4; k++) p.pix(S(6.5 + k * 3), top - S(2), '#3a3a40');
    p.ellipse(S(11), top - S(7) - (frame % 3) * u, S(2), S(1.2), COAST.steam, { form: 'flat', level: 4 });
  } else
    for (let k = 0; k < 4; k++) {
      const t = (k + frame * 0.3) % 4;
      p.ellipse(S(11 + t * 2), top - S(2 + t * 3), S(2.2 + t * 0.8), S(1.8 + t * 0.5), COAST.smoke, { form: 'flat', level: 2 });
    }
  return p.toBuffer();
}

/**
 * A half-2 fix at its build spot: wetland plants, the water filter, the
 * riverbank strip, the rain garden and the chimney fix, in each design.
 * `wet` shows rain water collecting (during a test).
 */
export function paintFix(recipe: 'reeds' | 'filter' | 'buffer' | 'rain-garden' | 'mill-filter', design: string, T: number, frame = 0, wet = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  if (recipe === 'reeds') {
    const out = new PixelBuffer(Math.round(3 * T), Math.round(32 * u));
    const one = design === 'native' ? paintReeds(T, 1, frame) : design === 'flowers' ? flower(T) : tufts(T, 1);
    for (let k = 0; k < 3; k++) out.blit(one, Math.round(k * T + (T - one.w) / 2), out.h - one.h);
    return out;
  }
  if (recipe === 'filter') {
    const layers: FilterLayer[] = design === 'coarse' ? ['stones', 'gravel', 'sand'] : design === 'sand-top' ? ['sand', 'gravel', 'stones'] : ['gravel', 'sand', 'stones', 'sand'];
    return paintFilter(T, layers, true, design === 'coarse', frame);
  }
  if (recipe === 'buffer') {
    if (design === 'strip') return paintBufferStrip(T, 3, frame);
    if (design === 'fence') {
      const out = new PixelBuffer(Math.round(3 * T), Math.round(14 * u));
      const p = new Paint(out.w, out.h);
      for (let k = 0; k < 4; k++) p.rect(S(2 + k * 14), S(2), S(2), S(12), COAST.wood, { form: 'cylV', sep: true });
      p.rect(0, S(4), out.w, S(1.6), COAST.wood, { form: 'flat', level: 3, sep: true });
      p.rect(0, S(9), out.w, S(1.6), COAST.wood, { form: 'flat', level: 3, sep: true });
      out.blit(p.toBuffer(), 0, 0);
      return out;
    }
    return tufts(T, 3);
  }
  if (recipe === 'rain-garden') {
    if (design === 'garden') return paintRainGarden(T, wet);
    const out = new PixelBuffer(Math.round(3 * T), Math.round(16 * u));
    const p = new Paint(out.w, out.h);
    if (design === 'pipe') {
      p.rect(S(2), S(4), S(40), S(3), COAST.pipe, { form: 'cylH', sep: true });
      p.rect(S(40), S(4), S(3), S(12), COAST.pipe, { form: 'cylV', sep: true });
      if (wet) for (let k = 0; k < 3; k++) p.ellipse(S(41.5), S(12 + ((k * 3 + frame) % 6)), S(0.8), S(1), COAST.river, { form: 'flat', level: 3 });
    } else {
      p.ellipse(out.w / 2, S(14), S(20), S(4), ramp('#9a9a8a'), { sep: true });
      for (let k = 0; k < 30; k++) p.pix(S(6) + hash(k, 2, 2) * S(36), S(12) + hash(k, 3, 3) * S(3), '#6a6a62');
      if (wet) p.ellipse(out.w / 2, S(12), S(22), S(2), COAST.river, { form: 'flat', level: 3 });
    }
    out.blit(p.toBuffer(), 0, 0);
    return out;
  }
  return chimney(T, design as 'tall' | 'paint' | 'filter', frame);
}

function flower(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(16 * u));
  p.line(S(6), S(16), S(6), S(6), ramp('#5a9a3a'), 2);
  for (const [dx, dy] of [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ])
    p.ellipse(S(6 + dx), S(5 + dy), S(1.6), S(1.6), ramp('#e85aa0'), { form: 'flat', level: 3 });
  p.ellipse(S(6), S(5), S(1.2), S(1.2), ramp('#f2c94c'), { form: 'flat', level: 4 });
  return p.toBuffer();
}

/** The half-2 question pictures. */
function scene2(s: Scene): PixelBuffer | null {
  switch (s) {
    case 'reeds-clean': {
      const b = canvas('plain');
      grass(b, 70);
      water(b, 62, 'mud', 0, 56);
      water(b, 62, 'clear', 120, PW);
      for (let k = 0; k < 4; k++) stamp(b, paintReeds(16, k, 0), 70 + k * 12, 72);
      arrow(b, 30, 50);
      arrow(b, 130, 50);
      return b;
    }
    case 'sponge': {
      const b = new PixelBuffer(PW, PH);
      stormSky(b, 50);
      grass(b, 66);
      water(b, 66, 'clear', 40, 110);
      for (let k = 0; k < 5; k++) stamp(b, paintReeds(16, k, 0), 46 + k * 14, 70);
      stamp(b, paintTownHouse(16, 1), 140, 66);
      stamp(b, paintTownHouse(16, 2), 160, 66);
      rain(b, 3);
      for (let k = 0; k < 4; k++) arrow(b, 56 + k * 14, 70, 8, true);
      return b;
    }
    case 'muddy': {
      const b = canvas('plain');
      water(b, 20, 'clear', 0, 86);
      water(b, 20, 'mud', 90, PW);
      for (let x = 0; x < PW; x++) b.set(x, 19, '#f2c94c');
      for (let k = 0; k < 3; k++) {
        for (let y = 20; y < 88; y++) b.set(18 + k * 22 + Math.floor((y - 20) / 6), y, y % 3 ? '#f6e08a' : COAST.river[3]);
        for (let y = 20; y < 36; y++) b.set(108 + k * 22 + Math.floor((y - 20) / 6), y, '#f6e08a');
      }
      for (let k = 0; k < 3; k++) stamp(b, tufts(16, 1), 24 + k * 22, PH);
      for (let k = 0; k < 3; k++) stamp(b, tufts(16, 1, true), 114 + k * 22, PH);
      return b;
    }
    case 'gasp': {
      const b = canvas('plain');
      water(b, 40, 'algae');
      for (let k = 0; k < 3; k++) stamp(b, paintFish(24, k, true), 40 + k * 48, 56);
      return b;
    }
    case 'nursery': {
      const b = canvas('plain');
      water(b, 60, 'clear');
      for (let k = 0; k < 6; k++) stamp(b, paintReeds(24, k, 0), 14 + k * 30, 92);
      stamp(b, paintFish(16, 0), 44, 82);
      stamp(b, paintFish(16, 1, false, '#e8c060'), 104, 88);
      stamp(b, paintFrog(16, 0), 140, 64);
      for (let k = 0; k < 6; k++) b.set(70 + (k % 3) * 2, 74 + Math.floor(k / 3) * 2, '#1e1a24');
      return b;
    }
    case 'reeds': {
      const b = canvas('plain');
      water(b, 64, 'clear');
      for (let k = 0; k < 5; k++) stamp(b, paintReeds(24, k, 0), 24 + k * 32, 90);
      return b;
    }
    case 'green-pond': {
      const b = canvas('day');
      grass(b, 56);
      water(b, 60, 'algae', 20, 156);
      stamp(b, paintFish(16, 0, true), 70, 70);
      stamp(b, sack(), 168, 56);
      return b;
    }
    case 'two-glasses': {
      const b = canvas('plain');
      stamp(b, glass('good'), 56, 86, 2);
      stamp(b, glass('bad'), 124, 86, 2);
      return b;
    }
    case 'fertilizer': {
      const b = canvas('day');
      grass(b, 54);
      stamp(b, paintField(16, 6, 'crop', 0), 70, 60);
      stamp(b, sack(), 140, 56);
      water(b, 80, 'algae', 0, PW);
      arrow(b, 120, 66, 10, true);
      return b;
    }
    case 'channel': {
      const b = canvas('plain');
      grass(b, 50);
      water(b, 64, 'clear', 0, 70);
      water(b, 64, 'clear', 110, PW);
      for (const [k, x] of [
        ['bottle', 76],
        ['bag', 88],
        ['can', 100],
        ['wrapper', 92],
      ] as const)
        stamp(b, paintTrash(k, 16, 0), x, 68 + (x % 3));
      for (let k = 0; k < 3; k++) stamp(b, paintReeds(16, k, 0), 128 + k * 14, 68);
      return b;
    }
    case 'filters': {
      const b = canvas('plain');
      (['sand-top', 'mixed', 'coarse'] as const).forEach((d, i) => stamp(b, paintFix('filter', d, 16, 0), 30 + i * 58, 92, 2));
      return b;
    }
    case 'heron-fish': {
      const b = canvas('plain');
      water(b, 56, 'algae');
      stamp(b, paintHeron(24, 0), 50, 80);
      stamp(b, paintFish(16, 0), 140, 86);
      stamp(b, paintFish(16, 1), 158, 76);
      arrow(b, 110, 72, 14);
      return b;
    }
    case 'bare-field': {
      const b = new PixelBuffer(PW, PH);
      stormSky(b, 44);
      grass(b, 44);
      stamp(b, paintField(16, 7, 'bare', 0), 66, 62);
      water(b, 70, 'mud', 124, PW);
      for (let x = 100; x < 124; x++) for (let y = 62; y < 68; y++) if (hash(x, y, 5) > 0.4) b.set(x, y, COAST.mudWater[2]);
      rain(b, 5);
      return b;
    }
    case 'mill-bus': {
      const b = canvas('plain');
      grass(b, 80);
      stamp(b, paintMill(24, false, 0), 56, 80);
      stamp(b, paintBus(24, true, 1), 132, 82);
      return b;
    }
    case 'buffer': {
      const b = canvas('day');
      grass(b, 60);
      stamp(b, paintField(16, 5, 'crop', 0), 40, 66);
      stamp(b, paintBufferStrip(16, 3, 0), 104, 66);
      water(b, 66, 'clear', 134, PW);
      return b;
    }
    case 'cover-crop': {
      const b = canvas('day');
      grass(b, 62);
      stamp(b, paintField(16, 5, 'bare', 0), 46, 70);
      stamp(b, paintField(16, 5, 'cover', 0), 132, 70);
      for (let y = 50; y < PH; y++) b.set(88, y, '#ffffff');
      return b;
    }
    case 'rain-garden': {
      const b = new PixelBuffer(PW, PH);
      stormSky(b, 60);
      grass(b, 76);
      stamp(b, paintTownHouse(24, 0), 50, 76);
      stamp(b, paintRainGarden(24, true), 124, 84);
      rain(b, 7, 40);
      arrow(b, 80, 70, 16);
      return b;
    }
    case 'barrel': {
      const b = canvas('day');
      grass(b, 76);
      stamp(b, paintTownHouse(24, 2), 76, 76);
      stamp(b, paintRainBarrel(24), 112, 78);
      return b;
    }
    case 'mills': {
      const b = canvas('plain');
      (['tall', 'paint', 'filter'] as const).forEach((d, i) => stamp(b, chimney(16, d, 0), 30 + i * 58, 92, 1));
      return b;
    }
    case 'council': {
      const b = canvas('plain');
      [ROSA_DELGADO, ...TOWNSFOLK.slice(0, 3), WEN_LI, MARISOL_VEGA].forEach((l, i) => stamp(b, personSmall(l), 18 + i * 28, 88));
      return b;
    }
    case 'valley': {
      const b = paintPath(null, PW, PH);
      return b;
    }
    default:
      return null;
  }
}

// ------------------------------------------------------------------ the finale: The Big Rain and Clean Coast Day

export const FW = 320;
export const FH = 168;

/** A finale picture: a stretch of the coast drawn wide, with its fixes, in the storm or the sun. */
export function paintFinale(i: number, frame = 0): PixelBuffer {
  const stretch: Stretch = i <= 2 ? 'town' : i === 3 ? 'wetland' : i === 4 ? 'harbor' : 'beach';
  const night = i === 7;
  const storm = i <= 4;
  const b = new PixelBuffer(FW, FH);
  const bd = paintCoastBackdrop(stretch, FW, FH, true);
  b.blit(bd.sky, 0, 0);
  b.blit(bd.far, 0, 0);
  b.blit(bd.near, 0, 0);
  if (storm) {
    stormSky(b, 60);
  }
  const T = 24;
  const ground = FH - 36;
  // the ground: a row of tiles
  for (let x = 0; x < FW; x += T) {
    const water = (stretch === 'harbor' && x > 140) || (stretch === 'beach' && x > 230) || (stretch === 'wetland' && x > 90 && x < 230) || (stretch === 'town' && i === 1 && x >= 216);
    const top = paintCoastTile(T, stretch, water ? 'waterTop' : 'top', x / T, frame % 4, 'clear');
    const fill = paintCoastTile(T, stretch, water ? 'water' : 'fill', x / T + 1, frame % 4, 'clear');
    b.blit(top, x, ground);
    b.blit(fill, x, ground + T);
  }
  const put = (s: PixelBuffer, cx: number, bottom = ground) => stamp(b, s, cx, bottom);
  if (i === 0) {
    for (let k = 0; k < 4; k++) put(paintTownHouse(T, k), 40 + k * 70);
    put(paintField(T, 2, 'cover', 0), 292);
  } else if (i === 1) {
    put(paintField(T, 5, 'cover', frame % 2), 70);
    put(paintBufferStrip(T, 3, frame), 176);
  } else if (i === 2) {
    put(paintTownHouse(T, 1), 36);
    put(paintTownHouse(T, 2), 92);
    put(paintRainGarden(T, true), 150, ground + 4);
    put(paintStormDrain(T, true), 196, ground + 4);
    put(paintMill(T, true, frame), 268);
  } else if (i === 3) {
    for (let k = 0; k < 6; k++) put(paintReeds(T, k, frame), 100 + k * 22, ground + 10);
    put(paintFish(T, frame, false), 150, ground + 22);
    put(paintFish(T, frame + 1, false, '#e8c060'), 200, ground + 28);
    put(paintHeron(T, 0), 40);
  } else if (i === 4) {
    put(paintNetBin(T), 60);
    put(paintBoat(T, true, frame % 6), 220, ground + 18);
  } else {
    put(paintDrainPipe(T, 'medium', frame % 14, i === 5, 0.2), 60, ground);
    if (i === 5) for (let k = 0; k < 3; k++) put(paintNature('amberlight', T, frame % 4), 112 + k * 46);
    if (i === 6) {
      put(paintSquadFlag(T, true, frame % 8), 104);
      [MARISOL_VEGA, RAFI_HADDAD, WEN_LI, ROSA_DELGADO, ...TOWNSFOLK.slice(0, 3)].forEach((l, k) => put(paintHero(l, 1.5, 'right'), 124 + k * 15));
    }
  }
  if (storm) rain(b, i * 7 + (frame % 3), 160);
  if (night) {
    for (let y = 0; y < FH; y++)
      for (let x = 0; x < FW; x++) {
        const c = b.get(x, y);
        if (c) b.set(x, y, mixHex(c, '#101a3a', 0.62));
      }
    for (let k = 0; k < 40; k++) b.set(Math.floor(hash(k, 1, 7) * FW), Math.floor(hash(k, 2, 7) * 60), '#f6f2e6');
    for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) if (x * x + y * y <= 49) b.set(270 + x, 24 + y, '#f6f2d6');
    // amber light pools, then the hatchlings heading for the bright sea
    for (let k = 0; k < 3; k++) {
      const lx = 112 + k * 46;
      for (let y = -10; y <= 4; y++) for (let x = -14; x <= 14; x++) if ((x * x) / 196 + (y * y) / 100 < 1) {
        const c = b.get(lx + x, ground + y);
        if (c) b.set(lx + x, ground + y, mixHex(c, '#ffb03a', 0.35));
      }
      put(paintNature('amberlight', T, frame % 4), lx);
    }
    for (let k = 0; k < 5; k++) put(paintTurtle(1, (frame + k) % 2), 128 + k * 24 + (frame % 4) * 2, ground + 2 + (k % 2) * 4);
  }
  return b;
}

export { PixelBuffer };
