export interface Adventure {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'lesson';
  category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  estimatedTime: string;
  image?: string;
  featured?: boolean;
  htmlPath?: string;
  componentGame?: boolean; // True if this is a React component game
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
    id: 'sample-math-game',
    title: 'Math Challenge',
    description: 'Test your math skills with addition, subtraction, and multiplication!',
    type: 'game',
    category: 'math',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'easy',
    skills: ['Addition', 'Subtraction', 'Multiplication', 'Mental Math'],
    estimatedTime: '10 mins',
    featured: true,
    componentGame: true
  },
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
    id: 'volcano-explorer-lab',
    title: 'Volcano Explorer Lab',
    description: 'Interactive volcano exploration with eruption simulations and geological learning',
    type: 'lesson',
    category: 'science',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Earth Science', 'Volcanoes', 'Geology'],
    estimatedTime: '25-30 mins',
    featured: true,
    htmlPath: '/lessons/volcano-explorer-lab.html'
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
    id: 'ocean-conservation-heroes',
    title: 'Ocean Conservation Heroes',
    description: 'Dive deep and clean up ocean pollution while learning about marine ecosystems',
    type: 'game',
    category: 'science',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Marine Biology', 'Environmental Science', 'Conservation'],
    estimatedTime: '15-20 mins',
    featured: true,
    htmlPath: '/games/ocean-conservation-heroes.html'
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

// English Adventures Data
const englishLessons: Adventure[] = [
  {
    id: 'creative-writing-workshop',
    title: 'Creative Writing Workshop',
    description: 'Interactive story building with character development and plot creation tools',
    type: 'lesson',
    category: 'english',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Creative Writing', 'Storytelling', 'Character Development'],
    estimatedTime: '25-30 mins',
    featured: true
  },
  {
    id: 'grammar-detective',
    title: 'Grammar Detective',
    description: 'Solve mysteries by identifying and correcting grammar mistakes in clues',
    type: 'lesson',
    category: 'english',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Grammar', 'Sentence Structure', 'Detective Skills'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'poetry-playground',
    title: 'Poetry Playground',
    description: 'Create and explore different types of poems with rhyme and rhythm tools',
    type: 'lesson',
    category: 'english',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Poetry', 'Rhyme', 'Rhythm', 'Creative Expression'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'reading-comprehension-adventure',
    title: 'Reading Comprehension Adventure',
    description: 'Interactive stories with comprehension questions and vocabulary building',
    type: 'lesson',
    category: 'english',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'medium',
    skills: ['Reading Comprehension', 'Vocabulary', 'Critical Thinking'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'vocabulary-builder',
    title: 'Vocabulary Builder',
    description: 'Learn new words through context clues and interactive word games',
    type: 'lesson',
    category: 'english',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Vocabulary', 'Context Clues', 'Word Recognition'],
    estimatedTime: '15-20 mins'
  }
];

const englishGames: Adventure[] = [
  {
    id: 'word-wizard-quest',
    title: 'Word Wizard Quest',
    description: 'Cast spelling spells and build vocabulary to defeat the Confusion Dragon',
    type: 'game',
    category: 'english',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'medium',
    skills: ['Spelling', 'Vocabulary', 'Adventure'],
    estimatedTime: '15-20 mins',
    featured: true
  },
  {
    id: 'punctuation-pirates',
    title: 'Punctuation Pirates',
    description: 'Navigate the high seas while correctly placing punctuation marks',
    type: 'game',
    category: 'english',
    gradeLevel: ['2', '3', '4'],
    difficulty: 'easy',
    skills: ['Punctuation', 'Grammar', 'Adventure'],
    estimatedTime: '12-18 mins'
  },
  {
    id: 'rhyme-time-racing',
    title: 'Rhyme Time Racing',
    description: 'Race through word tracks by matching rhyming words and patterns',
    type: 'game',
    category: 'english',
    gradeLevel: ['1', '2', '3'],
    difficulty: 'easy',
    skills: ['Rhyming', 'Phonics', 'Word Recognition'],
    estimatedTime: '10-15 mins'
  },
  {
    id: 'story-building-blocks',
    title: 'Story Building Blocks',
    description: 'Construct engaging stories using interactive plot, character, and setting blocks',
    type: 'game',
    category: 'english',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Creative Writing', 'Story Structure', 'Imagination'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'synonym-shuffle',
    title: 'Synonym Shuffle',
    description: 'Fast-paced word matching game connecting synonyms and antonyms',
    type: 'game',
    category: 'english',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Synonyms', 'Antonyms', 'Vocabulary'],
    estimatedTime: '10-15 mins'
  }
];

// History Adventures Data
const historyLessons: Adventure[] = [
  {
    id: 'time-travel-museum',
    title: 'Time Travel Museum',
    description: 'Explore different historical periods through interactive museum exhibits',
    type: 'lesson',
    category: 'history',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Historical Timeline', 'Cultural Understanding', 'Chronology'],
    estimatedTime: '25-30 mins',
    featured: true
  },
  {
    id: 'ancient-civilizations-explorer',
    title: 'Ancient Civilizations Explorer',
    description: 'Discover Egypt, Greece, and Rome through virtual archaeological digs',
    type: 'lesson',
    category: 'history',
    gradeLevel: ['4', '5'],
    difficulty: 'medium',
    skills: ['Ancient History', 'Archaeology', 'Cultural Comparison'],
    estimatedTime: '30-35 mins'
  },
  {
    id: 'american-heroes-hall',
    title: 'American Heroes Hall',
    description: 'Learn about historical figures and their contributions to American history',
    type: 'lesson',
    category: 'history',
    gradeLevel: ['2', '3', '4', '5'],
    difficulty: 'easy',
    skills: ['American History', 'Biography', 'Historical Figures'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'world-landmarks-journey',
    title: 'World Landmarks Journey',
    description: 'Virtual tours of historical landmarks and their significance',
    type: 'lesson',
    category: 'history',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['World Geography', 'Cultural Heritage', 'Architecture'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'timeline-detective',
    title: 'Timeline Detective',
    description: 'Solve historical mysteries by placing events in chronological order',
    type: 'lesson',
    category: 'history',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Chronology', 'Cause and Effect', 'Historical Analysis'],
    estimatedTime: '20-25 mins'
  }
];

const historyGames: Adventure[] = [
  {
    id: 'civilization-builder',
    title: 'Civilization Builder',
    description: 'Build and manage ancient civilizations while learning historical concepts',
    type: 'game',
    category: 'history',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Strategy', 'Historical Understanding', 'Resource Management'],
    estimatedTime: '25-30 mins',
    featured: true
  },
  {
    id: 'historical-trivia-quest',
    title: 'Historical Trivia Quest',
    description: 'Adventure through time answering historical questions and challenges',
    type: 'game',
    category: 'history',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Historical Facts', 'Memory', 'Timeline Knowledge'],
    estimatedTime: '15-20 mins'
  },
  {
    id: 'pioneer-trail-adventure',
    title: 'Pioneer Trail Adventure',
    description: 'Experience westward expansion through interactive decision-making',
    type: 'game',
    category: 'history',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['American History', 'Decision Making', 'Historical Simulation'],
    estimatedTime: '20-25 mins'
  },
  {
    id: 'world-war-heroes',
    title: 'World War Heroes',
    description: 'Learn about courage and sacrifice through age-appropriate war stories',
    type: 'game',
    category: 'history',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['World History', 'Character Values', 'Historical Perspective'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'invention-timeline',
    title: 'Invention Timeline',
    description: 'Match inventions to their time periods and learn about innovation',
    type: 'game',
    category: 'history',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Innovation', 'Technology History', 'Timeline Skills'],
    estimatedTime: '15-20 mins'
  }
];

// Interdisciplinary Adventures Data
const interdisciplinaryLessons: Adventure[] = [
  {
    id: 'space-mission-control',
    title: 'Space Mission Control',
    description: 'Combine math, science, and teamwork to plan and execute space missions',
    type: 'lesson',
    category: 'interdisciplinary',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['STEM Integration', 'Problem Solving', 'Teamwork', 'Space Science'],
    estimatedTime: '35-40 mins',
    featured: true
  },
  {
    id: 'environmental-detective',
    title: 'Environmental Detective',
    description: 'Use science, math, and research skills to solve environmental challenges',
    type: 'lesson',
    category: 'interdisciplinary',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Environmental Science', 'Data Analysis', 'Research Skills'],
    estimatedTime: '30-35 mins'
  },
  {
    id: 'historical-math-mysteries',
    title: 'Historical Math Mysteries',
    description: 'Solve mathematical problems using historical contexts and ancient methods',
    type: 'lesson',
    category: 'interdisciplinary',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Mathematics', 'History', 'Cultural Math', 'Problem Solving'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'storytelling-with-data',
    title: 'Storytelling with Data',
    description: 'Create compelling narratives using charts, graphs, and statistical analysis',
    type: 'lesson',
    category: 'interdisciplinary',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Data Visualization', 'Storytelling', 'Statistics', 'Communication'],
    estimatedTime: '30-35 mins'
  },
  {
    id: 'design-thinking-lab',
    title: 'Design Thinking Lab',
    description: 'Apply creative problem-solving to real-world challenges across subjects',
    type: 'lesson',
    category: 'interdisciplinary',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Design Thinking', 'Creativity', 'Innovation', 'Problem Solving'],
    estimatedTime: '40-45 mins'
  }
];

const interdisciplinaryGames: Adventure[] = [
  {
    id: 'eco-city-simulator',
    title: 'Eco-City Simulator',
    description: 'Build sustainable cities using science, math, and social studies concepts',
    type: 'game',
    category: 'interdisciplinary',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Urban Planning', 'Environmental Science', 'Mathematics', 'Social Studies'],
    estimatedTime: '30-35 mins',
    featured: true
  },
  {
    id: 'time-traveler-scholar',
    title: 'Time Traveler Scholar',
    description: 'Travel through time solving problems that combine multiple academic subjects',
    type: 'game',
    category: 'interdisciplinary',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Cross-curricular', 'Critical Thinking', 'Historical Context', 'Problem Solving'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'museum-curator-challenge',
    title: 'Museum Curator Challenge',
    description: 'Curate museum exhibits combining art, history, science, and math',
    type: 'game',
    category: 'interdisciplinary',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: ['Art History', 'Research', 'Organization', 'Presentation'],
    estimatedTime: '25-30 mins'
  },
  {
    id: 'newspaper-editor-simulation',
    title: 'Newspaper Editor Simulation',
    description: 'Create news stories combining writing, current events, and data analysis',
    type: 'game',
    category: 'interdisciplinary',
    gradeLevel: ['4', '5'],
    difficulty: 'hard',
    skills: ['Journalism', 'Writing', 'Current Events', 'Media Literacy'],
    estimatedTime: '30-35 mins'
  },
  {
    id: 'invention-workshop',
    title: 'Invention Workshop',
    description: 'Invent solutions to problems using science, engineering, and creative thinking',
    type: 'game',
    category: 'interdisciplinary',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'hard',
    skills: ['Engineering', 'Innovation', 'Science', 'Creative Problem Solving'],
    estimatedTime: '35-40 mins'
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
  },
  {
    id: 'english',
    name: 'English Language Arts',
    description: 'Enhance reading, writing, and communication skills through interactive adventures',
    icon: 'academic',
    adventures: {
      lessons: englishLessons,
      games: englishGames
    }
  },
  {
    id: 'history',
    name: 'History Explorations',
    description: 'Journey through time and explore civilizations, cultures, and historical events',
    icon: 'academic',
    adventures: {
      lessons: historyLessons,
      games: historyGames
    }
  },
  {
    id: 'interdisciplinary',
    name: 'Interdisciplinary Learning',
    description: 'Cross-curricular adventures that combine multiple subjects for deeper understanding',
    icon: 'academic',
    adventures: {
      lessons: interdisciplinaryLessons,
      games: interdisciplinaryGames
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

// Preview-specific helper functions
export function getFeaturedAdventuresByCategory(categoryId: string, limit: number = 5): Adventure[] {
  const categoryAdventures = getAdventuresByCategory(categoryId);
  const featuredAdventures = categoryAdventures.filter(adventure => adventure.featured);

  // If we have enough featured adventures, return them
  if (featuredAdventures.length >= limit) {
    return featuredAdventures.slice(0, limit);
  }

  // Otherwise, supplement with non-featured adventures
  const nonFeaturedAdventures = categoryAdventures.filter(adventure => !adventure.featured);
  const supplementCount = limit - featuredAdventures.length;

  return [
    ...featuredAdventures,
    ...nonFeaturedAdventures.slice(0, supplementCount)
  ];
}

export function getPreviewAdventuresForAllCategories(limit: number = 5): Record<string, Adventure[]> {
  const categories = ['math', 'science', 'english', 'history', 'interdisciplinary'] as const;
  const previewData: Record<string, Adventure[]> = {};

  categories.forEach(categoryId => {
    previewData[categoryId] = getFeaturedAdventuresByCategory(categoryId, limit);
  });

  return previewData;
}

export function getCategoryMetadata() {
  return catalogData.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    totalAdventures: category.adventures.lessons.length + category.adventures.games.length,
    featuredAdventures: [...category.adventures.lessons, ...category.adventures.games]
      .filter(adventure => adventure.featured).length
  }));
}

// Get adventure by ID from all categories
export function getAdventureById(adventureId: string): Adventure | null {
  const allAdventures = getAllAdventures();
  return allAdventures.find(adventure => adventure.id === adventureId) || null;
}