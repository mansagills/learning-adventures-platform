/**
 * Fossil Dig Adventure: the science, as data and pure functions (no drawing,
 * no timers) so every rule can be unit tested.
 *
 * Each station ends at a logbook of questions at three levels. Half 1 has
 * two stations:
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

export type Station = 'quarry' | 'cliff';
export const STATIONS: Station[] = ['quarry', 'cliff'];
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
  | 'gap-missing'; // does not see that layers can be worn away, leaving a gap

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
  | { k: 'match' };

/** The picture model that hint 2 adds (or that changes the picture itself). */
export type Model = 'form' | 'cliff' | 'tools' | 'card' | 'match' | 'stack';

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

const BANKS: Record<Station, QDef[]> = { quarry: QUARRY, cliff: CLIFF };

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
