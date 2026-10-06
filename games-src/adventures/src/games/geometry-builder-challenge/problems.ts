/**
 * Shape Town Builders: the math, as pure functions (no drawing, no timers),
 * so every rule can be unit tested.
 *
 * Half 1 (this file so far):
 * - Kofi's Shape Sorting Arcade: name flat shapes drawn in any size, color
 *   and turn; count sides and corners; tell real shapes from shapes with a
 *   gap or a curved side; sort by rules ("4 square corners": a square goes
 *   in too).
 * - Lupe's Block Shop: flat or solid, naming solids, what rolls or stacks,
 *   everyday objects, and faces (including the ones you can't see).
 * - Mr. Haruto's Blueprint Workshop: count the shapes in a blueprint
 *   (including the wheels hiding behind a car), compose a shape from
 *   smaller pieces, and partition a rectangle into rows and columns.
 * - Priya's Garden Yard: area and perimeter on a grid, then with labelled
 *   sides, then L-shaped gardens (three steps), missing sides and "same
 *   area, different fence" (up to 4.MD.3).
 */

export type Station = 'arcade' | 'blocks' | 'blueprint' | 'garden';
export const STATIONS: Station[] = ['arcade', 'blocks', 'blueprint', 'garden'];
/** The stations open in the yard (all four since half 2). */
export const OPEN_STATIONS: Station[] = ['arcade', 'blocks', 'blueprint', 'garden'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'turned-not-same' // a turned square is "a diamond", a turned triangle "not a triangle"
  | 'only-the-usual-one' // a skinny or upside-down triangle is "not a triangle"
  | 'square-rect-mix' // calls a long rectangle a square, or the other way
  | 'square-not-rectangle' // "a square can't be a rectangle"
  | 'corners-not-checked' // 4 equal sides, so it must have square corners (a rhombus)
  | 'count-slip' // one side or corner too many or too few
  | 'sides-vs-corners' // counted corners for sides, or a curve as a side
  | 'open-or-curved' // a shape with a gap or a curved side still counts
  | 'too-strict' // rejected a real shape that looked unusual
  | 'flat-name-for-solid' // a cube is "a square", a sphere "a circle"
  | 'flat-or-solid' // mixed up flat and solid
  | 'solid-mixup' // named another solid (cone for cylinder)
  | 'roll-stack' // thinks a sphere can stack, or a cube can roll
  | 'visible-faces-only' // counted only the faces you can see
  | 'side-view' // calls a cone's face a triangle (its side view)
  | 'missed-piece' // missed a piece in a blueprint (often the wheels at the back)
  | 'double-count' // counted one piece twice
  | 'counted-all' // counted every piece, not just the asked shape
  | 'compose-gap' // too few pieces: there would be a gap
  | 'compose-overlap' // too many pieces: they would overlap
  | 'counted-corners' // gave the number of corners of the big shape
  | 'rows-plus-cols' // added rows and columns instead of counting every square
  | 'rows-only' // counted one row
  | 'drawn-only' // counted only the tiles drawn along the edges
  | 'area-perimeter-swap' // gave the fence when asked for the ground, or the other way
  | 'perimeter-counts-squares' // counted the squares along the edge, not the fence pieces
  | 'two-sides-only' // added one long and one short side (half the fence)
  | 'add-for-area' // added the sides to find the area
  | 'missing-side' // forgot a part of the garden (the notch, or unlabelled sides)
  | 'overlap-double' // counted the corner where two rectangles meet twice
  | 'pieces-make-bigger' // thinks pieces put together make something bigger
  | 'shape-of-garden' // thinks a square-ish garden needs more fence than a long thin one
  | 'other';

export interface Choice<T = string> {
  value: T;
  label: string;
  correct: boolean;
  misconception?: Misconception;
}

type Rand = () => number;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T>(r: Rand, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
function shuffle<T>(r: Rand, xs: T[]): T[] {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs;
}

// ------------------------------------------------------------ flat shapes

export type Shape2D = 'triangle' | 'square' | 'rectangle' | 'circle' | 'pentagon' | 'hexagon' | 'octagon' | 'rhombus' | 'parallelogram';
export const SIDES: Record<Shape2D, number> = { triangle: 3, square: 4, rectangle: 4, circle: 0, pentagon: 5, hexagon: 6, octagon: 8, rhombus: 4, parallelogram: 4 };
const COLORS = ['#d2453a', '#e8832e', '#e8bd3f', '#4f9a4a', '#2f9a94', '#4b7fcf', '#8a5cc4', '#dc6f9c'];

export interface ShapeSpec {
  kind: Shape2D;
  /** Corner points in a box from -1 to 1 (empty for a circle). */
  pts: Array<[number, number]>;
  color: string;
  /** Size as a fraction of the drawing box (0.45 to 1). */
  scale: number;
  /** A gap in the last side (not a closed shape). */
  open?: boolean;
  /** The first side is drawn as a curve. */
  curved?: boolean;
}

const rot = (pts: Array<[number, number]>, a: number): Array<[number, number]> => pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);

function regular(n: number, start = -Math.PI / 2): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const a = start + (i * 2 * Math.PI) / n;
    return [Math.cos(a), Math.sin(a)] as [number, number];
  });
}

/** Fit points into the -1..1 box (keeps the shape, centres it). */
function fit(pts: Array<[number, number]>): Array<[number, number]> {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const s = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 || 1;
  return pts.map(([x, y]) => [(x - cx) / s, (y - cy) / s]);
}

export interface ShapeOptions {
  turn?: number; // radians
  skinny?: boolean;
  irregular?: boolean;
  scale?: number;
  color?: string;
}

export function makeShape(kind: Shape2D, r: Rand, o: ShapeOptions = {}): ShapeSpec {
  let pts: Array<[number, number]> = [];
  switch (kind) {
    case 'circle':
      break;
    case 'triangle':
      pts = o.skinny ? [[0, -1], [0.32, 1], [-0.32, 1]] : o.irregular ? [[-0.2, -1], [1, 0.8], [-1, 0.6]] : regular(3);
      break;
    case 'square':
      pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      break;
    case 'rectangle': {
      const h = o.skinny ? 0.35 : 0.55 + r() * 0.1;
      pts = [[-1, -h], [1, -h], [1, h], [-1, h]];
      break;
    }
    case 'rhombus':
      pts = [[0, -1], [0.6, 0], [0, 1], [-0.6, 0]];
      break;
    case 'parallelogram':
      pts = [[-0.6, -0.55], [1, -0.55], [0.6, 0.55], [-1, 0.55]];
      break;
    default: {
      const n = SIDES[kind];
      pts = regular(n);
      if (o.irregular) pts = pts.map(([x, y], i) => {
        const k = 0.72 + ((i * 37 + int(r, 0, 9)) % 10) / 36;
        return [x * k, y * k];
      });
    }
  }
  if (pts.length && o.turn) pts = rot(pts, o.turn);
  return { kind, pts: pts.length ? fit(pts) : [], color: o.color ?? pick(r, COLORS), scale: o.scale ?? 0.7 + r() * 0.3 };
}

/** Is this square drawn standing on a corner (the "diamond" look)? */
export function onCorner(s: ShapeSpec): boolean {
  if (s.kind !== 'square') return false;
  const top = Math.min(...s.pts.map((p) => p[1]));
  return s.pts.filter((p) => Math.abs(p[1] - top) < 0.05).length === 1;
}

const NAME: Record<Shape2D, string> = {
  triangle: 'triangle',
  square: 'square',
  rectangle: 'rectangle',
  circle: 'circle',
  pentagon: 'pentagon',
  hexagon: 'hexagon',
  octagon: 'octagon',
  rhombus: 'rhombus',
  parallelogram: 'parallelogram',
};
export const shapeName = (k: Shape2D) => NAME[k];

// ------------------------------------------------------------ Kofi's Shape Sorting Arcade

export type ArcadeKind = 'name' | 'count' | 'closed' | 'rule' | 'odd';

export interface ArcadeProblem {
  station: 'arcade';
  tier: Tier;
  kind: ArcadeKind;
  /** One shape on the belt, or three (labelled A, B, C) for "odd one out". */
  shapes: ShapeSpec[];
  prompt: string;
  /** The bins: one is right. */
  choices: Choice[];
  /** One sentence that explains the right answer. */
  explain: string;
  /** What the picture hint numbers: the corners (sides and corners are equal for closed shapes). */
  count?: 'sides' | 'corners';
}

function choicesFrom(r: Rand, right: string, wrong: Array<[string, Misconception]>, labels?: Record<string, string>): Choice[] {
  const out: Choice[] = [{ value: right, label: labels?.[right] ?? right, correct: true }];
  for (const [v, m] of wrong) {
    if (out.length >= 3) break;
    if (out.some((c) => c.value === v)) continue;
    out.push({ value: v, label: labels?.[v] ?? v, correct: false, misconception: m });
  }
  return shuffle(r, out);
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function arcadeName(r: Rand, tier: Tier): ArcadeProblem {
  const roll = r();
  let shape: ShapeSpec;
  let wrong: Array<[string, Misconception]>;
  let explain: string;
  if (roll < 0.22) {
    // a square on its corner: the classic "diamond"
    shape = makeShape('square', r, { turn: Math.PI / 4 });
    wrong = [['diamond', 'turned-not-same'], ['rectangle', 'square-rect-mix']];
    explain = 'It is still a square: 4 equal sides and 4 square corners. Turning a shape does not change it.';
  } else if (roll < 0.42) {
    const skinny = r() < 0.5;
    shape = makeShape('triangle', r, { skinny, irregular: !skinny, turn: pick(r, [0, Math.PI, Math.PI / 2, -0.6]) });
    wrong = [['not a shape', 'only-the-usual-one'], [pick(r, ['rectangle', 'square']), 'other']];
    explain = 'Any closed shape with 3 straight sides is a triangle, even a skinny or upside-down one.';
  } else if (roll < 0.58) {
    shape = makeShape('rectangle', r, { skinny: r() < 0.4, turn: pick(r, [0, Math.PI / 2, 0.3]) });
    wrong = [['square', 'square-rect-mix'], ['triangle', 'other']];
    explain = 'A rectangle has 4 square corners. Its long sides are longer than its short sides, so it is not a square.';
  } else if (roll < 0.7) {
    shape = makeShape('circle', r);
    wrong = [['oval', 'other'], ['sphere', 'flat-name-for-solid']];
    explain = 'A circle is round and flat, the same distance across every way. A sphere is a solid ball.';
  } else if (roll < 0.82) {
    shape = makeShape('square', r, { turn: pick(r, [0, 0.25, -0.2]) });
    wrong = [['rectangle', 'square-rect-mix'], ['diamond', 'turned-not-same']];
    explain = 'A square has 4 equal sides and 4 square corners.';
  } else {
    const kind = tier === 1 ? 'hexagon' : pick(r, ['pentagon', 'hexagon', 'octagon'] as const);
    shape = makeShape(kind, r, { turn: r() * Math.PI, irregular: tier > 1 && r() < 0.5 });
    const n = SIDES[kind];
    const near = (['pentagon', 'hexagon', 'octagon'] as const).filter((k) => k !== kind);
    wrong = near.map((k) => [k, Math.abs(SIDES[k] - n) === 1 ? 'count-slip' : 'other'] as [string, Misconception]);
    explain = `It has ${n} sides, so it is a ${kind}. Count each side once.`;
  }
  return { station: 'arcade', tier, kind: 'name', shapes: [shape], prompt: 'What shape is this? Send it to the right bin.', choices: choicesFrom(r, shape.kind, wrong, { 'not a shape': 'Not a shape' }), explain };
}

function arcadeCount(r: Rand, tier: Tier): ArcadeProblem {
  const pool: Shape2D[] = tier === 1 ? ['triangle', 'square', 'rectangle', 'hexagon'] : ['triangle', 'rectangle', 'pentagon', 'hexagon', 'octagon', 'circle'];
  const kind = pick(r, pool);
  const shape = makeShape(kind, r, { turn: r() * Math.PI * 2, irregular: tier > 1 && r() < 0.5, skinny: kind === 'triangle' && r() < 0.3 });
  const what = r() < 0.5 ? 'sides' : 'corners';
  const n = SIDES[kind];
  if (kind === 'circle') {
    const prompt = what === 'sides' ? 'How many straight sides does a circle have?' : 'How many corners does a circle have?';
    return {
      station: 'arcade',
      tier,
      kind: 'count',
      shapes: [shape],
      prompt,
      choices: choicesFrom(r, '0', [['1', 'sides-vs-corners'], ['4', 'other']]),
      explain: 'A circle has one curved edge: no straight sides and no corners.',
      count: what,
    };
  }
  return {
    station: 'arcade',
    tier,
    kind: 'count',
    shapes: [shape],
    prompt: `How many ${what} does this shape have?`,
    choices: choicesFrom(r, String(n), [[String(n + 1), 'count-slip'], [String(n - 1), 'count-slip']]),
    explain: `Touch each ${what === 'sides' ? 'side' : 'corner'} once: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. ${n} ${what}.`,
    count: what,
  };
}

function arcadeClosed(r: Rand, tier: Tier): ArcadeProblem {
  const kind: Shape2D = r() < 0.6 ? 'triangle' : 'rectangle';
  const flaw = pick(r, ['none', 'open', 'curved', ...(kind === 'rectangle' ? ['slanted'] : [])] as const);
  const shape = flaw === 'slanted' ? makeShape('parallelogram', r) : makeShape(kind, r, { turn: pick(r, [0, Math.PI, 0.5]), skinny: r() < 0.4 });
  if (flaw === 'open') shape.open = true;
  if (flaw === 'curved') shape.curved = true;
  const yes = `Yes, it is a ${kind}`;
  const gap = 'No, it has a gap';
  const curve = 'No, a side is curved';
  const slant = 'No, its corners are not square';
  const right = flaw === 'none' ? yes : flaw === 'open' ? gap : flaw === 'curved' ? curve : slant;
  const wrong: Array<[string, Misconception]> =
    flaw === 'none'
      ? [[kind === 'rectangle' ? slant : gap, 'too-strict'], [curve, 'too-strict']]
      : [[yes, flaw === 'slanted' ? 'corners-not-checked' : 'open-or-curved'], [flaw === 'open' ? curve : gap, 'other']];
  const explain =
    flaw === 'none'
      ? `It is closed, with ${SIDES[kind]} straight sides${kind === 'rectangle' ? ' and 4 square corners' : ''}. It is a ${kind}, even turned or stretched.`
      : flaw === 'open'
        ? `A ${kind} must be closed all the way round. This one has a gap.`
        : flaw === 'curved'
          ? `A ${kind} has only straight sides. This one has a curved side.`
          : 'A rectangle needs 4 square corners. These corners are slanted, so it is not a rectangle.';
  return { station: 'arcade', tier, kind: 'closed', shapes: [shape], prompt: `Kofi's machine only takes real ${kind}s. Is this a ${kind}?`, choices: choicesFrom(r, right, wrong), explain };
}

interface Rule {
  text: string;
  test: (s: ShapeSpec) => boolean;
}
const RULES: Rule[] = [
  { text: '4 square corners', test: (s) => s.kind === 'square' || s.kind === 'rectangle' },
  { text: '4 equal sides', test: (s) => s.kind === 'square' || s.kind === 'rhombus' },
  { text: 'exactly 3 sides', test: (s) => s.kind === 'triangle' },
  { text: 'more than 4 sides', test: (s) => SIDES[s.kind] > 4 },
];

function arcadeRule(r: Rand, tier: Tier): ArcadeProblem {
  const rule = pick(r, RULES);
  // the shapes that make the best traps for each rule
  const cand: Record<string, Array<[Shape2D, ShapeOptions]>> = {
    '4 square corners': [['square', { turn: Math.PI / 4 }], ['square', {}], ['rectangle', {}], ['rhombus', {}], ['parallelogram', {}]],
    '4 equal sides': [['square', { turn: Math.PI / 4 }], ['rhombus', {}], ['rectangle', {}], ['square', {}]],
    'exactly 3 sides': [['triangle', { skinny: true, turn: Math.PI }], ['triangle', { irregular: true }], ['rectangle', {}], ['pentagon', {}]],
    'more than 4 sides': [['pentagon', { irregular: true }], ['hexagon', { irregular: true }], ['octagon', {}], ['rectangle', {}], ['triangle', {}]],
  };
  const [kind, opts] = pick(r, cand[rule.text]);
  const shape = makeShape(kind, r, { ...opts, turn: opts.turn ?? (r() < 0.5 ? r() * 0.6 : 0) });
  const fits = rule.test(shape);
  let mis: Misconception;
  if (fits) mis = kind === 'square' && rule.text === '4 square corners' ? 'square-not-rectangle' : onCorner(shape) ? 'turned-not-same' : kind === 'triangle' ? 'only-the-usual-one' : 'count-slip';
  else mis = kind === 'rhombus' || kind === 'parallelogram' ? 'corners-not-checked' : kind === 'rectangle' && rule.text === '4 equal sides' ? 'square-rect-mix' : 'count-slip';
  const yes = 'Yes, it goes in';
  const no = 'No, it does not';
  const n = SIDES[kind];
  const why: Record<string, string> = {
    '4 square corners': fits ? `It has 4 square corners${kind === 'square' ? '. A square is a special rectangle, so it goes in too' : ''}.` : 'Its corners are slanted, not square.',
    '4 equal sides': fits ? 'All 4 sides are the same length.' : 'Its long sides and short sides are different lengths.',
    'exactly 3 sides': fits ? 'It has 3 straight sides, even though it looks different.' : `It has ${n} sides, not 3.`,
    'more than 4 sides': fits ? `It has ${n} sides, and ${n} is more than 4.` : `It has ${n} sides. That is not more than 4.`,
  };
  return {
    station: 'arcade',
    tier,
    kind: 'rule',
    shapes: [shape],
    prompt: `This bin's rule is "${rule.text}". Does this shape go in?`,
    choices: choicesFrom(r, fits ? yes : no, [[fits ? no : yes, mis]]),
    explain: why[rule.text],
  };
}

function arcadeOdd(r: Rand, tier: Tier): ArcadeProblem {
  if (r() < 0.5) {
    // which is NOT a triangle? (two real triangles, one tricky)
    const real = [makeShape('triangle', r, { skinny: true, turn: Math.PI }), makeShape('triangle', r, { irregular: true, turn: 0.4 })];
    const odd = makeShape(pick(r, ['rectangle', 'pentagon'] as const), r);
    const shapes = shuffle(r, [...real.map((s, i) => ({ s, tag: i === 0 ? 'only-the-usual-one' : 'turned-not-same' })), { s: odd, tag: '' }]);
    const letters = ['A', 'B', 'C'];
    const right = letters[shapes.findIndex((x) => x.s === odd)];
    const choices = shapes.map((x, i) => ({ value: letters[i], label: `Shape ${letters[i]}`, correct: x.s === odd, ...(x.s === odd ? {} : { misconception: x.tag as Misconception }) }));
    return { station: 'arcade', tier, kind: 'odd', shapes: shapes.map((x) => x.s), prompt: 'Which shape is NOT a triangle?', choices, explain: `Shape ${right} has ${SIDES[odd.kind]} sides. The other two have 3 sides each, even the skinny and turned ones.` };
  }
  // which is NOT a rectangle? (a square is one!)
  const sq = makeShape('square', r);
  const rect = makeShape('rectangle', r, { skinny: true });
  const odd = makeShape(pick(r, ['rhombus', 'parallelogram'] as const), r);
  const shapes = shuffle(r, [
    { s: sq, tag: 'square-not-rectangle' },
    { s: rect, tag: 'other' },
    { s: odd, tag: '' },
  ]);
  const letters = ['A', 'B', 'C'];
  const right = letters[shapes.findIndex((x) => x.s === odd)];
  const choices = shapes.map((x, i) => ({ value: letters[i], label: `Shape ${letters[i]}`, correct: x.s === odd, ...(x.s === odd ? {} : { misconception: x.tag as Misconception }) }));
  return { station: 'arcade', tier, kind: 'odd', shapes: shapes.map((x) => x.s), prompt: 'Which shape is NOT a rectangle?', choices, explain: `Shape ${right} has slanted corners. A rectangle needs 4 square corners, and a square has them too, so the square is a rectangle.` };
}

export function makeArcade(tier: Tier, r: Rand): ArcadeProblem {
  if (tier === 1) return r() < 0.75 ? arcadeName(r, 1) : arcadeCount(r, 1);
  if (tier === 2) {
    const x = r();
    return x < 0.4 ? arcadeCount(r, 2) : x < 0.75 ? arcadeClosed(r, 2) : arcadeName(r, 2);
  }
  const x = r();
  return x < 0.45 ? arcadeRule(r, 3) : x < 0.75 ? arcadeOdd(r, 3) : arcadeClosed(r, 3);
}

/** Rush mode: quick naming and counting at the player's level (no rule questions). */
export function makeRush(tier: Tier, r: Rand): ArcadeProblem {
  return r() < 0.65 ? arcadeName(r, Math.min(tier, 2) as Tier) : arcadeCount(r, Math.min(tier, 2) as Tier);
}

export const RUSH_SECONDS = 60;
/** Chip's score in Rush: steady but beatable (about one shape every 4 seconds). */
export function chipScore(seconds: number): number {
  return Math.floor(seconds / 4.2);
}

// ------------------------------------------------------------ Lupe's Block Shop

export type Solid = 'cube' | 'sphere' | 'cone' | 'cylinder' | 'box';
export const SOLIDS: Solid[] = ['cube', 'sphere', 'cone', 'cylinder', 'box'];
export const SOLID_NAME: Record<Solid, string> = { cube: 'cube', sphere: 'sphere', cone: 'cone', cylinder: 'cylinder', box: 'rectangular box' };
/** The flat shape children name instead of the solid. */
const FLAT_LOOKALIKE: Record<Solid, string> = { cube: 'square', sphere: 'circle', cone: 'triangle', cylinder: 'circle', box: 'rectangle' };
export const FACES: Record<Solid, number> = { cube: 6, box: 6, cylinder: 2, cone: 1, sphere: 0 };
const VISIBLE_FACES: Record<Solid, number> = { cube: 3, box: 3, cylinder: 1, cone: 1, sphere: 0 };
const FACE_SHAPE: Partial<Record<Solid, string>> = { cube: 'square', box: 'rectangle', cylinder: 'circle', cone: 'circle' };

export type ThingKind = 'ball' | 'orange' | 'can' | 'drum' | 'dice' | 'giftbox' | 'cereal' | 'icecream' | 'partyhat';
export const THING: Record<ThingKind, { name: string; solid: Solid }> = {
  ball: { name: 'beach ball', solid: 'sphere' },
  orange: { name: 'orange', solid: 'sphere' },
  can: { name: 'soup can', solid: 'cylinder' },
  drum: { name: 'drum', solid: 'cylinder' },
  dice: { name: 'number cube', solid: 'cube' },
  giftbox: { name: 'gift box', solid: 'cube' },
  cereal: { name: 'cereal box', solid: 'box' },
  icecream: { name: 'ice cream cone', solid: 'cone' },
  partyhat: { name: 'party hat', solid: 'cone' },
};

export type BlockKind = 'flat-solid' | 'name' | 'roll' | 'thing' | 'faces' | 'face-shape';

export interface BlockProblem {
  station: 'blocks';
  tier: Tier;
  kind: BlockKind;
  picture: { solid?: Solid; flat?: ShapeSpec; thing?: ThingKind };
  prompt: string;
  choices: Choice[];
  explain: string;
}

function blockFlatSolid(r: Rand, tier: Tier): BlockProblem {
  const solid = r() < 0.5;
  const s = pick(r, SOLIDS);
  const flat = makeShape(pick(r, ['square', 'circle', 'triangle', 'rectangle'] as const), r, { scale: 0.8 });
  return {
    station: 'blocks',
    tier,
    kind: 'flat-solid',
    picture: solid ? { solid: s } : { flat },
    prompt: 'Is this shape flat, or solid?',
    choices: choicesFrom(r, solid ? 'Solid' : 'Flat', [[solid ? 'Flat' : 'Solid', 'flat-or-solid']]),
    explain: solid ? `It is a ${SOLID_NAME[s]}. You could pick it up and hold it: it is solid.` : `It is a ${flat.kind}, drawn flat like a picture on paper. Flat shapes have no thickness.`,
  };
}

function blockName(r: Rand, tier: Tier): BlockProblem {
  const pool: Solid[] = tier === 1 ? ['cube', 'sphere', 'cone', 'cylinder'] : SOLIDS;
  const s = pick(r, pool);
  const other: Record<Solid, Solid> = { cube: 'box', box: 'cube', sphere: 'cylinder', cylinder: 'cone', cone: 'cylinder' };
  const labels: Record<string, string> = { box: 'rectangular box' };
  return {
    station: 'blocks',
    tier,
    kind: 'name',
    picture: { solid: s },
    prompt: 'Lupe needs this block. What is it called?',
    choices: choicesFrom(r, s, [[FLAT_LOOKALIKE[s], 'flat-name-for-solid'], [other[s], 'solid-mixup']], labels),
    explain: `It is a ${SOLID_NAME[s]}. ${cap(FLAT_LOOKALIKE[s])} is the name of a flat shape; this block is solid.`,
  };
}

function blockRoll(r: Rand, tier: Tier): BlockProblem {
  const s = pick(r, ['cube', 'sphere', 'cylinder', 'box'] as const);
  const right = s === 'sphere' ? 'It rolls' : s === 'cylinder' ? 'It rolls and it stacks' : 'It stacks';
  const all = ['It rolls', 'It stacks', 'It rolls and it stacks'];
  const why: Record<string, string> = {
    cube: 'Its faces are all flat, so it stacks but cannot roll.',
    box: 'Its faces are all flat, so it stacks but cannot roll.',
    sphere: 'It is curved all over, so it rolls, but nothing can stack on it.',
    cylinder: 'Its curved side lets it roll, and its two flat faces let it stack.',
  };
  return {
    station: 'blocks',
    tier,
    kind: 'roll',
    picture: { solid: s },
    prompt: `Can a ${SOLID_NAME[s]} roll, stack, or both?`,
    choices: choicesFrom(
      r,
      right,
      all.filter((x) => x !== right).map((x) => [x, 'roll-stack'] as [string, Misconception]),
    ),
    explain: why[s],
  };
}

function blockThing(r: Rand, tier: Tier): BlockProblem {
  const t = pick(r, Object.keys(THING) as ThingKind[]);
  const s = THING[t].solid;
  const other: Record<Solid, Solid> = { cube: 'box', box: 'cube', sphere: 'cylinder', cylinder: 'cone', cone: 'cylinder' };
  return {
    station: 'blocks',
    tier,
    kind: 'thing',
    picture: { thing: t },
    prompt: `A ${THING[t].name} is shaped like which solid?`,
    choices: choicesFrom(r, s, [[other[s], 'solid-mixup'], [FLAT_LOOKALIKE[s], 'flat-name-for-solid']], { box: 'rectangular box' }),
    explain: `A ${THING[t].name} is shaped like a ${SOLID_NAME[s]}.`,
  };
}

function blockFaces(r: Rand, tier: Tier): BlockProblem {
  const s = pick(r, ['cube', 'box', 'cylinder', 'cone'] as const);
  const n = FACES[s];
  const seen = VISIBLE_FACES[s];
  const wrong: Array<[string, Misconception]> = seen !== n ? [[String(seen), 'visible-faces-only'], [String(n - 1), 'count-slip'], [String(n + 1), 'count-slip']] : [[String(n + 1), 'count-slip'], ['0', 'other']];
  const why: Record<string, string> = {
    cube: 'A cube has 6 flat faces: top, bottom, front, back, left and right. You can only see 3 at a time.',
    box: 'A box has 6 flat faces: top, bottom, front, back and two ends. Some hide at the back.',
    cylinder: 'A cylinder has 2 flat faces, one at each end. The curved side is not a flat face.',
    cone: 'A cone has 1 flat face, the circle at the bottom. The rest is curved.',
  };
  return { station: 'blocks', tier, kind: 'faces', picture: { solid: s }, prompt: `How many flat faces does a ${SOLID_NAME[s]} have? Count the ones you can't see too.`, choices: choicesFrom(r, String(n), wrong), explain: why[s] };
}

function blockFaceShape(r: Rand, tier: Tier): BlockProblem {
  const s = pick(r, ['cube', 'box', 'cylinder', 'cone'] as const);
  const right = FACE_SHAPE[s]!;
  const wrong: Array<[string, Misconception]> =
    s === 'cone' ? [['triangle', 'side-view'], ['square', 'other']] : s === 'cylinder' ? [['rectangle', 'side-view'], ['square', 'other']] : s === 'cube' ? [['rectangle', 'square-rect-mix'], ['circle', 'other']] : [['circle', 'other'], ['triangle', 'other']];
  const why: Record<string, string> = {
    cube: 'Every face of a cube is a square: all its edges are the same length.',
    box: 'A box like a cereal box has rectangle faces.',
    cylinder: 'The flat faces at each end of a cylinder are circles. From the side it looks like a rectangle, but that is not a flat face.',
    cone: 'The flat face of a cone is the circle at the bottom. From the side a cone looks like a triangle, but that is not a face.',
  };
  return { station: 'blocks', tier, kind: 'face-shape', picture: { solid: s }, prompt: `What flat shape are the flat faces of a ${SOLID_NAME[s]}?`, choices: choicesFrom(r, right, wrong), explain: why[s] };
}

export function makeBlocks(tier: Tier, r: Rand): BlockProblem {
  if (tier === 1) return r() < 0.4 ? blockFlatSolid(r, 1) : blockName(r, 1);
  if (tier === 2) return r() < 0.5 ? blockRoll(r, 2) : r() < 0.7 ? blockThing(r, 2) : blockName(r, 2);
  return r() < 0.55 ? blockFaces(r, 3) : blockFaceShape(r, 3);
}

// ------------------------------------------------------------ shared: number choices and steps

/** One step of a multi-step question (the L-shaped gardens). */
export interface Step {
  prompt: string;
  choices: Choice[];
  explain: string;
}

/** Three number choices: the right one, then real mistakes, then near misses to fill up. */
function numChoices(r: Rand, right: number, wrong: Array<[number, Misconception]>, unit = ''): Choice[] {
  const lab = (v: number) => (unit ? `${v} ${unit}` : String(v));
  const out: Choice[] = [{ value: String(right), label: lab(right), correct: true }];
  const add = (v: number, m: Misconception) => {
    if (out.length >= 3 || v < 0 || !Number.isInteger(v) || out.some((c) => c.value === String(v))) return;
    out.push({ value: String(v), label: lab(v), correct: false, misconception: m });
  };
  for (const [v, m] of wrong) add(v, m);
  for (const d of [1, -1, 2, -2, 3]) add(right + d, 'count-slip');
  return shuffle(r, out);
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// ------------------------------------------------------------ Mr. Haruto's Blueprint Workshop

export type PieceKind = 'triangle' | 'square' | 'rectangle' | 'circle';

/** One piece of a blueprint, in a 64 by 64 box. */
export interface Piece {
  kind: PieceKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** A triangle pointing down. */
  flip?: boolean;
  /** Partly hidden behind another piece (the far wheels of the car). */
  behind?: boolean;
}

export interface Blueprint {
  id: string;
  name: string;
  pieces: Piece[];
}

const P = (kind: PieceKind, x: number, y: number, w: number, h: number, more: Partial<Piece> = {}): Piece => ({ kind, x, y, w, h, ...more });

/** The five blueprints from the original game (house, robot, car, castle, tree), then new ones. */
export const BLUEPRINTS: Blueprint[] = [
  { id: 'house', name: 'house', pieces: [P('square', 16, 28, 32, 32), P('triangle', 10, 6, 44, 22), P('rectangle', 28, 44, 8, 16), P('square', 19, 33, 7, 7), P('square', 38, 33, 7, 7)] },
  {
    id: 'robot',
    name: 'robot',
    pieces: [P('square', 26, 2, 12, 12), P('circle', 28, 6, 3, 3), P('circle', 33, 6, 3, 3), P('square', 22, 15, 20, 20), P('square', 22, 35, 20, 20), P('rectangle', 10, 17, 11, 5), P('rectangle', 43, 17, 11, 5), P('rectangle', 25, 55, 6, 8), P('rectangle', 33, 55, 6, 8)],
  },
  {
    id: 'car',
    name: 'car',
    pieces: [P('circle', 18, 33, 10, 10, { behind: true }), P('circle', 46, 33, 10, 10, { behind: true }), P('rectangle', 18, 14, 28, 13), P('rectangle', 4, 26, 56, 14), P('square', 22, 17, 8, 8), P('square', 34, 17, 8, 8), P('circle', 8, 36, 13, 13), P('circle', 40, 36, 13, 13)],
  },
  {
    id: 'castle',
    name: 'castle',
    pieces: [P('rectangle', 2, 20, 12, 42), P('rectangle', 50, 20, 12, 42), P('triangle', 2, 8, 12, 12), P('triangle', 50, 8, 12, 12), P('rectangle', 18, 18, 8, 12), P('rectangle', 38, 18, 8, 12), P('square', 16, 30, 32, 32)],
  },
  { id: 'tree', name: 'tree', pieces: [P('rectangle', 28, 34, 8, 26), P('circle', 10, 14, 22, 22), P('circle', 32, 14, 22, 22), P('circle', 21, 2, 22, 22)] },
  {
    id: 'rocket',
    name: 'rocket',
    pieces: [P('triangle', 12, 38, 12, 14), P('triangle', 40, 38, 12, 14), P('rectangle', 24, 16, 16, 34), P('triangle', 24, 2, 16, 14), P('circle', 28, 20, 8, 8), P('circle', 28, 32, 8, 8), P('triangle', 26, 50, 12, 12, { flip: true })],
  },
  {
    id: 'train',
    name: 'train',
    pieces: [P('rectangle', 8, 12, 6, 12), P('rectangle', 4, 24, 32, 18), P('square', 24, 10, 14, 14), P('square', 40, 22, 20, 20), P('circle', 6, 40, 10, 10), P('circle', 21, 40, 10, 10), P('circle', 41, 40, 10, 10), P('circle', 51, 42, 8, 8)],
  },
  {
    id: 'flower',
    name: 'flower',
    pieces: [P('rectangle', 30, 30, 4, 32), P('triangle', 16, 42, 14, 10, { flip: true }), P('triangle', 34, 48, 14, 10, { flip: true }), P('circle', 26, 2, 12, 12), P('circle', 16, 12, 12, 12), P('circle', 36, 12, 12, 12), P('circle', 26, 22, 12, 12), P('circle', 26, 12, 12, 12)],
  },
];

export type CompId = 'square-2tri' | 'hex-6tri' | 'trap-3tri' | 'rhombus-2tri' | 'rect-2sq' | 'bigtri-4tri' | 'hex-2trap' | 'bigsq-4sq';

/** A shape to fill, the piece to fill it with, and the lines where the pieces meet (unit sizes). */
export interface Composition {
  id: CompId;
  target: string;
  piece: string;
  /** Outline of the big shape. */
  outline: Array<[number, number]>;
  /** One piece, at the same size. */
  pieceShape: Array<[number, number]>;
  /** Where the pieces meet (for the picture hint). */
  cuts: Array<[[number, number], [number, number]]>;
  count: number;
  corners: number;
}

const HT = Math.sqrt(3) / 2;
export const COMPOSITIONS: Composition[] = [
  { id: 'square-2tri', target: 'square', piece: 'triangle', outline: [[0, 0], [1, 0], [1, 1], [0, 1]], pieceShape: [[0, 0], [1, 1], [0, 1]], cuts: [[[0, 0], [1, 1]]], count: 2, corners: 4 },
  {
    id: 'hex-6tri',
    target: 'hexagon',
    piece: 'triangle',
    outline: [[0.5, 0], [1.5, 0], [2, HT], [1.5, 2 * HT], [0.5, 2 * HT], [0, HT]],
    pieceShape: [[0, HT], [1, HT], [0.5, 0]],
    cuts: [[[0.5, 0], [1.5, 2 * HT]], [[1.5, 0], [0.5, 2 * HT]], [[0, HT], [2, HT]]],
    count: 6,
    corners: 6,
  },
  { id: 'trap-3tri', target: 'trapezoid', piece: 'triangle', outline: [[0, HT], [2, HT], [1.5, 0], [0.5, 0]], pieceShape: [[0, HT], [1, HT], [0.5, 0]], cuts: [[[0.5, 0], [1, HT]], [[1, HT], [1.5, 0]]], count: 3, corners: 4 },
  { id: 'rhombus-2tri', target: 'rhombus', piece: 'triangle', outline: [[0, HT], [1, HT], [1.5, 0], [0.5, 0]], pieceShape: [[0, HT], [1, HT], [0.5, 0]], cuts: [[[1, HT], [0.5, 0]]], count: 2, corners: 4 },
  { id: 'rect-2sq', target: 'rectangle', piece: 'square', outline: [[0, 0], [2, 0], [2, 1], [0, 1]], pieceShape: [[0, 0], [1, 0], [1, 1], [0, 1]], cuts: [[[1, 0], [1, 1]]], count: 2, corners: 4 },
  {
    id: 'bigtri-4tri',
    target: 'big triangle',
    piece: 'triangle',
    outline: [[0, 2 * HT], [2, 2 * HT], [1, 0]],
    pieceShape: [[0, HT], [1, HT], [0.5, 0]],
    cuts: [[[0.5, HT], [1.5, HT]], [[0.5, HT], [1, 2 * HT]], [[1.5, HT], [1, 2 * HT]]],
    count: 4,
    corners: 3,
  },
  { id: 'hex-2trap', target: 'hexagon', piece: 'trapezoid', outline: [[0.5, 0], [1.5, 0], [2, HT], [1.5, 2 * HT], [0.5, 2 * HT], [0, HT]], pieceShape: [[0, HT], [2, HT], [1.5, 0], [0.5, 0]], cuts: [[[0, HT], [2, HT]]], count: 2, corners: 6 },
  { id: 'bigsq-4sq', target: 'big square', piece: 'square', outline: [[0, 0], [2, 0], [2, 2], [0, 2]], pieceShape: [[0, 0], [1, 0], [1, 1], [0, 1]], cuts: [[[1, 0], [1, 2]], [[0, 1], [2, 1]]], count: 4, corners: 4 },
];

export type BlueprintKind = 'count' | 'compose' | 'grid' | 'edge';

export interface BlueprintProblem {
  station: 'blueprint';
  tier: Tier;
  kind: BlueprintKind;
  picture: { blueprint?: Blueprint; ask?: PieceKind; comp?: Composition; grid?: { rows: number; cols: number } };
  prompt: string;
  choices: Choice[];
  explain: string;
}

/** Count the pieces of one kind (a square is not counted as a rectangle here: we never ask about rectangles when squares are in the picture). */
export function countPieces(bp: Blueprint, kind: PieceKind): number {
  return bp.pieces.filter((p) => p.kind === kind).length;
}

function blueprintCount(r: Rand, tier: Tier): BlueprintProblem {
  const pool = tier === 1 ? BLUEPRINTS.slice(0, 5) : BLUEPRINTS;
  const bp = pick(r, pool);
  const hasSquares = countPieces(bp, 'square') > 0;
  const kinds = (['triangle', 'square', 'rectangle', 'circle'] as PieceKind[]).filter((k) => countPieces(bp, k) > 0 && !(k === 'rectangle' && hasSquares));
  // the car's wheels (two hide at the back) are the classic question
  const ask: PieceKind = bp.id === 'car' && r() < 0.7 ? 'circle' : pick(r, kinds);
  const n = countPieces(bp, ask);
  const hidden = bp.pieces.filter((p) => p.kind === ask && p.behind).length;
  const wrong: Array<[number, Misconception]> = [];
  if (hidden) wrong.push([n - hidden, 'missed-piece']);
  if (ask === 'square' && countPieces(bp, 'rectangle')) wrong.push([n + countPieces(bp, 'rectangle'), 'square-rect-mix']);
  wrong.push([n + 1, 'double-count'], [n - 1, 'missed-piece'], [bp.pieces.length, 'counted-all']);
  return {
    station: 'blueprint',
    tier,
    kind: 'count',
    picture: { blueprint: bp, ask },
    prompt: `How many ${ask}s are in the ${bp.name} blueprint?`,
    choices: numChoices(r, n, wrong),
    explain: `The ${bp.name} has ${plural(n, ask)}${hidden ? `. ${hidden} of them hide at the back, so look closely` : ''}.`,
  };
}

function blueprintCompose(r: Rand, tier: Tier): BlueprintProblem {
  const c = pick(r, COMPOSITIONS);
  const wrong: Array<[number, Misconception]> = [];
  if (c.corners !== c.count) wrong.push([c.corners, 'counted-corners']);
  wrong.push([c.count - 1, 'compose-gap'], [c.count + 1, 'compose-overlap'], [c.count + 2, 'compose-overlap']);
  return {
    station: 'blueprint',
    tier,
    kind: 'compose',
    picture: { comp: c },
    prompt: `How many of these ${c.piece}s fill the ${c.target} with no gaps and no overlaps?`,
    choices: numChoices(r, c.count, wrong.filter(([v]) => v > 0)),
    explain: `${c.count} ${c.piece}s fit together to make the ${c.target}. Together they cover exactly the same space.`,
  };
}

function blueprintGrid(r: Rand, tier: Tier): BlueprintProblem {
  const rows = int(r, 2, 4);
  const cols = int(r, 3, 6);
  const n = rows * cols;
  const edge = r() < 0.45;
  if (edge) {
    return {
      station: 'blueprint',
      tier,
      kind: 'edge',
      picture: { grid: { rows, cols } },
      prompt: 'Mr. Haruto drew the first row and the first column of floor tiles. How many same-size tiles cover the whole floor?',
      choices: numChoices(r, n, [
        [rows + cols - 1, 'drawn-only'],
        [rows + cols, 'rows-plus-cols'],
        [n - cols, 'rows-only'],
      ]),
      explain: `There are ${rows} rows of ${cols} tiles: ${Array.from({ length: rows }, () => cols).join(' + ')} = ${n}.`,
    };
  }
  return {
    station: 'blueprint',
    tier,
    kind: 'grid',
    picture: { grid: { rows, cols } },
    prompt: 'The window is cut into rows and columns of same-size squares. How many squares?',
    choices: numChoices(r, n, [
      [rows + cols, 'rows-plus-cols'],
      [cols, 'rows-only'],
      [n - 1, 'count-slip'],
    ]),
    explain: `${rows} rows of ${cols} squares: ${Array.from({ length: rows }, () => cols).join(' + ')} = ${n}.`,
  };
}

export function makeBlueprint(tier: Tier, r: Rand): BlueprintProblem {
  if (tier === 1) return blueprintCount(r, 1);
  if (tier === 2) return r() < 0.7 ? blueprintCompose(r, 2) : blueprintCount(r, 2);
  return r() < 0.7 ? blueprintGrid(r, 3) : blueprintCompose(r, 3);
}

// ------------------------------------------------------------ Priya's Garden Yard

export type GardenPic =
  /** A rectangle of unit squares on a grid (level 1). */
  | { kind: 'grid'; w: number; h: number; number?: 'area' | 'fence' }
  /** A rectangle with its sides labelled: a number, or '?' (levels 2 and 3). */
  | { kind: 'rect'; w: number; h: number; top: string; left: string }
  /** An L: a bar W wide and b tall along the bottom, with an upright a wide on the left, H tall in all. */
  | { kind: 'L'; W: number; H: number; a: number; b: number }
  /** Two gardens on grids, A and B. */
  | { kind: 'pair'; A: [number, number]; B: [number, number] };

export type GardenKind = 'grid-area' | 'grid-fence' | 'rect-area' | 'rect-fence' | 'L' | 'missing' | 'same-area';

export interface GardenProblem {
  station: 'garden';
  tier: Tier;
  kind: GardenKind;
  picture: GardenPic;
  prompt: string;
  choices: Choice[];
  explain: string;
  /** Multi-step questions (the L): prompt and choices are a copy of step 1. */
  steps?: Step[];
}

export const area = (w: number, h: number) => w * h;
export const fence = (w: number, h: number) => 2 * (w + h);

function gardenGrid(r: Rand, tier: Tier): GardenProblem {
  const w = int(r, 2, 5);
  const h = int(r, 2, 4);
  const a = area(w, h);
  const f = fence(w, h);
  if (r() < 0.5) {
    return {
      station: 'garden',
      tier,
      kind: 'grid-area',
      picture: { kind: 'grid', w, h },
      prompt: 'Priya plants grass on every square. How many squares of grass does the garden need?',
      choices: numChoices(r, a, [[f, 'area-perimeter-swap'], [w + h, 'add-for-area']], 'squares'),
      explain: `${h} rows of ${w} squares: ${a} squares of grass. The area is ${a} squares.`,
    };
  }
  return {
    station: 'garden',
    tier,
    kind: 'grid-fence',
    picture: { kind: 'grid', w, h },
    prompt: 'Each square side along the edge needs one fence piece. How many fence pieces go all the way round?',
    choices: numChoices(r, f, [[2 * (w + h) - 4, 'perimeter-counts-squares'], [a, 'area-perimeter-swap'], [w + h, 'two-sides-only']], 'pieces'),
    explain: `Top ${w} + right ${h} + bottom ${w} + left ${h} = ${f} fence pieces. The perimeter is ${f}.`,
  };
}

function gardenRect(r: Rand, tier: Tier): GardenProblem {
  const w = int(r, 3, 9);
  const h = int(r, 2, Math.min(8, w));
  const a = area(w, h);
  const f = fence(w, h);
  const pic: GardenPic = { kind: 'rect', w, h, top: String(w), left: String(h) };
  if (r() < 0.5) {
    return {
      station: 'garden',
      tier,
      kind: 'rect-area',
      picture: pic,
      prompt: `This garden is ${w} meters long and ${h} meters wide. What is its area?`,
      choices: numChoices(r, a, [[w + h, 'add-for-area'], [f, 'area-perimeter-swap']], 'square meters'),
      explain: `Area = rows × columns: ${w} × ${h} = ${a} square meters.`,
    };
  }
  return {
    station: 'garden',
    tier,
    kind: 'rect-fence',
    picture: pic,
    prompt: `This garden is ${w} meters long and ${h} meters wide. How much fence goes all the way round?`,
    choices: numChoices(r, f, [[w + h, 'two-sides-only'], [a, 'area-perimeter-swap']], 'meters'),
    explain: `A rectangle has two long sides and two short sides: ${w} + ${h} + ${w} + ${h} = ${f} meters.`,
  };
}

/** The L-shaped garden in three steps: split it, find one part's area, add the parts. */
function gardenL(r: Rand, tier: Tier): GardenProblem {
  const W = int(r, 6, 10);
  const a = int(r, 2, W - 3);
  const H = int(r, 5, 9);
  const b = int(r, 2, H - 3);
  const up = H - b; // the upright's height above the bar
  const partA = area(a, up);
  const partB = area(W, b);
  const total = partA + partB;
  const split = (x: number, y: number, z: number, t: number) => `${x} by ${y} and ${z} by ${t}`;
  const s1: Step = {
    prompt: `The dashed line splits the L-shaped garden into two rectangles. Which two?`,
    choices: shuffle(r, [
      { value: 'ok', label: split(a, up, W, b), correct: true },
      { value: 'double', label: split(a, H, W, b), correct: false, misconception: 'overlap-double' },
      { value: 'short', label: split(a, up, W - a, b), correct: false, misconception: 'missing-side' },
    ]),
    explain: `The tall part is ${a} by ${up} (${H} take away ${b}), and the bottom part is ${W} by ${b}.`,
  };
  const s2: Step = {
    prompt: `What is the area of the tall part, ${a} by ${up}?`,
    choices: numChoices(r, partA, [[a + up, 'add-for-area'], [fence(a, up), 'area-perimeter-swap'], [a * H, 'overlap-double']], 'sq m'),
    explain: `${a} × ${up} = ${partA} square meters.`,
  };
  const s3: Step = {
    prompt: `The bottom part is ${W} by ${b}, so ${partB} square meters. What is the area of the whole L?`,
    choices: numChoices(r, total, [[a * H + partB, 'overlap-double'], [W * H, 'missing-side'], [partB, 'missing-side']], 'sq m'),
    explain: `${partA} + ${partB} = ${total} square meters. Split, multiply, then add.`,
  };
  return { station: 'garden', tier, kind: 'L', picture: { kind: 'L', W, H, a, b }, prompt: s1.prompt, choices: s1.choices, explain: s3.explain, steps: [s1, s2, s3] };
}

function gardenMissing(r: Rand, tier: Tier): GardenProblem {
  const w = int(r, 4, 12);
  const h = int(r, 3, 9);
  if (r() < 0.5) {
    const a = area(w, h);
    return {
      station: 'garden',
      tier,
      kind: 'missing',
      picture: { kind: 'rect', w, h, top: '?', left: String(h) },
      prompt: `This garden has an area of ${a} square meters. One side is ${h} meters. How long is the other side?`,
      choices: numChoices(r, w, [[a - h, 'add-for-area'], [a / 2 - h, 'area-perimeter-swap']], 'meters'),
      explain: `Area = length × width, so ${h} × ? = ${a}. ${h} × ${w} = ${a}, so the side is ${w} meters.`,
    };
  }
  const f = fence(w, h);
  return {
    station: 'garden',
    tier,
    kind: 'missing',
    picture: { kind: 'rect', w, h, top: '?', left: String(h) },
    prompt: `Priya used ${f} meters of fence to go all the way round. One side is ${h} meters. How long is the other side?`,
    choices: numChoices(r, w, [[f - h, 'missing-side'], [f - 2 * h, 'two-sides-only'], [f / h, 'area-perimeter-swap']], 'meters'),
    explain: `The fence is ${h} + ${h} + ? + ? = ${f}. That leaves ${f - 2 * h} for the two long sides, so each is ${w} meters.`,
  };
}

const SAME_AREA: Array<[[number, number], [number, number]]> = [
  [[4, 3], [6, 2]],
  [[4, 4], [8, 2]],
  [[6, 3], [9, 2]],
  [[6, 4], [8, 3]],
  [[5, 4], [10, 2]],
];

function gardenSameArea(r: Rand, tier: Tier): GardenProblem {
  const [x, y] = pick(r, SAME_AREA);
  const flip = r() < 0.5;
  const A = flip ? y : x;
  const B = flip ? x : y;
  const fa = fence(...A);
  const fb = fence(...B);
  const more = fa > fb ? 'A' : 'B';
  const n = area(...A);
  return {
    station: 'garden',
    tier,
    kind: 'same-area',
    picture: { kind: 'pair', A, B },
    prompt: `Both gardens cover ${n} squares. Which one needs more fence?`,
    choices: shuffle(r, [
      { value: more, label: `Garden ${more}`, correct: true },
      { value: more === 'A' ? 'B' : 'A', label: `Garden ${more === 'A' ? 'B' : 'A'}`, correct: false, misconception: 'shape-of-garden' },
      { value: 'same', label: 'The same fence', correct: false, misconception: 'area-perimeter-swap' },
    ]),
    explain: `Same area, different fence! Garden A needs ${fa} pieces and garden B needs ${fb}. Long thin gardens need more fence.`,
  };
}

export function makeGarden(tier: Tier, r: Rand): GardenProblem {
  if (tier === 1) return gardenGrid(r, 1);
  if (tier === 2) return gardenRect(r, 2);
  const x = r();
  return x < 0.4 ? gardenL(r, 3) : x < 0.75 ? gardenMissing(r, 3) : gardenSameArea(r, 3);
}

export type Problem = ArcadeProblem | BlockProblem | BlueprintProblem | GardenProblem;

export function makeProblem(station: Station, tier: Tier, r: Rand): Problem {
  if (station === 'blocks') return makeBlocks(tier, r);
  if (station === 'blueprint') return makeBlueprint(tier, r);
  if (station === 'garden') return makeGarden(tier, r);
  return makeArcade(tier, r);
}

/** The steps of a problem (one step for most questions). */
export function stepsOf(p: Problem): Step[] {
  return 'steps' in p && p.steps ? p.steps : [{ prompt: p.prompt, choices: p.choices, explain: p.explain }];
}
