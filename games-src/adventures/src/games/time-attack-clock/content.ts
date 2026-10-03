import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question } from '../../kit/ui/talk';
import { countOn, fmt, fmtDuration, words, type Misconception, type Problem, type Station } from './problems';

/**
 * Everything Time Attack Clock says: the people in town, the opening and
 * finale, the question for each activity, a sentence for each kind of
 * mistake, the hints and the grown-ups page. Sentences are short because
 * many players are still learning to read (read-aloud is on).
 */

export const STARS_PER_STATION = 5;
export const ATTACK_SECONDS = 60;

export const TOCK = { name: 'Mr. Tock', role: 'The town clockmaker' };

export interface StationInfo {
  id: Station;
  name: string;
  skill: string;
  person: { name: string; role: string };
  /** The part of the clock tower this job fixes. */
  fixes: 'hands' | 'bell' | 'lights';
  fixName: string;
  intro: string[];
  debrief: Question;
  done: string;
}

export const STATION_INFO: Record<Station, StationInfo> = {
  school: {
    id: 'school',
    name: 'School Bell',
    skill: 'Read the clock',
    person: { name: 'Ms. Rivera', role: 'Teacher at the school' },
    fixes: 'hands',
    fixName: 'the clock hands',
    intro: [
      'Oh good, a time keeper! Without the tower clock I do not know when to ring the school bell.',
      'Help me read my classroom clock. The short blue hand shows the hour. The long red hand shows the minutes.',
    ],
    debrief: {
      text: 'The short hand is between 4 and 5. The long hand points to the 6. What time is it?',
      options: [
        { text: '4:30', correct: true, feedback: 'Yes! The hour hand has passed 4, and the long hand on 6 means 30 minutes. Half past 4.' },
        { text: '5:30', feedback: 'The short hand has not reached 5 yet, so it is still 4-something.', misconception: 'next-hour' },
        { text: '4:06', feedback: 'The long hand points to 6, but each number is 5 minutes. 6 fives make 30.', misconception: 'by-ones' },
      ],
      hints: ['Which number has the short hand passed?', 'It passed 4. The long hand on 6 is half way round: 30 minutes.', 'The answer is outlined: 4:30.'],
    },
    done: 'The bell rings right on time! You can read any clock now.',
  },
  bus: {
    id: 'bus',
    name: 'Bus Stop',
    skill: 'Set the clock',
    person: { name: 'Driver Dee', role: 'Drives the town bus' },
    fixes: 'bell',
    fixName: 'the tower bell',
    intro: [
      'Hi there! My bus has to leave on time, but the clock at the stop is all wrong.',
      'Drag the hands to show the time I tell you. Move the long hand for minutes. The short hand moves along with it, like a real clock!',
    ],
    debrief: {
      text: 'To show 7:15, where does the long minute hand go?',
      options: [
        { text: 'On the 3', correct: true, feedback: 'Yes! Count by fives: 5, 10, 15. That is the 3.' },
        { text: 'On the 7', feedback: 'The 7 is for the short hour hand. The long hand shows the minutes.', misconception: 'swapped' },
        { text: 'On the 15', feedback: 'There is no 15 on the clock! Each number is 5 minutes, so 15 minutes is the 3.', misconception: 'by-ones' },
      ],
      hints: ['Count by fives from the 12.', '5, 10, 15: the 1, the 2, the 3.', 'The answer is outlined: on the 3.'],
    },
    done: 'All aboard! The bus runs on time, and you can set any clock.',
  },
  bakery: {
    id: 'bakery',
    name: 'Bakery',
    skill: 'How long?',
    person: { name: 'Baker Bo', role: 'Bakes bread for the whole town' },
    fixes: 'lights',
    fixName: 'the tower lights',
    intro: [
      'Hello, hello! Everything in my oven needs just the right time.',
      'Help me work out when things will be ready, and how long they baked. Count on from the start time!',
    ],
    debrief: {
      text: 'Muffins go in at 2:45 and bake for 30 minutes. When are they ready?',
      options: [
        { text: '3:15', correct: true, feedback: 'Yes! 15 minutes gets to 3:00, and 15 more makes 3:15.' },
        { text: '2:75', feedback: 'There are only 60 minutes in an hour. After 2:59 comes 3:00.', misconception: 'no-carry' },
        { text: '2:15', feedback: 'The time went past 3 o\'clock, so the hour changes too.', misconception: 'same-hour' },
      ],
      hints: ['How many minutes from 2:45 to 3:00?', '15 minutes to 3:00, then 15 more.', 'The answer is outlined: 3:15.'],
    },
    done: 'Everything is baked just right! You can count on with time like a pro.',
  },
};

export const OPENING = [
  `Oh, hello! I am ${TOCK.name}, the town clockmaker.`,
  'Last night our clock tower stopped. Its hands, its bell and its lights all fell apart!',
  'Now the school, the bus and the bakery are all mixed up. They need someone who can tell time.',
  'Help them, and each job you finish fixes part of the tower. Look for people with a sign over their heads.',
  'And when you want a challenge, come back to me for a Time Attack!',
];

export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. On a clock, the arrow keys move the hands.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to walk, or use the pad. Tap a person to talk. Drag the clock hands with your finger.';

export const FINALE = [
  'Listen! BONG! BONG! BONG!',
  'The tower is fixed, the lights are on, and the whole town is on time again. Thank you, time keeper!',
  'Come back for a Time Attack whenever you like, and try to beat your best.',
];

export const ATTACK_INTRO = `Time Attack! Read as many clocks as you can in ${ATTACK_SECONDS} seconds. A wrong answer does not lose points. Ready?`;

const SCHOOL_ASKS = ['The bell rings at this time. What time is it?', 'Recess starts when the clock looks like this. What time is it?', 'Lunch time! What time does the clock show?', 'Story time starts now. What time is it?', 'Art class begins at this time. What time is it?'];
const BUS_NAMES = ['The 8 bus', 'The school bus', 'The park bus', 'The night bus', 'The library bus'];
const BAKES = ['The bread', 'The muffins', 'The cookies', 'A cherry pie', 'The rolls', 'A birthday cake'];

/** The question for a problem, said by the person who asks it. */
export function promptFor(p: Problem, seed: number): string {
  if (p.kind === 'read') return p.words ? 'What do we call this time?' : SCHOOL_ASKS[seed % SCHOOL_ASKS.length];
  if (p.kind === 'set') {
    const t = p.words ? words(p.time) : fmt(p.time);
    return `${BUS_NAMES[seed % BUS_NAMES.length]} leaves at ${t}. Set the clock to ${t}.`;
  }
  const what = BAKES[seed % BAKES.length];
  if (p.ask === 'end') return `${what} ${what.startsWith('The') && what.endsWith('s') ? 'go' : 'goes'} in the oven at ${fmt(p.start)}. ${what.endsWith('s') ? 'They bake' : 'It bakes'} for ${fmtDuration(p.minutes)}. When will ${what.endsWith('s') ? 'they' : 'it'} be ready?`;
  return `${what} went in at ${fmt(p.start)} and came out at ${fmt(p.end)}. How long did ${what.endsWith('s') ? 'they' : 'it'} bake?`;
}

const next = (h: number) => (h % 12) + 1;

/** One sentence about the likely mistake behind a wrong answer. */
export function mistakeLine(p: Problem, m: Misconception): string {
  const t = p.kind === 'elapsed' ? p.end : p.time;
  const setting = p.kind === 'set';
  switch (m) {
    case 'swapped':
      return setting ? 'Swap them: the long red hand is for minutes, and the short blue hand is for the hour.' : 'The short hand shows the hour and the long hand shows the minutes. You read them the other way round.';
    case 'next-hour':
      return setting ? `Check the hour. The short hand goes just past ${t.h}, not past ${next(t.h)}.` : `The short hand is close to ${next(t.h)}, but it has not got there yet. So it is still ${t.h}-something.`;
    case 'prev-hour':
      return setting ? `Check the hour: the short hand should be at or just past ${t.h}.` : `Look again at the short hand. It has already passed ${t.h}.`;
    case 'by-ones':
      if (p.kind === 'elapsed') return p.tier === 1 ? 'These are hours, not minutes. Each trip of the long hand round the clock is one hour.' : 'Each number on the clock is 5 minutes. Count the jumps by fives.';
      return setting ? 'Each number on the clock means 5 minutes. Count by fives to find where the long hand goes.' : 'The long hand points to a number, but each number means 5 minutes. Count by fives: 5, 10, 15.';
    case 'backwards':
      return 'Count the minutes going round the way the hands move, starting at the 12.';
    case 'half-hour':
      return 'Look at the long hand. On the 12 is o\'clock. On the 6 is half past.';
    case 'past-to':
      return '"Past" means after the hour: the long hand is on the right side. "To" means before the next hour: the left side.';
    case 'to-hour':
      return `"Quarter to" means 15 minutes before the next hour. ${fmt(t)} is quarter to ${next(t.h)}.`;
    case 'off-five':
      return 'Just one jump of 5 off. Count the fives again, slowly.';
    case 'off-one':
      return 'So close! Count the little minute marks one more time.';
    case 'off-hour':
      return 'Count the hours again: one hour is one trip of the long hand round the clock.';
    case 'gave-start':
      return 'That is the time it went in. Count on from there to find when it is ready.';
    case 'hundred-minutes':
      return 'An hour has 60 minutes, not 100. Count on to the next hour first, then on from there.';
    case 'minutes-only':
      return 'Do not just take away the minute numbers. Count on: up to the next hour, then on.';
    case 'no-carry':
      return 'There are only 60 minutes in an hour. After :59 the hour changes.';
    case 'same-hour':
      return 'The time went past the hour, so the hour changes too.';
    default:
      return 'Not quite. Try again!';
  }
}

export function hintText(p: Problem, rung: number): string {
  if (p.kind === 'read') {
    if (rung === 1) return 'Find the short hand first: it shows the hour. Then the long hand shows the minutes.';
    if (rung === 2) return p.tier === 1 ? 'The yellow part shows the hour. The long hand on 12 means o\'clock; on 6 means half past.' : 'The yellow part shows the hour. The blue numbers count the minutes by fives.';
    return 'The answer is outlined.';
  }
  if (p.kind === 'set') {
    if (rung === 1) return 'Move the long red hand first for the minutes. Then put the short hand on the hour.';
    if (rung === 2) return p.time.m === 0 ? 'For o\'clock, the long hand points straight up to the 12.' : 'The blue numbers count the minutes round the clock by fives.';
    return 'The green hands show where to put them.';
  }
  if (rung === 1) return p.ask === 'end' ? 'Count on from the start time.' : 'Count on from the start time to the end time.';
  if (rung === 2) {
    const path = countOn(p.start, p.end);
    // shows the jumps but leaves the last step (the answer) to the player
    if (p.ask === 'end') {
      const steps = path.slice(0, -1).map((s) => `${fmtDuration(s.add)} gets to ${fmt(s.to)}`);
      return `Count on from ${fmt(p.start)}: ${[...steps, `then ${fmtDuration(path[path.length - 1].add)} more`].join(', ')}.`;
    }
    if (path.length === 1) return p.tier === 1 ? `Count on one hour at a time from ${fmt(p.start)}. How many hours until ${fmt(p.end)}?` : `Count on by fives from ${fmt(p.start)} to ${fmt(p.end)}. How many minutes is that?`;
    let from = p.start;
    const parts = path.map((s) => {
      const line = `${fmt(from)} to ${fmt(s.to)} is ${fmtDuration(s.add)}`;
      from = s.to;
      return line;
    });
    return `Count on: ${parts.join(', ')}. ${parts.length > 1 ? 'Add them up.' : ''}`.trim();
  }
  return 'The answer is outlined.';
}

const PRAISE = ['Right on time!', 'Tick-tock, top job!', 'You got it!', 'Perfect timing!', 'Super clock reading!', 'Spot on!'];
export const praise = (i: number) => PRAISE[i % PRAISE.length];

export const GROWNUPS: GrownupsContent = {
  game: 'Time Attack Clock',
  grades: '1–3',
  summary:
    'The town clock tower has stopped, and your child walks around the square helping the school, the bus stop and the bakery with their clocks. Each finished job fixes part of the tower. A 60-second Time Attack round with Mr. Tock is there for practice and a personal best.',
  teaches: [
    { title: 'School Bell: read a clock', text: 'Hours and half hours, then five-minute steps (with "quarter past" and "quarter to"), then to the minute.' },
    { title: 'Bus Stop: set a clock', text: 'Drag the hands to a time. The hour hand moves along with the minute hand, like a real clock, so the child sees why the hour hand is between numbers at 2:45.' },
    { title: 'Bakery: how long?', text: 'Elapsed time by counting on: whole hours, then minutes inside one hour, then across the hour (2:50 to 3:15 is 25 minutes, not 65).' },
    { title: 'Mistakes get a reason', text: 'The game looks for swapped hands, reading 2:45 as 3:45 (the hour hand is close to 3), reading the minute hand on 4 as 4 minutes, mixing up "past" and "to", and subtracting times like ordinary numbers. Each gets one sentence of explanation.' },
    { title: 'Help built in', text: 'Three hints for every question: a tip, then a picture helper (the hour shaded in yellow and the minutes counted by fives around the clock, or the count-on jumps), then the answer.' },
  ],
  standards: [
    { code: '1.MD.3', text: 'Tell and write time in hours and half-hours using analog and digital clocks.' },
    { code: '2.MD.7', text: 'Tell and write time to the nearest five minutes.' },
    { code: '3.MD.1', text: 'Tell and write time to the nearest minute, and solve elapsed time problems.' },
  ],
  talk: [
    'Ask what time it is on a clock with hands at home, especially at quarter to the hour.',
    'Before an activity, ask: if we leave at 3:40 and it takes 30 minutes, when do we get there?',
    'Point out that the hour hand is between two numbers most of the time, and ask which hour has passed.',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Only the Time Attack round has a timer. Every other question can take as long as your child needs.',
    'The clock hands can be moved with the arrow buttons or arrow keys as well as by dragging.',
  ],
  simplifies: ['The clocks are 12-hour clocks with no a.m. and p.m.', 'Elapsed time stays within a few hours.'],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
