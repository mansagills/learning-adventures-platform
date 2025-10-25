# Educational Game Builder Skill

## 🎯 Purpose
Create complete, engaging educational games as single HTML files for the Learning Adventures platform. This skill enables the development of child-friendly, curriculum-aligned games for elementary students (grades K-5) that seamlessly integrate learning with fun gameplay.

## 📚 When to Use This Skill
- Building new HTML-based educational games
- Creating standalone games without React dependencies
- Developing games that need offline functionality
- Targeting classrooms with limited internet connectivity
- Building games requiring maximum browser compatibility
- Creating simple, focused learning experiences

## 🎮 When NOT to Use This Skill
- Complex games requiring advanced state management → Use React Component Game Skill
- Games needing platform integration (progress tracking, achievements) → Use React Component Game Skill
- Multi-level games with extensive content → Consider React components
- Games requiring frequent updates or dynamic content → Use React

---

## 🏗️ Core Game Design Principles

### The 70/30 Rule: Fun First, Learning Follows
**70% Entertainment** - Students should want to play because it's fun
- Engaging mechanics that would be enjoyable even without the learning
- Clear goals and immediate rewards
- Satisfying feedback and animations
- Compelling themes and narratives

**30% Obvious Learning** - Educational value should be visible but not heavy-handed
- Learning integrated into core mechanics, not tacked on
- Educational content feels natural within the game context
- Progress towards learning goals is visible
- Skills are practiced through gameplay, not through "quiz mode"

### Progressive Difficulty & Scaffolding
```javascript
// Example difficulty progression pattern
const difficultyLevels = {
  easy: {
    timeLimit: 60,
    problemRange: [1, 10],
    hintsAvailable: 3,
    problemsToWin: 5
  },
  medium: {
    timeLimit: 45,
    problemRange: [1, 20],
    hintsAvailable: 2,
    problemsToWin: 8
  },
  hard: {
    timeLimit: 30,
    problemRange: [1, 50],
    hintsAvailable: 1,
    problemsToWin: 12
  }
};
```

### Immediate Feedback & Positive Reinforcement
- **Instant responses**: Visual and audio feedback within 100ms
- **Positive messaging**: Celebrate correct answers enthusiastically
- **Constructive errors**: "Try again!" instead of "Wrong!"
- **Progress visualization**: Show advancement clearly
- **Encouragement**: Supportive messages throughout gameplay

### Short Play Sessions (5-15 Minutes)
- Complete game rounds in 5-10 minutes
- Natural stopping points for classroom transitions
- Save progress between sessions
- Quick restart without losing engagement
- Suitable for centers or independent practice

### Meaningful Choices
- Player decisions should affect outcomes
- Multiple paths to success when appropriate
- Strategy matters more than just speed
- Customization options (difficulty, theme, character)
- Replayability through different approaches

---

## ⚙️ Technical Specifications

### Single HTML File Requirements

**File Structure Pattern**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Name - Learning Adventures</title>
    <style>
        /* ALL CSS embedded here */
        /* ~200-500 lines of styling */
    </style>
</head>
<body>
    <!-- Game HTML Structure -->
    <!-- ~100-200 lines of markup -->

    <script>
        /* ALL JavaScript embedded here */
        /* ~300-800 lines of game logic */
    </script>
</body>
</html>
```

### Performance Targets
- **File Size**: Under 3MB total (preferably 500KB - 1.5MB)
- **Frame Rate**: 60 FPS on target devices
- **Load Time**: Under 3 seconds on average connections
- **Memory**: Stable usage, no leaks during extended play
- **Initialization**: Game ready to play within 1 second of load

### Browser Compatibility
**Must Support**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

**Testing Priorities**:
1. Chrome (most common in schools)
2. Safari (iPads)
3. Edge (Windows devices)
4. Firefox (alternative option)

### Mobile Responsive Requirements
```css
/* Standard responsive pattern for games */
@media (max-width: 768px) {
    .game-container {
        width: 95%;
        padding: 10px;
    }

    .button {
        min-height: 44px;  /* Touch-friendly */
        min-width: 44px;
        font-size: 16px;   /* Prevents zoom on iOS */
    }

    .game-board {
        /* Adjust for portrait/landscape */
    }
}
```

### Offline Functionality
- No external CDN dependencies
- No external images or fonts (use inline SVG or data URIs)
- All assets embedded in the HTML file
- LocalStorage for save data (optional)
- Works without internet connection

### Standard Code Organization

**CSS Section Order**:
1. Reset/Base styles
2. Layout containers
3. Game-specific elements
4. UI controls (buttons, inputs)
5. Animations and transitions
6. Responsive media queries

**JavaScript Section Order**:
1. Constants and configuration
2. State variables
3. Utility functions
4. Game logic functions
5. UI update functions
6. Event handlers
7. Initialization code

---

## 📋 Complete Game Templates

### Template 1: Math Racing Game

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Math Race Rally - Learning Adventures</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #2d3748;
        }

        .game-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 90%;
            max-width: 800px;
            padding: 30px;
        }

        .game-header {
            text-align: center;
            margin-bottom: 20px;
        }

        h1 {
            color: #667eea;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .score-board {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            font-size: 1.2rem;
            font-weight: bold;
        }

        .race-track {
            background: linear-gradient(to right, #e2e8f0, #cbd5e0);
            border: 3px solid #667eea;
            border-radius: 15px;
            height: 150px;
            position: relative;
            margin: 20px 0;
            overflow: hidden;
        }

        .car {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 3rem;
            transition: left 0.5s ease-out;
        }

        .finish-line {
            position: absolute;
            right: 10px;
            top: 0;
            bottom: 0;
            width: 5px;
            background: repeating-linear-gradient(
                to bottom,
                #000 0px,
                #000 10px,
                #fff 10px,
                #fff 20px
            );
        }

        .problem-area {
            text-align: center;
            margin: 30px 0;
        }

        .problem {
            font-size: 3rem;
            color: #2d3748;
            margin: 20px 0;
            font-weight: bold;
        }

        .answer-input {
            font-size: 2rem;
            padding: 15px;
            border: 3px solid #cbd5e0;
            border-radius: 10px;
            width: 200px;
            text-align: center;
        }

        .answer-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.3rem;
            border-radius: 10px;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s;
        }

        .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn:active {
            transform: translateY(0);
        }

        .feedback {
            font-size: 1.5rem;
            margin: 15px 0;
            min-height: 2rem;
            font-weight: bold;
        }

        .correct {
            color: #48bb78;
        }

        .incorrect {
            color: #f56565;
        }

        .hidden {
            display: none;
        }

        .victory-screen {
            text-align: center;
            padding: 40px;
        }

        .victory-screen h2 {
            font-size: 3rem;
            color: #48bb78;
            margin-bottom: 20px;
        }

        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            .problem { font-size: 2rem; }
            .answer-input {
                width: 150px;
                font-size: 1.5rem;
            }
            .race-track { height: 100px; }
            .car { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div id="gameScreen">
            <div class="game-header">
                <h1>🏁 Math Race Rally 🏁</h1>
                <p>Solve problems to move your car forward!</p>
            </div>

            <div class="score-board">
                <div>Score: <span id="score">0</span></div>
                <div>Problems Left: <span id="remaining">10</span></div>
                <div>Time: <span id="timer">60</span>s</div>
            </div>

            <div class="race-track">
                <div class="car" id="car">🏎️</div>
                <div class="finish-line"></div>
            </div>

            <div class="problem-area">
                <div class="problem" id="problem">5 + 3 = ?</div>
                <input
                    type="number"
                    id="answerInput"
                    class="answer-input"
                    placeholder="?"
                    aria-label="Answer"
                />
                <br>
                <button class="btn" id="submitBtn" onclick="checkAnswer()">
                    Submit Answer
                </button>
                <div class="feedback" id="feedback" role="status" aria-live="polite"></div>
            </div>
        </div>

        <div id="victoryScreen" class="hidden victory-screen">
            <h2>🎉 You Won! 🎉</h2>
            <p id="finalScore"></p>
            <p id="finalTime"></p>
            <button class="btn" onclick="restartGame()">Play Again</button>
        </div>
    </div>

    <script>
        // === CONFIGURATION ===
        const CONFIG = {
            problemsToWin: 10,
            timeLimit: 60,
            numberRange: { min: 1, max: 20 },
            operations: ['+', '-'],
            pointsPerCorrect: 10,
            timeBonusThreshold: 40
        };

        // === GAME STATE ===
        let gameState = {
            score: 0,
            problemsSolved: 0,
            totalProblems: CONFIG.problemsToWin,
            currentProblem: null,
            currentAnswer: null,
            timeRemaining: CONFIG.timeLimit,
            timerInterval: null,
            startTime: null
        };

        // === UTILITY FUNCTIONS ===
        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateProblem() {
            const operation = CONFIG.operations[randomInt(0, CONFIG.operations.length - 1)];
            let num1 = randomInt(CONFIG.numberRange.min, CONFIG.numberRange.max);
            let num2 = randomInt(CONFIG.numberRange.min, CONFIG.numberRange.max);

            // Ensure subtraction doesn't result in negative numbers
            if (operation === '-' && num2 > num1) {
                [num1, num2] = [num2, num1];
            }

            let answer;
            switch(operation) {
                case '+': answer = num1 + num2; break;
                case '-': answer = num1 - num2; break;
                default: answer = num1 + num2;
            }

            return {
                question: `${num1} ${operation} ${num2} = ?`,
                answer: answer
            };
        }

        // === GAME LOGIC ===
        function initGame() {
            gameState.score = 0;
            gameState.problemsSolved = 0;
            gameState.timeRemaining = CONFIG.timeLimit;
            gameState.startTime = Date.now();

            updateDisplay();
            newProblem();
            startTimer();

            document.getElementById('answerInput').focus();
        }

        function newProblem() {
            const problem = generateProblem();
            gameState.currentProblem = problem.question;
            gameState.currentAnswer = problem.answer;

            document.getElementById('problem').textContent = problem.question;
            document.getElementById('answerInput').value = '';
            document.getElementById('feedback').textContent = '';
            document.getElementById('answerInput').focus();
        }

        function checkAnswer() {
            const userAnswer = parseInt(document.getElementById('answerInput').value);
            const feedbackEl = document.getElementById('feedback');

            if (isNaN(userAnswer)) {
                feedbackEl.textContent = 'Please enter a number!';
                feedbackEl.className = 'feedback incorrect';
                return;
            }

            if (userAnswer === gameState.currentAnswer) {
                // Correct answer!
                gameState.score += CONFIG.pointsPerCorrect;
                gameState.problemsSolved++;

                feedbackEl.textContent = '🎉 Correct! Great job!';
                feedbackEl.className = 'feedback correct';

                moveCar();

                if (gameState.problemsSolved >= CONFIG.problemsToWin) {
                    endGame(true);
                } else {
                    setTimeout(newProblem, 1000);
                }
            } else {
                feedbackEl.textContent = `Try again! The answer is ${gameState.currentAnswer}`;
                feedbackEl.className = 'feedback incorrect';
                setTimeout(() => {
                    feedbackEl.textContent = '';
                    newProblem();
                }, 2000);
            }

            updateDisplay();
        }

        function moveCar() {
            const trackWidth = document.querySelector('.race-track').offsetWidth;
            const carPosition = (gameState.problemsSolved / CONFIG.problemsToWin) * (trackWidth - 80);
            document.getElementById('car').style.left = carPosition + 'px';
        }

        function startTimer() {
            gameState.timerInterval = setInterval(() => {
                gameState.timeRemaining--;
                document.getElementById('timer').textContent = gameState.timeRemaining;

                if (gameState.timeRemaining <= 0) {
                    endGame(false);
                }
            }, 1000);
        }

        function endGame(won) {
            clearInterval(gameState.timerInterval);

            const timeTaken = Math.floor((Date.now() - gameState.startTime) / 1000);

            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('victoryScreen').classList.remove('hidden');

            if (won) {
                document.querySelector('.victory-screen h2').textContent = '🎉 You Won! 🎉';
                document.getElementById('finalScore').textContent = `Final Score: ${gameState.score} points`;
                document.getElementById('finalTime').textContent = `Time: ${timeTaken} seconds`;
            } else {
                document.querySelector('.victory-screen h2').textContent = '⏰ Time\'s Up! ⏰';
                document.getElementById('finalScore').textContent = `You solved ${gameState.problemsSolved} problems`;
                document.getElementById('finalTime').textContent = 'Try again to beat the clock!';
            }
        }

        function restartGame() {
            document.getElementById('gameScreen').classList.remove('hidden');
            document.getElementById('victoryScreen').classList.add('hidden');
            document.getElementById('car').style.left = '10px';
            initGame();
        }

        // === UI UPDATES ===
        function updateDisplay() {
            document.getElementById('score').textContent = gameState.score;
            document.getElementById('remaining').textContent =
                CONFIG.problemsToWin - gameState.problemsSolved;
        }

        // === EVENT HANDLERS ===
        document.getElementById('answerInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });

        // === INITIALIZATION ===
        window.addEventListener('load', initGame);
    </script>
</body>
</html>
```

### Template 2: Science Exploration Game (Ecosystem Builder)

**Key Structure Elements**:
```javascript
// Ecosystem game state example
const ecosystemState = {
    organisms: [],
    environment: {
        temperature: 20,
        rainfall: 50,
        sunlight: 80
    },
    foodChain: [],
    balance: 100,  // 0-100 scale
    time: 0
};

// Add organism function
function addOrganism(type, role) {
    const organism = {
        id: Date.now(),
        type: type,
        role: role,  // producer, consumer, decomposer
        population: 10,
        energy: 100
    };

    ecosystemState.organisms.push(organism);
    updateEcosystem();
}

// Update ecosystem balance
function updateEcosystem() {
    // Calculate food chain balance
    const producers = countByRole('producer');
    const consumers = countByRole('consumer');
    const decomposers = countByRole('decomposer');

    // Ideal ratio: many producers, fewer consumers, some decomposers
    const balance = calculateBalance(producers, consumers, decomposers);
    ecosystemState.balance = balance;

    updateDisplay();
    checkWinCondition();
}
```

### Template 3: English Vocabulary Builder

**Word Matching Game Structure**:
```javascript
// Vocabulary game configuration
const vocabularyGame = {
    words: [
        { word: 'excited', definition: 'feeling happy and enthusiastic', difficulty: 'easy' },
        { word: 'curious', definition: 'wanting to learn or know more', difficulty: 'easy' },
        { word: 'mysterious', definition: 'difficult to understand or explain', difficulty: 'medium' }
    ],
    currentRound: 0,
    score: 0,
    matches: []
};

// Shuffle and display words
function setupRound() {
    const words = shuffleArray(vocabularyGame.words.slice(0, 6));
    const definitions = shuffleArray(words.map(w => w.definition));

    displayWords(words);
    displayDefinitions(definitions);
}

// Check match
function checkMatch(wordIndex, defIndex) {
    const word = selectedWords[wordIndex];
    const definition = selectedDefinitions[defIndex];

    if (word.definition === definition) {
        // Correct match!
        markCorrect(wordIndex, defIndex);
        vocabularyGame.score += 10;
        checkWinCondition();
    } else {
        // Incorrect
        showFeedback('Try again!');
    }
}
```

---

## 🎓 Educational Integration Patterns

### Adaptive Difficulty System

```javascript
// Track player performance and adjust difficulty
const performanceTracker = {
    recentAnswers: [],
    maxHistory: 10,

    recordAnswer(isCorrect) {
        this.recentAnswers.push(isCorrect);
        if (this.recentAnswers.length > this.maxHistory) {
            this.recentAnswers.shift();
        }
        this.adjustDifficulty();
    },

    getSuccessRate() {
        if (this.recentAnswers.length === 0) return 0.5;
        const correct = this.recentAnswers.filter(a => a).length;
        return correct / this.recentAnswers.length;
    },

    adjustDifficulty() {
        const successRate = this.getSuccessRate();

        if (successRate > 0.8) {
            // Player doing too well, increase difficulty
            increaseDifficulty();
        } else if (successRate < 0.4) {
            // Player struggling, decrease difficulty
            decreaseDifficulty();
        }
        // 40-80% success rate is the "sweet spot"
    }
};

function increaseDifficulty() {
    CONFIG.numberRange.max = Math.min(100, CONFIG.numberRange.max + 5);
    CONFIG.timeLimit = Math.max(20, CONFIG.timeLimit - 5);
}

function decreaseDifficulty() {
    CONFIG.numberRange.max = Math.max(10, CONFIG.numberRange.max - 5);
    CONFIG.timeLimit = Math.min(90, CONFIG.timeLimit + 5);
}
```

### Skill Mastery Tracking

```javascript
// Track mastery of specific skills
const skillTracker = {
    skills: {
        'addition': { attempts: 0, correct: 0, mastered: false },
        'subtraction': { attempts: 0, correct: 0, mastered: false },
        'multiplication': { attempts: 0, correct: 0, mastered: false }
    },

    recordAttempt(skill, isCorrect) {
        this.skills[skill].attempts++;
        if (isCorrect) {
            this.skills[skill].correct++;
        }
        this.checkMastery(skill);
    },

    checkMastery(skill) {
        const s = this.skills[skill];
        if (s.attempts >= 10 && s.correct / s.attempts >= 0.9) {
            s.mastered = true;
            showMasteryAchievement(skill);
        }
    },

    saveProgress() {
        localStorage.setItem('skillProgress', JSON.stringify(this.skills));
    },

    loadProgress() {
        const saved = localStorage.getItem('skillProgress');
        if (saved) {
            this.skills = JSON.parse(saved);
        }
    }
};
```

### Multiple Representations

```javascript
// Provide multiple ways to understand concepts
function showProblem(problem, representationType) {
    switch(representationType) {
        case 'numeric':
            // Standard number problem
            return `${problem.num1} + ${problem.num2} = ?`;

        case 'visual':
            // Array/blocks representation
            return createVisualRepresentation(problem);

        case 'word':
            // Word problem
            return `Sarah has ${problem.num1} apples. Tom gives her ${problem.num2} more. How many does Sarah have now?`;

        case 'number-line':
            // Number line representation
            return createNumberLine(problem);
    }
}

function createVisualRepresentation(problem) {
    // Create blocks or circles to represent numbers
    let html = '<div class="visual-problem">';

    // First number as blocks
    for (let i = 0; i < problem.num1; i++) {
        html += '<div class="block">■</div>';
    }

    html += '<span class="operator">+</span>';

    // Second number as blocks
    for (let i = 0; i < problem.num2; i++) {
        html += '<div class="block">■</div>';
    }

    html += '</div>';
    return html;
}
```

### Hint System

```javascript
// Progressive hint system for struggling students
const hintSystem = {
    hintsUsed: 0,
    maxHints: 3,

    getHint(problem, hintLevel) {
        const hints = this.generateHints(problem);
        if (hintLevel >= hints.length) {
            return hints[hints.length - 1];  // Return answer
        }
        this.hintsUsed++;
        return hints[hintLevel];
    },

    generateHints(problem) {
        // Progressive hints from strategy to answer
        return [
            `Try counting on your fingers!`,
            `Think: ${problem.num1} + ${Math.floor(problem.num2/2)} + ${Math.ceil(problem.num2/2)}`,
            `The answer is between ${problem.answer - 2} and ${problem.answer + 2}`,
            `The answer is ${problem.answer}`
        ];
    },

    canUseHint() {
        return this.hintsUsed < this.maxHints;
    }
};
```

---

## 🎨 User Experience Guidelines

### Child-Friendly Controls

```css
/* Touch-friendly button sizing */
.game-button {
    min-width: 60px;
    min-height: 60px;
    font-size: 18px;
    padding: 15px 25px;
    margin: 10px;
    cursor: pointer;
    border-radius: 12px;
    border: 3px solid #4299e1;
    background: linear-gradient(to bottom, #63b3ed, #4299e1);
    color: white;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.2s;
}

.game-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.game-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Large, easy-to-click targets for young children */
.answer-option {
    min-width: 80px;
    min-height: 80px;
    font-size: 24px;
}
```

### Visual Design Principles

```css
/* Colorful, engaging theme */
:root {
    --primary-color: #6366f1;
    --secondary-color: #10b981;
    --accent-color: #f59e0b;
    --success-color: #22c55e;
    --error-color: #ef4444;
    --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Card-based layout for clarity */
.game-card {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    max-width: 900px;
    margin: 20px auto;
}

/* Fun animations */
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.celebration {
    animation: bounce 0.5s ease-in-out 3;
}

/* Clear visual hierarchy */
h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}
```

### Audio Design

```javascript
// Sound effect system
const soundEffects = {
    correct: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...'),
    incorrect: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...'),
    click: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...'),
    victory: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...'),

    play(sound) {
        if (this.soundEnabled && this[sound]) {
            this[sound].currentTime = 0;
            this[sound].play().catch(e => console.log('Audio play failed'));
        }
    },

    soundEnabled: true,

    toggle() {
        this.soundEnabled = !this.soundEnabled;
        updateSoundButton();
    }
};

// Volume control
function setSoundVolume(volume) {
    Object.keys(soundEffects).forEach(key => {
        if (soundEffects[key].volume !== undefined) {
            soundEffects[key].volume = volume / 100;
        }
    });
}
```

### Clear Instructions

```html
<!-- Instructions modal pattern -->
<div class="instructions-modal" id="instructionsModal">
    <div class="modal-content">
        <h2>How to Play</h2>

        <div class="instruction-step">
            <div class="step-number">1</div>
            <div class="step-content">
                <h3>Solve the Math Problem</h3>
                <p>Look at the problem on screen and figure out the answer.</p>
            </div>
        </div>

        <div class="instruction-step">
            <div class="step-number">2</div>
            <div class="step-content">
                <h3>Type Your Answer</h3>
                <p>Enter your answer in the box and click Submit.</p>
            </div>
        </div>

        <div class="instruction-step">
            <div class="step-number">3</div>
            <div class="step-content">
                <h3>Move Forward!</h3>
                <p>Each correct answer moves your car closer to the finish line!</p>
            </div>
        </div>

        <button class="btn-primary" onclick="closeInstructions()">
            Got It! Let's Play!
        </button>
    </div>
</div>
```

### Game State Management

```javascript
// Clear game states with proper transitions
const GAME_STATES = {
    MENU: 'menu',
    INSTRUCTIONS: 'instructions',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory'
};

let currentState = GAME_STATES.MENU;

function changeState(newState) {
    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    // Show appropriate screen
    switch(newState) {
        case GAME_STATES.MENU:
            document.getElementById('menuScreen').classList.remove('hidden');
            break;
        case GAME_STATES.PLAYING:
            document.getElementById('gameScreen').classList.remove('hidden');
            if (currentState === GAME_STATES.PAUSED) {
                resumeGame();
            } else {
                startGame();
            }
            break;
        case GAME_STATES.PAUSED:
            document.getElementById('pauseScreen').classList.remove('hidden');
            pauseGame();
            break;
        case GAME_STATES.VICTORY:
            document.getElementById('victoryScreen').classList.remove('hidden');
            showVictoryStats();
            break;
    }

    currentState = newState;
}
```

---

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance Checklist

**Perceivable**:
- [ ] All images have alt text
- [ ] Color is not the only means of conveying information
- [ ] Text has 4.5:1 contrast ratio minimum
- [ ] UI elements have 3:1 contrast ratio minimum
- [ ] Text can be resized to 200% without loss of functionality

**Operable**:
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Sufficient time provided for actions
- [ ] No content that flashes more than 3 times per second
- [ ] Clear focus indicators on all interactive elements

**Understandable**:
- [ ] Language of page is identified (lang="en")
- [ ] Instructions are clear and simple
- [ ] Error messages are helpful and specific
- [ ] Labels are present for all form elements

**Robust**:
- [ ] Valid HTML5
- [ ] ARIA labels where needed
- [ ] Compatible with assistive technologies

### Keyboard Navigation Implementation

```javascript
// Comprehensive keyboard navigation
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'Escape':
            if (currentState === GAME_STATES.PLAYING) {
                changeState(GAME_STATES.PAUSED);
            }
            break;

        case 'Enter':
            if (e.target.tagName !== 'INPUT') {
                const activeButton = document.querySelector('.btn:focus');
                if (activeButton) activeButton.click();
            }
            break;

        case 'Tab':
            // Let browser handle Tab naturally
            break;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            // Handle arrow key navigation for answer selection
            handleArrowNavigation(e.key);
            e.preventDefault();
            break;

        case ' ':
            // Space to pause/unpause
            if (currentState === GAME_STATES.PLAYING) {
                changeState(GAME_STATES.PAUSED);
            } else if (currentState === GAME_STATES.PAUSED) {
                changeState(GAME_STATES.PLAYING);
            }
            e.preventDefault();
            break;
    }
});

// Ensure proper focus management
function handleArrowNavigation(key) {
    const focusableElements = Array.from(
        document.querySelectorAll('button:not([disabled]), input:not([disabled])')
    );
    const currentIndex = focusableElements.indexOf(document.activeElement);

    let nextIndex;
    switch(key) {
        case 'ArrowRight':
        case 'ArrowDown':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
    }

    focusableElements[nextIndex]?.focus();
}
```

### Screen Reader Support

```html
<!-- Proper ARIA labels and live regions -->
<div class="game-container" role="main" aria-label="Math Race Rally Game">
    <h1 id="gameTitle">Math Race Rally</h1>

    <div class="score-board" role="status" aria-live="polite" aria-atomic="true">
        <span>Score: <span id="score">0</span></span>
        <span>Problems remaining: <span id="remaining">10</span></span>
    </div>

    <div class="problem-area">
        <div class="problem" id="problem" role="heading" aria-level="2">
            5 + 3 = ?
        </div>

        <label for="answerInput" class="sr-only">Enter your answer</label>
        <input
            type="number"
            id="answerInput"
            aria-label="Answer input"
            aria-required="true"
            aria-describedby="feedback"
        />

        <button
            id="submitBtn"
            aria-label="Submit answer"
            onclick="checkAnswer()"
        >
            Submit
        </button>

        <div
            id="feedback"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        ></div>
    </div>
</div>

<!-- Screen reader only content -->
<style>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>
```

### Color Contrast & Colorblind Modes

```javascript
// High contrast mode toggle
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

// Load preference
if (localStorage.getItem('highContrast') === 'true') {
    document.body.classList.add('high-contrast');
}
```

```css
/* High contrast styles */
.high-contrast {
    --primary-color: #000;
    --secondary-color: #000;
    --background-color: #fff;
    --text-color: #000;
    --border-color: #000;
}

.high-contrast .btn {
    background: #000;
    color: #fff;
    border: 3px solid #000;
}

.high-contrast .game-container {
    background: #fff;
    border: 5px solid #000;
}

/* Ensure all interactive elements have clear focus indicators */
button:focus,
input:focus,
select:focus {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
}

.high-contrast *:focus {
    outline: 5px solid #000;
    outline-offset: 3px;
}
```

---

## 📚 Subject-Specific Guidelines

### Math Games

**Common Concepts by Grade Level**:
- **K-1**: Counting 1-20, number recognition, basic shapes, simple patterns
- **2-3**: Addition/subtraction within 100, skip counting, telling time, measurement
- **4-5**: Multiplication/division, fractions, decimals, area/perimeter, data graphs

**Problem Generation Examples**:
```javascript
// Addition facts generator
function generateAddition(gradeLevel) {
    let range;
    switch(gradeLevel) {
        case 'K-1': range = { min: 1, max: 10 }; break;
        case '2-3': range = { min: 1, max: 20 }; break;
        case '4-5': range = { min: 1, max: 100 }; break;
    }

    const num1 = randomInt(range.min, range.max);
    const num2 = randomInt(range.min, range.max);

    return {
        problem: `${num1} + ${num2}`,
        answer: num1 + num2,
        skill: 'addition'
    };
}

// Fraction problems
function generateFraction(gradeLevel) {
    const denominators = gradeLevel === '2-3' ? [2, 4] : [2, 3, 4, 5, 6, 8];
    const denominator = denominators[randomInt(0, denominators.length - 1)];
    const numerator = randomInt(1, denominator - 1);

    return {
        problem: `What is ${numerator}/${denominator} as a visual?`,
        answer: { numerator, denominator },
        visual: createFractionVisual(numerator, denominator),
        skill: 'fractions'
    };
}
```

### Science Games

**Simulation Patterns**:
```javascript
// Ecosystem simulation example
class Ecosystem {
    constructor() {
        this.organisms = [];
        this.environment = {
            sunlight: 100,
            water: 100,
            temperature: 20
        };
    }

    update(deltaTime) {
        // Energy flows through food chain
        this.organisms.forEach(org => {
            if (org.role === 'producer') {
                // Plants create energy from sunlight
                org.energy += this.environment.sunlight * 0.1 * deltaTime;
            } else if (org.role === 'consumer') {
                // Animals consume other organisms
                const food = this.findFood(org);
                if (food) {
                    org.energy += food.energy * 0.3;
                    food.population--;
                }
                org.energy -= 5 * deltaTime;  // Base metabolism
            }

            // Population dynamics
            if (org.energy > 100) {
                org.population++;
                org.energy -= 50;
            } else if (org.energy <= 0) {
                org.population--;
            }
        });

        this.checkBalance();
    }

    checkBalance() {
        const balance = this.calculateEcosystemHealth();
        if (balance > 80) {
            showFeedback('🌟 Your ecosystem is thriving!');
        } else if (balance < 30) {
            showFeedback('⚠️ Your ecosystem is struggling!');
        }
    }
}
```

**Scientific Method Integration**:
```javascript
// Guide students through scientific process
const scientificMethod = {
    currentStep: 'observe',
    steps: ['observe', 'question', 'hypothesis', 'experiment', 'analyze', 'conclude'],

    promptNextStep() {
        const prompts = {
            observe: "What do you notice about the ecosystem?",
            question: "What question do you want to investigate?",
            hypothesis: "What do you think will happen if...?",
            experiment: "Now try changing one thing and observe!",
            analyze: "What patterns do you see in the data?",
            conclude: "Based on your experiment, what did you learn?"
        };

        return prompts[this.currentStep];
    },

    advance() {
        const currentIndex = this.steps.indexOf(this.currentStep);
        if (currentIndex < this.steps.length - 1) {
            this.currentStep = this.steps[currentIndex + 1];
        }
    }
};
```

### English/Language Arts Games

**Vocabulary Building**:
```javascript
// Context-based vocabulary learning
const vocabularyGame = {
    wordLibrary: [
        {
            word: 'investigate',
            definition: 'to search for information',
            example: 'The detective will investigate the mystery.',
            synonyms: ['examine', 'explore', 'study'],
            gradeLevel: '3-4'
        },
        {
            word: 'magnificent',
            definition: 'extremely beautiful or impressive',
            example: 'The castle was magnificent!',
            synonyms: ['beautiful', 'wonderful', 'amazing'],
            gradeLevel: '4-5'
        }
    ],

    presentWord(word) {
        return `
            <div class="word-card">
                <h3>${word.word}</h3>
                <p class="definition">${word.definition}</p>
                <p class="example"><em>"${word.example}"</em></p>
                <div class="synonyms">
                    Similar words: ${word.synonyms.join(', ')}
                </div>
            </div>
        `;
    }
};
```

### History/Social Studies Games

**Timeline Mechanics**:
```javascript
// Interactive timeline game
const timelineGame = {
    events: [
        { year: 1776, event: 'Declaration of Independence', era: 'Revolutionary War' },
        { year: 1861, event: 'Civil War Begins', era: 'Civil War' },
        { year: 1920, event: 'Women Get the Vote', era: 'Progressive Era' }
    ],

    shuffledEvents: [],

    init() {
        this.shuffledEvents = this.shuffle([...this.events]);
        this.displayEvents();
    },

    checkOrder() {
        // Verify events are in chronological order
        for (let i = 1; i < this.shuffledEvents.length; i++) {
            if (this.shuffledEvents[i].year < this.shuffledEvents[i-1].year) {
                return false;
            }
        }
        return true;
    }
};
```

---

## ✅ Testing & Quality Assurance

### Performance Testing

```javascript
// FPS monitor for testing
const performanceMonitor = {
    fps: 0,
    frames: 0,
    lastTime: performance.now(),

    update() {
        this.frames++;
        const currentTime = performance.now();

        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            this.frames = 0;
            this.lastTime = currentTime;

            // Log if FPS drops below target
            if (this.fps < 50) {
                console.warn(`Low FPS detected: ${this.fps}`);
            }
        }
    },

    display() {
        document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
    }
};

// Call in game loop
function gameLoop() {
    performanceMonitor.update();
    // ... rest of game logic
    requestAnimationFrame(gameLoop);
}
```

### Educational Effectiveness Checklist

- [ ] Learning objectives clearly stated
- [ ] Concepts practiced repeatedly in context
- [ ] Immediate feedback provided
- [ ] Progress tracked and visible
- [ ] Difficulty adjusts to student level
- [ ] Multiple representations of concepts
- [ ] Scaffolded support available (hints)
- [ ] Mastery indicated clearly

### User Experience Testing Protocol

**Student Playtesting**:
1. Observe 3-5 students from target grade level
2. Note where they get confused or frustrated
3. Record completion time and success rate
4. Ask for verbal feedback: "What did you like? What was hard?"
5. Iterate based on findings

**Questions to Ask**:
- Did you understand what to do?
- Was it too easy, too hard, or just right?
- What was your favorite part?
- What would make it more fun?
- Did you learn something new?

### Cross-Browser Testing Checklist

Test on:
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac/iPad)
- [ ] Edge (Windows)
- [ ] iOS Safari (iPhone/iPad)
- [ ] Chrome Android (phone/tablet)

Check:
- [ ] All interactive elements work
- [ ] Audio plays correctly
- [ ] Visual elements display properly
- [ ] Responsive layout functions
- [ ] LocalStorage saves/loads
- [ ] No console errors

---

## 🚀 Integration Workflow

### Step 1: Planning Phase

**Define Learning Objectives**:
```markdown
Game: Multiplication Master
Target Grade: 3-4
Learning Objectives:
1. Practice multiplication facts 2-10
2. Develop automaticity with basic facts
3. Build confidence in mental math
4. Understand multiplication as repeated addition

Success Criteria:
- Students complete 20 problems in 5 minutes
- 80% accuracy rate
- Students can explain strategy
```

**Choose Game Mechanics**:
- Racing game: Solve problems to move forward
- Timed challenges for engagement
- Power-ups for correct answer streaks
- Visual feedback with car animations

**Select Difficulty Range**:
- Easy: 2-5 times tables, 60 seconds
- Medium: 2-10 times tables, 45 seconds
- Hard: 2-12 times tables, 30 seconds

### Step 2: Development Phase

**Start with Template**:
```bash
# Copy appropriate template as starting point
cp templates/math-racing-template.html public/games/multiplication-master.html
```

**Customize for Concept**:
1. Update problem generation logic
2. Adjust difficulty settings
3. Customize theme/visuals
4. Add subject-specific features

**Implement Game Logic**:
```javascript
// Replace generic problem generator
function generateProblem() {
    const num1 = randomInt(2, CONFIG.maxNumber);
    const num2 = randomInt(2, CONFIG.maxNumber);

    return {
        question: `${num1} × ${num2} = ?`,
        answer: num1 * num2,
        skill: 'multiplication',
        factors: [num1, num2]
    };
}

// Add multiplication-specific hints
function getHint(problem) {
    return `Think: ${problem.factors[0]} groups of ${problem.factors[1]}`;
}
```

**Add Accessibility Features**:
- Ensure all content has ARIA labels
- Test keyboard navigation
- Verify color contrast
- Add screen reader announcements

### Step 3: Testing Phase

**Functionality Testing**:
```markdown
✓ Game loads without errors
✓ All buttons work correctly
✓ Problems generate appropriately
✓ Scoring calculates correctly
✓ Timer counts down properly
✓ Victory/defeat screens display
✓ Restart function works
✓ Sound effects play
✓ Local storage saves progress
```

**Educational Review**:
- Have teacher review content
- Check alignment with standards
- Verify age-appropriateness
- Ensure concept clarity

**Performance Optimization**:
```javascript
// Check file size
console.log('File size:', document.documentElement.outerHTML.length / 1024, 'KB');

// Optimize if needed:
// - Minify inline CSS/JS
// - Compress SVG data URIs
// - Remove console.log statements
// - Simplify animations if lagging
```

**Accessibility Validation**:
- Run WAVE or axe DevTools
- Test with keyboard only
- Test with screen reader (NVDA/VoiceOver)
- Verify all contrast ratios

### Step 4: Deployment Phase

**Save in Correct Location**:
```bash
# Games go in public/games/
public/games/multiplication-master.html
```

**Create Catalog Metadata** (use catalog-metadata-formatter skill):
```typescript
{
  id: 'multiplication-master',
  title: 'Multiplication Master',
  description: 'Race to the finish line by solving multiplication problems! Practice your times tables in this fast-paced racing game.',
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

**Add to catalogData.ts**:
```typescript
// Add to mathGames array in /lib/catalogData.ts
export const mathGames: Adventure[] = [
  // ... existing games
  {
    id: 'multiplication-master',
    title: 'Multiplication Master',
    // ... rest of metadata
  }
];
```

**Test in Production Environment**:
1. Start dev server: `npm run dev`
2. Navigate to game via catalog
3. Verify game loads and plays
4. Test on mobile device
5. Check browser console for errors

---

## 💡 Complete Code Examples

### Example 1: Simple Addition Game (Complete File)

*See Template 1 above for complete Math Racing Game*

### Example 2: Fraction Pizza Party (Game Mechanics)

```javascript
// Fraction visualization game
const fractionGame = {
    currentLevel: 1,
    score: 0,
    targetFraction: null,
    playerPizza: [],

    init() {
        this.generateProblem();
        this.renderPizza();
    },

    generateProblem() {
        const denominators = [2, 4, 8];  // Easy fractions
        const denom = denominators[randomInt(0, denominators.length - 1)];
        const numer = randomInt(1, denom);

        this.targetFraction = {
            numerator: numer,
            denominator: denom
        };

        document.getElementById('orderText').textContent =
            `Customer wants ${numer}/${denom} of a pizza!`;
    },

    renderPizza() {
        const pizza = document.getElementById('pizza');
        pizza.innerHTML = '';

        const slices = this.targetFraction.denominator;
        const anglePerSlice = 360 / slices;

        for (let i = 0; i < slices; i++) {
            const slice = document.createElement('div');
            slice.className = 'pizza-slice';
            slice.style.transform = `rotate(${i * anglePerSlice}deg)`;
            slice.dataset.index = i;
            slice.onclick = () => this.toggleSlice(i);
            pizza.appendChild(slice);
        }
    },

    toggleSlice(index) {
        const slice = document.querySelector(`[data-index="${index}"]`);
        slice.classList.toggle('selected');

        const selected = document.querySelectorAll('.pizza-slice.selected').length;
        document.getElementById('currentFraction').textContent =
            `${selected}/${this.targetFraction.denominator}`;
    },

    checkAnswer() {
        const selected = document.querySelectorAll('.pizza-slice.selected').length;

        if (selected === this.targetFraction.numerator) {
            this.score += 10;
            showFeedback('🎉 Perfect! That\'s exactly right!', 'correct');
            setTimeout(() => {
                this.currentLevel++;
                this.generateProblem();
                this.renderPizza();
            }, 1500);
        } else {
            showFeedback('Try again! Count the slices carefully.', 'incorrect');
        }
    }
};
```

```css
/* Pizza CSS */
.pizza-container {
    width: 300px;
    height: 300px;
    margin: 30px auto;
    position: relative;
}

#pizza {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #FFD700;
    position: relative;
    overflow: hidden;
}

.pizza-slice {
    position: absolute;
    width: 50%;
    height: 50%;
    top: 0;
    left: 50%;
    transform-origin: 0 100%;
    border: 2px solid #D4A017;
    background: #FFA500;
    cursor: pointer;
    transition: all 0.3s;
}

.pizza-slice:hover {
    background: #FF8C00;
}

.pizza-slice.selected {
    background: #FF6347;
}
```

### Example 3: Science Lab Simulation (Interaction Patterns)

```javascript
// Simple chemistry mixing game
const chemistryLab = {
    beaker: {
        contents: [],
        color: '#FFFFFF',
        volume: 0
    },

    mixChemical(chemical) {
        this.beaker.contents.push(chemical);
        this.beaker.volume += chemical.volume;
        this.updateColor();
        this.checkReaction();
    },

    updateColor() {
        // Mix colors based on contents
        if (this.beaker.contents.length === 0) {
            this.beaker.color = '#FFFFFF';
        } else {
            const colors = this.beaker.contents.map(c => c.color);
            this.beaker.color = this.mixColors(colors);
        }

        document.getElementById('beaker').style.background =
            `linear-gradient(to bottom, transparent 0%, ${this.beaker.color} ${this.beaker.volume}%)`;
    },

    checkReaction() {
        const chemicals = this.beaker.contents.map(c => c.name).sort().join('+');

        const reactions = {
            'acid+base': {
                result: 'Water and salt formed!',
                animation: 'bubbles',
                sound: 'fizz',
                learning: 'Acids and bases neutralize each other'
            },
            'hydrogen+oxygen': {
                result: 'Water created!',
                animation: 'spark',
                sound: 'pop',
                learning: '2 hydrogen atoms + 1 oxygen atom = water molecule'
            }
        };

        if (reactions[chemicals]) {
            this.showReaction(reactions[chemicals]);
        }
    },

    showReaction(reaction) {
        playAnimation(reaction.animation);
        playSound(reaction.sound);
        showLearningPopup(reaction.result, reaction.learning);
        this.scorePoints(20);
    }
};
```

---

## 🎯 Best Practices & Common Pitfalls

### ✅ DO

- **Start Simple**: Begin with core mechanics, add features iteratively
- **Test Early**: Test with real students as soon as possible
- **Provide Clear Feedback**: Every action should have a visible response
- **Make It Fun First**: If the game isn't enjoyable, students won't engage
- **Use Semantic HTML**: Proper structure helps accessibility
- **Save Progress**: Use localStorage for persistence
- **Add Sound Toggles**: Some students prefer silent gameplay
- **Include Hints**: Support struggling learners
- **Celebrate Success**: Enthusiastic positive feedback motivates

### ❌ DON'T

- **Don't Overcomplicate**: Keep mechanics simple and focused
- **Don't Ignore Accessibility**: Screen readers and keyboard nav are essential
- **Don't Skip Testing**: Always test on target devices and browsers
- **Don't Use External Dependencies**: Keep everything self-contained
- **Don't Make It Too Easy/Hard**: Use adaptive difficulty
- **Don't Neglect Mobile**: Many students play on tablets
- **Don't Forget Edge Cases**: Handle divide by zero, empty inputs, etc.
- **Don't Use Tiny Buttons**: Young children need large touch targets
- **Don't Auto-Play Sound**: Let users enable audio

### Performance Optimization Tips

```javascript
// Use requestAnimationFrame for smooth animations
function animateCar() {
    requestAnimationFrame(() => {
        // Update car position
        car.style.left = carPosition + 'px';
    });
}

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

// Minimize DOM manipulations
// Bad: Multiple DOM updates
for (let i = 0; i < 10; i++) {
    container.innerHTML += `<div>${i}</div>`;
}

// Good: Single DOM update
let html = '';
for (let i = 0; i < 10; i++) {
    html += `<div>${i}</div>`;
}
container.innerHTML = html;

// Use CSS transforms instead of left/top for animations
// Bad:
element.style.left = x + 'px';
// Good:
element.style.transform = `translateX(${x}px)`;
```

### Code Organization Suggestions

```javascript
// Group related functionality
const GameManager = {
    state: {},
    init() {},
    start() {},
    pause() {},
    resume() {},
    end() {}
};

const ProblemGenerator = {
    generate() {},
    validate() {},
    getHint() {}
};

const UIManager = {
    update() {},
    showFeedback() {},
    updateScore() {}
};

// Use constants for configuration
const CONFIG = {
    // All configurable values in one place
    GAME_DURATION: 60,
    PROBLEMS_TO_WIN: 10,
    POINTS_PER_CORRECT: 10
};
```

---

## 📖 Resources & References

### Platform Documentation
- **CLAUDE.md**: Platform development guidelines and current status
- **COMPREHENSIVE_PLATFORM_PLAN.md**: Development roadmap and phases
- **catalog-metadata-formatter skill**: For creating proper metadata entries
- **react-game-component skill**: For React-based games
- **accessibility-validator skill**: For accessibility compliance

### Educational Game Design
- Learning objectives should drive mechanics
- Progressive difficulty keeps students in "flow state"
- Immediate feedback reinforces learning
- Multiple representations accommodate learning styles

### Accessibility Guidelines
- WCAG 2.1 AA compliance: https://www.w3.org/WAI/WCAG21/quickref/
- Keyboard navigation patterns
- ARIA label best practices
- Color contrast tools: WebAIM Contrast Checker

### Testing Tools
- Chrome DevTools for performance monitoring
- WAVE browser extension for accessibility
- axe DevTools for automated accessibility testing
- BrowserStack for cross-browser testing

---

## 📝 Quick Reference Checklist

Before submitting a game, verify:

**Technical**:
- [ ] Single HTML file with embedded CSS/JS
- [ ] File size under 3MB
- [ ] No external dependencies
- [ ] Works offline
- [ ] Tested on Chrome, Safari, Firefox, Edge
- [ ] Mobile responsive
- [ ] 60 FPS performance

**Educational**:
- [ ] Learning objectives clearly met
- [ ] Age-appropriate content
- [ ] Immediate feedback provided
- [ ] Progressive difficulty
- [ ] Hint system available
- [ ] Progress tracked

**User Experience**:
- [ ] Clear instructions
- [ ] Large, touch-friendly buttons
- [ ] Engaging visuals and audio
- [ ] Pause/resume functionality
- [ ] Sound toggle available
- [ ] Save progress works

**Accessibility**:
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast meets standards
- [ ] Focus indicators visible
- [ ] No keyboard traps

**Integration**:
- [ ] Saved in /public/games/
- [ ] Metadata created
- [ ] Added to catalogData.ts
- [ ] Tested via catalog page

---

**Version**: 1.0
**Last Updated**: October 2024
**Maintained By**: Learning Adventures Platform Team
