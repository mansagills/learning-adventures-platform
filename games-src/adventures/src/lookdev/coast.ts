import { PixelBuffer } from '../kit/art/pixel';
import { add, canCraft, craft, missing, missingText, takeDown, type Inventory } from '../kit/craft/workbench';
import { Cell, EASY, follow, newBody, NORMAL, parseLevel, placeAt, step, type Body, type Camera, type Controls, type Level, type Tuning } from '../kit/scroller/physics';
import { h } from '../kit/ui/dom';
import { paintHero, paintPortrait16, type Look16, type Mood } from '../kit/worlds/hero16';
import { paintCrab } from '../kit/worlds/wild-lands/weather-art';
import { paintFrog, paintHeron, paintPalm, paintTurtle, RANGER_TALA } from '../kit/worlds/wild-lands/art';
import {
  CADET,
  DIRTY_MURK,
  GAUGE_NAME,
  MARISOL_VEGA,
  NATURE,
  NATURE_IDS,
  RAFI_HADDAD,
  ROSA_DELGADO,
  STRETCH_NAME,
  STRETCH_PROBLEM,
  STRETCHES,
  TOWNSFOLK,
  TRASH,
  TRASH_IDS,
  VISITOR_NAME,
  VISITOR_NEEDS,
  WEN_LI,
  paintBin,
  paintBoat,
  paintBoom,
  paintBufferStrip,
  paintBus,
  paintCadet,
  paintCoastBackdrop,
  paintCoastTile,
  paintDrainPipe,
  paintField,
  paintFilter,
  paintFish,
  paintGaugeIcon,
  paintGhostNet,
  paintGull,
  paintKayak,
  paintLotTile,
  paintMill,
  paintNatural,
  paintNature,
  paintNetBin,
  paintOllie,
  paintOlliePortrait,
  paintOilSlick,
  paintPads,
  paintRainBarrel,
  paintRainGarden,
  paintReeds,
  paintShadeTree,
  paintSparkle,
  paintSquadFlag,
  paintSquadHut,
  paintStake,
  paintStormDrain,
  paintTestKit,
  paintTownHouse,
  paintTrash,
  paintVisitor,
  paintWorkbench,
  visitorsFor,
  type BinKind,
  type CadetPose,
  type CoastBackdrop,
  type CoastTileKind,
  type GaugeKind,
  type Murk,
  type NatureId,
  type NetDesign,
  type OlliePose,
  type Stretch,
  type TrashId,
  type VisitorId,
} from '../kit/worlds/wild-lands/coast-art';
import { DRAIN_NET, MATERIAL_NAME } from '../kit/worlds/wild-lands/coast-craft';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Pollution Solution Squad, the first crafting adventure
 * (the "S4 Environment: Pollution Solution Squad" section of
 * docs/GAMES_3D_UPGRADE_PLAN.md), in the new `coastline` setting:
 *   #coast-cast               the cast, Ollie, trash and materials, the fixes, gauges, tiles, Nature Center pieces
 *   #coast-<stretch>          beach, harbor, wetland, town (add -clean for after the fixes)
 *   #coast-nature             the Nature Center build view
 *   #coast-play               a short playable crafting test: gather, craft at the Workbench, build, test, then build in the Nature Center
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

export function showCoastCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Pollution Solution Squad: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) =>
    page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));
  const portrait = (l: Look16, m: Mood) => cvs(paintPortrait16(l, m), 2, 'pframe new');
  const person = (l: Look16, m: Mood, m2: Mood) => [cvs(paintHero(l, 1.5, 'down'), Z), cvs(paintHero(l, 1.5, 'right'), Z), portrait(l, m), portrait(l, m2)];
  const cadet = (pose: CadetPose, frame = 0) => cvs(paintCadet(CADET, T, 'right', { pose, frame }), Z);

  block(
    '1. The Squad (the names you kept)',
    'Marisol leads the Squad and tells the story. Rafi runs the Workbench. Dr. Wen Li tests the water at the wetland. Rosa farms upstream and sits on the town council. Ranger Tala visits Beach Camp.',
    card(person(MARISOL_VEGA, 'smile', 'curious'), 'Marisol Vega', 'Squad leader, marine biologist (the host)'),
    card(person(RAFI_HADDAD, 'smile', 'thinking'), 'Rafi Haddad', 'The Squad’s engineer'),
    card(person(WEN_LI, 'smile', 'thinking'), 'Dr. Wen Li', 'Water scientist at the wetland'),
    card(person(ROSA_DELGADO, 'smile', 'curious'), 'Rosa Delgado', 'Farmer and town council member'),
    card([cvs(paintHero(RANGER_TALA, 1.5, 'down'), Z), portrait(RANGER_TALA, 'smile')], 'Ranger Tala', 'Wild Lands ranger, visiting'),
    card(
      TOWNSFOLK.map((l) => cvs(paintHero(l, 1.5, 'down'), Z)),
      'Townsfolk',
      'They come to Clean Coast Day',
    ),
  );
  block(
    '2. You: a Squad cadet',
    'A backpack for the materials and a litter grabber. Running, jumping, grabbing trash, swimming in the shallows and paddling a kayak through the harbor.',
    card([cadet('stand'), ...[0, 1, 2, 3].map((f) => cadet('run', f))], 'Standing and running', ''),
    card([cadet('jump'), cadet('fall')], 'Jumping and falling', ''),
    card([cadet('grab', 0), cadet('grab', 1)], 'Grabbing trash', 'The grabber opens and closes'),
    card([cadet('swim', 0), cadet('swim', 1)], 'Swimming', 'Head and shoulders above the water'),
    card(
      [0, 1, 2, 3].map((f) => cvs(paintKayak(CADET, T, 'right', f), 2)),
      'Paddling a kayak',
      'Through the harbor',
    ),
  );
  const ollie = (pose: OlliePose, f = 0) => cvs(paintOllie(T, pose, f), Z);
  block(
    '3. Ollie the river otter',
    'On the first day you free Ollie from a plastic six-pack ring. After that Ollie follows you, sniffs out hidden trash and shows how clean the water is.',
    card([ollie('tangled')], 'Tangled', 'Worried, not hurt'),
    card([ollie('stand'), ollie('run', 0), ollie('run', 1)], 'Standing and running', ''),
    card([ollie('sniff'), cvs(paintSparkle(T, 2), Z)], 'Sniffing out hidden trash', 'A glint shows where it is'),
    card([ollie('swim', 0), ollie('swim', 1), ollie('happy')], 'Swimming, and happy', ''),
    card([cvs(paintOlliePortrait(true), 2, 'pframe new'), cvs(paintOlliePortrait(false), 2, 'pframe new')], 'Ollie’s portraits', 'For the talk box'),
  );
  block(
    '4. Trash, and the materials it becomes',
    'Most of what you pick up is something to craft with. Each piece also goes in the right bin at the sorting station.',
    ...TRASH_IDS.map((id) => card([cvs(paintTrash(id, T), Z)], TRASH[id].name, TRASH[id].material)),
  );
  block(
    '5. Take only trash',
    'Natural things stay where they are. Shells, driftwood and seaweed are homes and food for beach animals. The grabber says so if you try.',
    card([cvs(paintNatural('shell', T, 0), Z), cvs(paintNatural('shell', T, 1), Z)], 'Shells', ''),
    card([cvs(paintNatural('driftlog', T), Z)], 'A driftwood log', ''),
    card([cvs(paintNatural('seaweed', T, 0), Z), cvs(paintNatural('stone', T), Z)], 'Seaweed and a stone', ''),
    card([cvs(paintCrab(T, 0), Z)], 'A crab', 'Beach animals are friendly'),
  );
  block(
    '6. Beach Camp',
    'The Squad hut, Rafi’s Workbench, the sorting station and the Squad flag (the checkpoint). A blueprint stake marks a place to build a fix.',
    card([cvs(paintSquadHut(T), 2)], 'The Squad hut', ''),
    card([cvs(paintWorkbench(T), 2)], 'The Workbench', 'Where you craft the fixes'),
    card(
      (['recycle', 'compost', 'trash', 'hazard'] as BinKind[]).map((k) => cvs(paintBin(T, k), Z)),
      'The sorting station',
      'Recycling, compost, trash, hazardous waste',
    ),
    card([cvs(paintSquadFlag(T, false), Z), cvs(paintSquadFlag(T, true, 0), Z), cvs(paintSquadFlag(T, true, 2), Z)], 'The Squad flag', 'A checkpoint: it waves when you touch it'),
    card([cvs(paintStake(T, false), Z), cvs(paintStake(T, true, 1), Z)], 'A blueprint stake', 'A build spot; it glows when you can build'),
  );
  block(
    '7. Turtle Beach: the drain net and its designs',
    'The storm drain pipe brings trash onto the beach. You pick the size of the net’s holes: too big lets trash through, too small blocks up and spills over, medium works (and gets emptied after rain).',
    card([cvs(paintDrainPipe(T, 'none', 0, true), 2)], 'No net', 'Trash comes out with the water'),
    card([cvs(paintDrainPipe(T, 'big', 0, true), 2)], 'Big holes', 'Small trash slips through'),
    card([cvs(paintDrainPipe(T, 'small', 0, true, 1), 2)], 'Tiny holes, blocked', 'The water spills over the top'),
    card([cvs(paintDrainPipe(T, 'medium', 0, true, 0.2), 2)], 'Medium holes', 'Catches the trash, lets the water through'),
  );
  block(
    '8. The Harbor and River Mouth',
    'A fishing boat leaks fuel and old nets tangle the rocks. Oil floats and spreads, so a floating boom keeps it in one place and pads soak it up. Patching the tank stops it at the source.',
    card([cvs(paintBoat(T, false, 0), 1), cvs(paintBoat(T, true, 0), 1)], 'The fishing boat', 'Leaking, then patched'),
    card([cvs(paintBoom(T, 5, 0), 2)], 'An oil boom', 'Rope and sealed bottles'),
    card([cvs(paintPads(T, 0), Z), cvs(paintPads(T, 0.8), Z)], 'Absorbent pads', 'Clean, then soaked'),
    card([cvs(paintGhostNet(T, 0), 2), cvs(paintNetBin(T), 2)], 'A ghost net and the net bin', 'Old nets go back to be recycled'),
  );
  block(
    '9. The Wetland',
    'Reeds and cattails clean the water. A filter has layers in the right order: the water goes through and the mud stays behind.',
    card(
      [0, 1].map((s) => cvs(paintReeds(T, s, s * 2), 2)),
      'Reeds and cattails',
      '',
    ),
    card([cvs(paintFilter(T, ['gravel', 'sand', 'stones'], true, true, 0), 2)], 'A filter that works', 'Gravel, sand, then stones'),
    card([cvs(paintFilter(T, ['sand', 'stones', 'gravel'], true, false, 0), 2)], 'A filter in the wrong order', 'The mud comes straight out'),
    card([cvs(paintFish(T, 0), Z), cvs(paintFish(T, 1, true), Z)], 'Fish', 'Swimming, and gasping when oxygen is low'),
  );
  block(
    '10. Farm and Town: the sources',
    'Rain washes soil and fertilizer off bare fields and litter off the streets into storm drains, which run straight to the river. The fixes stop it where it starts.',
    card([cvs(paintField(T, 4, 'bare'), 2), cvs(paintField(T, 4, 'cover', 0), 2), cvs(paintField(T, 4, 'crop'), 2)], 'Fields', 'Bare soil, a cover crop, a crop'),
    card([cvs(paintBufferStrip(T, 4, 0), 2)], 'A buffer strip', 'Native plants along the riverbank'),
    card([cvs(paintRainGarden(T, false), 2), cvs(paintRainGarden(T, true), 2), cvs(paintRainBarrel(T), 2)], 'A rain garden and a rain barrel', 'Dry, after rain'),
    card([cvs(paintStormDrain(T, false), Z), cvs(paintStormDrain(T, true), Z)], 'A storm drain', 'Then marked: drains to the river'),
    card([cvs(paintMill(T, false, 0), 1), cvs(paintMill(T, true, 0), 1)], 'The mill', 'Smoking, then with a filter'),
    card([cvs(paintBus(T, true, 0), 2), cvs(paintBus(T, false), 2)], 'The town bus', 'Idling, then switched off while it waits'),
    card([cvs(paintTownHouse(T, 0), 2), cvs(paintShadeTree(T, 0), 2)], 'A house and a shade tree', ''),
  );
  block(
    '11. The water test',
    'Dr. Wen Li’s test kit. Four gauges at every stretch go from red to green as the fixes go in.',
    ...(['trash', 'oil', 'mud', 'oxygen'] as GaugeKind[]).map((k) => card([cvs(paintGaugeIcon(T, k), Z)], GAUGE_NAME[k], '')),
    card([cvs(paintTestKit(T), Z)], 'The test kit', ''),
  );
  block(
    '12. Animals that come back',
    'As the water gets cleaner, animals return: fish, gulls, turtles, herons and frogs.',
    card([cvs(paintGull(T, 0), Z), cvs(paintGull(T, 1), Z), cvs(paintGull(T, 0, true), Z)], 'Gulls', ''),
    card([cvs(paintTurtle(1.5, 0), Z), cvs(paintHeron(T, 0), 2), cvs(paintFrog(T, 0), Z)], 'A sea turtle, a heron, a frog', ''),
  );
  const murks: Murk[] = ['clear', 'trash', 'oil', 'algae', 'mud'];
  block(
    '13. The ground in each stretch',
    'Top, inside, a ledge, and the water, clean and dirty (an oily rainbow sheen in the harbor, green algae in the wetland, brown mud below the farm).',
    ...(['camp', ...STRETCHES] as Stretch[]).map((s) =>
      card(
        [
          ...(['top', 'fill', 'ledge'] as CoastTileKind[]).map((k) => cvs(paintCoastTile(T, s, k, 1), Z)),
          ...(s === 'town' ? [cvs(paintCoastTile(T, s, 'road', 0), Z)] : []),
          cvs(paintCoastTile(T, s, 'waterTop', 1, 0, 'clear'), Z),
          cvs(paintCoastTile(T, s, 'waterTop', 1, 0, DIRTY_MURK[s]), Z),
        ],
        STRETCH_NAME[s],
        `${STRETCH_PROBLEM[s]}${s === 'camp' ? '' : `: clean water, then ${murks.includes(DIRTY_MURK[s]) ? DIRTY_MURK[s] : ''}`}`,
      ),
    ),
  );
  block(
    '14. The Nature Center: pieces to build',
    'Built with spare materials and what the story unlocks. Every piece has a card that says how it helps.',
    ...NATURE_IDS.map((id) => card([cvs(paintNature(id, T, 0), 2)], NATURE[id].name, NATURE[id].helps)),
  );
  block(
    '15. Visitors to the Nature Center',
    'Animals visit depending on what you build. Each first visit adds a card to the Visitor Book.',
    ...(Object.keys(VISITOR_NAME) as VisitorId[]).map((v) =>
      card(
        [cvs(paintVisitor(v, T, 0), Z), cvs(paintVisitor(v, T, 1), Z)],
        VISITOR_NAME[v],
        `Comes for: ${VISITOR_NEEDS[v].needs.map((n) => NATURE[n].name.toLowerCase()).join(' or ')}${VISITOR_NEEDS[v].pond ? ' (by the pond)' : ''}`,
      ),
    ),
  );
}

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
  stretchAt: (x: number) => Stretch;
  murkAt: (x: number) => Murk;
  /** Columns drawn as the Nature Center lot (cut away), and which of them are the pond. */
  lot?: { x0: number; x1: number; pond: [number, number] };
  clean: boolean;
  backdrops: Map<string, CoastBackdrop>;
  /** The view's width in pixels (VW for play; wider for the stretch views). */
  vw?: number;
}

function drawBackdrop(ctx: CanvasRenderingContext2D, s: Scene, st: Stretch, cam: Camera, alpha = 1): void {
  const key = `${st}-${s.clean}`;
  let b = s.backdrops.get(key);
  if (!b) s.backdrops.set(key, (b = paintCoastBackdrop(st, VW, VH, s.clean)));
  const bd = b;
  const sky = cached(`bd-${key}-sky`, () => bd.sky);
  const far = cached(`bd-${key}-far`, () => bd.far);
  const near = cached(`bd-${key}-near`, () => bd.near);
  const vw = s.vw ?? VW;
  ctx.globalAlpha = alpha;
  for (let x = 0; x < vw; x += VW) ctx.drawImage(sky, x, 0);
  for (const [layer, k] of [
    [far, 0.2],
    [near, 0.45],
  ] as const) {
    const off = Math.floor((((cam.x * T * k) % VW) + VW) % VW);
    const dy = Math.round(-cam.y * T * k * 0.3);
    for (let x = -off; x < vw; x += VW) ctx.drawImage(layer, x, dy);
  }
  ctx.globalAlpha = 1;
}

function drawTiles(ctx: CanvasRenderingContext2D, s: Scene, cam: Camera, frame: number): void {
  const map = s.level.map;
  const x0 = Math.floor(cam.x);
  const y0 = Math.floor(cam.y);
  const anim = Math.floor(frame / 8) % 4;
  const viewW = (s.vw ?? VW) / T;
  for (let y = y0; y <= y0 + Math.ceil(VIEW_H) + 1; y++)
    for (let x = x0; x <= x0 + viewW + 1; x++) {
      if (x < 0 || x >= map.w || y < 0 || y >= map.h) continue;
      const c = map.get(x, y);
      if (c === Cell.Air) continue;
      const px = Math.round((x - cam.x) * T);
      const py = Math.round((y - cam.y) * T);
      const above = map.get(x, y - 1);
      if (s.lot && x >= s.lot.x0 && x <= s.lot.x1 && c === Cell.Solid) {
        const pond = x >= s.lot.pond[0] && x <= s.lot.pond[1];
        const top = above !== Cell.Solid;
        const kind = pond ? (top ? 'pondTop' : 'pond') : top ? 'grass' : 'deep';
        ctx.drawImage(
          cached(`lot-${kind}-${x % 4}-${pond ? anim : 0}`, () => paintLotTile(T, kind, x % 4, anim)),
          px,
          py,
        );
        if (pond && top)
          ctx.drawImage(
            cached('boardwalk', () => paintCoastTile(T, 'camp', 'ledge', 1)),
            px,
            py - Math.round(T * 0.2),
          );
        continue;
      }
      const st = s.stretchAt(x);
      let kind: CoastTileKind;
      if (c === Cell.Solid) kind = above === Cell.Solid ? 'fill' : 'top';
      else if (c === Cell.Ledge) kind = 'ledge';
      else kind = above === Cell.Water ? 'water' : 'waterTop';
      const murk = c === Cell.Water ? s.murkAt(x) : 'clear';
      const a = kind === 'water' || kind === 'waterTop' ? anim : 0;
      ctx.drawImage(
        cached(`t-${st}-${kind}-${x % 4}-${a}-${murk}`, () => paintCoastTile(T, st, kind, x % 4, a, murk)),
        px,
        py,
      );
    }
}

/** Draw a sprite with its bottom middle at (x, y) in tiles. */
function drawAt(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, cam: Camera): void {
  ctx.drawImage(img, Math.round((x - cam.x) * T - img.width / 2), Math.round((y - cam.y) * T - img.height));
}

/** A pixel canvas scaled to fit the window by whole numbers, with a caption. */
function stage(host: HTMLElement, caption: string, vw = VW): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; box: HTMLElement; wrap: HTMLElement } {
  document.body.classList.add('lookdev');
  ensureStyle();
  const wrap = h('div', { class: 'cs-wrap' });
  host.appendChild(wrap);
  const top = h('div', { class: 'cs-top' }, h('strong', { text: caption }), pageNav(currentToken(), true));
  const box = h('div', { class: 'cs-box' });
  const canvas = document.createElement('canvas');
  canvas.width = vw;
  canvas.height = VH;
  canvas.className = 'cs-canvas';
  box.appendChild(canvas);
  wrap.append(top, box);
  const fit = () => {
    const room = Math.min((window.innerWidth - 24) / vw, (window.innerHeight - 150) / VH);
    const s = room >= 1 ? Math.floor(room) : room;
    canvas.style.width = `${vw * s}px`;
    canvas.style.height = `${VH * s}px`;
    box.style.setProperty('--z', String(s));
  };
  fit();
  window.addEventListener('resize', fit);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx, box, wrap };
}

let styled = false;
function ensureStyle(): void {
  if (styled) return;
  styled = true;
  const css = `
  .cs-wrap{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;background:#1d2a36;color:#fff;padding:8px 12px;box-sizing:border-box;font-family:'Atkinson Hyperlegible',sans-serif;overflow:auto}
  .cs-top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center}
  .cs-top .ld-pick{color:#fff}
  .cs-box{position:relative;max-width:100%}
  .cs-canvas{display:block;image-rendering:pixelated;border-radius:6px;touch-action:none}
  .cs-hud{position:absolute;left:0;right:0;top:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 8px;font-weight:700;font-size:14px;pointer-events:none;text-shadow:0 1px 0 #000,0 0 3px #000}
  .cs-hud canvas{image-rendering:pixelated;vertical-align:middle}
  .cs-hud .gap{flex:1}
  .cs-hud .item{display:flex;align-items:center;gap:3px}
  .cs-gauge{display:flex;align-items:center;gap:4px}
  .cs-gauge i{display:block;width:54px;height:8px;border-radius:4px;background:#0006;overflow:hidden}
  .cs-gauge b{display:block;height:100%;border-radius:4px;transition:width .4s,background .4s}
  .cs-talk{position:absolute;left:50%;top:30px;transform:translateX(-50%);width:min(560px,94%);display:flex;gap:10px;align-items:center;background:#fdf6e4;color:#2a2018;border:3px solid #8a5a36;border-radius:12px;padding:6px 10px;font-size:15px;line-height:1.35;font-weight:700;pointer-events:none;transition:opacity .3s}
  .cs-talk canvas{image-rendering:pixelated;flex:none;width:48px;height:48px;border-radius:8px;background:#e8d8b0}
  .cs-talk .who{display:block;font:600 13px 'Pixelify Sans',sans-serif;color:#8a5a36}
  .cs-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;max-width:100%}
  .cs-bar button{display:flex;align-items:center;gap:6px;min-height:48px;padding:4px 12px;border-radius:12px;border:2px solid #fff3;background:#2c3c52;color:#fff;font:700 15px 'Atkinson Hyperlegible',sans-serif;cursor:pointer}
  .cs-bar button:focus-visible{outline:3px solid #ffd84a;outline-offset:2px}
  .cs-bar button.on{border-color:#ffd84a;background:#3a5070}
  .cs-bar kbd{font:700 12px monospace;background:#0006;border-radius:4px;padding:1px 5px}
  .cs-pad{display:flex;gap:8px}
  .cs-pad button{min-width:60px;justify-content:center;font-size:20px}
  .cs-panel{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(16,24,36,.7);padding:10px;box-sizing:border-box}
  .cs-sheet{background:#fdf6e4;color:#2a2018;border:4px solid #8a5a36;border-radius:14px;max-width:640px;width:100%;max-height:100%;overflow:auto;padding:12px 14px;box-sizing:border-box;font-size:15px;line-height:1.4}
  .cs-sheet h3{margin:0 0 6px;font:600 20px 'Pixelify Sans',sans-serif;color:#5a3a24}
  .cs-sheet ul{margin:2px 0 8px 18px;padding:0}
  .cs-sheet .cols{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}
  .cs-designs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
  .cs-designs button{display:flex;flex-direction:column;align-items:center;gap:4px;border:3px solid #c8a070;border-radius:12px;background:#fffaf0;padding:6px;font:700 14px 'Atkinson Hyperlegible',sans-serif;color:#2a2018;cursor:pointer;min-height:48px}
  .cs-designs button:focus-visible{outline:3px solid #2f8fc8;outline-offset:2px}
  .cs-designs button[disabled]{opacity:.55;cursor:not-allowed}
  .cs-designs canvas{image-rendering:pixelated;width:100%;max-width:120px;height:auto}
  .cs-designs small{font-weight:400}
  .cs-sheet .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:8px}
  .cs-sheet .row button{min-height:44px;padding:4px 14px;border-radius:10px;border:0;background:#2f8fc8;color:#fff;font:700 15px 'Atkinson Hyperlegible',sans-serif;cursor:pointer}
  .cs-sheet .row button.alt{background:#8a5a36}
  .cs-sheet .bag{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}
  .cs-sheet .bag span{display:flex;align-items:center;gap:2px}
  .cs-sheet .bag canvas{image-rendering:pixelated}
  .cs-sheet .need{color:#b0402a}
  .cs-palette{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:100%}
  .cs-palette button{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:72px;min-height:56px;padding:4px 6px;border-radius:10px;border:2px solid #fff3;background:#2c3c52;color:#fff;font:700 12px 'Atkinson Hyperlegible',sans-serif;cursor:pointer}
  .cs-palette button.on{border-color:#ffd84a;background:#3a5070}
  .cs-palette canvas{image-rendering:pixelated;height:36px;width:auto}
  .cs-help{max-width:760px;font-size:14px;line-height:1.4;color:#d8dcf0;text-align:center;margin:0}
  @media (max-width:600px){.cs-designs{grid-template-columns:1fr}.cs-sheet .cols{grid-template-columns:1fr}.cs-talk{font-size:14px}}
  `;
  document.head.appendChild(h('style', { text: css }));
}

/** The talk box: a portrait, a name and a line. */
function talkBox(box: HTMLElement): { say: (who: Speaker, text: string, secs?: number) => void; tick: (dt: number) => void; el: HTMLElement } {
  const el = h('div', { class: 'cs-talk' });
  el.style.opacity = '0';
  box.appendChild(el);
  let t = 0;
  return {
    el,
    say(who, text, secs = 4.5) {
      const pic = who === 'Ollie' ? paintOlliePortrait(true) : paintPortrait16(SPEAKER[who], 'smile');
      el.replaceChildren(cvs(pic, 1), h('div', {}, h('span', { class: 'who', text: who }), h('span', { text })));
      el.style.opacity = '1';
      el.dataset.text = text;
      t = secs;
    },
    tick(dt) {
      if (t > 0) {
        t -= dt;
        if (t <= 0) el.style.opacity = '0';
      }
    },
  };
}

type Speaker = 'Marisol' | 'Rafi' | 'Dr. Wen Li' | 'Rosa' | 'Ollie';
const SPEAKER: Record<Exclude<Speaker, 'Ollie'>, Look16> = { Marisol: MARISOL_VEGA, Rafi: RAFI_HADDAD, 'Dr. Wen Li': WEN_LI, Rosa: ROSA_DELGADO };

// ------------------------------------------------------------------ the four stretches (dirty and clean)

const STRETCH_ROWS: Record<Exclude<Stretch, 'camp'>, string[]> = {
  beach: [
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '################~~~~',
    '################~~~~',
  ],
  harbor: [
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '#########~~~~~~~~~~~',
    '#########~~~~~~~~~~~',
  ],
  wetland: [
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '......====..........',
    '#####~~~~~~~~###~~~~',
    '#####~~~~~~~~###~~~~',
  ],
  town: [
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '#################~~~',
    '#################~~~',
  ],
};

export function showCoastStretch(host: HTMLElement, q: URLSearchParams): void {
  const st = (STRETCHES.includes(q.get('area') as never) ? q.get('area') : 'beach') as Exclude<Stretch, 'camp'>;
  const clean = q.get('clean') === '1';
  const level = parseLevel(STRETCH_ROWS[st]);
  const scene: Scene = { level, stretchAt: () => st, murkAt: () => (clean ? 'clear' : DIRTY_MURK[st]), clean, backdrops: new Map() };
  const { ctx, box } = stage(host, `${STRETCH_NAME[st]}: ${STRETCH_PROBLEM[st].toLowerCase()} (${clean ? 'after the fixes' : 'before'})`);
  const talk = talkBox(box);
  const LINES: Record<Exclude<Stretch, 'camp'>, [Speaker, string, string]> = {
    beach: ['Marisol', 'We cleaned this beach yesterday. Where is all this trash coming from?', 'The drain net catches the trash, and the turtles are back. Now to find where it starts.'],
    harbor: ['Rafi', 'Oil floats and spreads out thin. First we stop the leak, then we fence the oil in.', 'The leak is patched and the boom held the oil. The old nets go in the net bin.'],
    wetland: ['Dr. Wen Li', 'Green water and fish at the surface: too much algae, not enough oxygen.', 'The reeds are back and the oxygen gauge is green. Listen: frogs!'],
    town: ['Rosa', 'When it rains, the soil off my bare field runs straight into the river.', 'Cover crops, a buffer strip and rain gardens. The river runs clear past town.'],
  };
  const [who, before, after] = LINES[st];
  talk.say(who, clean ? after : before, 1e9);
  const cam: Camera = { x: 0, y: level.map.h - VIEW_H };
  let frame = 0;
  const draw = () => {
    frame++;
    const f = Math.floor(frame / 8);
    drawBackdrop(ctx, scene, st, cam);
    const put = (key: string, make: () => PixelBuffer, x: number, y: number) => drawAt(ctx, cached(key, make), x, y, cam);
    const person = (key: string, l: Look16, x: number, y: number, face: 'left' | 'right' = 'right') => put(`p-${key}-${face}`, () => paintHero(l, 1.5, face), x, y);
    const me = (pose: CadetPose, x: number, y: number, face: 'left' | 'right' = 'right') => put(`me-${pose}-${face}-${f % 2}`, () => paintCadet(CADET, T, face, { pose, frame: f % 2 }), x, y);
    if (st === 'beach') {
      put('palm0', () => paintPalm(T, 0), 0.6, 10);
      put('palm1', () => paintPalm(T, 1), 7.2, 10);
      put('hut', () => paintSquadHut(T), 3.2, 10);
    }
    if (st === 'town') {
      put(`mill-${clean}-${clean ? 0 : f % 8}`, () => paintMill(T, clean, clean ? 0 : f % 8), 15, 10);
      put('house0', () => paintTownHouse(T, 0), 1.8, 10);
    }
    drawTiles(ctx, scene, cam, frame);
    if (st === 'beach') {
      put(`drain-${clean}-${f % 14}`, () => paintDrainPipe(T, clean ? 'medium' : 'none', f % 14, true, clean ? 0.2 : 0), 10, 10);
      if (clean) {
        for (const [i, k] of (['recycle', 'trash'] as BinKind[]).entries()) put(`bin-${k}`, () => paintBin(T, k), 1.2 + i * 0.7, 10);
        person('mar', MARISOL_VEGA, 6, 10);
        me('stand', 12.6, 10);
        put('ollie', () => paintOllie(T, 'happy'), 13.6, 10);
        put('turtle0', () => paintTurtle(1.5, 0), 15, 10);
        put(`turtle1-${f % 3}`, () => paintTurtle(1.5, f % 3), 18, 11.6);
        put('gullS', () => paintGull(T, 0, true), 7.9, 10);
        put(`gull-${f % 2}`, () => paintGull(T, f % 2), 12 + ((frame / 20) % 8), 3);
      } else {
        const litter: Array<[TrashId, number]> = [
          ['bottle', 1.4],
          ['can', 4.6],
          ['bag', 13.2],
          ['cap', 14.2],
          ['wrapper', 15.3],
          ['net', 8],
        ];
        for (const [id, x] of litter) put(`tr-${id}`, () => paintTrash(id, T, f % 2), x, 10);
        for (const x of [16.8, 18, 19.3]) put(`fl-${x}`, () => paintTrash(x === 18 ? 'bag' : 'bottle', T, f % 2), x, 10.3 + Math.sin(frame / 20 + x) * 0.08);
        put('shell', () => paintNatural('shell', T, 1), 11.6, 10);
        person('mar', MARISOL_VEGA, 5.8, 10);
        me('grab', 12.4, 10);
        put('tangled', () => paintOllie(T, 'tangled'), 7, 10);
        put(`gull-${f % 2}`, () => paintGull(T, f % 2), 17, 4);
      }
    } else if (st === 'harbor') {
      put('netbin', () => paintNetBin(T), 1.2, 10);
      put(`boat-${clean}-${f % 6}`, () => paintBoat(T, clean, f % 6), 14.4, 10.9);
      person('rafi', RAFI_HADDAD, 4.2, 10);
      if (clean) {
        put(`boom-${f % 4}`, () => paintBoom(T, 6, f % 4), 15.4, 10.4);
        put('pads', () => paintPads(T, 0.8), 2.8, 10);
        put(`kayak-${f % 4}`, () => paintKayak(CADET, T, 'right', f % 4), 10.6 + Math.sin(frame / 80) * 0.8, 10.55);
        for (const [i, x] of [11, 18].entries()) put(`fish-${i}-${f % 2}`, () => paintFish(T, f % 2, false, i ? '#f2c94c' : '#f2902f'), x + Math.sin(frame / 30 + i) * 1, 11.7);
        put('gullS', () => paintGull(T, 0, true), 8.2, 10);
        put('ollie', () => paintOllie(T, 'stand'), 6.4, 10);
      } else {
        for (const [i, [x, w]] of (
          [
            [11.6, 3],
            [17.2, 2],
          ] as const
        ).entries())
          put(`slick-${i}-${f % 4}`, () => paintOilSlick(T, w, f % 4), x, 10.42);
        put('ghost', () => paintGhostNet(T, 0), 18.8, 10.8);
        put('ghost2', () => paintGhostNet(T, 1), 10, 10.8);
        me('stand', 5.8, 10);
        put('ollie', () => paintOllie(T, 'stand'), 7.2, 10);
        put('tire', () => paintTrash('tire', T), 2.8, 10);
        put('rope', () => paintTrash('rope', T), 8.3, 10);
      }
    } else if (st === 'wetland') {
      person('wen', WEN_LI, 1.2, 10);
      put('kit', () => paintTestKit(T), 2.4, 10);
      me('stand', 3.4, 10);
      if (clean) {
        for (const [i, x] of [5.4, 12.4, 16.2, 19.4].entries()) put(`reed-${i}-${f % 4}`, () => paintReeds(T, i, f % 4), x, 11.2);
        put(`filter-${f % 4}`, () => paintFilter(T, ['gravel', 'sand', 'stones'], true, true, f % 4), 14.2, 10);
        put('heron', () => paintHeron(T, 0), 17.8, 11);
        put('frog', () => paintFrog(T, 0), 8.4, 9);
        for (const [i, x] of [7.5, 11, 18.2].entries()) put(`fish-${i}-${f % 2}`, () => paintFish(T, f % 2, false, ['#f2902f', '#9aa6b0', '#f2c94c'][i]), x + Math.sin(frame / 30 + i) * 0.8, 11.7);
        put('ollie', () => paintOllie(T, 'swim', f % 2), 9.5 + Math.sin(frame / 40) * 1.4, 10.4);
      } else {
        for (const [i, x] of [6.6, 10.6, 17.4].entries()) put(`gasp-${i}-${f % 2}`, () => paintFish(T, f % 2, true, ['#f2902f', '#9aa6b0', '#f2c94c'][i]), x, 10.5);
        put('logjam', () => paintNatural('driftlog', T), 14.4, 10);
        put('ollie', () => paintOllie(T, 'stand'), 4.3, 10);
      }
    } else if (st === 'town') {
      put(`field-${clean}-${f % 2}`, () => paintField(T, 5, clean ? 'cover' : 'bare', f % 2), 10.5, 10);
      put('drain', () => paintStormDrain(T, clean), 4.4, 10.06);
      person('rosa', ROSA_DELGADO, 13.6, 10);
      me('stand', 12.4, 10);
      if (clean) {
        put(`strip-${f % 4}`, () => paintBufferStrip(T, 3, f % 4), 15.6, 10);
        put('garden', () => paintRainGarden(T, true), 6.4, 10.2);
        put('barrel', () => paintRainBarrel(T), 3.2, 10);
        put('tree', () => paintShadeTree(T, 0), 0.6, 10);
        put('ollie', () => paintOllie(T, 'happy'), 11.4, 10);
        for (const [i, x] of [17.8, 19.2].entries()) put(`fish-${i}-${f % 2}`, () => paintFish(T, f % 2, false), x, 11.7);
      } else {
        put(`bus-${f % 3}`, () => paintBus(T, true, f % 3), 6.6, 10);
        for (const [i, x] of [15.2, 16.2].entries()) put(`run-${i}`, () => paintTrash(i ? 'wrapper' : 'can', T), x, 10);
        put('ollie', () => paintOllie(T, 'stand'), 11.2, 10);
      }
    }
    talk.tick(0);
    requestAnimationFrame(draw);
  };
  draw();
}

// ------------------------------------------------------------------ the Nature Center build view

const LOT_X0 = 0;
const LOT_X1 = 15;
const POND: [number, number] = [9, 12];

interface Placed {
  id: NatureId;
  x: number;
}

/** The Nature Center's rules for placing a piece at column x (it must fit, and not overlap). */
function canPlace(placed: readonly Placed[], id: NatureId, x: number): string | null {
  const info = NATURE[id];
  const cols = Array.from({ length: info.w }, (_, i) => x + i);
  if (cols.some((c) => c < LOT_X0 + 1 || c > LOT_X1 - 1)) return 'That doesn’t fit on the lot there.';
  const inPond = cols.map((c) => c >= POND[0] && c <= POND[1]);
  if (info.layer === 'pond' && !inPond.every(Boolean)) return `${info.name} grow in the pond.`;
  if (info.layer !== 'pond' && inPond.some(Boolean)) return 'That goes on dry ground, not in the pond.';
  const taken = new Set(placed.flatMap((p) => Array.from({ length: NATURE[p.id].w }, (_, i) => p.x + i)));
  if (cols.some((c) => taken.has(c))) return 'Something is already there. Remove it first.';
  return null;
}

/**
 * The build mode for the Nature Center: a palette of pieces, a cursor on the
 * lot, and visitors that come for what is built. Used by #coast-nature and
 * inside the crafting test.
 */
function natureBuilder(opts: { onExit?: () => void; say: (who: Speaker, text: string, secs?: number) => void; start?: Placed[] }) {
  const placed: Placed[] = [...(opts.start ?? [])];
  const seen = new Set<VisitorId>(
    visitorsFor(
      placed.map((p) => p.id),
      true,
    ),
  );
  let pick: NatureId | 'remove' = 'milkweed';
  let cursor = 3;
  const palette = h('div', { class: 'cs-palette', role: 'toolbar', 'aria-label': 'Nature Center pieces' });
  const buttons = new Map<string, HTMLButtonElement>();
  const choose = (id: NatureId | 'remove') => {
    pick = id;
    for (const [k, b] of buttons) b.classList.toggle('on', k === id);
    if (id !== 'remove') opts.say('Marisol', `${NATURE[id].name}: ${NATURE[id].helps}`, 6);
  };
  for (const id of NATURE_IDS) {
    const b = h('button', { type: 'button', 'aria-label': NATURE[id].name, 'data-piece': id }, cvs(paintNature(id, 16), 1), h('span', { text: NATURE[id].name }));
    b.addEventListener('click', () => choose(id));
    buttons.set(id, b as HTMLButtonElement);
    palette.append(b);
  }
  const rm = h('button', { type: 'button', text: 'Remove', 'data-piece': 'remove' });
  rm.addEventListener('click', () => choose('remove'));
  buttons.set('remove', rm as HTMLButtonElement);
  palette.append(rm);
  const book = h('span', { class: 'cs-book' });
  const exit = h('button', { type: 'button', text: opts.onExit ? 'Done building (Esc)' : 'Clear the lot' });
  exit.addEventListener('click', () => (opts.onExit ? opts.onExit() : (placed.splice(0), refresh())));
  const bar = h('div', { class: 'cs-bar' }, book, exit);
  const refresh = () => {
    const now = visitorsFor(
      placed.map((p) => p.id),
      true,
    );
    for (const v of now)
      if (!seen.has(v)) {
        seen.add(v);
        opts.say('Marisol', `A visitor! A ${VISITOR_NAME[v].toLowerCase()}. ${VISITOR_NEEDS[v].fact}`, 7);
      }
    book.textContent = `Visitor Book: ${seen.size} of ${Object.keys(VISITOR_NAME).length}`;
  };
  const act = (x = cursor) => {
    cursor = x;
    if (pick === 'remove') {
      const i = placed.findIndex((p) => x >= p.x && x < p.x + NATURE[p.id].w);
      if (i >= 0) placed.splice(i, 1);
      else opts.say('Marisol', 'Nothing to remove there.', 2.5);
    } else {
      const why = canPlace(placed, pick, x);
      if (why) opts.say('Marisol', why, 3);
      else placed.push({ id: pick, x });
    }
    refresh();
  };
  refresh();
  choose('milkweed');
  return {
    palette,
    bar,
    placed,
    seen,
    get cursor() {
      return cursor;
    },
    set cursor(v: number) {
      cursor = Math.max(LOT_X0 + 1, Math.min(LOT_X1 - 1, v));
    },
    get pick() {
      return pick;
    },
    choose,
    act,
    /** Draw the pieces, their visitors and the cursor. */
    draw(ctx: CanvasRenderingContext2D, cam: Camera, frame: number, showCursor: boolean) {
      const f = Math.floor(frame / 8);
      const groundY = 10;
      for (const p of placed) {
        const info = NATURE[p.id];
        const cx = p.x + info.w / 2;
        const y = info.layer === 'pond' ? groundY + 0.9 : groundY;
        drawAt(
          ctx,
          cached(`nat-${p.id}-${f % 4}`, () => paintNature(p.id, T, f % 4)),
          cx,
          y,
          cam,
        );
        if (p.id === 'compost')
          drawAt(
            ctx,
            cached(`vis-worm-${f % 2}`, () => paintVisitor('worm', T, f % 2)),
            cx,
            groundY + 1.4,
            cam,
          );
      }
      // visitors, near what they came for
      const here = visitorsFor(
        placed.map((p) => p.id),
        true,
      );
      for (const v of here) {
        if (v === 'worm') continue;
        const need = placed.find((p) => VISITOR_NEEDS[v].needs.includes(p.id));
        if (!need) continue;
        const cx = need.x + NATURE[need.id].w / 2;
        const bob = Math.sin(frame / 12 + cx) * 0.3;
        const at: Record<VisitorId, [number, number]> = {
          butterfly: [cx + Math.sin(frame / 30) * 0.8, groundY - 1.6 + bob],
          bee: [cx + 0.6 + Math.sin(frame / 18) * 0.5, groundY - 1.2 + bob],
          wren: [cx + 0.5, groundY - 1.25],
          bat: [cx + Math.sin(frame / 22) * 1.2, groundY - 2.2 + bob],
          frog: [cx - 0.4, groundY + 0.1],
          heron: [cx + 0.6, groundY + 0.2],
          worm: [cx, groundY],
          beetle: [cx + 0.6, groundY],
        };
        const [vx, vy] = at[v];
        drawAt(
          ctx,
          cached(`vis-${v}-${f % 2}`, () => (v === 'heron' ? paintHeron(T, 0) : paintVisitor(v, T, f % 2))),
          vx,
          vy,
          cam,
        );
      }
      if (showCursor) {
        const w = pick === 'remove' ? 1 : NATURE[pick].w;
        const ok = pick === 'remove' || !canPlace(placed, pick, cursor);
        ctx.strokeStyle = ok ? '#ffd84a' : '#ff6a5a';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(Math.round((cursor - cam.x) * T) + 1, Math.round((groundY - 3 - cam.y) * T), w * T - 2, 3 * T);
        ctx.setLineDash([]);
      }
    },
  };
}

function lotRows(): string[] {
  const rows: string[] = [];
  for (let y = 0; y < 12; y++) rows.push(y >= 10 ? '#'.repeat(20) : '.'.repeat(20));
  return rows;
}

export function showCoastNature(host: HTMLElement): void {
  const level = parseLevel(lotRows());
  const scene: Scene = { level, stretchAt: () => 'camp', murkAt: () => 'clear', clean: true, lot: { x0: LOT_X0, x1: LOT_X1, pond: POND }, backdrops: new Map() };
  const { canvas, ctx, box, wrap } = stage(host, 'The Nature Center: build freely');
  const talk = talkBox(box);
  const nb = natureBuilder({
    say: talk.say,
    start: [
      { id: 'beachgrass', x: 1 },
      { id: 'dunefence', x: 2 },
      { id: 'milkweed', x: 5 },
      { id: 'birdbox', x: 6 },
      { id: 'sunflower', x: 7 },
      { id: 'cattails', x: 10 },
      { id: 'cattails', x: 11 },
      { id: 'compost', x: 13 },
      { id: 'amberlight', x: 14 },
    ],
  });
  wrap.append(
    nb.palette,
    nb.bar,
    h('p', { class: 'cs-help', text: 'Pick a piece, then click a spot on the lot (or use the arrow keys and Enter). Remove takes a piece away. Animals visit for what you build.' }),
  );
  talk.say('Marisol', 'This lot is yours. Build whatever you like. See who comes to visit!', 6);
  const cam: Camera = { x: -2, y: level.map.h - VIEW_H };
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * VIEW_W + cam.x);
    nb.act(x);
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    nb.cursor = Math.floor(((e.clientX - r.left) / r.width) * VIEW_W + cam.x);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') nb.cursor = nb.cursor - 1;
    else if (e.code === 'ArrowRight') nb.cursor = nb.cursor + 1;
    else if (e.code === 'Enter' || e.code === 'Space') nb.act();
    else return;
    e.preventDefault();
  });
  let frame = 0;
  const draw = () => {
    frame++;
    drawBackdrop(ctx, scene, 'camp', cam);
    drawTiles(ctx, scene, cam, frame);
    nb.draw(ctx, cam, frame, true);
    drawAt(
      ctx,
      cached('hut-n', () => paintSquadHut(T)),
      18.6,
      10,
      cam,
    );
    talk.tick(1 / 60);
    requestAnimationFrame(draw);
  };
  (window as unknown as { __cn: unknown }).__cn = { nb, place: (id: NatureId, x: number) => (nb.choose(id), nb.act(x)) };
  draw();
}

/** A close-up of the drain pipe's mouth with a net, so the hole sizes are easy to compare. */
function netCloseUp(design: NetDesign): PixelBuffer {
  const full = paintDrainPipe(T, design, 0, false);
  const x0 = Math.round(T * 1.5);
  const y0 = Math.round(T * 0.65);
  const w = Math.round(T * 0.85);
  const hh = Math.round(T * 0.9);
  const out = new PixelBuffer(w, hh);
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) out.set(x, y, full.get(x0 + x, y0 + y) ?? '#cfe6ef');
  return out;
}

// ------------------------------------------------------------------ the playable crafting test

/**
 * The test level, left to right: the Nature Center lot (N is its sign),
 * Beach Camp (H the hut, W the Workbench, M Marisol, B the bins), Turtle
 * Beach with trash (letters a-l, see LITTER), shells (s), Ollie tangled in a
 * six-pack ring (O), hidden trash Ollie can sniff out (h), the drain pipe and
 * its blueprint stake (X), Squad flags (C) and the sea.
 */
export function buildCraftTest(): string[] {
  const W = 92;
  const H = 12;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('.'));
  const fill = (x0: number, x1: number, y0: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c;
  };
  fill(0, W - 1, 10, 11, '#');
  g[9][15] = 'N';
  g[9][20] = 'H';
  g[9][23] = 'P';
  g[9][25] = 'M';
  g[9][28] = 'W';
  g[9][31] = 'B';
  g[9][34] = 'C';
  // Turtle Beach
  g[9][37] = 'a';
  g[9][39] = 's';
  g[9][41] = 'b';
  fill(43, 44, 10, 11, '~'); // a tide channel: jump over it
  g[9][47] = 'c';
  g[9][49] = 'O';
  g[9][52] = 's';
  fill(54, 56, 8, 9, '#'); // a dune step
  g[7][55] = 'd';
  fill(58, 61, 6, 6, '='); // driftwood ledges with rope and wood on top
  g[5][59] = 'e';
  g[5][60] = 'f';
  g[9][63] = 'h';
  g[9][64] = 'C';
  g[9][65] = 'g';
  fill(66, 69, 8, 9, '#'); // the dune bank the drain pipe comes out of
  g[9][72] = 'X';
  g[9][74] = 'i';
  g[9][75] = 'j';
  fill(77, W - 1, 10, 11, '~'); // the sea
  return g.map((r) => r.join(''));
}

/** What each litter letter is. */
const LITTER: Record<string, TrashId> = { a: 'bottle', b: 'can', c: 'wrapper', d: 'net', e: 'rope', f: 'wood', g: 'bottle', h: 'wood', i: 'cap', j: 'bag', k: 'glass' };

/** The middle of the drain pipe's picture; its mouth (where trash comes out) is a little to the right. */
const PIPE_X = 70;
const MOUTH_X = 71.4;

interface Pick {
  id: TrashId;
  x: number;
  y: number;
  got: boolean;
  hidden?: boolean;
  /** Washed out of the drain (new trash). */
  fresh?: boolean;
  vx?: number;
}

export function showCoastPlay(host: HTMLElement): void {
  const rows = buildCraftTest();
  const level = parseLevel(rows);
  const things = level.things;
  const at = (k: string) => things.find((t) => t.kind === k)!;
  const scene: Scene = {
    level,
    stretchAt: (x) => (x < 35 ? 'camp' : 'beach'),
    murkAt: () => 'trash',
    clean: false,
    lot: { x0: LOT_X0, x1: LOT_X1, pond: POND },
    backdrops: new Map(),
  };
  const { canvas, ctx, box, wrap } = stage(host, 'Pollution Solution Squad: crafting test');
  const talk = talkBox(box);
  const say = talk.say;
  const sign = at('N');
  const bench = at('W');
  const marisol = at('M');
  const stake = at('X');
  const ollieT = at('O');
  const flags = things.filter((t) => t.kind === 'C').map((t) => ({ x: t.x, y: t.y, lit: false }));
  const shells = things.filter((t) => t.kind === 's');
  let picks: Pick[] = [];
  let inv: Inventory = {};
  let tuning: Tuning = NORMAL;
  let easy = false;
  const b: Body = newBody(0, 0);
  let respawn = { x: level.spawn.x, y: level.spawn.y };
  let cam: Camera = { x: 0, y: 0 };
  let frame = 0;
  let time = 0;
  let grabT = 0;
  let ollie: { free: boolean; x: number; y: number; face: 1 | -1; sniff: number } = { free: false, x: ollieT.x + 0.5, y: ollieT.y + 1, face: -1, sniff: 0 };
  let net: NetDesign = 'none';
  let carrying: NetDesign | null = null;
  let testing = 0;
  let clog = 0;
  let washT = 0;
  let washed = 0;
  let fixed = false;
  let mode: 'play' | 'panel' | 'build' = 'play';
  let started = 0;
  let nb: ReturnType<typeof natureBuilder> | null = null;

  const reset = () => {
    picks = things.filter((t) => LITTER[t.kind]).map((t) => ({ id: LITTER[t.kind], x: t.x + 0.5, y: t.y + 1, got: false, hidden: t.kind === 'h' }));
    inv = {};
    for (const k of flags) k.lit = false;
    ollie = { free: false, x: ollieT.x + 0.5, y: ollieT.y + 1, face: -1, sniff: 0 };
    net = 'none';
    carrying = null;
    testing = 0;
    clog = 0;
    washT = 0;
    washed = 0;
    fixed = false;
    time = 0;
    mode = 'play';
    started = 0;
    respawn = { x: level.spawn.x, y: level.spawn.y };
    placeAt(b, respawn.x, respawn.y);
    b.facing = 1;
    cam = follow(cam, b, VIEW_W, VIEW_H, level.map, 0, true);
    closePanel();
    say('Marisol', 'We cleaned Turtle Beach yesterday, and the trash is back! Grab what you find (G), and we’ll find out where it comes from.', 7);
  };

  // ---------------------------------------------------------------- the HUD: the backpack and the beach's trash gauge
  const hud = h('div', { class: 'cs-hud' });
  const bag = h('span', { class: 'item' });
  const gauge = h('span', { class: 'cs-gauge' }, cvs(paintGaugeIcon(16, 'trash'), 1), h('span', { text: 'Trash' }), h('i', {}, h('b', {})));
  hud.append(bag, h('span', { class: 'gap' }), gauge);
  const panel = h('div', { class: 'cs-panel' });
  panel.hidden = true;
  box.append(hud, panel);

  const held = { left: false, right: false, jump: false };
  let jumpPressed = false;
  const bar = h('div', { class: 'cs-bar' });
  const pad = h('div', { class: 'cs-pad' });
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
  const grabBtn = h('button', { type: 'button', 'aria-label': 'Grab (key G)' }, h('span', { text: 'Grab' }), h('kbd', { text: 'G' }));
  grabBtn.addEventListener('click', () => grab());
  const useBtn = h('button', { type: 'button', 'aria-label': 'Use (key E)' }, h('span', { text: 'Use' }), h('kbd', { text: 'E' }));
  useBtn.addEventListener('click', () => use());
  const easyBtn = h('button', { type: 'button', text: 'Easy: off' });
  easyBtn.addEventListener('click', () => setEasy(!easy));
  const againBtn = h('button', { type: 'button', text: 'Start again' });
  againBtn.addEventListener('click', () => reset());
  bar.append(pad, grabBtn, useBtn, easyBtn, againBtn);
  const help = h('p', {
    class: 'cs-help',
    text: 'Arrows or A and D to run, Space, W or Up to jump. G grabs trash in front of you. E uses what you are next to: Marisol, the Workbench, the blueprint stake, the Nature Center sign. Falling in the water takes you back to the last Squad flag.',
  });
  wrap.append(bar, help);

  function setEasy(on: boolean): void {
    easy = on;
    tuning = on ? EASY : NORMAL;
    easyBtn.textContent = `Easy: ${on ? 'on' : 'off'}`;
    easyBtn.classList.toggle('on', on);
  }

  const KEYS: Record<string, 'left' | 'right' | 'jump'> = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };
  window.addEventListener('keydown', (e) => {
    if (mode === 'build' && nb) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') nb.cursor = nb.cursor - 1;
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') nb.cursor = nb.cursor + 1;
      else if (e.code === 'Enter' || e.code === 'Space') nb.act();
      else if (e.code === 'Escape' || e.code === 'KeyE') leaveBuild();
      else return;
      e.preventDefault();
      return;
    }
    if (mode === 'panel') {
      if (e.code === 'Escape') closePanel();
      return;
    }
    const k = KEYS[e.code];
    if (k) {
      e.preventDefault();
      if (k === 'jump' && !held.jump) jumpPressed = true;
      held[k] = true;
      return;
    }
    if (e.repeat) return;
    if (e.code === 'KeyG' || e.code === 'ArrowDown' || e.code === 'KeyS') grab();
    else if (e.code === 'KeyE' || e.code === 'Enter') use();
    else if (e.code === 'KeyR') reset();
  });
  window.addEventListener('keyup', (e) => {
    const k = KEYS[e.code];
    if (k) held[k] = false;
  });

  const cx = () => b.x + b.w / 2;
  const near = (x: number, r = 1.4) => Math.abs(x - cx()) <= r;
  const bagText = () =>
    Object.entries(inv)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `${n} ${MATERIAL_NAME[id].toLowerCase()}`)
      .join(', ');

  // ---------------------------------------------------------------- grabbing
  function grab(): void {
    if (mode !== 'play') return;
    grabT = 0.35;
    const reach = cx() + b.facing * 0.7;
    const onFloor = b.onGround;
    // Ollie, tangled in the ring
    if (!ollie.free && Math.abs(ollie.x - reach) < 1.2 && onFloor) {
      ollie.free = true;
      inv = add(inv, 'ring');
      say('Ollie', 'Squeak! (Ollie the river otter is free, and wants to come with you.)', 4);
      setTimeout(() => say('Marisol', 'Plastic rings catch animals. Cut them up before they go in the trash. Ollie can sniff out trash hidden in the sand!', 7), 4200);
      return;
    }
    const p = picks.find((q) => !q.got && Math.abs(q.x - reach) < 0.9 && Math.abs(q.y - (b.y + b.h)) < 1.2 && (!q.hidden || ollie.sniff > 0));
    if (p) {
      p.got = true;
      inv = add(inv, p.id);
      const extra = p.id === 'bag' ? ' A turtle could mistake it for a jellyfish.' : p.id === 'cap' ? ' Small pieces are easy for birds to swallow.' : '';
      say('Marisol', `${TRASH[p.id].name}! ${TRASH[p.id].material}.${extra}`, 3.5);
      return;
    }
    const sh = shells.find((s) => Math.abs(s.x + 0.5 - reach) < 0.9);
    if (sh) {
      say('Marisol', 'Leave that shell! Shells are homes and food for beach animals. Take only trash.', 4.5);
      return;
    }
  }

  // ---------------------------------------------------------------- using things: Marisol, the Workbench, the stake, the Nature Center sign
  function use(): void {
    if (mode !== 'play') return;
    if (near(bench.x + 0.5, 1.8)) return openBench();
    if (near(stake.x + 0.5, 1.6)) return useStake();
    if (near(sign.x + 0.5, 1.6)) return enterBuild();
    if (near(marisol.x + 0.5, 1.4)) {
      const m = missing(inv, DRAIN_NET);
      if (fixed) say('Marisol', 'The net works! But the trash came down the drain from somewhere upstream. That’s our next trip.', 6);
      else if (carrying) say('Marisol', 'You made a drain net! Take it to the blueprint stake by the drain pipe and press E.', 5);
      else if (Object.keys(m).length)
        say('Marisol', `The trash comes out of the drain pipe at the end of the beach. Rafi has a blueprint for a net. You still need ${missingText(m, MATERIAL_NAME)}.`, 7);
      else say('Marisol', 'You have what the net needs. Use the Workbench!', 4);
      return;
    }
    say('Marisol', 'Nothing to use here. Try the Workbench, the stake by the drain, or the Nature Center sign.', 3.5);
  }

  function closePanel(): void {
    panel.hidden = true;
    panel.replaceChildren();
    if (mode === 'panel') mode = 'play';
    canvas.focus();
  }

  function openBench(): void {
    mode = 'panel';
    const sheet = h('div', { class: 'cs-sheet', role: 'dialog', 'aria-label': 'The Workbench' });
    const m = missing(inv, DRAIN_NET);
    const can = canCraft(inv, DRAIN_NET);
    const bagRow = h(
      'div',
      { class: 'bag' },
      h('strong', { text: 'Needs:' }),
      ...Object.entries(DRAIN_NET.needs).map(([id, n]) => {
        const have = Math.min(n, inv[id] ?? 0);
        return h('span', { class: have < n ? 'need' : '' }, cvs(paintTrash(id as TrashId, 16), 1), h('span', { text: `${MATERIAL_NAME[id]} ${have}/${n}` }));
      }),
    );
    sheet.append(
      h('h3', { text: 'Rafi’s Workbench: the drain net' }),
      h(
        'div',
        { class: 'cols' },
        h('div', {}, h('strong', { text: 'Goals: what it must do' }), h('ul', {}, ...DRAIN_NET.goals.map((g) => h('li', { text: g })))),
        h('div', {}, h('strong', { text: 'Limits: what we have' }), h('ul', {}, ...DRAIN_NET.limits.map((g) => h('li', { text: g })))),
      ),
      bagRow,
    );
    if (carrying) sheet.append(h('p', { text: 'You are already carrying a net. Build it at the stake by the drain, or take it apart here.' }));
    else if (net !== 'none' && !fixed) sheet.append(h('p', { text: 'A net is on the drain. Take it down at the stake to get the materials back.' }));
    const designs = h('div', { class: 'cs-designs' });
    for (const d of DRAIN_NET.designs) {
      const btn = h('button', { type: 'button', 'data-design': d.id }, cvs(netCloseUp(d.id as NetDesign), 3), h('span', { text: d.name }), h('small', { text: d.note })) as HTMLButtonElement;
      btn.disabled = !can || !!carrying || net !== 'none';
      btn.addEventListener('click', () => {
        inv = craft(inv, DRAIN_NET);
        carrying = d.id as NetDesign;
        closePanel();
        say('Rafi', `A net with ${d.name.toLowerCase()}. Now build it on the drain pipe and we’ll test it. Engineers always test!`, 6);
      });
      designs.append(btn);
    }
    sheet.append(h('p', { text: 'Pick a design. Which hole size meets every goal?' }), designs);
    if (!can && !carrying) sheet.append(h('p', { class: 'need', text: `Still to find: ${missingText(m, MATERIAL_NAME)}. Look along the beach, and up on the driftwood.` }));
    const row = h('div', { class: 'row' });
    if (carrying) {
      const apart = h('button', { type: 'button', class: 'alt', text: 'Take the net apart' });
      apart.addEventListener('click', () => {
        inv = takeDown(inv, DRAIN_NET);
        carrying = null;
        closePanel();
        say('Rafi', 'Taken apart. Pick another design whenever you like.', 4);
      });
      row.append(apart);
    }
    const close = h('button', { type: 'button', text: 'Close' });
    close.addEventListener('click', () => closePanel());
    row.append(close);
    sheet.append(row);
    panel.replaceChildren(sheet);
    panel.hidden = false;
    (sheet.querySelector('button:not([disabled])') as HTMLButtonElement | null)?.focus();
  }

  function useStake(): void {
    if (testing > 0) return;
    if (carrying) {
      net = carrying;
      carrying = null;
      testing = 5;
      clog = 0;
      say('Rafi', 'It’s on! Now watch what comes out of the drain when the water runs.', 5);
      return;
    }
    if (net !== 'none' && !fixed) {
      inv = takeDown(inv, DRAIN_NET);
      net = 'none';
      say('Rafi', 'Taken down: the materials are back in your backpack. Pick a better design at the Workbench.', 5);
      return;
    }
    if (fixed) say('Rafi', 'The net is doing its job. The Squad will empty it after every big rain.', 4);
    else say('Rafi', 'This is the blueprint stake. Craft a drain net at the Workbench, then build it here.', 4.5);
  }

  function showResult(): void {
    const d = DRAIN_NET.designs.find((x) => x.id === net)!;
    mode = 'panel';
    const sheet = h('div', { class: 'cs-sheet', role: 'dialog', 'aria-label': 'Test result' });
    sheet.append(h('h3', { text: d.outcome === 'works' ? 'Test result: it works!' : 'Test result: it only half works' }), h('p', { text: d.why }));
    const row = h('div', { class: 'row' });
    if (d.outcome === 'works') {
      fixed = true;
      sheet.append(h('p', { text: 'The beach stays clean. But all that trash came down the drain from somewhere upstream. That’s where the Squad goes next.' }));
      const ok = h('button', { type: 'button', text: 'Great!' });
      ok.addEventListener('click', () => {
        closePanel();
        say('Marisol', 'You found the problem, tested a fix and made it better. That’s engineering! Try the Nature Center next to camp (press E at its sign).', 8);
      });
      row.append(ok);
    } else {
      sheet.append(h('p', { text: 'Engineers test, look at what went wrong, and improve the design. Take it down at the stake and try another.' }));
      const down = h('button', { type: 'button', text: 'Take it down' });
      down.addEventListener('click', () => {
        inv = takeDown(inv, DRAIN_NET);
        net = 'none';
        closePanel();
        say('Rafi', 'The materials are back in your backpack. Back to the Workbench!', 4);
      });
      const keep = h('button', { type: 'button', class: 'alt', text: 'Leave it for now' });
      keep.addEventListener('click', () => closePanel());
      row.append(keep, down);
    }
    sheet.append(row);
    panel.replaceChildren(sheet);
    panel.hidden = false;
    (sheet.querySelector('button') as HTMLButtonElement).focus();
  }

  // ---------------------------------------------------------------- the Nature Center build mode
  const buildWrap = h('div', {});
  buildWrap.hidden = true;
  wrap.insertBefore(buildWrap, bar);
  function enterBuild(): void {
    mode = 'build';
    if (!nb) {
      nb = natureBuilder({ say, onExit: () => leaveBuild() });
      buildWrap.append(nb.palette, nb.bar);
    }
    buildWrap.hidden = false;
    bar.hidden = true;
    say('Marisol', 'The Nature Center lot is yours. Build anything you like, and see who comes to visit. Press Esc when you are done.', 7);
  }
  function leaveBuild(): void {
    mode = 'play';
    buildWrap.hidden = true;
    bar.hidden = false;
    canvas.focus();
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (mode !== 'build' || !nb) return;
    const r = canvas.getBoundingClientRect();
    nb.act(Math.floor(((e.clientX - r.left) / r.width) * VIEW_W + cam.x));
  });
  canvas.addEventListener('pointermove', (e) => {
    if (mode !== 'build' || !nb) return;
    const r = canvas.getBoundingClientRect();
    nb.cursor = Math.floor(((e.clientX - r.left) / r.width) * VIEW_W + cam.x);
  });

  // ---------------------------------------------------------------- one step of the game
  function stepGame(dt: number): void {
    time += dt;
    talk.tick(dt);
    if (mode === 'build') {
      cam = { x: cam.x + (-2 - cam.x) * Math.min(1, dt * 4), y: level.map.h - VIEW_H };
      return;
    }
    if (mode === 'panel') return;
    started += dt;
    const c: Controls = { left: held.left, right: held.right, jump: jumpPressed, jumpHeld: held.jump };
    jumpPressed = false;
    const ev = step(b, c, level.map, [], tuning, dt);
    if (ev.fell) {
      placeAt(b, respawn.x, respawn.y);
      say('Marisol', 'Splash! Back to the Squad flag.', 2.5);
      cam = follow(cam, b, VIEW_W, VIEW_H, level.map, 0, true);
    }
    for (const k of flags)
      if (!k.lit && near(k.x + 0.5, 0.8)) {
        k.lit = true;
        respawn = { x: k.x, y: k.y };
      }
    // Ollie follows once free, and sniffs out the hidden wood
    if (ollie.free) {
      const tx = cx() - b.facing * 1.4;
      const d = tx - ollie.x;
      ollie.x += Math.sign(d) * Math.min(Math.abs(d), dt * 6.5);
      if (Math.abs(d) > 0.1) ollie.face = d > 0 ? 1 : -1;
      ollie.y = b.onGround ? b.y + b.h : ollie.y;
      const hid = picks.find((p) => p.hidden && !p.got);
      if (hid && Math.abs(hid.x - ollie.x) < 2.5) {
        if (ollie.sniff <= 0) say('Ollie', 'Sniff sniff! (Ollie found something buried in the sand. Grab it!)', 4);
        ollie.sniff = 3;
      } else if (ollie.sniff > 0) ollie.sniff -= dt;
    }
    // the drain keeps washing new trash onto the beach, until a net that works is on it
    washT += dt;
    const leaks = net === 'none' || net === 'big' || (net === 'small' && clog > 0.7);
    if (washT > (testing > 0 ? 1.2 : 9) && (leaks || testing > 0) && washed < 30) {
      washT = 0;
      const kinds: TrashId[] = net === 'big' ? ['cap', 'wrapper'] : ['bottle', 'can', 'bag', 'wrapper', 'cap'];
      if (leaks) {
        picks.push({ id: kinds[washed % kinds.length], x: MOUTH_X, y: 10, got: false, fresh: true, vx: 2.2 + (washed % 3) * 0.5 });
        washed++;
      }
    }
    for (const p of picks)
      if (p.vx) {
        p.x += p.vx * dt;
        p.vx *= Math.pow(0.4, dt);
        if (Math.abs(p.vx) < 0.2) p.vx = 0;
      }
    if (testing > 0) {
      testing -= dt;
      if (net === 'small') clog = Math.min(1, clog + dt * 0.4);
      if (net === 'medium') clog = Math.min(0.25, clog + dt * 0.05);
      if (testing <= 0) showResult();
    }
    if (grabT > 0) grabT -= dt;
    cam = follow(cam, b, VIEW_W, VIEW_H, level.map, dt);
  }

  // ---------------------------------------------------------------- drawing
  function draw(): void {
    frame++;
    const f = Math.floor(frame / 8);
    const put = (key: string, make: () => PixelBuffer, x: number, y: number) => drawAt(ctx, cached(key, make), x, y, cam);
    const mix = Math.max(0, Math.min(1, (cam.x + VIEW_W / 2 - 30) / 8));
    drawBackdrop(ctx, scene, 'camp', cam);
    if (mix > 0) drawBackdrop(ctx, scene, 'beach', cam, mix);
    for (const x of [17.5, 33, 46, 62]) put(`palm-${x % 2}`, () => paintPalm(T, Math.round(x) % 2), x, 10);
    put('hut', () => paintSquadHut(T), at('H').x + 0.5, 10);
    drawTiles(ctx, scene, cam, frame);
    put(`drain-${net}-${f % 14}-${Math.round(clog * 10)}`, () => paintDrainPipe(T, net, f % 14, true, clog), PIPE_X, 10);
    put(`stake-${!!carrying}-${f % 4}`, () => paintStake(T, !!carrying && net === 'none', f % 4), stake.x + 0.5, 10);
    put('bench', () => paintWorkbench(T), bench.x + 0.5, 10);
    (['recycle', 'compost', 'trash', 'hazard'] as BinKind[]).forEach((k, i) => put(`bin-${k}`, () => paintBin(T, k), at('B').x - 0.6 + i * 0.6, 10));
    put('sign', () => paintNature('sign', T), sign.x + 0.5, 10);
    for (const k of flags) put(`flag-${k.lit}-${k.lit ? f % 8 : 0}`, () => paintSquadFlag(T, k.lit, f % 8), k.x + 0.5, k.y + 1);
    for (const s of shells) put(`shell-${s.x % 2}`, () => paintNatural('shell', T, s.x % 2), s.x + 0.5, 10);
    nb?.draw(ctx, cam, frame, mode === 'build');
    put('mar', () => paintHero(MARISOL_VEGA, 1.5, 'left'), marisol.x + 0.5, 10);
    put('rafi', () => paintHero(RAFI_HADDAD, 1.5, 'left'), bench.x + 2.4, 10);
    for (const p of picks) {
      if (p.got) continue;
      if (p.hidden) {
        if (ollie.sniff > 0) put(`spark-${f % 4}`, () => paintSparkle(T, f % 4), p.x, p.y - 0.1);
        continue;
      }
      put(`tr-${p.id}-${f % 2}`, () => paintTrash(p.id, T, f % 2), p.x, p.y);
    }
    // floating trash out at sea
    for (const [i, x] of [80.5, 84, 88].entries()) if (!fixed) put(`fl-${i}-${f % 2}`, () => paintTrash(i === 1 ? 'bag' : 'bottle', T, f % 2), x, 10.3 + Math.sin(frame / 20 + i) * 0.06);
    // Ollie
    const opose: OlliePose = !ollie.free ? 'tangled' : ollie.sniff > 0 ? 'sniff' : Math.abs(ollie.x - (cx() - b.facing * 1.4)) > 0.2 ? 'run' : 'stand';
    put(`ollie-${opose}-${ollie.face}-${f % 2}`, () => paintOllie(T, opose, f % 2, ollie.face > 0 ? 'right' : 'left'), ollie.x, ollie.y);
    // the cadet
    const face = b.facing > 0 ? 'right' : 'left';
    let pose: CadetPose = 'stand';
    if (grabT > 0) pose = 'grab';
    else if (!b.onGround) pose = b.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(b.vx) > 0.4) pose = 'run';
    const wf = pose === 'run' ? Math.floor(frame / 6) % 4 : pose === 'grab' ? (grabT > 0.18 ? 0 : 1) : 0;
    const blink = pose === 'stand' && frame % 200 < 8;
    if (mode !== 'build') put(`me-${pose}-${face}-${wf}-${blink}`, () => paintCadet(CADET, T, face, { pose, frame: wf, blink }), cx(), b.y + b.h);
    if (carrying && mode === 'play') put('carry-net', () => paintTrash('net', 16), cx(), b.y - 0.1);
    // the HUD
    const t = bagText();
    if (bag.dataset.t !== t) {
      bag.dataset.t = t;
      bag.textContent = t ? `Backpack: ${t}${carrying ? ', and a drain net' : ''}` : carrying ? 'Backpack: a drain net' : 'Backpack: empty';
    }
    const onBeach = picks.filter((p) => !p.got && !p.hidden).length;
    const level01 = Math.min(1, onBeach / 10);
    const bfill = gauge.querySelector('b') as HTMLElement;
    bfill.style.width = `${Math.round(level01 * 100)}%`;
    bfill.style.background = level01 > 0.6 ? '#e0503a' : level01 > 0.25 ? '#f2c94c' : '#3aa65a';
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
  canvas.setAttribute('aria-label', 'The crafting test. Use the arrow keys to run, Space to jump, G to grab and E to use.');
  // a hook for the browser checks
  (window as unknown as { __cs: unknown }).__cs = {
    body: b,
    state: () => ({
      inv: { ...inv },
      carrying,
      net,
      fixed,
      mode,
      ollieFree: ollie.free,
      testing: testing > 0,
      onBeach: picks.filter((p) => !p.got && !p.hidden).length,
      visitors: nb ? [...nb.seen] : [],
    }),
    teleport: (x: number) => {
      placeAt(b, x, 9);
      cam = follow(cam, b, VIEW_W, VIEW_H, level.map, 0, true);
    },
    face: (d: 1 | -1) => (b.facing = d),
    grab,
    use,
    place: (id: NatureId, x: number) => {
      if (nb) {
        nb.choose(id);
        nb.act(x);
      }
    },
    things: () => things.map((t) => ({ kind: t.kind, x: t.x, y: t.y })),
  };
  requestAnimationFrame(loop);
}
