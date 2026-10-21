/**
 * The animals (and two plant-like living things) Finn can photograph for the
 * field guide, with the facts on their cards. Half 1 has the sunlight zone
 * (the reef) and the twilight zone; the midnight zone and the vents come in
 * half 2.
 *
 * Facts are checked against NOAA Ocean Exploration and the NOAA Ocean
 * Service, the Smithsonian Ocean portal and the Monterey Bay Aquarium. They
 * are written for grades 3 to 5: short sentences, facts first.
 */

export type Zone = 'sunlight' | 'twilight' | 'midnight' | 'vents';
export const ZONES: Zone[] = ['sunlight', 'twilight', 'midnight', 'vents'];
/** The zones with an expedition in half 1. */
export const OPEN_ZONES: Zone[] = ['sunlight', 'twilight'];

export const ZONE_INFO: Record<Zone, { name: string; depth: string; top: number; bottom: number }> = {
  sunlight: { name: 'The sunlight zone', depth: '0 to 200 meters', top: 0, bottom: 200 },
  twilight: { name: 'The twilight zone', depth: '200 to 1,000 meters', top: 200, bottom: 1000 },
  midnight: { name: 'The midnight zone', depth: '1,000 to 4,000 meters', top: 1000, bottom: 4000 },
  vents: { name: 'The deep sea floor', depth: 'below 4,000 meters', top: 4000, bottom: 11000 },
};

export type AnimalId = 'seagrass' | 'plankton' | 'clownfish' | 'octopus' | 'turtle' | 'ray' | 'lanternfish' | 'hatchetfish' | 'combjelly';

export interface Animal {
  id: AnimalId;
  name: string;
  zone: Zone;
  /** Where it lives, in words. */
  lives: string;
  /** Where Finn finds it on the dive (meters). */
  depth: number;
  facts: [string, string];
}

export const ANIMALS: Record<AnimalId, Animal> = {
  seagrass: {
    id: 'seagrass',
    name: 'Seagrass',
    zone: 'sunlight',
    lives: 'Shallow, sunny water',
    depth: 30,
    facts: [
      'Seagrass is a real plant, with roots and even tiny flowers. It grows under the sea in shallow, sunny water.',
      'Like plants on land, it makes its own food from sunlight. Sea turtles love to munch it.',
    ],
  },
  plankton: {
    id: 'plankton',
    name: 'Phytoplankton',
    zone: 'sunlight',
    lives: 'The sunlit top of the sea',
    depth: 12,
    facts: [
      'Phytoplankton are tiny living things that drift in the sunlit water. Most are too small to see without a microscope.',
      'They make food from sunlight, and they give off about half of the oxygen in the air we breathe.',
    ],
  },
  clownfish: {
    id: 'clownfish',
    name: 'Clownfish',
    zone: 'sunlight',
    lives: 'Coral reefs, in sea anemones',
    depth: 26,
    facts: [
      'Clownfish live among the stinging arms of a sea anemone. A slimy coat keeps them from being stung.',
      'The anemone keeps the clownfish safe. The clownfish chases off fish that would nibble the anemone. Both are helped.',
    ],
  },
  octopus: {
    id: 'octopus',
    name: 'Octopus',
    zone: 'sunlight',
    lives: 'Reefs and rocky sea floors',
    depth: 28,
    facts: ['An octopus has eight arms and no bones, so it can squeeze into tiny cracks.', 'It can change its color and even the bumps on its skin in a blink, to match the reef and hide.'],
  },
  turtle: {
    id: 'turtle',
    name: 'Green sea turtle',
    zone: 'sunlight',
    lives: 'Warm seas, seagrass meadows and reefs',
    depth: 10,
    facts: ['Grown-up green sea turtles eat seagrass and seaweed. They are plant eaters.', 'Turtles breathe air with lungs, like us, so they swim up to the top to take a breath.'],
  },
  ray: {
    id: 'ray',
    name: 'Spotted eagle ray',
    zone: 'sunlight',
    lives: 'Warm, shallow seas near reefs',
    depth: 50,
    facts: ['A spotted eagle ray is wide and flat. It glides with fins like wings.', 'It digs clams and snails out of the sand with its snout, and crunches them with strong, flat teeth.'],
  },
  lanternfish: {
    id: 'lanternfish',
    name: 'Lanternfish',
    zone: 'twilight',
    lives: 'The twilight zone by day, near the top at night',
    depth: 450,
    facts: [
      'Lanternfish have little lights along their bodies. Each kind of lanternfish has its own pattern of lights.',
      'They are some of the most common fish in the whole ocean. Every night they swim up to feed, and they swim back down before sunrise.',
    ],
  },
  hatchetfish: {
    id: 'hatchetfish',
    name: 'Hatchetfish',
    zone: 'twilight',
    lives: 'The twilight zone',
    depth: 600,
    facts: ['A hatchetfish has silver sides like mirrors and big eyes that look up.', 'Lights on its belly match the dim light from above. From below, its shadow seems to disappear.'],
  },
  combjelly: {
    id: 'combjelly',
    name: 'Comb jelly',
    zone: 'twilight',
    lives: 'All through the ocean, from the top to the deep',
    depth: 320,
    facts: [
      'A comb jelly is not a true jellyfish, and most kinds cannot sting. It swims with rows of tiny hairs that beat like little combs.',
      'The combs scatter light into rainbows. Many comb jellies are clear like glass, so they are hard to see.',
    ],
  },
};

export const ANIMAL_ORDER: AnimalId[] = ['seagrass', 'plankton', 'clownfish', 'octopus', 'turtle', 'ray', 'lanternfish', 'hatchetfish', 'combjelly'];

export const ANIMALS_IN: Record<Zone, AnimalId[]> = {
  sunlight: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'sunlight'),
  twilight: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'twilight'),
  midnight: [],
  vents: [],
};

/** The water at a depth, as the sub's dials show it (rounded, for children). */
export function dials(m: number): { depth: number; temp: number; pressure: number } {
  const d = Math.max(0, m);
  // the Sun warms only the top; it is cold by about 1,000 meters and stays near 4 °C below that
  const temp = d < 50 ? 26 - d * 0.04 : d < 1000 ? 24 - 20 * Math.min(1, (d - 50) / 950) ** 0.6 : 4;
  return { depth: Math.round(d), temp: Math.round(temp), pressure: Math.round(1 + d / 10) };
}
