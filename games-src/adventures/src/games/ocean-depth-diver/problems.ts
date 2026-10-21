/**
 * Ocean Depth Diver: the science, as data and pure functions (no drawing, no
 * timers) so every rule can be unit tested.
 *
 * Each expedition ends at Dr. Lani's logbook, a set of questions at three
 * levels. There are four:
 *   The sunlight zone (the reef, 0 to 200 meters)
 *     1. the zones, plants and sunlight, who eats what, hiding on the reef
 *     2. food chains start with sunlight; plankton; red light fades first;
 *        the deeper, the more the water presses (5-PS3-1, 5-LS2-1)
 *     3. why reefs need sunlight, what happens when a link is missing,
 *        the dials going down (5-LS2-1, 4-LS1-1)
 *   The twilight zone (200 to 1,000 meters)
 *     1. dim blue light, big eyes, no plants, living light, cold
 *     2. red looks dark, belly lights hide a fish's shadow, the nightly trip
 *        up to feed, marine snow, silver sides (4-LS1-1, 3-LS4-3)
 *     3. what living light is for, how the nightly trip carries food down,
 *        the best way to hide, where the energy first came from
 *   The midnight zone (1,000 to 4,000 meters)
 *     1. total darkness, living light, the anglerfish's lure, cold, red
 *        animals, a giant mouth
 *     2. marine snow, saving energy, the atolla's alarm lights, pressure,
 *        tiny eyes, no colors of sunlight left (4-LS1-1)
 *     3. the energy still starts with sunlight far above, partnerships with
 *        glowing bacteria, hiding in total dark, why belly lights do not help
 *   The deep sea floor and its hot vents (grade 5 stretch)
 *     1. what a hot vent is, no sunlight, tube worms fed by bacteria that use
 *        chemicals, the yeti crab's farm, cold away from the vents
 *     2. why vent water does not boil, chimneys of minerals, a vent food
 *        chain, the 1977 discovery, the water sample (5-LS2-1)
 *     3. food chains that start with chemicals, the 250-year cold-seep tube
 *        worm, marine snow on the floor, where the heat comes from
 * The Trench Dive (the finale) also asks two old-game myth fixes at the top
 * (the shark's sense of smell, the man-of-war) and three trench questions at
 * the bottom (the deepest fish, Mount Everest, the pressure).
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the answer
 * away. Facts are checked against NOAA Ocean Exploration, the NOAA Ocean
 * Service, the Smithsonian Ocean portal and MBARI.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

import type { AnimalId, Zone } from './animals';

export type Station = 'sunlight' | 'twilight' | 'midnight' | 'vents';
export const STATIONS: Station[] = ['sunlight', 'twilight', 'midnight', 'vents'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'zone-order' // mixed up the ocean's layers
  | 'plants-eat' // thinks plants catch or eat their food
  | 'food-from-soil' // thinks a plant's food comes from the sand or soil
  | 'diet-mixup' // mixed up what an animal eats
  | 'no-food' // thinks an animal does not need food
  | 'anemone-plant' // thinks a sea anemone is a plant
  | 'wrong-reason' // gave a reason that does not explain it
  | 'color-purpose' // mixed up what an animal's color is for
  | 'deep-crowded' // thinks most ocean life lives deep down
  | 'chain-backward' // reads a food chain the wrong way round
  | 'water-food' // thinks water itself is food or the source of energy
  | 'plankton-alive' // thinks plankton is not alive
  | 'plankton-fish' // thinks phytoplankton are baby fish
  | 'oxygen-trees' // thinks all the oxygen we breathe comes from trees on land
  | 'red-visible' // thinks red things stay red and bright deep down
  | 'pressure-less' // thinks the water presses less (or the same) deeper down
  | 'structure-function' // mixed up what a body part is for
  | 'coral-plant' // thinks coral is a plant or a rock
  | 'salty-deep' // thinks deep water is too salty for reefs
  | 'chain-link' // does not see how one link in a food chain affects the next
  | 'turtle-gills' // thinks sea turtles breathe with gills
  | 'warm-deep' // thinks deep water is warm
  | 'animals-make-food' // thinks animals make food from sunlight
  | 'partner-harm' // thinks a partnership hurts one partner
  | 'clown-stung' // mixed up the clownfish and anemone partnership
  | 'plants-deep' // thinks plants grow in the dim or dark deep
  | 'eyes-scary' // thinks big eyes are for looking scary
  | 'glow-sun' // thinks the deep glow is sunlight
  | 'glow-battery' // thinks living light is made like electric light
  | 'glow-only-attract' // thinks living light only makes an animal easier to see
  | 'glow-food' // thinks living light can make food
  | 'migrate-day' // mixed up when the nightly trip happens
  | 'migrate-never' // thinks deep animals never move up and down
  | 'migrate-warm' // thinks the nightly trip is about warmth
  | 'snow-literal' // thinks marine snow is frozen snow
  | 'light-carried' // thinks animals carry sunlight down
  | 'bright-hide' // thinks a bright or pale animal hides well from below
  | 'pressure-push' // thinks deep animals push the water away
  | 'glow-lava' // thinks the deep glow comes from lava
  | 'glow-hot' // thinks living light is hot
  | 'sun-deep' // thinks sunlight reaches the deep sea
  | 'snow-up' // thinks marine snow floats back up
  | 'lights-hide-dark' // thinks lights hide an animal in total darkness
  | 'no-hunters' // thinks there are no hunters in the deep
  | 'chemo-sun' // thinks vent life runs on sunlight
  | 'crab-plant' // thinks a vent crab is a plant
  | 'deep-empty' // thinks the deep sea floor is empty of life
  | 'shark-myth' // believes sharks smell blood from miles away
  | 'trench-depth'; // mixed up how deep the trenches are

/** What the panel shows above the question (words in the question match it). */
export type Pic =
  /** One animal on a patch of its zone's water. */
  | { k: 'animal'; id: AnimalId }
  /** A coral head up close. */
  | { k: 'coral' }
  /** The ocean's layers, with the sub marked in one of them. */
  | { k: 'zones'; mark: Zone }
  /** A food chain: the Sun, then each link; `blank` hides one link behind a "?". */
  | { k: 'chain'; links: ChainLink[]; blank?: number }
  /** White sunlight going down into the sea, losing red first, then the others. */
  | { k: 'colors' }
  /** A fish seen from below against the dim light above, with or without belly lights. */
  | { k: 'below'; glow: boolean }
  /** The sub's three dials at a depth. */
  | { k: 'dials'; depth: number }
  /** Lanternfish deep down in the day and near the top at night. */
  | { k: 'migrate' }
  /** A hot vent: chimneys, smoky hot water, tube worms, crabs and shrimp. */
  | { k: 'vent' }
  /** Marine snow drifting down from the sunlight zone to the sea floor. */
  | { k: 'snow' }
  /** Two food chains side by side: one starting with sunlight, one with vent chemicals. */
  | { k: 'chemo' }
  /** The deepest trench with Mount Everest beside it, and where the deepest fish was seen. */
  | { k: 'depthbar' };

export type ChainLink = 'sun' | 'plankton' | 'smallfish' | 'bigfish' | 'seagrass' | 'turtle' | 'lanternfish' | 'snow' | 'gulpereel' | 'chemicals' | 'bacteria' | 'tubeworm';

/** The picture model that hint 2 adds (or that changes the picture itself). */
export type Model = 'zones' | 'chain' | 'colors' | 'below' | 'migrate' | 'dials' | 'card' | 'chemo' | 'snow' | 'everest';

export interface Choice {
  value: string;
  label: string;
  correct: boolean;
  misconception?: Misconception;
  /** One sentence about this wrong answer (never gives the right one away). */
  why?: string;
}

export interface Question {
  id: string;
  station: Station;
  tier: Tier;
  ask: string;
  choices: Choice[];
  /** Shown with the answer (after a right answer, and at hint 3). */
  explain: string;
  /** Hint 1 (a nudge) and hint 2 (a worked clue with a picture model); hint 3 outlines the answer. */
  hints: [string, string];
  pic: Pic;
  model: Model;
}

export interface QDef {
  id: string;
  tier: Tier;
  ask: string;
  right: string;
  wrong: Array<[string, Misconception, string]>;
  explain: string;
  hints: [string, string];
  pic: Pic;
  model: Model;
}

const animal = (id: AnimalId): Pic => ({ k: 'animal', id });
const zones = (mark: Zone): Pic => ({ k: 'zones', mark });
const REEF_CHAIN: ChainLink[] = ['sun', 'plankton', 'smallfish', 'bigfish'];

// ------------------------------------------------------------------ the sunlight zone (the reef)

const SUNLIGHT: QDef[] = [
  // level 1
  {
    id: 'sun-zone-name',
    tier: 1,
    ask: 'The top layer of the ocean gets lots of sunlight. It goes down about 200 meters. What is this layer called?',
    right: 'The sunlight zone',
    wrong: [
      ['The midnight zone', 'zone-order', 'The midnight zone is far deeper. No sunlight reaches it at all.'],
      ['The sea floor', 'zone-order', 'The sea floor is the very bottom, far below the top layer.'],
    ],
    explain: 'The sunlight zone is the top layer, from the surface down to about 200 meters. It is bright and warm.',
    hints: ['Look at the chart. The sub is in the top layer. What fills it?', 'The layers are named for how much light they get: lots of sunlight, then a little (twilight), then none (midnight).'],
    pic: zones('sunlight'),
    model: 'zones',
  },
  {
    id: 'sun-seagrass-food',
    tier: 1,
    ask: 'Seagrass is a real plant that grows under the sea. Plants make their own food. What do they use to make it?',
    right: 'Sunlight',
    wrong: [
      ['Sand', 'food-from-soil', 'Roots hold the seagrass in place, but the sand is not its food.'],
      ['Little fish they catch', 'plants-eat', 'Plants cannot catch anything. They make their food.'],
    ],
    explain: 'Plants use sunlight, water and air to make their own food. That is why seagrass grows only where the water is sunny.',
    hints: ['Seagrass only grows in shallow, sunny water. Why might that be?', 'Plants on land and under the sea need light to make food. Deep down, where it is dark, no seagrass grows.'],
    pic: animal('seagrass'),
    model: 'card',
  },
  {
    id: 'sun-turtle-eats',
    tier: 1,
    ask: 'Grown-up green sea turtles munch on seagrass and seaweed. What kind of eater is the turtle?',
    right: 'A plant eater',
    wrong: [
      ['A meat eater', 'diet-mixup', 'Meat eaters hunt other animals. Look at what the turtle munches.'],
      ['It does not need to eat', 'no-food', 'Every animal needs food to live and grow.'],
    ],
    explain: 'Green sea turtles are plant eaters. They graze on seagrass and seaweed, like cows grazing on grass.',
    hints: ['Seagrass and seaweed: are they plants or animals?', 'An animal that eats plants is a plant eater. One that eats other animals is a meat eater.'],
    pic: animal('turtle'),
    model: 'card',
  },
  {
    id: 'sun-clown-home',
    tier: 1,
    ask: 'This clownfish lives in a sea anemone. The anemone’s arms sting most fish. Why is the clownfish safe there?',
    right: 'A slimy coat keeps it from being stung',
    wrong: [
      ['The anemone is a plant, so it cannot sting', 'anemone-plant', 'A sea anemone is an animal, and its arms really do sting.'],
      ['Clownfish are too fast to be stung', 'wrong-reason', 'Clownfish swim right in the arms all day. Speed is not what keeps them safe.'],
    ],
    explain: 'A clownfish has a slimy coat that keeps the anemone from stinging it. Other fish get stung, so the clownfish has a safe home.',
    hints: ['Think about the clownfish’s skin. Is there something special on it?', 'Clownfish are covered in a slimy coat, a bit like a raincoat against the stings.'],
    pic: animal('clownfish'),
    model: 'card',
  },
  {
    id: 'sun-octopus-hide',
    tier: 1,
    ask: 'An octopus can change its color in a blink to match the reef. How does that help it?',
    right: 'It hides from hunters, and sneaks up on its food',
    wrong: [
      ['It keeps the octopus warm', 'color-purpose', 'Changing color does not warm it up. Think about being seen.'],
      ['It helps the octopus breathe', 'color-purpose', 'An octopus breathes with gills. Its color is about being seen.'],
    ],
    explain: 'Matching the reef is camouflage. Hunters swim right past, and crabs do not see the octopus coming.',
    hints: ['If the octopus looks just like the reef, who can’t see it?', 'Blending in is called camouflage. It helps an animal hide, and it helps a hunter sneak up.'],
    pic: animal('octopus'),
    model: 'card',
  },
  {
    id: 'sun-most-life',
    tier: 1,
    ask: 'Sunlight lets tiny living things and seaweed grow in the top layer. Lots of animals come to eat them. Where does most ocean life live?',
    right: 'In the sunlight zone',
    wrong: [
      ['On the deepest sea floor', 'deep-crowded', 'Deep down there is little food, so far fewer animals live there.'],
      ['In the twilight zone', 'deep-crowded', 'Some animals live there, but most live where the sunlight is.'],
    ],
    explain: 'Most ocean life lives in the sunlight zone, because that is where the sunlight makes food.',
    hints: ['Where is the food made?', 'Seaweed and tiny drifters make food from sunlight, so animals gather where the light is: the top layer.'],
    pic: zones('sunlight'),
    model: 'zones',
  },
  // level 2
  {
    id: 'sun-chain-start',
    tier: 2,
    ask: 'This is a food chain from the reef. Small fish eat tiny plankton. Bigger fish eat the small fish. Where does the energy in this chain start?',
    right: 'The Sun',
    wrong: [
      ['The big fish', 'chain-backward', 'The big fish is at the end of the chain. It eats the others.'],
      ['The water', 'water-food', 'Living things need water, but the energy comes from somewhere else.'],
    ],
    explain: 'The energy starts with the Sun. Plankton use sunlight to make food, and the energy passes along to the fish that eat them.',
    hints: ['Look at the start of the chain, on the left. What do the plankton need?', 'Follow the arrows: they show who gets eaten by whom. The very first thing powers everything after it.'],
    pic: { k: 'chain', links: REEF_CHAIN },
    model: 'chain',
  },
  {
    id: 'sun-plankton-what',
    tier: 2,
    ask: 'Phytoplankton drift in the sunlit water. Most are too tiny to see. What are they?',
    right: 'Tiny living things that make food from sunlight',
    wrong: [
      ['Tiny bits of sand', 'plankton-alive', 'Phytoplankton are alive. They grow and make food.'],
      ['Baby fish', 'plankton-fish', 'Some baby animals drift too, but phytoplankton make their own food, like plants.'],
    ],
    explain: 'Phytoplankton are tiny living things that make food from sunlight, like plants do. They are the start of most ocean food chains.',
    hints: ['Look closely at the picture from Finn’s microscope camera. Do they look alive?', 'Phyto means plant. Plankton means drifter. So phytoplankton are drifting plant-like living things.'],
    pic: animal('plankton'),
    model: 'chain',
  },
  {
    id: 'sun-oxygen',
    tier: 2,
    ask: 'Phytoplankton make food from sunlight. As they do, they give off oxygen, like trees do. How much of the oxygen in the air comes from the ocean’s tiny drifters?',
    right: 'About half of it',
    wrong: [
      ['None. It all comes from trees.', 'oxygen-trees', 'Trees make lots of oxygen, but so do the ocean’s tiny drifters.'],
      ['Just a tiny bit', 'oxygen-trees', 'There are so many of them that it adds up to much more than a bit.'],
    ],
    explain: 'The ocean’s tiny drifters make about half of the oxygen in the air. Every other breath you take, you can thank the ocean.',
    hints: ['There are more phytoplankton than you could ever count. What might all of them add up to?', 'Scientists say every other breath you take has oxygen from the ocean.'],
    pic: animal('plankton'),
    model: 'card',
  },
  {
    id: 'sun-red-fades',
    tier: 2,
    ask: 'Sunlight has all the colors of the rainbow. Water soaks up red light first, close to the top. A red fish swims deeper down. How does it look there?',
    right: 'Dark, almost black',
    wrong: [
      ['Bright red', 'red-visible', 'Red only looks red when red light shines on it, and the red light is gone.'],
      ['Bright blue', 'red-visible', 'The fish does not change. There is just no red light left to show its color.'],
    ],
    explain: 'Deeper down, there is no red light left, so a red fish has nothing to reflect. It looks dark.',
    hints: ['Look at the light going down. Which color is gone first?', 'A red thing looks red because red light bounces off it. With no red light, it looks dark.'],
    pic: { k: 'colors' },
    model: 'colors',
  },
  {
    id: 'sun-pressure',
    tier: 2,
    ask: 'Water is heavy. The deeper you go, the more water is above you, pressing down. What happens to the pressing as the sub dives?',
    right: 'It gets stronger',
    wrong: [
      ['It gets weaker', 'pressure-less', 'Going down, there is more water above you, not less.'],
      ['It stays the same', 'pressure-less', 'Look at the pressure dial. It keeps climbing as the sub goes down.'],
    ],
    explain: 'The pressure grows the deeper you go. Every 10 meters adds about as much pressing as all the air above us.',
    hints: ['Think of a stack of heavy blankets. The deeper you are in the stack, the more is on top of you.', 'The pressure dial goes up by one for every 10 meters down.'],
    pic: { k: 'dials', depth: 120 },
    model: 'dials',
  },
  {
    id: 'sun-ray-body',
    tier: 2,
    ask: 'A spotted eagle ray is wide and flat. It glides with fins like wings, and digs its food out of the sand. How does its flat shape help it?',
    right: 'It glides easily and stays close to the sand',
    wrong: [
      ['It floats at the top all day', 'structure-function', 'The ray swims near the sea floor, where its food is.'],
      ['It climbs up the coral', 'structure-function', 'Rays have no legs to climb. They glide.'],
    ],
    explain: 'A wide, flat body works like wings for gliding, and lets the ray swim low over the sand where its clams and snails hide.',
    hints: ['Where does the ray find its food?', 'Wide fins work like wings. A flat body can skim just above the sand.'],
    pic: animal('ray'),
    model: 'card',
  },
  // level 3
  {
    id: 'sun-coral-animal',
    tier: 3,
    ask: 'Coral looks like rock, but each bump is a tiny animal. Tiny algae live inside it and make food from sunlight. Why do coral reefs grow only in shallow, sunny water?',
    right: 'The algae inside the coral need sunlight',
    wrong: [
      ['Coral is a plant, so it needs sun', 'coral-plant', 'Coral is an animal. Something that lives inside it needs the sun.'],
      ['Deep water is too salty', 'salty-deep', 'Deep water is about as salty as the top. The difference is the light.'],
    ],
    explain: 'Reef corals share their home with tiny algae. The algae make food from sunlight and share it with the coral, so reefs need bright, shallow water.',
    hints: ['Read the question again. Who is living inside the coral?', 'The algae inside make food from sunlight, like plants. Without light, the coral goes hungry.'],
    pic: { k: 'coral' },
    model: 'zones',
  },
  {
    id: 'sun-chain-less',
    tier: 3,
    ask: 'In this food chain, small fish eat plankton, and bigger fish eat small fish. One year there is much less plankton. What happens to the small fish?',
    right: 'They have less food, so there are fewer of them',
    wrong: [
      ['Nothing. They eat the big fish instead.', 'chain-backward', 'Small fish do not eat the big fish. The big fish eat them.'],
      ['There are more of them', 'chain-link', 'Less food means harder times, not more fish.'],
    ],
    explain: 'Every link depends on the one before it. Less plankton means less food for small fish, and then less food for the bigger fish too.',
    hints: ['What do the small fish eat?', 'Follow the arrows. If the first link shrinks, the next link has less to eat.'],
    pic: { k: 'chain', links: REEF_CHAIN },
    model: 'chain',
  },
  {
    id: 'sun-turtle-air',
    tier: 3,
    ask: 'A sea turtle can stay under water for a long time. But every so often, it swims up to the top. Why?',
    right: 'To breathe air with its lungs',
    wrong: [
      ['To rest its gills', 'turtle-gills', 'Turtles do not have gills. They have lungs, like us.'],
      ['To catch birds to eat', 'diet-mixup', 'Green sea turtles eat seagrass and seaweed, not birds.'],
    ],
    explain: 'Sea turtles are reptiles. They breathe air with lungs, so they must swim up to the top to take a breath.',
    hints: ['Fish breathe with gills. What do turtles breathe with?', 'Turtles have lungs, like you. Lungs need air.'],
    pic: animal('turtle'),
    model: 'card',
  },
  {
    id: 'sun-dials-down',
    tier: 3,
    ask: 'At the top, the Sun warms the sea. The sub dives from 10 meters down to 200 meters. What do the dials show?',
    right: 'Colder water and more pressing',
    wrong: [
      ['Warmer water and less pressing', 'warm-deep', 'The Sun warms the top, so deeper water is colder. And there is more water above.'],
      ['Warmer water and more pressing', 'warm-deep', 'The pressing is right, but the Sun warms the top, so deeper water is colder.'],
    ],
    explain: 'Going down, the water gets colder (the Sun warms only the top) and the pressure grows (more water is above you).',
    hints: ['What warms the sea? Is it closer to the top or the bottom?', 'Look at the dials at 10 meters and at 200 meters. Which way does each one change?'],
    pic: { k: 'dials', depth: 10 },
    model: 'dials',
  },
  {
    id: 'sun-energy-turtle',
    tier: 3,
    ask: 'Sun, then seagrass, then sea turtle. The turtle swims and grows. Where did the energy in its food first come from?',
    right: 'Sunlight, caught by the seagrass',
    wrong: [
      ['The sand the seagrass grows in', 'food-from-soil', 'Sand holds the roots. It does not give the seagrass energy.'],
      ['The turtle made it itself', 'animals-make-food', 'Animals cannot make food from sunlight. They have to eat it.'],
    ],
    explain: 'The seagrass caught the Sun’s energy and stored it as food. The turtle got that energy by eating the seagrass.',
    hints: ['Look at the start of the chain.', 'Plants catch the Sun’s energy. Animals get it by eating plants, or by eating animals that ate plants.'],
    pic: { k: 'chain', links: ['sun', 'seagrass', 'turtle'] },
    model: 'chain',
  },
  {
    id: 'sun-partners',
    tier: 3,
    ask: 'The clownfish hides in the anemone’s arms. The clownfish chases off fish that would nibble the anemone. What is this?',
    right: 'A partnership that helps both of them',
    wrong: [
      ['The clownfish is hurting the anemone', 'partner-harm', 'The anemone is helped, not hurt: the clownfish guards it.'],
      ['The anemone is hunting the clownfish', 'clown-stung', 'The anemone leaves the clownfish alone. They live together.'],
    ],
    explain: 'It is a partnership. The anemone gives the clownfish a safe home, and the clownfish guards the anemone. Both are helped.',
    hints: ['What does each one get?', 'The clownfish gets a safe home. The anemone gets a guard.'],
    pic: animal('clownfish'),
    model: 'card',
  },
];

// ------------------------------------------------------------------ the twilight zone

const TWILIGHT: QDef[] = [
  // level 1
  {
    id: 'tw-zone-name',
    tier: 1,
    ask: 'Below 200 meters, only a little blue light is left. It is dim, like just after sunset. What is this layer called?',
    right: 'The twilight zone',
    wrong: [
      ['The sunlight zone', 'zone-order', 'The sunlight zone is the bright layer above.'],
      ['The midnight zone', 'zone-order', 'The midnight zone is deeper still. No light reaches it at all.'],
    ],
    explain: 'The twilight zone goes from about 200 meters to 1,000 meters down. Twilight is the dim time just after sunset.',
    hints: ['What do we call the dim time just after the Sun sets?', 'The layers go: sunlight, then dim twilight, then dark midnight.'],
    pic: zones('twilight'),
    model: 'zones',
  },
  {
    id: 'tw-big-eyes',
    tier: 1,
    ask: 'This hatchetfish lives in dim light. Look at its eyes. Why are they so big?',
    right: 'To catch what little light there is',
    wrong: [
      ['To look scary', 'eyes-scary', 'Big eyes are for seeing, not for scaring.'],
      ['To keep it warm', 'structure-function', 'Eyes are for seeing. Think about how dim it is down here.'],
    ],
    explain: 'Big eyes let in more light, so the fish can see in the dim twilight zone. Many animals here have big eyes.',
    hints: ['Is it bright or dim down here?', 'When it gets dark, the black middle of your eye grows to let in more light. Big eyes do that all the time.'],
    pic: animal('hatchetfish'),
    model: 'card',
  },
  {
    id: 'tw-no-plants',
    tier: 1,
    ask: 'Plants and seaweed need bright sunlight to make food. Do plants grow in the twilight zone?',
    right: 'No. It is too dim for them to make food.',
    wrong: [
      ['Yes, lots of them', 'plants-deep', 'Plants need bright light. Down here it is too dim.'],
      ['Only in the daytime', 'plants-deep', 'Even at noon, it is too dim down here for plants.'],
    ],
    explain: 'There is not enough light in the twilight zone for plants to make food, so none grow there.',
    hints: ['What do plants need to make food?', 'Only a little dim blue light reaches here. Plants need much more.'],
    pic: zones('twilight'),
    model: 'zones',
  },
  {
    id: 'tw-living-light',
    tier: 1,
    ask: 'This lanternfish has little lights along its body. The fish makes the light itself. What do we call light made by a living thing?',
    right: 'Living light (bioluminescence)',
    wrong: [
      ['Sunlight', 'glow-sun', 'The fish makes this light itself. It does not come from the Sun.'],
      ['Electric light from a battery', 'glow-battery', 'There are no batteries in a fish. Its body makes the light.'],
    ],
    explain: 'Light made by a living thing is called bioluminescence, or living light. Fireflies make it too!',
    hints: ['Which bug back at camp makes its own light at night?', 'Bio means life, and luminescence means giving off light.'],
    pic: animal('lanternfish'),
    model: 'card',
  },
  {
    id: 'tw-cold',
    tier: 1,
    ask: 'The sub is 500 meters down. The Sun warms only the top of the sea. What is the water like here?',
    right: 'Cold',
    wrong: [
      ['Warm, like a bath', 'warm-deep', 'The Sun’s warmth stays near the top.'],
      ['Hot, like soup', 'warm-deep', 'The Sun warms only the top. Nothing down here heats the water.'],
    ],
    explain: 'The deep sea is cold. The Sun warms only the top layer, so the water gets colder as you go down.',
    hints: ['Look at the temperature dial.', 'The Sun warms the top. The farther from the top, the colder.'],
    pic: { k: 'dials', depth: 500 },
    model: 'dials',
  },
  {
    id: 'tw-see-through',
    tier: 1,
    ask: 'This comb jelly is clear, like glass. Why is being see-through good in open water?',
    right: 'Hunters look right through it, so it is hard to find',
    wrong: [
      ['It keeps the jelly warm', 'structure-function', 'Being clear does not make it warmer. Think about being seen.'],
      ['It helps the jelly see better', 'structure-function', 'Being clear is about being seen by others, not about seeing.'],
    ],
    explain: 'In open water there is nowhere to hide. Being clear like glass is a great way to stay hidden.',
    hints: ['Out in open water, are there rocks or coral to hide behind?', 'If you can see right through something, it is very hard to spot.'],
    pic: animal('combjelly'),
    model: 'card',
  },
  // level 2
  {
    id: 'tw-red-dark',
    tier: 2,
    ask: 'Many twilight animals are red. Red light does not reach this deep. How does a red shrimp look down here?',
    right: 'Dark, so it is hard to see',
    wrong: [
      ['Bright red, so everyone sees it', 'red-visible', 'Red only looks red when red light shines on it.'],
      ['It glows red', 'red-visible', 'Being red does not make light. With no red light, red looks dark.'],
    ],
    explain: 'With no red light, red animals look dark. That makes red a great hiding color in the deep.',
    hints: ['Look at the light going down. Which color is gone by here?', 'A red thing needs red light to look red. Without it, it looks dark.'],
    pic: { k: 'colors' },
    model: 'colors',
  },
  {
    id: 'tw-belly-lights',
    tier: 2,
    ask: 'A hunter looks up from below. It sees the dark shape of a fish against the dim light above. Then the fish turns on lights on its belly. What happens?',
    right: 'Its shape blends into the light, so it is hard to see',
    wrong: [
      ['It is easier to see', 'glow-only-attract', 'The belly lights match the light above, so they hide the fish.'],
      ['The lights scare the hunter away', 'glow-only-attract', 'The lights are dim and soft, like the light above. They help it hide.'],
    ],
    explain: 'The belly lights match the dim light from above, so the fish’s dark shadow disappears. Hunters below can’t see it.',
    hints: ['From below, what makes the fish easy to spot?', 'The fish looks dark against the light. If its belly glows just as brightly as the light above, the dark shape is gone.'],
    pic: { k: 'below', glow: false },
    model: 'below',
  },
  {
    id: 'tw-migrate-when',
    tier: 2,
    ask: 'Lanternfish hide deep down in the day. When do they swim up toward the top to eat?',
    right: 'At night',
    wrong: [
      ['At noon', 'migrate-day', 'At noon the top is bright, and hunters could see them easily.'],
      ['Never', 'migrate-never', 'They make the trip up and back every day!'],
    ],
    explain: 'Every night, lanternfish and many other animals swim up to eat in the dark, then go back down before sunrise.',
    hints: ['When is the top of the sea dark?', 'They want to eat without being seen. The top is dark only at night.'],
    pic: { k: 'migrate' },
    model: 'migrate',
  },
  {
    id: 'tw-migrate-why',
    tier: 2,
    ask: 'Near the top there is lots of food. But in the day, hunters can see well there. Why do lanternfish swim up only at night?',
    right: 'They can eat in the dark, when hunters can’t see them',
    wrong: [
      ['The water is warmer at night', 'migrate-warm', 'The top is warm day and night. It is about not being seen.'],
      ['They sleep near the top all day', 'migrate-day', 'In the day they are deep down, hiding in the dim light.'],
    ],
    explain: 'The darkness keeps them safe. They eat near the top at night, then hide in the dim deep by day.',
    hints: ['What do hunters need to see well?', 'In the dark, hunters that hunt by sight can’t spot the lanternfish.'],
    pic: { k: 'migrate' },
    model: 'migrate',
  },
  {
    id: 'tw-marine-snow',
    tier: 2,
    ask: 'No plants grow in the twilight zone. Some animals eat food that drifts down from above, like snow. What is this food made of?',
    right: 'Bits of plankton, dead animals and poop from above',
    wrong: [
      ['Real snow from the sky', 'snow-literal', 'It is called marine snow, but it is not frozen water.'],
      ['Plants that grow down here', 'plants-deep', 'It is too dim for plants down here.'],
    ],
    explain: 'It is called marine snow: tiny bits of dead plankton, dead animals and poop sinking from above. For deep animals, it is food!',
    hints: ['Where is the food made? And which way do things sink?', 'Bits from the busy sunlight zone sink slowly, like snowflakes.'],
    pic: zones('twilight'),
    model: 'zones',
  },
  {
    id: 'tw-silver',
    tier: 2,
    ask: 'A hatchetfish has shiny silver sides, like mirrors. Mirrors show what is around them. How do they help the fish?',
    right: 'They reflect the blue water, so the fish blends in',
    wrong: [
      ['They help it see in the dark', 'structure-function', 'Its eyes do the seeing. The silver sides are about being seen.'],
      ['They shine brightly so friends can find it', 'glow-only-attract', 'Mirrors only show what is around them. Here, that is blue water.'],
    ],
    explain: 'Silver sides work like mirrors. They show the blue water all around, so the fish seems to vanish.',
    hints: ['What would a mirror show, out in the blue water?', 'If its sides show the water around it, the fish looks like water too.'],
    pic: animal('hatchetfish'),
    model: 'card',
  },
  // level 3
  {
    id: 'tw-light-pattern',
    tier: 3,
    ask: 'Each kind of lanternfish has its own pattern of lights. Scientists think the patterns help them do something important. What?',
    right: 'Find others of their own kind',
    wrong: [
      ['Warm up the water', 'structure-function', 'Living light gives off almost no heat.'],
      ['Make food, like plants do', 'glow-food', 'Light from an animal cannot make food. Plants need sunlight.'],
    ],
    explain: 'Like a team shirt, a pattern of lights helps lanternfish find their own kind in the dark.',
    hints: ['Every kind has a different pattern. Who would want to know which kind a fish is?', 'Patterns are like name tags. Lanternfish of the same kind can spot each other.'],
    pic: animal('lanternfish'),
    model: 'card',
  },
  {
    id: 'tw-carry-food',
    tier: 3,
    ask: 'At night, lanternfish eat near the top. Then they swim back down and poop in the deep. How does this help the deep sea?',
    right: 'It carries food from the top down into the deep',
    wrong: [
      ['It carries sunlight down', 'light-carried', 'Fish cannot carry sunlight. What they eat is another story.'],
      ['It warms the deep water', 'warm-deep', 'Fish do not warm the sea. Think about what they bring down.'],
    ],
    explain: 'The nightly trip carries food from the busy top down into the deep, where other animals eat it.',
    hints: ['They eat at the top. Where do they go afterwards?', 'What goes into a fish at the top comes out of it deep down. That is food for deep animals.'],
    pic: { k: 'migrate' },
    model: 'migrate',
  },
  {
    id: 'tw-best-hide',
    tier: 3,
    ask: 'A hunter swims below, looking up. Which twilight animal is the hardest for it to see?',
    right: 'A silver fish with a glowing belly',
    wrong: [
      ['A bright yellow fish with no lights', 'bright-hide', 'From below, its dark shape still shows against the light above.'],
      ['A big white fish with no lights', 'bright-hide', 'From below, its dark shape still shows against the light above.'],
    ],
    explain: 'Silver sides blend in with the water around it, and the glowing belly hides its shape from below.',
    hints: ['From below, what gives a fish away?', 'Any fish looks dark against the light above, unless its belly glows to match.'],
    pic: { k: 'below', glow: true },
    model: 'below',
  },
  {
    id: 'tw-eyes-up',
    tier: 3,
    ask: 'A hatchetfish’s big eyes point upward. Food and hunters show up as dark shapes against the faint light above. Why do its eyes point up?',
    right: 'To spot shapes against the light above',
    wrong: [
      ['To look for the sea floor', 'structure-function', 'The sea floor is far below, and it is dark.'],
      ['To look at the Sun', 'glow-sun', 'The Sun is much too far to see from here. Only a faint glow is left.'],
    ],
    explain: 'Looking up, the hatchetfish sees food and hunters as dark shapes against the faint light from above.',
    hints: ['Where is the only light coming from?', 'Things above the fish block the faint light, so they show up as dark shapes.'],
    pic: animal('hatchetfish'),
    model: 'below',
  },
  {
    id: 'tw-energy-start',
    tier: 3,
    ask: 'No plants grow in the twilight zone. So where did the energy in a lanternfish’s food first come from?',
    right: 'Sunlight, used by tiny plankton near the top',
    wrong: [
      ['The lanternfish’s own lights', 'glow-food', 'Making light uses energy. It does not make food.'],
      ['The cold water', 'water-food', 'Water is not food, and it does not give energy.'],
    ],
    explain: 'The energy started as sunlight. Plankton near the top caught it, and it passed along the chain to the lanternfish.',
    hints: ['What do lanternfish eat at night, near the top?', 'They eat tiny animals that ate phytoplankton, and phytoplankton use sunlight.'],
    pic: { k: 'chain', links: ['sun', 'plankton', 'smallfish', 'lanternfish'] },
    model: 'chain',
  },
  {
    id: 'tw-squishy',
    tier: 3,
    ask: 'At 800 meters, the water presses about 80 times harder than the air at the top. Many animals here have soft bodies with no air pockets inside. Why does that help?',
    right: 'With no air inside, there is nothing for the water to squash',
    wrong: [
      ['The water presses less on soft things', 'pressure-less', 'The water presses just as hard. The trick is what is inside.'],
      ['The animals push the water away', 'pressure-push', 'No animal could push back that much water.'],
    ],
    explain: 'Air can be squashed, but water hardly can. A body full of water and no air pockets is not crushed.',
    hints: ['Think of a balloon full of air, and a water balloon. Which one squashes more when you press?', 'Air squashes easily. Water hardly squashes at all.'],
    pic: { k: 'dials', depth: 800 },
    model: 'dials',
  },
];

// ------------------------------------------------------------------ the midnight zone

const MIDNIGHT: QDef[] = [
  // level 1
  {
    id: 'mid-zone-name',
    tier: 1,
    ask: 'Below 1,000 meters, no sunlight reaches at all. It is dark all day and all night. What is this layer called?',
    right: 'The midnight zone',
    wrong: [
      ['The twilight zone', 'zone-order', 'The twilight zone still gets a little dim light. This layer gets none.'],
      ['The sunlight zone', 'zone-order', 'The sunlight zone is the bright layer at the very top.'],
    ],
    explain: 'The midnight zone starts at about 1,000 meters. It is always dark there, like the middle of the night.',
    hints: ['What time of day is the darkest?', 'The layers go: sunlight, then dim twilight, then dark midnight.'],
    pic: zones('midnight'),
    model: 'zones',
  },
  {
    id: 'mid-only-light',
    tier: 1,
    ask: 'In the midnight zone there is no sunlight. Yet the sub sees little flashes and glows. Where does that light come from?',
    right: 'Animals making their own light',
    wrong: [
      ['Sunlight shining down', 'glow-sun', 'No sunlight gets this deep at all.'],
      ['Lava under the sea', 'glow-lava', 'These lights move and blink, the way animals do.'],
    ],
    explain: 'All the light in the midnight zone is living light, made by animals such as anglerfish, jellies and shrimp.',
    hints: ['What did the lanternfish have along their bodies?', 'Many deep animals make their own light. It is called bioluminescence, or living light.'],
    pic: animal('anglerfish'),
    model: 'card',
  },
  {
    id: 'mid-lure',
    tier: 1,
    ask: 'This anglerfish has a glowing lure above its mouth. Small animals swim toward the light. What is the lure for?',
    right: 'Catching food',
    wrong: [
      ['Lighting the way home', 'structure-function', 'Think about who swims toward the light.'],
      ['Keeping warm', 'glow-hot', 'Living light gives off almost no heat.'],
    ],
    explain: 'The lure works like a fishing rod with bait. Small animals come close to the light, and the anglerfish snaps them up.',
    hints: ['A person fishing uses bait on a hook. Why?', 'Animals swim toward the glow, right up to the anglerfish’s mouth.'],
    pic: animal('anglerfish'),
    model: 'card',
  },
  {
    id: 'mid-cold',
    tier: 1,
    ask: 'The sub is 2,000 meters down. The Sun warms only the top of the sea. What is the water like here?',
    right: 'Very cold, a little above freezing',
    wrong: [
      ['Warm, like a bath', 'warm-deep', 'The Sun’s warmth stays near the top.'],
      ['Hot, like soup', 'warm-deep', 'Nothing down here heats the water, away from the hot vents.'],
    ],
    explain: 'The deep sea is very cold: only a few degrees above freezing, all year round.',
    hints: ['Look at the temperature dial.', 'The farther from the Sun-warmed top, the colder the water.'],
    pic: { k: 'dials', depth: 2000 },
    model: 'dials',
  },
  {
    id: 'mid-red',
    tier: 1,
    ask: 'This atolla jelly is deep red. No red light ever reaches this deep. Why is red a good color down here?',
    right: 'Red looks black in the dark, so it is hidden',
    wrong: [
      ['Red is easy to see, so friends find it', 'red-visible', 'With no red light, red does not show at all.'],
      ['Red keeps it warm', 'structure-function', 'Color does not warm it up. Think about being seen.'],
    ],
    explain: 'Red needs red light to look red. In the dark deep there is none, so a red animal looks black and stays hidden.',
    hints: ['Remember the light going down. Which color was gone first?', 'Without red light, a red thing has nothing to show. It looks dark.'],
    pic: animal('atolla'),
    model: 'colors',
  },
  {
    id: 'mid-big-mouth',
    tier: 1,
    ask: 'Food is hard to find in the midnight zone. This gulper eel has a giant mouth. How does a giant mouth help?',
    right: 'It can eat almost anything it finds',
    wrong: [
      ['It helps it swim fast', 'structure-function', 'A big open mouth would slow it down. Its mouth is for eating.'],
      ['It scares other fish away', 'eyes-scary', 'Its mouth is for eating, not for scaring.'],
    ],
    explain: 'When food is rare, it helps to eat whatever you find, big or small. A giant mouth can scoop up a lot.',
    hints: ['Is food easy or hard to find down here?', 'If you only find food now and then, you want to be able to eat it, whatever its size.'],
    pic: animal('gulpereel'),
    model: 'card',
  },
  // level 2
  {
    id: 'mid-snow',
    tier: 2,
    ask: 'No plants grow down here. Bits of dead plankton, dead animals and poop sink from far above, like snow. What do midnight animals do with it?',
    right: 'Eat it: it is food',
    wrong: [
      ['Nothing. It melts.', 'snow-literal', 'It is called marine snow, but it is not frozen. It is food!'],
      ['Build nests with it', 'wrong-reason', 'Most midnight animals do not build nests. The snow is food.'],
    ],
    explain: 'Marine snow is food. It carries food from the busy sunlight zone down to the animals of the deep.',
    hints: ['Where is food made? Which way do things sink?', 'Bits from the top sink slowly, like snowflakes, and deep animals eat them.'],
    pic: { k: 'snow' },
    model: 'snow',
  },
  {
    id: 'mid-slow',
    tier: 2,
    ask: 'Food is scarce in the midnight zone. Many animals there move slowly and wait for food to come to them. Why?',
    right: 'Moving slowly saves energy',
    wrong: [
      ['The water is too thick to swim fast', 'wrong-reason', 'Deep water is about as easy to swim in. It is about energy.'],
      ['They are always asleep', 'wrong-reason', 'They are awake, waiting for food to come by.'],
    ],
    explain: 'When meals are rare, wasting energy is risky. Moving slowly and waiting saves energy until food comes along.',
    hints: ['What happens to your energy when you run around a lot?', 'Food gives energy. If food is rare, animals use as little energy as they can.'],
    pic: animal('atolla'),
    model: 'card',
  },
  {
    id: 'mid-alarm',
    tier: 2,
    ask: 'When something grabs an atolla jelly, it flashes a ring of blue lights. The flashes may call a bigger animal. How does that help the jelly?',
    right: 'The bigger animal may chase the attacker away',
    wrong: [
      ['The lights make the jelly bigger', 'structure-function', 'The lights do not change its size.'],
      ['The lights burn the attacker', 'glow-hot', 'Living light is cool. It gives off almost no heat.'],
    ],
    explain: 'It is like a burglar alarm. The flashes may bring a bigger hunter that goes after the attacker, and the jelly can get away.',
    hints: ['What does a burglar alarm do?', 'An alarm calls someone bigger to come and deal with the attacker.'],
    pic: animal('atolla'),
    model: 'card',
  },
  {
    id: 'mid-pressure',
    tier: 2,
    ask: 'At 2,000 meters, the water presses about 200 times harder than the air at the top. Why don’t midnight animals get squashed?',
    right: 'Their bodies are full of water, with no air pockets',
    wrong: [
      ['They all have hard shells', 'wrong-reason', 'Many are soft and jelly-like. It is what is inside that matters.'],
      ['The water presses less on animals', 'pressure-less', 'The water presses on everything just as hard.'],
    ],
    explain: 'Air squashes easily, but water hardly squashes at all. A body full of water and no air pockets is not crushed.',
    hints: ['Think of a balloon full of air, and a water balloon. Which squashes more?', 'Air squashes easily. Water hardly squashes at all.'],
    pic: { k: 'dials', depth: 2000 },
    model: 'dials',
  },
  {
    id: 'mid-tiny-eyes',
    tier: 2,
    ask: 'Some midnight fish, like this gulper eel, have tiny eyes. Twilight fish have big eyes. Why might eyes matter less down here?',
    right: 'There is no sunlight to see by',
    wrong: [
      ['They live inside caves', 'wrong-reason', 'They live out in open water. It is the darkness.'],
      ['Their eyes wore out', 'wrong-reason', 'Eyes do not wear out like that.'],
    ],
    explain: 'With no sunlight, big eyes help less. Some midnight animals have tiny eyes and find food by touch, smell or living light.',
    hints: ['How much sunlight is there in the midnight zone?', 'Twilight fish need big eyes to catch dim light. Here, there is no sunlight at all.'],
    pic: animal('gulpereel'),
    model: 'card',
  },
  {
    id: 'mid-no-colors',
    tier: 2,
    ask: 'Red light is soaked up near the top. Blue light goes deepest, but it is gone by about 1,000 meters. Which colors of sunlight are left in the midnight zone?',
    right: 'None. It is completely dark.',
    wrong: [
      ['Only red', 'red-visible', 'Red is the first color to go, near the top.'],
      ['All of them', 'sun-deep', 'Sunlight fades out long before this depth.'],
    ],
    explain: 'By 1,000 meters every color of sunlight is gone. The midnight zone is completely dark, except for living light.',
    hints: ['Look at the colors going down. Do any reach the bottom of the picture?', 'Red goes first, blue goes last, and below about 1,000 meters none are left.'],
    pic: { k: 'colors' },
    model: 'colors',
  },
  // level 3
  {
    id: 'mid-energy',
    tier: 3,
    ask: 'Sun, then plankton near the top, then marine snow sinking down, then a gulper eel. Where did the energy in the eel’s food first come from?',
    right: 'Sunlight, used by plankton far above',
    wrong: [
      ['The eel’s glowing tail', 'glow-food', 'Making light uses energy. It does not make food.'],
      ['The cold, dark water', 'water-food', 'Water is not food, and it does not give energy.'],
    ],
    explain: 'The energy started as sunlight at the top. Plankton caught it, and marine snow carried it all the way down.',
    hints: ['Look at the start of the chain.', 'Follow the arrows back to the very first link.'],
    pic: { k: 'chain', links: ['sun', 'plankton', 'snow', 'gulpereel'] },
    model: 'chain',
  },
  {
    id: 'mid-bacteria-partner',
    tier: 3,
    ask: 'An anglerfish’s lure glows because tiny bacteria live inside it. The bacteria get a safe home. What does the anglerfish get?',
    right: 'Light to catch its food',
    wrong: [
      ['Warmth', 'glow-hot', 'Living light gives off almost no heat.'],
      ['Food from the bacteria', 'wrong-reason', 'The bacteria make light for it, not food.'],
    ],
    explain: 'It is a partnership, like the clownfish and the anemone. The bacteria get a home, and the anglerfish gets a glowing lure.',
    hints: ['What is the lure for?', 'Both partners get something. The bacteria get a home. What does the glow do for the fish?'],
    pic: animal('anglerfish'),
    model: 'card',
  },
  {
    id: 'mid-hardest',
    tier: 3,
    ask: 'In the total darkness of the midnight zone, which animal is the hardest to see?',
    right: 'A deep red jelly with its lights off',
    wrong: [
      ['A fish with a bright glowing lure', 'lights-hide-dark', 'In total darkness, any light shows where you are.'],
      ['A fish with glowing spots along its sides', 'lights-hide-dark', 'In total darkness, any light shows where you are.'],
    ],
    explain: 'In total darkness, a red body looks black and cannot be seen. Lights would give an animal away.',
    hints: ['In total darkness, what can you see?', 'Only light shows in the dark. An animal with no lights, colored like the dark, is hidden.'],
    pic: { k: 'zones', mark: 'midnight' },
    model: 'colors',
  },
  {
    id: 'mid-no-shadows',
    tier: 3,
    ask: 'Twilight fish use belly lights to hide their shadows from hunters below. In the midnight zone, belly lights do not help with that. Why?',
    right: 'No light comes from above, so there are no shadows to hide',
    wrong: [
      ['The water is too cold for lights', 'wrong-reason', 'Living light works in cold water. The reason is the darkness above.'],
      ['There are no hunters down here', 'no-hunters', 'There are hunters, like the anglerfish.'],
    ],
    explain: 'A shadow needs light from above. In the midnight zone there is none, so there is no shadow to hide.',
    hints: ['When do you have a shadow?', 'A fish only looks dark against light from above. With no light above, there is nothing to hide.'],
    pic: { k: 'below', glow: true },
    model: 'below',
  },
  {
    id: 'mid-big-meal',
    tier: 3,
    ask: 'An anglerfish may find food only once in a long while. It has a huge mouth and a stretchy stomach. Why is that helpful?',
    right: 'It can eat a big meal whenever it finds one',
    wrong: [
      ['It can eat the plants down here', 'plants-deep', 'No plants grow in the dark.'],
      ['It can hold air to float', 'wrong-reason', 'Its stomach is for food, and deep fish have no air pockets.'],
    ],
    explain: 'When food is rare, a stretchy stomach lets an anglerfish eat a big meal, even an animal bigger than itself, and wait a long time for the next one.',
    hints: ['If you only ate once in a long while, how big would you want that meal to be?', 'A big mouth and a stretchy stomach mean no meal is too big.'],
    pic: animal('anglerfish'),
    model: 'card',
  },
  {
    id: 'mid-snow-ends',
    tier: 3,
    ask: 'Marine snow sinks from the sunlight zone all the way down. If no one eats it on the way, where does it end up?',
    right: 'On the sea floor, where it feeds animals there',
    wrong: [
      ['Back at the top', 'snow-up', 'Bits heavier than water sink. They do not float back up.'],
      ['It melts in the cold water', 'snow-literal', 'It is not real snow, so it does not melt.'],
    ],
    explain: 'Marine snow keeps sinking until it reaches the sea floor. Animals there, like sea cucumbers, eat it.',
    hints: ['Which way does marine snow go?', 'It keeps sinking until there is nowhere farther to go.'],
    pic: { k: 'snow' },
    model: 'zones',
  },
];

// ------------------------------------------------------------------ the deep sea floor and its hot vents

const VENT_CHAIN: ChainLink[] = ['chemicals', 'bacteria', 'tubeworm'];

const VENTS: QDef[] = [
  // level 1
  {
    id: 'vent-what',
    tier: 1,
    ask: 'On the deep sea floor, there are cracks where hot water gushes out. The water was heated deep inside Earth. What are these called?',
    right: 'Hot vents',
    wrong: [
      ['Underwater waterfalls', 'wrong-reason', 'Waterfalls fall down. This water shoots up, and it is hot.'],
      ['Coral reefs', 'zone-order', 'Reefs grow in shallow, sunny water, far above.'],
    ],
    explain: 'They are called hot vents, or hydrothermal vents. Hydro means water and thermal means heat.',
    hints: ['Hot water comes out of an opening. What do we call an opening that lets something out?', 'A vent is an opening. These ones let out hot water.'],
    pic: { k: 'vent' },
    model: 'card',
  },
  {
    id: 'vent-dark',
    tier: 1,
    ask: 'The hot vents are about 2,500 meters down. Does any sunlight reach them?',
    right: 'No. It is completely dark.',
    wrong: [
      ['Yes, a little', 'sun-deep', 'Sunlight is gone by about 1,000 meters.'],
      ['Yes, at noon', 'sun-deep', 'Even at noon, no sunlight gets this deep.'],
    ],
    explain: 'No sunlight reaches the deep sea floor. The vents are in the dark all the time.',
    hints: ['Where does the sunlight run out?', 'Sunlight is gone below about 1,000 meters. The vents are much deeper.'],
    pic: { k: 'zones', mark: 'vents' },
    model: 'zones',
  },
  {
    id: 'vent-worm-food',
    tier: 1,
    ask: 'Giant tube worms have no mouth and no stomach. Bacteria living inside them make their food. What do the bacteria use to make it?',
    right: 'Chemicals in the vent water',
    wrong: [
      ['Sunlight', 'chemo-sun', 'No sunlight reaches the vents. The bacteria use something else.'],
      ['Sand', 'food-from-soil', 'Sand is not food. Think about what comes out of the vent.'],
    ],
    explain: 'The bacteria make food from chemicals in the vent water. This is called chemosynthesis: making food from chemicals.',
    hints: ['What comes out of the vents along with the hot water?', 'Vent water is full of chemicals from inside Earth. The bacteria use them instead of sunlight.'],
    pic: animal('tubeworm'),
    model: 'chemo',
  },
  {
    id: 'vent-crab',
    tier: 1,
    ask: 'A yeti crab grows bacteria on its hairy arms, then eats them. What is the crab like?',
    right: 'A farmer, growing its own food',
    wrong: [
      ['A hunter that chases fish', 'diet-mixup', 'It mostly eats the bacteria it grows.'],
      ['A plant', 'crab-plant', 'A crab is an animal. It eats the bacteria on its arms.'],
    ],
    explain: 'The yeti crab farms bacteria on its hairy arms, waving them in the warm vent water to help them grow.',
    hints: ['A person who grows food to eat is called what?', 'The crab grows bacteria, then eats them. Like a farmer growing vegetables.'],
    pic: animal('yeticrab'),
    model: 'card',
  },
  {
    id: 'vent-shrimp-close',
    tier: 1,
    ask: 'Thousands of vent shrimp crowd onto the chimneys. Why do they stay so close to the vents?',
    right: 'That is where their food grows',
    wrong: [
      ['To get a suntan', 'sun-deep', 'There is no sunlight down here.'],
      ['To cook their food', 'wrong-reason', 'They eat bacteria, not cooked food.'],
    ],
    explain: 'Food-making bacteria grow where the vent water flows, so the shrimp crowd as close as they safely can.',
    hints: ['What do vent animals eat?', 'The bacteria need the vent chemicals, so they grow by the vents. The shrimp eat the bacteria.'],
    pic: animal('ventshrimp'),
    model: 'chemo',
  },
  {
    id: 'vent-floor-cold',
    tier: 1,
    ask: 'Away from the vents, the deep sea floor is about 4,000 meters down. What is the water like there?',
    right: 'Very cold, a little above freezing',
    wrong: [
      ['Warm, like a bath', 'warm-deep', 'The Sun warms only the top. Only right at the vents is it warm.'],
      ['Hot, like soup', 'warm-deep', 'Away from the vents, nothing heats the water.'],
    ],
    explain: 'The deep sea floor is about 2 °C, only a little above freezing. Only the water right by a vent is warm.',
    hints: ['Look at the temperature dial.', 'The Sun warms only the top. The deeper, the colder.'],
    pic: { k: 'dials', depth: 4000 },
    model: 'dials',
  },
  // level 2
  {
    id: 'vent-no-boil',
    tier: 2,
    ask: 'Water from a vent can be hotter than 350 °C, much hotter than boiling water in a pot. Why doesn’t it boil?',
    right: 'The huge pressure stops it from boiling',
    wrong: [
      ['It is not really hot', 'wrong-reason', 'It really is that hot, right at the vent.'],
      ['The cold sea cools it at once', 'wrong-reason', 'Right at the vent it is still very hot. The pressing is the reason.'],
    ],
    explain: 'All the water above presses down so hard that the vent water cannot turn into bubbles, so it does not boil.',
    hints: ['What is very strong this deep?', 'Boiling makes bubbles. Strong enough pressing stops the bubbles from forming.'],
    pic: { k: 'vent' },
    model: 'dials',
  },
  {
    id: 'vent-chimney',
    tier: 2,
    ask: 'When hot vent water meets the icy sea, minerals in it turn solid. Over time they pile up into tall chimneys. What are the chimneys made of?',
    right: 'Minerals from the vent water',
    wrong: [
      ['Coral', 'zone-order', 'Coral grows only in shallow, sunny water.'],
      ['Ice', 'wrong-reason', 'The sea is cold, but above freezing, and the vent water is hot.'],
    ],
    explain: 'The chimneys are built from minerals that were dissolved in the hot water. They turn solid when the water cools.',
    hints: ['Read the question again. What turns solid?', 'Hot water can carry dissolved minerals. When it cools, they come out and pile up.'],
    pic: { k: 'vent' },
    model: 'card',
  },
  {
    id: 'vent-which-chain',
    tier: 2,
    ask: 'Vent bacteria make food from chemicals instead of sunlight. Which one is a food chain at a hot vent?',
    right: 'Chemicals, then bacteria, then tube worms',
    wrong: [
      ['Sun, then seaweed, then fish', 'chemo-sun', 'That chain starts with sunlight, and there is none at the vents.'],
      ['Tube worms, then bacteria, then chemicals', 'chain-backward', 'That chain is backward. What comes first?'],
    ],
    explain: 'At the vents, the food chain starts with chemicals, not sunlight. Bacteria use them, and animals eat or host the bacteria.',
    hints: ['Look at the two chains. Which one could work in the dark?', 'A food chain starts with whatever makes the food. At the vents, that is bacteria using chemicals.'],
    pic: { k: 'chemo' },
    model: 'chemo',
  },
  {
    id: 'vent-red-plume',
    tier: 2,
    ask: 'A giant tube worm’s top is bright red. It is full of blood, like ours. What does the red top do?',
    right: 'Takes in chemicals and oxygen from the water for its bacteria',
    wrong: [
      ['Catches small fish', 'diet-mixup', 'Tube worms have no mouth. The red top takes things in from the water.'],
      ['Glows to light the vents', 'structure-function', 'The red top does not glow. Its blood takes things in from the water.'],
    ],
    explain: 'The red top works like gills. Its blood picks up chemicals and oxygen from the water and carries them to the bacteria inside.',
    hints: ['What do the bacteria inside the worm need?', 'The bacteria need chemicals and oxygen from the water. Something has to collect them.'],
    pic: animal('tubeworm'),
    model: 'chemo',
  },
  {
    id: 'vent-found',
    tier: 2,
    ask: 'Hot vents were first found in 1977 by scientists in a small submarine. Before that, many people thought the deep sea floor was almost empty. What did they find around the vents?',
    right: 'Crowds of animals',
    wrong: [
      ['Nothing at all', 'deep-empty', 'They were amazed: the vents were crowded with life.'],
      ['Plants growing in the dark', 'plants-deep', 'Plants cannot grow without sunlight.'],
    ],
    explain: 'They found crowds of tube worms, clams, crabs and shrimp. Life was thriving with no sunlight at all.',
    hints: ['Think of the animals Finn photographed at the vents.', 'Tube worms, crabs and shrimp: the vents are busy places.'],
    pic: { k: 'vent' },
    model: 'card',
  },
  {
    id: 'vent-not-inside',
    tier: 2,
    ask: 'Finn took a water sample right next to a vent. It was hot, but a short way off it was icy again. Why do animals live close to the vent, but not inside it?',
    right: 'Close by is warm and full of food, but the vent itself is far too hot',
    wrong: [
      ['They are not allowed inside', 'wrong-reason', 'Nobody stops them. Think about the temperature.'],
      ['It is too bright inside', 'wrong-reason', 'Vents are dark. The problem is the heat.'],
    ],
    explain: 'Right at the vent the water is hot enough to cook an animal. A little way off it is just warm, and full of food-making bacteria.',
    hints: ['What did the temperature dial show at the vent, and a little way off?', 'Too hot right inside, icy far away, and just right close by.'],
    pic: { k: 'dials', depth: 2600 },
    model: 'dials',
  },
  // level 3
  {
    id: 'vent-special',
    tier: 3,
    ask: 'Almost every food chain on Earth starts with sunlight. Why are the animals at hot vents special?',
    right: 'Their food chain starts with chemicals, not sunlight',
    wrong: [
      ['They don’t need food', 'no-food', 'Every animal needs food.'],
      ['They eat sunlight that sinks down', 'light-carried', 'Sunlight cannot sink down to the sea floor.'],
    ],
    explain: 'Vent animals live on food made from chemicals by bacteria. They are one of the few kinds of life on Earth that do not depend on sunlight.',
    hints: ['Where does the energy for most life come from?', 'Most food chains start with plants using sunlight. At the vents, bacteria use chemicals instead.'],
    pic: { k: 'chemo' },
    model: 'chemo',
  },
  {
    id: 'vent-old-worm',
    tier: 3,
    ask: 'Giant tube worms at hot vents grow fast. A different kind of tube worm lives at cold seeps, where chemicals leak out slowly. It grows very slowly. About how long can it live?',
    right: 'Around 250 years',
    wrong: [
      ['About 1 year', 'wrong-reason', 'Animals that grow very slowly often live a very long time.'],
      ['Forever', 'wrong-reason', 'No animal lives forever, but this one lives a very long time.'],
    ],
    explain: 'Tube worms at cold seeps grow so slowly that some may live about 250 years. They are among the longest-living animals.',
    hints: ['Slow growing usually goes with a long life. Think of trees that grow slowly.', 'It is far longer than a person lives: hundreds of years.'],
    pic: animal('tubeworm'),
    model: 'card',
  },
  {
    id: 'vent-floor-food',
    tier: 3,
    ask: 'Away from the vents, the deep sea floor has no plants and no vent chemicals. What do most animals there eat?',
    right: 'Marine snow and other food that sinks from above',
    wrong: [
      ['Plants that grow in the mud', 'plants-deep', 'No plants grow in the dark.'],
      ['Sunlight', 'sun-deep', 'No sunlight reaches the sea floor.'],
    ],
    explain: 'Most sea floor animals eat marine snow, and sometimes a feast: a whale or a big fish that sinks from above.',
    hints: ['Where did marine snow end up?', 'Food that is not eaten on the way down lands on the sea floor.'],
    pic: { k: 'snow' },
    model: 'snow',
  },
  {
    id: 'vent-shrimp-glow',
    tier: 3,
    ask: 'Vent shrimp have no regular eyes. A shiny patch on their backs may sense the faint glow of hot vents. Why would that help?',
    right: 'It helps them find the vents without getting too close',
    wrong: [
      ['It helps them see the Sun', 'sun-deep', 'There is no sunlight down here.'],
      ['It keeps them warm', 'structure-function', 'A patch that senses light does not make heat.'],
    ],
    explain: 'Very hot vent water gives off a faint glow. Sensing it may help the shrimp stay near their food without being cooked.',
    hints: ['What do the shrimp need to stay close to, but not too close to?', 'The glow shows where the vent is, so they can stay at a safe distance.'],
    pic: animal('ventshrimp'),
    model: 'card',
  },
  {
    id: 'vent-heat',
    tier: 3,
    ask: 'Hot vents are found where the sea floor is slowly pulling apart. Sea water sinks into the cracks and is heated far below. Where does the heat come from?',
    right: 'Hot rock deep inside Earth',
    wrong: [
      ['The Sun', 'sun-deep', 'The Sun’s warmth stays near the top of the sea.'],
      ['The animals', 'wrong-reason', 'The animals use the warmth. They do not make it.'],
    ],
    explain: 'Deep inside Earth, the rock is very hot. Water that seeps into the cracks is heated, then gushes back out of the vents.',
    hints: ['The water sinks down into cracks. What is down there?', 'Earth is very hot inside. That heat warms the water.'],
    pic: { k: 'vent' },
    model: 'card',
  },
  {
    id: 'vent-stops',
    tier: 3,
    ask: 'If a vent stops gushing, the chemicals stop too. What happens to the tube worms there?',
    right: 'They lose their food and die off',
    wrong: [
      ['Nothing. They use sunlight instead.', 'chemo-sun', 'There is no sunlight down here to use.'],
      ['They walk to another vent', 'wrong-reason', 'Tube worms live fixed in their tubes. They cannot travel.'],
    ],
    explain: 'With no chemicals, the bacteria cannot make food, and the tube worms starve. New vents open elsewhere, and new animals settle there.',
    hints: ['What do the bacteria need to make food?', 'No chemicals means no food for the bacteria, and so no food for the worms.'],
    pic: { k: 'chain', links: VENT_CHAIN },
    model: 'chemo',
  },
];

// ------------------------------------------------------------------ the Trench Dive's extra questions (one per checkpoint)

/**
 * Checkpoint questions that belong to no logbook: two facts the old game
 * got wrong at the top (the shark myth, the man-of-war), and the trench at
 * the bottom (the deepest fish, Mount Everest, the pressure).
 */
export const TRENCH_EXTRAS: { top: QDef[]; bottom: QDef[] } = {
  top: [
    {
      id: 'trench-shark',
      tier: 2,
      ask: 'Sharks have a great sense of smell. People say a shark can smell one drop of blood from miles away. Is that true?',
      right: 'No. Sharks smell well, but over a much shorter distance.',
      wrong: [
        ['Yes, from anywhere in the ocean', 'shark-myth', 'Smells spread slowly in water. "Miles away" is a myth.'],
        ['Sharks cannot smell at all', 'shark-myth', 'Sharks smell very well, just not from miles away.'],
      ],
      explain: 'It is a myth. Sharks can smell tiny amounts, but smells spread slowly in water, so it works over a much shorter distance.',
      hints: ['Think of a drop of food coloring in a bath. How fast does it spread?', 'Smells spread slowly in water. A shark has to be fairly close.'],
      pic: zones('sunlight'),
      model: 'zones',
    },
    {
      id: 'trench-man-of-war',
      tier: 2,
      ask: 'A Portuguese man-of-war has a gas-filled float, like a little sail. Where does it live?',
      right: 'At the very top of the sea, floating on the surface',
      wrong: [
        ['In the twilight zone', 'zone-order', 'Its float keeps it right at the top.'],
        ['On the deep sea floor', 'zone-order', 'Its float keeps it right at the top.'],
      ],
      explain: 'The man-of-war floats on the surface, pushed along by the wind. Its long stinging tentacles hang down below.',
      hints: ['What does a float do?', 'A float filled with gas stays at the top, like a balloon.'],
      pic: zones('sunlight'),
      model: 'zones',
    },
  ],
  bottom: [
    {
      id: 'trench-deepest-fish',
      tier: 2,
      ask: 'Trenches are the deepest places in the ocean. In 2023, scientists filmed a snailfish deeper than any fish seen before. About how deep was it?',
      right: 'About 8,300 meters',
      wrong: [
        ['About 100 meters', 'zone-order', 'That is still the sunlight zone. It was far, far deeper.'],
        ['About 20,000 meters', 'trench-depth', 'The deepest trench is only about 11,000 meters deep.'],
      ],
      explain: 'The snailfish was filmed 8,336 meters down, in a trench near Japan. It is the deepest fish ever seen.',
      hints: ['The deepest trench is about 11,000 meters. Could a fish be deeper than that?', 'It was very deep, but still above the bottom of the deepest trench.'],
      pic: { k: 'depthbar' },
      model: 'everest',
    },
    {
      id: 'trench-everest',
      tier: 2,
      ask: 'The deepest trench goes down about 11,000 meters. Mount Everest, the tallest mountain, is about 8,800 meters tall. If Everest sat on the trench floor, what would happen?',
      right: 'Its top would still be under water',
      wrong: [
        ['Its top would stick out of the sea', 'trench-depth', 'The trench is deeper than Everest is tall.'],
        ['It would float up', 'wrong-reason', 'Mountains are rock. They do not float.'],
      ],
      explain: 'The trench is about 2,000 meters deeper than Everest is tall, so even its peak would be deep under water.',
      hints: ['Which number is bigger: 11,000 or 8,800?', 'The trench is deeper than Everest is tall.'],
      pic: { k: 'depthbar' },
      model: 'everest',
    },
    {
      id: 'trench-pressure',
      tier: 2,
      ask: 'At the bottom of the deepest trench, the water presses about 1,100 times harder than the air at the top. What lets a snailfish live there?',
      right: 'A soft body with no air pockets',
      wrong: [
        ['A hard shell, like a tank', 'wrong-reason', 'Snailfish are soft and jelly-like.'],
        ['It pushes the water away', 'pressure-push', 'No animal could push back that much water.'],
      ],
      explain: 'A soft body full of water, with no air pockets, cannot be squashed. That is how the snailfish lives so deep.',
      hints: ['Think of the water balloon and the air balloon.', 'Air squashes easily. Water hardly squashes at all.'],
      pic: { k: 'dials', depth: 10900 },
      model: 'dials',
    },
  ],
};

const BANKS: Record<Station, QDef[]> = { sunlight: SUNLIGHT, twilight: TWILIGHT, midnight: MIDNIGHT, vents: VENTS };

// ------------------------------------------------------------------ making a question

export type Rand = () => number;

export function shuffle<T>(r: Rand, list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1)) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function bank(s: Station): QDef[] {
  return BANKS[s];
}

export function build(station: Station, d: QDef, r: Rand): Question {
  const choices: Choice[] = shuffle(r, [
    { value: 'right', label: d.right, correct: true },
    ...d.wrong.map(([label, misconception, why], i) => ({ value: `wrong${i}`, label, correct: false, misconception, why })),
  ]);
  return { id: d.id, station, tier: d.tier, ask: d.ask, choices, explain: d.explain, hints: d.hints, pic: d.pic, model: d.model };
}

/** A question at this level, avoiding the ones seen lately. */
export function makeQuestion(s: Station, tier: Tier, r: Rand, recent: readonly string[] = []): Question {
  const pool = bank(s).filter((d) => d.tier === tier);
  if (!pool.length) throw new Error(`No questions for ${s} at level ${tier}`);
  const fresh = pool.filter((d) => !recent.includes(d.id));
  const from = fresh.length ? fresh : pool;
  return build(s, from[Math.floor(r() * from.length) % from.length], r);
}
