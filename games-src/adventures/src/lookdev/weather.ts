import { PixelBuffer } from '../kit/art/pixel';
import { Cell, EASY, follow, newBody, NORMAL, parseLevel, placeAt, step, type Body, type Camera, type Controls, type Level, type Platform, type Tuning } from '../kit/scroller/physics';
import { h } from '../kit/ui/dom';
import { paintHero, paintPortrait16, type Look16, type Mood } from '../kit/worlds/hero16';
import { paintFern, paintPalm, paintRainTree, RANGER_TALA } from '../kit/worlds/wild-lands/art';
import {
  APPRENTICE,
  DRIP_FORM_NAME,
  IRIS_OKORO,
  NIMBUS,
  paintBackdrop,
  paintBolt,
  paintCloud,
  paintCoconut,
  paintCrab,
  paintDrip,
  paintDroplet,
  paintFlag,
  paintGust,
  paintHouse,
  paintIceBlock,
  paintLighthouse,
  paintPine,
  paintPowerIcon,
  paintRaft,
  paintRain,
  paintStormCloud,
  paintThermometer,
  paintTidePool,
  paintTile,
  paintVane,
  paintWaterfall,
  paintWizard,
  POWER_COLOR,
  POWER_NAME,
  REGION_NAME,
  REGION_STAGE,
  REGIONS,
  VILLAGERS,
  type Backdrop,
  type DripForm,
  type Power,
  type Region,
  type TileKind,
  type WizardPose,
} from '../kit/worlds/wild-lands/weather-art';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Weather Wizard Battle, the first side-scroller (the
 * "S2 Earth: Weather Wizard Battle" section of docs/GAMES_3D_UPGRADE_PLAN.md):
 *   #weather-cast        the cast, Drip's five forms, the powers, props and tiles
 *   #weather-<region>    shore, clouds, mountain, river, storm (add -storm for the storm sky)
 *   #weather-play        a short playable test level, to try the running and jumping
 * Not shipped: dev server only.
 */

const T = 24;
const VW = 480;
const VH = 270;
const VIEW_W = VW / T;
const VIEW_H = VH / T;

function cvs(b: PixelBuffer, scale: number, cls = ''): HTMLCanvasElement {
  const c = b.toCanvas(scale);
  c.className = `px ${cls}`;
  return c;
}

function card(art: HTMLElement[], title: string, note: string): HTMLElement {
  return h('figure', { class: 'card' }, h('div', { class: 'sprites' }, ...art), h('figcaption', {}, h('strong', { text: title }), h('span', { text: note })));
}

// ------------------------------------------------------------------ the cast sheet

export function showWeatherCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Weather Wizard Battle: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) =>
    page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));
  const portrait = (l: Look16, m: Mood) => cvs(paintPortrait16(l, m), 2, 'pframe new');
  const wiz = (l: Look16, pose: WizardPose, o: { frame?: number; hat?: 'tall' | 'small'; power?: Power } = {}) => cvs(paintWizard(l, T, 'right', { pose, ...o }), Z);

  block(
    '1. The people (the names you kept)',
    'Professor Nimbus is a make-believe weather wizard: each "spell" is really nature at work (the Sun’s heat, cooling air, the wind). Dr. Iris Okoro is a meteorologist, the real job: measuring and forecasting the weather. Ranger Tala visits from the field camp.',
    card(
      [wiz(NIMBUS, 'stand', { hat: 'tall' }), wiz(NIMBUS, 'cast', { hat: 'tall', power: 'sun' }), portrait(NIMBUS, 'smile'), portrait(NIMBUS, 'curious')],
      'Professor Nimbus',
      'Weather wizard (make-believe), teaches the powers',
    ),
    card(
      [cvs(paintHero(IRIS_OKORO, 1.5, 'down'), Z), cvs(paintHero(IRIS_OKORO, 1.5, 'right'), Z), portrait(IRIS_OKORO, 'smile'), portrait(IRIS_OKORO, 'thinking')],
      'Dr. Iris Okoro',
      'Meteorologist at the weather station',
    ),
    card([cvs(paintHero(RANGER_TALA, 1.5, 'down'), Z), portrait(RANGER_TALA, 'smile')], 'Ranger Tala', 'Wild Lands ranger, visiting'),
    card(
      VILLAGERS.map((l) => cvs(paintHero(l, 1.5, 'down'), Z)),
      'Villagers',
      'They ask for weather (the village requests)',
    ),
  );
  block(
    '2. You: a young weather wizard',
    'Professor Nimbus’s apprentice, with a small hat and a staff. Running, jumping, falling, and casting each power (the staff glows in the power’s color).',
    card([wiz(APPRENTICE, 'stand'), ...[0, 1, 2, 3].map((f) => wiz(APPRENTICE, 'run', { frame: f }))], 'Standing and running', ''),
    card([wiz(APPRENTICE, 'jump'), wiz(APPRENTICE, 'fall')], 'Jumping and falling', ''),
    card(
      (['sun', 'cool', 'wind', 'cold', 'rain'] as Power[]).map((p) => wiz(APPRENTICE, 'cast', { power: p })),
      'Casting',
      'Sun, cool air, wind, cold, rain',
    ),
  );
  block(
    '3. Drip the droplet, round the water cycle',
    'Drip changes with each stage. Water vapor is invisible, so as vapor Drip is only a shimmer and two eyes. A cloud is made of tiny drops, so Drip becomes one of them.',
    ...(['drop', 'vapor', 'cloud', 'snow', 'river'] as DripForm[]).map((f) =>
      card(
        [0, 1, 2, 3].map((fr) => cvs(paintDrip(T, f, fr, fr === 3), Z)),
        DRIP_FORM_NAME[f],
        'Rest, landing, jumping, bobbing',
      ),
    ),
  );
  const iconRow = (['sun', 'cool', 'wind', 'cold', 'rain'] as Power[]).map((p) => card([cvs(paintPowerIcon(T, p), Z)], POWER_NAME[p], POWER_RULE[p]));
  block('4. The weather powers', 'Each power only works where it really would. A thermometer and the clouds on screen show why.', ...iconRow);
  block(
    '5. What the powers do',
    'The Sun warms a tide pool and the water rises as invisible vapor (the shimmer). Cool air turns vapor into a cloud you can stand on. Wind pushes the cloud. Cold freezes water into ice, but only below 0 °C. Rain falls only from a full, grey cloud.',
    card([cvs(paintTidePool(T, 2, false), Z), cvs(paintTidePool(T, 2, true, 0), Z), cvs(paintTidePool(T, 2, true, 2), Z)], 'A tide pool', 'Cool, then warmed by the Sun'),
    card([cvs(paintCloud(T, 3, 'cumulus'), 2), cvs(paintCloud(T, 3, 'grey'), 2)], 'Clouds to stand on', 'White and puffy; grey and full (can rain)'),
    card(
      [0, 2, 4].map((f) => cvs(paintGust(T, 3, f), 2)),
      'A gust of wind',
      '',
    ),
    card(
      [cvs(paintTile(T, 'mountain', 'water', 0, 0), Z), cvs(paintTile(T, 'mountain', 'ice', 0), Z), cvs(paintIceBlock(T, 2, 0), Z), cvs(paintIceBlock(T, 2, 0.5), Z)],
      'Water, ice and an ice wall',
      'The Sun melts the wall',
    ),
    card([cvs(paintWaterfall(T, 3, 0), 2), cvs(paintWaterfall(T, 3, 0, true), 2)], 'A waterfall', 'Flowing, and frozen into a ladder'),
    card([cvs(paintThermometer(T, 26), Z), cvs(paintThermometer(T, 5), Z), cvs(paintThermometer(T, -5), Z)], 'The thermometer', '26 °C, 5 °C (rain), −5 °C (snow); the line is 0 °C'),
    card([cvs(paintRain(72, 60, 0), 2), cvs(paintRain(72, 60, 0, true), 2)], 'Rain and snow', ''),
  );
  block(
    '6. The storm (the finale)',
    'A tall, dark cumulonimbus with a flat anvil top. It stays a cloud, not a monster: storms are weather. Lightning is a giant spark; thunder is its sound.',
    card([cvs(paintStormCloud(T, 0), 1), cvs(paintStormCloud(T, 2, true), 1)], 'The storm cloud', 'And lit by a flash'),
    card([cvs(paintBolt(90, 1), 2), cvs(paintBolt(90, 4), 2)], 'Lightning', ''),
    card([cvs(paintLighthouse(T, false), 2), cvs(paintLighthouse(T, true), 2)], 'The lighthouse', 'On the point by the village'),
    card([cvs(paintHouse(T, 0), 2), cvs(paintHouse(T, 1, true), 2)], 'Village houses', 'Safe indoors when thunder roars'),
  );
  block(
    '7. Props along the way',
    'Things to collect, dodge and ride.',
    card(
      [0, 1, 2, 3].map((f) => cvs(paintDroplet(T, f), Z)),
      'Droplets',
      'Collect them; a fall drops a few to collect again',
    ),
    card([cvs(paintVane(T, false), Z), cvs(paintVane(T, true, 0), Z), cvs(paintVane(T, true, 2), Z)], 'A weather vane: the checkpoint', 'It spins when you touch it'),
    card([cvs(paintFlag(T, 0), Z)], 'The finish flag', ''),
    card([cvs(paintCrab(T, 0), Z), cvs(paintCrab(T, 1), Z), cvs(paintCoconut(T, 0), Z), cvs(paintCoconut(T, 2), Z)], 'A crab and a coconut', 'To jump over (they only bump you)'),
    card([cvs(paintPalm(T, 0), 2), cvs(paintPine(T, false, 0), 2), cvs(paintPine(T, true, 1), 2)], 'Palm and pines', 'The pines get snow up the mountain'),
    card([cvs(paintRaft(T), 2)], 'The river raft', 'For River Run'),
  );
  block(
    '8. The ground in each region',
    'Top, inside, a ledge to jump up through, water and ice.',
    ...REGIONS.map((r) =>
      card(
        (['top', 'fill', 'ledge', 'waterTop', 'ice'] as TileKind[]).map((k) => cvs(paintTile(T, r, k, 1), Z)),
        REGION_NAME[r],
        REGION_STAGE[r],
      ),
    ),
  );
}

const POWER_RULE: Record<Power, string> = {
  sun: 'Warms water so it evaporates; melts ice',
  cool: 'Cools water vapor into a cloud',
  wind: 'Pushes clouds',
  cold: 'Freezes water, below 0 °C only',
  rain: 'Only from a full, grey cloud',
};

// ------------------------------------------------------------------ drawing a side-on scene

/** Canvases cached by key, so each tile and sprite is painted once. */
const cache = new Map<string, HTMLCanvasElement>();
function cached(key: string, make: () => PixelBuffer): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) cache.set(key, (c = make().toCanvas(1)));
  return c;
}

interface Scene {
  level: Level;
  regionAt: (x: number) => Region;
  backdrops: Partial<Record<Region, Backdrop>>;
  storm: boolean;
}

function backdropFor(s: Scene, r: Region): Record<'sky' | 'far' | 'near', HTMLCanvasElement> {
  const key = `bd-${r}-${s.storm}`;
  const b = (s.backdrops[r] ??= paintBackdrop(r, VW, VH, s.storm));
  return { sky: cached(`${key}-sky`, () => b.sky), far: cached(`${key}-far`, () => b.far), near: cached(`${key}-near`, () => b.near) };
}

function drawBackdrop(ctx: CanvasRenderingContext2D, s: Scene, r: Region, cam: Camera, alpha = 1): void {
  const bd = backdropFor(s, r);
  ctx.globalAlpha = alpha;
  ctx.drawImage(bd.sky, 0, 0);
  for (const [layer, k] of [
    [bd.far, 0.2],
    [bd.near, 0.45],
  ] as const) {
    const off = Math.floor((cam.x * T * k) % VW);
    const dy = Math.round(-cam.y * T * k * 0.3);
    ctx.drawImage(layer, -off, dy);
    ctx.drawImage(layer, VW - off, dy);
  }
  ctx.globalAlpha = 1;
}

function drawTiles(ctx: CanvasRenderingContext2D, s: Scene, cam: Camera, frame: number): void {
  const map = s.level.map;
  const x0 = Math.floor(cam.x);
  const y0 = Math.floor(cam.y);
  for (let y = y0; y <= y0 + Math.ceil(VIEW_H) + 1; y++)
    for (let x = x0; x <= x0 + VIEW_W + 1; x++) {
      if (x < 0 || x >= map.w || y < 0 || y >= map.h) continue;
      const c = map.get(x, y);
      if (c === Cell.Air) continue;
      const r = s.regionAt(x);
      const above = map.get(x, y - 1);
      let kind: TileKind;
      if (c === Cell.Solid) kind = above === Cell.Solid || above === Cell.Ice ? 'fill' : 'top';
      else if (c === Cell.Ledge) kind = 'ledge';
      else if (c === Cell.Water) kind = above === Cell.Water ? 'water' : 'waterTop';
      else kind = 'ice';
      const anim = kind === 'water' || kind === 'waterTop' ? Math.floor(frame / 8) % 4 : 0;
      const img = cached(`t-${r}-${kind}-${x % 4}-${anim}`, () => paintTile(T, r, kind, x % 4, anim));
      ctx.drawImage(img, Math.round((x - cam.x) * T), Math.round((y - cam.y) * T));
    }
}

/** Draw a sprite with its bottom middle at (x, y) in tiles. */
function drawAt(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, cam: Camera): void {
  ctx.drawImage(img, Math.round((x - cam.x) * T - img.width / 2), Math.round((y - cam.y) * T - img.height));
}

// ------------------------------------------------------------------ the region views

const REGION_LEVELS: Record<Region, string[]> = {
  shore: [
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '...................====.................',
    '.............###........................',
    '.............###........................',
    '###########################~~~~~~~######',
    '###########################~~~~~~~######',
  ],
  clouds: [
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................====............',
    '........................................',
    '...............====.....................',
    '##########.............................#',
    '##########.............................#',
    '###########............................#',
    '###########............................#',
  ],
  mountain: [
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '.......................................#',
    '..........................#####........#',
    '..........................#####.......##',
    '...................###....#####.......##',
    '...............######.....#####.......##',
    '...............######.....#####.......##',
    '###############IIIIII#####~~~~~~#########',
    '###############IIIIII#####~~~~~~#########',
  ],
  river: [
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '.....................................###',
    '#####................................###',
    '#####~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###',
    '#####~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###',
    '########################################',
  ],
  storm: [
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '........................................',
    '####################################~~~~',
    '####################################~~~~',
  ],
};

export function showWeatherRegion(host: HTMLElement, q: URLSearchParams): void {
  const region = (q.get('area') ?? 'shore') as Region;
  const storm = q.get('time') === 'storm' || region === 'storm';
  const level = parseLevel(REGION_LEVELS[region] ?? REGION_LEVELS.shore);
  const scene: Scene = { level, regionAt: () => region, backdrops: {}, storm };
  const { canvas, ctx, box } = stage(host, `${REGION_NAME[region]}: ${REGION_STAGE[region].toLowerCase()}${storm && region !== 'storm' ? ' (storm sky)' : ''}`);
  const cam: Camera = { x: 6, y: level.map.h - VIEW_H };
  let frame = 0;
  const draw = () => {
    frame++;
    drawBackdrop(ctx, scene, region, cam);
    drawTiles(ctx, scene, cam, frame);
    const f = Math.floor(frame / 8);
    const put = (key: string, make: () => PixelBuffer, x: number, y: number) => drawAt(ctx, cached(key, make), x, y, cam);
    const wizard = (pose: WizardPose, power: Power | undefined, x: number, y: number, look = APPRENTICE, hat: 'tall' | 'small' = 'small', face: 'left' | 'right' = 'right') =>
      put(`w-${look === NIMBUS ? 'n' : 'a'}-${pose}-${power}-${face}-${pose === 'cast' ? f % 4 : 0}`, () => paintWizard(look, T, face, { pose, power, hat, frame: f % 4 }), x, y);
    const drip = (form: DripForm, x: number, y: number) => put(`d-${form}-${f % 4}`, () => paintDrip(T, form, f % 4 === 3 ? 3 : 0, false), x, y);
    if (region === 'shore') {
      put('palm0', () => paintPalm(T, 0), 8, 10);
      put('palm1', () => paintPalm(T, 1), 30.5, 10);
      put('vane', () => paintVane(T, true, f), 10, 10);
      put(`pool-${f % 4}`, () => paintTidePool(T, 2, true, f % 4), 17, 10);
      put('pool2', () => paintTidePool(T, 2, false), 24, 10);
      put(`crab-${f % 2}`, () => paintCrab(T, f % 2), 22 + Math.sin(frame / 40) * 1.5, 10);
      put(`coco-${f % 4}`, () => paintCoconut(T, f % 4), 15, 8);
      for (const x of [20, 21, 22]) put(`drop-${(f + x) % 4}`, () => paintDroplet(T, (f + x) % 4), x + 0.5, 7);
      put('nimbus', () => paintWizard(NIMBUS, T, 'right', { hat: 'tall' }), 11.6, 10);
      wizard('cast', 'sun', 14.4, 10);
      drip('drop', 13.2, 8.6);
      put('cloud-s', () => paintCloud(T, 3, 'cumulus'), 29.5, 6);
    } else if (region === 'clouds') {
      put('cloudA', () => paintCloud(T, 3, 'cumulus'), 13, 6.6);
      put('cloudB', () => paintCloud(T, 4, 'grey'), 21, 9.8);
      put(`rain-${f % 8}`, () => paintRain(4 * T, 3 * T, f % 8), 21, 12.8);
      put(`gust-${f % 6}`, () => paintGust(T, 3, f % 6), 13, 5.4);
      put('cloudC', () => paintCloud(T, 3, 'cumulus'), 31, 8.4);
      for (const x of [16, 17, 25, 26]) put(`drop-${(f + x) % 4}`, () => paintDroplet(T, (f + x) % 4), x + 0.5, x < 20 ? 6.4 : 4.4);
      put('vane', () => paintVane(T, false), 7, 8);
      wizard('cast', 'wind', 9, 8);
      wizard('jump', undefined, 17.5, 5.6);
      drip('cloud', 15.8, 4.6);
    } else if (region === 'mountain') {
      put('pine0', () => paintPine(T, true, 0), 8, 10);
      put('pine1', () => paintPine(T, true, 1), 12, 10);
      put('pine2', () => paintPine(T, true, 0), 29, 5);
      put('fall', () => paintWaterfall(T, 5, 0, true), 38.5, 9);
      put(`fallw-${f % 4}`, () => paintWaterfall(T, 4, f, false), 34.5, 10);
      put('iceblock', () => paintIceBlock(T, 2, 0), 33.5, 10);
      put(`snow-${f % 16}`, () => paintRain(VW, VH, f % 16, true), cam.x + VIEW_W / 2, cam.y + VIEW_H);
      put('iris', () => paintHero(IRIS_OKORO, 1.5, 'right'), 10.4, 10);
      wizard('cast', 'cold', 13.4, 10);
      drip('snow', 15, 8.4);
      put('vane', () => paintVane(T, true, 1), 18.5, 8);
    } else if (region === 'river') {
      put('tree0', () => paintRainTree(T, 0), 2.5, 8);
      put('fern0', () => paintFern(T, 1), 4, 8);
      put('tree1', () => paintRainTree(T, 1), 38.6, 7);
      put(`fallw-${f % 4}`, () => paintWaterfall(T, 3, f, false), 37.5, 10);
      const rx = 14 + ((frame / 30) % 4);
      put('raft', () => paintRaft(T), rx, 9.5);
      wizard('stand', undefined, rx - 0.6, 9.3);
      drip('river', rx + 1, 8.1);
      for (const x of [22, 24, 26]) put(`drop-${(f + x) % 4}`, () => paintDroplet(T, (f + x) % 4), x + 0.5, 8);
      put('crabR', () => paintCoconut(T, 1), 29, 9.4);
    } else {
      put('light', () => paintLighthouse(T, true), 38, 10);
      for (const [i, x] of [8, 14, 20].entries()) put(`house-${i}`, () => paintHouse(T, i, i !== 1), x, 10);
      put(`storm-${f % 4}`, () => paintStormCloud(T, f, frame % 90 < 4), 19.5, 6.4);
      if (frame % 90 < 6) put('bolt', () => paintBolt(110, 2), 21, 10);
      put(`rain-${f % 8}`, () => paintRain(VW, VH, f % 8), cam.x + VIEW_W / 2, cam.y + VIEW_H);
      put('v0', () => paintHero(VILLAGERS[0], 1.5, 'left'), 16.6, 10);
      put('v2', () => paintHero(VILLAGERS[2], 1.5, 'left'), 17.4, 10);
      put('iris', () => paintHero(IRIS_OKORO, 1.5, 'right'), 11.4, 10);
      put('nimbus', () => paintWizard(NIMBUS, T, 'right', { hat: 'tall' }), 22.6, 10);
      wizard('cast', 'wind', 25, 10);
      drip('drop', 23.6, 8.5);
    }
    if (storm && region !== 'storm') put(`rainS-${f % 8}`, () => paintRain(VW, VH, f % 8), cam.x + VIEW_W / 2, cam.y + VIEW_H);
    requestAnimationFrame(draw);
  };
  draw();
  void canvas;
  void box;
}

/** A pixel canvas scaled to fit the window by whole numbers, with a caption. */
function stage(host: HTMLElement, caption: string): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; box: HTMLElement } {
  document.body.classList.add('lookdev');
  ensureStyle();
  const wrap = h('div', { class: 'ww-wrap' });
  host.appendChild(wrap);
  const top = h('div', { class: 'ww-top' }, h('strong', { text: caption }), pageNav(currentToken(), true));
  const box = h('div', { class: 'ww-box' });
  const canvas = document.createElement('canvas');
  canvas.width = VW;
  canvas.height = VH;
  canvas.className = 'ww-canvas';
  box.appendChild(canvas);
  wrap.append(top, box);
  const fit = () => {
    const room = Math.min(window.innerWidth / VW, (window.innerHeight - 140) / VH);
    const s = room >= 1 ? Math.floor(room) : room;
    canvas.style.width = `${VW * s}px`;
    canvas.style.height = `${VH * s}px`;
  };
  fit();
  window.addEventListener('resize', fit);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx, box };
}

let styled = false;
function ensureStyle(): void {
  if (styled) return;
  styled = true;
  const css = `
  .ww-wrap{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;background:#1d2236;color:#fff;padding:8px 12px;box-sizing:border-box;font-family:'Atkinson Hyperlegible',sans-serif;overflow:auto}
  .ww-top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center}
  .ww-top .ld-pick{color:#fff}
  .ww-box{position:relative}
  .ww-canvas{display:block;image-rendering:pixelated;border-radius:6px;touch-action:none}
  .ww-hud{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:6px 8px;font-weight:700;font-size:15px;pointer-events:none;text-shadow:0 1px 0 #000,0 0 3px #000}
  .ww-hud canvas{image-rendering:pixelated}
  .ww-hud .gap{flex:1}
  .ww-msg{position:absolute;left:50%;top:44px;transform:translateX(-50%);max-width:90%;background:rgba(255,255,255,.95);color:#1d1a30;padding:6px 12px;border-radius:10px;font-weight:700;font-size:15px;line-height:1.3;text-align:center;pointer-events:none;transition:opacity .3s}
  .ww-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;max-width:100%}
  .ww-bar button{display:flex;align-items:center;gap:6px;min-height:48px;padding:4px 12px;border-radius:12px;border:2px solid #fff3;background:#2c3352;color:#fff;font:700 15px 'Atkinson Hyperlegible',sans-serif;cursor:pointer}
  .ww-bar button:focus-visible{outline:3px solid #ffd84a;outline-offset:2px}
  .ww-bar button.on{border-color:#ffd84a;background:#3a4470}
  .ww-bar button canvas{image-rendering:pixelated}
  .ww-bar kbd{font:700 12px monospace;background:#0006;border-radius:4px;padding:1px 5px}
  .ww-pad{display:flex;gap:8px}
  .ww-pad button{min-width:64px;justify-content:center;font-size:20px}
  .ww-done{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(20,24,44,.82);color:#fff;font-weight:700;font-size:20px;text-align:center;padding:16px}
  .ww-done button{min-height:48px;padding:6px 18px;border-radius:12px;border:0;background:#ffd84a;color:#1d1a30;font:700 17px 'Atkinson Hyperlegible',sans-serif;cursor:pointer}
  .ww-help{max-width:760px;font-size:14px;line-height:1.4;color:#d8dcf0;text-align:center;margin:0}
  `;
  document.head.appendChild(h('style', { text: css }));
}

// ------------------------------------------------------------------ the playable test level

/** The test level: Sunny Shore (left) into Mountain Pass (right). */
export function buildTestLevel(): string[] {
  const W = 92;
  const H = 12;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('.'));
  const fill = (x0: number, x1: number, y0: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c;
  };
  fill(0, W - 1, 10, 11, '#');
  g[9][2] = 'P';
  g[9][4] = 'D';
  g[9][5] = 'D';
  fill(7, 9, 8, 9, '#'); // a step: jump up
  g[7][8] = 'D';
  fill(12, 14, 10, 11, '~'); // a small gap: jump over
  g[7][13] = 'D';
  g[9][17] = 'C';
  fill(19, 22, 7, 7, '='); // ledges: jump up through
  g[6][20] = 'D';
  g[6][21] = 'D';
  g[9][26] = 'K'; // a crab
  g[9][32] = 'T'; // a tide pool: Sun, then Cool air
  fill(35, 46, 10, 11, '~'); // the sea: too wide to jump; ride the cloud
  g[6][38] = 'D';
  g[6][41] = 'D';
  g[6][44] = 'D';
  g[9][48] = 'C';
  fill(52, 54, 8, 9, '#'); // Mountain Pass: up the steps
  fill(55, 58, 6, 9, '#');
  g[5][57] = 'D';
  fill(61, 70, 10, 11, '~'); // the river: freeze it with Cold
  g[9][64] = 'D';
  g[9][67] = 'D';
  g[9][72] = 'C';
  fill(75, 76, 0, 5, '#'); // a rock arch, with an ice wall under it: melt it with the Sun
  g[9][75] = 'B';
  fill(80, 83, 7, 7, '=');
  g[6][81] = 'D';
  g[6][82] = 'D';
  g[9][85] = 'K';
  g[9][89] = 'F';
  return g.map((r) => r.join(''));
}

const SHORE_END = 50;
const TEMP: Record<'shore' | 'mountain', number> = { shore: 26, mountain: -6 };

interface Pickup {
  x: number;
  y: number;
  got: boolean;
  vy?: number;
}
interface Crab {
  x: number;
  y: number;
  x0: number;
  x1: number;
  dir: number;
}
interface Fx {
  kind: Power;
  x: number;
  y: number;
  tx: number;
  ty: number;
  t: number;
}

export function showWeatherPlay(host: HTMLElement): void {
  const rows = buildTestLevel();
  const level = parseLevel(rows);
  const original = Uint8Array.from(level.map.cells);
  const scene: Scene = { level, regionAt: (x) => (x < SHORE_END ? 'shore' : 'mountain'), backdrops: {}, storm: false };
  const { canvas, ctx, box } = stage(host, 'Weather Wizard Battle: movement test');
  const things = level.things;
  const checkpoints = things.filter((t) => t.kind === 'C').map((t) => ({ x: t.x, y: t.y, lit: false }));
  const pickups: Pickup[] = things.filter((t) => t.kind === 'D').map((t) => ({ x: t.x + 0.5, y: t.y + 0.8, got: false }));
  const total = pickups.length;
  const pool = things.find((t) => t.kind === 'T')!;
  const iceT = things.find((t) => t.kind === 'B')!;
  const flag = things.find((t) => t.kind === 'F')!;
  let crabs: Crab[] = [];
  let loose: Pickup[] = [];
  let vapor = 0;
  let cloud: (Platform & { vx: number; push: number; x0: number; x1: number }) | null = null;
  const ice: Platform & { melt: number; melting: boolean } = { id: 'ice', x: iceT.x, y: iceT.y - 3, w: 2, h: 4, oneWay: false, melt: 0, melting: false };
  let fx: Fx[] = [];
  let tuning: Tuning = NORMAL;
  let easy = false;
  const b: Body = newBody(0, 0);
  let respawn = { x: level.spawn.x, y: level.spawn.y };
  let cam: Camera = { x: 0, y: 0 };
  let carried = 0;
  let castT = 0;
  let castPower: Power = 'sun';
  let bump = 0;
  let frame = 0;
  let time = 0;
  let done = false;
  let falls = 0;
  let dripX = 0;
  let dripY = 0;
  let dripSquash = 0;

  const reset = () => {
    level.map.cells.set(original);
    crabs = things.filter((t) => t.kind === 'K').map((t) => ({ x: t.x + 0.5, y: t.y + 1, x0: t.x - 2, x1: t.x + 4, dir: 1 }));
    for (const p of pickups) p.got = false;
    for (const c of checkpoints) c.lit = false;
    loose = [];
    vapor = 0;
    cloud = null;
    ice.melt = 0;
    ice.melting = false;
    ice.gone = false;
    fx = [];
    carried = 0;
    time = 0;
    falls = 0;
    done = false;
    respawn = { x: level.spawn.x, y: level.spawn.y };
    placeAt(b, respawn.x, respawn.y);
    b.facing = 1;
    cam = follow(cam, b, VIEW_W, VIEW_H, level.map, 0, true);
    dripX = b.x - 0.6;
    dripY = b.y;
    doneBox.hidden = true;
    say('Run with the arrow keys. Jump with Space. Collect the droplets!', 5);
  };

  // ---------------------------------------------------------------- the screen: HUD, message, buttons
  const hud = h('div', { class: 'ww-hud' });
  const dropIcon = cvs(paintDroplet(T, 0), 1);
  const dropText = h('span', {});
  const thermBox = h('span', {});
  const tempText = h('span', {});
  const regionText = h('span', {});
  hud.append(dropIcon, dropText, h('span', { class: 'gap' }), regionText, thermBox, tempText);
  const msg = h('div', { class: 'ww-msg' });
  const doneBox = h('div', { class: 'ww-done' });
  doneBox.hidden = true;
  box.append(hud, msg, doneBox);
  let msgT = 0;
  function say(text: string, secs = 3.5): void {
    msg.textContent = text;
    msg.style.opacity = '1';
    msgT = secs;
  }

  const held = { left: false, right: false, jump: false };
  let jumpPressed = false;
  const powers: Power[] = ['sun', 'cool', 'wind', 'cold'];
  const bar = h('div', { class: 'ww-bar' });
  const pad = h('div', { class: 'ww-pad' });
  const holdBtn = (label: string, aria: string, key: 'left' | 'right' | 'jump') => {
    const btn = h('button', { type: 'button', 'aria-label': aria, text: label });
    const on = (e: Event) => {
      e.preventDefault();
      if (key === 'jump' && !held.jump) jumpPressed = true;
      held[key] = true;
    };
    const off = (e: Event) => {
      e.preventDefault();
      held[key] = false;
    };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
    return btn;
  };
  pad.append(holdBtn('◀', 'Run left', 'left'), holdBtn('▶', 'Run right', 'right'), holdBtn('▲', 'Jump', 'jump'));
  bar.append(pad);
  powers.forEach((p, i) => {
    const btn = h('button', { type: 'button', 'aria-label': `${POWER_NAME[p]} (key ${i + 1})` }, cvs(paintPowerIcon(T, p), 1), h('span', { text: POWER_NAME[p] }), h('kbd', { text: String(i + 1) }));
    btn.addEventListener('click', () => cast(p));
    bar.append(btn);
  });
  const easyBtn = h('button', { type: 'button', text: 'Easy: off' });
  easyBtn.addEventListener('click', () => setEasy(!easy));
  const againBtn = h('button', { type: 'button', text: 'Start again' });
  againBtn.addEventListener('click', () => reset());
  bar.append(easyBtn, againBtn);
  const help = h('p', {
    class: 'ww-help',
    text: 'Arrows or A and D to run, Space, W or Up to jump (hold for a higher jump). Keys 1 to 4 use the powers on what is in front of you. E turns the easy setting on (a slower run and a double jump). Falling in the water takes you back to the last weather vane.',
  });
  canvas.parentElement!.parentElement!.append(bar, help);

  function setEasy(on: boolean): void {
    easy = on;
    tuning = on ? EASY : NORMAL;
    easyBtn.textContent = `Easy: ${on ? 'on' : 'off'}`;
    easyBtn.classList.toggle('on', on);
    say(on ? 'Easy setting: a slower run, and you can jump again in the air.' : 'Easy setting off.');
  }

  const KEYS: Record<string, 'left' | 'right' | 'jump'> = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };
  window.addEventListener('keydown', (e) => {
    const k = KEYS[e.code];
    if (k) {
      e.preventDefault();
      if (k === 'jump' && !held.jump) jumpPressed = true;
      held[k] = true;
      return;
    }
    if (e.repeat) return;
    const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (n >= 0) cast(powers[n]);
    else if (e.code === 'KeyE') setEasy(!easy);
    else if (e.code === 'KeyR') reset();
  });
  window.addEventListener('keyup', (e) => {
    const k = KEYS[e.code];
    if (k) held[k] = false;
  });

  // ---------------------------------------------------------------- the powers
  const cx = () => b.x + b.w / 2;
  const near = (x: number, range: number) => Math.abs(x - cx()) <= range;
  const regionNow = () => (cx() < SHORE_END ? 'shore' : 'mountain') as 'shore' | 'mountain';

  function cast(p: Power): void {
    if (done) return;
    castT = 0.4;
    castPower = p;
    const from = { x: cx() + b.facing * 0.9, y: b.y + 0.2 };
    const effect = (tx: number, ty: number) => fx.push({ kind: p, x: from.x, y: from.y, tx, ty, t: 0 });
    const poolX = pool.x + 1;
    if (p === 'sun') {
      if (!ice.gone && !ice.melting && near(ice.x + 1, 5)) {
        ice.melting = true;
        effect(ice.x + 1, ice.y + 2);
        say('The Sun warms the ice wall. Ice melts above 0 °C.');
      } else if (near(poolX, 5)) {
        effect(poolX, pool.y + 0.6);
        if (cloud) say('There is already a cloud. Hop on!');
        else {
          vapor = 8;
          say('The Sun warms the water. It rises as water vapor, an invisible gas. You only see a shimmer.', 5);
        }
      } else {
        effect(from.x + b.facing * 3, from.y);
        say('The Sun warms things up. Try it on water or ice.');
      }
    } else if (p === 'cool') {
      if (near(poolX, 6) && vapor > 0 && !cloud) {
        cloud = { id: 'cloud', x: poolX - 1.5, y: pool.y - 1, w: 3, h: 0.6, oneWay: true, vx: 0, push: 0, x0: poolX - 1.5, x1: 43 };
        vapor = 0;
        effect(poolX, pool.y - 0.8);
        say('The vapor cools into tiny drops of water. That is a cloud! Jump on.', 4.5);
      } else if (near(poolX, 6) && !cloud) {
        effect(poolX, pool.y - 1);
        say('Nothing to cool yet. A cloud needs water vapor. Warm the water first.', 4.5);
      } else {
        effect(from.x + b.facing * 3, from.y);
        say(cloud ? 'Cool air makes clouds from water vapor.' : 'Cool air makes clouds, but it needs water vapor.');
      }
    } else if (p === 'wind') {
      if (cloud && near(cloud.x + cloud.w / 2, 7)) {
        cloud.push = 2.4;
        cloud.vx = b.facing * 2.6;
        effect(cloud.x + cloud.w / 2, cloud.y);
        say(b.facing > 0 ? 'The wind pushes the cloud along.' : 'The wind pushes the cloud back.');
      } else {
        effect(from.x + b.facing * 4, from.y);
        say('Wind pushes clouds. There is no cloud close by.');
      }
    } else if (p === 'cold') {
      const temp = TEMP[regionNow()];
      if (temp > 0) {
        effect(from.x + b.facing * 3, from.y + 1);
        say(`It is ${temp} °C here. Water only freezes below 0 °C. Try higher up the mountain.`, 4.5);
        return;
      }
      let froze = 0;
      const x0 = Math.floor(cx());
      for (let i = -2; i <= 10; i++) {
        const x = x0 + b.facing * i;
        for (let y = 0; y < level.map.h; y++)
          if (level.map.get(x, y) === Cell.Water) {
            level.map.set(x, y, Cell.Ice);
            froze++;
          }
      }
      effect(from.x + b.facing * 4, from.y + 1.5);
      say(froze ? `It is ${temp} °C. The water freezes into ice. Careful, it is slippery!` : 'Cold freezes water. There is no water close by.');
    }
  }

  // ---------------------------------------------------------------- one step of the game
  function stepGame(dt: number): void {
    if (done) return;
    time += dt;
    const c: Controls = { left: held.left, right: held.right, jump: jumpPressed, jumpHeld: held.jump };
    jumpPressed = false;
    if (bump > 0) {
      bump -= dt;
      c.left = c.right = false;
    }
    // the cloud moves when pushed by the wind, along its track
    const plats: Platform[] = [];
    if (cloud) {
      cloud.dx = 0;
      if (cloud.push > 0) {
        cloud.push -= dt;
        const nx = Math.max(cloud.x0, Math.min(cloud.x1, cloud.x + cloud.vx * dt));
        cloud.dx = nx - cloud.x;
        cloud.x = nx;
        if (cloud.dx === 0) cloud.push = 0;
      }
      plats.push(cloud);
    }
    if (!ice.gone) {
      if (ice.melting) {
        ice.melt += dt / 1.6;
        if (ice.melt >= 1) ice.gone = true;
      }
      plats.push(ice);
    }
    if (vapor > 0) vapor -= dt;
    const ev = step(b, c, level.map, plats, tuning, dt);
    if (ev.landed) dripSquash = 0.15;
    if (ev.fell) {
      falls++;
      const lost = Math.min(3, carried);
      carried -= lost;
      placeAt(b, respawn.x, respawn.y);
      // a fresh start for the cloud puzzle if the checkpoint is before it
      if (respawn.x < pool.x && cloud) cloud = null;
      if (respawn.x < 47 && cloud && cloud.x > cloud.x0 + 0.5 && b.standingOn !== 'cloud') {
        cloud.x = cloud.x0;
      }
      for (let i = 0; i < lost; i++) loose.push({ x: respawn.x + 1.6 + i * 0.9, y: respawn.y - 0.5, got: false, vy: -5 - i });
      say(lost ? `Splash! Drip dropped ${lost} droplet${lost > 1 ? 's' : ''}. Collect them again.` : 'Splash! Back to the weather vane.');
      cam = follow(cam, b, VIEW_W, VIEW_H, level.map, 0, true);
    }
    // crabs scuttle; touching one bumps you back (no harm done)
    for (const k of crabs) {
      k.x += k.dir * 1.4 * dt;
      if (k.x < k.x0 || k.x > k.x1) k.dir *= -1;
      if (bump <= 0 && Math.abs(k.x - cx()) < 0.7 && b.y + b.h > k.y - 0.5 && b.y < k.y) {
        b.vx = (cx() < k.x ? -1 : 1) * 7;
        b.vy = -7;
        bump = 0.4;
        say('Pinch! Crabs scuttle side to side. Jump over them.');
      }
    }
    // droplets
    for (const p of [...pickups, ...loose]) {
      if (p.got) continue;
      if (p.vy !== undefined) {
        p.vy += 20 * dt;
        p.y += p.vy * dt;
        const below = level.map.get(Math.floor(p.x), Math.floor(p.y + 0.2));
        if (below === Cell.Solid || below === Cell.Ice) {
          p.y = Math.floor(p.y + 0.2) - 0.05;
          p.vy = undefined;
        }
      }
      if (Math.abs(p.x - cx()) < 0.7 && p.y > b.y && p.y < b.y + b.h + 0.4) {
        p.got = true;
        carried++;
      }
    }
    // checkpoints
    for (const k of checkpoints)
      if (!k.lit && Math.abs(k.x + 0.5 - cx()) < 0.8) {
        k.lit = true;
        respawn = { x: k.x, y: k.y };
        say('A weather vane! If you fall, you start again here.');
      }
    // the finish
    if (Math.abs(flag.x + 0.5 - cx()) < 0.8) {
      done = true;
      doneBox.replaceChildren(
        h('div', { text: 'You reached the flag!' }),
        h('div', { text: `Droplets: ${carried} of ${total}. Time: ${Math.round(time)} seconds. Falls: ${falls}.` }),
        h('div', { text: 'How did the running and jumping feel?' }),
      );
      const again = h('button', { type: 'button', text: 'Play again' });
      again.addEventListener('click', () => reset());
      doneBox.append(again);
      doneBox.hidden = false;
      again.focus();
    }
    cam = follow(cam, b, VIEW_W, VIEW_H, level.map, dt);
    // Drip floats along behind your shoulder
    const tx = cx() - b.facing * 0.9;
    const ty = b.y - 0.1 + Math.sin(time * 3) * 0.12;
    dripX += (tx - dripX) * Math.min(1, dt * 6);
    dripY += (ty - dripY) * Math.min(1, dt * 6);
    if (dripSquash > 0) dripSquash -= dt;
    if (castT > 0) castT -= dt;
    for (const f of fx) f.t += dt;
    fx = fx.filter((f) => f.t < 0.7);
    if (msgT > 0) {
      msgT -= dt;
      if (msgT <= 0) msg.style.opacity = '0';
    }
  }

  // ---------------------------------------------------------------- drawing
  function draw(): void {
    frame++;
    const f = Math.floor(frame / 8);
    const mix = Math.max(0, Math.min(1, (cam.x + VIEW_W / 2 - (SHORE_END - 4)) / 8));
    drawBackdrop(ctx, scene, 'shore', cam);
    if (mix > 0) drawBackdrop(ctx, scene, 'mountain', cam, mix);
    // scenery behind
    const put = (key: string, make: () => PixelBuffer, x: number, y: number) => drawAt(ctx, cached(key, make), x, y, cam);
    for (const x of [1, 24, 30]) put(`palm-${x % 2}`, () => paintPalm(T, x % 2), x, 10);
    for (const x of [51, 60, 73, 79]) put(`pine-${x % 2}`, () => paintPine(T, true, x % 2), x, x === 60 ? 10 : 10);
    put(`pine-high`, () => paintPine(T, true, 0), 56.5, 6);
    drawTiles(ctx, scene, cam, frame);
    // the tide pool, with the shimmer of vapor while it is warm
    put(vapor > 0 ? `pool-w-${f % 4}` : 'pool', () => paintTidePool(T, 2, vapor > 0, f % 4), pool.x + 1, pool.y + 1.05);
    if (cloud) put(`cloud-${f % 2}`, () => paintCloud(T, 3, 'cumulus', f % 2), cloud.x + cloud.w / 2, cloud.y + 0.65);
    if (!ice.gone) {
      const m = Math.round(ice.melt * 8) / 8;
      put(`ice-${m}-a`, () => paintIceBlock(T, 4, m), ice.x + 0.5, ice.y + 4);
      put(`ice-${m}-a`, () => paintIceBlock(T, 4, m), ice.x + 1.5, ice.y + 4);
    }
    for (const k of checkpoints) put(`vane-${k.lit}-${k.lit ? f % 8 : 0}`, () => paintVane(T, k.lit, f % 8), k.x + 0.5, k.y + 1);
    put(`flag-${f % 4}`, () => paintFlag(T, f % 4), flag.x + 0.5, flag.y + 1);
    for (const p of [...pickups, ...loose]) if (!p.got) put(`drop-${f % 4}`, () => paintDroplet(T, f % 4), p.x, p.y);
    for (const k of crabs) put(`crab-${f % 2}`, () => paintCrab(T, f % 2), k.x, k.y);
    // the wizard
    const face = b.facing > 0 ? 'right' : 'left';
    let pose: WizardPose = 'stand';
    if (castT > 0) pose = 'cast';
    else if (!b.onGround) pose = b.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(b.vx) > 0.4) pose = 'run';
    const wf = pose === 'run' ? Math.floor(frame / 6) % 4 : pose === 'cast' ? f % 4 : 0;
    const blink = pose === 'stand' && frame % 200 < 8;
    put(`me-${pose}-${face}-${wf}-${pose === 'cast' ? castPower : ''}-${blink}`, () => paintWizard(APPRENTICE, T, face, { pose, frame: wf, power: castPower, blink }), cx(), b.y + b.h);
    // Drip: a drop at the shore, a cloud drop on the cloud, a snowflake up the mountain
    const form: DripForm = b.standingOn === 'cloud' ? 'cloud' : regionNow() === 'mountain' ? 'snow' : 'drop';
    const df = dripSquash > 0 ? 1 : !b.onGround ? 2 : f % 6 === 5 ? 3 : 0;
    put(`drip-${form}-${df}`, () => paintDrip(T, form, df, false), dripX, dripY + 0.7);
    // power effects
    for (const e of fx) drawFx(e);
    // snow falling up the mountain
    if (mix > 0) {
      ctx.globalAlpha = mix;
      ctx.drawImage(
        cached(`snow-${f % 16}`, () => paintRain(VW, VH, f % 16, true)),
        0,
        0,
      );
      ctx.globalAlpha = 1;
    }
    // HUD
    dropText.textContent = `${carried} / ${total}`;
    const r = regionNow();
    regionText.textContent = r === 'shore' ? 'Sunny Shore' : 'Mountain Pass';
    const temp = TEMP[r];
    if (thermBox.dataset.t !== String(temp)) {
      thermBox.dataset.t = String(temp);
      thermBox.replaceChildren(cvs(paintThermometer(16, temp), 1));
    }
    tempText.textContent = `${temp} °C`;
  }

  function drawFx(e: Fx): void {
    const k = e.t / 0.7;
    const sx = (e.x - cam.x) * T;
    const sy = (e.y - cam.y) * T;
    const tx = (e.tx - cam.x) * T;
    const ty = (e.ty - cam.y) * T;
    ctx.fillStyle = POWER_COLOR[e.kind];
    if (e.kind === 'sun') {
      for (let i = 0; i < 14; i++) {
        const t = (i / 14 + k) % 1;
        ctx.fillRect(Math.round(sx + (tx - sx) * t), Math.round(sy + (ty - sy) * t + Math.sin(i) * 2), 2, 2);
      }
      ctx.globalAlpha = 1 - k;
      ctx.beginPath();
      ctx.arc(tx, ty, 6 + k * 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (e.kind === 'wind') {
      ctx.globalAlpha = 1 - k;
      ctx.drawImage(
        cached(`gust-${Math.floor(e.t * 12) % 6}`, () => paintGust(T, 3, Math.floor(e.t * 12) % 6)),
        Math.round(tx - T * 1.5 - (1 - k) * 20 * Math.sign(tx - sx || 1)),
        Math.round(ty - 8),
      );
      ctx.globalAlpha = 1;
    } else {
      for (let i = 0; i < 18; i++) {
        const a = i * 2.4;
        const d = k * 26 * ((i % 3) + 1) * 0.5;
        ctx.globalAlpha = 1 - k;
        ctx.fillRect(Math.round(tx + Math.cos(a) * d), Math.round(ty + Math.sin(a) * d * 0.6), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------------------------------------------------------------- the loop (fixed 60 steps a second)
  let last = performance.now();
  let acc = 0;
  const DT = 1 / 60;
  const loop = (now: number) => {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= DT) {
      stepGame(DT);
      acc -= DT;
    }
    draw();
    requestAnimationFrame(loop);
  };
  reset();
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'The test level. Use the arrow keys to run and Space to jump.');
  // a hook for the browser checks
  (window as unknown as { __ww: unknown }).__ww = {
    body: b,
    state: () => ({ carried, total, done, falls, vapor: vapor > 0, cloud: cloud ? { x: cloud.x, y: cloud.y } : null, iceGone: !!ice.gone, respawn, easy }),
    cast,
    teleport: (x: number, y: number) => placeAt(b, x, y),
  };
  requestAnimationFrame(loop);
}
