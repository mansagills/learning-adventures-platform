import type { Power, Region } from '../../kit/worlds/wild-lands/weather-art';

/**
 * The levels, as grids of letters (read by kit/scroller/physics.ts
 * parseLevel). The tile letters:
 *   #  ground      =  a ledge (jump up through it)      ~  water      I  ice
 * The things:
 *   P  start                D  droplet               C  weather vane (checkpoint)
 *   F  finish flag          K  crab (bumps you)      T  tide pool (2 wide: warm it)
 *   U  white cloud (3 wide; wind pushes it)          G  grey cloud (full: it can rain)
 *   S  seed (rain grows a vine to climb)             B  ice wall (its bottom; 4 tall; the Sun melts it)
 *   W  waterfall top (it falls to the ground; Cold freezes it into steps)
 *   Z  snowbank (the Sun melts it into a stream)     R  the villager with a request
 *   L  wet washing on a line   M  windmill   Y  a dry field   Q  a tall storm cloud (scenery)
 *   V  the dry stream bed (fills when the snowbank melts; on River Run, rain fills it)
 *   r  a raft on the river (it floats downstream once you stand on it)
 *   E  a tree (the Sun on its leaves makes rising water vapor)
 *   e  a villager outside in the storm (touch them to send them indoors)
 *   O  the storm cloud (Wind pushes it; over the cold sea it rains itself out)
 *   u  the lighthouse, with its lightning rod
 *   p  palm   n  pine   h  house   t  tent   w  weather station   s  sign
 *   N  Professor Nimbus   J  Dr. Iris Okoro   A  Ranger Tala   X  the map board (camp only)
 */

export type RequestKind = 'dry' | 'shade' | 'windmill' | 'field' | 'snow' | 'melt' | 'fill' | 'well' | 'shelter' | 'storm';

export interface Request {
  kind: RequestKind;
  /** Which villager look (0-2). */
  look: number;
  name: string;
  ask: string;
  thanks: string;
  /** The Weather Book badge it earns. */
  badge: string;
}

export interface LevelDef {
  id: string;
  region: Region;
  /** 1 or 2 within its region (0 for the camp). */
  num: number;
  name: string;
  rows: string[];
  /** The powers the wizard has on this level. */
  powers: Power[];
  /** Temperature zones from the left: [first column, °C]. */
  temps: Array<[number, number]>;
  /** What the host says at the start (a power is taught here). */
  intro: string[];
  /** A tip shown when the wizard first reaches column x. */
  tips: Array<[number, string]>;
  /** A gentle breeze that carries clouds to the right by itself (tiles a second), before the wizard has Wind. */
  breeze?: number;
  request?: Request;
  /** Dark cave areas drawn behind the tiles: [x0, y0, x1, y1]. */
  caves?: Array<[number, number, number, number]>;
  /** A storm sky with lightning (the Storm Front). */
  stormy?: boolean;
  /** Dr. Iris's count-the-seconds stop starts at this column. */
  countAt?: number;
  /** Where the cold sea starts (the storm rains itself out past it). */
  seaAt?: number;
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

// ------------------------------------------------------------------ the field camp

function camp(): string[] {
  return grid(44, 12)
    .fill(0, 43, 10, 11, '#')
    .put(3, 9, 'P')
    .many('t', [1, 9], [40, 9])
    .put(8, 9, 'N')
    .put(15, 9, 'w')
    .put(17, 9, 'J')
    .put(25, 9, 'A')
    .put(31, 9, 'X')
    .many('p', [21, 9], [35, 9])
    .rows();
}

// ------------------------------------------------------------------ Sunny Shore

function shore1(): string[] {
  return grid(82, 12)
    .fill(0, 81, 10, 11, '#')
    .put(2, 9, 'P')
    .many('D', [4, 9], [5, 9])
    .fill(8, 10, 8, 9, '#') // a step: jump up
    .put(9, 7, 'D')
    .fill(14, 15, 10, 11, '~') // a small gap: jump over (with room to land from the step first)
    .put(14, 7, 'D')
    .put(18, 9, 'C')
    .fill(21, 24, 7, 7, '=') // ledges: jump up through them
    .many('D', [22, 6], [23, 6])
    .put(28, 9, 'K')
    .put(32, 9, 'C')
    .put(36, 9, 'T') // a tide pool: warm it with the Sun and ride the warm air up
    .fill(39, 54, 4, 9, '#') // the cliff (6 tiles: too high to jump)
    .many('D', [41, 3], [49, 3])
    .put(44, 3, 'R')
    .put(46, 3, 'L')
    .put(52, 3, 'C')
    .fill(55, 58, 7, 9, '#')
    .put(57, 6, 'D')
    .put(66, 9, 'K')
    .fill(69, 72, 7, 7, '=')
    .many('D', [70, 6], [71, 6])
    .many('p', [1, 9], [26, 9], [62, 9], [75, 9])
    .put(78, 9, 'F')
    .rows();
}

function shore2(): string[] {
  return grid(70, 12)
    .fill(0, 69, 10, 11, '#')
    .put(2, 9, 'P')
    .put(5, 9, 'T') // warm air practice: ride it up to the ledges
    .fill(4, 8, 4, 4, '=')
    .many('D', [5, 3], [6, 3], [7, 3])
    .put(11, 9, 'C')
    .fill(14, 26, 10, 11, '~') // the sea: make a cloud and blow it across
    .many('D', [17, 6], [20, 6], [23, 6])
    .put(29, 9, 'C')
    .put(34, 9, 'K')
    .put(40, 9, 'T')
    .put(43, 9, 'R') // the picnic: make a cloud for shade
    .fill(48, 55, 10, 11, '~') // another stretch of sea
    .many('D', [51, 6], [54, 6])
    .put(58, 9, 'C')
    .put(60, 9, 'D')
    .fill(61, 63, 7, 7, '=')
    .put(62, 6, 'D')
    .many('p', [1, 9], [31, 9], [45, 9], [64, 9])
    .put(66, 9, 'F')
    .rows();
}

// ------------------------------------------------------------------ Cloud Heights

function clouds1(): string[] {
  return grid(64, 16)
    .fill(0, 12, 10, 12, '#') // island 1
    .put(2, 9, 'P')
    .many('D', [5, 9], [6, 9])
    .put(10, 9, 'C')
    .put(13, 10, 'U') // a white cloud: blow it across the gap
    .many('D', [17, 8], [20, 8])
    .fill(22, 36, 10, 12, '#') // island 2
    .put(24, 9, 'C')
    .put(26, 9, 'T') // warm air up to the high ledges
    .fill(27, 31, 4, 4, '=')
    .many('D', [28, 3], [29, 3], [30, 3])
    .put(33, 9, 'T') // make a cloud over the gap
    .many('D', [40, 6], [43, 6])
    .fill(47, 63, 10, 12, '#') // island 3
    .put(49, 9, 'C')
    .put(53, 9, 'R')
    .put(56, 9, 'M') // the windmill
    .put(61, 9, 'F')
    .rows();
}

function clouds2(): string[] {
  return grid(72, 14)
    .fill(0, 71, 11, 13, '#')
    .put(4, 10, 'P')
    .put(2, 4, 'G') // a full grey cloud: blow it over the seed, then rain
    .put(9, 10, 'S') // the vine grows right up against the wall
    .fill(11, 13, 3, 10, '#') // a wall: climb the vine
    .put(12, 2, 'D')
    .put(16, 10, 'C')
    .put(18, 6, 'G') // the farmer's cloud
    .put(20, 10, 'R')
    .put(23, 10, 'Y')
    .fill(32, 40, 11, 13, '~') // a pond: make a cloud and blow it across
    .many('D', [35, 7], [38, 7])
    .put(43, 10, 'C')
    .put(43, 3, 'G')
    .put(50, 10, 'S')
    .fill(52, 54, 4, 10, '#') // another wall
    .put(53, 3, 'D')
    .many('D', [58, 10], [60, 10])
    .put(62, 2, 'Q') // a tall storm cloud, far off
    .put(68, 10, 'F')
    .rows();
}

// ------------------------------------------------------------------ Mountain Pass

function mountain1(): string[] {
  return grid(92, 18)
    .fill(0, 25, 15, 17, '#')
    .put(2, 14, 'P')
    .fill(10, 12, 15, 17, '~') // a stream: jump it
    .put(11, 12, 'D')
    .many('n', [6, 14], [16, 14], [23, 14])
    .put(20, 14, 'C')
    .fill(26, 28, 13, 17, '#')
    .fill(29, 47, 11, 17, '#')
    .fill(34, 40, 11, 17, '~') // a pond at 2 °C: too warm to freeze
    .put(37, 8, 'D')
    .put(31, 10, 'D')
    .put(44, 10, 'C')
    .fill(48, 50, 9, 17, '#')
    .fill(51, 91, 7, 17, '#')
    .fill(53, 56, 7, 7, 'I') // ice underfoot
    .put(57, 6, 'C')
    .fill(60, 68, 7, 17, '~') // the river at −6 °C: freeze it
    .many('D', [62, 6], [65, 6])
    .put(71, 6, 'C')
    .put(74, 6, 'R')
    .put(76, 1, 'G') // the children's snow cloud
    .many('n', [52, 6], [70, 6], [79, 6])
    .fill(82, 91, 2, 6, '#') // the last cliff
    .put(81, 2, 'W') // a waterfall: freeze it into steps
    .put(84, 1, 'D')
    .put(88, 1, 'F')
    .rows();
}

function mountain2(): string[] {
  return grid(84, 16)
    .fill(0, 21, 6, 15, '#')
    .put(2, 5, 'P')
    .fill(6, 10, 6, 6, 'I')
    .fill(14, 14, 0, 1, '#') // a rock arch over an ice wall
    .put(14, 5, 'B')
    .put(17, 5, 'C')
    .put(21, 2, 'W') // a waterfall to freeze into steps
    .fill(22, 35, 2, 15, '#') // the cliff
    .many('D', [8, 5], [10, 5], [25, 1], [28, 1], [39, 7], [56, 11])
    .put(33, 1, 'C')
    .fill(36, 41, 8, 15, '#')
    .fill(42, 47, 10, 15, '#')
    .put(45, 9, 'Z') // a snowbank: the Sun melts it into the stream
    .fill(48, 83, 12, 15, '#')
    .put(50, 11, 'R')
    .fill(52, 54, 12, 12, 'V') // the dry stream bed
    .put(58, 11, 'C')
    .fill(63, 72, 12, 15, '~') // the valley river at 4 °C: too warm to freeze
    .many('D', [66, 9], [69, 9])
    .many('n', [4, 5], [19, 5], [38, 7], [60, 11], [76, 11])
    .put(80, 11, 'F')
    .rows();
}

// ------------------------------------------------------------------ River Run

function river1(): string[] {
  const g = grid(124, 16)
    .fill(0, 123, 12, 15, '#') // the riverbed
    .fill(0, 7, 10, 11, '#') // the start bank
    .put(2, 9, 'P')
    .fill(8, 49, 10, 11, '~') // the upper river
    .put(8, 9, 'r') // the raft
    .many('D', [14, 7], [20, 7], [26, 8], [44, 7], [47, 7])
    .put(30, 9, 'C')
    .fill(36, 41, 10, 11, 'V') // a dry stretch: rain fills it
    .put(37, 3, 'G')
    .fill(50, 123, 12, 13, '.') // the waterfall: the river drops two rows
    .fill(50, 113, 12, 13, '~') // the lower river
    .many('D', [55, 10], [58, 9], [64, 9], [84, 9], [90, 9], [96, 10], [102, 9], [108, 9])
    .put(60, 11, 'C')
    .fill(70, 75, 12, 13, 'V') // a second dry stretch: blow the cloud over it first
    .put(63, 4, 'G')
    .fill(77, 81, 9, 9, '=') // Mr. Okoye's pier
    .put(79, 8, 'R')
    .put(88, 11, 'C')
    .fill(114, 123, 12, 15, '#') // the far bank
    .put(119, 11, 'F')
    .many('n', [4, 9], [116, 11]);
  return g.rows();
}

function river2(): string[] {
  return grid(96, 16)
    .fill(0, 95, 13, 15, '#')
    .put(2, 12, 'P')
    .put(8, 12, 'E') // a tree: its leaves give off water vapor
    .fill(11, 60, 8, 15, '#') // the hills (5 tiles: too high to jump)
    .many('D', [14, 7], [16, 7], [20, 7])
    .put(18, 7, 'C')
    .fill(24, 25, 8, 8, '.') // the way down into the cave
    .fill(24, 52, 9, 13, '.') // the cave
    .fill(33, 35, 14, 14, '~') // groundwater, in the cave floor
    .fill(37, 39, 14, 14, '~')
    .many('D', [29, 13], [36, 11], [44, 13])
    .put(42, 13, 'C')
    .fill(49, 52, 8, 8, '.') // the way out: ledges up a shaft
    .fill(49, 50, 12, 12, '=')
    .fill(51, 52, 10, 10, '=')
    .fill(51, 52, 8, 8, '=')
    .put(56, 7, 'D')
    .put(66, 12, 'R')
    .fill(70, 71, 13, 14, 'V') // the dry well
    .put(64, 4, 'G')
    .put(74, 12, 'C')
    .fill(78, 90, 13, 14, '~') // the river, on to the sea
    .put(78, 12, 'r')
    .many('D', [82, 10], [86, 10])
    .put(93, 12, 'F')
    .many('n', [4, 12], [58, 7], [76, 12])
    .rows();
}

// ------------------------------------------------------------------ Storm Front

function storm1(): string[] {
  return grid(100, 14)
    .fill(0, 99, 11, 13, '#')
    .put(2, 10, 'P')
    .put(6, 10, 'R')
    .many('h', [10, 10], [30, 10], [52, 10], [74, 10])
    .many('e', [15, 10], [37, 10], [58, 10])
    .fill(20, 22, 11, 13, '~') // a stream: jump it
    .many('D', [21, 8], [26, 10], [33, 7], [47, 10], [64, 4], [68, 4], [86, 10])
    .put(26, 10, 'K')
    .fill(32, 34, 8, 8, '=')
    .put(42, 10, 'C')
    .put(45, 10, 'w') // Dr. Iris's weather station
    .put(62, 10, 'T') // a tide pool: ride the warm air
    .fill(65, 70, 6, 10, '#') // the sea wall
    .put(78, 10, 'C')
    .put(90, 1, 'Q')
    .put(96, 10, 'F')
    .rows();
}

function storm2(): string[] {
  return grid(112, 14)
    .fill(0, 84, 11, 13, '#')
    .fill(85, 111, 11, 13, '~') // the cold sea
    .put(2, 10, 'P')
    .put(6, 2, 'O') // the storm cloud
    .many('h', [14, 10], [22, 10], [44, 10], [50, 10])
    .many('D', [12, 10], [28, 8], [36, 7], [58, 9], [70, 8], [76, 10], [90, 8], [94, 8])
    .put(30, 10, 'K')
    .fill(34, 37, 9, 10, '#') // a wall to jump
    .put(40, 10, 'C')
    .fill(56, 58, 11, 13, '~') // a stream
    .fill(66, 68, 9, 10, '#')
    .put(72, 10, 'C')
    .put(77, 10, 'R')
    .put(80, 10, 'u') // the lighthouse
    .fill(85, 97, 10, 10, '=') // the pier
    .put(95, 9, 'F')
    .rows();
}

const NIMBUS_SHORE_1 = [
  'Welcome to Sunny Shore, my young apprentice! Every journey of the water cycle starts here, with the Sun.',
  'First, the basics. Run with the arrow keys and jump with Space. Hold Space for a higher jump.',
  'See that tall cliff? Too high to jump. But warm air rises! Use the Sun on the tide pool, then step into the rising air.',
];

export const LEVELS: LevelDef[] = [
  {
    id: 'shore-1',
    region: 'shore',
    num: 1,
    name: 'The Beach',
    rows: shore1(),
    powers: ['sun'],
    temps: [[0, 26]],
    intro: NIMBUS_SHORE_1,
    tips: [
      [4, 'Collect the droplets. They are bits of water on their way round the water cycle.'],
      [17, 'A weather vane! If you fall in the water, you start again from the last one you touched.'],
      [27, 'A crab! It scuttles side to side. Jump over it.'],
      [33, 'Press 1 to use the Sun on the tide pool. Then walk into the shimmer, and the warm air will carry you up the cliff.'],
    ],
    request: {
      kind: 'dry',
      look: 0,
      name: 'Mrs. Adebayo',
      ask: 'My washing is soaking wet, and I need it dry by tonight! Could your Sun help?',
      thanks: 'Dry already! The Sun warmed the water in the clothes, and it evaporated into the air. Thank you!',
      badge: 'Dry washing',
    },
  },
  {
    id: 'shore-2',
    region: 'shore',
    num: 2,
    name: 'The Tide Pools',
    rows: shore2(),
    powers: ['sun', 'cool'],
    temps: [[0, 25]],
    intro: [
      'A new power: Cool air! Rising water vapor is invisible. When it cools, it turns into tiny drops. Billions of tiny drops make a cloud.',
      'So: the Sun warms the water and makes vapor. Then Cool air turns the vapor into a cloud. With a little wizard’s help, it is a cloud you can stand on!',
      'A gentle sea breeze blows here. Once you are standing on a cloud, the breeze carries it along.',
    ],
    tips: [
      [12, 'The sea is too wide to jump. Face the water, press 1 for the Sun, then 2 for Cool air.'],
      [15, 'Jump on the cloud. The sea breeze will carry it across.'],
    ],
    breeze: 1.6,
    request: {
      kind: 'shade',
      look: 2,
      name: 'Koa',
      ask: 'It is so hot today! Could you make a cloud to shade our picnic?',
      thanks: 'Ahh, shade! A cloud blocks some of the Sun’s light. Thank you, wizard!',
      badge: 'Picnic shade',
    },
  },
  {
    id: 'clouds-1',
    region: 'clouds',
    num: 1,
    name: 'Island Hopping',
    rows: clouds1(),
    powers: ['sun', 'cool', 'wind'],
    temps: [[0, 12]],
    intro: [
      'We are high above the camp now, where the air is cooler. That is why clouds form up here.',
      'A new power: Wind! Wind pushes clouds along. Stand on a cloud, face where you want to go, and press 3.',
      'Do not fall between the islands. There is a long way down, and you will float back to the last weather vane.',
    ],
    tips: [
      [11, 'Jump onto the white cloud, face right, and press 3 for Wind.'],
      [31, 'Warm the tide pool, cool the vapor into a cloud, then blow it across the gap.'],
    ],
    request: {
      kind: 'windmill',
      look: 1,
      name: 'Mr. Tanaka',
      ask: 'My windmill pumps water for the island garden, but the air is so still today. Could you bring some wind?',
      thanks: 'Look at it spin! Moving air pushes the blades round, and the pump brings up the water. Thank you!',
      badge: 'Windmill turning',
    },
  },
  {
    id: 'clouds-2',
    region: 'clouds',
    num: 2,
    name: 'The Grey Clouds',
    rows: clouds2(),
    powers: ['sun', 'cool', 'wind', 'rain'],
    temps: [[0, 9]],
    intro: [
      'A new power: Rain! But rain only falls from a full, grey cloud. Its tiny drops have bumped together into drops heavy enough to fall.',
      'A small white cloud is not full enough. And from a clear blue sky, not even a weather wizard can make rain!',
      'Blow the grey cloud over the seed with Wind, then press 4 for Rain. Plants need water to grow.',
    ],
    tips: [
      [5, 'Face right and press 3 to blow the grey cloud over the seed. Then press 4 for Rain.'],
      [30, 'A pond. You know what to do: Sun, Cool air, then Wind.'],
      [45, 'Another seed, another grey cloud. Blow it over and make it rain.'],
      [60, 'See the tall, dark cloud with a flat top far away? That is a storm cloud. We will meet one at the Storm Front.'],
    ],
    request: {
      kind: 'field',
      look: 1,
      name: 'Farmer Okafor',
      ask: 'My field is so dry, the beans are wilting. That grey cloud over there looks full. Could you bring it here?',
      thanks: 'Rain! The beans will drink it up through their roots. Thank you, young wizard!',
      badge: 'Rain for the beans',
    },
  },
  {
    id: 'mountain-1',
    region: 'mountain',
    num: 1,
    name: 'The Foothills',
    rows: mountain1(),
    powers: ['sun', 'cool', 'wind', 'rain', 'cold'],
    temps: [
      [0, 8],
      [29, 2],
      [51, -6],
    ],
    intro: [
      'Hello! I am Dr. Iris Okoro, a meteorologist. That means I study the weather and forecast it. I will be your guide up the mountain.',
      'Watch the thermometer as we climb. The air gets colder the higher you go.',
      'Professor Nimbus says you have a new power: Cold. It freezes water, but only below 0 °C. That is when water really freezes.',
    ],
    tips: [
      [30, 'It is 2 °C here. Just above freezing, so Cold will not freeze this pond. Try a cloud instead.'],
      [52, 'Feel that? It is −6 °C up here, below freezing. Snow is falling, and the ground is icy.'],
      [58, 'Face the river and press 5 for Cold.'],
      [78, 'A frozen waterfall makes good steps. Try Cold on it.'],
    ],
    request: {
      kind: 'snow',
      look: 2,
      name: 'Amara and Leo',
      ask: 'We brought our sled, but there is no fresh snow! That grey cloud is full. Could it snow?',
      thanks: 'Snow! It is below 0 °C up here, so the cloud’s water froze into snowflakes. Wheee!',
      badge: 'Snow for sledding',
    },
  },
  {
    id: 'mountain-2',
    region: 'mountain',
    num: 2,
    name: 'The High Pass',
    rows: mountain2(),
    powers: ['sun', 'cool', 'wind', 'rain', 'cold'],
    temps: [
      [0, -5],
      [40, 4],
    ],
    intro: ['The High Pass! It is −5 °C up here. We go over the top and down into the valley, where it is warmer.', 'Ice blocks the way at the start. The Sun can melt it.'],
    tips: [
      [11, 'An ice wall. Face it and press 1 for the Sun.'],
      [19, 'Freeze the waterfall with Cold (5) to make steps.'],
      [41, 'Down in the valley it is 4 °C, above freezing. Snow melts down here.'],
      [61, 'The river is too warm to freeze. How else could you cross?'],
    ],
    request: {
      kind: 'melt',
      look: 1,
      name: 'Mr. Petrov',
      ask: 'Our stream is dry, and the cows are thirsty. Every spring the snow melts and fills it. Could you help it along?',
      thanks: 'Here comes the water! Melted snow flows downhill into the stream. That is how mountains fill the rivers every spring.',
      badge: 'Spring meltwater',
    },
  },
  {
    id: 'river-1',
    region: 'river',
    num: 1,
    name: 'The Raft Ride',
    rows: river1(),
    powers: ['sun', 'cool', 'wind', 'rain', 'cold'],
    temps: [[0, 16]],
    intro: [
      'Welcome to River Run! Drip’s snow has melted, and now the water is going downhill, all the way to the sea.',
      'Hop on the raft. The river will carry you. Jump for the droplets, and watch out: in dry weather, parts of a river can dry up.',
    ],
    tips: [
      [12, 'The river flows downhill, so it carries the raft along. Jump to catch the droplets.'],
      [30, 'The riverbed ahead is dry! Rain from a full, grey cloud can fill it. Press 4 for Rain.'],
      [49, 'A waterfall! Water always flows downhill.'],
      [64, 'Another dry stretch, but the grey cloud is not over it yet. Wind (3) can push it there.'],
      [100, 'Nearly at the bank. Rivers like this one carry rain and melted snow all the way to the sea.'],
    ],
    request: {
      kind: 'fill',
      look: 0,
      name: 'Mr. Okoye',
      ask: 'My boat is stuck in the mud! The river by my pier has dried up. It only needs rain to fill it again.',
      thanks: 'The water is back! Rain ran into the riverbed and filled it. That is collection: water gathering in rivers.',
      badge: 'Full river',
    },
  },
  {
    id: 'river-2',
    region: 'river',
    num: 2,
    name: 'Under the Hills',
    rows: river2(),
    powers: ['sun', 'cool', 'wind', 'rain', 'cold'],
    temps: [[0, 14]],
    intro: [
      'Some rain does not run into rivers. It soaks into the ground. Today we follow it underground!',
      'First, those hills are too high to jump. But trees give off water vapor from their leaves. Try the Sun on that tree.',
    ],
    tips: [
      [5, 'Face the tree and press 1. The Sun warms its leaves, and they give off water vapor. Ride the warm air up.'],
      [24, 'A cave! Climb down. Look at the water in the rock.'],
      [30, 'This is groundwater: rain that soaked down and filled the gaps in the rock. Jump over it.'],
      [47, 'Climb the ledges up the shaft to get out.'],
      [62, 'Mrs. Mensah’s well is dry. Rain on the ground nearby will soak down and fill it.'],
      [76, 'Hop on the raft. This river carries the water on to the sea.'],
    ],
    caves: [[24, 9, 52, 13]],
    request: {
      kind: 'well',
      look: 1,
      name: 'Mrs. Mensah',
      ask: 'Our well has gone dry. It has not rained for weeks. Is that grey cloud full?',
      thanks: 'The well is filling! The rain soaked into the ground and refilled the groundwater, so the well has water again.',
      badge: 'Full well',
    },
  },
  {
    id: 'storm-1',
    region: 'storm',
    num: 1,
    name: 'Storm Warning',
    rows: storm1(),
    powers: ['sun', 'cool', 'wind', 'rain', 'cold'],
    temps: [[0, 24]],
    stormy: true,
    countAt: 44,
    intro: [
      'The Storm Front! A big thunderstorm is coming in from the sea. Warm, wet air feeds it, and it grows very tall.',
      'People in the village are still outside. Touch each one to send them indoors. When thunder roars, go indoors!',
      'And stop at my weather station. We will work out how far away the storm is.',
    ],
    tips: [
      [12, 'Run into each villager outside. They will hurry indoors.'],
      [40, 'Dr. Iris’s weather station is just ahead.'],
      [60, 'The sea wall is too high to jump. Use the warm air from the tide pool.'],
    ],
    request: {
      kind: 'shelter',
      look: 2,
      name: 'Mayor Bello',
      ask: 'A storm is coming, and three people are still outside! Can you get them all indoors?',
      thanks: 'Everyone is safe inside. A building keeps you safe from lightning. Thank you!',
      badge: 'Everyone indoors',
    },
  },
  {
    id: 'storm-2',
    region: 'storm',
    num: 2,
    name: 'Out to Sea',
    rows: storm2(),
    powers: ['sun', 'cool', 'wind', 'rain', 'cold'],
    temps: [[0, 22]],
    stormy: true,
    seaAt: 88,
    intro: [
      'The storm is over the village now! Everyone is safe indoors.',
      'Here is the make-believe part: in this game, Wind can push the storm. In real life nobody can. Storms are steered by winds high in the sky.',
      'Push it past the lighthouse and out over the cold sea. Cold water gives a storm less warm, wet air, so it rains itself out.',
    ],
    tips: [
      [3, 'Face the storm and press 3 for Wind. Keep pushing it toward the sea.'],
      [60, 'Count from each flash to the thunder. The more seconds, the farther away the storm.'],
      [76, 'The lighthouse has a lightning rod on top.'],
    ],
    request: {
      kind: 'storm',
      look: 0,
      name: 'Keeper Larsen',
      ask: 'I keep the lighthouse. Its light guides the boats home, but nobody can see it in this storm. Is it moving out to sea?',
      thanks: 'The sky is clearing! The storm rained itself out over the cold sea, and my light shines again. Thank you!',
      badge: 'Clear skies',
    },
  },
];

export const CAMP: LevelDef = {
  id: 'camp',
  region: 'river',
  num: 0,
  name: 'The field camp',
  rows: camp(),
  powers: [],
  temps: [[0, 22]],
  intro: [],
  tips: [],
};

export function level(id: string): LevelDef {
  const l = LEVELS.find((x) => x.id === id);
  if (!l) throw new Error(`No level ${id}`);
  return l;
}

/** The temperature at column x on a level. */
export function tempAt(l: LevelDef, x: number): number {
  let t = l.temps[0][1];
  for (const [x0, c] of l.temps) if (x >= x0) t = c;
  return t;
}

export function regionLevels(r: Region): LevelDef[] {
  return LEVELS.filter((l) => l.region === r);
}
