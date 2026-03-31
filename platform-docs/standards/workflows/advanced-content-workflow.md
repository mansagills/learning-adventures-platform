# Advanced Content Creation Workflow

## Overview

This guide covers workflows for creating **React-based games** and **database-integrated courses** that require platform integration. For simple HTML content, see [vibe-coding-workflow-guide.md](./vibe-coding-workflow-guide.md).

**Prerequisites:**
- Familiarity with React and TypeScript
- Access to the Learning Adventures codebase
- Understanding of the platform's shared components

---

## React Game Creation Workflow

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: PLAN                                               │
│  Fill out react-game-prd-template.md                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: GENERATE                                           │
│  Use AI tool with React-specific requirements               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: CREATE FILES                                       │
│  components/games/[game-name]/ structure                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: REGISTER                                           │
│  Add to lib/gameLoader.ts initializeGameRegistry()          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: CATALOG                                            │
│  Add to catalogData.ts with componentGame: true             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: TEST                                               │
│  Navigate to /games/[game-id] and verify                    │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 1: Plan Your React Game

1. **Get the template**: Copy [react-game-prd-template.md](../prd-templates/react-game-prd-template.md)

2. **Fill out all sections**, especially:
   - Platform integration requirements (callbacks, hooks)
   - State management structure
   - Component architecture

3. **Review shared components** you'll use:
   ```typescript
   import {
     GameContainer,
     GameButton,
     ScoreBoard,
     GameModal,
     useGameState,
     useGameTimer,
   } from '@/components/games/shared';
   ```

---

### Step 2: Generate with AI Tool

**Recommended Tools:** Claude Code, Cursor

**Prompt Template:**

```
Create a React educational game for the Learning Adventures platform.

GAME SPECIFICATION:
[Paste your filled PRD sections 1-6]

TECHNICAL REQUIREMENTS:
1. React component with TypeScript and Tailwind CSS
2. Import from @/components/games/shared:
   - GameContainer (wrapper with header, exit, progress)
   - GameButton (styled buttons)
   - ScoreBoard (score, lives, level display)
   - GameModal (dialogs)
   - useGameState (state management hook)
   - useGameTimer (timer hook)

3. Accept GameProps interface:
   interface GameProps {
     onExit?: () => void;
     onComplete?: (score: number) => void;
     onProgress?: (progress: number) => void;
   }

4. Create these files in components/games/[game-id]/:
   - [GameName].tsx - Main component
   - index.ts - Registration with createGameRegistration
   - types.ts - TypeScript interfaces (if needed)

5. NO external npm packages - only use shared components

SHARED HOOKS USAGE:

useGameState:
const { gameState, actions } = useGameState({
  initialScore: 0,
  initialLevel: 1,
  initialLives: 3,
  onGameOver: () => {},
  onLevelUp: (level) => {},
  onAchievement: (name) => {}
});

useGameTimer:
const { time, isRunning, actions: timerActions } = useGameTimer({
  initialTime: 60,
  countDown: true,
  onTimeUp: () => {},
  autoStart: false
});

Generate the complete implementation.
```

---

### Step 3: Create File Structure

Create directory and files:

```bash
# Create game directory
mkdir -p components/games/[game-name]

# Files to create:
# 1. components/games/[game-name]/[GameName].tsx
# 2. components/games/[game-name]/index.ts
# 3. components/games/[game-name]/types.ts (optional)
```

**Main Component Template** (`[GameName].tsx`):

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  GameModal,
  useGameState,
  useGameTimer,
  GameProps,
} from '@/components/games/shared';

const GameName: React.FC<GameProps> = ({ onExit, onComplete, onProgress }) => {
  const { gameState, actions } = useGameState({
    initialScore: 0,
    initialLevel: 1,
    initialLives: 3,
    onGameOver: () => setShowGameOver(true),
    onLevelUp: (level) => console.log(`Level ${level}`),
    onAchievement: (name) => console.log(`Achievement: ${name}`),
  });

  const [showGameOver, setShowGameOver] = useState(false);

  // Report progress
  useEffect(() => {
    const progress = /* calculate progress */;
    onProgress?.(progress);
  }, [gameState, onProgress]);

  const handleComplete = () => {
    onComplete?.(gameState.score);
  };

  const handleExit = () => {
    onExit?.();
  };

  return (
    <GameContainer
      title="Game Title"
      onExit={handleExit}
      showProgress={true}
      progress={/* progress value */}
    >
      <ScoreBoard
        score={gameState.score}
        level={gameState.level}
        lives={gameState.lives}
      />

      {/* Your game content */}

      <GameModal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        title="Game Over"
        type="info"
      >
        <p>Final Score: {gameState.score}</p>
        <GameButton onClick={handleComplete}>
          Finish
        </GameButton>
      </GameModal>
    </GameContainer>
  );
};

export default GameName;
```

**Registration File** (`index.ts`):

```typescript
import { createGameRegistration } from '@/lib/gameLoader';

export const gameNameRegistration = createGameRegistration(
  'game-id',
  {
    name: 'Display Name',
    description: 'Brief description',
    category: 'math',
    difficulty: 'medium',
    skills: ['Skill 1', 'Skill 2'],
  },
  () => import('./GameName')
);
```

---

### Step 4: Register the Game

Edit `lib/gameLoader.ts`:

```typescript
// Add import at top
import { gameNameRegistration } from '@/components/games/[game-name]';

// Add to initializeGameRegistry function
export function initializeGameRegistry() {
  // ... existing registrations
  gameNameRegistration();  // Add this line
}
```

---

### Step 5: Add Catalog Entry

Edit `lib/catalogData.ts`:

```typescript
// Add to appropriate array (mathGames, scienceGames, etc.)
{
  id: 'game-id',  // Must match registration
  title: 'Display Title',
  description: 'One or two sentences for the catalog.',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4', '5'],
  difficulty: 'medium',
  skills: ['Skill 1', 'Skill 2', 'Skill 3'],
  estimatedTime: '15-20 mins',
  featured: false,
  componentGame: true,  // REQUIRED for React games
  // NO htmlPath for React games
}
```

---

### Step 6: Test the Game

```bash
# Start dev server
cd learning-adventures-app
npm run dev

# Test the game directly
open http://localhost:3000/games/game-id

# Check catalog listing
open http://localhost:3000/catalog
```

**Testing Checklist:**
- [ ] Game loads without errors
- [ ] Shared components display correctly
- [ ] Score, lives, level update properly
- [ ] Progress callback fires
- [ ] Exit button works
- [ ] Game over flow works
- [ ] Complete callback fires with score
- [ ] Responsive on mobile
- [ ] Keyboard accessible

---

## Course Creation Workflow

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: DESIGN COURSE STRUCTURE                            │
│  Define lessons, types, XP, prerequisites                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: FILL PRD                                           │
│  Complete course-prd-template.md                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: CREATE LESSON CONTENT                              │
│  Build each lesson using appropriate template               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: CREATE QUIZZES                                     │
│  Build assessment quizzes for the course                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: CONFIGURE COURSE                                   │
│  Set up course metadata and lesson sequence                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: TEST ENROLLMENT                                    │
│  Verify progression, unlocking, and completion              │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 1: Design Course Structure

Plan your course with these elements:

**Course Metadata:**
```
Course ID: [lowercase-hyphenated]
Title: [Display Name]
Subject: [math | science | english | history | interdisciplinary]
Grade Level: [K-2 | 3-4 | 5-6]
Total XP: [Sum of all lesson XP]
Estimated Duration: [Total hours]
```

**Lesson Sequence:**
```
Lesson 1: [Title]
  - Type: [INTERACTIVE | GAME | VIDEO | QUIZ | READING | PROJECT]
  - XP Reward: [Number]
  - Required Score: [Optional minimum to pass]
  - Unlock: [Always first lesson]

Lesson 2: [Title]
  - Type: [...]
  - XP Reward: [...]
  - Required Score: [...]
  - Unlock: [After Lesson 1]

[Continue for all lessons...]
```

**XP Distribution Guidelines:**
- Total course XP: 100-500 depending on length
- Quizzes: Higher XP (reward assessment effort)
- Interactive lessons: Medium XP
- Reading/Video: Lower XP (passive content)

---

### Step 2: Fill PRD Template

Copy and complete [course-prd-template.md](../prd-templates/course-prd-template.md).

Key sections to fill:
- Course overview and objectives
- Lesson sequence with types and XP
- Unlock conditions
- Quiz requirements
- Certificate criteria

---

### Step 3: Create Lesson Content

For each lesson, use the appropriate template:

| Lesson Type | Template to Use | Output |
|-------------|-----------------|--------|
| INTERACTIVE | interactive-lesson-prd-template.md | HTML file |
| GAME | educational-game-prd-template.md OR react-game-prd-template.md | HTML or React |
| QUIZ | Quiz section of course-prd-template.md | HTML or React |
| VIDEO | Video embed with transcript | HTML file |
| READING | Static content page | HTML file |

**File Naming Convention:**
```
/public/lessons/[course-id]-lesson-01.html
/public/lessons/[course-id]-lesson-02.html
/public/games/[course-id]-game-01.html
/public/lessons/[course-id]-quiz-01.html
```

---

### Step 4: Create Quizzes

Quizzes are special lessons that gate progression.

**Quiz Structure:**
```typescript
interface Quiz {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;  // Percentage (0-100)
  maxAttempts?: number;  // Optional limit
  xpReward: number;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}
```

**Quiz PRD Example:**
```
Quiz: "Fractions Check-In"

Passing Score: 70%
XP Reward: 50
Max Attempts: 3

Questions:

Q1 (10 points):
  Text: "What fraction of the circle is shaded?"
  Type: multiple-choice
  Options: ["1/4", "1/2", "3/4", "1/3"]
  Correct: "1/2"
  Explanation: "Half of the circle is shaded, which is 1/2."

Q2 (10 points):
  [Continue pattern...]
```

---

### Step 5: Configure Course

**Course Database Entry:**

The course system uses these database models:

```typescript
// Course metadata
interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string[];
  difficulty: string;
  totalXP: number;
  estimatedDuration: string;
  prerequisiteCourseId?: string;
  isPremium: boolean;
  certificateEnabled: boolean;
}

// Lesson configuration
interface CourseLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  lessonType: 'INTERACTIVE' | 'GAME' | 'VIDEO' | 'QUIZ' | 'READING' | 'PROJECT';
  contentPath: string;  // Path to HTML file
  xpReward: number;
  requiredScore?: number;
  isLocked: boolean;  // First lesson: false, others: true
}
```

**Setting Up Course Configuration:**

1. Create course record with metadata
2. Create lesson records in order (orderIndex)
3. Set first lesson as unlocked (`isLocked: false`)
4. Configure XP rewards
5. Set required scores for quizzes

---

### Step 6: Test Course Flow

**Enrollment Testing:**
```bash
# Start dev server
npm run dev

# Navigate to course
open http://localhost:3000/courses/[course-id]

# Test as logged-in user:
# 1. Enroll in course
# 2. Complete first lesson
# 3. Verify second lesson unlocks
# 4. Complete quiz, verify passing requirement
# 5. Continue through all lessons
# 6. Verify certificate (if enabled)
```

**Testing Checklist:**
- [ ] Course appears in course catalog
- [ ] Enrollment works
- [ ] First lesson accessible immediately
- [ ] Subsequent lessons locked
- [ ] Lessons unlock after completing previous
- [ ] XP awarded correctly
- [ ] Quiz requires passing score to continue
- [ ] Progress persists across sessions
- [ ] Certificate awards on completion (if enabled)

---

## XP and Leveling System Reference

### Streak Multipliers

| Consecutive Days | Multiplier |
|------------------|------------|
| Days 1-2 | 1.0x |
| Days 3-6 | 1.2x |
| Days 7-29 | 1.5x |
| Days 30+ | 2.0x |

### Level Progression

Formula: `XP Required = 100 × (level ^ 1.5)`

| Level | XP Required | Cumulative XP |
|-------|-------------|---------------|
| 1 | 100 | 100 |
| 2 | 283 | 383 |
| 3 | 520 | 903 |
| 4 | 800 | 1,703 |
| 5 | 1,118 | 2,821 |

### XP Award Guidelines

| Content Type | Suggested XP |
|--------------|--------------|
| Reading | 10-20 |
| Video | 15-25 |
| Interactive Lesson | 25-50 |
| Game | 30-75 |
| Quiz (passing) | 50-100 |
| Project | 75-150 |

---

## Troubleshooting

### React Game Issues

**Problem:** Game doesn't load
```
Check:
1. Registration added to gameLoader.ts?
2. Game ID matches catalog ID?
3. Import path correct?
4. No TypeScript errors?
```

**Problem:** Shared components not found
```
Check:
1. Import path: '@/components/games/shared'
2. Running from learning-adventures-app directory?
3. Dependencies installed?
```

**Problem:** Callbacks not firing
```
Check:
1. Props destructured: { onExit, onComplete, onProgress }
2. Optional chaining used: onComplete?.(score)
3. Callbacks passed from parent?
```

### Course Issues

**Problem:** Lessons not unlocking
```
Check:
1. Previous lesson marked complete in database?
2. Required score met (if set)?
3. orderIndex correct?
```

**Problem:** XP not awarding
```
Check:
1. Lesson completion callback firing?
2. User enrolled in course?
3. xpReward set on lesson record?
```

---

## Quick Reference

### React Game Checklist

```
[ ] PRD completed (react-game-prd-template.md)
[ ] Main component created with GameProps
[ ] Uses shared components (GameContainer, etc.)
[ ] Uses shared hooks (useGameState, useGameTimer)
[ ] index.ts with createGameRegistration
[ ] Added to gameLoader.ts
[ ] Added to catalogData.ts with componentGame: true
[ ] Tested at /games/[game-id]
```

### Course Checklist

```
[ ] PRD completed (course-prd-template.md)
[ ] All lesson content created
[ ] Quizzes configured with passing scores
[ ] Course record created
[ ] Lesson records created with correct order
[ ] XP rewards set
[ ] First lesson unlocked
[ ] Enrollment tested
[ ] Progression tested
[ ] Certificate tested (if enabled)
```

---

*Last Updated: January 2026*
