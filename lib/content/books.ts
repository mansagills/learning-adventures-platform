/**
 * Interactive ebooks: children's books that go with the games.
 *
 * On the site these are always called "interactive ebooks". The ebook
 * platform itself is never named to visitors; we only link to it via
 * `ebookUrl`. Buying and reading happen there, behind its own sign-in.
 *
 * PLACEHOLDERS: these three entries are working titles built from the Spark
 * Chronicles lore (docs/lore/). Swap in real titles, covers, sample pages and
 * links as the books are finished.
 */

import type { SubjectId } from './subjects';

export interface Book {
  slug: string;
  title: string;
  series: string;
  subject: SubjectId;
  /** e.g. "Ages 5–8" */
  ageRange: string;
  /** One-line hook for cards */
  hook: string;
  synopsis: string;
  /** Cover image in /public. Placeholder art is shown when missing. */
  coverImage?: string;
  /** Free preview pages (images in /public), in reading order */
  samplePages: string[];
  /** Where parents buy/read the interactive ebook. Falls back to the store link. */
  ebookUrl?: string;
  status: 'coming-soon' | 'available';
  /** Games that continue the story; slugs from lib/content/games.ts */
  companionGameSlugs: string[];
  characters: string[];
}

export const books: Book[] = [
  {
    slug: 'jaylen-and-the-frozen-numbers',
    title: 'Jaylen and the Frozen Numbers',
    series: 'The Spark Chronicles',
    subject: 'math',
    ageRange: 'Ages 5–8',
    hook: 'The numbers at the Academy have stopped moving. Can a curious new student get them counting again?',
    synopsis:
      "On their very first day at the Academy, a new student notices something strange in the Math wing: the patterns on the walls have frozen solid and the numbers refuse to add up. With help from Jaylen, the Academy's first Spark, and SPARK, his wise-cracking study buddy, they follow the clues through fractions, number lines and a very hungry monster to face Null, the shadow who wants every number stuck in place forever.",
    samplePages: [],
    status: 'coming-soon',
    companionGameSlugs: [
      'number-line-ninja',
      'pizza-fraction-frenzy',
      'number-monster-feeding',
    ],
    characters: ['Jaylen', 'SPARK', 'Null'],
  },
  {
    slug: 'the-experiment-that-wouldnt-spark',
    title: "The Experiment That Wouldn't Spark",
    series: 'The Spark Chronicles',
    subject: 'science',
    ageRange: 'Ages 6–9',
    hook: 'Every experiment in the Science wing is fizzling out, and nobody knows why.',
    synopsis:
      "Crystals won't grow, magnets won't stick and the light lab has gone dark. Jaylen suspects Static, a sneaky jammer who stops discoveries before they start. To bring the Science wing back to life, our heroes will need to mix, measure and test like real scientists, and remember that the best experiments begin with a question.",
    samplePages: [],
    status: 'coming-soon',
    companionGameSlugs: [
      'crystal-cave-chemistry',
      'magnet-power-puzzle',
      'light-laboratory-escape',
    ],
    characters: ['Jaylen', 'SPARK', 'Static'],
  },
  {
    slug: 'the-day-the-stories-went-quiet',
    title: 'The Day the Stories Went Quiet',
    series: 'The Spark Chronicles',
    subject: 'english',
    ageRange: 'Ages 6–9',
    hook: 'Words are vanishing from the Academy library. Only the right spelling can bring them back.',
    synopsis:
      "Something called the Blot is drinking the stories right off the page. Books go blank, signs lose their letters and even Jaylen can't remember the end of his favorite tale. Spelling bee by spelling bee, word by word, our heroes set out to fill the library with stories again.",
    samplePages: [],
    status: 'coming-soon',
    companionGameSlugs: ['spelling-bee-challenge'],
    characters: ['Jaylen', 'SPARK', 'The Blot'],
  },
];

export function getBook(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}

export function getBooksBySubject(subject: SubjectId): Book[] {
  return books.filter((book) => book.subject === subject);
}

/** Books whose story connects to the given game. */
export function getBooksForGame(gameSlug: string): Book[] {
  return books.filter((book) => book.companionGameSlugs.includes(gameSlug));
}
