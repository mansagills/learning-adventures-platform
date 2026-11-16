import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { RecipeId, Station } from './problems';

/** Stars to earn in the Squad Journal to finish a stretch. */
export const STARS_PER_STRETCH = 5;
/** Right answers at the water test between a stretch’s two levels. */
export const TEST_RIGHT = 2;
/** The stretches that are open in this half of the game. */
export const OPEN_STRETCHES: Station[] = ['beach', 'harbor'];

export type PersonId = 'marisol' | 'rafi' | 'tala' | 'ollie';
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  marisol: { name: 'Marisol Vega', role: 'Squad leader, marine biologist' },
  rafi: { name: 'Rafi Haddad', role: 'The Squad’s engineer' },
  tala: { name: 'Ranger Tala', role: 'Wild Lands ranger' },
  ollie: { name: 'Ollie', role: 'A river otter' },
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
    done: 'The Harbor is clean! You stopped a leak at its source, fenced in the oil, and saved the ghost nets from the sea. In the second half of the game, we follow the river upstream to the wetland and the town.',
    badge: 'Harbor badge',
  },
};

export const HALF_DONE =
  'That’s Turtle Beach and the Harbor! The trash and the oil both came from upstream. Soon the Squad will paddle up the river to the wetland, and then to the farm and town, to find where it all begins.';

/** What a finished fix teaches, said by Rafi after a test that works. */
export const BUILT_LINE: Record<RecipeId, string> = {
  'bin-lids': 'The lids hold! Now the gulls and the wind can’t empty the bins onto the beach. That stops some trash at its source.',
  'drain-net': 'The net catches the trash and lets the water through. We’ll empty it after every big rain. But where is all this trash coming from?',
  'tank-patch': 'The leak is stopped! No more fuel goes into the harbor. Now we can deal with the oil that’s already there.',
  boom: 'The boom holds the oil in one place. Now I can soak it up with pads. The pads go to hazardous waste, not the sea.',
  'net-bin': 'Now old nets and rope go in the bin to be recycled, not into the river mouth. No more ghost nets!',
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
};

const PRAISE = ['Spot on!', 'Brilliant!', 'That’s it!', 'Great thinking!', 'Squad-worthy!', 'Exactly right!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

export const GROWNUPS: GrownupsContent = {
  game: 'Pollution Solution Squad',
  grades: 'Grades 3–5',
  summary:
    'A side-scrolling crafting adventure about pollution and how people solve it. Your child joins the Pollution Solution Squad at Beach Camp, where trash keeps washing up on Turtle Beach, and follows it upstream to find where it starts. In each level they run and jump along the coast, pick up trash with a grabber (but leave shells and other natural things where they are), and collect materials: bottles, rope, old nets and scrap wood. At a Workbench they choose between two or three designs for a fix (a net for a storm drain, a patch for a leaking fuel tank, an oil boom), build it, and watch it being tested. Designs that only half work explain why, and can be taken down and improved: the engineering design process of grades 3 to 5. Ollie, a river otter they free from a plastic ring, sniffs out buried trash. Between levels a water test and the sorting station (recycling, compost, trash or hazardous waste) check what they have learned, and each stretch ends with questions at three levels in the Squad Journal and a talk-it-through question. Next to camp, the Nature Center is a free-building area: plants, bird boxes, a bee hotel and a bench made of recycled bottles, and animals visit depending on what they build. This half of the game has Turtle Beach and the Harbor; the wetland and the farm and town upstream come next.',
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
  ],
  talk: [
    'Where does our trash go after the bin is collected?',
    'Which bin does each thing in our kitchen go in? Is there anything we could reuse instead?',
    'Can you find a storm drain near home? Where do you think its water goes?',
    'Why might a sea turtle eat a plastic bag?',
    'What happens to a plastic bottle that is left on a beach for many years?',
    'When something you build doesn’t work the first time, what do you do next?',
    'What is one thing our family could do to make less trash this week?',
  ],
  help: [
    'There are no lives and no game over. A fall into the water goes back to the last Squad flag.',
    '"Easy jumps" (a button under the game) slows the running down and allows a second jump in the air.',
    'Levels go up after a few right answers, and down after misses, so the questions fit your child.',
    'Each level has tips on the way. Rafi’s Workbench shows what materials are still missing and where to look.',
    'Every question and answer can be read aloud.',
  ],
  simplifies: [
    'The fixes are simplified: real drain nets, oil booms and tank repairs are made and fitted by trained people. The ideas behind them (the size of a net’s holes, sealed floats, stopping a leak at its source) are real.',
    'Sorting rules differ from town to town. The game uses common rules: cans, glass and clean plastic in recycling, food scraps in compost, batteries in hazardous waste, wrappers and plastic bags in the trash.',
    'Children never handle oil, fuel or sharp trash in the game without the Squad’s tools. In real life, a grown-up should always help with beach cleanups, and broken glass, needles or chemicals should be left for grown-ups.',
  ],
  credits: [
    'Learning design, art, music and sound by Learning Adventures, made in code. Based on the earlier Pollution Solution Squad and Ocean Conservation Heroes games.',
    'Characters, places and the Pollution Solution Squad are fictional.',
  ],
};
