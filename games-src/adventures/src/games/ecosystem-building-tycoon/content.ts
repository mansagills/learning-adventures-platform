import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { PieceId } from '../../kit/worlds/wild-lands/eco-art';
import type { IslandKind, Rule, Trouble, UpgradeId } from './rules';

/** Field Notebook stars per island type. */
export const STARS_PER_ISLAND = 5;

export type PersonId = 'nia' | 'lupe' | 'theo' | 'bramble';
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  nia: { name: 'Warden Nia Achieng', role: 'Island warden (an ecologist)' },
  lupe: { name: 'Lupe Fonoti', role: 'Botanist (a plant scientist)' },
  theo: { name: 'Theo Park', role: 'Pond biologist' },
  bramble: { name: 'Bramble', role: 'A hedgehog' },
};

export const OPENING = [
  'Welcome to the ranger station, Junior Ranger! I am Warden Nia Achieng. I am an ecologist: I study how living things depend on each other.',
  'Out there are the little islands of the Wild Lands. Storms and old quarries have left some of them bare. Our job is to bring them back to life.',
  'You will rebuild an island one season at a time. Each season you pick one tile from a hand of three: a plant, an animal, a decomposer or a log. Put each one where it can live well.',
  'Living things help each other. A rabbit needs grass to eat. A fox needs rabbits. Mushrooms turn old logs into rich soil for the plants. Put them side by side and the island gets healthier.',
];
export const BRAMBLE_HELLO = 'Snuffle snuffle! I am Bramble. I sniff out good spots. If you get stuck, press the sniff button and I will show you where a tile would help most.';
export const OPENING_END = [
  'Each island has health targets to reach by certain seasons. Reach one, and the research team lets you pick an upgrade. Miss one, and the run ends, but you keep everything you have learned and unlocked.',
  'You can pick a short run (about 10 to 15 minutes) or a long run (about 25 to 30 minutes, with more seasons and targets). Let’s start with Meadow Island. Lupe knows all about plants!',
];
export const CONTROLS_TIP_KEYS = 'Pick a tile with 1, 2 or 3 (or click it). Move with the arrow keys and press Enter or Space to place it. R gets new tiles, S asks Bramble to sniff.';
export const CONTROLS_TIP_TOUCH = 'Tap a tile in your hand, then tap a square on the island to place it. The sniff button asks Bramble for help.';

export interface IslandInfo {
  id: IslandKind;
  name: string;
  host: PersonId;
  skill: string;
  /** Said before the first run on this island. */
  intro: string[];
  /** The talk-it-through question after the island is first restored. */
  debrief: TalkQuestion;
  done: string;
  badge: string;
}

export const ISLAND_INFO: Record<IslandKind, IslandInfo> = {
  meadow: {
    id: 'meadow',
    name: 'Meadow Island',
    host: 'lupe',
    skill: 'Plants and the Sun',
    intro: [
      'Hi, I am Lupe! Meadow Island used to be full of flowers. Plants are where it all starts: they are producers, which means they make their own food from sunlight, water and air.',
      'Plants next to water grow better. Bees and butterflies next to flowers or berry bushes pollinate them. And watch out for the creeping vine at the far end: it is an invasive plant. It shades the plants next to it and creeps further every other season. Plant two native plants next to it to stop it.',
    ],
    debrief: {
      text: 'One to talk through: a fox never eats grass. So why would a meadow with no grass soon have no foxes?',
      options: [
        {
          text: 'Foxes eat rabbits, and rabbits eat grass. No grass means no rabbits, and then no food for foxes.',
          correct: true,
          feedback: 'Yes! The fox’s energy came from the grass, through the rabbit. And the grass got it from the Sun.',
        },
        { text: 'Foxes need grass to sleep on.', misconception: 'wrong-reason', feedback: 'Foxes sleep in dens. Think about what the fox eats, and what that animal eats.' },
        { text: 'It would not change. Foxes only need rabbits.', misconception: 'direct-only', feedback: 'Foxes do need rabbits. But what do the rabbits need?' },
      ],
      hints: ['What does a fox eat?', 'Follow the chain back: fox, rabbit, then what?', 'No grass, no rabbits; no rabbits, no food for the foxes.'],
    },
    done: 'Meadow Island is alive again! You know that every food chain starts with plants, and plants get their energy from the Sun. Theo is waiting at Pond Island.',
    badge: 'Meadow badge',
  },
  pond: {
    id: 'pond',
    name: 'Pond Island',
    host: 'theo',
    skill: 'Food chains and food webs',
    intro: [
      'Hey, I am Theo. I study ponds. Pond Island has a big pond in the middle, and the pond tiles only go in the water: lily pads, snails, fish and ducks. Cattails, frogs and herons can stand at the muddy edge too.',
      'A pond is a food web: lily pads feed snails, snails feed fish, frogs and ducks, and herons eat fish and frogs. The arrows on the island show where the energy goes, from the food to the eater. Build the longest chains you can!',
    ],
    debrief: {
      text: 'One to talk through: someone says, "Let’s chase the herons away so the fish are safe." What could go wrong?',
      options: [
        {
          text: 'The fish grow too many, eat up the snails, and then go hungry.',
          correct: true,
          feedback: 'Exactly. Predators keep their prey in balance. Taking one living thing away changes the whole web.',
        },
        { text: 'Nothing. More fish is always better.', misconception: 'more-is-better', feedback: 'Every fish needs food. What happens when there are too many fish for the snails?' },
        { text: 'Only the herons would be affected.', misconception: 'direct-only', feedback: 'The herons were eating fish. What happens to the fish, and then to what the fish eat?' },
      ],
      hints: ['What did the herons eat?', 'With no herons, how many fish would there be?', 'Too many fish eat up their food, then go hungry: predators keep the balance.'],
    },
    done: 'Pond Island is buzzing! You can read a food web and follow a change all the way through it.',
    badge: 'Pond badge',
  },
};

/** What each combo rule means, for the popups and Bramble's tips (short, plain, true). */
export const RULE_TEXT: Record<Rule, { name: string; tip: string }> = {
  sun: { name: 'Sunlight', tip: 'Plants make their own food from sunlight, water and air.' },
  'big-tree': { name: 'Big tree', tip: 'A big oak makes lots of food: leaves and acorns for many animals.' },
  water: { name: 'Water nearby', tip: 'Plants next to water grow better.' },
  'rich-ground': { name: 'Rich ground', tip: 'Dark, rich soil is full of nutrients from old leaves and logs.' },
  'rich-soil': { name: 'Rich soil', tip: 'Decomposers turn dead things into rich soil, and the plants next to it grow better.' },
  pollination: { name: 'Pollination', tip: 'Bees and butterflies carry pollen between flowers, so they can make seeds and fruit.' },
  shaded: { name: 'Shaded by the vine', tip: 'The invasive vine climbs over the plants next to it and blocks their light.' },
  fed: { name: 'Food nearby', tip: 'Animals score when the food they really eat is right next to them.' },
  'both-foods': { name: 'Plants and animals', tip: 'Ducks are omnivores: they eat water plants and small animals.' },
  hungry: { name: 'Hungry', tip: 'This animal has nothing it eats next to it.' },
  decompose: { name: 'Recycling', tip: 'Decomposers break down dead things, like logs, leaves and dung.' },
  idle: { name: 'Nothing to recycle', tip: 'This decomposer needs something dead next to it: a log or fallen leaves (a dung beetle needs a deer or rabbit).' },
  shelter: { name: 'Shelter', tip: 'Small animals hide from hunters in a rock pile.' },
  'reed-cover': { name: 'Hiding in the cattails', tip: 'Cattails give small animals a place to hide.' },
  invasive: { name: 'Invasive vine', tip: 'An invasive plant comes from far away and has nothing here to keep it in check.' },
  'food-chain': { name: 'Food chain', tip: 'A plant, an animal that eats it, and a hunter that eats that animal: the Sun’s energy passes all the way up.' },
  circle: { name: 'Circle of life', tip: 'Sun to plants, plants to animals, and decomposers turning dead things back into soil for the plants. Matter goes round and round.' },
  'too-many-eaters': { name: 'Too many plant-eaters', tip: 'There are more plant-eaters than plants. There is not enough food to go round.' },
  'too-many-hunters': { name: 'Too many hunters', tip: 'There are more meat-eaters than plant-eaters for them to eat.' },
};

/** Warden Nia's explanation when a target is missed. */
export const TROUBLE_TEXT: Record<Trouble, string> = {
  hungry: 'Several animals had nothing to eat next to them. An animal can only live where its food is. Next time, put each animal right beside what it eats.',
  'no-decomposers': 'The island had no working decomposers. Without mushrooms or worms breaking down logs and leaves, the soil runs out of nutrients and the plants grow slowly.',
  'too-many-eaters': 'There were more plant-eaters than plants, so there was not enough food to go round. An island needs lots of plants to feed its animals.',
  'too-many-hunters': 'There were more meat-eaters than plant-eaters for them to hunt. In nature there are always fewer hunters than the animals they eat.',
  vine: 'The invasive vine spread and shaded the plants. Planting two native plants next to it stops it creeping further.',
  'few-plants': 'There were not enough plants. Plants are the producers: every bit of food on the island starts with them and the Sun.',
  'no-chain': 'The living things were not joined into food chains. Try a plant, an animal that eats it, and a hunter, all side by side.',
};

/** The research upgrades: what each one does, and the real science behind it. */
export const UPGRADES: Record<UpgradeId, { name: string; game: string; science: string }> = {
  reroll: { name: 'Seed bank', game: 'Two more chances to get new tiles this run.', science: 'Seed banks store seeds of many plants, so people can replant an area after a fire or flood.' },
  'big-hand': { name: 'Field team', game: 'See four tiles each season instead of three.', science: 'Ecologists work in teams, each one watching different living things, so they notice more.' },
  'bee-boost': { name: 'Bee hotels', game: 'Pollination is worth 3 instead of 2.', science: 'Many wild bees live alone and nest in hollow stems. Bee hotels give them a home near the flowers.' },
  compost: {
    name: 'Compost',
    game: 'Rich soil from decomposers is worth 3 instead of 2.',
    science: 'Compost is dead plants broken down by worms, fungi and bacteria. Gardeners add it to feed their plants.',
  },
  'hawk-eye': { name: 'Hawk eyes', game: 'Hawks and owls can hunt from two squares away.', science: 'Hawks see small animals from high in the sky, and owls hear a mouse moving under the snow.' },
  'reed-cover': {
    name: 'Reed beds',
    game: 'Plant-eaters next to cattails score 1 more.',
    science: 'Thick reeds and cattails give small animals a place to hide from hunters and to raise their young.',
  },
  volunteers: { name: 'Volunteer day', game: 'Pull up every invasive vine on the island now.', science: 'Volunteers really do pull up invasive plants by hand, so native plants can grow back.' },
};

/** One fact for each tile, shown when it is picked from the hand. */
export const PIECE_FACT: Record<PieceId, string> = {
  grass: 'A producer. Grass grows back after it is nibbled, so it can feed many plant-eaters.',
  flowers: 'A producer. Flowers make nectar and pollen. Bees and butterflies pollinate them.',
  berries: 'A producer. Its flowers need pollinators to turn into berries. Mice and deer eat the berries.',
  oak: 'A producer, and a big one: its leaves and acorns feed many animals.',
  reeds: 'Cattails: a producer that grows at the water’s edge. Snails and ducks eat them.',
  lilies: 'Lily pads: a producer that floats on the pond. Snails and ducks eat them.',
  rabbit: 'A plant-eater. Rabbits eat grass and flowers. Foxes and hawks hunt them.',
  deer: 'A plant-eater. Deer eat grass, berries and acorns. Dung beetles use their dung.',
  mouse: 'A plant-eater. Field mice eat seeds, grass and berries. Foxes, hawks and owls hunt them.',
  bee: 'A pollinator. Bees drink nectar and carry pollen from flower to flower.',
  butterfly: 'A pollinator. Butterflies sip nectar from flowers. Frogs and fish eat them.',
  snail: 'A plant-eater. Pond snails graze on water plants. Fish, frogs and ducks eat them.',
  duck: 'An omnivore. Ducks eat water plants and snails.',
  fox: 'A hunter. Foxes eat mostly rabbits and mice.',
  hawk: 'A hunter. Hawks catch rabbits and mice.',
  owl: 'A hunter of the night. Owls catch mice.',
  frog: 'A hunter. Frogs catch insects and snails with their sticky tongues. Herons eat frogs.',
  fish: 'A hunter. Sunfish eat snails and insects. Herons eat fish.',
  heron: 'The pond’s top predator. Herons eat fish and frogs.',
  mushrooms: 'A decomposer. Mushrooms break down logs and leaves into rich soil.',
  worms: 'A decomposer. Earthworms eat fallen leaves and mix them into the soil.',
  beetle: 'A decomposer. Dung beetles roll and bury the dung of deer and rabbits, feeding the soil.',
  log: 'A fallen log. It is dead wood: food for mushrooms and worms.',
  leaves: 'Fallen leaves. Food for worms and mushrooms.',
  stones: 'A rock pile: a hiding place for mice, frogs, snails and beetles.',
  vine: 'An invasive vine. It came from far away and spreads fast, shading native plants.',
};

export const HALF_DONE = [
  'Both islands are alive again, Junior Ranger! The meadow has its plants and pollinators, and the pond has a whole food web.',
  'The research team is still mapping the Woods and the Wetland. When they are ready, you can bring those back to life too. Until then, try a long run, or beat your best health!',
];

export const MISCONCEPTION_WORDS: Record<string, string> = {
  'plants-soil-food': 'Thought plants get their food from the soil',
  'plants-eat': 'Thought plants eat, like animals',
  'needs-mixup': 'Mixed up what plants need (light, water, air, space)',
  'sun-not-energy': 'Forgot that food energy starts with the Sun',
  'animals-make-food': 'Thought animals can make their own food',
  'role-mixup': 'Mixed up producers, plant-eaters, meat-eaters and omnivores',
  'arrow-backwards': 'Read food chain arrows backwards',
  'chain-starts-animal': 'Started a food chain with an animal',
  'pollination-mixup': 'Thought bees only take from flowers',
  'direct-only': 'Thought a change only affects the animals it touches',
  'predators-bad': 'Thought predators are bad for an ecosystem',
  'more-is-better': 'Thought more animals is always better',
  'web-mixup': 'Thought each animal has only one food',
  'wrong-reason': 'Gave a reason that did not explain it',
};

export const GROWNUPS: GrownupsContent = {
  game: 'Ecosystem Building Tycoon',
  grades: 'Grades 3–5',
  summary:
    'A builder game about ecosystems, in the style of a "roguelike" builder: every run is a fresh island, and each season your child places one tile from a hand of three (a plant, an animal, a decomposer or a habitat feature like a fallen log). Tiles score only for real reasons: plants make food from sunlight; an animal scores only next to the food it really eats; a fox next to a rabbit next to grass is a food chain; bees next to flowers pollinate them; mushrooms and worms next to a log turn it into rich soil that feeds the plants around them. Too many plant-eaters for the plants, or too many hunters for the plant-eaters, costs points (the energy pyramid), and an invasive vine creeps across the island unless native plants crowd it out. Each island has health targets to reach by set seasons. Reaching one opens a choice of research upgrades (each with its real science), after a Field Notebook question. Missing one ends the run gently: Warden Nia explains what held the island back, and every unlock is kept. Your child chooses a short run (about 10 to 15 minutes, 3 targets) or a long run (about 25 to 30 minutes, 5 targets). This first part has Meadow Island (plants and the Sun, with Lupe the botanist) and Pond Island (food chains and webs, with Theo the pond biologist).',
  teaches: [
    {
      title: 'Meadow Island: plants and the Sun',
      text: 'Plants are producers: they make their own food from sunlight, water and air, and animals cannot. Plant-eaters (herbivores). Plants need light. At level 2: the energy in every animal’s food came from the Sun; plants are not fed by the soil; plants compete for light, water and space; meat-eaters and plant-eaters. At level 3: bees and flowers need each other (pollination makes seeds and fruit), what happens to a meadow without bees, plants give off oxygen, and the famous willow-in-a-pot experiment (the tree’s new weight came mostly from air and water, not soil).',
    },
    {
      title: 'Pond Island: food chains and food webs',
      text: 'Who eats whom; a food chain arrow points from the food to the eater (the way the energy goes); every chain starts with a plant; plant-eaters, meat-eaters and omnivores. At level 2: a food web is many chains joined together; the Sun is the source of the energy; the top predator; an animal can be both predator and prey. At level 3: take one living thing away and follow what changes (no frogs, more insects; no snails, an algae bloom turns the water green; no herons, too many fish, then hungry fish), why ecosystems need predators, and why having several foods makes an animal safer.',
    },
    {
      title: 'Learning by building',
      text: 'The scoring rules are the science. To score well, your child has to put each animal next to what it really eats, build chains from plants up to hunters, keep more plants than plant-eaters and more plant-eaters than hunters, and give decomposers something to break down. Every popup on the island names the reason, and the arrows show the energy moving from food to eater.',
    },
    {
      title: 'Mistakes and hints',
      text: 'Every wrong answer gets one sentence about the likely mistake (for example "plants get their food from the soil", "the arrow points to the one that gets eaten" or "taking away a predator only affects the predator"). Hints go from a nudge, to a picture (a food chain, the pond web, what a plant needs), to the answer outlined. Hints never cost progress; a star is for getting it right the first time.',
    },
  ],
  standards: [
    { code: 'NGSS 5-LS2-1', text: 'Develop a model to describe the movement of matter among plants, animals, decomposers and the environment.' },
    { code: 'NGSS 5-PS3-1', text: 'The energy in animals’ food was once energy from the Sun.' },
    { code: 'NGSS 5-LS1-1', text: 'Plants get the materials they need for growth chiefly from air and water.' },
    { code: 'NGSS 3-LS4-3', text: 'In a particular habitat, some organisms can survive well, some less well, and some not at all.' },
    { code: 'NGSS 3-LS4-4', text: 'When the environment changes, some organisms survive and reproduce, some move, and some die.' },
  ],
  talk: [
    'What did you have for lunch? Follow it back: where did its energy first come from?',
    'Next time you see a bee on a flower, what is it doing for the flower?',
    'If all the foxes left a meadow, what might happen to the rabbits? And then to the grass?',
    'Why do you think there are so many more plants than lions in the world?',
    'What happens to a fallen leaf over a year? Who helps it turn into soil?',
    'Have you seen a pond with green water? What might have changed?',
  ],
  help: [
    'A run can be stopped at any time and picked up later from the ranger station.',
    'The sniff button asks Bramble the hedgehog to show the square where a tile would help most, and why. It never costs anything.',
    'Moving the pointer over a square (or tapping a tile and then looking at the outlines) shows how many points a tile would add there before placing it.',
    'Questions go up a level after a few right answers, and down after misses, so they fit your child.',
    'Every question and answer can be read aloud.',
  ],
  simplifies: [
    'The island is a game board: real ecosystems have far more living things and links than this.',
    'A tile scores for its neighbors only. Real animals travel to find food, and many eat more things than the game shows.',
    'The field mouse is shown as a plant-eater; real field mice mostly eat seeds but also some insects. The red fox is shown as a hunter; real foxes eat mostly meat, and some berries too.',
    'The health score is a game measure. Ecologists do count living things and food links, but not as a single number.',
  ],
  credits: [
    'Learning design based on the original Ecosystem Building Tycoon game, rebuilt by Learning Adventures as a roguelike island builder (the owner’s idea). The original’s facts were checked and kept; its made-up "5 plants to 3 plant-eaters to 1 hunter" rule was replaced by the real ideas behind it (energy flowing from the Sun, and fewer animals at each step up a food chain).',
    'The willow tree experiment is Jan Baptist van Helmont’s, from the 1600s.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
  ],
};
