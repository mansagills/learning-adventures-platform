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
  /** Opened in this half of the game (the Poles and the Wetland come in half 2). */
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
  poles: { id: 'poles', name: 'The Poles', the: 'the Poles', is: 'The Poles are freezing cold, with ice and snow.', short: 'Freezing, icy, snowy', open: false },
  wetland: { id: 'wetland', name: 'The Wetland and Sea', the: 'the wetland', is: 'The wetland is full of water: a pond, a river and the sea.', short: 'Ponds, rivers, the sea', open: false },
};

/** The trips, in order (each opens when the one before it is done). */
export type Trip = 'rainforest' | 'desert' | 'poles' | 'wetland';
export const TRIPS: Trip[] = ['rainforest', 'desert', 'poles', 'wetland'];
/** The trips built so far (half 1). */
export const OPEN_TRIPS: Trip[] = TRIPS.filter((t) => HABITAT_INFO[t].open);

/** The animals to spot on each trip, in the order they stand in the scene (penguins counted once). */
export const TRIP_ANIMALS: Record<Trip, readonly HabitatAnimal[]> = {
  rainforest: RAINFOREST_ANIMALS,
  desert: DESERT_ANIMALS,
  poles: POLAR_ANIMALS.filter((a, i, all) => all.findIndex((b) => b.who === a.who) === i),
  wetland: WETLAND_ANIMALS,
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
