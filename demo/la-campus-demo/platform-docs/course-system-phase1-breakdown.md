# Phase 1: Course System - Complete Breakdown

## What We Built

Phase 1 established the **database foundation** for your DataCamp-style course system. Here's everything we created:

---

## 1. Database Schema (6 New Models)

### **Course Model** - The Main Course Container
Think of this as a textbook or curriculum unit.

```prisma
Course {
  id, title, slug              // Identification
  description                   // What students will learn
  subject                       // "math", "science", etc.
  gradeLevel: ["3-5", "4-6"]   // Target grades (can span multiple)
  difficulty                    // BEGINNER, INTERMEDIATE, ADVANCED
  isPremium                     // Free or paid access
  isPublished                   // Visible to users?
  thumbnailUrl                  // Course image
  estimatedMinutes              // Total time to complete
  totalXP                       // Total XP available
  prerequisiteCourseIds[]       // Courses required before this one

  // Relations
  lessons[]                     // All lessons in this course
  enrollments[]                 // All users enrolled
}
```

**Key Features:**
- Courses can require other courses (prerequisites)
- Supports both free and premium content
- Grade-level targeting for appropriate difficulty

---

### **CourseLesson Model** - Individual Learning Units
Each course contains multiple lessons in a specific order.

```prisma
CourseLesson {
  id, courseId
  order                         // Sequential: 1, 2, 3... (defines progression)
  title, description
  type                          // VIDEO, INTERACTIVE, GAME, QUIZ, READING, PROJECT
  contentPath                   // Where the lesson content lives
  duration                      // Minutes to complete
  xpReward                      // XP earned on completion
  requiredScore                 // Minimum % to pass (null = no test)
}
```

**Key Features:**
- **Linear Progression**: `order` field ensures lessons unlock sequentially
- **Required Scores**: Some lessons need 70%+, 80%+, or even 100% (safety lessons!)
- **Mixed Content**: Videos, games, quizzes, projects - keeps learning varied

**Example from our seed data:**
```
Multiplication Mastery Course:
  Lesson 1 (order: 1): "What is Multiplication?" - INTERACTIVE, 50 XP, no test
  Lesson 2 (order: 2): "Times Tables 1-5" - GAME, 75 XP, requires 70%
  Lesson 3 (order: 3): "Times Tables 6-10" - GAME, 75 XP, requires 70%
  ...
  Lesson 7 (order: 7): "Final Assessment" - PROJECT, 150 XP, requires 85%
```

---

### **CourseEnrollment Model** - User's Course Progress
When a user starts a course, we create an enrollment record.

```prisma
CourseEnrollment {
  id
  userId, courseId
  status                        // NOT_STARTED, IN_PROGRESS, COMPLETED
  enrolledAt                    // When they started
  completedAt                   // When they finished (null if not done)
  completedLessons              // Count of completed lessons
  totalXPEarned                 // XP earned so far in this course
  currentLessonOrder            // Which lesson they're on
  lastActivityAt                // Last time they did something
  certificateEarned             // Did they earn the certificate?
}
```

**Key Features:**
- One enrollment per user per course (unique constraint)
- Tracks overall course progress
- Certificate eligibility tracking

**How it works:**
1. User clicks "Start Course" → Creates enrollment with status: NOT_STARTED
2. User starts first lesson → Updates to IN_PROGRESS
3. User completes all lessons with passing scores → Updates to COMPLETED, sets certificateEarned: true

---

### **CourseLessonProgress Model** - Per-Lesson Tracking
Detailed tracking of each individual lesson attempt.

```prisma
CourseLessonProgress {
  id
  userId, enrollmentId, lessonId
  status                        // NOT_STARTED, IN_PROGRESS, COMPLETED, LOCKED
  startedAt, completedAt
  score                         // User's score (null if not graded)
  timeSpent                     // Seconds spent on this lesson
  attempts                      // How many tries (for retakes)
  xpEarned                      // XP actually earned
}
```

**Key Features:**
- **LOCKED status**: Future lessons start as LOCKED
- **Attempts tracking**: Users can retry if they fail
- **Detailed analytics**: Time spent, score achieved

**Linear Progression Logic:**
```
Lesson 1: COMPLETED (score: 95%) → Lesson 2: IN_PROGRESS
Lesson 2: COMPLETED (score: 65%) → Lesson 3: LOCKED (need 70%!)
  → User retries Lesson 2
Lesson 2: COMPLETED (score: 78%) → Lesson 3: NOT_STARTED (unlocked!)
```

---

### **DailyXP Model** - Daily Activity Tracking
Tracks XP earned each day with breakdown.

```prisma
DailyXP {
  id
  userId
  date                          // Just the date (2025-11-15)
  xpFromLessons                 // XP from completing lessons
  xpFromGames                   // XP from standalone games
  xpFromStreak                  // Bonus XP from maintaining streak
  totalXP                       // Sum of all sources
}
```

**Key Features:**
- One record per user per day (unique constraint)
- Breakdown shows where XP came from
- Enables daily XP leaderboards and goals

**How streaks work:**
```
Day 1:  100 XP from lessons × 1.0  = 100 XP (1 day streak)
Day 2:  100 XP from lessons × 1.0  = 100 XP (2 day streak)
Day 3:  100 XP from lessons × 1.2  = 120 XP (3+ day streak = 20% bonus!)
Day 7:  100 XP from lessons × 1.5  = 150 XP (7+ day streak = 50% bonus!)
Day 30: 100 XP from lessons × 2.0  = 200 XP (30+ day streak = 100% bonus!)
```

---

### **UserLevel Model** - User's Overall Progress
Tracks the user's level, total XP, and streaks.

```prisma
UserLevel {
  id
  userId                        // One-to-one with User
  currentLevel                  // Level 1, 2, 3...
  totalXP                       // Lifetime XP earned
  currentStreak                 // Days in a row with activity
  longestStreak                 // Personal best streak
  lastActivityDate              // Last day they did something
}
```

**Level Formula:**
```javascript
// XP required for each level increases exponentially
Level 1 → Level 2: 100 XP   (100 × 1^1.5 = 100)
Level 2 → Level 3: 282 XP   (100 × 2^1.5 = 282)
Level 3 → Level 4: 519 XP   (100 × 3^1.5 = 519)
Level 4 → Level 5: 800 XP   (100 × 4^1.5 = 800)
Level 5 → Level 6: 1118 XP  (100 × 5^1.5 = 1118)
```

**Streak Multipliers:**
```
1 day:   1.0x (no bonus yet)
3 days:  1.2x (+20% XP)
7 days:  1.5x (+50% XP)
30 days: 2.0x (+100% XP - DOUBLE!)
```

---

## 2. Sample Course Data Created

### Course 1: Multiplication Mastery 📘
- **Free** - Beginner - Math - Grades 3-5
- **7 lessons**, 180 minutes, **575 XP total**
- Progression: Intro → Tables 1-5 → Tables 6-10 → Strategies → Word Problems → Speed Challenge → Final Assessment
- No prerequisites (anyone can start)

### Course 2: Fractions Foundations 📗
- **Premium** - Intermediate - Math - Grades 4-6
- **9 lessons**, 240 minutes, **825 XP total**
- Progression: Intro Video → Identifying → Equivalent → Comparing → Adding → Subtracting → Mixed Numbers → Real Life → Final Project
- **Requires**: Multiplication Mastery completion first!

### Course 3: Science Lab Basics 📙
- **Free** - Beginner - Science - Grades 3-6
- **8 lessons**, 150 minutes, **625 XP total**
- Progression: Welcome → Safety (100% required!) → Scientific Method → Observations → Questions → Plant Experiment → Data Analysis → Design Experiment
- No prerequisites

---

## 3. How It All Works Together

### User Journey Example:

**Day 1 - Starting Out:**
1. Sarah (student) logs in → creates UserLevel (level 1, 0 XP, 0 streak)
2. Browses courses → clicks "Start Multiplication Mastery"
3. System creates CourseEnrollment (status: IN_PROGRESS)
4. System creates 7 CourseLessonProgress records:
   - Lesson 1: NOT_STARTED
   - Lessons 2-7: LOCKED (can't access yet)

**Day 1 - First Lesson:**
1. Sarah starts "What is Multiplication?" → Updates progress to IN_PROGRESS
2. Completes lesson in 12 minutes → Updates to COMPLETED
3. System awards 50 XP
4. System unlocks Lesson 2 (changes from LOCKED → NOT_STARTED)
5. Updates UserLevel: 50 total XP, currentStreak: 1
6. Creates DailyXP record: date: 2025-11-15, xpFromLessons: 50, totalXP: 50

**Day 2 - Second Lesson:**
1. Sarah starts "Times Tables 1-5" (game)
2. First attempt: scores 65% → FAILS (needs 70%)
3. Retry button appears → attempts: 2
4. Second attempt: scores 78% → PASSES
5. Awards 75 XP
6. Unlocks Lesson 3
7. Updates: totalXP: 125, currentStreak: 2

**Day 3 - Streak Bonus:**
1. Sarah completes Lesson 3: normally 75 XP
2. 3-day streak active → 75 × 1.2 = **90 XP** (bonus!)
3. DailyXP shows: xpFromLessons: 75, xpFromStreak: 15, totalXP: 90

**After completing all 7 lessons:**
1. CourseEnrollment updates: status: COMPLETED, certificateEarned: true
2. Sarah earned 575 XP → Level 2 unlocked! (only needed 282 XP)
3. **Fractions Foundations now unlocked** (prerequisite met)

---

## 4. Key Design Decisions

### Linear Progression (DataCamp-style)
- Lessons must be completed in order (enforced by `order` field)
- Can't skip ahead - builds proper foundation
- Previous lesson must pass required score to unlock next

### XP & Leveling System
- Everything earns XP: lessons, games, quizzes
- Bigger challenges = more XP (projects worth 150-175 XP)
- Exponential leveling keeps it challenging

### Streak Mechanics
- Daily activity tracking encourages consistency
- Multipliers reward dedication (up to 2x!)
- Miss a day → streak resets to 0

### Premium vs Free
- Free users: Limited course access (will set to 2 courses max in Phase 8)
- Premium users: Unlimited access to all courses
- Prerequisite system works across both tiers

### Required Scores
- Safety lessons: 100% required (no room for error!)
- Practice games: 70-80% to pass
- Final assessments: 85% to prove mastery
- Can retry unlimited times (attempts tracked)

---

## 5. What's Ready to Use

**Database Tables:** All 6 models created and working
**Sample Data:** 3 courses with 24 lessons ready to test
**Relations:** Prerequisites, enrollments, progress all linked
**Business Logic Foundation:** Linear progression, XP, streaks, premium access

---

## 6. Database Schema Reference

### Complete Model Definitions

```prisma
// ============================================================================
// COURSE SYSTEM MODELS
// ============================================================================

model Course {
  id                    String             @id @default(cuid())
  title                 String
  slug                  String             @unique
  description           String             @db.Text
  subject               String             // "math", "science", etc.
  gradeLevel            String[]           // ["3-5", "4-6"]
  difficulty            Difficulty         @default(BEGINNER)
  isPremium             Boolean            @default(false)
  isPublished           Boolean            @default(false)
  thumbnailUrl          String?
  estimatedMinutes      Int                // Total course duration
  totalXP               Int                @default(0)
  prerequisiteCourseIds String[]           // Course IDs required before this

  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  // Relations
  lessons               CourseLesson[]
  enrollments           CourseEnrollment[]

  @@index([subject])
  @@index([isPremium])
  @@index([isPublished])
}

model CourseLesson {
  id                    String                  @id @default(cuid())
  courseId              String
  order                 Int                     // Sequential ordering: 1, 2, 3...
  title                 String
  description           String                  @db.Text
  type                  LessonType              // VIDEO, INTERACTIVE, GAME, etc.
  contentPath           String                  // Path to lesson content
  duration              Int                     // Minutes to complete
  xpReward              Int                     @default(50)
  requiredScore         Int?                    // Minimum % to pass (null = no test)

  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  // Relations
  course                Course                  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessonProgress        CourseLessonProgress[]

  @@unique([courseId, order])
  @@index([courseId])
}

model CourseEnrollment {
  id                    String                  @id @default(cuid())
  userId                String
  courseId              String
  status                CourseStatus            @default(NOT_STARTED)
  enrolledAt            DateTime                @default(now())
  completedAt           DateTime?
  completedLessons      Int                     @default(0)
  totalXPEarned         Int                     @default(0)
  currentLessonOrder    Int                     @default(1)
  lastActivityAt        DateTime                @default(now())
  certificateEarned     Boolean                 @default(false)

  // Relations
  user                  User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  course                Course                  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessonProgress        CourseLessonProgress[]

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([status])
}

model CourseLessonProgress {
  id                    String                  @id @default(cuid())
  userId                String
  enrollmentId          String
  lessonId              String
  status                LessonProgressStatus    @default(NOT_STARTED)
  startedAt             DateTime?
  completedAt           DateTime?
  score                 Int?                    // User's score percentage
  timeSpent             Int                     @default(0) // Seconds
  attempts              Int                     @default(0)
  xpEarned              Int                     @default(0)

  // Relations
  user                  User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  enrollment            CourseEnrollment        @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lesson                CourseLesson            @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([enrollmentId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@index([status])
}

model DailyXP {
  id                    String    @id @default(cuid())
  userId                String
  date                  DateTime  @db.Date
  xpFromLessons         Int       @default(0)
  xpFromGames           Int       @default(0)
  xpFromStreak          Int       @default(0)
  totalXP               Int       @default(0)

  createdAt             DateTime  @default(now())

  // Relations
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}

model UserLevel {
  id                    String    @id @default(cuid())
  userId                String    @unique
  currentLevel          Int       @default(1)
  totalXP               Int       @default(0)
  currentStreak         Int       @default(0)
  longestStreak         Int       @default(0)
  lastActivityDate      DateTime?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([currentLevel])
  @@index([totalXP])
}

// ============================================================================
// ENUMS
// ============================================================================

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum LessonType {
  VIDEO
  INTERACTIVE
  GAME
  QUIZ
  READING
  PROJECT
}

enum CourseStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum LessonProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  LOCKED
}
```

---

## 7. Next: Phase 2 Preview

Now that the database is ready, Phase 2 will build the **data access layer**:
- Functions to fetch courses by subject, grade level, difficulty
- Enrollment logic (can user start this course?)
- Progress calculation (how far along are they?)
- Linear progression enforcement (is next lesson unlocked?)
- XP calculation utilities (apply streak bonuses)

This is the code layer that sits between your database and your UI components.

---

## Files Modified/Created in Phase 1

### Modified Files:
- `learning-adventures-app/prisma/schema.prisma` - Added 6 models, 4 enums, User relations

### New Files:
- `learning-adventures-app/prisma/seed.ts` - Integrated course seeding
- `learning-adventures-app/prisma/seed-courses.ts` - Standalone reference seed
- `learning-adventures-app/prisma/migrations/MIGRATION_GUIDE_course_system.md` - Migration guide
- `docs/course-system-phase1-complete.md` - Deployment guide
- `docs/course-system-phase1-breakdown.md` - This file

---

*Last Updated: November 15, 2025*
*Phase 1: Complete ✅*
*Next: Phase 2 - Course Data Structure*
