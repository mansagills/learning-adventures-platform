import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '../games/rock-cycle-racing/rcr.css';
import * as THREE from 'three';
import { LIGHTING, type Lighting, LowpolyRenderer } from '../kit/render/lowpolyRenderer';
import { h } from '../kit/ui/dom';
import { ModelBuilder } from '../kit/world/lowpoly/shapes';
import { CAST, ROCK_FORMS } from '../games/rock-cycle-racing/content';
import type { Rock } from '../games/rock-cycle-racing/cycle';
import { buildMap } from '../games/rock-cycle-racing/map';
import { anaQuispe, beaLindqvist, blaze, noorRahman, racer, rangerTala, scree, sioneTaufa } from '../games/rock-cycle-racing/models';
import { startRace } from '../games/rock-cycle-racing/race';
import { buildWorld } from '../games/rock-cycle-racing/scene';
import { buildTestTrack } from '../games/rock-cycle-racing/tracks';

/**
 * Look preview for Rock Cycle Racing (not shipped; open with
 * `npx vite --port 5179` at /lookdev/rocks/):
 *   #play             the test track (the Lava Run's vent and its fork)
 *   #play-basalt      the same, with the basalt Order Card
 *   #cast             the cast and the racer's rock forms
 *   #canyon           the canyon and the volcano from above
 *   #canyon-dusk, #canyon-night
 *   #map              the race map: a cut-away block of the Earth
 * Flags: -dusk and -night change the light, -low is the low-detail mode,
 * -steady is the calmer camera (also on with reduced motion).
 */

const PAGES: Array<[string, string]> = [
  ['play', 'Test track'],
  ['play-basalt', 'Test track, basalt order'],
  ['cast', 'The cast and rock forms'],
  ['canyon', 'The canyon by day'],
  ['canyon-dusk', 'The canyon at dusk'],
  ['canyon-night', 'The canyon at night'],
  ['map', 'The race map'],
];

/** Night: moonlight, with the lava glowing brighter by contrast. */
const NIGHT: Lighting = {
  sky: 0x1b2340,
  fog: 0x222a48,
  sun: 0xb8c8ff,
  sunIntensity: 0.9,
  hemiSky: 0x4a5a9a,
  hemiGround: 0x3a2420,
  hemiIntensity: 0.65,
  sunAzimuth: 210,
  sunElevation: 38,
  exposure: 1.1,
};

declare global {
  interface Window {
    __rocks?: { view: string; lp?: LowpolyRenderer; ready: boolean };
  }
}

window.addEventListener('hashchange', () => location.reload());
const token = location.hash.slice(1) || 'play';
const parts = token.split('-');
const view = parts[0];
const flags = new Set(parts.slice(1));
const lighting = flags.has('night') ? NIGHT : flags.has('dusk') ? LIGHTING.evening : LIGHTING.day;
const low = flags.has('low');
const app = document.getElementById('app')!;
const stage = h('div', { class: 'rcr-stage' });
const ui = h('div', { class: 'rcr-ui' });
app.append(stage, ui);

function nav(): HTMLElement {
  const box = h('nav', { class: 'rcr-nav rcr-panel', 'aria-label': 'Look preview pages' }, h('small', {}, 'Look preview'));
  for (const [id, label] of PAGES) {
    const a = h('a', { href: `#${id}` }, label);
    if (id === token) a.setAttribute('aria-current', 'page');
    box.append(a);
  }
  return box;
}

function tagsFor(lp: LowpolyRenderer, items: Array<{ label: string; at: () => THREE.Vector3; cls?: string }>): void {
  const els = items.map((it) => {
    const el = h('div', { class: `rcr-tag ${it.cls ?? ''}` }, it.label);
    ui.append(el);
    return { el, it };
  });
  lp.onFrame(() => {
    for (const { el, it } of els) {
      const p = lp.toScreen(it.at());
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.display = p.visible ? '' : 'none';
    }
  });
}

// ── The cast and the racer's rock forms ──

function showCast(): void {
  const lp = new LowpolyRenderer(stage, {
    lighting,
    lowDetail: low,
    view: { target: new THREE.Vector3(0, 0.7, 0.6), distance: 21, yaw: 0, pitch: 20 },
    bounds: 8,
    minDistance: 6,
    maxDistance: 40,
    shadowSize: 14,
  });
  const ground = new ModelBuilder().cyl(0xd99a66, 11, 11.4, 0.3, 32, { y: -0.3 }).cyl(0xa8462a, 11.4, 11.4, 0.7, 32, { y: -1 }).cyl(0xe0a06a, 11.4, 11.4, 0.3, 32, { y: -1.3 }).build();
  lp.scene.add(ground);
  const people: Array<[string, THREE.Object3D]> = [
    [CAST.ana.name, anaQuispe().group],
    [CAST.noor.name, noorRahman().group],
    [CAST.bea.name, beaLindqvist().group],
    [CAST.sione.name, sioneTaufa().group],
    [CAST.tala.name, rangerTala().group],
  ];
  const items: Array<{ label: string; at: () => THREE.Vector3 }> = [];
  people.forEach(([label, obj], i) => {
    obj.position.set(-5.2 + i * 2.1, 0, 3.6);
    obj.rotation.y = (2 - i) * 0.12;
    lp.scene.add(obj);
    items.push({ label, at: () => obj.position.clone().add(new THREE.Vector3(0, -0.05, 0.6)) });
  });
  const pika = scree();
  pika.position.set(5.4, 0, 3.8);
  pika.rotation.y = -0.4;
  lp.scene.add(pika);
  items.push({ label: 'Scree', at: () => pika.position.clone().add(new THREE.Vector3(0, -0.05, 0.6)) });
  const rival = blaze();
  rival.group.position.set(6.8, 0, 3.4);
  rival.group.rotation.y = -0.5;
  lp.scene.add(rival.group);
  items.push({ label: 'Blaze', at: () => rival.group.position.clone().add(new THREE.Vector3(0, -0.05, 0.8)) });
  // The racer in each form it can take.
  const forms: Rock[] = ['magma', 'granite', 'basalt', 'obsidian', 'pumice', 'sandstone', 'gravel', 'gneiss'];
  const balls = forms.map((rock, i) => {
    const r = racer(0.62, { light: rock === 'magma' });
    r.setForm(rock);
    r.setHeat(rock === 'magma' ? 1 : 0);
    r.group.position.set(-6.3 + i * 1.8, 0, -0.4);
    r.group.rotation.y = 0.25;
    lp.scene.add(r.group);
    items.push({ label: ROCK_FORMS[rock]?.name ?? rock, at: () => r.group.position.clone().add(new THREE.Vector3(0, -0.05, 0.9)) });
    return r;
  });
  lp.onFrame((dt) => {
    for (const b of balls) b.body.rotation.y += dt * 0.4;
  });
  tagsFor(lp, items);
  const cards = h('div', { class: 'rcr-cast-cards' });
  for (const c of [CAST.ana, CAST.noor, CAST.bea, CAST.sione, CAST.tala, CAST.scree, CAST.blaze]) cards.append(h('div', { class: 'rcr-panel' }, h('b', {}, c.name), h('div', {}, c.role)));
  ui.append(h('div', { class: 'rcr-title rcr-panel' }, h('h1', {}, 'Rock Cycle Racing'), h('p', {}, 'The cast, and the racer in eight of its rock forms. Drag to look around.')), cards, nav());
  lp.start();
  window.__rocks = { view: token, lp, ready: true };
}

// ── The canyon from above ──

function showCanyon(): void {
  const lp = new LowpolyRenderer(stage, {
    lighting,
    lowDetail: low,
    view: { target: new THREE.Vector3(-6, 4, 18), distance: 175, yaw: 30, pitch: 38 },
    bounds: 90,
    minDistance: 40,
    maxDistance: 260,
    shadowSize: 90,
  });
  lp.camera.far = 700;
  lp.scene.fog = new THREE.Fog(lighting.fog, 200, 520);
  const track = buildTestTrack();
  const world = buildWorld(lp, track, { low });
  lp.onFrame((dt, t) => world.update(dt, t));
  tagsFor(lp, [
    { label: 'The volcano', at: () => new THREE.Vector3(0, 27, 0) },
    { label: 'Lava flow (erupt)', at: () => new THREE.Vector3(...pointOn(track, 'erupt', 0.7)) },
    { label: 'Finish: basalt', at: () => world.finishes.erupt.clone().add(new THREE.Vector3(0, 6, 0)) },
  ]);
  ui.append(h('div', { class: 'rcr-title rcr-panel' }, h('h1', {}, 'The canyon and the volcano'), h('p', {}, 'The tunnels are under the ground. Drag to move, scroll or pinch to zoom.')), nav());
  lp.start();
  window.__rocks = { view: token, lp, ready: true };
}

function pointOn(track: ReturnType<typeof buildTestTrack>, id: string, frac: number): [number, number, number] {
  const p = track.graph.path(id);
  const q = p.point(p.length * frac, 0, 4);
  return [q.x, q.y, q.z];
}

// ── The race map ──

function showMap(): void {
  const phone = window.innerWidth < 720;
  const lp = new LowpolyRenderer(stage, {
    lighting,
    lowDetail: low,
    view: { target: new THREE.Vector3(0, -5, 0), distance: phone ? 125 : 92, yaw: 20, pitch: 30 },
    bounds: 20,
    minDistance: 40,
    maxDistance: 160,
    shadowSize: 45,
  });
  lp.scene.fog = null;
  lp.scene.background = new THREE.Color(0x2a2030);
  const { pins, labels } = buildMap(lp, { low });
  const pinEls = pins.map((pin) => {
    const el = h('button', { class: 'rcr-pin', type: 'button' }, h('i', {}), pin.label);
    (el.firstElementChild as HTMLElement).style.background = pin.color;
    ui.append(el);
    return { el, pin };
  });
  lp.onFrame(() => {
    for (const { el, pin } of pinEls) {
      const p = lp.toScreen(pin.pos);
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.display = p.visible ? '' : 'none';
    }
  });
  tagsFor(
    lp,
    labels.map((l) => ({ label: l.label, at: () => l.pos, cls: 'process' })),
  );
  ui.append(
    h('div', { class: 'rcr-title rcr-panel' }, h('h1', {}, 'The race map'), h('p', {}, 'A slice of the Earth. The arrows are the rock cycle: every leg of the race is one of its paths. Drag to turn it.')),
    nav(),
  );
  lp.start();
  window.__rocks = { view: token, lp, ready: true };
}

// ── The test track ──

function showPlay(): void {
  const debug = startRace(stage, ui, { order: flags.has('basalt') ? 'basalt' : 'granite', lighting, low, steady: flags.has('steady') });
  window.__rcr = debug;
  if (window.innerWidth >= 720) {
    const n = nav();
    n.style.bottom = '12px';
    ui.append(n);
  }
  window.__rocks = { view: token, ready: true };
}

if (view === 'cast') showCast();
else if (view === 'canyon') showCanyon();
else if (view === 'map') showMap();
else showPlay();
