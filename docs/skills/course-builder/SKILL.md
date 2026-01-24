# Course Builder Skill

## Purpose

Build structured multi-lesson courses with XP progression, lesson sequencing, and completion tracking for the Learning Adventures platform.

---

## When to Use This Skill

Use this skill when:
- Creating a multi-lesson learning path (5-15 lessons)
- Building a course with sequential content unlocking
- Implementing XP and achievement systems
- Designing assessment checkpoints

**When NOT to use:**
- For single games → Use `educational-game-builder` skill
- For single lessons → Use educational game builder adapted for lessons
- For catalog metadata only → Use `catalog-metadata-formatter` skill

---

## Course Architecture

### Course Structure

```
Course
├── Metadata (title, description, subject, grades, etc.)
├── XP Configuration (total XP, distribution)
├── Lessons[] (ordered sequence)
│   ├── Lesson 1 (always unlocked)
│   ├── Lesson 2 (unlocked after Lesson 1)
│   ├── Lesson 3 (unlocked after Lesson 2)
│   ├── Quiz 1 (unlocked after Lessons 1-3)
│   └── ... more lessons
└── Completion Requirements
```

### Database Schema Reference

```typescript
// Course model
interface Course {
  id: string;
  title: string;
  description: string;
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalXp: number;
  estimatedTime: string;
  lessonCount: number;
  isPremium: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// CourseLesson model
interface CourseLesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  type: 'INTERACTIVE' | 'GAME' | 'VIDEO' | 'QUIZ' | 'READING' | 'PROJECT';
  description: string;
  contentId?: string;  // Reference to game/lesson in catalog
  xpReward: number;
  duration: string;
  requiredScore?: number;  // 0-100, null if no score required
  prerequisites: string[]; // Array of lesson IDs that must be completed
}

// CourseEnrollment model
interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  currentLessonId: string;
  xpEarned: number;
  progress: number;  // 0-100 percentage
}

// LessonProgress model
interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
  completedAt?: Date;
  attempts: number;
}
```

---

## Lesson Types

| Type | Description | XP Range | Typical Duration |
|------|-------------|----------|------------------|
| `INTERACTIVE` | Instructional content with practice | 50-150 XP | 10-20 mins |
| `GAME` | Gamified skill practice | 50-100 XP | 10-15 mins |
| `VIDEO` | Instructional video content | 25-50 XP | 5-10 mins |
| `QUIZ` | Assessment checkpoint | 100-200 XP | 10-15 mins |
| `READING` | Text-based learning material | 25-50 XP | 5-10 mins |
| `PROJECT` | Hands-on application activity | 150-300 XP | 20-30 mins |

---

## XP System Design

### Distribution Guidelines

| Component | Percentage | Purpose |
|-----------|------------|---------|
| Lessons | 50-60% | Core learning content |
| Games | 15-25% | Practice and reinforcement |
| Quizzes | 15-20% | Assessment checkpoints |
| Bonus/Achievements | 5-10% | Extra motivation |

### Example Distribution (1000 XP course)

```
Lesson 1 (INTERACTIVE):   75 XP
Lesson 2 (INTERACTIVE):   75 XP
Lesson 3 (GAME):          50 XP
Quiz 1:                  100 XP
Lesson 4 (INTERACTIVE):   75 XP
Lesson 5 (INTERACTIVE):   75 XP
Lesson 6 (GAME):          50 XP
Quiz 2:                  100 XP
Lesson 7 (INTERACTIVE):  100 XP
Final Quiz:              200 XP
Achievements:            100 XP
─────────────────────────────
TOTAL:                 1,000 XP
```

---

## Progression Rules

### Unlock Conditions

```typescript
// Linear progression (most common)
const linearUnlock = {
  lesson1: [],                    // Always available
  lesson2: ['lesson1'],           // After lesson 1
  lesson3: ['lesson2'],           // After lesson 2
  quiz1: ['lesson1', 'lesson2', 'lesson3'],  // After all 3
};

// Branching progression (advanced)
const branchingUnlock = {
  intro: [],
  pathA1: ['intro'],
  pathA2: ['pathA1'],
  pathB1: ['intro'],
  pathB2: ['pathB1'],
  final: ['pathA2', 'pathB2'],    // Requires both paths
};
```

### Completion Requirements

```typescript
// Standard lesson completion
const lessonComplete = {
  type: 'INTERACTIVE',
  requiredScore: null,  // View all content = complete
};

// Quiz with passing score
const quizComplete = {
  type: 'QUIZ',
  requiredScore: 70,    // Must score 70%+ to pass
  retakesAllowed: 3,    // Can retry 3 times
};

// Game with minimum plays
const gameComplete = {
  type: 'GAME',
  requiredScore: null,  // Playing = complete
};
```

---

## Course Creation Workflow

### Step 1: Define Course Objectives

```markdown
Course: Multiplication Mastery
Subject: math
Grades: 3, 4
Difficulty: intermediate
Total Time: 3-4 hours

Course Objective:
Students will demonstrate fluency in multiplication facts 0-12
and apply multiplication to solve word problems.
```

### Step 2: Plan Lesson Sequence

```markdown
1. Introduction to Multiplication (INTERACTIVE) - 15 min - 75 XP
   - Groups and repeated addition
   - Arrays introduction

2. Multiplication Facts: 2, 5, 10 (INTERACTIVE) - 15 min - 75 XP
   - Skip counting
   - Pattern recognition

3. Times Table Practice (GAME) - 10 min - 50 XP
   - Practice 2, 5, 10 facts

4. Checkpoint Quiz 1 (QUIZ) - 10 min - 100 XP
   - Test 2, 5, 10 facts
   - Passing: 70%

5. Multiplication Facts: 3, 4 (INTERACTIVE) - 15 min - 75 XP
   - Building from known facts

... [continue for all lessons]
```

### Step 3: Create Individual Content

For each lesson, use the appropriate skill:
- `INTERACTIVE` / `GAME` → educational-game-builder skill
- `QUIZ` → Create quiz HTML file

### Step 4: Configure Course Metadata

```typescript
// In course configuration
const multiplicationMastery = {
  id: 'multiplication-mastery',
  title: 'Multiplication Mastery',
  description: 'Master multiplication facts 0-12 through interactive lessons, engaging games, and progressive challenges.',
  subject: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'intermediate',
  totalXp: 1000,
  estimatedTime: '3-4 hours',
  lessonCount: 12,
  isPremium: false,
  lessons: [
    {
      id: 'mm-lesson-01',
      order: 1,
      title: 'Introduction to Multiplication',
      type: 'INTERACTIVE',
      description: 'Learn how multiplication relates to groups and repeated addition.',
      contentId: 'multiplication-intro-lesson',
      xpReward: 75,
      duration: '15 mins',
      prerequisites: []
    },
    {
      id: 'mm-lesson-02',
      order: 2,
      title: 'Multiplication Facts: 2, 5, 10',
      type: 'INTERACTIVE',
      description: 'Master the easiest multiplication facts using patterns.',
      contentId: 'multiplication-2-5-10-lesson',
      xpReward: 75,
      duration: '15 mins',
      prerequisites: ['mm-lesson-01']
    },
    {
      id: 'mm-game-01',
      order: 3,
      title: 'Times Table Blaster',
      type: 'GAME',
      description: 'Practice 2, 5, and 10 facts in this fast-paced game.',
      contentId: 'times-table-blaster-game',
      xpReward: 50,
      duration: '10 mins',
      prerequisites: ['mm-lesson-02']
    },
    {
      id: 'mm-quiz-01',
      order: 4,
      title: 'Checkpoint: 2, 5, 10 Facts',
      type: 'QUIZ',
      description: 'Test your knowledge of 2, 5, and 10 multiplication facts.',
      contentId: 'mm-quiz-01',
      xpReward: 100,
      duration: '10 mins',
      requiredScore: 70,
      prerequisites: ['mm-lesson-01', 'mm-lesson-02', 'mm-game-01']
    },
    // ... additional lessons
  ]
};
```

---

## Course Content File Naming

```
/public/lessons/
├── [course-id]-lesson-01.html
├── [course-id]-lesson-02.html
├── [course-id]-quiz-01.html
└── ...

/public/games/
├── [course-id]-game-01.html
├── [course-id]-game-02.html
└── ...
```

**Example:**
```
/public/lessons/
├── multiplication-mastery-lesson-01.html
├── multiplication-mastery-lesson-02.html
├── multiplication-mastery-quiz-01.html
└── multiplication-mastery-quiz-final.html

/public/games/
├── multiplication-mastery-game-01.html
└── multiplication-mastery-game-02.html
```

---

## Quiz Creation Template

### HTML Quiz Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Course] - [Quiz Name] - Learning Adventures</title>
    <meta name="content-type" content="quiz">
    <meta name="course-id" content="[course-id]">
    <meta name="passing-score" content="70">
    <style>
        /* Quiz-specific styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            min-height: 100vh;
            padding: 20px;
        }
        .quiz-container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .question {
            margin-bottom: 30px;
        }
        .question-text {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .option {
            padding: 15px 20px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .option:hover {
            border-color: #667eea;
            background: #f0f4ff;
        }
        .option.selected {
            border-color: #667eea;
            background: #e0e7ff;
        }
        .option.correct {
            border-color: #22c55e;
            background: #dcfce7;
        }
        .option.incorrect {
            border-color: #ef4444;
            background: #fee2e2;
        }
        .progress-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 4px;
            transition: width 0.3s;
        }
        .results {
            text-align: center;
        }
        .score {
            font-size: 48px;
            font-weight: 700;
            color: #667eea;
        }
        .pass { color: #22c55e; }
        .fail { color: #ef4444; }
        button {
            padding: 15px 30px;
            font-size: 18px;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
    </style>
</head>
<body>
    <div class="quiz-container">
        <div id="quiz-content">
            <!-- Quiz content rendered by JavaScript -->
        </div>
    </div>

    <script>
        const quizData = {
            title: '[Quiz Title]',
            passingScore: 70,
            questions: [
                {
                    id: 1,
                    text: 'What is 3 × 4?',
                    options: ['7', '12', '10', '14'],
                    correctIndex: 1,
                    explanation: '3 × 4 = 12 because 3 groups of 4 equals 12.'
                },
                {
                    id: 2,
                    text: 'What is 5 × 6?',
                    options: ['25', '30', '35', '11'],
                    correctIndex: 1,
                    explanation: '5 × 6 = 30. You can think of it as 5 groups of 6.'
                },
                // Add more questions...
            ]
        };

        let currentQuestion = 0;
        let score = 0;
        let answers = [];

        function renderQuestion() {
            const q = quizData.questions[currentQuestion];
            const progress = ((currentQuestion) / quizData.questions.length) * 100;

            document.getElementById('quiz-content').innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <p style="margin-bottom: 10px; color: #666;">
                    Question ${currentQuestion + 1} of ${quizData.questions.length}
                </p>
                <div class="question">
                    <p class="question-text">${q.text}</p>
                    <div class="options">
                        ${q.options.map((opt, i) => `
                            <div class="option"
                                 onclick="selectAnswer(${i})"
                                 tabindex="0"
                                 role="button"
                                 onkeydown="if(event.key==='Enter')selectAnswer(${i})">
                                ${opt}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function selectAnswer(index) {
            const q = quizData.questions[currentQuestion];
            const options = document.querySelectorAll('.option');

            options.forEach((opt, i) => {
                opt.classList.remove('selected');
                if (i === q.correctIndex) {
                    opt.classList.add('correct');
                } else if (i === index && i !== q.correctIndex) {
                    opt.classList.add('incorrect');
                }
                opt.onclick = null;
            });

            if (index === q.correctIndex) {
                score++;
            }
            answers.push({ questionId: q.id, selected: index, correct: q.correctIndex });

            setTimeout(() => {
                currentQuestion++;
                if (currentQuestion < quizData.questions.length) {
                    renderQuestion();
                } else {
                    showResults();
                }
            }, 1500);
        }

        function showResults() {
            const percentage = Math.round((score / quizData.questions.length) * 100);
            const passed = percentage >= quizData.passingScore;

            document.getElementById('quiz-content').innerHTML = `
                <div class="results">
                    <h2 style="margin-bottom: 20px;">Quiz Complete!</h2>
                    <p class="score ${passed ? 'pass' : 'fail'}">${percentage}%</p>
                    <p style="margin: 20px 0;">
                        You got ${score} out of ${quizData.questions.length} correct.
                    </p>
                    <p style="margin-bottom: 30px; font-size: 24px;">
                        ${passed ? '🎉 You passed!' : '📚 Keep practicing!'}
                    </p>
                    <p style="margin-bottom: 20px; color: #666;">
                        ${passed
                            ? 'Great job! You can move on to the next lesson.'
                            : `You need ${quizData.passingScore}% to pass. Review the material and try again.`}
                    </p>
                    <button class="btn-primary" onclick="location.reload()">
                        ${passed ? 'Review Answers' : 'Try Again'}
                    </button>
                </div>
            `;

            // Send results to parent/platform
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'quizComplete',
                    score: percentage,
                    passed: passed,
                    answers: answers
                }, '*');
            }
        }

        // Initialize
        renderQuestion();
    </script>
</body>
</html>
```

---

## Achievement System

### Standard Course Achievements

| Achievement | Criteria | Bonus XP |
|-------------|----------|----------|
| First Step | Complete first lesson | 10 XP |
| Halfway There | Complete 50% of course | 25 XP |
| Quiz Master | Score 100% on any quiz | 25 XP |
| Persistent | Retry and pass a failed quiz | 15 XP |
| Speed Learner | Complete lesson in < 50% time | 10 XP |
| Course Champion | Complete entire course | 50 XP |
| Perfect Course | 100% on all quizzes | 100 XP |

### Achievement Configuration

```typescript
const courseAchievements = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first lesson',
    criteria: { lessonsCompleted: 1 },
    xpReward: 10,
    icon: '👟'
  },
  {
    id: 'halfway',
    name: 'Halfway There',
    description: 'Complete half of the course',
    criteria: { progressPercent: 50 },
    xpReward: 25,
    icon: '🏃'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on any quiz',
    criteria: { perfectQuiz: true },
    xpReward: 25,
    icon: '🏆'
  },
  {
    id: 'course-champion',
    name: 'Course Champion',
    description: 'Complete the entire course',
    criteria: { courseComplete: true },
    xpReward: 50,
    icon: '👑'
  }
];
```

---

## Quality Checklist

### Course Structure
- [ ] Course has clear learning objectives
- [ ] 5-15 lessons is appropriate length
- [ ] Balanced mix of content types (interactive, game, quiz)
- [ ] Logical progression (easy → hard)
- [ ] Total time is reasonable (2-5 hours typical)
- [ ] XP distribution is motivating

### Individual Content
- [ ] Each lesson created using appropriate skill/template
- [ ] All HTML files are self-contained
- [ ] All content meets accessibility standards
- [ ] Consistent visual theme across course
- [ ] File naming follows convention

### Progression System
- [ ] Unlock conditions are clear
- [ ] Prerequisites are logical
- [ ] Quiz passing scores are fair (70% typical)
- [ ] Retakes are allowed where appropriate
- [ ] Final assessment covers all objectives

### Testing
- [ ] Complete course as test user
- [ ] Verify all unlocks work correctly
- [ ] Test quiz scoring and passing
- [ ] Verify XP awards correctly
- [ ] Test achievement triggers
- [ ] Check progress saves properly

---

## Example: Complete Course Definition

```typescript
// Full course example: Fraction Foundations
const fractionFoundations = {
  id: 'fraction-foundations',
  title: 'Fraction Foundations',
  description: 'Build a strong foundation in fractions through visual models, interactive practice, and engaging games. Perfect for students learning fractions for the first time.',
  subject: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'beginner',
  totalXp: 850,
  estimatedTime: '2-3 hours',
  lessonCount: 10,
  isPremium: false,

  lessons: [
    {
      id: 'ff-01',
      order: 1,
      title: 'What Are Fractions?',
      type: 'INTERACTIVE',
      description: 'Discover what fractions are and why we use them.',
      contentId: 'fraction-foundations-lesson-01',
      xpReward: 75,
      duration: '12 mins',
      prerequisites: []
    },
    {
      id: 'ff-02',
      order: 2,
      title: 'Parts of a Whole',
      type: 'INTERACTIVE',
      description: 'Learn about numerators, denominators, and equal parts.',
      contentId: 'fraction-foundations-lesson-02',
      xpReward: 75,
      duration: '15 mins',
      prerequisites: ['ff-01']
    },
    {
      id: 'ff-03',
      order: 3,
      title: 'Fraction Pizza Party',
      type: 'GAME',
      description: 'Practice identifying fractions by making pizza orders.',
      contentId: 'fraction-pizza-party',
      xpReward: 50,
      duration: '10 mins',
      prerequisites: ['ff-02']
    },
    {
      id: 'ff-quiz-01',
      order: 4,
      title: 'Checkpoint: Fraction Basics',
      type: 'QUIZ',
      description: 'Test your understanding of fraction fundamentals.',
      contentId: 'fraction-foundations-quiz-01',
      xpReward: 100,
      duration: '10 mins',
      requiredScore: 70,
      prerequisites: ['ff-01', 'ff-02', 'ff-03']
    },
    {
      id: 'ff-04',
      order: 5,
      title: 'Comparing Fractions',
      type: 'INTERACTIVE',
      description: 'Learn to compare fractions using visual models.',
      contentId: 'fraction-foundations-lesson-04',
      xpReward: 75,
      duration: '15 mins',
      prerequisites: ['ff-quiz-01']
    },
    {
      id: 'ff-05',
      order: 6,
      title: 'Equivalent Fractions',
      type: 'INTERACTIVE',
      description: 'Discover how different fractions can be equal.',
      contentId: 'fraction-foundations-lesson-05',
      xpReward: 75,
      duration: '15 mins',
      prerequisites: ['ff-04']
    },
    {
      id: 'ff-06',
      order: 7,
      title: 'Fraction Match',
      type: 'GAME',
      description: 'Match equivalent fractions in this memory game.',
      contentId: 'fraction-match-game',
      xpReward: 50,
      duration: '10 mins',
      prerequisites: ['ff-05']
    },
    {
      id: 'ff-quiz-02',
      order: 8,
      title: 'Checkpoint: Comparing & Equivalents',
      type: 'QUIZ',
      description: 'Test your skills with comparing and equivalent fractions.',
      contentId: 'fraction-foundations-quiz-02',
      xpReward: 100,
      duration: '10 mins',
      requiredScore: 70,
      prerequisites: ['ff-04', 'ff-05', 'ff-06']
    },
    {
      id: 'ff-07',
      order: 9,
      title: 'Fractions in Real Life',
      type: 'INTERACTIVE',
      description: 'See how fractions are used in everyday situations.',
      contentId: 'fraction-foundations-lesson-07',
      xpReward: 75,
      duration: '12 mins',
      prerequisites: ['ff-quiz-02']
    },
    {
      id: 'ff-final',
      order: 10,
      title: 'Final Assessment',
      type: 'QUIZ',
      description: 'Complete assessment covering all fraction concepts.',
      contentId: 'fraction-foundations-final',
      xpReward: 175,
      duration: '15 mins',
      requiredScore: 70,
      prerequisites: ['ff-07']
    }
  ],

  achievements: [
    { id: 'ff-first-step', name: 'Fraction Explorer', criteria: { lessonsCompleted: 1 }, xpReward: 10 },
    { id: 'ff-halfway', name: 'Fraction Fan', criteria: { progressPercent: 50 }, xpReward: 25 },
    { id: 'ff-complete', name: 'Fraction Master', criteria: { courseComplete: true }, xpReward: 50 }
  ]
};
```

---

## Related Skills

- [Educational Game Builder](../educational-game-builder/SKILL.md) - For creating game content
- [Catalog Metadata Formatter](../catalog-metadata-formatter/SKILL.md) - For catalog entries
- [Accessibility Validator](../accessibility-validator/SKILL.md) - For compliance checking

---

*Version: 1.0 | Last Updated: January 2026*
