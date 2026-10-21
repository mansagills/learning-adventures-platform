/**
 * The Creature Designer's rules (pure functions, unit tested). The child
 * builds a sea creature from parts, then test-dives it in a zone. Three
 * checks decide how it does there: can it find food, can it hide, and can it
 * stay safe? Each check is "great", "OK" or "hard", with one plain sentence
 * that names the part responsible.
 *
 * The point (NGSS 3-LS4-3, 4-LS1-1): the same creature can do well in one
 * place and badly in another. Features that help in the bright reef (bright
 * patterns, a flat body for lying on the sand) do little in the dim
 * twilight zone, where big eyes, belly lights and silver, red or see-through
 * bodies win. In the pitch-black midnight zone, eyes barely help: a glowing
 * lure or a huge mouth finds food, red or see-through skin hides, and a soft
 * round body saves energy where meals are rare.
 */

export type Body = 'sleek' | 'flat' | 'round';
export type Eyes = 'small' | 'big';
export type Skin = 'bright' | 'silver' | 'red' | 'clear';
export type Light = 'none' | 'belly' | 'lure';
export type Mouth = 'small' | 'wide';

export interface Parts {
  body: Body;
  eyes: Eyes;
  skin: Skin;
  light: Light;
  mouth: Mouth;
}

export type PartKey = keyof Parts;
export const PART_KEYS: PartKey[] = ['body', 'eyes', 'skin', 'light', 'mouth'];

/** Every option for each part, with the words on its button. */
export const PART_OPTIONS: { [K in PartKey]: Array<{ id: Parts[K]; label: string }> } = {
  body: [
    { id: 'sleek', label: 'Sleek and fast' },
    { id: 'flat', label: 'Wide and flat' },
    { id: 'round', label: 'Soft and round' },
  ],
  eyes: [
    { id: 'small', label: 'Small eyes' },
    { id: 'big', label: 'Big eyes' },
  ],
  skin: [
    { id: 'bright', label: 'Bright patterns' },
    { id: 'silver', label: 'Silver, like a mirror' },
    { id: 'red', label: 'Deep red' },
    { id: 'clear', label: 'See-through' },
  ],
  light: [
    { id: 'none', label: 'No lights' },
    { id: 'belly', label: 'Glowing belly' },
    { id: 'lure', label: 'Glowing lure' },
  ],
  mouth: [
    { id: 'small', label: 'Small mouth' },
    { id: 'wide', label: 'Wide mouth' },
  ],
};

export const PART_NAMES: Record<PartKey, string> = { body: 'Body', eyes: 'Eyes', skin: 'Skin', light: 'Lights', mouth: 'Mouth' };

export const START_PARTS: Parts = { body: 'round', eyes: 'small', skin: 'bright', light: 'none', mouth: 'small' };

/** The zones a creature can be tested in (the midnight zone opens after its expedition). */
export type TestZone = 'sunlight' | 'twilight' | 'midnight';
export const TEST_ZONES: TestZone[] = ['sunlight', 'twilight', 'midnight'];

export type Grade = 2 | 1 | 0;
export type CheckId = 'food' | 'hide' | 'safe';
export const CHECKS: CheckId[] = ['food', 'hide', 'safe'];
export const CHECK_NAMES: Record<CheckId, string> = { food: 'Find food', hide: 'Hide', safe: 'Stay safe' };
export const GRADE_WORDS: Record<Grade, string> = { 2: 'Great', 1: 'OK', 0: 'Hard' };

export interface CheckResult {
  id: CheckId;
  grade: Grade;
  why: string;
}

export interface TestResult {
  zone: TestZone;
  checks: CheckResult[];
  /** 'thrives' (all great), 'fine' (nothing hard) or 'struggles'. */
  overall: 'thrives' | 'fine' | 'struggles';
  /** One sentence for the whole test. */
  summary: string;
}

function food(p: Parts, z: TestZone): CheckResult {
  if (z === 'sunlight') {
    // in bright light every eye works, and there is food for every mouth
    return p.mouth === 'small'
      ? { id: 'food', grade: 2, why: 'In the bright reef, a small mouth can nibble seaweed and tiny plankton.' }
      : { id: 'food', grade: 2, why: 'In the bright reef, a wide mouth can gulp the small fish swimming by.' };
  }
  if (z === 'midnight') {
    if (p.light === 'lure') return { id: 'food', grade: 2, why: 'In the dark, a glowing lure brings hungry animals right to its mouth.' };
    if (p.mouth === 'wide') return { id: 'food', grade: 2, why: 'Meals are rare in the dark. A huge mouth gulps whatever it bumps into, like the gulper eel.' };
    if (p.eyes === 'big') return { id: 'food', grade: 1, why: 'There is no sunlight to see by. Big eyes only spot the flashes of glowing animals.' };
    return { id: 'food', grade: 0, why: 'It is pitch black. Small eyes and a small mouth find almost nothing to eat.' };
  }
  if (p.eyes === 'big') return { id: 'food', grade: 2, why: 'Big eyes catch the dim light, so it can spot food in the twilight.' };
  if (p.light === 'lure') return { id: 'food', grade: 1, why: 'Its small eyes see little in the dim light, but the glowing lure brings food close.' };
  return { id: 'food', grade: 0, why: 'Small eyes catch too little of the dim light. It is hard to find food.' };
}

function hide(p: Parts, z: TestZone): CheckResult {
  if (z === 'sunlight') {
    if (p.skin === 'bright') return { id: 'hide', grade: 2, why: 'Bright patterns blend in with the colorful coral.' };
    if (p.body === 'flat') return { id: 'hide', grade: 2, why: 'A wide, flat body can lie low and still on the sand.' };
    if (p.skin === 'red') return { id: 'hide', grade: 1, why: 'Near the top, red light still shines, so red stands out a little against the blue.' };
    if (p.skin === 'silver') return { id: 'hide', grade: 1, why: 'Silver blends in with open water, but it flashes against the colorful reef.' };
    return { id: 'hide', grade: 1, why: 'Being see-through helps, but in bright sunlight its shadow still shows on the sand.' };
  }
  if (z === 'midnight') {
    // no sunlight: shadows do not matter, but any glow or shine can give it away
    if (p.light === 'lure') return { id: 'hide', grade: 1, why: 'Its dark body is hard to see, but the glowing lure shows where it is.' };
    if (p.skin === 'red') return { id: 'hide', grade: 2, why: 'Red looks black in the dark, so it vanishes, even in another animal’s glow.' };
    if (p.skin === 'clear') return { id: 'hide', grade: 2, why: 'A see-through body is almost impossible to spot in the dark.' };
    if (p.light === 'belly') return { id: 'hide', grade: 1, why: 'There is no light above to hide from here, so a glowing belly just shows where it is.' };
    if (p.skin === 'silver') return { id: 'hide', grade: 1, why: 'Silver flashes when a glowing animal swims close.' };
    return { id: 'hide', grade: 1, why: 'Bright patterns look black in the dark, but they shine if a glowing animal comes near.' };
  }
  // the twilight zone: from below, any fish shows as a dark shape unless its belly glows
  const skinHelps = p.skin !== 'bright';
  const belly = p.light === 'belly';
  const skinWhy: Record<Skin, string> = {
    bright: 'Bright patterns just look gray here, so they do not help.',
    silver: 'Silver sides reflect the blue water around it.',
    red: 'With no red light this deep, red looks dark, like the water.',
    clear: 'Being see-through makes it hard to spot.',
  };
  if (skinHelps && belly) return { id: 'hide', grade: 2, why: `${skinWhy[p.skin]} And its glowing belly hides its shadow from hunters below.` };
  if (belly) return { id: 'hide', grade: 1, why: `Its glowing belly hides its shadow from below. ${skinWhy[p.skin]}` };
  if (skinHelps) return { id: 'hide', grade: 1, why: `${skinWhy[p.skin]} But from below, its dark shape still shows against the light above.` };
  return { id: 'hide', grade: 0, why: `${skinWhy[p.skin]} From below, its dark shape shows against the light above.` };
}

function safe(p: Parts, z: TestZone): CheckResult {
  if (z === 'sunlight') {
    if (p.body === 'sleek') return { id: 'safe', grade: 2, why: 'A sleek body darts away fast when a hunter comes.' };
    if (p.body === 'flat') return { id: 'safe', grade: 2, why: 'A flat body can slip into cracks or flatten itself on the sand.' };
    return { id: 'safe', grade: 1, why: 'A soft, round body is slow to get away on a reef full of hunters.' };
  }
  if (z === 'midnight') {
    if (p.body === 'round') return { id: 'safe', grade: 2, why: 'A soft, round body floats easily and saves energy, which matters where meals are rare.' };
    if (p.body === 'sleek') return { id: 'safe', grade: 1, why: 'Fast swimming burns lots of energy, and food is hard to find down here.' };
    return { id: 'safe', grade: 1, why: 'There is no sand nearby to lie on, so a flat body does not help much.' };
  }
  if (p.light === 'lure') return { id: 'safe', grade: 1, why: 'A glowing lure can draw hunters as well as food.' };
  if (p.body === 'sleek') return { id: 'safe', grade: 2, why: 'A sleek body can swim up at night to feed and back down fast.' };
  if (p.body === 'flat') return { id: 'safe', grade: 1, why: 'There is no sand to lie on out in open water, so a flat body does not help much.' };
  return { id: 'safe', grade: 1, why: 'A soft, round body drifts well in open water, but it is slow.' };
}

/** Test-dive a creature in a zone. */
export function testCreature(p: Parts, z: TestZone): TestResult {
  const checks = [food(p, z), hide(p, z), safe(p, z)];
  const overall = checks.every((c) => c.grade === 2) ? 'thrives' : checks.some((c) => c.grade === 0) ? 'struggles' : 'fine';
  const where = z === 'sunlight' ? 'on the sunny reef' : z === 'twilight' ? 'in the dim twilight zone' : 'in the dark midnight zone';
  const summary =
    overall === 'thrives'
      ? `Your creature thrives ${where}!`
      : overall === 'fine'
        ? `Your creature does OK ${where}. Can you make it do even better?`
        : `Your creature has a hard time ${where}. Try changing a part.`;
  return { zone: z, checks, overall, summary };
}

/** Dr. Lani's design challenges. Each one is met by a test dive in its zone. */
export type ChallengeId = 'reef-hide' | 'dim-food' | 'twilight-hide' | 'twilight-all' | 'midnight-food' | 'midnight-all';
export const CHALLENGES: Array<{ id: ChallengeId; zone: TestZone; text: string; check: CheckId | 'all'; hint: string }> = [
  {
    id: 'reef-hide',
    zone: 'sunlight',
    text: 'Design a creature that can hide on the bright reef.',
    check: 'hide',
    hint: 'Think about the octopus and the spotted eagle ray. How do they hide on the reef?',
  },
  { id: 'dim-food', zone: 'twilight', text: 'Design a creature that can find food in the dim twilight zone.', check: 'food', hint: 'The hatchetfish has huge eyes. Why?' },
  {
    id: 'twilight-hide',
    zone: 'twilight',
    text: 'Design a creature that stays hidden from hunters below, in the twilight zone.',
    check: 'hide',
    hint: 'Think about the hatchetfish’s silver sides and its belly lights.',
  },
  {
    id: 'twilight-all',
    zone: 'twilight',
    text: 'Design a creature that thrives in the twilight zone: great at all three.',
    check: 'all',
    hint: 'It needs to see in dim light, hide from below and get away fast.',
  },
  { id: 'midnight-food', zone: 'midnight', text: 'Design a creature that can find food in the pitch-black midnight zone.', check: 'food', hint: 'How does the anglerfish catch its dinner?' },
  {
    id: 'midnight-all',
    zone: 'midnight',
    text: 'Design a creature that thrives in the midnight zone: great at all three.',
    check: 'all',
    hint: 'A glowing lure gives it away. How does the gulper eel eat? How does the atolla jelly hide?',
  },
];

/** The challenges a child can try once the given zones are open. */
export function openChallenges(zones: readonly TestZone[]): typeof CHALLENGES {
  return CHALLENGES.filter((c) => zones.includes(c.zone));
}

/** Does this test meet the challenge? */
export function meets(ch: (typeof CHALLENGES)[number], r: TestResult): boolean {
  if (r.zone !== ch.zone) return false;
  if (ch.check === 'all') return r.overall === 'thrives';
  return r.checks.find((c) => c.id === ch.check)!.grade === 2;
}

const FIRST = ['Glim', 'Bloop', 'Zib', 'Nemo', 'Puff', 'Swish', 'Lumo', 'Fin', 'Bubbl', 'Coral', 'Skip', 'Wobbl'];
const LAST = ['y', 'o', 'ster', 'ix', 'kin', 'bert', 'a', 'ie', 'ton', 'us'];

/** A fun name for a creature (from a seed, so a re-roll gives a new one). */
export function creatureName(seed: number): string {
  const a = FIRST[Math.abs(seed) % FIRST.length];
  const b = LAST[Math.floor(Math.abs(seed) / FIRST.length) % LAST.length];
  return a + b;
}

/** Clean a saved set of parts (anything unknown falls back to the start parts). */
export function cleanParts(raw: unknown): Parts {
  const r = (typeof raw === 'object' && raw ? raw : {}) as Record<string, unknown>;
  const out = { ...START_PARTS } as Record<PartKey, string>;
  for (const k of PART_KEYS) if (PART_OPTIONS[k].some((o) => o.id === r[k])) out[k] = r[k] as string;
  return out as unknown as Parts;
}
