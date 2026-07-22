# Catalog Integration Agent

## 🎯 Purpose
Automate the process of integrating new educational content into the Learning Adventures platform catalog, ensuring proper metadata formatting, file placement validation, and seamless discovery by students. This agent bridges the gap between content creation and platform deployment.

## 🤖 Agent Overview
**Name**: Catalog Integration Agent
**Type**: Integration & Deployment Assistant
**Primary Function**: Validate, format, and integrate content into catalog
**Integration Point**: Post-development, pre-production phase

---

## 🔧 Skill Integration Protocol

**CRITICAL**: Before performing ANY catalog integration task, you MUST read the catalog-metadata-formatter skill.

### Required Skills for This Agent:
- **PRIMARY**: `docs/skills/catalog-metadata-formatter/SKILL.md`

### Execution Protocol:
1. **READ** the catalog-metadata-formatter skill file
2. **UNDERSTAND** the complete metadata schema and validation rules
3. **APPLY** the formatting patterns to create catalog entries
4. **VALIDATE** metadata against schema (required fields, data types, etc.)
5. **RETURN** properly formatted, compliant catalog entries

### Example Workflow:
```
User: "Add this game to the catalog"

Agent Process:
1. Read docs/skills/catalog-metadata-formatter/SKILL.md
2. Extract game metadata (title, description, subject, grade, etc.)
3. Format according to skill's schema
4. Validate all required fields are present
5. Map to correct target array (mathGames, scienceGames, etc.)
6. Return ready-to-integrate catalog entry
```

### Validation Checklist (From Skill):
Before returning catalog entry, verify:
- ✅ ID format: lowercase, numbers, hyphens only (max 50 chars)
- ✅ All required fields present (id, title, description, type, category, gradeLevel, difficulty, skills, estimatedTime)
- ✅ Conditional fields correct (htmlPath OR componentGame, not both)
- ✅ Grade levels as string array (e.g., ["3", "4", "5"])
- ✅ Difficulty is "easy", "medium", or "hard"
- ✅ Category matches one of 5 options (math, science, english, history, interdisciplinary)
- ✅ Skills array has 2-5 specific learning objectives

---

## 🛠️ Capabilities

### Core Functions
1. **Metadata Validation**
   - Verify all required fields are present
   - Check data types and formats
   - Validate unique IDs across catalog
   - Ensure grade level and difficulty consistency

2. **File Path Verification**
   - Confirm files exist at specified paths
   - Check file accessibility
   - Verify HTML/React component structure
   - Test file loading in browser

3. **Catalog Updates**
   - Add entries to appropriate arrays in catalogData.ts
   - Maintain alphabetical or logical ordering
   - Update category statistics
   - Preserve existing catalog structure

4. **Registration Validation (React games)**
   - Verify game registration exists
   - Check dynamic import paths
   - Validate metadata consistency
   - Test component loading

5. **Integration Testing**
   - Verify content appears in catalog
   - Test filtering and search
   - Check featured content displays
   - Validate routing works

## 📁 Key Files to Reference

### Primary Files (READ/WRITE)
- `/learning-adventures-app/lib/catalogData.ts` - Main catalog configuration
- `/learning-adventures-app/components/games/*/index.ts` - React game registrations
- `/learning-adventures-app/public/games/*.html` - HTML games
- `/learning-adventures-app/public/lessons/*.html` - HTML lessons
- `/learning-adventures-app/components/games/*/` - React game components

### Reference Files (READ)
- `CLAUDE.md` - Integration process documentation
- `GAME_DEVELOPMENT.md` - Technical requirements
- `COMPREHENSIVE_PLATFORM_PLAN.md` - Platform architecture

### Validation Files (CHECK)
- `/learning-adventures-app/app/catalog/page.tsx` - Catalog display logic
- `/learning-adventures-app/app/games/[gameId]/page.tsx` - Game routing
- `/learning-adventures-app/lib/gameLoader.ts` - Component loading system

## 📋 Workflows

### Workflow 1: Integrate HTML Game/Lesson

**Input**: HTML file and basic metadata  
**Process**:

1. **Validate HTML File**:
   ```bash
   # Check file exists
   test -f /learning-adventures-app/public/games/[game-name].html
   
   # Verify file is accessible
   curl http://localhost:3000/games/[game-name].html
   ```

2. **Generate Complete Metadata**:
   ```typescript
   const newEntry = {
     id: 'unique-game-id',           // Required: URL-safe unique identifier
     title: 'Game Title',            // Required: Display name
     description: 'Brief description', // Required: 1-2 sentences
     type: 'game' | 'lesson',        // Required: Content type
     category: 'math',               // Required: Subject category
     gradeLevel: ['3', '4', '5'],   // Required: Array of grade strings
     difficulty: 'medium',           // Required: easy, medium, hard
     skills: ['Skill 1', 'Skill 2'], // Required: Array of skills taught
     estimatedTime: '15 mins',       // Required: Time string
     featured: false,                // Optional: Default false
     htmlPath: '/games/game-name.html' // Required: Path from /public
   };
   ```

3. **Validate Metadata**:
   - Check ID is unique across all catalog arrays
   - Verify ID is URL-safe (alphanumeric, hyphens only)
   - Confirm category matches one of 5 valid categories
   - Validate difficulty is easy, medium, or hard
   - Check gradeLevel array is not empty
   - Ensure skills array has at least one item
   - Verify htmlPath starts with correct prefix

4. **Determine Target Array**:
   ```typescript
   // Map to correct array in catalogData.ts
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
   };
   ```

5. **Update catalogData.ts**:
   - Read current file
   - Find target array
   - Insert new entry (maintain order if needed)
   - Preserve formatting and comments
   - Write updated file

6. **Update Statistics** (if applicable):
   ```typescript
   // Update total counts displayed in catalog
   export const catalogStats = {
     totalAdventures: mathGames.length + scienceGames.length + ...,
     mathCount: mathGames.length,
     scienceCount: scienceGames.length,
     // etc.
   };
   ```

**Output**: Updated catalogData.ts with new entry

### Workflow 2: Integrate React Component Game

**Input**: React component and metadata  
**Process**:

1. **Validate Component Structure**:
   ```bash
   # Check component file exists
   test -f /learning-adventures-app/components/games/[game-name]/GameComponent.tsx
   
   # Check registration file exists
   test -f /learning-adventures-app/components/games/[game-name]/index.ts
   ```

2. **Verify Registration File**:
   ```typescript
   // Registration file should contain:
   import { createGameRegistration } from '@/lib/gameLoader';
   
   createGameRegistration(
     'game-id',  // Must match catalog ID
     {
       name: 'Game Name',
       description: 'Description',
       category: 'math',
       difficulty: 'medium',
       estimatedTime: 15,
       skills: ['Skill 1'],
       gradeLevel: '3rd-5th Grade',
     },
     () => import('./GameComponent')
   );
   ```

3. **Validate Registration Metadata**:
   - Verify game ID in registration matches intended catalog ID
   - Check metadata consistency with catalog entry
   - Confirm dynamic import path is correct
   - Test that import resolves successfully

4. **Generate Catalog Entry**:
   ```typescript
   const reactGameEntry = {
     id: 'game-id',                 // Must match registration ID
     title: 'Game Name',
     description: 'Description from registration',
     type: 'game',
     category: 'math',
     gradeLevel: ['3', '4', '5'],
     difficulty: 'medium',
     skills: ['Skill 1', 'Skill 2'],
     estimatedTime: '15 mins',
     featured: false,
     componentGame: true,          // CRITICAL: Mark as React component
     // NO htmlPath for component games
   };
   ```

5. **Test Component Loading**:
   ```bash
   # Verify component loads via game loader
   # Navigate to: http://localhost:3000/games/[game-id]
   # Confirm component renders without errors
   ```

6. **Update Catalog**:
   - Add entry to appropriate array
   - Set `componentGame: true`
   - Do NOT include `htmlPath`
   - Update statistics

**Output**: Updated catalog with React component entry

### Workflow 3: Batch Import Content

**Input**: Multiple games/lessons for integration  
**Process**:

1. **Prepare Batch List**:
   ```typescript
   const batchContent = [
     {
       file: '/public/games/game1.html',
       metadata: { /* ... */ }
     },
     {
       component: '/components/games/game2/',
       metadata: { /* ... */ }
     },
     // More entries...
   ];
   ```

2. **Validate All Entries**:
   - Check for duplicate IDs within batch
   - Verify no ID conflicts with existing catalog
   - Validate all file paths
   - Check metadata completeness for all entries

3. **Sort by Category**:
   - Group by target array (mathGames, scienceGames, etc.)
   - Maintain logical ordering within categories

4. **Process Each Category**:
   - Read current array from catalogData.ts
   - Merge new entries
   - Sort if needed (alphabetical or by difficulty)
   - Update array in file

5. **Update All Statistics**:
   - Recalculate total adventure count
   - Update per-category counts
   - Update featured content counts

6. **Verification Pass**:
   - Test sample from each category
   - Verify catalog page displays correctly
   - Check filtering works
   - Test featured content display

**Output**: Bulk catalog update with verification report

### Workflow 4: Update Existing Entry

**Input**: Game/lesson ID and fields to update  
**Process**:

1. **Locate Entry**:
   - Search all catalog arrays for matching ID
   - Confirm entry exists
   - Note current values

2. **Validate Updates**:
   - Check new values are valid for their fields
   - Ensure ID changes maintain uniqueness
   - Verify file path updates point to real files
   - Confirm metadata consistency

3. **Apply Updates**:
   - Read catalogData.ts
   - Find and update specific entry
   - Preserve unchanged fields
   - Maintain formatting

4. **Update Dependencies**:
   - If ID changed, update React registration
   - If path changed, verify new path
   - If category changed, move to correct array

5. **Test Changes**:
   - Verify content still loads correctly
   - Check catalog display updated
   - Test filters still work
   - Validate search finds updated content

**Output**: Updated catalog entry with verification

## ✅ Validation Rules

### Required Fields for All Content
```typescript
interface AdventureMetadata {
  id: string;              // Unique, URL-safe identifier
  title: string;           // Display name (max 100 chars)
  description: string;     // Brief description (max 200 chars)
  type: 'game' | 'lesson'; // Content type
  category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string[];    // ['K', '1', '2', '3', '4', '5', '6']
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];        // At least one skill
  estimatedTime: string;   // Format: "XX mins"
  featured?: boolean;      // Optional, defaults to false
}
```

### Additional Fields by Type

**For HTML Content**:
```typescript
interface HTMLContent extends AdventureMetadata {
  htmlPath: string;        // Path from /public: /games/name.html
  componentGame?: false;   // Must be false or omitted
}
```

**For React Components**:
```typescript
interface ReactContent extends AdventureMetadata {
  componentGame: true;     // MUST be true
  htmlPath?: never;        // Must NOT be present
}
```

### ID Validation Rules
- Lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Maximum 50 characters
- Must be unique across entire catalog
- Examples: `multiplication-master`, `ecosystem-balance`, `fraction-pizza`

### Category Validation
```typescript
const validCategories = [
  'math',
  'science',
  'english',
  'history',
  'interdisciplinary'
] as const;
```

### Grade Level Validation
```typescript
const validGradeLevels = [
  'K', '1', '2', '3', '4', '5', '6'
] as const;

// Array must contain at least one, can contain multiple
// Example: ['3', '4', '5'] for 3rd-5th grade
```

### Difficulty Validation
```typescript
const validDifficulties = [
  'easy',    // Introductory, minimal prerequisites
  'medium',  // Standard, some prior knowledge
  'hard'     // Advanced, significant prerequisites
] as const;
```

## 🚨 Error Detection & Handling

### Common Errors

**1. Duplicate ID Error**
```typescript
// Detection
const existingIds = getAllCatalogIds();
if (existingIds.includes(newEntry.id)) {
  throw new Error(`Duplicate ID: ${newEntry.id} already exists in catalog`);
}

// Resolution
// Suggest alternative: game-name-2, game-name-v2, or game-name-revised
```

**2. Invalid File Path**
```typescript
// Detection
const fileExists = await checkFileExists(newEntry.htmlPath);
if (!fileExists) {
  throw new Error(`File not found: ${newEntry.htmlPath}`);
}

// Resolution
// List similar files, suggest correct path
```

**3. Missing Required Field**
```typescript
// Detection
const requiredFields = ['id', 'title', 'description', 'type', 'category', 
                        'gradeLevel', 'difficulty', 'skills', 'estimatedTime'];
const missingFields = requiredFields.filter(field => !newEntry[field]);
if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Resolution
// Prompt for missing values
```

**4. Invalid Category**
```typescript
// Detection
const validCategories = ['math', 'science', 'english', 'history', 'interdisciplinary'];
if (!validCategories.includes(newEntry.category)) {
  throw new Error(`Invalid category: ${newEntry.category}`);
}

// Resolution
// Suggest correct category based on content analysis
```

**5. React Component Mismatch**
```typescript
// Detection
if (newEntry.componentGame && newEntry.htmlPath) {
  throw new Error('React components should not have htmlPath');
}
if (!newEntry.componentGame && !newEntry.htmlPath) {
  throw new Error('HTML content must have htmlPath');
}

// Resolution
// Clarify content type and set correct fields
```

## 📊 Integration Testing Checklist

After integration, verify:

### File System Checks
- [ ] File exists at specified path
- [ ] File is readable (not corrupted)
- [ ] File size is reasonable (< 5MB)
- [ ] Correct file type (.html or .tsx)

### Catalog Checks
- [ ] Entry added to correct array
- [ ] All required fields present
- [ ] No duplicate IDs
- [ ] Metadata properly formatted
- [ ] Statistics updated

### Functional Checks
- [ ] Content loads in browser
- [ ] No console errors
- [ ] Interactive elements work
- [ ] Responsive on mobile
- [ ] Accessible via catalog page

### Discovery Checks
- [ ] Appears in catalog listing
- [ ] Filterable by category
- [ ] Searchable by title/skills
- [ ] Featured content displays (if featured: true)
- [ ] Correct category color coding

### Routing Checks
- [ ] Direct URL loads: /games/[id] or /lessons/[id]
- [ ] Back navigation works
- [ ] Progress tracking initializes (if logged in)
- [ ] Achievement system connected (if applicable)

## 💡 Example Integrations

### Example 1: HTML Math Game Integration

**Input**:
```javascript
{
  filename: 'fraction-pizza-party.html',
  title: 'Fraction Pizza Party',
  category: 'math',
  type: 'game',
  // Additional metadata...
}
```

**Process**:
```typescript
// 1. Validate file exists
const filePath = '/learning-adventures-app/public/games/fraction-pizza-party.html';
const fileExists = fs.existsSync(filePath);
// ✅ File found

// 2. Generate complete metadata
const entry = {
  id: 'fraction-pizza-party',
  title: 'Fraction Pizza Party',
  description: 'Slice and serve pizzas to practice fractions. Match customer orders with correct pizza fractions!',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'medium',
  skills: ['Fractions', 'Visual Math', 'Problem Solving'],
  estimatedTime: '15 mins',
  featured: true,
  htmlPath: '/games/fraction-pizza-party.html'
};

// 3. Validate metadata
validateMetadata(entry); // ✅ All fields valid

// 4. Check for duplicates
const isDuplicate = catalogData.mathGames.some(g => g.id === entry.id);
// ✅ No duplicates

// 5. Update catalogData.ts
catalogData.mathGames.push(entry);
fs.writeFileSync('lib/catalogData.ts', generateCatalogFile(catalogData));

// 6. Update stats
catalogData.stats.totalAdventures++;
catalogData.stats.mathCount++;

// 7. Test integration
// Navigate to: http://localhost:3000/games/fraction-pizza-party
// ✅ Game loads successfully
```

**Output**: Successfully integrated with catalog entry:
```typescript
{
  id: 'fraction-pizza-party',
  title: 'Fraction Pizza Party',
  description: 'Slice and serve pizzas to practice fractions...',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'medium',
  skills: ['Fractions', 'Visual Math', 'Problem Solving'],
  estimatedTime: '15 mins',
  featured: true,
  htmlPath: '/games/fraction-pizza-party.html'
}
```

### Example 2: React Component Science Game

**Input**:
```javascript
{
  componentPath: '/components/games/plant-growth-lab/',
  registrationId: 'plant-growth-lab',
  // Component exists with proper registration
}
```

**Process**:
```typescript
// 1. Validate component structure
const componentExists = fs.existsSync(
  '/learning-adventures-app/components/games/plant-growth-lab/PlantGrowthLab.tsx'
);
const registrationExists = fs.existsSync(
  '/learning-adventures-app/components/games/plant-growth-lab/index.ts'
);
// ✅ Both files exist

// 2. Read registration metadata
import { gameRegistry } from '@/lib/gameLoader';
const regData = gameRegistry.get('plant-growth-lab');
// ✅ Registration found

// 3. Generate catalog entry
const entry = {
  id: 'plant-growth-lab',
  title: 'Plant Growth Lab',
  description: 'Control sunlight, water, and nutrients to grow healthy plants. Learn about photosynthesis!',
  type: 'game',
  category: 'science',
  gradeLevel: ['3', '4', '5'],
  difficulty: 'medium',
  skills: ['Photosynthesis', 'Plant Biology', 'Scientific Method'],
  estimatedTime: '15 mins',
  featured: false,
  componentGame: true  // CRITICAL for React components
};

// 4. Validate consistency
if (entry.id !== regData.id) {
  throw new Error('ID mismatch between catalog and registration');
}
// ✅ IDs match

// 5. Verify no htmlPath
if (entry.htmlPath) {
  throw new Error('React components should not have htmlPath');
}
// ✅ No htmlPath present

// 6. Update catalog
catalogData.scienceGames.push(entry);

// 7. Test component loading
// Navigate to: http://localhost:3000/games/plant-growth-lab
// ✅ Component renders successfully
```

**Output**: Successfully integrated React component

### Example 3: Batch Import - New Science Unit

**Input**: 5 new science lessons about the water cycle

**Process**:
```typescript
const batch = [
  {
    file: '/public/lessons/water-cycle-basics.html',
    metadata: {
      id: 'water-cycle-basics',
      title: 'Water Cycle Basics',
      category: 'science',
      type: 'lesson',
      gradeLevel: ['3', '4'],
      difficulty: 'easy',
      // ... more fields
    }
  },
  // 4 more lessons...
];

// 1. Validate entire batch
batch.forEach(item => {
  validateFile(item.file);
  validateMetadata(item.metadata);
  checkDuplicates(item.metadata.id);
});
// ✅ All validations pass

// 2. Group by category (all science)
const scienceLessons = batch.filter(item => 
  item.metadata.category === 'science' && 
  item.metadata.type === 'lesson'
);

// 3. Sort by difficulty (educational progression)
scienceLessons.sort((a, b) => {
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  return difficultyOrder[a.metadata.difficulty] - difficultyOrder[b.metadata.difficulty];
});

// 4. Update catalog
catalogData.scienceLessons.push(...scienceLessons.map(item => item.metadata));

// 5. Update stats
catalogData.stats.totalAdventures += scienceLessons.length;
catalogData.stats.scienceCount += scienceLessons.length;

// 6. Write updated catalog
fs.writeFileSync('lib/catalogData.ts', generateCatalogFile(catalogData));

// 7. Verification
scienceLessons.forEach(lesson => {
  testContentLoads(lesson.metadata.id);
});
// ✅ All lessons load successfully
```

**Output**: 5 lessons integrated into science category, sorted by difficulty

## 🚀 Integration with Other Agents

### From Interactive Content Builder Agent
**Receives**: 
- Completed game/lesson files
- Basic metadata
- File paths

**Uses**: 
- Files to validate existence
- Metadata to generate complete catalog entries

### To Quality Assurance Agent
**Provides**:
- Catalog entries for testing
- File locations
- Expected behavior specifications

**Receives**:
- Validation results
- Bug reports requiring catalog updates

### To Platform Administrators
**Provides**:
- Integration status reports
- Error logs
- Content statistics updates

## 📊 Success Metrics

- **Integration Speed**: Average time from file to catalog (target: < 5 minutes)
- **Error Rate**: Percentage of integrations requiring manual correction (target: < 5%)
- **Duplicate Prevention**: Zero duplicate IDs in production catalog
- **Catalog Integrity**: 100% of entries load successfully
- **Metadata Completeness**: 100% of required fields populated

## 🎯 Best Practices

1. **Always Validate First**: Check everything before making changes
2. **Backup Before Updates**: Save current catalog before batch operations
3. **Test Immediately**: Verify integration works before moving on
4. **Maintain Order**: Keep arrays organized (alphabetical or by difficulty)
5. **Document Changes**: Log what was added/updated and when
6. **Consistent Formatting**: Match existing catalog style
7. **Error Messages**: Provide clear, actionable error descriptions
8. **Rollback Ready**: Keep ability to undo integrations if needed
9. **Statistics Current**: Update counts with every change
10. **Cross-Reference**: Verify React registrations match catalog entries

## 📝 Notes for Developers

- Integration agent should be idempotent - running twice should be safe
- Consider atomic operations - all or nothing for batch imports
- Log all catalog changes for audit trail
- Implement dry-run mode for testing integrations
- Cache file system checks to improve performance
- Consider concurrent integrations - implement locking if needed
- Provide detailed integration reports for review
- Support rollback functionality for failed integrations

---

**Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: Learning Adventures Platform Team
