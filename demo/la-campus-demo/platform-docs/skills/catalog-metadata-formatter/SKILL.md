# Catalog Metadata Formatter Skill

## 🎯 Purpose
Generate correctly formatted metadata entries for the Learning Adventures platform catalog. This skill ensures all educational content is properly registered with complete, valid metadata that enables discovery, filtering, and platform integration.

## 📚 When to Use This Skill
- Adding new games or lessons to the catalog
- Updating existing catalog entries
- Validating metadata completeness
- Ensuring catalog consistency across all content

## 📋 Catalog Data Structure

### Location
```
/learning-adventures-app/lib/catalogData.ts
```

### Organization
```typescript
// Catalog is organized by subject and type:
export const mathGames: Adventure[] = [...];
export const mathLessons: Adventure[] = [...];
export const scienceGames: Adventure[] = [...];
export const scienceLessons: Adventure[] = [...];
export const englishGames: Adventure[] = [...];
export const englishLessons: Adventure[] = [...];
export const historyGames: Adventure[] = [...];
export const historyLessons: Adventure[] = [...];
export const interdisciplinaryGames: Adventure[] = [...];

// Combined for easy access
export const allAdventures: Adventure[] = [
  ...mathGames,
  ...mathLessons,
  ...scienceGames,
  ...scienceLessons,
  ...englishGames,
  ...englishLessons,
  ...historyGames,
  ...historyLessons,
  ...interdisciplinaryGames
];
```

## 🏗️ Metadata Schema

### Complete TypeScript Interface
```typescript
interface Adventure {
  // ============================================
  // REQUIRED FIELDS (All content must have these)
  // ============================================
  id: string;                    // Unique identifier (URL-safe)
  title: string;                 // Display name
  description: string;           // Brief description (1-2 sentences)
  type: 'game' | 'lesson';      // Content type
  category: Category;            // Subject category
  gradeLevel: string[];         // Target grades (array)
  difficulty: Difficulty;        // Difficulty level
  skills: string[];             // Skills taught/practiced (array)
  estimatedTime: string;        // Time to complete

  // ============================================
  // CONDITIONAL FIELDS (Depends on content type)
  // ============================================
  htmlPath?: string;            // For HTML content ONLY
  componentGame?: boolean;      // For React components ONLY
  
  // ============================================
  // OPTIONAL FIELDS (Enhance discoverability)
  // ============================================
  featured?: boolean;           // Featured on homepage (default: false)
  prerequisites?: string[];     // Required prior knowledge
  learningObjectives?: string[]; // Explicit learning goals
}

// Type definitions
type Category = 
  | 'math' 
  | 'science' 
  | 'english' 
  | 'history' 
  | 'interdisciplinary';

type Difficulty = 'easy' | 'medium' | 'hard';
```

## 📝 Metadata Templates

### Template 1: HTML Math Game
```typescript
{
  id: 'multiplication-master',              // Must be unique, URL-safe
  title: 'Multiplication Master',           // Display name
  description: 'Practice multiplication facts with fast-paced challenges. Answer correctly to earn points and level up!',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4'],                   // Array of grade strings
  difficulty: 'medium',
  skills: ['Multiplication', 'Mental Math', 'Number Sense'],
  estimatedTime: '10 mins',
  featured: true,                           // Optional: show on homepage
  htmlPath: '/games/multiplication-master.html'  // Required for HTML
  // NO componentGame field for HTML content
}
```

### Template 2: React Component Science Game
```typescript
{
  id: 'ecosystem-balance',
  title: 'Ecosystem Balance',
  description: 'Build and maintain balanced ecosystems. Learn about food chains, populations, and environmental factors.',
  type: 'game',
  category: 'science',
  gradeLevel: ['4', '5', '6'],
  difficulty: 'hard',
  skills: ['Ecosystems', 'Food Chains', 'Population Dynamics', 'Systems Thinking'],
  estimatedTime: '15 mins',
  featured: false,
  componentGame: true,                      // Required for React
  // NO htmlPath field for React components
  learningObjectives: [                     // Optional but recommended
    'Understand producer-consumer-decomposer relationships',
    'Analyze how population changes affect ecosystems',
    'Apply systems thinking to environmental problems'
  ]
}
```

### Template 3: HTML Math Lesson
```typescript
{
  id: 'fractions-introduction',
  title: 'Introduction to Fractions',
  description: 'Learn the basics of fractions through interactive examples and visual representations.',
  type: 'lesson',
  category: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'easy',
  skills: ['Fractions', 'Visual Math', 'Number Sense'],
  estimatedTime: '20 mins',
  featured: true,
  htmlPath: '/lessons/fractions-introduction.html',
  learningObjectives: [
    'Understand that fractions represent parts of a whole',
    'Identify numerator and denominator',
    'Compare simple fractions visually'
  ],
  prerequisites: ['Basic counting', 'Number recognition']
}
```

### Template 4: React English Game
```typescript
{
  id: 'story-builder',
  title: 'Story Builder',
  description: 'Create engaging stories by selecting plot elements, characters, and settings. Practice narrative writing skills.',
  type: 'game',
  category: 'english',
  gradeLevel: ['4', '5', '6'],
  difficulty: 'medium',
  skills: ['Creative Writing', 'Story Elements', 'Narrative Structure', 'Vocabulary'],
  estimatedTime: '20 mins',
  featured: true,
  componentGame: true,
  learningObjectives: [
    'Identify key story elements (plot, character, setting)',
    'Create coherent narratives with beginning, middle, and end',
    'Use descriptive language effectively'
  ]
}
```

### Template 5: HTML History Lesson
```typescript
{
  id: 'ancient-egypt-civilization',
  title: 'Ancient Egypt Civilization',
  description: 'Explore ancient Egyptian culture, pyramids, hieroglyphics, and daily life through interactive content.',
  type: 'lesson',
  category: 'history',
  gradeLevel: ['5', '6'],
  difficulty: 'medium',
  skills: ['Ancient Civilizations', 'Historical Analysis', 'Cultural Understanding'],
  estimatedTime: '25 mins',
  featured: false,
  htmlPath: '/lessons/ancient-egypt-civilization.html',
  learningObjectives: [
    'Understand the geography and timeline of Ancient Egypt',
    'Identify key achievements and innovations',
    'Analyze the role of the Nile River in Egyptian civilization'
  ],
  prerequisites: ['Basic geography', 'Timeline understanding']
}
```

### Template 6: Interdisciplinary Game
```typescript
{
  id: 'climate-quest',
  title: 'Climate Quest',
  description: 'Use math and science to solve climate challenges. Analyze data, make predictions, and implement solutions.',
  type: 'game',
  category: 'interdisciplinary',
  gradeLevel: ['5', '6'],
  difficulty: 'hard',
  skills: [
    'Data Analysis',
    'Scientific Method',
    'Problem Solving',
    'Environmental Science',
    'Math Applications',
    'Critical Thinking'
  ],
  estimatedTime: '25 mins',
  featured: true,
  componentGame: true,
  learningObjectives: [
    'Analyze climate data using graphs and statistics',
    'Make predictions based on data patterns',
    'Understand cause and effect in environmental systems',
    'Apply mathematical concepts to real-world problems'
  ],
  prerequisites: [
    'Basic graphing skills',
    'Understanding of weather vs climate',
    'Simple data analysis'
  ]
}
```

## ✅ Validation Rules

### ID Validation
```typescript
// RULES:
// - Only lowercase letters, numbers, and hyphens
// - No spaces or special characters
// - Maximum 50 characters
// - Must be unique across entire catalog

// ✓ GOOD EXAMPLES:
'multiplication-master'
'fraction-pizza-party'
'ecosystem-balance-v2'
'ancient-egypt'
'story-builder-pro'

// ✗ BAD EXAMPLES:
'Multiplication Master'     // No uppercase letters
'multiplication_master'     // No underscores
'multiplication master'     // No spaces
'multiplication-master!'    // No special characters
'this-is-a-very-long-game-name-that-exceeds-the-maximum-character-limit'  // Too long
```

### Category Validation
```typescript
const validCategories = [
  'math',                 // Mathematics content
  'science',              // Science content
  'english',              // Language arts content
  'history',              // Social studies/history content
  'interdisciplinary'     // Cross-subject content
] as const;

// Each entry must use EXACTLY ONE of these categories
// Choose the PRIMARY subject if content spans multiple areas
```

### Grade Level Validation
```typescript
const validGradeLevels = ['K', '1', '2', '3', '4', '5', '6'] as const;

// RULES:
// - Must be an array (not a single value)
// - Must contain at least one grade
// - Can contain multiple grades for grade ranges
// - Use STRING values, not numbers
// - Use 'K' for kindergarten

// ✓ GOOD EXAMPLES:
['3']                      // Single grade (3rd grade only)
['3', '4', '5']           // Grade range (3rd-5th grade)
['K', '1']                // Including kindergarten
['4', '5', '6']           // Upper elementary

// ✗ BAD EXAMPLES:
[]                        // Empty array not allowed
[3, 4, 5]                 // Numbers not strings
['third', 'fourth']       // Use numeric format
'3'                       // Must be array, not string
```

### Difficulty Validation
```typescript
const validDifficulties = ['easy', 'medium', 'hard'] as const;

// GUIDELINES FOR SELECTION:

// 'easy': 
// - Introductory level
// - Minimal prerequisites required
// - Clear, simple instructions
// - Gentle learning curve
// - Appropriate for beginning students

// 'medium':
// - Standard level
// - Some prior knowledge assumed
// - More complex interactions
// - Balanced challenge
// - Most common difficulty level

// 'hard':
// - Advanced level
// - Significant prerequisites
// - Complex problem-solving required
// - Multiple concepts integrated
// - For experienced students
```

### Skills Array Validation
```typescript
// RULES:
// - Must contain at least one skill
// - Skills should be in Title Case
// - Be specific and descriptive
// - Maximum 6 skills per entry recommended
// - Use established skill names when possible

// ✓ GOOD EXAMPLES:
['Addition', 'Subtraction', 'Problem Solving']
['Photosynthesis', 'Plant Biology', 'Scientific Method']
['Creative Writing', 'Narrative Structure', 'Vocabulary']
['Ancient Civilizations', 'Historical Analysis']

// ✗ BAD EXAMPLES:
[]                                    // Empty array
['math']                              // Too vague
['addition', 'subtraction']           // Not capitalized
['Addition', 'Subtraction', 'Math', 'Numbers', 'Counting', 'Problem Solving', 'Mental Math']  // Too many
```

### Estimated Time Validation
```typescript
// FORMAT: "XX mins" or "XX-YY mins"

// ✓ GOOD EXAMPLES:
'5 mins'                  // Very short activity
'10 mins'                 // Short game
'15 mins'                 // Standard game length
'20 mins'                 // Longer lesson
'10-15 mins'              // Variable time range
'20-30 mins'              // Extended lesson

// ✗ BAD EXAMPLES:
'10 minutes'              // Use 'mins' not 'minutes'
'10'                      // Must include unit
'15 min'                  // Use 'mins' (plural)
'quarter hour'            // Use numeric format
'10-15'                   // Missing unit
```

### Description Validation
```typescript
// RULES:
// - Keep to 1-2 sentences
// - Clearly state what students will do
// - Mention key learning focus
// - Use active, engaging language
// - Maximum ~200 characters

// ✓ GOOD EXAMPLES:
'Practice multiplication facts with fast-paced challenges. Answer correctly to earn points and level up!'

'Build and maintain balanced ecosystems. Learn about food chains, populations, and environmental factors.'

'Explore ancient Egyptian culture, pyramids, and hieroglyphics through interactive content.'

// ✗ BAD EXAMPLES:
'Math game.'  // Too short, not descriptive

'This is a really fun and engaging educational game where students will practice their multiplication skills by answering questions and they can earn points and badges and unlock new levels and there are different difficulty settings and...'  // Too long, run-on

'Game about math.'  // Vague, not engaging
```

### Content Type Validation
```typescript
// HTML Content Requirements:
{
  htmlPath: '/games/game-name.html',    // REQUIRED for HTML
  componentGame: false                   // Optional (or omit entirely)
}

// React Component Requirements:
{
  componentGame: true,                   // REQUIRED for React
  // htmlPath must NOT be present
}

// CRITICAL RULES:
// 1. HTML games MUST have htmlPath
// 2. React games MUST have componentGame: true
// 3. React games MUST NOT have htmlPath
// 4. Cannot have both htmlPath AND componentGame: true
```

## 📚 Subject-Specific Guidelines

### Math Content

**Common Skills for Math**:
- Number Sense, Counting, Place Value
- Addition, Subtraction, Multiplication, Division
- Fractions, Decimals, Percentages, Ratios
- Geometry, Measurement, Spatial Reasoning
- Data Analysis, Probability, Statistics
- Problem Solving, Mental Math, Patterns
- Algebraic Thinking, Equations

**Grade Level Alignment**:
- **K-2**: Counting, basic addition/subtraction, shapes, measurement basics
- **3-4**: Multiplication/division, fractions, area/perimeter, data graphs
- **5-6**: Decimals, percentages, ratios, volume, pre-algebra concepts

**Estimated Time Guidelines**:
- Practice games: 10-15 mins
- Concept lessons: 15-20 mins
- Problem-solving activities: 20-25 mins

### Science Content

**Common Skills for Science**:
- Scientific Method, Observation, Hypothesis Testing
- Life Science, Physical Science, Earth Science
- Ecosystems, Food Chains, Habitats, Adaptation
- Matter, Energy, Forces, Motion
- Weather, Climate, Space, Astronomy
- Plants, Animals, Human Body
- Simple Machines, Engineering Design

**Grade Level Alignment**:
- **K-2**: Animals, plants, weather, senses, basic materials
- **3-4**: Ecosystems, states of matter, simple machines, rocks
- **5-6**: Systems thinking, energy transfer, astronomy, chemistry basics

**Estimated Time Guidelines**:
- Exploration activities: 15-20 mins
- Simulation games: 20-25 mins
- Investigation lessons: 25-30 mins

### English/Language Arts Content

**Common Skills for English**:
- Reading Comprehension, Vocabulary Building
- Grammar, Punctuation, Spelling
- Story Elements, Narrative Structure
- Creative Writing, Descriptive Writing
- Parts of Speech, Sentence Structure
- Literary Analysis, Theme Identification
- Main Idea, Supporting Details

**Grade Level Alignment**:
- **K-2**: Phonics, sight words, basic sentences, story sequencing
- **3-4**: Paragraph writing, comprehension strategies, grammar rules
- **5-6**: Essay writing, literary devices, complex sentences

**Estimated Time Guidelines**:
- Vocabulary games: 10-15 mins
- Writing activities: 20-25 mins
- Reading comprehension: 15-20 mins

### History/Social Studies Content

**Common Skills for History**:
- Historical Analysis, Timeline Skills
- Cultural Understanding, Geography
- Cause and Effect, Context Analysis
- Primary Sources, Evidence Evaluation
- Chronological Thinking, Perspective Taking
- Civic Understanding, Government Basics

**Grade Level Alignment**:
- **K-2**: Community, holidays, basic timelines, maps
- **3-4**: State history, American history basics, geography
- **5-6**: World history, government, economics, global cultures

**Estimated Time Guidelines**:
- Timeline activities: 15-20 mins
- Cultural exploration: 20-25 mins
- Historical simulations: 25-30 mins

### Interdisciplinary Content

**When to Use Interdisciplinary**:
- Content equally spans multiple subjects
- Real-world problem-solving requiring multiple disciplines
- STEM/STEAM activities
- Project-based learning

**Common Skill Combinations**:
- Math + Science: Data analysis, measurement, modeling
- Science + English: Research, report writing, explanation
- History + Geography: Cultural studies, exploration
- Math + Art: Geometry, patterns, design

## 🔧 Target Array Mapping

### Determine Correct Array
```typescript
function getTargetArray(category: string, type: string): string {
  const arrayMap = {
    'math-game': 'mathGames',
    'math-lesson': 'mathLessons',
    'science-game': 'scienceGames',
    'science-lesson': 'scienceLessons',
    'english-game': 'englishGames',
    'english-lesson': 'englishLessons',
    'history-game': 'historyGames',
    'history-lesson': 'historyLessons',
    'interdisciplinary-game': 'interdisciplinaryGames'
    // Note: No interdisciplinaryLessons array currently
  };

  const key = `${category}-${type}`;
  return arrayMap[key] || '';
}
```

### Array Locations in catalogData.ts
```typescript
// Math content (lines ~20-100)
export const mathGames: Adventure[] = [ /* ... */ ];
export const mathLessons: Adventure[] = [ /* ... */ ];

// Science content (lines ~100-180)
export const scienceGames: Adventure[] = [ /* ... */ ];
export const scienceLessons: Adventure[] = [ /* ... */ ];

// English content (lines ~180-230)
export const englishGames: Adventure[] = [ /* ... */ ];
export const englishLessons: Adventure[] = [ /* ... */ ];

// History content (lines ~230-270)
export const historyGames: Adventure[] = [ /* ... */ ];
export const historyLessons: Adventure[] = [ /* ... */ ];

// Interdisciplinary (lines ~270-290)
export const interdisciplinaryGames: Adventure[] = [ /* ... */ ];
```

## 💡 Complete Examples

### Example 1: Converting Game Spec to Metadata

**Input Game Specification**:
```javascript
{
  filename: 'fraction-pizza.html',
  name: 'Fraction Pizza Party',
  subject: 'math',
  grades: [3, 4],
  isGame: true,
  theme: 'fractions'
}
```

**Generated Metadata**:
```typescript
{
  id: 'fraction-pizza-party',                    // Generated from filename
  title: 'Fraction Pizza Party',                 // From name
  description: 'Slice and serve pizzas to practice fractions. Match customer orders with correct pizza fractions!',  // Created
  type: 'game',                                   // From isGame
  category: 'math',                               // From subject
  gradeLevel: ['3', '4'],                        // Converted from grades
  difficulty: 'medium',                          // Assessed
  skills: ['Fractions', 'Visual Math', 'Problem Solving'],  // From theme + subject
  estimatedTime: '15 mins',                      // Standard for games
  featured: true,                                // Assessed (fraction games popular)
  htmlPath: '/games/fraction-pizza-party.html'  // From filename
}

// Target array: mathGames
```

### Example 2: Complex React Component

**Input Specification**:
```javascript
{
  componentName: 'EcosystemBuilder',
  subject: 'science',
  grades: [4, 5, 6],
  isReactComponent: true,
  complexity: 'high',
  learningGoals: [
    'Understand food webs',
    'Balance ecosystems',
    'Analyze populations'
  ]
}
```

**Generated Metadata**:
```typescript
{
  id: 'ecosystem-builder',
  title: 'Ecosystem Builder',
  description: 'Create balanced ecosystems by managing producers, consumers, and decomposers. Learn about energy flow and population dynamics.',
  type: 'game',
  category: 'science',
  gradeLevel: ['4', '5', '6'],
  difficulty: 'hard',                           // From complexity: 'high'
  skills: [
    'Ecosystems',
    'Food Chains',
    'Energy Flow',
    'Population Dynamics',
    'Systems Thinking'
  ],
  estimatedTime: '20 mins',                     // Longer for complex games
  featured: true,
  componentGame: true,                          // From isReactComponent
  learningObjectives: [                         // From learningGoals
    'Understand producer-consumer-decomposer relationships',
    'Analyze how population changes affect ecosystems',
    'Apply systems thinking to environmental problems'
  ],
  prerequisites: [
    'Basic understanding of food chains',
    'Knowledge of plant and animal needs'
  ]
}

// Target array: scienceGames
```

## 🚀 Integration Workflow

### Complete Step-by-Step Process

**Step 1: Gather Information**
```typescript
// Collect all required data:
const contentInfo = {
  filename: 'addition-race.html',              // or component name
  displayName: 'Addition Race',
  whatItDoes: 'Practice adding numbers 1-10',
  subject: 'math',
  targetGrades: [1, 2],
  isGame: true,
  isReact: false,
  estimatedDuration: 10
};
```

**Step 2: Generate ID**
```typescript
// Convert filename or title to valid ID
function generateId(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\.html$/, '')                    // Remove .html
    .replace(/[^a-z0-9-]/g, '-')              // Replace invalid chars
    .replace(/-+/g, '-')                      // Remove duplicate hyphens
    .replace(/^-|-$/g, '');                   // Remove leading/trailing hyphens
}

const id = generateId(contentInfo.filename);  // 'addition-race'
```

**Step 3: Create Metadata Object**
```typescript
const metadata: Adventure = {
  id: generateId(contentInfo.filename),
  title: contentInfo.displayName,
  description: `Practice adding numbers 1-10 in this fast-paced game. Race to solve addition problems!`,
  type: contentInfo.isGame ? 'game' : 'lesson',
  category: contentInfo.subject,
  gradeLevel: contentInfo.targetGrades.map(String),  // Convert to strings
  difficulty: assessDifficulty(contentInfo),          // Function to determine
  skills: generateSkills(contentInfo),                // Function to generate
  estimatedTime: `${contentInfo.estimatedDuration} mins`,
  featured: false,
  ...(contentInfo.isReact 
    ? { componentGame: true }
    : { htmlPath: `/games/${contentInfo.filename}` }
  )
};
```

**Step 4: Validate Metadata**
```typescript
function validateMetadata(metadata: Adventure): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field checks
  if (!metadata.id) errors.push('Missing: id');
  if (!metadata.title) errors.push('Missing: title');
  if (!metadata.description) errors.push('Missing: description');
  if (!metadata.type) errors.push('Missing: type');
  if (!metadata.category) errors.push('Missing: category');
  if (!metadata.gradeLevel?.length) errors.push('Missing: gradeLevel');
  if (!metadata.difficulty) errors.push('Missing: difficulty');
  if (!metadata.skills?.length) errors.push('Missing: skills');
  if (!metadata.estimatedTime) errors.push('Missing: estimatedTime');

  // Format checks
  if (metadata.id && !/^[a-z0-9-]+$/.test(metadata.id)) {
    errors.push('Invalid ID format');
  }

  // Content type checks
  if (metadata.componentGame && metadata.htmlPath) {
    errors.push('React components should not have htmlPath');
  }
  if (!metadata.componentGame && !metadata.htmlPath) {
    errors.push('HTML content must have htmlPath');
  }

  return { valid: errors.length === 0, errors };
}

const validation = validateMetadata(metadata);
if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
  // Fix errors before proceeding
}
```

**Step 5: Determine Target Array**
```typescript
const targetArray = getTargetArray(metadata.category, metadata.type);
console.log(`Add to: ${targetArray}`);  // e.g., 'mathGames'
```

**Step 6: Format for catalogData.ts**
```typescript
function formatForCatalog(metadata: Adventure): string {
  return `  {
    id: '${metadata.id}',
    title: '${metadata.title}',
    description: '${metadata.description}',
    type: '${metadata.type}',
    category: '${metadata.category}',
    gradeLevel: [${metadata.gradeLevel.map(g => `'${g}'`).join(', ')}],
    difficulty: '${metadata.difficulty}',
    skills: [${metadata.skills.map(s => `'${s}'`).join(', ')}],
    estimatedTime: '${metadata.estimatedTime}',
    featured: ${metadata.featured || false},${
      metadata.htmlPath ? `\n    htmlPath: '${metadata.htmlPath}'` : ''
    }${
      metadata.componentGame ? `\n    componentGame: true` : ''
    }
  },`;
}

console.log(formatForCatalog(metadata));
```

## ✅ Final Pre-Integration Checklist

Before adding metadata to catalogData.ts, verify:

### Required Fields
- [ ] `id` is unique and URL-safe (lowercase, numbers, hyphens only)
- [ ] `title` is clear and descriptive
- [ ] `description` is 1-2 sentences, engaging
- [ ] `type` is either 'game' or 'lesson'
- [ ] `category` is valid (math/science/english/history/interdisciplinary)
- [ ] `gradeLevel` is array of strings, not empty
- [ ] `difficulty` is 'easy', 'medium', or 'hard'
- [ ] `skills` array is not empty, uses Title Case
- [ ] `estimatedTime` follows format (e.g., "15 mins")

### Content Type Fields
- [ ] HTML: Has `htmlPath`, no `componentGame`
- [ ] React: Has `componentGame: true`, no `htmlPath`
- [ ] File exists at specified path

### Optional Enhancement Fields
- [ ] `featured` set appropriately (true for standout content)
- [ ] `learningObjectives` added if complex content
- [ ] `prerequisites` listed if advanced content

### Integration
- [ ] Target array determined correctly
- [ ] No duplicate ID in catalog
- [ ] Metadata properly formatted
- [ ] Ready to add to catalogData.ts

---

**Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: Learning Adventures Platform Team