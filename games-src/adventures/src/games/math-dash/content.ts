import type { GrownupsContent } from '../../kit/ui/grownups';
import type { PowerId } from './art';
import { digits, type Misconception, type Shelf, type Stage } from './problems';

/** All the words in Library Rush, kept here so they can be reviewed on their own. */

export const STAGE_INFO: Record<Stage, { name: string; short: string; rule: string; arrive: string }> = {
  1: {
    name: 'Picture Books',
    short: 'Tens',
    rule: 'Look at the tens digit. 34 has 3 tens, so it goes on the 30–39 shelf.',
    arrive: 'Picture books first! Each shelf holds one group of ten. Look at the TENS digit.',
  },
  2: {
    name: 'Chapter Books',
    short: 'Hundreds',
    rule: 'Look at the hundreds digit. 247 has 2 hundreds, so it goes on the 200–299 shelf.',
    arrive: 'New boxes of chapter books! The shelves are now hundreds. Look at the HUNDREDS digit.',
  },
  3: {
    name: 'Reference',
    short: 'Compare',
    rule: 'Compare with the sign. < means less than and > means more than.',
    arrive: 'Reference section! These signs use < and >. Compare each book with the sign.',
  },
};

export interface PowerDef {
  id: PowerId;
  name: string;
  /** What it does at each level, 1–5. */
  levels: [string, string, string, string, string];
}

export const POWERS: PowerDef[] = [
  { id: 'bell', name: 'Shush Bell', levels: ['A calming ring around you every few seconds.', 'Rings a little more often.', 'A bigger ring.', 'Rings more often.', 'A giant ring, very often.'] },
  { id: 'notes', name: 'Paper Notes', levels: ['A paper note flies to the nearest student: "Please read quietly."', 'Notes fly more often.', 'Two notes at a time.', 'Notes fly faster and more often.', 'Three notes at a time.'] },
  { id: 'rug', name: 'Story Rug', levels: ['Students near you slow down to listen.', 'A bigger rug.', 'They slow down more.', 'A bigger rug.', 'Almost everyone stops to listen.'] },
  { id: 'magnet', name: 'Bookmark Magnet', levels: ['Pick up books from farther away.', 'Farther.', 'Farther still.', 'Much farther.', 'Books fly to you from across the rug.'] },
  { id: 'cart', name: 'Book Cart', levels: ['Carry 1 more book.', 'Carry 1 more book.', 'Carry 1 more book.', 'Carry 1 more book.', 'Carry 2 more books.'] },
  { id: 'sneakers', name: 'Quiet Sneakers', levels: ['Walk a little faster.', 'Faster.', 'Faster.', 'Faster.', 'Zoom (quietly).'] },
  { id: 'glasses', name: 'Reading Glasses', levels: ['Book numbers show place value: hundreds red, tens blue, ones green.', '+20% points for every book.', '+40% points.', '+60% points.', '+80% points.'] },
  { id: 'cocoa', name: 'Cocoa Break', levels: ['Focus slowly comes back.', 'Comes back faster.', 'Faster.', 'Faster.', 'Much faster.'] },
  { id: 'card', name: 'Library Card', levels: ['Blocks one bump every 20 seconds.', 'Every 17 seconds.', 'Every 14 seconds.', 'Every 11 seconds.', 'Every 8 seconds.'] },
];

export const SNACK = { name: 'Apple Snack', text: 'Get back 30 Focus.' };

export const LIBRARIAN_INTRO = [
  'Welcome to the library, helper! I am Mx. Okafor, the librarian.',
  'Books are everywhere today. Walk over a book to pick it up. Its number shows above your head.',
  'Then walk into the shelf whose sign matches the number. Right shelf, more points!',
  'One more thing: the students here LOVE to chat. If one bumps into you, you lose Focus. Keep moving!',
  'Every few books you can choose a new library power. Ready? Let us get sorting!',
];

export const CONTROLS_KEYS = 'Move with the arrow keys or WASD. Q swaps the book in your hands. Esc pauses.';
export const CONTROLS_TOUCH = 'Drag anywhere on the screen to move. Tap Swap to change the book in your hands.';

/** What a chatty student says when they bump into you. */
export const CHATTER = [
  'Did you see my new shoes?!',
  'Guess what my dog did!',
  'Is it lunch yet?',
  'Wanna hear a joke?',
  'I lost a tooth!',
  'Have you read this one?',
  'Psst! Psst!',
  'My sister has a hamster!',
  'Can you help me find dinosaurs?',
  'I can whistle! Listen!',
];

/** What a calmed student says. */
export const CALMED = ['Shh, okay!', 'Oops, sorry!', 'Reading now!', 'Quiet mode!', 'Okay, okay!'];

const unit = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;

export function placeWords(n: number): string {
  const d = digits(n);
  if (n >= 100) return `${n} has ${unit(d.h, 'hundred', 'hundreds')}, ${unit(d.t, 'ten', 'tens')} and ${unit(d.o, 'one', 'ones')}`;
  return `${n} has ${unit(d.t, 'ten', 'tens')} and ${unit(d.o, 'one', 'ones')}`;
}

/** One sentence that explains a wrong shelf, from the mistake behind it. */
export function mistakeLine(n: number, chosen: Shelf, right: Shelf, m: Misconception, stage: Stage): string {
  const d = digits(n);
  switch (m) {
    case 'last-digit':
      return stage === 1
        ? `That shelf matches the ones digit. ${n} has ${unit(d.t, 'ten', 'tens')}, so it goes on ${right.label}.`
        : `That shelf matches the last digit. ${n} has ${unit(d.h, 'hundred', 'hundreds')}, so it goes on ${right.label}.`;
    case 'middle-digit':
      return `That matches the tens digit. The FIRST digit of ${n} is the hundreds: ${d.h}. Try ${right.label}.`;
    case 'two-digit-big':
      return `${n} has only two digits, so it is less than 100. Nine tens is not nine hundreds! Try ${right.label}.`;
    case 'boundary':
      return chosen.lo > n ? `So close! ${n} is just less than ${chosen.lo}. Try ${right.label}.` : `So close! ${n} is more than ${chosen.hi}. Try ${right.label}.`;
    case 'symbol-flip':
      return `Check the sign: < means LESS than, > means MORE than. ${n} goes on ${right.label}.`;
    case 'next-shelf':
      return `One shelf off. ${placeWords(n)}. Try ${right.label}.`;
    default:
      return `Not this shelf. ${placeWords(n)}. Try ${right.label}.`;
  }
}

/** A short practice tip for the end-of-shift summary, from the mistake seen most. */
export const PRACTICE_TIP: Record<Misconception, string> = {
  'last-digit': 'Practice: read the FIRST digit. In 34 the 3 means 3 tens. In 247 the 2 means 2 hundreds.',
  'middle-digit': 'Practice: in a three-digit number, the first digit is the hundreds. 351 has 3 hundreds.',
  'two-digit-big': 'Practice: any two-digit number is less than any three-digit number. 98 < 102.',
  boundary: 'Practice: numbers right next to a sign\'s edge. Is 248 less than 250? Yes!',
  'symbol-flip': 'Practice: the open side of < and > faces the bigger number.',
  'next-shelf': 'Practice: say the number in parts: hundreds, tens and ones.',
  other: 'Practice: say the number in parts: hundreds, tens and ones.',
};

export const PRAISE = ['Shelved!', 'Nice!', 'Perfect spot!', 'Great sorting!', 'Bookworm!', 'Super!'];

export const GROWNUPS: GrownupsContent = {
  game: 'Math Dash: Library Rush',
  grades: '1–3',
  summary:
    'Your child is a library helper: they walk around a busy library, pick up books and shelve each one by its number while dodging chatty classmates. It is a fast action game (like the popular "survivors" games, with no fighting). The math is in every move: to shelve a book, your child has to read its number by place value and compare it with the shelf signs.',
  teaches: [
    { title: 'Picture Books (tens)', text: 'Numbers 0–59 go on shelves by tens (20–29, 30–39). Your child reads the tens digit: 34 is 3 tens and 4 ones.' },
    { title: 'Chapter Books (hundreds)', text: 'Numbers 100–599 go on shelves by hundreds (100–199 up to 500–599). Your child reads the hundreds digit: 247 is 2 hundreds, 4 tens and 7 ones.' },
    { title: 'Reference (compare)', text: 'Shelves are labelled like "< 250", "250 to 499" and "> 749". Your child compares three-digit numbers and reads the < and > symbols. Two-digit books (like 98) check that "9 is a big digit" does not fool them.' },
    { title: 'Mistakes get a reason', text: 'If a book goes on the wrong shelf, it bounces back with one sentence about the likely mistake (for example reading the last digit instead of the first). After two misses on the same book, the right shelf sign glows.' },
  ],
  standards: [
    { code: '1.NBT.2', text: 'The two digits of a two-digit number are tens and ones.' },
    { code: '1.NBT.3', text: 'Compare two two-digit numbers.' },
    { code: '2.NBT.1', text: 'The three digits of a three-digit number are hundreds, tens and ones.' },
    { code: '2.NBT.4', text: 'Compare two three-digit numbers with >, = and <.' },
  ],
  talk: [
    'Pick a number in the house (an address, a page number). How many hundreds, tens and ones?',
    'Which is bigger, 98 or 102? How do you know?',
    'If a shelf says "less than 300", which of these fit: 299, 300, 301?',
  ],
  help: [
    'Runs never end until Focus runs out, so there is always a "one more try". Short sessions (10–15 minutes) work well.',
    'Reading Glasses (a power-up) color the digits: hundreds red, tens blue, ones green, the same colors as place-value blocks at school.',
    'The game starts each run at the highest stage your child has mastered. You can pick an easier start on the title screen.',
  ],
  simplifies: ['Real libraries use the Dewey Decimal system with decimals and letters. Here the call numbers are whole numbers up to 999.'],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
