/**
 * Ecosystem Building Tycoon: the Field Notebook questions, as data and pure
 * functions so every question can be unit tested.
 *
 * Questions come between milestones (at the research choice) and in the
 * Field Notebook at the ranger station, never while placing tiles. Each
 * island type has three levels:
 *
 *   The Meadow (Lupe Fonoti): producers and the Sun
 *     1. plants make their own food from sunlight, water and air; animals
 *        cannot; plant-eaters; plants need light (5-LS1-1, 5-PS3-1)
 *     2. the energy in every animal's food came from the Sun; plants are
 *        not fed by the soil; plants compete for light, water and space;
 *        meat-eaters and plant-eaters
 *     3. bees and flowers need each other (pollination, seeds); what happens
 *        without bees; plants give off oxygen; the willow in the pot
 *        (3-LS4-3)
 *   The Pond (Theo Park): food chains and food webs
 *     1. who eats whom; the arrow points to the eater; every chain starts
 *        with a plant; plant-eaters, meat-eaters and omnivores (5-LS2-1)
 *     2. a food web is many chains joined; energy from the Sun; the top
 *        predator; an animal can be predator and prey
 *     3. take one living thing away and follow what changes: fewer frogs,
 *        more insects; no snails, green water (an algae bloom); why ponds
 *        need predators (3-LS4-4)
 *
 * Every wrong answer names the mistake behind it (a misconception tag) and
 * carries one plain sentence about it that does not give the answer away.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

import type { PieceId } from '../../kit/worlds/wild-lands/eco-art';
import type { IslandKind, Rand } from './rules';

export type Station = IslandKind;
export const STATIONS: Station[] = ['meadow', 'pond'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'plants-soil-food' // thinks plants get their food from the soil
  | 'plants-eat' // thinks plants eat, or must be fed, like animals
  | 'needs-mixup' // mixed up what a plant needs (light, water, air, space)
  | 'sun-not-energy' // forgot that the energy in food first came from the Sun
  | 'animals-make-food' // thinks animals can make their own food
  | 'role-mixup' // mixed up producer, plant-eater, meat-eater and omnivore
  | 'arrow-backwards' // reads a food chain arrow from the eater to the eaten
  | 'chain-starts-animal' // thinks a food chain starts with an animal
  | 'pollination-mixup' // thinks bees only take from flowers and do not help them
  | 'direct-only' // thinks a change only affects the living things that touch it directly
  | 'predators-bad' // thinks predators are bad for an ecosystem
  | 'more-is-better' // thinks more of an animal (or plant) is always better
  | 'web-mixup' // thinks each animal has only one food
  | 'wrong-reason'; // gave a reason that does not explain it

/** What the panel shows above the question (the words in the question match it). */
export type Pic =
  /** Tiles in a row, with arrows from each one to the next (the energy goes from the eaten to the eater) when `arrows` is true. The Sun comes first when `sun` is true. */
  | { k: 'chain'; ids: PieceId[]; arrows: boolean; sun?: boolean }
  /** What a plant needs: the Sun's light, water, air (and the space around it). */
  | { k: 'needs' }
  /** The pond's food web: lily pads and cattails, the snail, the fish, the frog, the duck and the heron, with arrows. */
  | { k: 'web'; gone?: PieceId }
  /** The willow in the pot: the tree grew by about 74 kilograms, the soil lost less than 1. */
  | { k: 'pot' }
  /** A plant in a dark cupboard next to one in the light. */
  | { k: 'dark' };

/** The picture model that hint 2 adds. */
export type Model = 'chain' | 'web' | 'needs' | 'fact';

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
  explain: string;
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

const chain = (ids: PieceId[], sun = false): Pic => ({ k: 'chain', ids, arrows: true, sun });
const tiles = (...ids: PieceId[]): Pic => ({ k: 'chain', ids, arrows: false });

// ------------------------------------------------------------------ The Meadow (Lupe Fonoti)

const MEADOW: QDef[] = [
  // level 1
  {
    id: 'm-make-food',
    tier: 1,
    ask: 'Grass has no mouth. It never eats. How does grass get its food?',
    right: 'It makes its own food, using sunlight',
    wrong: [
      ['It catches bugs to eat', 'plants-eat', 'Grass has no way to catch anything. It gets its food without eating at all.'],
      ['It sucks food out of the soil', 'plants-soil-food', 'Roots take in water from the soil, but the food itself is made in the leaves.'],
    ],
    explain: 'Plants make their own food in their leaves, using sunlight, water and air. That is why plants are called producers.',
    hints: ['What shines on the grass all day?', 'Look at what a plant needs: light, water and air.'],
    pic: { k: 'needs' },
    model: 'needs',
  },
  {
    id: 'm-producer',
    tier: 1,
    ask: 'Scientists call plants producers. To produce means to make. What do plants make?',
    right: 'Their own food',
    wrong: [
      ['Soil', 'wrong-reason', 'Soil is made when dead things break down, not by living plants.'],
      ['Animals', 'wrong-reason', 'Animals are born from other animals. Plants make something else.'],
    ],
    explain: 'Plants produce their own food from sunlight, water and air. Animals cannot do that, so they eat plants, or eat animals that ate plants.',
    hints: ['A plant never eats. So where does its food come from?', 'A plant uses sunlight, water and air to make something.'],
    pic: tiles('grass', 'flowers', 'berries'),
    model: 'needs',
  },
  {
    id: 'm-rabbit-food',
    tier: 1,
    ask: 'A rabbit cannot make its own food. How does a rabbit get the energy it needs?',
    right: 'By eating plants, like grass',
    wrong: [
      ['From the sunshine on its fur', 'animals-make-food', 'Sunshine warms a rabbit, but animals cannot turn sunlight into food.'],
      ['From the soil in its burrow', 'plants-soil-food', 'Rabbits do not eat soil. Look at what the rabbit is next to.'],
    ],
    explain: 'Animals get their energy by eating. A rabbit eats grass, and the grass made its food from sunlight.',
    hints: ['What is the rabbit nibbling?', 'Follow the arrow: grass, then rabbit.'],
    pic: chain(['grass', 'rabbit']),
    model: 'chain',
  },
  {
    id: 'm-needs',
    tier: 1,
    ask: 'A plant makes its own food in its leaves. What does it need to make it?',
    right: 'Sunlight, water and air',
    wrong: [
      ['Food from the soil', 'plants-soil-food', 'The soil gives a plant water and a few minerals, but not its food.'],
      ['Darkness and cold', 'needs-mixup', 'Plants grow badly in the dark and cold. Think of a sunny meadow.'],
    ],
    explain: 'A plant uses the energy in sunlight to turn water and air into food. That food is a kind of sugar.',
    hints: ['Think of three things a meadow gets for free from the sky.', 'Look at the picture: the Sun, the rain and the air.'],
    pic: { k: 'needs' },
    model: 'needs',
  },
  {
    id: 'm-herbivore',
    tier: 1,
    ask: 'A rabbit eats only plants. What kind of eater is a rabbit?',
    right: 'A plant-eater (herbivore)',
    wrong: [
      ['A meat-eater (carnivore)', 'role-mixup', 'A meat-eater eats other animals. A rabbit only nibbles plants.'],
      ['A producer', 'role-mixup', 'A producer makes its own food. A rabbit has to eat.'],
    ],
    explain: 'Animals that eat only plants are plant-eaters, or herbivores. Rabbits, deer and snails are herbivores.',
    hints: ['What does a rabbit eat?', 'Herbi means plant. Carni means meat.'],
    pic: chain(['grass', 'rabbit']),
    model: 'chain',
  },
  {
    id: 'm-dark',
    tier: 1,
    ask: 'Two bean plants get the same water. One sits in a dark cupboard for two weeks. One sits on a sunny window. What happens to the one in the dark?',
    right: 'It turns pale and weak',
    wrong: [
      ['It grows just as well. Plants only need water.', 'needs-mixup', 'Water is not enough. The plant in the dark is missing something.'],
      ['It grows bigger and greener', 'needs-mixup', 'Green leaves need light to stay green and make food.'],
    ],
    explain: 'Without light, a plant cannot make food. It uses up what it had stored, turns pale and grows weak.',
    hints: ['What does the plant in the cupboard not get?', 'A plant needs light to make its food.'],
    pic: { k: 'dark' },
    model: 'needs',
  },
  // level 2
  {
    id: 'm-energy-sun',
    tier: 2,
    ask: 'A fox eats a rabbit. The rabbit ate grass. Where did the fox’s energy first come from?',
    right: 'The Sun',
    wrong: [
      ['The rabbit', 'chain-starts-animal', 'The rabbit passed the energy on, but it did not make it. Go further back.'],
      ['The soil', 'plants-soil-food', 'The grass did not get its food from the soil. Go back to the very start.'],
    ],
    explain: 'The grass caught the Sun’s energy and stored it in its food. The rabbit ate the grass, and the fox ate the rabbit. All that energy came from the Sun.',
    hints: ['Follow the chain backwards: fox, rabbit, grass, then what?', 'Look at the start of the chain. What does the grass use to make its food?'],
    pic: chain(['grass', 'rabbit', 'fox'], true),
    model: 'chain',
  },
  {
    id: 'm-herb-carn',
    tier: 2,
    ask: 'A hawk eats mice. A mouse eats seeds and grass. Which one is the meat-eater?',
    right: 'The hawk',
    wrong: [
      ['The mouse', 'role-mixup', 'Seeds and grass are plants. Who eats an animal?'],
      ['Both of them', 'role-mixup', 'Only one of them eats other animals.'],
    ],
    explain: 'The hawk eats animals, so it is a meat-eater (a carnivore). The mouse eats plants, so it is a plant-eater (a herbivore).',
    hints: ['What does each one eat?', 'Follow the arrows: grass, mouse, hawk.'],
    pic: chain(['grass', 'mouse', 'hawk']),
    model: 'chain',
  },
  {
    id: 'm-space',
    tier: 2,
    ask: 'Ten bean plants are squashed into one tiny pot. One bean plant has a big pot all to itself. Which grows best?',
    right: 'The one with its own big pot',
    wrong: [
      ['The ten together. More plants help each other.', 'more-is-better', 'Squashed plants share the same light and water. Each one gets less.'],
      ['They all grow the same. Plants don’t need space.', 'needs-mixup', 'Roots and leaves need room to reach water and light.'],
    ],
    explain: 'Plants close together compete for light, water and space. That is why a crowded patch grows smaller plants.',
    hints: ['Ten plants share the light and water in one tiny pot.', 'Plants need light, water, air and space.'],
    pic: tiles('grass', 'grass', 'grass'),
    model: 'needs',
  },
  {
    id: 'm-oak-food',
    tier: 2,
    ask: 'An oak tree grows big and strong. A deer eats its acorns. A caterpillar eats its leaves. What is the oak?',
    right: 'A producer: it makes food that others eat',
    wrong: [
      ['A plant-eater: it eats the soil', 'plants-soil-food', 'Trees do not eat. Their roots take in water, not food.'],
      ['A meat-eater: it eats the deer', 'arrow-backwards', 'The deer eats from the tree. Which way does the food go?'],
    ],
    explain: 'The oak makes food from sunlight, water and air. Its leaves and acorns feed many animals.',
    hints: ['Does the oak eat, or make its own food?', 'Plants are at the start of every food chain.'],
    pic: chain(['oak', 'deer']),
    model: 'chain',
  },
  {
    id: 'm-sun-plants-face',
    tier: 2,
    ask: 'Leaves are wide and flat, and many turn to face the Sun. Why?',
    right: 'To catch more sunlight for making food',
    wrong: [
      ['To keep the rain off the roots', 'wrong-reason', 'Leaves do drip rain, but they turn to face the sky for another reason.'],
      ['To stay warm, like a blanket', 'wrong-reason', 'Leaves are not for keeping warm. What do they use the Sun for?'],
    ],
    explain: 'Leaves are where a plant makes its food. Wide, flat leaves that face the Sun catch the most light.',
    hints: ['Where does a plant make its food?', 'The more light a leaf catches, the more food it makes.'],
    pic: { k: 'needs' },
    model: 'needs',
  },
  {
    id: 'm-no-sun',
    tier: 2,
    ask: 'Imagine a meadow with no sunlight at all, for a whole year. What would happen to the rabbits?',
    right: 'They would starve: no plants would grow for them',
    wrong: [
      ['Nothing. Rabbits don’t need the Sun.', 'direct-only', 'Rabbits don’t eat sunlight, but their food needs it.'],
      ['They would eat the soil instead', 'plants-soil-food', 'Soil is not food for rabbits. Think about what rabbits eat, and what it needs.'],
    ],
    explain: 'Without the Sun, plants cannot make food. With no plants, plant-eaters like rabbits have nothing to eat.',
    hints: ['What does a rabbit eat? What does that need?', 'Look at the chain: the Sun, the grass, the rabbit.'],
    pic: chain(['grass', 'rabbit'], true),
    model: 'chain',
  },
  // level 3
  {
    id: 'm-pollinate',
    tier: 3,
    ask: 'A bee flies from flower to flower, drinking nectar. Yellow pollen sticks to its fuzzy body. How does this help the flowers?',
    right: 'The bee carries pollen between flowers, so they can make seeds',
    wrong: [
      ['It does not help them. The bee just takes their nectar.', 'pollination-mixup', 'The nectar is a reward. The flower gets something back from the bee.'],
      ['The bee waters the flowers', 'pollination-mixup', 'Bees don’t carry water to flowers. Look at what sticks to the bee.'],
    ],
    explain: 'Flowers need pollen from another flower to make seeds. This is called pollination. Bees and flowers help each other.',
    hints: ['What sticks to the bee’s fuzzy body?', 'Pollen has to get from one flower to another to make seeds.'],
    pic: tiles('bee', 'flowers', 'berries'),
    model: 'fact',
  },
  {
    id: 'm-no-bees',
    tier: 3,
    ask: 'One spring, all the bees leave the meadow. What will happen to the berry bushes?',
    right: 'They will grow fewer berries',
    wrong: [
      ['More berries, because no bees drink the nectar', 'pollination-mixup', 'Bees don’t harm the berries. They do a job the bushes need.'],
      ['No change. Bushes don’t need bees.', 'direct-only', 'Bees don’t eat berries, but they do something for the flowers that turn into berries.'],
    ],
    explain: 'A berry grows from a flower that was pollinated. With no bees, fewer flowers get pollinated, so there are fewer berries (and fewer seeds for new bushes).',
    hints: ['Each berry starts as a flower.', 'What do bees carry from flower to flower?'],
    pic: tiles('berries', 'bee'),
    model: 'fact',
  },
  {
    id: 'm-seeds',
    tier: 3,
    ask: 'A bee has brought pollen to a flower. What can the flower make now?',
    right: 'Seeds, often inside a fruit',
    wrong: [
      ['More bees', 'wrong-reason', 'Bees come from bee eggs, not from flowers.'],
      ['More pollen for the bee to eat', 'pollination-mixup', 'The pollen the bee brought is used by the flower for something else.'],
    ],
    explain: 'Pollen lets a flower make seeds. A fruit, like a berry, often grows around them. New plants grow from the seeds.',
    hints: ['What do new plants grow from?', 'A berry is the part of the plant that holds its seeds.'],
    pic: tiles('flowers', 'berries'),
    model: 'fact',
  },
  {
    id: 'm-oxygen',
    tier: 3,
    ask: 'Plants take in water and a gas from the air to make food. While they do it, they give off a different gas. Which gas?',
    right: 'Oxygen, which animals breathe',
    wrong: [
      ['Smoke', 'wrong-reason', 'Smoke comes from fires, not from leaves.'],
      ['None. Plants give off nothing.', 'wrong-reason', 'Plants do give off a gas. Animals breathe it in.'],
    ],
    explain: 'Plants take in carbon dioxide and give off oxygen. Animals, and people, breathe that oxygen in.',
    hints: ['Which gas do you breathe in?', 'Plants and animals swap gases with the air.'],
    pic: { k: 'needs' },
    model: 'needs',
  },
  {
    id: 'm-pot',
    tier: 3,
    ask: 'Long ago, a scientist grew a willow tree in a pot for five years. He gave it only rain water. The tree grew about 74 kilograms heavier. The soil was less than 1 kilogram lighter. Where did the tree’s new weight come from?',
    right: 'Mostly air and water, built into wood',
    wrong: [
      ['The soil it ate', 'plants-soil-food', 'The soil hardly changed. The tree’s new wood came from somewhere else.'],
      ['The pot', 'wrong-reason', 'The pot was the same pot. Something else went into the tree.'],
    ],
    explain: 'Plants build their bodies from water and from a gas in the air (carbon dioxide), using the Sun’s energy. The soil gives only a little.',
    hints: ['How much did the soil change?', 'A plant makes its food from light, water and air.'],
    pic: { k: 'pot' },
    model: 'needs',
  },
  {
    id: 'm-shade-oak',
    tier: 3,
    ask: 'A big oak tree grows over a patch of meadow grass. Soon the grass under it is thin and weak. Why?',
    right: 'The oak’s leaves block the sunlight the grass needs',
    wrong: [
      ['The oak eats the grass', 'plants-eat', 'Trees do not eat other plants. Look up at the oak’s branches.'],
      ['Grass doesn’t like trees', 'wrong-reason', 'Plants don’t like or dislike. Something real is missing under the oak.'],
    ],
    explain: 'Plants compete for light. The oak’s wide leaves catch the sunlight first, so the grass in its shade cannot make much food.',
    hints: ['What does the grass need from above?', 'Plants compete for light, water and space.'],
    pic: tiles('oak', 'grass'),
    model: 'needs',
  },
];

// ------------------------------------------------------------------ The Pond (Theo Park)

const POND: QDef[] = [
  // level 1
  {
    id: 'p-arrow',
    tier: 1,
    ask: 'In a food chain, an arrow shows where the energy goes. Here, the arrow goes from the lily pad to the snail. What does that mean?',
    right: 'The snail eats the lily pad',
    wrong: [
      ['The lily pad eats the snail', 'arrow-backwards', 'Lily pads cannot eat. The arrow points to the one that gets the energy.'],
      ['The snail turns into a lily pad', 'wrong-reason', 'The arrow is about food, not about changing into something.'],
    ],
    explain: 'The arrow points to the eater. The energy goes from the lily pad into the snail when the snail eats it.',
    hints: ['Which one can eat?', 'The arrow points to the one that gets the energy.'],
    pic: chain(['lilies', 'snail']),
    model: 'chain',
  },
  {
    id: 'p-start',
    tier: 1,
    ask: 'A food chain shows who eats whom. What is at the start of every food chain?',
    right: 'A plant (which gets its energy from the Sun)',
    wrong: [
      ['The biggest animal', 'chain-starts-animal', 'The biggest animal usually comes at the end. What does the first animal eat?'],
      ['A meat-eater', 'chain-starts-animal', 'A meat-eater has to eat other animals first. Go back to the very start.'],
    ],
    explain: 'Every food chain starts with a plant, a producer, that makes its own food from sunlight. Then come the plant-eaters, then the meat-eaters.',
    hints: ['Who makes their own food?', 'Look at the first tile in the chain.'],
    pic: chain(['lilies', 'snail', 'fish', 'heron'], true),
    model: 'chain',
  },
  {
    id: 'p-heron',
    tier: 1,
    ask: 'A heron stands still in the shallow water. It catches fish and frogs with its long beak. What kind of eater is a heron?',
    right: 'A meat-eater (carnivore)',
    wrong: [
      ['A plant-eater (herbivore)', 'role-mixup', 'Fish and frogs are animals, not plants.'],
      ['A producer', 'role-mixup', 'A producer makes its own food. The heron catches its food.'],
    ],
    explain: 'The heron eats other animals, so it is a meat-eater, a carnivore.',
    hints: ['Are fish and frogs plants or animals?', 'Carni means meat.'],
    pic: chain(['fish', 'heron']),
    model: 'chain',
  },
  {
    id: 'p-duck',
    tier: 1,
    ask: 'A duck dabbles in the pond. It eats water plants, and it eats snails too. What do we call an animal that eats both plants and animals?',
    right: 'An omnivore',
    wrong: [
      ['A herbivore', 'role-mixup', 'A herbivore eats only plants. The duck eats snails too.'],
      ['A carnivore', 'role-mixup', 'A carnivore eats only meat. The duck eats water plants too.'],
    ],
    explain: 'An omnivore eats plants and animals. Ducks, bears and people are omnivores.',
    hints: ['Omni means all.', 'The duck eats lily pads and snails.'],
    pic: tiles('lilies', 'duck', 'snail'),
    model: 'chain',
  },
  {
    id: 'p-order',
    tier: 1,
    ask: 'A fish eats snails. A snail eats lily pads. Which food chain is in the right order?',
    right: 'Lily pad, then snail, then fish',
    wrong: [
      ['Fish, then snail, then lily pad', 'arrow-backwards', 'A food chain goes from the food to the eater, not the other way.'],
      ['Snail, then lily pad, then fish', 'chain-starts-animal', 'The snail eats the lily pad, so the lily pad must come before it.'],
    ],
    explain: 'A food chain starts with the plant and follows the energy: the lily pad, the snail that eats it, then the fish that eats the snail.',
    hints: ['Which one makes its own food? Start there.', 'Then who eats it? Then who eats that?'],
    pic: tiles('fish', 'lilies', 'snail'),
    model: 'chain',
  },
  {
    id: 'p-frog',
    tier: 1,
    ask: 'A frog sits on a log by the pond. Its long, sticky tongue flicks out. What does a frog eat?',
    right: 'Insects, like flies and butterflies',
    wrong: [
      ['Lily pads', 'role-mixup', 'Frogs sit on lily pads, but they do not eat them.'],
      ['Herons', 'arrow-backwards', 'A heron is much bigger. Herons eat frogs, not the other way round.'],
    ],
    explain: 'Grown-up frogs eat insects and other small animals, so they are meat-eaters.',
    hints: ['What could a sticky tongue catch?', 'Look at the chain: butterfly, then frog.'],
    pic: chain(['butterfly', 'frog']),
    model: 'chain',
  },
  // level 2
  {
    id: 'p-web',
    tier: 2,
    ask: 'Scientists draw a pond’s food chains joined together. It looks like a web, not one straight line. Why?',
    right: 'Most animals eat more than one thing, and are eaten by more than one',
    wrong: [
      ['Every animal eats only one food', 'web-mixup', 'Look at the snail in the web. How many arrows leave it?'],
      ['Spiders spin it', 'wrong-reason', 'It is called a web because of its shape, not because of spiders.'],
    ],
    explain: 'A food web is many food chains joined together. The snail is eaten by the fish, the frog and the duck, so its arrows branch out like a web.',
    hints: ['Count the arrows that leave the snail.', 'Look at the pond web.'],
    pic: { k: 'web' },
    model: 'web',
  },
  {
    id: 'p-snail-eaters',
    tier: 2,
    ask: 'Look at the pond web. Which animals eat the snail?',
    right: 'The fish, the frog and the duck',
    wrong: [
      ['Only the fish', 'web-mixup', 'Follow every arrow that starts at the snail.'],
      ['The lily pad', 'arrow-backwards', 'The arrow goes from the lily pad to the snail. Which way does the food go?'],
    ],
    explain: 'Three arrows leave the snail: to the fish, the frog and the duck. All three eat snails.',
    hints: ['Find the snail. Follow the arrows that start there.', 'Arrows point to the eaters.'],
    pic: { k: 'web' },
    model: 'web',
  },
  {
    id: 'p-energy',
    tier: 2,
    ask: 'Lily pad, snail, fish, heron. Where did the heron’s energy first come from?',
    right: 'The Sun, caught by the lily pad',
    wrong: [
      ['The fish', 'chain-starts-animal', 'The fish passed the energy on, but it did not make it. Go further back.'],
      ['The pond water', 'plants-soil-food', 'Water helps the lily pad grow, but the energy came from somewhere else.'],
    ],
    explain: 'The lily pad caught the Sun’s energy to make its food. The energy then went from the snail to the fish to the heron.',
    hints: ['Follow the chain backwards to the start.', 'What does a lily pad use to make its food?'],
    pic: chain(['lilies', 'snail', 'fish', 'heron'], true),
    model: 'chain',
  },
  {
    id: 'p-top',
    tier: 2,
    ask: 'The heron eats fish and frogs. Nothing in the pond eats herons. What is the heron called?',
    right: 'The top predator',
    wrong: [
      ['A producer', 'role-mixup', 'A producer makes its own food. The heron hunts for its food.'],
      ['The prey', 'arrow-backwards', 'Prey are the animals that get eaten. What eats the heron?'],
    ],
    explain: 'A predator hunts other animals. The top predator is at the end of the food chain: no other animal in the ecosystem hunts it.',
    hints: ['Is the heron hunted, or does it hunt?', 'Look at the end of the chain.'],
    pic: chain(['fish', 'heron']),
    model: 'web',
  },
  {
    id: 'p-both',
    tier: 2,
    ask: 'A frog catches butterflies. A heron catches the frog. So what is the frog?',
    right: 'Both a predator and prey',
    wrong: [
      ['Only a predator', 'direct-only', 'The frog hunts, yes. Look at what happens to the frog too.'],
      ['A producer', 'role-mixup', 'A producer makes its own food. The frog catches its food.'],
    ],
    explain: 'Many animals are predators of one animal and prey of another. The frog hunts butterflies and is hunted by the heron.',
    hints: ['Follow the arrows into the frog and out of it.', 'A predator hunts. Prey gets hunted.'],
    pic: chain(['butterfly', 'frog', 'heron']),
    model: 'chain',
  },
  {
    id: 'p-omnivore',
    tier: 2,
    ask: 'Which pond animal is an omnivore?',
    right: 'The duck: it eats water plants and snails',
    wrong: [
      ['The heron: it eats fish and frogs', 'role-mixup', 'Fish and frogs are both animals. An omnivore eats plants too.'],
      ['The snail: it eats water plants', 'role-mixup', 'Water plants are plants only. An omnivore eats animals too.'],
    ],
    explain: 'An omnivore eats both plants and animals. In the pond, the duck eats lily pads, cattail seeds and snails.',
    hints: ['Omni means all: plants and animals.', 'Look at the arrows into the duck in the web.'],
    pic: { k: 'web' },
    model: 'web',
  },
  // level 3
  {
    id: 'p-no-frogs',
    tier: 3,
    ask: 'Frogs eat insects. One summer, all the frogs leave the pond. What happens to the number of insects?',
    right: 'It goes up, because fewer animals are eating them',
    wrong: [
      ['It goes down too', 'direct-only', 'The frogs were eating the insects. What happens when that stops?'],
      ['It stays the same', 'direct-only', 'Taking away a predator changes the animals it ate.'],
    ],
    explain: 'With no frogs eating them, more insects survive. A change to one living thing spreads through the food web.',
    hints: ['What did the frogs do to the insects?', 'Look at the web with the frog taken away.'],
    pic: { k: 'web', gone: 'frog' },
    model: 'web',
  },
  {
    id: 'p-algae',
    tier: 3,
    ask: 'Snails eat algae, tiny green water plants. A sickness kills all the snails in the pond. What happens to the algae?',
    right: 'It grows and grows, and the water turns green',
    wrong: [
      ['It dies too', 'direct-only', 'The snails were eating the algae. What happens when nothing eats it?'],
      ['Nothing changes', 'direct-only', 'The snails had a job in the pond. Something changes when they are gone.'],
    ],
    explain: 'With no snails eating it, the algae spreads fast and turns the water green. This is called an algae bloom.',
    hints: ['What were the snails doing to the algae?', 'Look at the web with the snail taken away.'],
    pic: { k: 'web', gone: 'snail' },
    model: 'web',
  },
  {
    id: 'p-herons-away',
    tier: 3,
    ask: 'Someone chases all the herons away, to help the fish. The fish have lots of babies. Soon there are too many fish. What might happen next?',
    right: 'The fish eat most of the snails, then many fish go hungry',
    wrong: [
      ['Nothing. More fish is always better.', 'more-is-better', 'Every fish needs food. What do fish eat, and is there enough?'],
      ['The pond is healthier with no herons', 'predators-bad', 'Herons were keeping the number of fish in check.'],
    ],
    explain: 'Predators keep the number of their prey in balance. With no herons, the fish grow too many, eat up their food, and then go hungry.',
    hints: ['What do fish eat? Will there be enough?', 'Look at the web with the heron taken away.'],
    pic: { k: 'web', gone: 'heron' },
    model: 'web',
  },
  {
    id: 'p-need-predators',
    tier: 3,
    ask: 'Why does a healthy pond need predators like herons?',
    right: 'They stop any one kind of animal from growing too many',
    wrong: [
      ['It doesn’t. Predators only harm a pond.', 'predators-bad', 'Predators do eat other animals, but think about what happens without them.'],
      ['Herons make food from sunlight', 'role-mixup', 'Herons are hunters, not producers.'],
    ],
    explain: 'Predators keep their prey from growing too many, so the prey don’t eat all their own food. That keeps the whole pond in balance.',
    hints: ['Think about the fish story: what happened with no herons?', 'Every animal’s numbers depend on its food and its hunters.'],
    pic: { k: 'web' },
    model: 'web',
  },
  {
    id: 'p-ripple',
    tier: 3,
    ask: 'A sickness kills the pond’s snails. Which living things could this change?',
    right: 'The fish, frogs and ducks that eat snails, and the plants snails eat',
    wrong: [
      ['Only the snails', 'direct-only', 'The snails are joined to other living things by arrows.'],
      ['Nothing else in the pond', 'direct-only', 'Follow the arrows into the snail and out of it.'],
    ],
    explain: 'In a food web, a change to one living thing ripples out. The snail’s eaters lose food, and the plants it ate grow more.',
    hints: ['Find every arrow that touches the snail.', 'Arrows in mean its food. Arrows out mean its eaters.'],
    pic: { k: 'web', gone: 'snail' },
    model: 'web',
  },
  {
    id: 'p-two-foods',
    tier: 3,
    ask: 'A fish eats snails and insects. One year, the snails die out. Why might the fish still be all right?',
    right: 'It can eat more insects instead',
    wrong: [
      ['It will starve at once', 'web-mixup', 'The fish has more than one food in the web.'],
      ['Fish don’t eat snails', 'wrong-reason', 'Fish do eat snails. Read the first sentence again.'],
    ],
    explain: 'Animals with more than one food can switch when one runs short. That is one reason food webs make an ecosystem strong.',
    hints: ['How many foods does the fish have?', 'Look at the arrows into the fish.'],
    pic: { k: 'web', gone: 'snail' },
    model: 'web',
  },
];

const BANKS: Record<Station, QDef[]> = { meadow: MEADOW, pond: POND };

export function shuffle<T>(r: Rand, list: readonly T[]): T[] {
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

/** The pond food web the 'web' picture and model draw: [food, eater]. */
export const POND_WEB: Array<[PieceId, PieceId]> = [
  ['lilies', 'snail'],
  ['reeds', 'snail'],
  ['lilies', 'duck'],
  ['snail', 'duck'],
  ['snail', 'fish'],
  ['snail', 'frog'],
  ['butterfly', 'frog'],
  ['butterfly', 'fish'],
  ['fish', 'heron'],
  ['frog', 'heron'],
];
