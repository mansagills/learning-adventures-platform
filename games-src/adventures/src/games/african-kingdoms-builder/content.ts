/**
 * The words of Kingdom Builders: Africa, kept apart from the code so they can
 * be reviewed on their own (history and culture review before shipping).
 * Draft names; the owner can change them.
 *
 * Dates are approximate and use BCE/CE. Negative years are BCE. A chapter
 * whose people live on today has `today: true`.
 */

export type ChapterId = 'egypt' | 'kush' | 'aksum' | 'zimbabwe' | 'mali' | 'dogon' | 'zulu' | 'maasai';

export interface Chapter {
  id: ChapterId;
  name: string;
  /** Where on the map: longitude and latitude (degrees). */
  lon: number;
  lat: number;
  /** Label offset on the hub map (screen pixels), so close pins don't overlap. */
  labelDx?: number;
  labelDy?: number;
  from: number;
  to: number;
  today?: boolean;
  /** Short line: the land and the signature resource. */
  land: string;
  greatWork: string;
  color: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'egypt', name: 'Ancient Egypt', lon: 31.1, lat: 29.9, from: -3100, to: -30, land: 'The Nile valley and its flood silt', greatWork: 'A pyramid and the workers’ town', color: '#d9a441' },
  { id: 'kush', name: 'Kush', lon: 33.7, lat: 16.9, labelDx: -18, from: -2500, to: 350, land: 'The Nile south of Egypt, and iron', greatWork: 'The pyramids and iron works of Meroë', color: '#b5562f' },
  { id: 'aksum', name: 'Aksum', lon: 38.7, lat: 14.1, labelDx: 26, from: 100, to: 940, land: 'Highlands by the Red Sea, and trade', greatWork: 'The tall carved stelae', color: '#7a5cc2' },
  { id: 'zimbabwe', name: 'Great Zimbabwe', lon: 30.9, lat: -20.3, from: 1100, to: 1450, land: 'The southern plateau, gold and cattle', greatWork: 'The Great Enclosure', color: '#8a8f99' },
  { id: 'mali', name: 'Mali Empire', lon: -4.2, lat: 16.6, labelDy: -14, from: 1235, to: 1600, land: 'The Niger River bend, salt and gold', greatWork: 'The great mud mosque of Djenné', color: '#c9822b' },
  { id: 'dogon', name: 'Dogon', lon: -3.3, lat: 14.2, labelDy: 16, from: 1400, to: 2025, today: true, land: 'The Bandiagara cliffs, millet and water', greatWork: 'Cliff granaries and the togu na', color: '#a0703c' },
  { id: 'zulu', name: 'Zulu Kingdom', lon: 31.3, lat: -28.6, from: 1816, to: 2025, today: true, land: 'Green rolling hills, cattle and sorghum', greatWork: 'A royal homestead', color: '#3f8f5a' },
  { id: 'maasai', name: 'Maasai', lon: 36.3, lat: -2.6, from: 1600, to: 2025, today: true, land: 'The Rift Valley savanna, cattle and grass', greatWork: 'A thriving enkang and healthy grasslands', color: '#c23a3a' },
];

export const CAST = {
  awa: {
    name: 'Jeli Awa',
    role: 'A young griot (jeli). Griots are the storyteller-historians of West Africa: they keep a people’s history in songs and pass it on. Her kora songs carry you to each kingdom.',
  },
  koko: {
    name: 'Koko',
    role: 'A ground hornbill who flies ahead, spots problems ("The granary is almost empty!") and points out good places to build.',
  },
  nebet: {
    name: 'Nebet',
    role: 'A farmer in Ancient Egypt (the Egypt chapter guide). She knows the river’s three seasons.',
  },
  villagers: {
    name: 'Villagers',
    role: 'The people of your town. They fetch water, farm, make mud bricks and build. Their clothes and homes change in every chapter.',
  },
};

export type Season = 'akhet' | 'peret' | 'shemu';

/** Egypt's three seasons of the Nile, as the ancient Egyptians named them. */
export const SEASONS: Record<Season, { name: string; meaning: string; line: string }> = {
  akhet: {
    name: 'Akhet',
    meaning: 'The flood',
    line: 'Every summer the Nile rises and covers the fields. Look: the villages sit on higher ground, so they stay dry. With the fields under water, many farmers go to work on the big building projects. When the water goes down, it leaves a layer of rich black mud.',
  },
  peret: {
    name: 'Peret',
    meaning: 'The growing season',
    line: 'Egyptians called their land Kemet, "the black land", after the dark mud the Nile leaves behind. Out past the fields is Deshret, "the red land": the desert. Where would you plant your wheat?',
  },
  shemu: {
    name: 'Shemu',
    meaning: 'The harvest',
    line: 'Harvest time! The wheat and barley are gold. Extra grain goes into the granaries, and that extra food means some people can become scribes, builders and craftworkers.',
  },
};

export const HUB_LINES = {
  title: 'Kingdom Builders: Africa',
  hint: 'Africa is a huge continent, with many peoples, lands and kingdoms across thousands of years. Pick a place on the map to visit it.',
  timeline: 'When they lived',
  todayNote: 'still lives on today',
};

/** The build bar in the Egypt chapter (look preview only, no costs yet). */
export const EGYPT_BUILDS = [
  { id: 'house', name: 'Mud-brick house' },
  { id: 'field', name: 'Wheat field' },
  { id: 'granary', name: 'Granary' },
  { id: 'shaduf', name: 'Shaduf' },
  { id: 'scribe', name: 'Scribe school' },
] as const;

export const NEEDS = ['Food', 'Water', 'Shelter', 'Joy', 'Knowledge'] as const;
