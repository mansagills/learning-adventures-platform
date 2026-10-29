import * as THREE from 'three';
import { PixelBuffer } from '../kit/art/pixel';
import type { Expression } from '../kit/art/portraits';
import { h } from '../kit/ui/dom';
import { Talk, type Speaker } from '../kit/ui/talk';
import { Lighting, pixelTexture } from '../kit/world/sceneKit';
import { Figure, Stage, swapFrame, type SceneCtx, type Setting, type TimeOfDay } from '../kit/worlds';
import '../kit/worlds/worlds.css';
import '../kit/worlds/wild-lands/wild.css';
import { paintHero, paintPortrait16, PLAYER16, type Look16, type Mood } from '../kit/worlds/hero16';
import { placer } from '../kit/worlds/place';
import {
  AMARA_OSEI,
  ANIMAL_HOME,
  ANIMAL_IDS,
  HABITATS,
  paintAnimal,
  paintBarrelCactus,
  paintBeaverLodge,
  paintBinoculars,
  paintEyeShine,
  paintFlashlight,
  paintHabitatMap,
  paintIce,
  paintKiki,
  paintKikiPortrait,
  paintLilyPads,
  paintPolarHut,
  paintRescueTent,
  paintSaguaro,
  type AnimalId,
} from '../kit/worlds/wild-lands/animal-art';
import { RANGER_TALA } from '../kit/worlds/wild-lands/art';
import { CAMP_SPOTS, FIELD_CAMP } from '../kit/worlds/wild-lands/camp';
import { DESERT, POLAR, RAINFOREST, WETLAND } from '../kit/worlds/wild-lands/habitats';
import { WILD_LANDS } from '../kit/worlds/wild-lands/style';
import { currentToken, pageNav } from './nav';

/**
 * Look development for Animal Kingdom Match, the third Wild Lands game (the
 * S3 section of docs/GAMES_3D_UPGRADE_PLAN.md):
 *   #animal-cast         Dr. Amara Osei, Kiki the kinkajou, the 20 new animals and the props
 *   #animal-camp         the field camp with the Wildlife Rescue Center (#animal-camp-evening)
 *   #animal-rainforest   the rainforest trip (and -evening)
 *   #animal-desert       the desert trip (and -evening)
 *   #animal-polar        the poles: the Arctic and Antarctica, with the sea between (and -evening)
 *   #animal-wetland      the wetland and the sea (and -evening)
 * Add -quiet to hide the talk box. Not shipped: dev server only.
 */

const T = WILD_LANDS.px;

export const ANIMAL_NAMES: Record<AnimalId, string> = {
  'dart-frog': 'Poison dart frog',
  tapir: 'Tapir',
  camel: 'Camel',
  fennec: 'Fennec fox',
  gecko: 'Gecko',
  tortoise: 'Desert tortoise',
  roadrunner: 'Roadrunner',
  'polar-bear': 'Polar bear',
  'arctic-fox': 'Arctic fox',
  walrus: 'Walrus',
  penguin: 'Emperor penguin',
  seal: 'Weddell seal',
  'snowy-owl': 'Snowy owl',
  beaver: 'Beaver',
  crocodile: 'Crocodile',
  duck: 'Mallard duck',
  dolphin: 'Bottlenose dolphin',
  whale: 'Humpback whale',
  owl: 'Spectacled owl',
  bat: 'Fruit bat',
};

const HOME_NAMES: Record<(typeof ANIMAL_HOME)[AnimalId], string> = {
  rainforest: 'The rainforest',
  desert: 'The desert',
  arctic: 'The Arctic (north)',
  antarctic: 'Antarctica (south)',
  wetland: 'The wetland',
  sea: 'The sea',
  night: 'Night animal (the Night Safari)',
};

function speaker(name: string, role: string, look: Look16, voice: number): Speaker {
  const pics: Partial<Record<Mood, string>> = {};
  const pic = (m: Mood) => (pics[m] ??= paintPortrait16(look, m).toDataURL(2));
  return { name, role, voice, portrait: (e: Expression) => pic(e === 'thinking' ? 'thinking' : e === 'curious' ? 'curious' : 'smile') };
}

function kikiSpeaker(): Speaker {
  const happy = paintKikiPortrait(true).toDataURL(2);
  const flat = paintKikiPortrait(false).toDataURL(2);
  return { name: 'Kiki', role: 'The kinkajou', voice: 380, portrait: (e: Expression) => (e === 'thinking' ? flat : happy) };
}

const TALA = () => speaker('Ranger Tala', 'Wild Lands ranger', RANGER_TALA, 160);
const AMARA = () => speaker('Dr. Amara Osei', 'Wildlife vet', AMARA_OSEI, 200);

type Area = 'camp' | 'rainforest' | 'desert' | 'polar' | 'wetland';

const LINES: Record<Area, { day: string; evening: string; who: () => Speaker }> = {
  camp: {
    day: 'Welcome to the Wildlife Rescue Center! Animals that wander away from home stay with us until they are ready to go back. The map shows where each one lives.',
    evening: 'The sun is down and the fireflies are out. Tonight is the Night Safari. Bring your flashlight!',
    who: AMARA,
  },
  rainforest: {
    day: 'The rainforest is warm and wet all year. Look up! Animals live on the floor, in the middle and high in the treetops.',
    evening: 'At dusk the mushrooms glow and the fireflies come out. Many rainforest animals wake up at night.',
    who: TALA,
  },
  desert: {
    day: 'The desert gets very little rain. Animals here find shade, save water and stay out of the hot sun.',
    evening: 'The desert cools down fast at night. Now the fennec fox and the gecko come out to look for food.',
    who: AMARA,
  },
  polar: {
    day: 'On the left is the Arctic, at the top of the world. On the right is Antarctica, at the bottom. Polar bears live in the north. Penguins live in the south.',
    evening: 'Look up: green lights in the sky! That is an aurora. Thick fur and blubber keep these animals warm.',
    who: TALA,
  },
  wetland: {
    day: 'The pond and the river are fresh water. Past the beach, the sea is salty. Different animals live in each.',
    evening: 'At night the fireflies glow over the marsh, and tiny plankton make the sea sparkle blue.',
    who: AMARA,
  },
};

const SETTINGS: Record<Exclude<Area, 'camp'>, Setting> = { rainforest: RAINFOREST, desert: DESERT, polar: POLAR, wetland: WETLAND };

// ------------------------------------------------------------------ the scenes

export function showAnimalScene(host: HTMLElement, q: URLSearchParams): void {
  const area = (q.get('area') ?? 'camp') as Area;
  const time: TimeOfDay = q.get('time') === 'evening' ? 'evening' : 'day';
  document.body.classList.add(WILD_LANDS.panelClass);
  const stage = new Stage(host, T);
  stage.maxTilesTall = 22;
  const ctx: SceneCtx = { scene: new THREE.Scene(), lighting: new Lighting(), px: T, time };
  const built = area === 'camp' ? FIELD_CAMP.build({ ...ctx, omit: ['sub'] }) : SETTINGS[area].build(ctx);
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
  const s = built.spots;
  person(PLAYER16, 'down', s.player.x, s.player.y);
  const host2 = LINES[area].who === TALA ? RANGER_TALA : AMARA_OSEI;
  person(host2, 'right', s.host.x, s.host.y);
  // the camp: the Rescue Center tent with the Wild Lands map, and Ranger Tala too
  const { prop } = placer(ctx);
  if (area === 'camp') {
    prop(paintRescueTent(T).toCanvas(), 17.4, 13.2, 3.4);
    prop(paintHabitatMap(T, time === 'evening' ? [...HABITATS] : ['rainforest']).toCanvas(), 10.4, 14.2, 1);
    person(RANGER_TALA, 'left', CAMP_SPOTS.host.x + 1.6, CAMP_SPOTS.host.y + 0.6);
  }
  // Kiki rides along next to the player
  const kikiTex = [0, 1, 2, 3].map((f) => pixelTexture(paintKiki(T, f).toCanvas()));
  const kiki = prop(paintKiki(T, 0).toCanvas(), s.player.x + 1, s.player.y + 0.2, 0.7);
  // at night, eye shine in the dark beyond the light
  if (time === 'evening' && area !== 'camp') {
    for (const [x, y, c] of [
      [4, 7.4, '#f6ff8a'],
      [26, 8, '#9affc8'],
    ] as const)
      prop(paintEyeShine(T, c).toCanvas(), x, y, 0, 0.6);
  }
  host.appendChild(
    h(
      'div',
      { class: 'ld-label panel' },
      h('strong', { text: `Wild Lands: ${area === 'camp' ? 'the field camp and the Rescue Center' : SETTINGS[area].name} (${WILD_LANDS.timeNames[time]})` }),
      h('span', { text: `${T} pixels per tile · look development for Animal Kingdom Match` }),
      h('div', { class: 'ld-row' }, pageNav(currentToken().replace('-quiet', '') || `animal-${area}`, true)),
    ),
  );
  if (q.get('talk') !== '0') void new Talk(host).say(q.get('kiki') ? kikiSpeaker() : LINES[area].who(), LINES[area][time], 'smile');
  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    built.update(t, stage.target.x);
    figs.forEach((f, i) => f.frame((t + i * 0.7) % 3.4 > 3.25 ? 1 : 0));
    swapFrame(kiki, kikiTex[t % 5 > 4.5 ? 2 : t % 5 > 3.4 ? 1 : 0]);
    stage.render(ctx.scene);
    requestAnimationFrame(tick);
  };
  tick();
  Object.assign(window, { __lookdev: { stage } });
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

export function showAnimalCast(host: HTMLElement): void {
  document.body.classList.add('lookdev');
  const page = h('main', { class: 'sheet' });
  page.append(h('h1', { text: 'Animal Kingdom Match: look development' }), pageNav(currentToken()));
  host.appendChild(page);
  const Z = 3;
  const block = (title: string, hint: string, ...cards: HTMLElement[]) =>
    page.append(h('section', { class: 'block' }, h('h2', { text: title }), h('p', { class: 'hint', text: hint }), h('div', { class: 'portraits' }, ...cards)));
  const people = (l: Look16) => [cvs(paintHero(l, 1.5, 'down'), Z), cvs(paintHero(l, 1.5, 'right'), Z)];
  const portrait = (l: Look16, m: Mood) => cvs(paintPortrait16(l, m), 2, 'pframe new');

  block(
    '1. The people (draft names)',
    'Ranger Tala, whom children know from the other Wild Lands games, is the host for the first time. Dr. Amara Osei, a wildlife vet, runs the Rescue Center.',
    card([...people(RANGER_TALA), portrait(RANGER_TALA, 'smile')], 'Ranger Tala', 'Wild Lands ranger, the host'),
    card([...people(AMARA_OSEI), portrait(AMARA_OSEI, 'smile'), portrait(AMARA_OSEI, 'curious')], 'Dr. Amara Osei', 'Wildlife vet, the Rescue Center'),
  );
  block(
    '2. Kiki the kinkajou',
    'A kinkajou is a small, golden rainforest animal that is busy at night. Kiki rides on the child’s backpack and points with her long tail when an animal is near.',
    card(
      [0, 1, 2, 3].map((f) => cvs(paintKiki(T, f), Z)),
      'Kiki',
      'Sitting, pointing with her tail, blinking, walking',
    ),
    card([cvs(paintKikiPortrait(true), 2, 'pframe new'), cvs(paintKikiPortrait(false), 2, 'pframe new')], 'Kiki in the talk box', 'Happy and thinking'),
  );
  const groups: Array<[string, string, Array<(typeof ANIMAL_HOME)[AnimalId]>]> = [
    ['3. The rainforest', 'New for the rainforest trip (the frog, toucan, monkey, sloth, jaguar and butterfly from Ocean Depth Diver come too).', ['rainforest']],
    ['4. The desert', 'Desert animals stay cool and save water.', ['desert']],
    ['5. The poles', 'The Arctic in the north and Antarctica in the south. Polar bears and penguins never meet in the wild.', ['arctic', 'antarctic']],
    ['6. The wetland and the sea', 'Fresh water in the pond and river, salt water in the sea. Dolphins and whales are mammals that breathe air.', ['wetland', 'sea']],
    ['7. Night animals (the Night Safari)', 'Found at dusk by their eye shine in the flashlight beam.', ['night']],
  ];
  for (const [title, hint, homes] of groups)
    block(
      title,
      hint,
      ...ANIMAL_IDS.filter((id) => homes.includes(ANIMAL_HOME[id])).map((id) =>
        card(
          [0, 1, 2].map((f) => cvs(paintAnimal(id, T, f), 2)),
          ANIMAL_NAMES[id],
          HOME_NAMES[ANIMAL_HOME[id]],
        ),
      ),
    );
  block(
    '8. The Rescue Center and the trips’ props',
    'The Rescue Center tent and its Wild Lands map (each habitat lights up when its trip is done), and the props of the four trips.',
    card([cvs(paintRescueTent(T), 1)], 'The Wildlife Rescue Center', 'A paw-print sign and a fenced run'),
    card([cvs(paintHabitatMap(T, []), 2), cvs(paintHabitatMap(T, ['rainforest', 'desert']), 2), cvs(paintHabitatMap(T, [...HABITATS]), 2)], 'The Wild Lands map', 'No trips, two trips, all four'),
    card([cvs(paintSaguaro(T, 0), 2), cvs(paintSaguaro(T, 1), 2), cvs(paintBarrelCactus(T), 2)], 'Cactus', 'Saguaros store water in their stems'),
    card([cvs(paintIce(T, 0), 2), cvs(paintIce(T, 1), 2), cvs(paintPolarHut(T), 2), cvs(paintPolarHut(T, true), 2)], 'Ice and the research hut', 'By day, and lit at night'),
    card([cvs(paintBeaverLodge(T), 2), cvs(paintLilyPads(T, 0), 2)], 'The pond', 'A beaver lodge and lily pads'),
    card([cvs(paintBinoculars(3), 1), cvs(paintFlashlight(3, false), 1), cvs(paintFlashlight(3, true), 1)], 'Binoculars and the flashlight', 'For spotting, and for the Night Safari'),
    card([cvs(paintEyeShine(T), 3), cvs(paintEyeShine(T, '#9affc8'), 3)], 'Eye shine', 'What the flashlight shows at night'),
  );
}
