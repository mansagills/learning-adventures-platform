import * as THREE from 'three';
import { PixelBuffer } from '../kit/art/pixel';
import type { Expression } from '../kit/art/portraits';
import { audio } from '../kit/systems/audio';
import { K } from '../kit/render/pixelRenderer';
import { h } from '../kit/ui/dom';
import { Talk, type Speaker } from '../kit/ui/talk';
import { Lighting, pixelTexture } from '../kit/world/sceneKit';
import { Figure, Stage, billboard, shadow, swapFrame, type SceneCtx, type TimeOfDay } from '../kit/worlds';
import '../kit/worlds/worlds.css';
import '../kit/worlds/wild-lands/wild.css';
import { paintHero, paintPortrait16, PLAYER16, type Look16, type Mood } from '../kit/worlds/hero16';
import { CAMP_SPOTS, FIELD_CAMP } from '../kit/worlds/wild-lands/camp';
import { WILD_LANDS } from '../kit/worlds/wild-lands/style';
import {
  LANI_KAHALE,
  RANGER_TALA,
  paintAnglerfish,
  paintButterfly,
  paintClownfish,
  paintFinn,
  paintFinnPortrait,
  paintFrog,
  paintHeron,
  paintJaguar,
  paintJelly,
  paintLabTent,
  paintLanternfish,
  paintMonkey,
  paintOctopus,
  paintRay,
  paintSloth,
  paintSub,
  paintTent,
  paintToucan,
  paintTouchTank,
  paintTurtle,
  paintWeatherMast,
  paintZoneChart,
} from '../kit/worlds/wild-lands/art';
import { OCEAN_ZONES, paintOcean, type OceanZone } from '../kit/worlds/wild-lands/ocean';
import { currentToken, pageNav } from './nav';

/**
 * Look development for the Wild Lands world and its first game, Ocean Depth
 * Diver (docs/GAME_WORLDS_PROPOSAL.md 7c):
 *   #wild-cast          the people, Finn, the submarine, the animals and the camp's props
 *   #wild-camp          the field camp by day (#wild-camp-evening at dusk)
 *   #wild-reef          the side-view dive, from the reef down to the dark (#wild-reef-sunlight,
 *                       -twilight, -midnight hold one zone)
 * Not shipped: dev server only.
 */

const T = WILD_LANDS.px;

function speaker(name: string, role: string, look: Look16, voice: number): Speaker {
  const pics: Partial<Record<Mood, string>> = {};
  const pic = (m: Mood) => (pics[m] ??= paintPortrait16(look, m).toDataURL(2));
  return {
    name,
    role,
    voice,
    portrait: (e: Expression) => pic(e === 'thinking' ? 'thinking' : e === 'curious' ? 'curious' : 'smile'),
  };
}

function finnSpeaker(): Speaker {
  const happy = paintFinnPortrait(true).toDataURL(2);
  const flat = paintFinnPortrait(false).toDataURL(2);
  return {
    name: 'Finn',
    role: 'The robot camera',
    voice: 320,
    portrait: (e: Expression) => (e === 'thinking' ? flat : happy),
  };
}

const LINES = {
  day: 'Welcome to the field camp! I am Ranger Tala. Scientists live and work here, right where the river meets the sea. Dr. Lani has a little submarine at the dock.',
  evening: 'The Sun has set. Look! Fireflies make their own light, and so do these mushrooms. Out in the bay, tiny sea creatures glow blue. That is called living light.',
  sunlight: 'This is the sunlight zone. Sunlight reaches down here, so seaweed and tiny plants can grow. Most sea animals live in this bright top layer.',
  twilight: 'Now we are in the twilight zone. Only a little blue light gets this deep. Many fish here have big eyes, and some make their own light.',
  midnight: 'This is the midnight zone. No sunlight reaches here at all. The only lights are the ones animals make. Our headlamp helps us see.',
};

// ------------------------------------------------------------------ the field camp

export function showWildCamp(host: HTMLElement, q: URLSearchParams): void {
  const time: TimeOfDay = q.get('time') === 'evening' ? 'evening' : 'day';
  document.body.classList.add(WILD_LANDS.panelClass);
  const stage = new Stage(host, T);
  stage.maxTilesTall = 22;
  const ctx: SceneCtx = {
    scene: new THREE.Scene(),
    lighting: new Lighting(),
    px: T,
    time,
  };
  const built = FIELD_CAMP.build(ctx);
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
  person(PLAYER16, 'down', CAMP_SPOTS.player.x, CAMP_SPOTS.player.y);
  person(RANGER_TALA, 'left', CAMP_SPOTS.host.x, CAMP_SPOTS.host.y);
  person(LANI_KAHALE, 'down', CAMP_SPOTS.lab.x, CAMP_SPOTS.lab.y);

  // Finn hovers by the player
  const finnHome = { x: 12, y: 11.6 };
  const finnTex = {
    right: [0, 1, 2].map((f) => pixelTexture(paintFinn(T, 'right', f).toCanvas())),
    left: [0, 1, 2].map((f) => pixelTexture(paintFinn(T, 'left', f).toCanvas())),
  };
  const finn = billboard(ctx.lighting, T, paintFinn(T, 'right', 0).toCanvas(), finnHome.x, finnHome.y, 1.2);
  const finnShadow = shadow(T, 0.7);
  ctx.scene.add(finn, finnShadow);

  const music = h('button', {
    class: 'btn small ld-music',
    type: 'button',
    text: 'Play world music',
  });
  let playing = false;
  music.addEventListener('click', () => {
    audio.addSong(WILD_LANDS.id, WILD_LANDS.music!);
    audio.play(playing ? null : WILD_LANDS.id);
    playing = !playing;
    music.textContent = playing ? 'Stop music' : 'Play world music';
  });
  host.appendChild(
    h(
      'div',
      { class: 'ld-label panel' },
      h('strong', {
        text: `Wild Lands: ${FIELD_CAMP.name} (${WILD_LANDS.timeNames[time]})`,
      }),
      h('span', {
        text: `${T} pixels per tile · look development for the nature world`,
      }),
      h('div', { class: 'ld-row' }, pageNav(currentToken().replace('-quiet', '') || 'wild-camp', true), music),
    ),
  );
  if (q.get('talk') !== '0') void new Talk(host).say(speaker('Ranger Tala', 'Wild Lands guide', RANGER_TALA, 150), LINES[time], 'smile');

  const t0 = performance.now();
  let lastX = finnHome.x;
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    built.update(t, stage.target.x);
    const snap = (v: number) => Math.round(v * T) / T;
    const fx = finnHome.x + Math.sin(t * 0.5) * 1.2;
    const dir = fx >= lastX ? 'right' : 'left';
    lastX = fx;
    finn.position.set(snap(fx), (1.2 + Math.round(Math.sin(t * 2.4) * 2) / T) * K, finnHome.y * K);
    swapFrame(finn, finnTex[dir][Math.floor(t * 8) % 3]);
    finnShadow.position.set(snap(fx), 0.015, finnHome.y * K);
    figs.forEach((f, i) => f.frame((t + i * 0.7) % 3.4 > 3.25 ? 1 : 0));
    stage.render(ctx.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage } });
}

// ------------------------------------------------------------------ the dive

export function showWildReef(host: HTMLElement, q: URLSearchParams): void {
  document.body.classList.add(WILD_LANDS.panelClass);
  const hold = OCEAN_ZONES.find((z) => z.id === q.get('zone'));
  const cvs = h('canvas', { class: 'px ld-dive' }) as HTMLCanvasElement;
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
  host.appendChild(cvs);
  const g = cvs.getContext('2d')!;
  const label = h('strong', { text: 'Ocean Depth Diver: the dive' });
  const note = h('span', {
    text: 'Steer the little submarine down past the reef. The light fades from turquoise to black; animals in the dark make their own light.',
  });
  host.appendChild(h('div', { class: 'ld-label panel' }, label, note, h('div', { class: 'ld-row' }, pageNav(currentToken().replace('-quiet', '') || 'wild-reef', true))));
  const talkZone = hold ?? OCEAN_ZONES[0];
  if (q.get('talk') !== '0') void new Talk(host).say(finnSpeaker(), LINES[talkZone.id as keyof typeof LINES] ?? LINES.sunlight, 'smile');
  const t0 = performance.now();
  let frame = 0;
  const draw = () => {
    const scale = Math.max(2, Math.round(Math.min(window.innerWidth / 360, window.innerHeight / 220)));
    const W = Math.ceil(window.innerWidth / scale);
    const H = Math.ceil(window.innerHeight / scale);
    if (cvs.width !== W || cvs.height !== H) {
      cvs.width = W;
      cvs.height = H;
    }
    const t = (performance.now() - t0) / 1000;
    // without a held zone the camera slowly sinks from the surface to the midnight zone and back up
    const depth = hold ? hold.view : 30 + ((1 - Math.cos(t * 0.12)) / 2) * 2370;
    const zone: OceanZone = OCEAN_ZONES.filter((z) => depth >= z.top).pop() ?? OCEAN_ZONES[0];
    label.textContent = `Ocean Depth Diver: the ${zone.name} (${Math.round(depth)} m)`;
    const pic = paintOcean(W, H, {
      depth,
      frame,
      sub: {
        x: W * 0.6 + Math.sin(t * 0.7) * 10,
        y: H * 0.46 + Math.sin(t * 1.4) * 3,
        face: Math.cos(t * 0.7) >= 0 ? 'right' : 'left',
      },
    });
    g.clearRect(0, 0, W, H);
    pic.drawTo(g, 0, 0, 1);
    frame++;
    setTimeout(() => requestAnimationFrame(draw), 80);
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

export function showWildCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Wild Lands and Ocean Depth Diver: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) =>
    page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));
  const people = (l: Look16) => [cv(paintHero(l, 1.5, 'down'), Z), cv(paintHero(l, 1.5, 'right'), Z)];
  const portrait = (l: Look16, m: Mood) => cv(paintPortrait16(l, m), 2, 'pframe new');

  block(
    '1. The people',
    'Ranger Tala runs the field camp and is the world’s guide. Dr. Lani Kahale is the marine biologist who hosts Ocean Depth Diver (a draft name).',
    card([...people(RANGER_TALA), portrait(RANGER_TALA, 'smile')], 'Ranger Tala', 'Wild Lands guide'),
    card([...people(LANI_KAHALE), portrait(LANI_KAHALE, 'smile'), portrait(LANI_KAHALE, 'curious')], 'Dr. Lani Kahale', 'Marine biologist, Ocean Depth Diver host'),
    card([cv(paintHero(PLAYER16, 1.5, 'down'), Z)], 'The player', 'Made in the character creator'),
  );
  block(
    '2. Finn and the submarine',
    'Finn is the robot camera: it takes the photos for the field guide and gives hints. The little submarine (a draft name: the Little Nautilus) has a big window and a headlamp for the dark.',
    card(
      [cv(paintFinn(T, 'right', 0), Z), cv(paintFinn(T, 'right', 1), Z), cv(paintFinn(T, 'left', 2), Z), cv(paintFinn(T, 'right', 0, true), Z)],
      'Finn',
      'Hovering, swimming, facing left, blinking',
    ),
    card([cv(paintFinnPortrait(true), 2, 'pframe new'), cv(paintFinnPortrait(false), 2, 'pframe new')], 'Finn in the talk box', 'Happy and thinking'),
    card([cv(paintSub(T, 'right', 0), 2), cv(paintSub(T, 'right', 1, true), 2)], 'The submarine', 'Lamp off, and lamp on'),
  );
  block(
    '3. Rainforest and river animals',
    'Friendly and calm, never shown hurt. The jaguar rests on a rock on the far bank.',
    card([cv(paintFrog(T, 0), Z), cv(paintFrog(T, 1), Z)], 'Red-eyed tree frog', 'Sitting, and puffing its throat'),
    card([cv(paintToucan(T, 0), Z), cv(paintToucan(T, 1), Z)], 'Toucan', 'On a branch'),
    card([cv(paintMonkey(T, 0), Z), cv(paintMonkey(T, 1), Z)], 'Spider monkey', 'Sitting up in a tree'),
    card([cv(paintSloth(T, 0), Z), cv(paintSloth(T, 1), Z)], 'Sloth', 'Very slowly blinking'),
    card([cv(paintButterfly(T, 0), Z), cv(paintButterfly(T, 1), Z), cv(paintButterfly(T, 2), Z)], 'Blue morpho butterfly', 'Flapping'),
    card([cv(paintHeron(T, 0), Z), cv(paintHeron(T, 1), Z)], 'Heron', 'In the shallows'),
    card([cv(paintJaguar(T, 0), Z), cv(paintJaguar(T, 1), Z)], 'Jaguar', 'Resting calmly'),
  );
  const sea = 3;
  block(
    '4. Sea animals (for the dives)',
    'Each lives in its real zone: turtles, clownfish and rays in the sunlit reef; lanternfish and jellies in the twilight zone; the anglerfish in the midnight zone.',
    card([cv(paintTurtle(sea, 0), 2), cv(paintTurtle(sea, 2), 2)], 'Green sea turtle', 'Sunlight zone'),
    card([cv(paintClownfish(sea, 0), 2)], 'Clownfish', 'Sunlight zone, in the reef'),
    card([cv(paintRay(sea, 0), 2)], 'Spotted eagle ray', 'Sunlight zone'),
    card([cv(paintOctopus(sea, 0), 2)], 'Octopus', 'On the reef'),
    card([cv(paintLanternfish(sea, 0), 2), cv(paintLanternfish(sea, 1), 2)], 'Lanternfish', 'Twilight zone, glowing spots'),
    card([cv(paintJelly(sea, 0), 2), cv(paintJelly(sea, 1), 2)], 'Glowing jelly', 'Twilight zone'),
    card([cv(paintAnglerfish(sea, 0), 2), cv(paintAnglerfish(sea, 1), 2)], 'Anglerfish', 'Midnight zone, with its glowing lure'),
  );
  block(
    '5. The field camp',
    'The camp’s stations, where the game’s missions start.',
    card([cv(paintLabTent(T), 2)], 'The lab tent', 'Dr. Lani’s lab, home of the Creature Designer'),
    card([cv(paintTent(T, 0), 2), cv(paintTent(T, 1), 2)], 'Tents', 'Where the scientists sleep'),
    card([cv(paintTouchTank(T, 0), 2)], 'The touch tank', 'A starfish and an urchin'),
    card([cv(paintZoneChart(T), 2)], 'The ocean-zone chart', 'From bright turquoise to black'),
    card([cv(paintWeatherMast(T, 0), 2)], 'The weather mast', 'A wind cup and a rain gauge'),
  );
}
