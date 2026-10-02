/**
 * Every playable game and activity on the public site.
 *
 * This list only includes content that actually exists as an HTML file in
 * `public/`. (`lib/catalogData.ts` still holds the older catalog, including
 * placeholder ideas, for the account-based features.) The content test in
 * `tests/content/content.test.ts` fails if an `htmlPath` points at a missing
 * file.
 *
 * To add a game: drop the HTML file in `public/games/`, add an entry here, then
 * run `npm run thumbnails -- --only <slug>` to make its card picture.
 */

import type { SubjectId } from './subjects';

export interface PlayableGame {
  /** URL slug: the game plays at /games/[slug] */
  slug: string;
  title: string;
  subject: SubjectId;
  /** 'game' = arcade-style play, 'activity' = guided interactive lesson */
  kind: 'game' | 'activity';
  /** Short grade range shown on cards, e.g. "2–5" (K = kindergarten) */
  grades: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  skills: string[];
  estimatedTime: string;
  /** Path to the self-contained HTML file in /public */
  htmlPath: string;
  /**
   * Card picture: a screenshot in /public/games/thumbnails, made with
   * `npm run thumbnails -- --only <slug>`
   */
  thumbnail: string;
  featured?: boolean;
}

export const games: PlayableGame[] = [
  // ── Math ────────────────────────────────────────────────────────────────
  {
    slug: 'math-race-rally',
    title: 'Math Race Rally',
    subject: 'math',
    kind: 'game',
    grades: '2–5',
    difficulty: 'medium',
    description:
      'Solve problems to move your race car forward in this exciting racing game.',
    skills: ['Addition', 'Subtraction', 'Speed Math'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/math-race-rally.html',
    thumbnail: '/games/thumbnails/math-race-rally.jpg',
    featured: true,
  },
  {
    slug: 'pizza-fraction-frenzy',
    title: 'Pizza Fraction Frenzy',
    subject: 'math',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description:
      'Serve hungry customers the right pizza slices and master fractions.',
    skills: ['Fractions', 'Visual Math'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/pizza-fraction-frenzy.html',
    thumbnail: '/games/thumbnails/pizza-fraction-frenzy.jpg',
    featured: true,
  },
  {
    slug: 'multiplication-space-quest',
    title: 'Multiplication Space Quest',
    subject: 'math',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Blast off across the galaxy while you practice your times tables.',
    skills: ['Multiplication', 'Times Tables'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/multiplication-space-quest.html',
    thumbnail: '/games/thumbnails/multiplication-space-quest.jpg',
    featured: true,
  },
  {
    slug: 'math-adventure-island',
    title: 'Math Adventure Island',
    subject: 'math',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description:
      'Sail from island to island solving math puzzles to reach the treasure.',
    skills: ['Problem Solving', 'Mixed Operations'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/math-adventure-island.html',
    thumbnail: '/games/thumbnails/math-adventure-island.jpg',
  },
  {
    slug: 'treasure-hunt-calculator',
    title: 'Treasure Hunt Calculator',
    subject: 'math',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description: 'Solve math problems to dig up buried pirate treasure.',
    skills: ['Addition', 'Subtraction', 'Problem Solving'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/treasure-hunt-calculator.html',
    thumbnail: '/games/thumbnails/treasure-hunt-calculator.jpg',
  },
  {
    slug: 'multiplication-bingo-bonanza',
    title: 'Multiplication Bingo Bonanza',
    subject: 'math',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Solve multiplication problems and mark your card to get BINGO!',
    skills: ['Multiplication', 'Times Tables'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/multiplication-bingo-bonanza.html',
    thumbnail: '/games/thumbnails/multiplication-bingo-bonanza.jpg',
  },
  {
    slug: 'math-dash',
    title: 'Math Dash: Library Sorter',
    subject: 'math',
    kind: 'game',
    grades: '1–3',
    difficulty: 'easy',
    description:
      'Sort scrambled numbers on book spines from smallest to largest before time runs out.',
    skills: ['Comparing Numbers', 'Ordering'],
    estimatedTime: '5–10 min',
    htmlPath: '/games/math-dash.html',
    thumbnail: '/games/thumbnails/math-dash.jpg',
  },
  {
    slug: 'cafeteria-cashier',
    title: 'Cafeteria Cashier',
    subject: 'math',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description:
      'Run the school cafeteria register: add up orders and count out the right change.',
    skills: ['Money', 'Addition', 'Making Change'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/cafeteria-cashier.html',
    thumbnail: '/games/thumbnails/cafeteria-cashier.jpg',
  },
  {
    slug: 'money-market-madness',
    title: 'Money Market Madness',
    subject: 'math',
    kind: 'game',
    grades: '1–3',
    difficulty: 'easy',
    description: 'Go shopping and pay with the right coins and bills.',
    skills: ['Money', 'Counting Coins'],
    estimatedTime: '5–10 min',
    htmlPath: '/games/money-market-madness.html',
    thumbnail: '/games/thumbnails/money-market-madness.jpg',
  },
  {
    slug: 'time-attack-clock',
    title: 'Time Attack Clock',
    subject: 'math',
    kind: 'game',
    grades: '1–3',
    difficulty: 'easy',
    description: 'Read the clock as fast as you can and beat the timer.',
    skills: ['Telling Time', 'Clocks'],
    estimatedTime: '5–10 min',
    htmlPath: '/games/time-attack-clock.html',
    thumbnail: '/games/thumbnails/time-attack-clock.jpg',
  },
  {
    slug: 'counting-carnival',
    title: 'Counting Carnival',
    subject: 'math',
    kind: 'game',
    grades: 'K–2',
    difficulty: 'easy',
    description:
      'Walk around a carnival with Ringmaster Rosa and Munch the snack monster. Count ducks, toss rings onto ten-frames, pick the plate with more snacks and pay for prizes with tens and ones.',
    skills: ['Counting', 'Comparing Numbers', 'Making Ten', 'Tens and Ones'],
    estimatedTime: '15–30 min',
    // Rebuilt with the Adventure Kit; replaces Number Monster Feeding (merged in)
    htmlPath: '/games/play/counting-carnival/index.html',
    thumbnail: '/games/thumbnails/counting-carnival.jpg',
    featured: true,
  },
  {
    slug: 'number-line-ninja',
    title: 'Number Line Ninja',
    subject: 'math',
    kind: 'game',
    grades: '1–3',
    difficulty: 'medium',
    description:
      'Hop a ninja across a river of stepping stones to find numbers, add, subtract and take big hops of ten. Earn five belts with Sensei Rio.',
    skills: ['Number Line', 'Addition', 'Subtraction', 'Place Value'],
    estimatedTime: '15–30 min',
    // Rebuilt with the Adventure Kit (games-src/adventures); see docs/GAMES_3D_UPGRADE_PLAN.md
    htmlPath: '/games/play/number-line-ninja/index.html',
    thumbnail: '/games/thumbnails/number-line-ninja.jpg',
  },
  {
    slug: 'shape-sorting-arcade',
    title: 'Shape Sorting Arcade',
    subject: 'math',
    kind: 'game',
    grades: 'K–2',
    difficulty: 'easy',
    description: 'Sort shapes by their sides, corners and other properties.',
    skills: ['Geometry', 'Shapes'],
    estimatedTime: '5–10 min',
    htmlPath: '/games/shape-sorting-arcade.html',
    thumbnail: '/games/thumbnails/shape-sorting-arcade.jpg',
  },
  {
    slug: 'geometry-builder-challenge',
    title: 'Geometry Builder Challenge',
    subject: 'math',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description: 'Build pictures and structures out of shapes.',
    skills: ['Geometry', 'Spatial Reasoning'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/geometry-builder-challenge.html',
    thumbnail: '/games/thumbnails/geometry-builder-challenge.jpg',
  },
  {
    slug: 'equation-balance-scale',
    title: 'Equation Balance Scale',
    subject: 'math',
    kind: 'game',
    grades: '3–5',
    difficulty: 'hard',
    description: 'Keep the scale balanced to discover the missing number.',
    skills: ['Equations', 'Early Algebra'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/equation-balance-scale.html',
    thumbnail: '/games/thumbnails/equation-balance-scale.jpg',
  },
  {
    slug: 'math-jeopardy-junior',
    title: 'Math Jeopardy Junior',
    subject: 'math',
    kind: 'game',
    grades: '2–5',
    difficulty: 'medium',
    description: 'Pick a category and a point value in this math game show.',
    skills: ['Mixed Operations', 'Word Problems'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/math-jeopardy-junior.html',
    thumbnail: '/games/thumbnails/math-jeopardy-junior.jpg',
  },
  {
    slug: 'math-memory-match',
    title: 'Math Memory Match',
    subject: 'math',
    kind: 'game',
    grades: '1–3',
    difficulty: 'easy',
    description: 'Flip the cards and match each problem with its answer.',
    skills: ['Math Facts', 'Memory'],
    estimatedTime: '5–10 min',
    htmlPath: '/games/math-memory-match.html',
    thumbnail: '/games/thumbnails/math-memory-match.jpg',
  },
  {
    slug: 'fraction-pizza-party',
    title: 'Fraction Pizza Party',
    subject: 'math',
    kind: 'activity',
    grades: '2–4',
    difficulty: 'easy',
    description: 'Slice up virtual pizzas to see and compare fractions.',
    skills: ['Fractions', 'Visual Math', 'Comparison'],
    estimatedTime: '15–20 min',
    htmlPath: '/lessons/fraction-pizza-party.html',
    thumbnail: '/games/thumbnails/fraction-pizza-party.jpg',
  },
  {
    slug: 'multiplication-tables-adventure',
    title: 'Multiplication Tables Adventure',
    subject: 'math',
    kind: 'activity',
    grades: '3–5',
    difficulty: 'medium',
    description: 'Master your multiplication tables one step at a time.',
    skills: ['Multiplication', 'Times Tables', 'Mental Math'],
    estimatedTime: '20–30 min',
    htmlPath: '/lessons/multiplication-tables-adventure.html',
    thumbnail: '/games/thumbnails/multiplication-tables-adventure.jpg',
  },

  // ── Science ─────────────────────────────────────────────────────────────
  {
    slug: 'planet-explorer-quest',
    title: 'Planet Explorer Quest',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Pilot your spaceship through the solar system answering planet facts.',
    skills: ['Astronomy', 'Space Facts'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/planet-explorer-quest.html',
    thumbnail: '/games/thumbnails/planet-explorer-quest.jpg',
    featured: true,
  },
  {
    slug: 'ocean-conservation-heroes',
    title: 'Ocean Conservation Heroes',
    subject: 'science',
    kind: 'game',
    grades: '2–5',
    difficulty: 'medium',
    description:
      'Dive in and clean up ocean pollution while learning about marine ecosystems.',
    skills: ['Marine Biology', 'Conservation'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/ocean-conservation-heroes.html',
    thumbnail: '/games/thumbnails/ocean-conservation-heroes.jpg',
    featured: true,
  },
  {
    slug: 'animal-kingdom-match',
    title: 'Animal Kingdom Match',
    subject: 'science',
    kind: 'game',
    grades: '1–4',
    difficulty: 'easy',
    description: 'Race the clock to match animals with their habitats.',
    skills: ['Animals', 'Habitats'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/animal-kingdom-match.html',
    thumbnail: '/games/thumbnails/animal-kingdom-match.jpg',
    featured: true,
  },
  {
    slug: 'crystal-cave-chemistry',
    title: 'Crystal Cave Chemistry',
    subject: 'science',
    kind: 'game',
    grades: '4–5',
    difficulty: 'hard',
    description:
      'Mix virtual chemicals to grow crystals and learn about reactions.',
    skills: ['Chemistry', 'Crystals', 'Experiments'],
    estimatedTime: '15–25 min',
    htmlPath: '/games/crystal-cave-chemistry.html',
    thumbnail: '/games/thumbnails/crystal-cave-chemistry.jpg',
    featured: true,
  },
  {
    slug: 'solar-system-explorer',
    title: 'Solar System Explorer',
    subject: 'science',
    kind: 'game',
    grades: '2–5',
    difficulty: 'easy',
    description:
      'Fly from planet to planet and explore the whole solar system.',
    skills: ['Astronomy', 'Planets'],
    estimatedTime: '10–15 min',
    htmlPath: '/games/solar-system-explorer.html',
    thumbnail: '/games/thumbnails/solar-system-explorer.jpg',
  },
  {
    slug: 'weather-wizard-battle',
    title: 'Weather Wizard Battle',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description: 'Control the weather to solve puzzles and help the world.',
    skills: ['Weather', 'Problem Solving'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/weather-wizard-battle.html',
    thumbnail: '/games/thumbnails/weather-wizard-battle.jpg',
  },
  {
    slug: 'body-system-heroes',
    title: 'Body System Heroes',
    subject: 'science',
    kind: 'game',
    grades: '4–5',
    difficulty: 'hard',
    description: 'Guide tiny heroes through the human body to fight off germs.',
    skills: ['Human Body', 'Health'],
    estimatedTime: '20–25 min',
    htmlPath: '/games/body-system-heroes.html',
    thumbnail: '/games/thumbnails/body-system-heroes.jpg',
  },
  {
    slug: 'ecosystem-building-tycoon',
    title: 'Ecosystem Building Tycoon',
    subject: 'science',
    kind: 'game',
    grades: '4–5',
    difficulty: 'hard',
    description:
      'Build and balance living ecosystems through environmental challenges.',
    skills: ['Ecology', 'Food Chains'],
    estimatedTime: '25–30 min',
    htmlPath: '/games/ecosystem-building-tycoon.html',
    thumbnail: '/games/thumbnails/ecosystem-building-tycoon.jpg',
  },
  {
    slug: 'states-of-matter-mixer',
    title: 'States of Matter Mixer',
    subject: 'science',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description:
      'Melt, freeze and boil your way through kitchen-themed challenges.',
    skills: ['States of Matter', 'Chemistry'],
    estimatedTime: '10–20 min',
    htmlPath: '/games/states-of-matter-mixer.html',
    thumbnail: '/games/thumbnails/states-of-matter-mixer.jpg',
  },
  {
    slug: 'fossil-dig-adventure',
    title: 'Fossil Dig Adventure',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description: 'Excavate a dig site and uncover dinosaur mysteries.',
    skills: ['Fossils', 'Paleontology'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/fossil-dig-adventure.html',
    thumbnail: '/games/thumbnails/fossil-dig-adventure.jpg',
  },
  {
    slug: 'magnet-power-puzzle',
    title: 'Magnet Power Puzzle',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'hard',
    description: 'Use magnetic forces to solve trickier and trickier puzzles.',
    skills: ['Magnetism', 'Forces'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/magnet-power-puzzle.html',
    thumbnail: '/games/thumbnails/magnet-power-puzzle.jpg',
  },
  {
    slug: 'light-laboratory-escape',
    title: 'Light Laboratory Escape',
    subject: 'science',
    kind: 'game',
    grades: '4–5',
    difficulty: 'hard',
    description: 'Bend light with mirrors and prisms to escape the lab.',
    skills: ['Light', 'Optics', 'Logic'],
    estimatedTime: '20–25 min',
    htmlPath: '/games/light-laboratory-escape.html',
    thumbnail: '/games/thumbnails/light-laboratory-escape.jpg',
  },
  {
    slug: 'plant-growing-championship',
    title: 'Plant Growing Championship',
    subject: 'science',
    kind: 'game',
    grades: '2–4',
    difficulty: 'medium',
    description: 'Grow the healthiest plants to win the championship.',
    skills: ['Plants', 'Life Cycles'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/plant-growing-championship.html',
    thumbnail: '/games/thumbnails/plant-growing-championship.jpg',
  },
  {
    slug: 'rock-cycle-racing',
    title: 'Rock Cycle Racing',
    subject: 'science',
    kind: 'game',
    grades: '4–5',
    difficulty: 'hard',
    description:
      'Race rocks through the rock cycle as they melt, cool and change.',
    skills: ['Geology', 'Rock Cycle'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/rock-cycle-racing.html',
    thumbnail: '/games/thumbnails/rock-cycle-racing.jpg',
  },
  {
    slug: 'sound-wave-surfer',
    title: 'Sound Wave Surfer',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Surf sound waves and make music as you learn how sound travels.',
    skills: ['Sound', 'Waves'],
    estimatedTime: '10–20 min',
    htmlPath: '/games/sound-wave-surfer.html',
    thumbnail: '/games/thumbnails/sound-wave-surfer.jpg',
  },
  {
    slug: 'ocean-depth-diver',
    title: 'Ocean Depth Diver',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Dive down through the ocean layers and discover who lives there.',
    skills: ['Ocean Zones', 'Marine Life'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/ocean-depth-diver.html',
    thumbnail: '/games/thumbnails/ocean-depth-diver.jpg',
  },
  {
    slug: 'simple-machines-construction',
    title: 'Simple Machines Construction',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'hard',
    description: 'Build contraptions with levers, pulleys and ramps.',
    skills: ['Simple Machines', 'Engineering'],
    estimatedTime: '20–25 min',
    htmlPath: '/games/simple-machines-construction.html',
    thumbnail: '/games/thumbnails/simple-machines-construction.jpg',
  },
  {
    slug: 'pollution-solution-squad',
    title: 'Pollution Solution Squad',
    subject: 'science',
    kind: 'game',
    grades: '3–5',
    difficulty: 'medium',
    description: 'Clean up polluted places and bring ecosystems back to life.',
    skills: ['Environment', 'Conservation'],
    estimatedTime: '15–20 min',
    htmlPath: '/games/pollution-solution-squad.html',
    thumbnail: '/games/thumbnails/pollution-solution-squad.jpg',
  },
  {
    slug: 'volcano-explorer-lab',
    title: 'Volcano Explorer Lab',
    subject: 'science',
    kind: 'activity',
    grades: '3–5',
    difficulty: 'medium',
    description: 'Explore volcanoes up close and set off your own eruptions.',
    skills: ['Volcanoes', 'Earth Science'],
    estimatedTime: '25–30 min',
    htmlPath: '/lessons/volcano-explorer-lab.html',
    thumbnail: '/games/thumbnails/volcano-explorer-lab.jpg',
  },
  {
    slug: 'water-cycle-journey',
    title: 'The Water Cycle Journey',
    subject: 'science',
    kind: 'activity',
    grades: '3–5',
    difficulty: 'easy',
    description:
      'Follow a water droplet through evaporation, condensation and rain.',
    skills: ['Water Cycle', 'Weather'],
    estimatedTime: '20–25 min',
    htmlPath: '/lessons/water-cycle-journey.html',
    thumbnail: '/games/thumbnails/water-cycle-journey.jpg',
  },
  {
    slug: 'simple-machines-lab',
    title: 'Simple Machines Lab',
    subject: 'science',
    kind: 'activity',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Discover the six simple machines and how they make work easier.',
    skills: ['Simple Machines', 'Forces'],
    estimatedTime: '25–30 min',
    htmlPath: '/lessons/simple-machines-lab.html',
    thumbnail: '/games/thumbnails/simple-machines-lab.jpg',
  },

  // ── English ─────────────────────────────────────────────────────────────
  {
    slug: 'spelling-bee-challenge',
    title: 'Spelling Bee Challenge',
    subject: 'english',
    kind: 'activity',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Listen to each word, then spell your way to the top of the hive.',
    skills: ['Spelling', 'Vocabulary', 'Listening'],
    estimatedTime: '15–20 min',
    htmlPath: '/lessons/spelling-bee-challenge.html',
    thumbnail: '/games/thumbnails/spelling-bee-challenge.jpg',
    featured: true,
  },

  // ── History ─────────────────────────────────────────────────────────────
  {
    slug: 'seeds-of-genius',
    title: 'Seeds of Genius: George Washington Carver',
    subject: 'history',
    kind: 'game',
    grades: '3–7',
    difficulty: 'medium',
    description:
      'Explore a cozy town with George Washington Carver: observe, test soil, invent, help farmers and plan your own project.',
    skills: [
      'Black History',
      'Scientific Method',
      'Agriculture',
      'Problem Solving',
    ],
    estimatedTime: '45–60 min',
    htmlPath: '/games/seeds-of-genius/index.html',
    thumbnail: '/games/thumbnails/seeds-of-genius.jpg',
    featured: true,
  },
  {
    slug: 'ancient-egypt-explorer',
    title: 'Ancient Egypt Explorer',
    subject: 'history',
    kind: 'activity',
    grades: '3–5',
    difficulty: 'medium',
    description:
      'Travel back 5,000 years to explore pyramids, pharaohs and hieroglyphics.',
    skills: ['Ancient History', 'Egypt'],
    estimatedTime: '25–30 min',
    htmlPath: '/lessons/ancient-egypt-explorer.html',
    thumbnail: '/games/thumbnails/ancient-egypt-explorer.jpg',
    featured: true,
  },
];

/**
 * The homepage "Featured games" section, in order. The first game gets the
 * big spotlight card; the rest show as regular cards under it. To feature a
 * game, add its slug here (the content test checks that it exists).
 */
export const homeFeaturedSlugs: string[] = ['seeds-of-genius'];

export function getHomeFeaturedGames(): PlayableGame[] {
  return homeFeaturedSlugs
    .map((slug) => getGame(slug))
    .filter((game): game is PlayableGame => Boolean(game));
}

export function getGame(slug: string): PlayableGame | undefined {
  return games.find((game) => game.slug === slug);
}

export function getGamesBySubject(subject: SubjectId): PlayableGame[] {
  return games.filter((game) => game.subject === subject);
}

/** Featured items first, then the rest, capped at `limit`. */
export function getFeaturedGames(
  subject?: SubjectId,
  limit = 8
): PlayableGame[] {
  const pool = subject ? getGamesBySubject(subject) : games;
  return [
    ...pool.filter((game) => game.featured),
    ...pool.filter((game) => !game.featured),
  ].slice(0, limit);
}
