import type { FossilId } from '../../kit/worlds/wild-lands/dig-art';

/**
 * The Fossil Drawer: the 16 fossils of Fossil Dig Adventure, with the layer
 * of the valley's cliff they come from and the facts on their cards.
 *
 * The valley is made up, but every layer is true to life (the ages are
 * rounded): a shallow sea about 400 million years ago, a swamp forest about
 * 300 million years ago, a river plain in the time of the dinosaurs about 70
 * million years ago, an Ice Age grassland about 20,000 years ago, and
 * today's soil. Rock from the years between the swamp and the river plain
 * was worn away before the dinosaur layer formed (a gap in the record).
 *
 * Facts checked against the Smithsonian National Museum of Natural History,
 * the U.S. National Park Service (fossils and the Petrified Forest), the
 * Natural History Museum (London) and the American Museum of Natural
 * History. Written for grades 3 to 5: short sentences, facts first.
 */

export type LayerId = 'sea' | 'swamp' | 'river' | 'ice' | 'today';
/** The layers bottom (oldest) first. */
export const LAYERS: LayerId[] = ['sea', 'swamp', 'river', 'ice', 'today'];

export const LAYER_INFO: Record<LayerId, { name: string; age: string; place: string; rock: string }> = {
  sea: { name: 'The sea layer', age: 'about 400 million years ago', place: 'a shallow, warm sea', rock: 'gray limestone, full of shells' },
  swamp: { name: 'The swamp layer', age: 'about 300 million years ago', place: 'a swamp forest of giant ferns', rock: 'dark shale with a seam of coal' },
  river: { name: 'The dinosaur layer', age: 'about 70 million years ago', place: 'a river plain where dinosaurs lived', rock: 'rusty sandstone with ripple marks' },
  ice: { name: 'The Ice Age layer', age: 'about 20,000 years ago', place: 'a cold grassland with mammoths', rock: 'gravel and sand left by ice and meltwater' },
  today: { name: 'Today’s soil', age: 'today', place: 'the badlands we stand on', rock: 'soil with sagebrush roots' },
};

export type FossilKind = 'body' | 'trace';

export interface Fossil {
  id: FossilId;
  name: string;
  layer: LayerId;
  kind: FossilKind;
  /** Where the child finds it: the quarry (the dinosaur layer), the cliff, or the trackway (half 2). */
  where: 'quarry' | 'cliff' | 'trackway';
  facts: [string, string];
}

export const FOSSILS: Record<FossilId, Fossil> = {
  trilobite: {
    id: 'trilobite',
    name: 'Trilobite',
    layer: 'sea',
    kind: 'body',
    where: 'cliff',
    facts: [
      'Trilobites crawled on the sea floor for about 270 million years. They died out long before the dinosaurs.',
      'Their eyes had lenses made of a clear mineral, like glass. They are cousins of crabs and insects.',
    ],
  },
  fish: {
    id: 'fish',
    name: 'Ancient fish',
    layer: 'sea',
    kind: 'body',
    where: 'cliff',
    facts: ['Fish swam in the sea long before any animal walked on land.', 'Some ancient fish had bony armor plates on their heads, like a helmet.'],
  },
  ammonite: {
    id: 'ammonite',
    name: 'Ammonite',
    layer: 'sea',
    kind: 'body',
    where: 'cliff',
    facts: [
      'Ammonites were sea animals with coiled shells. Their closest living cousins are squid and octopuses.',
      'Each kind lived for a fairly short time. So an ammonite helps scientists tell how old a rock layer is.',
    ],
  },
  'shark-tooth': {
    id: 'shark-tooth',
    name: 'Shark tooth',
    layer: 'sea',
    kind: 'body',
    where: 'cliff',
    facts: [
      'Sharks have swum in the oceans for over 400 million years, longer than trees have grown on land.',
      'A shark loses teeth all its life and grows new ones, so shark teeth are some of the most common fossils.',
    ],
  },
  burrow: {
    id: 'burrow',
    name: 'Burrow',
    layer: 'sea',
    kind: 'trace',
    where: 'cliff',
    facts: ['A burrow is a tunnel a worm or another small animal dug in the sand or mud.', 'It is a trace fossil: it shows something the animal did, even though its soft body is gone.'],
  },
  fern: {
    id: 'fern',
    name: 'Fern',
    layer: 'swamp',
    kind: 'body',
    where: 'cliff',
    facts: [
      'About 300 million years ago, huge swamp forests of ferns and giant plants covered much of the land.',
      'Plants buried in those swamps were squeezed for millions of years and slowly turned into coal.',
    ],
  },
  'petrified-wood': {
    id: 'petrified-wood',
    name: 'Petrified wood',
    layer: 'swamp',
    kind: 'body',
    where: 'cliff',
    facts: [
      'Petrified wood is a tree trunk turned to stone. Minerals in water slowly filled the wood and kept its rings.',
      'In Petrified Forest National Park in Arizona, whole stone logs lie on the ground.',
    ],
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    layer: 'river',
    kind: 'body',
    where: 'quarry',
    facts: [
      'Amber is old tree sap that hardened over millions of years. It can be golden and see-through.',
      'Small insects got stuck in the sticky sap. Some are kept whole inside amber from the time of the dinosaurs.',
    ],
  },
  'trex-tooth': {
    id: 'trex-tooth',
    name: 'T. rex tooth',
    layer: 'river',
    kind: 'body',
    where: 'quarry',
    facts: [
      'Tyrannosaurus rex lived about 68 to 66 million years ago. Its biggest teeth, with the roots, were about 30 centimeters long.',
      'The edges were jagged, like a steak knife. When a tooth fell out, a new one grew in.',
    ],
  },
  'trike-horn': {
    id: 'trike-horn',
    name: 'Triceratops horn',
    layer: 'river',
    kind: 'body',
    where: 'quarry',
    facts: [
      'Triceratops means “three-horned face.” Its two brow horns could be about 1 meter long.',
      'It was a plant eater, with a sharp beak for snipping plants and a big bony frill behind its head.',
    ],
  },
  'raptor-claw': {
    id: 'raptor-claw',
    name: 'Raptor claw',
    layer: 'river',
    kind: 'body',
    where: 'quarry',
    facts: [
      'Raptors were small, quick hunters with feathers. Velociraptor, the most famous one, was about the size of a turkey.',
      'Each foot had one big curved claw on the second toe, held up off the ground.',
    ],
  },
  'pterosaur-bone': {
    id: 'pterosaur-bone',
    name: 'Pterosaur wing bone',
    layer: 'river',
    kind: 'body',
    where: 'quarry',
    facts: [
      'Pterosaurs were flying reptiles, not dinosaurs. They were the first animals with backbones to fly.',
      'Their bones were thin and hollow, which kept them light. The biggest had wings about 10 meters wide.',
    ],
  },
  eggshell: {
    id: 'eggshell',
    name: 'Dinosaur eggshell',
    layer: 'river',
    kind: 'body',
    where: 'quarry',
    facts: ['Dinosaurs laid eggs. Many had hard shells, like birds’ eggs.', 'In Montana, scientists found many nests of a dinosaur called Maiasaura, “good mother lizard.” It cared for its babies.'],
  },
  coprolite: {
    id: 'coprolite',
    name: 'Coprolite (fossil poop)',
    layer: 'river',
    kind: 'trace',
    where: 'quarry',
    facts: ['A coprolite is poop turned to stone. Yes, really!', 'Bits of bone or plants inside it show what the animal ate.'],
  },
  footprint: {
    id: 'footprint',
    name: 'Footprint',
    layer: 'river',
    kind: 'trace',
    where: 'trackway',
    facts: ['Footprints pressed into soft mud can harden and be buried, then turn to stone.', 'A trail of prints shows how big an animal was and whether it walked or ran.'],
  },
  'mammoth-tusk': {
    id: 'mammoth-tusk',
    name: 'Mammoth tusk',
    layer: 'ice',
    kind: 'body',
    where: 'cliff',
    facts: [
      'Woolly mammoths were cousins of today’s elephants, with thick fur for the Ice Age cold. Their tusks could be about 4 meters long.',
      'The last woolly mammoths lived on a cold island until about 4,000 years ago.',
    ],
  },
};

/** The order the drawer shows them in: by layer, oldest first. */
export const DRAWER_ORDER: FossilId[] = [
  'trilobite',
  'fish',
  'ammonite',
  'shark-tooth',
  'burrow',
  'fern',
  'petrified-wood',
  'amber',
  'trex-tooth',
  'trike-horn',
  'raptor-claw',
  'pterosaur-bone',
  'eggshell',
  'coprolite',
  'footprint',
  'mammoth-tusk',
];

/** The quarry's finds (the dinosaur layer), the cliff's finds, by where they are found. */
export const QUARRY_FINDS = DRAWER_ORDER.filter((id) => FOSSILS[id].where === 'quarry');
export const CLIFF_FINDS = DRAWER_ORDER.filter((id) => FOSSILS[id].where === 'cliff');

/** A fossil's name inside a sentence: lower case, except the T. in T. rex. */
export function nameInText(id: FossilId): string {
  const n = FOSSILS[id].name;
  return n.startsWith('T. rex') ? n : n.charAt(0).toLowerCase() + n.slice(1);
}

/** A fossil's name with "a", "an" or "a piece of" in front, for a sentence ("an ancient fish", "a piece of amber"). */
export function aFossil(id: FossilId): string {
  if (id === 'amber' || id === 'petrified-wood') return `a piece of ${nameInText(id)}`;
  const n = nameInText(id);
  return `${/^[aeiou]/i.test(n) ? 'an' : 'a'} ${n}`;
}

/** A layer's name inside a sentence ("the Ice Age layer", "today’s soil"). */
export function layerInText(id: LayerId): string {
  const n = LAYER_INFO[id].name;
  return n.charAt(0).toLowerCase() + n.slice(1);
}
