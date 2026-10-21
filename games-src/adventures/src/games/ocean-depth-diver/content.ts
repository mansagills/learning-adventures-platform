import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { Station } from './problems';

/**
 * Everything Ocean Depth Diver says: the camp's people, Finn, the opening,
 * the expeditions' intros and debriefs, the Creature Designer and the
 * grown-ups page. The owner's wording rule holds everywhere: short
 * sentences, the facts first, then one plain question, in words that match
 * the picture and no game jargon. Read-aloud is on.
 */

export const STARS_PER_STATION = 5;

export type PersonId = 'lani' | 'tala';

export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  lani: { name: 'Dr. Lani Kahale', role: 'Marine biologist' },
  tala: { name: 'Ranger Tala', role: 'Wild Lands ranger' },
};
export const FINN = { name: 'Finn', role: 'The robot camera' };
export const SUB_NAME = 'the Little Nautilus';

export const OPENING = [
  'Welcome to the field camp! I am Ranger Tala. Scientists live and work here, where the rainforest river meets the sea.',
  'Dr. Lani Kahale is a marine biologist. She studies life in the ocean, from the sunny top all the way down to the dark deep.',
  'She has a little submarine called the Little Nautilus, and she needs a diver. That’s you!',
];
export const FINN_HELLO = 'Beep! I am Finn, the robot camera. I ride on the sub and take photos for our field guide.';
export const OPENING_END = 'Dr. Lani is waiting on the dock, by the sub. Go and say hello!';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk when you are next to someone.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the arrows. Tap the button that pops up to talk.';

export const DIVE_TIP_KEYS = 'Steer the sub with the arrow keys or WASD. Get close to an animal, then press Space and I will take its photo. Lost? Follow my sonar arrow.';
export const DIVE_TIP_TOUCH = 'Hold your finger where you want the sub to go. Get close to an animal, then tap it and I will take its photo. Lost? Follow my sonar arrow.';

export interface ExpeditionInfo {
  id: Station;
  name: string;
  skill: string;
  /** What Lani says before the first dive. */
  intro: string[];
  /** What Lani says when the child comes back to her later. */
  again: string;
  /** Finn, when every photo is taken. */
  allPhotos: string;
  /** Lani, back at the dock, before the logbook questions. */
  logbook: string;
  debrief: TalkQuestion;
  done: string;
}

export const EXPEDITIONS: Record<Station, ExpeditionInfo> = {
  sunlight: {
    id: 'sunlight',
    name: 'The sunlight zone',
    skill: 'Sunlight, food chains and the reef',
    intro: [
      'Aloha! I am Dr. Lani Kahale. I study the ocean, layer by layer.',
      'The ocean has layers, called zones. Each zone gets less sunlight than the one above it, and different animals live in each one.',
      'Let’s start at the top: the sunlight zone, with its coral reef. Take the sub down and photograph six living things for our field guide.',
    ],
    again: 'The reef is always busy. Want to dive again, or work on the logbook?',
    allPhotos: 'That’s all six! The field guide has a whole reef in it now. Let’s head back up to the surface.',
    logbook: 'Wonderful photos! Now let’s write up what we saw in the logbook.',
    debrief: {
      text: 'The sunlight zone is the busiest part of the ocean. Why is it so full of life?',
      options: [
        { text: 'Sunlight lets seaweed and tiny drifters make food, and animals come to eat it.', correct: true, feedback: 'Yes! Sunlight starts the food chain. Where the light is, the food is.' },
        { text: 'The water is cleaner up there.', feedback: 'Clean water helps, but it isn’t food. Think about what the sunlight does.', misconception: 'water-food' },
        { text: 'Animals just like warm water best.', feedback: 'Some do, but warmth doesn’t feed them. What starts the food chain?', misconception: 'warm-deep' },
      ],
      hints: [
        'Where does the energy in the reef’s food chain start?',
        'Seaweed, seagrass and phytoplankton make food from sunlight. Everything else eats them, or eats animals that ate them.',
        'The answer is outlined: sunlight lets food be made.',
      ],
    },
    done: 'The sunlight zone is in the field guide! And the lab tent is open: come and try the Creature Designer.',
  },
  twilight: {
    id: 'twilight',
    name: 'The twilight zone',
    skill: 'Dim light, hiding and living light',
    intro: [
      'Ready to go deeper? Below 200 meters is the twilight zone. Only a little dim blue light gets down there.',
      'It is cold and dim, so the sub’s headlamp comes on by itself. Many animals there make their own light.',
      'Find three twilight animals for the field guide. Then stay down there. At dusk, something amazing happens!',
    ],
    again: 'The twilight zone is full of secrets. Want to dive again, or work on the logbook?',
    allPhotos:
      'Lani here, on the radio! Up top, the Sun is setting. The lanternfish are starting their nightly trip up to feed. Follow the school all the way up! Stay close, and they will lead the way.',
    logbook: 'What a dive! You followed the lanternfish all the way up. Let’s write it up in the logbook.',
    debrief: {
      text: 'Plants can’t grow in the twilight zone. So how do the animals there get food?',
      options: [
        { text: 'They eat food that sinks down, or swim up at night to eat.', correct: true, feedback: 'Yes! Marine snow drifts down, and at night many of them swim up to feed in the dark.' },
        { text: 'They make food with their own lights.', feedback: 'Living light uses energy. It can’t make food.', misconception: 'glow-food' },
        { text: 'They don’t need food.', feedback: 'Every animal needs food to live and grow.', misconception: 'no-food' },
      ],
      hints: [
        'Remember the lanternfish. Where did they go at dusk, and why?',
        'Food comes from the busy top. Some of it sinks down like snow, and some animals swim up to get it.',
        'The answer is outlined: food sinks down, or they swim up at night.',
      ],
    },
    done: 'The twilight zone is in the field guide! You saw the biggest trip on Earth: every night, animals swim up from the deep to feed.',
  },
};

export const SURFACE_LINE = 'We’re back at the top! Good driving.';
export const CHASE_DONE =
  'We swam all the way up with them! Every night, huge numbers of animals swim up from the twilight zone to feed in the dark. It is the biggest trip on Earth, and it happens every single night.';
export const TWILIGHT_LOCKED = 'First, let’s explore the sunlight zone at the top. Then we can go deeper.';
export const DESIGNER_LOCKED = 'The Creature Designer opens after your first dive. Go and see Dr. Lani by the dock!';

export const DESIGNER = {
  intro: [
    'This is the Creature Designer. Build a sea creature from parts: its body, eyes, skin, lights and mouth.',
    'Then send it on a test dive. We will see if it can find food, hide, and stay safe there.',
    'Different places need different features. Try my challenges!',
  ],
  twilightLocked: 'The twilight challenges open after your twilight dive.',
  debrief: {
    text: 'Your silver fish with big eyes and a glowing belly thrived in the twilight zone. On the bright reef, it didn’t hide as well. Why?',
    options: [
      { text: 'Each place needs different features to survive.', correct: true, feedback: 'Yes! A feature that helps in one place may not help in another.' },
      { text: 'It was just a bad creature.', feedback: 'It did great in the twilight zone! Think about the place, not just the creature.', misconception: 'one-best' },
      { text: 'There is no food on the reef.', feedback: 'The reef is full of food. Its hiding was the problem.', misconception: 'wrong-reason' },
    ],
    hints: [
      'What helps an animal hide in dim blue water? And on a colorful reef?',
      'Silver and belly lights hide a fish in the dim twilight. On a bright, colorful reef, bright patterns or a flat body hide it better.',
      'The answer is outlined: each place needs different features.',
    ],
  } as TalkQuestion,
  done: 'You think like a real marine biologist! Animals have features that fit where they live.',
};

export const ALL_DONE = [
  'You explored two zones of the ocean, filled the field guide and designed creatures that fit where they live!',
  'Dr. Lani is getting the sub ready to go even deeper: into the midnight zone, where no sunlight reaches at all. That trip comes next time.',
];

/** Short praise for right answers (one after another, so it does not repeat). */
const PRAISE = ['Great thinking!', 'You got it!', 'Yes! Well done.', 'Spot on!', 'That’s right!', 'Nice work, diver!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

export const GROWNUPS: GrownupsContent = {
  game: 'Ocean Depth Diver',
  grades: 'Grades 3–5',
  summary:
    'Your child joins a research camp where a rainforest river meets the sea. With Dr. Lani Kahale, a marine biologist, and Finn, a little robot camera, they steer a submarine down through the ocean’s layers, photographing the animals that live in each one for a field guide. Back at camp they write up each dive in the logbook (questions at three levels), and in the lab tent they build their own sea creatures from parts and test-dive them to see whether they can find food, hide and stay safe. This first part covers the sunlit reef and the dim twilight zone, ending with a chase that follows lanternfish on their nightly trip up to feed. The deeper zones come in the next part.',
  teaches: [
    {
      title: 'The sunlight zone (the reef)',
      text: 'The ocean has layers. In the top 200 meters there is enough sunlight for seaweed, seagrass and phytoplankton (tiny drifters) to make food, so most ocean life lives here. Food chains start with the Sun. Phytoplankton make about half of the oxygen in the air. Red light fades first in water, and the deeper you go, the colder the water and the stronger the pressure.',
    },
    {
      title: 'The twilight zone',
      text: 'From 200 to 1,000 meters only dim blue light remains, too little for plants. Animals have big eyes, are silver, red or see-through, and many make their own light (bioluminescence): belly lights hide a fish’s shadow from hunters below. Every night many animals, like lanternfish, swim up to feed in the dark and back down by day, carrying food into the deep. Others eat marine snow that drifts down.',
    },
    {
      title: 'The Creature Designer',
      text: 'Children choose a body, eyes, skin, lights and mouth, then test the creature in a zone. Three checks (find food, hide, stay safe) each come with a reason that names the part responsible. Challenges guide them to the big idea: features that help in one place may not help in another.',
    },
    {
      title: 'Mistakes and hints',
      text: 'Every wrong answer gets one sentence about the likely mistake (for example "red things stay red deep down" or "the energy in a food chain starts with the big fish"). Hints go from a nudge, to a picture, to the answer outlined. Hints never cost progress; a star is for getting it right the first time.',
    },
  ],
  standards: [
    { code: 'NGSS 3-LS4-3', text: 'In a particular habitat some organisms can survive well, some less well, and some cannot survive at all (the Creature Designer).' },
    { code: 'NGSS 4-LS1-1', text: 'Plants and animals have structures that support survival, growth and behavior (big eyes, belly lights, silver sides, flat bodies).' },
    { code: 'NGSS 5-PS3-1', text: 'Energy in animals’ food was once energy from the Sun (ocean food chains).' },
    { code: 'NGSS 5-LS2-1', text: 'The movement of matter among plants, animals and the environment (food chains, marine snow, the nightly trip).' },
  ],
  talk: [
    'Why does most ocean life live near the top?',
    'What color would a red fish look deep in the ocean? Why?',
    'How does a glowing belly help a fish hide?',
    'Where does the energy in your lunch first come from? (Follow it back to the Sun!)',
    'If you designed a sea creature, where would it live, and what would help it there?',
  ],
  help: [
    'Levels go up after two right answers in a row, and down after two misses, so the questions fit your child.',
    'Nothing is timed. The dives have no way to lose: Finn’s sonar arrow always points to the next animal, and the lanternfish wait if the sub falls behind.',
    'An expedition is finished after its photos, five stars in the logbook and a talk-it-through question.',
    'Every question can be read aloud, and hints never cost progress.',
  ],
  simplifies: [
    'The zones’ depths are rounded (sunlight to about 200 meters, twilight to about 1,000 meters); real boundaries change with the place and the season.',
    'The sub sinks faster the deeper it goes so the long trip down does not take forever, and it can hold any depth in this game. Real research subs dive slowly and carefully.',
    'The dials are rounded: the temperature is typical of warm tropical seas, and the pressure counts about one more "air at the top" for every 10 meters.',
    'The Creature Designer’s rules keep to a few big ideas. Real animals have many more features, and many different designs can work in the same place.',
  ],
  credits: [
    'Learning design based on the original Ocean Depth Diver game, rebuilt by Learning Adventures. Facts from the old game were corrected (for example, the Portuguese man-of-war floats at the surface, not in the twilight zone).',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Ocean facts checked against NOAA Ocean Exploration and the NOAA Ocean Service (the ocean’s zones, phytoplankton and oxygen, daily vertical migration), the Smithsonian Ocean portal, the Monterey Bay Aquarium Research Institute (bioluminescence) and the Monterey Bay Aquarium.',
  ],
};
