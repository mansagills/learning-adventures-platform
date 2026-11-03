/**
 * Animal Kingdom Match: the science, as data and pure functions (no drawing,
 * no timers) so every rule can be unit tested.
 *
 * Each habitat trip ends at the Ranger Journal: questions at three levels.
 * Half 1 has two trips:
 *   The Rainforest (Ranger Tala): what a habitat gives an animal
 *     1. food, water, shelter and space; warm and wet all year; who lives
 *        here (K-ESS3-1)
 *     2. the layers (floor, understory, canopy) and who lives in each;
 *        camouflage; bright colors as a warning (2-LS4-1)
 *     3. more kinds of animals than anywhere else on land; trees cut down;
 *        body parts that fit the forest; body parts come from the parents;
 *        would it live well somewhere else? (3-LS4-3)
 *   The Desert (Dr. Amara): living with heat and little water
 *     1. very little rain; who lives here; shade and burrows; water holes;
 *        a cactus stores water (K-ESS3-1)
 *     2. the camel's hump is fat, not water; big ears let out heat; busy at
 *        night; strong legs, wide feet (1-LS1-1, 4-LS1-1)
 *     3. hot days and cold nights; Antarctica is the biggest desert; which
 *        body part helps in the desert but not in the Arctic (3-LS4-3)
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the
 * answer away.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 * Grades 1 to 4: level 1 is short enough for a first grader to hear read
 * aloud.
 */

import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import type { Habitat, Trip } from './animals';

export type Station = Trip;
/** The trips with a question bank so far (half 1). */
export const STATIONS: Station[] = ['rainforest', 'desert'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'live-anywhere' // thinks any animal could live anywhere
  | 'just-a-place' // thinks a habitat is just a place, not food, water, shelter and space
  | 'needs-mixup' // mixed up what an animal needs (food, water, shelter, space)
  | 'habitat-mixup' // mixed up what a habitat is like
  | 'layer-mixup' // mixed up the rainforest's layers
  | 'change-color' // thinks camouflage means changing color at will
  | 'bright-safe' // thinks bright colors mean safe or friendly
  | 'trees-no-matter' // thinks losing its trees would not matter to an animal
  | 'choose-body' // thinks an animal changes its body because it wants to
  | 'part-mixup' // picked a body part that helps somewhere else
  | 'hump-water' // thinks a camel's hump holds water
  | 'always-hot' // thinks every desert is hot, all the time
  | 'night-mixup' // mixed up when or why animals are busy
  | 'wrong-reason'; // gave a reason that does not explain it

/** What the panel shows above the question (the words in the question match it). */
export type Pic =
  /** One animal on its habitat's colors. */
  | { k: 'animal'; id: Critter }
  /** Two animals side by side. */
  | { k: 'pair'; a: Critter; b: Critter }
  /** A habitat card (its land, weather and plants). */
  | { k: 'scene'; hab: Habitat }
  /** The rainforest's three layers, with animals in each. */
  | { k: 'layers' }
  /** The desert by day (hot sun) and by night (cool moon). */
  | { k: 'daynight' };

/** The picture model that hint 2 adds. */
export type Model = 'needs' | 'layers' | 'map' | 'daynight' | 'card';

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

const an = (id: Critter): Pic => ({ k: 'animal', id });
const scene = (hab: Habitat): Pic => ({ k: 'scene', hab });

// ------------------------------------------------------------------ the Rainforest (Ranger Tala)

const RAINFOREST: QDef[] = [
  // level 1
  {
    id: 'r-shelter',
    tier: 1,
    ask: 'Every animal needs food, water, shelter and space. Shelter is a safe place to rest. What is shelter for a toucan?',
    right: 'A hole in a tree',
    wrong: [
      ['A pile of sand', 'live-anywhere', 'Sand is for desert animals. A toucan lives up in the trees.'],
      ['Some fruit', 'needs-mixup', 'Fruit is food. Shelter is a safe place to rest.'],
    ],
    explain: 'A toucan rests and lays its eggs in a hole in a tree. That is its shelter.',
    hints: ['Where would a toucan be safe to sleep?', 'Look at the four needs. Shelter is the house.'],
    pic: an('toucan'),
    model: 'needs',
  },
  {
    id: 'r-weather',
    tier: 1,
    ask: 'It rains in the rainforest almost every day. It is warm all year. What is the weather like there?',
    right: 'Warm and wet',
    wrong: [
      ['Cold and icy', 'habitat-mixup', 'Ice is at the Poles. The rainforest is warm all year.'],
      ['Hot and very dry', 'habitat-mixup', 'That is the desert. The rainforest gets rain almost every day.'],
    ],
    explain: 'The rainforest is warm and wet all year. That is why so many plants grow there.',
    hints: ['Listen to its name: rain forest.', 'Look at the map. Each home has its own weather.'],
    pic: scene('rainforest'),
    model: 'map',
  },
  {
    id: 'r-who',
    tier: 1,
    ask: 'Which animal lives in the rainforest?',
    right: 'A toucan',
    wrong: [
      ['A camel', 'live-anywhere', 'A camel needs dry, sandy land. The rainforest is wet all year.'],
      ['A polar bear', 'live-anywhere', 'A polar bear needs ice and cold. The rainforest is warm.'],
    ],
    explain: 'Toucans live in the rainforest. They eat its fruit and nest in its trees.',
    hints: ['Which animal needs tall trees full of fruit?', 'Look at the map. Which animal fits the warm, wet forest?'],
    pic: scene('rainforest'),
    model: 'map',
  },
  {
    id: 'r-food',
    tier: 1,
    ask: 'A spider monkey eats fruit. Where does it find fruit in the rainforest?',
    right: 'High up in the trees',
    wrong: [
      ['Buried in the sand', 'habitat-mixup', 'The rainforest floor is leaves and mud, not sand.'],
      ['Under the ice', 'habitat-mixup', 'There is no ice in the warm rainforest.'],
    ],
    explain: 'Fruit grows high in the treetops. Spider monkeys climb and swing up there to eat it.',
    hints: ['Where does fruit grow?', 'Look at the layers. The monkey lives at the top.'],
    pic: an('monkey'),
    model: 'layers',
  },
  {
    id: 'r-water',
    tier: 1,
    ask: 'Every animal needs water. The rainforest has lots of it. Where can a tapir find water?',
    right: 'In the stream',
    wrong: [
      ['Only inside a cactus', 'habitat-mixup', 'Cactus plants grow in the desert. The rainforest has streams and rain.'],
      ['Nowhere. Tapirs never drink.', 'needs-mixup', 'Every animal needs water to live.'],
    ],
    explain: 'Tapirs drink from streams, and they cool off in the water too.',
    hints: ['Look at the picture of the rainforest. Is there water?', 'Water is one of the four needs. The rainforest has streams.'],
    pic: an('tapir'),
    model: 'needs',
  },
  {
    id: 'r-space',
    tier: 1,
    ask: 'A jaguar needs lots of space to roam and hunt. Which home gives it the most space?',
    right: 'A big forest',
    wrong: [
      ['A tiny box', 'just-a-place', 'A small box has no room to roam or hunt.'],
      ['A small pond', 'habitat-mixup', 'A pond is water, with no room to roam on land.'],
    ],
    explain: 'A jaguar roams a big piece of forest to find food. Space is one of its four needs.',
    hints: ['A jaguar walks a long way to hunt. Which home is biggest?', 'Look at the four needs. Space means room to move and find food.'],
    pic: an('jaguar'),
    model: 'needs',
  },
  // level 2
  {
    id: 'r-layers',
    tier: 2,
    ask: 'The rainforest has layers. The forest floor is at the bottom. The understory is in the middle. The canopy is at the top. Where does the spider monkey live?',
    right: 'The canopy',
    wrong: [
      ['The forest floor', 'layer-mixup', 'The floor is the dark ground. The monkey swings high above it.'],
      ['Under the ground', 'layer-mixup', 'Monkeys live in trees, not in burrows.'],
    ],
    explain: 'Spider monkeys live in the canopy, the sunny treetops, where the fruit grows.',
    hints: ['Is the monkey up high or down low?', 'Look at the layers. The top one is the canopy.'],
    pic: { k: 'layers' },
    model: 'layers',
  },
  {
    id: 'r-floor',
    tier: 2,
    ask: 'The forest floor is dark and damp. Big animals walk there. Which animal lives on the forest floor?',
    right: 'The tapir',
    wrong: [
      ['The toucan', 'layer-mixup', 'Toucans fly and nest high up in the canopy.'],
      ['The sloth', 'layer-mixup', 'Sloths hang in the treetops. They come down only about once a week.'],
    ],
    explain: 'The tapir is too big to climb. It walks the forest floor, eating leaves and fruit.',
    hints: ['Which animal is too big and heavy to climb trees?', 'Look at the layers. Who is at the bottom?'],
    pic: { k: 'layers' },
    model: 'layers',
  },
  {
    id: 'r-understory',
    tier: 2,
    ask: 'The understory is the middle layer. It is shady, with small trees and big leaves. Which animal often rests there?',
    right: 'The red-eyed tree frog',
    wrong: [
      ['The tapir', 'layer-mixup', 'A tapir is big and heavy. It walks on the forest floor.'],
      ['The camel', 'live-anywhere', 'Camels live in the desert, not in a forest.'],
    ],
    explain: 'Red-eyed tree frogs sleep on big leaves in the shady understory, close to water.',
    hints: ['Which animal is small and sleeps on leaves?', 'Look at the layers. Who is in the middle?'],
    pic: { k: 'layers' },
    model: 'layers',
  },
  {
    id: 'r-sloth-green',
    tier: 2,
    ask: 'Tiny green plants called algae grow in a sloth’s fur. How does that help the sloth?',
    right: 'It helps the sloth hide in the leaves',
    wrong: [
      ['The sloth turns its fur green when it wants to', 'change-color', 'The green comes from tiny plants in its fur. The sloth cannot choose it.'],
      ['It keeps the sloth warm in the snow', 'habitat-mixup', 'The rainforest is warm, with no snow.'],
    ],
    explain: 'Green fur among green leaves is hard to see. Hiding by blending in is called camouflage.',
    hints: ['What color are the leaves around the sloth?', 'Blending in with your home is called camouflage.'],
    pic: an('sloth'),
    model: 'card',
  },
  {
    id: 'r-dart',
    tier: 2,
    ask: 'The poison dart frog is bright blue. Its skin tastes terrible. What does its bright color tell hungry animals?',
    right: 'Do not eat me!',
    wrong: [
      ['Come and eat me!', 'bright-safe', 'Bright colors here are a warning, not an invitation.'],
      ['I am friendly. Pick me up!', 'bright-safe', 'Never touch a bright frog. The color is a warning.'],
    ],
    explain: 'Bright colors warn hunters: this animal tastes bad, so leave it alone.',
    hints: ['The frog tastes terrible. What would it want to tell a bird?', 'Some animals hide. This one shows off to warn others away.'],
    pic: an('dart-frog'),
    model: 'card',
  },
  {
    id: 'r-frog-green',
    tier: 2,
    ask: 'A red-eyed tree frog has a green body. It sleeps on green leaves all day. Why is its green color useful?',
    right: 'It blends in with the leaves',
    wrong: [
      ['It shows hunters where it is', 'wrong-reason', 'Green on green leaves is hard to see, not easy.'],
      ['It keeps the frog dry', 'wrong-reason', 'A color cannot keep anything dry.'],
    ],
    explain: 'A green frog on a green leaf is hard to spot. That camouflage keeps it safe while it sleeps.',
    hints: ['Is a green frog easy or hard to see on a green leaf?', 'Think of the sloth. Its green fur helps it hide.'],
    pic: an('frog'),
    model: 'card',
  },
  // level 3
  {
    id: 'r-most-kinds',
    tier: 3,
    ask: 'More kinds of animals live in rainforests than anywhere else on land. Which reason helps explain it?',
    right: 'It is warm and wet all year, with food everywhere',
    wrong: [
      ['It is cold, so animals stay still', 'habitat-mixup', 'The rainforest is warm all year, not cold.'],
      ['Rainforest animals need nothing to live', 'needs-mixup', 'Every animal needs food, water, shelter and space.'],
    ],
    explain: 'Warmth and rain all year make plants grow everywhere, so there is food and shelter for very many animals.',
    hints: ['What does rain and warmth help to grow?', 'Look at the four needs. The rainforest has lots of all four.'],
    pic: scene('rainforest'),
    model: 'needs',
  },
  {
    id: 'r-trees-cut',
    tier: 3,
    ask: 'Some rainforest is cut down to make farms. What happens to a toucan if its trees are cut down?',
    right: 'It loses its food and its nest',
    wrong: [
      ['Nothing. It can live on the bare ground.', 'trees-no-matter', 'A toucan needs trees for fruit and for tree-hole nests.'],
      ['It grows thick fur and moves to the snow', 'choose-body', 'An animal cannot grow new body parts to move somewhere else.'],
    ],
    explain: 'The trees give the toucan its food and its shelter. Without them, it cannot live there.',
    hints: ['Which of its four needs come from the trees?', 'A toucan eats fruit and nests in tree holes.'],
    pic: an('toucan'),
    model: 'needs',
  },
  {
    id: 'r-tail',
    tier: 3,
    ask: 'A spider monkey’s tail can hold a branch like a hand. Which home is that tail best for?',
    right: 'The rainforest canopy',
    wrong: [
      ['The open desert', 'part-mixup', 'The desert has very few trees to hold on to.'],
      ['The icy sea', 'part-mixup', 'There are no branches to hold in the sea.'],
    ],
    explain: 'A tail that holds branches is perfect for swinging through the treetops of the canopy.',
    hints: ['What does the tail hold on to?', 'Look at the map. Which home has the most branches?'],
    pic: an('monkey'),
    model: 'map',
  },
  {
    id: 'r-bill',
    tier: 3,
    ask: 'A toucan’s long bill is very light, because it is full of tiny air pockets. Which job is it best for?',
    right: 'Reaching fruit on thin branches',
    wrong: [
      ['Digging burrows in the sand', 'part-mixup', 'Toucans do not dig. They nest high in trees.'],
      ['Breaking holes in thick ice', 'part-mixup', 'There is no ice in the rainforest.'],
    ],
    explain: 'Thin branches bend under a heavy bird. A long, light bill lets the toucan reach the fruit anyway.',
    hints: ['What does a toucan eat?', 'Fruit often grows at the very ends of thin branches.'],
    pic: an('toucan'),
    model: 'card',
  },
  {
    id: 'r-spots',
    tier: 3,
    ask: 'A jaguar cub is born with spotted fur, just like its mother. Where do its spots come from?',
    right: 'They are passed down from its parents',
    wrong: [
      ['The cub chose spots to hide better', 'choose-body', 'An animal cannot choose its body. Body parts come from its parents.'],
      ['It painted them on with mud', 'wrong-reason', 'The spots grow in its fur. They are not painted on.'],
    ],
    explain: 'Young animals get their body parts from their parents. That is why a cub looks like its mother.',
    hints: ['Who does a cub look like?', 'Body parts are not chosen. They are passed down.'],
    pic: an('jaguar'),
    model: 'card',
  },
  {
    id: 'r-sloth-desert',
    tier: 3,
    ask: 'A sloth hangs from branches with long, hooked claws. It eats leaves. Could a sloth live well in the desert?',
    right: 'No. The desert has few trees to hang from.',
    wrong: [
      ['Yes. Any animal can live anywhere.', 'live-anywhere', 'Each animal needs a home that gives it food, water, shelter and space.'],
      ['Yes, if it tried hard enough', 'choose-body', 'Trying cannot change its claws or what it eats.'],
    ],
    explain: 'A sloth’s body fits the trees. In the desert it could not find leaves or branches, so it could not live well.',
    hints: ['What does a sloth need to hang from?', 'Look at the map. Does the desert have tall, leafy trees?'],
    pic: an('sloth'),
    model: 'map',
  },
];

// ------------------------------------------------------------------ the Desert (Dr. Amara)

const DESERT: QDef[] = [
  // level 1
  {
    id: 'd-rain',
    tier: 1,
    ask: 'A desert gets very little rain. What is the ground like there?',
    right: 'Dry, with sand and rocks',
    wrong: [
      ['Wet and muddy all year', 'habitat-mixup', 'Mud needs lots of rain. The desert gets very little.'],
      ['Covered in thick ice', 'habitat-mixup', 'Ice covers the Poles. This desert is hot and dry.'],
    ],
    explain: 'With so little rain, desert ground is dry: sand, rocks and a few tough plants.',
    hints: ['What happens to the ground when it hardly ever rains?', 'Look at the map. Each home has its own weather.'],
    pic: scene('desert'),
    model: 'map',
  },
  {
    id: 'd-who',
    tier: 1,
    ask: 'Which animal lives in the desert?',
    right: 'A camel',
    wrong: [
      ['A sloth', 'live-anywhere', 'A sloth needs tall, leafy trees. The desert has very few.'],
      ['A penguin', 'live-anywhere', 'A penguin needs icy water and fish.'],
    ],
    explain: 'Camels live in the desert. They can walk on sand and go days without a drink.',
    hints: ['Which animal can go for days without water?', 'Look at the map. Which animal fits the dry sand?'],
    pic: scene('desert'),
    model: 'map',
  },
  {
    id: 'd-shade',
    tier: 1,
    ask: 'The desert sun is very hot in the middle of the day. What do many desert animals do then?',
    right: 'Rest in the shade or in a burrow',
    wrong: [
      ['Run around in the hot sun', 'night-mixup', 'Midday is the hottest time. Running then would make them far too hot.'],
      ['Go for a swim in the sea', 'habitat-mixup', 'There is no sea in the desert.'],
    ],
    explain: 'Shade and burrows are cooler. Many desert animals rest there until the evening.',
    hints: ['Where do you go on a very hot day?', 'Look at the picture: hot by day, cool by night.'],
    pic: { k: 'daynight' },
    model: 'daynight',
  },
  {
    id: 'd-water',
    tier: 1,
    ask: 'Water is hard to find in the desert. Where can animals drink?',
    right: 'At a water hole',
    wrong: [
      ['From the snow', 'habitat-mixup', 'A hot desert gets almost no snow.'],
      ['From puddles every day', 'habitat-mixup', 'Rain is rare in the desert, so puddles dry up fast.'],
    ],
    explain: 'A water hole is a rare pool in the desert. Many animals come to drink there.',
    hints: ['Look at the desert picture. Is there any water?', 'Water is one of the four needs. In the desert it is rare.'],
    pic: scene('desert'),
    model: 'needs',
  },
  {
    id: 'd-burrow',
    tier: 1,
    ask: 'A desert tortoise digs a burrow under the ground. What does the burrow give it?',
    right: 'Shelter from the heat and the cold',
    wrong: [
      ['Food to eat', 'needs-mixup', 'A burrow is a home, not food. The tortoise eats plants.'],
      ['Water to swim in', 'needs-mixup', 'A burrow is dry. It is a safe place to rest.'],
    ],
    explain: 'Under the ground it stays cool in the day and warmer at night. The burrow is the tortoise’s shelter.',
    hints: ['Is a burrow food, water, shelter or space?', 'Look at the four needs. Which one is a safe place to rest?'],
    pic: an('tortoise'),
    model: 'needs',
  },
  {
    id: 'd-cactus',
    tier: 1,
    ask: 'A cactus grows in the desert. Its thick stem stores water. Why is that useful there?',
    right: 'Rain is rare, so it saves water for later',
    wrong: [
      ['The desert floods every day', 'habitat-mixup', 'The desert is dry. It hardly ever rains.'],
      ['So animals cannot see it', 'wrong-reason', 'A cactus is easy to see. Its stem is a water store.'],
    ],
    explain: 'Rain is rare in the desert. A cactus soaks up water when it rains and keeps it for the dry days.',
    hints: ['Does it rain a lot in the desert?', 'Saving water is smart when it hardly ever rains.'],
    pic: scene('desert'),
    model: 'needs',
  },
  // level 2
  {
    id: 'd-hump',
    tier: 2,
    ask: 'A camel has a big hump on its back. What is inside the hump?',
    right: 'Fat, which the camel uses for energy',
    wrong: [
      ['Water to drink', 'hump-water', 'Many people think so! But the hump holds fat, not water.'],
      ['A baby camel', 'wrong-reason', 'Baby camels grow inside their mother, not in a hump.'],
    ],
    explain: 'The hump is fat. When food is hard to find, the camel’s body uses the fat for energy.',
    hints: ['It is not water. What else could a body store for later?', 'Look at the camel’s card in your journal.'],
    pic: an('camel'),
    model: 'card',
  },
  {
    id: 'd-ears',
    tier: 2,
    ask: 'A fennec fox has giant ears. Heat leaves its body through them. How do big ears help in the desert?',
    right: 'They help the fox stay cool',
    wrong: [
      ['They keep the fox warm in the snow', 'part-mixup', 'There is no snow in a hot desert. Big ears let heat out.'],
      ['They store water', 'wrong-reason', 'Ears do not store water.'],
    ],
    explain: 'Big ears let lots of heat leave the fox’s body. That keeps it cool. They also help it hear bugs under the sand.',
    hints: ['Heat leaves through the ears. Is the fox getting hotter or cooler?', 'Look at the fox’s card in your journal.'],
    pic: an('fennec'),
    model: 'card',
  },
  {
    id: 'd-night',
    tier: 2,
    ask: 'Many desert animals sleep in the day and come out at night. Why?',
    right: 'The night is cooler',
    wrong: [
      ['They are scared of the sun', 'wrong-reason', 'It is about the heat, not fear.'],
      ['Food only grows at night', 'wrong-reason', 'Plants grow by day too. This is about the heat.'],
    ],
    explain: 'The desert cools down at night. It is easier to hunt and move about when it is not so hot.',
    hints: ['When is the desert hottest?', 'Look at the picture: the sun by day, the moon by night.'],
    pic: { k: 'daynight' },
    model: 'daynight',
  },
  {
    id: 'd-roadrunner',
    tier: 2,
    ask: 'A roadrunner has long, strong legs. It chases lizards across the open ground. What helps it catch food?',
    right: 'Running fast',
    wrong: [
      ['Swimming in deep water', 'part-mixup', 'There is very little water in the desert.'],
      ['Hanging by its tail', 'part-mixup', 'That is the spider monkey, up in the rainforest trees.'],
    ],
    explain: 'Long, strong legs let the roadrunner run as fast as a bicycle and catch quick lizards.',
    hints: ['Look at its legs. What are they for?', 'Its name tells you: road RUNNER.'],
    pic: an('roadrunner'),
    model: 'card',
  },
  {
    id: 'd-tortoise-water',
    tier: 2,
    ask: 'A desert tortoise rarely finds water to drink. How does it get the water it needs?',
    right: 'From the plants it eats',
    wrong: [
      ['It never needs water', 'needs-mixup', 'Every animal needs water to live.'],
      ['From inside its shell', 'wrong-reason', 'The shell is armor, not a water tank.'],
    ],
    explain: 'Desert plants hold water. The tortoise gets most of its water by eating them.',
    hints: ['Every animal needs water. Where else is there water, if not in a pool?', 'Think of the cactus. Desert plants store water.'],
    pic: an('tortoise'),
    model: 'card',
  },
  {
    id: 'd-feet',
    tier: 2,
    ask: 'A camel walks on soft sand all day. Its feet are wide and flat. How do wide feet help?',
    right: 'They stop the camel sinking into the sand',
    wrong: [
      ['They help it climb trees', 'part-mixup', 'Camels do not climb. The desert has few trees.'],
      ['They are for swimming', 'part-mixup', 'There is very little water to swim in.'],
    ],
    explain: 'Wide feet spread the camel’s weight, like snowshoes, so it does not sink into soft sand.',
    hints: ['What is hard about walking on soft sand?', 'Big, wide feet spread out the weight.'],
    pic: an('camel'),
    model: 'card',
  },
  // level 3
  {
    id: 'd-cold-night',
    tier: 3,
    ask: 'In this desert, a summer day can be 40 °C (104 °F). That night it can drop to 15 °C (59 °F). Which is true?',
    right: 'Deserts can be hot by day and cool at night',
    wrong: [
      ['Deserts are hot all the time', 'always-hot', 'Look at the night number. It is much cooler.'],
      ['Deserts are cold all the time', 'habitat-mixup', 'Look at the day number. 40 °C is very hot.'],
    ],
    explain: 'With few clouds to hold the heat in, deserts cool down fast after sunset.',
    hints: ['Compare the two numbers. Which is bigger?', 'Look at the picture: the sun by day, the moon by night.'],
    pic: { k: 'daynight' },
    model: 'daynight',
  },
  {
    id: 'd-antarctica',
    tier: 3,
    ask: 'A desert is a place with very little rain or snow. Antarctica gets very little snow each year. What is Antarctica?',
    right: 'A cold desert, the biggest in the world',
    wrong: [
      ['Not a desert, because deserts must be hot', 'always-hot', 'A desert is about how little rain or snow falls, not how hot it is.'],
      ['A rainforest', 'habitat-mixup', 'Rainforests are warm and get rain almost every day.'],
    ],
    explain: 'Antarctica is so dry that it is a desert. It is the biggest desert on Earth, and the coldest.',
    hints: ['Read the first sentence again. What makes a desert a desert?', 'Little rain or snow. Does it say anything about heat?'],
    pic: scene('poles'),
    model: 'map',
  },
  {
    id: 'd-arctic-ears',
    tier: 3,
    ask: 'The fennec fox has giant ears that let heat out. The Arctic fox has small ears that keep heat in. Why are the Arctic fox’s ears small?',
    right: 'Its home is freezing cold',
    wrong: [
      ['It chose small ears', 'choose-body', 'An animal cannot choose its body. It gets it from its parents.'],
      ['Small ears hear better', 'wrong-reason', 'Big ears usually hear better. This is about heat.'],
    ],
    explain: 'Small ears lose less heat. That helps in the freezing Arctic. Big ears help in the hot desert.',
    hints: ['Big ears let heat out. What do small ears do?', 'Is the Arctic hot or cold?'],
    pic: { k: 'pair', a: 'fennec', b: 'arctic-fox' },
    model: 'card',
  },
  {
    id: 'd-which-part',
    tier: 3,
    ask: 'Which body part helps an animal in the hot desert, but would not help in the freezing Arctic?',
    right: 'Giant ears that let out heat',
    wrong: [
      ['Thick fur and a layer of fat', 'part-mixup', 'Thick fur keeps heat in. That helps in the cold, not the heat.'],
      ['Flippers for swimming', 'part-mixup', 'The desert has no sea to swim in.'],
    ],
    explain: 'In the desert, losing heat helps. In the Arctic, losing heat would make an animal far too cold.',
    hints: ['In the desert, does an animal want to lose heat or keep it?', 'Think of the fennec fox.'],
    pic: an('fennec'),
    model: 'map',
  },
  {
    id: 'd-gecko-eyes',
    tier: 3,
    ask: 'A gecko hides from the sun by day and hunts bugs at night. Its eyes are very big. What do big eyes help it do?',
    right: 'See in the dim light',
    wrong: [
      ['Stay cool', 'wrong-reason', 'Eyes are for seeing, not for cooling down.'],
      ['Store water', 'wrong-reason', 'Eyes do not store water.'],
    ],
    explain: 'Big eyes let in more light, so the gecko can see bugs at night.',
    hints: ['When does the gecko hunt?', 'At night it is dark. What would help it see?'],
    pic: an('gecko'),
    model: 'card',
  },
  {
    id: 'd-frog-moved',
    tier: 3,
    ask: 'A rainforest tree frog needs damp leaves and water nearby. What would happen if it lived in the dry desert?',
    right: 'It would dry out and could not live well',
    wrong: [
      ['It would grow a hump', 'choose-body', 'An animal cannot grow new body parts to fit a new home.'],
      ['It would be fine. Frogs can live anywhere.', 'live-anywhere', 'Each animal needs a home that gives it what it needs.'],
    ],
    explain: 'The tree frog’s body fits wet places. In the dry desert it would not find the water it needs.',
    hints: ['What does a tree frog need?', 'Look at the map. Is the desert damp?'],
    pic: an('frog'),
    model: 'map',
  },
];

const BANKS: Partial<Record<Station, QDef[]>> = { rainforest: RAINFOREST, desert: DESERT };

export type Rand = () => number;

export function shuffle<T>(r: Rand, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1)) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function bank(s: Station): QDef[] {
  return BANKS[s] ?? [];
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
