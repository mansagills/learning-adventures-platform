import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question } from '../../kit/ui/talk';
import { STATION_DECK } from '../../kit/worlds/star-station/deck';
import type { Misconception, Problem, Sector } from './problems';
import type { CrewId } from './world';

/**
 * Everything Multiplication Space Quest says: the crew, the opening, the
 * mission briefings, a sentence for each kind of mistake (with the
 * question's own numbers), the hints, the debriefs, the upgrades and the
 * grown-ups page. Sentences are short because read-aloud is on, and a
 * mistake sentence never gives the answer away.
 */

export const STARS_PER_SECTOR = 5;
/** Questions in one flight (the last one is the Static core). */
export const QUESTIONS_PER_FLIGHT = 8;

export const CREW_INFO: Record<CrewId, { name: string; role: string }> = {
  ayo: { name: 'Commander Ayo', role: 'Runs the Star Station' },
  mei: { name: 'Pilot Mei', role: 'Chief of Formations' },
  rafi: { name: 'Engineer Rafi', role: 'Chief of Engines and upgrades' },
  dot: { name: 'Quartermaster Dot', role: 'Chief of Cargo' },
  sol: { name: 'Navigator Sol', role: 'Keeper of the Star Map' },
};
export const BLIP = { name: 'Blip', role: 'A friendly alien (rides along)' };

export interface SectorInfo {
  id: Sector;
  name: string;
  skill: string;
  chief: CrewId;
  grades: string;
  /** The first briefing (said once). */
  intro: string[];
  /** Said before each later flight. */
  again: string;
  debrief: Question;
  done: string;
}

export const SECTOR_INFO: Record<Sector, SectorInfo> = {
  formations: {
    id: 'formations',
    name: 'Formations',
    skill: 'Equal groups and arrays',
    chief: 'mei',
    grades: 'grade 3',
    intro: [
      'Hi! I fly with the supply ships. In the Static they huddle together in groups and rows, waiting for help.',
      'When they float in, count them the smart way: how many groups, and how many in each group? That is multiplication.',
      'Then beam the rock with the right answer. The ships light up and join your fleet!',
    ],
    again: 'More ships are waiting in the Formations sector. Count them the smart way!',
    debrief: {
      text: 'I turned a formation of 3 rows of 5 on its side. Now it is 5 rows of 3. Is it still 15 ships?',
      options: [
        { text: 'Yes. Same ships, just turned. 5 × 3 = 3 × 5.', correct: true, feedback: 'Yes! Turning a formation does not add or take away a single ship.' },
        { text: 'No. Now it is 5 + 3 = 8 ships.', feedback: 'That adds the numbers. 5 rows of 3 is still 3 + 3 + 3 + 3 + 3.', misconception: 'added' },
        { text: 'No. It has more rows now, so more ships.', feedback: 'More rows, but each row is shorter. The same 15 ships, just turned.', misconception: 'turn-changes' },
      ],
      hints: ['Did any ship fly away when it turned?', 'Count 5 rows of 3: 3, 6, 9, 12, 15.', 'The answer is outlined: yes, it is still 15.'],
    },
    done: 'The Formations sector is clear! Every ship there is safe in your fleet.',
  },
  engines: {
    id: 'engines',
    name: 'Engines',
    skill: 'Fact shortcuts',
    chief: 'rafi',
    grades: 'grades 3–4',
    intro: [
      'Hey there! The ship’s engines charge up with times facts. The faster you know a fact, the faster we fly.',
      'You do not have to count every time. There are shortcuts: times 2 is a double, times 5 is half of times 10, times 9 is ten groups take away one.',
      'I will show you a new shortcut at each level. And come back to my bay to spend your stardust on upgrades!',
    ],
    again: 'The engines want more power. Use your shortcuts!',
    debrief: {
      text: 'Why is 9 × 6 the same as 10 × 6 take away 6?',
      options: [
        { text: '9 groups of 6 is 10 groups of 6 with one group of 6 taken away.', correct: true, feedback: 'Exactly! 60 take away 6 is 54. Ten groups, minus one group.' },
        { text: 'Because 10 take away 1 is 9, so you take away 1.', feedback: 'Taking away 1 gives 59. We need to take away a whole group of 6.', misconception: 'nine-minus-one' },
        { text: 'Because 9 and 6 make 15.', feedback: '9 + 6 adds. 9 × 6 means 9 groups of 6.', misconception: 'added' },
      ],
      hints: ['How many groups of 6 are in 10 × 6? In 9 × 6?', 'Picture 10 rows of 6. Cover one row. What is left?', 'The answer is outlined: one whole group of 6 comes off.'],
    },
    done: 'Engines at full power! You know your shortcuts.',
  },
};

export const OPENING: string[] = [
  'Welcome aboard the Star Station! I am Commander Ayo.',
  'Trouble out there. A cloud of gray space rocks called the Static has drifted across the route to the alien planet.',
  'A fleet of little supply ships is stuck inside it, with no power. They need someone to light them up and lead them home.',
  'That is you! Your ship is waiting on the docking ring.',
  'Each of my chiefs runs one part of the route. Talk to Pilot Mei first. Mei will brief you.',
];
export const BLIP_HELLO = ['Bleep bloop! I am Blip! I love numbers and shiny things.', 'Can I ride along? I will sit very still. Mostly.'];
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. J shows your missions.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the pad. Tap someone to talk to them.';

export const FLIGHT_TIP_KEYS = 'Steer with the arrow keys or A and D. Your blaster fires by itself at the gray pebbles. To answer, fly under a rock and press Space, or press 1, 2 or 3. H gives a hint.';
export const FLIGHT_TIP_TOUCH = 'Drag to steer. Your blaster fires by itself at the gray pebbles. To answer, tap a rock. The light bulb gives a hint.';

export const SOON: Record<'dot' | 'sol', string[]> = {
  dot: ['Hello! My crates of supplies are still being loaded.', 'When the Cargo sector opens, you will share them fairly between the ships. For now, help Mei and Rafi!'],
  sol: ['Welcome to the Star Map. Every star is a times fact.', 'When you answer a fact right the first time, its star lights up. Want to see your map?'],
};

export const BLIP_LINES = [
  'Bleep! I counted the stars out the window. I got to 7 and then I sneezed.',
  'Blip likes the 5s. Five, ten, fifteen, twenty! Like a song!',
  'Did you know? 3 rows of 4 and 4 rows of 3 are the same ships. Bloop!',
  'Bleep bloop. The Static is gray and grumpy. Sparkles make it better!',
];

/** Where each flight is in the story (said by the chief before launch). */
export const LAUNCH = 'Launching! Stay under a rock and beam it when you know the answer.';
export const TOWED = 'Your shield is out, so the tow beam pulls you home. Every star and every ship you saved is safe!';

// ------------------------------------------------------------------ questions, mistakes and hints

const times = (a: number, b: number) => `${a} × ${b}`;

/** One sentence about the likely mistake behind a wrong rock (never gives the answer). */
export function mistakeLine(p: Problem, step: number, mis: Misconception): string {
  const { a, b } = p;
  switch (mis) {
    case 'added':
      return `That adds the numbers. ${times(a, b)} means ${a} groups of ${b}, not ${a} + ${b}.`;
    case 'group-size':
      return `That is just one group. There are ${a} groups of ${b}.`;
    case 'group-count':
      return `That counts the groups. Each group has ${b} ships.`;
    case 'one-group-off':
      return p.kind === 'groups-sentence' ? `Count the groups again. How many groups are there?` : `So close! That is one group too many or too few. Count the groups again.`;
    case 'counted-edge':
      return 'That counts only the ships round the edge. The ships in the middle need rescuing too!';
    case 'turn-changes':
      return 'Turning a formation does not add or take away any ships. Is the total the same as before?';
    case 'split-both':
      return step === 0 ? `Both parts keep all ${a} rows. Only the columns are split.` : `Both parts have ${a} rows. Add the two parts on the banner.`;
    case 'split-forgot':
      return `The right part is a formation too: ${a} rows of ${b - 5}. Multiply it as well.`;
    case 'zero-keeps':
      return 'Groups of zero, or zero groups, means no ships at all.';
    case 'one-makes-one':
      return `One group of ${Math.max(a, b)} is ${Math.max(a, b)} ships, not 1.`;
    case 'rules-mixed':
      return 'Careful! Times 0 always gives 0, and times 1 keeps the number the same.';
    case 'half-forgot':
      return 'That is times 10. Times 5 is half of times 10.';
    case 'extra-zero':
      return 'Times 10 puts one zero on the end, not two.';
    case 'double-once':
      return 'Doubling once is times 2. Times 4 needs a second double.';
    case 'nine-minus-one':
      return `Take away a whole group of ${a === 9 ? b : a}, not just 1.`;
    case 'nines-flipped':
      return `The digits are flipped! In a nines answer, the tens digit is one less than the other number.`;
    case 'plus-three':
      return `Times 3 is a double and one more group of ${a === 3 ? b : a}, not plus 3.`;
    default:
      return 'Not quite. Try a hint: H or the light bulb.';
  }
}

/** The hint ladder: 1 a nudge, 2 a picture with a worked step, 3 the answer outlined. */
export function hintText(p: Problem, step: number, rung: number): string {
  const s = p.steps[step];
  if (rung >= 3) return `The answer is outlined. ${s.explain}`;
  const { a, b } = p;
  const other = (t: number) => (a === t ? b : a);
  const twoCounts = (by: number) => `${by}, ${by * 2}, …`;
  switch (p.kind) {
    case 'groups-count':
      return rung === 1 ? 'How many groups? How many ships in each group?' : `Count by ${b}s, one number for each of the ${a} groups: ${twoCounts(b)}`;
    case 'groups-sentence':
      return rung === 1 ? 'Which number tells the groups? Which tells how many in each?' : `Groups first: ${a} groups. Then how many in each group. Groups × in each.`;
    case 'array-count':
      return rung === 1 ? 'How many rows? How many ships in each row?' : `Count by ${b}s down the rows: ${twoCounts(b)} one number for each of the ${a} rows.`;
    case 'array-turn':
      return rung === 1 ? 'Did any ships fly away when the formation turned?' : `The same ships, just turned. Look at the first total on the banner.`;
    case 'split':
      if (step === 0) return rung === 1 ? 'How many rows does each part have?' : `The line splits the columns: 5 on the left, ${b - 5} on the right. Each part keeps all ${a} rows.`;
      return rung === 1 ? 'Add the two parts together.' : `Add the tens first, then the ones.`;
    case 'basic': {
      const t = [0, 1, 2, 5, 10].find((x) => x === a || x === b) ?? b;
      const n = other(t);
      if (t === 0) return rung === 1 ? 'How many ships are in zero groups?' : 'Zero groups of anything is nothing at all.';
      if (t === 1) return rung === 1 ? `How many ships in one group of ${n}?` : `One group of ${n}: just the ${n} ships.`;
      if (t === 2) return rung === 1 ? 'Times 2 is a double.' : `Double ${n}: ${n} + ${n}.`;
      if (t === 5) return rung === 1 ? 'Times 5 is half of times 10.' : `${n} × 10 = ${n * 10}. Now take half of it.`;
      return rung === 1 ? 'Times 10 puts a zero on the end.' : `${n} tens: count by tens ${n} times.`;
    }
    case 'shortcut': {
      const t = [4, 9, 3].find((x) => x === a || x === b)!;
      const n = other(t);
      if (step === 0) return rung === 1 ? (t === 4 ? 'Think about doubles.' : t === 9 ? 'Think about 10 groups.' : 'Think about a double.') : t === 4 ? '4 groups is 2 groups, and 2 groups again.' : t === 9 ? '9 groups is 10 groups with one group taken away.' : '3 groups is 2 groups and 1 more group.';
      return rung === 1 ? 'Use the shortcut on the banner.' : t === 4 ? `${2 * n} + ${2 * n}` : t === 9 ? `${10 * n} − ${n}` : `${2 * n} + ${n}`;
    }
    case 'break-apart': {
      const rest = a - 5;
      return rung === 1 ? 'Break it into 5 groups and the rest.' : `${times(5, b)} = ${5 * b} and ${times(rest, b)} = ${rest * b}. Add the two parts.`;
    }
    case 'big': {
      const t = a >= 11 ? a : b;
      const n = other(t);
      return rung === 1 ? 'Break it into 10 groups and the rest.' : `10 × ${n} = ${10 * n} and ${t - 10} × ${n} = ${(t - 10) * n}. Add them.`;
    }
  }
}

const PRAISE = ['Direct hit!', 'Nice flying!', 'Sparkly!', 'You got it!', 'Super shot!', 'Ships saved!', 'Bleep bloop, yes!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

// ------------------------------------------------------------------ upgrades (paid with stardust)

export type UpgradeId = 'twin' | 'rapid' | 'shield1' | 'shield2' | 'thrusters';
export const UPGRADES: Array<{ id: UpgradeId; name: string; text: string; cost: number; icon: 'twin' | 'rapid' | 'shield' | 'thrusters'; needs?: UpgradeId }> = [
  { id: 'twin', name: 'Twin blaster', text: 'Two blasters clear the pebbles faster.', cost: 30, icon: 'twin' },
  { id: 'shield1', name: 'Shield +1', text: 'One more bump before the tow beam.', cost: 25, icon: 'shield' },
  { id: 'thrusters', name: 'Thrusters', text: 'Steer faster.', cost: 30, icon: 'thrusters' },
  { id: 'rapid', name: 'Rapid fire', text: 'The blaster fires more often.', cost: 40, icon: 'rapid' },
  { id: 'shield2', name: 'Shield +2', text: 'A second extra shield.', cost: 50, icon: 'shield', needs: 'shield1' },
];
export const PAINT_COST = 15;
export const DUST = { pebble: 1, clean: 5, right: 2, flight: 10 };

// ------------------------------------------------------------------ the grown-ups page

export const GROWNUPS: GrownupsContent = {
  game: 'Multiplication Space Quest',
  grades: '3–5',
  summary:
    'Your child flies a little spaceship out of the Star Station to clear a cloud of gray space rocks (the Static) and rescue a fleet of stranded supply ships. Every question floats in as three answer rocks; your child steers under the right one and fires the charge beam. The stranded ships fly in as the picture the question is about (equal groups, rows and columns, a formation split in two), so your child reads the picture to answer. Right answers light up the ships, which join your child’s fleet. Back on the station deck, the crew give each mission a short briefing and a "talk it through" question at the end. The action (steering, a blaster that fires by itself at small pebbles) is there for fun: answers are never timed and the answer rocks wait.',
  teaches: [
    { title: 'Formations (grade 3): equal groups and arrays', text: 'How many ships in 4 groups of 3, and which times sentence matches; formations of rows and columns, and turning a formation on its side (6 × 4 = 4 × 6); then splitting a big formation into two smaller ones (7 × 8 = 7 × 5 + 7 × 3).' },
    { title: 'Engines (grades 3–4): fact shortcuts', text: 'Times 2 as a double, times 5 as half of times 10, times 10, times 1 and times 0; then times 4 (double, double again), times 9 (ten groups take away one group) and times 3 (a double and one more group), picking the shortcut first; then the hard facts (6 to 9 times 6 to 9) by breaking them apart, with the 11s and 12s as a stretch.' },
    { title: 'The Star Map', text: 'Every times fact from 1 × 1 to 10 × 10 is a star on Navigator Sol’s map. A star lights up when your child answers that fact right the first time, so you can see which facts are known and which still need practice.' },
    { title: 'Mistakes get a reason', text: 'The wrong answer rocks come from real mistakes: adding instead of multiplying (4 groups of 3 as 7), giving only one group, counting only the edge of a formation, thinking 6 × 0 is 6, doubling once for times 4, taking away 1 instead of a group for times 9, and flipping the digits of a nines answer (36 for 63). Each gets one sentence of explanation.' },
    { title: 'Help built in', text: 'Three hints for every question, and the flight pauses while a hint is open: a tip, then a picture (the ships lit up group by group, or a dot picture of the shortcut), then the right rock outlined with the reason.' },
  ],
  standards: [
    { code: '3.OA.1', text: 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.' },
    { code: '3.OA.3', text: 'Use multiplication and division within 100 to solve word problems in situations involving equal groups, arrays, and measurement quantities.' },
    { code: '3.OA.5', text: 'Apply properties of operations as strategies to multiply and divide (commutative property: 6 × 4 = 4 × 6; distributive property: 8 × 7 = 8 × 5 + 8 × 2).' },
    { code: '3.OA.7', text: 'Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers.' },
    { code: '3.OA.9', text: 'Identify arithmetic patterns (including patterns in the multiplication table), and explain them using properties of operations.' },
  ],
  talk: [
    'Set out 3 rows of 5 coins. Ask how many. Turn the rows on their side: is it still the same number? Why?',
    'Ask how they would work out 9 × 7 without counting. (Ten 7s is 70, take away one 7.)',
    'Ask which facts on the Star Map are still dark, and practise one together at dinner.',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Answers are never timed: the answer rocks wait. Bumping a pebble costs a bit of shield, and when the shield runs out the ship is towed home with everything it earned. A wrong answer never loses progress; it only costs that question’s star.',
    'Every question can be read aloud (the speaker button), every answer can be picked with the number keys 1 to 3, and Settings has reduced motion, which slows the flight down.',
  ],
  simplifies: [
    'Real space rocks don’t drift down a screen, and spaceships don’t fly in tidy rows. The Static is a made-up cloud, and the flight is a game, not real space travel.',
    'The 11s and 12s are a stretch at the top level; the Star Map covers the facts from 1 × 1 to 10 × 10 that grade 3 asks children to know from memory.',
  ],
  credits: [
    'Learning content from the Learning Adventures games Multiplication Space Quest, Multiplication Bingo Bonanza and Multiplication Tables Adventure.',
    'Art, music and sound by Learning Adventures, made in code.',
    `Setting: ${STATION_DECK.inspiredBy}`,
  ],
};
