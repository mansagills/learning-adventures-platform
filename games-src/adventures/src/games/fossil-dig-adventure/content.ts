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
  lab: {
    id: 'lab',
    name: 'The Prep Lab',
    skill: 'What fossils tell about life long ago',
    intro: [
      'Hi, I am Sam Bello! I am a fossil preparator. I clean fossils out of their rock, so scientists can study them.',
      'Your finds from the quarry are here in their plaster jackets. Each one is still stuck in rock.',
      'Use the tiny air chisel on plain rock. Near the fossil, use the soft brush. If you see a crack, glue it. Let’s clean one together!',
    ],
    again: 'There are more jackets to open. Want to clean another fossil, or work on the logbook?',
    logbook: 'Beautiful work! Now let’s write down what our fossils tell us, in the logbook.',
    debrief: {
      text: 'A mammoth tusk looks a lot like an elephant’s. A fern fossil looks like a fern today. What can fossils tell us?',
      options: [
        {
          text: 'What living things were like long ago, and how they are related to living things today.',
          correct: true,
          feedback: 'Yes! Fossils are clues about life long ago, and about the families of animals and plants alive now.',
        },
        { text: 'Only how old the rock is.', feedback: 'Fossils help date rock, but they tell us much more about the living things too.', misconception: 'wrong-reason' },
        { text: 'Nothing, because the animals are gone.', feedback: 'The animals are gone, but their fossils are full of clues.', misconception: 'extinct-hiding' },
      ],
      hints: [
        'Think about the tusk and the elephant. What did comparing them tell us?',
        'Fossils show shapes, teeth and sizes. We compare them with living things to learn how they lived.',
        'The answer is outlined: what living things were like, and how they are related to life today.',
      ],
    },
    done: 'The Prep Lab badge is yours! The Triceratops legs go to the museum. Ranger Tala is waiting at the footprint slab.',
  },
  trackway: {
    id: 'trackway',
    name: 'The Trackway',
    skill: 'Footprints as clues',
    intro: [
      'You made it to the trackway! These dents in the slab are real dinosaur footprints, turned to stone.',
      'Footprints are trace fossils. They do not show the animal’s body. They show what it did: where it walked, and how fast.',
      'Pebble left prints in the creek mud too, walking and running. Grab the tape measure and let’s read these tracks!',
    ],
    again: 'The tracks are always here. Want to measure them again, or work on the logbook?',
    logbook: 'Great tracking! Let’s write down what the footprints told us, in the logbook.',
    debrief: {
      text: 'Nobody saw this dinosaur walk. So how can we know it started to run?',
      options: [
        { text: 'Its steps got longer, like Pebble’s do when running.', correct: true, feedback: 'Yes! We compare with animals today. Longer steps mean faster feet.' },
        { text: 'Its prints got deeper as it got older.', feedback: 'All the prints were made in a few seconds. Look at the space between them.', misconception: 'big-old' },
        { text: 'We just have to guess.', feedback: 'We do not guess. The prints are measured clues.', misconception: 'wrong-reason' },
      ],
      hints: [
        'Think about what the tape measured between the prints.',
        'Pebble’s running prints were far apart. The dinosaur’s were too, at the end.',
        'The answer is outlined: its steps got longer, like Pebble’s when running.',
      ],
    },
    done: 'The Trackway badge is yours! The Triceratops tail goes to the museum. And that is every station!',
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
  lab: 'Hi, I am Sam! My Prep Lab is where we clean fossils out of their rock. Finish the Cliff Wall with Hana first, then bring me your finds.',
  museum: 'The field museum is getting ready. When all four stations are done, the Triceratops skeleton goes in here!',
};

export const PREP_TEXT = {
  startKeys: 'Pick a tool with 1, 2 or 3. Move round the squares with the arrow keys, and press Space to use the tool.',
  startTouch: 'Pick a tool, then tap a square of the rock.',
  cleared: 'That rock is off.',
  revealed: 'The brush sweeps the dust away. There is the fossil!',
  oldCrack: 'The dust is off. Look: an old crack, from being buried. Glue will fix it.',
  cracked: 'Crack! The air chisel shook the fossil. Use the brush next to the fossil. Now glue the crack.',
  glued: 'The crack is glued. The fossil is safe.',
  tooSlow: 'The brush is too slow for hard rock. Which tool takes off rock fast?',
  noCrack: 'Glue is only for cracks. There is no crack here.',
  crackHere: 'This square has a crack. Which tool fixes cracks?',
  doneHere: 'This square is clean already.',
  left: (n: number) => `Squares still to clean: ${n}`,
  clean: 'All clean!',
  done: (name: string) => `The ${name} is clean and ready to study!`,
};

/** What Sam tells about each quarry find once it is clean (what it tells us about life long ago). */
export const PREP_TELLS: Record<string, string> = {
  amber: 'Look closely at this amber: a tiny insect is trapped inside! Amber keeps soft little bodies that rock almost never does.',
  'trex-tooth': 'See the jagged edges, like a steak knife? Teeth like this slice meat. This tooth tells us T. rex was a meat eater.',
  'trike-horn': 'This horn is from a Triceratops, a plant eater. It may have used its horns to show off, or to defend itself.',
  'raptor-claw': 'This curved claw was held up off the ground, so it stayed sharp. Its owner was a small, quick hunter with feathers.',
  'pterosaur-bone': 'Feel how light this bone is? It is hollow. Light bones helped this flying reptile take off.',
  eggshell: 'Eggshell tells us dinosaurs laid eggs, like birds do. Some even cared for their babies in nests.',
  coprolite: 'Fossil poop! Tiny bits of bone inside tell us its owner ate other animals.',
};

export const TRACK_TEXT = {
  start: 'Tap the glowing circle to lay the tape measure.',
  measureAsk: (what: 'print' | 'walk' | 'run', next: string) =>
    what === 'print' ? `Measure one print. Tap ${next}.` : what === 'walk' ? `Measure a step at the start of the trackway. Tap ${next}.` : `Measure a step near the end of the trackway. Tap ${next}.`,
  printRead: (cm: number) => `The print is ${cm} centimeters long, from toe tip to heel.`,
  walkRead: (m: number) => `At the start, the steps are ${m} meters long.`,
  runRead: (m: number) => `Near the end, the steps are ${m} meters long. Twice as long!`,
  runAsk: 'The steps got longer. Look at Pebble’s prints in the mud: close together when walking, far apart when running. What was the dinosaur doing at the end?',
  runDone: 'It started to run! Longer steps mean faster feet.',
  crossAsk: 'The big round prints are pressed on top of the three-toed path. Which animal walked here first?',
  crossDone: 'The three-toed dinosaur walked by first. The round-footed one came later and stepped over its prints.',
  hipAsk: (cm: number) => `Scientists use a rule: the hip height is about 4 times the print’s length. This print is ${cm} centimeters long. About how high were its hips?`,
  hipDone: (h: string) => `About ${h}! Taller than a grown-up’s hips.`,
  allDone: 'You read the whole trackway!',
};

/** Ranger Tala, once all four stations are done. */
export const ALL_DONE = [
  'You dug, read the cliff, cleaned fossils and followed the tracks. You are a real fossil hunter!',
  'Tonight is Museum Night. Dr. Mateo is waiting at the field museum. Go and put the Triceratops together!',
];

/** The finale at the field museum, at dusk. */
export const MUSEUM = {
  invite: 'That was the last station! The sun is setting. Meet me at the field museum: tonight we put our Triceratops together.',
  intro: [
    'Welcome to Museum Night! Every station gave us a part of the young Triceratops: the skull, the backbone, the legs and the tail.',
    'Let’s put the skeleton together on its stand. I will name a part, and you tap where it goes.',
  ],
  partAsk: (part: string) => `Where does the ${part} go?`,
  partWrong: (part: string) => `That is a different part. Look for the ${part}.`,
  built: 'The skeleton is together! A young Triceratops, standing for the first time in 66 million years.',
  nameAsk: 'Every museum fossil gets a nickname. What should we call our Triceratops?',
  named: (n: string) => `${n} it is! Welcome to the museum, ${n}.`,
  muralIntro: [
    'Hana painted the story of this valley on the wall. But the five scenes are mixed up!',
    'Put them in order, from the oldest scene to the youngest. I will ask about each one as it goes up.',
  ],
  muralAsk: (n: number) => (n === 0 ? 'Which scene is the oldest?' : 'Which scene comes next?'),
  muralWrong: 'Not that one yet. Think about the cliff: which layer is lower down?',
  muralDone: 'The whole story of the valley, from the old sea to today!',
  noStars: 'No stars tonight, just a review. Here comes the first question.',
  glowIntro: ['One last surprise. Sam has an ultraviolet lamp. Ultraviolet light is invisible to us, but it makes some minerals glow.', 'Ready? Turn off the lights, and turn on the lamp!'],
  glowLines: [
    'Look! Many fossils glow under ultraviolet light. Minerals that took the place of the bone and shell give off light we can see.',
    'Scientists really use ultraviolet lamps. The glow can show details that are hard to see in normal light, like the edges of bones and tiny cracks.',
  ],
  glowEnd: (n: string) => `What a night. You found fossils, read the rocks, followed the tracks and brought ${n} back together. Thank you, fossil hunter!`,
  notYet: 'The museum is almost ready. Finish all four stations, and then come back at Museum Night.',
};

/** The mural's scenes, oldest first (the layer each one shows), and a question for each as it goes up (no stars). */
export const MURAL_QUESTIONS: Record<string, TalkQuestion> = {
  sea: {
    text: 'In the oldest scene, this valley was a shallow sea. Which fossil comes from it?',
    options: [
      { text: 'A trilobite', correct: true, feedback: 'Yes! Trilobites crawled on that old sea floor.' },
      { text: 'A T. rex tooth', feedback: 'T. rex came much later, on the river plain.', misconception: 'layers-random' },
      { text: 'A mammoth tusk', feedback: 'Mammoths came much, much later, in the Ice Age.', misconception: 'layers-random' },
    ],
    hints: ['Which animals lived in the sea?', 'Trilobites and ammonites are in the bottom layer of the cliff.', 'The answer is outlined: a trilobite.'],
  },
  swamp: {
    text: 'Next came a swamp forest. Its plants were buried and squeezed for millions of years. What did they turn into?',
    options: [
      { text: 'Coal', correct: true, feedback: 'Yes! The dark seam in the swamp layer is coal.' },
      { text: 'Sand', feedback: 'Sand is made of tiny bits of rock, not old plants.', misconception: 'rock-env' },
      { text: 'Amber', feedback: 'Amber is hardened tree sap, not squeezed plants.', misconception: 'wrong-reason' },
    ],
    hints: ['Look for the dark stripe in the swamp layer.', 'Squeezed plants slowly turn into a black rock that burns.', 'The answer is outlined: coal.'],
  },
  river: {
    text: 'Then came a river plain, about 70 million years ago. Which animal lived here then?',
    options: [
      { text: 'Triceratops', correct: true, feedback: 'Yes! Our Triceratops lived on this river plain.' },
      { text: 'A woolly mammoth', feedback: 'Mammoths came in the Ice Age, long after the dinosaurs.', misconception: 'layers-random' },
      { text: 'People', feedback: 'People came about 66 million years after the last big dinosaurs.', misconception: 'people-dinos' },
    ],
    hints: ['Which layer did the quarry dig into?', 'The dinosaur layer is from the time of the dinosaurs.', 'The answer is outlined: Triceratops.'],
  },
  ice: {
    text: 'Long after the dinosaurs, the Ice Age came. Cold grassland covered the valley. Which animal fits this scene?',
    options: [
      { text: 'A woolly mammoth', correct: true, feedback: 'Yes! Thick fur kept mammoths warm in the cold.' },
      { text: 'A T. rex', feedback: 'T. rex died out about 66 million years before the Ice Age.', misconception: 'layers-random' },
      { text: 'A trilobite', feedback: 'Trilobites lived in the sea, hundreds of millions of years earlier.', misconception: 'layers-random' },
    ],
    hints: ['Which animal had thick fur for the cold?', 'The Ice Age layer is near the top of the cliff.', 'The answer is outlined: a woolly mammoth.'],
  },
  today: {
    text: 'Today the valley is dry badlands, and fossils keep turning up. What uncovers them?',
    options: [
      { text: 'Wind and water slowly wearing the rock away', correct: true, feedback: 'Yes! Every rainstorm uncovers a little more.' },
      { text: 'The fossils climb up by themselves', feedback: 'Fossils are stone. They cannot move.', misconception: 'wrong-reason' },
      { text: 'Nothing: every fossil is already found', feedback: 'New fossils turn up every year, as the rock wears away.', misconception: 'wrong-reason' },
    ],
    hints: ['What happens to the badlands when it rains?', 'Water and wind wear rock away, bit by bit.', 'The answer is outlined: wind and water wearing the rock away.'],
  },
};

/** Short praise for right answers (one after another, so it does not repeat). */
const PRAISE = ['Great thinking!', 'You got it!', 'Yes! Well done.', 'Spot on!', 'That’s right!', 'Nice work, fossil hunter!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

export const GROWNUPS: GrownupsContent = {
  game: 'Fossil Dig Adventure',
  grades: 'Grades 3–5',
  summary:
    'Your child joins a fossil dig in a dry, striped valley. With Dr. Mateo Ruiz, a paleontologist, Hana Sato, a geologist, and Pebble the sniffer dog, they dig squares of a quarry with the right tools (a shovel for loose dirt, a rock pick for hard rock and a gentle brush near a fossil), map each find and wrap it in a plaster jacket. At the Cliff Wall they rebuild the valley’s rock layers from the bottom up, put each fossil in the layer it came from, and match a layer across the valley. Each station has a logbook of questions at three levels. With Sam Bello, a fossil preparator, they clean one of their finds out of its rock (an air chisel for rock, a brush near the fossil, glue for cracks) and work out what fossils tell us about life long ago. With Ranger Tala and Pebble they measure real dinosaur footprints with a tape and read the story of the tracks. Each station has a logbook of questions at three levels, and finds go into the Fossil Drawer. The finale is Museum Night: they put the young Triceratops skeleton together, name it, put the valley’s story in order on a mural (a question for each scene), and see fossils glow under an ultraviolet lamp.',
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
      title: 'The Prep Lab: what fossils tell about life long ago',
      text: 'Fossils can be compared with living things: a mammoth with an elephant, an ammonite with a nautilus, a trilobite with a horseshoe crab, old ferns with ferns today. Teeth show diet (knife teeth for meat, beaks and slicing teeth for plants), and fossil poop shows what was eaten. Sea shells high on land show that a sea was once there, and ferns in a frozen place show that it was once warm. At level 3: extinct means gone forever, birds are living dinosaurs, pterosaurs were flying reptiles but not dinosaurs, footprints and burrows are trace fossils, and Velociraptor was turkey-sized.',
    },
    {
      title: 'The Trackway: footprints as clues',
      text: 'Three pointed toes come from two-legged dinosaurs, big round prints from heavy four-legged plant eaters. Bigger prints mean bigger animals. Longer steps mean running (compared with Pebble’s walking and running prints in the mud). Many trackways side by side show a group. At level 3: hip height is about 4 times the footprint’s length (a rule of thumb paleontologists use), and prints pressed on top of others came later.',
    },
    {
      title: 'Museum Night',
      text: 'The four parts of the skeleton (one from each station) go together on a stand, the child names the Triceratops, and the valley’s five scenes go in order on a mural, oldest first, with one review question each. Then an ultraviolet lamp makes many fossils glow, as scientists use it to spot hidden details.',
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
    { code: 'NGSS 4-LS1-1', text: 'Animals have structures that support survival (teeth for meat or plants, horns, claws, hollow bones).' },
  ],
  talk: [
    'What is a fossil? Is a fossil the real bone?',
    'Why are bones and shells common fossils, but jellyfish rare?',
    'In a pile of rock layers, which one is the oldest? How do you know?',
    'Sea shells are in a cliff in the desert. What does that tell us?',
    'Why do scientists map where every fossil was found?',
    'Which animal alive today is a cousin of the woolly mammoth? How can you tell?',
    'How could you tell from footprints that an animal was running?',
    'Is a bird a dinosaur? What clues do scientists use?',
  ],
  help: [
    'Levels go up after two right answers in a row, and down after two misses, so the questions fit your child.',
    'Nothing is timed and nothing is lost: a chipped fossil still goes into the drawer, and Pebble can point to the next find.',
    'A station is finished after its hands-on job, five stars in the logbook and a talk-it-through question. Museum Night opens when all four stations are done.',
    'Every question can be read aloud, and hints never cost progress.',
  ],
  simplifies: [
    'The valley is made up, but each layer is true to life. Ages are rounded: the sea layer about 400 million years, the swamp about 300 million, the dinosaur layer about 70 million and the Ice Age layer about 20,000 years.',
    'A real quarry square takes days or weeks to dig. Here it takes a few minutes, and each square has several finds close together.',
    'Real dig sites use many more tools (dental picks, awls, glue, sieves). The game keeps three that show the idea: big tools far from a fossil, gentle tools close to it.',
    'Pebble is a game idea, but real dogs have been trained to find old bones at dig sites.',
    'Cleaning a real fossil out of its rock can take a preparator weeks or months under a microscope. The bench shows the idea in a few minutes.',
    'The horseshoe crab is a look-alike, not a close cousin, of the trilobite: both are arthropods with hard shells, which is why the game says "looks a lot like".',
    'The hip height rule (about 4 times the footprint’s length) is a rough rule of thumb; real estimates also depend on the kind of dinosaur. The trackway’s measurements are rounded.',
    'In real museums, skeletons are often mounted with some casts (copies) of bones that were never found. Here the four stations give the four parts.',
  ],
  credits: [
    'Learning design based on the original Fossil Dig Adventure game, rebuilt by Learning Adventures. Facts from the old game were corrected: woolly mammoth tusks grew up to about 4 meters (not 16 feet), the times are named simply instead of mixing eras and periods, and pterosaurs are flying reptiles, not dinosaurs.',
    'Art, music and sound by Learning Adventures, made in code. No images, sounds or fonts are loaded from other websites.',
    'Facts checked against the Smithsonian National Museum of Natural History, the U.S. National Park Service (fossils, rock layers and Petrified Forest National Park), the Natural History Museum (London) and the American Museum of Natural History.',
  ],
};
