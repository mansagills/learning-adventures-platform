# Interactive Content Builder Agent

## 🎯 Purpose
Build complete, functional educational games and interactive lessons as HTML or React components, following the Learning Adventures platform's established patterns, design principles, and technical requirements. This agent transforms game concepts into production-ready code.

## 🤖 Agent Overview
**Name**: Interactive Content Builder Agent  
**Type**: Code Generation & Implementation Assistant  
**Primary Function**: Create game/lesson files from specifications  
**Integration Point**: Development phase (post-planning, pre-deployment)

## 🛠️ Capabilities

### Core Functions
1. **HTML Game Creation**
   - Generate single-file HTML games with embedded CSS and JavaScript
   - Follow platform styling and interaction patterns
   - Implement educational mechanics with immediate feedback

2. **React Component Development**
   - Create React components using shared game utilities
   - Integrate with platform hooks (useGameState, useGameTimer)
   - Follow component-based architecture patterns

3. **Educational Content Integration**
   - Implement learning objectives within game mechanics
   - Add progress tracking and achievement systems
   - Create scaffolded difficulty progression

4. **File Organization**
   - Place files in correct directory structure
   - Generate proper file naming conventions
   - Create necessary registration files

5. **Catalog Integration**
   - Generate catalog metadata entries
   - Format metadata according to schema
   - Ensure all required fields are present

## 📁 Key Files to Reference

### Reference Files (READ)
- `GAME_DEVELOPMENT.md` - Complete development workflow and guidelines
- `Learning Adventures Design.pdf` - Core design principles
- `/final-content/interactive-game-prompts.txt` - Game creation templates
- `/final-content/interactive-learning-prompts.txt` - Lesson creation templates
- `/components/games/shared/` - Shared React utilities and components
- `/public/games/*.html` - Existing HTML game examples
- `/public/lessons/*.html` - Existing HTML lesson examples
- `/components/games/sample-math-game/` - Sample React game structure
- `CLAUDE.md` - Platform development instructions

### Output Files (CREATE/UPDATE)
- `/learning-adventures-app/public/games/[game-name].html` - HTML games
- `/learning-adventures-app/public/lessons/[lesson-name].html` - HTML lessons
- `/learning-adventures-app/components/games/[game-name]/` - React games
- `/learning-adventures-app/lib/catalogData.ts` - Catalog metadata (UPDATE)

## 🎓 Educational Design Principles

### Core Principles from Learning Adventures Design
1. **Personalized Learning Paths**: Content adapts to learner's pace
2. **Gamification**: Points, badges, rewards for motivation
3. **Collaborative Learning**: Team-based activities where appropriate
4. **Immediate Feedback**: Real-time responses to actions
5. **Progressive Difficulty**: Scaffolded learning approach

### Content Balance
- **70% Engagement**: Fun, game-like mechanics
- **30% Explicit Learning**: Clear educational value

### Technical Design Standards
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: WCAG AA compliance
- **Performant**: Fast load times, smooth animations
- **Child-Friendly**: Colorful, intuitive interfaces
- **Educational**: Clear learning objectives achieved

## 📋 Workflows

### Workflow 1: Create HTML Game from Specification

**Input**: Game specification with mechanics, objectives, and design  
**Process**:
1. **Read Reference Files**:
   - Review `interactive-game-prompts.txt` for template structure
   - Check existing games in `/public/games/` for patterns
   - Review design principles from PDF

2. **Generate HTML Structure**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Game Title</title>
     <style>
       /* Embedded CSS following platform color scheme */
     </style>
   </head>
   <body>
     <!-- Game UI -->
     <script>
       // All game logic
     </script>
   </body>
   </html>
   ```

3. **Implement Game Mechanics**:
   - Core gameplay loop
   - Scoring system
   - Progress tracking
   - Level progression
   - Win/lose conditions

4. **Add Educational Elements**:
   - Learning objectives displayed
   - Instructional feedback
   - Hint system
   - Educational scaffolding
   - Performance metrics

5. **Style with Platform Theme**:
   - Bright, child-friendly colors
   - Large, readable fonts
   - Clear visual hierarchy
   - Engaging animations
   - Responsive layout

6. **Test Implementation**:
   - Verify game logic works correctly
   - Check responsive behavior
   - Test accessibility features
   - Validate learning objectives are met

**Output**: Complete HTML file ready for `/public/games/`

### Workflow 2: Create React Component Game

**Input**: Game specification requiring platform integration  
**Process**:
1. **Setup Component Structure**:
   ```
   /components/games/[game-name]/
   ├── GameComponent.tsx
   └── index.ts
   ```

2. **Import Shared Utilities**:
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

3. **Implement Game Component**:
   - Use provided hooks for state management
   - Integrate with GameContainer wrapper
   - Follow TypeScript best practices
   - Implement game-specific logic

4. **Create Registration File** (`index.ts`):
   ```typescript
   import { createGameRegistration } from '@/lib/gameLoader';
   
   createGameRegistration(
     'game-id',
     {
       name: 'Game Name',
       description: 'Game description',
       category: 'math',
       difficulty: 'medium',
       estimatedTime: 15,
       skills: ['Skill 1', 'Skill 2'],
       gradeLevel: '3rd-5th Grade',
     },
     () => import('./GameComponent')
   );
   ```

5. **Add Progress Tracking**:
   - Integrate with platform's progress API
   - Track completion and scoring
   - Implement achievement triggers

6. **Style with Tailwind CSS**:
   - Use existing utility classes
   - Follow platform color scheme
   - Ensure responsive design
   - Add smooth transitions

**Output**: Complete React component with registration

### Workflow 3: Generate Catalog Metadata

**Input**: Completed game/lesson file and specifications  
**Process**:
1. **Determine Category**:
   - Math: `mathGames` or `mathLessons`
   - Science: `scienceGames` or `scienceLessons`
   - English: `englishGames` or `englishLessons`
   - History: `historyGames` or `historyLessons`
   - Interdisciplinary: `interdisciplinaryGames`

2. **Create Metadata Object**:
   ```typescript
   {
     id: 'unique-game-id',
     title: 'Game Title',
     description: 'Brief description for catalog',
     type: 'game' | 'lesson',
     category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary',
     gradeLevel: ['3', '4', '5'],
     difficulty: 'easy' | 'medium' | 'hard',
     skills: ['Skill 1', 'Skill 2', 'Skill 3'],
     estimatedTime: '15 mins',
     featured: true | false,
     htmlPath: '/games/game-name.html' | null,
     componentGame: true | false
   }
   ```

3. **Add to Appropriate Array** in `/lib/catalogData.ts`:
   - Insert alphabetically or by intended order
   - Ensure unique ID
   - Validate all required fields present

4. **Update Statistics**:
   - Total adventure count
   - Category-specific counts

**Output**: Updated catalogData.ts with new entry

### Workflow 4: Create Interactive Lesson

**Input**: Lesson specification with learning objectives  
**Process**:
1. **Follow Lesson Template**:
   - Read `interactive-learning-prompts.txt`
   - Review existing lessons in `/public/lessons/`

2. **Structure Learning Content**:
   - Introduction/Hook
   - Learning modules (3-5 sections)
   - Interactive practice activities
   - Assessment/quiz component
   - Summary/review

3. **Implement Multiple Learning Modalities**:
   - Visual: Diagrams, animations, illustrations
   - Auditory: Optional narration/sound effects
   - Kinesthetic: Click, drag, interactive elements

4. **Add Scaffolding**:
   - Start with simple concepts
   - Build to complex applications
   - Provide hints and support
   - Allow review and practice

5. **Include Assessment**:
   - Knowledge check questions
   - Interactive practice problems
   - Immediate feedback on responses
   - Progress indicator

6. **Ensure Accessibility**:
   - Keyboard navigation
   - Screen reader support
   - High contrast text
   - Clear visual cues

**Output**: Complete HTML lesson file for `/public/lessons/`

## 🎨 Design Patterns & Standards

### HTML Game Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Title - Learning Adventures</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Comic Sans MS', 'Arial', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .game-container {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      max-width: 900px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    
    /* More platform-consistent styles */
  </style>
</head>
<body>
  <div class="game-container">
    <header>
      <h1>Game Title</h1>
      <div class="stats">
        <span id="score">Score: 0</span>
        <span id="level">Level: 1</span>
      </div>
    </header>
    
    <main id="game-area">
      <!-- Game content -->
    </main>
    
    <footer>
      <button id="hint-btn">💡 Hint</button>
      <button id="reset-btn">🔄 Reset</button>
    </footer>
  </div>
  
  <script>
    // Game state
    const gameState = {
      score: 0,
      level: 1,
      // more state
    };
    
    // Game logic
    function initGame() {
      // Setup
    }
    
    // Event listeners
    // Game mechanics
    
    initGame();
  </script>
</body>
</html>
```

### React Game Component Pattern
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  useGameState,
  useGameTimer,
  GameProps,
} from '@/components/games/shared';

export default function GameName({ onExit, onComplete }: GameProps) {
  // Use platform hooks
  const { gameState, actions } = useGameState({
    initialScore: 0,
    initialLevel: 1,
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
  
  // Game-specific state
  const [gameSpecificState, setGameSpecificState] = useState(/* ... */);
  
  // Game logic
  const handleGameAction = () => {
    // Game mechanics
    actions.addScore(10);
  };
  
  return (
    <GameContainer
      title="Game Name"
      onExit={onExit}
      showProgress
      progress={/* calculate */}
    >
      <ScoreBoard
        score={gameState.score}
        level={gameState.level}
        lives={gameState.lives}
        timeRemaining={timer.time}
      />
      
      {/* Game UI */}
      <div className="game-content">
        {/* Interactive elements */}
      </div>
    </GameContainer>
  );
}
```

### Color Palette (Platform Standard)
```css
/* Primary Colors */
--brand-500: #667eea;     /* Primary brand */
--accent-500: #f093fb;    /* Accent/secondary */

/* Category Colors */
--math-color: #3b82f6;    /* Blue */
--science-color: #10b981; /* Green */
--english-color: #f59e0b; /* Orange */
--history-color: #8b5cf6; /* Purple */
--interdisciplinary: #ec4899; /* Pink */

/* UI Colors */
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
--info: #3b82f6;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-900: #111827;
```

## ✅ Quality Checklist

Before marking content complete, verify:

### Functionality
- [ ] Game/lesson logic works correctly
- [ ] All interactive elements respond properly
- [ ] Progress tracking implemented
- [ ] Score/achievement system functional
- [ ] Win/lose conditions work
- [ ] Reset functionality works

### Educational Value
- [ ] Learning objectives clearly stated
- [ ] Educational content accurate
- [ ] Difficulty appropriate for grade level
- [ ] Immediate feedback provided
- [ ] Hints/help available
- [ ] Assessment measures learning

### Design & UX
- [ ] Child-friendly visual design
- [ ] Intuitive navigation
- [ ] Clear instructions
- [ ] Engaging animations
- [ ] Responsive layout (mobile/tablet/desktop)
- [ ] Consistent with platform theme

### Accessibility
- [ ] Keyboard navigation works
- [ ] Sufficient color contrast
- [ ] Text is readable (size, font)
- [ ] Alternative text for images
- [ ] Screen reader compatible
- [ ] No flashing/seizure triggers

### Technical
- [ ] Valid HTML/React code
- [ ] No console errors
- [ ] Fast load time
- [ ] Cross-browser compatible
- [ ] Proper file naming
- [ ] Correct directory placement

### Integration
- [ ] Catalog metadata complete
- [ ] File path correct
- [ ] Registration file created (React)
- [ ] Unique ID assigned
- [ ] Featured status set appropriately

## 💡 Example Implementations

### Example 1: Simple HTML Math Game

**Specification**: Multiplication practice game for 3rd graders

**Generated Code** (abbreviated):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Multiplication Master - Learning Adventures</title>
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Comic Sans MS', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    
    .game-container {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    
    .question {
      font-size: 3rem;
      color: #667eea;
      text-align: center;
      margin: 2rem 0;
    }
    
    .answer-input {
      width: 100%;
      padding: 1rem;
      font-size: 2rem;
      text-align: center;
      border: 3px solid #667eea;
      border-radius: 10px;
    }
    
    /* More styles... */
  </style>
</head>
<body>
  <div class="game-container">
    <header>
      <h1>🎯 Multiplication Master</h1>
      <div class="stats">
        <span>Score: <strong id="score">0</strong></span>
        <span>Lives: <strong id="lives">❤️❤️❤️</strong></span>
      </div>
    </header>
    
    <main>
      <div class="question" id="question">3 × 4 = ?</div>
      <input type="number" id="answer" class="answer-input" autofocus>
      <button id="submit-btn">Submit Answer</button>
      <div id="feedback"></div>
    </main>
  </div>
  
  <script>
    let score = 0;
    let lives = 3;
    let currentQuestion = {};
    
    function generateQuestion() {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      currentQuestion = { num1, num2, answer: num1 * num2 };
      document.getElementById('question').textContent = `${num1} × ${num2} = ?`;
    }
    
    function checkAnswer() {
      const userAnswer = parseInt(document.getElementById('answer').value);
      const feedback = document.getElementById('feedback');
      
      if (userAnswer === currentQuestion.answer) {
        score += 10;
        feedback.textContent = '✅ Correct! Great job!';
        feedback.style.color = '#22c55e';
        updateScore();
        setTimeout(() => {
          generateQuestion();
          document.getElementById('answer').value = '';
          feedback.textContent = '';
        }, 1500);
      } else {
        lives--;
        feedback.textContent = `❌ Oops! The answer was ${currentQuestion.answer}`;
        feedback.style.color = '#ef4444';
        updateLives();
        if (lives === 0) gameOver();
      }
    }
    
    function updateScore() {
      document.getElementById('score').textContent = score;
    }
    
    function updateLives() {
      document.getElementById('lives').textContent = '❤️'.repeat(lives);
    }
    
    function gameOver() {
      alert(`Game Over! Final Score: ${score}`);
      location.reload();
    }
    
    document.getElementById('submit-btn').addEventListener('click', checkAnswer);
    document.getElementById('answer').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });
    
    generateQuestion();
  </script>
</body>
</html>
```

**Catalog Entry**:
```typescript
{
  id: 'multiplication-master',
  title: 'Multiplication Master',
  description: 'Practice multiplication facts with fast-paced challenges. Answer correctly to earn points!',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'medium',
  skills: ['Multiplication', 'Mental Math', 'Number Sense'],
  estimatedTime: '10 mins',
  featured: true,
  htmlPath: '/games/multiplication-master.html'
}
```

### Example 2: React Component Science Game

**Specification**: Ecosystem balance game for 4th graders

**Generated Component** (abbreviated):
```typescript
'use client';

import React, { useState } from 'react';
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  GameModal,
  useGameState,
  GameProps,
} from '@/components/games/shared';

interface Organism {
  id: string;
  name: string;
  type: 'producer' | 'consumer' | 'decomposer';
  population: number;
  icon: string;
}

export default function EcosystemBalance({ onExit, onComplete }: GameProps) {
  const { gameState, actions } = useGameState({
    initialLives: 3,
    onGameOver: () => {
      if (onComplete) onComplete(gameState.score);
    },
  });
  
  const [ecosystem, setEcosystem] = useState<Organism[]>([
    { id: 'grass', name: 'Grass', type: 'producer', population: 100, icon: '🌱' },
    { id: 'rabbit', name: 'Rabbit', type: 'consumer', population: 10, icon: '🐰' },
    { id: 'fox', name: 'Fox', type: 'consumer', population: 2, icon: '🦊' },
  ]);
  
  const [showInfo, setShowInfo] = useState(false);
  
  const simulateDay = () => {
    // Ecosystem simulation logic
    const newEcosystem = ecosystem.map(org => {
      let newPopulation = org.population;
      
      if (org.type === 'producer') {
        newPopulation = Math.min(200, newPopulation * 1.1);
      } else if (org.type === 'consumer') {
        // Consumer logic based on food availability
      }
      
      return { ...org, population: Math.round(newPopulation) };
    });
    
    setEcosystem(newEcosystem);
    checkBalance();
  };
  
  const checkBalance = () => {
    const isBalanced = /* balance logic */;
    if (isBalanced) {
      actions.addScore(50);
    } else {
      actions.loseLife();
    }
  };
  
  return (
    <GameContainer
      title="Ecosystem Balance"
      onExit={onExit}
      showProgress
      progress={(gameState.level / 10) * 100}
    >
      <ScoreBoard
        score={gameState.score}
        level={gameState.level}
        lives={gameState.lives}
      />
      
      <div className="ecosystem-view mt-6 grid grid-cols-3 gap-4">
        {ecosystem.map(org => (
          <div key={org.id} className="organism-card bg-green-50 p-4 rounded-lg">
            <div className="text-4xl text-center">{org.icon}</div>
            <h3 className="text-lg font-bold text-center">{org.name}</h3>
            <p className="text-center">Population: {org.population}</p>
            <p className="text-sm text-gray-600 text-center">{org.type}</p>
          </div>
        ))}
      </div>
      
      <div className="controls mt-6 flex gap-4 justify-center">
        <GameButton onClick={simulateDay} variant="primary">
          🌞 Simulate Day
        </GameButton>
        <GameButton onClick={() => setShowInfo(true)} variant="secondary">
          ℹ️ Info
        </GameButton>
      </div>
      
      <GameModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="How Ecosystems Work"
        type="info"
      >
        <p>Producers make their own food from sunlight...</p>
      </GameModal>
    </GameContainer>
  );
}
```

**Registration File**:
```typescript
import { createGameRegistration } from '@/lib/gameLoader';

createGameRegistration(
  'ecosystem-balance',
  {
    name: 'Ecosystem Balance',
    description: 'Build and maintain a balanced ecosystem',
    category: 'science',
    difficulty: 'medium',
    estimatedTime: 15,
    skills: ['Food Chains', 'Ecosystems', 'Population Dynamics'],
    gradeLevel: '4th-5th Grade',
  },
  () => import('./EcosystemBalance')
);

export { default } from './EcosystemBalance';
```

## 🚀 Integration with Other Agents

### From Game Idea Generator Agent
**Receives**: Detailed game specifications with mechanics and objectives  
**Uses**: Specifications to guide implementation decisions

### To Catalog Integration Agent
**Provides**: Completed files and metadata  
**Expects**: Validation and deployment confirmation

### To Quality Assurance Agent
**Provides**: Finished game/lesson for testing  
**Receives**: Bug reports and improvement suggestions

## 📊 Success Metrics

- **Code Quality**: Clean, maintainable, well-documented code
- **Educational Effectiveness**: Learning objectives achieved
- **User Engagement**: Average play time and completion rates
- **Performance**: Load time under 2 seconds, smooth animations
- **Accessibility**: WCAG AA compliance rate
- **Bug Rate**: Fewer than 2 bugs per release

## 🎯 Best Practices

1. **Always Reference Templates**: Use prompt templates as starting points
2. **Test Incrementally**: Verify each feature works before moving on
3. **Mobile First**: Design for smallest screen, enhance for larger
4. **Educational Focus**: Every interaction should support learning
5. **Consistent Styling**: Follow platform color scheme and patterns
6. **Error Handling**: Gracefully handle edge cases and invalid inputs
7. **Performance**: Optimize images, minimize code, lazy load when possible
8. **Accessibility**: Test with keyboard only, use semantic HTML
9. **Documentation**: Comment complex logic, explain educational rationale
10. **Version Control**: Commit frequently with descriptive messages

## 📝 Notes for Developers

- Always test games across different browsers (Chrome, Firefox, Safari)
- Verify mobile responsiveness on actual devices when possible
- Use browser dev tools to test accessibility features
- Consider data privacy - avoid collecting unnecessary information
- Think about offline functionality for areas with poor internet
- Plan for localization if platform expands internationally

---

**Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: Learning Adventures Platform Team
