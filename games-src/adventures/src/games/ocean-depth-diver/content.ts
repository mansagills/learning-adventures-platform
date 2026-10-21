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
  midnight: {
    id: 'midnight',
    name: 'The midnight zone',
    skill: 'Total darkness, living light and saving energy',
    intro: [
      'Ready to go deeper still? Below 1,000 meters is the midnight zone. No sunlight ever reaches it. It is pitch black and near freezing.',
      'The only lights down there are made by animals. Food is hard to find, so animals there have clever ways to catch it.',
      'Find three midnight animals for the field guide. Look for their lights, and use the headlamp.',
    ],
    again: 'The midnight zone is dark, but it is full of life. Want to dive again, or work on the logbook?',
    allPhotos: 'Three midnight animals! That’s as deep as we go today. Dr. Lani is winching the sub back up. Hold on!',
    logbook: 'What a dive! You went deeper than 2,000 meters. Let’s write it up in the logbook.',
    debrief: {
      text: 'No sunlight ever reaches the midnight zone. So why do so many animals there make their own light?',
      options: [
        { text: 'To find food, to find each other, and to scare off hunters.', correct: true, feedback: 'Yes! In the dark, light is a lure, a signal and an alarm.' },
        { text: 'To keep warm in the cold.', feedback: 'Living light is cold light. It makes almost no heat.', misconception: 'glow-hot' },
        { text: 'To help plants grow down there.', feedback: 'No plants live in the dark. They need sunlight.', misconception: 'plants-deep' },
      ],
      hints: [
        'Remember the anglerfish’s lure and the atolla jelly’s flashing ring. What did each light do?',
        'The lure brings food close. The flashing ring may call for help. Lights help animals eat and stay safe.',
        'The answer is outlined: to find food, find each other and scare off hunters.',
      ],
    },
    done: 'The midnight zone is in the field guide! Life in the dark makes its own light.',
  },
  vents: {
    id: 'vents',
    name: 'The deep sea floor',
    skill: 'Hot vents and food from chemicals',
    intro: [
      'Our last expedition goes all the way to the bottom: the deep sea floor. Most of it is cold, dark mud.',
      'But in some places, there are hot vents. Water heated deep inside Earth gushes out of cracks in the sea floor. Scientists first found them in 1977, and they were amazed by what lives there.',
      'Photograph three vent animals. And steer close to the big chimney: the sub’s arm can take a sample of the hot water.',
    ],
    again: 'The hot vents are one of the strangest places on Earth. Want to dive again, or work on the logbook?',
    allPhotos: 'Photos and the water sample are done! Dr. Lani is winching us back up. That’s a long way: 2,600 meters!',
    logbook: 'You went all the way to the bottom! Let’s write it up in the logbook.',
    debrief: {
      text: 'No sunlight reaches the hot vents. So where does the energy for their food chain come from?',
      options: [
        { text: 'Bacteria make food from chemicals in the hot vent water.', correct: true, feedback: 'Yes! This food chain starts with chemicals from inside Earth, not the Sun.' },
        { text: 'Sunlight shines down from the top.', feedback: 'Sunlight runs out by 1,000 meters. The vents are much deeper.', misconception: 'chemo-sun' },
        { text: 'The tube worms catch fish to eat.', feedback: 'Giant tube worms have no mouth! Something inside them makes their food.', misconception: 'diet-mixup' },
      ],
      hints: [
        'What lives inside the giant tube worm, and what does it use?',
        'Bacteria inside the tube worms use chemicals in the vent water to make food. The worms live on that food.',
        'The answer is outlined: bacteria make food from chemicals.',
      ],
    },
    done: 'The deep sea floor is in the field guide! You saw a food chain that starts without the Sun.',
  },
};

/** Finn, after taking the vent water sample (the numbers match the dials and the logbook). */
export const SAMPLE_LINES = [
  'Sample taken! Beep, beep... my thermometer says 360 °C! That’s more than three times as hot as boiling water in a pot.',
  'But it doesn’t boil. All the water above us presses down so hard that it can’t turn into bubbles.',
];

export const SURFACE_LINE = 'We’re back at the top! Good driving.';
export const CHASE_DONE =
  'We swam all the way up with them! Every night, huge numbers of animals swim up from the twilight zone to feed in the dark. It is the biggest trip on Earth, and it happens every single night.';
export const LOCKED: Record<Station, string> = {
  sunlight: '',
  twilight: 'First, let’s explore the sunlight zone at the top. Then we can go deeper.',
  midnight: 'First, let’s finish the twilight zone. Then we can go deeper.',
  vents: 'First, let’s finish the midnight zone. Then we can go all the way to the bottom.',
};

/** The finale: the Trench Dive, then the Glow Show. */
export const TRENCH = {
  name: 'The Trench Dive',
  ready: 'You have explored every zone, and the Creature Designer too! There is one dive left: the Trench Dive.',
  notYet: 'Finish every expedition and all the Creature Designer challenges. Then we can try the Trench Dive!',
  intro: [
    'You have explored every zone, from the sunny reef to the hot vents. There is one place left: a trench, the deepest kind of place in the ocean.',
    'The Little Nautilus is ready for the Trench Dive: all the way down, almost 11,000 meters. That’s about 11 kilometers!',
    'We will stop at the bottom of each zone on the way, and I will radio you a question. And keep Finn ready. Something lives even down there!',
  ],
  checkpoints: [
    'Radio check! You are 200 meters down, at the bottom of the sunlight zone. Here is a question about the top of the sea.',
    'You are 1,000 meters down: the end of the twilight zone. From here on, there is no sunlight at all. Here is a question.',
    'You are 4,000 meters down: the bottom of the midnight zone. Here is a question.',
    'You are 6,000 meters down. The trench starts here, and its walls close in. Here is a question.',
    'You made it to the bottom, almost 11,000 meters down! Only a few people have ever been this deep. One last question.',
  ],
  snailfishFirst: 'Finn here! Before we land on the bottom, let’s find that snailfish. Follow my sonar arrow!',
  noStars: 'These radio questions are just for fun. There are no stars to win.',
  done: 'You did it! You dived from the sunny reef all the way to the bottom of a trench. That is the whole ocean, top to bottom!',
};

export const GLOW = {
  intro: 'Welcome back! It’s dark now. Come down to the water and look: the waves are glowing blue!',
  lines: [
    'Tiny plankton make this light. When the water moves, they flash. Scientists call it living light, or bioluminescence.',
    'You have seen living light in every dark zone: lanternfish, the anglerfish’s lure, the atolla jelly’s alarm. And here it is again, right by the camp.',
  ],
  end: 'Thank you for diving with us, scientist! The field guide and the Creature Designer are always here. Dive again any time.',
};
export const DESIGNER_LOCKED = 'The Creature Designer opens after your first dive. Go and see Dr. Lani by the dock!';

export const DESIGNER = {
  intro: [
    'This is the Creature Designer. Build a sea creature from parts: its body, eyes, skin, lights and mouth.',
    'Then send it on a test dive. We will see if it can find food, hide, and stay safe there.',
    'Different places need different features. Try my challenges!',
  ],
  allMet: (n: number) => `All ${n} challenges met! Before you go, one question.`,
  locked: {
    sunlight: '',
    twilight: 'The twilight challenges open after your twilight dive.',
    midnight: 'The midnight challenges open after your midnight dive.',
  } as Record<'sunlight' | 'twilight' | 'midnight', string>,
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

/** Ranger Tala, once every expedition and the Creature Designer are done. */
export const ALL_DONE = [
  'You explored every zone of the ocean, filled the field guide and designed creatures that fit where they live!',
  'Dr. Lani has one more dive ready: the Trench Dive, to the deepest place in the ocean. Go and see her on the dock!',
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
    'Your child joins a research camp where a rainforest river meets the sea. With Dr. Lani Kahale, a marine biologist, and Finn, a little robot camera, they steer a submarine down through the ocean’s layers, photographing the animals that live in each one for a field guide. Back at camp they write up each dive in the logbook (questions at three levels), and in the lab tent they build their own sea creatures from parts and test-dive them to see whether they can find food, hide and stay safe. There are four expeditions: the sunlit reef, the dim twilight zone (ending with a chase that follows lanternfish on their nightly trip up to feed), the pitch-black midnight zone, and the deep sea floor with its hot vents, where they take a sample of the vent water. The finale is the Trench Dive, all the way down to about 11,000 meters, with a question at the bottom of each zone, and the game ends on the camp’s beach at night, where the waves glow with living light.',
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
      title: 'The midnight zone',
      text: 'From 1,000 to 4,000 meters there is no sunlight at all, and the water is near freezing. Almost all the light comes from animals: the anglerfish’s lure brings food close, and the atolla jelly flashes a ring of blue lights when it is attacked. Food is scarce, so animals save energy, and many have huge mouths. Red animals look black, so red is a good way to hide.',
    },
    {
      title: 'The deep sea floor and hot vents (a grade 5 stretch)',
      text: 'Most of the sea floor is cold, dark mud 3,000 to 6,000 meters down, fed by marine snow from above. At hot vents, water heated inside Earth gushes out at more than 350 °C without boiling, because of the huge pressure. Bacteria there make food from chemicals instead of sunlight, so the food chain starts without the Sun: giant tube worms have no mouth and live on bacteria inside them, and yeti crabs farm bacteria on their hairy arms.',
    },
    {
      title: 'The Trench Dive',
      text: 'Trenches are the deepest places in the ocean, down to about 11,000 meters: Mount Everest would fit inside with room to spare. The deepest fish ever seen was a snailfish filmed 8,336 meters down in 2023. On the way down, Dr. Lani asks one question at the bottom of each zone (no stars, just a review).',
    },
    {
      title: 'The Creature Designer',
      text: 'Children choose a body, eyes, skin, lights and mouth, then test the creature on the reef, in the twilight zone or (after that dive) in the midnight zone. Three checks (find food, hide, stay safe) each come with a reason that names the part responsible. Six challenges guide them to the big idea: features that help in one place may not help in another.',
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
    'How can animals at hot vents live with no sunlight at all?',
  ],
  help: [
    'Levels go up after two right answers in a row, and down after two misses, so the questions fit your child.',
    'Nothing is timed. The dives have no way to lose: Finn’s sonar arrow always points to the next animal, and the lanternfish wait if the sub falls behind.',
    'An expedition is finished after its photos, five stars in the logbook and a talk-it-through question. The Trench Dive opens when all four expeditions and the Creature Designer are finished.',
    'Every question can be read aloud, and hints never cost progress.',
  ],
  simplifies: [
    'The zones’ depths are rounded (sunlight to about 200 meters, twilight to about 1,000 meters); real boundaries change with the place and the season.',
    'The sub sinks faster the deeper it goes so the long trip down does not take forever, and it can hold any depth in this game. Real research subs dive slowly and carefully.',
    'The dials are rounded: the temperature is typical of warm tropical seas, and the pressure counts about one more "air at the top" for every 10 meters.',
    'The sub reaches the bottom of a trench in about a minute. Real crewed dives to the bottom of the Challenger Deep take about four hours each way.',
    'The hot vents are drawn about 2,600 meters down, on an undersea mountain ridge, as many are. Vent water is shown as 360 °C; real vents range from warm to more than 400 °C.',
    'The Creature Designer’s rules keep to a few big ideas. Real animals have many more features, and many different designs can work in the same place.',
  ],
  credits: [
    'Learning design based on the original Ocean Depth Diver game, rebuilt by Learning Adventures. Facts from the old game were corrected: the Portuguese man-of-war floats at the surface, not in the twilight zone; sharks cannot smell blood from miles away; the deepest fish ever seen is a snailfish at 8,336 meters (2023); and the tube worms that live for 250 years or more are a cold-seep kind, not the fast-growing giant tube worms of hot vents.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Ocean facts checked against NOAA Ocean Exploration and the NOAA Ocean Service (the ocean’s zones, phytoplankton and oxygen, daily vertical migration, hydrothermal vents and the 1977 discovery, the Challenger Deep), the Smithsonian Ocean portal, the Monterey Bay Aquarium Research Institute (bioluminescence, the atolla jelly) and the Monterey Bay Aquarium. The deepest fish record is from the University of Western Australia and Tokyo University of Marine Science and Technology (2023).',
  ],
};
