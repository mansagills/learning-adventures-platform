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
  cargo: {
    id: 'cargo',
    name: 'Cargo',
    skill: 'Sharing and leftovers',
    chief: 'dot',
    grades: 'grades 3–4',
    intro: [
      'Hello! I load the supplies. Every rescued ship needs its share of crates, and every share must be fair.',
      'Sharing into equal groups is division. If you know your times facts, you know your division facts too: they undo each other.',
      'Watch out for leftovers. Sometimes a few crates, or a few crew, are left over. Think about what to do with them!',
    ],
    again: 'More crates to share out. Fair shares only!',
    debrief: {
      text: '29 crew, 4 seats in each shuttle. 7 shuttles are full and 1 crew member is left. How many shuttles do we need?',
      options: [
        { text: '8. The last crew member needs a shuttle too.', correct: true, feedback: 'Yes! Nobody gets left behind. 7 full shuttles and 1 more for the leftover crew: 8.' },
        { text: '7. That is how many are full.', feedback: '7 shuttles are full, but 1 crew member would be left on the deck!', misconception: 'leftover-ignored' },
        { text: '1. That is what is left over.', feedback: '1 is the leftover crew member. We need shuttles for everybody.', misconception: 'remainder-answer' },
      ],
      hints: ['Does every crew member get a seat?', '7 shuttles hold 28 crew. Where does crew member 29 sit?', 'The answer is outlined: one more shuttle, 8.'],
    },
    done: 'Every crate is shared out fairly. The Cargo sector is clear!',
  },
  constellations: {
    id: 'constellations',
    name: 'Constellations',
    skill: 'Fact families and factors',
    chief: 'sol',
    grades: 'grades 3–5',
    intro: [
      'Welcome, navigator. Out past the Static, the stars make shapes: constellations.',
      'Times facts come in families, like stars in a constellation. 3, 4 and 12 make four facts: 3 × 4, 4 × 3, 12 ÷ 3 and 12 ÷ 4.',
      'Find the families and the factors, and we can plot the way home. Every fact you get right first time lights a star on my map.',
    ],
    again: 'The constellations are waiting. Find the families!',
    debrief: {
      text: 'You know 6 × 8 = 48. Which division facts do you know for free?',
      options: [
        { text: '48 ÷ 6 = 8 and 48 ÷ 8 = 6.', correct: true, feedback: 'Exactly! Division undoes multiplication, so one times fact gives you two division facts.' },
        { text: '6 ÷ 48 = 8.', feedback: 'That divides the small number by the big one. The total, 48, goes first.', misconception: 'backwards-division' },
        { text: 'None. Division is a new fact to learn.', feedback: 'Division is the same family! 6 × 8 = 48 means 48 ÷ 8 = 6.', misconception: 'division-not-family' },
      ],
      hints: ['What does division undo?', 'If 6 groups of 8 make 48, how many groups of 8 are in 48?', 'The answer is outlined: 48 ÷ 6 = 8 and 48 ÷ 8 = 6.'],
    },
    done: 'The way home is plotted! The Constellations sector is clear.',
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

/** The finale: the Bingo Boss, then the landing on the alien planet. */
export const BOSS_READY = ['All four sectors are clear! But the heart of the Static is still out there: a huge rock with a Bingo shield.', 'Come and see me when you are ready. Then we bring the whole fleet home to the planet outpost.'];
export const BOSS_INTRO = ['This is it: the Bingo Boss. Its shield is a Bingo card of numbers.'];
export const BOSS_BLIP = ['I will call the questions! Beam the square with the answer. Five in a row, across, down or corner to corner, breaks the shield. Bleep!'];
export const BOSS_TIP_KEYS = 'Move the target with the arrow keys and press Space to beam a square. Or click a square.';
export const BOSS_TIP_TOUCH = 'Tap the square with the answer.';
export const LANDING = [
  'The Static is gone! The whole fleet is flying down to the outpost on the planet.',
  'Welcome to the night-shift party. Every supply ship made it, and the outpost lights are on, thanks to you.',
];
export const LANDING_BLIP = 'Bleep bloop! Best. Day. Ever. Look at all those ships!';
export const LANDING_AFTER = 'Fly any mission again whenever you like. Rafi has a Meteor Run, and Blip wants a Bingo rematch!';
export const REMATCH_INTRO = ['A new Bingo card! How few calls can you win in?'];

/** Meteor Run (the old Space Quest race): optional, and the only timed part of the game. */
export const METEOR_SECONDS = 60;
export const METEOR_INTRO = 'Meteor Run! 60 seconds of quick times facts. Beam as many right answers as you can. Facts that are still dark on the Star Map come up most.';

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
      if (p.sector === 'constellations') return 'That is an adding fact. A times family only multiplies and divides.';
      return `That adds the numbers. ${times(a, b)} means ${a} groups of ${b}, not ${a} + ${b}.`;
    case 'subtracted':
      return `That takes ${b} away from ${a}. Division makes equal groups: how many ${b}s fit in ${a}?`;
    case 'multiplied':
      return `That multiplies. When ${a} is shared out, each share is smaller than ${a}.`;
    case 'swapped':
      return `That is the number of ships. The question asks how many crates go on each ship.`;
    case 'leftover-ignored':
      return 'Those shuttles are full, but some crew are still waiting on the deck. Do they fly too?';
    case 'remainder-answer':
      return 'That is how many are left over. The question asks about the groups.';
    case 'rounded-up':
      return `A crate is only full with ${b} cans in it. Is the last one full?`;
    case 'gave-quotient':
      return 'That is how many crates get filled. The question asks how many cans are left over.';
    case 'missing-to-fill':
      return 'That is how many more cans would fill another crate. How many are left over now?';
    case 'backwards-division':
      return 'Divide the big number by a small one: the total goes first.';
    case 'division-not-family':
      return 'That division fact is in the family: it undoes the multiplication.';
    case 'repeated-pair':
      return 'That pair is already on the list, just turned round. Look for a new pair.';
    case 'not-a-factor':
      return p.kind === 'missing-pair' ? `That pair does not make ${a}. Multiply it to check.` : `That number does not go into ${a} without something left over.`;
    case 'multiple-not-factor':
      return `That is a multiple of ${a}: it is bigger than ${a}. Factors multiply together to make ${a}.`;
    case 'odd-means-prime':
      return 'Odd numbers can still have other factors. Try dividing it by 3 or 5.';
    case 'one-is-prime':
      return '1 has only one factor. A prime has exactly two.';
    case 'group-size':
      return `That is just one group. There are ${a} groups of ${b}.`;
    case 'group-count':
      return `That counts the groups. Each group has ${b} ships.`;
    case 'one-group-off':
      return p.kind === 'groups-sentence' ? `Count the groups again. How many groups are there?` : `So close! That is one group too many or too few. Count the groups again.`;
    case 'counted-edge':
      return 'That counts only the ships round the edge. The ships in the middle need rescuing too!';
    case 'turn-changes':
      if (p.sector === 'constellations') return `Turning a times fact round keeps it in the family: ${times(b, a)} is the same as ${times(a, b)}.`;
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
    case 'share':
      return rung === 1 ? 'Deal the crates out, one to each ship, round and round.' : `How many ${b}s make ${a}? Count by ${b}s: ${twoCounts(b)}`;
    case 'missing-factor':
      return rung === 1 ? `What times ${b} makes ${a}?` : `Count by ${b}s until you reach ${a}, and count the jumps: ${twoCounts(b)}`;
    case 'how-many-groups':
      return rung === 1 ? 'How many groups, or how many in each? Both are division.' : `Count by ${b}s up to ${a}, and count the jumps: ${twoCounts(b)}`;
    case 'round-up':
      return rung === 1 ? 'How many shuttles are full? Is anyone left waiting?' : `Count by ${b}s as close to ${a} as you can. Then look at who is left.`;
    case 'full':
      return rung === 1 ? `A crate is only full with exactly ${b} cans.` : `Count by ${b}s without going past ${a}. Each jump is one full crate.`;
    case 'left-over':
      return rung === 1 ? 'Fill as many crates as you can. What is left?' : `Count by ${b}s up to ${a} without going over. How far short of ${a} do you stop?`;
    case 'family-missing':
      return rung === 1 ? 'A family has two times facts and two divide facts.' : `Divide the biggest number, ${a * b}, by each small one: ${a} and ${b}.`;
    case 'odd-fact':
      return rung === 1 ? 'Check each fact. Is it true? Does it multiply or divide?' : `The family only uses ${a}, ${b} and ${a * b}, with × and ÷.`;
    case 'missing-pair':
      return rung === 1 ? 'Start at 1. What times 1 makes the number? Then try 2, 3, 4…' : 'A turned pair is the same pair. Multiply each choice to check it.';
    case 'is-factor':
      return rung === 1 ? `Which number goes into ${a} with nothing left over?` : `Try ${a} ÷ each number. A factor leaves nothing over, and it is never bigger than ${a}.`;
    case 'prime':
      return rung === 1 ? 'A prime can only be made as 1 × itself.' : 'Try 3 × something and 5 × something for each number.';
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
    'Your child flies a little spaceship out of the Star Station to clear a cloud of gray space rocks (the Static) and rescue a fleet of stranded supply ships. Every question floats in as three answer rocks; your child steers under the right one and fires the charge beam. The stranded ships and supply crates fly in as the picture the question is about (equal groups, rows and columns, a formation split in two, crates to share), so your child reads the picture to answer. Right answers light up the ships, which join your child’s fleet. Four missions (Formations, Engines, Cargo and Constellations) each end with a "talk it through" question back on the station deck. With all four cleared, the finale is a Bingo game against the heart of the Static, and the whole fleet lands on an alien planet. The action (steering, a blaster that fires by itself at small pebbles) is there for fun: answers are never timed and the answer rocks wait. Meteor Run, a 60-second race through quick facts, is optional.',
  teaches: [
    { title: 'Formations (grade 3): equal groups and arrays', text: 'How many ships in 4 groups of 3, and which times sentence matches; formations of rows and columns, and turning a formation on its side (6 × 4 = 4 × 6); then splitting a big formation into two smaller ones (7 × 8 = 7 × 5 + 7 × 3).' },
    { title: 'Engines (grades 3–4): fact shortcuts', text: 'Times 2 as a double, times 5 as half of times 10, times 10, times 1 and times 0; then times 4 (double, double again), times 9 (ten groups take away one group) and times 3 (a double and one more group), picking the shortcut first; then the hard facts (6 to 9 times 6 to 9) by breaking them apart, with the 11s and 12s as a stretch.' },
    { title: 'Cargo (grades 3–4): division and leftovers', text: 'Sharing crates equally between ships; the missing factor (? × 6 = 42) and division as the opposite of multiplication; "how many groups?" next to "how many in each?" stories; then leftovers: how many shuttles so everyone flies (one more for the leftover crew), how many crates are full, and how many cans are left over.' },
    { title: 'Constellations (grades 3–5): fact families and factors', text: 'Finishing a fact family (3, 4 and 12 make 3 × 4, 4 × 3, 12 ÷ 3 and 12 ÷ 4); spotting the fact that does not belong; then factor pairs (every rectangle of 24 ships), factors and multiples, and prime numbers.' },
    { title: 'Bingo Boss and Meteor Run', text: 'The finale is the old Multiplication Bingo Bonanza, made fair: Blip calls times, division and missing-factor questions, and every call’s answer is always on the card. Meteor Run (the old Space Quest race) asks quick facts for 60 seconds, mostly the ones still dark on the Star Map.' },
    { title: 'The Star Map', text: 'Every times fact from 1 × 1 to 10 × 10 is a star on Navigator Sol’s map. A star lights up when your child answers that fact right the first time, so you can see which facts are known and which still need practice.' },
    { title: 'Mistakes get a reason', text: 'The wrong answer rocks come from real mistakes: adding instead of multiplying (4 groups of 3 as 7), giving only one group, counting only the edge of a formation, thinking 6 × 0 is 6, doubling once for times 4, taking away 1 instead of a group for times 9, flipping the digits of a nines answer (36 for 63), subtracting instead of dividing, forgetting the leftover crew, dividing the small number by the big one, counting a turned pair as a new one, mixing up factors and multiples, and thinking every odd number is prime. Each gets one sentence of explanation.' },
    { title: 'Help built in', text: 'Three hints for every question, and the flight pauses while a hint is open: a tip, then a picture (the ships lit up group by group, or a dot picture of the shortcut), then the right rock outlined with the reason.' },
  ],
  standards: [
    { code: '3.OA.1', text: 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.' },
    { code: '3.OA.2', text: 'Interpret whole-number quotients of whole numbers, e.g., interpret 56 ÷ 8 as the number of objects in each share when 56 objects are partitioned equally into 8 shares, or as a number of shares.' },
    { code: '3.OA.3', text: 'Use multiplication and division within 100 to solve word problems in situations involving equal groups, arrays, and measurement quantities.' },
    { code: '3.OA.4', text: 'Determine the unknown whole number in a multiplication or division equation relating three whole numbers (8 × ? = 48).' },
    { code: '3.OA.5', text: 'Apply properties of operations as strategies to multiply and divide (commutative property: 6 × 4 = 4 × 6; distributive property: 8 × 7 = 8 × 5 + 8 × 2).' },
    { code: '3.OA.6', text: 'Understand division as an unknown-factor problem: find 32 ÷ 8 by finding the number that makes 32 when multiplied by 8.' },
    { code: '3.OA.7', text: 'Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers.' },
    { code: '3.OA.9', text: 'Identify arithmetic patterns (including patterns in the multiplication table), and explain them using properties of operations.' },
    { code: '4.OA.3', text: 'Solve multistep word problems with whole numbers, including problems in which remainders must be interpreted.' },
    { code: '4.OA.4', text: 'Find all factor pairs for a whole number in the range 1–100; recognize that a whole number is a multiple of each of its factors; determine whether a given whole number is prime or composite.' },
  ],
  talk: [
    'Set out 3 rows of 5 coins. Ask how many. Turn the rows on their side: is it still the same number? Why?',
    'Ask how they would work out 9 × 7 without counting. (Ten 7s is 70, take away one 7.)',
    'Ask which facts on the Star Map are still dark, and practise one together at dinner.',
    'Share 14 grapes between 4 people. Ask: how many each, and what do we do with the 2 left over?',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Answers are never timed (only the optional Meteor Run is): the answer rocks wait. Bumping a pebble costs a bit of shield, and when the shield runs out the ship is towed home with everything it earned. A wrong answer never loses progress; it only costs that question’s star.',
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
