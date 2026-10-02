import type { Question } from '../../kit/ui/talk';
import type { GrownupsContent } from '../../kit/ui/grownups';
import type { BeltId, Misconception, Problem } from './problems';

/**
 * Everything the game says: the belts and their places, Sensei Rio's lines,
 * the hint ladder for each kind of challenge, the explanation for each
 * mistake, the end-of-belt "talk it through" questions, and the page for
 * grown-ups. Kept apart from the game code so it can be reviewed on its own.
 */

export interface BeltInfo {
  id: BeltId;
  name: string;
  color: string;
  /** Text color that is readable on `color`. */
  ink: string;
  skill: string;
  place: string;
  intro: string[];
  /** The "talk it through" question after the belt. */
  debrief: Question;
  earned: string;
}

export const STARS_PER_BELT = 5;

export const BELT_INFO: Record<BeltId, BeltInfo> = {
  white: {
    id: 'white',
    name: 'White Belt',
    color: '#f4f1e8',
    ink: '#2f2320',
    skill: 'Find numbers on the line',
    place: 'Blossom Pond',
    intro: [
      'Welcome to Blossom Pond! These stepping stones make a number line. Every stone is one more than the stone before it.',
      'Some stones hide their numbers. Use the numbers you CAN see as landmarks, and count from the closest one.',
    ],
    debrief: {
      text: 'Kai wants stone 14, but the only numbers showing are 10 and 15. Where is 14?',
      options: [
        { text: 'One stone before 15', correct: true, feedback: 'Yes! 14 is one less than 15, so it sits right before it. Counting from the closest landmark is the fastest way.' },
        { text: 'Four stones after 15', feedback: 'Hmm. 14 is smaller than 15, so it comes before 15, not after.', misconception: 'direction' },
        { text: 'Right next to 10', feedback: 'Next to 10 is 11. 14 is four stones past 10.', misconception: 'landmark' },
      ],
      hints: ['Is 14 a little more or a little less than 15?', '14 comes just before 15 when you count: 13, 14, 15.', 'The answer is outlined: one stone before 15.'],
    },
    earned: 'You can find any number on the line by counting from a landmark. That is a real ninja skill!',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow Belt',
    color: '#f2c94c',
    ink: '#2f2320',
    skill: 'Add by hopping forward',
    place: 'Bamboo Creek',
    intro: [
      'Bamboo Creek! Here we add by hopping forward. Adding makes the number bigger, so we hop to the right.',
      'Count your HOPS, not the stones. The stone you start on is not a hop. Watch the arcs: one arc, one hop.',
    ],
    debrief: {
      text: 'Jo stands on 8 and hops forward 3. Jo counts "8, 9, 10" and says the answer is 10. What happened?',
      options: [
        { text: 'Jo counted the stone they started on', correct: true, feedback: 'Exactly. The first hop goes from 8 to 9. Three hops: 9, 10, 11. So 8 + 3 = 11.' },
        { text: 'Jo hopped the wrong way', feedback: 'Jo did go forward. Something else happened with the counting.', misconception: 'wrong-way' },
        { text: 'Nothing, 10 is right', feedback: 'Let us check: 8 + 3 is 11, not 10.', misconception: 'counted-start' },
      ],
      hints: ['Where does the very first hop land, if you start on 8?', 'The first hop lands on 9, not 8. Count the landings: 9, 10, 11.', 'The answer is outlined: Jo counted the stone they started on.'],
    },
    earned: 'You add by counting on, and you count hops, not stones. Brilliant hopping!',
  },
  orange: {
    id: 'orange',
    name: 'Orange Belt',
    color: '#e0823a',
    ink: '#2f2320',
    skill: 'Subtract by hopping back',
    place: 'Maple Falls',
    intro: [
      'Maple Falls. Taking away makes a number smaller, so we hop back, to the left.',
      'Crossing 10 is tricky. Try hopping back to 10 first, then hop the rest.',
    ],
    debrief: {
      text: 'To solve 15 − 6, which way should the ninja hop, and why?',
      options: [
        { text: 'Back, because taking away makes the number smaller', correct: true, feedback: 'Right! Back 6 hops from 15: 15 − 5 is 10, and one more back is 9.' },
        { text: 'Forward, because 6 is a number you add', feedback: 'The sign is a minus, so we are taking 6 away.', misconception: 'wrong-way' },
        { text: 'It does not matter which way', feedback: 'Forward 6 lands on 21. Back 6 lands on 9. The way matters!', misconception: 'wrong-way' },
      ],
      hints: ['Does taking away give you more or less?', 'Less means smaller numbers. Smaller numbers are to the left.', 'The answer is outlined: back, because the number gets smaller.'],
    },
    earned: 'You subtract by counting back, even across 10. Sensei is proud!',
  },
  green: {
    id: 'green',
    name: 'Green Belt',
    color: '#4f9a4a',
    ink: '#ffffff',
    skill: 'Big hops of ten',
    place: 'Long River',
    intro: [
      'The Long River runs all the way to 100. Hopping by ones would take forever, so ninjas use big hops of ten.',
      'In 25, the 2 means two tens and the 5 means five ones. So: two big hops, then five small hops.',
    ],
    debrief: {
      text: 'Sam is on 34 and needs to add 20. Sam hops 1, then 1, and lands on 36. What should Sam do?',
      options: [
        { text: 'Hop 10 two times, because 20 is two tens', correct: true, feedback: 'Yes! 34, 44, 54. The 2 in 20 means two tens, not two ones.' },
        { text: 'Keep going: 36 is right', feedback: '36 is only 2 more than 34. Adding 20 should get much further.', misconception: 'tens-as-ones' },
        { text: 'Hop 2 more ones', feedback: 'That would only add 4 in total. The 2 in 20 stands for tens.', misconception: 'tens-as-ones' },
      ],
      hints: ['How many tens are in 20?', '20 is two tens. A big hop is one ten.', 'The answer is outlined: two hops of 10.'],
    },
    earned: 'Tens and ones are your friends now. Big hops first, then small hops!',
  },
  black: {
    id: 'black',
    name: 'Black Belt',
    color: '#2b2b33',
    ink: '#ffffff',
    skill: 'Find the mystery gap',
    place: 'Lantern River',
    intro: [
      'Lantern River at night. The final test! The flag shows where to land, but nobody tells you how far it is.',
      'Hop from your stone to the flag. Then add up your hops: that is how far it was.',
    ],
    debrief: {
      text: 'Lee hops from 27 to 45: one hop of 10, then 8 hops of 1. How far did Lee go?',
      options: [
        { text: '18', correct: true, feedback: 'Yes! 10 + 8 = 18. So 27 + 18 = 45. You found the missing number.' },
        { text: '72', feedback: '72 is 27 + 45, adding the two stones together. We want the space between them.', misconception: 'added-numbers' },
        { text: '9', feedback: '9 is how many hops Lee made. Each big hop was worth 10, so add up the hop sizes.', misconception: 'counted-hops' },
      ],
      hints: ['Add up the sizes of Lee’s hops.', 'One hop of 10, and 8 hops of 1. What is 10 + 8?', 'The answer is outlined: 18.'],
    },
    earned: 'You can find the gap between any two numbers. You are a Black Belt Number Line Ninja!',
  },
};

// ------------------------------------------------------------------ sensei lines

export const OPENING = [
  'Welcome to the dojo by the water. I am Sensei Rio.',
  'Ninjas here do not fight. They hop! Each stepping stone is a number, and every hop is a little bit of math.',
  'Earn five stars to earn each belt. Ask for a hint any time: hints are part of training, never a punishment.',
];

export const CONTROLS_TIP = 'Hop with the arrow keys or the buttons. Tap a stone to hop there. When you are on the right stone, press Land (Space).';

const CLEAN = ['Clean landing!', 'Perfect hop!', 'Ninja focus!', 'Right on the stone!', 'Smooth!'];
export function cleanPraise(i: number): string {
  return CLEAN[i % CLEAN.length];
}

/** What Sensei says after a wrong landing, by the idea behind it. */
export function mistakeLine(p: Problem, m: Misconception, landed: number): string {
  const back = p.change < 0;
  switch (m) {
    case 'counted-start':
      return `You landed on ${landed}, one stone ${back ? 'too far back' : 'short'}. Did you count the stone you started on? The first hop lands on ${p.start + Math.sign(p.change)}. Count hops, not stones.`;
    case 'wrong-way':
      return back
        ? `You hopped forward. Taking away makes the number smaller, so we hop back, to the left.`
        : `You hopped back. Adding makes the number bigger, so we hop forward, to the right.`;
    case 'tens-as-ones':
      return `Careful! ${Math.abs(p.change)} has ${Math.floor(Math.abs(p.change) / 10)} tens. Each ten is one BIG hop, not a small one.`;
    case 'ten-off':
      return `So close: you are exactly 10 away. Count your big hops again. How many tens are in ${Math.abs(p.change)}?`;
    case 'landmark':
      return `You landed on ${landed}. Check your landmark: which labelled stone is closest to ${p.target}? Count from there.`;
    case 'reversed':
      return `${landed} has the same digits as ${p.target}, swapped. The first digit tells the tens. Which ten is ${p.target} in?`;
    case 'no-hop':
      return `You have not hopped yet! ${p.kind === 'find' ? `Hop along to ${p.target}` : `Hop ${back ? 'back' : 'forward'} ${Math.abs(p.change)}`} first, then land.`;
    case 'one-off':
      return `Just one stone away! You landed on ${landed}. Count again, slowly.`;
    default:
      return `You landed on ${landed}. Let us try again from the start, one hop at a time.`;
  }
}

// ------------------------------------------------------------------ hint ladder

/**
 * Three rungs: a nudge (words only), a model (Sensei draws the first hops as
 * dotted arcs), and a worked example (every hop drawn, and the landing stone
 * glows). Returns the words for each rung.
 */
export function hintText(p: Problem, rung: number): string {
  const size = Math.abs(p.change);
  const fwd = p.change > 0;
  const way = fwd ? 'forward (right)' : 'back (left)';
  if (p.kind === 'find') {
    const step = p.labels === 'tens' ? 10 : 5;
    const bench = Math.round(p.target / step) * step;
    const d = p.target - bench;
    if (rung === 1) return `Find the closest stone with a number. Is ${p.target} a little more or a little less than ${bench}?`;
    if (rung === 2) return `${p.target} is ${Math.abs(d)} ${d > 0 ? 'more' : 'less'} than ${bench}. Go to ${bench}, then hop ${Math.abs(d)} ${d > 0 ? 'forward' : 'back'}.`;
    return `Follow the dotted hops. The glowing stone is ${p.target}.`;
  }
  if (p.kind === 'gap') {
    if (rung === 1) return `Hop to the flag first. ${p.bigHop ? `Big hops of ${p.bigHop} are faster` : 'Count every hop'}. Then add up the hops.`;
    if (rung === 2) return `Try big hops until the next one would go past the flag, then small hops.`;
    return `Follow the dotted hops to the flag, then add them up.`;
  }
  if (p.kind === 'tens') {
    const t = Math.floor(size / 10);
    const o = size % 10;
    if (rung === 1) return `${size} is ${t} ten${t === 1 ? '' : 's'} and ${o} one${o === 1 ? '' : 's'}. Do the big hops first, ${way}.`;
    if (rung === 2) return `Sensei drew your big hops. After them, hop ${o} small hop${o === 1 ? '' : 's'} ${fwd ? 'forward' : 'back'}.`;
    return `Follow the dotted hops: ${p.start} ${fwd ? '+' : '−'} ${size} = ${p.target}. The glowing stone is where you land.`;
  }
  // add / sub within 20
  const crossing = p.tier === 3;
  if (rung === 1)
    return crossing
      ? `Hop to 10 first. How many hops is that? Then hop the rest ${fwd ? 'forward' : 'back'}.`
      : `${fwd ? 'Adding means hopping forward' : 'Taking away means hopping back'}. Hop ${size} times and count each landing.`;
  if (rung === 2) return `Sensei drew the first hops. The first hop from ${p.start} lands on ${p.start + Math.sign(p.change)}. Keep counting from there.`;
  return `Follow the dotted hops: ${p.equation.replace('?', String(p.target))}. The glowing stone is where you land.`;
}

// ------------------------------------------------------------------ grown-ups

export const GROWNUPS: GrownupsContent = {
  game: 'Number Line Ninja',
  grades: '1–3',
  summary:
    'Your child hops a ninja along a number line made of stepping stones. Every hop is drawn as an arc, so the game shows the same picture teachers use in class: a number line with jumps. Five belts build from finding numbers to adding and subtracting with tens, and to finding the "missing" number between two others.',
  teaches: [
    { title: 'White Belt: Find it', text: 'Locate numbers to 20 when only some stones are labelled, by counting from the nearest landmark (5, 10, 15).' },
    { title: 'Yellow Belt: Hop forward', text: 'Add within 20 by counting on. Level 3 crosses 10 ("make a ten": 8 + 5 is 8 + 2 + 3).' },
    { title: 'Orange Belt: Hop back', text: 'Subtract within 20 by counting back, including crossing 10 (13 − 5 is 13 − 3 − 2).' },
    { title: 'Green Belt: Big hops', text: 'Add and subtract within 100 with jumps of ten and one, including crossing a ten (47 + 16).' },
    { title: 'Black Belt: Mystery gap', text: 'Find how far it is from one number to another: the missing number in 27 + ? = 45.' },
  ],
  standards: [
    { code: '1.OA.5, 1.OA.6', text: 'Relate counting to addition and subtraction; add and subtract within 20 using strategies such as making ten.' },
    { code: '1.OA.8', text: 'Find the unknown number in an addition or subtraction equation.' },
    { code: '1.NBT.1', text: 'Count and read numbers to 120.' },
    { code: '2.NBT.5', text: 'Add and subtract within 100 using place value strategies.' },
    { code: '2.MD.6', text: 'Represent whole numbers, sums and differences on a number line.' },
    { code: '2.OA.1', text: 'Solve problems with unknowns in all positions.' },
  ],
  talk: [
    'Ask "How did you know where to land?" Listen for counting hops, using a landmark, or big hops then small hops.',
    'If your child lands one short when adding, they may be counting the stone they start on. Try it with a ruler: put a finger on 8, then count "1, 2, 3" as the finger moves.',
    'After a big-hop problem, ask "What does the 2 in 25 mean?" (two tens).',
    'The black belt question "How far is it from 27 to 45?" is the same as "27 plus what is 45?" Both are good ways to say it.',
  ],
  help: [
    'Let your child press the buttons and explain each hop out loud.',
    'Hints are part of the game. Using one is a smart move, not a failure. The game lowers the difficulty after two misses and raises it after two clean answers.',
    'Short sessions work well: one belt (about 5 to 10 minutes) at a time.',
    'Off screen, draw a number line on paper or with chalk and hop along it together.',
  ],
  simplifies: [
    'The number line shows whole numbers from 0 to 20 or 0 to 100 only (no negative numbers or fractions).',
    'Hops are limited to 1, 5 and 10 so the place-value idea stays clear.',
  ],
  credits: [
    'Made for Learning Adventures. Art, music and sounds are original and made in code.',
    'Built with Three.js (MIT license) and the Atkinson Hyperlegible (Braille Institute) and Pixelify Sans fonts (SIL Open Font License).',
  ],
};
