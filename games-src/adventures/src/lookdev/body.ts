import * as THREE from 'three';
import { PixelBuffer } from '../kit/art/pixel';
import type { Expression } from '../kit/art/portraits';
import { K } from '../kit/render/pixelRenderer';
import { h } from '../kit/ui/dom';
import { Talk, type Speaker } from '../kit/ui/talk';
import { Lighting, pixelTexture } from '../kit/world/sceneKit';
import { STAR_STATION, Stage, billboard, shadow, swapFrame, type SceneCtx } from '../kit/worlds';
import '../kit/worlds/worlds.css';
import { paintHero, paintPortrait16, PLAYER16, type Mood } from '../kit/worlds/hero16';
import { mixHex } from '../kit/worlds/shade';
import { STAR, paintConsole, paintStarFloor } from '../kit/worlds/star-station/art';
import { BODY_SETTINGS, type BodyArea } from '../kit/worlds/star-station/body';
import {
  COMMANDER_AYO,
  DR_AMA,
  paintBodyMap,
  paintGoodBacteria,
  paintMedBed,
  paintMicroScout,
  paintMucus,
  paintNib,
  paintNibPortrait,
  paintOxygen,
  paintPlaqueJack,
  paintRedCell,
  paintShrinkBeam,
  paintSniffles,
  paintWhiteCell,
} from '../kit/worlds/star-station/body-art';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Body System Heroes (the owner's inside-the-body game):
 *   #body-cast     the ship, Nib, the people, the Grime Gang, the body's helpers and the med bay
 *   #body-lungs    the lungs, with the Micro-Scout and Nib flying and Sniffles about
 *   #body-blood    inside a blood vessel
 *   #body-stomach  the stomach
 * Not shipped: dev server only.
 */

const T = STAR_STATION.px;

const NIB_LINES: Record<BodyArea, string> = {
  lungs: 'We are in the lungs! Air comes down this tube into millions of tiny air sacs. Oxygen goes from the air sacs into the blood. Uh oh, flu viruses!',
  blood: 'Inside a blood vessel! The red blood cells carry oxygen all over the body. They all flow one way, so we fly with the flow.',
  stomach: 'The stomach! Its acid helps break down food. Over there is the door to the small intestine, where most digestion happens.',
};

function nibSpeaker(): Speaker {
  const happy = paintNibPortrait(true).toDataURL(2);
  const flat = paintNibPortrait(false).toDataURL(2);
  return { name: 'Nib', role: 'Co-pilot of the Micro-Scout', voice: 320, portrait: (e: Expression) => (e === 'thinking' ? flat : happy) };
}

// ------------------------------------------------------------------ a body area, flying

export function showBodyScene(host: HTMLElement, q: URLSearchParams): void {
  const area = (['lungs', 'blood', 'stomach'].includes(q.get('area') ?? '') ? q.get('area') : 'lungs') as BodyArea;
  const setting = BODY_SETTINGS.find((s) => s.id === `body-${area}`)!;
  document.body.classList.add(STAR_STATION.panelClass);
  const stage = new Stage(host, T);
  const ctx: SceneCtx = { scene: new THREE.Scene(), lighting: new Lighting(), px: T, time: 'day' };
  const built = setting.build(ctx);
  stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
  ctx.lighting.set(STAR_STATION.tint.day, 0);
  stage.setBounds(built.map.w, built.map.h);
  const place = () => {
    const { w: vw, h: vh } = stage.viewTiles;
    const cy = Math.min(Math.max(built.focus.top + vh / 2, built.focus.feet + 1.4 - vh / 2), built.map.h - vh / 2);
    stage.lookAt(vw >= built.map.w ? built.map.w / 2 : built.focus.x, cy, false);
  };
  place();
  window.addEventListener('resize', () => {
    stage.resize();
    place();
  });

  const tex = (b: PixelBuffer) => pixelTexture(b.toCanvas());
  // the Micro-Scout flies a loop round the area (free flight in every direction), with Nib riding alongside
  const shipTex = {
    right: [0, 1, 2].map((f) => tex(paintMicroScout(T, 'right', f))),
    left: [0, 1, 2].map((f) => tex(paintMicroScout(T, 'left', f))),
  };
  const ship = billboard(ctx.lighting, T, paintMicroScout(T, 'right', 1).toCanvas(), 12, 10, 1.2);
  const shipShadow = shadow(T, 1.4);
  const nibTex = [0, 1].map((f) => tex(paintNib(T, f)));
  const nib = billboard(ctx.lighting, T, paintNib(T, 0).toCanvas(), 11, 10, 2.2);
  ctx.scene.add(ship, shipShadow, nib);

  // germs where they belong: the flu virus in the lungs (a white blood cell already patrols the vessel)
  const germs: Array<{ m: THREE.Mesh; x: number; y: number; frames: THREE.Texture[]; ph: number }> = [];
  if (area === 'lungs')
    for (const [x, y] of [
      [16.4, 9.6],
      [18.6, 11.2],
      [8.8, 12.4],
    ]) {
      const frames = [0, 1].map((f) => tex(paintSniffles(T, f)));
      const m = billboard(ctx.lighting, T, paintSniffles(T, 0).toCanvas(), x, y, 0.8);
      const sh = shadow(T, 1);
      sh.position.set(x, 0.015, y * K);
      ctx.scene.add(m, sh);
      germs.push({ m, x, y, frames, ph: x });
    }

  const label = h(
    'div',
    { class: 'ld-label panel' },
    h('strong', { text: `Star Station: ${setting.name}` }),
    h('span', { text: `${T} pixels per tile · look development for Body System Heroes` }),
    h('div', { class: 'ld-row' }, pageNav(currentToken() || `body-${area}`, true)),
  );
  host.appendChild(label);
  if (q.get('talk') !== '0') {
    const talk = new Talk(host);
    void talk.say(nibSpeaker(), NIB_LINES[area], 'smile');
  }

  const t0 = performance.now();
  let lastX = 12;
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    built.update(t, stage.target.x);
    // a figure-eight path over the floor
    const sx = 13 + Math.sin(t * 0.35) * 7.5;
    const sy = 10.2 + Math.sin(t * 0.7) * 3;
    const dir = sx >= lastX ? 'right' : 'left';
    lastX = sx;
    const snap = (v: number) => Math.round(v * T) / T;
    ship.position.set(snap(sx), (1.2 + Math.round(Math.sin(t * 3) * 1.5) / T) * K, snap(sy) * K);
    swapFrame(ship, shipTex[dir][1 + (Math.floor(t * 10) % 2)]);
    shipShadow.position.set(snap(sx), 0.015, snap(sy) * K);
    nib.position.set(snap(sx + (dir === 'right' ? -1.3 : 1.3)), (2.0 + Math.round(Math.sin(t * 4 + 1) * 2) / T) * K, snap(sy - 0.2) * K);
    swapFrame(nib, nibTex[Math.floor(t * 3) % 2]);
    for (const g of germs) {
      g.m.position.set(snap(g.x + Math.sin(t * 0.8 + g.ph) * 0.5), (0.8 + Math.round(Math.sin(t * 2 + g.ph) * 2) / T) * K, g.y * K);
      swapFrame(g.m, g.frames[Math.floor(t * 2 + g.ph) % 2]);
    }
    stage.render(ctx.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage, area } });
}

// ------------------------------------------------------------------ the cast sheet

function cv(b: PixelBuffer, scale: number, cls = ''): HTMLCanvasElement {
  const c = b.toCanvas(scale);
  c.className = `px ${cls}`;
  return c;
}

function card(art: HTMLElement[], title: string, note: string): HTMLElement {
  return h('figure', { class: 'card' }, h('div', { class: 'sprites' }, ...art), h('figcaption', {}, h('strong', { text: title }), h('span', { text: note })));
}

/** The med bay: the shrink beam with the Micro-Scout in it, Dr. Ama, Commander Ayo by the bed, and the body map. */
export function paintMedBay(): PixelBuffer {
  const W = 14 * T;
  const H = 8 * T;
  const out = new PixelBuffer(W, H);
  const floor = paintStarFloor(T);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, floor.get(5 * T + x, 4 * T + y));
  // the back wall
  const wallH = Math.round(3.2 * T);
  for (let y = 0; y < wallH; y++)
    for (let x = 0; x < W; x++) {
      const band = y < 4 ? STAR.trim[1] : y > wallH - 5 ? STAR.trim[2] : (x >> 3) % 6 === 0 ? STAR.wall[1] : STAR.wall[2];
      out.set(x, y, band);
    }
  const map = paintBodyMap(T, [2], 0);
  out.blit(map, Math.round(10.2 * T), Math.round(0.3 * T));
  out.blit(paintConsole(T, 1), Math.round(0.4 * T), Math.round(3.1 * T) - paintConsole(T, 1).h);
  const beam = paintShrinkBeam(T, 1);
  out.blit(beam, Math.round(2.4 * T), Math.round(6.4 * T) - beam.h);
  const scout = paintMicroScout(T, 'right', 0);
  // the ship is tiny inside the beam (half size): it is being shrunk
  const small = new PixelBuffer(Math.ceil(scout.w / 2), Math.ceil(scout.h / 2));
  for (let y = 0; y < small.h; y++) for (let x = 0; x < small.w; x++) small.set(x, y, scout.get(x * 2, y * 2));
  out.blit(small, Math.round(4.4 * T) - small.w / 2, Math.round(4.0 * T));
  const bed = paintMedBed(T);
  out.blit(bed, Math.round(8.6 * T), Math.round(6.6 * T) - bed.h);
  const ama = paintHero(DR_AMA, 1.5, 'down');
  out.blit(ama, Math.round(7.0 * T) - ama.w / 2, Math.round(7.4 * T) - ama.h);
  const ayo = paintHero(COMMANDER_AYO, 1.5, 'left');
  out.blit(ayo, Math.round(12.6 * T) - ayo.w / 2, Math.round(7.4 * T) - ayo.h);
  // a soft cyan glow on the floor under the beam
  for (let y = Math.round(6.2 * T); y < 7.2 * T; y++)
    for (let x = Math.round(2.6 * T); x < 6.2 * T; x++) {
      const c = out.get(x, y);
      const d = Math.hypot((x - 4.4 * T) / (1.8 * T), (y - 6.7 * T) / (0.5 * T));
      if (c && d < 1) out.set(x, y, mixHex(c, '#8fe6ff', 0.35 * (1 - d)));
    }
  return out;
}

export function showBodyCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Body System Heroes: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) => page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));

  block(
    '1. The Micro-Scout and Nib',
    'The ship flies freely in every direction. It points left or right, and its thruster flickers when it moves. Nib rides alongside, scans cells and gives hints.',
    card([cv(paintMicroScout(T, 'right', 0), Z), cv(paintMicroScout(T, 'right', 2), Z), cv(paintMicroScout(T, 'left', 1), Z)], 'Micro-Scout', 'Resting, thrusting, and facing left'),
    card([cv(paintNib(T, 0), Z), cv(paintNib(T, 1, [-0.5, 0.3]), Z)], 'Nib', 'A tiny nanobot with one big eye'),
    card([cv(paintNibPortrait(true), 2, 'pframe new'), cv(paintNibPortrait(false), 2, 'pframe new')], 'Nib in the talk box', 'Happy and thinking'),
  );
  const people = (l: typeof DR_AMA) => [cv(paintHero(l, 1.5, 'down'), Z), cv(paintHero(l, 1.5, 'right'), Z)];
  const portrait = (l: typeof DR_AMA, m: Mood) => cv(paintPortrait16(l, m), 2, 'pframe new');
  block(
    '2. The people',
    'Dr. Ama Okafor runs the med bay and invented the shrink beam. Commander Ayo (from Multiplication Space Quest) is the patient whose body we fly through. The player is the pilot.',
    card([...people(DR_AMA), portrait(DR_AMA, 'smile')], 'Dr. Ama Okafor', 'The station doctor'),
    card([...people(COMMANDER_AYO), portrait(COMMANDER_AYO, 'thinking')], 'Commander Ayo', 'Feeling unwell today'),
    card([cv(paintHero(PLAYER16, 1.5, 'down'), Z)], 'The player', 'Made in the character creator'),
  );
  block(
    '3. The Grime Gang (two of the five)',
    'Goofy, gloopy and never scary. The flu virus really is covered in knobby spikes; cavity bacteria love sugar.',
    card([cv(paintSniffles(T, 0), Z), cv(paintSniffles(T, 1), Z)], 'Sniffles', 'The flu virus (lungs)'),
    card([cv(paintPlaqueJack(T, 0), Z), cv(paintPlaqueJack(T, 1), Z)], 'Plaque Jack', 'Cavity bacteria (mouth)'),
  );
  block(
    '4. The body’s helpers',
    'The ship works with the body, not instead of it.',
    card([cv(paintRedCell(T, 0), Z), cv(paintRedCell(T, 1), Z), cv(paintRedCell(T, 2), Z)], 'Red blood cells', 'They carry oxygen'),
    card([cv(paintWhiteCell(T, 0), Z), cv(paintWhiteCell(T, 1), Z)], 'White blood cell', 'Fights germs (an escort upgrade)'),
    card([cv(paintGoodBacteria(T, 0), Z)], 'Good gut bacteria', 'Helpers: do not zap them!'),
    card([cv(paintOxygen(T, 0), Z), cv(paintOxygen(T, 1), Z), cv(paintMucus(T, 0), Z)], 'Oxygen and mucus', 'Mucus traps germs in the airways'),
  );
  block('5. The med bay', 'Home base on the Star Station: the shrink beam (with the Micro-Scout being shrunk), Dr. Ama, Commander Ayo by the med bed, and the body map with the lungs lit.', card([cv(paintMedBay(), 2)], 'Med bay', 'Shown at the in-game size on a laptop'));
}
