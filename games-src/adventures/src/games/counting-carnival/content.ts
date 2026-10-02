import type { Question } from '../../kit/ui/talk';
import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Booth, Misconception, Problem } from './problems';

/**
 * Everything Counting Carnival says: the booths, Ringmaster Rosa's and
 * Munch's lines, hints, explanations for mistakes, the "talk it through"
 * question for each booth, and the grown-ups page. Sentences are short,
 * because many players are just learning to read (read-aloud is on).
 */

export const STARS_PER_BOOTH = 5;

export interface BoothInfo {
  id: Booth;
  name: string;
  skill: string;
  /** Who runs the booth. */
  host: 'rosa' | 'munch';
  intro: string[];
  debrief: Question;
  done: string;
}

export const BOOTH_INFO: Record<Booth, BoothInfo> = {
  ducks: {
    id: 'ducks',
    name: 'Duck Pond',
    skill: 'Count every duck',
    host: 'rosa',
    intro: ['Welcome to the Duck Pond! Tap each duck one time as you count.', 'The last number you say tells how many ducks there are.'],
    debrief: {
      text: 'Pip counted 5 ducks: one, two, three, four, five. How many ducks are there?',
      options: [
        { text: '5 ducks', correct: true, feedback: 'Yes! The last number you say tells how many. Five!' },
        { text: '1 duck', feedback: 'Pip started at one, but kept counting. The last number tells how many.', misconception: 'first-number' },
        { text: 'We have to count again', feedback: 'You could check, but Pip already knows. The last number Pip said was five.', misconception: 'recount' },
      ],
      hints: ['Which number did Pip say last?', 'Pip said five last. The last number tells how many.', 'The answer is outlined: 5 ducks.'],
    },
    done: 'You count like a carnival pro! Every duck once, and the last number tells how many.',
  },
  rings: {
    id: 'rings',
    name: 'Ring Toss',
    skill: 'Quick looks and making 10',
    host: 'rosa',
    intro: ['This is the Ring Toss! The pegs make a ten-frame: two rows of five.', 'Look fast. A full top row is 5. Use that to see how many!'],
    debrief: {
      text: 'The top row is full, and one more ring is in the bottom row. How many rings?',
      options: [
        { text: '6 rings', correct: true, feedback: 'Yes! A full row is 5, and 1 more is 6.' },
        { text: '5 rings', feedback: 'The full row is 5, but there is one more ring below.', misconception: 'top-row-only' },
        { text: '10 rings', feedback: '10 would fill both rows. The bottom row has only one ring.', misconception: 'said-ten' },
      ],
      hints: ['How many rings fit in a full row?', 'A full row is 5. Then count on: 5, 6.', 'The answer is outlined: 6 rings.'],
    },
    done: 'Super eyes! You can see 5 at a glance, and you know how many more make 10.',
  },
  snacks: {
    id: 'snacks',
    name: "Munch's Snack Stand",
    skill: 'More, fewer, 1 more, 10 more',
    host: 'munch',
    intro: ['MUNCH! Hi! I am Munch. I am always hungry.', 'Help me pick the right snacks. Count carefully. Big cookies are not always more cookies!'],
    debrief: {
      text: 'One plate has 3 big cookies. One plate has 5 small cookies. Which plate has more cookies?',
      options: [
        { text: 'The 5 small cookies', correct: true, feedback: 'Yes! Five is more than three, even if the cookies are small. Yum!' },
        { text: 'The 3 big cookies', feedback: 'Big cookies take more space, but three is fewer than five.', misconception: 'bigger-looks-more' },
        { text: 'They are the same', feedback: 'Count them: 3 and 5 are not the same.', misconception: 'same' },
      ],
      hints: ['Count each plate. Do not look at the size.', 'Three or five: which is the bigger number?', 'The answer is outlined: the 5 small cookies.'],
    },
    done: 'MUNCH MUNCH! My tummy is happy. You know more, fewer, 1 more and 10 more!',
  },
  tickets: {
    id: 'tickets',
    name: 'Prize Counter',
    skill: 'Count tickets in tens and ones',
    host: 'rosa',
    intro: ['Welcome to the Prize Counter! Tickets come in strips of 10, and single tickets.', 'Count the strips by tens: 10, 20, 30. Then count the singles: 31, 32.'],
    debrief: {
      text: 'You have 4 strips of 10 and 7 single tickets. How many tickets?',
      options: [
        { text: '47 tickets', correct: true, feedback: 'Yes! 4 tens is 40, and 7 more is 47.' },
        { text: '74 tickets', feedback: 'That swaps the tens and the ones. The 4 strips are tens, so 4 goes first.', misconception: 'reversed' },
        { text: '11 tickets', feedback: '4 + 7 is 11, but each strip is 10 tickets, not 1.', misconception: 'added-digits' },
      ],
      hints: ['Count the strips by tens first.', '10, 20, 30, 40. Then count on 7 more.', 'The answer is outlined: 47 tickets.'],
    },
    done: 'Tens and ones, you have got them! You are a prize-counting champion.',
  },
};

// ------------------------------------------------------------------ lines

export const OPENING = [
  'Welcome to the Counting Carnival! I am Ringmaster Rosa.',
  'There are four booths to play. Each one has a counting game.',
  'Win 5 stars at a booth to light it up. Light up all four for a carnival surprise!',
];

export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys. Walk up to a booth and press Space to play.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to walk. Walk up to a booth and tap Play.';

export const FINALE = [
  'You lit up every booth! Look at the carnival lights!',
  'You counted ducks, looked fast at rings, fed Munch, and counted tickets by tens.',
  'You are a Counting Carnival Champion! Come back any time to play again.',
];

const PRAISE = ['Great counting!', 'You got it!', 'Ta-da!', 'Wonderful!', 'Super job!'];
export const praise = (i: number) => PRAISE[i % PRAISE.length];

/** What to say after a wrong answer, by the idea behind it. */
export function mistakeLine(p: Problem, m: Misconception | 'first-number' | 'recount' | 'same', picked: number): string {
  switch (m) {
    case 'skipped':
      return p.booth === 'tickets' ? `That is ${picked}, one short. Count the single tickets again.` : 'One too few. Did you skip one? Touch each one as you count.';
    case 'double-counted':
      return p.booth === 'tickets' ? `That is ${picked}, one too many. Count the single tickets again.` : 'One too many. Did you count one twice? Touch each one only once.';
    case 'miscount':
      return 'So close! Look again. Use the full row of 5 to help.';
    case 'top-row-only':
      return 'The top row is 5. Look below it too, and count on.';
    case 'said-the-count':
      return 'That is how many rings are already there. How many MORE do we need to fill all 10 pegs?';
    case 'said-ten':
      return 'Ten is all the pegs. Some pegs already have rings. Count only the empty pegs.';
    case 'wrong-way':
      return p.booth === 'snacks' && p.mode === 'compare'
        ? `Oops, Munch wanted ${p.ask === 'more' ? 'MORE' : 'FEWER'}. Count both plates again.`
        : `Check the word: ${p.booth === 'snacks' && (p.delta ?? 0) > 0 ? 'MORE means a bigger number' : 'LESS means a smaller number'}.`;
    case 'same-number':
      return 'That is the number we started with. Now change it!';
    case 'one-for-ten':
      return 'You changed the ones. 10 more or 10 less changes the TENS digit.';
    case 'ten-for-one':
      return 'That changed it by 10. We only need 1 more or 1 less.';
    case 'bigger-looks-more':
      return p.booth === 'snacks' && p.mode === 'compare' && p.ask === 'fewer'
        ? 'Small cookies take up less room, but count them! Big or small, each cookie counts as 1.'
        : 'Those cookies are big, but count them! Bigger cookies are not more cookies.';
    case 'counted-strips':
      return 'You counted the strips. Each strip has 10 tickets! Count by tens: 10, 20, 30.';
    case 'reversed':
      return 'The digits got swapped. Tens come first: the strips tell the first digit.';
    case 'added-digits':
      return 'Each strip is 10 tickets, not 1. Count the strips by tens first.';
    case 'tens-off':
      return 'Off by one strip of 10. Count the strips again: 10, 20, 30...';
    default:
      return 'Not quite. Let us look again together.';
  }
}

/** The hint ladder: a nudge, a model (the booth shows a helper), then the answer outlined. */
export function hintText(p: Problem, rung: number): string {
  switch (p.booth) {
    case 'ducks':
      return rung === 1
        ? 'Touch each duck once. Say the numbers out loud.'
        : rung === 2
          ? p.layout === 'ten-and-more'
            ? 'The top row is 10. Count on from 10 for the ducks below.'
            : 'The ducks you have not counted yet are sparkling.'
          : `Rosa counted them all. There are ${p.count} ducks.`;
    case 'rings':
      if (p.mode === 'make-ten')
        return rung === 1 ? 'Count the EMPTY pegs. Those need rings.' : rung === 2 ? 'The empty pegs now have numbers.' : `${p.count} and ${p.answer} make 10.`;
      return rung === 1 ? 'A full row is 5. Start at 5 if the top row is full.' : rung === 2 ? 'Each ring now shows its number.' : `There are ${p.answer} rings.`;
    case 'snacks':
      if (p.mode === 'compare')
        return rung === 1 ? 'Count the cookies on each plate. Size does not matter.' : rung === 2 ? 'Each plate now shows how many cookies.' : 'The right plate is outlined.';
      if (p.mode === 'one-more')
        return rung === 1
          ? (p.delta ?? 0) > 0
            ? '1 more is the next number when you count.'
            : '1 less is the number just before.'
          : rung === 2
            ? 'Look at the counting line. Find the number, then step once.'
            : `${p.base} ${(p.delta ?? 0) > 0 ? '+ 1' : '− 1'} is ${p.answer}.`;
      return rung === 1 ? '10 more or 10 less: only the tens digit changes.' : rung === 2 ? 'Look at the tens strip: add or take away one strip.' : `${p.base} ${(p.delta ?? 0) > 0 ? '+ 10' : '− 10'} is ${p.answer}.`;
    case 'tickets':
      if (p.mode === 'build')
        return rung === 1
          ? `${p.answer} is ${p.tens} tens and ${p.ones} ones.`
          : rung === 2
            ? `Put out ${p.tens} strips, then ${p.ones} single tickets.`
            : `Put out ${p.tens} strips of 10 and ${p.ones} singles. That makes ${p.answer}.`;
      return rung === 1 ? 'Count the strips by tens: 10, 20, 30.' : rung === 2 ? 'Each strip now shows its count.' : `There are ${p.answer} tickets.`;
  }
}

// ------------------------------------------------------------------ grown-ups

export const GROWNUPS: GrownupsContent = {
  game: 'Counting Carnival',
  grades: 'K–2',
  summary:
    'Your child walks around a carnival and plays four counting booths. Every booth starts at kindergarten level and gets harder only when your child is ready. Read-aloud is on, so children who cannot read yet can play on their own.',
  teaches: [
    { title: 'Duck Pond', text: 'Count objects one by one, touching each once (one-to-one counting), and know that the last number said tells how many (cardinality). Up to 20 ducks, with a full row of ten to count on from.' },
    { title: 'Ring Toss', text: 'See small amounts at a glance on a ten-frame (subitizing), use "a full row is 5", and find how many more make 10.' },
    { title: "Munch's Snack Stand", text: 'Compare groups (more and fewer) even when the objects look different, find 1 more and 1 less within 20, then 10 more and 10 less within 100.' },
    { title: 'Prize Counter', text: 'Count tickets in strips of ten and single ones, read and build two-digit numbers up to 120.' },
  ],
  standards: [
    { code: 'K.CC.4, K.CC.5', text: 'Connect counting to how many; count up to 20 objects.' },
    { code: 'K.CC.6, K.CC.7', text: 'Compare groups and numbers: greater than, less than, equal.' },
    { code: 'K.OA.3, K.OA.4', text: 'Break numbers apart; find the number that makes 10.' },
    { code: '1.NBT.1, 1.NBT.2', text: 'Count to 120; understand tens and ones.' },
    { code: '1.NBT.3, 1.NBT.5', text: 'Compare two-digit numbers; find 10 more or 10 less.' },
  ],
  talk: [
    'At snack time, ask "Who has more?" with different-sized crackers. Watch for "the big ones are more".',
    'Ask "How many?" after your child counts. If they count again, gently ask what the last number was.',
    'Make a ten-frame with an egg carton cut to 10 cups. Show some cups filled for a second: how many?',
    'Bundle straws or sticks in tens with rubber bands. Count the bundles by tens, then the loose ones.',
  ],
  help: [
    'Let your child touch the screen or point at each object while counting out loud.',
    'Hints are part of learning. After two misses the game makes things easier and offers help.',
    'One booth at a time (about 5 to 10 minutes) is plenty for young children.',
    'Read-aloud uses a voice on this device. You can turn it off in Settings.',
  ],
  simplifies: ['Numbers stay at or below 120.', 'Comparisons use whole numbers only, with no symbols (the words "more" and "fewer").'],
  credits: [
    'Made for Learning Adventures. Art, music and sounds are original and made in code.',
    'Built with Three.js (MIT license) and the Atkinson Hyperlegible (Braille Institute) and Pixelify Sans fonts (SIL Open Font License).',
  ],
};
