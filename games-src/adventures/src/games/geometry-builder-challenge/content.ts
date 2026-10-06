import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question } from '../../kit/ui/talk';
import type { ClubParts } from './art';
import { SOLID_NAME, type Misconception, type Problem, type Station } from './problems';

/**
 * Everything Shape Town Builders says: Master Builder Odette, the four
 * helpers, Chip the beaver, one sentence for each kind of mistake, the hints
 * and the grown-ups page. Sentences are short: read-aloud is on and many
 * players are 5 to 7.
 */

export const STARS_PER_STATION = 5;

export const ODETTE = { name: 'Master Builder Odette', role: 'Runs the Shape Town building yard' };
export const CHIP = { name: 'Chip', role: 'A beaver who chews shapes (and gets them wrong)' };

export interface StationInfo {
  id: Station;
  name: string;
  skill: string;
  grades: string;
  person: { name: string; role: string };
  part: keyof ClubParts;
  partName: string;
  intro: string[];
  debrief: Question | null;
  done: string;
}

export const STATION_INFO: Record<Station, StationInfo> = {
  arcade: {
    id: 'arcade',
    name: 'Shape Sorting Arcade',
    skill: 'Flat shapes',
    grades: 'K–2',
    person: { name: 'Kofi', role: 'Runs the Shape Sorting Arcade' },
    part: 'walls',
    partName: 'the walls',
    intro: [
      'Welcome to my arcade! Shapes ride the belt, and you send each one to the right bin.',
      'Look closely. A shape can be big or small, any color, and turned any way. It is still the same shape!',
    ],
    debrief: {
      text: 'Chip turned a square so it stands on its corner. Is it still a square?',
      options: [
        { text: 'Yes, it still has 4 equal sides and 4 square corners', correct: true, feedback: 'Yes! Turning a shape does not change its sides or corners.' },
        { text: 'No, now it is a diamond', feedback: 'It looks different, but count: still 4 equal sides and 4 square corners. It is a square.', misconception: 'turned-not-same' },
        { text: 'Only if it is a big one', feedback: 'Size does not change a shape. Small or big, it is a square.', misconception: 'other' },
      ],
      hints: ['Count its sides. Did turning it change them?', 'Turn your head to look at it. The sides and corners are all still there.', 'The answer is outlined.'],
    },
    done: 'The arcade is humming! You know your shapes, any size and any turn.',
  },
  blocks: {
    id: 'blocks',
    name: 'Block Shop',
    skill: 'Solid shapes',
    grades: 'K–1',
    person: { name: 'Lupe', role: 'Runs the Block Shop' },
    part: 'pillars',
    partName: 'the pillars and steps',
    intro: [
      'Hi! My blocks are solid shapes. You can pick them up and hold them.',
      'Some roll, some stack, and some do both. Help me find the right block for the clubhouse!',
    ],
    debrief: {
      text: 'Why can a cylinder roll AND stack?',
      options: [
        { text: 'It has a curved side and flat faces', correct: true, feedback: 'Yes! The curved side rolls, and the flat faces stack.' },
        { text: 'Because it is light', feedback: 'Heavy cylinders roll and stack too. Look at its curved side and its flat ends.', misconception: 'roll-stack' },
        { text: 'Because it is round all over', feedback: 'A sphere is round all over, and it cannot stack. A cylinder has flat ends.', misconception: 'roll-stack' },
      ],
      hints: ['Look at the sides of a cylinder. Which part is curved? Which parts are flat?', 'Curved parts roll. Flat parts stack.', 'The answer is outlined.'],
    },
    done: 'Perfect blocks for every job! You know your solid shapes.',
  },
  blueprint: {
    id: 'blueprint',
    name: 'Blueprint Workshop',
    skill: 'Building with shapes',
    grades: '1–2',
    person: { name: 'Mr. Haruto', role: 'Runs the Blueprint Workshop' },
    part: 'roof',
    partName: 'the roof and windows',
    intro: [
      'Ah, a new builder. Welcome to my workshop. Every good building starts as a blueprint.',
      'A blueprint shows the pieces. Count them carefully, even the ones hiding at the back. Then we will fit pieces together.',
    ],
    debrief: {
      text: 'Two triangles made this square. Is the square bigger than the two triangles put together?',
      options: [
        { text: 'No, it is the same space, just put together', correct: true, feedback: 'Exactly. Putting pieces together does not make them bigger. The square covers the same space as the two triangles.' },
        { text: 'Yes, the square is bigger', feedback: 'Slide the triangles apart and back again: nothing was added. The square covers the same space as the two triangles.', misconception: 'pieces-make-bigger' },
        { text: 'It depends on the color', feedback: 'Color never changes how much space a shape covers. Same pieces, same space.', misconception: 'other' },
      ],
      hints: ['Imagine cutting the square along the dashed line. What do you get?', 'Nothing was added and nothing was taken away.', 'The answer is outlined.'],
    },
    done: 'Splendid. You read blueprints like a real carpenter. The roof and windows can go up now.',
  },
  garden: {
    id: 'garden',
    name: 'Garden Yard',
    skill: 'Area and perimeter',
    grades: '3–4',
    person: { name: 'Priya', role: 'Measures the Garden Yard' },
    part: 'garden',
    partName: 'the garden and fence',
    intro: [
      'Hello! I am planning the clubhouse gardens. I need two numbers for every garden.',
      'The area is the ground inside: how many squares of grass. The perimeter is the fence all the way round. Do not mix them up, or I will buy the wrong things!',
    ],
    debrief: {
      text: 'Two gardens both cover 12 squares. Do they need the same amount of fence?',
      options: [
        { text: 'Not always: 3 by 4 needs 14, but 2 by 6 needs 16', correct: true, feedback: 'Yes! Same area, different fence. Long thin gardens need more fence.' },
        { text: 'Yes, same area means same fence', feedback: 'Count the fence round a 3 by 4 garden (14) and a 2 by 6 garden (16). Same area, different fence!', misconception: 'area-perimeter-swap' },
        { text: 'The bigger garden always needs less fence', feedback: 'They are the same size inside. The long thin one needs more fence, not less.', misconception: 'shape-of-garden' },
      ],
      hints: ['Draw a 3 by 4 garden and a 2 by 6 garden. Count the squares in each.', 'Now walk round each one and count the fence pieces.', 'The answer is outlined.'],
    },
    done: 'Every garden measured, every fence the right length! Let us plant the flowers.',
  },
};


export const OPENING = [
  `Hello, new builder! I am ${ODETTE.name}.`,
  'Shape Town is building a clubhouse right here. But first we need someone who really knows shapes.',
  'Help my four helpers, and each job adds a part to the clubhouse. Look for people with a sign over their heads.',
  'And watch out for Chip. That beaver loves shapes, but gets them mixed up!',
];

export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. In a panel, press 1, 2 or 3 to pick an answer.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to walk, or use the pad. Tap a person to talk. Tap a bin to sort a shape.';

export const CHIP_JOKES = [
  'I turned a square on its corner. Now it is a diamond! Right? ...Right?',
  'A cube is just a square that ate too much. Hee hee!',
  'This skinny triangle is too thin to be a triangle. Or is it?',
  'I chewed a circle. Now it has corners! Wait, that is not how it works...',
];

export const RUSH_INTRO = 'Rush mode! Sort as many shapes as you can in 60 seconds. I will sort too. Can you beat me?';

export const ALL_PARTS_IN = 'All four parts are in! Come and see me at the clubhouse for The Big Build.';

// ------------------------------------------------------------ The Big Build

export const FINALE_INTRO = [
  'Here is the final blueprint. The clubhouse needs four last pieces, one from every job.',
  'Fit each piece and we can open the doors tonight!',
];
export const FINALE_PIECES: Record<Station, string> = {
  arcade: 'Piece 1: the sign over the door',
  blocks: 'Piece 2: the front steps',
  blueprint: 'Piece 3: the round window',
  garden: 'Piece 4: the flower beds',
};
export const FINALE_OPENING = [
  'Every piece fits! Look, the sun is setting.',
  'Shape Town, gather round! Our new clubhouse is finished, thanks to this builder.',
  'Flat shapes, solid blocks, blueprints and gardens. You used them all.',
];
export const FINALE_RIBBON = 'Three, two, one... the clubhouse is open!';
export const AFTER_FINALE = 'The clubhouse is open! Every job stays open, so come back and practise, or race Chip in Rush mode.';

// ------------------------------------------------------------ mistakes, hints

/** One sentence about the likely mistake behind a wrong answer. */
export function mistakeLine(p: Problem, m: Misconception): string {
  switch (m) {
    case 'turned-not-same':
      return 'Turning a shape does not change it. Count its sides and corners: they are all still there.';
    case 'only-the-usual-one':
      return 'Any closed shape with 3 straight sides is a triangle, even a skinny or upside-down one.';
    case 'square-rect-mix':
      return p.station === 'blocks' ? 'Look at the edges: are they all the same length?' : 'A square has 4 equal sides. A rectangle has 2 long sides and 2 short sides.';
    case 'square-not-rectangle':
      return 'A rectangle needs 4 square corners. A square has them, so a square is a special rectangle!';
    case 'corners-not-checked':
      return 'Check the corners too. Slanted corners are not square corners.';
    case 'count-slip':
      return 'So close! Start at one corner and touch each one once as you count.';
    case 'sides-vs-corners':
      return 'A circle has a curved edge. It has no straight sides and no corners.';
    case 'open-or-curved':
      return 'Look again: a real triangle or rectangle is closed all the way round, with straight sides.';
    case 'too-strict':
      return 'It looks unusual, but check the rules: closed, with the right number of straight sides. It counts!';
    case 'flat-name-for-solid':
      return p.station === 'blocks' && p.picture.solid ? `That is the name of a flat shape. This block is solid: it is a ${SOLID_NAME[p.picture.solid]}.` : 'That is the name of a flat shape. This one is solid.';
    case 'flat-or-solid':
      return 'Flat shapes are like pictures on paper. Solid shapes are blocks you can pick up.';
    case 'solid-mixup':
      return 'Look at its faces: are they flat or curved? Does it come to a point?';
    case 'roll-stack':
      return 'Curved parts roll. Flat faces stack. Look at which parts this block has.';
    case 'visible-faces-only':
      return 'Some faces hide at the back and the bottom. Count those too!';
    case 'side-view':
      return 'From the side it looks like that, but a flat face is the flat part you could stand it on.';
    case 'missed-piece':
      return p.station === 'blueprint' && p.picture.blueprint?.pieces.some((x) => x.behind && x.kind === p.picture.ask) ? 'Look behind the car body: two wheels are peeking out at the back!' : 'One is missing. Point to each piece as you count it.';
    case 'double-count':
      return 'One piece got counted twice. Touch each piece once, then move on.';
    case 'counted-all':
      return `That is every piece in the blueprint. Count only the ${p.station === 'blueprint' ? (p.picture.ask ?? 'asked') : 'asked'} shapes.`;
    case 'compose-gap':
      return 'With that many pieces there would be a gap left over. Picture the pieces fitting in.';
    case 'compose-overlap':
      return 'That is too many: the pieces would overlap. Picture them fitting edge to edge.';
    case 'counted-corners':
      return 'That is how many corners the big shape has. Count the pieces that fit inside it.';
    case 'rows-plus-cols':
      return 'Adding the rows and the columns only counts the edges. Count every square: rows of the same size.';
    case 'rows-only':
      return 'That is one row, or part of the floor. Every row has the same number, so count all the rows.';
    case 'drawn-only':
      return 'Those are only the tiles that are drawn. The floor needs tiles in the middle too!';
    case 'area-perimeter-swap':
      return p.station === 'garden' && p.kind === 'same-area' ? 'Same area does not mean same fence. Count the fence round each garden.' : 'That mixes up the ground and the fence. Area is the squares inside; perimeter is the fence all the way round.';
    case 'perimeter-counts-squares':
      return 'That counts the edge squares. A corner square needs two fence pieces, one on each outside side.';
    case 'two-sides-only':
      return 'That is only one long side and one short side. The fence goes all the way round: four sides.';
    case 'add-for-area':
      return 'Adding the sides gives part of the fence. For area, think rows of squares: multiply.';
    case 'missing-side':
      return 'A part of the garden was left out. Check every side, even the ones without a number.';
    case 'overlap-double':
      return 'Part of the garden got counted twice. Use the dashed line: the tall part stops where the bottom part starts.';
    case 'shape-of-garden':
      return 'Count the fence round each one. Long thin gardens need more fence than square-ish ones.';
    case 'pieces-make-bigger':
      return 'Putting pieces together does not make them bigger. Same pieces, same space.';
    default:
      return 'Not quite. Try another bin!';
  }
}

export function hintText(p: Problem, rung: number, step = 0): string {
  if (rung >= 3) return 'The answer is outlined.';
  if (p.station === 'blueprint') {
    if (p.kind === 'count') return rung === 1 ? `Put your finger on each ${p.picture.ask} and count it once. Check behind other pieces too.` : `Every ${p.picture.ask} is colored in and numbered now. What is the last number?`;
    if (p.kind === 'compose') return rung === 1 ? 'Picture the piece sliding into the big shape, again and again, until it is full.' : 'The dashed lines show where the pieces meet. Count the spaces.';
    if (p.kind === 'grid') return rung === 1 ? 'Count the squares in one row. How many rows are there?' : 'The rows are colored now. Count one row, then add a row at a time.';
    return rung === 1 ? 'The first row shows how many tiles fit across. The first column shows how many rows.' : 'The dashed lines show the missing tiles. Every row has the same number.';
  }
  if (p.station === 'garden') {
    if (p.kind === 'grid-area') return rung === 1 ? 'Area is the ground inside. Count the squares, row by row.' : 'The squares are numbered now. What is the last number?';
    if (p.kind === 'grid-fence') return rung === 1 ? 'Walk all the way round the outside. One fence piece for each square side you pass.' : 'The fence pieces are numbered now. What is the last number?';
    if (p.kind === 'rect-area') return rung === 1 ? 'Is the question about the ground inside, or the fence?' : 'The grid shows the rows of squares. How many rows, and how many in each?';
    if (p.kind === 'rect-fence') return rung === 1 ? 'Is the question about the ground inside, or the fence?' : 'Now every side has its number. Add all four.';
    if (p.kind === 'same-area') return rung === 1 ? 'Walk round each garden and count the fence.' : 'The fence for each garden is written under it.';
    if (p.kind === 'missing') return rung === 1 ? 'Is the number about the ground inside (area) or the fence (perimeter)?' : p.prompt.includes('fence') ? 'Take the two short sides away from the fence. What is left is two long sides.' : 'Which number times the side you know makes the area?';
    if (step === 0) return rung === 1 ? 'The tall part stops at the dashed line. How tall is it above the line?' : 'The two parts are colored now: green on top, yellow along the bottom.';
    if (step === 1) return rung === 1 ? 'Area of a rectangle: multiply its two sides.' : 'Think rows: how many rows of how many squares?';
    return rung === 1 ? 'Add the areas of the two parts.' : 'The tall part plus the bottom part makes the whole L.';
  }
  if (p.station === 'arcade') {
    if (p.kind === 'count') return rung === 1 ? 'Put your finger on one corner, then count each corner once.' : 'The corners are numbered now. What is the last number?';
    if (p.kind === 'closed') return rung === 1 ? 'Check three things: is it closed? Are the sides straight? Are the corners right?' : 'Follow the edge all the way round with your finger. Does it join up?';
    if (p.kind === 'rule' || p.kind === 'odd') return rung === 1 ? 'Read the rule, then check each part of the shape against it.' : 'Count the sides, and look at each corner: square or slanted?';
    return rung === 1 ? 'Count its sides and corners. Size, color and turning do not matter.' : 'The corners are numbered now. How many sides does it have?';
  }
  if (p.kind === 'faces') return rung === 1 ? 'Imagine walking all the way round the block. Count every flat face.' : 'The dashed lines show the faces hiding at the back.';
  if (p.kind === 'face-shape') return rung === 1 ? 'Which part could you stand the block on?' : 'Imagine pressing the flat face into sand. What shape would it print?';
  if (p.kind === 'roll') return rung === 1 ? 'Does it have curved parts, flat parts, or both?' : 'Curved parts roll. Flat parts stack.';
  if (p.kind === 'thing') return rung === 1 ? 'Imagine holding it. Is it round all over, flat all over, or a bit of both?' : 'Does it have a point? Flat ends? Corners?';
  if (p.kind === 'flat-solid') return rung === 1 ? 'Could you pick it up and hold it?' : 'Solid shapes show a top and a side. Flat shapes show just one face.';
  return rung === 1 ? 'Look at its faces: flat or curved? Any corners?' : 'Cubes have square faces, spheres are round all over, cones have a point.';
}

const PRAISE = ['Great sorting!', 'Builder brain!', 'You got it!', 'Spot on!', 'Shape expert!', 'Nice building!'];
export const praise = (i: number) => PRAISE[i % PRAISE.length];

export const GROWNUPS: GrownupsContent = {
  game: 'Shape Town Builders',
  grades: 'K–4',
  summary:
    'Your child helps a building yard put up a clubhouse. Each of four helpers teaches one part of geometry, and each finished job adds a part to the building: flat shapes at the arcade, solid shapes at the block shop, building with shapes at the workshop, and area and perimeter in the garden yard. When all four parts are in, a finale mixes one question from each job and the clubhouse opens at sunset.',
  teaches: [
    { title: "Kofi's Shape Sorting Arcade (K–2)", text: 'Naming shapes drawn in every size, color and turn; counting sides and corners; telling real shapes from shapes with a gap or a curved side; then sorting by rules, including the idea that a square is a special rectangle.' },
    { title: "Lupe's Block Shop (K–1)", text: 'Flat or solid; naming cubes, spheres, cones, cylinders and boxes; what rolls and what stacks; everyday objects; and counting faces, including the ones you cannot see.' },
    { title: "Mr. Haruto's Blueprint Workshop (1–2)", text: 'Counting the shapes in a drawn blueprint (including wheels hiding behind a car), finding how many small pieces fill a bigger shape (2 triangles make a square, 6 make a hexagon), and counting the squares in rows and columns.' },
    { title: "Priya's Garden Yard (3–4)", text: 'Area as squares inside and perimeter as the fence around: first by counting on a grid, then with labelled sides (multiply for area, add all four sides for perimeter), then L-shaped gardens in three steps, missing side lengths and "same area, different fence".' },
    { title: 'Mistakes get a reason', text: 'The game looks for common slips: "a turned square is a diamond", "a square cannot be a rectangle", counting only the faces you can see, missing hidden pieces, adding rows and columns instead of multiplying, and mixing up area and perimeter. Each gets one sentence of explanation.' },
    { title: 'Help built in', text: 'Three hints for every question: a tip, then a picture (corners numbered, hidden faces dashed, pieces colored in, fence pieces numbered), then the answer.' },
  ],
  standards: [
    { code: 'K.G.1–6', text: 'Describe, name, compare and compose flat and solid shapes regardless of size or orientation.' },
    { code: '1.G.1–2', text: 'Tell defining attributes from non-defining ones; compose shapes from smaller shapes.' },
    { code: '2.G.1–2', text: 'Recognize shapes with given attributes; partition a rectangle into rows and columns of same-size squares.' },
    { code: '3.G.1', text: 'Understand that shapes in different categories can share attributes (a square is a rectangle).' },
    { code: '3.MD.5–8', text: 'Area by counting unit squares and by multiplying; area of L-shapes by splitting into rectangles; perimeter, and same area with different perimeters.' },
    { code: '4.MD.3', text: 'Apply the area and perimeter formulas for rectangles, including finding a missing side.' },
  ],
  talk: [
    'Turn a cracker or a book on its corner and ask: is it still the same shape? How do you know?',
    'Hunt for solids at home: a can (cylinder), a ball (sphere), a cereal box (rectangular box).',
    'Tile a floor with sticky notes or count bathroom tiles: how many rows, how many in each row?',
    'Measure a rug or table with steps or hands. Which number is the fence around it, and which is the floor it covers?',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'All four jobs are open from the start. Younger children usually begin with Kofi and Lupe; older ones can go straight to Mr. Haruto or Priya.',
    'Only the optional Rush mode has a timer. Every other question can take as long as your child needs.',
    'Every line can be read aloud. Answers can be picked with number keys, a mouse or a tap.',
  ],
  simplifies: [
    'Flat shapes are regular or simple shapes; the game does not use the words parallel or angle measures yet.',
    'Solids are limited to cubes, spheres, cones, cylinders and rectangular boxes.',
    'Gardens use whole meters and whole squares.',
  ],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
