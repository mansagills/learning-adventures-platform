import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { Station } from './problems';

/**
 * Everything Fossil Dig Adventure says: the dig site's people, Pebble, the
 * opening, the stations' intros and debriefs, the quarry dig, the cliff
 * puzzles and the grown-ups page. The owner's wording rule holds
 * everywhere: short sentences, the facts first, then one plain question, in
 * words that match the picture and no game jargon. Read-aloud is on.
 */

export const STARS_PER_STATION = 5;

export type PersonId = 'mateo' | 'hana' | 'sam' | 'tala';

export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  mateo: { name: 'Dr. Mateo Ruiz', role: 'Paleontologist' },
  hana: { name: 'Hana Sato', role: 'Geologist' },
  sam: { name: 'Sam Bello', role: 'Fossil preparator' },
  tala: { name: 'Ranger Tala', role: 'Wild Lands ranger' },
};
export const PEBBLE = { name: 'Pebble', role: 'The sniffer dog' };

export const OPENING = [
  'Welcome to the dig site! I am Ranger Tala. Long ago, this dry valley was a sea, then a swamp, then a river plain full of dinosaurs.',
  'Scientists come here to dig for fossils. A fossil is what is left of a living thing from long, long ago, turned to stone.',
  'Last week, Dr. Mateo Ruiz found the skull of a young Triceratops in the quarry. The team needs a fossil hunter to help. That’s you!',
];
export const PEBBLE_HELLO = 'Woof! Pebble wags and sniffs your boots. Pebble is the camp’s sniffer dog, trained to find old bones in the ground.';
export const OPENING_END = 'Dr. Mateo is waiting by the quarry, in the middle of the camp. Go and say hello!';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk when you are next to someone.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the arrows. Tap the button that pops up to talk.';

export interface StationInfo {
  id: Station;
  name: string;
  skill: string;
  /** What the helper says the first time. */
  intro: string[];
  /** What the helper says when the child comes back later. */
  again: string;
  /** Before the logbook questions. */
  logbook: string;
  debrief: TalkQuestion;
  done: string;
}

export const STATION_INFO: Record<Station, StationInfo> = {
  quarry: {
    id: 'quarry',
    name: 'The Quarry',
    skill: 'What a fossil is and how it forms',
    intro: [
      '¡Hola! I am Dr. Mateo Ruiz. I am a paleontologist: I study life from long ago by digging up fossils.',
      'This quarry is in the dinosaur layer. The rock here formed about 70 million years ago, on the bank of a river.',
      'The grid strings split the quarry into squares, so we can map where every find comes from. Grab a tool and dig one square with me!',
    ],
    again: 'There is always more to find in the quarry. Want to dig a new square, or work on the logbook?',
    logbook: 'Great digging! Now let’s write up what we found in the logbook.',
    debrief: {
      text: 'Shells, bones and teeth are common fossils. Jellyfish fossils are very rare. Why?',
      options: [
        {
          text: 'Hard parts last long enough to turn to stone. Soft bodies rot away first.',
          correct: true,
          feedback: 'Yes! Hard parts last. Soft bodies almost always rot before they can become fossils.',
        },
        { text: 'There were no jellyfish long ago.', feedback: 'Jellyfish are very old animals. Think about what their bodies are made of.', misconception: 'soft-fossil' },
        { text: 'Jellyfish fossils are too small to dig up.', feedback: 'Some jellyfish are big. The trouble is what happens to a soft body.', misconception: 'wrong-reason' },
      ],
      hints: [
        'Think about a bone and a jellyfish. Which one lasts longer after the animal dies?',
        'A fossil takes a very long time to form. Soft bodies rot away first. Hard parts last.',
        'The answer is outlined: hard parts last; soft bodies rot first.',
      ],
    },
    done: 'The Quarry badge is yours! Hana is waiting at the Cliff Wall. The cliff tells the whole story of this valley.',
  },
  cliff: {
    id: 'cliff',
    name: 'The Cliff Wall',
    skill: 'Rock layers as a time record',
    intro: [
      'Hi! I am Hana Sato. I am a geologist: I read rocks, the way you read a book.',
      'This cliff is made of layers. Each layer was once mud or sand at the bottom of a sea, a swamp or a river. Over a very long time, it turned to rock.',
      'Layers pile up, one on top of another. So the bottom layer is the oldest. Let’s build the cliff from the bottom up, then find where each fossil belongs!',
    ],
    again: 'This cliff has millions of years of stories. Want to rebuild it, or work on the logbook?',
    logbook: 'You read that cliff like a real geologist! Now let’s write it up in the logbook.',
    debrief: {
      text: 'Shells of sea animals are high up in this dry cliff. How did they get there?',
      options: [
        {
          text: 'A sea once covered this place. The shells were buried where the animals lived.',
          correct: true,
          feedback: 'Yes! The rock with the shells formed under a sea. Over millions of years, the land rose and the sea went away.',
        },
        { text: 'Birds carried the shells up there.', feedback: 'The shells are inside the rock layer, all through it. Think about where that rock formed.', misconception: 'sea-carried' },
        { text: 'People brought them to make the cliff look nice.', feedback: 'The shells formed inside the rock, long before any people lived.', misconception: 'people-dinos' },
      ],
      hints: [
        'Look at the bottom layer. What lived in it?',
        'Each layer shows the place where it formed. Shells and trilobites lived in the sea.',
        'The answer is outlined: a sea once covered this place.',
      ],
    },
    done: 'The Cliff Wall badge is yours! You can read the story of this valley, layer by layer.',
  },
};

/** The plaster jacket, after a dig. */
export const JACKET = [
  'Every find goes in a plaster jacket, like a cast on a broken arm. It keeps the fossil safe on the way to the lab.',
  'And the map shows the square each find came from. Scientists can always tell where it was buried.',
];

export const QUARRY_TEXT = {
  startKeys: 'Pick a tool with 1, 2 or 3. Move round the squares with the arrow keys, and press Space to dig. Pebble can sniff with P.',
  startTouch: 'Pick a tool, then tap a square to dig it. Ask Pebble to sniff when you need a clue.',
  sniff: 'Pebble sniffs the ground. Woof! Look for the paw prints: a find is under one of those squares.',
  dirtOff: (sq: string) => `The loose dirt in ${sq} is off. Hard rock is under it.`,
  rockOff: (sq: string) => `The rock in ${sq} is broken. Only a thin last layer is left. Go gently!`,
  tooHard: 'The shovel bounces off. This is hard rock. Which tool breaks rock?',
  brushDirt: 'The brush is too slow for all this loose dirt. Which tool moves dirt fast?',
  brushRock: 'The brush is too soft for hard rock. Which tool breaks rock?',
  empty: (sq: string) => `${sq} is dug. Nothing here. Keep looking!`,
  doneHere: (sq: string) => `${sq} is dug already. Try another square.`,
  found: (aName: string, sq: string) => `You found ${aName} in ${sq}! Not a scratch on it.`,
  chipped: (aName: string, sq: string, tool: string) => `You found ${aName} in ${sq}, but the ${tool} chipped it. It is still a great find. Next time, try the brush for the last layer.`,
};

export const CLIFF_TEXT = {
  orderStart: 'Which layer goes at the very bottom of the cliff?',
  orderDone: 'The cliff is built! Oldest at the bottom, youngest on top.',
  fossilAsk: (aName: string) => `Hana found ${aName} in the cliff. Which layer did it come from?`,
  fossilRight: (name: string, layer: string) => `Yes! The ${name} came from ${layer}.`,
  matchAsk: (name: string) => `Across the valley is another cliff. It has ${name} fossils too. Which layer on this side matches?`,
  matchWhy: (name: string) => `Look for the layer with the same ${name} fossils on both sides.`,
  allDone: 'You rebuilt the cliff and put every fossil in its place!',
};

/** When a station is not open yet. */
export const LOCKED = {
  cliff: 'Hi! I am Hana. The cliff is a big puzzle. Help Dr. Mateo in the quarry first, then come and see me.',
  sam: 'Hi, I am Sam! My Prep Lab is where we clean fossils out of their rock. It opens soon: come back in the next update of the game.',
  museum: 'The field museum is still being set up. Soon the Triceratops skeleton goes in here!',
  trackway: 'These are real dinosaur footprints. Ranger Tala will show you how to read them soon.',
};

/** Ranger Tala, once the quarry and the cliff are done (the end of half 1). */
export const HALF_DONE = [
  'You dug in the quarry and read the cliff, like a real fossil hunter!',
  'Sam’s Prep Lab and the Trackway open next. Then the field museum, and the Triceratops skeleton. Keep exploring until then!',
];

/** Short praise for right answers (one after another, so it does not repeat). */
const PRAISE = ['Great thinking!', 'You got it!', 'Yes! Well done.', 'Spot on!', 'That’s right!', 'Nice work, fossil hunter!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

export const GROWNUPS: GrownupsContent = {
  game: 'Fossil Dig Adventure',
  grades: 'Grades 3–5',
  summary:
    'Your child joins a fossil dig in a dry, striped valley. With Dr. Mateo Ruiz, a paleontologist, Hana Sato, a geologist, and Pebble the sniffer dog, they dig squares of a quarry with the right tools (a shovel for loose dirt, a rock pick for hard rock and a gentle brush near a fossil), map each find and wrap it in a plaster jacket. At the Cliff Wall they rebuild the valley’s rock layers from the bottom up, put each fossil in the layer it came from, and match a layer across the valley. Each station has a logbook of questions at three levels. Finds go into the Fossil Drawer. This first part covers the Quarry and the Cliff Wall; the Prep Lab, the Trackway and the Museum Night come next.',
  teaches: [
    {
      title: 'The Quarry: what a fossil is and how it forms',
      text: 'A fossil is what is left of a living thing from long ago, or a sign it left (a footprint, a burrow, fossil poop). Hard parts like bones, teeth and shells last best. A fossil forms when mud or sand buries something quickly and, over millions of years, minerals turn it to stone. Most living things never become fossils. Wind and water wear rock away and uncover them. Near a fossil, careful tools matter, and every find is mapped.',
    },
    {
      title: 'The Cliff Wall: rock layers as a time record',
      text: 'Layers pile up over time, so the bottom layer is the oldest (superposition). The rock and fossils in a layer show where it formed: shells mean a sea, ferns and coal a swamp, ripple marks a river or beach. The same fossil in two far-apart cliffs means the layers formed at the same time (an index fossil). At level 3: a crack that cuts the layers is younger than they are, the river carved the canyon after the layers formed, and a missing layer was worn away.',
    },
    {
      title: 'Mistakes and hints',
      text: 'Every wrong answer gets one sentence about the likely mistake (for example "fossils are the real, original bones" or "the bottom layer is the youngest"). Hints go from a nudge, to a picture, to the answer outlined. Hints never cost progress; a star is for getting it right the first time.',
    },
  ],
  standards: [
    { code: 'NGSS 3-LS4-1', text: 'Fossils give evidence about the organisms and the environments in which they lived long ago.' },
    { code: 'NGSS 4-ESS1-1', text: 'Patterns in rock layers and fossils show changes in a landscape over time.' },
    { code: 'NGSS 4-ESS2-1', text: 'Weathering and erosion by water and wind (uncovering fossils, carving canyons).' },
  ],
  talk: [
    'What is a fossil? Is a fossil the real bone?',
    'Why are bones and shells common fossils, but jellyfish rare?',
    'In a pile of rock layers, which one is the oldest? How do you know?',
    'Sea shells are in a cliff in the desert. What does that tell us?',
    'Why do scientists map where every fossil was found?',
  ],
  help: [
    'Levels go up after two right answers in a row, and down after two misses, so the questions fit your child.',
    'Nothing is timed and nothing is lost: a chipped fossil still goes into the drawer, and Pebble can point to the next find.',
    'A station is finished after its hands-on job, five stars in the logbook and a talk-it-through question.',
    'Every question can be read aloud, and hints never cost progress.',
  ],
  simplifies: [
    'The valley is made up, but each layer is true to life. Ages are rounded: the sea layer about 400 million years, the swamp about 300 million, the dinosaur layer about 70 million and the Ice Age layer about 20,000 years.',
    'A real quarry square takes days or weeks to dig. Here it takes a few minutes, and each square has several finds close together.',
    'Real dig sites use many more tools (dental picks, awls, glue, sieves). The game keeps three that show the idea: big tools far from a fossil, gentle tools close to it.',
    'Pebble is a game idea, but real dogs have been trained to find old bones at dig sites.',
  ],
  credits: [
    'Learning design based on the original Fossil Dig Adventure game, rebuilt by Learning Adventures. Facts from the old game were corrected: woolly mammoth tusks grew up to about 4 meters (not 16 feet), the times are named simply instead of mixing eras and periods, and pterosaurs are flying reptiles, not dinosaurs.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Facts checked against the Smithsonian National Museum of Natural History, the U.S. National Park Service (fossils, rock layers and Petrified Forest National Park), the Natural History Museum (London) and the American Museum of Natural History.',
  ],
};
