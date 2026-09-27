/**
 * Chapter 4 data: the crops, the steps and containers in Mr. Brooks's
 * workshop, and a small rule-based model of what a design turns into.
 *
 * Every prototype here is a game invention, made up for this story. The
 * game never says Carver invented any of them (and it says plainly that he
 * did not invent peanut butter). The rules are simple, real kitchen
 * science: wet cooked food spoils fast without a fridge, dry food keeps,
 * dry beans must be cooked before they can be eaten, and peanuts need an
 * allergy label when food is shared.
 */

export type CropId = 'peanuts' | 'sweetpotato' | 'cowpeas';
export type StepId = 'roast' | 'boil' | 'dry' | 'grind';
export type ContainerId = 'jar' | 'bag' | 'bowl';

export interface CropInfo {
  id: CropId;
  name: string;
  /** One of it, for names ("Peanut Spread"). */
  single: string;
  /** How filling a snack from it is (1 low, 3 high). */
  filling: 1 | 2 | 3;
  oily: boolean;
  allergen: boolean;
  /** Dry beans: hard and must be cooked in water first. */
  hardDry: boolean;
  /** Watery when cooked (stays moist after roasting). */
  watery: boolean;
  /** Tests on the crop shelf: what the player finds out. */
  tests: Array<{ id: string; label: string; result: string }>;
}

export const CROPS: Record<CropId, CropInfo> = {
  peanuts: {
    id: 'peanuts',
    name: 'Peanuts',
    single: 'Peanut',
    filling: 3,
    oily: true,
    allergen: true,
    hardDry: false,
    watery: false,
    tests: [
      { id: 'press', label: 'Press one on paper', result: 'It leaves a greasy spot. Peanuts are full of oil.' },
      { id: 'label', label: "Read Mae's seed tag", result: 'Peanuts are full of protein, so they are filling. Some people are allergic to them.' },
      { id: 'heat', label: 'Warm a few in a pan', result: 'They turn golden and crunchy, and they smell toasty.' },
    ],
  },
  sweetpotato: {
    id: 'sweetpotato',
    name: 'Sweet potatoes',
    single: 'Sweet Potato',
    filling: 2,
    oily: false,
    allergen: false,
    hardDry: false,
    watery: true,
    tests: [
      { id: 'cut', label: 'Cut a slice', result: 'The inside is orange and wet. Wet food spoils quickly without a fridge.' },
      { id: 'label', label: "Read Mae's seed tag", result: 'Sweet and full of vitamins. Raw sweet potato is hard and starchy; it tastes best cooked.' },
      { id: 'heat', label: 'Warm a slice in a pan', result: 'It gets soft and sweet, but it is still moist inside.' },
    ],
  },
  cowpeas: {
    id: 'cowpeas',
    name: 'Cowpeas',
    single: 'Cowpea',
    filling: 3,
    oily: false,
    allergen: false,
    hardDry: true,
    watery: false,
    tests: [
      { id: 'bite', label: 'Tap one with a spoon', result: 'Clack! Dry beans are as hard as pebbles. They must be cooked in water before anyone can eat them.' },
      { id: 'label', label: "Read Mae's seed tag", result: 'Full of protein, so they are filling. Dry beans keep for a long time on a shelf.' },
      { id: 'soak', label: 'Soak a few in water', result: 'They swell up and get softer. Cooked in water, they would be ready to eat.' },
    ],
  },
};

export const CROP_ORDER: CropId[] = ['peanuts', 'sweetpotato', 'cowpeas'];

export const STEPS: Record<StepId, { name: string; verb: string; note: string }> = {
  roast: { name: 'Roast', verb: 'roasted', note: 'Dry heat in the oven. Makes food crunchy and dry.' },
  boil: { name: 'Boil', verb: 'boiled', note: 'Cook in water, with a grown-up. Makes food soft, and wet.' },
  dry: { name: 'Dry', verb: 'dried', note: 'Slice thin and dry on the rack for a day. Takes water out.' },
  grind: { name: 'Grind', verb: 'ground', note: 'Turn the hand mill. Makes a paste or a flour. Hard work by hand.' },
};
export const STEP_ORDER: StepId[] = ['roast', 'boil', 'dry', 'grind'];

export const CONTAINERS: Record<ContainerId, { name: string; note: string }> = {
  jar: { name: 'Jar with a lid', note: 'Keeps air, bugs and damp out.' },
  bag: { name: 'Paper bag', note: 'Easy to carry, but lets air in over time.' },
  bowl: { name: 'Open bowl', note: 'Nothing keeps air or bugs out.' },
};
export const CONTAINER_ORDER: ContainerId[] = ['jar', 'bag', 'bowl'];

/** What the kitchen needs (from Miss Lottie's need card). */
export const NEED = {
  keepDays: 7,
  minFilling: 2,
  maxEffort: 2,
};

export interface Design {
  crop: CropId;
  /** One or two steps, in order. */
  steps: StepId[];
  container: ContainerId;
  label: boolean;
}

export type Safety = 'safe' | 'needs-label' | 'unsafe';

export interface Result {
  name: string;
  /** Can a kid eat it as a snack? */
  edible: boolean;
  edibleWhy: string;
  keepDays: number;
  keepWhy: string;
  filling: 1 | 2 | 3;
  effort: 1 | 2 | 3;
  effortWhy: string;
  safety: Safety;
  safetyWhy: string;
  /** Each part of the need, met or not. */
  checks: { edible: boolean; keeps: boolean; filling: boolean; effort: boolean; safe: boolean };
  passes: boolean;
  score: number;
}

const FILLING_WORD = { 1: 'a little', 2: 'medium', 3: 'very' } as const;
export const fillingWord = (n: 1 | 2 | 3) => FILLING_WORD[n];
export const effortWord = (n: 1 | 2 | 3) => (n === 1 ? 'easy' : n === 2 ? 'some work' : 'too much work');

/** Run a design through the rules. Deterministic, so every result can be explained. */
export function evaluate(d: Design): Result {
  const crop = CROPS[d.crop];
  let cooked = false;
  let moist = crop.watery; // raw sweet potato is wet inside
  let hard = crop.hardDry;
  let tooHard = false;
  let form: 'whole' | 'chips' | 'paste' | 'flour' = 'whole';
  for (const step of d.steps) {
    if (step === 'boil') {
      // Cooked in water: soft and wet.
      cooked = true;
      moist = true;
      hard = false;
    } else if (step === 'roast') {
      // Dry heat: crunchy, unless the food is watery inside (sweet potato).
      if (hard) tooHard = true;
      cooked = true;
      if (!crop.watery) moist = false;
    } else if (step === 'dry') {
      moist = false;
      if (form === 'whole' && crop.watery) form = 'chips';
    } else {
      form = crop.oily && cooked ? 'paste' : 'flour';
    }
  }

  // Name the prototype from what it became.
  const verbs = d.steps.map((s) => STEPS[s].verb);
  let name: string;
  if (form === 'paste') name = `${crop.single} Spread`;
  else if (form === 'flour') name = `${crop.single} Flour`;
  else if (form === 'chips') name = cooked ? `${crop.single} Chips` : `Raw ${crop.single} Chips`;
  else if (!verbs.length) name = `Plain raw ${crop.name.toLowerCase()}`;
  else name = `${verbs.join(', then ')} ${crop.name.toLowerCase()}`.replace(/^./, (c) => c.toUpperCase());

  // Can a kid eat it as a snack?
  let edible = true;
  let edibleWhy = 'Ready to eat as a snack.';
  if (tooHard) {
    edible = false;
    edibleWhy = 'Roasting dry beans without cooking them in water first leaves them rock hard.';
  } else if (hard) {
    edible = false;
    edibleWhy = 'These are still dry, hard beans. They must be cooked in water first.';
  } else if (form === 'flour') {
    edible = false;
    edibleWhy = 'Flour is not a snack by itself. You would still have to bake something with it.';
  } else if (!cooked) {
    edible = false;
    edibleWhy = d.crop === 'peanuts' ? 'Raw peanuts are not a tasty snack. Cooking them helps.' : 'Raw sweet potato is hard and starchy. Cook it first.';
  }

  // How long it keeps without a fridge.
  let keepDays = moist ? 2 : form === 'paste' ? 14 : 30;
  let keepWhy = moist
    ? 'It is cooked and moist, and moist food spoils in a day or two without a fridge.'
    : form === 'paste'
      ? 'An oily spread keeps about two weeks when it is sealed.'
      : 'It is dry, and dry food keeps a long time.';
  if (d.container === 'bag') {
    if (form === 'paste') {
      keepDays = 1;
      keepWhy = 'The oily spread soaks right through the paper bag. What a mess!';
    } else if (keepDays > 7) {
      keepDays = 7;
      keepWhy += ' In a paper bag it lasts about a week before it goes stale.';
    }
  } else if (d.container === 'bowl') {
    keepDays = Math.min(keepDays, 1);
    keepWhy = 'In an open bowl, air and bugs get in, so it only lasts a day.';
  } else if (!moist) keepWhy += ' The lidded jar keeps air and damp out.';

  // Effort for the volunteers each week.
  let effort = Math.min(3, Math.max(1, d.steps.length + (d.steps.includes('grind') ? 1 : 0))) as 1 | 2 | 3;
  let effortWhy = effort === 1 ? 'One simple step.' : effort === 2 ? 'Two steps: some work, but it fits in an hour.' : 'Grinding by hand plus cooking takes longer than the hour the volunteers have.';
  if (!d.steps.length) {
    effort = 1;
    effortWhy = 'No work at all, but nothing was done to the crop.';
  }

  // Safety for sharing.
  let safety: Safety = 'safe';
  let safetyWhy = 'Safe to share.';
  if (tooHard) {
    safety = 'unsafe';
    safetyWhy = 'Rock-hard beans could crack a tooth.';
  } else if (CROPS[d.crop].allergen && !d.label) {
    safety = 'needs-label';
    safetyWhy = 'Some kids are allergic to peanuts. Shared peanut food needs a clear allergy label.';
  } else if (CROPS[d.crop].allergen && d.label) safetyWhy = 'Labeled "Contains peanuts" so kids with an allergy know to choose something else.';
  if (d.steps.includes('boil') && safety === 'safe') safetyWhy += ' (Boiling is done with a grown-up.)';

  const checks = {
    edible,
    keeps: keepDays >= NEED.keepDays,
    filling: crop.filling >= NEED.minFilling,
    effort: effort <= NEED.maxEffort,
    safe: safety === 'safe',
  };
  const passes = Object.values(checks).every(Boolean);
  const met = Object.values(checks).filter(Boolean).length;
  const score = met * 10 + Math.min(keepDays, 30) / 3 + crop.filling - effort * 2;
  return { name, edible, edibleWhy, keepDays, keepWhy, filling: crop.filling, effort, effortWhy, safety, safetyWhy, checks, passes, score };
}

/** "a jar with a lid", "an open bowl". */
export function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`;
}

export function designText(d: Design): string {
  const steps = d.steps.map((s) => STEPS[s].name.toLowerCase()).join(', then ') || 'no steps';
  return `${CROPS[d.crop].name.toLowerCase()}: ${steps}, in ${withArticle(CONTAINERS[d.container].name.toLowerCase())}${d.label ? ', with an allergy label' : ''}`;
}

export function sameDesign(a: Design, b: Design): boolean {
  return a.crop === b.crop && a.container === b.container && a.label === b.label && a.steps.join() === b.steps.join();
}

/** What changed between two designs, in words (for Carver). */
export function changesText(from: Design, to: Design): string[] {
  const out: string[] = [];
  if (from.crop !== to.crop) out.push(`switched from ${CROPS[from.crop].name.toLowerCase()} to ${CROPS[to.crop].name.toLowerCase()}`);
  if (from.steps.join() !== to.steps.join())
    out.push(`changed the steps from "${from.steps.map((s) => STEPS[s].name.toLowerCase()).join(', then ') || 'none'}" to "${to.steps.map((s) => STEPS[s].name.toLowerCase()).join(', then ')}"`);
  if (from.container !== to.container) out.push(`used ${withArticle(CONTAINERS[to.container].name.toLowerCase())} instead of ${withArticle(CONTAINERS[from.container].name.toLowerCase())}`);
  if (from.label !== to.label) out.push(to.label ? 'added an allergy label' : 'took off the label');
  return out;
}

/** The first thing a result falls short on, for hints and for Carver. */
export function mainProblem(r: Result): string | null {
  if (!r.checks.edible) return r.edibleWhy;
  if (!r.checks.safe) return r.safetyWhy;
  if (!r.checks.keeps) return r.keepWhy;
  if (!r.checks.effort) return r.effortWhy;
  if (!r.checks.filling) return 'It is not filling enough for hungry kids after school.';
  return null;
}

/** The worked example the last hint fills in. */
export const EXAMPLE: Design = { crop: 'sweetpotato', steps: ['boil', 'dry'], container: 'jar', label: false };

/** Workshop decorations bought with Seeds (cosmetic only). Ids match WORKSHOP_DECOR_SPOTS. */
export const DECOR = [
  { id: 'fern', name: 'Potted fern', price: 10, text: 'A leafy fern for the corner.' },
  { id: 'stool', name: 'Painted stool', price: 15, text: 'A blue stool for thinking.' },
  { id: 'poster', name: 'Peanut plant poster', price: 20, text: 'A drawing of a peanut plant: the peanuts grow underground!' },
  { id: 'chime', name: 'Wind chime', price: 25, text: 'It rings softly when the door opens.' },
] as const;
