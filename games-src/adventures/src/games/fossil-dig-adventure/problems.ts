/**
 * Fossil Dig Adventure: the science, as data and pure functions (no drawing,
 * no timers) so every rule can be unit tested.
 *
 * Each station ends at a logbook of questions at three levels. There are
 * four stations:
 *   The Quarry (Dr. Mateo Ruiz): what a fossil is and how it forms
 *     1. what counts as a fossil, hard parts last, the brush near a bone,
 *        people and dinosaurs never met, quick burial, Pebble's find
 *     2. minerals replace bone, it takes a very long time, most living
 *        things never become fossils, erosion uncovers them, mapping the
 *        grid, plaster jackets (3-LS4-1, 4-ESS2-1)
 *     3. why jellyfish fossils are rare, the best place to become a fossil,
 *        trace fossils, what a coprolite tells, chipped bones, shed teeth
 *   The Cliff Wall (Hana Sato): rock layers as a record of time
 *     1. the bottom layer is the oldest, the top the youngest, a stack of
 *        newspapers, sea shells mean a sea, ferns and coal mean a swamp,
 *        mammoths above the dinosaurs
 *     2. index fossils match layers far apart, sea shells high on land,
 *        ripple marks, thickness is not age, ages and order, a fossil in
 *        the wrong layer (4-ESS1-1)
 *     3. a fault is younger than what it cuts, the layers came before the
 *        canyon, a gap where rock was worn away, the land changed, where to
 *        look for dinosaurs, today's mud goes on top (4-ESS1-1, 4-ESS2-1)
 *   The Prep Lab (Sam Bello): what fossils tell about life long ago
 *     1. living cousins (mammoth and elephant, ammonite and nautilus,
 *        trilobite and horseshoe crab, ferns), gentle tools, glue
 *     2. teeth tell what it ate, sea shells on a hill, ferns in the cold,
 *        what fossil poop holds, big bones (3-LS4-1, 4-LS1-1)
 *     3. extinct means gone forever, birds are living dinosaurs,
 *        pterosaurs were not dinosaurs, trace fossils, the real size of
 *        Velociraptor, bone turned to stone
 *   The Trackway (Ranger Tala and Pebble): footprints as clues
 *     1. three toes or round feet, bigger prints, one line, soft mud,
 *        Pebble walking and running
 *     2. longer steps mean running, groups, 10 times longer, footprints are
 *        trace fossils, speeding up, which way it went
 *     3. hip height is about 4 times the print, prints on top came later,
 *        the age of the rock, young ones in a herd (3-LS4-1, 4-ESS1-1)
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the
 * answer away.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

import type { FossilId } from '../../kit/worlds/wild-lands/dig-art';
import type { LayerId } from './fossils';

export type Station = 'quarry' | 'cliff' | 'lab' | 'trackway';
export const STATIONS: Station[] = ['quarry', 'cliff', 'lab', 'trackway'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'rock-fossil' // thinks any old rock is a fossil
  | 'fast-fossil' // thinks fossils form in days or years
  | 'soft-fossil' // thinks soft body parts fossilize as easily as hard ones
  | 'rough-tools' // thinks speed matters more than care near a fossil
  | 'people-dinos' // thinks people and dinosaurs lived at the same time
  | 'extinct-hiding' // thinks extinct animals are hiding somewhere
  | 'buried-needed' // does not see that quick burial is needed
  | 'real-bone' // thinks a fossil is the original bone
  | 'all-dinosaurs' // thinks every fossil is a dinosaur
  | 'all-fossilize' // thinks every living thing becomes a fossil
  | 'map-pointless' // does not see why finds are mapped
  | 'trace-not-fossil' // thinks footprints, burrows and dung are not fossils
  | 'diet-mixup' // mixed up what an animal ate
  | 'wrong-reason' // gave a reason that does not explain it
  | 'young-bottom' // thinks the bottom layer is the youngest
  | 'layers-random' // thinks layers have no order in time
  | 'rock-env' // does not read the past place from the rock and fossils
  | 'sea-carried' // thinks sea fossils on land were carried there
  | 'index-mixup' // mixed up what matching fossils show
  | 'thick-old' // thinks a thicker layer is older
  | 'fault-older' // thinks a crack is older than the layers it cuts
  | 'canyon-first' // thinks the canyon formed before the layers
  | 'gap-missing' // does not see that layers can be worn away, leaving a gap
  | 'relative-mixup' // picked the wrong living cousin
  | 'birds-not-dinos' // thinks birds are not related to dinosaurs
  | 'raptor-huge' // thinks Velociraptor was huge, as in films
  | 'big-old' // thinks a bigger print or bone means an older animal
  | 'far-walk' // thinks prints far apart mean walking slowly
  | 'toes-mixup' // misreads the toes of a print
  | 'group-random' // misreads one trackway or many
  | 'crossing-order' // thinks a print on top came first
  | 'measure-mixup' // adds or subtracts instead of comparing
  | 'hip-rule'; // misuses the hip height rule (4 times the print)

/** What the panel shows above the question (the words in the question match it). */
export type Pic =
  /** One fossil on its card. */
  | { k: 'fossil'; id: FossilId }
  /** The quarry square from above, mid-dig. */
  | { k: 'quarry' }
  /** The shovel, the rock pick and the brush. */
  | { k: 'tools' }
  /** How a fossil forms, in four steps: alive, buried in mud, turned to stone, uncovered. */
  | { k: 'form'; step: 0 | 1 | 2 | 3 }
  /** The cliff's layers up close, with one layer (or the crack) marked. */
  | { k: 'cliff'; mark: LayerId | 'fault' | null }
  /** Two cliffs far apart, with the same ammonite layer in each. */
  | { k: 'match' }
  /** A fossil next to its living cousin (or look-alike). */
  | { k: 'relative'; id: FossilId }
  /** A meat eater's knife tooth, or a plant eater's rows of teeth. */
  | { k: 'teeth'; kind: 'sharp' | 'flat' }
  /** A fossil in its rock on Sam's prep bench, half cleaned. */
  | { k: 'prep' }
  /** The young Triceratops skeleton. */
  | { k: 'skeleton' }
  /** The trackway slab from above. */
  | { k: 'tracks' }
  /** A three-toed print and a big round print, side by side. */
  | { k: 'prints' }
  /** Pebble's prints walking (close) and running (far apart). */
  | { k: 'stride' }
  /** A dinosaur side on, with its footprint and its hip height. */
  | { k: 'hip' };

/** The picture model that hint 2 adds (or that changes the picture itself). */
export type Model = 'form' | 'cliff' | 'tools' | 'card' | 'match' | 'stack' | 'relative' | 'teeth' | 'tracks' | 'prints' | 'stride' | 'hip';

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
  station: Station;
  tier: Tier;
  ask: string;
  choices: Choice[];
  explain: string;
  hints: [string, string];
  pic: Pic;
  model: Model;
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
}

const fossil = (id: FossilId): Pic => ({ k: 'fossil', id });
const cliff = (mark: LayerId | 'fault' | null = null): Pic => ({ k: 'cliff', mark });

// ------------------------------------------------------------------ the Quarry (Dr. Mateo)

const QUARRY: QDef[] = [
  // level 1
  {
    id: 'q-what',
    tier: 1,
    ask: 'A fossil is what is left of a living thing from long, long ago. Which of these is a fossil?',
    right: 'A dinosaur tooth turned to stone',
    wrong: [
      ['A shiny pebble from the creek', 'rock-fossil', 'A pebble is just rock. It was never part of a living thing.'],
      ['A chicken bone from last week', 'fast-fossil', 'That bone is far too new. Fossils are thousands or millions of years old.'],
    ],
    explain: 'A fossil is the remains of a living thing, or a sign it left, kept in rock from long ago.',
    hints: ['A fossil has to come from something that was once alive. It also has to be very old.', 'Look at the steps: an animal lives, it is buried, and over a very long time it turns to stone.'],
    pic: { k: 'quarry' },
    model: 'form',
  },
  {
    id: 'q-hard-parts',
    tier: 1,
    ask: 'Bones, teeth and shells are hard. Skin and muscle are soft, and they rot away fast. Which part is most likely to become a fossil?',
    right: 'A tooth',
    wrong: [
      ['An eyeball', 'soft-fossil', 'Eyes are soft. They rot away long before they could turn to stone.'],
      ['A muscle', 'soft-fossil', 'Muscle is soft and rots fast, so it is very rarely kept.'],
    ],
    explain: 'Hard parts like teeth, bones and shells last long enough to be buried and turn to stone.',
    hints: ['Which part is hard enough to last a long time?', 'Soft parts rot in days. Hard parts can last until mud covers them.'],
    pic: fossil('trex-tooth'),
    model: 'card',
  },
  {
    id: 'q-brush',
    tier: 1,
    ask: 'Dr. Mateo has a shovel, a rock pick and a small brush. Only a thin layer of dirt covers a bone now. Which tool should you use?',
    right: 'The small brush',
    wrong: [
      ['The shovel', 'rough-tools', 'A shovel scoops big loads. It could crack the bone.'],
      ['The rock pick', 'rough-tools', 'A pick is for hard rock. Next to a bone, it can chip it.'],
    ],
    explain: 'Near a bone, diggers use a gentle brush. Shovels and picks are for dirt and rock far from any fossil.',
    hints: ['The bone is very close. Which tool is the gentlest?', 'Big tools move dirt fast but can break things. Small, soft tools are slow but safe.'],
    pic: { k: 'tools' },
    model: 'tools',
  },
  {
    id: 'q-people-dinos',
    tier: 1,
    ask: 'The last big dinosaurs died out about 66 million years ago. The first people lived about 300,000 years ago. Did any person ever see a living T. rex?',
    right: 'No, they lived millions of years apart',
    wrong: [
      ['Yes, cave people hunted them', 'people-dinos', 'Some films show this, but millions of years separate them.'],
      ['Yes, a few still hide in jungles', 'extinct-hiding', 'Extinct means gone forever. No T. rex is hiding anywhere.'],
    ],
    explain: 'T. rex died out about 66 million years before the first people. We know about it only from fossils.',
    hints: ['Compare the two numbers: 66 million and 300,000. Which is far bigger?', 'The dinosaurs were gone for a very, very long time before any people lived.'],
    pic: fossil('trex-tooth'),
    model: 'card',
  },
  {
    id: 'q-buried',
    tier: 1,
    ask: 'Most dead animals get eaten or rot away. A body buried fast in mud is protected. Which one has the best chance to become a fossil?',
    right: 'One buried quickly in river mud',
    wrong: [
      ['One left lying on open ground', 'buried-needed', 'Out in the open, animals eat it and rain breaks it apart.'],
      ['One floating on a lake', 'buried-needed', 'It has to be covered by mud or sand to be kept.'],
    ],
    explain: 'Quick burial in mud or sand keeps a body away from hungry animals and weather. That is the first step to a fossil.',
    hints: ['What keeps a body safe from animals and rain?', 'Look at step 2: mud covers the bones and protects them.'],
    pic: { k: 'form', step: 1 },
    model: 'form',
  },
  {
    id: 'q-pebble',
    tier: 1,
    ask: 'Pebble sniffs the ground and starts to dig. Dr. Mateo calls Pebble back and reaches for a brush. Why?',
    right: 'A fossil might be just under the dirt',
    wrong: [
      ['Dogs are not allowed in the quarry', 'wrong-reason', 'Pebble helps at the dig. Think about what she might have found.'],
      ['Brushing is faster than digging', 'rough-tools', 'A brush is slow. It is used because it is gentle.'],
    ],
    explain: 'Pebble may have found a fossil close to the surface, so Dr. Mateo switches to a gentle brush.',
    hints: ['What does Pebble sniff for at the dig?', 'When a find is close, the team only uses gentle tools.'],
    pic: { k: 'quarry' },
    model: 'tools',
  },
  // level 2
  {
    id: 'q-minerals',
    tier: 2,
    ask: 'Over a very long time, water seeps through a buried bone. Minerals in the water fill its tiny holes and replace it. What is a fossil bone made of?',
    right: 'Stone made of minerals',
    wrong: [
      ['The same bone as before', 'real-bone', 'The minerals took the place of the bone, bit by bit.'],
      ['Dried-up mud', 'wrong-reason', 'Mud buried the bone, but water and minerals turned the bone itself to stone.'],
    ],
    explain: 'In most fossils, minerals slowly replace the bone. The fossil has the bone’s shape, but it is stone.',
    hints: ['What did the water carry into the bone?', 'Look at step 3: minerals fill and replace the bone over a very long time.'],
    pic: { k: 'form', step: 2 },
    model: 'form',
  },
  {
    id: 'q-how-long',
    tier: 2,
    ask: 'Bone turns to stone very slowly. It takes thousands or even millions of years. A bone buried last summer is not a fossil yet. Why not?',
    right: 'Not enough time has passed',
    wrong: [
      ['It is too small', 'wrong-reason', 'Small bones can become fossils. Think about how long it takes.'],
      ['Only dinosaur bones can become fossils', 'all-dinosaurs', 'Fish, shells, plants and mammals can become fossils too.'],
    ],
    explain: 'Turning to stone takes a very long time. Last summer is far too recent.',
    hints: ['How long does it take bone to turn to stone?', 'Thousands of years at least. One summer is nothing compared to that.'],
    pic: { k: 'form', step: 2 },
    model: 'form',
  },
  {
    id: 'q-most-never',
    tier: 2,
    ask: 'Billions of animals have lived on Earth. Only a tiny few became fossils. Why so few?',
    right: 'Most were eaten or rotted before mud covered them',
    wrong: [
      ['Only famous animals become fossils', 'wrong-reason', 'Nature does not know which animals are famous.'],
      ['They all did, we just have not found them', 'all-fossilize', 'Most living things never get buried in time, so no fossil forms.'],
    ],
    explain: 'To become a fossil, a living thing must be buried quickly and left alone for a very long time. That rarely happens.',
    hints: ['What has to happen first for a fossil to form?', 'Step 2 is the hard part: being buried before animals or weather get to it.'],
    pic: { k: 'form', step: 1 },
    model: 'form',
  },
  {
    id: 'q-erosion',
    tier: 2,
    ask: 'These fossils were deep underground for millions of years. Now they stick out of the bare hillside. What brought them near the surface?',
    right: 'Wind and rain wore the rock away',
    wrong: [
      ['The fossils grew upward like plants', 'wrong-reason', 'Fossils are stone. They cannot grow or move.'],
      ['A volcano blew them up here', 'wrong-reason', 'There is no volcano here. Look at the bare, worn hills.'],
    ],
    explain: 'Wind, rain and rivers slowly wear rock away. That uncovers fossils buried long ago. Badlands erode fast, so they are great places to look.',
    hints: ['The hills here are bare and crumbly. What keeps wearing them down?', 'Look at step 4: the rock on top is worn away, and the fossil shows.'],
    pic: { k: 'form', step: 3 },
    model: 'form',
  },
  {
    id: 'q-map',
    tier: 2,
    ask: 'Each find’s spot is marked on a map of the grid squares. Later, scientists can see how the bones lay together. Why does that help?',
    right: 'It shows which bones belong to the same animal',
    wrong: [
      ['It is just for decoration', 'map-pointless', 'Once a bone is lifted, its spot is lost unless it was written down.'],
      ['It tells how old the bones are', 'wrong-reason', 'The map shows where, not when. Rock layers help tell age.'],
    ],
    explain: 'Mapping each find shows how the bones lay. Bones lying together may come from one animal.',
    hints: ['What is lost when a bone is lifted out?', 'Its place. The map keeps a record of where every piece was.'],
    pic: { k: 'quarry' },
    model: 'tools',
  },
  {
    id: 'q-jacket',
    tier: 2,
    ask: 'Big fossils crack easily. Before lifting one, workers wrap it in cloth soaked in wet plaster. It dries hard, like a cast on a broken arm. Why?',
    right: 'To keep the fossil from breaking on the trip',
    wrong: [
      ['To make it look nicer', 'wrong-reason', 'Nobody sees the plaster in the end. It is there for a job.'],
      ['To keep it warm', 'wrong-reason', 'A fossil is stone. It does not need to stay warm.'],
    ],
    explain: 'The plaster jacket holds the fossil together while it travels to the lab, where it is cleaned.',
    hints: ['What does a cast do for a broken arm?', 'It holds it still and safe. The jacket does the same for a fossil.'],
    pic: { k: 'tools' },
    model: 'tools',
  },
  // level 3
  {
    id: 'q-jelly',
    tier: 3,
    ask: 'Jellyfish have no bones or shells. Clams have hard shells. Which one do we find far more often as fossils?',
    right: 'Clams',
    wrong: [
      ['Jellyfish', 'soft-fossil', 'Soft bodies rot fast, so jellyfish fossils are very rare.'],
      ['Both just as often', 'all-fossilize', 'Hard and soft bodies are not kept equally well.'],
    ],
    explain: 'Hard shells last long enough to be buried. Soft jellyfish usually rot first, so their fossils are rare.',
    hints: ['Which one has hard parts?', 'Hard parts last until mud covers them. Soft parts rot away first.'],
    pic: fossil('ammonite'),
    model: 'card',
  },
  {
    id: 'q-best-place',
    tier: 3,
    ask: 'Three animals died long ago. One sank to a muddy lake bottom. One died on a rocky mountain top. One died on a forest floor. Which is most likely found as a fossil?',
    right: 'The one on the muddy lake bottom',
    wrong: [
      ['The one on the mountain top', 'buried-needed', 'Up high, rock wears away. Nothing buries the body.'],
      ['The one on the forest floor', 'buried-needed', 'On the forest floor, bodies rot and get eaten before mud covers them.'],
    ],
    explain: 'Lakes, rivers and seas keep dropping mud and sand, which bury bodies quickly.',
    hints: ['Where does mud keep piling up?', 'Fossils form where bodies get buried fast: under water, where mud settles.'],
    pic: { k: 'form', step: 1 },
    model: 'form',
  },
  {
    id: 'q-trace',
    tier: 3,
    ask: 'Fossils are not only bones. A footprint, a burrow or even poop can turn to stone. These are called trace fossils. What does a trace fossil show?',
    right: 'Something an animal did, like walking or digging',
    wrong: [
      ['Only what its bones looked like', 'trace-not-fossil', 'A trace has no bones in it. It shows an action.'],
      ['Nothing, because it is not a real fossil', 'trace-not-fossil', 'Traces are real fossils. They turned to stone too.'],
    ],
    explain: 'Trace fossils show how animals lived: where they walked, dug, rested or ate.',
    hints: ['A footprint is not part of the body. What does it tell us instead?', 'It shows the animal walking there. Traces are clues about actions.'],
    pic: fossil('burrow'),
    model: 'card',
  },
  {
    id: 'q-coprolite',
    tier: 3,
    ask: 'This fossil is a coprolite: poop turned to stone. Inside it are tiny bits of crushed bone. What does that tell us?',
    right: 'This animal ate other animals',
    wrong: [
      ['This animal ate only plants', 'diet-mixup', 'Bits of bone come from eating animals, not plants.'],
      ['Nothing at all', 'trace-not-fossil', 'Poop is a great clue. What is inside shows what went in.'],
    ],
    explain: 'Bone bits in a coprolite show that the animal was a meat eater.',
    hints: ['What goes in comes out. What did this animal swallow?', 'Bone inside means it ate other animals.'],
    pic: fossil('coprolite'),
    model: 'card',
  },
  {
    id: 'q-chip',
    tier: 3,
    ask: 'A rock pick hit the edge of a horn and chipped it. The fossil was still found, but part of it broke. What should the team have done?',
    right: 'Switched to the brush near the fossil',
    wrong: [
      ['Dug faster with the shovel', 'rough-tools', 'Faster and rougher means more breaks.'],
      ['Nothing, chips do not matter', 'rough-tools', 'Broken bits can hide details scientists need, like marks from teeth.'],
    ],
    explain: 'Near a fossil, careful brushing protects it. Rough tools save time but can break what you came to find.',
    hints: ['Which tool is safe right next to a fossil?', 'Big tools far away, gentle tools up close.'],
    pic: fossil('trike-horn'),
    model: 'tools',
  },
  {
    id: 'q-teeth',
    tier: 3,
    ask: 'A T. rex lost teeth all its life and grew new ones. Sharks do too. Why are teeth like these found so often?',
    right: 'One animal left many teeth behind',
    wrong: [
      ['Teeth are softer than bone', 'wrong-reason', 'Teeth are the hardest part of the body, not the softest.'],
      ['Only teeth turn into fossils', 'all-fossilize', 'Bones, shells and plants become fossils too.'],
    ],
    explain: 'One animal could drop many teeth in its life. Teeth are also very hard, so they last.',
    hints: ['How many teeth could one T. rex lose in its life?', 'Lots. And every lost tooth could become a fossil.'],
    pic: fossil('trex-tooth'),
    model: 'card',
  },
];

// ------------------------------------------------------------------ the Cliff Wall (Hana)

const CLIFF: QDef[] = [
  // level 1
  {
    id: 'c-oldest',
    tier: 1,
    ask: 'Rock layers pile up one on top of another. The first layer laid down ends up at the bottom. Which layer is the oldest?',
    right: 'The bottom layer',
    wrong: [
      ['The top layer', 'young-bottom', 'The top layer was laid down last, so it is the youngest.'],
      ['The middle layer', 'layers-random', 'The layers went down in order, one at a time.'],
    ],
    explain: 'Layers stack up over time, so the bottom layer is the oldest and the top layer is the youngest.',
    hints: ['Which layer was laid down first?', 'Look at the arrow on the cliff. It points down to “older.”'],
    pic: cliff(null),
    model: 'stack',
  },
  {
    id: 'c-youngest',
    tier: 1,
    ask: 'This cliff has five layers. The top one has soil and plants growing in it today. Which layer is the youngest?',
    right: 'The top layer',
    wrong: [
      ['The bottom layer', 'young-bottom', 'The bottom layer was laid down first, so it is the oldest.'],
      ['They are all the same age', 'layers-random', 'Each layer was laid down at a different time.'],
    ],
    explain: 'The top layer is the youngest. Today’s soil is still forming on top.',
    hints: ['Which layer is still forming today?', 'New layers go on top of old ones.'],
    pic: cliff('today'),
    model: 'stack',
  },
  {
    id: 'c-book',
    tier: 1,
    ask: 'Hana says rock layers are like a stack of newspapers. Each day, the new paper goes on top. Where is the oldest paper?',
    right: 'At the bottom of the stack',
    wrong: [
      ['On top of the stack', 'young-bottom', 'The paper on top came last, so it is the newest.'],
      ['Anywhere in the stack', 'layers-random', 'The papers went on in order, one each day.'],
    ],
    explain: 'The first paper was put down first, so it is at the bottom. Rock layers work the same way.',
    hints: ['Which paper was put down first?', 'Every new paper covers the ones before it.'],
    pic: cliff(null),
    model: 'stack',
  },
  {
    id: 'c-sea-shells',
    tier: 1,
    ask: 'The bottom layer is full of shells and trilobites. Trilobites lived only in the sea. What was this place like back then?',
    right: 'It was under a shallow sea',
    wrong: [
      ['It was a dry desert', 'rock-env', 'Sea animals could not live in a desert.'],
      ['It was always a dry cliff', 'rock-env', 'Places change. The sea animals show water was here.'],
    ],
    explain: 'Fossils of sea animals show that a sea once covered this land.',
    hints: ['Where did trilobites live?', 'If sea animals lived here, the place must have been under the sea.'],
    pic: cliff('sea'),
    model: 'card',
  },
  {
    id: 'c-swamp',
    tier: 1,
    ask: 'This dark layer holds fern fossils and a black stripe of coal. Coal comes from swamp plants buried long ago. What was here then?',
    right: 'A swamp forest',
    wrong: [
      ['An icy land', 'rock-env', 'Ferns need warm, wet places, not ice.'],
      ['A deep ocean', 'rock-env', 'Ferns grow on land, not deep in the sea.'],
    ],
    explain: 'Ferns and coal show a warm, wet swamp forest grew here long ago.',
    hints: ['Where do ferns grow?', 'Coal comes from plants buried in swamps.'],
    pic: cliff('swamp'),
    model: 'card',
  },
  {
    id: 'c-mammoth',
    tier: 1,
    ask: 'Woolly mammoths had thick fur for the cold. Their tusks are in a layer near the top. Is that layer older or younger than the dinosaur layer below it?',
    right: 'Younger',
    wrong: [
      ['Older', 'young-bottom', 'It sits above the dinosaur layer, so it was laid down later.'],
      ['The same age', 'layers-random', 'They are different layers, laid down at different times.'],
    ],
    explain: 'The mammoth layer is above the dinosaur layer, so it is younger. Mammoths lived long after the dinosaurs.',
    hints: ['Which is higher in the cliff?', 'Higher layers were laid down later, so they are younger.'],
    pic: cliff('ice'),
    model: 'stack',
  },
  // level 2
  {
    id: 'c-index',
    tier: 2,
    ask: 'Each kind of ammonite lived for a fairly short time. The same kind is in two cliffs far apart. What does that tell Hana?',
    right: 'The two layers formed at about the same time',
    wrong: [
      ['Ammonites walked between the cliffs', 'index-mixup', 'Ammonites swam in the sea. The match is about time.'],
      ['The two cliffs are the same height', 'index-mixup', 'Matching fossils tell about time, not height.'],
    ],
    explain: 'Fossils that lived only a short time help match layers in different places. Scientists call them index fossils.',
    hints: ['If that ammonite lived only a short time, when was each layer made?', 'Both layers had to form while that ammonite was alive.'],
    pic: { k: 'match' },
    model: 'match',
  },
  {
    id: 'c-sea-on-land',
    tier: 2,
    ask: 'Sea shells are found high up in this dry cliff, far from any ocean. How did they get there?',
    right: 'A sea once covered this land',
    wrong: [
      ['Birds dropped them', 'sea-carried', 'There are millions, sealed inside the rock. Birds could not do that.'],
      ['People carried them here', 'sea-carried', 'They are sealed inside rock that is millions of years old.'],
    ],
    explain: 'The shells lived here when a sea covered the land. Later the land rose and the sea left.',
    hints: ['The shells are inside the rock, not on top of it. When did they get there?', 'They were buried when the rock formed, under the sea.'],
    pic: cliff('sea'),
    model: 'cliff',
  },
  {
    id: 'c-ripples',
    tier: 2,
    ask: 'The rusty sandstone layer has wavy ripple marks inside it, like the sand under a stream. What made the ripples?',
    right: 'Moving water long ago',
    wrong: [
      ['Dinosaur footprints', 'wrong-reason', 'Footprints show toes. These are long, even waves.'],
      ['Wind blowing today', 'rock-env', 'The ripples are inside the rock, buried long ago.'],
    ],
    explain: 'Flowing water makes ripples in sand. When the sand turned to rock, the ripples were kept.',
    hints: ['Where have you seen ripples like these in sand?', 'In a stream bed, the water shapes the sand into waves.'],
    pic: cliff('river'),
    model: 'cliff',
  },
  {
    id: 'c-thick',
    tier: 2,
    ask: 'One layer is thick and one is thin. Thickness shows how much mud or sand piled up, not how old it is. What tells the order of the layers?',
    right: 'Which layer is on top of which',
    wrong: [
      ['Which layer is thickest', 'thick-old', 'A thick layer just had more mud or sand pile up.'],
      ['Which layer is the prettiest color', 'layers-random', 'Color tells what the rock is made of, not its order.'],
    ],
    explain: 'The order comes from stacking: lower layers are older, higher layers are younger.',
    hints: ['Which layer went down first?', 'Look at the arrow: older is lower.'],
    pic: cliff(null),
    model: 'stack',
  },
  {
    id: 'c-ages',
    tier: 2,
    ask: 'Hana’s chart says the sea layer is about 400 million years old. The dinosaur layer is about 70 million years old. Which layer is lower in the cliff?',
    right: 'The sea layer',
    wrong: [
      ['The dinosaur layer', 'young-bottom', 'The dinosaur layer is the younger one, so it sits higher.'],
      ['You cannot tell', 'layers-random', 'Older layers lie lower, so the ages tell the order.'],
    ],
    explain: 'The sea layer is older, so it lies lower in the cliff.',
    hints: ['Which number is bigger, 400 million or 70 million?', 'The older layer was laid down first, so it is lower.'],
    pic: cliff('river'),
    model: 'stack',
  },
  {
    id: 'c-wrong-layer',
    tier: 2,
    ask: 'A visitor says a mammoth tusk came from the sea layer at the bottom. Hana says that cannot be right. Why?',
    right: 'Mammoths lived long after that layer formed',
    wrong: [
      ['Mammoths were too big to fit', 'wrong-reason', 'Size is not the problem. Think about when each one formed.'],
      ['Tusks cannot become fossils', 'soft-fossil', 'Tusks are hard, so they make good fossils.'],
    ],
    explain: 'The sea layer is about 400 million years old. Mammoths lived during the Ice Age, near the top of the cliff.',
    hints: ['How old is the sea layer? When did mammoths live?', 'The bottom layer formed long before any mammoth lived.'],
    pic: fossil('mammoth-tusk'),
    model: 'stack',
  },
  // level 3
  {
    id: 'c-fault',
    tier: 3,
    ask: 'A crack cuts through all five layers, and the rock slipped along it. Was the crack made before or after the layers?',
    right: 'After, because it breaks through all of them',
    wrong: [
      ['Before the layers', 'fault-older', 'Then the layers would cover it. Instead it cuts right through them.'],
      ['At the same time as the bottom layer', 'fault-older', 'It also cuts the top layers, which came much later.'],
    ],
    explain: 'Something that cuts through layers must be younger than them. Geologists call this crack a fault.',
    hints: ['You can only break something that is already there.', 'The crack breaks the top layer too, so it came after all of them.'],
    pic: cliff('fault'),
    model: 'cliff',
  },
  {
    id: 'c-canyon',
    tier: 3,
    ask: 'A river carved this canyon down through the layers. Which came first, the layers or the canyon?',
    right: 'The layers came first',
    wrong: [
      ['The canyon came first', 'canyon-first', 'A river can only cut through rock that is already there.'],
      ['They formed together', 'canyon-first', 'The river cut through every layer, so the layers were there before.'],
    ],
    explain: 'First the layers piled up. Then a river slowly wore a canyon down through them.',
    hints: ['Can a river carve rock that is not there yet?', 'The canyon cuts every layer, so every layer is older than the canyon.'],
    pic: cliff(null),
    model: 'cliff',
  },
  {
    id: 'c-gap',
    tier: 3,
    ask: 'The swamp layer is about 300 million years old. The dinosaur layer right above it is about 70 million years old. What happened to rock from the years in between?',
    right: 'It was worn away before newer layers formed',
    wrong: [
      ['Nothing happened in those years', 'gap-missing', 'Time kept going. Rock from then was laid down, then eroded.'],
      ['It is hidden under the bottom layer', 'young-bottom', 'Rock from those years would be higher, not under the oldest layer.'],
    ],
    explain: 'Sometimes layers are worn away before new ones cover them. That leaves a gap in the rock record.',
    hints: ['What do wind and water do to rock?', 'They wear it away. Then new layers can form on top, leaving a gap.'],
    pic: cliff('swamp'),
    model: 'cliff',
  },
  {
    id: 'c-change',
    tier: 3,
    ask: 'From bottom to top, the layers show a sea, a swamp, a river plain, then an icy land. What does this tell us about this place?',
    right: 'The land changed a lot over time',
    wrong: [
      ['It has always looked like today', 'rock-env', 'Each layer shows a different kind of place.'],
      ['It all happened in one year', 'fast-fossil', 'Layers take a very long time. These span about 400 million years.'],
    ],
    explain: 'Each layer is a page from the past. Together they show the land changing from sea to swamp to river plain to icy land.',
    hints: ['Is each layer from the same kind of place?', 'Read the fossils: sea animals, swamp plants, dinosaurs, mammoths.'],
    pic: cliff(null),
    model: 'stack',
  },
  {
    id: 'c-where-dinos',
    tier: 3,
    ask: 'Hana finds trilobites in a new cliff. Trilobites died out before dinosaurs lived. Where should she look for dinosaur bones?',
    right: 'In layers above the trilobite layer',
    wrong: [
      ['In layers below it', 'young-bottom', 'Lower layers are older, from before the trilobites died out.'],
      ['In the same layer', 'index-mixup', 'Trilobites were gone before dinosaurs arrived.'],
    ],
    explain: 'Dinosaurs lived later than trilobites, so their bones are in younger layers, higher up.',
    hints: ['Which came first, trilobites or dinosaurs?', 'Later animals are in higher layers.'],
    pic: fossil('trilobite'),
    model: 'stack',
  },
  {
    id: 'c-today',
    tier: 3,
    ask: 'Mud is settling on the bottom of a lake today. Over millions of years it will turn to rock. Where will this new layer be in the stack?',
    right: 'On top of the older layers',
    wrong: [
      ['Under all the other layers', 'young-bottom', 'New layers settle on what is already there.'],
      ['It will never be a layer', 'layers-random', 'Mud that piles up and hardens is how layers form.'],
    ],
    explain: 'New layers always form on top. The mud settling today will be the youngest layer.',
    hints: ['Where does new mud land?', 'It settles on top of what is already there.'],
    pic: cliff('today'),
    model: 'stack',
  },
];

// ------------------------------------------------------------------ the Prep Lab (Sam)

const rel = (id: FossilId): Pic => ({ k: 'relative', id });

const LAB: QDef[] = [
  // level 1
  {
    id: 'l-elephant',
    tier: 1,
    ask: 'This tusk came from a woolly mammoth. Mammoths are gone now. Which animal alive today is its closest cousin?',
    right: 'The elephant',
    wrong: [
      ['The walrus', 'relative-mixup', 'Walruses have tusks too, but they are sea mammals, not close cousins of mammoths.'],
      ['The rhinoceros', 'relative-mixup', 'A rhino has horns, not tusks. It is only a distant relative.'],
    ],
    explain: 'Mammoths and elephants are close cousins: big ears, a trunk and long tusks. Mammoths also had thick fur for the cold.',
    hints: ['Look for an animal with a trunk and long tusks.', 'Put the tusk next to living animals. Which one has the same tusks and trunk?'],
    pic: rel('mammoth-tusk'),
    model: 'relative',
  },
  {
    id: 'l-nautilus',
    tier: 1,
    ask: 'This ammonite had a coiled shell with rooms inside. Which animal alive today has a shell like that?',
    right: 'The nautilus',
    wrong: [
      ['The garden snail', 'relative-mixup', 'A snail shell is coiled, but it has no rooms inside, and snails are a different group.'],
      ['The crab', 'relative-mixup', 'A crab has a hard shell, but it is not coiled.'],
    ],
    explain: 'The nautilus lives in the sea today. Its coiled shell has rooms inside, just like an ammonite’s.',
    hints: ['Look for a coiled shell with rooms inside it.', 'The nautilus is a cousin of the squid and the octopus, like the ammonite was.'],
    pic: rel('ammonite'),
    model: 'relative',
  },
  {
    id: 'l-horseshoe',
    tier: 1,
    ask: 'Trilobites crawled on the sea floor long ago. They are extinct now. Which animal alive today looks a lot like one?',
    right: 'The horseshoe crab',
    wrong: [
      ['The ladybug', 'relative-mixup', 'A ladybug is a small insect with wings. It does not crawl on the sea floor.'],
      ['The goldfish', 'all-dinosaurs', 'A fish has fins and a backbone. A trilobite had a hard shell in parts, and legs.'],
    ],
    explain: 'Horseshoe crabs crawl on the sea floor with a hard, curved shell, a lot like trilobites did.',
    hints: ['Look for a sea animal with a hard, curved shell and legs underneath.', 'Put the fossil next to the living animal. Which shape is the same?'],
    pic: rel('trilobite'),
    model: 'relative',
  },
  {
    id: 'l-fern',
    tier: 1,
    ask: 'This fern leaf turned to stone 300 million years ago. Ferns still grow today. What does it tell us?',
    right: 'Ferns have lived on Earth for a very long time',
    wrong: [
      ['Ferns only grew long ago', 'extinct-hiding', 'Ferns still grow in forests today.'],
      ['It is a seaweed', 'rock-env', 'This came from a swamp forest on land, not from the sea.'],
    ],
    explain: 'Some kinds of living things, like ferns, have lasted for hundreds of millions of years.',
    hints: ['Look at the fossil leaf and the fern alive today. Are they alike?', 'Ferns grew in the old swamp forests, and they still grow in shady forests now.'],
    pic: rel('fern'),
    model: 'relative',
  },
  {
    id: 'l-clean',
    tier: 1,
    ask: 'Sam cleans fossils in the Prep Lab. Rock is stuck right next to the bone. Which tool does Sam use there?',
    right: 'A soft brush and great care',
    wrong: [
      ['A big hammer', 'rough-tools', 'A hammer could crack the bone into pieces.'],
      ['The fastest tool there is', 'rough-tools', 'Fast tools are for rock far from the bone. Next to it, slow is safe.'],
    ],
    explain: 'Away from the bone, a tiny air chisel takes off rock. Right next to it, a soft brush keeps it safe.',
    hints: ['The bone is right there. Which tool is the gentlest?', 'Strong tools far away, gentle tools up close.'],
    pic: { k: 'prep' },
    model: 'tools',
  },
  {
    id: 'l-glue',
    tier: 1,
    ask: 'A fossil can have old cracks from being buried. Sam finds a crack in this bone. What does Sam do?',
    right: 'Fill the crack with glue so it holds together',
    wrong: [
      ['Throw the fossil away', 'wrong-reason', 'A cracked fossil is still a great find. It can be fixed.'],
      ['Paint over the crack to hide it', 'wrong-reason', 'Paint would only hide it. The crack could still break.'],
    ],
    explain: 'Preparators fill cracks with special glue, so the fossil stays in one piece.',
    hints: ['How do you mend something cracked so it does not break?', 'Glue holds the pieces together. That keeps the fossil safe for years.'],
    pic: { k: 'prep' },
    model: 'tools',
  },
  // level 2
  {
    id: 'l-sharp-teeth',
    tier: 2,
    ask: 'This tooth is long and pointed, with jagged edges like a steak knife. What did its owner eat?',
    right: 'Meat',
    wrong: [
      ['Leaves', 'diet-mixup', 'Plant eaters have flat or chopping teeth, not knife teeth.'],
      ['Nothing at all', 'wrong-reason', 'Every animal needs food. Its teeth show which food.'],
    ],
    explain: 'Sharp, jagged teeth slice meat. This is a T. rex tooth, from a meat eater.',
    hints: ['What would a knife-shaped tooth be good at?', 'Sharp teeth cut meat. Flat teeth grind or chop plants.'],
    pic: { k: 'teeth', kind: 'sharp' },
    model: 'teeth',
  },
  {
    id: 'l-flat-teeth',
    tier: 2,
    ask: 'Triceratops had rows of teeth that sliced like scissors, and a sharp beak in front. What did it eat?',
    right: 'Tough plants',
    wrong: [
      ['Other dinosaurs', 'diet-mixup', 'Meat eaters had pointed, knife teeth, not rows of slicing teeth.'],
      ['Only water', 'wrong-reason', 'Animals need food as well as water.'],
    ],
    explain: 'A beak to snip and rows of scissor teeth to slice: perfect for tough plants.',
    hints: ['A beak snips. Rows of scissor teeth slice. What is tough and needs lots of slicing?', 'Put the two kinds of teeth side by side: knife teeth and plant teeth.'],
    pic: { k: 'teeth', kind: 'flat' },
    model: 'teeth',
  },
  {
    id: 'l-sea-hill',
    tier: 2,
    ask: 'Hana found sea shells high on a dry hill, far from any ocean. What do the shells tell us?',
    right: 'A sea once covered this place',
    wrong: [
      ['Birds dropped the shells there', 'sea-carried', 'The shells are inside the rock, all through it. Birds could not put them there.'],
      ['The shells grew on the hill', 'rock-env', 'Sea shells only grow in water.'],
    ],
    explain: 'Fossils show what a place was like. Sea animals mean that the land was once under the sea.',
    hints: ['Where do shelled sea animals live?', 'The rock with the shells formed under water. Later the land rose.'],
    pic: fossil('ammonite'),
    model: 'card',
  },
  {
    id: 'l-fern-cold',
    tier: 2,
    ask: 'Fern fossils were found in a frozen place near the North Pole. Ferns like warm, wet places. What does that tell us?',
    right: 'That place was once warm',
    wrong: [
      ['Ferns love snow', 'rock-env', 'These ferns needed warm, wet weather to grow.'],
      ['The wind blew them there', 'sea-carried', 'They are inside the rock, where they grew and were buried.'],
    ],
    explain: 'Fossils tell us about past climates. Long ago, that frozen place was warm enough for ferns.',
    hints: ['Where do ferns grow best?', 'If ferns grew there, the weather there was once warm and wet.'],
    pic: fossil('fern'),
    model: 'card',
  },
  {
    id: 'l-coprolite',
    tier: 2,
    ask: 'Sam cuts open a coprolite, fossil poop. Inside are tiny bits of crushed bone. What did the animal eat?',
    right: 'Other animals',
    wrong: [
      ['Only plants', 'diet-mixup', 'Plant eaters do not swallow bone.'],
      ['Rocks', 'wrong-reason', 'The bits are bone, not rock. They came from its food.'],
    ],
    explain: 'What is inside fossil poop shows what an animal ate. Bone bits mean a meat eater.',
    hints: ['Where would bone in poop come from?', 'An animal’s poop holds bits of its food.'],
    pic: fossil('coprolite'),
    model: 'card',
  },
  {
    id: 'l-big-bone',
    tier: 2,
    ask: 'This leg bone is as tall as a grown-up. What does it tell us about the animal?',
    right: 'It was a very big animal',
    wrong: [
      ['It was very old when it died', 'big-old', 'Bone size tells how big the animal was, not how old.'],
      ['It could fly', 'wrong-reason', 'Heavy, thick bones are for holding up a big body on the ground.'],
    ],
    explain: 'Bigger bones mean a bigger animal. Scientists use bone size to work out how big a dinosaur was.',
    hints: ['How long is your own leg bone? And this one?', 'A bigger body needs bigger bones to hold it up.'],
    pic: { k: 'skeleton' },
    model: 'card',
  },
  // level 3
  {
    id: 'l-extinct',
    tier: 3,
    ask: 'Triceratops is extinct. What does extinct mean?',
    right: 'Gone forever: none are alive anywhere',
    wrong: [
      ['Hiding deep in a jungle', 'extinct-hiding', 'People have searched the whole Earth. No Triceratops is alive.'],
      ['Asleep under the ground', 'extinct-hiding', 'The bones are fossils. The animals died out about 66 million years ago.'],
    ],
    explain: 'Extinct means a kind of living thing is gone forever. Fossils are how we know it lived.',
    hints: ['Can anyone find a living Triceratops today?', 'When the last one died, the kind was gone for good.'],
    pic: { k: 'skeleton' },
    model: 'card',
  },
  {
    id: 'l-birds',
    tier: 3,
    ask: 'Birds have feathers and a wishbone. Many dinosaur fossils show feathers and a wishbone too. What does that tell scientists?',
    right: 'Birds are living dinosaurs',
    wrong: [
      ['Birds and dinosaurs are not related', 'birds-not-dinos', 'Shared feathers and wishbones are clues that they are family.'],
      ['Feathers turn into scales', 'wrong-reason', 'The fossils show feathers, kept as feathers.'],
    ],
    explain: 'Birds came from small feathered dinosaurs. So the sparrow outside is a living dinosaur!',
    hints: ['What do the two have in common?', 'Living things that share many body parts are often family.'],
    pic: fossil('raptor-claw'),
    model: 'card',
  },
  {
    id: 'l-pterosaur',
    tier: 3,
    ask: 'Pterosaurs flew over the dinosaurs on wings of skin. They were reptiles, but they were not dinosaurs. What were they?',
    right: 'Flying reptiles',
    wrong: [
      ['Flying dinosaurs', 'all-dinosaurs', 'They lived at the same time, but they were a different group of reptiles.'],
      ['Big birds', 'birds-not-dinos', 'Birds have feathers. Pterosaurs had wings of skin.'],
    ],
    explain: 'Pterosaurs were flying reptiles, close cousins of the dinosaurs but not dinosaurs.',
    hints: ['Read it again: reptiles, but not dinosaurs.', 'Not every animal from long ago was a dinosaur. Mammoths and trilobites were not either.'],
    pic: fossil('pterosaur-bone'),
    model: 'card',
  },
  {
    id: 'l-trace',
    tier: 3,
    ask: 'A footprint, a burrow and fossil poop are not body parts. Scientists still call them fossils. Why?',
    right: 'They are signs left by living things long ago',
    wrong: [
      ['They are not really fossils', 'trace-not-fossil', 'Scientists call them trace fossils. They count.'],
      ['They are made of bone', 'real-bone', 'A footprint has no bone in it. It is a mark in stone.'],
    ],
    explain: 'Trace fossils show what an animal did: walked, dug or ate. They count as fossils too.',
    hints: ['What did the animal leave behind?', 'Body fossils are parts of the body. Trace fossils are signs of what it did.'],
    pic: fossil('burrow'),
    model: 'card',
  },
  {
    id: 'l-raptor',
    tier: 3,
    ask: 'In films, raptors are as tall as people. Real Velociraptor fossils show a much smaller animal. How big was it?',
    right: 'About the size of a turkey',
    wrong: [
      ['As big as a bus', 'raptor-huge', 'The bones are small. A bus is far too big.'],
      ['As tall as a house', 'raptor-huge', 'Films made raptors big. The fossils tell the true size.'],
    ],
    explain: 'Fossils tell the truth about size. Velociraptor was turkey-sized, with feathers.',
    hints: ['Who do we trust: a film, or the fossil bones?', 'The claw is about as long as your finger.'],
    pic: fossil('raptor-claw'),
    model: 'card',
  },
  {
    id: 'l-stone',
    tier: 3,
    ask: 'Sam taps the bone. It is heavy and hard, like a rock. Over millions of years, minerals took the place of the bone. What is it made of now?',
    right: 'Stone, in the shape of the bone',
    wrong: [
      ['The same bone, just old', 'real-bone', 'The minerals slowly took the place of the bone.'],
      ['Plastic, made by people', 'rock-fossil', 'It formed in the ground, long before any people.'],
    ],
    explain: 'Most fossils are stone copies: minerals filled and replaced the bone, keeping its shape.',
    hints: ['Why does it feel like a rock?', 'Look at the steps: the bone is buried, then minerals turn it to stone.'],
    pic: fossil('trike-horn'),
    model: 'form',
  },
];

// ------------------------------------------------------------------ the Trackway (Ranger Tala and Pebble)

const TRACKWAY: QDef[] = [
  // level 1
  {
    id: 't-three-toes',
    tier: 1,
    ask: 'These prints have three long, pointed toes, like a bird’s. What kind of dinosaur made them?',
    right: 'One that walked on two legs',
    wrong: [
      ['One with four round feet', 'toes-mixup', 'Four round feet leave big round prints, not three pointed toes.'],
      ['A fish', 'all-dinosaurs', 'Fish have fins, not feet with toes.'],
    ],
    explain: 'Three-toed prints come from dinosaurs that walked on two legs, like T. rex and its cousins.',
    hints: ['Which animals today have three pointed toes?', 'Birds walk on two legs with three-toed feet, like their dinosaur family.'],
    pic: { k: 'prints' },
    model: 'prints',
  },
  {
    id: 't-round',
    tier: 1,
    ask: 'These prints are big and round, with short, blunt toes. What made them?',
    right: 'A heavy plant eater on four legs',
    wrong: [
      ['A small bird', 'toes-mixup', 'Small birds leave small three-toed prints.'],
      ['Raindrops', 'rock-fossil', 'Raindrops leave tiny dents, not big feet in a row.'],
    ],
    explain: 'Big round prints come from heavy four-legged plant eaters.',
    hints: ['Big round feet hold up a heavy body.', 'Compare the two prints: pointed toes, and big round feet.'],
    pic: { k: 'prints' },
    model: 'prints',
  },
  {
    id: 't-bigger',
    tier: 1,
    ask: 'One print is twice as long as another. What does a bigger print tell us?',
    right: 'A bigger animal made it',
    wrong: [
      ['An older animal made it', 'big-old', 'Size shows how big the animal was, not when it lived.'],
      ['It rained harder that day', 'wrong-reason', 'Rain does not make feet bigger.'],
    ],
    explain: 'Bigger feet belong to bigger animals.',
    hints: ['Think of your shoe and a grown-up’s shoe.', 'Big bodies need big feet.'],
    pic: { k: 'tracks' },
    model: 'tracks',
  },
  {
    id: 't-line',
    tier: 1,
    ask: 'These prints go in one line: left, right, left, right. What made them?',
    right: 'One animal walking',
    wrong: [
      ['A big group all at once', 'group-random', 'A group would leave many lines of prints side by side.'],
      ['Animals jumping around', 'wrong-reason', 'Jumping leaves pairs of prints, not left, right, left, right.'],
    ],
    explain: 'One line of left and right prints is one animal walking.',
    hints: ['How many feet made these prints, and how many lines are there?', 'You leave left, right, left, right when you walk.'],
    pic: { k: 'tracks' },
    model: 'tracks',
  },
  {
    id: 't-mud',
    tier: 1,
    ask: 'Feet only sink into soft ground. Where did dinosaurs leave the best prints?',
    right: 'In soft mud by the water',
    wrong: [
      ['On hard, dry rock', 'buried-needed', 'Feet do not sink into hard rock, so no print is left.'],
      ['In flowing water', 'buried-needed', 'Moving water washes prints away.'],
    ],
    explain: 'Prints form in soft mud. Then the mud dries, gets buried, and slowly turns to stone.',
    hints: ['Where do your shoes leave deep prints?', 'The slab was once mud on a river bank.'],
    pic: { k: 'tracks' },
    model: 'tracks',
  },
  {
    id: 't-pebble',
    tier: 1,
    ask: 'Pebble walks across the creek mud, then runs. How do Pebble’s prints change when running?',
    right: 'They are farther apart',
    wrong: [
      ['They are closer together', 'far-walk', 'Short steps are for walking. Running takes long steps.'],
      ['They get bigger', 'big-old', 'Pebble’s paws stay the same size.'],
    ],
    explain: 'Running takes longer steps, so the prints are farther apart.',
    hints: ['Try it: take walking steps, then running steps. Which are longer?', 'Look at Pebble’s prints in the mud: on the left walking, on the right running.'],
    pic: { k: 'stride' },
    model: 'stride',
  },
  // level 2
  {
    id: 't-speed-up',
    tier: 2,
    ask: 'On the slab, the dinosaur’s prints get farther and farther apart. What was it doing?',
    right: 'Speeding up to a run',
    wrong: [
      ['Slowing down to a stop', 'far-walk', 'Slowing down makes the steps shorter, not longer.'],
      ['Getting smaller', 'wrong-reason', 'The prints stay the same size.'],
    ],
    explain: 'Longer steps mean it sped up. It may have been chasing something, or running away!',
    hints: ['Compare with Pebble’s prints. When were Pebble’s far apart?', 'Long steps mean running.'],
    pic: { k: 'tracks' },
    model: 'stride',
  },
  {
    id: 't-group',
    tier: 2,
    ask: 'Twenty trackways go the same way, side by side, all on the same day. What does that tell us?',
    right: 'A group travelled together',
    wrong: [
      ['One animal walked back and forth', 'group-random', 'Back and forth would point both ways. These all go one way.'],
      ['The prints are from different millions of years', 'crossing-order', 'They are in the same layer of mud, made at the same time.'],
    ],
    explain: 'Many trackways side by side, going one way, show animals travelling in a herd or pack.',
    hints: ['Which way do all the toes point?', 'One line is one animal. Many lines side by side are many animals.'],
    pic: { k: 'tracks' },
    model: 'tracks',
  },
  {
    id: 't-ten-times',
    tier: 2,
    ask: 'A dinosaur print is 40 centimeters long. Pebble’s paw print is 4 centimeters. How many times longer is the dinosaur’s print?',
    right: '10 times longer',
    wrong: [
      ['4 times longer', 'measure-mixup', 'Check: 4 times 4 is only 16.'],
      ['36 times longer', 'measure-mixup', 'That is how many centimeters longer, 40 take away 4. The question asks how many times.'],
    ],
    explain: '4 times 10 is 40, so the dinosaur’s print is 10 times as long as Pebble’s.',
    hints: ['How many 4s make 40?', 'Count by 4s: 4, 8, 12 ... all the way to 40.'],
    pic: { k: 'stride' },
    model: 'tracks',
  },
  {
    id: 't-footprint-fossil',
    tier: 2,
    ask: 'A footprint is not part of the dinosaur’s body. It is a mark it left in mud that turned to stone. Is it a fossil?',
    right: 'Yes, a trace fossil',
    wrong: [
      ['No, only bones are fossils', 'trace-not-fossil', 'Signs that animals left, like prints, count as trace fossils.'],
      ['No, it is just a rock', 'rock-fossil', 'It is rock, but its shape was made by a living animal.'],
    ],
    explain: 'Footprints are trace fossils. They show how an animal moved.',
    hints: ['What made the shape in the stone?', 'Fossils are remains of living things, or signs they left.'],
    pic: fossil('footprint'),
    model: 'card',
  },
  {
    id: 't-steps',
    tier: 2,
    ask: 'At first the prints are 1 meter apart. Later they are 3 meters apart. Did the animal speed up or slow down?',
    right: 'It sped up',
    wrong: [
      ['It slowed down', 'far-walk', 'Steps got longer, and longer steps mean faster.'],
      ['It stayed the same speed', 'wrong-reason', 'The steps changed, so the speed changed.'],
    ],
    explain: 'From 1 meter to 3 meters apart: longer steps, so it sped up.',
    hints: ['Which is longer, 1 meter or 3 meters?', 'Long steps mean running.'],
    pic: { k: 'tracks' },
    model: 'stride',
  },
  {
    id: 't-direction',
    tier: 2,
    ask: 'The toes of every print point to the right. Which way was the dinosaur going?',
    right: 'To the right',
    wrong: [
      ['To the left', 'toes-mixup', 'Toes point the way an animal walks. The heel is behind.'],
      ['Round in a circle', 'wrong-reason', 'The prints go in a straight line.'],
    ],
    explain: 'Toes point forward, so the prints show which way the animal walked.',
    hints: ['Look at your own feet. Which way do your toes point when you walk?', 'Heel behind, toes in front.'],
    pic: { k: 'tracks' },
    model: 'prints',
  },
  // level 3
  {
    id: 't-hip-50',
    tier: 3,
    ask: 'Scientists use a rule: the hip height is about 4 times the footprint’s length. A print is 50 centimeters long. About how high were the hips?',
    right: 'About 2 meters',
    wrong: [
      ['About 50 centimeters', 'hip-rule', 'That is the print. The hips are about 4 times higher.'],
      ['About 54 centimeters', 'hip-rule', 'That adds 4. The rule says 4 times.'],
    ],
    explain: '50 × 4 = 200 centimeters, which is 2 meters. That is taller than a grown-up!',
    hints: ['What is 50 times 4?', '200 centimeters is the same as 2 meters.'],
    pic: { k: 'hip' },
    model: 'hip',
  },
  {
    id: 't-hip-25',
    tier: 3,
    ask: 'The rule: hip height is about 4 times the footprint’s length. A print is 25 centimeters long. About how high were the hips?',
    right: 'About 1 meter',
    wrong: [
      ['About 29 centimeters', 'hip-rule', 'That adds 4. The rule says 4 times.'],
      ['About 4 meters', 'hip-rule', 'That would need a print 100 centimeters long.'],
    ],
    explain: '25 × 4 = 100 centimeters, which is 1 meter: about as high as a grown-up’s hips.',
    hints: ['What is 25 times 4?', '100 centimeters is 1 meter.'],
    pic: { k: 'hip' },
    model: 'hip',
  },
  {
    id: 't-hip-compare',
    tier: 3,
    ask: 'A print is 30 centimeters long. Using the rule of 4 times, its hips were about 120 centimeters high. A grown-up’s hips are about 100 centimeters high. Whose are higher?',
    right: 'The dinosaur’s',
    wrong: [
      ['The grown-up’s', 'measure-mixup', 'Which is bigger, 120 or 100?'],
      ['They are the same', 'measure-mixup', '120 and 100 are not the same.'],
    ],
    explain: '120 centimeters is more than 100, so the dinosaur’s hips were a little higher than a grown-up’s.',
    hints: ['Compare 120 and 100.', 'The bigger number is the higher hip.'],
    pic: { k: 'hip' },
    model: 'hip',
  },
  {
    id: 't-crossing',
    tier: 3,
    ask: 'The round prints are pressed on top of the three-toed prints. Which animal walked here first?',
    right: 'The three-toed one',
    wrong: [
      ['The round-footed one', 'crossing-order', 'A print on top was pressed in later, over the older one.'],
      ['Both at the very same moment', 'crossing-order', 'One print squashed the other, so one came first.'],
    ],
    explain: 'Like layers, a print on top came later. The three-toed dinosaur walked by first.',
    hints: ['Which print is squashed by the other?', 'It is like the cliff: what is on top came later.'],
    pic: { k: 'tracks' },
    model: 'tracks',
  },
  {
    id: 't-which-time',
    tier: 3,
    ask: 'The trackway is in rock about 70 million years old. Which animal could have made it?',
    right: 'A dinosaur',
    wrong: [
      ['A woolly mammoth', 'layers-random', 'Mammoths lived in the Ice Age, millions of years later.'],
      ['A person', 'people-dinos', 'People came along about 66 million years after the last big dinosaurs.'],
    ],
    explain: 'Rock 70 million years old is from the time of the dinosaurs, the same layer as the quarry.',
    hints: ['Which layer of the cliff is about 70 million years old?', 'Mammoths and people are in much younger layers, or none at all.'],
    pic: cliff('river'),
    model: 'cliff',
  },
  {
    id: 't-young',
    tier: 3,
    ask: 'In a group’s tracks, some prints are much smaller than the rest. They go the same way, on the same day. What might that mean?',
    right: 'Young ones travelled with the adults',
    wrong: [
      ['The small prints are much older', 'big-old', 'They are in the same mud, made the same day.'],
      ['Small prints were made by the wind', 'rock-fossil', 'Wind does not make toes and heels.'],
    ],
    explain: 'Small prints walking with big ones suggest that young dinosaurs stayed with the group.',
    hints: ['Who has smaller feet: a baby or a grown-up?', 'Same day, same way: they were walking together.'],
    pic: { k: 'tracks' },
    model: 'tracks',
  },
];

const BANKS: Record<Station, QDef[]> = { quarry: QUARRY, cliff: CLIFF, lab: LAB, trackway: TRACKWAY };

export type Rand = () => number;

export function shuffle<T>(r: Rand, list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1)) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function bank(s: Station): QDef[] {
  return BANKS[s];
}

export function build(station: Station, d: QDef, r: Rand): Question {
  const choices: Choice[] = shuffle(r, [
    { value: 'right', label: d.right, correct: true },
    ...d.wrong.map(([label, misconception, why], i) => ({ value: `wrong${i}`, label, correct: false, misconception, why })),
  ]);
  return { id: d.id, station, tier: d.tier, ask: d.ask, choices, explain: d.explain, hints: d.hints, pic: d.pic, model: d.model };
}

/** A question at this level, avoiding the ones seen lately. */
export function makeQuestion(s: Station, tier: Tier, r: Rand, recent: readonly string[] = []): Question {
  const pool = bank(s).filter((d) => d.tier === tier);
  if (!pool.length) throw new Error(`No questions for ${s} at level ${tier}`);
  const fresh = pool.filter((d) => !recent.includes(d.id));
  const from = fresh.length ? fresh : pool;
  return build(s, from[Math.floor(r() * from.length) % from.length], r);
}
