# Course System Implementation Plan
**Learning Adventures Platform - DataCamp-Style Course Feature**

**Created**: November 2025
**Status**: Planning Phase
**Goal**: Build structured course system with linear progression and XP mechanics

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Course Architecture](#course-architecture)
3. [Database Schema](#database-schema)
4. [XP & Progression System](#xp--progression-system)
5. [UI/UX Design](#uiux-design)
6. [Implementation Phases](#implementation-phases)
7. [API Endpoints](#api-endpoints)
8. [Components Structure](#components-structure)

---

## Overview

### **Course System Features**

Similar to DataCamp, our course system provides:

**📚 Structured Learning Paths**
- Multi-lesson courses organized by topic
- Linear progression (complete lesson 1 to unlock lesson 2)
- Mix of interactive lessons and practice games
- Estimated time per lesson/course

**⭐ XP & Progression**
- Daily XP for completing lessons
- Streak bonuses for consecutive days
- Level system based on total XP
- Progress bars and completion percentages

**🎯 Premium Access**
- Free users: Limited course access (1-2 courses)
- Premium users: Full course catalog
- Course certificates upon completion

**📊 Enhanced Tracking**
- Course-level progress tracking
- Lesson completion status
- Time spent per lesson
- Quiz scores and assessments

---

## Course Architecture

### **Course Structure Hierarchy**

```
Course
├── Metadata (title, description, difficulty, subject)
├── Prerequisites (other courses required)
├── Lessons (ordered sequence)
│   ├── Lesson 1: Introduction
│   │   ├── Type: Video / Interactive / Game
│   │   ├── Content: HTML/React component
│   │   ├── Duration: 10 minutes
│   │   ├── XP Reward: 50 XP
│   │   └── Quiz: Optional assessment
│   │
│   ├── Lesson 2: Practice Exercise
│   │   └── Locked until Lesson 1 complete
│   │
│   └── Lesson N: Final Project
│
└── Course Certificate (unlock on 100% completion)
```

### **Example Course: "Multiplication Mastery"**

```json
{
  "id": "multiplication-mastery",
  "title": "Multiplication Mastery",
  "description": "Master multiplication from basics to advanced word problems",
  "subject": "math",
  "gradeLevel": ["3-5"],
  "difficulty": "medium",
  "isPremium": false,
  "estimatedTime": 180,
  "xpReward": 500,
  "lessons": [
    {
      "order": 1,
      "title": "Understanding Multiplication",
      "type": "interactive",
      "contentPath": "/lessons/multiplication/intro.html",
      "duration": 15,
      "xpReward": 50,
      "requiredScore": null
    },
    {
      "order": 2,
      "title": "Times Tables 1-5",
      "type": "game",
      "contentPath": "times-tables-game-1",
      "duration": 20,
      "xpReward": 75,
      "requiredScore": 70
    },
    {
      "order": 3,
      "title": "Times Tables 6-10",
      "type": "game",
      "contentPath": "times-tables-game-2",
      "duration": 20,
      "xpReward": 75,
      "requiredScore": 70
    },
    // ... more lessons
  ]
}
```

---

## Database Schema

### **New Models to Add**

```prisma
// Course Definition
model Course {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  slug            String   @unique
  subject         String   // 'math', 'science', etc.
  gradeLevel      String[] // ['3-5', '6-8']
  difficulty      Difficulty @default(BEGINNER)
  isPremium       Boolean  @default(false)
  isPublished     Boolean  @default(false)

  // Metadata
  thumbnailUrl    String?
  estimatedMinutes Int
  totalXP         Int      @default(0)

  // Prerequisites
  prerequisiteCourseIds String[] // Array of course IDs

  // Content
  lessons         CourseLesson[]
  enrollments     CourseEnrollment[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([subject, isPremium, isPublished])
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// Individual Lesson within a Course
model CourseLesson {
  id              String   @id @default(cuid())
  courseId        String
  order           Int      // 1, 2, 3... (determines sequence)

  // Lesson Content
  title           String
  description     String?  @db.Text
  type            LessonType
  contentPath     String   // HTML file path or React component ID

  // Progression
  duration        Int      // Estimated minutes
  xpReward        Int      @default(50)
  requiredScore   Int?     // Minimum score to pass (if applicable)

  // Relations
  course          Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progress        CourseLessonProgress[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([courseId, order])
  @@index([courseId, order])
}

enum LessonType {
  VIDEO          // Video lesson
  INTERACTIVE    // Interactive HTML lesson
  GAME           // Practice game
  QUIZ           // Assessment/quiz
  READING        // Text-based content
  PROJECT        // Final project
}

// User's Course Enrollment
model CourseEnrollment {
  id              String   @id @default(cuid())
  userId          String
  courseId        String

  // Progress
  status          CourseStatus @default(IN_PROGRESS)
  completedLessons Int      @default(0)
  totalLessons     Int
  progressPercent  Int      @default(0)

  // XP & Scoring
  totalXPEarned   Int      @default(0)
  averageScore    Float?

  // Timestamps
  enrolledAt      DateTime @default(now())
  startedAt       DateTime?
  completedAt     DateTime?
  lastAccessedAt  DateTime @default(now())

  // Certificate
  certificateEarned Boolean @default(false)
  certificateUrl    String?

  // Relations
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  course          Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessonProgress  CourseLessonProgress[]

  @@unique([userId, courseId])
  @@index([userId, status])
}

enum CourseStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

// Progress for Individual Lessons
model CourseLessonProgress {
  id              String   @id @default(cuid())
  userId          String
  enrollmentId    String
  lessonId        String

  // Progress
  status          LessonProgressStatus @default(NOT_STARTED)
  score           Int?     // 0-100
  timeSpent       Int      @default(0) // minutes
  attempts        Int      @default(0)
  xpEarned        Int      @default(0)

  // Timestamps
  startedAt       DateTime?
  completedAt     DateTime?
  lastAccessedAt  DateTime @default(now())

  // Relations
  enrollment      CourseEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lesson          CourseLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([enrollmentId, lessonId])
  @@index([userId, status])
}

enum LessonProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  LOCKED        // Not yet unlocked (previous lesson incomplete)
}

// Daily XP Tracking
model DailyXP {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db.Date

  // XP Breakdown
  xpFromLessons   Int      @default(0)
  xpFromGames     Int      @default(0)
  xpFromStreak    Int      @default(0)
  totalXP         Int      @default(0)

  // Activity
  lessonsCompleted Int     @default(0)
  gamesCompleted   Int     @default(0)

  createdAt       DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
}

// User Level & XP System
model UserLevel {
  id              String   @id @default(cuid())
  userId          String   @unique

  // XP & Level
  currentLevel    Int      @default(1)
  totalXP         Int      @default(0)
  xpToNextLevel   Int      @default(100)

  // Streaks
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActivityDate DateTime?

  updatedAt       DateTime @updatedAt

  @@index([userId, currentLevel])
}

// Add to User model:
// courseEnrollments CourseEnrollment[]
// dailyXP          DailyXP[]
// level            UserLevel?
```

---

## XP & Progression System

### **XP Earning Mechanics**

**Lesson Completion:**
- Base XP per lesson: 50-100 XP (varies by difficulty)
- Bonus for perfect score: +20 XP
- First-time completion bonus: +10 XP

**Daily Streak Multiplier:**
```
1 day:    1x XP
3 days:   1.2x XP
7 days:   1.5x XP
30 days:  2x XP
```

**Course Completion:**
- Bonus XP for finishing entire course: +500 XP
- Certificate unlock
- Special badge

### **Level System**

**XP Required Per Level:**
```javascript
const XP_PER_LEVEL = [
  100,   // Level 1 → 2
  200,   // Level 2 → 3
  350,   // Level 3 → 4
  550,   // Level 4 → 5
  800,   // Level 5 → 6
  // Formula: Math.floor(100 * Math.pow(level, 1.5))
];

function calculateLevel(totalXP) {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= XP_PER_LEVEL[level - 1]) {
    xpRemaining -= XP_PER_LEVEL[level - 1];
    level++;
  }

  return {
    currentLevel: level,
    xpInCurrentLevel: xpRemaining,
    xpToNextLevel: XP_PER_LEVEL[level - 1] - xpRemaining
  };
}
```

### **Streak Calculation**

```typescript
function updateStreak(userId: string, today: Date) {
  // Get last activity date
  const lastActivity = await getUserLastActivity(userId);

  if (!lastActivity) {
    // First activity
    return { currentStreak: 1, longestStreak: 1 };
  }

  const daysSinceLastActivity = differenceInDays(today, lastActivity);

  if (daysSinceLastActivity === 1) {
    // Consecutive day - increment streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak)
    };
  } else if (daysSinceLastActivity === 0) {
    // Same day - no change
    return { currentStreak, longestStreak };
  } else {
    // Streak broken
    return { currentStreak: 1, longestStreak };
  }
}
```

---

## UI/UX Design

### **Course Catalog Page** (`/courses`)

```
┌─────────────────────────────────────────────────────┐
│  Courses                                            │
│  📚 Master new skills with structured learning paths│
├─────────────────────────────────────────────────────┤
│                                                     │
│  [All] [Math] [Science] [English] [History]        │
│  [Beginner] [Intermediate] [Advanced]              │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ 🧮 Multi...  │  │ 🔬 Science.. │  │ 📚 Read..││
│  │              │  │              │  │          ││
│  │ Beginner     │  │ Intermediate │  │ Beginner ││
│  │ 12 lessons   │  │ 15 lessons   │  │ 10 less..││
│  │ 3h total     │  │ 4h total     │  │ 2h total ││
│  │              │  │              │  │          ││
│  │ ⭐ 500 XP    │  │ ⭐ 750 XP    │  │ ⭐ 400 XP││
│  │ [Start] 🔒   │  │ [Continue]   │  │ [Start]  ││
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
│  Your Progress: 2 courses in progress              │
│  Total XP: 1,250  |  Level 5                       │
└─────────────────────────────────────────────────────┘
```

### **Course Player** (`/courses/[courseId]`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Courses                     👤 Level 5  │
│                                        1,250 XP     │
├─────────────────────────────────────────────────────┤
│  Multiplication Mastery                             │
│  Progress: ████████░░ 80% (8/10 lessons)           │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │  Course Outline                         │       │
│  │                                         │       │
│  │  ✅ 1. Understanding Multiplication     │       │
│  │      Completed • 50 XP earned           │       │
│  │                                         │       │
│  │  ✅ 2. Times Tables 1-5                 │       │
│  │      Completed • Score: 95% • 75 XP     │       │
│  │                                         │       │
│  │  ▶️  3. Times Tables 6-10  ← CURRENT    │       │
│  │      [Continue Lesson]                  │       │
│  │                                         │       │
│  │  🔒 4. Word Problems Level 1            │       │
│  │      Locked - Complete lesson 3 first   │       │
│  │                                         │       │
│  │  🔒 5. Advanced Multiplication          │       │
│  │      Locked                             │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  Daily Streak: 🔥 5 days                           │
│  Today's XP: 125 / 200 XP goal                     │
└─────────────────────────────────────────────────────┘
```

### **Lesson Player** (`/courses/[courseId]/lessons/[lessonId]`)

```
┌─────────────────────────────────────────────────────┐
│  ← Exit Lesson              Lesson 3/10             │
│  Times Tables 6-10          ⏱️ 12:34 elapsed       │
├─────────────────────────────────────────────────────┤
│                                                     │
│         [LESSON CONTENT AREA]                       │
│                                                     │
│  (Interactive game, quiz, or HTML lesson loads here)│
│                                                     │
│                                                     │
│                                                     │
│  Progress: ████████████░░░░ 75%                    │
│                                                     │
│  [Previous Lesson] [Mark Complete] [Next Lesson]   │
│                                                     │
│  💡 Tip: Complete this lesson to earn 75 XP!       │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### **Phase 1: Database & Data Models** (Day 1-2)

**Tasks:**
- [ ] Update Prisma schema with Course models
- [ ] Create database migrations
- [ ] Seed sample courses (2-3 courses with 5-10 lessons each)
- [ ] Update User model to include course relations

**Deliverables:**
- Updated `schema.prisma`
- Migration files
- Seed script with sample courses
- Type definitions generated

---

### **Phase 2: Course Data Structure** (Day 2-3)

**Tasks:**
- [ ] Create `lib/courseData.ts` - Course catalog (like catalogData.ts)
- [ ] Define course structure interfaces
- [ ] Build helper functions:
  - `getAllCourses()`
  - `getCourseById(id)`
  - `getCoursesBy Subject(subject)`
  - `getUserEnrolledCourses(userId)`

**Deliverables:**
- Course data file with sample courses
- TypeScript interfaces for courses
- Helper functions for querying courses

---

### **Phase 3: XP & Progression Backend** (Day 3-4)

**Tasks:**
- [ ] Create XP calculation utilities (`lib/xp.ts`)
- [ ] Build level calculation system
- [ ] Implement streak tracking
- [ ] API routes:
  - `POST /api/xp/award` - Award XP for completing lesson
  - `GET /api/xp/daily` - Get daily XP summary
  - `GET /api/level/status` - Get user level & progress

**Deliverables:**
- XP calculation functions
- API endpoints for XP/levels
- Streak tracking logic

---

### **Phase 4: Course Enrollment & Progress** (Day 4-5)

**Tasks:**
- [ ] API routes:
  - `POST /api/courses/[id]/enroll` - Enroll in course
  - `GET /api/courses/[id]/progress` - Get user's progress
  - `POST /api/courses/[id]/lessons/[lessonId]/complete` - Mark lesson complete
  - `GET /api/courses/my-courses` - Get user's enrolled courses
- [ ] Unlock/lock logic for sequential lessons
- [ ] Progress calculation (percentage, completion status)

**Deliverables:**
- Course enrollment API
- Progress tracking API
- Lesson unlock logic

---

### **Phase 5: Course Catalog UI** (Day 5-6)

**Tasks:**
- [ ] Create `/app/courses/page.tsx` - Course catalog
- [ ] Build `CourseCatalogCard` component
- [ ] Add filtering (subject, difficulty, premium)
- [ ] Show enrollment status (Start, Continue, Completed)
- [ ] Premium badge for paid courses

**Deliverables:**
- Course catalog page
- Course card components
- Filtering system

---

### **Phase 6: Course Player UI** (Day 6-8)

**Tasks:**
- [ ] Create `/app/courses/[courseId]/page.tsx` - Course overview
- [ ] Build `CourseOutline` component (lesson list with lock/unlock)
- [ ] Show progress indicators (% complete, XP earned)
- [ ] Create `/app/courses/[courseId]/lessons/[lessonId]/page.tsx` - Lesson player
- [ ] Build `LessonPlayer` component (loads HTML/React content)
- [ ] Add navigation (Previous/Next lesson)
- [ ] "Mark Complete" functionality

**Deliverables:**
- Course overview page
- Lesson player
- Navigation between lessons
- Progress tracking UI

---

### **Phase 7: XP Dashboard Integration** (Day 8-9)

**Tasks:**
- [ ] Add XP widget to user dashboard
- [ ] Show daily XP goal progress
- [ ] Display current streak
- [ ] Create level-up animations/notifications
- [ ] Add "Recent Lessons" to dashboard
- [ ] Show course progress on dashboard

**Deliverables:**
- XP widget component
- Streak display
- Level progress bar
- Dashboard integrations

---

### **Phase 8: Premium Access Control** (Day 9-10)

**Tasks:**
- [ ] Add `isPremium` check to course enrollment
- [ ] Create paywall modal for premium courses
- [ ] Limit free users to 2 courses maximum
- [ ] Show "Upgrade to Premium" CTAs
- [ ] (Future: Stripe integration for payments)

**Deliverables:**
- Premium access control
- Paywall UI
- Upgrade prompts

---

### **Phase 9: Course Certificates** (Day 10-11)

**Tasks:**
- [ ] Design certificate template (PDF/image)
- [ ] Generate certificate on course completion
- [ ] Create `/certificates/[id]` page to view certificate
- [ ] Add "Download Certificate" button
- [ ] Show certificates in user profile

**Deliverables:**
- Certificate generation system
- Certificate view page
- Profile integration

---

### **Phase 10: Polish & Testing** (Day 11-12)

**Tasks:**
- [ ] Add loading states and error handling
- [ ] Mobile responsiveness testing
- [ ] Performance optimization (lazy loading)
- [ ] Accessibility audit
- [ ] User testing with beta users
- [ ] Bug fixes and refinements

**Deliverables:**
- Polished, production-ready course system
- Test coverage
- Documentation

---

## API Endpoints

### **Course Management**

```typescript
// Get all courses
GET /api/courses
Query params: ?subject=math&difficulty=beginner&premium=false
Response: { courses: Course[] }

// Get single course details
GET /api/courses/[courseId]
Response: { course: Course, enrollment: CourseEnrollment | null }

// Enroll in course
POST /api/courses/[courseId]/enroll
Response: { enrollment: CourseEnrollment }

// Get user's enrolled courses
GET /api/courses/my-courses
Response: { enrollments: CourseEnrollment[] }

// Get course progress
GET /api/courses/[courseId]/progress
Response: {
  enrollment: CourseEnrollment,
  lessons: CourseLessonProgress[],
  nextLesson: CourseLesson | null
}
```

### **Lesson Progress**

```typescript
// Start a lesson
POST /api/courses/[courseId]/lessons/[lessonId]/start
Response: { progress: CourseLessonProgress }

// Update lesson progress
PATCH /api/courses/[courseId]/lessons/[lessonId]/progress
Body: { score?: number, timeSpent: number }
Response: { progress: CourseLessonProgress }

// Complete a lesson
POST /api/courses/[courseId]/lessons/[lessonId]/complete
Body: { score?: number, timeSpent: number }
Response: {
  progress: CourseLessonProgress,
  xpAwarded: number,
  levelUp: boolean,
  newLevel?: number,
  nextLessonUnlocked: boolean
}
```

### **XP & Levels**

```typescript
// Get user XP/level status
GET /api/level/status
Response: {
  level: UserLevel,
  dailyXP: DailyXP,
  streak: number
}

// Award XP (internal use)
POST /api/xp/award
Body: { xpAmount: number, source: string }
Response: { totalXP: number, levelUp: boolean }

// Get daily XP history
GET /api/xp/history
Query: ?days=7
Response: { dailyXP: DailyXP[] }
```

---

## Components Structure

```
components/
├── courses/
│   ├── CourseCatalogCard.tsx        // Course card in catalog
│   ├── CourseCatalogFilters.tsx     // Filter by subject/difficulty
│   ├── CourseEnrollButton.tsx       // Start/Continue/Locked button
│   ├── CourseOutline.tsx            // List of lessons with lock status
│   ├── CourseLessonCard.tsx         // Individual lesson in outline
│   ├── LessonPlayer.tsx             // Loads and displays lesson content
│   ├── LessonNavigation.tsx         // Previous/Next lesson buttons
│   ├── CourseProgressBar.tsx        // Visual progress indicator
│   ├── CourseCertificate.tsx        // Certificate display/download
│   └── PremiumBadge.tsx             // 👑 Premium indicator
│
├── xp/
│   ├── XPWidget.tsx                 // Dashboard XP display
│   ├── LevelProgressBar.tsx         // Progress to next level
│   ├── StreakDisplay.tsx            // 🔥 Streak counter
│   ├── DailyXPGoal.tsx              // Daily XP goal tracker
│   ├── LevelUpModal.tsx             // Celebration on level up
│   └── XPBadge.tsx                  // XP amount display (+50 XP)
│
└── dashboard/
    ├── RecentCourses.tsx            // Recently accessed courses
    ├── CourseProgressOverview.tsx   // Course progress cards
    └── XPSummaryCard.tsx            // XP/level summary
```

---

## Sample Course Data

```typescript
// lib/courseData.ts
export const sampleCourses: Course[] = [
  {
    id: 'multiplication-mastery',
    title: 'Multiplication Mastery',
    slug: 'multiplication-mastery',
    description: 'Master multiplication from basic concepts to advanced word problems. Perfect for grades 3-5.',
    subject: 'math',
    gradeLevel: ['3-5'],
    difficulty: 'BEGINNER',
    isPremium: false,
    isPublished: true,
    thumbnailUrl: '/images/courses/multiplication.jpg',
    estimatedMinutes: 180,
    totalXP: 500,
    prerequisiteCourseIds: [],
    lessons: [
      {
        order: 1,
        title: 'What is Multiplication?',
        description: 'Learn the basics of multiplication and how it relates to addition',
        type: 'INTERACTIVE',
        contentPath: '/lessons/multiplication/intro.html',
        duration: 15,
        xpReward: 50,
        requiredScore: null
      },
      {
        order: 2,
        title: 'Times Tables 1-5',
        description: 'Practice multiplication tables from 1 to 5',
        type: 'GAME',
        contentPath: 'times-tables-1-5',
        duration: 20,
        xpReward: 75,
        requiredScore: 70
      },
      // ... more lessons
    ]
  },
  {
    id: 'fractions-foundations',
    title: 'Fractions Foundations',
    slug: 'fractions-foundations',
    description: 'Build a solid understanding of fractions through interactive lessons and games.',
    subject: 'math',
    gradeLevel: ['4-6'],
    difficulty: 'INTERMEDIATE',
    isPremium: true,
    isPublished: true,
    thumbnailUrl: '/images/courses/fractions.jpg',
    estimatedMinutes: 240,
    totalXP: 750,
    prerequisiteCourseIds: ['multiplication-mastery'],
    lessons: [
      // ... lessons
    ]
  },
  // ... more courses
];
```

---

## Next Steps

1. **Review this plan** - Discuss any changes or additions
2. **Start Phase 1** - Update database schema
3. **Seed sample courses** - Create 2-3 complete courses
4. **Build iteratively** - Complete each phase before moving to next

---

**Total Implementation Time**: 10-12 days
**Priority**: High (Premium feature for paying users)
**Dependencies**: Existing auth system, database, UI components

---

Ready to start building? Let me know which phase you'd like to tackle first!
