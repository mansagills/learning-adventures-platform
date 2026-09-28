/**
 * Chapter 7: Your Turn to Plant the Seeds / My Carver Project.
 *
 * The player picks a real, modern community need (or writes their own),
 * builds a project from a small kit of parts, backs it with something they
 * learned, plans a test, gets feedback from the neighbor who raised the
 * need, and improves it once. Everything here is guided choices; typing is
 * optional. Feedback comes from fixed rules, not from any online service.
 */

export type Category = 'water' | 'shade' | 'waste' | 'nature';
export type MainId = 'barrel' | 'canopy' | 'compost' | 'flowers';
export type MaterialId = 'scrap' | 'borrowed' | 'new';
export type ExtraId = 'guide' | 'signup' | 'lock';
export type MeasureId = 'soil' | 'temp' | 'scraps' | 'bees' | 'likes';
export type CompareId = 'before_after' | 'with_without';
export type RepeatId = 'once' | 'several';
export type EvidenceId = 'observe' | 'soil' | 'need' | 'free' | 'fair';
export type Neighbor = 'theo' | 'lottie';

export interface NeedCard {
  id: string;
  text: string;
  who: string;
  category: Category;
  from: Neighbor;
}

export const NEEDS: NeedCard[] = [
  { id: 'garden', text: 'The school garden dries out every weekend, and the seedlings wilt.', who: 'kids at school', category: 'water', from: 'theo' },
  { id: 'bus', text: 'Kids wait for the school bus in the hot sun, with no shade at all.', who: 'kids at the bus stop', category: 'shade', from: 'theo' },
  { id: 'scraps', text: 'The community kitchen throws away buckets of vegetable scraps every week.', who: 'the kitchen and the gardens', category: 'waste', from: 'lottie' },
  { id: 'bees', text: 'Fewer bees visit the town gardens, so fewer beans and squash grow.', who: 'gardeners and families', category: 'nature', from: 'lottie' },
];

export const CATEGORY_TEXT: Record<Category, string> = {
  water: 'plants need water',
  shade: 'people need shade',
  waste: 'food is going to waste',
  nature: 'nature needs help',
};

export const MAINS: Record<MainId, { name: string; text: string; fixes: Category; icon: string }> = {
  barrel: { name: 'Rain barrel with a drip hose', text: 'Catches rain from a roof and drips it slowly onto plants.', fixes: 'water', icon: 'jar' },
  canopy: { name: 'Shade canopy on posts', text: 'A cloth roof on four posts that makes a patch of shade.', fixes: 'shade', icon: 'sun' },
  compost: { name: 'Compost bin', text: 'A slatted box that turns scraps and leaves into rich soil.', fixes: 'waste', icon: 'leaf' },
  flowers: { name: 'Pollinator flower bed', text: 'A bed of flowers that bees and butterflies visit.', fixes: 'nature', icon: 'seed' },
};
export const MAIN_ORDER: MainId[] = ['barrel', 'canopy', 'compost', 'flowers'];

export const MATERIALS: Record<MaterialId, { name: string; ok: boolean }> = {
  scrap: { name: "Scrap wood and old barrels from Mr. Brooks's shop (free)", ok: true },
  borrowed: { name: 'Tools and parts borrowed from neighbors (free)', ok: true },
  new: { name: 'Everything bought new at the store', ok: false },
};
export const MATERIAL_ORDER: MaterialId[] = ['scrap', 'borrowed', 'new'];

export const EXTRAS: Record<ExtraId, { name: string }> = {
  guide: { name: 'A picture sign that shows how to use it' },
  signup: { name: 'A sign-up sheet, so neighbors take turns caring for it' },
  lock: { name: 'A lock, so nobody else can touch it' },
};
export const EXTRA_ORDER: ExtraId[] = ['guide', 'signup', 'lock'];

export const MEASURES: Record<MeasureId, { name: string; fits: Category | null }> = {
  soil: { name: 'How damp the garden soil is on Monday morning', fits: 'water' },
  temp: { name: 'The temperature in the shade and in the sun', fits: 'shade' },
  scraps: { name: 'How many buckets of scraps get thrown away each week', fits: 'waste' },
  bees: { name: 'How many bees visit in 10 minutes', fits: 'nature' },
  likes: { name: 'Whether people like it', fits: null },
};
export const MEASURE_ORDER: MeasureId[] = ['soil', 'temp', 'scraps', 'bees', 'likes'];

export const COMPARES: Record<CompareId, string> = {
  before_after: 'Measure before, then after the project is built',
  with_without: 'Compare a spot with the project and a spot without it',
};
export const REPEATS: Record<RepeatId, string> = {
  once: 'Measure one time',
  several: 'Measure several times (for example, four weekends)',
};

export const EVIDENCE: Record<EvidenceId, string> = {
  observe: 'Look closely and write down what you notice (Chapter 1)',
  soil: 'Compost, leaves and legumes feed tired soil (Chapters 3 and 5)',
  need: 'Start with a real need, then test and improve (Chapter 4)',
  free: 'Use free things a community already has (Chapter 5)',
  fair: 'Change one thing and measure fairly, more than once (Chapter 6)',
};
export const EVIDENCE_ORDER: EvidenceId[] = ['observe', 'soil', 'need', 'free', 'fair'];

/** What happens when the neighbor tries the first version, and how it can be improved. */
export const TRYOUT: Record<MainId, { finding: string; upgrades: Array<{ id: string; text: string; ok: boolean; why: string }> }> = {
  barrel: {
    finding: 'When it poured, the barrel filled up and overflowed all over the path.',
    upgrades: [
      { id: 'overflow', text: 'Add an overflow hose that runs into a second barrel', ok: true, why: 'Extra rain is saved instead of spilled.' },
      { id: 'paint', text: 'Paint the barrel a brighter color', ok: false, why: 'It would look nice, but the water would still spill.' },
      { id: 'smaller', text: 'Use a smaller barrel', ok: false, why: 'A smaller barrel would overflow even sooner.' },
    ],
  },
  canopy: {
    finding: 'On a windy afternoon, the canopy flapped like a sail and one post tipped over.',
    upgrades: [
      { id: 'stakes', text: 'Tie each post down with ropes and stakes', ok: true, why: 'Ropes and stakes hold the posts steady in the wind.' },
      { id: 'bigger', text: 'Make the canopy bigger', ok: false, why: 'A bigger canopy would catch even more wind.' },
      { id: 'darker', text: 'Use a darker cloth', ok: false, why: 'A darker cloth would not stop the wind from pushing it over.' },
    ],
  },
  compost: {
    finding: 'After a week the bin smelled bad, because it was full of wet scraps and nothing else.',
    upgrades: [
      { id: 'leaves', text: 'Add a layer of dry leaves for every bucket of scraps', ok: true, why: 'Dry leaves balance wet scraps, so the pile rots cleanly. Just like Mr. Pryor\'s compost!' },
      { id: 'lid', text: 'Close the lid tighter', ok: false, why: 'The smell would still build up. Compost needs air and dry material.' },
      { id: 'water', text: 'Pour in more water', ok: false, why: 'More water would make it soggier and smellier.' },
    ],
  },
  flowers: {
    finding: 'Lots of bees came in spring, but after the flowers faded in July, the bees stopped coming.',
    upgrades: [
      { id: 'seasons', text: 'Plant flowers that bloom at different times, spring to fall', ok: true, why: 'Something is always blooming, so bees keep coming all season.' },
      { id: 'more', text: 'Plant more of the same flower', ok: false, why: 'They would all still fade at the same time in July.' },
      { id: 'plastic', text: 'Add plastic flowers', ok: false, why: 'Plastic flowers have no nectar or pollen, so bees get nothing from them.' },
    ],
  },
};

// ---------------------------------------------------------------- the design

export interface Design {
  main: MainId | null;
  material: MaterialId | null;
  extra: ExtraId | null;
  evidence: EvidenceId[];
  measure: MeasureId | null;
  compare: CompareId | null;
  repeat: RepeatId | null;
  /** The improvement chosen after the neighbor's tryout (an upgrade id). */
  upgrade: string | null;
}

export const EMPTY: Design = { main: null, material: null, extra: null, evidence: [], measure: null, compare: null, repeat: null, upgrade: null };

export const complete = (d: Design) => !!(d.main && d.material && d.extra && d.evidence.length && d.measure && d.compare && d.repeat);

export interface Criterion {
  id: 'fit' | 'resources' | 'people' | 'test';
  name: string;
  ok: boolean;
  note: string;
}

/** The fixed feedback rubric: four checks, each with a reason. */
export function rubric(d: Design, category: Category): Criterion[] {
  const main = d.main ? MAINS[d.main] : null;
  const fit = !!main && main.fixes === category;
  const measure = d.measure ? MEASURES[d.measure] : null;
  const testOk = !!measure && measure.fits === category && d.repeat === 'several' && !!d.compare;
  return [
    {
      id: 'fit',
      name: 'Fits the need',
      ok: fit,
      note: fit ? `A ${main!.name.toLowerCase()} goes straight at the problem: ${CATEGORY_TEXT[category]}.` : `A ${main ? main.name.toLowerCase() : 'project'} does not fix this need, because ${CATEGORY_TEXT[category]}. Which main part would?`,
    },
    {
      id: 'resources',
      name: 'Uses what the town has',
      ok: !!d.material && MATERIALS[d.material].ok,
      note: d.material && MATERIALS[d.material].ok ? 'Free, shared materials mean anyone can build one.' : 'Buying everything new costs money the town may not have. Remember Mrs. Watts and Mr. Pryor? Use what people already have.',
    },
    {
      id: 'people',
      name: 'Easy and fair for everyone',
      ok: d.extra === 'guide' || d.extra === 'signup',
      note:
        d.extra === 'lock'
          ? 'A lock keeps neighbors out. A community project should be something everyone can use.'
          : d.extra === 'signup'
            ? 'A sign-up sheet means the project keeps working after the fair.'
            : 'A picture sign helps anyone use it, even little kids.',
    },
    {
      id: 'test',
      name: 'A plan to test it',
      ok: testOk,
      note: testOk
        ? 'You will measure something real, compare, and repeat. That is a fair test.'
        : !measure || measure.fits === null
          ? '"Whether people like it" is hard to measure. Count or measure something that shows the problem getting better.'
          : measure.fits !== category
            ? 'That measurement is about a different problem. What would show THIS problem getting better?'
            : 'Measure more than once. One day could be a fluke (Chapter 6!).',
    },
  ];
}

export const allOk = (r: Criterion[]) => r.every((c) => c.ok);

export function upgradeFor(d: Design) {
  return d.main && d.upgrade ? TRYOUT[d.main].upgrades.find((u) => u.id === d.upgrade) ?? null : null;
}

/** A design that passes every check, for the top of the hint ladder. */
export function example(category: Category): Design {
  const main = MAIN_ORDER.find((m) => MAINS[m].fixes === category)!;
  const measure = MEASURE_ORDER.find((m) => MEASURES[m].fits === category)!;
  return { main, material: 'scrap', extra: 'signup', evidence: ['free', 'fair'], measure, compare: 'before_after', repeat: 'several', upgrade: null };
}

/** Plain-language descriptions of what changed between two designs. */
export function changesBetween(a: Design, b: Design): string[] {
  const out: string[] = [];
  if (a.main !== b.main && b.main) out.push(`switched to a ${MAINS[b.main].name.toLowerCase()}`);
  if (a.material !== b.material && b.material) out.push(b.material === 'new' ? 'bought new parts' : 'used free, shared materials');
  if (a.extra !== b.extra && b.extra) out.push(`added ${EXTRAS[b.extra].name.charAt(0).toLowerCase()}${EXTRAS[b.extra].name.slice(1)}`);
  if (a.measure !== b.measure && b.measure) out.push(`now measure ${MEASURES[b.measure].name.charAt(0).toLowerCase()}${MEASURES[b.measure].name.slice(1)}`);
  if (a.repeat !== b.repeat && b.repeat === 'several') out.push('measure several times');
  const up = upgradeFor(b);
  if (up && up.ok) out.push(up.text.charAt(0).toLowerCase() + up.text.slice(1));
  return out;
}

// ---------------------------------------------------------------- typed text

const UNSAFE = [
  /\b(kill|hurt|hate|stupid|dumb|idiot|shut up|gun|knife|weapon|bomb|fight|drugs?|beer|wine|sexy?)\b/i,
  /\b(damn|hell|crap|butt|poop)\b/i,
];

export type TextCheck = { ok: true; text: string } | { ok: false; reason: string };

/**
 * Check a short typed answer. It is only shown back to the player (and on
 * their own printed card), never sent anywhere.
 */
export function checkTyped(raw: string, opts: { min: number; max: number; words?: number }): TextCheck {
  const text = raw.replace(/<[^>]*>/g, '').replace(/[<>{}]/g, '').replace(/\s+/g, ' ').trim();
  if (!text) return { ok: false, reason: 'This is empty. Type a few words, or choose one of the cards instead.' };
  if (text.length > opts.max) return { ok: false, reason: `Keep it under ${opts.max} letters, please.` };
  if (text.length < opts.min || text.split(' ').length < (opts.words ?? 1)) return { ok: false, reason: 'Tell a little more: who has the problem, and what is it?' };
  if (/\d{6,}|@|https?:|www\.|\.com\b/i.test(text)) return { ok: false, reason: 'Leave out phone numbers, emails, addresses and websites. Just describe the problem.' };
  if (UNSAFE.some((r) => r.test(text))) return { ok: false, reason: "Let's keep projects kind and safe. Try different words, or choose one of the cards." };
  return { ok: true, text };
}
