import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { FindKind } from './dive';
import { FACTS, type PlanetId, type Station } from './problems';

/**
 * Everything Solar System Explorer says: the observatory crew, Vee, the
 * opening, the station intros and debriefs, the planet stops and the
 * grown-ups page. The owner's wording rule holds everywhere: short
 * sentences, the facts first, then one plain question, in words that match
 * the picture and no game jargon. Read-aloud is on.
 */

export const STARS_PER_STATION = 5;

export type PersonId = 'sol' | 'kofi' | 'lumi' | 'tess';
export const PERSON_OF: Record<Station, PersonId> = { orrery: 'sol', sunrise: 'kofi', dome: 'lumi', launch: 'tess' };
export const STATION_OF: Record<PersonId, Station> = { sol: 'orrery', kofi: 'sunrise', lumi: 'dome', tess: 'launch' };

export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  sol: { name: 'Navigator Sol', role: 'Keeper of the Star Map' },
  kofi: { name: 'Dr. Kofi Mensah', role: 'Earth scientist, the Sunrise Lab' },
  lumi: { name: 'Astronomer Lumi Reyes', role: 'The Star Dome' },
  tess: { name: 'Engineer Tess Rocket', role: 'The Launch Bay' },
};
export const VEE = { name: 'Vee', role: 'The observatory’s probe' };

export interface StationInfo {
  id: Station;
  name: string;
  skill: string;
  person: PersonId;
  grades: string;
  intro: string[];
  again: string;
  debrief: TalkQuestion;
  done: string;
  /** Said by a helper whose station opens later. */
  soon?: string;
}

export const STATION_INFO: Record<Station, StationInfo> = {
  orrery: {
    id: 'orrery',
    name: 'The Orrery',
    skill: 'The planets',
    person: 'sol',
    grades: 'grades 2–5',
    intro: [
      'This is the orrery. It is a model of the solar system, with the Sun in the middle.',
      'Each planet goes round the Sun on its own ring. Help me put them in order and get to know them.',
      'I can also send you and Vee to visit a real planet. Open the star map any time!',
    ],
    again: 'More planets to place and get to know. Ready?',
    debrief: {
      text: 'Mercury is the closest planet to the Sun. So why is Venus hotter than Mercury?',
      options: [
        { text: 'Venus has thick air that traps the heat.', correct: true, feedback: 'Yes! The thick air works like a blanket. Venus is the hottest planet.' },
        { text: 'Venus is closer to the Sun.', feedback: 'Mercury is closer. Being close is not the whole story.', misconception: 'closest-hottest' },
        { text: 'Venus is the biggest planet.', feedback: 'Jupiter is the biggest. Venus is about the size of Earth.', misconception: 'size-mixup' },
      ],
      hints: ['What is different about the air on Venus and on Mercury?', 'Mercury has almost no air. Venus has thick, heavy air full of clouds.', 'The answer is outlined: the thick air traps the heat.'],
    },
    done: 'You know the planets like a navigator! The first lens of the big telescope is lit.',
  },
  sunrise: {
    id: 'sunrise',
    name: 'The Sunrise Lab',
    skill: 'Day, night and shadows',
    person: 'kofi',
    grades: 'grades 2–5',
    intro: [
      'Welcome to the Sunrise Lab! I am Dr. Kofi Mensah. I study how Earth moves.',
      'The lamp is the Sun. The globe is Earth. Turning the crank spins the globe, just like Earth spins every day.',
      'See the little flag? That is a town. Watch it go from day into night, and back again.',
    ],
    again: 'More about day, night and shadows. Shall we spin the globe?',
    debrief: {
      text: 'Every day the Sun seems to cross the sky. Why does it seem to move?',
      options: [
        { text: 'Earth spins, so the Sun seems to move.', correct: true, feedback: 'Yes! Earth spins, and the Sun stays put. It only looks like the Sun is moving.' },
        { text: 'The Sun goes round Earth every day.', feedback: 'It looks that way, but the globe and the lamp show what really happens.', misconception: 'sun-moves' },
        { text: 'The clouds push the Sun along.', feedback: 'Clouds are much closer than the Sun. They cannot move it.', misconception: 'sun-moves' },
      ],
      hints: ['In the lab, what turns: the lamp or the globe?', 'The lamp stays still. The globe spins, and the town moves from day into night.', 'The answer is outlined: Earth spins.'],
    },
    done: 'You can explain sunrise, sunset and shadows! The second lens of the big telescope is lit.',
  },
  dome: {
    id: 'dome',
    name: 'The Star Dome',
    skill: 'The Sun and other stars',
    person: 'lumi',
    grades: 'grades 2–5',
    intro: [],
    again: '',
    debrief: { text: '', options: [], hints: ['', '', ''] },
    done: '',
    soon: 'Hello! I am Astronomer Lumi Reyes. I am still setting up the stars in the Star Dome. Come back soon, and we will find out why the Sun looks so big!',
  },
  launch: {
    id: 'launch',
    name: 'The Launch Bay',
    skill: 'Gravity and orbits',
    person: 'tess',
    grades: 'grades 2–5',
    intro: [],
    again: '',
    debrief: { text: '', options: [], hints: ['', '', ''] },
    done: '',
    soon: 'Hi! I am Engineer Tess Rocket. My launch cannon is nearly ready. Come back soon, and we will find out what keeps a probe going round a planet!',
  },
};

export const OPENING: string[] = [
  'Welcome to the observatory! I am Navigator Sol, Keeper of the Star Map.',
  'From up here we study the Sun, the planets and the stars. Each of these models shows how space works.',
  'This is Vee, our probe. Vee will fly with you wherever you go.',
];
export const VEE_HELLO = 'Beep boop! Hello! I can fly to the planets and take postcards. Let’s explore!';
export const OPENING_END = 'Finish a station and one lens of the big telescope lights up. Start with me at the orrery, or with Dr. Kofi at the Sunrise Lab.';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. Press P to open the star map.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the arrows. Tap Talk to talk. The Star map button sends you to the planets.';
export const MAP_TIP = 'This is the star map. The planets are in order from the Sun. The gaps are squeezed to fit, but look: they still get bigger farther out! Pick a planet to visit.';


export const PRAISE = ['Stellar!', 'Out of this world!', 'Super!', 'Great thinking!', 'You got it!', 'Brilliant!'];
export function praise(n: number): string {
  return PRAISE[n % PRAISE.length];
}

export const BOTH_DONE = 'Two lenses lit! Lumi and Tess are still getting their stations ready. Until then, keep exploring the planets and collecting postcards.';

// ------------------------------------------------------------------ the planet stops

export const FIND_NAME: Record<FindKind, string> = { sample: 'the sample', fact: 'the fact card', question: 'the question' };

export function arrival(p: PlanetId): string {
  const f = FACTS[p];
  if (f.stop === 'dive')
    return `We are at ${f.name}! It is a giant ball of gas, with no ground to land on. So we dive into the clouds! Steer me to the three glowing finds.`;
  if (p === 'earth') return 'Home again! This is Earth. Drive the rover to the three glowing finds: a sample, a fact card and a question.';
  if (p === 'venus') return 'We landed on Venus! It is the hottest planet. People could never stand here, but robots have landed. Drive the rover to the three glowing finds.';
  if (p === 'mercury') return 'We landed on Mercury! No people could live here, but robots can visit. Drive the rover to the three glowing finds.';
  return `We landed on ${f.name}! Drive the rover to the three glowing finds: a sample, a fact card and a question.`;
}
export const DRIVE_TIP_KEYS = 'Drive with the arrow keys or WASD, or click where to go. Press Space at a find.';
export const DRIVE_TIP_TOUCH = 'Tap where to drive, or use the arrows. Tap at a find to pick it up.';
export const DIVE_TIP_KEYS = 'Steer me left and right with the arrow keys, or A and D. Or hold the mouse on the side to go to.';
export const DIVE_TIP_TOUCH = 'Hold your finger on the side you want me to go to.';
export function postcardLine(p: PlanetId, n: number): string {
  return `A postcard from ${FACTS[p].name}! That makes ${n} of 8. Back to the observatory!`;
}

// ------------------------------------------------------------------ the grown-ups page

export const GROWNUPS: GrownupsContent = {
  game: 'Solar System Explorer',
  grades: 'Grades 2–5',
  summary:
    'Your child explores an observatory on a space station. Each station is a hands-on model: an orrery (a moving model of the solar system) and a globe lit by a lamp, with a star dome and a launch bay coming soon. Between stations they fly with Vee, a little probe, to visit all eight planets: driving a rover on the rocky planets and diving into the clouds of the giants, where there is no ground to land on.',
  teaches: [
    { title: 'The planets (the Orrery)', text: 'The order of the eight planets, the small rocky planets and the giants, and what makes each planet special. At the top level: the patterns. Far planets have longer years and are colder; Venus is hotter than Mercury because its thick air traps heat; a giant planet has no ground; the gaps between planets grow farther out; Pluto is a dwarf planet.' },
    { title: 'Day, night and shadows (the Sunrise Lab)', text: 'The half of Earth facing the Sun has day. Earth spins once a day, so the Sun only seems to move across the sky, rising in the east and setting in the west. Shadows point away from the Sun. They are long in the morning and evening and shortest at midday.' },
    { title: 'Planet stops', text: 'Each planet visit has a sample to pick up, a fact card (distance, one spin, one year, moons) and a question, and earns a postcard for the album.' },
    { title: 'Mistakes and hints', text: 'Every wrong answer gets one sentence about the likely mistake (for example "the closest planet must be the hottest" or "the Sun goes round Earth"). Hints go from a nudge, to a picture, to the answer outlined. Hints never cost progress; a star is for getting it right the first time.' },
  ],
  standards: [
    { code: 'NGSS 1-ESS1-1', text: 'Use observations of the Sun, Moon and stars to describe patterns that can be predicted (sunrise and sunset).' },
    { code: 'NGSS 5-ESS1-1', text: 'The Sun appears brighter than other stars because it is closer (the Star Dome, coming soon), with the planets as a stretch.' },
    { code: 'NGSS 5-ESS1-2', text: 'Patterns of daily changes in the length and direction of shadows, and day and night.' },
    { code: 'NGSS MS-ESS1-3 (preview)', text: 'Scale properties of objects in the solar system: the planets are far apart, and the gaps grow.' },
  ],
  talk: ['Can you name the planets in order? Try a silly sentence to remember them.', 'Go outside in the morning and at midday. Where is your shadow, and how long is it?', 'Why does the Sun seem to move across the sky? (Earth spins!)'],
  help: [
    'Levels go up after two right answers in a row, and down after two misses, so the questions fit your child.',
    'Nothing is timed. Every question can be read aloud, and hints never cost progress.',
    'A station is finished after five stars and a talk-it-through question. Postcards from the planets are just for fun and curiosity.',
  ],
  simplifies: [
    'The planets are not drawn to scale. Real sizes and distances are far too big to fit on a screen; the game says so, and the star map squeezes the gaps but keeps them growing.',
    'The sky scenes face south, as seen from the northern half of Earth, so the Sun rises on the left (east) and sets on the right (west).',
    'Moon counts change as scientists find more, so the fact cards say "dozens" or "hundreds" for the giants.',
    'People could not survive on most planets. The rover and probe are robots, like the real ones that visit planets.',
  ],
  sources: [
    { name: 'NASA Science: Solar System Exploration', url: 'https://science.nasa.gov/solar-system/' },
    { name: 'NASA Space Place', url: 'https://spaceplace.nasa.gov/' },
    { name: 'NASA planetary fact sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
  credits: [
    'Learning design based on the original Solar System Explorer and Planet Explorer Quest games, rebuilt by Learning Adventures.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Planet facts checked against NASA Science and NASA Space Place.',
  ],
};
