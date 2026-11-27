/**
 * The rock cycle rules: which process turns which rock into which. Pure and
 * tested. The race tracks use them for their forks, so a fork can only offer
 * something that really happens in nature.
 *
 * Simplified for grades 3 to 5, as school science teaches it: what melted
 * rock cools into depends here only on where and how fast it cools. (In real
 * life the kind of melted rock matters too.)
 */

export type Family = 'igneous' | 'sedimentary' | 'metamorphic' | 'magma' | 'sediment';

export type Rock =
  | 'magma'
  | 'granite'
  | 'basalt'
  | 'obsidian'
  | 'pumice'
  | 'gravel'
  | 'sand'
  | 'mud'
  | 'shells'
  | 'conglomerate'
  | 'sandstone'
  | 'shale'
  | 'limestone'
  | 'slate'
  | 'schist'
  | 'gneiss'
  | 'marble'
  | 'quartzite';

export const FAMILY: Record<Rock, Family> = {
  magma: 'magma',
  granite: 'igneous',
  basalt: 'igneous',
  obsidian: 'igneous',
  pumice: 'igneous',
  gravel: 'sediment',
  sand: 'sediment',
  mud: 'sediment',
  shells: 'sediment',
  conglomerate: 'sedimentary',
  sandstone: 'sedimentary',
  shale: 'sedimentary',
  limestone: 'sedimentary',
  slate: 'metamorphic',
  schist: 'metamorphic',
  gneiss: 'metamorphic',
  marble: 'metamorphic',
  quartzite: 'metamorphic',
};

export type Process =
  /** Melted rock cools slowly, deep underground: big crystals. */
  | 'cool-slow'
  /** Lava cools fast at the surface: tiny crystals. */
  | 'cool-fast'
  /** Lava cools in an instant: glass, no crystals. */
  | 'cool-instant'
  /** Gassy lava cools full of bubbles. */
  | 'cool-gassy'
  /** Heat melts rock into magma. */
  | 'melt'
  /** Weathering breaks rock and erosion carries the pieces; how far decides their size. */
  | 'weather-near'
  | 'weather-far'
  | 'weather-farthest'
  /** Layers press down and minerals glue the pieces (compaction and cementation). */
  | 'press-glue'
  /** Heat and pressure change solid rock without melting it. */
  | 'heat-press';

const IGNEOUS_FROM_MAGMA: Partial<Record<Process, Rock>> = {
  'cool-slow': 'granite',
  'cool-fast': 'basalt',
  'cool-instant': 'obsidian',
  'cool-gassy': 'pumice',
};

const GLUED: Partial<Record<Rock, Rock>> = { gravel: 'conglomerate', sand: 'sandstone', mud: 'shale', shells: 'limestone' };

const SQUEEZED: Partial<Record<Rock, Rock>> = {
  shale: 'slate',
  slate: 'schist',
  schist: 'gneiss',
  granite: 'gneiss',
  limestone: 'marble',
  sandstone: 'quartzite',
  conglomerate: 'quartzite',
  basalt: 'schist',
};

/** What `rock` becomes after `process`, or null when that can't happen to it. */
export function apply(rock: Rock, process: Process): Rock | null {
  const fam = FAMILY[rock];
  switch (process) {
    case 'cool-slow':
    case 'cool-fast':
    case 'cool-instant':
    case 'cool-gassy':
      return rock === 'magma' ? IGNEOUS_FROM_MAGMA[process]! : null;
    case 'melt':
      // Any solid rock can melt; magma is already melted.
      return rock === 'magma' ? null : 'magma';
    case 'weather-near':
    case 'weather-far':
    case 'weather-farthest':
      // Any rock at the surface can be broken down; loose pieces just travel on.
      if (rock === 'magma') return null;
      if (fam === 'sediment') return rock === 'shells' ? null : process === 'weather-near' ? 'gravel' : process === 'weather-far' ? 'sand' : 'mud';
      return process === 'weather-near' ? 'gravel' : process === 'weather-far' ? 'sand' : 'mud';
    case 'press-glue':
      return GLUED[rock] ?? null;
    case 'heat-press':
      return SQUEEZED[rock] ?? null;
  }
}

/** Every rock this one can become in one step, with the process. */
export function nextRocks(rock: Rock): Array<{ process: Process; rock: Rock }> {
  const all: Process[] = ['cool-slow', 'cool-fast', 'cool-instant', 'cool-gassy', 'melt', 'weather-near', 'weather-far', 'weather-farthest', 'press-glue', 'heat-press'];
  const out: Array<{ process: Process; rock: Rock }> = [];
  for (const p of all) {
    const r = apply(rock, p);
    if (r) out.push({ process: p, rock: r });
  }
  return out;
}

/** The shortest list of processes from one rock to another, or null. */
export function route(from: Rock, to: Rock): Process[] | null {
  const seen = new Set<Rock>([from]);
  const queue: Array<{ rock: Rock; path: Process[] }> = [{ rock: from, path: [] }];
  while (queue.length) {
    const { rock, path } = queue.shift()!;
    if (rock === to) return path;
    for (const n of nextRocks(rock)) {
      if (seen.has(n.rock)) continue;
      seen.add(n.rock);
      queue.push({ rock: n.rock, path: [...path, n.process] });
    }
  }
  return null;
}
