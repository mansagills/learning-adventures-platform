/**
 * Chapter 1 data: the garden spots, what the lens reveals at each one, and
 * the notebook statements the player chooses between.
 *
 * Every spot offers one specific observation (correct), one vague statement
 * (true but not useful) and one guess. The guesses become the "Guess" cards
 * in the sorting game, and the observations become the "Observation" cards.
 */

export interface Zone {
  id: string;
  /** Screen-reader label for the "look here" button. */
  label: string;
  /** Rectangle on the 96x64 painting. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** What the lens shows. */
  detail: string;
}

export interface Spot {
  id: string;
  title: string;
  /** Painting key (art/sceneArt.ts). */
  art: string;
  kind: 'plant' | 'soil' | 'insect';
  /** Hub tile position of the sparkle. */
  x: number;
  y: number;
  bonus?: boolean;
  intro: string;
  zones: Zone[];
  observation: { text: string; details: string[] };
  vague: { text: string; feedback: string };
  guess: { text: string; feedback: string; guessWords: string[] };
  /** Bonus spots share a fun fact. */
  fact?: string;
}

export const SPOTS: Spot[] = [
  {
    id: 'beans',
    title: 'Bean leaves',
    art: 'beans',
    kind: 'plant',
    x: 9.5,
    y: 5.7,
    intro: 'Hattie said something has been nibbling her beans. Look closely at the leaves.',
    zones: [
      { id: 'holes', label: 'Look at the holes in the big leaf', x: 20, y: 12, w: 26, h: 18, detail: 'There are three round holes in the biggest leaf. Their edges look chewed.' },
      { id: 'under', label: 'Look under the big leaf', x: 26, y: 30, w: 16, h: 8, detail: 'Under the leaf is a tiny green caterpillar, about as long as a grain of rice.' },
    ],
    observation: { text: 'The biggest bean leaf has three holes, and a small green caterpillar is underneath it.', details: ['three holes', 'small green caterpillar'] },
    vague: { text: 'The bean plant looks bad.', feedback: 'That may be true, but it is not specific. What exactly do you see? How many holes? What is under the leaf?' },
    guess: {
      text: 'A rabbit must have chewed the bean leaves.',
      feedback: 'Nobody saw a rabbit here. "Must have" is a guess about what happened. Write what you can see.',
      guessWords: ['must have'],
    },
  },
  {
    id: 'soil',
    title: 'Soil by the east fence',
    art: 'soil',
    kind: 'soil',
    x: 13.4,
    y: 6.5,
    intro: 'Hattie said the soil by the east fence never dries out. Kneel down and look.',
    zones: [
      { id: 'damp', label: 'Look at the dark patch of soil', x: 18, y: 30, w: 44, h: 12, detail: 'This soil is darker brown than the rest. Tiny drops of water shine in it.' },
      { id: 'worm', label: 'Look at the pink shape in the soil', x: 28, y: 40, w: 14, h: 8, detail: 'A pink earthworm is wiggling at the surface.' },
    ],
    observation: { text: 'The soil by the fence is dark and damp, and an earthworm is in it.', details: ['dark and damp', 'earthworm'] },
    vague: { text: 'The dirt is kind of weird.', feedback: '"Weird" doesn\'t tell a reader much. What color is it? Is it wet or dry? Is anything living in it?' },
    guess: {
      text: 'The worm lives here because it likes the shade.',
      feedback: "We can't see what the worm likes. \"Because it likes\" is a guess about why. Write what is there.",
      guessWords: ['because it likes'],
    },
  },
  {
    id: 'ladybug',
    title: 'Lettuce leaf',
    art: 'ladybug',
    kind: 'insect',
    x: 12.5,
    y: 3.8,
    intro: 'Something small and red is on the lettuce. Take a close look.',
    zones: [
      { id: 'bug', label: 'Look at the red beetle', x: 24, y: 20, w: 20, h: 18, detail: 'It is a ladybug: red, with seven black spots.' },
      { id: 'aphids', label: 'Look at the pale specks on the leaf', x: 58, y: 28, w: 16, h: 10, detail: 'Tiny pale green bugs are crowded together on the leaf.' },
    ],
    observation: { text: 'A red ladybug with seven black spots is on the lettuce, near tiny pale green bugs.', details: ['seven black spots', 'tiny pale green bugs'] },
    vague: { text: 'There are some bugs.', feedback: 'True, but which bugs? What color are they, and how many spots can you count?' },
    guess: {
      text: 'The ladybug is hungry.',
      feedback: "We can't see whether the ladybug is hungry. That is a guess about how it feels.",
      guessWords: ['is hungry'],
    },
  },
  {
    id: 'carrots',
    title: 'Carrot tops',
    art: 'carrots',
    kind: 'plant',
    x: 11.5,
    y: 5.7,
    intro: 'The carrot tops look different from the other plants. Look at the leaves and the ground.',
    zones: [
      { id: 'tips', label: 'Look at the tips of the carrot leaves', x: 8, y: 8, w: 76, h: 10, detail: 'Some of the leaf tips are yellow and crispy.' },
      { id: 'ground', label: 'Look at the ground around the carrots', x: 0, y: 42, w: 96, h: 14, detail: 'The soil here is pale and cracked, not dark like by the fence.' },
    ],
    observation: { text: 'Some carrot leaves have yellow tips, and the soil around them is pale and cracked.', details: ['yellow tips', 'pale and cracked'] },
    vague: { text: 'The carrots are okay, I guess.', feedback: 'That doesn\'t describe anything we can check. What color are the leaf tips? What does the soil look like?' },
    guess: {
      text: 'The carrots are sad because nobody waters them.',
      feedback: 'Plants don\'t feel sad, and we didn\'t see who waters them. "Because" is explaining why: that\'s a guess.',
      guessWords: ['sad because'],
    },
  },
  {
    id: 'bee',
    title: 'Flowers by the greenhouse',
    art: 'bee',
    kind: 'insect',
    x: 23.5,
    y: 8.5,
    intro: 'A bee is buzzing around the flowers by Carver\'s greenhouse. Look closely, but gently!',
    zones: [
      { id: 'legs', label: "Look at the bee's back legs", x: 52, y: 24, w: 18, h: 8, detail: 'The bee has yellow pollen stuck to its back legs.' },
      { id: 'petals', label: 'Look at the flower', x: 24, y: 10, w: 32, h: 32, detail: 'The flower has five white petals and a yellow middle.' },
    ],
    observation: { text: 'A bee with yellow pollen on its back legs is on a flower with five white petals.', details: ['yellow pollen', 'five white petals'] },
    vague: { text: 'A bee is doing bee stuff.', feedback: 'What stuff, exactly? Look at its legs, and count the petals.' },
    guess: {
      text: 'The bee will take the pollen home to make honey.',
      feedback: 'Bees can do that, but we didn\'t see it happen here. "Will" is about the future, so it\'s a guess.',
      guessWords: ['will take'],
    },
  },
  // Optional bonus spots: faint sparkles you only notice when you wander close.
  {
    id: 'snail',
    title: 'Under an old board',
    art: 'snail',
    kind: 'insect',
    x: 7.2,
    y: 4.5,
    bonus: true,
    intro: 'An old board lies by the garden fence. You lift it up carefully.',
    zones: [
      { id: 'snail', label: 'Look at the snail', x: 40, y: 32, w: 32, h: 18, detail: 'A snail with a brown spiral shell is resting under the board. It has two long feelers.' },
      { id: 'trail', label: 'Look at the shiny line', x: 8, y: 40, w: 36, h: 8, detail: 'A shiny, silvery trail curves across the soil.' },
    ],
    observation: { text: 'A snail with a brown spiral shell is under the board, next to a shiny trail.', details: ['brown spiral shell', 'shiny trail'] },
    vague: { text: 'Something slimy is there.', feedback: 'What is it, and what does it look like? Look at its shell and the shiny line.' },
    guess: {
      text: 'The snail is hiding from birds.',
      feedback: "We can't see why the snail is there. \"Hiding from\" is a guess about its reasons.",
      guessWords: ['hiding from'],
    },
    fact: 'Snails make slime to help them glide. The shiny trail is dried slime.',
  },
  {
    id: 'mushrooms',
    title: 'By the old tree roots',
    art: 'mushrooms',
    kind: 'plant',
    x: 4.5,
    y: 8.2,
    bonus: true,
    intro: 'Something red is peeking out by the tree roots.',
    zones: [
      { id: 'caps', label: 'Look at the red caps', x: 40, y: 26, w: 50, h: 14, detail: 'Three mushrooms have red caps with white spots.' },
      { id: 'stems', label: 'Look at the stems', x: 44, y: 36, w: 40, h: 16, detail: 'Their stems are pale cream and grow right out of the grass.' },
    ],
    observation: { text: 'Three mushrooms with red caps and white spots are growing by the tree roots.', details: ['Three mushrooms', 'red caps'] },
    vague: { text: 'There are some plants by the tree.', feedback: 'Are they plants, exactly? How many are there, and what color are the caps?' },
    guess: {
      text: 'The mushrooms grew here last night.',
      feedback: "We didn't see when they grew. That's a guess about the past.",
      guessWords: ['last night'],
    },
    fact: "Mushrooms aren't plants. They are fungi. Look, but never touch or eat wild mushrooms.",
  },
];

export const MAIN_SPOTS = SPOTS.filter((s) => !s.bonus);
export const REQUIRED_OBSERVATIONS = 3;

/** Where Hattie's card game is played. */
export const BENCH = { x: 9.5, y: 9.3 };

export function spotById(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}

// ------------------------------------------------------------ cards

export interface Card {
  id: string;
  text: string;
  answer: 'obs' | 'guess';
  /** Words you can check (highlighted by the first hint). */
  details: string[];
  /** Words that give a guess away (highlighted by the second hint). */
  guessWords: string[];
  /** Said when the card is put in the wrong basket. */
  wrongFeedback: string;
}

export function cardFor(id: string): Card | undefined {
  const [kind, spotId] = id.split(':');
  const s = spotById(spotId);
  if (!s) return undefined;
  if (kind === 'obs')
    return {
      id,
      text: s.observation.text,
      answer: 'obs',
      details: s.observation.details,
      guessWords: [],
      wrongFeedback: `Look again: "${s.observation.details.join('" and "')}" are things anyone can check right now. That makes it an observation.`,
    };
  return {
    id,
    text: s.guess.text,
    answer: 'guess',
    details: [],
    guessWords: s.guess.guessWords,
    wrongFeedback: s.guess.feedback,
  };
}

/** Seeded shuffle so a deck is the same every time it's rebuilt from the save. */
export function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let a = seed >>> 0 || 1;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build the 8-card deck: 4 observations (the player's own first, then
 * others) and 4 guesses from different spots.
 */
export function buildDeck(recordedSpotIds: string[], seed: number): string[] {
  const mainIds = MAIN_SPOTS.map((s) => s.id);
  const obsSpots = [...recordedSpotIds, ...mainIds.filter((id) => !recordedSpotIds.includes(id))].slice(0, 4);
  const guessSpots = shuffle(mainIds, seed + 7).slice(0, 4);
  return shuffle([...obsSpots.map((id) => `obs:${id}`), ...guessSpots.map((id) => `guess:${id}`)], seed);
}
