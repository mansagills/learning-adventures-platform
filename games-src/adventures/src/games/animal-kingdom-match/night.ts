/**
 * The Night Safari (the finale), as data and pure functions.
 *
 * After all four trips, the sun sets over the field camp. With a flashlight,
 * the child sweeps the dark forest beyond the camp. Two dots of eye shine
 * give each night animal away; shining the light on them shows the animal,
 * a fact and one question about life at night. Animals busy at night are
 * called nocturnal.
 *
 * Positions are in the night scene's pixels (NIGHT_W x NIGHT_H).
 */

import type { Misconception } from './problems';

export const NIGHT_W = 320;
export const NIGHT_H = 180;

export type NightId = 'owl' | 'bat' | 'frog' | 'kinkajou' | 'jaguar';

export interface NightAnimal {
  id: NightId;
  name: string;
  /** Where its picture's bottom-centre stands, and its size (scene pixels). */
  x: number;
  y: number;
  size: number;
  /** Where its eyes shine (the middle of the pair), and their color. */
  eyes: { x: number; y: number; gap: number; color: string };
  fact: string;
  ask: string;
  right: string;
  wrong: Array<[string, Misconception, string]>;
  explain: string;
}

export const NIGHT_ANIMALS: NightAnimal[] = [
  {
    id: 'owl',
    name: 'Spectacled owl',
    x: 62,
    y: 72,
    size: 34,
    eyes: { x: 62, y: 52, gap: 7, color: '#ffd84a' },
    fact: 'Spectacled owls sleep by day and hunt at night. Their huge eyes gather every bit of moonlight.',
    ask: 'An owl’s big eyes help it see at night. Can an owl see in total darkness?',
    right: 'No. It needs a little light, like moonlight.',
    wrong: [
      ['Yes. Owls see in total darkness.', 'owl-dark', 'Even owls need a little light. Their big eyes help them use it.'],
      ['Owls sleep all night', 'night-mixup', 'This owl is wide awake. Night is when it hunts.'],
    ],
    explain: 'Big eyes gather what little light there is. In total darkness, owls hunt by listening.',
  },
  {
    id: 'bat',
    name: 'Fruit bat',
    x: 258,
    y: 62,
    size: 30,
    eyes: { x: 258, y: 52, gap: 5, color: '#ff9a5a' },
    fact: 'Fruit bats fly at night to eat fruit. They spread the seeds, and new trees grow.',
    ask: 'Some people say bats are blind. Are bats blind?',
    right: 'No. Bats can see.',
    wrong: [
      ['Yes. All bats are blind.', 'bats-blind', 'That is a common saying, but it is not true. Bats can see.'],
      ['Bats only fly in the daytime', 'night-mixup', 'Most bats fly at night, like this one.'],
    ],
    explain: 'Bats can see. Fruit bats have big eyes and a great sense of smell. Many other bats also use echoes to find food.',
  },
  {
    id: 'frog',
    name: 'Red-eyed tree frog',
    x: 150,
    y: 128,
    size: 22,
    eyes: { x: 150, y: 119, gap: 5, color: '#ff6a6a' },
    fact: 'By day it sleeps on a leaf. At night it wakes up to hunt bugs.',
    ask: 'A tree frog has thin, damp skin. Why is it good for it to hunt at night?',
    right: 'The night is cooler and damper, so its skin stays wet',
    wrong: [
      ['Bugs only exist at night', 'night-mixup', 'Bugs are out by day too. This is about the frog’s skin.'],
      ['Frogs are afraid of the moon', 'wrong-reason', 'Frogs are not afraid of the moon.'],
    ],
    explain: 'A frog’s thin skin must stay damp. The cool, damp night is a safer time for it to be out.',
  },
  {
    id: 'kinkajou',
    name: 'Kinkajou',
    x: 206,
    y: 92,
    size: 26,
    eyes: { x: 211, y: 80, gap: 5, color: '#9affc8' },
    fact: 'A kinkajou, like Kiki, sleeps in a tree hole by day. At night it eats fruit and drinks flower nectar.',
    ask: 'Kiki’s cousin is out in the trees. When is a kinkajou busy?',
    right: 'At night',
    wrong: [
      ['At midday', 'night-mixup', 'At midday a kinkajou is asleep in a tree hole.'],
      ['Only in winter', 'night-mixup', 'It is busy every night, all year round.'],
    ],
    explain: 'Animals that are busy at night and sleep by day are called nocturnal. Kinkajous are nocturnal.',
  },
  {
    id: 'jaguar',
    name: 'Jaguar',
    x: 286,
    y: 156,
    size: 26,
    eyes: { x: 292, y: 146, gap: 4, color: '#9affc8' },
    fact: 'Far off, a jaguar rests in the dark. Jaguars often hunt at dawn, dusk and night.',
    ask: 'The jaguar’s eyes shine in the flashlight. Why do some animals’ eyes shine?',
    right: 'A shiny layer in their eyes bounces light back',
    wrong: [
      ['Their eyes make their own light', 'wrong-reason', 'The shine is the flashlight bouncing back.'],
      ['They are angry', 'wrong-reason', 'Eye shine has nothing to do with feelings.'],
    ],
    explain: 'A shiny layer at the back of the eye bounces light back. It helps the animal see at night, and makes its eyes shine.',
  },
];

/** The flashlight's beam radius (scene pixels), and how close to the eyes its middle must be to count. */
export const BEAM_R = 30;
export const HIT_R = 22;

/** The night animal whose eyes the beam is on (not yet found), or null. */
export function shineHit(bx: number, by: number, found: readonly NightId[]): NightAnimal | null {
  let best: NightAnimal | null = null;
  let d = HIT_R;
  for (const a of NIGHT_ANIMALS) {
    if (found.includes(a.id)) continue;
    const dd = Math.hypot(a.eyes.x - bx, a.eyes.y - by);
    if (dd <= d) {
      d = dd;
      best = a;
    }
  }
  return best;
}

/** The nearest animal still to find (for Kiki's help), or null. */
export function nearestNight(bx: number, by: number, found: readonly NightId[]): NightAnimal | null {
  const left = NIGHT_ANIMALS.filter((a) => !found.includes(a.id));
  left.sort((a, b) => Math.hypot(a.eyes.x - bx, a.eyes.y - by) - Math.hypot(b.eyes.x - bx, b.eyes.y - by));
  return left[0] ?? null;
}

/** Where Kiki says to look ("up high on the left"). */
export function whereIs(a: NightAnimal): string {
  const side = a.eyes.x < NIGHT_W * 0.35 ? 'on the left' : a.eyes.x > NIGHT_W * 0.65 ? 'on the right' : 'in the middle';
  const height = a.eyes.y < NIGHT_H * 0.4 ? 'up high' : a.eyes.y > NIGHT_H * 0.7 ? 'down low' : 'in the middle of the trees';
  return `${height} ${side}`;
}

// ------------------------------------------------------------------ Speed Match

/** Seconds in a Speed Match round. */
export const SPEED_SECONDS = 60;
