/**
 * The animals (and two plant-like living things) Finn can photograph for the
 * field guide, with the facts on their cards: the sunlight zone (the reef),
 * the twilight zone, the midnight zone, the deep sea floor with its hot
 * vents, and the deepest trench (the Trench Dive).
 *
 * Facts are checked against NOAA Ocean Exploration and the NOAA Ocean
 * Service, the Smithsonian Ocean portal and the Monterey Bay Aquarium. They
 * are written for grades 3 to 5: short sentences, facts first.
 */

export type Zone = 'sunlight' | 'twilight' | 'midnight' | 'vents' | 'trench';
export const ZONES: Zone[] = ['sunlight', 'twilight', 'midnight', 'vents', 'trench'];
/** The zones with an expedition (the trench is the finale, the Trench Dive). */
export const OPEN_ZONES: Zone[] = ['sunlight', 'twilight', 'midnight', 'vents', 'trench'];

export const ZONE_INFO: Record<Zone, { name: string; depth: string; top: number; bottom: number }> = {
  sunlight: { name: 'The sunlight zone', depth: '0 to 200 meters', top: 0, bottom: 200 },
  twilight: { name: 'The twilight zone', depth: '200 to 1,000 meters', top: 200, bottom: 1000 },
  midnight: { name: 'The midnight zone', depth: '1,000 to 4,000 meters', top: 1000, bottom: 4000 },
  // the sea floor is mostly 3,000 to 6,000 meters down; the hot vents are on undersea mountain ridges, higher up, about 2,500 meters down
  vents: { name: 'The deep sea floor', depth: 'mostly 3,000 to 6,000 meters down', top: 4000, bottom: 6000 },
  trench: { name: 'The deepest trench', depth: 'down to about 11,000 meters', top: 6000, bottom: 11000 },
};

export type AnimalId =
  | 'seagrass'
  | 'plankton'
  | 'clownfish'
  | 'octopus'
  | 'turtle'
  | 'ray'
  | 'lanternfish'
  | 'hatchetfish'
  | 'combjelly'
  | 'anglerfish'
  | 'gulpereel'
  | 'atolla'
  | 'tubeworm'
  | 'yeticrab'
  | 'ventshrimp'
  | 'snailfish';

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
  anglerfish: {
    id: 'anglerfish',
    name: 'Anglerfish',
    zone: 'midnight',
    lives: 'The midnight zone',
    depth: 1800,
    facts: [
      'A female anglerfish has a glowing lure on a long spine, like a fishing rod. Tiny bacteria living in the lure make the light.',
      'Small animals swim toward the light. Her huge mouth and stretchy stomach can swallow food bigger than she is.',
    ],
  },
  gulpereel: {
    id: 'gulpereel',
    name: 'Gulper eel',
    zone: 'midnight',
    lives: 'The twilight and midnight zones',
    depth: 2300,
    facts: [
      'A gulper eel has a giant, loose mouth, like a pelican’s pouch. It can open it wide to scoop up food.',
      'The tip of its long, thin tail can glow. Scientists think the light may draw small animals close.',
    ],
  },
  atolla: {
    id: 'atolla',
    name: 'Atolla jelly',
    zone: 'midnight',
    lives: 'The midnight zone',
    depth: 1300,
    facts: [
      'The atolla jelly is deep red, so in the dark it is almost invisible.',
      'When something grabs it, it flashes a ring of blue lights, like a burglar alarm. The flashes may call a bigger animal to chase the attacker away.',
    ],
  },
  tubeworm: {
    id: 'tubeworm',
    name: 'Giant tube worm',
    zone: 'vents',
    lives: 'Hot vents on the deep sea floor',
    depth: 2560,
    facts: [
      'Giant tube worms grow taller than a grown-up, inside white tubes. Their red tops are full of blood that takes in chemicals from the vent water.',
      'They have no mouth and no stomach! Bacteria living inside them make food from the chemicals, with no sunlight at all.',
    ],
  },
  yeticrab: {
    id: 'yeticrab',
    name: 'Yeti crab',
    zone: 'vents',
    lives: 'Hot vents and cold seeps on the deep sea floor',
    depth: 2590,
    facts: ['A yeti crab has hairy arms. Bacteria grow on the hairs, and the crab eats them.', 'It waves its arms in the warm vent water, which helps the bacteria grow. It is like a little farmer.'],
  },
  ventshrimp: {
    id: 'ventshrimp',
    name: 'Vent shrimp',
    zone: 'vents',
    lives: 'The chimneys of hot vents',
    depth: 2540,
    facts: [
      'Thousands of vent shrimp crowd onto the chimneys, as close to the warm water as they can safely get.',
      'They have no regular eyes. A shiny patch on their backs may sense the faint glow of the hot vents.',
    ],
  },
  snailfish: {
    id: 'snailfish',
    name: 'Snailfish',
    zone: 'trench',
    lives: 'Deep trenches',
    depth: 8200,
    facts: [
      'In 2023, scientists filmed a snailfish 8,336 meters down in a trench near Japan. It is the deepest fish ever seen.',
      'Snailfish have soft, jelly-like bodies and no air pockets, so the huge pressure does not crush them.',
    ],
  },
};

export const ANIMAL_ORDER: AnimalId[] = [
  'seagrass',
  'plankton',
  'clownfish',
  'octopus',
  'turtle',
  'ray',
  'lanternfish',
  'hatchetfish',
  'combjelly',
  'atolla',
  'anglerfish',
  'gulpereel',
  'ventshrimp',
  'tubeworm',
  'yeticrab',
  'snailfish',
];

export const ANIMALS_IN: Record<Zone, AnimalId[]> = {
  sunlight: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'sunlight'),
  twilight: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'twilight'),
  midnight: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'midnight'),
  vents: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'vents'),
  trench: ANIMAL_ORDER.filter((a) => ANIMALS[a].zone === 'trench'),
};

/** The water at a depth, as the sub's dials show it (rounded, for children). */
export function dials(m: number): { depth: number; temp: number; pressure: number } {
  const d = Math.max(0, m);
  // the Sun warms only the top; it is cold by about 1,000 meters, and near the bottom it is only a little above freezing (about 2 °C)
  const temp = d < 50 ? 26 - d * 0.04 : d < 1000 ? 24 - 20 * Math.min(1, (d - 50) / 950) ** 0.6 : 4 - 2 * Math.min(1, (d - 1000) / 3000);
  return { depth: Math.round(d), temp: Math.round(temp), pressure: Math.round(1 + d / 10) };
}

/** The hot vents: where the dive's sea floor is, and how hot the vent water gets (it does not boil, because of the huge pressure). */
export const VENT_FLOOR = 2600;
export const VENT_WATER_C = 360;
/** The bottom of the deepest trench (the Challenger Deep, rounded) and the top of Mount Everest, for comparing. */
export const TRENCH_FLOOR = 10900;
export const EVEREST_M = 8849;
