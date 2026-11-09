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
import type { HomeKind, Rand } from './rules';

export type Station = HomeKind;
export const STATIONS: Station[] = ['meadow', 'pond', 'woods', 'wetland'];
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
  | 'decomposers-nothing' // thinks dead things just disappear (decomposers do nothing)
  | 'energy-recycled' // thinks energy goes round and round like matter
  | 'invasive-good' // thinks an invasive species is good because it adds more life
  | 'graph-mixup' // read the bar chart or the graph wrong
  | 'population-mixup' // mixed up how predator and prey numbers change
  | 'wrong-reason'; // gave a reason that does not explain it

/** What the panel shows above the question (the words in the question match it). */
export type Pic =
  /** Tiles in a row, with arrows from each one to the next (the energy goes from the eaten to the eater) when `arrows` is true. The Sun comes first when `sun` is true. */
  | { k: 'chain'; ids: PieceId[]; arrows: boolean; sun?: boolean; labels?: string[] }
  /** What a plant needs: the Sun's light, water, air (and the space around it). */
  | { k: 'needs' }
  /** The pond's food web: lily pads and cattails, the snail, the fish, the frog, the duck and the heron, with arrows. */
  | { k: 'web'; gone?: PieceId }
  /** The willow in the pot: the tree grew by about 74 kilograms, the soil lost less than 1. */
  | { k: 'pot' }
  /** A plant in a dark cupboard next to one in the light. */
  | { k: 'dark' }
  /** A ranger's count as a bar chart. */
  | { k: 'bars'; rows: Array<[string, number, string]> }
  /** Two numbers over the years: the prey rises and falls, and its hunter follows a little later. */
  | { k: 'pop'; prey: PieceId; hunter: PieceId }
  /** The decomposer cycle: an oak, its fallen leaves, mushrooms, rich soil, and back to the oak. */
  | { k: 'cycle' };

/** The picture model that hint 2 adds. */
export type Model = 'chain' | 'web' | 'needs' | 'cycle' | 'pyramid' | 'fact';

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

// ------------------------------------------------------------------ The Woods (Lupe Fonoti and Bramble)

const WOODS: QDef[] = [
  // level 1
  {
    id: 'w-log',
    tier: 1,
    ask: 'Mushrooms grow on a fallen log. Year by year, the log turns soft and crumbly. What are the mushrooms doing?',
    right: 'Breaking the log down into soil',
    wrong: [
      ['Holding the log together', 'wrong-reason', 'The log is falling apart, not staying together. Something is breaking it down.'],
      ['Making food from sunlight, like a plant', 'role-mixup', 'Mushrooms are not plants. They grow in the shade and cannot use sunlight to make food.'],
    ],
    explain: 'Mushrooms are decomposers. They feed on dead wood and break it down, and what is left becomes part of the soil.',
    hints: ['Is the log getting stronger or softer?', 'Look at the cycle: a log, the mushrooms, then the soil.'],
    pic: tiles('log', 'mushrooms'),
    model: 'cycle',
  },
  {
    id: 'w-worms',
    tier: 1,
    ask: 'Earthworms pull dead leaves down into the ground and eat them. What job does a worm do in the woods?',
    right: 'It is a decomposer',
    wrong: [
      ['It is a producer', 'role-mixup', 'A producer makes its own food from sunlight. Worms live underground and eat dead things.'],
      ['It is a top predator', 'role-mixup', 'A top predator hunts other animals. Worms eat dead leaves.'],
    ],
    explain: 'Decomposers break down dead things. Worms eat dead leaves and mix what is left into the soil.',
    hints: ['What does a worm eat?', 'Decomposers eat things that are already dead.'],
    pic: tiles('leaves', 'worms'),
    model: 'cycle',
  },
  {
    id: 'w-leaf-pile',
    tier: 1,
    ask: 'In autumn, a big pile of dead leaves covers the forest floor. A year later, most of the pile is gone. Where did it go?',
    right: 'Decomposers broke it down into the soil',
    wrong: [
      ['It just vanished', 'decomposers-nothing', 'Leaves never just vanish. Something has to break them down.'],
      ['The wind blew it all into the sea', 'wrong-reason', 'Wind moves a few leaves, but the forest floor is sheltered. Most of the pile stayed.'],
    ],
    explain: 'Mushrooms, worms, insects and tiny bacteria broke the leaves down. Their nutrients went back into the soil.',
    hints: ['Who lives in the leaf pile?', 'Look at the cycle: leaves, mushrooms, soil.'],
    pic: { k: 'cycle' },
    model: 'cycle',
  },
  {
    id: 'w-mushroom-food',
    tier: 1,
    ask: 'A mushroom grows in a dark corner of the woods. It has no green leaves. Can a mushroom make its own food from sunlight?',
    right: 'No. It feeds on dead things.',
    wrong: [
      ['Yes, like every plant', 'role-mixup', 'Mushrooms are not plants, and they have no green leaves to catch the light.'],
      ['Yes, from the moonlight', 'wrong-reason', 'Moonlight is far too weak, and mushrooms cannot use light anyway.'],
    ],
    explain: 'Mushrooms are fungi. They cannot make food from light. They get their food by breaking down dead plants and animals.',
    hints: ['Does the mushroom have green leaves?', 'Where does a mushroom grow? On something dead.'],
    pic: tiles('mushrooms'),
    model: 'fact',
  },
  {
    id: 'w-dung',
    tier: 1,
    ask: 'A dung beetle rolls a ball of deer dung and buries it in the ground. How does this help the woods?',
    right: 'It puts nutrients from the dung back into the soil',
    wrong: [
      ['It does not help. It just makes a mess.', 'decomposers-nothing', 'The beetle is cleaning up, not making a mess. Where does the dung end up?'],
      ['It feeds the deer', 'wrong-reason', 'The deer has already eaten. The beetle is using what the deer left behind.'],
    ],
    explain: 'Dung beetles are decomposers. Buried dung feeds the soil, and plants grow better in it.',
    hints: ['Where does the dung end up?', 'Plants take nutrients from the soil.'],
    pic: tiles('deer', 'beetle'),
    model: 'cycle',
  },
  {
    id: 'w-fungi',
    tier: 1,
    ask: 'Mushrooms belong to a group of living things called fungi. Are fungi plants?',
    right: 'No. Fungi are a different kind of living thing.',
    wrong: [
      ['Yes, they are small plants', 'role-mixup', 'Fungi grow from the ground like plants, but they cannot make their own food.'],
      ['No, they are animals', 'role-mixup', 'Fungi do not move about or catch food like animals.'],
    ],
    explain: 'Fungi are their own group, not plants and not animals. Mushrooms, molds and yeast are all fungi.',
    hints: ['Can a mushroom make food from sunlight?', 'Plants make their own food. Fungi feed on dead things.'],
    pic: tiles('mushrooms', 'oak'),
    model: 'fact',
  },
  // level 2
  {
    id: 'w-cycle',
    tier: 2,
    ask: 'A leaf falls and rots into the soil. An oak’s roots take up nutrients from that soil and grow new leaves. What does this show?',
    right: 'Matter goes round and round, from living things to soil and back',
    wrong: [
      ['New matter is made every spring', 'wrong-reason', 'The new leaves are built from things that were already there, in the soil, water and air.'],
      ['The oak eats the soil', 'plants-soil-food', 'Roots take in water and a few nutrients, but the oak makes its food from sunlight.'],
    ],
    explain: 'The same matter is used again and again: the leaf becomes soil, and the soil helps make new leaves. Decomposers keep the cycle going.',
    hints: ['Where did the new leaf’s nutrients come from?', 'Look at the cycle: oak, leaves, mushrooms, soil, oak.'],
    pic: { k: 'cycle' },
    model: 'cycle',
  },
  {
    id: 'w-no-decomposers',
    tier: 2,
    ask: 'Imagine a forest with no decomposers at all, for a hundred years. What would pile up?',
    right: 'Dead leaves, logs and dead animals',
    wrong: [
      ['Nothing. Dead things disappear by themselves.', 'decomposers-nothing', 'Dead things only break down if something breaks them down.'],
      ['Living trees', 'wrong-reason', 'Living trees keep growing. What happens to the dead things they drop?'],
    ],
    explain: 'Without decomposers, dead things would stay where they fell, and their nutrients would never get back to the soil.',
    hints: ['Who breaks down dead leaves and logs?', 'Take the mushrooms out of the cycle.'],
    pic: { k: 'cycle' },
    model: 'cycle',
  },
  {
    id: 'w-warm',
    tier: 2,
    ask: 'One banana peel is buried in warm, damp soil. Another is kept in a cold, dry box. Which breaks down faster?',
    right: 'The one in warm, damp soil',
    wrong: [
      ['The one in the cold, dry box', 'wrong-reason', 'Most decomposers slow right down when it is cold and dry.'],
      ['They break down at the same speed', 'wrong-reason', 'The soil is full of decomposers. The box has very few.'],
    ],
    explain: 'Decomposers like worms, fungi and bacteria work fastest where it is warm and damp. That is why compost heaps are kept moist.',
    hints: ['Where do worms and mushrooms live?', 'Think of a damp forest floor in summer.'],
    pic: tiles('worms', 'mushrooms'),
    model: 'fact',
  },
  {
    id: 'w-bacteria',
    tier: 2,
    ask: 'Mushrooms and worms are decomposers you can see. Which tiny decomposers are too small to see?',
    right: 'Bacteria',
    wrong: [
      ['Bees', 'role-mixup', 'Bees are pollinators. They visit living flowers, not dead things.'],
      ['Sunbeams', 'wrong-reason', 'Sunbeams are light, not living things.'],
    ],
    explain: 'Bacteria are tiny living things. Billions of them live in a spoonful of soil, breaking down dead things.',
    hints: ['You need a microscope to see them.', 'They are living things smaller than a speck of dust.'],
    pic: { k: 'cycle' },
    model: 'fact',
  },
  {
    id: 'w-compost',
    tier: 2,
    ask: 'Gardeners make compost from old leaves and food scraps. Worms and fungi break it down. Why do gardeners spread compost on their gardens?',
    right: 'It gives the soil nutrients that help plants grow',
    wrong: [
      ['It scares away birds', 'wrong-reason', 'Compost is not a scarecrow. Think about what is in it.'],
      ['Plants eat it as food through their roots', 'plants-soil-food', 'Plants make their food from sunlight. Compost gives them nutrients, not food.'],
    ],
    explain: 'Compost is broken-down dead plants. It puts nutrients back in the soil, just like decomposers do in the woods.',
    hints: ['What was the compost made from?', 'Look at the cycle: dead things become rich soil.'],
    pic: tiles('leaves', 'worms', 'flowers'),
    model: 'cycle',
  },
  {
    id: 'w-arrow',
    tier: 2,
    ask: 'Worms eat dead leaves. In a food web, which way does the arrow go between the dead leaf and the worm?',
    right: 'From the leaf to the worm',
    wrong: [
      ['From the worm to the leaf', 'arrow-backwards', 'The arrow points to the eater. Who eats whom here?'],
      ['There is no arrow. Dead things are not food.', 'decomposers-nothing', 'Dead leaves are food for decomposers.'],
    ],
    explain: 'Arrows go from the food to the eater, even when the food is dead. The worm gets its energy from the leaf.',
    hints: ['Who is the eater?', 'Arrows point to the eater.'],
    pic: chain(['leaves', 'worms']),
    model: 'chain',
  },
  // level 3
  {
    id: 'w-energy-matter',
    tier: 3,
    ask: 'Matter goes round and round in the woods: leaves, soil, new leaves. Does energy go round and round too?',
    right: 'No. Energy comes in from the Sun and is used up along the way.',
    wrong: [
      ['Yes, the same energy goes round for ever', 'energy-recycled', 'Matter is recycled, but energy is used for living and growing, and leaves as heat.'],
      ['Yes, decomposers turn it back into sunlight', 'energy-recycled', 'Nothing in the woods can turn energy back into sunlight.'],
    ],
    explain: 'Matter cycles, but energy flows one way: from the Sun, through plants and animals, and out as heat. That is why every ecosystem needs the Sun every day.',
    hints: ['Why do the woods need sunshine every single day?', 'Matter goes round. Energy comes in, gets used, and is gone as heat.'],
    pic: { k: 'cycle' },
    model: 'cycle',
  },
  {
    id: 'w-log-slow',
    tier: 3,
    ask: 'A fallen leaf rots in about a year. A huge fallen log can take fifty years. Why does the log take so long?',
    right: 'There is far more of it, and wood is tough to break down',
    wrong: [
      ['Decomposers do not like logs', 'wrong-reason', 'Many fungi and beetles live only on dead wood. It just takes them a long time.'],
      ['Logs are still alive', 'wrong-reason', 'A fallen log is dead wood. Look at the mushrooms on it.'],
    ],
    explain: 'Wood is hard and there is a lot of it, so fungi and insects take many years to break a log down. Meanwhile it is a home for many living things.',
    hints: ['Compare a leaf with a log. Which is bigger and harder?', 'Decomposers work on the outside first.'],
    pic: tiles('leaves', 'log'),
    model: 'fact',
  },
  {
    id: 'w-raked',
    tier: 3,
    ask: 'A park keeper rakes up every fallen leaf under the trees and takes them away, every year for twenty years. What might happen to the soil there?',
    right: 'It gets poorer, because nothing goes back into it',
    wrong: [
      ['It gets richer, because it is tidy', 'decomposers-nothing', 'Tidy is not the same as rich. What did the leaves give the soil?'],
      ['Nothing changes', 'direct-only', 'The trees keep taking nutrients from the soil. What puts them back?'],
    ],
    explain: 'Fallen leaves are how a tree’s nutrients get back to the soil. Take them away every year and the soil slowly runs out.',
    hints: ['What happens to leaves that stay on the ground?', 'The cycle needs the leaves to get back to the soil.'],
    pic: { k: 'cycle' },
    model: 'cycle',
  },
  {
    id: 'w-acorn',
    tier: 3,
    ask: 'A deer eats acorns from an oak. A dung beetle buries the deer’s dung. A young oak grows well in that soil. What does this story show?',
    right: 'Matter moves from the oak to the deer to the soil, and back to an oak',
    wrong: [
      ['Energy goes from the dung back to the Sun', 'energy-recycled', 'Energy does not go back to the Sun. Think about what goes back into the soil.'],
      ['The deer only harms the oak', 'direct-only', 'The deer eats acorns, but follow the dung. Where do its nutrients end up?'],
    ],
    explain: 'The same matter passes from plant to animal to soil and back to a plant. Decomposers like the dung beetle close the loop.',
    hints: ['Follow the acorn: into the deer, out as dung, into the soil.', 'Look at the cycle.'],
    pic: chain(['oak', 'deer', 'beetle']),
    model: 'cycle',
  },
  {
    id: 'w-why-needed',
    tier: 3,
    ask: 'Scientists say every ecosystem needs decomposers. Why?',
    right: 'They return the matter in dead things to the soil, so producers can grow',
    wrong: [
      ['They are the top predators', 'role-mixup', 'Top predators hunt living animals. Decomposers work on dead things.'],
      ['They make food from sunlight for everyone', 'role-mixup', 'That is what producers do. Decomposers do another job.'],
    ],
    explain: 'Producers need nutrients from the soil. Without decomposers recycling dead things, the soil would run out and the whole food web would suffer.',
    hints: ['What would pile up without them?', 'Producers need nutrients from the soil.'],
    pic: { k: 'cycle' },
    model: 'cycle',
  },
  {
    id: 'w-heat',
    tier: 3,
    ask: 'In winter, a big compost heap can feel warm inside, and even steam a little. Where does the warmth come from?',
    right: 'Decomposers using energy as they break things down give off heat',
    wrong: [
      ['The compost has stored up summer sunshine like a battery', 'energy-recycled', 'The warmth is being made right now, inside the heap. Who is busy in there?'],
      ['Someone has lit a fire under it', 'wrong-reason', 'No fire is needed. The heap warms up all by itself.'],
    ],
    explain: 'Living things give off heat when they use energy. Billions of busy bacteria and fungi make a compost heap warm. That heat is energy leaving the ecosystem.',
    hints: ['What is living inside a compost heap?', 'Your body is warm because you use energy. So are decomposers.'],
    pic: tiles('leaves', 'mushrooms', 'worms'),
    model: 'fact',
  },
];

// ------------------------------------------------------------------ The Wetland (Warden Nia Achieng)

const bars = (plants: number, eaters: number, hunters: number): Pic => ({
  k: 'bars',
  rows: [
    ['Plants', plants, '#3fae5a'],
    ['Plant-eaters', eaters, '#f2c94c'],
    ['Meat-eaters', hunters, '#e0503a'],
  ],
});

const WETLAND: QDef[] = [
  // level 1
  {
    id: 'n-most',
    tier: 1,
    ask: 'A ranger counts the living things in a healthy wetland. Which group is the biggest?',
    right: 'The plants',
    wrong: [
      ['The herons and other hunters', 'population-mixup', 'Hunters are at the top of the food chain. There are only a few of them.'],
      ['The snails and other plant-eaters', 'population-mixup', 'Every plant-eater needs lots of plants to eat.'],
    ],
    explain: 'In a healthy ecosystem there are the most plants, fewer plant-eaters and the fewest meat-eaters.',
    hints: ['Who feeds everybody else?', 'Look at the bars.'],
    pic: bars(20, 8, 2),
    model: 'pyramid',
  },
  {
    id: 'n-boom',
    tier: 1,
    ask: 'A pond has hundreds of snails and only a few water plants. What will happen soon?',
    right: 'The snails eat the plants, then many snails go hungry',
    wrong: [
      ['The snails will all grow bigger', 'more-is-better', 'Hundreds of snails share only a few plants. Is there enough food?'],
      ['Nothing. Snails do not need food.', 'wrong-reason', 'Every animal needs food. Snails graze on water plants.'],
    ],
    explain: 'When there are too many plant-eaters, they eat up their food. Then many go hungry, move away or die, until the plants can grow back.',
    hints: ['Is there enough food for every snail?', 'More plant-eaters than plants means not enough to go round.'],
    pic: bars(3, 12, 0),
    model: 'pyramid',
  },
  {
    id: 'n-invasive',
    tier: 1,
    ask: 'A vine from far away has nothing here that eats it. It spreads fast over the native plants. What do we call a plant like that?',
    right: 'An invasive species',
    wrong: [
      ['A native plant', 'invasive-good', 'Native plants have always lived here. This vine came from far away.'],
      ['A decomposer', 'role-mixup', 'Decomposers break down dead things. The vine is growing over living plants.'],
    ],
    explain: 'An invasive species comes from somewhere else and spreads fast, because nothing here keeps it in check. It crowds out native plants.',
    hints: ['Did the vine always live here?', 'Invade means to push in where you do not belong.'],
    pic: tiles('vine', 'grass'),
    model: 'fact',
  },
  {
    id: 'n-volunteers',
    tier: 1,
    ask: 'Volunteers spend a day pulling up an invasive vine by hand. Why does that help the wetland?',
    right: 'Native plants get their light and space back',
    wrong: [
      ['It does not help. More plants are always better.', 'invasive-good', 'The vine is one plant smothering many others. Count what grows back.'],
      ['The vine was eating the animals', 'wrong-reason', 'Vines do not eat animals. What were they doing to the other plants?'],
    ],
    explain: 'The vine was shading and crowding native plants. With it gone, they grow back, and so do the animals that eat them.',
    hints: ['What was the vine doing to the plants under it?', 'Plants need light and space.'],
    pic: tiles('vine', 'flowers'),
    model: 'needs',
  },
  {
    id: 'n-count',
    tier: 1,
    ask: 'A ranger counts 20 plants, 8 plant-eaters and 2 meat-eaters. Which bar is the shortest?',
    right: 'The meat-eaters',
    wrong: [
      ['The plants', 'graph-mixup', 'Look at the numbers again. 20 is the biggest.'],
      ['The plant-eaters', 'graph-mixup', '8 is more than 2. Find the smallest number.'],
    ],
    explain: 'The meat-eaters have the shortest bar, with 2. There are always fewer hunters than the animals they eat.',
    hints: ['Find the smallest number.', 'The shortest bar has the smallest number.'],
    pic: bars(20, 8, 2),
    model: 'pyramid',
  },
  {
    id: 'n-no-herons',
    tier: 1,
    ask: 'Herons eat fish. Fish eat snails. If all the herons left, what would happen to the number of fish?',
    right: 'It would go up and up',
    wrong: [
      ['It would go down', 'population-mixup', 'The herons were eating the fish. What happens when that stops?'],
      ['It would stay the same', 'direct-only', 'Taking away a hunter changes the animals it was eating.'],
    ],
    explain: 'With no herons eating them, more fish survive, so their numbers grow. Then they may eat too many snails.',
    hints: ['What were the herons doing to the fish?', 'Follow the chain: snail, fish, heron.'],
    pic: chain(['snail', 'fish', 'heron']),
    model: 'web',
  },
  // level 2
  {
    id: 'n-pyramid',
    tier: 2,
    ask: 'There are many fish in the wetland, but only a few herons. Why?',
    right: 'Each heron must eat many fish to stay alive',
    wrong: [
      ['Herons are bigger, so they need less food', 'wrong-reason', 'Bigger animals usually need more food, not less.'],
      ['Fish eat herons', 'arrow-backwards', 'The arrow goes from the fish to the heron. Who eats whom?'],
    ],
    explain: 'A heron needs many fish over its life. So the wetland can only feed a few herons. That is the energy pyramid.',
    hints: ['How many fish does one heron eat in a year?', 'Look at the bars: fewer animals at each step up.'],
    pic: bars(30, 10, 2),
    model: 'pyramid',
  },
  {
    id: 'n-rise-fall',
    tier: 2,
    ask: 'The graph shows snails and fish over the years. When there are lots of snails, the fish go up too. Then the snails go down. What happens to the fish next?',
    right: 'The fish go down too, with less food',
    wrong: [
      ['The fish keep going up', 'population-mixup', 'The fish eat snails. What happens to them when snails are scarce?'],
      ['The fish are not linked to the snails', 'direct-only', 'Fish eat snails, so their numbers are linked.'],
    ],
    explain: 'Predator and prey numbers rise and fall in turns. The hunters follow their food, a little later.',
    hints: ['What do the fish eat?', 'Look at the graph: the second line follows the first.'],
    pic: { k: 'pop', prey: 'snail', hunter: 'fish' },
    model: 'fact',
  },
  {
    id: 'n-later',
    tier: 2,
    ask: 'In the graph, rabbits go up first, and foxes go up a little later. Why do the foxes go up later?',
    right: 'With lots of rabbits to eat, foxes raise more young, and that takes time',
    wrong: [
      ['Foxes turn into rabbits', 'wrong-reason', 'Foxes and rabbits are different animals. Think about food and babies.'],
      ['Rabbits eat foxes', 'arrow-backwards', 'Foxes eat rabbits, not the other way round.'],
    ],
    explain: 'More food means more fox cubs survive. It takes time for them to grow up, so the fox line follows the rabbit line.',
    hints: ['What do foxes eat?', 'Babies take time to grow up.'],
    pic: { k: 'pop', prey: 'rabbit', hunter: 'fox' },
    model: 'fact',
  },
  {
    id: 'n-crowded',
    tier: 2,
    ask: 'A wetland has food and room for about 40 ducks. One spring, 80 ducks arrive. What will probably happen?',
    right: 'Many ducks will go hungry or move away',
    wrong: [
      ['All 80 will be fine', 'more-is-better', 'There is food for about 40. What about the other 40?'],
      ['The wetland will grow bigger to fit them', 'wrong-reason', 'A wetland cannot grow just because more ducks arrive.'],
    ],
    explain: 'Every place can only feed so many of each animal. When there are too many, some go hungry or move on.',
    hints: ['How much food is there?', 'Food for 40, but 80 ducks.'],
    pic: tiles('duck', 'lilies'),
    model: 'pyramid',
  },
  {
    id: 'n-why-spread',
    tier: 2,
    ask: 'Why can an invasive plant spread so fast in a new place?',
    right: 'Nothing there eats it or keeps it in check',
    wrong: [
      ['It is the strongest plant in the world', 'wrong-reason', 'Back home, the same plant grows normally. What is different here?'],
      ['The animals here love to eat it', 'invasive-good', 'If animals ate it, it would not spread so fast.'],
    ],
    explain: 'In its home, the plant has animals and diseases that keep it in check. In a new place, it has none, so it spreads.',
    hints: ['What keeps a plant from spreading everywhere?', 'Think about who eats it back home.'],
    pic: tiles('vine'),
    model: 'fact',
  },
  {
    id: 'n-energy-used',
    tier: 2,
    ask: 'A snail eats a lily pad and gets its energy. What happens to most of that energy?',
    right: 'The snail uses it to move, grow and stay alive',
    wrong: [
      ['It is all saved for the fish that eats the snail', 'energy-recycled', 'The snail uses energy every day. Only a little is left in its body.'],
      ['It goes back into the lily pad', 'energy-recycled', 'Energy does not go backwards along a food chain.'],
    ],
    explain: 'Most of the energy is used for living and is lost as heat. Only a small part is stored in the snail’s body for the next eater.',
    hints: ['What does a snail do all day?', 'Moving and growing use energy up.'],
    pic: chain(['lilies', 'snail', 'fish']),
    model: 'pyramid',
  },
  // level 3
  {
    id: 'n-tenth',
    tier: 3,
    ask: 'Only about one tenth of the energy passes from one step of a food chain to the next. The lily pads hold 1,000 units. About how much reaches the fish that eat the snails?',
    right: 'About 10',
    wrong: [
      ['About 100', 'wrong-reason', '100 is what reaches the snails. Take one more step.'],
      ['All 1,000', 'energy-recycled', 'Most of the energy is used up at each step.'],
    ],
    explain: 'Lily pads 1,000, snails about 100, fish about 10. That is why there are so few animals at the top of a food chain.',
    hints: ['One tenth of 1,000 reaches the snails.', 'Then one tenth of that reaches the fish.'],
    pic: chain(['lilies', 'snail', 'fish']),
    model: 'pyramid',
  },
  {
    id: 'n-plan',
    tier: 3,
    ask: 'A wetland has too many snails and too few water plants. Which plan will help it most?',
    right: 'Plant native water plants and protect the fish and herons',
    wrong: [
      ['Chase away the herons to keep the fish safe', 'predators-bad', 'The herons and fish keep plant-eaters in check. Removing them makes things worse.'],
      ['Add even more snails', 'more-is-better', 'There are already too many plant-eaters for the plants.'],
    ],
    explain: 'More plants feed more life, and hunters keep the plant-eaters in check. Together they bring the wetland back into balance.',
    hints: ['What does the wetland have too little of?', 'Who keeps the snails in check?'],
    pic: bars(3, 12, 1),
    model: 'pyramid',
  },
  {
    id: 'n-drained',
    tier: 3,
    ask: 'Long ago, people drained many wetlands to make fields. What happened to the frogs and herons that lived there?',
    right: 'They lost their homes and food, so many moved away or died',
    wrong: [
      ['Nothing. They can live anywhere.', 'direct-only', 'Frogs and herons need water and the animals that live in it.'],
      ['There were more of them', 'more-is-better', 'The water they needed was gone. Could more of them live there?'],
    ],
    explain: 'When a habitat changes, some living things survive, some move away and some die. Today people protect and rebuild wetlands.',
    hints: ['What do frogs and herons need?', 'Without water, their food is gone too.'],
    pic: tiles('frog', 'heron'),
    model: 'web',
  },
  {
    id: 'n-dry-year',
    tier: 3,
    ask: 'In a very dry year, a pond shrinks to half its size. Which animals are hit hardest?',
    right: 'The fish, which can only live in water',
    wrong: [
      ['The herons, which can fly to another pond', 'wrong-reason', 'Herons can fly away to find food. Who cannot leave the water?'],
      ['The hawks that hunt in the meadow', 'direct-only', 'The hawks hunt far from the pond. Who lives in the pond itself?'],
    ],
    explain: 'Animals that cannot leave the water suffer most when it shrinks. Animals that can move, or live at the edge, cope better.',
    hints: ['Who cannot leave the water?', 'Which animals can fly or walk away?'],
    pic: tiles('fish', 'heron', 'frog'),
    model: 'fact',
  },
  {
    id: 'n-bad-count',
    tier: 3,
    ask: 'A ranger’s count on another island shows the bars in the picture. What is wrong with this island?',
    right: 'There are too many plant-eaters for the plants',
    wrong: [
      ['There are too few plant-eaters', 'graph-mixup', 'Compare the plant bar with the plant-eater bar. Which is longer?'],
      ['There are too many plants', 'graph-mixup', 'The plant bar is the short one here.'],
    ],
    explain: 'There should be more plants than plant-eaters. Here it is the other way round, so the plant-eaters will run out of food.',
    hints: ['Which bar is longer: plants or plant-eaters?', 'In a healthy island, the plant bar is the longest.'],
    pic: bars(4, 12, 1),
    model: 'pyramid',
  },
  {
    id: 'n-wolves',
    tier: 3,
    ask: 'Wolves came back to Yellowstone Park in 1995. They hunted elk, and the elk stopped lingering by the rivers. Soon young willow trees grew back along the rivers. Why?',
    right: 'Fewer elk were eating the young willows',
    wrong: [
      ['The wolves planted the willows', 'wrong-reason', 'Wolves do not plant trees. Follow the food chain from wolf to elk to willow.'],
      ['The wolves ate the willows', 'role-mixup', 'Wolves are meat-eaters. What did the elk eat?'],
    ],
    explain: 'The wolves changed what the elk ate, and that let the willows grow. A change at the top of a food chain can ripple all the way down.',
    hints: ['What do elk eat?', 'Wolves, then elk, then willows.'],
    pic: { k: 'chain', ids: ['oak', 'deer', 'fox'], arrows: true, labels: ['Young willows', 'Elk', 'Wolves'] },
    model: 'chain',
  },
];

const BANKS: Record<Station, QDef[]> = { meadow: MEADOW, pond: POND, woods: WOODS, wetland: WETLAND };

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
