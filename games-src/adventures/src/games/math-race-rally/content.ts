import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Misconception, Problem } from './problems';

/** All the words in Math Race Rally, kept here so they can be reviewed on their own. */

export const KOFI = { name: 'Crew Chief Kofi', role: 'Runs the pit crew' };
export const RIVAL_NAME = 'Dash';
export const QUESTIONS_PER_RACE = 10;
export const MEMORY_PAIRS = 6;
export const WIN_BOLTS = 3;

export const INTRO = [
  `Welcome to the track, rookie! I am ${KOFI.name}, and this little go-kart is yours.`,
  'Your car never stops. A math question pops up, and three answer gates come racing toward you, one in each lane.',
  'Steer through the gate with the right answer to get a speed boost. The wrong gate slows you down.',
  `That is ${RIVAL_NAME} in the black car. Get the math right and you will leave ${RIVAL_NAME} in the dust!`,
  'After every race we stop at the pit. Match the facts to win bolts, and spend them on paint, styles, wheels and new cars.',
];

export const CONTROLS_KEYS = 'Steer with the left and right arrow keys (or A and D). Or press 1, 2 or 3 to drive to that lane. Esc pauses.';
export const CONTROLS_TOUCH = 'Hold the arrow buttons to steer, or tap an answer at the top to drive to its lane.';

export const TIER_NAME: Record<number, string> = { 1: 'Facts to 10', 2: 'Facts to 20', 3: 'Tens and ones', 4: 'Carry and trade', 5: 'Big numbers' };
export const TIER_UP: Record<number, string> = {
  2: 'Level up! Facts to 20: try making a ten.',
  3: 'Level up! Two-digit numbers and tens.',
  4: 'Level up! Now you will carry and trade tens.',
  5: 'Level up! Three-digit numbers. You are a pro racer!',
};

/** A short line after a wrong gate (there is no time for a long one in a race). */
export function mistakeLine(m: Misconception | undefined, p: Problem): string {
  switch (m) {
    case 'off-one':
      return `Off by one! ${p.text} = ${p.answer}.`;
    case 'wrong-op':
      return `Check the sign: it says ${p.op === '+' ? 'plus' : 'minus'}. ${p.text} = ${p.answer}.`;
    case 'no-regroup':
      return `Don't forget to carry the ten! ${p.text} = ${p.answer}.`;
    case 'smaller-from-bigger':
      return `Trade a ten when the top digit is smaller. ${p.text} = ${p.answer}.`;
    case 'tens-ones':
      return `Ones go with the ones. ${p.text} = ${p.answer}.`;
    case 'off-ten':
      return `Off by ten: check the tens. ${p.text} = ${p.answer}.`;
    case 'off-hundred':
      return `Check the hundreds. ${p.text} = ${p.answer}.`;
    default:
      return `${p.text} = ${p.answer}.`;
  }
}

/** The strategy with its answer hidden (shown after two misses in a row). */
export function hintFor(p: Problem): string {
  const ans = String(p.answer);
  const i = p.strategy.lastIndexOf(ans);
  return i < 0 ? p.strategy : `${p.strategy.slice(0, i)}?${p.strategy.slice(i + ans.length)}`;
}

export const BOOST_WORDS = ['Boost!', 'Zoom!', 'Turbo!', 'Nice!', 'Vroom!', 'Speedy!'];

export function resultLine(place: number, correct: number): string {
  if (place === 1) return correct === QUESTIONS_PER_RACE ? `Perfect race! Every answer right, and you beat ${RIVAL_NAME}!` : `You beat ${RIVAL_NAME}! Great driving and great math.`;
  return correct >= 7 ? `So close! ${RIVAL_NAME} just made it first. A couple more right answers and you win.` : `${RIVAL_NAME} won this one. Every right answer is a boost, so you will catch up!`;
}

export const GROWNUPS: GrownupsContent = {
  game: 'Math Race Rally',
  grades: '1–5',
  summary:
    'An arcade racer: your child steers a car that never stops, through the answer gate for each addition or subtraction question. Right answers speed the car up and wrong answers slow it down, in a race against a computer car. After every race, a memory match pit stop (matching facts to answers) earns bolts for cosmetic car upgrades.',
  teaches: [
    { title: 'Level 1: Facts to 10', text: 'Adding and subtracting within 10, counting on from the bigger number.' },
    { title: 'Level 2: Facts to 20', text: 'Making a ten (8 + 7 = 8 + 2 + 5), doubles and near doubles, and taking back to ten for subtraction.' },
    { title: 'Level 3: Tens and ones', text: 'Two-digit and one-digit numbers without regrouping, and adding or taking away tens.' },
    { title: 'Level 4: Carry and trade', text: 'Two-digit addition and subtraction with regrouping.' },
    { title: 'Level 5: Big numbers', text: 'Three-digit addition and subtraction, and using a nearby hundred (398 + 145 = 400 + 145 − 2).' },
    { title: 'Mistakes get a reason', text: 'Wrong gates are built from real mistakes: off by one, forgetting to carry, taking the smaller digit from the bigger (52 − 27 = 35), adding the ones to the tens, or using the wrong sign. After two misses in a row the next question shows a strategy hint, and every missed question is reviewed with its strategy after the race.' },
  ],
  standards: [
    { code: '1.OA.6', text: 'Add and subtract within 20, using strategies such as making ten.' },
    { code: '2.OA.2', text: 'Fluently add and subtract within 20 using mental strategies.' },
    { code: '2.NBT.5', text: 'Fluently add and subtract within 100.' },
    { code: '2.NBT.7', text: 'Add and subtract within 1000.' },
    { code: '3.NBT.2', text: 'Fluently add and subtract within 1000 using strategies and algorithms.' },
  ],
  talk: [
    'Ask how they worked out 8 + 7. Did they make a ten?',
    'For 52 − 27, ask why you cannot just take 2 from 7.',
    'Play a few rounds of the pit stop together and say each fact out loud.',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Steering is optional: pressing 1, 2 or 3 (or tapping an answer) drives the car to that lane.',
    'Gates are spaced so there is several seconds of thinking time even at top speed. Garage upgrades change only how the car looks, never its speed.',
  ],
  simplifies: ['Speed comes only from right answers, not from driving skill.'],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
