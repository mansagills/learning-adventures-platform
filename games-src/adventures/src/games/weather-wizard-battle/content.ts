import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { Region } from '../../kit/worlds/wild-lands/weather-art';

/** Stars to earn in the Weather Book to finish a region. */
export const STARS_PER_REGION = 5;
/** Right answers at the forecast stop between a region's two levels. */
export const FORECAST_RIGHT = 2;

export type PersonId = 'nimbus' | 'iris' | 'tala' | 'drip';
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  nimbus: { name: 'Professor Nimbus', role: 'Weather wizard (make-believe)' },
  iris: { name: 'Dr. Iris Okoro', role: 'Meteorologist' },
  tala: { name: 'Ranger Tala', role: 'Wild Lands ranger' },
  drip: { name: 'Drip', role: 'A drop of water' },
};

export const OPENING = [
  'Ah, there you are! I am Professor Nimbus, weather wizard. Well, a make-believe one. Nobody can really make the weather, not even me.',
  'But I know how nature makes it. And I need an apprentice to follow a drop of water all the way round the water cycle.',
];
export const DRIP_HELLO = 'Plip! Hello! I am Drip, a drop of sea water. I go round and round: up into the sky, down as rain or snow, and back to the sea. Will you come with me?';
export const OPENING_END = [
  'Wonderful! Here is your staff and your hat. Each region teaches you a new weather power, and each power is a real part of nature.',
  'Dr. Iris Okoro runs the weather station here. She is a meteorologist, a real weather scientist. Visit her between levels for a forecast question, and to fill your Weather Book.',
  'Our journey starts at Sunny Shore. Go to the map when you are ready!',
];
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys. Press E to talk to someone, or to read the map.';
export const CONTROLS_TIP_TOUCH = 'Walk with the arrow buttons. Tap the button that pops up to talk to someone, or to read the map.';

export const IRIS_HELLO = [
  'Hi! I am Dr. Iris Okoro. I measure the weather with tools like a thermometer, a rain gauge and a wind vane, and I use what I measure to forecast the weather.',
  'Weather is what the sky is doing today. Forecasting it helps farmers, sailors and pilots, and it keeps people safe in storms.',
];
export const TALA_LINES = [
  'Hi! The weather here at camp changes every day. Dr. Iris writes it all down at the weather station.',
  'Every drop of rain that falls on the Wild Lands came from water that rose into the sky. Fun, isn’t it?',
  'If a level feels tricky, try Easy jumps. It slows your running down and lets you jump twice.',
];

export interface RegionInfo {
  id: Region;
  name: string;
  stage: string;
  /** Who asks the talk-it-through question at the end. */
  host: PersonId;
  skill: string;
  /** Said by the host before the questions. */
  book: string;
  debrief: TalkQuestion;
  done: string;
  badge: string;
}

export const REGION_INFO: Record<Region, RegionInfo> = {
  shore: {
    id: 'shore',
    name: 'Sunny Shore',
    stage: 'Evaporation',
    host: 'nimbus',
    skill: 'The Sun drives the water cycle',
    book: 'Let’s fill in your Weather Book for Sunny Shore. Each right answer on the first try earns a star.',
    debrief: {
      text: 'One to talk through: on a sunny day, a puddle dries up. Where did the water go?',
      options: [
        { text: 'The Sun warmed it, and it rose into the air as invisible water vapor.', correct: true, feedback: 'Exactly! It is still water, just a gas now, floating in the air. One day it will fall again as rain.' },
        { text: 'It disappeared. Water can be used up.', misconception: 'water-gone', feedback: 'Water never disappears. It always goes somewhere. Where could it go on a hot, sunny day?' },
        { text: 'The ground drank all of it.', misconception: 'ground-only', feedback: 'A little soaks in, but this puddle sat in the hot sun all day. What does the Sun do to water?' },
      ],
      hints: ['What does the Sun’s heat do to water?', 'Look up. Water vapor is invisible, but it is there.', 'The water evaporated: it rose into the air as invisible vapor.'],
    },
    done: 'Sunny Shore is done! You understand evaporation: the Sun’s heat lifts water into the air as invisible vapor. Next, Cloud Heights!',
    badge: 'Sun badge',
  },
  clouds: {
    id: 'clouds',
    name: 'Cloud Heights',
    stage: 'Condensation',
    host: 'nimbus',
    skill: 'Clouds and condensation',
    book: 'Let’s fill in your Weather Book for Cloud Heights.',
    debrief: {
      text: 'One to talk through: why can’t I make it rain from a clear blue sky?',
      options: [
        { text: 'With no cloud, there are no drops of water to fall.', correct: true, feedback: 'Yes! Rain falls from clouds full of heavy drops. No cloud, no rain, whatever a wizard says.' },
        { text: 'Because your staff is too weak.', misconception: 'people-weather', feedback: 'Even a real scientist with every tool cannot make rain from an empty sky. What does rain need first?' },
        { text: 'Because rain only falls at night.', misconception: 'wrong-reason', feedback: 'Rain can fall at any time of day. Where does rain come from?' },
      ],
      hints: ['Where does rain come from?', 'Think of the grey clouds. What do they hold?', 'Rain falls from clouds full of water drops. A clear sky has no cloud, so nothing can fall.'],
    },
    done: 'Cloud Heights is done! You know clouds are tiny drops made when vapor cools, and that rain needs a full, grey cloud. Now, up the mountain with Dr. Iris!',
    badge: 'Cloud badge',
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain Pass',
    stage: 'Precipitation',
    host: 'iris',
    skill: 'Rain, snow and temperature',
    book: 'Time for the Weather Book. Mountain Pass questions are mine!',
    debrief: {
      text: 'One to talk through: a grey cloud drops rain in the valley but snow at the top of the mountain. Why?',
      options: [
        { text: 'It is below 0 °C at the top, so the water freezes into snow.', correct: true, feedback: 'Right! The air gets colder as you climb. Below 0 °C, water freezes, so the same cloud gives snow up high.' },
        { text: 'The top is closer to the Sun, so it is warmer.', misconception: 'closer-sun', feedback: 'Higher up is colder, not warmer. Think of the snow on the top. What does cold do to water?' },
        { text: 'The snow up there makes the air cold.', misconception: 'snow-makes-cold', feedback: 'It is the other way round. The air must be cold first. What does cold air do to the water in a cloud?' },
      ],
      hints: ['Is it warmer or colder at the top?', 'Look at the thermometer. What happens below 0 °C?', 'At the top it is below 0 °C, so the water freezes into snowflakes. In the warm valley, it falls as rain.'],
    },
    done: 'Mountain Pass is done! Rain or snow, it depends on the temperature, and you can read a thermometer to forecast it. Good work, weather scientist!',
    badge: 'Snowflake badge',
  },
  river: {
    id: 'river',
    name: 'River Run',
    stage: 'Collection',
    host: 'iris',
    skill: 'Where water goes',
    book: '',
    debrief: { text: '', options: [], hints: ['', '', ''] },
    done: '',
    badge: 'River badge',
  },
  storm: {
    id: 'storm',
    name: 'Storm Front',
    stage: 'The storm',
    host: 'iris',
    skill: 'Storms and staying safe',
    book: '',
    debrief: { text: '', options: [], hints: ['', '', ''] },
    done: '',
    badge: 'Storm badge',
  },
};

/** The regions open in this build (half 1). */
export const OPEN_REGIONS: Region[] = ['shore', 'clouds', 'mountain'];

export const HALF_DONE = [
  'Three regions done! Drip has risen from the sea, become a cloud and fallen as snow on the mountain.',
  'Next comes River Run, then the Storm Front. They are still being built. Come back soon!',
];

export function praise(i: number): string {
  return ['Great job!', 'You got it!', 'Brilliant!', 'Yes, that’s right!', 'Spot on!', 'Exactly right!'][i % 6];
}

// ------------------------------------------------------------------ the Weather Book's pages

export interface BookPage {
  id: string;
  title: string;
  /** Which picture to show (see art.ts and the game's book renderer). */
  pic: string;
  facts: [string, string];
  /** The level that adds it to the book. */
  from: string;
}

export const BOOK: BookPage[] = [
  { id: 'sun', title: 'The Sun', pic: 'power:sun', facts: ['The Sun’s heat warms water so it evaporates: it rises as invisible water vapor.', 'The Sun powers the whole water cycle. Without it, the water would stop moving.'], from: 'shore-1' },
  { id: 'vapor', title: 'Water vapor', pic: 'states', facts: ['Water vapor is water as a gas. It is invisible, like the rest of the air.', 'Steam, clouds and mist are not vapor. They are tiny liquid drops you can see.'], from: 'shore-1' },
  { id: 'warm-air', title: 'Warm air rises', pic: 'cycle:evaporation', facts: ['Warm air is lighter than the cool air around it, so it rises.', 'Rising air carries water vapor high into the sky, where it is cold.'], from: 'shore-1' },
  { id: 'cool', title: 'Cool air and condensation', pic: 'power:cool', facts: ['When water vapor cools, it turns back into tiny liquid drops. That is condensation.', 'Billions of tiny drops together make a cloud.'], from: 'shore-2' },
  { id: 'salt', title: 'Salt stays behind', pic: 'salt', facts: ['When sea water evaporates, only the water rises. The salt stays behind.', 'That is why rain is fresh, even though it came from the salty sea.'], from: 'shore-2' },
  { id: 'wind', title: 'Wind', pic: 'power:wind', facts: ['Wind is moving air. It carries clouds across the sky.', 'Wind helps puddles and washing dry, by carrying damp air away.'], from: 'clouds-1' },
  { id: 'cumulus', title: 'Cumulus clouds', pic: 'cloud:cumulus', facts: ['Puffy white clouds with flat bottoms. They usually mean fair weather.', 'A big one can hold about 1.1 million pounds of water, in drops too tiny to fall.'], from: 'clouds-1' },
  { id: 'rain', title: 'Rain', pic: 'power:rain', facts: ['Rain falls from full, grey clouds, when tiny drops bump together and grow heavy.', 'No cloud, no rain: nobody can make rain from a clear sky.'], from: 'clouds-2' },
  { id: 'cumulonimbus', title: 'Storm clouds', pic: 'cloud:cumulonimbus', facts: ['A cumulonimbus is very tall and dark, with a flat top like an anvil.', 'It brings thunderstorms: heavy rain, lightning, thunder and sometimes hail.'], from: 'clouds-2' },
  { id: 'cold', title: 'Cold and freezing', pic: 'power:cold', facts: ['Water freezes into ice below 0 °C (32 °F).', 'Cold air makes snow. Snow does not make the air cold.'], from: 'mountain-1' },
  { id: 'thermometer', title: 'The thermometer', pic: 'therm', facts: ['A thermometer measures how warm or cold the air is.', 'Dr. Iris reads it to forecast rain (above 0 °C) or snow (below 0 °C).'], from: 'mountain-1' },
  { id: 'snow', title: 'Snowflakes', pic: 'snowflake', facts: ['Every snowflake has six sides or six arms, because frozen water joins in a six-sided pattern.', 'No two snowflakes are exactly alike.'], from: 'mountain-1' },
  { id: 'melt', title: 'Spring melt', pic: 'cycle:collection', facts: ['In spring, snow on the mountains melts and runs downhill into streams and rivers.', 'Many towns get their drinking water from melted mountain snow.'], from: 'mountain-2' },
  { id: 'higher', title: 'Higher is colder', pic: 'height', facts: ['The air gets about 6 °C colder for every 1,000 meters you climb.', 'That is why mountain tops can be snowy when the valley is warm.'], from: 'mountain-2' },
];

// ------------------------------------------------------------------ for grown-ups

export const MISCONCEPTION_WORDS: Record<string, string> = {
  'vapor-visible': 'thinking water vapor can be seen (steam and clouds are tiny drops)',
  'boil-only': 'thinking water only evaporates when it boils',
  'ground-only': 'thinking a puddle dries only because the ground drinks it',
  'water-gone': 'thinking water can vanish or get used up',
  'new-water': 'thinking the water cycle makes new water',
  'mostly-fresh': 'thinking most of Earth’s water is fresh',
  'fresh-where': 'mixing up where Earth’s fresh water is',
  'salt-rises': 'thinking the salt evaporates with the water',
  'heat-mixup': 'mixing up what heating and cooling do',
  'state-mixup': 'mixing up solid, liquid and gas',
  'cause-mixup': 'naming the wrong cause (not the Sun)',
  'cloud-cotton': 'thinking clouds are cotton or fluff',
  'cloud-smoke': 'thinking clouds or steam are smoke',
  'cloud-sponge': 'thinking clouds are squeezed, or burst, to make rain',
  'cloud-weightless': 'thinking clouds weigh nothing',
  'cloud-type-mixup': 'mixing up which clouds bring which weather',
  'glass-leak': 'thinking drops on a cold glass leaked through it',
  'stage-mixup': 'mixing up the names of the water cycle’s stages',
  'temp-mixup': 'mixing up what the temperature means for rain, snow and ice',
  'snow-makes-cold': 'thinking snow makes the air cold (cold air makes snow)',
  'closer-sun': 'thinking higher up is warmer because it is closer to the Sun',
  'hail-mixup': 'mixing up hail, sleet and snow',
  'snowflakes-same': 'thinking snowflakes are all the same',
  'people-weather': 'thinking people (or wizards) can make or stop the weather',
  'wrong-reason': 'picking a reason that does not explain it',
};

export const GROWNUPS: GrownupsContent = {
  game: 'Weather Wizard Battle',
  grades: 'Grades 3–5',
  summary:
    'An action game about the water cycle. Your child is the apprentice of Professor Nimbus, a make-believe weather wizard, and follows Drip, a drop of sea water, round the water cycle through the regions of the Wild Lands. Each region is a side-scrolling level where they run and jump, collect droplets, and use weather powers to get past obstacles: the Sun warms water so it evaporates and warm air rises; Cool air turns rising vapor into a cloud; Wind pushes clouds; Rain falls only from full, grey clouds; Cold freezes water, but only below 0 °C. Every power only works where it really would in nature, and the game says why when it does not. Between levels, Dr. Iris Okoro, a meteorologist, asks forecast questions, and each region ends with questions at three levels in the Weather Book and a talk-it-through question. Villagers along the way ask for help (dry washing, shade for a picnic, rain for a dry field, snow for sledding). There are no lives: a fall sends you back to the last weather vane and drops a few droplets to collect again. This first part has three regions: Sunny Shore (evaporation), Cloud Heights (condensation) and Mountain Pass (precipitation). River Run and the Storm Front finale come next.',
  teaches: [
    {
      title: 'Sunny Shore: the Sun drives the water cycle',
      text: 'The Sun’s heat makes water evaporate. Water vapor is an invisible gas (steam and clouds are tiny liquid drops). Water evaporates without boiling, and faster when it is warm. The salt stays behind when sea water evaporates, which is why rain is fresh. At level 3: about 97 of every 100 drops of Earth’s water are salty; most fresh water is frozen or under the ground; the same water is used again and again.',
    },
    {
      title: 'Cloud Heights: clouds and condensation',
      text: 'Clouds are tiny drops of water or ice, made when rising vapor cools (condensation). Warm air rises, and the air gets colder higher up. Drops on a cold glass come from the air, not a leak. Cloud types tell the weather: cumulus (fair), stratus (grey days), cumulonimbus (thunderstorms). At level 3: dew and fog, why no one can make rain from a clear sky, and how cloud drops bump together and grow heavy enough to fall.',
    },
    {
      title: 'Mountain Pass: rain, snow and temperature',
      text: 'Water freezes below 0 °C (32 °F). Rain, snow, sleet and hail are all precipitation. Cold air makes snow, not the other way round. Reading a thermometer to say rain or snow; hail grows in tall storm clouds, even in summer. At level 3: why one side of a mountain is wet and the other dry, spring meltwater filling rivers, six-sided snowflakes (no two alike), glaciers, and the air cooling about 6 °C for every 1,000 meters up.',
    },
    {
      title: 'Mistakes and hints',
      text: 'Every wrong answer gets one sentence about the likely mistake (for example "water vapor is visible", "snow makes the air cold" or "it is warmer up high, closer to the Sun"). Hints go from a nudge, to a picture (the water cycle, a thermometer, a cloud chart), to the answer outlined. Hints never cost progress; a star is for getting it right the first time.',
    },
  ],
  standards: [
    { code: 'NGSS 5-ESS2-1', text: 'Earth’s major systems interact: water moves between the oceans, the air and the land.' },
    { code: 'NGSS 5-ESS2-2', text: 'Most of Earth’s water is salty, in the oceans; most fresh water is in glaciers or underground.' },
    { code: 'NGSS 5-PS1-1', text: 'Matter is made of particles too small to be seen (water vapor in the air).' },
    { code: 'NGSS 3-ESS2-1', text: 'Represent data to describe typical weather conditions (temperature, precipitation, wind).' },
  ],
  talk: [
    'Where does a puddle go on a sunny day?',
    'Can you see water vapor? What is steam, really?',
    'Why are there drops on the outside of a cold drink?',
    'What are clouds made of? Why does a dark grey cloud mean rain?',
    'Is it warmer or colder at the top of a mountain? Why is there snow up there?',
    'Does snow make the air cold, or does cold air make snow?',
    'Look at the sky together. What kind of clouds can you see? What weather might they bring?',
    'Professor Nimbus is make-believe. Can people really make the weather? What can meteorologists do?',
  ],
  help: [
    'There are no lives and no game over. A fall goes back to the last weather vane, and a few droplets drop out to collect again.',
    '"Easy jumps" (a button under the game) slows the running down and allows a second jump in the air.',
    'Levels go up after a few right answers, and down after misses, so the questions fit your child.',
    'Each level has tips on the way, and every power says why when it does not work (for example "It is 2 °C here. Water freezes only below 0 °C.").',
    'Every question and answer can be read aloud.',
  ],
  simplifies: [
    'Professor Nimbus and the weather powers are make-believe, and the game says so. Each power stands for a real process (the Sun’s heat, cooling air, wind), but no person can call up the weather.',
    'Standing on a cloud is make-believe too. Real clouds are tiny drops of water you could walk straight through.',
    'Rising warm air lifting the wizard is a game version of real rising air (it can lift birds, gliders and balloons, not people).',
    'In the game, the Sun melts ice even where the air is below freezing. Real sunshine can do that on a bright day, but slowly.',
    'Clouds form and rain in seconds in the game. Real clouds take minutes to hours.',
    'Temperatures are rounded, and they change in steps across a level instead of smoothly.',
  ],
  sources: [
    { name: 'NOAA SciJinks: the water cycle', url: 'https://scijinks.gov/water-cycle/' },
    { name: 'USGS Water Science School', url: 'https://www.usgs.gov/special-topics/water-science-school' },
    { name: 'National Weather Service: cloud types', url: 'https://www.weather.gov/jetstream/clouds' },
  ],
  credits: [
    'Learning design based on the original Weather Wizard Battle game and the Water Cycle Journey activity, rebuilt by Learning Adventures. Facts from the old game were corrected: the 253 mph wind gust was not in a tornado; cold air makes snow (not the other way round); a hurricane claim that did not match the National Weather Service was dropped.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
  ],
};
