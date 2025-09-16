export interface Adventure {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'lesson';
  category: 'math' | 'science';
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  estimatedTime: string;
  image?: string;
  featured?: boolean;
  htmlPath?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: string;
  adventures: {
    lessons: Adventure[];
    games: Adventure[];
  };
}

// Math Adventures Data
const mathLessons: Adventure[] = [
  {
    id: 'fraction-pizza-party',
    title: 'Virtual Fraction Pizza Party',
    description: 'Interactive pizza slicing to learn fractions with visual comparisons',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Fractions', 'Visual Math', 'Comparison'],
    estimatedTime: '15-20 mins',
    featured: true,
    htmlPath: '/lessons/fraction-pizza-party.html'
  },
  {
    id: 'number-line-adventure',
    title: 'Number Line Adventure',
    description: 'Animated character jumps along number line for addition and subtraction',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['1', '2', '3'],
    difficulty: 'easy',
    skills: ['Addition', 'Subtraction', 'Number Sense'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'shape-detective',
    title: 'Shape Detective',
    description: 'Interactive geometry exploration with drag-and-drop shape creation',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Geometry', 'Shapes', 'Measurement'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'money-counting-store',
    title: 'Money Counting Store',
    description: 'Virtual store with interactive cash register for money skills',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Money', 'Addition', 'Real-world Math'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'pattern-builder',
    title: 'Pattern Builder',
    description: 'Interactive pattern completion with shapes, colors, and numbers',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['K', '1', '2', '3'],
    difficulty: 'easy',
    skills: ['Patterns', 'Logic', 'Sequencing'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'multiplication-garden',
    title: 'Multiplication Garden',
    description: 'Plant flowers in arrays to visualize multiplication concepts',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Multiplication', 'Arrays', 'Visual Math'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'time-travel-clock',
    title: 'Time Travel Clock',
    description: 'Interactive analog and digital clock practice with story problems',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Time', 'Clock Reading', 'Problem Solving'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'measurement-laboratory',
    title: 'Measurement Laboratory',
    description: 'Virtual rulers, scales, and measuring tools for hands-on practice',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Measurement', 'Units', 'Comparison'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'data-detective',
    title: 'Data Detective',
    description: 'Interactive graph creation from data with multiple chart types',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Data Analysis', 'Graphs', 'Statistics'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'place-value-city',
    title: 'Place Value City',
    description: 'Interactive city where buildings represent place values',
    type: 'lesson',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Place Value', 'Number Sense', 'Base 10'],
    estimatedTime: '15-20 mins'
  }
];

const mathGames: Adventure[] = [
  {
    id: 'math-race-rally',
    title: 'Math Race Rally',
    description: 'Solve problems to move your race car forward in this exciting racing game',
    type: 'game',
    category: 'math',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Addition', 'Subtraction', 'Speed Math'],
    estimatedTime: '10-15 mins',
    featured: true,
    htmlPath: '/games/math-race-rally.html'
  },
  {
    id: 'number-monster-feeding',
    title: 'Number Monster Feeding',
    description: 'Feed hungry monsters the correct numbers in this adorable counting game',
    type: 'game',
    category: 'math',
    gradeLevel: ['K', '1', '2'],
    difficulty: 'easy',
    skills: ['Counting', 'Number Recognition', 'Addition'],
    estimatedTime: '8-12 mins'
  },
  {
    id: 'treasure-hunt-calculator',
    title: 'Treasure Hunt Calculator',
    description: 'Solve math problems to find buried treasure on an interactive map',
    type: 'game',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Problem Solving', 'Mixed Operations', 'Logic'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'pizza-fraction-frenzy',
    title: 'Pizza Fraction Frenzy',
    description: 'Fast-paced fraction ordering game serving pizza slices to customers',
    type: 'game',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Fractions', 'Time Pressure', 'Comparison'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'multiplication-bingo',
    title: 'Multiplication Bingo Bonanza',
    description: 'Interactive bingo with multiplication tables and multiple difficulty levels',
    type: 'game',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Multiplication', 'Memory', 'Speed'],
    estimatedTime: '12-18 mins'
  },
  {
    id: 'shape-sorting-arcade',
    title: 'Shape Sorting Arcade',
    description: 'Fast-paced shape sorting with power-ups and special effects',
    type: 'game',
    category: 'math',
    gradeLevel: ['K', '1', '2', '3'],
    difficulty: 'easy',
    skills: ['Geometry', 'Classification', 'Reaction Time'],
    estimatedTime: '8-12 mins'
  },
  {
    id: 'math-jeopardy-junior',
    title: 'Math Jeopardy Junior',
    description: 'Game show format with age-appropriate math categories and challenges',
    type: 'game',
    category: 'math',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Mixed Math', 'Strategy', 'Knowledge'],
    estimatedTime: '15-25 mins'
  },
  {
    id: 'number-line-ninja',
    title: 'Number Line Ninja',
    description: 'Jump character along number line while dodging obstacles',
    type: 'game',
    category: 'math',
    gradeLevel: ['1', '2', '3'],
    difficulty: 'medium',
    skills: ['Number Line', 'Addition', 'Coordination'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'equation-balance-scale',
    title: 'Equation Balance Scale',
    description: 'Visual representation of algebraic concepts with animated balance',
    type: 'game',
    category: 'math',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Algebra', 'Balance', 'Equations'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'counting-carnival',
    title: 'Counting Carnival',
    description: 'Carnival-themed mini-games practicing different counting skills',
    type: 'game',
    category: 'math',
    gradeLevel: ['K', '1', '2'],
    difficulty: 'easy',
    skills: ['Counting', 'Carnival Fun', 'Variety'],
    estimatedTime: '12-18 mins'
  },
  {
    id: 'geometry-builder-challenge',
    title: 'Geometry Builder Challenge',
    description: 'Build structures using geometric shapes with calculation constraints',
    type: 'game',
    category: 'math',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Geometry', 'Engineering', 'Problem Solving'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'money-market-madness',
    title: 'Money Market Madness',
    description: 'Buy and sell items with virtual money in different scenarios',
    type: 'game',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Money', 'Business', 'Real-world Math'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'time-attack-clock',
    title: 'Time Attack Clock',
    description: 'Race against the clock to solve time-related problems',
    type: 'game',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Time', 'Speed', 'Clock Reading'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'math-memory-match',
    title: 'Math Memory Match',
    description: 'Match math problems with answers in this memory challenge',
    type: 'game',
    category: 'math',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Memory', 'Problem Solving', 'Matching'],
    estimatedTime: '8-12 mins'
  }
];

// Science Adventures Data
const scienceLessons: Adventure[] = [
  {
    id: 'plant-growth-lab',
    title: 'Virtual Plant Growth Lab',
    description: 'Interactive plant growing simulation with environmental controls',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Biology', 'Plant Science', 'Scientific Method'],
    estimatedTime: '20-25 mins',
    featured: true
  },
  {
    id: 'weather-station-simulator',
    title: 'Weather Station Simulator',
    description: 'Track and predict weather with interactive meteorology tools',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Weather', 'Data Collection', 'Prediction'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'animal-habitat-explorer',
    title: 'Animal Habitat Explorer',
    description: 'Clickable world map exploring ecosystems and animal adaptations',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Ecology', 'Animals', 'Habitats'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'states-of-matter-kitchen',
    title: 'States of Matter Kitchen',
    description: 'Interactive cooking simulation exploring solid, liquid, and gas',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Chemistry', 'States of Matter', 'Cooking'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'solar-system-journey',
    title: 'Solar System Journey',
    description: 'Interactive space exploration comparing planets and features',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Astronomy', 'Space', 'Comparison'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'human-body-adventure',
    title: 'Human Body Adventure',
    description: 'Explore body systems with interactive organ functions',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'medium',
    skills: ['Human Biology', 'Body Systems', 'Health'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'rock-cycle-simulator',
    title: 'Rock Cycle Simulator',
    description: 'Interactive geological processes with heat and pressure controls',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Geology', 'Earth Science', 'Processes'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'simple-machines-workshop',
    title: 'Simple Machines Workshop',
    description: 'Build and experiment with levers, pulleys, and inclined planes',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Physics', 'Engineering', 'Machines'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'ecosystem-balance-game',
    title: 'Ecosystem Balance',
    description: 'Interactive food web construction and species relationships',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Ecology', 'Food Webs', 'Balance'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'light-shadow-laboratory',
    title: 'Light and Shadow Laboratory',
    description: 'Manipulate light sources to explore shadows and reflections',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Physics', 'Light', 'Optics'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'magnet-explorer',
    title: 'Magnet Explorer',
    description: 'Visualize magnetic fields and test material magnetism',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Physics', 'Magnetism', 'Materials'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'sound-wave-studio',
    title: 'Sound Wave Studio',
    description: 'Create and visualize sound waves from different instruments',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Physics', 'Sound', 'Music'],
    estimatedTime: '20-25 mins'
  }
];

const scienceGames: Adventure[] = [
  {
    id: 'planet-explorer-quest',
    title: 'Planet Explorer Quest',
    description: 'Navigate spaceship through solar system answering planet facts',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Astronomy', 'Space Facts', 'Navigation'],
    estimatedTime: '15-20 mins',
    featured: true
  },
  {
    id: 'animal-kingdom-match',
    title: 'Animal Kingdom Match',
    description: 'Match animals to habitats with time challenges and fun sounds',
    type: 'game',
    category: 'science',
    gradeLevel: ['1', '2', '3', '4'],
    difficulty: 'easy',
    skills: ['Animals', 'Habitats', 'Speed'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'weather-wizard-battle',
    title: 'Weather Wizard Battle',
    description: 'Control weather elements to solve puzzles and help the world',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Weather', 'Problem Solving', 'Strategy'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'body-system-heroes',
    title: 'Body System Heroes',
    description: 'Control tiny heroes inside the human body fighting germs',
    type: 'game',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Human Biology', 'Health', 'Adventure'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'ecosystem-building-tycoon',
    title: 'Ecosystem Building Tycoon',
    description: 'Build and balance virtual ecosystems with environmental challenges',
    type: 'game',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Ecology', 'Management', 'Strategy'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'states-of-matter-mixer',
    title: 'States of Matter Mixer',
    description: 'Transform materials between states with cooking-themed challenges',
    type: 'game',
    category: 'science',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Chemistry', 'States of Matter', 'Cooking'],
    estimatedTime: '12-18 mins'
  },
  {
    id: 'fossil-dig-adventure',
    title: 'Fossil Dig Adventure',
    description: 'Archaeological excavation game uncovering dinosaur mysteries',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Paleontology', 'Archaeology', 'History'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'magnet-power-puzzle',
    title: 'Magnet Power Puzzle',
    description: 'Use magnetic forces to solve increasingly complex puzzles',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Physics', 'Magnetism', 'Problem Solving'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'light-laboratory-escape',
    title: 'Light Laboratory Escape',
    description: 'Use mirrors and prisms in an escape room with science clues',
    type: 'game',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Physics', 'Optics', 'Logic'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'plant-growing-championship',
    title: 'Plant Growing Championship',
    description: 'Competition to grow the healthiest plants with different species',
    type: 'game',
    category: 'science',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Biology', 'Competition', 'Plant Care'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'rock-cycle-racing',
    title: 'Rock Cycle Racing',
    description: 'Race rocks through geological processes and transformations',
    type: 'game',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Geology', 'Earth Science', 'Racing'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'sound-wave-surfer',
    title: 'Sound Wave Surfer',
    description: 'Ride sound waves through environments with music creation',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Physics', 'Sound', 'Music'],
    estimatedTime: '12-18 mins'
  },
  {
    id: 'ocean-depth-diver',
    title: 'Ocean Depth Diver',
    description: 'Dive to different ocean layers discovering marine life',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Marine Biology', 'Ocean Science', 'Exploration'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'simple-machines-construction',
    title: 'Simple Machines Construction',
    description: 'Build contraptions using physics and engineering challenges',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Engineering', 'Physics', 'Construction'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'pollution-solution-squad',
    title: 'Pollution Solution Squad',
    description: 'Clean up virtual environments and restore ecosystems',
    type: 'game',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Environmental Science', 'Conservation', 'Action'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'crystal-cave-chemistry',
    title: 'Crystal Cave Chemistry',
    description: 'Mix virtual chemicals to create crystals and learn reactions',
    type: 'game',
    category: 'science',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Chemistry', 'Crystals', 'Experiments'],
    estimatedTime: '18-25 mins'
  }
];

// Combined catalog data
export const catalogData: CategoryData[] = [
  {
    id: 'math',
    name: 'Math Adventures',
    description: 'Interactive mathematical learning experiences that make numbers fun and engaging',
    icon: 'academic',
    adventures: {
      lessons: mathLessons,
      games: mathGames
    }
  },
  {
    id: 'science',
    name: 'Science Explorations',
    description: 'Discover the wonders of science through hands-on experiments and exploration',
    icon: 'academic',
    adventures: {
      lessons: scienceLessons,
      games: scienceGames
    }
  }
];

// Helper functions
export function getAllAdventures(): Adventure[] {
  return catalogData.flatMap(category => [
    ...category.adventures.lessons,
    ...category.adventures.games
  ]);
}

export function getFeaturedAdventures(): Adventure[] {
  return getAllAdventures().filter(adventure => adventure.featured);
}

export function getAdventuresByCategory(categoryId: string): Adventure[] {
  const category = catalogData.find(cat => cat.id === categoryId);
  return category ? [
    ...category.adventures.lessons,
    ...category.adventures.games
  ] : [];
}

export function getAdventuresByType(type: 'game' | 'lesson'): Adventure[] {
  return getAllAdventures().filter(adventure => adventure.type === type);
}

export function filterAdventures(
  adventures: Adventure[],
  filters: {
    gradeLevel?: string;
    difficulty?: string;
    type?: string;
    category?: string;
  }
): Adventure[] {
  return adventures.filter(adventure => {
    if (filters.gradeLevel && !adventure.gradeLevel.includes(filters.gradeLevel)) {
      return false;
    }
    if (filters.difficulty && adventure.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.type && adventure.type !== filters.type) {
      return false;
    }
    if (filters.category && adventure.category !== filters.category) {
      return false;
    }
    return true;
  });
}