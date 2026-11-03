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
 *   The Poles (Ranger Tala): north and south, and staying warm
 *     1. polar bears in the north, penguins in the south; fur and fat;
 *        who lives in the Arctic; seals for food; flipper-wings; sea ice
 *     2. polar bears and wild penguins never meet; blubber; white fur on
 *        the snow; the Arctic fox's seasons; feathered feet; tusks
 *        (1-LS1-1, 4-LS1-1)
 *     3. migration; less sea ice makes hunting harder (said gently); small
 *        ears lose less heat; a polar bear in a rainforest; blubber at both
 *        ends of the Earth (3-LS4-3)
 *   The Wetland and the Sea (Dr. Amara): water homes
 *     1. gills; frogs need water for their eggs; fresh and salt water;
 *        webbed feet; the beaver's lodge; who lives here (K-ESS3-1)
 *     2. a frog's life cycle; tadpoles in water; whales and dolphins are
 *        mammals that breathe air; the beaver's dam; a crocodile's eyes
 *        on top (2-LS4-1, 3-LS1-1)
 *     3. a sea fish in a river; a pond food chain; a wetland is a
 *        nursery; a heron's legs; migration is not hibernation; fish in
 *        fresh water too (3-LS4-3)
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
/** Every trip has a question bank. */
export const STATIONS: Station[] = ['rainforest', 'desert', 'poles', 'wetland'];
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
  | 'penguin-north' // thinks penguins live in the Arctic
  | 'bears-penguins-meet' // thinks polar bears and wild penguins live together
  | 'home-loss' // thinks losing part of its home (trees, sea ice) would not matter
  | 'migration-mixup' // mixed up migration (with getting lost, or with hibernation)
  | 'whale-fish' // thinks a whale or dolphin is a fish
  | 'breathe-water' // thinks a dolphin or whale breathes water
  | 'fresh-salt' // mixed up fresh water and salt water
  | 'all-fish-sea' // thinks all fish live in the sea, or can live in any water
  | 'frog-cycle' // mixed up a frog's life cycle
  | 'owl-dark' // thinks owls can see in total darkness
  | 'bats-blind' // thinks bats are blind
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
  | { k: 'daynight' }
  /** The Earth with the Arctic at the top (a polar bear) and Antarctica at the bottom (a penguin). */
  | { k: 'globe' }
  /** A frog's life cycle: egg, tadpole, froglet, frog. */
  | { k: 'lifecycle' }
  /** Fresh water (a pond and river) next to salt water (the sea). */
  | { k: 'water' };

/** The picture model that hint 2 adds. */
export type Model = 'needs' | 'layers' | 'map' | 'daynight' | 'card' | 'globe' | 'lifecycle' | 'water';

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

// ------------------------------------------------------------------ the Poles (Ranger Tala)

const globe: Pic = { k: 'globe' };
const lifecycle: Pic = { k: 'lifecycle' };
const water: Pic = { k: 'water' };

const POLES: QDef[] = [
  // level 1
  {
    id: 'p-penguins',
    tier: 1,
    ask: 'Polar bears live in the Arctic, at the top of the world. Where do wild penguins live?',
    right: 'Far in the south, around Antarctica',
    wrong: [
      ['In the Arctic, with the polar bears', 'penguin-north', 'No wild penguins live in the Arctic. Cartoons often get this wrong!'],
      ['In the hot desert', 'live-anywhere', 'Penguins need icy water full of fish.'],
    ],
    explain: 'Wild penguins live in the southern half of the world, most of them around Antarctica, at the bottom.',
    hints: ['Look at the globe. Is the polar bear at the top or the bottom?', 'The penguin is at the other end of the Earth.'],
    pic: globe,
    model: 'globe',
  },
  {
    id: 'p-warm',
    tier: 1,
    ask: 'The Poles are freezing cold. Ice and snow cover them most of the year. What helps animals there stay warm?',
    right: 'Thick fur and fat',
    wrong: [
      ['Big ears that let out heat', 'part-mixup', 'Letting heat out would make an animal colder, not warmer.'],
      ['Thin, bare skin', 'part-mixup', 'Bare skin would lose heat fast in the cold.'],
    ],
    explain: 'Thick fur and a layer of fat called blubber hold the heat in, like a warm coat.',
    hints: ['What do you wear on a freezing day?', 'Look at the polar bear’s card in your journal.'],
    pic: an('polar-bear'),
    model: 'card',
  },
  {
    id: 'p-who',
    tier: 1,
    ask: 'Which animal lives in the Arctic, at the top of the world?',
    right: 'A polar bear',
    wrong: [
      ['A penguin', 'penguin-north', 'Penguins live in the south, not in the Arctic.'],
      ['A camel', 'live-anywhere', 'A camel needs dry, sandy land. The Arctic is icy.'],
    ],
    explain: 'Polar bears live only in the Arctic, in the far north.',
    hints: ['Look at the globe. Who is at the top?', 'The penguin is at the bottom of the globe.'],
    pic: globe,
    model: 'globe',
  },
  {
    id: 'p-food',
    tier: 1,
    ask: 'A polar bear is a hunter. It hunts on the sea ice. What does it mostly eat?',
    right: 'Seals',
    wrong: [
      ['Cactus', 'habitat-mixup', 'No cactus grows on the ice.'],
      ['Fruit from tall trees', 'habitat-mixup', 'There are no fruit trees out on the sea ice.'],
    ],
    explain: 'Polar bears wait by holes in the ice and catch seals when they come up to breathe.',
    hints: ['What animals live in the icy sea?', 'Look at the polar bear’s card in your journal.'],
    pic: an('polar-bear'),
    model: 'card',
  },
  {
    id: 'p-flippers',
    tier: 1,
    ask: 'A penguin has wings, but it cannot fly. What does it use its wings for?',
    right: 'Swimming',
    wrong: [
      ['Digging in the sand', 'part-mixup', 'Penguins live on ice, not sand.'],
      ['Climbing trees', 'part-mixup', 'There are no trees in Antarctica.'],
    ],
    explain: 'A penguin’s wings are stiff flippers. Under water, they flap them to swim very fast.',
    hints: ['Where does a penguin find its fish?', 'Look at the penguin’s card in your journal.'],
    pic: an('penguin'),
    model: 'card',
  },
  {
    id: 'p-sea-ice',
    tier: 1,
    ask: 'Sea ice is frozen sea water. Polar bears walk out on it. Why is sea ice important to a polar bear?',
    right: 'It hunts seals from the ice',
    wrong: [
      ['It eats the ice', 'wrong-reason', 'Ice is frozen water, not food.'],
      ['The ice keeps it warm', 'wrong-reason', 'Ice is cold! Fur and fat keep it warm.'],
    ],
    explain: 'Seals come up through holes in the sea ice to breathe. The polar bear waits there to catch them.',
    hints: ['What does a polar bear eat?', 'Seals swim under the ice and come up to breathe.'],
    pic: scene('poles'),
    model: 'needs',
  },
  // level 2
  {
    id: 'p-never-meet',
    tier: 2,
    ask: 'Polar bears live only in the north. Wild penguins live only in the south. Does a polar bear ever meet a wild penguin?',
    right: 'No. They live at opposite ends of the Earth.',
    wrong: [
      ['Yes. They share the same ice.', 'bears-penguins-meet', 'Cartoons show them together, but they live far apart.'],
      ['Yes, every winter', 'bears-penguins-meet', 'The whole world lies between their homes.'],
    ],
    explain: 'The Arctic is at the top of the Earth and Antarctica at the bottom. Polar bears and wild penguins never meet.',
    hints: ['Look at the globe. How far apart are they?', 'One lives at the top of the Earth, one at the bottom.'],
    pic: globe,
    model: 'globe',
  },
  {
    id: 'p-blubber',
    tier: 2,
    ask: 'Blubber is a thick layer of fat under the skin. Walruses and seals have lots of it. What does blubber do?',
    right: 'It keeps the body warm',
    wrong: [
      ['It helps them see in the dark', 'wrong-reason', 'Blubber is under the skin. It has nothing to do with seeing.'],
      ['It stores water for later', 'hump-water', 'Like a camel’s hump, blubber is fat, not water.'],
    ],
    explain: 'Blubber works like a thick blanket. It keeps the heat in, even in icy water.',
    hints: ['Where do walruses swim?', 'Fat under the skin works like a warm blanket.'],
    pic: an('walrus'),
    model: 'card',
  },
  {
    id: 'p-white-fur',
    tier: 2,
    ask: 'A polar bear has white fur. Its home is covered in snow and ice. How does its white fur help it hunt?',
    right: 'Seals have a hard time seeing it',
    wrong: [
      ['It scares the seals away', 'wrong-reason', 'A hunter wants to stay hidden, not be seen.'],
      ['It turns white whenever it wants to hide', 'change-color', 'Its fur is white all the time. The bear cannot choose.'],
    ],
    explain: 'White fur on white snow is hard to see. That camouflage helps the bear get close to seals.',
    hints: ['Is a white bear easy or hard to see on snow?', 'Think of the green tree frog on a green leaf.'],
    pic: an('polar-bear'),
    model: 'card',
  },
  {
    id: 'p-fox-fur',
    tier: 2,
    ask: 'The Arctic fox has white fur in winter and brown fur in summer. Why does its fur change?',
    right: 'To match the snow in winter and the ground in summer',
    wrong: [
      ['It picks a new color each day', 'change-color', 'The change is slow, with the seasons. The fox cannot pick.'],
      ['To stay cool in winter', 'wrong-reason', 'Winter is the cold time. Its thick winter fur keeps it warm.'],
    ],
    explain: 'In winter the land is snowy, in summer it is brown. The fox’s new fur grows in the color that blends in.',
    hints: ['What color is the Arctic in winter? And in summer?', 'Blending in is called camouflage.'],
    pic: an('arctic-fox'),
    model: 'card',
  },
  {
    id: 'p-owl-feet',
    tier: 2,
    ask: 'A snowy owl has feathers all the way down to its toes. How does that help it?',
    right: 'It keeps its feet warm',
    wrong: [
      ['It helps it swim', 'part-mixup', 'Owls do not swim. Feathers on toes are about the cold.'],
      ['It helps it dig burrows', 'part-mixup', 'Snowy owls nest on the ground, but they do not dig.'],
    ],
    explain: 'Feathered feet are like warm slippers on the snow.',
    hints: ['What is the ground like in the Arctic?', 'Look at the snowy owl’s card in your journal.'],
    pic: an('snowy-owl'),
    model: 'card',
  },
  {
    id: 'p-tusks',
    tier: 2,
    ask: 'A walrus has two long tusks. What does it use them for?',
    right: 'Pulling itself out of the water onto the ice',
    wrong: [
      ['Catching flies', 'wrong-reason', 'Walruses eat clams on the sea floor, not flies.'],
      ['Keeping warm', 'wrong-reason', 'Blubber keeps it warm. The tusks have another job.'],
    ],
    explain: 'A walrus hooks its tusks on the ice and pulls its heavy body up, like using two ice picks.',
    hints: ['A walrus is very heavy. How does it climb out of the water?', 'Look at the walrus’s card in your journal.'],
    pic: an('walrus'),
    model: 'card',
  },
  // level 3
  {
    id: 'p-migration',
    tier: 3,
    ask: 'Humpback whales feed in cold polar seas. Each winter they swim to warm seas to have their babies. What is this long trip called?',
    right: 'Migration',
    wrong: [
      ['Hibernation', 'migration-mixup', 'Hibernation is a long winter sleep. The whales keep swimming.'],
      ['Getting lost', 'migration-mixup', 'They go the same way every year, on purpose.'],
    ],
    explain: 'A long trip that animals make every year, to find food or raise their young, is called migration.',
    hints: ['Do the whales sleep, or do they travel?', 'Look at the globe: from the cold seas to warm ones and back.'],
    pic: an('whale'),
    model: 'globe',
  },
  {
    id: 'p-less-ice',
    tier: 3,
    ask: 'As the Earth gets warmer, the Arctic has less sea ice. Why is that hard for polar bears?',
    right: 'They hunt seals from the ice, so less ice means less food',
    wrong: [
      ['Nothing changes for them', 'home-loss', 'The ice is part of their home. They need it to find food.'],
      ['They will grow flippers and live in the sea', 'choose-body', 'An animal cannot grow new body parts to fit a new home.'],
    ],
    explain: 'Polar bears catch seals from the sea ice. With less ice, hunting is harder. Scientists are working to help.',
    hints: ['Where does a polar bear hunt?', 'Look at the four needs. Which need does the ice help with?'],
    pic: scene('poles'),
    model: 'needs',
  },
  {
    id: 'p-small-ears',
    tier: 3,
    ask: 'Many Arctic animals have small ears and short legs. The fennec fox in the desert has giant ears. Why are the Arctic ears small?',
    right: 'Small ears lose less heat',
    wrong: [
      ['Small ears hear better in the snow', 'wrong-reason', 'Big ears usually hear better. This is about heat.'],
      ['The animals chose small ears', 'choose-body', 'Animals get their body parts from their parents.'],
    ],
    explain: 'Body parts that stick out lose heat. In the cold, small ears help an animal stay warm.',
    hints: ['Big ears let heat out. Is that good in the cold?', 'Compare the two foxes in the picture.'],
    pic: { k: 'pair', a: 'fennec', b: 'arctic-fox' },
    model: 'card',
  },
  {
    id: 'p-bear-rainforest',
    tier: 3,
    ask: 'A polar bear has thick fur and blubber. It hunts seals on the sea ice. Could it live well in the warm rainforest?',
    right: 'No. It would be too hot, with no ice or seals.',
    wrong: [
      ['Yes. Any animal can live anywhere.', 'live-anywhere', 'Each animal needs a home that gives it what it needs.'],
      ['Yes, if it grew thinner fur', 'choose-body', 'An animal cannot change its body to fit a new home.'],
    ],
    explain: 'A polar bear’s body fits the freezing Arctic. In a warm rainforest it would overheat and find no seals.',
    hints: ['Is the rainforest hot or cold?', 'Look at the map. Is there sea ice in the rainforest?'],
    pic: an('polar-bear'),
    model: 'map',
  },
  {
    id: 'p-both-blubber',
    tier: 3,
    ask: 'The walrus lives in the Arctic. The Weddell seal lives in Antarctica. Both have blubber and flippers. Why?',
    right: 'Both live in icy seas',
    wrong: [
      ['They are the same animal', 'wrong-reason', 'They are different animals, at opposite ends of the Earth.'],
      ['They swim to visit each other', 'bears-penguins-meet', 'The whole world lies between the Arctic and Antarctica.'],
    ],
    explain: 'Animals in the same kind of home often have body parts that help in the same way, even far apart.',
    hints: ['What is the water like at both ends of the Earth?', 'Look at the globe: icy at the top and the bottom.'],
    pic: { k: 'pair', a: 'walrus', b: 'seal' },
    model: 'globe',
  },
  {
    id: 'p-midnight-sun',
    tier: 3,
    ask: 'In the Arctic summer, the sun shines all day and all night. When does the snowy owl hunt in summer?',
    right: 'In daylight, because the sun never sets',
    wrong: [
      ['Only in the dark of night', 'night-mixup', 'In the Arctic summer there is no dark night.'],
      ['It does not eat all summer', 'needs-mixup', 'Every animal needs food, all year round.'],
    ],
    explain: 'Most owls hunt at night, but the snowy owl has no night in summer. It hunts in the midnight sun.',
    hints: ['If the sun never sets, is there ever a dark night?', 'Look at the snowy owl’s card in your journal.'],
    pic: an('snowy-owl'),
    model: 'card',
  },
];

// ------------------------------------------------------------------ the Wetland and the Sea (Dr. Amara)

const WETLAND: QDef[] = [
  // level 1
  {
    id: 'w-gills',
    tier: 1,
    ask: 'Fish live under water all the time. They breathe with gills. What do gills do?',
    right: 'Help fish breathe under water',
    wrong: [
      ['Help fish fly', 'wrong-reason', 'Fish do not fly. Gills are for breathing.'],
      ['Help fish walk on land', 'wrong-reason', 'Most fish cannot live on land at all.'],
    ],
    explain: 'Gills take in the air that is mixed into water. That lets fish breathe under water.',
    hints: ['Fish stay under water. What do they still need to do?', 'You breathe with lungs. Fish use gills.'],
    pic: water,
    model: 'water',
  },
  {
    id: 'w-frog-eggs',
    tier: 1,
    ask: 'Frogs lay their eggs in water. Why does a frog need a pond nearby?',
    right: 'Its eggs and tadpoles need water',
    wrong: [
      ['Frogs never go in water', 'habitat-mixup', 'Frogs start life in water as eggs and tadpoles.'],
      ['To find cactus to eat', 'habitat-mixup', 'Frogs eat bugs. Cactus grows in the desert.'],
    ],
    explain: 'Frog eggs hatch into tadpoles, which live in water until they grow into frogs.',
    hints: ['Look at the picture. Where do the eggs and tadpoles live?', 'A tadpole cannot live on dry land.'],
    pic: lifecycle,
    model: 'lifecycle',
  },
  {
    id: 'w-salty',
    tier: 1,
    ask: 'Pond and river water is fresh. Sea water is salty. Which one is salty?',
    right: 'The sea',
    wrong: [
      ['The pond', 'fresh-salt', 'Ponds are fresh water, filled by rain and streams.'],
      ['The river', 'fresh-salt', 'Rivers carry fresh water from rain and snow.'],
    ],
    explain: 'The sea is salty. Ponds, lakes and rivers are fresh water.',
    hints: ['Look at the picture. Which water is labeled salty?', 'Have you ever tasted sea water? It is salty!'],
    pic: water,
    model: 'water',
  },
  {
    id: 'w-webbed',
    tier: 1,
    ask: 'A duck has webbed feet, with skin between its toes. What are webbed feet good for?',
    right: 'Paddling through water',
    wrong: [
      ['Climbing trees', 'part-mixup', 'Ducks swim. Webbed feet are like paddles.'],
      ['Digging in the sand', 'part-mixup', 'Webbed feet are for water, not sand.'],
    ],
    explain: 'Webbed feet push lots of water, like paddles, so the duck swims well.',
    hints: ['Where does a duck spend its time?', 'Swim fins work the same way.'],
    pic: an('duck'),
    model: 'card',
  },
  {
    id: 'w-lodge',
    tier: 1,
    ask: 'A beaver builds a lodge of sticks and mud in its pond. What is the lodge for?',
    right: 'A safe home to rest in',
    wrong: [
      ['Food to eat', 'needs-mixup', 'Beavers eat bark and plants. The lodge is their home.'],
      ['Water to drink', 'needs-mixup', 'The pond gives water. The lodge is something else.'],
    ],
    explain: 'The lodge is the beaver’s shelter. Its door is under water, so it stays safe.',
    hints: ['Is a lodge food, water, shelter or space?', 'Look at the four needs. Shelter is a safe place to rest.'],
    pic: an('beaver'),
    model: 'needs',
  },
  {
    id: 'w-who',
    tier: 1,
    ask: 'Which animal lives in the wetland?',
    right: 'A beaver',
    wrong: [
      ['A camel', 'live-anywhere', 'A camel needs dry, sandy land.'],
      ['A polar bear', 'live-anywhere', 'A polar bear needs ice and cold.'],
    ],
    explain: 'Beavers live in ponds and streams. They build dams and lodges there.',
    hints: ['Which animal needs a pond?', 'Look at the map. Which animal fits the water?'],
    pic: scene('wetland'),
    model: 'map',
  },
  // level 2
  {
    id: 'w-cycle',
    tier: 2,
    ask: 'A frog starts life as an egg. Then it is a tadpole, then a froglet. What comes next?',
    right: 'A frog',
    wrong: [
      ['A fish', 'frog-cycle', 'A tadpole looks a bit like a fish, but it keeps growing legs.'],
      ['An egg again', 'frog-cycle', 'The egg comes first, at the start.'],
    ],
    explain: 'Egg, tadpole, froglet, frog. Then the frog lays eggs, and the cycle starts again.',
    hints: ['Follow the arrows in the picture.', 'A froglet has legs and a short tail. What does it become?'],
    pic: lifecycle,
    model: 'lifecycle',
  },
  {
    id: 'w-tadpole',
    tier: 2,
    ask: 'A tadpole has a tail and breathes with gills. A grown frog breathes air. Where does a tadpole live?',
    right: 'In the water',
    wrong: [
      ['High in a tree', 'frog-cycle', 'Only grown frogs can climb out. Tadpoles need water.'],
      ['In the desert sand', 'habitat-mixup', 'Sand is dry. A tadpole would dry out.'],
    ],
    explain: 'Tadpoles breathe with gills, like fish, so they live in water until they grow legs and lungs.',
    hints: ['What do gills need?', 'Look at the life cycle picture.'],
    pic: lifecycle,
    model: 'lifecycle',
  },
  {
    id: 'w-whale',
    tier: 2,
    ask: 'A whale lives in the sea. It breathes air and feeds its babies milk. Is a whale a fish?',
    right: 'No. It is a mammal.',
    wrong: [
      ['Yes. Everything in the sea is a fish.', 'whale-fish', 'Some sea animals, like whales and dolphins, are mammals.'],
      ['Yes, because it swims', 'whale-fish', 'Swimming does not make an animal a fish.'],
    ],
    explain: 'Mammals breathe air and feed their babies milk. Whales do both, just like people.',
    hints: ['Fish breathe with gills. What does a whale breathe?', 'Who else feeds babies milk?'],
    pic: an('whale'),
    model: 'card',
  },
  {
    id: 'w-dolphin',
    tier: 2,
    ask: 'A dolphin swims all day. It has a blowhole on top of its head. How does a dolphin breathe?',
    right: 'It comes up to breathe air',
    wrong: [
      ['It breathes water with gills', 'breathe-water', 'Dolphins have no gills. They breathe air, like you.'],
      ['It never needs to breathe', 'needs-mixup', 'Every animal needs to breathe.'],
    ],
    explain: 'A dolphin swims up, breathes air through its blowhole, then dives again.',
    hints: ['What is a blowhole for?', 'Look at the dolphin’s card in your journal.'],
    pic: an('dolphin'),
    model: 'card',
  },
  {
    id: 'w-dam',
    tier: 2,
    ask: 'A beaver builds a dam across a stream. The water piles up behind it. What does the dam make?',
    right: 'A pond',
    wrong: [
      ['A desert', 'wrong-reason', 'A desert is dry. The dam holds water back.'],
      ['A mountain', 'wrong-reason', 'A dam is sticks and mud, not rock.'],
    ],
    explain: 'The dam holds back the stream, so a deep pond fills up. The beaver builds its lodge there.',
    hints: ['What happens to water that cannot flow away?', 'Look at the beaver’s card in your journal.'],
    pic: an('beaver'),
    model: 'card',
  },
  {
    id: 'w-croc',
    tier: 2,
    ask: 'A crocodile’s eyes and nose are on top of its head. How does that help it in the river?',
    right: 'It can see and breathe while hiding under water',
    wrong: [
      ['It helps it climb trees', 'part-mixup', 'Crocodiles do not climb. This is about hiding in water.'],
      ['It keeps it warm in the snow', 'part-mixup', 'Crocodiles live in warm places.'],
    ],
    explain: 'With only its eyes and nose above the water, the crocodile can watch and breathe while staying hidden.',
    hints: ['What sticks out when the crocodile hides?', 'Look at the crocodile’s card in your journal.'],
    pic: an('crocodile'),
    model: 'card',
  },
  // level 3
  {
    id: 'w-sea-fish',
    tier: 3,
    ask: 'Most sea fish need salty water. Most river fish need fresh water. What would happen to a sea fish put in a river?',
    right: 'It could not live well there',
    wrong: [
      ['It would be fine. All fish can live anywhere.', 'all-fish-sea', 'Most fish need one kind of water.'],
      ['It would turn into a river fish', 'choose-body', 'An animal cannot change its body to fit a new home.'],
    ],
    explain: 'A sea fish’s body is made for salty water. In fresh water it could not live well.',
    hints: ['Is river water salty?', 'Look at the picture: fresh on one side, salty on the other.'],
    pic: water,
    model: 'water',
  },
  {
    id: 'w-food-chain',
    tier: 3,
    ask: 'In the pond, bugs eat tiny plants. Frogs eat the bugs. Herons eat the frogs. What happens to herons if the frogs leave?',
    right: 'They have less food',
    wrong: [
      ['They have more food', 'wrong-reason', 'The frogs are part of what herons eat.'],
      ['Nothing. Herons do not need food.', 'needs-mixup', 'Every animal needs food.'],
    ],
    explain: 'A food chain links who eats whom. Take out one link, and the animals that eat it go hungry.',
    hints: ['What does a heron eat?', 'Follow the chain: plants, bugs, frogs, herons.'],
    pic: an('heron'),
    model: 'needs',
  },
  {
    id: 'w-nursery',
    tier: 3,
    ask: 'Many young fish and birds start life in a wetland. Why is a wetland a good place to grow up?',
    right: 'Shallow water and plants give food and places to hide',
    wrong: [
      ['It is dry and sandy', 'habitat-mixup', 'A wetland is full of water.'],
      ['No other animals live there', 'wrong-reason', 'Wetlands are full of life.'],
    ],
    explain: 'Shallow, plant-filled water is full of food and hiding places, so it is like a nursery for young animals.',
    hints: ['What do young animals need most?', 'Look at the four needs.'],
    pic: scene('wetland'),
    model: 'needs',
  },
  {
    id: 'w-heron',
    tier: 3,
    ask: 'A heron has long legs and a long, sharp bill. Where does it find its food?',
    right: 'Wading in shallow water',
    wrong: [
      ['High in the treetops', 'part-mixup', 'Long legs are for wading, not climbing.'],
      ['Deep under the ice', 'habitat-mixup', 'Herons live where the water is shallow and not frozen.'],
    ],
    explain: 'Long legs let the heron wade, and its sharp bill grabs fish and frogs.',
    hints: ['What are long legs good for in water?', 'Look at the heron’s card in your journal.'],
    pic: an('heron'),
    model: 'card',
  },
  {
    id: 'w-hibernate',
    tier: 3,
    ask: 'Some frogs sleep through the cold winter in the mud. Humpback whales swim to warm seas. Which one migrates?',
    right: 'The humpback whale',
    wrong: [
      ['The frog', 'migration-mixup', 'Sleeping through the winter is hibernation, not migration.'],
      ['Neither of them', 'migration-mixup', 'One of them makes a long trip every year.'],
    ],
    explain: 'Migration is a long trip each year. The whales migrate. The sleeping frogs hibernate.',
    hints: ['Which animal makes a long trip?', 'Migration means travel. Hibernation means a long sleep.'],
    pic: an('whale'),
    model: 'globe',
  },
  {
    id: 'w-fresh-fish',
    tier: 3,
    ask: 'Some people think all fish live in the sea. Where else can fish live?',
    right: 'In rivers, ponds and lakes',
    wrong: [
      ['Nowhere else', 'all-fish-sea', 'Many fish live in fresh water.'],
      ['In the desert sand', 'habitat-mixup', 'Fish need water to breathe.'],
    ],
    explain: 'Lots of fish live in fresh water: rivers, ponds and lakes. Herons and crocodiles catch them there.',
    hints: ['What do herons catch in the pond?', 'Look at the picture: there is water on both sides.'],
    pic: water,
    model: 'water',
  },
];

const BANKS: Record<Station, QDef[]> = { rainforest: RAINFOREST, desert: DESERT, poles: POLES, wetland: WETLAND };

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
