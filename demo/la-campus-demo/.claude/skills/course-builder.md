# Course Builder Skill
## Learning Adventures Platform - Premium Course Creation

**Skill Type**: Educational Content Development
**Target**: Premium Tier Courses
**Model**: DataCamp-inspired structured learning paths

---

## 🎯 Purpose

This skill guides Claude Code in creating structured, multi-lesson courses for the Learning Adventures Platform premium tier. Courses consist of 7+ sequential lessons with integrated assessments and XP progression.

---

## 📋 Course Creation Checklist

When asked to create a course, follow these steps:

### Phase 1: Planning
- [ ] Determine subject area (Math, Science, English, History, Interdisciplinary)
- [ ] Identify target grade level(s)
- [ ] Define learning objectives (3-5 key outcomes)
- [ ] List prerequisite knowledge/courses
- [ ] Estimate total duration (minutes)

### Phase 2: Course Structure
- [ ] Design 7+ lessons with clear progression
- [ ] Map lesson types (INTERACTIVE, GAME, QUIZ, etc.)
- [ ] Reference existing HTML games/lessons where applicable
- [ ] Create new content only when necessary
- [ ] Plan assessments after each lesson

### Phase 3: Content Development
- [ ] Build/identify content for each lesson
- [ ] Write quiz questions (5-10 per assessment)
- [ ] Create final project/comprehensive assessment
- [ ] Calculate XP rewards per lesson

### Phase 4: Database Integration
- [ ] Create Course record with metadata
- [ ] Create CourseLesson records (ordered 1-7+)
- [ ] Link to existing content via `contentPath`
- [ ] Set difficulty and prerequisites

### Phase 5: Testing
- [ ] Verify sequential unlocking works
- [ ] Test all lesson content loads correctly
- [ ] Validate quiz scoring logic
- [ ] Check XP calculations
- [ ] Generate sample certificate

---

## 🏗️ Course Structure Template

```typescript
// Course Template Structure
{
  title: "Course Name",
  slug: "course-name-slug",
  subject: "math" | "science" | "english" | "history" | "interdisciplinary",
  gradeLevel: ["3", "4", "5"], // Target grades
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  isPremium: true, // Premium courses require subscription
  isPublished: false, // Set to true when ready
  description: "Comprehensive description of what students will learn...",
  thumbnailUrl: "/images/courses/course-name.png",
  estimatedMinutes: 180, // Total course duration
  totalXP: 525, // Sum of all lesson XP rewards
  prerequisiteCourseIds: [], // Array of prerequisite course IDs

  lessons: [
    {
      order: 1,
      title: "Introduction to [Topic]",
      description: "Brief description of lesson content...",
      type: "INTERACTIVE",
      contentPath: "/lessons/existing-lesson.html",
      duration: 20,
      xpReward: 50,
      requiredScore: null // No minimum score for first lesson
    },
    {
      order: 2,
      title: "Practicing [Skill]",
      description: "Hands-on practice with guided activities...",
      type: "GAME",
      contentPath: "/games/existing-game.html",
      duration: 25,
      xpReward: 50,
      requiredScore: null
    },
    {
      order: 3,
      title: "Assessment: [Topic] Basics",
      description: "Quick quiz to check understanding...",
      type: "QUIZ",
      contentPath: "quiz-lesson-3", // Reference to quiz questions
      duration: 15,
      xpReward: 75,
      requiredScore: 60 // Must score 60% to pass
    },
    // ... 4 more lessons ...
    {
      order: 7,
      title: "Final Project: [Creative Application]",
      description: "Apply everything learned in a comprehensive project...",
      type: "PROJECT",
      contentPath: "/projects/course-name-final.html",
      duration: 30,
      xpReward: 100,
      requiredScore: 70 // Higher bar for final project
    }
  ]
}
```

---

## 🎮 Lesson Type Guidelines

### INTERACTIVE Lessons
- **Purpose**: Teach concepts through hands-on interaction
- **Content**: Existing HTML lessons from `/public/lessons/`
- **Duration**: 15-30 minutes
- **XP Reward**: 50 XP
- **Requirements**: Complete the activity

**Example Mapping:**
```javascript
{
  type: "INTERACTIVE",
  contentPath: "/lessons/solar-system-explorer.html", // Existing lesson
  title: "Exploring the Solar System",
  duration: 25,
  xpReward: 50
}
```

### GAME Lessons
- **Purpose**: Practice skills in engaging game format
- **Content**: Existing HTML games from `/public/games/`
- **Duration**: 20-30 minutes
- **XP Reward**: 50 XP
- **Requirements**: Complete the game

**Example Mapping:**
```javascript
{
  type: "GAME",
  contentPath: "/games/number-monster-feeding.html", // Existing game
  title: "Number Monster Feeding Frenzy",
  duration: 20,
  xpReward: 50
}
```

### QUIZ Lessons
- **Purpose**: Assess understanding and retention
- **Content**: Custom quiz questions (stored in database or separate file)
- **Duration**: 10-15 minutes
- **XP Reward**: 75 XP (higher for assessments)
- **Requirements**: Score 60%+ to unlock next lesson

**Quiz Question Format:**
```javascript
{
  type: "QUIZ",
  contentPath: "quiz-math-addition-basics", // Quiz identifier
  duration: 15,
  xpReward: 75,
  requiredScore: 60,
  questions: [
    {
      question: "What is 5 + 7?",
      options: ["10", "11", "12", "13"],
      correctAnswer: 2, // Index 2 = "12"
      explanation: "5 + 7 = 12. You can count up from 5: 6, 7, 8, 9, 10, 11, 12."
    },
    // 4-9 more questions...
  ]
}
```

### VIDEO Lessons (Future)
- **Purpose**: Conceptual explanations and demonstrations
- **Content**: Video files or YouTube/Vimeo embeds
- **Duration**: 5-10 minutes
- **XP Reward**: 25 XP
- **Requirements**: Watch video to completion

### READING Lessons
- **Purpose**: Text-based explanations and theory
- **Content**: Markdown or HTML text content
- **Duration**: 10-20 minutes
- **XP Reward**: 25 XP
- **Requirements**: Read through content

### PROJECT Lessons
- **Purpose**: Comprehensive application of learned skills
- **Content**: Open-ended creative projects
- **Duration**: 30-60 minutes
- **XP Reward**: 100 XP
- **Requirements**: Complete project submission

---

## 📊 XP Calculation Guide

### Base XP by Lesson Type
```javascript
const BASE_XP = {
  INTERACTIVE: 50,
  GAME: 50,
  QUIZ: 75,
  VIDEO: 25,
  READING: 25,
  PROJECT: 100
}
```

### Quiz Performance Bonuses
```javascript
const QUIZ_BONUSES = {
  perfectScore: 25,     // +25 XP for 100%
  firstAttemptPass: 10, // +10 XP for passing first try
  noHints: 5            // +5 XP for no hints used
}

// Example: QUIZ (75 XP) + perfect score (25) + first attempt (10) + no hints (5) = 115 XP
```

### Total Course XP
Sum of all lesson base XP:
```javascript
// Example 7-lesson course:
// Lesson 1 (INTERACTIVE): 50 XP
// Lesson 2 (GAME): 50 XP
// Lesson 3 (QUIZ): 75 XP
// Lesson 4 (INTERACTIVE): 50 XP
// Lesson 5 (GAME): 50 XP
// Lesson 6 (QUIZ): 75 XP
// Lesson 7 (PROJECT): 100 XP
// Total: 450 XP (base)
// Potential with bonuses: 450 + (75 bonus from 2 quizzes) = 525 XP max
```

---

## 🗄️ Database Integration

### Creating a Course in Database

```typescript
// Example: Creating a Math Course
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createCourse() {
  const course = await prisma.course.create({
    data: {
      title: "Introduction to Elementary Mathematics",
      slug: "intro-elementary-math",
      subject: "math",
      gradeLevel: ["3", "4", "5"],
      difficulty: "BEGINNER",
      isPremium: true,
      isPublished: true,
      description: "Master foundational math concepts including addition, subtraction, patterns, and word problems through interactive games and assessments.",
      thumbnailUrl: "/images/courses/math-elementary.png",
      estimatedMinutes: 180,
      totalXP: 525,
      prerequisiteCourseIds: [],

      lessons: {
        create: [
          {
            order: 1,
            title: "Numbers and Counting",
            description: "Learn to count and identify numbers through fun interactive activities.",
            type: "INTERACTIVE",
            contentPath: "/lessons/counting-adventure.html",
            duration: 25,
            xpReward: 50,
            requiredScore: null
          },
          {
            order: 2,
            title: "Addition Practice Game",
            description: "Practice addition skills by feeding the hungry number monster!",
            type: "GAME",
            contentPath: "/games/number-monster-feeding.html",
            duration: 20,
            xpReward: 50,
            requiredScore: null
          },
          {
            order: 3,
            title: "Addition Assessment",
            description: "Test your addition knowledge with this quick quiz.",
            type: "QUIZ",
            contentPath: "quiz-addition-basics",
            duration: 15,
            xpReward: 75,
            requiredScore: 60
          },
          {
            order: 4,
            title: "Subtraction Basics",
            description: "Learn subtraction concepts through interactive lessons.",
            type: "INTERACTIVE",
            contentPath: "/lessons/subtraction-intro.html",
            duration: 25,
            xpReward: 50,
            requiredScore: null
          },
          {
            order: 5,
            title: "Subtraction Space Race",
            description: "Race through space while solving subtraction problems!",
            type: "GAME",
            contentPath: "/games/subtraction-space-race.html",
            duration: 20,
            xpReward: 50,
            requiredScore: null
          },
          {
            order: 6,
            title: "Subtraction Assessment",
            description: "Show what you've learned about subtraction.",
            type: "QUIZ",
            contentPath: "quiz-subtraction-basics",
            duration: 15,
            xpReward: 75,
            requiredScore: 60
          },
          {
            order: 7,
            title: "Math Story Creator",
            description: "Create your own math story problems and solve them!",
            type: "PROJECT",
            contentPath: "/projects/math-story-creator.html",
            duration: 30,
            xpReward: 100,
            requiredScore: 70
          }
        ]
      }
    },
    include: {
      lessons: true
    }
  });

  console.log(`Created course: ${course.title} with ${course.lessons.length} lessons`);
  return course;
}
```

### Creating Quiz Questions

Quiz questions can be stored in a separate JSON file or database table:

```typescript
// Option 1: JSON file in /public/quizzes/
// File: /public/quizzes/quiz-addition-basics.json
{
  "quizId": "quiz-addition-basics",
  "title": "Addition Basics Quiz",
  "description": "Test your understanding of basic addition concepts",
  "passingScore": 60,
  "questions": [
    {
      "id": "q1",
      "question": "What is 3 + 4?",
      "options": ["5", "6", "7", "8"],
      "correctAnswer": 2,
      "explanation": "3 + 4 = 7. You can count up: 4, 5, 6, 7."
    },
    {
      "id": "q2",
      "question": "If you have 5 apples and get 3 more, how many apples do you have?",
      "options": ["7", "8", "9", "10"],
      "correctAnswer": 1,
      "explanation": "5 + 3 = 8 apples total."
    },
    // 3-8 more questions...
  ]
}

// Option 2: Database table (future enhancement)
// model QuizQuestion {
//   id        String @id @default(cuid())
//   quizId    String
//   question  String
//   options   String[]
//   correctAnswer Int
//   explanation String?
// }
```

---

## 🎨 Content Reuse Strategy

### Leverage Existing Content

**DO:**
- ✅ Map existing HTML games to GAME lessons
- ✅ Map existing HTML lessons to INTERACTIVE lessons
- ✅ Reuse content across multiple courses when appropriate
- ✅ Focus on creating NEW quiz questions and projects

**DON'T:**
- ❌ Duplicate existing games/lessons
- ❌ Create new content when existing content fits
- ❌ Modify existing standalone games/lessons

### Content Mapping Examples

```typescript
// Example: Math Course using existing content
const mathCourse = {
  lessons: [
    // Existing game
    {
      type: "GAME",
      contentPath: "/games/number-monster-feeding.html",
      title: "Number Monster Feeding"
    },

    // Existing lesson
    {
      type: "INTERACTIVE",
      contentPath: "/lessons/counting-adventure.html",
      title: "Counting Adventure"
    },

    // NEW quiz (create quiz questions)
    {
      type: "QUIZ",
      contentPath: "quiz-math-basics",
      title: "Math Basics Quiz"
      // Need to create: /public/quizzes/quiz-math-basics.json
    },

    // NEW project (create project activity)
    {
      type: "PROJECT",
      contentPath: "/projects/math-story-creator.html",
      title: "Math Story Creator"
      // Need to create: /public/projects/math-story-creator.html
    }
  ]
}
```

---

## 📝 Course Creation Workflow

### Step-by-Step Process

#### 1. Review Existing Content
```bash
# List available games
ls learning-adventures-app/public/games/

# List available lessons
ls learning-adventures-app/public/lessons/

# Check catalog data for metadata
cat learning-adventures-app/lib/catalogData.ts
```

#### 2. Plan Course Structure
Create a planning document:

```markdown
# Course: [Course Name]

## Learning Objectives
1. Objective 1
2. Objective 2
3. Objective 3

## Target Audience
- Grade Levels: [3-5]
- Prerequisites: [None or course IDs]
- Difficulty: [BEGINNER/INTERMEDIATE/ADVANCED]

## Lesson Plan

### Lesson 1: [Title]
- Type: INTERACTIVE
- Content: /lessons/existing-lesson.html
- Duration: 25 min
- XP: 50

### Lesson 2: [Title]
- Type: GAME
- Content: /games/existing-game.html
- Duration: 20 min
- XP: 50

### Lesson 3: [Title]
- Type: QUIZ
- Content: quiz-[identifier] (NEW - need to create)
- Duration: 15 min
- XP: 75

[Continue for all 7+ lessons...]

## Total Stats
- Total Lessons: 7
- Total Duration: 180 min
- Total XP: 525
```

#### 3. Create New Content (if needed)

**For Quizzes:**
```bash
# Create quiz JSON file
touch learning-adventures-app/public/quizzes/quiz-[identifier].json

# Populate with questions (5-10 questions)
```

**For Projects:**
```bash
# Create project HTML file
touch learning-adventures-app/public/projects/[project-name].html

# Build interactive project activity
```

#### 4. Seed Database

Create a seed script:

```typescript
// learning-adventures-app/prisma/seeds/courses/[course-name].ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seed[CourseName]() {
  const course = await prisma.course.create({
    data: {
      // ... course data ...
      lessons: {
        create: [
          // ... lesson data ...
        ]
      }
    }
  });

  console.log(`✓ Created course: ${course.title}`);
  return course;
}
```

Run seed:
```bash
npx prisma db seed
```

#### 5. Test Course

```bash
# Start dev server
npm run dev

# Navigate to course page
# http://localhost:3000/courses/[slug]

# Test as premium user:
# - Enroll in course
# - Complete Lesson 1
# - Verify Lesson 2 unlocks
# - Complete quiz and check XP
# - Complete all lessons
# - Verify certificate generation
```

---

## 🧪 Quality Assurance Checklist

### Before Publishing (isPublished: true)

- [ ] All lessons have valid contentPath references
- [ ] Content paths point to existing files/resources
- [ ] Sequential unlocking works correctly
- [ ] Quiz questions are error-free
- [ ] XP calculations are accurate
- [ ] Course metadata is complete (thumbnail, description, etc.)
- [ ] Difficulty level is appropriate
- [ ] Estimated duration is realistic
- [ ] Mobile responsiveness tested
- [ ] Accessibility standards met
- [ ] Certificate generation works
- [ ] All lessons tested end-to-end

---

## 🎯 Sample Course Templates

### Template 1: Math Course (Elementary)

```typescript
{
  title: "Addition & Subtraction Mastery",
  slug: "addition-subtraction-mastery",
  subject: "math",
  gradeLevel: ["2", "3", "4"],
  difficulty: "BEGINNER",
  isPremium: true,
  description: "Master addition and subtraction through interactive games, practice exercises, and real-world applications.",
  estimatedMinutes: 175,
  totalXP: 525,
  lessons: [
    { order: 1, type: "INTERACTIVE", title: "Introduction to Addition", xpReward: 50 },
    { order: 2, type: "GAME", title: "Addition Practice Game", xpReward: 50 },
    { order: 3, type: "QUIZ", title: "Addition Quiz", xpReward: 75 },
    { order: 4, type: "INTERACTIVE", title: "Introduction to Subtraction", xpReward: 50 },
    { order: 5, type: "GAME", title: "Subtraction Practice Game", xpReward: 50 },
    { order: 6, type: "QUIZ", title: "Subtraction Quiz", xpReward: 75 },
    { order: 7, type: "PROJECT", title: "Word Problem Creator", xpReward: 100 }
  ]
}
```

### Template 2: Science Course (Elementary)

```typescript
{
  title: "The Solar System Explorer",
  slug: "solar-system-explorer",
  subject: "science",
  gradeLevel: ["3", "4", "5"],
  difficulty: "BEGINNER",
  description: "Journey through our solar system and learn about planets, moons, and the Sun.",
  estimatedMinutes: 200,
  totalXP: 550,
  lessons: [
    { order: 1, type: "INTERACTIVE", title: "Our Sun and Solar System", xpReward: 50 },
    { order: 2, type: "GAME", title: "Planet Order Game", xpReward: 50 },
    { order: 3, type: "QUIZ", title: "Solar System Quiz", xpReward: 75 },
    { order: 4, type: "INTERACTIVE", title: "Rocky vs Gas Giants", xpReward: 50 },
    { order: 5, type: "GAME", title: "Planet Characteristics Match", xpReward: 50 },
    { order: 6, type: "INTERACTIVE", title: "Moons and Other Objects", xpReward: 50 },
    { order: 7, type: "QUIZ", title: "Advanced Solar System Quiz", xpReward: 75 },
    { order: 8, type: "PROJECT", title: "Design Your Own Planet", xpReward: 100 }
  ]
}
```

### Template 3: English Course (Elementary)

```typescript
{
  title: "Grammar Fundamentals",
  slug: "grammar-fundamentals",
  subject: "english",
  gradeLevel: ["3", "4", "5"],
  difficulty: "BEGINNER",
  description: "Build strong grammar skills with parts of speech, sentence structure, and punctuation.",
  estimatedMinutes: 180,
  totalXP: 525,
  lessons: [
    { order: 1, type: "INTERACTIVE", title: "Nouns and Pronouns", xpReward: 50 },
    { order: 2, type: "GAME", title: "Parts of Speech Game", xpReward: 50 },
    { order: 3, type: "QUIZ", title: "Nouns & Pronouns Quiz", xpReward: 75 },
    { order: 4, type: "INTERACTIVE", title: "Verbs and Tenses", xpReward: 50 },
    { order: 5, type: "GAME", title: "Verb Tense Adventure", xpReward: 50 },
    { order: 6, type: "QUIZ", title: "Verbs & Tenses Quiz", xpReward: 75 },
    { order: 7, type: "PROJECT", title: "Write Your Story", xpReward: 100 }
  ]
}
```

---

## 🚀 Quick Start: Creating Your First Course

### Option 1: Use Existing Content Only (Fastest)

```bash
# 1. Review available games/lessons
cat learning-adventures-app/lib/catalogData.ts

# 2. Create course seed script
cat > learning-adventures-app/prisma/seeds/sample-course.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.create({
    data: {
      title: "My First Course",
      slug: "my-first-course",
      subject: "math",
      gradeLevel: ["3", "4"],
      difficulty: "BEGINNER",
      isPremium: true,
      isPublished: true,
      description: "A sample course to test the system",
      estimatedMinutes: 120,
      totalXP: 350,
      lessons: {
        create: [
          {
            order: 1,
            title: "Lesson 1",
            type: "GAME",
            contentPath: "/games/number-monster-feeding.html",
            duration: 20,
            xpReward: 50
          },
          // Add 6 more lessons...
        ]
      }
    }
  });

  console.log(`Created course: ${course.id}`);
}

main();
EOF

# 3. Run seed
npx tsx learning-adventures-app/prisma/seeds/sample-course.ts

# 4. Test at http://localhost:3000/courses/my-first-course
```

### Option 2: Create Complete Course with Quizzes

Follow the full workflow in the "Course Creation Workflow" section above.

---

## 📖 Reference: Existing Content Inventory

### Available Math Games
- `/games/number-monster-feeding.html` - Addition practice
- `/games/math-adventure-quest.html` - Mixed operations
- (Check catalogData.ts for complete list)

### Available Science Lessons
- `/lessons/solar-system-explorer.html` - Solar system
- `/lessons/water-cycle.html` - Water cycle
- (Check catalogData.ts for complete list)

### Available English Games
- `/games/grammar-galaxy.html` - Parts of speech
- (Check catalogData.ts for complete list)

---

## ⚡ Pro Tips

1. **Start Simple**: Create your first course using only existing content. Add custom quizzes later.

2. **Reuse Wisely**: Many games can fit multiple courses (e.g., "Number Monster Feeding" works for both "Addition Basics" and "Elementary Math Review").

3. **Quiz Quality**: Write 7-10 questions per quiz. Mix difficulty levels. Always include explanations.

4. **XP Balance**: Keep base XP consistent within lesson types. Save bonus XP for exceptional performance.

5. **Test Thoroughly**: Always test the complete course flow from a student perspective before publishing.

6. **Progressive Difficulty**: Order lessons from easiest to hardest. Save projects for the end.

7. **Clear Descriptions**: Write clear, engaging lesson descriptions that set expectations.

8. **Visual Appeal**: Add thumbnails and icons to make courses visually appealing.

---

## 🔗 Related Documentation

- **Main Tech Spec**: `/COURSE_SYSTEM_TECH_SPEC.md`
- **Database Schema**: `/learning-adventures-app/prisma/schema.prisma`
- **Catalog Data**: `/learning-adventures-app/lib/catalogData.ts`
- **Development Plan**: `/COMPREHENSIVE_PLATFORM_PLAN.md`
- **Platform Instructions**: `/CLAUDE.md`

---

**Last Updated**: December 23, 2024
**Skill Version**: 1.0
**Compatible With**: Learning Adventures Platform v2.0+
