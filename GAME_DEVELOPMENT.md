# Game Development Workflow for Learning Adventures Platform

## 📋 Overview

This guide provides comprehensive instructions for teams to contribute React-based games to the Learning Adventures Platform. The platform now supports both traditional HTML games and modern React component games with shared utilities and state management.

## 🏗️ Architecture

### Component-Based Game System

```
learning-adventures-app/
├── components/
│   └── games/
│       ├── shared/                    # Shared utilities and components
│       │   ├── GameContainer.tsx      # Main game wrapper
│       │   ├── GameButton.tsx         # Styled game buttons
│       │   ├── ScoreBoard.tsx         # Score display component
│       │   ├── GameModal.tsx          # Game modals (pause, game over)
│       │   ├── hooks/
│       │   │   ├── useGameState.ts    # Game state management
│       │   │   └── useGameTimer.ts    # Timer functionality
│       │   ├── types/                 # TypeScript definitions
│       │   └── index.ts               # Shared exports
│       ├── [your-game-name]/          # Your game directory
│       │   ├── YourGameComponent.tsx  # Main game component
│       │   └── index.ts               # Game registration
├── app/
│   └── games/
│       └── [gameId]/
│           └── page.tsx               # Dynamic game route
├── lib/
│   ├── catalogData.ts                 # Game catalog metadata
│   └── gameLoader.ts                  # Dynamic component loading
```

## 🚀 Quick Start Guide

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/learning-adventures-platform.git
cd learning-adventures-platform/learning-adventures-app
npm install
npm run dev
```

### 2. Create Your Game

```bash
# Create your game directory
mkdir -p components/games/my-awesome-game

# Copy the sample game as a template (optional)
cp -r components/games/sample-math-game components/games/my-awesome-game
```

### 3. Develop Your Game Component

Create `components/games/my-awesome-game/MyAwesomeGame.tsx`:

```tsx
'use client';

import React from 'react';
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  GameModal,
  useGameState,
  useGameTimer,
  GameProps,
} from '@/components/games/shared';

export default function MyAwesomeGame({ onExit, onComplete }: GameProps) {
  const { gameState, actions } = useGameState({
    initialLives: 3,
    onGameOver: () => {
      if (onComplete) onComplete(gameState.score);
    },
  });

  const timer = useGameTimer({
    initialTime: 60,
    countDown: true,
    onTimeUp: () => actions.loseLife(),
  });

  // Your game logic here

  return (
    <GameContainer
      title="My Awesome Game"
      onExit={onExit}
      showProgress
      progress={50} // Your progress calculation
    >
      <div className="max-w-4xl mx-auto p-6">
        <ScoreBoard
          score={gameState.score}
          level={gameState.level}
          lives={gameState.lives}
          timeRemaining={timer.time}
        />

        {/* Your game content */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">Game Content Goes Here</h2>
          <GameButton onClick={() => actions.addScore(10)}>
            Score Points!
          </GameButton>
        </div>
      </div>
    </GameContainer>
  );
}
```

### 4. Register Your Game

Create `components/games/my-awesome-game/index.ts`:

```tsx
import { createGameRegistration } from '@/lib/gameLoader';

// Register this game component
createGameRegistration(
  'my-awesome-game', // Unique game ID
  {
    name: 'My Awesome Game',
    description: 'An amazing educational game that teaches...',
    category: 'math', // or 'science'
    difficulty: 'medium', // 'easy', 'medium', or 'hard'
    estimatedTime: 15, // in minutes
    skills: ['Problem Solving', 'Critical Thinking'],
    gradeLevel: '3rd-5th Grade',
  },
  () => import('./MyAwesomeGame') // Dynamic import
);

export { default } from './MyAwesomeGame';
```

### 5. Add to Testing System (REQUIRED Before Catalog)

**IMPORTANT**: All games must go through the testing system before being added to the catalog.

Add your game to the test games database using the utility script:

```bash
# For React component games
npm run add-test-game -- --component=my-awesome-game

# For HTML games
npm run add-test-game -- --file=my-game.html

# Interactive mode (asks for all metadata)
npm run add-test-game -- --interactive
```

This will:
- Add the game to the TestGame database with status "NOT_TESTED"
- Make it accessible for testing at `/games/[game-id]`
- Show it in the admin testing dashboard at `/internal/testing`
- NOT add it to the public catalog yet

### 6. Test Your Game

```bash
# Start development server
npm run dev

# Navigate to your game directly
http://localhost:3000/games/my-awesome-game

# Access the admin testing dashboard (requires ADMIN role)
http://localhost:3000/internal/testing
```

### 7. Get Approval

1. **Test the game yourself** at the direct URL
2. **Submit for review** by updating status to "IN_TESTING" in the admin dashboard
3. **Team reviews** the game using the testing dashboard:
   - Educational quality
   - Technical quality
   - Accessibility compliance
   - Age appropriateness
   - Engagement level
4. **Receive feedback** and make necessary revisions
5. **Get approval** from admin team members

### 8. Promote to Catalog (ADMIN ONLY)

Once approved, an admin can promote the game to the public catalog:

1. Log in as ADMIN
2. Go to `/internal/testing`
3. Find your game (should have "APPROVED" status)
4. Click "🚀 Promote to Catalog"
5. Game is automatically added to `lib/catalogData.ts`
6. Game appears in public catalog at `/catalog`

## 🎮 Shared Components Reference

### GameContainer

Main wrapper for all games with consistent styling and navigation.

```tsx
<GameContainer
  title="Game Title"
  onExit={() => {}} // Called when user exits
  showProgress={true} // Show progress bar
  progress={75} // Progress percentage (0-100)
>
  {/* Your game content */}
</GameContainer>
```

### GameButton

Styled buttons with consistent look and hover effects.

```tsx
<GameButton
  onClick={() => {}}
  variant="primary" // primary, secondary, success, warning, danger
  size="md" // sm, md, lg
  disabled={false}
>
  Click Me!
</GameButton>
```

### ScoreBoard

Display game metrics and progress.

```tsx
<ScoreBoard
  score={1000}
  level={3}
  lives={2}
  timeRemaining={45}
  badges={['Speed Demon', 'Perfect Score']}
/>
```

### GameModal

Modal dialogs for game states (pause, game over, etc.).

```tsx
<GameModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Game Paused"
  type="info" // info, success, warning, error
>
  <p>Game content here</p>
</GameModal>
```

## 🎯 Hooks Reference

### useGameState

Manages common game state (score, lives, level, etc.).

```tsx
const { gameState, actions } = useGameState({
  initialScore: 0,
  initialLevel: 1,
  initialLives: 3,
  onGameOver: () => {},
  onLevelUp: (level) => {},
  onAchievement: (achievement) => {},
});

// Available actions:
actions.addScore(points);
actions.loseLife();
actions.gainLife();
actions.levelUp();
actions.pauseGame();
actions.resumeGame();
actions.resetGame();
actions.addAchievement('Achievement Name');
```

### useGameTimer

Timer functionality with countdown and elapsed time support.

```tsx
const timer = useGameTimer({
  initialTime: 60, // seconds
  countDown: true, // false for elapsed time
  onTimeUp: () => {},
  onTick: (time) => {},
  autoStart: true,
});

// Available actions:
timer.actions.start();
timer.actions.pause();
timer.actions.reset();
timer.actions.stop();
timer.actions.addTime(30); // Add 30 seconds
```

## 📋 Development Workflow

### 1. Planning Phase
- [ ] Review existing games for inspiration and patterns
- [ ] Define learning objectives and target audience
- [ ] Sketch game mechanics and user flow
- [ ] Identify required shared components

### 2. Development Phase
- [ ] Create game component using shared utilities
- [ ] Implement core game logic
- [ ] Add educational content and progression
- [ ] Style with Tailwind CSS (consistent with platform)
- [ ] Test responsiveness and accessibility

### 3. Testing Database Phase (NEW)
- [ ] Add game to test games database using `npm run add-test-game`
- [ ] Verify game loads at direct URL (`/games/[game-id]`)
- [ ] Test all game mechanics in isolation
- [ ] Check console for errors and warnings

### 4. Integration & Testing Phase
- [ ] Register game component in `lib/gameLoader.ts`
- [ ] Test dynamic loading
- [ ] Verify routing works correctly
- [ ] Submit to testing dashboard (`/internal/testing`)
- [ ] Update status to "IN_TESTING"

### 5. Team Review Phase
- [ ] Admin team reviews game in testing dashboard
- [ ] Team provides feedback via testing interface
- [ ] Address any quality issues or bugs
- [ ] Get approval from at least 1 admin
- [ ] Game status updated to "APPROVED"

### 6. Promotion Phase (ADMIN ONLY)
- [ ] Admin promotes game to catalog from testing dashboard
- [ ] Verify game appears in public catalog
- [ ] Test game from catalog interface
- [ ] Announce game launch to users

## 🎨 Design Guidelines

### Visual Design
- Use child-friendly, colorful interfaces
- Maintain consistent styling with platform theme
- Ensure high contrast for accessibility
- Use engaging animations and transitions

### Educational Design
- Balance 70% engagement with 30% explicit learning
- Provide immediate feedback on actions
- Include progress tracking and achievements
- Use scaffolded learning approaches

### Technical Design
- Keep components modular and reusable
- Follow React best practices
- Use TypeScript for type safety
- Optimize for performance

## 🧪 Testing Commands

```bash
# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (if available)
npm test

# Test specific game URL
curl http://localhost:3000/games/my-awesome-game

# Test game in catalog
curl http://localhost:3000/catalog
```

## 📝 Pull Request Checklist

When submitting your game:

- [ ] Game component follows established patterns
- [ ] Game is properly registered in gameLoader
- [ ] Catalog metadata is complete and accurate
- [ ] Game works on desktop and mobile
- [ ] Educational objectives are clear
- [ ] Code is well-documented
- [ ] No console errors or warnings
- [ ] Game handles all edge cases (game over, pause, etc.)

## 🚨 Common Issues & Solutions

### Game Not Loading
- Check if game is registered in `index.ts`
- Verify game ID matches in catalog and registration
- Ensure dynamic import path is correct

### Routing Issues
- Confirm `componentGame: true` is set in catalog
- Check that game ID contains only URL-safe characters
- Verify AdventureCard is updated to handle component games

### State Management Issues
- Use provided hooks for consistent state management
- Don't mutate state directly
- Handle async operations properly

### Styling Issues
- Use existing Tailwind classes when possible
- Follow platform color scheme
- Test responsive design on multiple screen sizes

## 🤝 Getting Help

- Review sample games in `components/games/sample-*`
- Check shared component documentation
- Ask questions in team Discord/Slack
- Submit issues for bugs or feature requests

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Educational Game Design Principles](https://www.edutopia.org/game-based-learning-resources)

---

## 🎯 Example Game Ideas

### Math Games
- Number line jumping games
- Fraction pizza cutting
- Geometry shape building
- Money counting simulations
- Pattern recognition challenges

### Science Games
- Ecosystem building simulations
- Chemistry reaction experiments
- Space exploration adventures
- Weather prediction games
- Animal habitat matching

Ready to build amazing educational games? Start with the Quick Start guide above! 🚀