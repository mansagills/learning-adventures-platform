import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { Trip } from './animals';

/**
 * Everything Animal Kingdom Match says: the field camp's people and Kiki,
 * the opening, each trip's lines and talk-it-through question, the Rescue
 * Center and the grown-ups page. The owner's wording rule holds everywhere:
 * short sentences, the facts first, then one plain question, in words that
 * match the picture and no game jargon. It is for grades 1 to 4, so lines
 * are short and everything is read aloud.
 */

export const STARS_PER_TRIP = 5;

export type PersonId = 'tala' | 'amara';

export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  tala: { name: 'Ranger Tala', role: 'Wild Lands ranger' },
  amara: { name: 'Dr. Amara Osei', role: 'Wildlife vet' },
};
export const KIKI = { name: 'Kiki', role: 'The kinkajou' };

export const OPENING = [
  'Welcome to the field camp! I am Ranger Tala. Today you will be a Junior Ranger.',
  'A habitat is an animal’s home. It gives the animal food, water, shelter and space.',
  'We will visit four habitats. You will spot the animals that live there, and help them get home.',
];
export const KIKI_HELLO = 'Chirp! Kiki the kinkajou climbs onto your backpack. Kinkajous are small rainforest animals that are busy at night.';
export const KIKI_JOINS = 'Kiki has sharp eyes and a long tail. When an animal is near, she points her tail at it. Watch her!';
export const AMARA_HELLO = [
  'Hello! I am Dr. Amara Osei. I am an animal doctor, called a vet.',
  'This is the Wildlife Rescue Center. Sometimes animals wander away from home. They stay here, safe and happy, until they can go back.',
];
export const OPENING_END = 'Our first trip is to the rainforest. Come to the map when you are ready to go.';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk or to use the binoculars.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the arrows. Tap the button that pops up to talk or to use the binoculars.';

export interface TripInfo {
  id: Trip;
  name: string;
  /** Who leads the trip (and asks the talk-it-through question). */
  host: PersonId;
  skill: string;
  /** Said on arriving in the habitat for the first time. */
  arrive: string[];
  /** Said on coming back to the habitat later. */
  again: string;
  /** Said when every animal is spotted. */
  allSpotted: string;
  /** Dr. Amara at the Rescue Center, before this trip's animals. */
  rescue: string;
  /** Before the journal questions. */
  journal: string;
  debrief: TalkQuestion;
  done: string;
}

export const TRIP_INFO: Record<Trip, TripInfo> = {
  rainforest: {
    id: 'rainforest',
    name: 'The Rainforest',
    host: 'tala',
    skill: 'What a habitat gives an animal',
    arrive: [
      'Here we are: the rainforest! It rains almost every day here, and it is warm all year.',
      'Animals live on the forest floor, in the middle, and high in the treetops. Look up as well as down!',
      'Seven animals live near here. Walk close to one and use your binoculars to take its photo for your Ranger Journal.',
    ],
    again: 'The rainforest is always busy. Which animal will you spot next?',
    allSpotted: 'You spotted all seven! Let’s head back to camp. Dr. Amara needs our help at the Rescue Center.',
    rescue: 'Welcome back! Three animals wandered away from the rainforest. They are ready to go home. Can you find each one’s home on the map?',
    journal: 'Wonderful! Every animal is home. Now let’s write up the trip in your Ranger Journal.',
    debrief: {
      text: 'A spider monkey eats fruit and swings through the trees by its tail. Why can’t it live in the open desert?',
      options: [
        {
          text: 'It needs tall trees for fruit and swinging. The desert has very few trees.',
          correct: true,
          feedback: 'Yes! Its home must give it food and a place to swing. The desert cannot.',
        },
        { text: 'It could, if it tried hard enough.', feedback: 'Trying cannot change its tail or what it eats. Think about what the desert has.', misconception: 'choose-body' },
        { text: 'Monkeys can live anywhere.', feedback: 'Each animal needs a home that gives it food, water, shelter and space.', misconception: 'live-anywhere' },
      ],
      hints: [
        'What does a spider monkey eat, and where does it hang?',
        'Picture the desert: sand, rocks, a few cactus plants. Are there fruit trees to swing in?',
        'The answer is outlined: it needs tall trees for fruit and swinging, and the desert has very few.',
      ],
    },
    done: 'The Rainforest patch is yours, Junior Ranger! Next, Dr. Amara will take you to the desert.',
  },
  desert: {
    id: 'desert',
    name: 'The Desert',
    host: 'amara',
    skill: 'Living with heat and little water',
    arrive: [
      'Phew, feel that sun! This is the desert. It gets very little rain.',
      'Desert animals find shade, save water and stay out of the midday heat.',
      'Five animals live near here. Some are hard to see, because they are the color of the sand. Use your binoculars!',
    ],
    again: 'The desert looks empty, but it is full of life. Keep looking!',
    allSpotted: 'You found all five! Let’s go back to camp. A few desert animals at the Rescue Center are ready to go home.',
    rescue: 'Some animals need to go home: two from the desert, and one from your first trip. Where does each one live?',
    journal: 'Every animal is home again. Let’s write up the desert in your Ranger Journal.',
    debrief: {
      text: 'A polar bear has thick fur and a layer of fat called blubber. Why can’t it live in the hot desert?',
      options: [
        {
          text: 'Its fur and fat are for the cold. The desert is hot, with no ice to hunt from.',
          correct: true,
          feedback: 'Yes! Its body fits the icy Arctic. In the desert it would be far too hot.',
        },
        { text: 'It could, if it grew big ears.', feedback: 'An animal cannot grow new body parts because it wants to.', misconception: 'choose-body' },
        { text: 'Polar bears do live in deserts.', feedback: 'Polar bears live in the icy Arctic, far in the north.', misconception: 'live-anywhere' },
      ],
      hints: [
        'Thick fur and blubber keep heat in. Is the desert hot or cold?',
        'Picture a polar bear on hot sand. What would happen to it?',
        'The answer is outlined: its fur and fat are for the cold, and the desert has no ice.',
      ],
    },
    done: 'The Desert patch is yours! You are halfway to being a full Junior Ranger.',
  },
  poles: {
    id: 'poles',
    name: 'The Poles',
    host: 'tala',
    skill: 'North and south, and staying warm',
    arrive: [
      'Brrr! Welcome to the Poles. On this side is the Arctic, at the very top of the world.',
      'Across the sea is Antarctica, at the very bottom. In real life they are on opposite sides of the Earth! Our research boat can take you across.',
      'Six kinds of animals live here: four in the north and two in the south. Use your binoculars!',
    ],
    again: 'The ice is quiet today. Keep your eyes open on both sides of the sea.',
    allSpotted: 'You spotted all six, north and south! Let’s sail back to camp. Dr. Amara has more animals to take home.',
    rescue: 'Two animals from the Poles need to go home, and one from an earlier trip. Where does each one live?',
    journal: 'Every animal is home safe. Let’s write up the Poles in your Ranger Journal.',
    debrief: {
      text: 'Cartoons often show penguins and polar bears playing together. Why will a wild polar bear never meet a wild penguin?',
      options: [
        {
          text: 'Polar bears live in the far north and penguins live in the far south. The whole world is between them.',
          correct: true,
          feedback: 'Yes! The Arctic is at the top of the Earth and Antarctica at the bottom.',
        },
        { text: 'Penguins hide whenever polar bears come near.', feedback: 'They are never near each other at all. Think about where each one lives.', misconception: 'bears-penguins-meet' },
        { text: 'Polar bears and penguins live on the same ice.', feedback: 'Look at the globe again. One lives at the top, one at the bottom.', misconception: 'penguin-north' },
      ],
      hints: [
        'Where do polar bears live? Where do wild penguins live?',
        'Picture the globe: the Arctic at the top, Antarctica at the bottom.',
        'The answer is outlined: they live at opposite ends of the Earth.',
      ],
    },
    done: 'The Poles patch is yours! One more trip to go: the wetland and the sea, with Dr. Amara.',
  },
  wetland: {
    id: 'wetland',
    name: 'The Wetland and Sea',
    host: 'amara',
    skill: 'Water homes',
    arrive: [
      'Welcome to the wetland! The pond and the river are fresh water. Past the beach, the sea is salty.',
      'Some animals need fresh water, and some need salt water. A few, like whales and dolphins, breathe air but live in the sea.',
      'Six animals live near here. For the sea animals, walk to the beach and look out with your binoculars.',
    ],
    again: 'Listen: frogs, ducks and waves. The wetland is busy today.',
    allSpotted: 'You found all six, from the pond to the sea! Back to camp. These are the last animals to take home.',
    rescue: 'Here are the last animals that wandered away: two from the wetland and the sea, and one from an earlier trip.',
    journal: 'Everyone is home. Let’s write up the wetland in your Ranger Journal.',
    debrief: {
      text: 'A dolphin lives in the sea and swims all day. Why can’t a dolphin stay under water forever, like a fish?',
      options: [
        {
          text: 'It is a mammal. It breathes air, so it must come up to its blowhole.',
          correct: true,
          feedback: 'Yes! Fish breathe with gills. Dolphins and whales breathe air, like you.',
        },
        { text: 'Because it gets bored under water.', feedback: 'It is about breathing, not feelings. What does a dolphin breathe?', misconception: 'wrong-reason' },
        { text: 'It can. Dolphins breathe water with gills.', feedback: 'Dolphins have no gills. They have a blowhole for breathing air.', misconception: 'breathe-water' },
      ],
      hints: ['What is a dolphin’s blowhole for?', 'Fish have gills. Mammals, like dolphins, have lungs.', 'The answer is outlined: it is a mammal that breathes air.'],
    },
    done: 'The Wetland patch is yours! That is all four. The sun is setting over the camp...',
  },
};

/** Ranger Tala, once all four trips are done: the sun sets, and the Night Safari begins. */
export const ALL_DONE = [
  'Four patches! You have been to every habitat in the Wild Lands.',
  'Look, the sun has set and the fireflies are out. Many animals wake up at night. They are called nocturnal.',
  'Tonight is the Night Safari! Take this flashlight. Look for shining eyes in the forest beyond the camp.',
];
export const NIGHT_INVITE = 'Ready for the Night Safari? Look for shining eyes in the dark forest.';
/** After the Night Safari: every animal on the lit map. */
export const NIGHT_DONE = ['Every animal you met is home, by day and by night. The whole Wild Lands map is lit up!', 'You are a full Junior Ranger now. Thank you for helping every animal get home.'];
export const AFTER_ALL = 'Visit any habitat again from the map, try the Night Safari again, or race the clock in Speed Match at the Rescue Center.';
/** Kept for saves made in half 1 (the goodbye before the Poles and the Wetland opened). */
export const HALF_DONE = ['Two patches! The trips to the Poles and to the Wetland and Sea are open now. Come to the map when you are ready.'];

/** Dr. Amara, when there is no one to take home yet. */
export const RESCUE_EMPTY = 'Everyone here is resting. Go on a trip with Ranger Tala first, and spot the animals in their homes.';
export const RESCUE_AGAIN = 'More animals have wandered in. Want to help them get home again?';

/** What Kiki says when you ask for help. */
export const KIKI_HELP_DONE = 'Chirp! Kiki curls up. You have spotted every animal here.';

export function praise(i: number): string {
  return ['Great job!', 'You got it!', 'Brilliant!', 'Yes, that’s right!', 'Super spotting!', 'Exactly right!'][i % 6];
}

export const GROWNUPS: GrownupsContent = {
  game: 'Animal Kingdom Match',
  grades: 'Grades 1–4',
  summary:
    'Your child becomes a Junior Ranger at a field camp in the Wild Lands. With Ranger Tala, Dr. Amara Osei (a wildlife vet) and Kiki the kinkajou, they go on four habitat trips: the Rainforest, the Desert, the Poles (the Arctic and Antarctica, with a research boat between them) and the Wetland and Sea. On each trip they walk through the habitat and spot its animals with binoculars, taking a photo for their Ranger Journal (each card has two facts, read aloud). Back at camp, at the Wildlife Rescue Center, animals that wandered away (always healthy and happy) need to go home: the child picks each one’s home on the map and, at higher levels, says what that home gives it and which body part helps it there. Each trip ends with questions at three levels in the Ranger Journal and a talk-it-through question, and earns a Junior Ranger patch. The finale is a Night Safari: with a flashlight, they find five night animals by their eye shine and learn why some animals are busy at night. After that, an optional 60-second Speed Match is there for children who like racing the clock.',
  teaches: [
    {
      title: 'The Rainforest: what a habitat gives an animal',
      text: 'Every animal needs food, water, shelter and space, and its habitat provides them. The rainforest is warm and wet all year. It has layers (the forest floor, the understory and the canopy) and each animal lives in its own layer. Camouflage helps animals hide (a green tree frog on a leaf, a sloth with green algae in its fur), and bright colors can be a warning (the poison dart frog). At level 3: why so many kinds of animals live in rainforests, what happens when trees are cut down, how body parts fit the forest (a gripping tail, a long light bill), and that body parts are passed down from parents.',
    },
    {
      title: 'The Desert: living with heat and little water',
      text: 'Deserts get very little rain. Animals find shade and burrows, and many come out at night when it is cooler. A cactus stores water in its stem. A camel’s hump stores fat, not water. A fennec fox’s big ears let out heat. At level 3: deserts can be hot by day and cool at night; a desert is about how little rain or snow falls, so Antarctica is the biggest desert; and a body part that helps in the desert (big ears) would not help in the Arctic.',
    },
    {
      title: 'The Poles: north and south, and staying warm',
      text: 'Polar bears live in the Arctic (north); wild penguins live in the south, around Antarctica, so the two never meet. Thick fur and a layer of fat called blubber keep polar animals warm, and white fur helps a polar bear hide on the snow. The Arctic fox’s fur changes with the seasons. At level 3: migration (humpback whales), why less sea ice makes hunting harder for polar bears (said gently), why small ears lose less heat, and why a polar bear could not live well in a rainforest.',
    },
    {
      title: 'The Wetland and Sea: water homes',
      text: 'Fish breathe with gills; frogs need water for their eggs and tadpoles; ponds and rivers are fresh water and the sea is salty. A frog’s life cycle (egg, tadpole, froglet, frog). Whales and dolphins are mammals that breathe air through a blowhole. A beaver’s dam makes a pond, and its lodge is its shelter. At level 3: a sea fish could not live well in a river, a pond food chain, why a wetland is a nursery for young animals, and migration versus hibernation.',
    },
    {
      title: 'The Night Safari',
      text: 'Nocturnal animals (an owl, a fruit bat, a tree frog, a kinkajou and a jaguar) are found by their eye shine. Owls need a little light to see, bats are not blind, and eye shine comes from a mirror-like layer in the eye that helps animals see at night.',
    },
    {
      title: 'The Rescue Center',
      text: 'Matching an animal with its home, with reasons. A wrong home gets a gentle reason naming what the animal needs and what that place is like. At level 2 the child also says what the home gives the animal; at level 3, which body part helps it live there.',
    },
    {
      title: 'Mistakes and hints',
      text: 'Every wrong answer gets one sentence about the likely mistake (for example "any animal can live anywhere", "a camel’s hump holds water" or "an animal can choose its body"). Hints go from a nudge, to a picture, to the answer outlined. Hints never cost progress; a star is for getting it right the first time.',
    },
  ],
  standards: [
    { code: 'NGSS K-ESS3-1', text: 'The relationship between the needs of animals and the places they live.' },
    { code: 'NGSS 1-LS1-1', text: 'Animals use their external parts to help them survive, grow and meet their needs.' },
    { code: 'NGSS 2-LS4-1', text: 'Observe plants and animals to compare the diversity of life in different habitats.' },
    { code: 'NGSS 3-LS4-3', text: 'In a particular habitat some organisms can survive well, some survive less well, and some cannot survive at all.' },
    { code: 'NGSS 3-LS1-1', text: 'Organisms have unique and diverse life cycles (a frog: egg, tadpole, froglet, frog).' },
    { code: 'NGSS 4-LS1-1', text: 'Animals have internal and external structures that support survival.' },
  ],
  talk: [
    'What four things does every animal need from its home?',
    'Which layer of the rainforest would you like to live in? Which animals would be your neighbors?',
    'Why is a green frog hard to see on a leaf? Can you think of another animal that hides like that?',
    'What is inside a camel’s hump? Is it water?',
    'Why do so many desert animals come out at night?',
    'Could a sloth live in the desert? Why or why not?',
    'Where do polar bears live? Where do penguins live? Could they ever meet?',
    'Is a whale a fish? How do you know?',
    'What are the steps from a frog egg to a frog?',
    'Why do some animals sleep in the day and come out at night?',
  ],
  help: [
    'Levels go up after a few right answers, and down after misses, so the questions fit your child.',
    'Nothing is timed. Kiki points her tail when an animal is near, and the Kiki button says where to look, so nobody gets stuck.',
    'A trip is finished after spotting its animals, helping at the Rescue Center, five stars in the Ranger Journal and a talk-it-through question. The Night Safari opens when all four trips are done.',
    'Speed Match is the only timed part, it is optional, and it opens only after the Night Safari.',
    'Every question and answer can be read aloud. Grades 1 and 2 will mostly see level 1; grades 3 and 4 reach levels 2 and 3.',
  ],
  simplifies: [
    'Each habitat brings together animals that live in that kind of place, though not always on the same continent: the desert has a camel and a fennec fox (from the Sahara) next to a roadrunner, a gecko and a desert tortoise (from North America).',
    'Real animals are much harder to spot, and keep their distance. In the game they wait politely for a photo.',
    'Animals at the Rescue Center are always healthy and ready to go home. Real wildlife rescue centers also care for hurt or orphaned animals; the game leaves that out for young players.',
    'Temperatures are rounded. Desert nights can be much colder than the game says, and some deserts get frost.',
    'The Arctic and Antarctica are drawn side by side, with a short boat ride between them, so both fit on one trip. In real life they are on opposite sides of the Earth, and the game says so.',
    'The wetland shows a pond, a river and the sea together. Real coasts often have them close together, but not always.',
    'Real eye shine depends on the animal and the light: owls, frogs and jaguars have very bright eye shine; fruit bats less so.',
  ],
  credits: [
    'Learning design based on the original Animal Kingdom Match game, rebuilt by Learning Adventures. Facts from the old game were corrected: penguins live in the southern half of the world, never in the Arctic; and the 80-year parrot record is for parrots kept by people, so it was dropped.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Facts checked against the Smithsonian’s National Zoo, the San Diego Zoo Wildlife Alliance, National Geographic Kids and the U.S. National Park Service (Saguaro National Park).',
  ],
};
