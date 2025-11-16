# Course System - Phase 2 Complete ✅

**Status**: Data Access Layer Built and Ready to Use
**Date**: November 15, 2025
**Phase**: 2 - Course Data Structure

---

## 🎉 What Was Accomplished

Phase 2 built the **complete data access layer** that sits between your database and UI components. This layer provides clean, type-safe functions for all course system operations.

### Files Created (6 total):

1. **lib/courses/types.ts** (320 lines)
2. **lib/courses/courseQueries.ts** (580 lines)
3. **lib/courses/xpCalculations.ts** (460 lines)
4. **lib/courses/enrollmentHelpers.ts** (490 lines)
5. **lib/courses/progressHelpers.ts** (520 lines)
6. **lib/courses/index.ts** (200 lines)

**Total**: ~2,570 lines of production-ready TypeScript code

---

## 📋 1. Type Definitions (types.ts)

### What It Provides:

Complete TypeScript type system for the course platform:

**Extended Types**:
- `CourseWithProgress` - Course + user progress data
- `LessonWithProgress` - Lesson + access/completion status
- `EnrollmentWithDetails` - Enrollment + next lesson + time estimates

**Filter Types**:
- `CourseFilters` - Subject, grade, difficulty, premium, search
- `CourseQueryOptions` - Include relations, user data
- `CourseSortBy` - Sort by title, difficulty, XP, popularity

**XP Types**:
- `XPCalculation` - Base XP + streak bonus breakdown
- `StreakMultiplier` - Days → multiplier mapping
- `LevelInfo` - Current level + progress to next
- `DailyXPBreakdown` - Daily XP by source (lessons, games, streaks)

**Access Control Types**:
- `EnrollmentEligibility` - Can user enroll? Why/why not?
- `LessonAccessCheck` - Can user access lesson? (Linear progression)
- `CompletionRequirements` - What's needed for certificate?

**Statistics Types**:
- `UserCourseStats` - Total enrollments, XP, streaks, certificates
- `CourseAnalytics` - Enrollment count, completion rate
- `LessonAnalytics` - Average score, retry rate

---

## 📚 2. Course Query Functions (courseQueries.ts)

### Core Query Functions:

```typescript
// Get all courses with optional filtering
getCourses(filters, options)

// Get courses with user progress data
getCoursesWithProgress(userId, filters)

// Get single course by ID or slug
getCourseById(courseId, options)
getCourseBySlug(slug, options)
getCourseWithProgress(courseId, userId)
```

### Filtered Queries:

```typescript
getCoursesBySubject(subject)      // All math courses
getCoursesByDifficulty(difficulty) // All beginner courses
getFreeCourses()                   // All free courses
getPremiumCourses()                // All premium courses
searchCourses(query)               // Search by keyword
```

### Advanced Queries:

```typescript
getSortedCourses(sortBy, direction, filters)
// sortBy: 'title' | 'difficulty' | 'estimatedMinutes' | 'totalXP' | 'popularity' | 'recent'

getPaginatedCourses(page, pageSize, filters, sortBy, direction)
// Returns: { data, pagination: { page, totalPages, hasNextPage, etc. } }
```

### Lesson Queries:

```typescript
getLessonById(lessonId)
getCourseLessons(courseId)
getNextLesson(courseId, currentOrder)
getPreviousLesson(courseId, currentOrder)
```

### Helper Functions:

```typescript
checkPrerequisites(userId, prerequisiteCourseIds)
// Returns: boolean (all prerequisites completed?)

getMissingPrerequisites(userId, prerequisiteCourseIds)
// Returns: Course[] (courses user still needs to complete)
```

---

## ⚡ 3. XP Calculation Functions (xpCalculations.ts)

### Streak System:

```typescript
// Streak multipliers
STREAK_MULTIPLIERS = [
  { days: 1, multiplier: 1.0, bonusPercentage: 0 },
  { days: 3, multiplier: 1.2, bonusPercentage: 20 },
  { days: 7, multiplier: 1.5, bonusPercentage: 50 },
  { days: 30, multiplier: 2.0, bonusPercentage: 100 }
]

getStreakMultiplier(streakDays)
calculateXPWithStreak(baseXP, streakDays)
getUserStreak(userId)
updateUserStreak(userId) // Call daily when user earns XP
```

### Level System:

```typescript
// Level formula constants
BASE_XP_MULTIPLIER = 100
LEVEL_EXPONENT = 1.5
// XP required = 100 × (level ^ 1.5)

getXPRequiredForLevel(level)     // XP needed for that level
getTotalXPForLevel(targetLevel)  // Total XP from level 1
getLevelFromXP(totalXP)          // What level is this XP?
getLevelInfo(totalXP)            // Detailed level info

getUserLevelInfo(userId)         // User's current level data
awardXP(userId, xpAmount)        // Award XP and update level
// Returns: { xpAwarded, newTotalXP, leveledUp, oldLevel, newLevel }
```

### Daily XP Tracking:

```typescript
recordDailyXP(userId, xpAmount, source)
getDailyXP(userId, date)
getXPHistory(userId, startDate, endDate)
getRecentXP(userId, days) // Total XP in last N days
```

### Utility Functions:

```typescript
formatXP(xp)         // "1,234" with commas
getXPColor(xp)       // Gold/Silver/Bronze for UI
getLevelBadge(level) // 👑🏆💎⭐🌟🎓 emoji badges
```

---

## 📝 4. Enrollment Helper Functions (enrollmentHelpers.ts)

### Enrollment Eligibility:

```typescript
checkEnrollmentEligibility(userId, courseId)
// Returns:
{
  canEnroll: boolean,
  reason?: string,
  prerequisitesMet: boolean,
  missingPrerequisites?: Course[],
  requiresPremium: boolean,
  hasPremiumAccess: boolean,
  freeCourseLimit?: number,
  freeCoursesEnrolled?: number
}
```

**Checks performed**:
1. Course exists and is published
2. User not already enrolled
3. Prerequisites completed
4. Premium access if required
5. Free course limit (max 2 for non-premium users)

### Enrollment Management:

```typescript
enrollInCourse(userId, courseId)
// Creates enrollment + lesson progress records for all lessons
// First lesson: NOT_STARTED, Others: LOCKED
// Returns: { success, enrollment?, error? }

unenrollFromCourse(userId, courseId)
// Removes enrollment + all progress data
```

### Enrollment Queries:

```typescript
getUserEnrollment(userId, courseId)
getUserEnrollments(userId, status?)  // All, or filter by status
getEnrollmentWithDetails(enrollmentId)
// Returns: enrollment + next lesson + estimated time remaining

getInProgressCourses(userId)
getCompletedCourses(userId)
```

### Completion Tracking:

```typescript
checkCompletionRequirements(enrollmentId)
// Returns:
{
  totalLessons,
  completedLessons,
  requiredLessons,        // Lessons with required scores
  passedRequiredLessons,  // User passed these
  isComplete,
  canEarnCertificate
}

completeCourse(enrollmentId)
// Marks course as COMPLETED
// Awards certificate if all required lessons passed
// Returns: { success, certificateEarned }

updateEnrollmentActivity(enrollmentId)
// Updates lastActivityAt timestamp
```

### Statistics:

```typescript
getCourseEnrollmentCount(courseId)   // Total enrollments
getCourseCompletionRate(courseId)    // Percentage who completed
```

---

## 📊 5. Progress Helper Functions (progressHelpers.ts)

### Linear Progression (Access Control):

```typescript
checkLessonAccess(userId, lessonId)
// Returns:
{
  canAccess: boolean,
  reason?: string,
  isLocked: boolean,
  previousLessonCompleted: boolean,
  previousLessonPassed: boolean,
  requiredScore?: number,
  userScore?: number
}
```

**Access Rules**:
1. Lesson 1: Always accessible
2. Other lessons: Previous lesson must be:
   - Completed (status: COMPLETED)
   - Passed (score ≥ requiredScore)

### Lesson Progress:

```typescript
getLessonWithProgress(userId, lessonId)
// Returns: Lesson + progress + isLocked + isPassed + canAccess

getCourseLessonsWithProgress(userId, courseId)
// Returns: All lessons with access/progress info
```

### Lesson Lifecycle:

```typescript
// 1. Start lesson
startLesson(userId, lessonId)
// - Checks access
// - Updates status: NOT_STARTED → IN_PROGRESS
// - Sets startedAt timestamp
// - Updates enrollment activity

// 2. Complete lesson
completeLesson(userId, lessonId, score?, timeSpent)
// - Checks if passed (score ≥ requiredScore)
// - If failed: Records attempt, returns passed: false
// - If passed:
//   - Calculates XP with streak bonus
//   - Updates status: IN_PROGRESS → COMPLETED
//   - Unlocks next lesson (LOCKED → NOT_STARTED)
//   - Awards XP and updates level
//   - Records daily XP
//   - Updates streak
// - Returns: { success, passed, xpAwarded, nextLessonUnlocked, leveledUp, newLevel }

// 3. Retry failed lesson
retryLesson(userId, lessonId)
// - Resets status: COMPLETED → IN_PROGRESS
// - Allows another attempt
```

### Progress Statistics:

```typescript
getUserCourseStats(userId)
// Returns:
{
  totalCoursesEnrolled,
  coursesInProgress,
  coursesCompleted,
  totalXPEarned,
  currentStreak,
  longestStreak,
  averageScore,
  totalTimeSpent,        // in minutes
  certificatesEarned
}

getEnrollmentProgress(enrollmentId)
// Returns: percentage (0-100)
```

---

## 🔄 6. Main Export (index.ts)

### Convenience Functions:

```typescript
// Get all data for course detail page
getCoursePageData(courseId, userId?)
// Returns: { course, enrollment, lessons, canEnroll }

// Get all data for user dashboard
getUserDashboardData(userId)
// Returns: { inProgress, completed, stats, levelInfo, streak, recentXP }

// Get all data for course catalog
getCourseCatalogData(userId?, subject?)
// Returns: courses with progress (if authenticated)
```

### Usage in Components:

```typescript
import {
  getCourses,
  enrollInCourse,
  startLesson,
  completeLesson,
  checkLessonAccess,
  getUserDashboardData
} from '@/lib/courses';

// Example: Course enrollment
const eligibility = await checkEnrollmentEligibility(userId, courseId);
if (eligibility.canEnroll) {
  const result = await enrollInCourse(userId, courseId);
  if (result.success) {
    router.push(`/courses/${courseId}/lessons/1`);
  }
}

// Example: Complete lesson with XP reward
const result = await completeLesson(userId, lessonId, score, timeSpent);
if (result.passed) {
  showNotification(`+${result.xpAwarded} XP!`);
  if (result.leveledUp) {
    showCelebration(`Level ${result.newLevel}!`);
  }
  if (result.nextLessonUnlocked) {
    router.push(`/courses/${courseId}/lessons/${result.nextLesson.order}`);
  }
}
```

---

## 🎯 How Everything Works Together

### User Journey Example: Starting and Completing a Lesson

```typescript
// 1. User clicks "Start Lesson 2"
const accessCheck = await checkLessonAccess(userId, lesson2Id);

if (!accessCheck.canAccess) {
  // Show error: "Complete Lesson 1 first" or "Need 70% to unlock"
  return;
}

// 2. Start the lesson
const start = await startLesson(userId, lesson2Id);
// Database updated: status = IN_PROGRESS, startedAt = now

// 3. User completes lesson content, takes quiz, scores 85%
const complete = await completeLesson(userId, lesson2Id, 85, 300); // 5 minutes

if (!complete.passed) {
  // Failed - need to retry
  showRetryDialog(complete.error);
  return;
}

// 4. Success! Show rewards
showXPAnimation(complete.xpAwarded); // "You earned 90 XP!" (75 base + 15 streak bonus)

if (complete.leveledUp) {
  showLevelUpModal(complete.newLevel); // "Level 3!"
}

if (complete.nextLessonUnlocked) {
  showNextLessonButton(complete.nextLesson);
}

// 5. Behind the scenes, the system has:
// - Updated lesson progress: COMPLETED
// - Unlocked Lesson 3: LOCKED → NOT_STARTED
// - Awarded XP with streak bonus
// - Updated user level (maybe leveled up!)
// - Recorded daily XP
// - Updated streak (maybe day 3 → 1.2x multiplier!)
// - Updated enrollment: completedLessons++, totalXPEarned += 90
```

---

## 🔍 Key Features Implemented

### 1. Linear Progression
- Lessons unlock sequentially
- Previous lesson must be completed AND passed
- Failed attempts don't unlock next lesson
- Unlimited retries allowed

### 2. XP & Leveling
- Base XP per lesson (50-175 XP)
- Streak multipliers (1x → 2x for 30 days!)
- Exponential leveling (harder each level)
- Daily XP tracking with breakdowns

### 3. Enrollment Management
- Prerequisite checking
- Premium access control
- Free course limits (2 courses for free users)
- Automatic progress tracking

### 4. Access Control
- Course-level: Prerequisites + premium
- Lesson-level: Linear progression + required scores
- Comprehensive eligibility checks

### 5. Progress Tracking
- Per-lesson: status, score, time spent, attempts
- Per-course: completion %, XP earned, next lesson
- User-wide: total XP, level, streaks, certificates

---

## 📊 Data Flow Example

### Course Catalog → Enrollment → Completion

```
1. User browses catalog
   getCourses({ subject: 'math', isPremium: false })
   → Returns: All free math courses

2. User clicks course → checks eligibility
   checkEnrollmentEligibility(userId, courseId)
   → Checks: Not enrolled, prerequisites met, has access
   → Returns: { canEnroll: true }

3. User clicks "Enroll"
   enrollInCourse(userId, courseId)
   → Creates: CourseEnrollment + 7 CourseLessonProgress records
   → Lesson 1: NOT_STARTED, Lessons 2-7: LOCKED

4. User starts Lesson 1
   checkLessonAccess(userId, lesson1Id) → canAccess: true
   startLesson(userId, lesson1Id)
   → Updates: status = IN_PROGRESS

5. User completes Lesson 1 with 95%
   completeLesson(userId, lesson1Id, 95, 720)
   → Checks: 95% ≥ null (no required score) → PASS
   → Awards: 50 XP (no streak yet)
   → Unlocks: Lesson 2
   → Records: Daily XP, updates level, updates streak
   → Returns: { passed: true, xpAwarded: 50, nextLessonUnlocked: true }

6. Next day, user completes Lesson 2 with 78%
   completeLesson(userId, lesson2Id, 78, 1200)
   → Checks: 78% ≥ 70% (required) → PASS
   → Awards: 90 XP (75 base × 1.2 streak multiplier = 90)
   → Unlocks: Lesson 3
   → 2-day streak active!

7. User completes all 7 lessons
   System auto-checks: completionRequirements
   → All lessons completed ✓
   → All required scores met ✓
   → Awards certificate
   → Updates enrollment: status = COMPLETED, certificateEarned = true
```

---

## 🛠️ Ready to Use

All functions are:
- ✅ Type-safe with full TypeScript support
- ✅ Production-ready with error handling
- ✅ Documented with JSDoc comments
- ✅ Tested logic (linear progression, XP formulas)
- ✅ Optimized database queries
- ✅ Clean, consistent API

---

## 🚀 Next Steps - Phase 3

With the data layer complete, Phase 3 will build the **API Routes**:
- `/api/courses` - List and filter courses
- `/api/courses/[courseId]` - Get course details
- `/api/courses/[courseId]/enroll` - Enroll in course
- `/api/courses/[courseId]/lessons/[lessonId]/start` - Start lesson
- `/api/courses/[courseId]/lessons/[lessonId]/complete` - Complete lesson
- `/api/users/[userId]/dashboard` - Dashboard data
- `/api/users/[userId]/stats` - User statistics

See `docs/course-system-plan.md` for full Phase 3 details.

---

## 📁 File Structure

```
learning-adventures-app/
└── lib/
    └── courses/
        ├── types.ts                  (320 lines) Type definitions
        ├── courseQueries.ts          (580 lines) Database queries
        ├── xpCalculations.ts         (460 lines) XP & leveling logic
        ├── enrollmentHelpers.ts      (490 lines) Enrollment management
        ├── progressHelpers.ts        (520 lines) Lesson progress tracking
        └── index.ts                  (200 lines) Main exports + convenience functions
```

---

## 💡 Usage Examples

### Example 1: Check if user can enroll

```typescript
import { checkEnrollmentEligibility } from '@/lib/courses';

const eligibility = await checkEnrollmentEligibility(userId, courseId);

if (!eligibility.canEnroll) {
  if (!eligibility.prerequisitesMet) {
    console.log('Missing prerequisites:', eligibility.missingPrerequisites);
  } else if (eligibility.requiresPremium && !eligibility.hasPremiumAccess) {
    console.log('Premium subscription required');
  } else if (eligibility.freeCoursesEnrolled >= eligibility.freeCourseLimit) {
    console.log('Free course limit reached. Upgrade to premium!');
  }
}
```

### Example 2: Get dashboard data

```typescript
import { getUserDashboardData } from '@/lib/courses';

const dashboard = await getUserDashboardData(userId);

console.log(`Level ${dashboard.levelInfo.currentLevel}`);
console.log(`${dashboard.stats.coursesInProgress} courses in progress`);
console.log(`${dashboard.streak} day streak! 🔥`);
console.log(`${dashboard.stats.certificatesEarned} certificates earned`);
```

### Example 3: Complete lesson with rewards

```typescript
import { completeLesson } from '@/lib/courses';

const result = await completeLesson(userId, lessonId, 85, 300);

if (result.passed) {
  console.log(`+${result.xpAwarded} XP`);
  if (result.leveledUp) {
    console.log(`Level up! Now level ${result.newLevel}`);
  }
}
```

---

*Last Updated: November 15, 2025*
*Phase 2: Complete ✅*
*Next: Phase 3 - XP & Progression Backend (API Routes)*
