# Interactive Content Skill

## Purpose
Generates standalone HTML games, interactive widgets, and quiz JSON files for curriculum lessons using Claude's code generation capabilities.

## What This Skill Does

This skill is the **third step** in the course generation pipeline. It takes the curriculum structure and creates actual playable content:
- Standalone HTML games with embedded CSS/JavaScript
- Interactive educational widgets
- Quiz questions in JSON format
- Age-appropriate, themed content

### Key Responsibilities:
1. **HTML Game Generation**: Create complete, playable games in single HTML files
2. **Interactive Widget Creation**: Build exploratory learning experiences
3. **Quiz JSON Generation**: Create assessment questions with explanations
4. **Theming**: Apply student interests and favorite characters
5. **Accessibility**: Ensure mobile-responsive, keyboard-accessible design
6. **Age-Appropriateness**: Match visual design and language to student age

## Input Format

Expects:
- **curriculum** object from CurriculumDesignSkill
- **designBrief** object (optional but recommended for theming)

The skill processes lessons with these types:
- `GAME` → HTML game file
- `INTERACTIVE` → HTML interactive widget
- `QUIZ` → JSON quiz data

Lesson types NOT processed (handled elsewhere):
- `VIDEO` → video content managed separately
- `READING` → text content managed separately
- `PROJECT` → project templates managed separately

## Output Structure

Returns `generatedContent` array with lesson content:

```typescript
{
  generatedContent: [
    {
      lessonId: string              // e.g., "lesson-3"
      lessonTitle: string           // e.g., "Multiplication Race Rally"
      lessonType: 'GAME' | 'INTERACTIVE' | 'QUIZ'
      contentType: 'html' | 'quiz_json'

      // For HTML content (GAME/INTERACTIVE)
      filePath?: string             // e.g., "lesson-3-multiplication-race.html"
      htmlContent?: string          // Full HTML file content

      // For quiz content (QUIZ)
      quizJson?: {
        quiz: {
          title: string
          passingScore: number
          questions: Array<{
            id: string
            question: string
            type: 'multiple-choice' | 'true-false' | 'short-answer'
            options: Array<{
              id: string
              text: string
              correct: boolean
            }>
            explanation: string
            points: number
          }>
        }
      }

      metadata: {
        generatedAt: string         // ISO timestamp
        fileSize?: number            // Bytes (for HTML)
        tokenCount?: number          // Characters (for JSON)
      }
    }
  ],

  summary: {
    totalLessons: number            // Total lessons in curriculum
    gamesGenerated: number          // HTML game files created
    quizzesGenerated: number        // Quiz JSON files created
    interactivesGenerated: number   // Interactive widget files created
    totalFiles: number              // Total files generated
  }
}
```

## HTML Game Requirements

### Technical Specifications

**Single File Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesson Title</title>
    <style>
        /* All CSS embedded here */
    </style>
</head>
<body>
    <!-- Game HTML structure -->

    <script>
        // All JavaScript embedded here
    </script>
</body>
</html>
```

**Mobile-Responsive Design**:
- Viewport meta tag required
- Flexible layouts (flexbox or grid)
- Min touch target size: 44x44px
- Font size: min 16px body, 24px+ headings
- Test on 320px width minimum

**Accessibility Features**:
- Semantic HTML (`<button>`, `<input>`, etc.)
- ARIA labels for screen readers
- Keyboard navigation support (tab, enter, arrow keys)
- Alt text for images
- Sufficient color contrast (WCAG AA minimum)

**Interactive Elements**:
- Clear instructions at top
- Progress indicator (if multi-step)
- Immediate feedback on interactions
- Visual rewards (stars, checkmarks, animations)
- Encouraging messages ("Great job!", "Try again!")
- Sound effects with mute toggle (optional)

### Design Guidelines by Age

**Ages 5-7 (Early Elementary)**:
- Very large buttons (60px+)
- Bright primary colors
- Simple, bold fonts
- Heavy use of images/icons
- Minimal text
- Simple drag-drop or click interactions

**Ages 8-10 (Middle Elementary)**:
- Large buttons (50px)
- Colorful but slightly more sophisticated palette
- Mix of text and images
- Multi-step challenges OK
- Can include timers (optional pressure)

**Ages 11-13 (Upper Elementary/Middle School)**:
- Standard button sizes (44px min)
- More subdued color schemes acceptable
- Text-heavy content OK
- Complex game mechanics
- Competitive elements (leaderboards, timers)

### Game Type Examples

**Drag-and-Drop Games**:
```javascript
// Drag items to correct categories
// Example: Sort animals by habitat
```

**Multiple Choice Games**:
```javascript
// Questions with 4 options
// Track score, show explanations
```

**Matching Games**:
```javascript
// Match pairs (e.g., multiplication fact to answer)
// Flip cards, memory-style
```

**Fill-in-the-Blank**:
```javascript
// Type answers into blanks
// Validate input, show hints
```

**Timed Challenges**:
```javascript
// Answer as many questions as possible in time limit
// Progressive difficulty
```

**Simulations**:
```javascript
// Interactive science labs
// Virtual manipulatives (fraction bars, balance scales)
```

## Quiz JSON Requirements

### Structure

```json
{
  "quiz": {
    "title": "Chapter 1 Review Quiz",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "question": "What is 3 × 4?",
        "type": "multiple-choice",
        "options": [
          { "id": "a", "text": "7", "correct": false },
          { "id": "b", "text": "12", "correct": true },
          { "id": "c", "text": "10", "correct": false },
          { "id": "d", "text": "9", "correct": false }
        ],
        "explanation": "3 × 4 means three groups of four. If you count 4 + 4 + 4, you get 12!",
        "points": 10
      }
    ]
  }
}
```

### Question Guidelines

**Question Count**:
- Easy quizzes: 6-8 questions
- Medium quizzes: 8-10 questions
- Hard quizzes: 10-12 questions

**Question Types**:
- **Multiple Choice**: 4 options (a, b, c, d)
- **True/False**: 2 options
- **Short Answer**: Accept multiple correct variations

**Difficulty Distribution**:
- Easy quiz: 60% easy, 30% medium, 10% hard questions
- Medium quiz: 30% easy, 50% medium, 20% hard questions
- Hard quiz: 20% easy, 40% medium, 40% hard questions

**Explanation Quality**:
- Clear reasoning for correct answer
- Explain why wrong answers are incorrect (when helpful)
- Use age-appropriate language
- Reference lesson concepts

**Points Distribution**:
- Standard question: 10 points
- Complex/multi-step: 15-20 points
- Total points should sum to 100

## Theming System

### Applying Student Interests

**Example: Student loves "Animals"**

Math Game:
```
Theme: Safari Adventure
Characters: Animal guides (elephant for big numbers, mouse for small)
Rewards: Collect animal stickers
Setting: Jungle, savanna, ocean
```

Science Game:
```
Theme: Wildlife Scientist
Characters: Different animals demonstrating concepts
Rewards: Complete animal fact cards
Setting: Natural habitats
```

**Example: Student loves "Space"**

Math Game:
```
Theme: Space Explorer
Characters: Astronaut, alien friends
Rewards: Collect stars/planets
Setting: Solar system, spacecraft
```

**Example: Student loves "Gaming"**

All Games:
```
Style: Video game aesthetic
Features: Levels, power-ups, achievements
Rewards: Unlock badges, level up
Setting: Retro pixel art or modern 3D-style graphics
```

### Applying Favorite Characters

**When student mentions specific characters**:
- Reference character traits in game narrative
- Use similar visual style
- Include character-inspired rewards
- Example: "Wild Kratts fan" → use creature powers concept in biology games

**When no characters specified**:
- Create original mascot for the course
- Base on course theme (e.g., math wizard, science detective)

## Content Requirements by Lesson Type

### GAME Lessons

**Purpose**: Practice skills through play

**Required Elements**:
- Clear game objective
- Multiple rounds/attempts
- Score tracking
- Win/lose conditions (or just progress tracking)
- Replay option

**Example Game Types**:
- **Drag-Drop**: Sort items into categories
- **Multiple Choice**: Racing game, answer to advance
- **Matching**: Memory card flip
- **Sequencing**: Put steps in order
- **Sorting**: Group similar items

### INTERACTIVE Lessons

**Purpose**: Guided exploration and discovery

**Required Elements**:
- Scaffolded hints/guidance
- Self-paced progression
- Experimentation encouraged
- No failure state
- "Aha!" moments

**Example Interactive Types**:
- **Simulations**: Virtual science lab, adjust variables
- **Virtual Manipulatives**: Fraction bars, number lines, geometric shapes
- **Choose-Your-Path**: Story branches based on choices
- **Discovery Lab**: Click objects to learn properties
- **Guided Tour**: Step-by-step exploration with annotations

### QUIZ Lessons

**Purpose**: Assess understanding

**Required Elements**:
- Clear passing threshold
- Explanations for all answers
- Retry option (with different questions ideally)
- Progress indicator
- Final score display

**Question Distribution**:
- Cover all learning objectives
- Mix of recall, application, analysis questions (Bloom's)
- Varied difficulty (not all hard at end)

## Validation Criteria

### For HTML Games:
- ✅ Valid HTML5 (starts with `<!DOCTYPE html>`)
- ✅ All CSS embedded in `<style>` tag
- ✅ All JavaScript embedded in `<script>` tag
- ✅ Responsive viewport meta tag present
- ✅ No external dependencies (CDNs OK for fonts only)
- ✅ File size < 500KB (ideally < 200KB)

### For Quiz JSON:
- ✅ Valid JSON structure
- ✅ All questions have explanations
- ✅ Points sum to ~100
- ✅ Passing score set appropriately (typically 70-80%)
- ✅ Options clearly differentiated

## Usage Example

```typescript
import { InteractiveContentSkill } from '@/lib/skills/interactive-content/InteractiveContentSkill';

const skill = new InteractiveContentSkill();

const result = await skill.execute({
  userRequest: 'Generate interactive content',
  previousOutputs: new Map([
    ['curriculum', {
      courseTitle: 'Animal Math Safari',
      lessons: [/* lesson objects */]
    }],
    ['designBrief', {
      student: { age: 8, learningProfile: { interests: ['Animals'] } }
    }]
  ])
});

if (result.success) {
  const { generatedContent, summary } = result.output;

  console.log(`Generated ${summary.totalFiles} files`);

  // Save HTML files to disk
  for (const content of generatedContent) {
    if (content.htmlContent) {
      await writeFile(
        `public/lessons/${content.filePath}`,
        content.htmlContent
      );
    }
  }
}
```

## Integration Points

### Input Sources:
- **CurriculumDesignSkill**: Lesson structure and requirements
- **CourseDesignBriefSkill**: Student profile for theming

### Output Consumers:
- **NarrativeIntegrationSkill**: May enhance HTML with story elements
- **CourseGenerationAgent**: Stores file paths in CourseLesson records
- **File System**: HTML files saved to `public/lessons/`
- **Database**: Quiz JSON stored in CourseLesson.quizData field

## Performance Considerations

- **Execution Time**:
  - Per HTML game: 30-60 seconds
  - Per quiz: 20-30 seconds
  - Full 12-lesson course: 5-10 minutes
  - Full 30-lesson course: 15-25 minutes

- **Token Usage**:
  - HTML game: 8,000-15,000 tokens
  - Quiz JSON: 2,000-4,000 tokens

- **File Sizes**:
  - HTML games: 50-200KB typical
  - Quiz JSON: 5-15KB typical

## Error Handling

### Common Errors:

1. **MISSING_DATA**: No curriculum in context
2. **INVALID_HTML**: Generated HTML doesn't start with DOCTYPE
3. **INVALID_JSON**: Quiz JSON parsing failed
4. **GENERATION_TIMEOUT**: Claude API took too long

## Future Enhancements

1. **Template System**: Pre-built game shells for faster generation
2. **Asset Library**: Shared images/sounds across games
3. **Multiplayer Support**: Games that work for classroom groups
4. **Analytics Integration**: Track student performance in games
5. **Offline Support**: Progressive Web App features
6. **Translation**: Multi-language support

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintained By**: Learning Adventures Platform Team
