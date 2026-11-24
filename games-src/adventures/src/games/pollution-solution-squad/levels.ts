import type { GaugeKind, Murk, Stretch, TrashId } from '../../kit/worlds/wild-lands/coast-art';
import type { RecipeId, Station } from './problems';

/**
 * The levels, as grids of letters (read by kit/scroller/physics.ts
 * parseLevel). The tile letters:
 *   #  ground (sand, or the dock's planks)   =  a ledge (jump up through it)   ~  water
 * The things:
 *   P  start                 F  finish flag            C  Squad flag (checkpoint)
 *   a-l, q  trash to grab (see LITTER)               h  a bottle buried in the sand (Ollie sniffs it out)
 *   v  scrap wood buried in the sand                   s  a shell (take only trash: leave it)
 *   O  Ollie, tangled in a six-pack ring              K  a crab (it bumps you)
 *   W  Rafi’s field Workbench                          X  a blueprint stake (a build spot, in the order of the level’s builds)
 *   Y  the picnic bins (the bin lids go on them)      D  the storm drain pipe (it washes trash out until it has a net that works)
 *   B  the fishing boat (it leaks fuel until the tank is fixed)
 *   k  the kayak (stand in it and paddle with left and right)   G  a ghost net in the water (grab it from the kayak)
 *   p  palm   u  a gull   r  a rock in the water   t  a mooring post
 *   z  a fish in the water (it gasps until the water is fixed)
 *   L  a farm field (bare until the riverbank strip works, then a green cover crop)
 *   U  a house   V  a storm drain   Z  the mill (it smokes until the chimney fix works)   n  a bus
 *   w  Dr. Wen Li   o  Rosa Delgado (they stand and watch)
 *   Camp only: M Marisol   R Rafi   T Ranger Tala   S the sorting station   J the Squad Journal board
 *              Q the map board   N the Nature Center sign   H the Squad hut
 */

/** What each trash letter is. */
export const LITTER: Record<string, TrashId> = {
  a: 'bottle',
  b: 'can',
  c: 'wrapper',
  d: 'net',
  e: 'rope',
  f: 'wood',
  g: 'cap',
  i: 'bag',
  j: 'peel',
  l: 'battery',
  q: 'glass',
  h: 'bottle',
  v: 'wood',
};

/** Letters that are buried trash (only grabbed after Ollie sniffs it out). */
export const BURIED = 'hv';

export interface LevelDef {
  id: string;
  stretch: Station;
  /** 1 or 2 within its stretch (0 for Beach Camp). */
  num: number;
  name: string;
  rows: string[];
  /** What the host says at the start. */
  intro: string[];
  /** A tip shown when the cadet first reaches column x. */
  tips: Array<[number, string]>;
  /** The fixes to build, at the blueprint stakes in order (each must work before the next stake opens). */
  builds: RecipeId[];
  /** The gauge shown at the top while playing. */
  gauge: GaugeKind;
  /** Floating oil on the water between these columns, until the boom works. */
  slick?: [number, number];
  /** The kayak can paddle between these columns. */
  kayak?: [number, number];
  /** Dirty water (algae or mud) between these columns, until this fix works. */
  murky?: { x: [number, number]; kind: Murk; fixedBy: RecipeId };
}

/** A blank grid with helpers to paint it. */
function grid(w: number, h: number) {
  const g: string[][] = Array.from({ length: h }, () => Array(w).fill('.'));
  const api = {
    fill(x0: number, x1: number, y0: number, y1: number, c: string) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c;
      return api;
    },
    put(x: number, y: number, c: string) {
      g[y][x] = c;
      return api;
    },
    many(c: string, ...at: Array<[number, number]>) {
      for (const [x, y] of at) g[y][x] = c;
      return api;
    },
    rows: () => g.map((r) => r.join('')),
  };
  return api;
}

// ------------------------------------------------------------------ Beach Camp

/** The Nature Center lot: these columns at camp are drawn cut away, with the pond. */
export const LOT = { x0: 0, x1: 15, pond: [9, 12] as [number, number] };

function camp(): string[] {
  return grid(44, 12)
    .fill(0, 43, 10, 11, '#')
    .put(15, 9, 'N')
    .put(19, 9, 'H')
    .put(22, 9, 'M')
    .put(24, 9, 'P')
    .put(27, 9, 'R')
    .put(31, 9, 'S')
    .put(34, 9, 'J')
    .put(37, 9, 'Q')
    .put(41, 9, 'T')
    .many('p', [17, 9], [39, 9])
    .rows();
}

// ------------------------------------------------------------------ Turtle Beach

function beach1(): string[] {
  return grid(66, 12)
    .fill(0, 65, 10, 11, '#')
    .put(1, 9, 'P')
    .put(4, 9, 'a')
    .put(6, 9, 's')
    .put(9, 9, 'b')
    .fill(11, 12, 8, 9, '#') // a step
    .put(12, 7, 'j')
    .put(15, 9, 'l')
    .fill(17, 18, 10, 11, '~') // a tide channel: jump over it
    .put(21, 9, 'C')
    .put(23, 9, 'c')
    .put(25, 9, 'i')
    .put(27, 9, 's')
    .put(30, 9, 'O')
    .put(33, 9, 'h')
    .put(35, 9, 'g')
    .fill(37, 39, 8, 8, '=') // driftwood ledges
    .put(37, 7, 'f')
    .put(38, 7, 'f')
    .put(42, 9, 'K')
    .put(44, 9, 'C')
    .put(46, 9, 'e')
    .put(48, 9, 'W')
    .put(51, 9, 'X')
    .put(53, 9, 'Y')
    .put(56, 9, 's')
    .fill(58, 59, 10, 11, '~')
    .put(63, 9, 'F')
    .many('p', [7, 9], [28, 9], [60, 9])
    .many('u', [20, 3], [50, 2])
    .rows();
}

function beach2(): string[] {
  return grid(82, 12)
    .fill(0, 81, 10, 11, '#')
    .put(1, 9, 'P')
    .put(4, 9, 'a')
    .put(6, 9, 'q')
    .put(8, 9, 's')
    .fill(10, 11, 10, 11, '~')
    .put(14, 9, 'b')
    .put(16, 9, 'C')
    .fill(19, 21, 8, 9, '#') // a dune step with the old net on top
    .put(20, 7, 'd')
    .fill(23, 26, 6, 6, '=') // driftwood ledges with rope and wood
    .put(24, 5, 'e')
    .put(25, 5, 'f')
    .put(29, 9, 'K')
    .put(32, 9, 'v')
    .put(34, 9, 'C')
    .fill(36, 37, 10, 11, '~')
    .put(40, 9, 'c')
    .fill(42, 43, 8, 9, '#')
    .fill(45, 46, 6, 6, '=')
    .put(46, 5, 'f')
    .put(49, 9, 'j')
    .put(51, 9, 'C')
    .put(54, 9, 'W')
    .fill(57, 60, 8, 9, '#') // the dune bank the drain pipe comes out of
    .put(61, 9, 'D')
    .put(63, 9, 'X')
    .put(66, 9, 's')
    .put(69, 9, 'C')
    .fill(71, 72, 10, 11, '~')
    .put(78, 9, 'F')
    .many('p', [3, 9], [17, 9], [38, 9], [75, 9])
    .many('u', [12, 3], [44, 2], [70, 3])
    .rows();
}

// ------------------------------------------------------------------ The Harbor and River Mouth

function harbor1(): string[] {
  return grid(80, 12)
    .fill(0, 79, 10, 11, '#')
    .put(1, 9, 'P')
    .put(4, 9, 'b')
    .put(7, 9, 'a')
    .fill(9, 10, 10, 11, '~')
    .put(12, 9, 'b')
    .fill(14, 16, 8, 8, '=') // stacked crates
    .put(15, 7, 'a')
    .put(18, 9, 'e')
    .put(20, 9, 'C')
    .put(22, 9, 'c')
    .put(24, 9, 'a')
    .fill(26, 27, 10, 11, '~')
    .put(29, 9, 'a')
    .put(31, 9, 'e')
    .put(33, 9, 'C')
    .put(35, 9, 'W')
    .put(38, 9, 'X') // the tank fix, beside the boat
    .fill(40, 55, 10, 11, '~') // the harbor water
    .put(44, 9, 'B')
    .fill(41, 47, 8, 8, '=') // the boat's deck
    .fill(51, 52, 8, 11, '#') // a stone mooring post
    .put(51, 7, 't')
    .put(57, 9, 'X') // the oil boom
    .put(59, 9, 'C')
    .put(61, 9, 'f')
    .fill(63, 65, 8, 8, '=')
    .put(64, 7, 'f')
    .put(67, 9, 'g')
    .fill(69, 70, 10, 11, '~')
    .put(77, 9, 'F')
    .many('u', [24, 3], [48, 2], [66, 3])
    .rows();
}

function harbor2(): string[] {
  return grid(86, 12)
    .fill(0, 85, 10, 11, '#')
    .put(1, 9, 'P')
    .put(3, 9, 'c')
    .put(5, 9, 'b')
    .put(7, 9, 'C')
    .fill(10, 58, 10, 11, '~') // the river mouth
    .put(10, 9, 'k')
    .many('G', [17, 9], [29, 9], [41, 9], [52, 9])
    .many('r', [21, 9], [35, 9], [47, 9])
    .put(60, 9, 'C')
    .put(62, 9, 'f')
    .fill(64, 66, 8, 8, '=')
    .put(65, 7, 'f')
    .put(68, 9, 'W')
    .put(70, 9, 'f')
    .put(72, 9, 'X') // the net bin
    .put(75, 9, 'g')
    .put(77, 9, 'f')
    .put(83, 9, 'F')
    .many('u', [24, 3], [44, 2], [70, 3])
    .rows();
}

// ------------------------------------------------------------------ The Wetland

function wetland1(): string[] {
  return grid(80, 12)
    .fill(0, 79, 10, 11, '#')
    .put(1, 9, 'P')
    .put(4, 9, 'a')
    .put(6, 9, 'c')
    .fill(9, 10, 8, 9, '#') // a muddy bank
    .put(10, 7, 'f')
    .fill(13, 14, 10, 11, '~')
    .put(17, 9, 'C')
    .put(19, 9, 'b')
    .put(22, 9, 'j')
    .put(25, 9, 'e')
    .put(28, 9, 'i')
    .fill(30, 46, 10, 11, '~') // the green pond
    .fill(31, 34, 9, 9, '=') // the old boardwalk, with gaps
    .fill(37, 40, 9, 9, '=')
    .fill(43, 45, 9, 9, '=')
    .many('z', [35, 9], [41, 9])
    .put(38, 8, 'f')
    .put(44, 8, 'g')
    .put(47, 9, 'w')
    .put(49, 9, 'C')
    .put(51, 9, 'W')
    .put(55, 9, 'X') // the wetland plants (they go in around the pond)
    .put(58, 9, 'l')
    .put(61, 9, 'q')
    .fill(63, 65, 8, 8, '=')
    .put(64, 7, 'a')
    .put(67, 9, 'h')
    .fill(70, 71, 10, 11, '~')
    .put(77, 9, 'F')
    .many('u', [22, 3], [52, 2])
    .rows();
}

function wetland2(): string[] {
  return grid(84, 12)
    .fill(0, 83, 10, 11, '#')
    .put(1, 9, 'P')
    .put(4, 9, 'c')
    .put(6, 9, 'f')
    .fill(9, 10, 10, 11, '~')
    .put(13, 9, 'C')
    .fill(15, 17, 8, 8, '=')
    .put(16, 7, 'a')
    .put(19, 9, 'b')
    .put(22, 9, 'i')
    .fill(24, 25, 10, 11, '~')
    .put(30, 9, 'v')
    .put(33, 9, 'C')
    .put(36, 9, 'j')
    .fill(38, 40, 8, 8, '=')
    .put(39, 7, 'a')
    .put(43, 9, 'e')
    .put(45, 9, 'g')
    .put(47, 9, 'C')
    .put(49, 9, 'w')
    .put(51, 9, 'W')
    .put(54, 9, 'X') // the filter, where the stream runs into the pool
    .fill(56, 65, 10, 11, '~') // the muddy pool below the filter
    .fill(58, 59, 9, 9, '=') // stepping stones
    .fill(62, 63, 9, 9, '=')
    .many('z', [61, 9])
    .put(68, 9, 'C')
    .put(70, 9, 'l')
    .put(73, 9, 'q')
    .fill(75, 76, 10, 11, '~')
    .put(81, 9, 'F')
    .many('u', [20, 3], [60, 2])
    .rows();
}

// ------------------------------------------------------------------ Farm and Town

function town1(): string[] {
  return grid(82, 12)
    .fill(0, 81, 10, 11, '#')
    .put(1, 9, 'P')
    .put(3, 9, 'o')
    .put(6, 9, 'i')
    .put(9, 9, 'b')
    .put(12, 9, 'L')
    .put(15, 9, 'e')
    .fill(19, 20, 8, 9, '#') // a field bank
    .put(20, 7, 'f')
    .put(23, 9, 'C')
    .put(26, 9, 'j')
    .put(28, 9, 'L')
    .put(31, 9, 'c')
    .fill(35, 36, 10, 11, '~') // a ditch
    .put(39, 9, 'f')
    .fill(42, 44, 8, 8, '=') // a hay wagon
    .put(43, 7, 'g')
    .put(47, 9, 'C')
    .put(50, 9, 'v')
    .put(53, 9, 'W')
    .put(57, 9, 'X') // the riverbank strip
    .fill(59, 69, 10, 11, '~') // the river
    .fill(59, 69, 9, 9, '=') // the bridge
    .put(73, 9, 'l')
    .put(75, 9, 'q')
    .put(79, 9, 'F')
    .many('u', [26, 3], [64, 2])
    .rows();
}

function town2(): string[] {
  return grid(90, 12)
    .fill(0, 89, 10, 11, '#')
    .put(1, 9, 'P')
    .put(3, 9, 'o')
    .put(5, 9, 'U')
    .put(8, 9, 'b')
    .fill(10, 12, 8, 8, '=') // a shop awning
    .put(11, 7, 'f')
    .put(13, 9, 'U')
    .put(15, 9, 'i')
    .put(16, 9, 'f')
    .put(18, 9, 'W')
    .put(20, 9, 'V')
    .put(23, 9, 'X') // the rain garden, by the houses and the drain
    .put(26, 9, 'U')
    .put(29, 9, 'C')
    .put(31, 9, 'b')
    .fill(33, 34, 10, 11, '~') // a canal
    .put(37, 9, 'f')
    .put(40, 9, 'n')
    .put(43, 9, 'j')
    .fill(45, 47, 8, 8, '=')
    .put(46, 7, 'b')
    .put(49, 9, 'C')
    .put(52, 9, 'W')
    .put(56, 9, 'X') // the chimney fix
    .put(60, 9, 'Z')
    .put(65, 9, 'g')
    .put(67, 9, 'q')
    .put(70, 9, 'l')
    .put(73, 9, 'C')
    .put(76, 9, 'U')
    .put(80, 9, 'V')
    .put(86, 9, 'F')
    .many('u', [24, 3], [70, 2])
    .rows();
}

export const CAMP: LevelDef = {
  id: 'camp',
  stretch: 'beach',
  num: 0,
  name: 'Beach Camp',
  rows: camp(),
  intro: [],
  tips: [],
  builds: [],
  gauge: 'trash',
};

export const LEVELS: LevelDef[] = [
  {
    id: 'beach-1',
    stretch: 'beach',
    num: 1,
    name: 'The Tide Line',
    rows: beach1(),
    intro: [
      'This is Turtle Beach. Sea turtles lay their eggs in this sand, so it has to be clean.',
      'Grab the trash with your grabber (G). Take only trash: shells and driftwood stay. The picnic bins at the end keep spilling, so Rafi has a blueprint for some lids.',
    ],
    tips: [
      [5, 'That’s a shell. Leave it! Shells are homes and food for beach animals.'],
      [16, 'A tide channel. Jump over it!'],
      [29, 'Something is moving by the rocks. Is it caught in something? Go closer and grab it (G).'],
      [36, 'Wood on the driftwood above. Jump up!'],
      [47, 'Rafi’s Workbench. Use it (E) when you have the materials for the lids.'],
    ],
    builds: ['bin-lids'],
    gauge: 'trash',
  },
  {
    id: 'beach-2',
    stretch: 'beach',
    num: 2,
    name: 'The Drain Pipe',
    rows: beach2(),
    intro: [
      'The trash keeps coming back! Look at the end of this beach: a storm drain pipe comes out of the dune.',
      'Rafi has a blueprint for a net across the pipe. You’ll need an old fishing net, two pieces of scrap wood and some rope. Ollie can sniff out buried wood.',
    ],
    tips: [
      [18, 'An old fishing net on the dune. Jump up and grab it!'],
      [22, 'Rope and wood up on the driftwood.'],
      [30, 'Ollie is sniffing! Something is buried here.'],
      [53, 'Rafi’s Workbench. Pick a design for the drain net (E).'],
      [62, 'The blueprint stake. Build the net here (E), then watch the test.'],
    ],
    builds: ['drain-net'],
    gauge: 'trash',
  },
  {
    id: 'harbor-1',
    stretch: 'harbor',
    num: 1,
    name: 'The Leaky Boat',
    rows: harbor1(),
    intro: [
      'Welcome to the harbor, where the river meets the sea. Smell that? Fuel. A fishing boat is leaking into the water.',
      'First we stop the leak at its source, then we fence in the oil with a boom. Cans can make a metal patch, and sealed bottles on a rope make a boom.',
    ],
    tips: [
      [8, 'Jump the gaps between the docks.'],
      [13, 'A bottle on the crates. Bottles with their caps on float!'],
      [34, 'Rafi’s Workbench. Fix the leak first (E).'],
      [39, 'The boat is dripping fuel. Build the fix on this stake.'],
      [48, 'Jump along the boat’s deck and the mooring post.'],
      [56, 'This stake is for the oil boom. It goes across the water.'],
    ],
    builds: ['tank-patch', 'boom'],
    gauge: 'oil',
    slick: [40, 55],
  },
  {
    id: 'harbor-2',
    stretch: 'harbor',
    num: 2,
    name: 'The River Mouth',
    rows: harbor2(),
    intro: [
      'The river meets the sea here, and old fishing nets are caught on the rocks. We call them ghost nets: they keep catching animals.',
      'Take the kayak. Paddle with left and right, and grab each ghost net (G). Then build a bin for old nets on the far dock, so they never end up back in the water.',
    ],
    tips: [
      [9, 'Step into the kayak, then paddle with left and right.'],
      [16, 'A ghost net! Grab it (G) from the kayak.'],
      [59, 'Step out onto the dock.'],
      [67, 'Rafi’s Workbench. The net bin needs three pieces of wood.'],
    ],
    builds: ['net-bin'],
    gauge: 'trash',
    kayak: [10, 58],
  },
  {
    id: 'wetland-1',
    stretch: 'wetland',
    num: 1,
    name: 'The Green Pond',
    rows: wetland1(),
    intro: [
      'Welcome to the wetland. I’m Dr. Wen Li, and I test the water here. Look at the pond: green and thick, and the fish are gasping at the surface.',
      'Fertilizer from upstream is feeding the algae. We need plants whose roots take it up. Bring scrap wood and rope for stakes, and pick the right plants at the Workbench.',
    ],
    tips: [
      [8, 'Wood on the muddy bank. Jump up!'],
      [29, 'The old boardwalk has gaps. Jump from plank to plank.'],
      [35, 'See the fish gasping at the surface? The water has too little oxygen.'],
      [50, 'Rafi’s Workbench. Which plants suit a wetland (E)?'],
      [54, 'The stake by the pond. Plant them here, and watch the water.'],
    ],
    builds: ['reeds'],
    gauge: 'oxygen',
    murky: { x: [30, 46], kind: 'algae', fixedBy: 'reeds' },
  },
  {
    id: 'wetland-2',
    stretch: 'wetland',
    num: 2,
    name: 'The Filter',
    rows: wetland2(),
    intro: [
      'The stream into this pool is brown with mud. The mud blocks the sunlight, so the pool plants can’t grow.',
      'Rafi has a blueprint for a filter of stones, gravel and sand. The order of the layers matters! Bring two pieces of scrap wood and two bottles.',
    ],
    tips: [
      [14, 'A bottle on the log. Jump up!'],
      [28, 'Ollie is sniffing! Something is buried here.'],
      [50, 'Rafi’s Workbench. Which order of layers works (E)?'],
      [53, 'Build the filter here, where the stream runs into the pool.'],
    ],
    builds: ['filter'],
    gauge: 'mud',
    murky: { x: [56, 65], kind: 'mud', fixedBy: 'filter' },
  },
  {
    id: 'town-1',
    stretch: 'town',
    num: 1,
    name: 'The Farm',
    rows: town1(),
    intro: [
      'I’m Rosa Delgado. I farm this valley, and I’m on the town council. You’ve followed the mud all the way here, to my fields.',
      'When it rains, the water runs off the bare soil and carries it into the river. Help me plant a strip along the riverbank to catch it.',
    ],
    tips: [
      [10, 'A bare field. Nothing is growing to hold the soil.'],
      [18, 'Wood on the field bank. Jump up!'],
      [41, 'Jump onto the hay wagon.'],
      [49, 'Ollie is sniffing! Something is buried here.'],
      [52, 'Rafi’s Workbench. What will catch the soil (E)?'],
      [56, 'The stake on the riverbank. Build the strip here, and watch it rain.'],
    ],
    builds: ['buffer'],
    gauge: 'mud',
    murky: { x: [59, 69], kind: 'mud', fixedBy: 'buffer' },
  },
  {
    id: 'town-2',
    stretch: 'town',
    num: 2,
    name: 'Main Street',
    rows: town2(),
    intro: [
      'This is our town. When it rains, the water runs off the roofs and the street, straight into the storm drains, and the drains go straight to the river.',
      'Two fixes: something by the houses to soak up the rain, and a fix for the mill chimney’s smoke. Rafi has the blueprints.',
    ],
    tips: [
      [16, 'Rafi’s Workbench. Pick a design for the roof and street water (E).'],
      [21, 'A storm drain. Rain from the street goes straight to the river from here.'],
      [39, 'The bus is waiting with its engine running. That smoke goes into the air.'],
      [51, 'Another Workbench. Now the mill chimney.'],
      [58, 'The mill. Build the chimney fix on this stake.'],
    ],
    builds: ['rain-garden', 'mill-filter'],
    gauge: 'mud',
  },
];

export function level(id: string): LevelDef {
  const l = LEVELS.find((x) => x.id === id);
  if (!l) throw new Error(`No level ${id}`);
  return l;
}

export function stretchLevels(s: Station): LevelDef[] {
  return LEVELS.filter((l) => l.stretch === s);
}

/** The art stretch a level is drawn in. */
export function artStretch(def: LevelDef): Stretch {
  return def.num === 0 ? 'camp' : def.stretch;
}
