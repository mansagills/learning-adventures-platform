/**
 * Ocean Depth Diver: the science, as data and pure functions (no drawing, no
 * timers) so every rule can be unit tested.
 *
 * Each expedition ends at Dr. Lani's logbook, a set of questions at three
 * levels. Half 1 has two:
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

export type Station = 'sunlight' | 'twilight';
export const STATIONS: Station[] = ['sunlight', 'twilight'];
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
  | 'pressure-push'; // thinks deep animals push the water away

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
  | { k: 'migrate' };

export type ChainLink = 'sun' | 'plankton' | 'smallfish' | 'bigfish' | 'seagrass' | 'turtle' | 'lanternfish';

/** The picture model that hint 2 adds (or that changes the picture itself). */
export type Model = 'zones' | 'chain' | 'colors' | 'below' | 'migrate' | 'dials' | 'card';

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

const BANKS: Record<Station, QDef[]> = { sunlight: SUNLIGHT, twilight: TWILIGHT };

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

function build(station: Station, d: QDef, r: Rand): Question {
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
