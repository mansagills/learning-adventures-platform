/**
 * Chapter 5: Science for the People / Farm Helper.
 *
 * Two neighbors at Two Creeks have different problems and different things
 * to work with. The player recommends two practical ideas for each farmer.
 * A plan fits when it covers every problem in the farmer's report and uses
 * only things the farmer can really do and afford. All of this is a simple
 * model for the game, not real farm advice for any one field.
 */

export type FarmerId = 'watts' | 'pryor';
export type Need = 'erosion' | 'soil' | 'food';
export type OptionId = 'compost' | 'cowpeas' | 'contour' | 'garden' | 'fertilizer' | 'wall';

export const FARMER_ORDER: FarmerId[] = ['watts', 'pryor'];
export const OPTION_ORDER: OptionId[] = ['compost', 'cowpeas', 'contour', 'garden', 'fertilizer', 'wall'];

export const NEED_TEXT: Record<Need, string> = {
  erosion: 'rain washing the soil away',
  soil: 'worn-out soil',
  food: 'not enough food for the family',
};

export interface Farmer {
  id: FarmerId;
  name: string;
  short: string;
  pronoun: { they: string; them: string; their: string };
  /** The problems in the farmer's own report. */
  needs: Need[];
  /** Free things the farmer already has. */
  has: string;
  limits: string;
  reportItem: string;
  /** Who else benefits when the plan works. */
  benefits: string;
}

export const FARMERS: Record<FarmerId, Farmer> = {
  watts: {
    id: 'watts',
    name: 'Mrs. Estelle Watts',
    short: 'Mrs. Watts',
    pronoun: { they: 'she', them: 'her', their: 'her' },
    needs: ['erosion', 'soil'],
    has: 'one cow, leaves every fall, and $3',
    limits: 'She works alone and has only $3.',
    reportItem: 'farm_report_a',
    benefits:
      'Mrs. Watts keeps her soil on the hill, so her cotton grows back thicker. And less mud washes down into the creek that Mr. Pryor and his family use.',
  },
  pryor: {
    id: 'pryor',
    name: 'Mr. Samuel Pryor',
    short: 'Mr. Pryor',
    pronoun: { they: 'he', them: 'him', their: 'his' },
    needs: ['soil', 'food'],
    has: 'creek muck, leaves in his woods, and a strong back',
    limits: 'He has no money and still owes the store.',
    reportItem: 'farm_report_b',
    benefits:
      'Mr. Pryor\'s children eat better this winter, his soil gets richer every year, and he can pay off the store instead of borrowing more.',
  },
};

export interface RecOption {
  id: OptionId;
  name: string;
  icon: string;
  /** What it is, in one line. */
  text: string;
  cost: string;
  /** Which problems it helps with. */
  fixes: Need[];
  /** The picture on the card is tempting, but it does not work here. */
  tempting?: boolean;
}

export const OPTIONS: Record<OptionId, RecOption> = {
  compost: {
    id: 'compost',
    name: 'Make compost',
    icon: 'leaf',
    text: 'Pile up leaves, manure or creek muck. In a few months it turns into rich, dark soil food.',
    cost: 'Free. Some shoveling.',
    fixes: ['soil'],
  },
  cowpeas: {
    id: 'cowpeas',
    name: 'Plant cowpeas',
    icon: 'cowpea',
    text: 'Cowpeas are legumes. They put nitrogen back in the soil, and the peas are good to eat.',
    cost: 'Free seeds at the Saturday seed swap.',
    fixes: ['soil', 'food'],
  },
  contour: {
    id: 'contour',
    name: 'Plow across the slope',
    icon: 'sketch',
    text: 'Plow rows that go across a hill, not up and down it, and keep a cover crop on the ground in winter. Each row catches the rain.',
    cost: 'Free. Just plow a new way.',
    fixes: ['erosion'],
  },
  garden: {
    id: 'garden',
    name: 'Vegetable garden + canning day',
    icon: 'jar',
    text: 'Grow greens, beans and sweet potatoes by the house, then put up jars at the free canning day in Miss Lottie\'s kitchen.',
    cost: 'Free. Seeds from the swap.',
    fixes: ['food'],
  },
  fertilizer: {
    id: 'fertilizer',
    name: 'Buy store fertilizer',
    icon: 'bag',
    text: 'A big sack of fertilizer from the store in town. The poster says "Bigger cotton, fast!"',
    cost: '$12 a sack, every year.',
    fixes: ['soil'],
    tempting: true,
  },
  wall: {
    id: 'wall',
    name: 'Build a stone wall',
    icon: 'kit',
    text: 'Haul stone from the quarry and build a long wall along the hill to hold the soil back.',
    cost: 'Free stone, but a far, heavy haul.',
    fixes: ['erosion'],
    tempting: true,
  },
};

export type Verdict = 'fits' | 'not-needed' | 'impractical';

export interface PickResult {
  id: OptionId;
  verdict: Verdict;
  /** Why, in words for the player (the "why", not just "wrong"). */
  why: string;
}

export interface PlanResult {
  farmer: FarmerId;
  picks: PickResult[];
  missing: Need[];
  passes: boolean;
  /** One line that sums up the plan. */
  summary: string;
}

/** Why each idea does, or does not, work for each farmer. */
const WHY: Record<FarmerId, Record<OptionId, { verdict: Verdict; why: string }>> = {
  watts: {
    compost: { verdict: 'fits', why: 'Her cow and the fall leaves make free compost to feed her tired soil.' },
    cowpeas: { verdict: 'fits', why: 'Free seeds from the swap, and cowpeas put nitrogen back in her soil.' },
    contour: { verdict: 'fits', why: 'Rows across the hill catch the rain, so her soil stops washing down. She can do it alone, for free.' },
    garden: { verdict: 'not-needed', why: 'Her report says she already has a garden. Food is not the problem she asked about.' },
    fertilizer: {
      verdict: 'impractical',
      why: 'It looks like a quick fix, but a sack costs $12 and she has $3. And the next hard rain would wash the fertilizer down the hill with her soil. It feeds one crop; it does not build soil for next year.',
    },
    wall: {
      verdict: 'impractical',
      why: 'A wall would hold the soil, but she works alone. Hauling stone from the far quarry would take her months. Plowing across the slope does the same job this season.',
    },
  },
  pryor: {
    compost: { verdict: 'fits', why: 'His creek muck and leaves make free compost for his worn-out soil.' },
    cowpeas: { verdict: 'fits', why: 'Free seeds at the swap. Cowpeas feed his soil and his family.' },
    contour: { verdict: 'not-needed', why: 'His field is flat, so rain does not wash it away. That is not one of his problems.' },
    garden: { verdict: 'fits', why: 'A garden and the free canning day put more food on his family\'s table all winter.' },
    fertilizer: {
      verdict: 'impractical',
      why: 'It is tempting, but he has no money and already owes the store. His own report says it cost more than it paid. It feeds one crop and does not build his soil for next year.',
    },
    wall: { verdict: 'not-needed', why: 'His field is flat, so a wall would not help. It would just be months of hauling stone.' },
  },
};

export function whyFor(farmer: FarmerId, option: OptionId): { verdict: Verdict; why: string } {
  return WHY[farmer][option];
}

/** Judge a pair of recommendations for one farmer. */
export function judgePlan(farmer: FarmerId, picks: OptionId[]): PlanResult {
  const f = FARMERS[farmer];
  const results: PickResult[] = picks.map((id) => ({ id, ...WHY[farmer][id] }));
  const covered = new Set(results.filter((r) => r.verdict === 'fits').flatMap((r) => OPTIONS[r.id].fixes));
  const missing = f.needs.filter((n) => !covered.has(n));
  const passes = picks.length === 2 && new Set(picks).size === 2 && missing.length === 0 && results.every((r) => r.verdict === 'fits');
  let summary: string;
  if (passes) summary = `This plan fits ${f.short}: it helps with ${f.needs.map((n) => NEED_TEXT[n]).join(' and ')}, using only free things ${f.pronoun.they} can do.`;
  else if (results.some((r) => r.verdict === 'impractical')) summary = `Not yet. One idea is something ${f.short} cannot really do. Read why, then swap it.`;
  else if (results.some((r) => r.verdict === 'not-needed')) summary = `Not yet. One idea does not match a problem in ${f.short}'s report.`;
  else summary = `Not yet. This plan does not help with ${missing.map((n) => NEED_TEXT[n]).join(' or ')}.`;
  return { farmer, picks: results, missing, passes, summary };
}

/** Every pair that fits (used by the tests and the worked example). */
export function goodPairs(farmer: FarmerId): OptionId[][] {
  const out: OptionId[][] = [];
  OPTION_ORDER.forEach((a, i) => OPTION_ORDER.slice(i + 1).forEach((b) => judgePlan(farmer, [a, b]).passes && out.push([a, b])));
  return out;
}

/** The worked example at the top of the hint ladder. */
export const EXAMPLE: Record<FarmerId, OptionId[]> = { watts: ['contour', 'compost'], pryor: ['cowpeas', 'garden'] };

export function planText(picks: OptionId[]): string {
  return picks.map((p) => OPTIONS[p].name.toLowerCase()).join(' and ');
}

// ---------------------------------------------------------------- inspecting

export interface Spot {
  id: string;
  farmer: FarmerId;
  label: string;
  /** Where to stand to look. */
  x: number;
  y: number;
  /** What the player notices (narrator lines). */
  lines: string[];
  /** A short note for the journal. */
  note: string;
}

export const SPOTS: Spot[] = [
  {
    id: 'gully',
    farmer: 'watts',
    label: 'Look at the ditch in the hillside field',
    x: 2.5,
    y: 9.35,
    lines: [
      'A deep ditch runs straight down the hill, cut by rainwater. It is called a gully.',
      'The rows were plowed up and down the slope, so every row is a little river when it rains.',
    ],
    note: 'Watts: gullies run down the slope, along rows plowed up and down the hill.',
  },
  {
    id: 'hill',
    farmer: 'watts',
    label: 'Feel the hillside soil',
    x: 3.6,
    y: 7.4,
    lines: ['The soil on top is thin and pale, with pebbles showing. The good dark topsoil has washed away.', 'Down at the bottom of the hill, a pile of mud sits by the path.'],
    note: 'Watts: thin, pale soil on the hill; the topsoil washed to the bottom.',
  },
  {
    id: 'cow',
    farmer: 'watts',
    label: 'Visit Mrs. Watts\'s cow',
    x: 7.1,
    y: 2.4,
    lines: ['Mrs. Watts\'s cow, Buttercup, chews slowly and looks at you.', 'Behind the shed there is a big pile of manure. That is free soil food, if you compost it.'],
    note: 'Watts: her cow makes manure, a free soil food once it is composted.',
  },
  {
    id: 'cotton',
    farmer: 'pryor',
    label: 'Look at Mr. Pryor\'s cotton',
    x: 12.5,
    y: 8.4,
    lines: ['The field is flat. No ditches here: the rain soaks in instead of running off.', 'But the cotton is short and pale. Cotton every year has worn this soil out.'],
    note: 'Pryor: a flat field (no washing away), but the cotton is short and pale.',
  },
  {
    id: 'muck',
    farmer: 'pryor',
    label: 'Look at the creek bank',
    x: 14.5,
    y: 9.4,
    lines: ['Dark, crumbly muck lines the creek bank. It smells earthy.', 'Creek muck is full of old leaves and plant bits. Mixed into a compost pile, it feeds soil. And it is free.'],
    note: 'Pryor: dark creek muck on the bank, free compost material.',
  },
  {
    id: 'leaves',
    farmer: 'pryor',
    label: 'Look at the leaf piles',
    x: 13.0,
    y: 3.1,
    lines: ['Deep piles of fallen leaves under the trees in Mr. Pryor\'s woods.', 'Leaves rot down into soil food. Here they are just blowing away.'],
    note: 'Pryor: piles of leaves in the woods, also free compost material.',
  },
];

/** Looks needed at each farm before the table opens. */
export const LOOKS_NEEDED = 2;

/** The wagon's demonstration table. */
export const TABLE = { x: 7.3, y: 9.35 };

// ---------------------------------------------------------------- explaining

export interface ReasonOption {
  id: string;
  text: string;
  ok: boolean;
  feedback: string;
}

/** What to tell each farmer about why the plan fits. */
export function reasonOptions(farmer: FarmerId): ReasonOption[] {
  const f = FARMERS[farmer];
  return [
    {
      id: 'fancy',
      text: 'These are the newest, most scientific ideas there are.',
      ok: false,
      feedback: `"New" is not a reason. ${f.short} asked for help ${f.pronoun.they} can use. How does your plan match ${f.pronoun.their} report?`,
    },
    {
      id: 'fits',
      text: `They fix the problems you wrote down, with free things you already have (${f.has}).`,
      ok: true,
      feedback: 'Yes! You tied each idea to a real problem and to things the farmer can really do.',
    },
    {
      id: 'same',
      text: 'It is what the other farmer is doing, so it must work for you too.',
      ok: false,
      feedback: 'The two farms are different: one is on a hill, one is flat by the creek. A good plan fits this farmer\'s own problems.',
    },
  ];
}
