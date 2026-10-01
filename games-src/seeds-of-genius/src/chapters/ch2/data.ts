/**
 * Chapter 2 data: the stages of George Washington Carver's education.
 *
 * Every fact here was checked against the National Park Service biography
 * (content/sources.ts). The wording is written for ages 8-13. Stages marked
 * `sensitive` describe racism; the game names it plainly and gives the
 * player a way to skip and come back.
 */

export interface Stage {
  id: string;
  /** Correct position on the timeline (1 = earliest). */
  order: number;
  title: string;
  place: string;
  /** Painting key (art/sceneArt.ts). */
  art: string;
  /** What the display says. */
  caption: string;
  /** Date from Ms. Nelson's records, if the records have one. */
  recordDate?: string;
  /** A sequence clue printed on the display (for stages without a date). */
  clue?: string;
  /** Extra clue from Ada's sketch. */
  sketchClue?: string;
  sensitive?: boolean;
  /** Tile the player stands on to view this display (school scene). */
  stand: { x: number; y: number };
}

export const STAGES: Stage[] = [
  {
    id: 'reading',
    order: 1,
    title: 'Learning to read at home',
    place: 'Diamond, Missouri',
    art: 'ch2-reading',
    caption:
      'Susan Carver helped young George learn to read. The school in Diamond did not allow Black children, so he could not go there.',
    recordDate: '1870s',
    sensitive: true,
    stand: { x: 2.5, y: 3.3 },
  },
  {
    id: 'neosho',
    order: 2,
    title: 'Finding a school in Neosho',
    place: 'Neosho, Missouri',
    art: 'ch2-neosho',
    caption:
      'When he was about 11, George left home to go to a school for Black children in the town of Neosho. Mariah Watkins, a nurse and midwife, gave him a place to stay and encouraged him to keep learning.',
    clue: 'This happened after he learned to read at home.',
    stand: { x: 11.5, y: 3.3 },
  },
  {
    id: 'kansas',
    order: 3,
    title: 'Working his way through school',
    place: 'Kansas',
    art: 'ch2-kansas',
    caption:
      'For years, George moved from town to town in Kansas. He cooked and washed laundry to pay his way, and he finished high school in Minneapolis, Kansas.',
    clue: 'This happened after his school days in Neosho.',
    stand: { x: 2.3, y: 4.5 },
  },
  {
    id: 'highland',
    order: 4,
    title: 'Turned away from Highland College',
    place: 'Highland, Kansas',
    art: 'ch2-highland',
    caption:
      'Highland College accepted George by letter. When he arrived and the college saw that he was Black, it would not let him in. That was racism, and it was wrong.',
    recordDate: 'about 1885',
    sensitive: true,
    stand: { x: 11.7, y: 4.5 },
  },
  {
    id: 'simpson',
    order: 5,
    title: 'Studying art at Simpson College',
    place: 'Indianola, Iowa',
    art: 'ch2-simpson',
    caption:
      'At Simpson College, George studied art and piano. His art teacher, Etta Budd, saw how well he painted plants and encouraged him to study botany, the science of plants.',
    recordDate: '1890',
    sketchClue: "Ada's sketch: he studied art first, then plants.",
    stand: { x: 2.3, y: 6.5 },
  },
  {
    id: 'iowastate',
    order: 6,
    title: 'Studying plants at Iowa State',
    place: 'Ames, Iowa',
    art: 'ch2-iowastate',
    caption:
      "George became the first Black student at Iowa State Agricultural College. He earned a bachelor's degree in 1894 and a master's degree in 1896, and he taught there, too.",
    recordDate: '1891 to 1896',
    stand: { x: 11.7, y: 6.5 },
  },
];

/** The fixed end of the timeline: where Carver's career began. */
export const FINALE = {
  title: 'Teaching at Tuskegee Institute',
  place: 'Tuskegee, Alabama',
  date: '1896',
  art: 'ch2-tuskegee',
  caption:
    'Booker T. Washington invited George Washington Carver to teach at Tuskegee Institute in Alabama. He stayed there for the rest of his career.',
};

/** Where the chalkboard timeline is built (school scene). */
export const BOARD = { x: 7, y: 3.1 };

export interface Pick {
  id: string;
  text: string;
  ok: boolean;
  feedback: string;
  /** How Carver describes it in his reflection. */
  carver?: string;
}

export const BARRIERS: Pick[] = [
  {
    id: 'highland',
    text: 'Highland College turned him away because he was Black.',
    ok: true,
    feedback: 'Yes. That was racism, and it was not fair. It blocked him from a college he had already been accepted to.',
    carver: 'Highland College turned me away when they saw I was Black.',
  },
  {
    id: 'painting',
    text: 'He liked to paint plants.',
    ok: false,
    feedback: 'Painting was not in his way. It actually led him to botany! A barrier is something that blocked him.',
  },
  {
    id: 'diamond',
    text: 'The school in Diamond did not allow Black children.',
    ok: true,
    feedback: 'Yes. That rule was racism. It kept him out of the school closest to home.',
    carver: 'The school in Diamond would not let Black children in.',
  },
];

export const SUPPORTS: Pick[] = [
  {
    id: 'budd',
    text: 'Etta Budd encouraged him to study plants.',
    ok: true,
    feedback: 'Yes. His art teacher saw his talent for painting plants and pointed him toward botany.',
    carver: 'Etta Budd, my art teacher.',
  },
  {
    id: 'letter',
    text: 'Highland College sent him an acceptance letter.',
    ok: false,
    feedback: 'The letter looked like help, but the college turned him away when he arrived. That was a barrier, not support.',
  },
  {
    id: 'watkins',
    text: 'Mariah Watkins gave him a home and encouraged him to learn.',
    ok: true,
    feedback: 'Yes. In Neosho, Mariah Watkins took him in and encouraged him to keep learning.',
    carver: 'Mariah Watkins, who gave me a home in Neosho.',
  },
];

export function stageById(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

/** Seeded shuffle (reproducible), never returning the already-correct order. */
export function shuffledOrder(seed: number): string[] {
  const ids = STAGES.map((s) => s.id);
  let a = seed >>> 0 || 1;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.every((id, i) => id === ids[i])) out.reverse();
  return out;
}
