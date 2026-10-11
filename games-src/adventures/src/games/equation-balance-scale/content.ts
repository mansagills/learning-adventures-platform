import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question } from '../../kit/ui/talk';
import { ALIEN_PLANET } from '../../kit/worlds/star-station/planet';
import { fillUnknown, type Job, type Misconception, type Pan, type Problem } from './problems';

/**
 * Everything Equation Balance Scale says: the people at the outpost, the
 * opening, a sentence for each kind of mistake (with the question's own
 * numbers), the hints, the debriefs and the grown-ups page. The owner's
 * wording rule holds everywhere: short sentences, the facts first, then one
 * plain question, in words that match the picture ("the left pan", "the right
 * pan") and no game jargon. Read-aloud is on, and a mistake sentence never
 * gives the answer away.
 */

export const STARS_PER_JOB = 5;

export type PersonId = 'kiri' | 'juno' | 'pax';
export const PERSON_OF: Record<Job, PersonId> = { weigh: 'kiri', rover: 'juno', dome: 'pax' };

export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  kiri: { name: 'Ranger Kiri', role: 'Runs the weigh station' },
  juno: { name: 'Mechanic Juno', role: 'Loads the rover' },
  pax: { name: 'Botanist Pax', role: 'Grows seed pods in the dome' },
};
export const GLOOP = { name: 'Gloop', role: 'The planet’s friendly critter' };

export interface JobInfo {
  id: Job;
  name: string;
  skill: string;
  person: PersonId;
  grades: string;
  intro: string[];
  again: string;
  debrief: Question;
  done: string;
}

export const JOB_INFO: Record<Job, JobInfo> = {
  weigh: {
    id: 'weigh',
    name: 'The Weigh Station',
    skill: 'The equals sign',
    person: 'kiri',
    grades: 'grades 3–4',
    intro: [
      'This is my weigh station. Before crystals fly up to the Star Station, we check that two loads weigh the same.',
      'The = sign means both sides weigh the same. If they do, the scale balances and the equation is true.',
      'I lock the scale while you think. Tell me if it balances, or which side is heavier. When you are right, I let it go!',
    ],
    again: 'More crystals to weigh. Does each scale balance?',
    debrief: {
      text: 'What does the = sign tell us?',
      options: [
        { text: 'Both sides weigh the same.', correct: true, feedback: 'Yes! = means "the same as". 9 = 4 + 5 is true, because both sides are 9.' },
        { text: 'The answer comes next.', feedback: 'Sometimes the answer comes next, but not always. 9 = 4 + 5 is true too. = means both sides are the same.', misconception: 'answer-next' },
        { text: 'Add up all the numbers.', feedback: '= does not mean add. It means the left side and the right side weigh the same.', misconception: 'added-all' },
      ],
      hints: ['Think about the scale. What does it do when the = sign is true?', 'When 4 + 5 = 9 is true, the scale balances. Both pans weigh 9.', 'The answer is outlined: both sides weigh the same.'],
    },
    done: 'You can read a scale like a ranger! The first part of the beacon is lit.',
  },
  rover: {
    id: 'rover',
    name: 'The Rover',
    skill: 'The missing number',
    person: 'juno',
    grades: 'grades 3–4',
    intro: [
      'Hi! I load the rover. Every crate has a label, but some labels have a number missing.',
      'Find the crystal that makes the scale balance. Put it in the gap with the question mark.',
      'Watch the scale. If a pan goes down, that side is too heavy. If it goes up, it is too light.',
    ],
    again: 'More labels with a missing number. Make each scale balance!',
    debrief: {
      text: 'Look at 8 + 4 = ? + 5. Why is the missing number not 12?',
      options: [
        { text: 'The right pan would be 12 + 5 = 17. That is more than 12.', correct: true, feedback: 'Yes! Both pans must weigh 12. 7 + 5 = 12, so the missing number is 7.' },
        { text: 'It is 12, because 8 + 4 = 12.', feedback: '8 + 4 = 12 is the left pan. The right pan has a 5 on it too, so the missing number must be less than 12.', misconception: 'answer-next' },
        { text: 'It is 17, because you add all the numbers.', feedback: 'Adding everything puts too much on one pan. The two pans must weigh the same.', misconception: 'added-all' },
      ],
      hints: ['What does the left pan weigh?', 'The left pan weighs 12. If the gap is 12, the right pan is 12 + 5. Is that the same?', 'The answer is outlined: 12 + 5 is 17, too heavy.'],
    },
    done: 'Every label is fixed and the rover is loaded! Another part of the beacon is lit.',
  },
  dome: {
    id: 'dome',
    name: 'The Dome',
    skill: 'Two-step problems',
    person: 'pax',
    grades: 'grades 4–5',
    intro: [
      'Hello! I am Botanist Pax. I grow seed pods in the dome, and I pack them to send up to the station.',
      'Every packing job is a little story with two parts. First you pick the equation that tells the story. Then the equation goes on the scale, and you find the missing number.',
      'Later, the missing number gets a letter, like p for pods. A letter is just a number we have not found yet!',
    ],
    again: 'More seed pods to pack. Each story has two parts!',
    debrief: {
      text: 'Pax packs 3 bags of 6 pods, then adds 4 more. Why do we need two steps?',
      options: [
        { text: 'The story has two parts: first 3 × 6, then + 4.', correct: true, feedback: 'Yes! One step for each part of the story: 3 × 6 = 18, then 18 + 4 = 22.' },
        { text: 'We don’t. 3 × 6 = 18 is the answer.', feedback: '18 is only the bags. The story adds 4 more pods, so there is a second step.', misconception: 'one-step' },
        { text: 'To make the answer bigger.', feedback: 'The steps follow the story, not the size of the answer. Some stories take pods away.', misconception: 'wrong-operation' },
      ],
      hints: ['How many parts does the story have?', 'First the bags: 3 × 6. Then the extra pods: + 4.', 'The answer is outlined: one step for each part of the story.'],
    },
    done: 'Every seed pod is packed! The last part of the beacon is lit.',
  },
};


export const OPENING: string[] = [
  'Welcome to the outpost! I am Ranger Kiri.',
  'We grow glowing crystals here. Before they fly up to the Star Station, we weigh them on big balance scales.',
  'A scale balances when both pans weigh the same. That is just what the = sign means.',
  'Help us at our jobs. Each job you finish lights one part of the beacon. Light it all, and the station will know our crystals are ready!',
];
export const GLOOP_HELLO = 'Bloop! Bloop bloop!';
export const GLOOP_AFTER = 'That is Gloop. Gloop loves to sit on the scales. Gloop is not a crystal, so Gloop does not count!';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. J shows your jobs.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the pad. Tap someone to talk to them.';
export const SCALE_TIP_KEYS = 'Pick an answer with the mouse, or press 1, 2 or 3. H gives a hint.';
export const SCALE_TIP_TOUCH = 'Tap an answer. The light bulb gives a hint.';
export const ROVER_TIP_KEYS = 'Drag a crystal into the gap, click it, or press 1, 2 or 3. H gives a hint.';
export const ROVER_TIP_TOUCH = 'Drag a crystal into the gap, or tap it. The light bulb gives a hint.';
export const DOME_TIP_KEYS = 'First pick the equation that tells the story. Then drag a crystal into the gap, click it, or press 1, 2 or 3. H gives a hint.';
export const DOME_TIP_TOUCH = 'First tap the equation that tells the story. Then drag a crystal into the gap, or tap it. The light bulb gives a hint.';

// ------------------------------------------------------------------ The Big Weigh-in (the finale)

export const WEIGHIN_READY = [
  'The whole beacon is lit! Look, evening is falling, and the sky is starting to glow.',
  'Before the beacon can shine up to the station, we have one last job: The Big Weigh-in!',
  'Three scales: one from the weigh station, one from the rover and one from the dome. Ready?',
];
export const WEIGHIN_AGAIN = 'The beacon is lit and the sky is glowing. Are you ready for The Big Weigh-in?';
export const WEIGHIN_GLOOP = 'Bloop! (Gloop has climbed up and is sitting on top of the scale.)';
export const WEIGHIN_GLOOP_AFTER = 'Gloop is sitting right in the middle, above the post. That pushes down on both sides the same, so it does not tip the scale. We can still weigh!';
export const WEIGHIN_FINALE = [
  'Three scales, all perfectly balanced. The Big Weigh-in is done!',
  'Watch the beacon. It is shining up to the Star Station. Now they know our crystals are ready!',
];
export const WEIGHIN_AFTER = ['Bloop bloop! (Gloop is doing a happy dance on the scale.)', 'Thank you, ranger. The outpost will stay lit tonight. Every job is still open if you want more practice.'];
export const WEIGHIN_DONE = 'The beacon is shining up to the station, thanks to you! Want to keep practising at the weigh station?';

export const GLOOP_LINES = [
  'Bloop! (Gloop sat on the scale. Gloop is very proud of that.)',
  'Bloop bloop? (Gloop wants to know if Gloop weighs more than a crystal.)',
  'Bloop! (Gloop found a shiny pebble. It is not a crystal.)',
  'Bloooop. (Gloop is having a little nap in the moss.)',
];

// ------------------------------------------------------------------ mistakes and hints

/** One sign and two numbers read from a pan's text ("7 + ?", "? × 4", "36 ÷ ?", "8 + 4"). */
function readPan(pan: Pan): { a: string; op: string; b: string } | null {
  const m = pan.text.match(/^(\d+|\?) ([+−×÷]) (\d+|\?)$/);
  return m ? { a: m[1], op: m[2], b: m[3] } : null;
}

/** "Try it: 19 + 7 = 26, not 12." (the gap filled with the chosen number) */
function tryIt(p: Problem, v: number): string {
  const gap = p.left.gap ? p.left : p.right;
  const other = p.left.gap ? p.right : p.left;
  const target = other.weight(0);
  const got = gap.weight(v);
  const filled = fillUnknown(gap.text, v);
  const side = (p.left.gap ? 'left' : 'right') as 'left' | 'right';
  const heavy = got > target;
  if (!Number.isFinite(got) || !Number.isInteger(got)) return `Try it: ${filled} is ${got < 1 ? 'less than 1' : 'not a whole number'}, not ${target}. The ${side} pan is too ${heavy ? 'heavy' : 'light'}.`;
  return `Try it: ${filled} = ${got}, not ${target}. The ${side} pan is too ${heavy ? 'heavy' : 'light'}.`;
}

/** One sentence about the likely mistake behind a wrong answer (never gives the answer). */
export function mistakeLine(p: Problem, mis: Misconception, chosen: string, step = 0): string {
  const v = Number(chosen);
  if (p.kind === 'two-step' && step === 0) {
    // a story's equation was picked
    switch (mis) {
      case 'one-step':
        return 'That equation only tells the first part of the story. What happens next?';
      case 'wrong-order':
        return 'Look at which numbers go together. Which number is the bags, and which is the pods in each bag?';
      case 'wrong-operation':
      default:
        return p.tier === 1 ? 'Check each sign. Does each part of the story put pods in, or take pods away?' : 'Check each sign. Equal groups of pods are ×. Then does the story put pods in, or take pods away?';
    }
  }
  if (p.job !== 'weigh' && Number.isFinite(v)) {
    const check = tryIt(p, v);
    switch (mis) {
      case 'one-step':
        return p.kind === 'boxes' ? `That is what all the boxes weigh together. ${check}` : `That is only the first step. ${check}`;
      case 'wrong-order':
        return `That puts the numbers in the wrong places. ${check}`;
      case 'one-pan-only':
        return `Take the same weight off both pans. ${check}`;
      case 'answer-next':
        return `The = sign does not mean "the answer comes next". ${check}`;
      case 'added-all':
        return `That adds every number. ${check}`;
      case 'wrong-operation':
        return `That works the wrong way. ${check}`;
      case 'add-change':
        return `Times does not change by adding. ${check}`;
      default:
        return `So close! ${check}`;
    }
  }
  const l = p.left.text;
  const r = p.right.text;
  switch (mis) {
    case 'one-pan':
      return `Look at the whole of each pan. Is ${r} really the same as ${l}?`;
    case 'backwards':
      return `A number on its own can go on the left. ${l} = ${r} is true if both pans weigh the same.`;
    case 'tipped-wrong-way':
      return 'The heavier pan goes down. Work out both pans. Which one weighs more?';
    case 'miscounted':
    default:
      return `Work out each pan again. Left: ${l}. Right: ${r}.`;
  }
}

/** The hint ladder: 1 a nudge, 2 a worked step (with a picture under the scale), 3 the answer outlined. */
export function hintText(p: Problem, rung: number, step = 0): string {
  const s = p.steps[step];
  if (rung >= 3) return `The answer is outlined. ${s.explain}`;
  if (s.hints) return s.hints[rung - 1];
  const lw = p.left.weight(0);
  if (p.kind === 'tip')
    return rung === 1 ? 'Count the crystals on each pan. Are the two counts the same?' : `The left pan has ${lw} crystals. How many crystals are on the right pan?`;
  if (p.kind === 'true-false')
    return rung === 1 ? 'Work out the left pan. Then work out the right pan. Are they the same?' : `The left pan, ${p.left.text}, weighs ${lw}. Now work out the right pan, ${p.right.text}.`;
  const gap = p.left.gap ? p.left : p.right;
  const other = p.left.gap ? p.right : p.left;
  const target = other.weight(0);
  if (p.kind === 'both-sides')
    return rung === 1 ? 'Work out the pan with no gap first. The other pan must weigh the same.' : `The full pan weighs ${target}. What number makes ${gap.text} weigh ${target} too?`;
  // one gap, and a number on the other pan
  if (rung === 1) return `What number makes ${gap.text} weigh ${target}?`;
  const g = readPan(gap);
  if (!g) return `Try each crystal in the gap. Which one makes ${target}?`;
  const known = g.a === '?' ? Number(g.b) : Number(g.a);
  if (g.op === '+') return `Count up from ${known} to ${target}. How many did you count?`;
  if (g.op === '−') return `Undo the take away: start at ${target} and add ${known} back.`;
  if (g.op === '×') return `Count by ${known}s up to ${target}. How many jumps is that?`;
  return `What times ${target} makes ${known}?`;
}

const PRAISE = ['Perfectly balanced!', 'Ranger work!', 'Spot on!', 'Bloop! (Gloop is impressed.)', 'Nicely weighed!', 'You got it!', 'Steady as a rock!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

// ------------------------------------------------------------------ the grown-ups page

export const GROWNUPS: GrownupsContent = {
  game: 'Equation Balance Scale',
  grades: '3–5',
  summary:
    'Your child walks around an outpost on an alien planet and helps the people there weigh glowing crystals on big balance scales. Every question is a scale: the two sides of an equation are the two pans, and the = sign means both pans weigh the same. At the Weigh Station, your child decides whether an equation is true and, if not, which side is heavier; then the scale is let go and tips to show the answer. At the Rover, your child finds the missing number in an equation and puts that crystal in the gap; a wrong crystal makes the scale tip, so your child can see why. At the Dome, your child reads a two-part story, picks the equation that tells it, and then solves it on the scale. Each finished job lights part of the outpost’s beacon, and The Big Weigh-in (one scale from each job) ends the game. Nothing is timed.',
  teaches: [
    { title: 'The Weigh Station (grades 3–4): the equals sign', text: 'Is 5 + 3 = 8 true? Crystals on both pans, then sums on both sides (7 + 2 = 4 + 5), a number alone on the left (9 = 4 + 5 is true), the trap 6 + 4 = 10 + 1 (false: look at the whole of each side), then × and ÷ (3 × 4 = 2 × 6, 20 ÷ 4 = 10 − 5).' },
    { title: 'The Rover (grades 3–4): the missing number', text: 'The missing number anywhere in an equation: 7 + ? = 12 and ? − 6 = 9, then ? × 4 = 24 and 36 ÷ ? = 9, then something on both sides: 8 + 4 = ? + 5, 3 × 8 = 6 × ?, 15 − 7 = ? − 10.' },
    { title: 'The Dome (grades 4–5): two-step problems', text: 'Two-part stories: first pick the equation that tells the story, then solve it. Adding and taking away (Pax has 12 pods, picks 4 more, then plants 7: 12 + 4 − 7 = ?), then groups and one more step (3 bags of 6 pods and 4 more: 3 × 6 + 4 = ?). At the top level a letter stands for the unknown (3 × 6 + 4 = p), and equal boxes sit on a pan: b + b + 3 = 11 (take 3 off both pans, then share 8 between 2 boxes).' },
    { title: 'Mistakes get a reason', text: 'The wrong answers come from real mistakes: reading = as "the answer comes next" (8 + 4 = ? + 5 → 12), adding every number shown, working the wrong way (? − 6 = 9 → 3), checking only part of a side, thinking a number alone on the left is "backwards", doing only the first step of a story (3 × 6 + 4 → 18), putting the numbers in the wrong places (3 + 6 × 4), and taking weight off one pan only (b + b + 3 = 11 → 7). Each gets one sentence, and at the Rover the scale shows which pan is too heavy.' },
    { title: 'Help built in', text: 'Three hints for every question: a tip, then a worked step (with the value of each pan shown under the scale), then the answer outlined with its reason.' },
  ],
  standards: [
    { code: '1.OA.7', text: 'Understand the meaning of the equal sign, and determine if equations involving addition and subtraction are true or false (a warm-up at the Weigh Station).' },
    { code: '1.OA.8', text: 'Determine the unknown whole number in an addition or subtraction equation relating three whole numbers.' },
    { code: '3.OA.4', text: 'Determine the unknown whole number in a multiplication or division equation relating three whole numbers.' },
    { code: '3.OA.7', text: 'Fluently multiply and divide within 100.' },
    { code: '3.OA.8', text: 'Solve two-step word problems using the four operations, with a letter standing for the unknown quantity.' },
    { code: '4.OA.3', text: 'Solve multistep word problems with whole numbers, represented by equations with a letter standing for the unknown quantity.' },
    { code: '5.OA.2', text: 'Write simple expressions that record calculations with numbers (picking the equation that tells a story).' },
  ],
  talk: [
    'Ask: is 9 = 4 + 5 true, or is it "backwards"? (It is true: both sides are 9.)',
    'Write 8 + 4 = ? + 5 and ask what goes in the box. Many children say 12. Ask them to check both sides.',
    'With a kitchen scale or two bags, ask: if one bag has 3 apples and 4 oranges, what could the other bag hold to weigh the same?',
    'Tell a two-part story ("4 boxes of 6 eggs, and we used 5") and ask your child to write the equation before working it out.',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Nothing is timed. A wrong answer never loses progress; it only costs that question’s star.',
    'Every question can be read aloud (the speaker button), and every answer can be picked with the number keys.',
  ],
  simplifies: [
    'In the game, every number is a weight (one crystal weighs 1). Real crystals would not all weigh the same.',
    'No number in the game is ever below zero, so a take-away always fits on the scale.',
  ],
  credits: ['Learning content from the Learning Adventures game Equation Balance Scale.', 'Art, music and sound by Learning Adventures, made in code.', `Setting: ${ALIEN_PLANET.inspiredBy}`],
};
