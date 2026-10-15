/**
 * Solar System Explorer: the science, as data and pure functions (no drawing,
 * no timers) so every rule can be unit tested.
 *
 * The observatory on the Star Station has four stations (two open in half 1):
 *   The Orrery (Navigator Sol): the planets, their order, kinds and features
 *     1. name it and put it in order (grades 2-3)
 *     2. all eight in order, rocky planets and gas giants, the "why" questions (grade 4)
 *     3. patterns: farther out means longer years and colder, Venus is the
 *        hottest, no ground on a giant, the gaps grow, Pluto (grade 5, 5-ESS1-1 stretch)
 *   The Sunrise Lab (Dr. Kofi Mensah): day and night, and shadows
 *     1. the lit half has day; sunrise in the east, sunset in the west (1-ESS1-1)
 *     2. Earth spins once a day, so the Sun only seems to move; shadows point
 *        away from the Sun (5-ESS1-2)
 *     3. shadow length through the day; the far side of Earth (5-ESS1-2)
 *   The Star Dome and the Launch Bay open in half 2.
 *
 * Each planet stop also has three questions (one per level) and a fact card.
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the answer
 * away. Facts are checked against NASA Science (planet fact sheets and
 * Solar System Exploration) and NASA Space Place.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

import type { PlanetId, SkyBody } from '../../kit/worlds/star-station/space-art';
export { PLANET_ORDER, type PlanetId } from '../../kit/worlds/star-station/space-art';

export type Station = 'orrery' | 'sunrise' | 'dome' | 'launch';
export const STATIONS: Station[] = ['orrery', 'sunrise', 'dome', 'launch'];
/** The stations open in half 1. */
export const OPEN_STATIONS: Station[] = ['orrery', 'sunrise'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'order-swap' // mixed up the order of the planets
  | 'look-alike' // mixed up two planets that look a bit alike
  | 'moon-planet' // thinks the Moon (or another moon) is a planet
  | 'sun-planet' // thinks the Sun is a planet
  | 'pluto-planet' // thinks Pluto is still the ninth planet
  | 'rocky-giant' // mixed up the small rocky planets and the giants
  | 'solid-giant' // thinks a giant planet has solid ground
  | 'wrong-feature' // gave a planet a feature it does not have
  | 'size-mixup' // mixed up how big things are
  | 'closest-hottest' // thinks the closest planet must be the hottest
  | 'far-faster' // thinks far planets go round faster or have shorter years
  | 'path-speed' // thinks a short path is what makes Mercury fast
  | 'size-speed' // thinks size decides how fast a planet goes round
  | 'even-spacing' // thinks the planets are evenly spaced
  | 'far-hot' // thinks far planets are warm
  | 'spin-orbit' // mixed up one spin (a day) and one trip round the Sun (a year)
  | 'years-multiply' // worked out ages on another planet the wrong way round
  | 'air-sky' // does not link a blue sky to air
  | 'sun-closer' // thinks the Sun gets closer or farther during a day
  | 'sun-moves' // thinks the Sun goes round Earth each day
  | 'sun-off' // thinks the Sun goes out at night
  | 'moon-blocks' // thinks night comes from the Moon covering the Sun
  | 'day-everywhere' // thinks it is day all over Earth at once
  | 'day-dark' // mixed up the lit side and the dark side
  | 'town-only' // thinks the Sun lights only one town or country
  | 'east-west' // mixed up east and west for sunrise and sunset
  | 'rise-set' // mixed up sunrise and sunset
  | 'shadow-toward' // thinks a shadow points toward the light
  | 'shadow-length' // mixed up when shadows are long or short
  | 'same-shadow' // thinks a shadow stays the same all day
  | 'no-shadow' // thinks there is no shadow in some sunlight
  | 'pole-changes' // thinks the object itself changes
  | 'air-cools' // thinks thick air keeps a planet cool
  | 'new-planet' // thinks a planet appeared when it was first seen
  | 'hollow-planet'; // thinks a giant planet is hollow

/** What the panel shows above the question (words in the question match it). */
export type Pic =
  | { k: 'orrery'; placed: number; glow?: number }
  | { k: 'planet'; body: SkyBody }
  | { k: 'globe'; spin: number }
  | { k: 'sky'; sun: 'morning' | 'noon' | 'evening'; shadow: boolean };

/** The picture model that hint 2 adds. */
export type Model = 'order' | 'kinds' | 'daynight' | 'rays' | 'shadow-day' | 'card';

export interface Choice {
  value: string;
  label: string;
  correct: boolean;
  misconception?: Misconception;
  /** One sentence about this wrong answer (never gives the right one away). */
  why?: string;
}

export interface Question {
  id: string;
  /** A station, or 'stop' for a planet stop's question. */
  station: Station | 'stop';
  planet?: PlanetId;
  tier: Tier;
  ask: string;
  choices: Choice[];
  /** Shown with the answer (after a right answer, and at hint 3). */
  explain: string;
  /** Hint 1 (a nudge) and hint 2 (a worked clue with a picture model); hint 3 outlines the answer. */
  hints: [string, string];
  pic: Pic;
  model: Model;
  /** For the order picture at hint 2: the planet asked about (0-7), whose name is hidden; 8 shows every name. */
  focus: number;
}

export interface QDef {
  id: string;
  tier: Tier;
  ask: string;
  right: string;
  wrong: Array<[string, Misconception, string]>;
  explain: string;
  hints: [string, string];
  pic: Pic;
  model: Model;
  focus?: number;
}

const planet = (body: SkyBody): Pic => ({ k: 'planet', body });
const orrery = (placed: number, glow?: number): Pic => ({ k: 'orrery', placed, glow });

// ------------------------------------------------------------------ The Orrery (Navigator Sol)

const ORRERY: QDef[] = [
  // level 1: name it, and put the first ones in order
  {
    id: 'orrery-closest',
    tier: 1,
    ask: 'The Sun is in the middle. The glowing ring is the one closest to the Sun. Which planet goes on it?',
    right: 'Mercury',
    wrong: [
      ['Venus', 'order-swap', 'Venus is the second planet. One planet is even closer to the Sun.'],
      ['Earth', 'order-swap', 'Earth is our home, but it is the third planet from the Sun.'],
    ],
    explain: 'Mercury is the closest planet to the Sun. It is also the smallest planet.',
    hints: ['Start at the Sun and count out. Which planet comes first?', 'The order starts like this: first, then Venus, then Earth.'],
    pic: orrery(0, 0),
    model: 'order',
  },
  {
    id: 'orrery-second',
    tier: 1,
    ask: 'Mercury is on the first ring. The second ring is glowing. Which planet goes on it?',
    right: 'Venus',
    wrong: [
      ['Earth', 'order-swap', 'Earth comes next after this one. It is the third planet.'],
      ['Mars', 'order-swap', 'Mars is farther out. It is the fourth planet.'],
    ],
    explain: 'Venus is the second planet from the Sun, between Mercury and Earth.',
    hints: ['Which planet sits between Mercury and our home, Earth?', 'The order starts: Mercury, then the second one, then Earth, then Mars.'],
    pic: orrery(1, 1),
    model: 'order',
  },
  {
    id: 'orrery-third',
    tier: 1,
    ask: 'Mercury and Venus are on their rings. The third ring is our home planet. Which planet is it?',
    right: 'Earth',
    wrong: [
      ['Mars', 'order-swap', 'Mars is the fourth planet. It comes after our home.'],
      ['The Moon', 'moon-planet', 'The Moon is not a planet. It goes round our home planet.'],
    ],
    explain: 'Earth is the third planet from the Sun. It is the planet we live on.',
    hints: ['Which planet do we live on?', 'Our home is the third planet out from the Sun.'],
    pic: orrery(2, 2),
    model: 'order',
  },
  {
    id: 'orrery-fourth',
    tier: 1,
    ask: 'Mercury, Venus and Earth are on their rings. The glowing ring comes next. Which planet goes there?',
    right: 'Mars',
    wrong: [
      ['Jupiter', 'order-swap', 'Jupiter is farther out. One more small, rocky planet comes first.'],
      ['Venus', 'order-swap', 'Venus is already on its ring, between Mercury and Earth.'],
    ],
    explain: 'Mars is the fourth planet. It is the last of the four small, rocky planets.',
    hints: ['Which small, red planet comes right after Earth?', 'After Earth comes the Red Planet, and then the giants.'],
    pic: orrery(3, 3),
    model: 'order',
  },
  {
    id: 'orrery-red',
    tier: 1,
    ask: 'This planet looks red. Its dust has rust in it. Which planet is it?',
    right: 'Mars',
    wrong: [
      ['Jupiter', 'look-alike', 'Jupiter is a huge planet with stripes. This planet is small.'],
      ['Venus', 'look-alike', 'Venus is covered in thick yellow clouds, not red dust.'],
    ],
    explain: 'Mars is called the Red Planet. Its dust has rust in it, which makes it red.',
    hints: ['Which planet is called the Red Planet?', 'Look at the color. The Red Planet is the fourth planet from the Sun.'],
    pic: planet('mars'),
    model: 'card',
  },
  {
    id: 'orrery-rings',
    tier: 1,
    ask: 'This planet has big, bright rings. The rings are made of ice and rock. Which planet is it?',
    right: 'Saturn',
    wrong: [
      ['Jupiter', 'look-alike', 'Jupiter has rings too, but they are so faint you can hardly see them.'],
      ['Neptune', 'look-alike', 'Neptune’s rings are thin and dark. These rings are big and bright.'],
    ],
    explain: 'Saturn has the biggest, brightest rings of any planet.',
    hints: ['Which planet is famous for its rings?', 'It is the sixth planet, a giant with the brightest rings.'],
    pic: planet('saturn'),
    model: 'card',
  },
  {
    id: 'orrery-home',
    tier: 1,
    ask: 'This planet has blue oceans, land and white clouds. People live here. Which planet is it?',
    right: 'Earth',
    wrong: [
      ['Neptune', 'look-alike', 'Neptune is blue too, but it is a giant ball of gas with no land.'],
      ['The Moon', 'moon-planet', 'The Moon is grey and has no oceans. It is not a planet.'],
    ],
    explain: 'Earth is the only planet we know with oceans of liquid water and living things.',
    hints: ['Where do you live?', 'Our home planet has oceans, land and clouds. It is third from the Sun.'],
    pic: planet('earth'),
    model: 'card',
  },
  {
    id: 'orrery-sun',
    tier: 1,
    ask: 'Everything on the orrery goes round this. It sits in the middle. It is very hot and bright. What is it?',
    right: 'The Sun, our star',
    wrong: [
      ['A big planet', 'sun-planet', 'It is not a planet. All the planets go round it.'],
      ['The Moon', 'moon-planet', 'The Moon goes round Earth. It does not sit in the middle.'],
    ],
    explain: 'The Sun is a star. All eight planets go round it.',
    hints: ['What gives us daylight?', 'It is a star, the closest one to us. The planets go round it.'],
    pic: planet('sun'),
    model: 'card',
  },
  {
    id: 'orrery-biggest',
    tier: 1,
    ask: 'This is the biggest planet. It has stripes and a giant storm called the Great Red Spot. Which planet is it?',
    right: 'Jupiter',
    wrong: [
      ['Saturn', 'look-alike', 'Saturn is a giant too, but it has big, bright rings.'],
      ['Earth', 'size-mixup', 'Earth is a small, rocky planet. It has oceans, not stripes.'],
    ],
    explain: 'Jupiter is the biggest planet. The Great Red Spot is a storm bigger than Earth.',
    hints: ['Which planet is the biggest of all?', 'It is the fifth planet, the first of the giants.'],
    pic: planet('jupiter'),
    model: 'card',
  },

  // level 2: all eight in order, rocky and giant, and why
  {
    id: 'orrery-fifth',
    tier: 2,
    ask: 'The four small, rocky planets are on their rings. The next ring is much farther out. Which planet goes there?',
    right: 'Jupiter',
    wrong: [
      ['Saturn', 'order-swap', 'Saturn is the sixth planet. One giant comes before it.'],
      ['Pluto', 'pluto-planet', 'Pluto is a dwarf planet, far out beyond Neptune.'],
    ],
    explain: 'Jupiter is the fifth planet. It is the first of the four giant planets.',
    hints: ['Which giant planet is closest to the Sun?', 'After the four rocky planets come the giants. The biggest one is first.'],
    pic: orrery(4, 4),
    model: 'order',
  },
  {
    id: 'orrery-seventh',
    tier: 2,
    ask: 'Saturn is on its ring. Two giant planets are still missing. Which one goes on the next ring?',
    right: 'Uranus',
    wrong: [
      ['Neptune', 'order-swap', 'Neptune is the farthest planet. It goes on the last ring.'],
      ['Pluto', 'pluto-planet', 'Pluto is a dwarf planet, not one of the eight planets.'],
    ],
    explain: 'Uranus is the seventh planet. Then comes Neptune, the last one.',
    hints: ['Two giants are left. Which one is not the farthest?', 'The last two planets are the pale blue-green one, then the deep blue one.'],
    pic: orrery(6, 6),
    model: 'order',
  },
  {
    id: 'orrery-eighth',
    tier: 2,
    ask: 'Seven planets are on their rings. The last ring is the farthest from the Sun. Which planet goes there?',
    right: 'Neptune',
    wrong: [
      ['Pluto', 'pluto-planet', 'Pluto is a dwarf planet now, not one of the eight planets.'],
      ['Uranus', 'order-swap', 'Uranus is already on its ring. It is the seventh planet.'],
    ],
    explain: 'Neptune is the eighth planet, the farthest from the Sun.',
    hints: ['Which deep blue giant is the farthest planet?', 'There are eight planets. The eighth one is a deep blue giant.'],
    pic: orrery(7, 7),
    model: 'order',
  },
  {
    id: 'orrery-gas-giant',
    tier: 2,
    ask: 'Some planets are small and rocky. Others are giant balls of gas. Which of these is a gas giant?',
    right: 'Saturn',
    wrong: [
      ['Mars', 'rocky-giant', 'Mars is small and rocky. It has solid ground.'],
      ['Venus', 'rocky-giant', 'Venus is small and rocky, under its thick clouds.'],
    ],
    explain: 'Jupiter, Saturn, Uranus and Neptune are the giants. Mercury, Venus, Earth and Mars are rocky.',
    hints: ['The giants are the four planets farthest from the Sun. Which one is here?', 'The four inner planets are rocky. The four outer planets are giants.'],
    pic: orrery(8),
    model: 'kinds',
  },
  {
    id: 'orrery-rocky',
    tier: 2,
    ask: 'The four planets closest to the Sun are small and rocky. Which of these is a rocky planet?',
    right: 'Mercury',
    wrong: [
      ['Jupiter', 'rocky-giant', 'Jupiter is a giant ball of gas, not a rocky planet.'],
      ['Uranus', 'rocky-giant', 'Uranus is a giant made mostly of gas and ice.'],
    ],
    explain: 'Mercury, Venus, Earth and Mars are the rocky planets. You could stand on them.',
    hints: ['Which of these planets is close to the Sun?', 'The rocky planets are the first four from the Sun.'],
    pic: orrery(8),
    model: 'kinds',
  },
  {
    id: 'orrery-why-red',
    tier: 2,
    ask: 'Mars is called the Red Planet. Why does Mars look red?',
    right: 'Its dust has rust in it.',
    wrong: [
      ['It is very hot.', 'wrong-feature', 'Red does not mean hot here. Mars is colder than Earth.'],
      ['Red plants grow there.', 'wrong-feature', 'No plants have ever been found on Mars.'],
    ],
    explain: 'Mars has lots of iron in its rocks and dust. The iron has rusted, so Mars looks red.',
    hints: ['What happens to an old iron bike left out in the rain?', 'Iron turns reddish-brown when it rusts. Mars has lots of iron.'],
    pic: planet('mars'),
    model: 'card',
  },
  {
    id: 'orrery-red-spot',
    tier: 2,
    ask: 'Jupiter has a giant red spot. The spot is bigger than Earth. What is the Great Red Spot?',
    right: 'A giant storm',
    wrong: [
      ['A volcano', 'solid-giant', 'Jupiter has no solid ground for a volcano to stand on.'],
      ['A moon', 'moon-planet', 'Jupiter’s moons go round it. The spot is on Jupiter itself.'],
    ],
    explain: 'The Great Red Spot is a giant storm. People have watched it for more than 150 years.',
    hints: ['Jupiter is made of clouds and wind. What do strong winds make?', 'It is a huge swirl of wind and clouds, like a hurricane.'],
    pic: planet('jupiter'),
    model: 'card',
  },
  {
    id: 'orrery-uranus',
    tier: 2,
    ask: 'Uranus is tipped right over. Its rings stand up and down. What is special about how Uranus spins?',
    right: 'It spins on its side.',
    wrong: [
      ['It does not spin.', 'wrong-feature', 'Uranus does spin. One spin takes about 17 hours.'],
      ['It spins faster than any planet.', 'wrong-feature', 'Jupiter spins the fastest. Uranus is special in another way.'],
    ],
    explain: 'Uranus is tipped over, so it rolls round the Sun on its side.',
    hints: ['Look at the picture. Which way do its rings point?', 'Most planets spin standing up. Uranus is lying down.'],
    pic: planet('uranus'),
    model: 'card',
  },
  {
    id: 'orrery-life',
    tier: 2,
    ask: 'Earth is the only planet known to have life. What does Earth have that living things need?',
    right: 'Liquid water',
    wrong: [
      ['Bright rings', 'wrong-feature', 'Rings do not help living things. Earth has no rings.'],
      ['No air at all', 'wrong-feature', 'Living things need air. Earth’s air has oxygen in it.'],
    ],
    explain: 'Earth has oceans, lakes and rivers of liquid water, and air to breathe.',
    hints: ['What do plants and animals need to drink?', 'Earth has oceans. No other planet we know has oceans on top.'],
    pic: planet('earth'),
    model: 'card',
  },
  {
    id: 'orrery-saturn-rings',
    tier: 2,
    ask: 'Saturn’s rings look solid from far away. What are Saturn’s rings made of?',
    right: 'Billions of pieces of ice and rock',
    wrong: [
      ['Clouds of gas', 'wrong-feature', 'The gas clouds are on Saturn itself, not in its rings.'],
      ['One solid sheet of metal', 'wrong-feature', 'The rings are not one solid sheet. They are made of many pieces.'],
    ],
    explain: 'Saturn’s rings are billions of chunks of ice and rock. Some are tiny, some as big as a house.',
    hints: ['Are the rings one big thing, or lots of little things?', 'The rings shine because ice reflects sunlight. Rock is mixed in too.'],
    pic: planet('saturn'),
    model: 'card',
  },

  // level 3: patterns
  {
    id: 'orrery-venus-hot',
    tier: 3,
    ask: 'Mercury is the closest planet to the Sun. But Venus is the hottest planet. Why is Venus hotter?',
    right: 'Its thick air traps the heat.',
    wrong: [
      ['Venus is closer to the Sun.', 'closest-hottest', 'Mercury is closer. Being close is not the whole story.'],
      ['Venus is covered in lava.', 'wrong-feature', 'Venus has volcanoes, but it is not covered in lava.'],
    ],
    explain: 'Venus has thick air full of clouds. It traps heat like a blanket, so Venus is the hottest planet.',
    hints: ['What is different about the air on Venus?', 'Mercury has almost no air. Venus has very thick air, like a heavy blanket.'],
    pic: planet('venus'),
    model: 'card',
  },
  {
    id: 'orrery-years',
    tier: 3,
    ask: 'Watch the orrery run. Mercury zooms round. Neptune hardly moves. What kind of years do far planets have?',
    right: 'Longer years',
    wrong: [
      ['Shorter years', 'far-faster', 'Far planets travel slowly, on a much bigger path.'],
      ['The same years as Earth', 'far-faster', 'Each planet has its own year. Watch how long each one takes.'],
    ],
    explain: 'A year is one trip round the Sun. Far planets have a longer way to go, and they move slower.',
    hints: ['Which planet takes the longest to go all the way round?', 'Neptune takes 165 Earth years to go round once. Mercury takes 88 days.'],
    pic: orrery(8),
    model: 'order',
  },
  {
    id: 'orrery-fastest',
    tier: 3,
    ask: 'Mercury moves faster than any other planet. Why does Mercury move fastest?',
    right: 'The Sun’s pull is strongest close in.',
    wrong: [
      ['It is the smallest planet.', 'size-speed', 'Size is not the reason. Small Pluto moves very slowly.'],
      ['It has the shortest path.', 'path-speed', 'A short path gives Mercury a short year. It does not make it move faster.'],
    ],
    explain: 'The Sun pulls hardest on planets close to it. Mercury is closest, so it has to move fastest to stay in orbit.',
    hints: ['What holds the planets on their paths round the Sun?', 'The Sun’s gravity pulls on every planet. It is stronger close to the Sun.'],
    pic: orrery(8),
    model: 'order',
  },
  {
    id: 'orrery-no-land',
    tier: 3,
    ask: 'Jupiter is a gas giant. Its clouds get thicker and thicker deep down. Why can’t a probe land on Jupiter?',
    right: 'There is no solid ground to land on.',
    wrong: [
      ['It is too far away.', 'solid-giant', 'Probes have flown all the way to Jupiter. Distance is not the problem.'],
      ['Its rings are in the way.', 'wrong-feature', 'Jupiter’s rings are very faint. They do not stop a probe.'],
    ],
    explain: 'Jupiter is a giant ball of gas. Deeper down it gets thicker and hotter, but there is no ground.',
    hints: ['What would the probe stand on?', 'Rocky planets have ground. Gas giants are gas almost all the way down.'],
    pic: planet('jupiter'),
    model: 'kinds',
  },
  {
    id: 'orrery-gaps',
    tier: 3,
    ask: 'Look at the rings on the orrery. The rocky planets are close together. What happens to the gaps farther out?',
    right: 'They get much bigger.',
    wrong: [
      ['They stay the same.', 'even-spacing', 'Look again at the outer rings. Compare them with the inner ones.'],
      ['They get smaller.', 'even-spacing', 'Look again: the outer rings are not crowded together.'],
    ],
    explain: 'The giant planets are much farther apart. Neptune is 30 times farther from the Sun than Earth.',
    hints: ['Compare the gap between Earth and Mars with the gap between Uranus and Neptune.', 'Earth to Mars is a short hop. Uranus to Neptune is a very long trip.'],
    pic: orrery(8),
    model: 'order',
  },
  {
    id: 'orrery-pluto',
    tier: 3,
    ask: 'Pluto goes round the Sun far beyond Neptune. It is smaller than our Moon. What is Pluto called now?',
    right: 'A dwarf planet',
    wrong: [
      ['The ninth planet', 'pluto-planet', 'Pluto used to be called that. Since 2006 scientists have called it something else.'],
      ['A moon of Neptune', 'moon-planet', 'Pluto goes round the Sun, not round Neptune.'],
    ],
    explain: 'In 2006 scientists decided Pluto is a dwarf planet. There are eight planets.',
    hints: ['How many planets are there now?', 'Pluto is too small to clear its path of other icy objects. It got a new name for that.'],
    pic: planet('pluto'),
    model: 'order',
  },
  {
    id: 'orrery-cold',
    tier: 3,
    ask: 'Neptune is the farthest planet from the Sun. Very little sunlight reaches it. What is Neptune like?',
    right: 'Very cold',
    wrong: [
      ['Very hot, like Venus', 'far-hot', 'Sunlight warms planets. Neptune gets very little of it.'],
      ['Warm, like Earth', 'far-hot', 'Earth is much closer to the Sun, so it gets far more warmth.'],
    ],
    explain: 'Neptune is so far away that it is freezing cold, about 200 degrees Celsius below zero.',
    hints: ['What warms up a planet?', 'The farther a planet is from the Sun, the less sunlight warms it.'],
    pic: planet('neptune'),
    model: 'order',
  },
  {
    id: 'orrery-giants-far',
    tier: 3,
    ask: 'The four giants are all far from the Sun. The four rocky planets are close. Where are the rocky planets?',
    right: 'In the four rings nearest the Sun',
    wrong: [
      ['Mixed in between the giants', 'rocky-giant', 'Look at the orrery. The giants are not mixed in with the small ones.'],
      ['In the four rings farthest out', 'rocky-giant', 'The far rings hold the big planets. Look at their sizes.'],
    ],
    explain: 'The small, rocky planets are close to the Sun. The giants are far out.',
    hints: ['Look at the sizes on the orrery. Where are the small planets?', 'Mercury, Venus, Earth and Mars are small. Count which rings they sit on.'],
    pic: orrery(8),
    model: 'kinds',
  },
];

// ------------------------------------------------------------------ The Sunrise Lab (Dr. Kofi Mensah)

const SUNRISE: QDef[] = [
  // level 1
  {
    id: 'sunrise-day-side',
    tier: 1,
    ask: 'The lamp is the Sun. It lights up one half of the globe. Which half has day?',
    right: 'The half facing the Sun',
    wrong: [
      ['The half facing away', 'day-dark', 'The half facing away is in the dark. It has night.'],
      ['Both halves at once', 'day-everywhere', 'The lamp can only light the half that faces it.'],
    ],
    explain: 'The half of Earth facing the Sun has day. The other half has night.',
    hints: ['Which half of the globe is bright?', 'Daytime means the Sun is shining on you.'],
    pic: { k: 'globe', spin: 0 },
    model: 'daynight',
  },
  {
    id: 'sunrise-east',
    tier: 1,
    ask: 'It is early morning. The Sun is just coming up. Which way do we face to see the sunrise?',
    right: 'East',
    wrong: [
      ['West', 'east-west', 'The Sun goes down that way, in the evening.'],
      ['Straight up', 'rise-set', 'At sunrise the Sun is low, near the ground. It is not overhead.'],
    ],
    explain: 'The Sun rises in the east every morning and sets in the west every evening.',
    hints: ['Where does the Sun start its trip across the sky?', 'The Sun comes up on one side of the sky and goes down on the other side.'],
    pic: { k: 'sky', sun: 'morning', shadow: false },
    model: 'shadow-day',
  },
  {
    id: 'sunrise-west',
    tier: 1,
    ask: 'It is evening. The Sun is going down. In which direction does the Sun set?',
    right: 'West',
    wrong: [
      ['East', 'east-west', 'The Sun comes up that way, in the morning.'],
      ['Straight down, under our feet', 'rise-set', 'The Sun does not drop through the ground. It sinks low on one side of the sky.'],
    ],
    explain: 'The Sun sets in the west. It rose on the other side, in the east.',
    hints: ['The Sun comes up in the east. Where does it go down?', 'The Sun crosses the whole sky, from one side to the other side.'],
    pic: { k: 'sky', sun: 'evening', shadow: false },
    model: 'shadow-day',
  },
  {
    id: 'sunrise-dark-town',
    tier: 1,
    ask: 'The town on the globe is on the dark side now. It faces away from the lamp. What time is it in the town?',
    right: 'Night',
    wrong: [
      ['Midday', 'day-dark', 'At midday the town faces the Sun. Look where the town is.'],
      ['Morning', 'rise-set', 'Morning comes when the town turns back toward the Sun.'],
    ],
    explain: 'When your side of Earth faces away from the Sun, it is night.',
    hints: ['Is the town in the light or in the dark?', 'The dark side of the globe is facing away from the lamp.'],
    pic: { k: 'globe', spin: 0.76 },
    model: 'daynight',
  },
  {
    id: 'sunrise-everywhere',
    tier: 1,
    ask: 'It is daytime where you live. Is it daytime all over Earth right now?',
    right: 'No, the other side of Earth has night.',
    wrong: [
      ['Yes, it is day everywhere at once.', 'day-everywhere', 'The Sun lights only the half of Earth that faces it.'],
      ['No, only your town has day.', 'town-only', 'The Sun lights a whole half of Earth, not just one town.'],
    ],
    explain: 'At any moment, half of Earth has day and the other half has night.',
    hints: ['Look at the globe. How much of it is lit?', 'The lamp lights one half. The other half is dark.'],
    pic: { k: 'globe', spin: 0.05 },
    model: 'daynight',
  },
  {
    id: 'sunrise-shadow-away',
    tier: 1,
    ask: 'The Sun shines on a flagpole. The pole blocks some light and makes a shadow. Where is the shadow?',
    right: 'On the side away from the Sun',
    wrong: [
      ['On the side facing the Sun', 'shadow-toward', 'Light hits the pole on the Sun’s side. The dark part is behind.'],
      ['Up in the sky', 'no-shadow', 'Shadows fall on the ground, behind the thing that blocks the light.'],
    ],
    explain: 'A shadow is where light is blocked. It falls on the side away from the light.',
    hints: ['Where can the light not reach?', 'The pole stops the sunlight. Behind the pole, no light gets through.'],
    pic: { k: 'sky', sun: 'morning', shadow: false },
    model: 'rays',
  },

  // level 2
  {
    id: 'sunrise-spin',
    tier: 2,
    ask: 'Earth spins all the way round, again and again. One spin gives us one day and one night. How long does one spin take?',
    right: 'About 24 hours',
    wrong: [
      ['About one year', 'spin-orbit', 'A year is one trip round the Sun, not one spin.'],
      ['About one hour', 'spin-orbit', 'One spin brings a whole day and a whole night.'],
    ],
    explain: 'Earth spins once about every 24 hours. That gives us day and night.',
    hints: ['How long is one day and one night together?', 'From one sunrise to the next sunrise is one spin.'],
    pic: { k: 'globe', spin: 0.25 },
    model: 'daynight',
  },
  {
    id: 'sunrise-seems',
    tier: 2,
    ask: 'Every day the Sun seems to move across the sky. What is really moving?',
    right: 'Earth is spinning.',
    wrong: [
      ['The Sun goes round Earth each day.', 'sun-moves', 'It looks that way. Watch the globe and the lamp to check.'],
      ['The sky turns round Earth.', 'sun-moves', 'The sky does not turn. Something else is moving.'],
    ],
    explain: 'Earth spins, so the Sun seems to move across our sky. The Sun stays put.',
    hints: ['In the Sunrise Lab, what turns: the lamp or the globe?', 'When you spin round in a room, the room seems to move past you.'],
    pic: { k: 'globe', spin: 0.25 },
    model: 'daynight',
  },
  {
    id: 'sunrise-night-why',
    tier: 2,
    ask: 'Every evening our town has night. Why do we have night?',
    right: 'Our side of Earth turns away from the Sun.',
    wrong: [
      ['The Sun goes out at night.', 'sun-off', 'The Sun shines all the time. It never goes out.'],
      ['The Moon covers the Sun.', 'moon-blocks', 'The Moon rarely blocks the Sun. That is an eclipse, and it is short.'],
    ],
    explain: 'Earth spins. When our side faces away from the Sun, we have night.',
    hints: ['Look at the globe. What happens to the town as it turns?', 'The town turns into the dark half of the globe.'],
    pic: { k: 'globe', spin: 0.76 },
    model: 'daynight',
  },
  {
    id: 'sunrise-morning-shadow',
    tier: 2,
    ask: 'In the morning, the Sun is low in the east. Which way does the flagpole’s shadow point?',
    right: 'West',
    wrong: [
      ['East', 'shadow-toward', 'East is where the Sun is. A shadow points the other way.'],
      ['Nowhere, there is no shadow', 'no-shadow', 'Any sunlight on the pole makes a shadow behind it.'],
    ],
    explain: 'A shadow points away from the Sun. With the Sun in the east, the shadow points west.',
    hints: ['A shadow points away from the light. Where is the Sun?', 'The Sun is in the east. Away from the east is the opposite side.'],
    pic: { k: 'sky', sun: 'morning', shadow: false },
    model: 'rays',
  },
  {
    id: 'sunrise-evening-shadow',
    tier: 2,
    ask: 'In the evening, the Sun is low in the west. Which way does the flagpole’s shadow point?',
    right: 'East',
    wrong: [
      ['West', 'shadow-toward', 'West is where the Sun is. A shadow points the other way.'],
      ['Straight up', 'no-shadow', 'Shadows lie on the ground, behind the pole.'],
    ],
    explain: 'In the evening the Sun is in the west, so shadows point east.',
    hints: ['Where is the Sun in the evening?', 'The Sun sets in the west. The shadow points away from it.'],
    pic: { k: 'sky', sun: 'evening', shadow: false },
    model: 'rays',
  },
  {
    id: 'sunrise-turn-in',
    tier: 2,
    ask: 'The globe is turning. The town is just coming round from the dark side into the light. What does the town see?',
    right: 'A sunrise',
    wrong: [
      ['A sunset', 'rise-set', 'A sunset is when the town turns from the light into the dark.'],
      ['Midnight', 'day-dark', 'Midnight is deep in the dark side, not at its edge.'],
    ],
    explain: 'Sunrise happens as your side of Earth turns into the sunlight.',
    hints: ['Is the town going into the light or out of it?', 'Coming out of the dark into the light is the start of the day.'],
    pic: { k: 'globe', spin: 0.86 },
    model: 'daynight',
  },

  // level 3
  {
    id: 'sunrise-noon-short',
    tier: 3,
    ask: 'At midday the Sun is at its highest in the sky. What is the flagpole’s shadow like at midday?',
    right: 'At its shortest',
    wrong: [
      ['At its longest', 'shadow-length', 'A high Sun shines down from above. Think about how much shadow that leaves.'],
      ['The same as in the morning', 'same-shadow', 'Shadows change length as the Sun moves across the sky.'],
    ],
    explain: 'When the Sun is high, light comes from above and the shadow is short.',
    hints: ['Hold a pencil under a lamp. Where is the shadow when the lamp is right above it?', 'Light from high above leaves only a small dark patch near the pole.'],
    pic: { k: 'sky', sun: 'noon', shadow: false },
    model: 'rays',
  },
  {
    id: 'sunrise-morning-long',
    tier: 3,
    ask: 'Early in the morning, the Sun is low in the sky. What is the flagpole’s shadow like?',
    right: 'Long',
    wrong: [
      ['Short', 'shadow-length', 'A low Sun shines from the side. Think how far the dark part reaches.'],
      ['There is no shadow', 'no-shadow', 'Any sunlight on the pole makes a shadow behind it.'],
    ],
    explain: 'A low Sun shines from the side, so the shadow stretches out a long way.',
    hints: ['Is the Sun high or low in the morning?', 'Light from low down passes over the top of the pole and lands far behind it.'],
    pic: { k: 'sky', sun: 'morning', shadow: false },
    model: 'rays',
  },
  {
    id: 'sunrise-length-order',
    tier: 3,
    ask: 'A flagpole’s shadow is measured in the morning, at midday and in the evening. How does its length change?',
    right: 'Long, then short, then long again',
    wrong: [
      ['Short, then long, then short', 'shadow-length', 'Think about when the Sun is highest. That is when shadows are smallest.'],
      ['It stays the same all day', 'same-shadow', 'The Sun moves across the sky, so the shadow changes.'],
    ],
    explain: 'Shadows are long when the Sun is low, and shortest at midday when it is high.',
    hints: ['When is the Sun low, and when is it high?', 'The Sun is low in the morning, highest at midday and low again in the evening.'],
    pic: { k: 'sky', sun: 'noon', shadow: false },
    model: 'shadow-day',
  },
  {
    id: 'sunrise-sundial',
    tier: 3,
    ask: 'Long ago, people told the time with a sundial. A sundial is a stick that makes a shadow. Why does the shadow move round during the day?',
    right: 'Earth spins, so the Sun seems to cross the sky.',
    wrong: [
      ['The stick slowly turns.', 'pole-changes', 'The stick stays still. Something much bigger is moving.'],
      ['The Sun gets closer, then farther.', 'sun-closer', 'The Sun stays about the same distance away all day.'],
    ],
    explain: 'As Earth spins, the Sun seems to cross the sky. The shadow swings round, so it can tell the time.',
    hints: ['What makes the Sun seem to move across the sky?', 'Remember the globe in the lab. Turning it moves the town from morning to evening.'],
    pic: { k: 'sky', sun: 'noon', shadow: true },
    model: 'shadow-day',
  },
  {
    id: 'sunrise-far-side',
    tier: 3,
    ask: 'It is midday in our town. The town faces the Sun. What time is it on the far side of Earth?',
    right: 'Around midnight',
    wrong: [
      ['Midday too', 'day-everywhere', 'The far side faces away from the Sun. Look at the globe.'],
      ['Sunrise', 'rise-set', 'Sunrise is at the edge, where the dark side turns into the light.'],
    ],
    explain: 'When it is midday on one side of Earth, it is midnight on the other side.',
    hints: ['If our town faces the lamp, what does the far side face?', 'The far side is in the middle of the dark half.'],
    pic: { k: 'globe', spin: 0 },
    model: 'daynight',
  },
  {
    id: 'sunrise-why-long',
    tier: 3,
    ask: 'Shadows are longest when the Sun is low. Why does a low Sun make a long shadow?',
    right: 'Light comes in from the side, so the shadow stretches out.',
    wrong: [
      ['The Sun is closer in the morning.', 'sun-closer', 'The Sun is about the same distance away all day.'],
      ['The flagpole gets taller.', 'pole-changes', 'The flagpole stays the same height all day.'],
    ],
    explain: 'Low light skims over the top of the pole and lands far away, so the shadow is long.',
    hints: ['Where is the light coming from when the Sun is low?', 'Shine a torch at a toy from the side, then from above. Compare the shadows.'],
    pic: { k: 'sky', sun: 'evening', shadow: false },
    model: 'rays',
  },
];

// ------------------------------------------------------------------ the planet stops: fact cards and questions

export interface PlanetFacts {
  name: string;
  kind: 'Rocky planet' | 'Gas giant' | 'Ice giant';
  /** Average distance from the Sun (NASA). */
  distance: string;
  /** One full spin (a sidereal day). */
  spin: string;
  /** One trip round the Sun. */
  year: string;
  moons: string;
  /** What Vee collects at the stop. */
  sample: string;
  /** A short line for the fact card. */
  fact: string;
  /** The stop is on the ground (rocky planets) or a dive into the clouds (giants). */
  stop: 'surface' | 'dive';
}

export const FACTS: Record<PlanetId, PlanetFacts> = {
  mercury: { name: 'Mercury', kind: 'Rocky planet', distance: '58 million km', spin: '59 Earth days', year: '88 Earth days', moons: 'None', sample: 'A grey rock. It is baked hot in the day and frozen at night.', fact: 'Mercury is the smallest planet and the closest to the Sun.', stop: 'surface' },
  venus: { name: 'Venus', kind: 'Rocky planet', distance: '108 million km', spin: '243 Earth days (backwards!)', year: '225 Earth days', moons: 'None', sample: 'A dark volcanic rock. Robot landers took pictures of rocks like this in 1982.', fact: 'Venus is the hottest planet. Its thick clouds trap the heat.', stop: 'surface' },
  earth: { name: 'Earth', kind: 'Rocky planet', distance: '150 million km', spin: '24 hours', year: '365 days', moons: '1 (the Moon)', sample: 'A drop of liquid water. Earth is the only planet with oceans on top.', fact: 'Earth is our home, the only planet known to have life.', stop: 'surface' },
  mars: { name: 'Mars', kind: 'Rocky planet', distance: '228 million km', spin: '24 hours 37 minutes', year: '687 Earth days', moons: '2 (Phobos and Deimos)', sample: 'A pinch of red dust. The rust in it makes Mars red.', fact: 'Mars has the biggest volcano in the solar system, Olympus Mons.', stop: 'surface' },
  jupiter: { name: 'Jupiter', kind: 'Gas giant', distance: '778 million km', spin: '10 hours', year: '12 Earth years', moons: 'Dozens (scientists keep finding more)', sample: 'A puff of cloud gas. Jupiter is mostly hydrogen and helium.', fact: 'Jupiter is the biggest planet. More than 1,300 Earths could fit inside it.', stop: 'dive' },
  saturn: { name: 'Saturn', kind: 'Gas giant', distance: '1.4 billion km', spin: '10.7 hours', year: '29 Earth years', moons: 'Hundreds (scientists keep finding more)', sample: 'A tiny chip of ring ice, shining in the sunlight.', fact: 'Saturn’s rings are billions of pieces of ice and rock.', stop: 'dive' },
  uranus: { name: 'Uranus', kind: 'Ice giant', distance: '2.9 billion km', spin: '17 hours', year: '84 Earth years', moons: 'More than 25', sample: 'A puff of cold gas. A gas called methane makes Uranus blue-green.', fact: 'Uranus spins on its side, so it rolls round the Sun.', stop: 'dive' },
  neptune: { name: 'Neptune', kind: 'Ice giant', distance: '4.5 billion km', spin: '16 hours', year: '165 Earth years', moons: '16', sample: 'A puff of icy gas. Methane makes Neptune deep blue.', fact: 'Neptune has the fastest winds in the solar system.', stop: 'dive' },
};

const STOP_QS: Record<PlanetId, QDef[]> = {
  mercury: [
    {
      id: 'stop-mercury-1',
      tier: 1,
      ask: 'This is Mercury. It is grey and covered in craters. Where is Mercury?',
      right: 'Closest to the Sun',
      wrong: [
        ['Farthest from the Sun', 'order-swap', 'Neptune is the farthest planet. Mercury is somewhere else.'],
        ['Between Earth and Mars', 'order-swap', 'Nothing sits between Earth and Mars. Mars comes right after Earth.'],
      ],
      explain: 'Mercury is the closest planet to the Sun. That is why the Sun looks so big here.',
      hints: ['Look up at the Sun. Why does it look so big here?', 'The closer you are to the Sun, the bigger it looks.'],
      pic: planet('mercury'),
      model: 'order',
      focus: 0,
    },
    {
      id: 'stop-mercury-2',
      tier: 2,
      ask: 'Mercury has no air around it. On Earth, air makes the day sky blue. What color is the sky on Mercury in the day?',
      right: 'Black',
      wrong: [
        ['Blue', 'air-sky', 'Without air, there is nothing to make the sky blue.'],
        ['Red', 'air-sky', 'A dusty sky needs air to carry the dust, like on Mars.'],
      ],
      explain: 'Air scatters sunlight and makes Earth’s sky blue. Mercury has no air, so its sky stays black.',
      hints: ['What makes our sky blue?', 'Sunlight bounces round in our air. No air means nothing to light up.'],
      pic: planet('mercury'),
      model: 'card',
    },
    {
      id: 'stop-mercury-3',
      tier: 3,
      ask: 'Mercury gets very hot in the day. But its nights get colder than any freezer. Why does Mercury get so cold at night?',
      right: 'It has no air to hold in the heat.',
      wrong: [
        ['It moves far from the Sun every night.', 'sun-closer', 'Night comes from spinning away from the Sun, not moving away.'],
        ['The Sun goes out at night.', 'sun-off', 'The Sun shines all the time. It never goes out.'],
      ],
      explain: 'Air works like a blanket. Mercury has none, so the day’s heat escapes into space at night.',
      hints: ['On Earth, what keeps nights from getting too cold?', 'Venus has thick air and stays hot all night. Mercury has almost none.'],
      pic: planet('mercury'),
      model: 'card',
    },
  ],
  venus: [
    {
      id: 'stop-venus-1',
      tier: 1,
      ask: 'Thick yellow clouds cover this planet. They trap the Sun’s heat. Which planet is the hottest in the solar system?',
      right: 'Venus',
      wrong: [
        ['Mercury', 'closest-hottest', 'Mercury is closest to the Sun, but it is not the hottest.'],
        ['Mars', 'wrong-feature', 'Mars looks red, but it is colder than Earth.'],
      ],
      explain: 'Venus is the hottest planet. Its thick clouds trap the Sun’s heat.',
      hints: ['Look around. Which planet are we on right now?', 'The hottest planet has a thick blanket of clouds.'],
      pic: planet('venus'),
      model: 'card',
    },
    {
      id: 'stop-venus-2',
      tier: 2,
      ask: 'Venus spins very slowly. One spin takes 243 Earth days. One trip round the Sun takes 225 Earth days. Which takes longer on Venus?',
      right: 'The spin',
      wrong: [
        ['The trip round the Sun', 'spin-orbit', 'Compare the two numbers. Which one is bigger?'],
        ['They take the same time', 'spin-orbit', '243 and 225 are different numbers.'],
      ],
      explain: 'On Venus, one spin takes longer than one trip round the Sun!',
      hints: ['Which is bigger: 243 or 225?', 'One spin is 243 days. One trip round the Sun is 225 days. Find the bigger number.'],
      pic: planet('venus'),
      model: 'card',
    },
    {
      id: 'stop-venus-3',
      tier: 3,
      ask: 'Venus is about the same size as Earth. But its air is thick, heavy and full of clouds. What does the thick air do?',
      right: 'It traps heat, so Venus is the hottest planet.',
      wrong: [
        ['It keeps Venus cool.', 'air-cools', 'Thick air works like a blanket, not like a fan.'],
        ['It makes Venus closer to the Sun.', 'closest-hottest', 'Air does not change how far a planet is from the Sun.'],
      ],
      explain: 'The thick air traps the Sun’s heat. Venus is hotter than Mercury, even though Mercury is closer.',
      hints: ['What does a thick blanket do on a cold night?', 'A blanket keeps heat in. Venus has a very thick blanket of air.'],
      pic: planet('venus'),
      model: 'card',
    },
  ],
  earth: [
    {
      id: 'stop-earth-1',
      tier: 1,
      ask: 'This is Earth, our home. Mercury and Venus are closer to the Sun. Which planet from the Sun is Earth?',
      right: 'The third',
      wrong: [
        ['The first', 'order-swap', 'Mercury is the first planet. Count again from the Sun.'],
        ['The fifth', 'order-swap', 'Jupiter is the fifth planet. Count again from the Sun.'],
      ],
      explain: 'Earth is the third planet from the Sun.',
      hints: ['Count on your fingers: Mercury, Venus, Earth.', 'Mercury is one, Venus is two. What comes next?'],
      pic: planet('earth'),
      model: 'order',
      focus: 2,
    },
    {
      id: 'stop-earth-2',
      tier: 2,
      ask: 'Earth has one big moon. The Moon goes round Earth about once a month. Is the Moon a planet?',
      right: 'No, it goes round a planet.',
      wrong: [
        ['Yes, it is the ninth planet.', 'moon-planet', 'There are eight planets. The Moon is not one of them.'],
        ['Yes, because it is round.', 'moon-planet', 'Lots of things are round. Planets go round the Sun.'],
      ],
      explain: 'A moon goes round a planet. The Moon goes round Earth, so it is a moon, not a planet.',
      hints: ['What does the Moon go round?', 'Planets go round the Sun. The Moon goes round Earth instead.'],
      pic: planet('moon'),
      model: 'order',
    },
    {
      id: 'stop-earth-3',
      tier: 3,
      ask: 'Earth is not too hot and not too cold. Water stays liquid in oceans, lakes and rivers. Why is Earth just right?',
      right: 'Its distance from the Sun is just right.',
      wrong: [
        ['It is the biggest planet.', 'size-mixup', 'Earth is not the biggest. Four giants are much bigger.'],
        ['It is the closest planet to the Sun.', 'closest-hottest', 'Mercury and Venus are closer. Earth is third.'],
      ],
      explain: 'Earth is not too close to the Sun and not too far. Water can stay liquid, and life can live here.',
      hints: ['What happens to water if it gets very hot, or very cold?', 'Too close to the Sun, water boils away. Too far, it freezes.'],
      pic: planet('earth'),
      model: 'order',
    },
  ],
  mars: [
    {
      id: 'stop-mars-1',
      tier: 1,
      ask: 'This is Mars. Its ground is covered in red dust. What is Mars called?',
      right: 'The Red Planet',
      wrong: [
        ['The Ringed Planet', 'look-alike', 'That is Saturn’s nickname, for its bright rings.'],
        ['The Blue Planet', 'look-alike', 'That is a nickname for Earth, for its oceans.'],
      ],
      explain: 'Mars is called the Red Planet because of its rusty red dust.',
      hints: ['Look at the ground. What color is it?', 'The nickname is about its color.'],
      pic: planet('mars'),
      model: 'card',
    },
    {
      id: 'stop-mars-2',
      tier: 2,
      ask: 'Mars has the biggest volcano in the solar system. It is called Olympus Mons. How tall is it?',
      right: 'About two and a half times Mount Everest',
      wrong: [
        ['About as tall as a house', 'size-mixup', 'It is the biggest volcano of all. A house is tiny next to it.'],
        ['Taller than Mars is wide', 'size-mixup', 'No mountain is that big. It would be bigger than the planet!'],
      ],
      explain: 'Olympus Mons is about two and a half times as tall as Mount Everest, Earth’s highest mountain.',
      hints: ['Everest is the tallest mountain on Earth. Is Olympus Mons bigger or smaller?', 'It is the biggest volcano in the solar system, much taller than Everest.'],
      pic: planet('mars'),
      model: 'card',
    },
    {
      id: 'stop-mars-3',
      tier: 3,
      ask: 'A day on Mars is about as long as a day on Earth. But one Mars year is 687 Earth days. Why is a Mars year longer?',
      right: 'Mars is farther from the Sun, so its trip round is longer.',
      wrong: [
        ['Mars spins more slowly.', 'spin-orbit', 'Spinning makes days, not years. Mars days are about the same as ours.'],
        ['Mars is smaller than Earth.', 'size-speed', 'Size does not set the length of a year.'],
      ],
      explain: 'A year is one trip round the Sun. Mars is farther out, so its trip is longer and slower.',
      hints: ['What is a year?', 'A year is one trip round the Sun. Which planet has the bigger path?'],
      pic: planet('mars'),
      model: 'order',
    },
  ],
  jupiter: [
    {
      id: 'stop-jupiter-1',
      tier: 1,
      ask: 'This is Jupiter, the biggest planet. More than 1,300 Earths could fit inside it. Is Jupiter bigger or smaller than Earth?',
      right: 'Much bigger',
      wrong: [
        ['Much smaller', 'size-mixup', '1,300 Earths could fit inside it. Think about what that means.'],
        ['The same size', 'size-mixup', 'Jupiter is the biggest planet of all.'],
      ],
      explain: 'Jupiter is much bigger than Earth. It is the biggest planet.',
      hints: ['How many Earths could fit inside Jupiter?', 'If 1,300 of something fit inside, the outside must be huge.'],
      pic: planet('jupiter'),
      model: 'card',
    },
    {
      id: 'stop-jupiter-2',
      tier: 2,
      ask: 'Jupiter has stripes of clouds. The winds in stripes next to each other blow opposite ways. What are Jupiter’s stripes made of?',
      right: 'Clouds blown by strong winds',
      wrong: [
        ['Painted rock', 'solid-giant', 'Jupiter has no rocky surface to paint. It is a gas giant.'],
        ['Rivers of water', 'solid-giant', 'Jupiter has no ground for rivers to run on.'],
      ],
      explain: 'Jupiter’s stripes are bands of clouds. Strong winds blow them round the planet.',
      hints: ['Look out of the window. What are we diving through?', 'We are in the stripes right now. They are made of gas and clouds.'],
      pic: planet('jupiter'),
      model: 'kinds',
    },
    {
      id: 'stop-jupiter-3',
      tier: 3,
      ask: 'Jupiter has no solid surface. Deeper down, the clouds get thicker and hotter. What would a probe find if it kept diving?',
      right: 'Thicker and thicker gas, with no ground',
      wrong: [
        ['A rocky beach to land on', 'solid-giant', 'Gas giants have no beaches or ground near the top.'],
        ['Empty space on the other side', 'hollow-planet', 'Jupiter is not hollow. It is packed full of gas.'],
      ],
      explain: 'Jupiter is gas almost all the way down. It gets thicker and hotter, but there is no ground to land on.',
      hints: ['Is a gas giant hollow, or full?', 'Every bit deeper, the gas is squeezed thicker. It never turns into ground.'],
      pic: planet('jupiter'),
      model: 'kinds',
    },
  ],
  saturn: [
    {
      id: 'stop-saturn-1',
      tier: 1,
      ask: 'This is Saturn. It has bright rings around it. What are the rings made of?',
      right: 'Ice and rock',
      wrong: [
        ['Rainbows', 'wrong-feature', 'Rainbows are made of light and raindrops. They cannot make rings in space.'],
        ['Solid gold', 'wrong-feature', 'The rings shine, but they are not made of gold.'],
      ],
      explain: 'Saturn’s rings are made of billions of pieces of ice and rock.',
      hints: ['What shiny, white stuff could reflect sunlight?', 'The rings shine because they are icy. Bits of rock are mixed in.'],
      pic: planet('saturn'),
      model: 'card',
    },
    {
      id: 'stop-saturn-2',
      tier: 2,
      ask: 'Saturn is a giant ball of gas. It is so light for its size that it would float in a giant bathtub. What does that tell us?',
      right: 'Saturn is less dense than water.',
      wrong: [
        ['Saturn is made of wood.', 'wrong-feature', 'Saturn is made of gas, mostly hydrogen and helium.'],
        ['Saturn is tiny.', 'size-mixup', 'Saturn is the second biggest planet.'],
      ],
      explain: 'Things less dense than water float. Saturn is mostly light gas, so it would float.',
      hints: ['Why does a beach ball float in a pool?', 'A beach ball is full of light air. Saturn is full of light gas.'],
      pic: planet('saturn'),
      model: 'card',
    },
    {
      id: 'stop-saturn-3',
      tier: 3,
      ask: 'One trip round the Sun takes Saturn 29 Earth years. If you are 10 years old on Earth, how many Saturn years old are you?',
      right: 'Not even 1',
      wrong: [
        ['290', 'years-multiply', 'That would make Saturn years shorter than ours. They are much longer.'],
        ['29', 'years-multiply', '29 is how many Earth years one Saturn year takes.'],
      ],
      explain: 'One Saturn year is 29 Earth years. A 10-year-old has not had even one Saturn birthday yet!',
      hints: ['Is one Saturn year longer or shorter than one Earth year?', 'You would need to be 29 to have your first Saturn birthday.'],
      pic: planet('saturn'),
      model: 'order',
    },
  ],
  uranus: [
    {
      id: 'stop-uranus-1',
      tier: 1,
      ask: 'This is Uranus. It is a pale blue-green giant. Which is true about Uranus?',
      right: 'It spins on its side.',
      wrong: [
        ['It is the closest planet to the Sun.', 'order-swap', 'Uranus is the seventh planet, very far out.'],
        ['It is made of solid rock.', 'rocky-giant', 'Uranus is a giant made mostly of gas and ice.'],
      ],
      explain: 'Uranus is tipped right over. It spins on its side.',
      hints: ['Look at its rings. Which way do they point?', 'Most planets spin standing up. Uranus does something different.'],
      pic: planet('uranus'),
      model: 'card',
    },
    {
      id: 'stop-uranus-2',
      tier: 2,
      ask: 'Uranus was the first planet found with a telescope, in 1781. Why was it not found earlier?',
      right: 'It is too far and faint to spot easily without a telescope.',
      wrong: [
        ['It was not there before 1781.', 'new-planet', 'Planets do not appear suddenly. Uranus is billions of years old.'],
        ['It hides behind the Sun all year.', 'wrong-feature', 'Uranus moves round the Sun. It is not always behind it.'],
      ],
      explain: 'Uranus is very far away and faint. Most people need a telescope to find it.',
      hints: ['Why do we use telescopes?', 'A telescope helps us see things that are far away and faint.'],
      pic: planet('uranus'),
      model: 'order',
    },
    {
      id: 'stop-uranus-3',
      tier: 3,
      ask: 'Uranus is tipped on its side. For years at a time, one of its poles points at the Sun. What happens at that pole then?',
      right: 'Many years of daylight',
      wrong: [
        ['Night all the time', 'day-dark', 'That pole faces the Sun, so it is in the light.'],
        ['A normal day and night every day', 'spin-orbit', 'A pole pointing at the Sun stays lit as Uranus spins.'],
      ],
      explain: 'Each pole of Uranus gets about 42 years of daylight, then about 42 years of darkness.',
      hints: ['If a pole points at the Sun, is it in the light or the dark?', 'Uranus spins, but a pole pointing at the Sun stays facing it.'],
      pic: planet('uranus'),
      model: 'daynight',
    },
  ],
  neptune: [
    {
      id: 'stop-neptune-1',
      tier: 1,
      ask: 'This is Neptune. It is deep blue. It is the farthest planet from the Sun. Which planet from the Sun is Neptune?',
      right: 'The eighth, the last one',
      wrong: [
        ['The first, closest to the Sun', 'order-swap', 'Mercury is the closest planet. Neptune is far away.'],
        ['The ninth, after Pluto', 'pluto-planet', 'Pluto is a dwarf planet, so it is not counted.'],
      ],
      explain: 'Neptune is the eighth planet, the farthest from the Sun.',
      hints: ['How many planets are there?', 'There are eight planets. The farthest one is last.'],
      pic: planet('neptune'),
      model: 'order',
      focus: 7,
    },
    {
      id: 'stop-neptune-2',
      tier: 2,
      ask: 'Neptune has the fastest winds in the solar system. They blow over 2,000 km an hour. What are those winds blowing?',
      right: 'Clouds of gas',
      wrong: [
        ['Sand dunes', 'solid-giant', 'Neptune has no sandy ground. It is a giant of gas and ice.'],
        ['Ocean waves', 'solid-giant', 'Neptune has no open oceans on top to make waves.'],
      ],
      explain: 'Neptune’s winds blow its clouds of gas round the planet faster than any other winds.',
      hints: ['What is Neptune made of?', 'Neptune is a giant of gas and ice. Its winds push its clouds.'],
      pic: planet('neptune'),
      model: 'kinds',
    },
    {
      id: 'stop-neptune-3',
      tier: 3,
      ask: 'Neptune was found by math. Scientists saw Uranus being pulled a little off its path. What did they work out?',
      right: 'Another planet’s pull was tugging on it.',
      wrong: [
        ['Uranus was broken.', 'wrong-feature', 'Uranus was not broken. Its path was a clue.'],
        ['The Sun was getting weaker.', 'wrong-feature', 'The Sun’s pull did not change.'],
      ],
      explain: 'Scientists worked out where an unseen planet must be. In 1846 they looked there and found Neptune.',
      hints: ['What pulls planets?', 'Every planet has gravity. A big planet nearby can tug on another one.'],
      pic: planet('neptune'),
      model: 'order',
    },
  ],
};

const BANKS: Record<Station, QDef[]> = { orrery: ORRERY, sunrise: SUNRISE, dome: [], launch: [] };

// ------------------------------------------------------------------ picking questions

export type Rand = () => number;
export function shuffle<T>(r: Rand, list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Every question for a station (for tests). */
export function bank(s: Station): QDef[] {
  return BANKS[s];
}

/** Every question for a planet stop (for tests). */
export function stopBank(p: PlanetId): QDef[] {
  return STOP_QS[p];
}

function build(station: Station | 'stop', d: QDef, r: Rand, planetId?: PlanetId): Question {
  const choices: Choice[] = shuffle(r, [{ value: d.right, label: d.right, correct: true }, ...d.wrong.map(([label, mis, why]): Choice => ({ value: label, label, correct: false, misconception: mis, why }))]);
  const focus = d.focus ?? (d.pic.k === 'orrery' && d.pic.glow !== undefined ? d.pic.glow : 8);
  return { id: d.id, station, planet: planetId, tier: d.tier, ask: d.ask, choices, explain: d.explain, hints: d.hints, pic: d.pic, model: d.model, focus };
}

/**
 * A question for this station and level, avoiding the ids in `recent` where
 * it can (so a child sees every question of a level before any comes back).
 */
export function makeQuestion(s: Station, tier: Tier, r: Rand, recent: readonly string[] = []): Question {
  const pool = bank(s).filter((d) => d.tier === tier);
  if (!pool.length) throw new Error(`No questions for ${s} at level ${tier}`);
  const fresh = pool.filter((d) => !recent.includes(d.id));
  const from = fresh.length ? fresh : pool;
  return build(s, from[Math.floor(r() * from.length) % from.length], r);
}

/** The planet stop's question at this level. */
export function stopQuestion(p: PlanetId, tier: Tier, r: Rand): Question {
  const d = STOP_QS[p].find((q) => q.tier === tier) ?? STOP_QS[p][0];
  return build('stop', d, r, p);
}
