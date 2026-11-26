import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '../games/african-kingdoms-builder/akb.css';
import * as THREE from 'three';
import { LIGHTING, LowpolyRenderer } from '../kit/render/lowpolyRenderer';
import { h } from '../kit/ui/dom';
import { ModelBuilder } from '../kit/world/lowpoly/shapes';
import { CAST, CHAPTERS, EGYPT_BUILDS, HUB_LINES, NEEDS, SEASONS, type Season } from '../games/african-kingdoms-builder/content';
import { buildEgypt } from '../games/african-kingdoms-builder/egyptScene';
import { buildHub } from '../games/african-kingdoms-builder/hubScene';
import { ICONS, NEED_COLORS } from '../games/african-kingdoms-builder/icons';
import {
  C,
  SKIN,
  datePalm,
  granary,
  jeliAwa,
  koko,
  mudHouse,
  nebet,
  papyrus,
  person,
  pyramidBuild,
  reedBoat,
  shaduf,
  wheatField,
} from '../games/african-kingdoms-builder/models';
import { portrait } from '../games/african-kingdoms-builder/portrait';

/**
 * Look preview for Kingdom Builders: Africa (not shipped; open with
 * `npx vite --port 5179` at /lookdev/kingdoms/):
 *   #hub                          the map of Africa and the timeline
 *   #cast                         the cast and the Egypt buildings
 *   #egypt                        the Egypt chapter in Peret (the growing season)
 *   #egypt-flood, #egypt-harvest  Akhet (the flood) and Shemu (the harvest)
 * Add -evening for dusk and -quiet to hide the talk card.
 */

const PAGES: Array<[string, string]> = [
  ['hub', 'The map of Africa'],
  ['cast', 'The cast and buildings'],
  ['egypt', 'Egypt: growing season'],
  ['egypt-flood', 'Egypt: the flood'],
  ['egypt-harvest', 'Egypt: the harvest'],
  ['egypt-evening', 'Egypt at dusk'],
];

declare global {
  interface Window {
    __akb?: { view: string; lp: LowpolyRenderer; ready: boolean };
  }
}

window.addEventListener('hashchange', () => location.reload());
const token = location.hash.slice(1) || 'hub';
const parts = token.split('-');
const view = parts[0];
const flags = new Set(parts.slice(1));
const app = document.getElementById('app')!;
const stage = h('div', { class: 'akb-stage' });
const ui = h('div', { class: 'akb-ui' });
app.append(stage, ui);

function nav(): HTMLElement {
  const box = h('nav', { class: 'akb-nav akb-panel', 'aria-label': 'Look preview pages' }, h('small', {}, 'Look preview'));
  for (const [id, label] of PAGES) {
    const a = h('a', { href: `#${id}` }, label);
    if (id === token) a.setAttribute('aria-current', 'page');
    box.append(a);
  }
  return box;
}

function icon(name: string): HTMLElement {
  const s = h('span', { 'aria-hidden': 'true' });
  s.innerHTML = ICONS[name] ?? '';
  return s.firstElementChild as HTMLElement;
}

function cameraButtons(lp: LowpolyRenderer): HTMLElement {
  const btn = (name: string, label: string, fn: () => void, flip = false) => {
    const b = h('button', { class: 'akb-icon-btn', type: 'button', 'aria-label': label, title: label }, icon(name));
    if (flip) (b.firstElementChild as HTMLElement).style.transform = 'scaleX(-1)';
    b.addEventListener('click', fn);
    return b;
  };
  return h(
    'div',
    { class: 'akb-cam akb-panel' },
    btn('turn', 'Turn left (Q)', () => lp.turn(-1)),
    btn('turn', 'Turn right (E)', () => lp.turn(1), true),
    btn('plus', 'Zoom in', () => lp.zoom(1 / 1.2)),
    btn('minus', 'Zoom out', () => lp.zoom(1.2)),
  );
}

function talk(name: string, picture: string, line: string): HTMLElement {
  return h('div', { class: 'akb-talk akb-panel', role: 'status' }, h('img', { src: picture, alt: '' }), h('div', {}, h('b', {}, name), h('p', {}, line)));
}

function seasonWheel(season: Season): SVGElement {
  const order: Season[] = ['akhet', 'peret', 'shemu'];
  const colors: Record<Season, string> = { akhet: '#8f7a52', peret: '#6fae3e', shemu: '#e3b94b' };
  const arc = (i: number) => {
    const a0 = (i / 3) * Math.PI * 2 - Math.PI / 2 + 0.06;
    const a1 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2 - 0.06;
    const p = (a: number, r: number) => `${26 + Math.cos(a) * r} ${26 + Math.sin(a) * r}`;
    return `<path d="M${p(a0, 24)} A24 24 0 0 1 ${p(a1, 24)} L${p(a1, 14)} A14 14 0 0 0 ${p(a0, 14)}Z" fill="${colors[order[i]]}" opacity="${order[i] === season ? 1 : 0.28}"/>`;
  };
  const wrap = document.createElement('span');
  wrap.innerHTML = `<svg class="akb-season-wheel" viewBox="0 0 52 52" role="img" aria-label="The three seasons of the Nile">${order.map((_, i) => arc(i)).join('')}<circle cx="26" cy="26" r="10" fill="#fff9ee"/>${ICONS.sun.replace('<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">', '<svg x="17" y="17" width="18" height="18" viewBox="0 0 24 24">')}</svg>`;
  return wrap.firstElementChild as SVGElement;
}

// ── The Egypt chapter ──

function showEgypt(): void {
  const season: Season = flags.has('flood') ? 'akhet' : flags.has('harvest') ? 'shemu' : 'peret';
  const evening = flags.has('evening');
  const lp = new LowpolyRenderer(stage, {
    lighting: evening ? LIGHTING.evening : LIGHTING.day,
    view: { target: new THREE.Vector3(-1.5, 0, -1), distance: 57, yaw: 35, pitch: 44 },
    bounds: 22,
    minDistance: 10,
    maxDistance: 80,
    shadowSize: 34,
  });
  const { focus } = buildEgypt(lp, { season, evening });
  void focus;
  const s = SEASONS[season];
  const res: Array<[string, string, number]> = [
    ['food', 'Food', season === 'shemu' ? 86 : 42],
    ['water', 'Water', 30],
    ['brick', 'Mud brick', 18],
    ['stone', 'Stone', 6],
    ['papyrus', 'Papyrus', 4],
  ];
  const resBox = h('div', { class: 'akb-res akb-panel', 'aria-label': 'Your town’s goods' });
  for (const [ic, label, n] of res) resBox.append(h('span', { class: 'akb-chip', title: label }, icon(ic), String(n), h('small', {}, label)));
  const seasonBox = h('div', { class: 'akb-season akb-panel' }, seasonWheel(season), h('div', {}, h('b', {}, s.name), h('span', {}, s.meaning)));
  ui.append(h('div', { class: 'akb-top' }, resBox, seasonBox));

  const levels = season === 'shemu' ? [0.9, 0.7, 0.75, 0.6, 0.45] : season === 'akhet' ? [0.55, 0.9, 0.75, 0.7, 0.4] : [0.65, 0.8, 0.7, 0.55, 0.35];
  const needs = h('div', { class: 'akb-needs akb-panel' }, h('h3', {}, 'Prosperity'));
  NEEDS.forEach((n, i) => {
    const fill = h('i', {});
    fill.style.width = `${Math.round(levels[i] * 100)}%`;
    fill.style.background = NEED_COLORS[i];
    needs.append(h('div', { class: 'akb-need' }, h('span', {}, n), h('div', { class: 'akb-bar', role: 'meter', 'aria-label': n, 'aria-valuenow': String(Math.round(levels[i] * 100)), 'aria-valuemin': '0', 'aria-valuemax': '100' }, fill)));
  });
  ui.append(needs, nav(), cameraButtons(lp));

  const build = h('div', { class: 'akb-build akb-panel', role: 'toolbar', 'aria-label': 'Build' });
  for (const b of EGYPT_BUILDS) {
    const card = h('button', { class: 'akb-card', type: 'button', 'aria-pressed': 'false' }, icon(b.id), b.name);
    card.addEventListener('click', () => {
      build.querySelectorAll('.akb-card').forEach((c) => c.setAttribute('aria-pressed', String(c === card && c.getAttribute('aria-pressed') !== 'true')));
    });
    build.append(card);
  }
  ui.append(build);

  if (!flags.has('quiet')) {
    const pic = portrait(jeliAwa().group, { height: 1.12, distance: 2.1 });
    ui.append(talk(CAST.awa.name, pic, s.line));
  }
  lp.start();
  window.__akb = { view: token, lp, ready: true };
}

// ── The hub map ──

function yearLabel(y: number): string {
  return y < 0 ? `${-y} BCE` : y >= 2025 ? 'today' : `${y} CE`;
}

function showHub(): void {
  const phone = window.innerWidth < 720;
  const lp = new LowpolyRenderer(stage, {
    // On a phone the timeline sits under the map, so the map moves up and zooms out.
    view: phone ? { target: new THREE.Vector3(-0.5, 0, 9), distance: 182, yaw: 0, pitch: 66 } : { target: new THREE.Vector3(9, 0, -1), distance: 122, yaw: 0, pitch: 62 },
    bounds: 38,
    minDistance: 30,
    maxDistance: 200,
    shadowSize: 60,
  });
  const { pins } = buildHub(lp);
  // The whole continent is in view, so no haze on this map.
  lp.scene.fog = null;
  ui.append(h('div', { class: 'akb-title akb-panel' }, h('h1', {}, HUB_LINES.title), h('p', {}, HUB_LINES.hint)));

  const labels = pins.map((pin) => {
    const c = pin.chapter;
    const el = h('button', { class: 'akb-pin', type: 'button', title: `${c.name}: ${c.land}` }, h('i', {}), c.name);
    (el.firstElementChild as HTMLElement).style.background = c.color;
    el.addEventListener('click', () => {
      if (c.id === 'egypt') location.hash = 'egypt';
      else el.animate([{ transform: 'translate(-50%,-100%) scale(1)' }, { transform: 'translate(-50%,-100%) scale(1.12)' }, { transform: 'translate(-50%,-100%) scale(1)' }], { duration: 300 });
    });
    ui.append(el);
    return { el, pin };
  });
  lp.onFrame(() => {
    for (const { el, pin } of labels) {
      const p = lp.toScreen(pin.top.clone().setY(pin.group.position.y + 2.4));
      el.style.left = `${p.x + (pin.chapter.labelDx ?? 0)}px`;
      el.style.top = `${p.y + (pin.chapter.labelDy ?? 0)}px`;
      el.style.display = p.visible ? '' : 'none';
    }
  });

  // The timeline: when each kingdom or people lived, on one scale.
  const min = -3200;
  const max = 2025;
  const span = max - min;
  const side = h('div', { class: 'akb-side akb-panel' }, h('h3', {}, HUB_LINES.timeline));
  for (const c of [...CHAPTERS].sort((a, b) => a.from - b.from)) {
    const bar = h('i', { class: c.today ? 'today' : '' });
    bar.style.left = `${((c.from - min) / span) * 100}%`;
    bar.style.width = `${((c.to - c.from) / span) * 100}%`;
    bar.style.background = c.color;
    bar.style.color = c.color;
    const when = `${yearLabel(c.from)} to ${c.today ? HUB_LINES.todayNote : yearLabel(c.to)}`;
    side.append(h('div', { class: 'akb-row', title: when }, h('span', {}, c.name), h('div', { class: 'akb-track', role: 'img', 'aria-label': `${c.name}: ${when}` }, bar)));
  }
  side.append(h('div', { class: 'akb-scale' }, h('span', {}, '3000 BCE'), h('span', {}, '1 CE'), h('span', {}, 'today')));
  side.append(h('p', { class: 'akb-note' }, 'An arrow means the people still live on today.'));
  ui.append(side);
  // Line the "1 CE" label up with where year 1 falls on the bar.
  const scale = side.querySelector('.akb-scale') as HTMLElement;
  scale.style.justifyContent = 'flex-start';
  scale.style.position = 'relative';
  const spans = scale.querySelectorAll('span');
  spans.forEach((s, i) => {
    (s as HTMLElement).style.position = 'absolute';
    const pct = i === 0 ? ((-3000 - min) / span) * 100 : i === 1 ? ((1 - min) / span) * 100 : 100;
    (s as HTMLElement).style.left = `${pct}%`;
    (s as HTMLElement).style.transform = i === 2 ? 'translateX(-100%)' : 'translateX(-50%)';
  });
  scale.style.height = '14px';
  // On a phone, drag and pinch move the map; the buttons would cover it.
  if (!phone) ui.append(cameraButtons(lp));
  const navBox = nav();
  navBox.style.top = 'auto';
  navBox.style.bottom = '12px';
  navBox.style.right = 'auto';
  navBox.style.left = '12px';
  ui.append(navBox);
  lp.start();
  window.__akb = { view: token, lp, ready: true };
}

// ── The cast and buildings ──

function showCast(): void {
  const lp = new LowpolyRenderer(stage, {
    view: { target: new THREE.Vector3(0, 0.6, 1.2), distance: 19, yaw: 0, pitch: 22 },
    bounds: 8,
    minDistance: 6,
    maxDistance: 40,
    shadowSize: 14,
  });
  const ground = new ModelBuilder().cyl(0xe2c08a, 11, 11.4, 0.3, 32, { y: -0.3 }).cyl(0x9a7a56, 11.4, 11.4, 0.6, 32, { y: -0.9 }).build();
  lp.scene.add(ground);
  const items: Array<{ label: string; obj: THREE.Object3D; x: number; z: number; ry?: number; s?: number }> = [
    { label: 'Jeli Awa', obj: jeliAwa().group, x: -4.6, z: 4.4, ry: 0.3 },
    { label: 'Koko', obj: koko().group, x: -3.3, z: 4.6, ry: -0.2 },
    { label: 'Nebet', obj: nebet().group, x: -2, z: 4.4 },
    { label: 'Villagers', obj: person({ skin: SKIN[3], cloth: C.linen, outfit: 'kilt', carry: 'jar' }).group, x: -0.6, z: 4.5 },
    { label: '', obj: person({ skin: SKIN[0], cloth: C.linenShade, outfit: 'dress', hair: 'bob' }).group, x: 0.2, z: 4.3 },
    { label: '', obj: person({ skin: SKIN[4], cloth: C.linen, outfit: 'kilt', hair: 'none', collar: C.gold }).group, x: 1, z: 4.5 },
    { label: 'Shaduf', obj: shaduf().group, x: 2.9, z: 4.2, ry: -0.9 },
    { label: 'Reed boat', obj: reedBoat(), x: 5.3, z: 4.2, ry: -0.3, s: 0.8 },
    { label: 'Mud-brick house', obj: mudHouse(101), x: -5.2, z: 0.6, ry: 0.35 },
    { label: 'Granary', obj: granary(), x: -2.2, z: 0.8, ry: 0.15 },
    { label: 'Wheat field', obj: wheatField(2.2, 1.8, 'green', 3), x: 0.9, z: 0.9 },
    { label: 'Date palm', obj: datePalm(8, 2.3), x: 3, z: 0.7 },
    { label: 'Papyrus', obj: papyrus(9), x: 4.4, z: 1 },
    { label: 'A pyramid going up', obj: pyramidBuild(5), x: 0, z: -6, s: 0.55 },
  ];
  const tags: Array<{ el: HTMLElement; obj: THREE.Object3D }> = [];
  for (const it of items) {
    it.obj.position.set(it.x, 0, it.z);
    it.obj.rotation.y = it.ry ?? 0;
    if (it.s) it.obj.scale.setScalar(it.s);
    lp.scene.add(it.obj);
    if (it.label) {
      const el = h('div', { class: 'akb-tag' }, it.label);
      ui.append(el);
      tags.push({ el, obj: it.obj });
    }
  }
  lp.onFrame(() => {
    for (const t of tags) {
      const p = lp.toScreen(t.obj.position.clone().add(new THREE.Vector3(0, -0.05, 0.5)));
      t.el.style.left = `${p.x}px`;
      t.el.style.top = `${p.y}px`;
    }
  });
  const cards = h('div', { class: 'akb-cast-cards' });
  for (const c of [CAST.awa, CAST.koko, CAST.nebet, CAST.villagers]) cards.append(h('div', { class: 'akb-panel' }, h('b', {}, c.name), h('div', {}, c.role)));
  ui.append(cards, nav(), cameraButtons(lp));
  const navBox = ui.querySelector('.akb-nav') as HTMLElement;
  navBox.style.top = '12px';
  lp.start();
  window.__akb = { view: token, lp, ready: true };
}

if (view === 'egypt') showEgypt();
else if (view === 'cast') showCast();
else showHub();
