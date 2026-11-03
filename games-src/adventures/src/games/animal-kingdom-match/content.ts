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
    arrive: ['The Poles trip opens soon.'],
    again: 'The Poles trip opens soon.',
    allSpotted: '',
    rescue: '',
    journal: '',
    debrief: { text: '', options: [], hints: ['', '', ''] },
    done: '',
  },
  wetland: {
    id: 'wetland',
    name: 'The Wetland and Sea',
    host: 'amara',
    skill: 'Water homes',
    arrive: ['The Wetland trip opens soon.'],
    again: 'The Wetland trip opens soon.',
    allSpotted: '',
    rescue: '',
    journal: '',
    debrief: { text: '', options: [], hints: ['', '', ''] },
    done: '',
  },
};

/** Ranger Tala, once the trips built so far are all done (half 1). */
export const HALF_DONE = [
  'Two patches! You are a real help to the Wild Lands, Junior Ranger.',
  'The trips to the Poles and to the Wetland and Sea open soon. Until then, you can practise in your Ranger Journal, or visit the rainforest and the desert again.',
];

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
    'Your child becomes a Junior Ranger at a field camp in the Wild Lands. With Ranger Tala, Dr. Amara Osei (a wildlife vet) and Kiki the kinkajou, they go on habitat trips. On each trip they walk through the habitat and spot its animals with binoculars, taking a photo for their Ranger Journal (each card has two facts, read aloud). Back at camp, at the Wildlife Rescue Center, animals that wandered away (always healthy and happy) need to go home: the child picks each one’s home on the map and, at higher levels, says what that home gives it and which body part helps it there. Each trip ends with questions at three levels in the Ranger Journal and a talk-it-through question, and earns a Junior Ranger patch. This first part has two trips, the Rainforest and the Desert; the Poles, the Wetland and Sea, and a Night Safari finale come next.',
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
    { code: 'NGSS 4-LS1-1', text: 'Animals have internal and external structures that support survival.' },
  ],
  talk: [
    'What four things does every animal need from its home?',
    'Which layer of the rainforest would you like to live in? Which animals would be your neighbors?',
    'Why is a green frog hard to see on a leaf? Can you think of another animal that hides like that?',
    'What is inside a camel’s hump? Is it water?',
    'Why do so many desert animals come out at night?',
    'Could a sloth live in the desert? Why or why not?',
  ],
  help: [
    'Levels go up after a few right answers, and down after misses, so the questions fit your child.',
    'Nothing is timed. Kiki points her tail when an animal is near, and the Kiki button says where to look, so nobody gets stuck.',
    'A trip is finished after spotting its animals, helping at the Rescue Center, five stars in the Ranger Journal and a talk-it-through question.',
    'Every question and answer can be read aloud. Grades 1 and 2 will mostly see level 1; grades 3 and 4 reach levels 2 and 3.',
  ],
  simplifies: [
    'Each habitat brings together animals that live in that kind of place, though not always on the same continent: the desert has a camel and a fennec fox (from the Sahara) next to a roadrunner, a gecko and a desert tortoise (from North America).',
    'Real animals are much harder to spot, and keep their distance. In the game they wait politely for a photo.',
    'Animals at the Rescue Center are always healthy and ready to go home. Real wildlife rescue centers also care for hurt or orphaned animals; the game leaves that out for young players.',
    'Temperatures are rounded. Desert nights can be much colder than the game says, and some deserts get frost.',
  ],
  credits: [
    'Learning design based on the original Animal Kingdom Match game, rebuilt by Learning Adventures. Facts from the old game were corrected: penguins live in the southern half of the world, never in the Arctic; and the 80-year parrot record is for parrots kept by people, so it was dropped.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Facts checked against the Smithsonian’s National Zoo, the San Diego Zoo Wildlife Alliance, National Geographic Kids and the U.S. National Park Service (Saguaro National Park).',
  ],
};
