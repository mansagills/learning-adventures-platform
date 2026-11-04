import type { Power } from '../../kit/worlds/wild-lands/weather-art';

/**
 * Power cards and the Weather Shop (the owner's idea, 2026-11-04).
 *
 * The five weather powers are needed to cross the levels, so the story gives
 * them; each comes with a card that says what it does in the game and the
 * real science behind it. The shop sells extra power-ups that make the game
 * easier or more fun but are never needed to finish a level. Each power-up
 * has its own science card too. Children pay with droplets: the ones they
 * bring to the flag, plus a bonus for answering the questions well.
 */

export interface PowerCard {
  name: string;
  /** What it does in the game. */
  game: string;
  /** The real science. */
  science: string;
  /** When it does not work, and why. */
  limit: string;
}

export const POWER_CARDS: Record<Power, PowerCard> = {
  sun: {
    name: 'Sun',
    game: 'Shine the Sun on water to make warm, rising air that lifts you up. The Sun also melts ice and snow.',
    science: 'The Sun heats water, and some of it evaporates: it turns into water vapor, an invisible gas that rises with the warm air. This is how water leaves the sea and starts the water cycle.',
    limit: 'It needs water or ice in front of you. With nothing to warm, nothing happens.',
  },
  cool: {
    name: 'Cool air',
    game: 'Cool the rising water vapor into a cloud you can stand on.',
    science: 'When water vapor cools, it turns back into tiny drops of liquid water. This is called condensation. Billions of tiny drops together make a cloud.',
    limit: 'It needs rising water vapor first. Use the Sun on water, then Cool air.',
  },
  wind: {
    name: 'Wind',
    game: 'Blow a cloud along so you can ride it across a gap. Wind also turns windmills.',
    science: 'Wind is moving air. It carries clouds, and the water in them, far from where they formed, so rain can fall far from the sea.',
    limit: 'It needs a cloud (or a windmill) to push.',
  },
  rain: {
    name: 'Rain',
    game: 'Make a full, grey cloud rain. Rain grows seeds into vines you can climb and waters crops.',
    science: 'Inside a cloud, tiny drops bump together and join into bigger drops. When they are too heavy to float, they fall as rain. Grey clouds are full of big drops.',
    limit: 'Only a full, grey cloud can rain. A small white cloud is not full enough. Below 0 °C the rain falls as snow.',
  },
  cold: {
    name: 'Cold',
    game: 'Freeze a river or a waterfall into ice you can walk on.',
    science: 'Water freezes into solid ice when it is colder than 0 °C (32 °F). Ice melts back into water when it warms up.',
    limit: 'It only works where the thermometer shows less than 0 °C. Warmer water will not freeze.',
  },
};

export type GearId = 'radar' | 'grip' | 'magnet' | 'bigcloud' | 'glider';

export interface Gear {
  id: GearId;
  name: string;
  cost: number;
  /** One line for the shop list. */
  short: string;
  /** What it does in the game. */
  game: string;
  /** The real science behind it. */
  science: string;
}

/** Sorted by price. None is needed to finish a level. */
export const GEAR: Gear[] = [
  {
    id: 'radar',
    name: 'Weather Radar',
    cost: 12,
    short: 'An arrow points to droplets you have missed.',
    game: 'An arrow at the edge of the screen points to the nearest droplet you have not collected yet.',
    science: 'Real weather radar sends out radio waves. They bounce off raindrops and come back, so forecasters can see where rain is falling, even far away.',
  },
  {
    id: 'grip',
    name: 'Grip Boots',
    cost: 20,
    short: 'No more sliding on ice.',
    game: 'You stop quickly on ice instead of sliding.',
    science: 'Ice is smooth, so there is little friction to stop you. Rough soles make more friction. That is why people spread sand on icy paths.',
  },
  {
    id: 'magnet',
    name: 'Sticky Drops',
    cost: 25,
    short: 'Droplets near you float over and join you.',
    game: 'Droplets close to you float over and join you, even if you only pass near them.',
    science: 'Water drops pull on each other. When two drops touch, they join into one bigger drop. In a cloud, tiny drops join like this until they are heavy enough to fall as rain.',
  },
  {
    id: 'bigcloud',
    name: 'Big Clouds',
    cost: 30,
    short: 'The clouds you make are wider, so landing is easier.',
    game: 'Clouds you make with Cool air are half as wide again, so they are easier to land on.',
    science: 'More water vapor makes a bigger cloud. On warm, wet days, clouds can grow taller than a mountain.',
  },
  {
    id: 'glider',
    name: 'Maple Wings',
    cost: 35,
    short: 'Hold jump while falling to float down slowly.',
    game: 'Hold the jump key while you fall to float down slowly, like a maple seed.',
    science: 'Air pushes up on things as they fall. This is called air resistance. Wide, light things, like a maple seed or a parachute, catch a lot of air, so they fall slowly.',
  },
];

export const GEAR_IDS: GearId[] = GEAR.map((g) => g.id);

export function gear(id: GearId): Gear {
  return GEAR.find((g) => g.id === id)!;
}

/** Droplets earned for answers: more for a first try, but every right answer earns something. */
export const BONUS = {
  forecast: { first: 5, later: 2 },
  book: { first: 3, later: 1 },
  talk: { first: 10, later: 5 },
} as const;

export function bonusFor(kind: keyof typeof BONUS, firstTry: boolean): number {
  return firstTry ? BONUS[kind].first : BONUS[kind].later;
}

export type BuyResult = { ok: true; wallet: number } | { ok: false; why: 'owned' | 'short' };

export function tryBuy(wallet: number, owned: readonly GearId[], id: GearId): BuyResult {
  if (owned.includes(id)) return { ok: false, why: 'owned' };
  const g = gear(id);
  if (wallet < g.cost) return { ok: false, why: 'short' };
  return { ok: true, wallet: wallet - g.cost };
}
