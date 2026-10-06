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
    intro: [],
    debrief: null,
    done: '',
  },
  garden: {
    id: 'garden',
    name: 'Garden Yard',
    skill: 'Area and perimeter',
    grades: '3–4',
    person: { name: 'Priya', role: 'Measures the Garden Yard' },
    part: 'garden',
    partName: 'the garden and fence',
    intro: [],
    debrief: null,
    done: '',
  },
};

export const COMING_SOON: Partial<Record<Station, string>> = {
  blueprint: 'My workshop opens soon! Next time, we will read blueprints and build with shapes.',
  garden: 'The Garden Yard is still being dug. Come back soon to measure gardens and fences with me!',
};

export const OPENING = [
  `Hello, new builder! I am ${ODETTE.name}.`,
  'Shape Town is building a clubhouse right here. But first we need someone who really knows shapes.',
  'Help my helpers, and each job adds a part to the clubhouse. Look for people with a sign over their heads.',
  'And watch out for Chip. That beaver loves shapes, but gets them mixed up!',
];

export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. In a panel, press 1, 2 or 3 to pick a bin.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to walk, or use the pad. Tap a person to talk. Tap a bin to sort a shape.';

export const CHIP_JOKES = [
  'I turned a square on its corner. Now it is a diamond! Right? ...Right?',
  'A cube is just a square that ate too much. Hee hee!',
  'This skinny triangle is too thin to be a triangle. Or is it?',
  'I chewed a circle. Now it has corners! Wait, that is not how it works...',
];

export const RUSH_INTRO = 'Rush mode! Sort as many shapes as you can in 60 seconds. I will sort too. Can you beat me?';

export const ALL_OPEN_DONE = 'The walls and pillars are up! Mr. Haruto and Priya are getting their places ready. Come back soon to finish the clubhouse.';

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
    default:
      return 'Not quite. Try another bin!';
  }
}

export function hintText(p: Problem, rung: number): string {
  if (rung >= 3) return 'The answer is outlined.';
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
    'Your child helps a building yard put up a clubhouse. Each helper teaches one part of geometry, and each finished job adds a part to the building. In this first half, Kofi\'s Shape Sorting Arcade teaches flat shapes and Lupe\'s Block Shop teaches solid shapes. The Blueprint Workshop (building with shapes) and the Garden Yard (area and perimeter, up to grade 4) are coming next.',
  teaches: [
    { title: "Kofi's Shape Sorting Arcade (K–2)", text: 'Naming shapes drawn in every size, color and turn; counting sides and corners; telling real shapes from shapes with a gap or a curved side; then sorting by rules, including the idea that a square is a special rectangle.' },
    { title: "Lupe's Block Shop (K–1)", text: 'Flat or solid; naming cubes, spheres, cones, cylinders and boxes; what rolls and what stacks; everyday objects; and counting faces, including the ones you cannot see.' },
    { title: 'Mistakes get a reason', text: 'The game looks for common slips: "a turned square is a diamond", "a skinny triangle is not a triangle", "a square cannot be a rectangle", calling a cube a square, and counting only the faces you can see. Each gets one sentence of explanation.' },
    { title: 'Help built in', text: 'Three hints for every question: a tip, then a picture (corners numbered, or the hidden faces shown with dashed lines), then the answer.' },
  ],
  standards: [
    { code: 'K.G.1–4', text: 'Describe, name and compare flat and solid shapes regardless of size or orientation.' },
    { code: '1.G.1', text: 'Tell defining attributes (closed, 3 sides) from non-defining ones (color, size, turn).' },
    { code: '2.G.1', text: 'Recognize and draw shapes with given attributes, such as a number of angles or faces.' },
    { code: '3.G.1', text: 'Understand that shapes in different categories can share attributes (a square is a rectangle).' },
  ],
  talk: [
    'Turn a cracker or a book on its corner and ask: is it still the same shape? How do you know?',
    'Hunt for solids at home: a can (cylinder), a ball (sphere), a cereal box (rectangular box).',
    'Ask how many faces a box has, and check together by turning it over.',
  ],
  help: [
    'The level goes up after two clean answers in a row and down after two misses, so it stays at the right difficulty.',
    'Only the optional Rush mode has a timer. Every other question can take as long as your child needs.',
    'Every line can be read aloud. Shapes can be sorted with number keys, a mouse or a tap.',
  ],
  simplifies: ['Flat shapes are regular or simple shapes; the game does not use the words parallel or angle measures yet.', 'Solids are limited to cubes, spheres, cones, cylinders and rectangular boxes.'],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
