import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question } from '../../kit/ui/talk';
import { squareName, type Misconception, type Model, type Op, type Square, type TreasureClue, type WordProblem, type Zone } from './problems';

/**
 * Everything Math Adventure Island says: Captain Zuri, the four islanders,
 * Pip the parrot, the opening and finale, one sentence for each kind of
 * mistake, the hints and the grown-ups page. Sentences stay short because
 * read-aloud is on and many players are still building reading speed.
 */

export const STARS_PER_ZONE = 5;
export const PIECES = 4;

export const ZURI = { name: 'Captain Zuri', role: 'Captain of the island' };
export const PIP = { name: 'Pip', role: 'A parrot who loves treasure (and showing off)' };

export interface ZoneInfo {
  id: Zone;
  /** The place on the island. */
  name: string;
  skill: string;
  person: { name: string; role: string };
  intro: string[];
  debrief: Question;
  done: string;
}

export const ZONE_INFO: Record<Zone, ZoneInfo> = {
  add: {
    id: 'add',
    name: 'Shell Hut',
    skill: 'Adding',
    person: { name: 'Mo', role: 'Collects shells at the Shell Hut' },
    intro: [
      'Hey, explorer! I count every shell that washes up on this beach.',
      'My shell puzzles are tricky. First work out what the question is asking. Then pick the operation. Then solve it!',
    ],
    debrief: {
      text: 'Mo had some shells. He found 20 more. Now he has 50. How many shells did he have at first?',
      options: [
        { text: '30', correct: true, feedback: 'Yes! The whole is 50 and one part is 20. 50 − 20 = 30.' },
        { text: '70', feedback: 'He found MORE, but we already know the total. The missing part is 50 − 20.', misconception: 'keyword-trap' },
        { text: '20', feedback: '20 is how many he found. The question asks how many he had at first.', misconception: 'wrong-question' },
      ],
      hints: ['What do we know: the parts or the whole?', 'The whole is 50. One part is 20. Take the part away from the whole.', 'The answer is outlined: 30.'],
    },
    done: 'Every shell counted! You can add, and you know when NOT to add, too.',
  },
  sub: {
    id: 'sub',
    name: 'Fishing Boat',
    skill: 'Subtracting',
    person: { name: 'Ana', role: 'Fishes from the dock' },
    intro: [
      'Ahoy! I take my boat out every morning and sell fish at the market.',
      'Help me keep track. Some questions ask how many are left. Some ask how many MORE. Read them carefully!',
    ],
    debrief: {
      text: 'Ana caught 45 fish. Leo caught 30. How many more fish did Ana catch than Leo?',
      options: [
        { text: '15', correct: true, feedback: 'Yes! Comparing means finding the difference: 45 − 30 = 15.' },
        { text: '75', feedback: '"How many more" compares two amounts. 75 is how many they caught together.', misconception: 'keyword-trap' },
        { text: '30', feedback: '30 is how many Leo caught. The question asks for the difference.', misconception: 'wrong-question' },
      ],
      hints: ['Is the question about putting them together, or comparing them?', 'Line up the two bars. The extra piece on Ana\'s bar is the difference.', 'The answer is outlined: 15.'],
    },
    done: 'My boat is ready to sail! You are a subtraction star.',
  },
  mul: {
    id: 'mul',
    name: 'Coconut Grove',
    skill: 'Multiplying',
    person: { name: 'Tavi', role: 'Grows the coconut grove' },
    intro: [
      'Kia ora! My palm trees grow in neat rows, and each one has the same number of coconuts.',
      'When groups are all the same size, you can multiply instead of counting one by one. Let me show you!',
    ],
    debrief: {
      text: 'There are 4 trees with 5 coconuts on each tree. How many coconuts are there?',
      options: [
        { text: '20', correct: true, feedback: 'Yes! 4 groups of 5: 5, 10, 15, 20. 4 × 5 = 20.' },
        { text: '9', feedback: '4 + 5 counts the trees and one tree\'s coconuts. There are 4 groups of 5.', misconception: 'added-instead' },
        { text: '25', feedback: 'That is 5 groups of 5. There are only 4 trees.', misconception: 'fact-slip' },
      ],
      hints: ['How many groups? How many in each group?', 'Count by fives, one count for each tree: 5, 10, ...', 'The answer is outlined: 20.'],
    },
    done: 'The grove is ready for harvest! You can see equal groups everywhere now.',
  },
  div: {
    id: 'div',
    name: 'Mango Stall',
    skill: 'Dividing',
    person: { name: 'Bao', role: 'Sells mangoes at the stall' },
    intro: [
      'Hello, hello! My mangoes must be shared fairly, the same number in every basket.',
      'Sharing into equal groups is dividing. And watch out for leftovers. Sometimes they matter!',
    ],
    debrief: {
      text: '14 kids want a boat ride. Each boat holds 4 kids. How many boats do we need so everyone rides?',
      options: [
        { text: '4', correct: true, feedback: 'Yes! 14 ÷ 4 is 3 with 2 left over. Those 2 kids need a boat too, so 4 boats.' },
        { text: '3', feedback: '3 boats carry 12 kids. The 2 left over would miss the ride!', misconception: 'remainder-ignored' },
        { text: '2', feedback: '2 is how many kids are left over. The question asks how many boats.', misconception: 'remainder-as-answer' },
      ],
      hints: ['How many full boats of 4 can you make from 14?', '3 boats hold 12. How many kids are still waiting?', 'The answer is outlined: 4.'],
    },
    done: 'Fair shares for everyone! You can divide, and you know what to do with leftovers.',
  },
};

export const OPENING = [
  `Welcome to the island, explorer! I am ${ZURI.name}.`,
  'Tonight is the Island Quiz Show! But a storm blew out the four torches on the stage.',
  'Each torch belongs to a part of the island: the Shell Hut, the Fishing Boat, the Coconut Grove and the Mango Stall.',
  'Help the islanders with their math, and they will light their torch. Look for people with a sign over their heads.',
  'Oh, and that noisy parrot is Pip. Pip knows where treasure is buried on the beach!',
];

export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk, or to dig. Press J to see your jobs.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to walk, or use the pad. Tap a person to talk. On the beach grid, tap Dig.';

export const STAGE_LOCKED = (lit: number) => `The Quiz Show stage is dark. ${4 - lit} more torch${4 - lit === 1 ? '' : 'es'} to light!`;

export const QUIZ_INTRO = [
  'Welcome to the Island Quiz Show! Tonight\'s contestants: you, and Pip the parrot!',
  'Pick a question from the board. Get it right and the points are yours. Get it wrong and Pip steals them!',
  'Some questions have a Strategy Bonus: show another way to solve it for 50 extra points. Beat Pip to win the trophy!',
];

export const FINALE = [
  'What a show! The torches are blazing and the whole island is cheering.',
  'You solved word problems, estimated, checked answers and beat Pip at the Quiz Show. You are a true math explorer!',
  'Come back to the stage any time for a rematch. Pip wants one already.',
];

export const TREASURE_INTRO = [
  'Squawk! Treasure! A pirate buried a map in four pieces under the beach grid!',
  'Each clue is a math problem. Estimate first, then work it out. Then check MY answer. I like to show off, but sometimes I am way off!',
  'Solve a clue and I will tell you which square to dig. Squawk!',
];

export const TREASURE_DONE = [
  'Squawk! All four pieces! The map shows a chest, right here by my perch!',
  'GOLD! The pirate\'s golden coconut! You are the best treasure hunter on the island.',
];

// ------------------------------------------------------------ the three steps

export const STEP_TITLES = ['What is the question asking?', 'Which operation solves it?', 'Now solve it!'] as const;

export const OP_NAMES: Record<Op, string> = { '+': 'Add', '−': 'Subtract', '×': 'Multiply', '÷': 'Divide' };

/** Why an operation fits a problem, from its picture. */
export function opReason(p: WordProblem): string {
  const m = p.model;
  if (m.kind === 'join') return m.total === null ? 'We know both parts and want the whole: add them.' : 'We know the whole and one part. To find the missing part, subtract.';
  if (m.kind === 'compare') return 'We are comparing two amounts. The difference is found by subtracting.';
  if (m.kind === 'groups') return `These are ${m.groups} equal groups of ${m.each}. Equal groups: multiply.`;
  if (m.kind === 'array') return `Rows that are all the same length make an array: multiply ${m.rows} × ${m.cols}.`;
  return m.askGroups ? `How many groups of ${m.size} fit in ${m.total}? That is dividing.` : `Sharing ${m.total} equally into ${m.size} groups is dividing.`;
}

/** One sentence about the likely mistake behind a wrong pick. */
export function mistakeLine(p: WordProblem | null, m: Misconception, extra?: { estimate?: number; square?: Square; ordered?: boolean; dug?: Square }): string {
  switch (m) {
    case 'wrong-question':
      return 'That is something the story tells you, or a different question. Read the last sentence again: what does it ask you to find?';
    case 'keyword-trap':
      if (p?.model.kind === 'compare') return 'Careful! "How many more" does not mean add. It compares two amounts, so find the difference.';
      if (p?.model.kind === 'groups') return '"Times as many" means equal groups, not adding on. Multiply!';
      return 'Careful! The story says MORE, but we already know the whole. To find a missing part, take away.';
    case 'wrong-op':
      return p ? `Think about the story. ${opReason(p)}` : 'Check the operation again.';
    case 'no-regroup':
      return 'When the ones add up to 10 or more, carry a ten over to the tens.';
    case 'smaller-from-bigger':
      return 'In each column, take the bottom digit away from the top one. If the top digit is smaller, trade a ten first.';
    case 'off-one':
      return 'So close! Check the ones again.';
    case 'off-ten':
      return 'Nearly! Check the tens again.';
    case 'added-instead':
      return p?.model.kind === 'share' ? 'Adding does not share things out. How many equal groups can you make?' : 'Adding the two numbers does not count equal groups. Multiply the number of groups by the number in each group.';
    case 'fact-slip':
      if (p?.model.kind === 'groups') return `One group too many or too few. Skip count by ${p.model.each}s, ${p.model.groups} times.`;
      if (p?.model.kind === 'array') return `One row off. Count by ${p.model.cols}s, ${p.model.rows} times.`;
      return 'Just one group off. Check your times table fact again.';
    case 'place-value':
      return 'Do not write the two parts side by side. Add them together: the tens part plus the ones part.';
    case 'remainder-ignored':
      return 'The leftover kids need a ride too! They need one more boat.';
    case 'remainder-kept':
      return 'The leftover mangoes cannot fill a whole bag, so that bag does not count as full.';
    case 'remainder-as-answer':
      return 'That is how many are left over. The question asks how many groups.';
    case 'round-wrong':
      return 'Round each number first. Look at the digit after the place you round to: 5 or more rounds up, 4 or less rounds down.';
    case 'not-rounded':
      return 'That is the exact answer! An estimate uses rounded numbers, so it is quick and ends in zeros.';
    case 'said-reasonable':
      return `Look again: that answer is very far from your estimate of ${extra?.estimate}. It cannot be right!`;
    case 'said-unreasonable':
      return `That answer is close to your estimate of ${extra?.estimate}, so it is reasonable.`;
    case 'swapped-xy':
      return extra?.ordered ? 'You went up first. In (across, up), go across first, then up.' : 'You swapped them. The letter is the column (across the bottom). The number is the row (up the side).';
    case 'wrong-square':
      return extra?.square ? `That is not ${squareName(extra.square, !!extra.ordered)}. ${extra.ordered ? 'Find the first number along the bottom, then go up to the second number.' : 'Find the letter along the bottom, then go up to the number.'}` : 'Wrong square. Try again!';
    case 'wrong-strategy':
      return 'That way gives a different answer.';
    default:
      return 'Not quite. Try again!';
  }
}

/** The hint for a step of a word problem (rung 2 also shows the picture). */
export function wordHint(p: WordProblem, step: number, rung: number): string {
  if (rung >= 3) return 'The answer is outlined.';
  if (step === 0) return rung === 1 ? 'The question is the last sentence, the one with the question mark. What does it want you to find?' : 'Look at the picture: the question mark shows the number we are looking for.';
  if (step === 1) {
    if (rung === 1) return 'Are we putting parts together, finding a missing part, comparing, making equal groups, or sharing?';
    return opReason(p);
  }
  if (rung === 1) return 'Use the picture to help. You can also count up, or use a fact you know.';
  return modelHelp(p.model);
}

/** A worked nudge from the picture that still leaves the last step to the player. */
function modelHelp(m: Model): string {
  if (m.kind === 'join') {
    if (m.total === null) return `Add the tens, then the ones: ${m.parts[0]} + ${m.parts[1]}.`;
    const part = m.parts[0] ?? m.parts[1];
    return `Count up from ${part} to ${m.total}. How far is it?`;
  }
  if (m.kind === 'compare') return `Count up from ${m.small} to ${m.big}. How far is it?`;
  if (m.kind === 'groups') return m.each >= 10 && m.each % 10 !== 0 ? `Split ${m.each} into tens and ones, multiply each part by ${m.groups}, then add.` : `Skip count by ${m.each}s, ${m.groups} times.`;
  if (m.kind === 'array') return `Count by ${m.cols}s, once for each of the ${m.rows} rows.`;
  return m.askGroups ? `Count by ${m.size}s until you reach ${m.total}. How many counts?` : `Think: ${m.size} × ? = ${m.total}.`;
}

export function clueHint(c: TreasureClue, step: number, rung: number): string {
  if (rung >= 3) return 'The answer is outlined.';
  if (step === 0) return rung === 1 ? `Round each number to the nearest ${c.tier === 2 ? 'hundred' : 'ten'}, then work it out.` : c.estimateHow.replace(/= \d+\.$/, '= ?');
  if (step === 1) return rung === 1 ? 'Line up the numbers by place value and work column by column. Your estimate tells you about where the answer should be.' : `Your answer should be close to your estimate of ${c.estimate}.`;
  if (step === 2) return rung === 1 ? 'Is Pip\'s answer close to your estimate?' : `Your estimate was ${c.estimate}. Pip said ${c.pipAnswer}. Are they close?`;
  return c.ordered ? `Go across the bottom to ${c.square.col + 1}, then up to ${c.square.row + 1}.` : `Find ${squareName(c.square, false)[0]} along the bottom, then go up to ${c.square.row + 1}.`;
}

const PRAISE = ['Brilliant!', 'Island genius!', 'You got it!', 'Spot on, explorer!', 'Super solving!', 'Great work!'];
export const praise = (i: number) => PRAISE[i % PRAISE.length];

export const PIP_TAUNTS = ['Squawk! My points!', 'Pip steals it! Squawk!', 'Ha! Pip is a genius!', 'Polly wants those points!'];
export const PIP_GROANS = ['Squawk... nice one.', 'Ruffled feathers!', 'Pip did not see that coming!', 'Hmph. Lucky guess!'];

export const GROWNUPS: GrownupsContent = {
  game: 'Math Adventure Island',
  grades: '2–5',
  summary:
    'Your child explores an island, helping four islanders with word problems: one place for each operation. Each place lights a torch on the Quiz Show stage. On the beach, Pip the parrot sets treasure clues that practise estimating and checking whether an answer makes sense. When all four torches are lit, a game-show round against Pip mixes everything together.',
  teaches: [
    { title: 'Three steps for every word problem', text: 'First pick what the question is asking, then pick the operation, then solve. Splitting it up shows exactly where a child gets stuck: reading the question, choosing the operation, or the calculation.' },
    { title: 'Not falling for key words', text: 'Some stories say "more" but need subtraction (he found some more and now has 50: how many did he find?). These are the problems children most often get wrong by grabbing a key word, so they are on purpose.' },
    { title: 'Pictures that explain', text: 'Hints show a bar model for adding and subtracting, equal groups or an array for multiplying, and sharing boxes for dividing.' },
    { title: 'Leftovers in division', text: 'At the top level, division has remainders that matter: boats round up so everyone rides, while full bags drop the leftovers.' },
    { title: 'Estimate, calculate, check', text: 'Treasure clues ask for a rounded estimate first, then the exact answer, then whether Pip\'s answer is reasonable. Then the child finds a grid square (B3, or (2, 3) at the top level) and digs.' },
    { title: 'Quiz Show with strategy bonus', text: 'A board of questions in four categories. A wrong answer gives Pip the points. Bonus questions ask for another way to solve the same problem (compensation, splitting tens and ones, the related multiplication fact).' },
  ],
  standards: [
    { code: '2.OA.1', text: 'Use addition and subtraction within 100 to solve one- and two-step word problems, including unknowns in all positions.' },
    { code: '3.OA.3', text: 'Use multiplication and division within 100 to solve word problems with equal groups, arrays and measurement.' },
    { code: '3.OA.8', text: 'Solve two-step word problems and assess the reasonableness of answers using estimation and rounding.' },
    { code: '3.NBT.1', text: 'Use place value understanding to round whole numbers to the nearest 10 or 100.' },
    { code: '4.OA.3', text: 'Solve word problems with remainders that must be interpreted.' },
    { code: '5.G.1', text: 'Use a coordinate grid to locate points (the (across, up) clues).' },
  ],
  talk: [
    'When you meet a word problem together, ask "What is the question asking?" before anyone calculates.',
    'Ask for an estimate first: "About how much will the shopping cost?" Then check the real total against it.',
    'Try a leftover puzzle: 10 people, 4 seats per car. How many cars? (3, not 2.5.)',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Nothing is timed. Each question can take as long as your child needs, and every question can be read aloud.',
    'Three hints for every step: a tip, then a picture, then the answer.',
  ],
  simplifies: ['Numbers stay within 1,000. Multiplication stays within 2-digit by 1-digit.', 'Each word problem uses one operation.'],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
