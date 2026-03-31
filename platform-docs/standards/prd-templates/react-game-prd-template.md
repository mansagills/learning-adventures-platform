# React Game PRD Template

## Overview

Use this PRD template when creating **React-based educational games** that require platform integration features like progress tracking, shared components, TypeScript type safety, and complex state management.

**When to Use This Template:**
- Games requiring platform progress tracking and achievements
- Complex state management needs (adaptive difficulty, multi-phase gameplay)
- Games using shared UI components (GameContainer, ScoreBoard, GameModal)
- TypeScript projects requiring type safety
- Games with real-time updates or sophisticated interactions

**Use the HTML Game PRD Instead When:**
- Creating simple, standalone games
- Content that needs to be shared as files
- Quick prototypes without platform integration
- See [educational-game-prd-template.md](./educational-game-prd-template.md)

---

## PRD Sections

### 1. Game Overview

```
GAME TITLE: [Your Game Name]

SUBJECT AREA: [math | science | english | history | interdisciplinary]

TARGET GRADES: [K-2 | 3-4 | 5-6] (can select multiple)

DIFFICULTY: [easy | medium | hard]

ESTIMATED TIME: [X-Y minutes]

BRIEF DESCRIPTION:
[2-3 sentences describing the game concept and educational purpose]

GAME ID: [lowercase-hyphenated-name]
Example: math-quest-adventure, fraction-pizza-challenge
```

---

### 2. Learning Objectives

```
PRIMARY OBJECTIVE:
By the end of this game, students will be able to [VERB] [WHAT] [CONDITIONS] with [ACCURACY].

Example:
"By the end of this game, students will be able to solve multi-step multiplication problems by selecting correct answers to power their spaceship, achieving 80% accuracy."

SUPPORTING OBJECTIVES:
1. [Students will VERB...]
2. [Students will VERB...]
3. [Students will VERB...]

SKILLS PRACTICED:
- [Skill 1]
- [Skill 2]
- [Skill 3]

CURRICULUM ALIGNMENT:
- Common Core: [Standard ID and description]
- NGSS: [If science-related]
```

---

### 3. Platform Integration Requirements

#### Required Callbacks

```typescript
// Your game component MUST accept and use these props:

interface GameProps {
  onExit?: () => void;        // Called when player exits game
  onComplete?: (score: number) => void;  // Called when game ends
  onProgress?: (progress: number) => void; // Called to report progress (0-100)
}

// Implementation:
const YourGame: React.FC<GameProps> = ({ onExit, onComplete, onProgress }) => {
  // Call onProgress during gameplay
  useEffect(() => {
    onProgress?.(currentProgress);
  }, [currentProgress]);

  // Call onComplete when game ends
  const handleGameEnd = () => {
    onComplete?.(finalScore);
  };

  // Call onExit when player leaves
  const handleExit = () => {
    onExit?.();
  };
};
```

#### Shared Components to Use

```
Required shared components from @/components/games/shared:

[ ] GameContainer - Main wrapper with header, progress bar, exit button
[ ] GameButton - Styled buttons with variants (primary, success, danger, etc.)
[ ] ScoreBoard - Display score, lives, level, time, badges
[ ] GameModal - Dialogs for pause, game over, achievements

Example imports:
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  GameModal,
  useGameState,
  useGameTimer,
} from '@/components/games/shared';
```

#### Required Hooks

```
[ ] useGameState - State management for score, lives, level, achievements
[ ] useGameTimer - Timer functionality with callbacks

useGameState configuration:
const { gameState, actions } = useGameState({
  initialScore: [NUMBER],
  initialLevel: [NUMBER],
  initialLives: [NUMBER],
  onGameOver: () => { /* handler */ },
  onLevelUp: (level) => { /* handler */ },
  onAchievement: (name) => { /* handler */ }
});

useGameTimer configuration:
const { time, isRunning, actions: timerActions } = useGameTimer({
  initialTime: [SECONDS],
  countDown: [true | false],
  onTimeUp: () => { /* handler */ },
  autoStart: [true | false]
});
```

---

### 4. Game Design

#### 70/30 Rule Compliance

```
ENTERTAINMENT ELEMENTS (70%):
- [Visual engagement element]
- [Reward/achievement system]
- [Progressive challenge]
- [Animation/feedback]

LEARNING ELEMENTS (30%):
- [Core educational mechanic]
- [Skill reinforcement approach]
- [Knowledge assessment method]
```

#### Game Mechanics

```
CORE MECHANIC:
[Describe the main gameplay interaction]

PROGRESSION SYSTEM:
- Levels: [Number of levels and what changes]
- Difficulty Scaling: [How difficulty increases]
- Unlock Conditions: [Score/accuracy requirements]

LIVES/ATTEMPTS SYSTEM:
- Starting Lives: [Number]
- How Lives Are Lost: [Conditions]
- Extra Lives: [How earned, if applicable]

SCORING SYSTEM:
- Base Points: [Points per correct action]
- Bonus Points: [Time bonus, streak bonus, etc.]
- Multipliers: [Level multiplier, difficulty multiplier]

FEEDBACK SYSTEM:
- Correct Answer: [Visual + audio feedback]
- Incorrect Answer: [Feedback + hint approach]
- Level Complete: [Celebration + summary]
- Game Over: [Display + retry options]
```

#### State Management

```typescript
// Define your game's state structure:

interface GameState {
  // Core game state
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;

  // Phase/mode tracking
  gamePhase: 'intro' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';

  // Content
  questions: Question[];
  currentOptions: Option[];

  // UI state
  showHint: boolean;
  showExplanation: boolean;
  selectedAnswer: string | null;
}

// Actions your game needs:
type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' };
```

---

### 5. Educational Content

```
CONTENT CATEGORIES:
List the specific content areas covered (e.g., "multiplication facts 0-12")

QUESTION TYPES:
[ ] Multiple choice (4 options)
[ ] True/False
[ ] Fill in the blank
[ ] Drag and drop
[ ] Matching
[ ] Sequencing/Ordering
[ ] Other: [Describe]

DIFFICULTY DISTRIBUTION:
- Easy: [X]% of questions - [Description]
- Medium: [X]% of questions - [Description]
- Hard: [X]% of questions - [Description]

SAMPLE CONTENT (provide 5-10 examples):

Question 1:
- Prompt: "[Question text]"
- Correct Answer: "[Answer]"
- Distractors: "[Wrong answer 1]", "[Wrong answer 2]", "[Wrong answer 3]"
- Difficulty: [easy | medium | hard]
- Explanation: "[Why this is correct]"

Question 2:
[Continue pattern...]

CONTENT PROGRESSION:
[Describe how content difficulty progresses through levels]
```

---

### 6. Visual Design

```
THEME: [Space, underwater, jungle, fantasy castle, etc.]

COLOR PALETTE:
- Primary: [Color for main actions]
- Secondary: [Color for secondary elements]
- Success: [Color for correct feedback] (typically green)
- Error: [Color for incorrect feedback] (typically red)
- Background: [Background colors/gradients]

CHARACTER/MASCOT: [If applicable]
- Name: [Character name]
- Role: [Guide, competitor, narrator]
- Personality: [Brief description]

KEY UI ELEMENTS:
- Header: [What to display - title, score, timer]
- Main Area: [Game board, question display]
- Footer/Controls: [Buttons, navigation]

ANIMATIONS:
- Question Appear: [Fade in, slide in, etc.]
- Correct Answer: [Celebration effect]
- Incorrect Answer: [Gentle shake, hint reveal]
- Level Transition: [How levels transition]
- Score Update: [How score animates]

RESPONSIVE BREAKPOINTS:
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+
```

---

### 7. Component Architecture

```
FILE STRUCTURE:
components/games/[game-id]/
├── [GameName].tsx          # Main game component
├── index.ts                # Registration export
├── components/             # Game-specific components
│   ├── QuestionCard.tsx
│   ├── AnswerOption.tsx
│   ├── GameBoard.tsx
│   └── [Other components]
├── hooks/                  # Custom hooks (if needed)
│   └── useGameLogic.ts
├── types.ts                # TypeScript interfaces
└── utils.ts                # Helper functions

COMPONENT BREAKDOWN:

Main Component ([GameName].tsx):
- Responsibilities: [List main responsibilities]
- Uses shared: [GameContainer, useGameState, etc.]

QuestionCard.tsx:
- Purpose: [Display current question]
- Props: [question, onAnswer, etc.]

AnswerOption.tsx:
- Purpose: [Individual answer button]
- Props: [option, selected, correct, onClick]

[Continue for other components...]
```

---

### 8. Game Registration

```typescript
// In your game's index.ts file:

import { createGameRegistration } from '@/lib/gameLoader';

export const [gameName]Registration = createGameRegistration(
  '[game-id]',                    // Must match catalog ID
  {
    name: '[Display Name]',
    description: '[Brief description]',
    category: '[math | science | english | history | interdisciplinary]',
    difficulty: '[easy | medium | hard]',
    skills: ['[Skill 1]', '[Skill 2]', '[Skill 3]'],
  },
  () => import('./[GameName]')    // Lazy load
);

// Add to lib/gameLoader.ts initializeGameRegistry():
import { [gameName]Registration } from '@/components/games/[game-id]';

export function initializeGameRegistry() {
  // ... existing registrations
  [gameName]Registration();
}
```

---

### 9. Catalog Metadata

```typescript
// Add to lib/catalogData.ts in appropriate array:

{
  id: '[game-id]',                    // Must match registration
  title: '[Display Title]',
  description: '[1-2 sentence description for catalog]',
  type: 'game',
  category: '[math | science | english | history | interdisciplinary]',
  gradeLevel: ['3', '4', '5'],        // Strings, not numbers
  difficulty: '[easy | medium | hard]',
  skills: ['[Skill 1]', '[Skill 2]', '[Skill 3]'],
  estimatedTime: '[X-Y mins]',
  featured: [true | false],
  componentGame: true,                 // REQUIRED for React games
  // NO htmlPath for React games
}
```

**IMPORTANT:** React games use `componentGame: true` and do NOT have an `htmlPath`.

---

### 10. Accessibility Requirements

```
KEYBOARD NAVIGATION:
[ ] All interactive elements focusable via Tab
[ ] Enter/Space activates buttons and options
[ ] Escape pauses game or closes modals
[ ] Arrow keys for navigation where appropriate
[ ] Visible focus indicators (3px outline minimum)

SCREEN READER SUPPORT:
[ ] ARIA labels on all interactive elements
[ ] aria-live regions for score/feedback updates
[ ] Meaningful button text (not just "Click here")
[ ] Game state announced to screen readers

COLOR & CONTRAST:
[ ] 4.5:1 contrast ratio for text
[ ] 3:1 contrast ratio for UI elements
[ ] Information not conveyed by color alone
[ ] Works in high contrast mode

MOTION & TIMING:
[ ] Respects prefers-reduced-motion
[ ] No content flashes more than 3 times per second
[ ] Pause functionality available
[ ] Adequate time for reading/responding
```

---

### 11. Testing Checklist

```
FUNCTIONAL TESTING:
[ ] Game starts correctly
[ ] All questions display properly
[ ] Correct answers register and score
[ ] Incorrect answers handled appropriately
[ ] Level progression works
[ ] Game over triggers at correct conditions
[ ] Exit callback fires correctly
[ ] Progress callback reports accurately
[ ] Complete callback fires with correct score

PLATFORM INTEGRATION:
[ ] Registered in gameLoader.ts
[ ] Lazy loading works
[ ] GameContainer displays correctly
[ ] ScoreBoard updates properly
[ ] GameModal opens/closes correctly
[ ] useGameState actions work
[ ] useGameTimer functions correctly

RESPONSIVE TESTING:
[ ] Mobile (375px) - touch targets 44px+
[ ] Tablet (768px) - layout adjusts
[ ] Desktop (1024px+) - full experience

ACCESSIBILITY TESTING:
[ ] Keyboard-only navigation complete
[ ] Screen reader announces correctly
[ ] Color contrast passes
[ ] Focus indicators visible

CROSS-BROWSER:
[ ] Chrome
[ ] Firefox
[ ] Safari
[ ] Edge
```

---

### 12. AI Tool Instructions

When using an AI coding tool to generate this game, include these instructions:

```
CRITICAL REQUIREMENTS:

1. PLATFORM INTEGRATION:
   - Use shared components from @/components/games/shared
   - Import GameContainer, GameButton, ScoreBoard, GameModal
   - Use useGameState and useGameTimer hooks
   - Accept and use GameProps (onExit, onComplete, onProgress)

2. TYPESCRIPT:
   - Use TypeScript with strict mode
   - Define interfaces for all props and state
   - Use proper typing for all functions

3. STYLING:
   - Use Tailwind CSS for styling
   - Follow responsive breakpoints
   - Match Learning Adventures visual style

4. REGISTRATION:
   - Create index.ts with createGameRegistration
   - Export registration function

5. NO EXTERNAL DEPENDENCIES:
   - Do not use external npm packages
   - Use only platform-provided components
   - All game logic must be self-contained

6. STATE MANAGEMENT:
   - Use useGameState for score/lives/level
   - Use React useState for component-specific state
   - Implement proper game phase transitions
```

---

### 13. Example Prompt for AI Tools

```
Create a React educational game for the Learning Adventures platform.

GAME SPECIFICATION:
[Paste filled sections 1-6 above]

TECHNICAL REQUIREMENTS:
- React component with TypeScript
- Use Tailwind CSS for styling
- Import from @/components/games/shared:
  - GameContainer (wrapper with header, exit, progress)
  - GameButton (styled buttons with variants)
  - ScoreBoard (score, lives, level, time display)
  - GameModal (pause, game over dialogs)
  - useGameState (score, lives, level management)
  - useGameTimer (countdown/countup timer)

- Accept GameProps: { onExit?, onComplete?, onProgress? }
- Call onProgress(0-100) during gameplay
- Call onComplete(score) when game ends
- Call onExit() when player exits

- Create these files:
  1. [GameName].tsx - Main component
  2. index.ts - Registration with createGameRegistration
  3. types.ts - TypeScript interfaces
  4. Any additional components needed

DO NOT use any external libraries. Only use the shared components provided.
```

---

## Quick Reference

### Shared Imports

```typescript
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  GameModal,
  useGameState,
  useGameTimer,
  GameProps,
} from '@/components/games/shared';
```

### Minimum Required Files

1. `[GameName].tsx` - Main component accepting GameProps
2. `index.ts` - Registration export

### Catalog Entry (React Games)

```typescript
{
  id: 'game-id',
  title: 'Game Title',
  // ... other metadata
  componentGame: true,  // Required
  // NO htmlPath
}
```

### Registration Pattern

```typescript
createGameRegistration(
  'game-id',
  { name, description, category, difficulty, skills },
  () => import('./GameComponent')
);
```

---

*Last Updated: January 2026*
