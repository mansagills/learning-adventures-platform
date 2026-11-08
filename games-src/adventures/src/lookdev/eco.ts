import { PixelBuffer } from '../kit/art/pixel';
import { mixHex } from '../kit/worlds/shade';
import type { Expression } from '../kit/art/portraits';
import { h } from '../kit/ui/dom';
import { Talk, type Speaker } from '../kit/ui/talk';
import { paintHero, paintPortrait16, type Look16, type Mood } from '../kit/worlds/hero16';
import { RANGER_TALA } from '../kit/worlds/wild-lands/art';
import {
  LUPE_FONOTI,
  NIA_ACHIENG,
  PIECE_IDS,
  PIECES,
  ROLE_COLOR,
  ROLE_NAME,
  THEO_PARK,
  paintBoat,
  paintBramble,
  paintBramblePortrait,
  paintCard,
  paintFirefly,
  paintSea,
  paintGlowMushrooms,
  paintGround,
  paintPiece,
  type Ground,
  type PieceId,
  type Role,
} from '../kit/worlds/wild-lands/eco-art';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Ecosystem Building Tycoon, the first roguelike builder
 * (the "S3 Life: Ecosystem Building Tycoon" section of docs/GAMES_3D_UPGRADE_PLAN.md):
 *   #eco-cast          the people, Bramble, the ground tiles, every piece and the cards
 *   #eco-island        a meadow-and-pond island part way through a run: the hand, combos, the health target
 *   #eco-island-night  the same island at night (fireflies, glowing mushrooms)
 * Add -nia for Warden Nia's talk box, -long for the long run's labels. Not shipped: dev server only.
 */

const T = 24;

function cvs(b: PixelBuffer, scale: number, cls = ''): HTMLCanvasElement {
  const c = b.toCanvas(scale);
  c.className = `px ${cls}`;
  return c;
}

function card(art: HTMLElement[], title: string, note: string): HTMLElement {
  return h('figure', { class: 'card' }, h('div', { class: 'sprites' }, ...art), h('figcaption', {}, h('strong', { text: title }), h('span', { text: note })));
}

function speaker(name: string, role: string, look: Look16, voice: number): Speaker {
  const pics: Partial<Record<Mood, string>> = {};
  const pic = (m: Mood) => (pics[m] ??= paintPortrait16(look, m).toDataURL(2));
  return { name, role, voice, portrait: (e: Expression) => pic(e === 'thinking' ? 'thinking' : e === 'curious' ? 'curious' : 'smile') };
}

// ------------------------------------------------------------------ the cast sheet

export function showEcoCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Ecosystem Building Tycoon: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) =>
    page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));
  const person = (l: Look16, name: string, role: string) =>
    card([cvs(paintHero(l, 1.5, 'down'), Z), cvs(paintHero(l, 1.5, 'right'), Z), cvs(paintPortrait16(l, 'smile'), 2, 'pframe new'), cvs(paintPortrait16(l, 'thinking'), 2, 'pframe new')], name, role);

  block(
    '1. The people (the names you kept)',
    'Warden Nia Achieng runs the island ranger station and gives each run its targets. Lupe Fonoti is the plant scientist (the meadow and the woods). Theo Park studies ponds and wetlands. Ranger Tala visits from the field camp.',
    person(NIA_ACHIENG, 'Warden Nia Achieng', 'Island warden, your guide'),
    person(LUPE_FONOTI, 'Lupe Fonoti', 'Botanist (plant scientist)'),
    person(THEO_PARK, 'Theo Park', 'Pond and wetland scientist'),
    person(RANGER_TALA, 'Ranger Tala', 'Wild Lands ranger, visiting'),
  );
  block(
    '2. Bramble the hedgehog',
    'Bramble follows you round the islands, sniffs out good spots and cheers when a combo goes off. Hedgehogs really do eat beetles, worms and snails.',
    card(
      [0, 1, 2, 3].map((f) => cvs(paintBramble(T, f), Z)),
      'Walking',
      'Four frames',
    ),
    card([cvs(paintBramblePortrait(true), 2, 'pframe new'), cvs(paintBramblePortrait(false), 2, 'pframe new')], 'In the talk box', 'Happy and thinking'),
  );
  const grounds: Array<[Ground, string]> = [
    ['grass', 'Grass: most plants and animals'],
    ['soil', 'Bare soil: plants grow slowly'],
    ['rich', 'Rich soil: made by decomposers, plants grow fast'],
    ['mud', 'Mud: the pond edge'],
    ['sand', 'Sand: the beach'],
    ['rock', 'Rock: nothing grows until moss and lichen come'],
    ['water', 'Water: pond pieces only'],
  ];
  block(
    '3. The ground tiles',
    'Square tiles at the world’s 45° view. Tiles at the front of the island show a darker edge, so the island looks like a raised piece of land. Decomposers turn soil into rich soil.',
    ...grounds.map(([g, note]) => card([cvs(paintGround(T, g, 1, 8), Z), cvs(paintGround(T, g, 2, 0), Z)], g[0].toUpperCase() + g.slice(1), note)),
  );
  const roles: Role[] = ['producer', 'herbivore', 'omnivore', 'carnivore', 'decomposer', 'feature', 'invasive'];
  for (const role of roles) {
    const ids = PIECE_IDS.filter((id) => PIECES[id].role === role);
    const sw = h('span', { class: 'eco-swatch' });
    sw.style.background = ROLE_COLOR[role];
    page.append(
      h(
        'section',
        { class: 'block' },
        h('h2', {}, sw, h('span', { text: `4. ${ROLE_NAME[role]}` })),
        h('div', { class: 'portraits' }, ...ids.map((id) => card([cvs(paintPiece(id, T, 0), Z), cvs(paintPiece(id, T, 1), Z)], PIECES[id].name, PIECES[id].water ? 'Goes on water' : 'Goes on land'))),
      ),
    );
  }
  block(
    '5. The cards and the props',
    'Each season you draw three cards and place them. The band on top shows the role: green producer, yellow plant-eater, orange eats both, red meat-eater, purple decomposer. A chosen card gets a gold edge.',
    card(
      (['grass', 'rabbit', 'fox', 'mushrooms', 'duck'] as PieceId[]).map((id, i) => cvs(paintCard(T, id, i === 2), 2)),
      'Cards',
      'Grass, rabbit, fox (chosen), mushrooms, duck',
    ),
    card([cvs(paintBoat(T), Z)], 'The ranger boat', 'Takes you from island to island'),
    card([cvs(paintGlowMushrooms(T), Z), cvs(paintFirefly(5), Z)], 'Night lights', 'Glowing mushrooms and a firefly'),
  );
  addStyles();
}

// ------------------------------------------------------------------ the island board

/** The island as letters: . sea, s sand, g grass, r rich soil, o bare soil, m mud, w pond water, k rock. */
const MAP = ['...sssss....', '..sggggggs..', '.sgggrgmwws.', '.sggggmwwwgs', 'skggogggmwgs', '.sgggggrggs.', '..sssggsss..'];
const LETTER: Record<string, Ground> = { s: 'sand', g: 'grass', r: 'rich', o: 'soil', m: 'mud', w: 'water', k: 'rock' };

/** What has been placed so far this run. */
const PLACED: Array<[number, number, PieceId]> = [
  [3, 1, 'oak'],
  [4, 1, 'flowers'],
  [5, 1, 'bee'],
  [7, 1, 'berries'],
  [2, 2, 'grass'],
  [3, 2, 'rabbit'],
  [4, 2, 'fox'],
  [5, 2, 'mushrooms'],
  [6, 2, 'log'],
  [8, 2, 'lilies'],
  [9, 2, 'reeds'],
  [2, 3, 'grass'],
  [3, 3, 'mouse'],
  [5, 3, 'butterfly'],
  [6, 3, 'snail'],
  [8, 3, 'fish'],
  [9, 3, 'frog'],
  [2, 4, 'stones'],
  [3, 4, 'vine'],
  [6, 4, 'worms'],
  [9, 4, 'duck'],
  [10, 4, 'heron'],
  [3, 5, 'hawk'],
  [7, 5, 'leaves'],
];

/** Combo arrows (energy moves from the first to the second) and their popups. */
const COMBOS: Array<{ from: [number, number]; to: [number, number]; label: string; good: boolean; at: [number, number]; big?: boolean }> = [
  { from: [2, 2], to: [3, 2], label: '+3', good: true, at: [2.5, 2.05] },
  { from: [3, 2], to: [4, 2], label: 'Food chain! Grass, rabbit, fox +9', good: true, at: [4.4, 0.8], big: true },
  { from: [6, 2], to: [5, 2], label: 'Circle of life +4', good: true, at: [6, 2.0] },
  { from: [5, 1], to: [4, 1], label: 'Pollination +3', good: true, at: [6.5, 1.6] },
  { from: [3, 4], to: [2, 3], label: 'Vine shades the grass -2', good: false, at: [1.6, 5.15] },
];

const W = 480;
const H = 270;
const OX = 18;
const OY = 34;

function tileAt(c: number, r: number): string {
  return MAP[r]?.[c] ?? '.';
}

function paintIsland(frame: number, night: boolean): PixelBuffer {
  const b = new PixelBuffer(W, H);
  // the sea, paler in the shallows next to the island
  const land = (x: number, y: number) => {
    for (const [dx, dy] of [
      [0, 0],
      [-10, 0],
      [10, 0],
      [0, -10],
      [0, 14],
    ])
      if (tileAt(Math.floor((x + dx - OX) / T), Math.floor((y + dy - OY) / T)) !== '.') return true;
    return false;
  };
  b.blit(paintSea(W, H, frame, land), 0, 0);
  // the island, back row first, with a front edge where the sea is below
  for (let r = 0; r < MAP.length; r++)
    for (let c = 0; c < MAP[r].length; c++) {
      const k = tileAt(c, r);
      if (k === '.') continue;
      const front = tileAt(c, r + 1) === '.';
      b.blit(paintGround(T, LETTER[k], c * 13 + r * 7, front ? 8 : 0, frame), OX + c * T, OY + r * T);
    }
  // the boat at the dock and the warden
  b.blit(paintBoat(T), OX + 9 * T, OY + 6 * T + 4);
  // the pieces, row by row so nearer ones overlap farther ones
  const sprites: Array<{ r: number; draw: () => void }> = [];
  for (const [c, r, id] of PLACED) {
    sprites.push({
      r,
      draw: () => {
        const s = paintPiece(id, T, frame % 2);
        b.blit(s, Math.round(OX + c * T + T / 2 - s.w / 2), Math.round(OY + r * T + T * 0.8 - s.h));
      },
    });
  }
  const nia = paintHero(NIA_ACHIENG, 1.5, 'right');
  sprites.push({ r: 6, draw: () => b.blit(nia, OX + 6 * T + 4, OY + 6 * T + 18 - nia.h) });
  const bram = paintBramble(T, frame % 4);
  sprites.push({ r: 5, draw: () => b.blit(bram, OX + 4 * T + 2, OY + 5 * T + 20 - bram.h) });
  sprites.sort((a, z) => a.r - z.r).forEach((s) => s.draw());
  // a highlight on the empty tile the chosen card would go on
  const hc = 4;
  const hr = 3;
  for (let i = 0; i < T; i++)
    for (const [x, y] of [
      [i, 0],
      [i, T - 1],
      [0, i],
      [T - 1, i],
    ])
      if ((i + frame) % 4 < 3) b.set(OX + hc * T + x, OY + hr * T + y, '#ffe27a');
  // combo arrows
  for (const k of COMBOS) arrow(b, k.from, k.to, k.good ? '#ffe27a' : '#ff6a8a', frame);
  if (night) nightTime(b, frame);
  return b;
}

function centre([c, r]: [number, number]): [number, number] {
  return [OX + c * T + T / 2, OY + r * T + T / 2];
}

/** A dotted arrow from one tile to the next, with a dark outline so it reads on any ground. */
function arrow(b: PixelBuffer, from: [number, number], to: [number, number], color: string, frame: number): void {
  const [x1, y1] = centre(from);
  const [x2, y2] = centre(to);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const dx = (x2 - x1) / len;
  const dy = (y2 - y1) / len;
  const dot = (x: number, y: number, c: string) => {
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) b.set(Math.round(x) + ox, Math.round(y) + oy, '#2a1a10');
    b.set(Math.round(x), Math.round(y), c);
    b.set(Math.round(x) + 1, Math.round(y), c);
  };
  for (let t = 6 + (frame % 3); t < len - 8; t += 3) dot(x1 + dx * t, y1 + dy * t, color);
  // the arrow head
  const hx = x2 - dx * 6;
  const hy = y2 - dy * 6;
  for (let s = 0; s < 5; s++) {
    dot(hx - dx * s - dy * s * 0.8, hy - dy * s + dx * s * 0.8, color);
    dot(hx - dx * s + dy * s * 0.8, hy - dy * s - dx * s * 0.8, color);
  }
}

/** Night: everything turns a deep blue, then the living lights come out. */
function nightTime(b: PixelBuffer, frame: number): void {
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      const c = b.get(x, y);
      if (c) b.set(x, y, mixHex(c, '#141a44', 0.58));
    }
  const glow = paintGlowMushrooms(T);
  b.blit(glow, OX + 5 * T + 4, OY + 2 * T + 6);
  b.blit(glow, OX + 7 * T, OY + 4 * T + 4);
  b.blit(glow, OX + 2 * T, OY + 5 * T + 2);
  const fly = paintFirefly(4);
  for (let i = 0; i < 14; i++) {
    const x = OX + ((i * 53 + frame * (i % 3 ? 2 : -2)) % (11 * T));
    const y = OY + 4 + ((i * 37 + Math.round(Math.sin(frame * 0.5 + i) * 4)) % (6 * T));
    if ((i + frame) % 5) b.blit(fly, x, y);
  }
}

export function showEcoIsland(host: HTMLElement, q: URLSearchParams): void {
  addStyles();
  const night = q.get('time') === 'night';
  const long = q.get('run') === 'long';
  const stage = h('div', { class: 'eco-stage' });
  const canvas = document.createElement('canvas');
  canvas.className = 'px eco-board';
  canvas.width = W;
  canvas.height = H;
  const boardBox = h('div', { class: 'eco-boardbox' });
  boardBox.append(canvas);
  stage.append(boardBox);
  host.append(stage);
  const ctx = canvas.getContext('2d')!;

  // the HUD: run, island and season; the health meter and its target
  const runLabel = long ? 'Long run · Island 3 of 5' : 'Short run · Island 2 of 3';
  const health = 34;
  const target = 40;
  const meter = h('div', { class: 'eco-meter' }, h('div', { class: 'eco-fill' }), h('div', { class: 'eco-mark' }));
  (meter.firstChild as HTMLElement).style.width = `${(health / 50) * 100}%`;
  (meter.lastChild as HTMLElement).style.left = `${(target / 50) * 100}%`;
  stage.append(
    h(
      'div',
      { class: 'eco-hud kit-panel' },
      h('div', { class: 'eco-run', text: runLabel }),
      h('div', { class: 'eco-season', text: night ? 'Summer night · Season 3 of 4' : 'Summer · Season 3 of 4' }),
      h('div', { class: 'eco-health' }, h('span', { text: `Island health ${health}` }), h('span', { class: 'eco-target', text: `Target ${target}` })),
      meter,
      h('div', { class: 'eco-note', text: 'Field Notebook: 2 decomposers (+5)' }),
    ),
  );
  // the hand of three cards
  const hand: PieceId[] = ['deer', 'owl', 'beetle'];
  const handEl = h('div', { class: 'eco-hand' });
  hand.forEach((id, i) => {
    const el = h('button', { class: `eco-card${i === 1 ? ' on' : ''}` });
    const img = cvs(paintCard(T, id, i === 1), 2);
    el.append(img, h('strong', { text: PIECES[id].name }), h('span', { text: ROLE_NAME[PIECES[id].role].split(' (')[0] }));
    handEl.append(el);
  });
  handEl.append(h('button', { class: 'eco-reroll', text: 'New cards (2 left)' }));
  stage.append(handEl);
  // combo popups over the arrows
  const pops = COMBOS.map((k) => {
    const el = h('div', { class: `eco-pop${k.good ? '' : ' bad'}${k.big ? ' big' : ''}`, text: k.label });
    boardBox.append(el);
    return { el, k };
  });

  let frame = 0;
  let scale = 1;
  const fit = () => {
    const tall = innerWidth < W * 2 && innerHeight > innerWidth;
    stage.classList.toggle('tall', tall);
    scale = tall ? innerWidth / W : Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H)));
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    stage.style.width = `${W * scale}px`;
    stage.style.height = tall ? '' : `${H * scale}px`;
    stage.style.setProperty('--s', String(scale));
    for (const { el, k } of pops) {
      el.style.left = `${(OX + k.at[0] * T) * scale}px`;
      el.style.top = `${(OY + k.at[1] * T) * scale}px`;
    }
  };
  fit();
  addEventListener('resize', fit);
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    paintIsland(frame, night).drawTo(ctx, 0, 0, 1);
  };
  draw();
  setInterval(() => {
    frame++;
    draw();
  }, 260);

  if (q.get('nia') === '1')
    void new Talk(host).say(
      speaker('Warden Nia', 'Island warden', NIA_ACHIENG, 190),
      night
        ? 'At night the owls and the fireflies come out. An owl hunts mice, so put it where the mice are.'
        : 'Nice food chain! The grass gets its energy from the Sun, the rabbit eats the grass, and the fox eats the rabbit. The arrows show where the energy goes.',
      'smile',
    );
}

// ------------------------------------------------------------------ styles (lookdev only)

let styled = false;
function addStyles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .eco-swatch { display:inline-block; width:16px; height:16px; margin-right:10px; border:2px solid #000; vertical-align:-2px; }
  .eco-stage { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); }
  .eco-board { position:absolute; inset:0; }
  .eco-boardbox { position:absolute; inset:0; }
  .eco-stage.tall { top:0; transform:translateX(-50%); display:flex; flex-direction:column; gap:8px; padding:8px 0; --s:2.2; }
  .eco-stage.tall .eco-boardbox { position:relative; order:1; width:100%; aspect-ratio:${W} / ${H}; }
  .eco-stage.tall .eco-hud { position:static; order:0; width:auto; margin:0 8px; font-size:15px; }
  .eco-stage.tall .eco-hand { position:static; order:2; justify-content:center; flex-wrap:wrap; }
  .eco-stage.tall .eco-card { width:84px; font-size:13px; }
  .eco-stage.tall .eco-reroll { width:auto; font-size:14px; }
  .eco-stage.tall .eco-pop { font-size:10px; padding:1px 4px; }
  .eco-hud { position:absolute; top:calc(var(--s) * 4px); right:calc(var(--s) * 4px); width:calc(var(--s) * 132px); padding:10px 12px; font-family:var(--font-read); color:#3a2414;
    background:#f6ecd0; border:3px solid #5a3a24; border-radius:8px; box-shadow:0 3px 0 #2a1a10; font-size:calc(var(--s) * 5.6px); line-height:1.3; }
  .eco-run { font-family:var(--font-pixel); font-weight:600; font-size:1.15em; }
  .eco-health { display:flex; justify-content:space-between; margin-top:6px; font-weight:700; }
  .eco-target { color:#7a4a1a; }
  .eco-meter { position:relative; height:14px; margin:4px 0 6px; background:#d8c8a0; border:2px solid #5a3a24; border-radius:7px; overflow:hidden; }
  .eco-fill { position:absolute; inset:0 auto 0 0; background:linear-gradient(#7ad86a,#3fae5a); }
  .eco-mark { position:absolute; top:-2px; bottom:-2px; width:3px; background:#3a2414; }
  .eco-note { font-size:.9em; color:#5a3a24; }
  .eco-hand { position:absolute; right:calc(var(--s) * 4px); bottom:calc(var(--s) * 4px); display:flex; gap:8px; align-items:flex-end; }
  .eco-card { display:flex; flex-direction:column; align-items:center; gap:2px; padding:4px 4px 6px; background:#3a2a1e; border:2px solid #5a3a24; border-radius:8px; color:#f6ecd0;
    font-family:var(--font-read); font-size:calc(var(--s) * 4.4px); cursor:pointer; width:calc(var(--s) * 34px); }
  .eco-card canvas { width:100%; height:auto; }
  .eco-card strong { font-family:var(--font-pixel); font-weight:600; font-size:1.15em; }
  .eco-card span { opacity:.85; text-align:center; }
  .eco-card.on { transform:translateY(-10px); border-color:#ffe27a; box-shadow:0 0 0 2px #ffe27a; }
  .eco-reroll { align-self:center; padding:8px 10px; font-family:var(--font-pixel); font-size:calc(var(--s) * 4.6px); background:#f6ecd0; color:#3a2414; border:3px solid #5a3a24; border-radius:8px; box-shadow:0 3px 0 #2a1a10; width:calc(var(--s) * 26px); }
  .eco-pop { position:absolute; transform:translate(-50%,-100%); white-space:nowrap; padding:3px 8px; font-family:var(--font-pixel); font-weight:600; font-size:calc(var(--s) * 4.4px);
    color:#3a2414; background:#ffe27a; border:2px solid #3a2414; border-radius:6px; animation:eco-bob 1.6s ease-in-out infinite; pointer-events:none; }
  .eco-pop.bad { background:#ffb0c0; }
  .eco-pop.big { font-size:calc(var(--s) * 6px); padding:5px 12px; background:#fff3a8; box-shadow:0 0 0 3px #ffe27a, 0 4px 0 #3a2414; }
  @keyframes eco-bob { 50% { margin-top:-4px; } }
  `;
  document.head.append(h('style', { text: css }));
}
