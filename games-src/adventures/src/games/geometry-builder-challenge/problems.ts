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
 */

export type Station = 'arcade' | 'blocks' | 'blueprint' | 'garden';
export const STATIONS: Station[] = ['arcade', 'blocks', 'blueprint', 'garden'];
/** The stations built in half 1 (the others are "coming soon" in the yard). */
export const OPEN_STATIONS: Station[] = ['arcade', 'blocks'];
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

export type Problem = ArcadeProblem | BlockProblem;

export function makeProblem(station: Station, tier: Tier, r: Rand): Problem {
  if (station === 'blocks') return makeBlocks(tier, r);
  return makeArcade(tier, r);
}
