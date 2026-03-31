# React Game Component Skill

## 🎯 Purpose
Build educational games as React components that integrate seamlessly with the Learning Adventures platform's shared utilities, state management, and progress tracking systems. This skill provides patterns, best practices, and complete examples for creating modern, maintainable React-based educational games.

---

## 📚 When to Use This Skill

### ✅ Use React Components When:
- Creating games that require complex state management
- Building games with platform integration (progress, achievements)
- Developing reusable, testable game components
- Implementing games with TypeScript type safety
- Creating games that share utilities across multiple features
- Building games that require modular, component-based architecture

### ❌ Use HTML Files Instead When:
- Creating simple, self-contained games without platform features
- Building games that need to be easily shared as standalone files
- Developing games for clients without React infrastructure
- Creating quick prototypes or demonstrations
- Refer to **educational-game-builder** skill for HTML-based games

---

## 🏗️ Architecture Overview

### Directory Structure
```
components/games/
├── shared/                           # Shared utilities (DO NOT MODIFY)
│   ├── GameContainer.tsx            # Main game wrapper component
│   ├── GameButton.tsx               # Styled button component
│   ├── ScoreBoard.tsx               # Score display component
│   ├── GameModal.tsx                # Modal dialog component
│   ├── hooks/
│   │   ├── useGameState.ts          # Game state management hook
│   │   └── useGameTimer.ts          # Timer/countdown hook
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── index.ts                     # Public exports
│
└── [your-game-name]/                # Your game directory
    ├── YourGame.tsx                 # Main game component (required)
    ├── index.ts                     # Game registration (required)
    ├── components/                  # Game-specific components (optional)
    │   ├── QuestionCard.tsx
    │   ├── GameBoard.tsx
    │   └── AnswerOption.tsx
    ├── hooks/                       # Custom hooks (optional)
    │   └── useGameLogic.ts
    ├── types.ts                     # Game-specific types (optional)
    └── utils.ts                     # Helper functions (optional)
```

### Integration Flow
```
1. User navigates to /games/[game-id]
2. Dynamic route loads game via gameLoader
3. gameLoader looks up game in registry
4. Game component lazy-loaded
5. Component receives GameProps (onExit, onComplete, onProgress)
6. Game uses shared hooks and components
7. On completion, calls onComplete(score)
8. Platform tracks progress automatically
```

---

## 🎓 Shared Components Reference

### GameContainer
Wrapper component providing consistent game UI layout with header, progress bar, and exit functionality.

```typescript
import { GameContainer } from '@/components/games/shared';

<GameContainer
  title="Math Challenge"              // Game title in header
  onExit={handleExit}                 // Exit callback
  showProgress={true}                 // Show progress bar?
  progress={75}                       // Progress percentage (0-100)
  className="custom-class"            // Optional custom classes
>
  {/* Your game content here */}
</GameContainer>
```

**Features**:
- Gradient background (blue to purple)
- Fixed header with title and exit button
- Optional progress bar (0-100%)
- Responsive layout with max-width container

---

### GameButton
Styled button component with variants and sizes.

```typescript
import { GameButton } from '@/components/games/shared';

<GameButton
  onClick={handleClick}
  disabled={false}
  variant="primary"                   // primary | secondary | success | warning | danger
  size="md"                          // sm | md | lg
  className="custom-class"
>
  Click Me
</GameButton>
```

**Variants**:
- `primary`: Blue button (default)
- `secondary`: Gray button
- `success`: Green button
- `warning`: Yellow button
- `danger`: Red button

**Sizes**:
- `sm`: Small (px-3 py-2 text-sm)
- `md`: Medium (px-6 py-3 text-base) - default
- `lg`: Large (px-8 py-4 text-lg)

**Built-in Features**:
- Hover scale animation
- Active state press effect
- Disabled state styling
- Shadow effects

---

### ScoreBoard
Display game metrics (score, level, lives, time, badges).

```typescript
import { ScoreBoard } from '@/components/games/shared';

<ScoreBoard
  score={1500}                        // Current score (required)
  level={3}                           // Current level (optional)
  lives={3}                           // Remaining lives (optional)
  timeRemaining={45}                  // Seconds remaining (optional)
  badges={['First Win', 'Speed']}    // Achievement badges (optional)
  className="custom-class"
/>
```

**Features**:
- Automatic number formatting with commas
- Visual lives indicator (red dots)
- Timer with color warning (red when ≤30s)
- Badge display (shows first 3, +N more)
- Responsive grid layout

---

### GameModal
Modal dialog for pause screens, game over, achievements, etc.

```typescript
import { GameModal } from '@/components/games/shared';

<GameModal
  isOpen={showModal}
  onClose={handleClose}
  title="Game Paused"
  type="info"                         // info | success | warning | error
  showCloseButton={true}              // Show X button?
>
  <p>Your modal content here</p>
</GameModal>
```

**Types**:
- `info`: Blue styling (default)
- `success`: Green styling
- `warning`: Yellow styling
- `error`: Red styling

**Features**:
- Backdrop blur effect
- Click outside to close (unless disabled)
- Optional close button
- Centered layout
- Type-based color theming

---

## 🎮 Platform Hooks Reference

### useGameState Hook
Comprehensive game state management with score, lives, levels, and achievements.

```typescript
import { useGameState } from '@/components/games/shared';

const { gameState, actions } = useGameState({
  initialScore: 0,
  initialLevel: 1,
  initialLives: 3,
  maxLives: 5,
  onGameOver: () => {
    console.log('Game Over!');
  },
  onLevelUp: (newLevel) => {
    console.log(`Leveled up to ${newLevel}!`);
  },
  onAchievement: (achievement) => {
    console.log(`Earned: ${achievement}`);
  }
});
```

**State Properties**:
```typescript
gameState.score          // Current score (number)
gameState.level          // Current level (number)
gameState.lives          // Remaining lives (number)
gameState.isGameOver     // Game over state (boolean)
gameState.isPaused       // Pause state (boolean)
gameState.timeElapsed    // Elapsed time in seconds (number)
gameState.achievements   // Array of achievement strings
```

**Actions**:
```typescript
actions.addScore(points)           // Add points to score
actions.loseLife()                 // Decrease lives by 1
actions.gainLife()                 // Increase lives by 1 (up to maxLives)
actions.levelUp()                  // Increase level by 1
actions.pauseGame()                // Set isPaused to true
actions.resumeGame()               // Set isPaused to false
actions.resetGame()                // Reset all state to initial values
actions.addAchievement(name)       // Add achievement (no duplicates)
```

**Auto Features**:
- Automatic time tracking (increments every second)
- Pauses timer when game is paused or over
- Triggers onGameOver when lives reach 0
- Prevents duplicate achievements

---

### useGameTimer Hook
Flexible timer for countdowns, time tracking, and timed challenges.

```typescript
import { useGameTimer } from '@/components/games/shared';

const timer = useGameTimer({
  initialTime: 60,                   // Starting time in seconds
  countDown: true,                   // Count down (true) or up (false)
  onTimeUp: () => {
    console.log('Time is up!');
  },
  onTick: (currentTime) => {
    console.log(`Time: ${currentTime}s`);
  },
  autoStart: true                    // Start immediately?
});
```

**State Properties**:
```typescript
timer.time              // Current time in seconds (number)
timer.isRunning         // Timer running? (boolean)
timer.isFinished        // Timer finished? (boolean)
timer.formattedTime     // Formatted as "M:SS" (string)
```

**Actions**:
```typescript
timer.actions.start()      // Start the timer
timer.actions.pause()      // Pause the timer
timer.actions.reset()      // Reset to initialTime
timer.actions.stop()       // Stop and mark as finished
timer.actions.addTime(n)   // Add/subtract seconds (can be negative)
```

**Time Formatting**:
```typescript
timer.formattedTime        // "5:32" (5 minutes 32 seconds)
```

**Behavior**:
- When `countDown: true`, timer decrements to 0
- Triggers `onTimeUp` when countdown reaches 0
- Calls `onTick` every second with current time
- Automatically cleans up intervals on unmount

---

## 📋 Complete Game Template

### Basic Math Game Example

**File: `components/games/math-quiz/MathQuiz.tsx`**

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

interface Question {
  num1: number;
  num2: number;
  operation: '+' | '-' | '*';
  correctAnswer: number;
}

export default function MathQuiz({ onExit, onComplete }: GameProps) {
  // Initialize game state
  const { gameState, actions } = useGameState({
    initialLives: 3,
    onGameOver: () => setShowGameOverModal(true),
    onLevelUp: (level) => {
      actions.addAchievement(`Reached Level ${level}`);
      if (level === 5) actions.addAchievement('Math Wizard');
    },
  });

  // Initialize timer
  const timer = useGameTimer({
    initialTime: 60,
    countDown: true,
    onTimeUp: () => {
      actions.loseLife();
      if (gameState.lives > 1) {
        // Reset timer for next life
        timer.actions.reset();
        timer.actions.start();
      }
    },
  });

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Generate question based on current level
  const generateQuestion = (): Question => {
    const level = gameState.level;
    const maxNum = Math.min(10 + level * 2, 50);

    // Unlock operations by level
    const operations: Array<'+' | '-' | '*'> = ['+'];
    if (level >= 2) operations.push('-');
    if (level >= 3) operations.push('*');

    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;

    // Ensure subtraction doesn't give negative results
    if (operation === '-' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }

    let correctAnswer: number;
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
    }

    return { num1, num2, operation, correctAnswer };
  };

  // Generate multiple choice options
  const generateOptions = (correct: number): number[] => {
    const options = [correct];
    while (options.length < 4) {
      const variant = correct + Math.floor(Math.random() * 20) - 10;
      if (variant > 0 && !options.includes(variant)) {
        options.push(variant);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null || gameState.isPaused) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer === currentQuestion?.correctAnswer) {
      // Correct answer
      const points = gameState.level * 10;
      actions.addScore(points);
      timer.actions.addTime(5); // Bonus time

      // Level up every 50 points
      if ((gameState.score + points) >= gameState.level * 50) {
        actions.levelUp();
      }
    } else {
      // Wrong answer
      actions.loseLife();
    }

    // Move to next question after delay
    setTimeout(() => {
      if (!gameState.isGameOver) {
        setCurrentQuestion(generateQuestion());
        setSelectedAnswer(null);
        setShowFeedback(false);
        timer.actions.reset();
        timer.actions.start();
      }
    }, 1500);
  };

  // Pause/Resume
  const handlePauseToggle = () => {
    if (gameState.isPaused) {
      actions.resumeGame();
      timer.actions.start();
      setShowPauseModal(false);
    } else {
      actions.pauseGame();
      timer.actions.pause();
      setShowPauseModal(true);
    }
  };

  // Restart game
  const handleRestart = () => {
    actions.resetGame();
    timer.actions.reset();
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowGameOverModal(false);
    timer.actions.start();
  };

  // Exit game
  const handleExit = () => {
    if (onComplete) {
      onComplete(gameState.score);
    }
    onExit?.();
  };

  // Initialize game on mount
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
    timer.actions.start();
  }, []);

  // Generate options for current question
  const answerOptions = currentQuestion
    ? generateOptions(currentQuestion.correctAnswer)
    : [];

  return (
    <GameContainer
      title="Math Quiz Challenge"
      onExit={handleExit}
      showProgress
      progress={(gameState.score / (gameState.level * 50)) * 100}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Score Board */}
        <div className="flex justify-between items-center mb-6">
          <ScoreBoard
            score={gameState.score}
            level={gameState.level}
            lives={gameState.lives}
            timeRemaining={timer.time}
            badges={gameState.achievements}
          />
          <GameButton
            onClick={handlePauseToggle}
            variant="secondary"
            size="sm"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </GameButton>
        </div>

        {/* Question Display */}
        {currentQuestion && !gameState.isGameOver && (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-8">
                {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
              </h2>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {answerOptions.map((option, index) => (
                  <GameButton
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null || gameState.isPaused}
                    variant={
                      selectedAnswer === null
                        ? 'primary'
                        : option === currentQuestion.correctAnswer
                        ? 'success'
                        : option === selectedAnswer
                        ? 'danger'
                        : 'secondary'
                    }
                    size="lg"
                    className="h-16 text-2xl"
                  >
                    {option}
                  </GameButton>
                ))}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className="mt-6 text-xl font-bold">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <div className="text-green-600">
                      🎉 Correct! +{gameState.level * 10} points
                    </div>
                  ) : (
                    <div className="text-red-600">
                      ❌ Wrong! The answer was {currentQuestion.correctAnswer}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pause Modal */}
        <GameModal
          isOpen={showPauseModal}
          onClose={() => {}}
          title="Game Paused"
          showCloseButton={false}
        >
          <div className="text-center">
            <p className="text-gray-600 mb-6">Take a break! Ready to continue?</p>
            <GameButton onClick={handlePauseToggle} variant="primary">
              Resume Game
            </GameButton>
          </div>
        </GameModal>

        {/* Game Over Modal */}
        <GameModal
          isOpen={showGameOverModal}
          onClose={() => {}}
          title="Game Over"
          type="info"
          showCloseButton={false}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-600 mb-2">
              Final Score: <span className="font-bold text-purple-600 text-2xl">{gameState.score}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Level Reached: <span className="font-bold">{gameState.level}</span>
            </p>
            {gameState.achievements.length > 0 && (
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">Achievements:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.achievements.map((achievement, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <GameButton onClick={handleRestart} variant="primary">
                Play Again
              </GameButton>
              <GameButton onClick={handleExit} variant="secondary">
                Exit
              </GameButton>
            </div>
          </div>
        </GameModal>
      </div>
    </GameContainer>
  );
}
```

**File: `components/games/math-quiz/index.ts`**

```typescript
import { createGameRegistration } from '@/lib/gameLoader';

// Register this game component
createGameRegistration(
  'math-quiz',                        // Game ID (must match catalog entry)
  {
    name: 'Math Quiz Challenge',
    description: 'Test your math skills with addition, subtraction, and multiplication!',
    category: 'math',
    difficulty: 'easy',
    estimatedTime: 10,
    skills: ['Addition', 'Subtraction', 'Multiplication', 'Mental Math'],
    gradeLevel: '2nd-5th Grade',
  },
  () => import('./MathQuiz')          // Lazy load the component
);

export { default } from './MathQuiz';
```

---

## 🎨 Advanced Patterns

### Pattern 1: Adaptive Difficulty

```typescript
// Adjust difficulty based on player performance
const [difficultyMultiplier, setDifficultyMultiplier] = useState(1.0);
const [recentCorrect, setRecentCorrect] = useState<boolean[]>([]);

const adjustDifficulty = (wasCorrect: boolean) => {
  const updated = [...recentCorrect, wasCorrect].slice(-10); // Last 10 answers
  setRecentCorrect(updated);

  const accuracy = updated.filter(Boolean).length / updated.length;

  if (accuracy > 0.8 && difficultyMultiplier < 2.0) {
    setDifficultyMultiplier(prev => Math.min(prev + 0.1, 2.0));
  } else if (accuracy < 0.4 && difficultyMultiplier > 0.5) {
    setDifficultyMultiplier(prev => Math.max(prev - 0.1, 0.5));
  }
};

// Use in question generation
const maxNum = Math.floor((10 + gameState.level * 2) * difficultyMultiplier);
```

### Pattern 2: Hint System

```typescript
const [hintsRemaining, setHintsRemaining] = useState(3);
const [showHint, setShowHint] = useState(false);

const useHint = () => {
  if (hintsRemaining > 0) {
    setHintsRemaining(prev => prev - 1);
    setShowHint(true);
    actions.addScore(-5); // Small penalty
  }
};

// In render
{hintsRemaining > 0 && (
  <GameButton
    onClick={useHint}
    variant="warning"
    size="sm"
  >
    💡 Hint ({hintsRemaining})
  </GameButton>
)}

{showHint && (
  <div className="text-sm text-blue-600 mt-2">
    Try eliminating the obviously wrong answers first!
  </div>
)}
```

### Pattern 3: Progress Persistence

```typescript
import { useEffect } from 'react';

const STORAGE_KEY = 'math-quiz-progress';

// Load saved progress on mount
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    // Restore state (implement carefully to avoid issues)
    actions.addScore(data.score - gameState.score);
    // ... restore other state
  }
}, []);

// Save progress on state change
useEffect(() => {
  const data = {
    score: gameState.score,
    level: gameState.level,
    achievements: gameState.achievements,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}, [gameState]);

// Clear on game over
const handleGameOver = () => {
  localStorage.removeItem(STORAGE_KEY);
  setShowGameOverModal(true);
};
```

### Pattern 4: Sound Effects

```typescript
const [soundEnabled, setSoundEnabled] = useState(true);

const playSound = (soundName: 'correct' | 'wrong' | 'levelup') => {
  if (!soundEnabled) return;

  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.volume = 0.3;
  audio.play().catch(() => {
    // Handle autoplay restrictions
  });
};

// Use in game logic
const handleCorrectAnswer = () => {
  actions.addScore(10);
  playSound('correct');
};

// Sound toggle button
<GameButton
  onClick={() => setSoundEnabled(!soundEnabled)}
  variant="secondary"
  size="sm"
>
  {soundEnabled ? '🔊' : '🔇'}
</GameButton>
```

### Pattern 5: Combo/Streak System

```typescript
const [streak, setStreak] = useState(0);
const [maxStreak, setMaxStreak] = useState(0);

const handleCorrectAnswer = () => {
  const newStreak = streak + 1;
  setStreak(newStreak);
  setMaxStreak(Math.max(maxStreak, newStreak));

  // Bonus points for streaks
  const basePoints = gameState.level * 10;
  const bonusMultiplier = Math.min(newStreak * 0.1, 2.0); // Max 2x
  const totalPoints = Math.floor(basePoints * (1 + bonusMultiplier));

  actions.addScore(totalPoints);

  // Achievement for streaks
  if (newStreak === 5) actions.addAchievement('5 in a Row!');
  if (newStreak === 10) actions.addAchievement('Unstoppable!');
};

const handleWrongAnswer = () => {
  setStreak(0);
  actions.loseLife();
};

// Display streak
{streak >= 3 && (
  <div className="text-center text-orange-600 font-bold animate-pulse">
    🔥 {streak} Streak! 🔥
  </div>
)}
```

---

## 📊 TypeScript Type Definitions

### GameProps Interface
```typescript
interface GameProps {
  onExit?: () => void;                // Called when user exits game
  onComplete?: (score: number) => void; // Called when game completes
  onProgress?: (progress: number) => void; // Called on progress updates
  settings?: GameSettings;            // Optional game settings
}
```

### GameSettings Interface
```typescript
interface GameSettings {
  difficulty?: 'easy' | 'medium' | 'hard';
  soundEnabled?: boolean;
  theme?: 'light' | 'dark';
  language?: string;
}
```

### Custom Game State Example
```typescript
interface WordGameState {
  currentWord: string;
  guessedLetters: string[];
  remainingGuesses: number;
  wordsCompleted: number;
  category: string;
}
```

---

## ✅ Quality Checklist

### Component Quality
- [ ] Uses TypeScript for type safety
- [ ] Follows React best practices (hooks rules, component composition)
- [ ] Components are modular and reusable
- [ ] State management is clear and predictable
- [ ] Effects have proper cleanup (timers, listeners)
- [ ] No memory leaks (useEffect cleanup)
- [ ] Proper dependency arrays in hooks

### Platform Integration
- [ ] Uses shared hooks (`useGameState`, `useGameTimer`)
- [ ] Wrapped in `GameContainer` component
- [ ] Uses shared UI components (`GameButton`, `ScoreBoard`, `GameModal`)
- [ ] Properly registered in `index.ts` file
- [ ] Catalog entry has `componentGame: true`
- [ ] Catalog entry does NOT have `htmlPath`
- [ ] Game ID matches across all files

### Educational Quality
- [ ] Clear learning objectives
- [ ] Immediate feedback on answers
- [ ] Progressive difficulty
- [ ] Encouragement and positive reinforcement
- [ ] Achievement rewards

### Technical Quality
- [ ] No console errors or warnings
- [ ] Responsive design (mobile-friendly)
- [ ] Keyboard accessible
- [ ] Loading states handled
- [ ] Error boundaries (if needed)
- [ ] Performance optimized (memoization if needed)

### User Experience
- [ ] Clear instructions
- [ ] Visual feedback on interactions
- [ ] Smooth animations
- [ ] Intuitive controls
- [ ] Pause/resume functionality
- [ ] Proper exit handling
- [ ] Game over state

---

## 🚀 Deployment Checklist

### Step 1: Create Game Component
1. [ ] Create game directory: `components/games/[game-id]/`
2. [ ] Create main component: `[GameName].tsx`
3. [ ] Implement game logic using shared hooks
4. [ ] Use shared components for UI
5. [ ] Add proper TypeScript types
6. [ ] Test locally

### Step 2: Register Game
1. [ ] Create `index.ts` in game directory
2. [ ] Use `createGameRegistration()` to register
3. [ ] Provide accurate metadata
4. [ ] Use lazy loading for component import
5. [ ] Export default component

### Step 3: Update Catalog
1. [ ] Add entry to `lib/catalogData.ts`
2. [ ] Set `componentGame: true`
3. [ ] Remove `htmlPath` (if present)
4. [ ] Match game ID exactly
5. [ ] Provide accurate metadata

### Step 4: Test Integration
1. [ ] Navigate to `/games/[game-id]`
2. [ ] Verify game loads correctly
3. [ ] Test all game mechanics
4. [ ] Test pause/resume
5. [ ] Test exit button
6. [ ] Verify onComplete callback
7. [ ] Check progress tracking
8. [ ] Verify achievement triggers

### Step 5: Initialize Registry
1. [ ] Import game in `lib/gameLoader.ts` `initializeGameRegistry()`
2. [ ] Restart development server
3. [ ] Verify game appears in registry

---

## 🎯 Game Ideas by Subject

### Math Games
- **Number Ninja**: Fast-paced arithmetic with time pressure
- **Fraction Frenzy**: Visual fraction comparison and addition
- **Geometry Dash**: Shape recognition and properties
- **Math Escape Room**: Multi-step problem solving
- **Equation Balance**: Algebra balancing game

### Science Games
- **Element Explorer**: Periodic table matching
- **Food Chain Builder**: Ecosystem construction
- **States of Matter**: Phase change simulator
- **Solar System Race**: Planet facts and distances
- **Cell Factory**: Organelle function matching

### English Games
- **Word Detective**: Vocabulary in context
- **Grammar Gladiator**: Sentence correction
- **Story Builder**: Creative writing prompts
- **Synonym Sprint**: Word relationship speed game
- **Spelling Bee Challenge**: Progressive spelling difficulty

### History Games
- **Timeline Challenge**: Event ordering
- **Map Master**: Geography and historical locations
- **Historical Figures Match**: Biography to person
- **Primary Source Detective**: Document analysis
- **Civilization Builder**: Historical decision making

---

## 🔧 Common Patterns & Solutions

### Problem: State Not Updating Immediately
**Solution**: Use functional updates

```typescript
// ❌ Bad
actions.addScore(10);
console.log(gameState.score); // Still old value!

// ✅ Good
actions.addScore(10);
// Access updated value in next render or use callback
```

### Problem: Timer Not Stopping
**Solution**: Proper cleanup in useEffect

```typescript
useEffect(() => {
  if (gameState.isGameOver) {
    timer.actions.stop();
  }
}, [gameState.isGameOver]);
```

### Problem: Modal Not Closing
**Solution**: Prevent backdrop click when needed

```typescript
<GameModal
  isOpen={showModal}
  onClose={() => {}} // Empty function prevents closing
  showCloseButton={false}
>
```

### Problem: Double Answer Selection
**Solution**: Disable buttons during feedback

```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handleAnswer = async (answer: number) => {
  if (isProcessing) return;
  setIsProcessing(true);

  // Process answer...

  setTimeout(() => {
    setIsProcessing(false);
  }, 1500);
};
```

---

## 📚 Resources

### Official Documentation
- **React Hooks**: https://react.dev/reference/react
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Internal Resources
- **Shared Components**: `components/games/shared/`
- **Game Loader**: `lib/gameLoader.ts`
- **Catalog Data**: `lib/catalogData.ts`
- **Sample Game**: `components/games/sample-math-game/`

### Related Skills
- **educational-game-builder**: For HTML-based games
- **catalog-metadata-formatter**: For catalog entries
- **accessibility-validator**: For accessibility compliance

---

## 🎓 Quick Reference

### Import Statement
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

### Minimal Game Structure
```typescript
export default function MyGame({ onExit, onComplete }: GameProps) {
  const { gameState, actions } = useGameState();
  const timer = useGameTimer({ initialTime: 60, countDown: true });

  return (
    <GameContainer title="My Game" onExit={onExit}>
      <ScoreBoard score={gameState.score} />
      {/* Your game content */}
    </GameContainer>
  );
}
```

### Registration Template
```typescript
import { createGameRegistration } from '@/lib/gameLoader';

createGameRegistration(
  'game-id',
  {
    name: 'Game Name',
    description: 'Game description',
    category: 'math',
    difficulty: 'easy',
    estimatedTime: 10,
    skills: ['Skill 1', 'Skill 2'],
    gradeLevel: '2nd-5th Grade',
  },
  () => import('./MyGame')
);

export { default } from './MyGame';
```

---

**Version**: 1.0
**Last Updated**: October 2024
**Maintained By**: Learning Adventures Platform Team
