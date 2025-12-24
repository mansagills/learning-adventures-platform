# Course System Technical Specification
## Learning Adventures Platform - Premium Tier Implementation

**Version**: 1.0
**Date**: December 2024
**Status**: Ready for Implementation
**Based on**: DataCamp Course Model Research

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [DataCamp Model Analysis](#datacamp-model-analysis)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Course Structure](#course-structure)
6. [XP System](#xp-system)
7. [Pricing & Access Tiers](#pricing--access-tiers)
8. [API Endpoints](#api-endpoints)
9. [Frontend Components](#frontend-components)
10. [User Flow](#user-flow)
11. [Implementation Plan](#implementation-plan)
12. [Future Enhancements](#future-enhancements)

---

## 1. Executive Summary

### 🎯 Goal
Implement a DataCamp-style course system for the Learning Adventures Platform that offers:
- **Free Tier**: Access to all basic HTML games/lessons (current functionality)
- **Premium Tier**: Full structured courses with progression tracking, XP earning, and assessments

### 🔑 Key Features
- Structured multi-lesson courses (minimum 7 activities per course)
- Sequential lesson progression with unlocking mechanics
- XP-based gamification system
- Brief assessments after each lesson
- Course completion certificates
- Progress tracking and analytics
- Integration with existing game/lesson library

### 📊 Success Metrics
- Course completion rates
- Student engagement (daily active usage)
- XP progression and streak maintenance
- Assessment pass rates
- Premium tier conversion

---

## 2. DataCamp Model Analysis

### 🔍 Research Summary

Based on comprehensive research of DataCamp's platform (see sources below), here are the key patterns we'll adopt:

#### **Course Structure**
- **4 Chapters** per course (adaptable to our needs)
- **3-4 Lessons** per chapter (Chapter 1 limited to 3 lessons)
- **44-60 Exercises** total per course
- **Lesson Format**: Short video (3-4 min) + 2-4 interactive exercises

#### **XP System**
- XP earned for completing exercises, lessons, and courses
- XP earned for maintaining daily streaks
- Reduced XP if hints/solutions are used
- **No bonus XP** for completing entire course (consistency with DataCamp)
- XP never expires or decreases
- No additional XP for repeating completed content

#### **Assessment Model**
- Built-in assessments throughout course (not just at end)
- Timed practical exams for certifications
- Separate "Statements of Accomplishment" vs formal certifications
- Assessments not tied to specific course material

#### **Learning Paths**
- **Career Tracks**: Complete role-based learning paths (25-50 hours)
- **Skill Tracks**: Shorter, targeted skill development
- Custom track creation for organizations
- Prerequisite course requirements

#### **User Interface Patterns**
- Browser-based interactive exercises (no installation required)
- Real-time code feedback
- 15 lines of code visible on 13" screen (no scrolling needed)
- Sample/solution code: 2-15 lines (recommended 10)
- Progress tracking with completion percentage

#### **Content Types**
- Videos (conceptual explanations)
- Interactive coding exercises
- Projects (practical applications)
- Quizzes/Assessments
- Practice exercises

#### **Pricing Model**
- **Free Plan**: First chapter of every course + cheat sheets/tutorials
- **Premium Plan**: $13/month (annual) or $29/month (monthly)
- Certificates available only for Premium users
- Student discount: 50% off ($160/year)

---

## 3. System Architecture

### 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Course System Layer                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Course     │  │   Lesson     │  │  Assessment  │      │
│  │   Manager    │  │   Delivery   │  │   Engine     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    XP & Progress Layer                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  XP Engine   │  │   Progress   │  │ Certificate  │      │
│  │  (Streaks)   │  │   Tracker    │  │  Generator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   Existing Platform Layer                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User Auth   │  │ HTML Games   │  │   Database   │      │
│  │ (NextAuth)   │  │  & Lessons   │  │  (Prisma)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

### 🔗 Integration Points

1. **Existing Game/Lesson Library**
   - Courses reference existing HTML games/lessons via `contentPath`
   - No duplication of content
   - Courses provide structured progression through existing content

2. **User Authentication**
   - Leverage NextAuth.js for access control
   - User roles: STUDENT, TEACHER, PARENT, ADMIN
   - Premium tier validation via user metadata

3. **Progress Tracking**
   - Extend existing `UserProgress` model
   - Add new `CourseEnrollment` and `CourseLessonProgress` models
   - Integrate with existing achievement system

---

## 4. Database Schema

### ✅ Already Implemented (Existing Schema)

The following models are **already in the Prisma schema** (schema.prisma:316-539):

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

  // Relations
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  course          Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessonProgress  CourseLessonProgress[]
  certificate     CourseCertificate?

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

  // Relations
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

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

  // Relations
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

  updatedAt       DateTime @updatedAt

  @@index([userId, currentLevel])
}

// Course Completion Certificates
model CourseCertificate {
  id                String   @id @default(cuid())
  enrollmentId      String   @unique

  // Certificate Details
  certificateNumber String   @unique // e.g., "CERT-2025-001234"
  studentName       String
  courseTitle       String
  completionDate    DateTime

  // Performance Metrics
  totalXPEarned     Int
  averageScore      Float?
  totalLessons      Int
  timeSpent         Int      // Total minutes spent

  // Certificate Metadata
  issuedAt          DateTime @default(now())
  verificationCode  String   @unique // For verification purposes

  // Relations
  enrollment        CourseEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)

  createdAt         DateTime @default(now())

  @@index([certificateNumber])
  @@index([verificationCode])
}
```

### 🎉 Schema Status: **READY TO USE**

All necessary database models are already implemented. No schema changes needed!

---

## 5. Course Structure

### 📚 Course Anatomy (Adapted from DataCamp)

```
Course: "Introduction to Elementary Mathematics"
├── Lesson 1: Numbers and Counting (INTERACTIVE)
│   ├── Activity: Number Monster Feeding Game
│   └── Assessment: Counting Quiz (5 questions)
│
├── Lesson 2: Basic Addition (GAME)
│   ├── Activity: Math Adventure Quest
│   └── Assessment: Addition Practice Quiz
│
├── Lesson 3: Basic Subtraction (GAME)
│   ├── Activity: Subtraction Space Race
│   └── Assessment: Subtraction Quiz
│
├── Lesson 4: Number Patterns (INTERACTIVE)
│   ├── Activity: Pattern Detective Game
│   └── Assessment: Pattern Recognition Quiz
│
├── Lesson 5: Comparing Numbers (GAME)
│   ├── Activity: Greater/Less Than Adventure
│   └── Assessment: Comparison Quiz
│
├── Lesson 6: Word Problems (INTERACTIVE)
│   ├── Activity: Story Problem Solver
│   └── Assessment: Applied Math Quiz
│
└── Lesson 7: Final Project (PROJECT)
    ├── Activity: Create Your Own Math Story
    └── Final Assessment: Comprehensive Course Quiz
```

### 📋 Lesson Types & Mapping

| Lesson Type | Description | Maps to Existing Content | XP Reward |
|-------------|-------------|--------------------------|-----------|
| **INTERACTIVE** | Interactive HTML lesson | `public/lessons/*.html` | 50 XP |
| **GAME** | Practice game | `public/games/*.html` | 50 XP |
| **QUIZ** | Assessment/quiz | New quiz component | 75 XP |
| **VIDEO** | Video lesson | Future: embedded videos | 25 XP |
| **READING** | Text-based content | New reading component | 25 XP |
| **PROJECT** | Final project | Custom project activities | 100 XP |

### 🔒 Sequential Unlocking

- **Lesson 1**: Always unlocked
- **Lesson 2-7**: Locked until previous lesson is completed
- **Free Tier**: Only Lesson 1 unlocked
- **Premium Tier**: Sequential unlocking based on completion

---

## 6. XP System

### 🎮 XP Earning Rules (DataCamp-Inspired)

#### **Base XP Awards**
```javascript
const XP_RULES = {
  lesson_completion: {
    INTERACTIVE: 50,
    GAME: 50,
    QUIZ: 75,
    VIDEO: 25,
    READING: 25,
    PROJECT: 100
  },

  quiz_performance: {
    perfect_score: 25,      // Bonus for 100% on quiz
    first_attempt: 10,      // Bonus for passing first try
    no_hints: 5            // Bonus for no hints used
  },

  streak_bonus: {
    daily: 10,             // 10 XP per day of streak
    weekly: 50,            // 50 XP bonus at 7-day streak
    monthly: 200           // 200 XP bonus at 30-day streak
  },

  course_completion: {
    certificate: 0         // No bonus XP (DataCamp model)
  }
}
```

#### **XP Deductions/Penalties**
```javascript
const XP_MODIFIERS = {
  hint_used: -5,           // -5 XP per hint used
  solution_revealed: -15,  // -15 XP if solution revealed
  retry_penalty: -2        // -2 XP per retry (up to 3 retries)
}
```

#### **XP Calculation Example**

```javascript
// Example: Student completes a QUIZ lesson
function calculateLessonXP(lesson, performance) {
  let xp = XP_RULES.lesson_completion[lesson.type]; // 75 XP (QUIZ)

  // Bonus for perfect score
  if (performance.score === 100) {
    xp += XP_RULES.quiz_performance.perfect_score; // +25 XP
  }

  // Bonus for first attempt pass
  if (performance.attempts === 1) {
    xp += XP_RULES.quiz_performance.first_attempt; // +10 XP
  }

  // Bonus for no hints
  if (performance.hintsUsed === 0) {
    xp += XP_RULES.quiz_performance.no_hints; // +5 XP
  }

  // Deductions
  xp -= (performance.hintsUsed * XP_MODIFIERS.hint_used); // -5 per hint

  return Math.max(xp, 0); // Never negative
}

// Result: 115 XP (75 + 25 + 10 + 5) for perfect first attempt with no hints
```

### 📊 Level Progression

```javascript
const LEVEL_SYSTEM = {
  calculateLevel: (totalXP) => {
    // Progressive XP requirements (similar to many gamification systems)
    // Level 1: 0-100 XP
    // Level 2: 100-250 XP
    // Level 3: 250-450 XP
    // Formula: XP needed = 100 * level^1.5

    let level = 1;
    let xpRequired = 0;

    while (xpRequired <= totalXP) {
      level++;
      xpRequired += Math.floor(100 * Math.pow(level, 1.5));
    }

    return level - 1;
  },

  xpToNextLevel: (currentLevel) => {
    return Math.floor(100 * Math.pow(currentLevel + 1, 1.5));
  }
}
```

### 🔥 Streak System

```javascript
const STREAK_RULES = {
  // Streak increments by 1 for each consecutive day with activity
  // Activity = completing at least 1 lesson or earning 25+ XP

  minimumActivity: {
    xpEarned: 25,          // OR complete at least 1 lesson
    lessonsCompleted: 1
  },

  streakWindow: {
    gracePeriod: 24,       // 24-hour window to maintain streak
    timezone: 'user'       // Use user's timezone for day calculation
  },

  rewards: {
    7: { xp: 50, badge: '7-day-streak' },
    30: { xp: 200, badge: '30-day-streak' },
    100: { xp: 1000, badge: '100-day-streak' }
  }
}
```

---

## 7. Pricing & Access Tiers

### 💰 Tier Comparison

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| **HTML Games** | ✅ All games | ✅ All games |
| **HTML Lessons** | ✅ All lessons | ✅ All lessons |
| **Courses** | ❌ None (or 1st lesson only) | ✅ Full access |
| **Structured Learning Paths** | ❌ | ✅ |
| **XP & Streaks** | ⚠️ Limited (basic XP) | ✅ Full XP system |
| **Assessments** | ❌ | ✅ After each lesson |
| **Certificates** | ❌ | ✅ On course completion |
| **Progress Analytics** | ⚠️ Basic | ✅ Advanced analytics |
| **Course Recommendations** | ❌ | ✅ AI-powered suggestions |
| **Monthly Price** | Free | $9.99/month |
| **Annual Price** | Free | $99/year (save 17%) |

### 🎯 Freemium Strategy (DataCamp-Inspired)

**Free Tier Access:**
```javascript
const FREE_TIER_LIMITS = {
  courses: {
    preview: true,          // Can view course details
    firstLesson: true,      // Can complete Lesson 1 of any course
    fullAccess: false       // Cannot access Lessons 2-7
  },

  games: {
    access: 'unlimited',    // All HTML games available
    dailyLimit: null        // No limits
  },

  lessons: {
    access: 'unlimited',    // All standalone HTML lessons available
    dailyLimit: null        // No limits
  },

  xp: {
    enabled: true,          // Can earn XP
    streaks: false,         // No streak bonuses
    leaderboard: false      // Not on leaderboard
  }
}
```

**Premium Tier Access:**
```javascript
const PREMIUM_TIER_ACCESS = {
  courses: {
    access: 'unlimited',    // All courses
    lessons: 'unlimited',   // All lessons within courses
    assessments: true,      // Full assessment access
    certificates: true      // Earn certificates
  },

  xp: {
    enabled: true,          // Full XP system
    streaks: true,          // Streak bonuses
    leaderboard: true,      // Appear on leaderboard
    bonuses: true           // All XP bonuses enabled
  },

  features: {
    analytics: 'advanced',  // Detailed progress analytics
    recommendations: true,  // AI course recommendations
    downloadCerts: true,    // Download certificates as PDF
    parentDashboard: true   // Parent/teacher oversight (if applicable)
  }
}
```

### 🔐 Access Control Implementation

```typescript
// Example access control function
function canAccessLesson(user: User, lesson: CourseLesson, courseEnrollment: CourseEnrollment): boolean {
  // Premium users get full access
  if (user.isPremium) {
    // Check if previous lesson is completed (sequential unlocking)
    if (lesson.order === 1) return true;

    const previousLesson = lesson.order - 1;
    const previousProgress = courseEnrollment.lessonProgress.find(
      lp => lp.lesson.order === previousLesson
    );

    return previousProgress?.status === 'COMPLETED';
  }

  // Free users only get Lesson 1
  return lesson.order === 1;
}
```

---

## 8. API Endpoints

### 🛠️ Course Management APIs

#### **Course Discovery**

```typescript
// GET /api/courses
// Get all published courses (with filtering)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject');
  const difficulty = searchParams.get('difficulty');
  const isPremium = searchParams.get('isPremium') === 'true';

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(subject && { subject }),
      ...(difficulty && { difficulty }),
      ...(isPremium !== undefined && { isPremium })
    },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          duration: true,
          xpReward: true,
          order: true
        }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ courses });
}

// GET /api/courses/[slug]
// Get single course details
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check user enrollment
  let enrollment = null;
  if (session?.user?.id) {
    enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      },
      include: {
        lessonProgress: true
      }
    });
  }

  return NextResponse.json({ course, enrollment });
}
```

#### **Course Enrollment**

```typescript
// POST /api/courses/[slug]/enroll
// Enroll user in a course
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: { lessons: true }
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check if premium course requires premium access
  if (course.isPremium && !session.user.isPremium) {
    return NextResponse.json(
      { error: 'Premium subscription required' },
      { status: 403 }
    );
  }

  // Create enrollment
  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      totalLessons: course.lessons.length,
      status: 'IN_PROGRESS',
      startedAt: new Date()
    },
    include: {
      lessonProgress: true
    }
  });

  return NextResponse.json({ enrollment });
}
```

#### **Lesson Progress**

```typescript
// POST /api/courses/lessons/[lessonId]/complete
// Mark a lesson as complete and award XP
export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { score, timeSpent, hintsUsed } = body;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: params.lessonId },
    include: { course: true }
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Get user's enrollment
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: lesson.courseId
      }
    },
    include: { lessonProgress: true }
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
  }

  // Calculate XP
  const xpEarned = calculateLessonXP(lesson, { score, hintsUsed, attempts: 1 });

  // Update or create lesson progress
  const lessonProgress = await prisma.courseLessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id
      }
    },
    update: {
      status: 'COMPLETED',
      score,
      timeSpent: { increment: timeSpent },
      completedAt: new Date(),
      xpEarned: { increment: xpEarned }
    },
    create: {
      userId: session.user.id,
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      status: 'COMPLETED',
      score,
      timeSpent,
      completedAt: new Date(),
      xpEarned,
      attempts: 1
    }
  });

  // Update enrollment progress
  const completedLessons = enrollment.lessonProgress.filter(
    lp => lp.status === 'COMPLETED'
  ).length + 1;

  const progressPercent = Math.floor((completedLessons / enrollment.totalLessons) * 100);
  const isComplete = completedLessons === enrollment.totalLessons;

  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: {
      completedLessons,
      progressPercent,
      totalXPEarned: { increment: xpEarned },
      lastAccessedAt: new Date(),
      ...(isComplete && {
        status: 'COMPLETED',
        completedAt: new Date(),
        certificateEarned: true
      })
    }
  });

  // Update user's total XP and daily XP
  await updateUserXP(session.user.id, xpEarned, 'lesson');

  // Generate certificate if course completed
  if (isComplete) {
    await generateCertificate(enrollment.id);
  }

  return NextResponse.json({
    lessonProgress,
    xpEarned,
    courseCompleted: isComplete
  });
}
```

#### **XP & Streak Management**

```typescript
// Helper function to update user XP and streak
async function updateUserXP(userId: string, xpEarned: number, source: 'lesson' | 'game' | 'streak') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update daily XP
  await prisma.dailyXP.upsert({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    update: {
      totalXP: { increment: xpEarned },
      ...(source === 'lesson' && {
        xpFromLessons: { increment: xpEarned },
        lessonsCompleted: { increment: 1 }
      }),
      ...(source === 'game' && {
        xpFromGames: { increment: xpEarned },
        gamesCompleted: { increment: 1 }
      }),
      ...(source === 'streak' && {
        xpFromStreak: { increment: xpEarned }
      })
    },
    create: {
      userId,
      date: today,
      totalXP: xpEarned,
      xpFromLessons: source === 'lesson' ? xpEarned : 0,
      xpFromGames: source === 'game' ? xpEarned : 0,
      xpFromStreak: source === 'streak' ? xpEarned : 0,
      lessonsCompleted: source === 'lesson' ? 1 : 0,
      gamesCompleted: source === 'game' ? 1 : 0
    }
  });

  // Update user level
  const userLevel = await prisma.userLevel.upsert({
    where: { userId },
    update: {
      totalXP: { increment: xpEarned },
      lastActivityDate: new Date()
    },
    create: {
      userId,
      totalXP: xpEarned,
      lastActivityDate: new Date()
    }
  });

  // Calculate new level
  const newLevel = calculateLevel(userLevel.totalXP + xpEarned);
  const xpToNext = xpToNextLevel(newLevel);

  // Update streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayActivity = await prisma.dailyXP.findUnique({
    where: {
      userId_date: {
        userId,
        date: yesterday
      }
    }
  });

  const currentStreak = yesterdayActivity
    ? userLevel.currentStreak + 1
    : 1;

  await prisma.userLevel.update({
    where: { userId },
    data: {
      currentLevel: newLevel,
      xpToNextLevel: xpToNext,
      currentStreak,
      longestStreak: Math.max(currentStreak, userLevel.longestStreak)
    }
  });

  return { newLevel, xpToNext, currentStreak };
}
```

#### **Certificate Generation**

```typescript
// Helper function to generate course certificate
async function generateCertificate(enrollmentId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: true,
      course: true,
      lessonProgress: true
    }
  });

  if (!enrollment) throw new Error('Enrollment not found');

  // Calculate metrics
  const totalTimeSpent = enrollment.lessonProgress.reduce(
    (sum, lp) => sum + lp.timeSpent,
    0
  );

  const averageScore = enrollment.lessonProgress.reduce(
    (sum, lp) => sum + (lp.score || 0),
    0
  ) / enrollment.lessonProgress.length;

  // Generate unique certificate number
  const certificateNumber = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Create certificate
  const certificate = await prisma.courseCertificate.create({
    data: {
      enrollmentId,
      certificateNumber,
      studentName: enrollment.user.name || 'Student',
      courseTitle: enrollment.course.title,
      completionDate: new Date(),
      totalXPEarned: enrollment.totalXPEarned,
      averageScore,
      totalLessons: enrollment.totalLessons,
      timeSpent: totalTimeSpent,
      verificationCode
    }
  });

  return certificate;
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

## 9. Frontend Components

### 🎨 UI Component Architecture

```
components/
├── courses/
│   ├── CourseCard.tsx              # Individual course card
│   ├── CourseGrid.tsx              # Grid of course cards
│   ├── CourseDetail.tsx            # Full course details page
│   ├── CourseSidebar.tsx           # Course navigation sidebar
│   ├── LessonCard.tsx              # Individual lesson card
│   ├── LessonViewer.tsx            # Lesson content viewer
│   ├── QuizComponent.tsx           # Quiz/assessment component
│   ├── ProgressBar.tsx             # Course progress indicator
│   ├── CertificatePreview.tsx      # Certificate display/download
│   └── EnrollmentButton.tsx        # Enroll in course CTA
│
├── xp/
│   ├── XPDisplay.tsx               # Current XP and level
│   ├── StreakIndicator.tsx         # Daily streak counter
│   ├── LevelProgressBar.tsx        # Progress to next level
│   └── XPBreakdown.tsx             # Detailed XP sources
│
└── pricing/
    ├── PricingTiers.tsx            # Free vs Premium comparison
    ├── UpgradeCTA.tsx              # Upgrade to premium prompt
    └── PaymentModal.tsx            # Payment processing (future)
```

### 📦 Key Component Examples

#### **CourseCard Component**

```tsx
// components/courses/CourseCard.tsx
import Link from 'next/link';
import { Course, CourseEnrollment } from '@prisma/client';

interface CourseCardProps {
  course: Course & {
    lessons: { id: string; title: string; xpReward: number }[];
    _count: { enrollments: number };
  };
  enrollment?: CourseEnrollment | null;
  isPremiumUser: boolean;
}

export default function CourseCard({ course, enrollment, isPremiumUser }: CourseCardProps) {
  const canAccess = !course.isPremium || isPremiumUser;
  const isEnrolled = !!enrollment;
  const progressPercent = enrollment?.progressPercent || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-6xl">
            📚
          </div>
        )}

        {/* Premium Badge */}
        {course.isPremium && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
            ⭐ PREMIUM
          </div>
        )}

        {/* Progress Overlay */}
        {isEnrolled && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="flex justify-between text-white text-xs mb-1">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase">{course.subject}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-600">{course.difficulty}</span>
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span>📝</span>
            <span>{course.lessons.length} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{course.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{course.totalXP} XP</span>
          </div>
        </div>

        {/* CTA */}
        {canAccess ? (
          <Link
            href={`/courses/${course.slug}`}
            className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEnrolled ? 'Continue Learning' : 'Start Course'}
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="block w-full bg-yellow-500 text-yellow-900 text-center py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
          >
            🔒 Unlock with Premium
          </Link>
        )}

        {/* Social Proof */}
        {course._count.enrollments > 0 && (
          <p className="text-xs text-gray-500 text-center mt-2">
            {course._count.enrollments.toLocaleString()} students enrolled
          </p>
        )}
      </div>
    </div>
  );
}
```

#### **LessonViewer Component**

```tsx
// components/courses/LessonViewer.tsx
'use client';

import { useState } from 'react';
import { CourseLesson, CourseLessonProgress } from '@prisma/client';

interface LessonViewerProps {
  lesson: CourseLesson;
  progress?: CourseLessonProgress | null;
  onComplete: (score: number, timeSpent: number) => Promise<void>;
  isPremiumUser: boolean;
}

export default function LessonViewer({ lesson, progress, onComplete, isPremiumUser }: LessonViewerProps) {
  const [startTime] = useState(Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async (score: number) => {
    setIsCompleting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes

    try {
      await onComplete(score, timeSpent);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Render different lesson types
  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'INTERACTIVE':
      case 'GAME':
        return (
          <iframe
            src={lesson.contentPath}
            className="w-full h-full border-none"
            title={lesson.title}
          />
        );

      case 'QUIZ':
        return (
          <QuizComponent
            lessonId={lesson.id}
            onComplete={handleComplete}
            disabled={isCompleting}
          />
        );

      case 'VIDEO':
        return (
          <div className="aspect-video bg-black">
            <video
              src={lesson.contentPath}
              controls
              className="w-full h-full"
            />
          </div>
        );

      case 'READING':
        return (
          <div className="prose max-w-none p-8">
            {/* Render markdown or HTML content */}
            <div dangerouslySetInnerHTML={{ __html: lesson.description || '' }} />
          </div>
        );

      default:
        return <div>Unsupported lesson type</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{lesson.title}</h1>
            <p className="text-sm text-gray-600">
              {lesson.type} • {lesson.duration} min • {lesson.xpReward} XP
            </p>
          </div>

          {progress?.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-2xl">✓</span>
              <div className="text-sm">
                <div className="font-semibold">Completed</div>
                <div>Score: {progress.score}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 overflow-auto">
        {renderLessonContent()}
      </div>

      {/* Footer Actions */}
      {lesson.type !== 'QUIZ' && (
        <div className="bg-white border-t p-4">
          <button
            onClick={() => handleComplete(100)}
            disabled={isCompleting || progress?.status === 'COMPLETED'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {isCompleting ? 'Completing...' : progress?.status === 'COMPLETED' ? 'Completed ✓' : 'Mark as Complete'}
          </button>
        </div>
      )}
    </div>
  );
}
```

#### **QuizComponent**

```tsx
// components/courses/QuizComponent.tsx
'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  lessonId: string;
  onComplete: (score: number) => void;
  disabled?: boolean;
}

export default function QuizComponent({ lessonId, onComplete, disabled }: QuizComponentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Fetch quiz questions for this lesson
    fetchQuizQuestions(lessonId).then(setQuestions);
  }, [lessonId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and show results
      const correct = selectedAnswers.filter(
        (answer, index) => answer === questions[index].correctAnswer
      ).length;

      const finalScore = Math.round((correct / questions.length) * 100);
      setScore(finalScore);
      setShowResults(true);
    }
  };

  const handleSubmit = () => {
    onComplete(score);
  };

  if (questions.length === 0) {
    return <div className="p-8 text-center">Loading quiz...</div>;
  }

  if (showResults) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Learning!'}
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            You scored {score}% ({selectedAnswers.filter((a, i) => a === questions[i].correctAnswer).length}/{questions.length})
          </p>

          {score >= 60 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                ✓ You passed! You've earned {50 + (score === 100 ? 25 : 0)} XP
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                You need 60% or higher to pass. Review the lesson and try again!
              </p>
            </div>
          )}
        </div>

        {/* Review Answers */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-lg">Review Your Answers</h3>
          {questions.map((q, index) => (
            <div key={q.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-2xl ${selectedAnswers[index] === q.correctAnswer ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedAnswers[index] === q.correctAnswer ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Question {index + 1}: {q.question}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    Your answer: <span className={selectedAnswers[index] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                      {q.options[selectedAnswers[index]]}
                    </span>
                  </p>
                  {selectedAnswers[index] !== q.correctAnswer && (
                    <p className="text-sm text-green-600 mb-1">
                      Correct answer: {q.options[q.correctAnswer]}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || score < 60}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {score >= 60 ? 'Continue to Next Lesson' : 'Retake Quiz'}
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-400'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// Helper function to fetch quiz questions
async function fetchQuizQuestions(lessonId: string): Promise<Question[]> {
  const response = await fetch(`/api/quizzes/${lessonId}`);
  const data = await response.json();
  return data.questions;
}
```

---

## 10. User Flow

### 🚶 Student Journey (Premium Tier)

```
1. Course Discovery
   ├─ Browse course catalog (/courses)
   ├─ Filter by subject, difficulty, grade level
   ├─ View course details (click course card)
   └─ See sample lessons and curriculum

2. Course Enrollment
   ├─ Click "Start Course" button
   ├─ Check premium access (redirect to upgrade if needed)
   ├─ Create CourseEnrollment record
   └─ Redirect to first lesson

3. Lesson Progression
   ├─ Complete Lesson 1 (always unlocked)
   │   ├─ View lesson content (game/interactive)
   │   ├─ Take brief assessment quiz
   │   ├─ Earn XP based on performance
   │   └─ Unlock Lesson 2
   │
   ├─ Complete Lesson 2-6 (sequential)
   │   ├─ Each lesson unlocks next
   │   ├─ XP accumulates
   │   └─ Progress bar updates
   │
   └─ Complete Lesson 7 (Final Project)
       ├─ Comprehensive assessment
       ├─ Earn completion XP
       └─ Trigger certificate generation

4. Course Completion
   ├─ View course completion modal
   ├─ Download/share certificate
   ├─ See course recommendations
   └─ Return to dashboard with updated stats

5. Ongoing Engagement
   ├─ Daily streak tracking
   ├─ XP leaderboard
   ├─ Recommended next courses
   └─ Progress analytics
```

### 🔒 Free Tier User Flow

```
1. Course Discovery
   ├─ Browse all courses
   ├─ See "Premium" badges
   └─ View course details

2. Try Free Lesson
   ├─ Complete Lesson 1 for free
   ├─ Earn limited XP (no streak bonuses)
   └─ Hit paywall at Lesson 2

3. Upgrade Prompt
   ├─ See "Unlock with Premium" CTA
   ├─ View pricing comparison
   ├─ Optional: Enter payment flow
   └─ Upgrade to Premium

4. Post-Upgrade
   ├─ Unlock all courses
   ├─ Enable full XP system
   └─ Continue where left off
```

---

## 11. Implementation Plan

### 📅 Phase 1: Foundation (Week 1)

#### **Day 1: Course Data & Admin Interface**
- [ ] Create seed data for 3 sample courses (Math, Science, English)
- [ ] Build admin course creation interface (`/admin/courses/create`)
- [ ] Implement course CRUD operations
- [ ] Add lesson management within courses

#### **Day 2: Course Discovery UI**
- [ ] Build course catalog page (`/courses`)
- [ ] Create CourseCard component
- [ ] Implement filtering/search
- [ ] Add course detail page (`/courses/[slug]`)

#### **Day 3: Enrollment System**
- [ ] Implement enrollment API endpoints
- [ ] Build enrollment button with premium checks
- [ ] Create user's enrolled courses dashboard
- [ ] Add enrollment status indicators

### 📅 Phase 2: Lesson Delivery (Week 2)

#### **Day 4: Lesson Viewer**
- [ ] Build LessonViewer component
- [ ] Implement iframe loading for HTML games/lessons
- [ ] Add lesson navigation (prev/next)
- [ ] Create progress saving functionality

#### **Day 5: Quiz System**
- [ ] Design quiz question schema
- [ ] Build QuizComponent with multiple choice
- [ ] Implement quiz scoring logic
- [ ] Add quiz results/review screen

#### **Day 6: XP Engine**
- [ ] Implement XP calculation functions
- [ ] Create XP award API endpoints
- [ ] Build XP display components
- [ ] Add level progression logic

### 📅 Phase 3: Gamification & Polish (Week 3)

#### **Day 7: Streak System**
- [ ] Implement daily activity tracking
- [ ] Build streak calculation logic
- [ ] Create StreakIndicator component
- [ ] Add streak bonus XP awards

#### **Day 8: Certificates**
- [ ] Design certificate PDF template
- [ ] Implement certificate generation
- [ ] Build certificate preview/download UI
- [ ] Add certificate verification system

#### **Day 9: Premium Access Control**
- [ ] Add premium subscription field to User model
- [ ] Implement access control middleware
- [ ] Create upgrade CTA components
- [ ] Build pricing comparison page

#### **Day 10: Testing & Refinement**
- [ ] End-to-end testing of course flow
- [ ] Performance optimization
- [ ] Mobile responsiveness testing
- [ ] Bug fixes and polish

---

## 12. Future Enhancements

### 🚀 Phase 2 Features (Post-Launch)

1. **Advanced Assessment Types**
   - Fill-in-the-blank questions
   - Drag-and-drop sorting
   - Drawing/sketching canvas
   - Code editor for programming courses

2. **Social Features**
   - Course discussion forums
   - Peer code reviews
   - Study groups
   - Friend leaderboards

3. **Personalization**
   - AI-powered course recommendations
   - Adaptive difficulty
   - Learning style assessments
   - Custom learning paths

4. **Content Expansion**
   - Video lesson support (YouTube/Vimeo embeds)
   - Live coding environments
   - 3D interactive simulations
   - AR/VR experiences

5. **Analytics Dashboard**
   - Teacher/parent oversight portal
   - Student progress reports
   - Time-on-task metrics
   - Struggling student alerts

6. **Mobile App**
   - Native iOS/Android apps
   - Offline lesson downloads
   - Push notifications for streaks
   - Mobile-optimized quizzes

7. **Certification Program**
   - Formal assessments (timed exams)
   - Industry-recognized certifications
   - LinkedIn integration
   - Employer verification portal

---

## 📚 Research Sources

This technical specification was informed by comprehensive research on DataCamp's course model and platform design:

### DataCamp XP System & Progress
- [Understanding XP and Progress on DataCamp](https://support.datacamp.com/hc/en-us/articles/34043400793495-Understanding-XP-and-Progress-on-DataCamp)
- [Progress and XP Support Section](https://support.datacamp.com/hc/en-us/sections/360007655154-Progress-and-XP)
- [DataCamp's XP and Progress: An Overview](https://support.datacamp.com/hc/en-us/articles/360042332634-DataCamp-s-XP-and-Progress-An-Overview)
- [How Does XP Help in DataCamp?](https://edwize.org/how-does-xp-help-in-datacamp/)

### Course Structure & Content Design
- [Course Outline Guidelines](https://instructor-support.datacamp.com/en/articles/2360750-course-outline)
- [BI Course Outline Structure](https://instructor-support.datacamp.com/en/articles/5445465-the-course-outline-for-bi-courses)
- [Content Guidelines](https://instructor-support.datacamp.com/en/articles/2360978-content-guidelines)
- [DataCamp Courses Overview](https://instructor-support.datacamp.com/en/articles/2360597-datacamp-courses)
- [Course Coding Exercises](https://instructor-support.datacamp.com/en/articles/2375526-course-coding-exercises)

### Interactive Learning & UI Design
- [Hands-on Data Skill Building](https://www.datacamp.com/interactive-learning)
- [DataCamp Mobile Experience](https://www.datacamp.com/mobile)

### Pricing & Business Model
- [DataCamp Pricing Plans](https://www.datacamp.com/pricing)
- [DataCamp Pricing Review 2025](https://upskillwise.com/datacamp-pricing/)
- [DataCamp Pricing Guide 2025](https://myelearningworld.com/datacamp-pricing/)
- [Learn Subscription Plans Overview](https://support.datacamp.com/hc/en-us/articles/360011266593-DataCamp-Learn-Subscription-Plans-An-Overview)

### Certificates & Learning Paths
- [Certificates vs Certification](https://www.datacamp.com/blog/certificates-or-certification-which-should-you-choose)
- [Statements of Accomplishment](https://support.datacamp.com/hc/en-us/articles/360005885114-Statements-of-Accomplishment-Downloading-and-Sharing-your-Completed-Courses-and-Tracks)
- [Custom Learning Tracks](https://www.datacamp.com/business/custom-tracks)
- [Career Learning Paths](https://www.datacamp.com/tracks/career)

---

## 🎯 Next Steps

1. **Review this spec** with stakeholders
2. **Prioritize features** for MVP
3. **Create sample course content** (3 courses minimum)
4. **Begin Phase 1 implementation**
5. **Set up payment processing** (Stripe integration)
6. **Launch beta** with limited users
7. **Gather feedback** and iterate

---

**Document Version**: 1.0
**Last Updated**: December 23, 2024
**Status**: Ready for Development
**Estimated Implementation**: 3-4 weeks (with existing schema)
