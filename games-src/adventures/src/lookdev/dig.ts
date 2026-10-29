import * as THREE from 'three';
import { PixelBuffer } from '../kit/art/pixel';
import type { Expression } from '../kit/art/portraits';
import { h } from '../kit/ui/dom';
import { Talk, type Speaker } from '../kit/ui/talk';
import { Lighting } from '../kit/world/sceneKit';
import { Figure, Stage, type SceneCtx, type TimeOfDay } from '../kit/worlds';
import '../kit/worlds/worlds.css';
import '../kit/worlds/wild-lands/wild.css';
import { paintHero, paintPortrait16, PLAYER16, type Look16, type Mood } from '../kit/worlds/hero16';
import { RANGER_TALA, paintLabTent } from '../kit/worlds/wild-lands/art';
import { DIG_SITE, DIG_SPOTS, paintCliffFace } from '../kit/worlds/wild-lands/dig';
import {
  FOSSIL_IDS,
  HANA_SATO,
  MATEO_RUIZ,
  SAM_BELLO,
  SKELETON_PARTS,
  glowsUnderUV,
  paintFossil,
  paintJacket,
  paintJuniper,
  paintMuseum,
  paintPebble,
  paintPebblePortrait,
  paintSage,
  paintSieve,
  paintSignPost,
  paintSkeleton,
  paintToolRack,
  paintUVLamp,
  paintWheelbarrow,
  type FossilId,
} from '../kit/worlds/wild-lands/dig-art';
import { paintCliffView, paintGlowRoom, paintQuarryView, paintTrackwayView, sampleQuarry } from '../kit/worlds/wild-lands/dig-views';
import { WILD_LANDS } from '../kit/worlds/wild-lands/style';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Fossil Dig Adventure, the second Wild Lands game (the
 * S2 section of docs/GAMES_3D_UPGRADE_PLAN.md):
 *   #dig-cast       the people, Pebble, the 16 fossils (and under the ultraviolet lamp), the skeleton and the props
 *   #dig-site       the dig site by day (#dig-site-evening at dusk)
 *   #dig-quarry     the quarry square from above, mid-dig
 *   #dig-cliff      the cliff's rock layers up close
 *   #dig-trackway   the footprint slab with a tape measure, and Pebble's prints
 *   #dig-glow       the Glow Room (#dig-glow-uv with the ultraviolet lamp on)
 * Not shipped: dev server only.
 */

const T = WILD_LANDS.px;

export const FOSSIL_NAMES: Record<FossilId, string> = {
  'trex-tooth': 'T. rex tooth',
  'trike-horn': 'Triceratops horn',
  'raptor-claw': 'Raptor claw',
  'pterosaur-bone': 'Pterosaur wing bone',
  trilobite: 'Trilobite',
  ammonite: 'Ammonite',
  fern: 'Fern',
  fish: 'Ancient fish',
  'mammoth-tusk': 'Mammoth tusk',
  'shark-tooth': 'Shark tooth',
  coprolite: 'Coprolite (fossil poop)',
  footprint: 'Footprint',
  burrow: 'Burrow',
  amber: 'Amber with an insect',
  'petrified-wood': 'Petrified wood',
  eggshell: 'Dinosaur eggshell',
};

function speaker(name: string, role: string, look: Look16, voice: number): Speaker {
  const pics: Partial<Record<Mood, string>> = {};
  const pic = (m: Mood) => (pics[m] ??= paintPortrait16(look, m).toDataURL(2));
  return { name, role, voice, portrait: (e: Expression) => pic(e === 'thinking' ? 'thinking' : e === 'curious' ? 'curious' : 'smile') };
}

function pebbleSpeaker(): Speaker {
  const happy = paintPebblePortrait(true).toDataURL(2);
  const flat = paintPebblePortrait(false).toDataURL(2);
  return { name: 'Pebble', role: 'The camp’s sniffer dog', voice: 360, portrait: (e: Expression) => (e === 'thinking' ? flat : happy) };
}

const MATEO = () => speaker('Dr. Mateo Ruiz', 'Paleontologist', MATEO_RUIZ, 150);
const HANA = () => speaker('Hana Sato', 'Geologist', HANA_SATO, 210);
const SAM = () => speaker('Sam Bello', 'Fossil preparator', SAM_BELLO, 170);
const TALA = () => speaker('Ranger Tala', 'Wild Lands guide', RANGER_TALA, 160);

const LINES = {
  day: 'Welcome to the dig! I am Dr. Mateo Ruiz. These striped hills are full of fossils. Pebble sniffs out good spots, and we dig them out very carefully.',
  evening: 'The cliffs glow orange at sunset. Tonight the museum lights are on. Soon we will turn on the ultraviolet lamp and see which fossils glow!',
  quarry: 'Each square of string has a number, so we can map where every bone lies. Loose dirt comes off with the shovel. Near a bone, only the brush is safe.',
  cliff: 'Rock layers stack up like pages in a book. The bottom layer was laid down first, so it is the oldest. The top layer is the youngest.',
  trackway: 'These footprints were pressed into mud long ago. See how the steps get longer? This dinosaur started to run! Pebble’s prints do the same.',
  glow: 'This is the Glow Room. Under ordinary light, these fossils look plain.',
  glowUV: 'Now the ultraviolet lamp is on. Some fossils glow! Minerals in them give off light. Scientists use this to spot hidden details.',
};

// ------------------------------------------------------------------ the dig site

export function showDigSite(host: HTMLElement, q: URLSearchParams): void {
  const time: TimeOfDay = q.get('time') === 'evening' ? 'evening' : 'day';
  document.body.classList.add(WILD_LANDS.panelClass);
  const stage = new Stage(host, T);
  stage.maxTilesTall = 22;
  const ctx: SceneCtx = { scene: new THREE.Scene(), lighting: new Lighting(), px: T, time };
  const built = DIG_SITE.build(ctx);
  stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
  ctx.lighting.set(WILD_LANDS.tint[time], time === 'evening' ? 1 : 0);
  stage.setBounds(built.map.w, built.map.h);
  const place = () => {
    const { w: vw, h: vh } = stage.viewTiles;
    const cy = Math.min(Math.max(built.focus.top + vh / 2, built.focus.feet + 1.4 - vh / 2), built.map.h - vh / 2);
    const cx = Math.min(Math.max(built.focus.x, vw / 2), built.map.w - vw / 2);
    stage.lookAt(vw >= built.map.w ? built.map.w / 2 : cx, cy, false);
  };
  place();
  window.addEventListener('resize', () => {
    stage.resize();
    place();
  });
  const figs: Figure[] = [];
  const person = (look: Look16, dir: 'down' | 'left' | 'right', x: number, y: number) => {
    figs.push(new Figure(ctx, [paintHero(look, 1.5, dir).toCanvas(), paintHero(look, 1.5, dir, { blink: true }).toCanvas()], x, y));
  };
  person(PLAYER16, 'down', DIG_SPOTS.player.x, DIG_SPOTS.player.y);
  person(MATEO_RUIZ, 'right', DIG_SPOTS.host.x, DIG_SPOTS.host.y);
  person(HANA_SATO, 'down', DIG_SPOTS.hana.x, DIG_SPOTS.hana.y);
  person(SAM_BELLO, 'down', DIG_SPOTS.sam.x, DIG_SPOTS.sam.y);
  person(RANGER_TALA, 'left', DIG_SPOTS.tala.x, DIG_SPOTS.tala.y);
  host.appendChild(
    h(
      'div',
      { class: 'ld-label panel' },
      h('strong', { text: `Wild Lands: ${DIG_SITE.name} (${WILD_LANDS.timeNames[time]})` }),
      h('span', { text: `${T} pixels per tile · look development for Fossil Dig Adventure` }),
      h('div', { class: 'ld-row' }, pageNav(currentToken().replace('-quiet', '') || 'dig-site', true)),
    ),
  );
  if (q.get('talk') !== '0') void new Talk(host).say(MATEO(), LINES[time], 'smile');
  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    built.update(t, stage.target.x);
    figs.forEach((f, i) => f.frame((t + i * 0.7) % 3.4 > 3.25 ? 1 : 0));
    stage.render(ctx.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage } });
}

// ------------------------------------------------------------------ the station close-ups

type Area = 'quarry' | 'cliff' | 'trackway' | 'glow';

const LAYER_NAMES: Record<string, string> = {
  today: 'Today: soil and sagebrush',
  ice: 'The Ice Age: gravel (mammoths)',
  river: 'Dinosaurs: a river plain (sandstone)',
  swamp: 'A swamp forest: shale and coal (ferns)',
  sea: 'A shallow sea: limestone (trilobites, ammonites)',
};

export function showDigView(host: HTMLElement, q: URLSearchParams): void {
  document.body.classList.add(WILD_LANDS.panelClass);
  const area = (q.get('area') ?? 'quarry') as Area;
  const uv = q.get('uv') === '1';
  const wrap = h('div', { class: 'ld-dig-view' });
  wrap.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#2a1e18';
  host.appendChild(wrap);
  const box = h('div', {});
  box.style.cssText = 'position:relative;max-width:100%;max-height:100%';
  wrap.appendChild(box);
  const W = 320;
  const H = 200;
  let pic: PixelBuffer;
  const tags: Array<[string, number, number]> = [];
  if (area === 'quarry') pic = paintQuarryView(W, H, sampleQuarry());
  else if (area === 'cliff') {
    const v = paintCliffView(W, H);
    pic = v.buf;
    for (const [id, m] of Object.entries(v.mids)) tags.push([LAYER_NAMES[id], 0.5, m]);
    tags.push(['Older', 0.06, 0.94], ['A crack (a fault)', 0.86, 0.12]);
  } else if (area === 'trackway') {
    pic = paintTrackwayView(W, H);
    tags.push(['Walking: short steps', 0.2, 0.18], ['Running: long steps', 0.7, 0.62], ['Pebble’s prints in the mud', 0.32, 0.93]);
  } else pic = paintGlowRoom(W, H, uv);
  const cv = pic.toCanvas();
  const fit = () => {
    const s = Math.max(1, Math.floor(Math.min(window.innerWidth / W, (window.innerHeight - 40) / H)));
    cv.style.width = `${W * s}px`;
    cv.style.height = `${H * s}px`;
  };
  cv.style.imageRendering = 'pixelated';
  cv.style.display = 'block';
  fit();
  window.addEventListener('resize', fit);
  box.appendChild(cv);
  for (const [text, x, y] of tags) {
    const t = h('span', { class: 'ld-tag', text });
    t.style.cssText = `position:absolute;left:${x * 100}%;top:${y * 100}%;transform:translate(-50%,-50%);background:rgba(255,255,255,.92);color:#1d1a30;font-weight:800;font-size:13px;padding:0 6px;border-radius:6px;white-space:nowrap`;
    box.appendChild(t);
  }
  const titles: Record<Area, string> = {
    quarry: 'The Quarry (Dr. Mateo): the dig square from above',
    cliff: 'The Cliff Wall (Hana): rock layers, oldest at the bottom',
    trackway: 'The Trackway (Ranger Tala): footprints and a tape measure',
    glow: uv ? 'The Glow Room: the ultraviolet lamp is on' : 'The Glow Room: ordinary light',
  };
  host.appendChild(h('div', { class: 'ld-label panel' }, h('strong', { text: titles[area] }), h('div', { class: 'ld-row' }, pageNav(currentToken().replace('-quiet', '') || `dig-${area}`, true))));
  const who = area === 'quarry' ? MATEO() : area === 'cliff' ? HANA() : area === 'trackway' ? TALA() : SAM();
  const line = area === 'glow' ? (uv ? LINES.glowUV : LINES.glow) : LINES[area];
  if (q.get('talk') !== '0') void new Talk(host).say(area === 'quarry' && q.get('pebble') ? pebbleSpeaker() : who, line, 'smile');
}

// ------------------------------------------------------------------ the cast sheet

function cvs(b: PixelBuffer, scale: number, cls = ''): HTMLCanvasElement {
  const c = b.toCanvas(scale);
  c.className = `px ${cls}`;
  return c;
}

function card(art: HTMLElement[], title: string, note: string): HTMLElement {
  return h('figure', { class: 'card' }, h('div', { class: 'sprites' }, ...art), h('figcaption', {}, h('strong', { text: title }), h('span', { text: note })));
}

export function showDigCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Fossil Dig Adventure: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) =>
    page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));
  const people = (l: Look16) => [cvs(paintHero(l, 1.5, 'down'), Z), cvs(paintHero(l, 1.5, 'right'), Z)];
  const portrait = (l: Look16, m: Mood) => cvs(paintPortrait16(l, m), 2, 'pframe new');

  block(
    '1. The people (draft names)',
    'Dr. Mateo Ruiz runs the dig (the host, at the Quarry). Hana Sato is a geologist who reads rock layers (the Cliff Wall). Sam Bello cleans and studies fossils in the lab tent (the Prep Lab). Ranger Tala, the Wild Lands guide, visits for the footprints (the Trackway).',
    card([...people(MATEO_RUIZ), portrait(MATEO_RUIZ, 'smile'), portrait(MATEO_RUIZ, 'curious')], 'Dr. Mateo Ruiz', 'Paleontologist, the host'),
    card([...people(HANA_SATO), portrait(HANA_SATO, 'smile')], 'Hana Sato', 'Geologist'),
    card([...people(SAM_BELLO), portrait(SAM_BELLO, 'smile')], 'Sam Bello', 'Fossil preparator'),
    card([...people(RANGER_TALA), portrait(RANGER_TALA, 'smile')], 'Ranger Tala', 'Wild Lands guide, visiting'),
  );
  block(
    '2. Pebble, the camp’s sniffer dog',
    'Pebble sniffs out good places to dig (real dogs have been trained to find old bones at dig sites), and leaves walking and running prints in the creek mud.',
    card(
      [0, 1, 2, 3].map((f) => cvs(paintPebble(T, f), Z)),
      'Pebble',
      'Standing, wagging, sniffing, walking',
    ),
    card([cvs(paintPebblePortrait(true), 2, 'pframe new'), cvs(paintPebblePortrait(false), 2, 'pframe new')], 'Pebble in the talk box', 'Happy and thinking'),
  );
  block(
    '3. The Fossil Drawer (16 fossils)',
    'Painted in stone colors: in a fossil, minerals have taken the place of the bone or shell. Trace fossils (a footprint, a burrow, fossil poop) are signs an animal left behind.',
    ...FOSSIL_IDS.map((id) => card([cvs(paintFossil(id, 3), 1)], FOSSIL_NAMES[id], '')),
  );
  block(
    '4. Under the ultraviolet lamp (the Glow Room)',
    'Some fossils glow under ultraviolet light, because of the minerals in them. Scientists really use it to spot hidden details. The dull ones stay dark.',
    ...FOSSIL_IDS.map((id) => card([cvs(paintFossil(id, 3, true), 1)], FOSSIL_NAMES[id], glowsUnderUV(id) ? 'Glows' : 'Stays dark')),
  );
  block(
    '5. The young Triceratops',
    'Each finished station adds bones to the skeleton in the field museum: the skull, the backbone, the legs and the tail.',
    card([cvs(paintSkeleton(2, []), 1)], 'Nothing found yet', 'A faint outline'),
    card([cvs(paintSkeleton(2, SKELETON_PARTS.slice(0, 2)), 1)], 'Two stations done', 'The skull and the backbone'),
    card([cvs(paintSkeleton(2), 1)], 'The whole skeleton', 'For the Museum Night'),
    card([cvs(paintSkeleton(2, undefined, true), 1)], 'Under the ultraviolet lamp', 'In the Glow Room'),
  );
  block(
    '6. The dig site',
    'The camp’s stations and props.',
    card([cvs(paintCliffFace(T), 1)], 'The Cliff Wall', 'Rock layers, oldest at the bottom'),
    card([cvs(paintLabTent(T), 2)], 'The lab tent', 'Sam’s Prep Lab'),
    card([cvs(paintMuseum(T, 0), 2), cvs(paintMuseum(T, 4, true), 2)], 'The field museum', 'By day, and lit up at night'),
    card([cvs(paintToolRack(T), 2)], 'The tool rack', 'Shovel, rock pick and brushes'),
    card([cvs(paintSieve(T), 2), cvs(paintWheelbarrow(T), 2)], 'Sieve and wheelbarrow', 'Tiny teeth turn up in the sieve'),
    card([cvs(paintJacket(T, 7), 2)], 'A plaster jacket', 'Wrapping a fossil to carry it safely'),
    card([cvs(paintSignPost(T), 2)], 'The trackway sign', 'By the footprint slab'),
    card([cvs(paintJuniper(T, 0), 2), cvs(paintSage(T, 1), 2)], 'Juniper and sagebrush', 'Badlands plants'),
    card([cvs(paintUVLamp(T, false), 3), cvs(paintUVLamp(T, true), 3)], 'The ultraviolet lamp', 'Off and on'),
  );
}
