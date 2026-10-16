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
    intro: [
      'Welcome to the Star Dome! I am Astronomer Lumi Reyes. I study the stars.',
      'Here is a secret: the Sun is a star too! It is the closest star to Earth.',
      'This dial turns the seasons. Turn it, and watch which star pictures are up at night.',
    ],
    again: 'More about the Sun and the stars. Shall we look up?',
    debrief: {
      text: 'The Sun looks so much bigger and brighter than the other stars. Why?',
      options: [
        { text: 'The Sun is much closer to us than the other stars.', correct: true, feedback: 'Yes! The Sun is a middle-sized star. It looks big and bright because it is close.' },
        { text: 'The Sun is the biggest star there is.', feedback: 'Many stars are much bigger than the Sun. They are just very far away.', misconception: 'sun-biggest' },
        { text: 'The other stars only shine a tiny bit.', feedback: 'Many stars shine far more than the Sun. Distance makes them look dim.', misconception: 'distance-bright' },
      ],
      hints: ['Remember the two lamps that were just the same.', 'The close lamp looked bigger and brighter. The far one looked small and dim.', 'The answer is outlined: the Sun is much closer.'],
    },
    done: 'You understand the stars like a real astronomer! The third lens of the big telescope is lit.',
  },
  launch: {
    id: 'launch',
    name: 'The Launch Bay',
    skill: 'Gravity and orbits',
    person: 'tess',
    grades: 'grades 2–5',
    intro: [
      'Hi! I am Engineer Tess Rocket. I launch probes into space.',
      'This is my cannon, on top of a mountain on a little planet. Gravity pulls everything toward the planet’s middle.',
      'Fire too slowly, and gravity pulls the probe back down. Fire fast enough, and it falls all the way around: an orbit! Try it first.',
    ],
    again: 'More about gravity and orbits. Ready to launch?',
    debrief: {
      text: 'A probe in orbit is always being pulled by gravity. Why doesn’t it fall back down?',
      options: [
        { text: 'It moves sideways so fast that it keeps falling around the planet.', correct: true, feedback: 'Yes! It is falling all the time, but the round ground curves away under it.' },
        { text: 'There is no gravity up in space.', feedback: 'Gravity is still pulling. Without it, the probe would fly off in a straight line.', misconception: 'no-gravity' },
        { text: 'Its engines push it up the whole time.', feedback: 'Probes go round for years with their engines off.', misconception: 'orbit-engine' },
      ],
      hints: ['Think about the cannon. What happened when the shot was fast enough?', 'The probe falls, but it goes sideways so fast that the ground curves away beneath it.', 'The answer is outlined: it keeps falling around the planet.'],
    },
    done: 'You can explain gravity and orbits like a launch engineer! The fourth lens of the big telescope is lit.',
  },
};

/** What Lumi and Tess say about their hands-on models. */
export const DIAL_TIP = 'Turn the dial to each season. The pink line shows which way our night side looks out into space.';
export const DIAL_DONE = 'You turned the dial all the way round! As Earth goes round the Sun, our night sky faces different stars.';
export const CANNON_TIP = 'Pick a speed and fire! Can you get the probe into orbit, so it goes all the way round?';
export const CANNON_LINES = {
  land: 'Too slow! Gravity pulled the probe back down to the ground.',
  orbit: 'An orbit! The probe is falling all the time, but it keeps missing the ground.',
  escape: 'Whoa, too fast! Gravity could not bring it round, so it flew off into space.',
} as const;
export const CANNON_DONE = 'You found an orbit! Now let’s see what you know about gravity.';

export const OPENING: string[] = [
  'Welcome to the observatory! I am Navigator Sol, Keeper of the Star Map.',
  'From up here we study the Sun, the planets and the stars. Each of these models shows how space works.',
  'This is Vee, our probe. Vee will fly with you wherever you go.',
];
export const VEE_HELLO = 'Beep boop! Hello! I can fly to the planets and take postcards. Let’s explore!';
export const OPENING_END = 'Finish a station and one lens of the big telescope lights up. Light all four, and we can send Vee on the Grand Tour! Start with any of us.';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. Press P to open the star map.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the arrows. Tap Talk to talk. The Star map button sends you to the planets.';
export const MAP_TIP = 'This is the star map. The planets are in order from the Sun. The gaps are squeezed to fit, but look: they still get bigger farther out! Pick a planet to visit.';


export const PRAISE = ['Stellar!', 'Out of this world!', 'Super!', 'Great thinking!', 'You got it!', 'Brilliant!'];
export function praise(n: number): string {
  return PRAISE[n % PRAISE.length];
}

export const ALL_DONE = 'All four lenses are lit! The big telescope is ready. That means Vee is ready for the Grand Tour: a trip past every planet, all the way to the edge of the solar system.';

// ------------------------------------------------------------------ the Grand Tour (the finale)

export const START_TOUR = 'Start the Grand Tour';
export const TOUR_INTRO = [
  'The Grand Tour! Vee will fly past every planet, from the Sun out to Neptune, and take a photo of each one.',
  'First we plot the route. Tap the planets in order, starting with the one closest to the Sun.',
];
export const ROUTE_TIP = 'Tap the planets in order, starting next to the Sun.';
export const ROUTE_DONE = 'The route is set: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Launch!';
export const SNAP_TIP_KEYS = 'When a planet is in the middle, press Space or click to take its photo.';
export const SNAP_TIP_TOUCH = 'When a planet is in the middle, tap to take its photo.';
/** Vee's line as each planet goes by. */
export const FLYBY: Record<PlanetId, string> = {
  mercury: 'Mercury, the smallest planet, baked by the Sun. Say cheese!',
  venus: 'Venus, wrapped in thick clouds. The hottest planet!',
  earth: 'Home! The only planet we know with life on it.',
  mars: 'Mars, the red planet. I can see its rusty dust!',
  jupiter: 'Jupiter, the biggest planet. Look at the Great Red Spot!',
  saturn: 'Saturn and its rings of ice and rock. So shiny!',
  uranus: 'Uranus, spinning on its side. Brrr, it is cold out here.',
  neptune: 'Neptune, the farthest planet, with the fastest winds.',
};
/** After these photos, a question from one station (so all four come up on the way). */
export const TOUR_QUESTIONS: Partial<Record<PlanetId, Station>> = { venus: 'orrery', mars: 'sunrise', saturn: 'dome', neptune: 'launch' };
export const TOUR_QUESTION_LINE: Record<Station, string> = {
  orrery: 'Navigator Sol is on the radio with a question!',
  sunrise: 'Dr. Kofi is on the radio with a question!',
  dome: 'Astronomer Lumi is on the radio with a question!',
  launch: 'Engineer Tess is on the radio with a question!',
};
export const PALE_DOT = [
  'We made it past Neptune! Now I will turn round and take one last photo: home.',
  'See that tiny blue dot in the sunbeam? That is Earth. Everyone you know is on that dot.',
];
export const PALE_DOT_FACT = 'In 1990, the real Voyager 1 probe was far past Neptune. It turned round and took a photo of Earth. Earth was a tiny dot, less than one pixel. People call it the Pale Blue Dot.';
export const PARTY_LINES: Array<[PersonId, string]> = [
  ['sol', 'Welcome home, explorer! Tonight the dome is open for a star party. Let’s look at your photos.'],
  ['kofi', 'There is Earth, spinning away. Half of it in daylight, half of it in night.'],
  ['lumi', 'And look up: thousands of stars, and every one of them a sun, far, far away.'],
  ['tess', 'Vee flew all that way because we launched it fast enough. Gravity did the steering!'],
  ['sol', 'You have explored the whole solar system. You are a true Solar System Explorer!'],
];
export const PARTY_END = 'Visit the planets, play with the models, or go on the Grand Tour again any time.';

/** The bonus postcards: the Sun (the Star Dome), the Moon (the Launch Bay) and Pluto (the Grand Tour). */
export type Bonus = 'sun' | 'moon' | 'pluto';
export const BONUS_ORDER: Bonus[] = ['sun', 'moon', 'pluto'];
export const BONUS: Record<Bonus, { name: string; text: string; how: string }> = {
  sun: { name: 'The Sun', text: 'Greetings from the Sun, our closest star! It is so big that more than a million Earths could fit inside.', how: 'Finish the Star Dome' },
  moon: { name: 'The Moon', text: 'Greetings from the Moon! Earth’s gravity keeps it going round us, about once a month.', how: 'Finish the Launch Bay' },
  pluto: { name: 'Pluto', text: 'Greetings from Pluto, a dwarf planet out past Neptune. It has a big, bright heart-shaped plain.', how: 'Finish the Grand Tour' },
};

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
    'Your child explores an observatory on a space station. Each of its four stations is a hands-on model: an orrery (a moving model of the solar system), a globe lit by a lamp, a star dome with a season dial, and a launch cannon on a little planet that fires with real gravity. Between stations they fly with Vee, a little probe, to visit all eight planets: driving a rover on the rocky planets and diving into the clouds of the giants, where there is no ground to land on. With all four stations done, Vee flies the Grand Tour past every planet, turns round to photograph Earth as a tiny dot (like the real Voyager 1 photo), and the crew holds a star party.',
  teaches: [
    { title: 'The planets (the Orrery)', text: 'The order of the eight planets, the small rocky planets and the giants, and what makes each planet special. At the top level: the patterns. Far planets have longer years and are colder; Venus is hotter than Mercury because its thick air traps heat; a giant planet has no ground; the gaps between planets grow farther out; Pluto is a dwarf planet.' },
    { title: 'Day, night and shadows (the Sunrise Lab)', text: 'The half of Earth facing the Sun has day. Earth spins once a day, so the Sun only seems to move across the sky, rising in the east and setting in the west. Shadows point away from the Sun. They are long in the morning and evening and shortest at midday.' },
    { title: 'The Sun and other stars (the Star Dome)', text: 'The Sun is a star, the closest one to Earth, so it looks much bigger and brighter than the others (two lamps that are just the same look different close up and far away). Stars are still there in the daytime; the bright sky hides them. The Moon and the planets shine with reflected sunlight. At the top level: star pictures such as Orion and Scorpius come and go with the seasons, because Earth goes round the Sun and our night side faces different stars.' },
    { title: 'Gravity and orbits (the Launch Bay)', text: 'Gravity pulls things toward the middle of Earth, so "down" points to the middle everywhere on Earth and nobody falls off the bottom. One trip round the Sun is a year, and farther planets have longer years. At the top level: a probe fired sideways fast enough falls around the planet (an orbit); astronauts float because they are falling round Earth with the space station, not because there is no gravity; the seasons come from Earth’s tilt, not its distance from the Sun.' },
    { title: 'Planet stops', text: 'Each planet visit has a sample to pick up, a fact card (distance, one spin, one year, moons) and a question, and earns a postcard for the album.' },
    { title: 'Mistakes and hints', text: 'Every wrong answer gets one sentence about the likely mistake (for example "the closest planet must be the hottest" or "the Sun goes round Earth"). Hints go from a nudge, to a picture, to the answer outlined. Hints never cost progress; a star is for getting it right the first time.' },
  ],
  standards: [
    { code: 'NGSS 1-ESS1-1', text: 'Use observations of the Sun, Moon and stars to describe patterns that can be predicted (sunrise and sunset).' },
    { code: 'NGSS 5-ESS1-1', text: 'The Sun appears brighter than other stars because it is closer (the Star Dome), with the planets as a stretch.' },
    { code: 'NGSS 5-ESS1-2', text: 'Patterns of daily changes in the length and direction of shadows, day and night, and the seasonal appearance of some stars in the night sky.' },
    { code: 'NGSS 5-PS2-1', text: 'The gravitational force of Earth on objects is directed down, toward the middle of Earth (the Launch Bay).' },
    { code: 'NGSS MS-ESS1-1 (preview)', text: 'The seasons are caused by Earth’s tilt; gravity keeps the Moon and the planets in their orbits.' },
    { code: 'NGSS MS-ESS1-3 (preview)', text: 'Scale properties of objects in the solar system: the planets are far apart, and the gaps grow.' },
  ],
  talk: [
    'Can you name the planets in order? Try a silly sentence to remember them.',
    'Go outside in the morning and at midday. Where is your shadow, and how long is it?',
    'Why does the Sun seem to move across the sky? (Earth spins!)',
    'On a clear night, look for Orion in winter or Scorpius in summer. Why do they change with the seasons?',
    'Drop a ball. Which way does it fall for a child on the other side of the world? (Toward the middle of Earth!)',
  ],
  help: [
    'Levels go up after two right answers in a row, and down after two misses, so the questions fit your child.',
    'Nothing is timed. Every question can be read aloud, and hints never cost progress.',
    'A station is finished after five stars and a talk-it-through question. Postcards from the planets are just for fun and curiosity.',
    'The Grand Tour opens when all four stations are done. It asks one question from each station on the way, and it can be flown again any time.',
  ],
  simplifies: [
    'The planets are not drawn to scale. Real sizes and distances are far too big to fit on a screen; the game says so, and the star map squeezes the gaps but keeps them growing.',
    'The sky scenes face south, as seen from the northern half of Earth, so the Sun rises on the left (east) and sets on the right (west).',
    'Moon counts change as scientists find more, so the fact cards say "dozens" or "hundreds" for the giants.',
    'People could not survive on most planets. The rover and probe are robots, like the real ones that visit planets.',
    'The launch cannon is Isaac Newton’s famous thought experiment, worked out with real gravity on a little made-up planet. Real rockets climb above the air before they speed up sideways.',
    'The season dial shows the evening sky from the northern half of Earth. In the southern half, the seasons are the other way round.',
  ],
  credits: [
    'Learning design based on the original Solar System Explorer and Planet Explorer Quest games, rebuilt by Learning Adventures.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Planet, star and gravity facts checked against NASA Science (Solar System Exploration, the planetary fact sheets and the Voyager mission), NASA Space Place (including "What causes the seasons?") and the International Astronomical Union (Pluto as a dwarf planet).',
  ],
};
