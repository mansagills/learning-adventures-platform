import * as THREE from 'three';
import { PixelBuffer } from '../kit/art/pixel';
import type { Expression } from '../kit/art/portraits';
import { K } from '../kit/render/pixelRenderer';
import { h } from '../kit/ui/dom';
import { Talk, type Speaker } from '../kit/ui/talk';
import { Lighting, pixelTexture } from '../kit/world/sceneKit';
import { Figure, STAR_STATION, Stage, billboard, shadow, swapFrame, type SceneCtx, type Setting } from '../kit/worlds';
import '../kit/worlds/worlds.css';
import { paintHero, paintPortrait16, PLAYER16, type Look16, type Mood } from '../kit/worlds/hero16';
import { OBSERVATORY, OBS_SPOTS } from '../kit/worlds/star-station/observatory';
import {
  KOFI_MENSAH,
  LUMI_REYES,
  NAVIGATOR_SOL,
  PLANET_ORDER,
  TESS_ROCKET,
  paintBigTelescope,
  paintGlobeLab,
  paintLaunchCannon,
  paintOrrery,
  paintPlanet,
  paintPostcard,
  paintStarMap,
  paintStarProjector,
  paintVee,
  paintVeePortrait,
  type SkyBody,
} from '../kit/worlds/star-station/space-art';
import { SURFACE_MARS, SURFACE_MERCURY, paintCloudDive, paintFind } from '../kit/worlds/star-station/surfaces';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Solar System Explorer (S1 Space, Star Station world):
 *   #space-cast         the crew, Vee, the Sun and planets, the space models, the star map and postcards
 *   #space-observatory  the observatory, with everyone at their stations
 *   #space-mars         a stop on Mars (the rover, the three finds)
 *   #space-mercury      a stop on Mercury
 *   #space-jupiter      the cloud dive into Jupiter (no ground to land on)
 * Not shipped: dev server only.
 */

const T = STAR_STATION.px;

function speaker(name: string, role: string, look: Look16, voice: number): Speaker {
  const pics: Partial<Record<Mood, string>> = {};
  const pic = (m: Mood) => (pics[m] ??= paintPortrait16(look, m).toDataURL(2));
  return { name, role, voice, portrait: (e: Expression) => pic(e === 'thinking' ? 'thinking' : e === 'curious' ? 'curious' : 'smile') };
}

function veeSpeaker(): Speaker {
  const happy = paintVeePortrait(true).toDataURL(2);
  const flat = paintVeePortrait(false).toDataURL(2);
  return { name: 'Vee', role: 'The observatory’s probe', voice: 300, portrait: (e: Expression) => (e === 'thinking' ? flat : happy) };
}

const LINES = {
  observatory: 'Welcome to the observatory! I am Navigator Sol. Each of these four models shows how space works. Finish a station and one of the telescope’s lenses lights up.',
  mars: 'We landed on Mars! The dust is red because it has rust in it. Look for three things: a rock sample, a fact card and a question.',
  mercury: 'Mercury has no air, so the sky stays black, even in the day. And the Sun looks huge! Mercury is the closest planet to the Sun.',
  jupiter: 'Jupiter has no ground to land on. It is a giant ball of gas, so we dive into the clouds instead. It gets darker the deeper we go.',
};

// ------------------------------------------------------------------ a scene: the observatory or a planet stop

export function showSpaceScene(host: HTMLElement, q: URLSearchParams): void {
  const area = (['observatory', 'mars', 'mercury'].includes(q.get('area') ?? '') ? q.get('area') : 'observatory') as 'observatory' | 'mars' | 'mercury';
  const setting: Setting = area === 'mars' ? SURFACE_MARS : area === 'mercury' ? SURFACE_MERCURY : OBSERVATORY;
  document.body.classList.add(STAR_STATION.panelClass);
  const stage = new Stage(host, T);
  stage.maxTilesTall = 22;
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
  const figs: Figure[] = [];
  const person = (look: Look16, dir: 'down' | 'left' | 'right', x: number, y: number) => {
    const f = new Figure(ctx, [paintHero(look, 1.5, dir).toCanvas(), paintHero(look, 1.5, dir, { blink: true }).toCanvas()], x, y);
    figs.push(f);
  };
  let veeHome = { x: 13, y: 12.6 };
  if (area === 'observatory') {
    person(PLAYER16, 'down', OBS_SPOTS.player.x, OBS_SPOTS.player.y);
    person(NAVIGATOR_SOL, 'left', OBS_SPOTS.host.x, OBS_SPOTS.host.y);
    person(LUMI_REYES, 'left', OBS_SPOTS.projectorHelper.x, OBS_SPOTS.projectorHelper.y);
    person(KOFI_MENSAH, 'left', OBS_SPOTS.globeHelper.x, OBS_SPOTS.globeHelper.y);
    person(TESS_ROCKET, 'down', OBS_SPOTS.cannonHelper.x, OBS_SPOTS.cannonHelper.y);
    veeHome = { x: 14.4, y: 13.2 };
  } else veeHome = { x: 12.6, y: 9.6 };

  // Vee hovers and bobs, drifting left and right
  const veeTex = {
    right: [0, 1, 2].map((f) => tex(paintVee(T, 'right', f))),
    left: [0, 1, 2].map((f) => tex(paintVee(T, 'left', f))),
  };
  const vee = billboard(ctx.lighting, T, paintVee(T, 'right', 0).toCanvas(), veeHome.x, veeHome.y, 1.1);
  const veeShadow = shadow(T, 0.9);
  ctx.scene.add(vee, veeShadow);

  const label = h(
    'div',
    { class: 'ld-label panel' },
    h('strong', { text: `Star Station: ${setting.name}` }),
    h('span', { text: `${T} pixels per tile · look development for Solar System Explorer` }),
    h('div', { class: 'ld-row' }, pageNav(currentToken() || `space-${area}`, true)),
  );
  host.appendChild(label);
  if (q.get('talk') !== '0') {
    const talk = new Talk(host);
    void (area === 'observatory' ? talk.say(speaker('Navigator Sol', 'Keeper of the Star Map', NAVIGATOR_SOL, 130), LINES.observatory, 'smile') : talk.say(veeSpeaker(), LINES[area], 'smile'));
  }

  const t0 = performance.now();
  let lastX = veeHome.x;
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    built.update(t, stage.target.x);
    const snap = (v: number) => Math.round(v * T) / T;
    const vx = veeHome.x + Math.sin(t * 0.5) * 1.6;
    const dir = vx >= lastX ? 'right' : 'left';
    lastX = vx;
    vee.position.set(snap(vx), (1.1 + Math.round(Math.sin(t * 2.6) * 2) / T) * K, veeHome.y * K);
    swapFrame(vee, veeTex[dir][Math.floor(t * 8) % 3]);
    veeShadow.position.set(snap(vx), 0.015, veeHome.y * K);
    figs.forEach((f, i) => f.frame((t + i * 0.7) % 3.4 > 3.25 ? 1 : 0));
    stage.render(ctx.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage, area } });
}

// ------------------------------------------------------------------ the Jupiter cloud dive

export function showJupiterDive(host: HTMLElement, q: URLSearchParams): void {
  document.body.classList.add(STAR_STATION.panelClass);
  const cv = h('canvas', { class: 'px ld-dive' }) as HTMLCanvasElement;
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
  host.appendChild(cv);
  const ctx2 = cv.getContext('2d')!;
  const label = h(
    'div',
    { class: 'ld-label panel' },
    h('strong', { text: 'Jupiter: the cloud dive' }),
    h('span', { text: 'No ground to land on: the probe dives through the cloud bands. It gets darker and warmer deeper down.' }),
    h('div', { class: 'ld-row' }, pageNav(currentToken() || 'space-jupiter', true)),
  );
  host.appendChild(label);
  if (q.get('talk') !== '0') void new Talk(host).say(veeSpeaker(), LINES.jupiter, 'smile');
  const vee = [0, 1, 2].map((f) => paintVee(T, 'right', f));
  const t0 = performance.now();
  let frame = 0;
  const draw = () => {
    // a small picture, scaled up with crisp pixels
    const scale = Math.max(2, Math.round(Math.min(window.innerWidth / 320, window.innerHeight / 200)));
    const W = Math.ceil(window.innerWidth / scale);
    const H = Math.ceil(window.innerHeight / scale);
    if (cv.width !== W || cv.height !== H) {
      cv.width = W;
      cv.height = H;
    }
    const t = (performance.now() - t0) / 1000;
    const depth = (Math.sin(t * 0.25 - Math.PI / 2) + 1) / 2;
    const pic = paintCloudDive(W, H, depth, frame, 'jupiter');
    const b = new PixelBuffer(W, H);
    b.blit(pic, 0, 0);
    const v = vee[1 + (frame % 2)];
    const half = new PixelBuffer(Math.ceil(v.w / 1.5), Math.ceil(v.h / 1.5));
    for (let y = 0; y < half.h; y++) for (let x = 0; x < half.w; x++) half.set(x, y, v.get(Math.floor(x * 1.5), Math.floor(y * 1.5)));
    b.blit(half, Math.round(W / 2 - half.w / 2 + Math.sin(t) * 6), Math.round(H * 0.42 + Math.sin(t * 2.2) * 2));
    ctx2.clearRect(0, 0, W, H);
    b.drawTo(ctx2, 0, 0, 1);
    frame++;
    setTimeout(() => requestAnimationFrame(draw), 90);
  };
  draw();
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

const NAMES: Record<SkyBody, string> = {
  sun: 'The Sun',
  mercury: 'Mercury',
  venus: 'Venus',
  earth: 'Earth',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  moon: 'The Moon',
  pluto: 'Pluto',
};
const NOTES: Record<SkyBody, string> = {
  sun: 'Our star',
  mercury: 'Grey and cratered',
  venus: 'Thick yellow clouds',
  earth: 'Oceans, land, clouds',
  mars: 'Rusty red, an ice cap',
  jupiter: 'Bands and the Great Red Spot',
  saturn: 'Rings of ice and rock',
  uranus: 'Tipped on its side',
  neptune: 'Deep blue and windy',
  moon: 'Earth’s moon',
  pluto: 'A dwarf planet, with its bright heart',
};

export function showSpaceCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Solar System Explorer: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) => page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));

  block(
    '1. Vee, the probe',
    'Vee flies the planet hops with you, takes the postcards and gives hints. The big white dish and gold foil come from the real Voyager probes.',
    card([cv(paintVee(T, 'right', 0), Z), cv(paintVee(T, 'right', 2), Z), cv(paintVee(T, 'left', 1), Z), cv(paintVee(T, 'right', 0, true), Z)], 'Vee', 'Hovering, thrusting, facing left, blinking'),
    card([cv(paintVeePortrait(true), 2, 'pframe new'), cv(paintVeePortrait(false), 2, 'pframe new')], 'Vee in the talk box', 'Happy and thinking'),
  );
  const people = (l: Look16) => [cv(paintHero(l, 1.5, 'down'), Z), cv(paintHero(l, 1.5, 'right'), Z)];
  const portrait = (l: Look16, m: Mood) => cv(paintPortrait16(l, m), 2, 'pframe new');
  block(
    '2. The crew',
    'Navigator Sol (from Multiplication Space Quest) runs the observatory. Each station has its own helper.',
    card([...people(NAVIGATOR_SOL), portrait(NAVIGATOR_SOL, 'smile')], 'Navigator Sol', 'Host: the Orrery and the star map'),
    card([...people(LUMI_REYES), portrait(LUMI_REYES, 'smile')], 'Astronomer Lumi Reyes', 'The Star Dome'),
    card([...people(KOFI_MENSAH), portrait(KOFI_MENSAH, 'curious')], 'Dr. Kofi Mensah', 'The Sunrise Lab'),
    card([...people(TESS_ROCKET), portrait(TESS_ROCKET, 'smile')], 'Engineer Tess Rocket', 'The Launch Bay'),
    card([cv(paintHero(PLAYER16, 1.5, 'down'), Z)], 'The player', 'Made in the character creator'),
  );
  const bodies: SkyBody[] = ['sun', ...PLANET_ORDER, 'moon', 'pluto'];
  block(
    '3. The Sun, the planets, the Moon and Pluto',
    'Drawn the same size here so you can see them (the real sizes are very different, and the game says so). They slowly turn in the game.',
    ...bodies.map((id) => card([cv(paintPlanet(id, 16, 0.1), 2)], NAMES[id], NOTES[id])),
  );
  block(
    '4. The space models in the observatory',
    'Each station is a model you play with. The orrery runs (close planets go round faster), the globe spins to make day and night, the projector fills the Star Dome with stars, and the launch cannon shows an orbit.',
    card([cv(paintOrrery(T, 0), 2), cv(paintOrrery(T, 0.6), 2)], 'The Orrery', 'Running: Mercury has gone far round, Neptune has barely moved'),
    card([cv(paintGlobeLab(T, 0), 2), cv(paintGlobeLab(T, 0.35), 2)], 'The Sunrise Lab globe', 'The lamp is the Sun; the town marker turns from day into night'),
    card([cv(paintStarProjector(T, 0), 2)], 'The star projector', 'In the Star Dome'),
    card([cv(paintLaunchCannon(T, 2), 2)], 'The launch cannon', 'Slow shot falls back (gold); fast shot orbits (blue)'),
    card([cv(paintBigTelescope(T, 0), 2), cv(paintBigTelescope(T, 4), 2)], 'The big telescope', 'Its four lenses light up as stations are finished'),
  );
  block(
    '5. Navigator Sol’s star map and the postcards',
    'The planets in order from the Sun. The gaps are squeezed to fit, but they still grow farther out, like the real ones. Visited planets light up.',
    card([cv(paintStarMap(360, 90, ['mercury', 'venus', 'earth', 'mars'], 'mars', 0), 2)], 'Star map', 'Four planets visited; the ship is at Mars'),
    card([cv(paintPostcard('mars'), 2), cv(paintPostcard('saturn'), 2), cv(paintPostcard('pluto'), 2)], 'Postcards', 'One for every stop, collected in the album'),
  );
  block(
    '6. At the planet stops',
    'On a rocky planet the rover finds three things. On a giant planet, Vee dives into the clouds.',
    card([cv(paintFind(T, 'sample', 0), Z), cv(paintFind(T, 'fact', 0), Z), cv(paintFind(T, 'question', 0), Z)], 'The three finds', 'A rock sample, a fact card and a question'),
    card([cv(paintCloudDive(160, 100, 0.05, 0), 2), cv(paintCloudDive(160, 100, 0.8, 0), 2)], 'Jupiter cloud dive', 'At the cloud tops, and deep down'),
  );
}
