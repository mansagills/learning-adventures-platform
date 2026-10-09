import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question } from '../../kit/ui/talk';
import { ROMAN_FORUM } from '../../kit/worlds/ancient-kingdoms/forum';
import { fstr, partName, PARTY_PROBLEMS, postCount, type Misconception, type Problem, type Station } from './problems';

/**
 * Everything Forum Fraction Feast says: the people in the forum, the
 * opening, the question for each challenge, a sentence for each kind of
 * mistake, the hints, the debriefs and the grown-ups page. Sentences are
 * short because many players are still learning to read (read-aloud is on).
 * The pictures never show the answer as a number, so the child reads the
 * picture.
 */

export const STARS_PER_STATION = 5;

export const HOST = { name: 'Baker Livia', role: 'Runs the forum bakery' };
export const ANSER = { name: 'Anser', role: 'Livia’s goose (loves bread)' };

export interface StationInfo {
  id: Station;
  name: string;
  skill: string;
  person: { name: string; role: string };
  grades: string;
  intro: string[];
  debrief: Question;
  done: string;
}

export const STATION_INFO: Record<Station, StationInfo> = {
  bakery: {
    id: 'bakery',
    name: 'The Bakery',
    skill: 'Fair shares',
    person: HOST,
    grades: 'grades 2–3',
    intro: [
      'Here is my oven! Every loaf must be cut into fair shares, so nobody at the feast gets a smaller piece.',
      'Fair shares are pieces of the same size. Look carefully at each loaf before you answer.',
    ],
    debrief: {
      text: 'This loaf is cut into 4 pieces, but the pieces are different sizes. Is each piece a fourth?',
      options: [
        { text: 'No. Fourths are 4 pieces of the same size.', correct: true, feedback: 'Yes! Fourths must be fair: 4 equal pieces. Different sizes are not fourths.' },
        { text: 'Yes, because there are 4 pieces.', feedback: 'There are 4 pieces, but a fraction needs equal pieces. A big piece is more than a fourth.', misconception: 'unequal-parts' },
        { text: 'Yes, if you eat all of them.', feedback: 'Eating them all is the whole loaf. A fourth is one of 4 equal pieces.', misconception: 'whole-not-one' },
      ],
      hints: ['What makes a share fair?', 'Fair shares are the same size. Are these the same size?', 'The answer is outlined: no, fourths must be equal.'],
    },
    done: 'Every loaf is cut fairly. The first brazier is lit!',
  },
  road: {
    id: 'road',
    name: 'Milestone Road',
    skill: 'Fractions on a line',
    person: { name: 'Marcus', role: 'Road surveyor' },
    grades: 'grade 3',
    intro: [
      'Salve! I measure roads. See the golden milestone? Roman roads were counted from a golden milestone in the forum. Here it is the start: 0.',
      'Milestone I is 1. I put a post at the end of every equal stretch between them. Help me put my flags in the right places.',
    ],
    debrief: {
      text: 'The road from 0 to 1 has 4 equal stretches. Where does 4/4 go?',
      options: [
        { text: 'On milestone I, because 4/4 is one whole.', correct: true, feedback: 'Yes! 4 stretches of 1/4 take you all the way to 1. 4/4 is the same as 1.' },
        { text: 'On the last post of the whole road.', feedback: 'The whole is from 0 to 1. The road goes on past 1, so the last post is more than 1.', misconception: 'whole-at-end' },
        { text: 'On the fourth post, counting the golden milestone.', feedback: 'The golden milestone is 0. Count the stretches you walk, not the posts.', misconception: 'start-at-one' },
      ],
      hints: ['How many stretches of 1/4 make the whole way from 0 to 1?', 'Walk 1/4, 2/4, 3/4, 4/4 from the golden milestone. Where are you?', 'The answer is outlined: on milestone I.'],
    },
    done: 'All my flags are right! The second brazier is burning.',
  },
};

export const OPENING: string[] = [
  'Salve! Welcome to the forum! I am Livia, the baker. Tonight is the festival, and the whole town comes to eat.',
  'We Romans cut round loaves into equal pieces before baking, so everyone gets a fair share. Loaves like that were found at Pompeii!',
  'Help my friends and me get ready. Each job you finish lights one of the four bronze braziers round the mosaic.',
  'Oh, and watch out for Anser, my goose. Anser loves bread!',
];

export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk to someone. J shows your jobs.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the pad. Tap a person to talk to them.';

/** Said by Livia after both jobs of the first half are done. */
export const HALF_ONE_DONE = [
  'Two braziers are burning! Thank you!',
  'Cornelia’s market stall and Tullia’s mosaic open soon. When all four braziers burn, we have the Festival Feast!',
];

export const ANSER_LINES = ['HONK! Anser looks at your hands. Any bread?', 'HONK HONK! Anser waddles in a circle.', 'Anser tilts its head. It is counting the loaves, maybe.', 'HONK! Romans said geese once woke the city by honking. Anser is proud of that.'];

const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// ------------------------------------------------------------ questions

/** The question for a challenge (Fraction Pizza Party problems carry their own text). */
export function promptFor(p: Problem & { text?: string }, seed: number): string {
  if (p.text) return p.text;
  switch (p.kind) {
    case 'fair':
      return `I need a loaf cut into ${partName(p.d)}. Which loaf is cut into fair ${partName(p.d)}?`;
    case 'name-cut':
      return 'This loaf is cut into equal slices. What are the slices called?';
    case 'eaten':
      return seed % 2 ? 'Anser ate some of this loaf! What fraction of the loaf did Anser eat?' : 'Oh no, some pieces are gone! What fraction of the loaf is gone?';
    case 'left':
      return seed % 2 ? 'Anser ate some pieces. What fraction of the loaf is left?' : 'Some pieces were sold. What fraction of the loaf is still here?';
    case 'share':
      return `${cap(NUM_WORDS[p.d])} friends share this loaf equally. What fraction does each friend get?`;
    case 'whole':
      return `I cut this loaf into ${p.d} equal pieces. Nobody has eaten any yet. What fraction of the loaf is on the plate?`;
    case 'build':
      return `This piece is 1/${p.d} of a loaf. How many pieces like it make the whole loaf?`;
    case 'unit-count':
      return `The golden pieces are ${p.n}/${p.d} of the loaf. How many 1/${p.d} pieces is that?`;
    case 'place':
      return p.road.end === 2 ? `Put the flag at ${fstr(p.target)}.` : `Put the flag at ${fstr(p.target)} of the way from the golden milestone to milestone I.`;
    case 'name':
      return 'I put a flag on the road. What fraction is the flag at?';
  }
}

/** One sentence about the likely mistake behind a wrong pick. */
export function mistakeLine(p: Problem, mis: Misconception): string {
  const bake = p.station === 'bakery';
  switch (mis) {
    case 'unequal-parts':
      return `That loaf has ${p.kind === 'fair' ? p.d : 'the right number of'} pieces, but they are not the same size. Fair shares must all be equal.`;
    case 'wrong-count':
      return p.kind === 'fair' ? `Those pieces are fair, but count them. You need ${p.d} pieces.` : 'Count the pieces one by one. How many are there?';
    case 'counted-cuts':
      return p.kind === 'build' ? 'There is one more piece than cuts. Picture the pieces going all the way round.' : 'That is the number of cuts. Count the pieces instead: there is one more piece than cuts.';
    case 'part-over-part':
      return 'That compares one part with the other part. The bottom number is all the pieces in the whole loaf, gone or not.';
    case 'eaten-left-swap':
      if (p.kind === 'whole') return 'Nothing is gone! Count the pieces that are still on the plate.';
      return p.kind === 'eaten' ? 'That is the part still on the plate. The question asks about the pieces that are gone.' : 'That is the part that is gone. The question asks what is still here.';
    case 'upside-down':
      return 'That fraction is upside down. The bottom number is how many equal pieces make the whole. The top number is how many we are talking about.';
    case 'whole-not-one':
      return 'All the pieces are still here, not just one. How many of the pieces are on the plate?';
    case 'gave-whole':
      return p.station === 'bakery' ? `${p.d}/${p.d} is the whole loaf! Each friend gets just one of the equal pieces.` : 'Not quite. Try a hint!';
    case 'unit-only':
      return p.kind === 'build' ? 'One piece is just the piece in the picture. How many like it fit in the whole loaf?' : 'That is just one piece. Count all the golden pieces.';
    case 'denominator-count':
      return 'The bottom number tells how many pieces make the whole loaf. The top number tells how many golden pieces there are.';
    case 'off-by-one':
      return bake ? 'Close! Count the pieces again, one at a time.' : 'Close! Count the stretches again, starting at the golden milestone.';
    case 'start-at-one':
      return p.kind === 'name' ? 'The golden milestone is 0. Count the stretches you walk from 0 to the flag.' : 'Start at the golden milestone, which is 0. Count the stretches you walk, not the posts.';
    case 'count-posts':
      return p.kind === 'name' ? 'You counted the posts. Count the equal stretches between 0 and 1 instead.' : 'Count the stretches between the posts, starting at 0.';
    case 'from-end':
      return 'You counted back from milestone I. Start at the golden milestone, at 0.';
    case 'whole-at-end':
      return `${fstrOf(p)} is one whole: all the stretches from 0 to 1. The end of this road is 2.`;
    case 'whole-road':
      return 'The whole is from 0 to 1, not the whole road to milestone II. The bottom number counts the stretches from 0 to 1.';
    case 'past-one-only':
      return `${fstrOf(p)} is more than 1. Start at 0 and count all the stretches, right past milestone I.`;
    default:
      return 'Not quite. Try a hint!';
  }
}

const fstrOf = (p: Problem) => (p.station === 'road' ? fstr(p.target) : '');

/** The hint ladder: 1 a nudge, 2 a picture helper (the game changes the picture), 3 the answer outlined. */
export function hintText(p: Problem, rung: number): string {
  const right = p.choices.find((c) => c.correct)!;
  if (rung >= 3) return p.kind === 'place' ? `The right post is outlined: ${fstr(p.target)}.` : `The answer is outlined: ${right.label}.`;
  switch (p.kind) {
    case 'fair':
      return rung === 1 ? 'Look at the sizes. Are all the pieces in each loaf the same size?' : `Count the pieces in each loaf. You need ${p.d} pieces, and they must all match.`;
    case 'name-cut':
      return rung === 1 ? 'Count the pieces, not the cuts.' : 'Each piece now has dots. Count the pieces: 1 dot, 2 dots, and so on.';
    case 'eaten':
    case 'left':
      return rung === 1
        ? 'How many equal pieces were in the whole loaf? That is the bottom number.'
        : `Each piece now has dots, even the ones that are gone. All ${p.d} pieces make the whole. Now count the pieces ${p.kind === 'eaten' ? 'that are gone' : 'still on the plate'}.`;
    case 'share':
      return rung === 1 ? 'How many equal pieces do the friends need?' : `${cap(NUM_WORDS[p.d])} friends need ${NUM_WORDS[p.d]} equal pieces, one each. What is one piece called?`;
    case 'whole':
      return rung === 1 ? 'Count the pieces on the plate. Are any gone?' : 'Each piece now has dots. Count the pieces on the plate, and all the pieces the loaf was cut into.';
    case 'build':
      return rung === 1 ? 'Imagine more pieces like this one, all the way round the plate.' : 'Here is the whole loaf, cut into pieces just like that one. Count the pieces.';
    case 'unit-count':
      return rung === 1 ? `Each 1/${p.d} is one piece of the loaf.` : 'Each golden piece now has dots. Count the golden pieces.';
    case 'place':
      return rung === 1 ? 'Each post marks the end of one equal stretch. Start at the golden milestone, 0.' : `The stretches are colored now. Walk ${p.target.n} stretch${p.target.n === 1 ? '' : 'es'} from 0.`;
    case 'name': {
      const posts = postCount(p.road);
      return rung === 1
        ? 'How many equal stretches are there from 0 to milestone I? That is the bottom number.'
        : `There are ${p.road.d} stretches from 0 to 1 (and ${posts} posts, so do not count posts). Now count the colored stretches from 0 to the flag.`;
    }
  }
}

const PRAISE = ['Bene! (That means well done!)', 'Fair and square!', 'Perfect slicing!', 'Right on the mark!', 'Optime! (Excellent!)', 'Just right!', 'Anser is impressed. HONK!'];

export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

/** The partner's (Fraction Pizza Party) problems, asked in order at level 2 before made-up ones. */
export const PARTY_COUNT = PARTY_PROBLEMS.length;

// ------------------------------------------------------------ the grown-ups page

export const GROWNUPS: GrownupsContent = {
  game: 'Forum Fraction Feast',
  grades: '2–4',
  summary:
    'Your child walks around a Roman forum on festival day and helps the people there get ready. Every job is about sharing fairly: cutting loaves into equal pieces, naming the fraction eaten or left, and marking fractions on a road between milestones. Each finished job lights a bronze brazier. The pictures never print the answer as a number, so your child has to read the picture.',
  teaches: [
    { title: 'The Bakery (grades 2–3): fair shares and naming fractions', text: 'Which loaf is cut into fair halves, thirds or fourths; what equal pieces are called; the fraction eaten or left (Anser the goose steals pieces); sharing a loaf among friends; 4/4 as one whole loaf; and a/b as a pieces of size 1/b.' },
    { title: 'Milestone Road (grade 3): fractions on a number line', text: 'The road from the golden milestone (0) to milestone I (1) is cut into equal stretches. Your child puts a flag at a fraction or names where a flag is: unit fractions, then fractions like 3/4 and 5/8, then fractions past 1 (5/4, 3/2) on a road to milestone II.' },
    { title: 'Mistakes get a reason', text: 'The game looks for unequal pieces called fourths, eaten over left (2/6) instead of eaten over all the pieces (2/8), fractions written upside down, counting the cut lines instead of the pieces, and on the road counting posts instead of stretches. Each gets one sentence of explanation.' },
    { title: 'Help built in', text: 'Three hints for every question: a tip, then a picture helper (dots to count the pieces, or the road’s stretches colored in), then the answer outlined.' },
    { title: 'Coming in the next part', text: 'Cornelia’s market stall (comparing fractions) and Tullia’s mosaic (equivalent fractions), the Festival Feast finale and the 60-second Frenzy mode.' },
  ],
  standards: [
    { code: '2.G.3', text: 'Partition circles and rectangles into two, three, or four equal shares; describe the shares using halves, thirds, fourths; recognize that equal shares need not have the same shape.' },
    { code: '3.NF.1', text: 'Understand a fraction 1/b as one part when a whole is partitioned into b equal parts, and a/b as a parts of size 1/b.' },
    { code: '3.NF.2', text: 'Understand a fraction as a number on the number line; represent fractions on a number line diagram.' },
  ],
  talk: [
    'At a meal, cut something into 4 pieces, one of them much bigger. Ask: is each piece a fourth?',
    'If someone eats 3 of 8 slices, ask what fraction is gone and what fraction is left. Do they add up to the whole?',
    'On a walk, count the stretches between lampposts. If there are 4 stretches to the corner, where is 3/4 of the way?',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Nothing in the main game is timed. A wrong answer never loses progress; it only costs that question’s star.',
    'Every question can be read aloud (the speaker button), and every answer can be picked with the number keys.',
  ],
  simplifies: [
    'Loaves are shown from above so the pieces are easy to compare. Real Roman loaves were domed.',
    'The road diagram is not to scale: a real Roman mile was about 1,480 meters (about 4,850 feet).',
    'The forum is a friendly mix of buildings from the time of the emperors, not a map of one exact year.',
  ],
  credits: [
    'Learning content from the Learning Adventures games Pizza Fraction Frenzy and Fraction Pizza Party: all ten Fraction Pizza Party problems are in the bakery, with loaves instead of pizzas.',
    'Art, music and sound by Learning Adventures, made in code.',
    `Setting: ${ROMAN_FORUM.inspiredBy}`,
    'Sources checked: The British Museum, carbonised loaf of bread from Herculaneum (AD 79), scored into eight portions; Parco Archeologico di Pompei, the bakeries of Pompeii; Encyclopaedia Britannica, Roman road system and the Golden Milestone (Milliarium Aureum).',
    ...(ROMAN_FORUM.sources ?? []).map((s) => `Source: ${s}`),
  ],
};
