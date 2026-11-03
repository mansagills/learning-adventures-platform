/**
 * Animal Kingdom Match: the animals of the habitat trips and the four
 * habitats, as data (no drawing), so every rule can be unit tested.
 *
 * Each animal has two facts for its Ranger Journal card, a line for Kiki's
 * help ("Look up! High in a big tree on the left."), what it needs from its
 * home, what its home gives it (food, water, shelter or space) and one body
 * part that helps it live there. The Rescue Center builds its questions from
 * these.
 *
 * Facts checked against the plan (the S3 section of
 * docs/GAMES_3D_UPGRADE_PLAN.md): a camel's hump stores fat, not water; a
 * sloth's green comes from algae growing in its fur (it cannot choose it);
 * a poison dart frog's bright color is a warning; penguins live in the south
 * and polar bears in the north.
 */

import type { Habitat } from '../../kit/worlds/wild-lands/animal-art';
import { DESERT_ANIMALS, POLAR_ANIMALS, RAINFOREST_ANIMALS, WETLAND_ANIMALS, type Critter, type HabitatAnimal } from '../../kit/worlds/wild-lands/habitats';

export type { Habitat };
export type Layer = 'floor' | 'understory' | 'canopy';

export interface AnimalInfo {
  id: Critter;
  /** Its name on its card ("Spider monkey"). */
  name: string;
  /** Its name inside a sentence ("the spider monkey"). */
  the: string;
  home: Habitat;
  /** The rainforest layer it lives in (rainforest animals only). */
  layer?: Layer;
  /** Kiki's help: where to look in the habitat scene. */
  where: string;
  facts: [string, string];
  /** What it needs from a home, finishing "The camel needs ...". */
  needs: string;
  /** What its home gives it (the Rescue Center's level 2 step). */
  gives: string;
  /** A body part that helps it live there (the Rescue Center's level 3 step). */
  part: string;
  /** At the Poles: the Arctic (north) or Antarctica (south). */
  side?: 'north' | 'south';
  /** In the wetland: fresh water (pond and river) or salt water (the sea). */
  water?: 'fresh' | 'salt';
}

export const ANIMALS: Partial<Record<Critter, AnimalInfo>> = {
  // ---------------------------------------------------------------- the rainforest
  jaguar: {
    id: 'jaguar',
    name: 'Jaguar',
    the: 'the jaguar',
    home: 'rainforest',
    layer: 'floor',
    where: 'Look low down on the right, past the stream. Something spotty is resting there.',
    facts: ['Jaguars are the biggest wild cats in the Americas.', 'Most cats stay out of water, but jaguars love to swim.'],
    needs: 'a big forest with rivers and animals to hunt',
    gives: 'Thick forest to hide in and animals to hunt',
    part: 'Spotted fur that blends into the shade',
  },
  tapir: {
    id: 'tapir',
    name: 'Tapir',
    the: 'the tapir',
    home: 'rainforest',
    layer: 'floor',
    where: 'Look down on the forest floor, at the bottom on the left.',
    facts: ['A tapir’s nose is short and bendy, like a small trunk.', 'Tapirs eat leaves and fruit, and cool off in streams and ponds.'],
    needs: 'lots of plants to eat and water to cool off in',
    gives: 'Leaves and fruit to eat, and streams to cool off in',
    part: 'A bendy nose for grabbing leaves',
  },
  'dart-frog': {
    id: 'dart-frog',
    name: 'Poison dart frog',
    the: 'the poison dart frog',
    home: 'rainforest',
    layer: 'floor',
    where: 'Look on the wet ground just past the stream, in the middle. It is small and very blue.',
    facts: ['Its bright blue skin warns other animals: do not eat me!', 'It is smaller than your thumb.'],
    needs: 'warm, damp ground with tiny bugs to eat',
    gives: 'Damp leaves to hide in and tiny bugs to eat',
    part: 'Bright colors that warn hunters away',
  },
  frog: {
    id: 'frog',
    name: 'Red-eyed tree frog',
    the: 'the red-eyed tree frog',
    home: 'rainforest',
    layer: 'understory',
    where: 'Look by the stream, a little to the right. It is green, with big red eyes.',
    facts: ['By day it sleeps on a leaf with its eyes shut, and its green body is hard to see.', 'Sticky pads on its toes help it hold on to wet leaves.'],
    needs: 'wet leaves and plants near water',
    gives: 'Wet leaves to rest on and bugs to eat',
    part: 'Sticky toe pads for climbing',
  },
  monkey: {
    id: 'monkey',
    name: 'Spider monkey',
    the: 'the spider monkey',
    home: 'rainforest',
    layer: 'canopy',
    where: 'Look up! High in a big tree on the left.',
    facts: ['It can hang by its tail and use both hands to pick fruit.', 'Spider monkeys live high in the trees and rarely come down to the ground.'],
    needs: 'tall trees full of fruit',
    gives: 'Fruit to eat and tall trees to swing in',
    part: 'A long tail that can hold on to branches',
  },
  sloth: {
    id: 'sloth',
    name: 'Three-toed sloth',
    the: 'the sloth',
    home: 'rainforest',
    layer: 'canopy',
    where: 'Look up! Hanging in a tall tree on the right.',
    facts: ['A sloth moves so slowly that tiny green plants called algae grow in its fur.', 'The green helps the sloth hide among the leaves.'],
    needs: 'tall trees with leaves to eat',
    gives: 'Leaves to eat and tall trees to hang in',
    part: 'Long, hooked claws for hanging',
  },
  toucan: {
    id: 'toucan',
    name: 'Keel-billed toucan',
    the: 'the toucan',
    home: 'rainforest',
    layer: 'canopy',
    where: 'Look up! At the top of a tree, far on the left.',
    facts: ['A toucan’s big bill is light, not heavy. It reaches fruit at the ends of thin branches.', 'Toucans nest in holes in trees.'],
    needs: 'tall trees with fruit and holes to nest in',
    gives: 'Fruit to eat and tree holes to nest in',
    part: 'A long, light bill for reaching fruit',
  },
  // ---------------------------------------------------------------- the desert
  camel: {
    id: 'camel',
    name: 'Camel',
    the: 'the camel',
    home: 'desert',
    where: 'Look out on the open sand, on the left. It is big!',
    facts: ['A camel’s hump stores fat, not water. The fat is food for long trips.', 'Camels can go many days without a drink.'],
    needs: 'dry, sandy ground and tough plants to eat',
    gives: 'Open sandy land and tough plants to eat',
    part: 'A hump of fat and wide feet for the sand',
  },
  fennec: {
    id: 'fennec',
    name: 'Fennec fox',
    the: 'the fennec fox',
    home: 'desert',
    where: 'Look far on the left, near a cactus. Watch for giant ears.',
    facts: ['Its giant ears let heat out of its body, which helps it stay cool.', 'Fennec foxes sleep in cool burrows by day and hunt at night.'],
    needs: 'sand to dig burrows in and bugs to hunt',
    gives: 'Sand to dig cool burrows in and bugs to hunt',
    part: 'Giant ears that let out heat',
  },
  gecko: {
    id: 'gecko',
    name: 'Gecko',
    the: 'the gecko',
    home: 'desert',
    where: 'Look near the back, by a cactus on the right. It is small and sandy colored.',
    facts: ['Many geckos hide from the sun by day and hunt bugs at night.', 'Some geckos lick their own eyes to keep them clean!'],
    needs: 'rocks to hide under and bugs to eat',
    gives: 'Rocks for shade and bugs to eat',
    part: 'Big eyes for seeing at night',
  },
  tortoise: {
    id: 'tortoise',
    name: 'Desert tortoise',
    the: 'the desert tortoise',
    home: 'desert',
    where: 'Look in the middle, near a little round cactus.',
    facts: ['Desert tortoises dig burrows to get away from the heat and the cold.', 'They get most of their water from the plants they eat.'],
    needs: 'soft ground to dig in and desert plants to eat',
    gives: 'Soft ground for burrows and plants to eat',
    part: 'Strong front legs for digging',
  },
  roadrunner: {
    id: 'roadrunner',
    name: 'Roadrunner',
    the: 'the roadrunner',
    home: 'desert',
    where: 'Look far on the right, near the bottom.',
    facts: ['A roadrunner would rather run than fly. It can run as fast as a bicycle.', 'It eats lizards, bugs and even small snakes.'],
    needs: 'open ground to run on and lizards to catch',
    gives: 'Open ground to run on and lizards to catch',
    part: 'Long, strong legs for running',
  },
  // ---------------------------------------------------------------- the Poles (the Arctic on the left, Antarctica on the right)
  'polar-bear': {
    id: 'polar-bear',
    name: 'Polar bear',
    the: 'the polar bear',
    home: 'poles',
    side: 'north',
    where: 'Look on the snow near the bottom of the Arctic side, on the left. It is big and white.',
    facts: ['Polar bears live only in the Arctic, at the top of the world.', 'Under its white fur, a polar bear’s skin is black. Dark skin soaks up the sun’s warmth.'],
    needs: 'freezing cold, with sea ice to hunt seals from',
    gives: 'Sea ice to hunt from and seals to eat',
    part: 'Thick fur and a layer of fat called blubber',
  },
  'arctic-fox': {
    id: 'arctic-fox',
    name: 'Arctic fox',
    the: 'the Arctic fox',
    home: 'poles',
    side: 'north',
    where: 'Look far on the left, on the snow of the Arctic side.',
    facts: ['Its fur is white in winter and brown in summer, so it always blends in.', 'Small ears and a big bushy tail help it keep warm.'],
    needs: 'cold, snowy land with small animals to hunt',
    gives: 'Snowy land to hide in and lemmings to hunt',
    part: 'Thick winter fur and small ears',
  },
  walrus: {
    id: 'walrus',
    name: 'Walrus',
    the: 'the walrus',
    home: 'poles',
    side: 'north',
    where: 'Look near the water, in the middle of the Arctic side.',
    facts: ['A walrus hooks its long tusks on the ice to pull itself out of the water.', 'Thick blubber keeps it warm in icy water.'],
    needs: 'icy water with clams on the sea floor',
    gives: 'Icy water full of clams and ice to rest on',
    part: 'Long tusks and thick blubber',
  },
  'snowy-owl': {
    id: 'snowy-owl',
    name: 'Snowy owl',
    the: 'the snowy owl',
    home: 'poles',
    side: 'north',
    where: 'Look far on the left, near the top of the Arctic side.',
    facts: ['In the Arctic summer the sun never sets, so snowy owls hunt in daylight too.', 'Feathers cover even its feet, like warm slippers.'],
    needs: 'open, snowy land with lemmings to catch',
    gives: 'Open, snowy land and lemmings to catch',
    part: 'Feathers all the way down to its toes',
  },
  penguin: {
    id: 'penguin',
    name: 'Emperor penguin',
    the: 'the emperor penguin',
    home: 'poles',
    side: 'south',
    where: 'Sail south to Antarctica! The penguins stand together on the right.',
    facts: ['Emperor penguins live in Antarctica, at the bottom of the world. No wild penguins live in the Arctic.', 'Its wings are flippers. Penguins cannot fly, but they swim very fast.'],
    needs: 'icy southern seas full of fish',
    gives: 'Icy seas full of fish and ice to nest on',
    part: 'Wings shaped like flippers for swimming',
  },
  seal: {
    id: 'seal',
    name: 'Weddell seal',
    the: 'the Weddell seal',
    home: 'poles',
    side: 'south',
    where: 'Sail south to Antarctica! It is lying on the ice near the bottom right.',
    facts: ['Weddell seals live farther south than any other mammal.', 'They keep breathing holes in the ice open by scraping them with their teeth.'],
    needs: 'icy southern water with fish to catch',
    gives: 'Icy water with fish, and ice to rest on',
    part: 'Blubber and flippers for swimming',
  },
  // ---------------------------------------------------------------- the wetland and the sea
  beaver: {
    id: 'beaver',
    name: 'Beaver',
    the: 'the beaver',
    home: 'wetland',
    water: 'fresh',
    where: 'Look by the pond, next to the beaver lodge in the middle.',
    facts: ['Beavers build dams of sticks and mud across streams. The dam makes a pond.', 'Their home, called a lodge, has an underwater door to keep them safe.'],
    needs: 'a stream or pond with trees nearby',
    gives: 'Fresh water and trees to eat and build with',
    part: 'Strong front teeth for cutting wood',
  },
  duck: {
    id: 'duck',
    name: 'Mallard duck',
    the: 'the duck',
    home: 'wetland',
    water: 'fresh',
    where: 'Look on the pond, a little to the left.',
    facts: ['A duck’s feathers are waterproof, so it stays dry even in the water.', 'Webbed feet push the duck along like paddles.'],
    needs: 'a calm pond with plants and bugs to eat',
    gives: 'Calm fresh water with plants and bugs',
    part: 'Webbed feet and waterproof feathers',
  },
  heron: {
    id: 'heron',
    name: 'Great blue heron',
    the: 'the heron',
    home: 'wetland',
    water: 'fresh',
    where: 'Look at the edge of the water, far on the left.',
    facts: ['A heron stands very still in shallow water, then grabs a fish with its sharp bill.', 'Long legs let it wade without getting its feathers wet.'],
    needs: 'shallow water with fish and frogs to catch',
    gives: 'Shallow water full of fish to catch',
    part: 'Long legs for wading and a sharp bill',
  },
  crocodile: {
    id: 'crocodile',
    name: 'Crocodile',
    the: 'the crocodile',
    home: 'wetland',
    water: 'fresh',
    where: 'Look by the river, near the bottom in the middle.',
    facts: ['A crocodile can lie in the water with just its eyes and nose showing.', 'Crocodiles lay their eggs in a nest on land.'],
    needs: 'a warm river or swamp with fish to catch',
    gives: 'A warm river to hide in and fish to catch',
    part: 'Eyes and nose on top of its head',
  },
  dolphin: {
    id: 'dolphin',
    name: 'Bottlenose dolphin',
    the: 'the dolphin',
    home: 'wetland',
    water: 'salt',
    where: 'Walk to the beach on the right and look out to sea.',
    facts: ['Dolphins are mammals. They breathe air through a blowhole on top of their heads.', 'Dolphins live in groups called pods and talk with clicks and whistles.'],
    needs: 'salty sea water with fish to catch',
    gives: 'The open sea, full of fish',
    part: 'A blowhole for breathing air at the surface',
  },
  whale: {
    id: 'whale',
    name: 'Humpback whale',
    the: 'the humpback whale',
    home: 'wetland',
    water: 'salt',
    where: 'Walk to the beach on the right. Look far out to sea, near the bottom.',
    facts: ['A humpback whale is a mammal, not a fish. It comes up to breathe air.', 'Humpbacks swim thousands of kilometers each year, from cold seas to warm ones.'],
    needs: 'a huge, salty ocean with tiny krill to eat',
    gives: 'The huge ocean, full of krill',
    part: 'A blowhole and flippers as long as a car',
  },
};

/** One animal's info (every critter on a trip has some). */
export function animal(id: Critter): AnimalInfo {
  const a = ANIMALS[id];
  if (!a) throw new Error(`No animal info for ${id}`);
  return a;
}

/** The first word capitalized ("the camel" → "The camel"). */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface HabitatInfo {
  id: Habitat;
  name: string;
  /** Its name inside a sentence ("the rainforest"). */
  the: string;
  /** One short line about it, used when an animal is taken to the wrong home. */
  is: string;
  /** The weather and the land, for the map picture's caption. */
  short: string;
  /** Built and open to play (all four since half 2). */
  open: boolean;
}

export const HABITAT_INFO: Record<Habitat, HabitatInfo> = {
  rainforest: {
    id: 'rainforest',
    name: 'The Rainforest',
    the: 'the rainforest',
    is: 'The rainforest is warm and wet all year, with tall trees everywhere.',
    short: 'Warm, wet, tall trees',
    open: true,
  },
  desert: { id: 'desert', name: 'The Desert', the: 'the desert', is: 'The desert is very dry, with sand, rocks and very little rain.', short: 'Dry, sandy, little rain', open: true },
  poles: { id: 'poles', name: 'The Poles', the: 'the Poles', is: 'The Poles are freezing cold, with ice and snow.', short: 'Freezing, icy, snowy', open: true },
  wetland: { id: 'wetland', name: 'The Wetland and Sea', the: 'the wetland', is: 'The wetland is full of water: a pond, a river and the sea.', short: 'Ponds, rivers, the sea', open: true },
};

/** The trips, in order (each opens when the one before it is done). */
export type Trip = 'rainforest' | 'desert' | 'poles' | 'wetland';
export const TRIPS: Trip[] = ['rainforest', 'desert', 'poles', 'wetland'];
/** The trips that can be played (all four since half 2). */
export const OPEN_TRIPS: Trip[] = TRIPS.filter((t) => HABITAT_INFO[t].open);

/**
 * The animals to spot on each trip, in the order they stand in the scene:
 * each kind once (the penguin group counts as one), and only the trip's own
 * animals (the wetland's tree frog is in the rainforest's journal page).
 */
const own = (t: Trip, list: readonly HabitatAnimal[]) => list.filter((a, i, all) => all.findIndex((b) => b.who === a.who) === i && ANIMALS[a.who]?.home === t);
export const TRIP_ANIMALS: Record<Trip, readonly HabitatAnimal[]> = {
  rainforest: own('rainforest', RAINFOREST_ANIMALS),
  desert: own('desert', DESERT_ANIMALS),
  poles: own('poles', POLAR_ANIMALS),
  wetland: own('wetland', WETLAND_ANIMALS),
};

/** The kinds of animal to spot on a trip. */
export function toSpot(t: Trip): Critter[] {
  return TRIP_ANIMALS[t].map((a) => a.who);
}

/** Every animal of the open trips, in Ranger Journal order. */
export const JOURNAL_ORDER: Critter[] = OPEN_TRIPS.flatMap(toSpot);

/** Where Kiki tells you to look for a spotted animal's habitat-mates. */
export const RAINFOREST_LAYERS: Record<Layer, { name: string; is: string }> = {
  canopy: { name: 'The canopy', is: 'The top layer: sunny treetops full of fruit.' },
  understory: { name: 'The understory', is: 'The middle layer: shady, with small trees and big leaves.' },
  floor: { name: 'The forest floor', is: 'The bottom layer: dark and damp, covered in fallen leaves.' },
};
