/**
 * Chapter 3 data: the crops, the two plots and a small, honest soil model.
 *
 * The model is deliberately simple and labeled as a model in the game:
 * - cotton takes nitrogen (plant food) out of the soil each season;
 * - legumes (peanuts, cowpeas) put a little back, slowly, season by season;
 * - sweet potatoes use a little, much less than cotton;
 * - the same crop twice in a row loses some harvest to pests that like it.
 * Nothing restores soil instantly, and every harvest is shown as a range
 * because weather changes real results. (Facts reviewed against the NPS
 * biography and the USDA National Agricultural Library soil exhibit.)
 */

export type CropId = 'cotton' | 'peanuts' | 'cowpeas' | 'sweetpotato';

export interface Crop {
  id: CropId;
  name: string;
  legume: boolean;
  /** Soil points added (+) or used (-) by one season of this crop. */
  soil: number;
  /** What the harvest is good for (Mr. Hill's family and animals, or to sell). */
  use: string;
  /** One-line, child-friendly mechanism. */
  why: string;
  /** Field sprite (art/props.ts crop variants). */
  sprite: number;
}

export const CROPS: Record<CropId, Crop> = {
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    legume: false,
    soil: -6,
    use: 'Sells for money',
    why: 'Cotton takes nitrogen, a plant food, out of the soil. Nothing puts it back.',
    sprite: 6,
  },
  peanuts: {
    id: 'peanuts',
    name: 'Peanuts',
    legume: true,
    soil: 6,
    use: 'Food, and a crop to sell',
    why: 'Peanuts are legumes. Bumps on their roots hold helpful bacteria that turn air into nitrogen, and some of it stays in the soil.',
    sprite: 5,
  },
  cowpeas: {
    id: 'cowpeas',
    name: 'Cowpeas',
    legume: true,
    soil: 9,
    use: 'Food for people and animals',
    why: 'Cowpeas are legumes, too. When the leftover vines are turned into the soil, they feed it a little more.',
    sprite: 5,
  },
  sweetpotato: {
    id: 'sweetpotato',
    name: 'Sweet potatoes',
    legume: false,
    soil: -2,
    use: 'Food that keeps all winter',
    why: 'Sweet potatoes are not legumes. They use a little nitrogen, much less than cotton.',
    sprite: 7,
  },
};

export const CROP_ORDER: CropId[] = ['cotton', 'peanuts', 'cowpeas', 'sweetpotato'];

export const SEASONS = 4;
/** The west plot's soil at the start (it has grown cotton five years in a row). */
export const WEST_START = 28;
export const EAST_SOIL = 58;
const SOIL_MIN = 5;
const SOIL_MAX = 90;
/** Harvest lost when the same crop follows itself (pests and diseases build up). */
export const REPEAT_FACTOR = 0.75;

/** Mr. Hill's plan: what he has always done. */
export const FARMER_PLAN: CropId[] = ['cotton', 'cotton', 'cotton', 'cotton'];
/** The worked example the last hint fills in. */
export const EXAMPLE_PLAN: CropId[] = ['cowpeas', 'cotton', 'peanuts', 'cotton'];

export function soilLabel(soil: number): 'worn out' | 'tired' | 'okay' | 'healthy' {
  if (soil < 20) return 'worn out';
  if (soil < 35) return 'tired';
  if (soil < 55) return 'okay';
  return 'healthy';
}

/** Harvest on a 0-10 scale for one season, before weather. */
function harvestFor(crop: CropId, soil: number): number {
  if (crop === 'cotton') return Math.min(10, (soil / 60) * 10);
  if (crop === 'sweetpotato') return 5 + (3 * soil) / 100;
  return 4 + (3 * soil) / 100;
}

export interface SeasonResult {
  season: number;
  crop: CropId;
  soilBefore: number;
  soilAfter: number;
  /** Expected harvest (0-10) and its weather range. */
  harvest: number;
  low: number;
  high: number;
  repeated: boolean;
}

export interface PlanResult {
  plan: CropId[];
  seasons: SeasonResult[];
  start: number;
  end: number;
  cottonSeasons: number;
  hasLegume: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Run a plan on the west plot. Deterministic: the same plan always gives the same result. */
export function simulate(plan: CropId[], start = WEST_START): PlanResult {
  let soil = start;
  const seasons: SeasonResult[] = plan.map((crop, i) => {
    const repeated = i > 0 && plan[i - 1] === crop;
    let h = harvestFor(crop, soil);
    if (repeated) h *= REPEAT_FACTOR;
    const before = soil;
    soil = Math.max(SOIL_MIN, Math.min(SOIL_MAX, soil + CROPS[crop].soil));
    return {
      season: i + 1,
      crop,
      soilBefore: before,
      soilAfter: soil,
      harvest: round1(h),
      low: round1(h * 0.8),
      high: round1(Math.min(10, h * 1.2)),
      repeated,
    };
  });
  return {
    plan: [...plan],
    seasons,
    start,
    end: soil,
    cottonSeasons: plan.filter((c) => c === 'cotton').length,
    hasLegume: plan.some((c) => CROPS[c].legume),
  };
}

export function isFarmerPlan(plan: CropId[]): boolean {
  return plan.length === SEASONS && plan.every((c) => c === 'cotton');
}

export type PlanVerdict = 'ok' | 'no-cotton' | 'no-legume' | 'soil-falls';

/**
 * Can this plan go to Carver? It must still grow cotton (Mr. Hill's need),
 * include a legume, and leave the soil at least as healthy as it started.
 */
export function judgePlan(r: PlanResult): PlanVerdict {
  if (r.cottonSeasons === 0) return 'no-cotton';
  if (!r.hasLegume) return 'no-legume';
  if (r.end < r.start) return 'soil-falls';
  return 'ok';
}

export function planText(plan: CropId[]): string {
  return plan.map((c) => CROPS[c].name.toLowerCase()).join(', ');
}

/** How the soil changed, in words. */
export function trendText(r: PlanResult): string {
  const d = r.end - r.start;
  if (d <= -15) return 'down a lot';
  if (d < -2) return 'down a little';
  if (d <= 2) return 'about the same';
  if (d < 12) return 'up a little';
  return 'up';
}

/** The magnified soil views: parts of each picture the player can look at closely. */
export interface SoilZone {
  id: string;
  label: string;
  /** Position in the 96x64 painting. */
  x: number;
  y: number;
  w: number;
  h: number;
  detail: string;
}

export interface PlotInfo {
  id: 'west' | 'east';
  name: string;
  art: string;
  history: string;
  zones: SoilZone[];
  /** Where the player stands to take the sample (farm scene). */
  stand: { x: number; y: number };
}

export const PLOTS: PlotInfo[] = [
  {
    id: 'west',
    name: 'West plot',
    art: 'soil-west',
    history: 'Cotton, cotton, cotton, cotton, cotton.',
    stand: { x: 4.5, y: 7.5 },
    zones: [
      { id: 'color', label: 'Look at the color of the soil', x: 4, y: 4, w: 30, h: 22, detail: 'Pale and dusty, like sand. Healthy soil is usually darker.' },
      { id: 'crust', label: 'Look at the cracks on top', x: 44, y: 6, w: 40, h: 16, detail: 'A hard crust with cracks. Rain would run off instead of soaking in.' },
      { id: 'life', label: 'Look for roots and living things', x: 30, y: 36, w: 44, h: 24, detail: 'One thin cotton root, and no worms at all. Not much is living here.' },
    ],
  },
  {
    id: 'east',
    name: 'East plot',
    art: 'soil-east',
    history: 'Cotton, peanuts, cotton, cowpeas, cotton.',
    stand: { x: 11.5, y: 7.5 },
    zones: [
      { id: 'color', label: 'Look at the color of the soil', x: 4, y: 4, w: 30, h: 22, detail: 'Dark brown and crumbly, like cake crumbs. It holds water like a sponge.' },
      { id: 'worm', label: 'Look at the wiggly thing', x: 40, y: 8, w: 30, h: 16, detail: 'An earthworm! Worms mix the soil and leave tunnels for air and water.' },
      { id: 'nodules', label: 'Look at the bumps on the old root', x: 30, y: 36, w: 44, h: 24, detail: 'Little round bumps on an old cowpea root. They are nodules, where helpful bacteria turn air into nitrogen, a plant food.' },
    ],
  },
];

export function plotById(id: string): PlotInfo | undefined {
  return PLOTS.find((p) => p.id === id);
}

/** Where the planning bench is (farm scene). */
export const BENCH = { x: 7.5, y: 3.4 };

/** The "why" question after comparing plans. */
export const WHY_OPTIONS = [
  {
    id: 'nitrogen',
    text: 'Cotton kept taking nitrogen, a plant food, out of the soil, and nothing put it back.',
    ok: true,
    feedback: 'Yes. Season after season, cotton used up the plant food, so each cotton crop had less to grow on.',
  },
  {
    id: 'bored',
    text: 'The soil got tired of cotton, the way people get bored.',
    ok: false,
    misconception: 'soil-has-feelings',
    feedback: 'Soil doesn\'t get bored. Look at the soil bar: something cotton does changes the soil each season.',
  },
  {
    id: 'water',
    text: 'Cotton made the soil too wet.',
    ok: false,
    misconception: 'cotton-wets-soil',
    feedback: 'The west soil was dry and cracked, not wet. Look at the crop card for cotton.',
  },
] as const;
