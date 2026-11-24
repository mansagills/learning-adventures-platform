import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { RecipeId, Station } from './problems';

/** Stars to earn in the Squad Journal to finish a stretch. */
export const STARS_PER_STRETCH = 5;
/** Right answers at the water test between a stretch’s two levels. */
export const TEST_RIGHT = 2;
/** The stretches that are open (all four, followed upstream). */
export const OPEN_STRETCHES: Station[] = ['beach', 'harbor', 'wetland', 'town'];

export type PersonId = 'marisol' | 'rafi' | 'tala' | 'ollie' | 'wen' | 'rosa';
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  marisol: { name: 'Marisol Vega', role: 'Squad leader, marine biologist' },
  rafi: { name: 'Rafi Haddad', role: 'The Squad’s engineer' },
  tala: { name: 'Ranger Tala', role: 'Wild Lands ranger' },
  ollie: { name: 'Ollie', role: 'A river otter' },
  wen: { name: 'Dr. Wen Li', role: 'Water scientist' },
  rosa: { name: 'Rosa Delgado', role: 'Farmer and town council member' },
};

export const OPENING = [
  'Welcome to Beach Camp, cadet! I’m Marisol Vega. I lead the Pollution Solution Squad, and I study the animals of this coast.',
  'Here’s our mystery. Every morning, trash washes up on Turtle Beach. We clean it up, and the next day it’s back.',
  'So we’re going to follow it. Start at the beach, then go upstream, all the way to where the trash begins.',
];
export const RAFI_HELLO = [
  'Hi, I’m Rafi, the Squad’s engineer. Most of what you pick up isn’t just trash. It’s material: bottles, rope, old nets, scrap wood.',
  'Bring it to a Workbench and I’ll show you a blueprint. Pick a design, build it, and we’ll test it. If it only half works, we improve it. That’s engineering!',
];
export const OPENING_END = 'Open the map when you’re ready. Our first stop is Turtle Beach.';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys and jump with Space. G grabs trash. E talks to someone or uses what you are next to.';
export const CONTROLS_TIP_TOUCH = 'Walk and jump with the arrow buttons. Grab picks up trash. Tap the button that pops up to talk to someone or to use something.';

export const TALA_LINES = [
  'Hi! Sea turtles come back to the beach where they hatched to lay their own eggs. That’s why Turtle Beach matters so much.',
  'The Nature Center lot is yours to build on. Plant milkweed and the monarch butterflies will find it.',
  'If a jump feels tricky, try Easy jumps. It slows your running down and lets you jump twice.',
  'Take only trash, leave only footprints. That’s the ranger’s rule.',
  'Wetlands are the busiest nurseries in the Wild Lands. Young fish, frogs and birds all grow up among the reeds.',
  'Once the town is fixed, plant a shade tree in the Nature Center. Its roots hold the soil when it rains.',
];

export const OLLIE_FREED = 'Squeak! (Ollie the river otter is free, and wants to come along. From now on, Ollie sniffs out trash buried in the sand.)';
export const OLLIE_SNIFF = 'Sniff sniff! (Ollie found something buried here. Grab it!)';
export const RING_LESSON = 'Plastic rings can catch an animal’s neck or body. That’s why we cut them up before they go in the trash.';

export interface StretchInfo {
  id: Station;
  name: string;
  problem: string;
  host: PersonId;
  skill: string;
  /** Said by the host before the Journal questions. */
  journal: string;
  debrief: TalkQuestion;
  done: string;
  badge: string;
}

export const STRETCH_INFO: Record<Station, StretchInfo> = {
  beach: {
    id: 'beach',
    name: 'Turtle Beach',
    problem: 'Trash and plastic',
    host: 'marisol',
    skill: 'Trash and plastic: where it comes from and where it goes',
    journal: 'Let’s fill in your Squad Journal for Turtle Beach. Each right answer on the first try earns a star.',
    debrief: {
      text: 'One to talk through: the net stopped the trash from the drain. But where did that trash come from in the first place?',
      options: [
        {
          text: 'From the town upstream. Wind and rain wash it into drains and the river, and they bring it here.',
          correct: true,
          feedback: 'Exactly. The drain net helps, but the trash still starts upstream. That’s where we’re going next!',
        },
        {
          text: 'From the sea. The waves make it.',
          misconception: 'beach-source',
          feedback: 'The sea doesn’t make trash. Something carries it down to the beach. Where does the drain pipe come from?',
        },
        { text: 'People at the beach drop all of it.', misconception: 'beach-source', feedback: 'Some is dropped here, but the beach was clean the day before. What came out of the drain pipe?' },
      ],
      hints: ['Where does the drain pipe come from?', 'Think about the path: town, street drain, river, beach.', 'It starts on land, upstream, and drains and rivers carry it to the sea.'],
    },
    done: 'Turtle Beach is done! You know where beach trash comes from, and you built fixes that work. Next stop: the Harbor, where the river meets the sea.',
    badge: 'Turtle Beach badge',
  },
  harbor: {
    id: 'harbor',
    name: 'The Harbor',
    problem: 'Oil and ghost nets',
    host: 'rafi',
    skill: 'Oil and ghost nets: designing a fix',
    journal: 'Squad Journal time for the Harbor. Get it right on the first try for a star.',
    debrief: {
      text: 'One to talk through: we patched the leak, then built the boom. Why did we fix the leak first?',
      options: [
        {
          text: 'While it leaked, more oil kept coming. Stopping the source means the cleanup can finish.',
          correct: true,
          feedback: 'Yes! Stop the source, then clean up. Otherwise the cleanup never ends.',
        },
        { text: 'It didn’t matter. Any order works.', misconception: 'leak-later', feedback: 'Think about the oil while the boat was still leaking. Did it stop coming?' },
        { text: 'The boom works better on a leaking boat.', misconception: 'wrong-reason', feedback: 'The boom holds oil in place, but it can’t stop more oil arriving. What can?' },
      ],
      hints: ['While the boat leaked, did the oil stop coming?', 'Think about the source of the oil.', 'Stop the source first: then the oil stops coming and the cleanup can finish.'],
    },
    done: 'The Harbor is clean! You stopped a leak at its source, fenced in the oil, and saved the ghost nets from the sea. Next, we paddle up the river to the wetland.',
    badge: 'Harbor badge',
  },
  wetland: {
    id: 'wetland',
    name: 'The Wetland',
    problem: 'Green water and too little oxygen',
    host: 'wen',
    skill: 'Clean water and the wetland',
    journal: 'Let’s write up the wetland in your Squad Journal. A right answer on the first try earns a star.',
    debrief: {
      text: 'One to talk through: the reeds and the filter cleaned the wetland. So why do we still need to go upstream to the farms?',
      options: [
        {
          text: 'Fertilizer and mud keep washing down from the farms. Stopping them there means the wetland stays clean.',
          correct: true,
          feedback: 'Yes! The wetland cleans what reaches it, but the fix that lasts is at the source.',
        },
        {
          text: 'We don’t. The wetland is clean now, forever.',
          misconception: 'cleanup-enough',
          feedback: 'It’s clean today. But is fertilizer still washing down the river?',
        },
        { text: 'To find more reeds to plant.', misconception: 'wrong-reason', feedback: 'We have plenty of reeds. What keeps flowing into the wetland from upstream?' },
      ],
      hints: ['What keeps flowing into the wetland?', 'Where does the fertilizer come from?', 'It comes from the farms upstream, so that’s where we stop it for good.'],
    },
    done: 'The wetland is breathing again! The fish have oxygen, the water is clear, and the herons are back. Last stop upstream: the farms and the town, where it all begins.',
    badge: 'Wetland badge',
  },
  town: {
    id: 'town',
    name: 'Farm and Town',
    problem: 'The sources: runoff, drains and smoke',
    host: 'rosa',
    skill: 'Fixing it at the source',
    journal: 'Squad Journal time for the farm and the town. A star for every right answer on the first try.',
    debrief: {
      text: 'One to talk through: we followed the trash, the oil and the mud all the way here. Why fix things up here, and not just clean the beach every day?',
      options: [
        {
          text: 'Up here we stop the pollution before it starts, so every place downstream stays clean.',
          correct: true,
          feedback: 'That’s the whole mystery solved. Stop it at the source, and the whole river and the sea get better.',
        },
        {
          text: 'Cleaning the beach every day would work just as well.',
          misconception: 'cleanup-enough',
          feedback: 'The beach got dirty again every day. Did cleaning it ever stop the trash coming?',
        },
        { text: 'The town is the only dirty place.', misconception: 'wrong-reason', feedback: 'The beach, the harbor and the wetland were dirty too. Where did their pollution start?' },
      ],
      hints: [
        'Think about the beach at the start: clean on Monday, dirty on Tuesday.',
        'Where did the trash, oil and mud come from?',
        'Fixing the source stops the pollution for every place downstream.',
      ],
    },
    done: 'Farm and Town are fixed! The fields hold their soil, the streets soak up the rain, and the mill’s air is clean. There’s a storm coming. Let’s see if our fixes hold.',
    badge: 'Farm and Town badge',
  },
};

/** The Big Rain and Clean Coast Day (the finale), one line per picture. */
export const BIG_RAIN: Array<{ who: PersonId; text: string }> = [
  { who: 'rosa', text: 'Here it comes: the biggest storm of the year! Rain is pouring onto the farms and the town. Let’s follow the water down to the sea.' },
  { who: 'rosa', text: 'The fields: the cover crops and the riverbank strip hold the soil. The water running into the river is clear, not brown.' },
  { who: 'rosa', text: 'The town: the rain garden fills up and soaks the water in. The mill’s filter keeps the smoke out of the air, even in the storm.' },
  { who: 'wen', text: 'The wetland: the reeds slow the flood and soak it up like a sponge. The filter runs clear, and the fish have plenty of oxygen.' },
  { who: 'rafi', text: 'The harbor: the tank patch holds, the boom is ready, and the net bin is full of old nets, not the sea.' },
  { who: 'marisol', text: 'And Turtle Beach: the drain net caught the few bottles that came down. The morning after the storm, the beach is still clean!' },
  { who: 'marisol', text: 'Clean Coast Day! The whole town came to the beach to say thank you. Every gauge is green, from the hills to the sea.' },
  { who: 'marisol', text: 'And tonight, under the turtle-safe amber lights, the hatchlings are heading for the sea. You did this, cadet.' },
];
export const FINALE_END =
  'You solved the mystery: the trash, the oil and the mud all came from upstream, and the fixes that last stop pollution at its source. The Nature Center is still yours to build, and every level can be played again to find hidden trash.';

export const HALF_DONE =
  'That’s Turtle Beach and the Harbor! The trash and the oil both came from upstream. Soon the Squad will paddle up the river to the wetland, and then to the farm and town, to find where it all begins.';

/** What a finished fix teaches, said by Rafi after a test that works. */
export const BUILT_LINE: Record<RecipeId, string> = {
  'bin-lids': 'The lids hold! Now the gulls and the wind can’t empty the bins onto the beach. That stops some trash at its source.',
  'drain-net': 'The net catches the trash and lets the water through. We’ll empty it after every big rain. But where is all this trash coming from?',
  'tank-patch': 'The leak is stopped! No more fuel goes into the harbor. Now we can deal with the oil that’s already there.',
  boom: 'The boom holds the oil in one place. Now I can soak it up with pads. The pads go to hazardous waste, not the sea.',
  'net-bin': 'Now old nets and rope go in the bin to be recycled, not into the river mouth. No more ghost nets!',
  reeds: 'The native reeds are rooting in! They’ll take up the fertilizer, and the algae will shrink. Listen: the frogs are already back.',
  filter: 'Big to small, top to bottom: clear water out of the pipe. That’s how real water filters start, too.',
  buffer: 'The strip slows the rain and catches the soil before the river. And Rosa will plant cover crops, so the fields are never bare.',
  'rain-garden': 'The rain garden soaks up the water from the roofs and the street, so less rushes down the storm drain to the river.',
  'mill-filter': 'The filter stops the smoke at its source. Cleaner air for the whole town, and the mill keeps working.',
};

/** What each wrong idea means, for the grown-ups’ progress table. */
export const MISCONCEPTION_WORDS: Record<string, string> = {
  'animal-food': 'Thinks animals can tell plastic from food',
  'take-nature': 'Thinks it’s fine to take shells and other natural things',
  'beach-source': 'Thinks beach trash is dropped at the beach or by ships, not carried from land',
  'bin-mixup': 'Mixed up the sorting bins',
  'plastic-rots': 'Thinks plastic rots away like food',
  'recycle-all': 'Thinks recycling always comes first, or that dirty things can go in',
  'drain-cleaned': 'Thinks street drains go to a water-cleaning plant',
  'cleanup-enough': 'Thinks cleaning up is enough, without stopping the source',
  'graph-mixup': 'Read a bar graph the wrong way',
  'goal-mixup': 'Mixed up a design’s goals and limits',
  'design-first': 'Thinks the first design is the final one',
  'design-biggest': 'Picked a design without checking it against every goal',
  'one-person': 'Thinks one person or family can’t make a difference',
  'oil-sinks': 'Thinks oil sinks in water or mixes into it',
  'oil-stays': 'Thinks spilled oil stays in one drop',
  'leak-later': 'Thinks the cleanup comes before stopping the leak',
  'net-harmless': 'Thinks lost fishing nets stop catching animals',
  'wrong-reason': 'Gave a reason that doesn’t explain it',
  'wetland-useless': 'Thinks a wetland is a useless swamp',
  'mud-harmless': 'Thinks muddy water does no harm to the plants and animals in it',
  'gauge-mixup': 'Read the water test gauges the wrong way',
  'any-plant': 'Thinks any plant suits a habitat as well as the native ones',
  'more-fertilizer': 'Thinks more fertilizer is always better, or that it stays on the field',
  'algae-good': 'Thinks lots of algae is good for the fish',
  'looks-clean': 'Thinks water, or a fix, that looks clean must be clean',
  'filter-order': 'Put a filter’s layers in an order that clogs or leaks',
  'bare-soil': 'Thinks bare soil stays put in the rain',
  'air-factories': 'Thinks only factories make air pollution, or that smoke vanishes',
  'wrong-place': 'Picked a place for a fix that can’t catch the pollution in time',
};

const PRAISE = ['Spot on!', 'Brilliant!', 'That’s it!', 'Great thinking!', 'Squad-worthy!', 'Exactly right!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

export const GROWNUPS: GrownupsContent = {
  game: 'Pollution Solution Squad',
  grades: 'Grades 3–5',
  summary:
    'A side-scrolling crafting adventure about pollution and how people solve it. Your child joins the Pollution Solution Squad at Beach Camp, where trash keeps washing up on Turtle Beach, and follows it upstream to find where it starts. In each level they run and jump along the coast, pick up trash with a grabber (but leave shells and other natural things where they are), and collect materials: bottles, rope, old nets and scrap wood. At a Workbench they choose between two or three designs for a fix (a net for a storm drain, a patch for a leaking fuel tank, an oil boom, reeds for a wetland, a strip of plants along a riverbank, a filter for a mill chimney), build it, and watch it being tested. Designs that only half work explain why, and can be taken down and improved: the engineering design process of grades 3 to 5. Ollie, a river otter they free from a plastic ring, sniffs out buried trash. Between levels a water test and the sorting station (recycling, compost, trash or hazardous waste) check what they have learned, and each stretch ends with questions at three levels in the Squad Journal and a talk-it-through question. Next to camp, the Nature Center is a free-building area: plants, bird boxes, a bee hotel and a bench made of recycled bottles, and animals visit depending on what they build. The four stretches are followed upstream: Turtle Beach (trash and plastic), the Harbor (oil and ghost nets), the Wetland (green water and too little oxygen) and Farm and Town (where the pollution starts). The finale, The Big Rain, follows a storm from the hills to the sea past every fix, and ends with Clean Coast Day and turtle hatchlings reaching the sea.',
  teaches: [
    {
      title: 'Turtle Beach: trash and plastic',
      text: 'Animals mistake plastic for food (a floating bag looks like a jellyfish). Take only trash. Litter dropped far from the sea is carried there by wind, rain, drains and rivers. Sorting into recycling, compost, trash and hazardous waste. At level 2: plastic breaks into tiny pieces (microplastics) but does not rot; most beach trash starts on land; reduce and reuse come before recycling; recycling must be clean; street drains usually run straight to a river or the sea. At level 3: why the beach got dirty again (find the source), reading a bar graph, goals and limits, testing and improving a design, and how many small actions add up.',
    },
    {
      title: 'The Harbor: oil and ghost nets',
      text: 'Oil floats on water and spreads into a thin layer; oily feathers cannot keep a bird warm; stop a leak before cleaning up; lost "ghost nets" keep catching animals; what an oil boom and absorbent pads do. At level 2: why a boom’s bottles must be sealed, comparing three fixes for a leak, net bins, why soap is used to wash oily birds, and how rivers carry a town’s trash to the sea. At level 3: why preventing a spill beats cleaning one, comparing boom designs against the goals, improving a design, reading a graph, and how everyone at the harbor can help.',
    },
    {
      title: 'The Wetland: clean water',
      text: 'Wetlands filter water, soak up floods and are nurseries for young fish, frogs and birds. Muddy water blocks sunlight from underwater plants. Reading a water test (trash, oil, cloudiness, oxygen). Why native plants. At level 2: fertilizer washed off fields feeds algae; when the algae dies, decomposers use up the oxygen and fish gasp; clear water can still be polluted, so scientists test it; more fertilizer is not better. At level 3: the order of a filter’s layers, reading a graph of the oxygen, how a change in a habitat spreads to the animals that depend on it, improving a failed design, and why the lasting fix is upstream.',
    },
    {
      title: 'Farm and Town: fixing pollution at its source',
      text: 'Storm drains run straight to the river; rain washes bare soil off fields; chimneys, cars and buses dirty the air; roots hold soil. At level 2: buffer strips, cover crops, rain gardens and rain barrels; the right amount of fertilizer at the right time; switching engines off while waiting. At level 3: tracing pollution from source to sea, choosing the best place for a fix, comparing designs against a goal (a taller chimney moves smoke, a filter removes it), reading a graph, choosing a town plan that meets every goal, and how many small changes add up.',
    },
    {
      title: 'Engineering: design, test, improve',
      text: 'Every fix has goals (what it must do) and limits (what we have). Your child picks a design, builds it and sees the test. Two designs only half work, each for a real reason (holes too big or too small, tape that peels, open bottles that sink), and can be taken down to get the materials back and try again.',
    },
    {
      title: 'Mistakes and hints',
      text: 'Every wrong answer gets one sentence about the likely mistake (for example "plastic rots away like food", "street drains go to a cleaning plant" or "oil sinks"). Hints go from a nudge, to a picture (the path trash takes to the sea, the four bins, the engineering loop), to the answer outlined. Hints never cost progress; a star is for getting it right the first time.',
    },
  ],
  standards: [
    { code: 'NGSS 5-ESS3-1', text: 'Obtain and combine information about ways communities use science ideas to protect the Earth’s resources and environment.' },
    { code: 'NGSS 3-LS4-4', text: 'Make a claim about the merit of a solution to a problem caused when the environment changes and the animals that live there may change.' },
    { code: 'NGSS 3-5-ETS1-1', text: 'Define a simple design problem with criteria for success and constraints on materials, time or cost.' },
    { code: 'NGSS 3-5-ETS1-2', text: 'Generate and compare multiple possible solutions based on how well each is likely to meet the criteria and constraints.' },
    { code: 'NGSS 3-5-ETS1-3', text: 'Plan and carry out fair tests to identify aspects of a model or prototype that can be improved.' },
    { code: 'NGSS 5-ESS2-1', text: 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere and atmosphere interact.' },
    { code: 'NGSS 4-ESS3-1', text: 'Obtain and combine information to describe that energy and fuels are derived from natural resources and their uses affect the environment.' },
  ],
  talk: [
    'Where does our trash go after the bin is collected?',
    'Which bin does each thing in our kitchen go in? Is there anything we could reuse instead?',
    'Can you find a storm drain near home? Where do you think its water goes?',
    'Why might a sea turtle eat a plastic bag?',
    'What happens to a plastic bottle that is left on a beach for many years?',
    'When something you build doesn’t work the first time, what do you do next?',
    'What is one thing our family could do to make less trash this week?',
    'Is there a wetland, pond or stream near us? What lives there?',
    'Where does the rain from our roof go? Could we catch some for the garden?',
  ],
  help: [
    'There are no lives and no game over. A fall into the water goes back to the last Squad flag.',
    '"Easy jumps" (a button under the game) slows the running down and allows a second jump in the air.',
    'Levels go up after a few right answers, and down after misses, so the questions fit your child.',
    'Each level has tips on the way. Rafi’s Workbench shows what materials are still missing and where to look.',
    'Every question and answer can be read aloud.',
  ],
  simplifies: [
    'Real water filters for drinking water use more steps than the game’s sand-and-gravel filter. The game’s filter takes out mud; it does not make water safe to drink.',
    'The fixes are simplified: real drain nets, oil booms and tank repairs are made and fitted by trained people. The ideas behind them (the size of a net’s holes, sealed floats, stopping a leak at its source) are real.',
    'Sorting rules differ from town to town. The game uses common rules: cans, glass and clean plastic in recycling, food scraps in compost, batteries in hazardous waste, wrappers and plastic bags in the trash.',
    'Children never handle oil, fuel or sharp trash in the game without the Squad’s tools. In real life, a grown-up should always help with beach cleanups, and broken glass, needles or chemicals should be left for grown-ups.',
  ],
  credits: [
    'Learning design, art, music and sound by Learning Adventures, made in code. Based on the earlier Pollution Solution Squad and Ocean Conservation Heroes games.',
    'Characters, places and the Pollution Solution Squad are fictional.',
  ],
};
