# Course System - Phase 3 Complete ✅

**Status**: API Routes Built and Ready to Use
**Date**: November 15, 2025
**Phase**: 3 - XP & Progression Backend (API Routes)

---

## 🎉 What Was Accomplished

Phase 3 built the **complete REST API** that connects your frontend to the data access layer created in Phase 2.

### Files Created (10 total):

**API Helpers** (2 files):
1. **app/api/lib/auth.ts** - Authentication utilities
2. **app/api/lib/responses.ts** - Standardized response helpers

**Course Routes** (4 files):
3. **app/api/courses/route.ts** - List all courses
4. **app/api/courses/[courseId]/route.ts** - Get course details
5. **app/api/courses/[courseId]/enroll/route.ts** - Enroll/unenroll
6. **app/api/courses/[courseId]/lessons/[lessonId]/start/route.ts** - Start lesson
7. **app/api/courses/[courseId]/lessons/[lessonId]/complete/route.ts** - Complete lesson

**User Routes** (2 files):
8. **app/api/users/dashboard/route.ts** - Dashboard data
9. **app/api/users/stats/route.ts** - User statistics

**Total**: ~800 lines of API code

---

## 📋 API Endpoints Reference

### 1. Course Endpoints

#### `GET /api/courses`
**List all published courses with optional filtering and pagination**

**Query Parameters**:
```
subject?: string                          // Filter by subject (math, science, etc.)
difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'  // Filter by difficulty
isPremium?: boolean                       // Filter by premium status
search?: string                           // Search in title/description
sortBy?: 'title' | 'difficulty' | 'estimatedMinutes' | 'totalXP' | 'recent'
sortDirection?: 'asc' | 'desc'
page?: number                             // Page number (default: 1)
pageSize?: number                         // Items per page (default: 10)
includeProgress?: boolean                 // Include user progress (requires auth)
```

**Example Request**:
```bash
# Get all free math courses sorted by XP
GET /api/courses?subject=math&isPremium=false&sortBy=totalXP&sortDirection=desc

# Get user's courses with progress (authenticated)
GET /api/courses?includeProgress=true

# Search for "fraction" courses
GET /api/courses?search=fraction

# Paginated results
GET /api/courses?page=1&pageSize=10
```

**Response**:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "...",
        "title": "Multiplication Mastery",
        "slug": "multiplication-mastery",
        "subject": "math",
        "gradeLevel": ["3-5"],
        "difficulty": "BEGINNER",
        "isPremium": false,
        "estimatedMinutes": 180,
        "totalXP": 575,
        "lessons": [...],
        "enrollment": {...},           // If includeProgress=true
        "progressPercentage": 35,      // If includeProgress=true
        "isLocked": false,             // If includeProgress=true
        "prerequisitesMet": true       // If includeProgress=true
      }
    ]
  }
}
```

---

#### `GET /api/courses/[courseId]`
**Get detailed information about a specific course**

**Query Parameters**:
```
includeProgress?: boolean   // Include user progress (requires auth)
```

**Example Request**:
```bash
# Get course details
GET /api/courses/clx123abc

# Get course with user progress (authenticated)
GET /api/courses/clx123abc?includeProgress=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "clx123abc",
      "title": "Multiplication Mastery",
      "description": "Master multiplication...",
      "lessons": [
        {
          "id": "...",
          "order": 1,
          "title": "What is Multiplication?",
          "type": "INTERACTIVE",
          "xpReward": 50,
          "requiredScore": null
        }
      ],
      "enrollment": {...},        // If includeProgress=true
      "progressPercentage": 35    // If includeProgress=true
    }
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Course not found"
  }
}
```

---

#### `POST /api/courses/[courseId]/enroll`
**Enroll the authenticated user in a course**

**Authentication**: Required

**Example Request**:
```bash
POST /api/courses/clx123abc/enroll
Authorization: Bearer <token>
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "...",
      "userId": "...",
      "courseId": "clx123abc",
      "status": "IN_PROGRESS",
      "currentLessonOrder": 1
    },
    "message": "Successfully enrolled in course"
  }
}
```

**Error Response** (403 - Prerequisites not met):
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Prerequisites not met",
    "details": {
      "prerequisitesMet": false,
      "missingPrerequisites": [
        {
          "id": "...",
          "title": "Multiplication Mastery"
        }
      ]
    }
  }
}
```

**Error Response** (403 - Premium required):
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Premium subscription required",
    "details": {
      "requiresPremium": true,
      "hasPremiumAccess": false
    }
  }
}
```

**Error Response** (403 - Free course limit):
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Free users can only enroll in 2 free courses. Upgrade to premium for unlimited access.",
    "details": {
      "freeCourseLimit": 2,
      "freeCoursesEnrolled": 2
    }
  }
}
```

---

#### `DELETE /api/courses/[courseId]/enroll`
**Unenroll the authenticated user from a course**

**Authentication**: Required

**Example Request**:
```bash
DELETE /api/courses/clx123abc/enroll
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Successfully unenrolled from course"
  }
}
```

---

### 2. Lesson Endpoints

#### `POST /api/courses/[courseId]/lessons/[lessonId]/start`
**Start a lesson for the authenticated user**

**Authentication**: Required

**Example Request**:
```bash
POST /api/courses/clx123abc/lessons/clx456def/start
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "progress": {
      "id": "...",
      "lessonId": "clx456def",
      "status": "IN_PROGRESS",
      "startedAt": "2025-11-15T12:00:00Z"
    },
    "message": "Lesson started successfully"
  }
}
```

**Error Response** (403 - Lesson locked):
```json
{
  "success": false,
  "error": {
    "code": "START_LESSON_FAILED",
    "message": "Previous lesson not completed"
  }
}
```

---

#### `POST /api/courses/[courseId]/lessons/[lessonId]/complete`
**Complete a lesson for the authenticated user**

**Authentication**: Required

**Request Body**:
```json
{
  "score": 85,           // Optional: Score percentage (0-100)
  "timeSpent": 300       // Optional: Time spent in seconds
}
```

**Example Request**:
```bash
POST /api/courses/clx123abc/lessons/clx456def/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85,
  "timeSpent": 300
}
```

**Success Response** (Passed):
```json
{
  "success": true,
  "data": {
    "passed": true,
    "xpAwarded": 90,           // 75 base + 15 streak bonus
    "nextLessonUnlocked": true,
    "nextLesson": {
      "id": "...",
      "order": 3,
      "title": "Times Tables 6-10"
    },
    "leveledUp": true,
    "newLevel": 3,
    "message": "Lesson completed! +90 XP"
  }
}
```

**Response** (Failed - need to retry):
```json
{
  "success": true,
  "data": {
    "passed": false,
    "message": "Requires 70% to pass. You scored 65%. Try again!",
    "score": 65
  }
}
```

**Error Response** (400 - Validation):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Score must be between 0 and 100"
  }
}
```

---

### 3. User Endpoints

#### `GET /api/users/dashboard`
**Get comprehensive dashboard data for the authenticated user**

**Authentication**: Required

**Example Request**:
```bash
GET /api/users/dashboard
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "inProgress": [
      {
        "id": "...",
        "courseId": "...",
        "course": {
          "title": "Multiplication Mastery",
          "lessons": [...]
        },
        "completedLessons": 3,
        "totalXPEarned": 225,
        "currentLessonOrder": 4
      }
    ],
    "completed": [
      {
        "id": "...",
        "courseId": "...",
        "course": {
          "title": "Science Lab Basics"
        },
        "certificateEarned": true,
        "completedAt": "2025-11-10T18:00:00Z"
      }
    ],
    "stats": {
      "totalCoursesEnrolled": 4,
      "coursesInProgress": 2,
      "coursesCompleted": 2,
      "totalXPEarned": 1850,
      "currentStreak": 7,
      "longestStreak": 15,
      "averageScore": 87,
      "totalTimeSpent": 420,      // minutes
      "certificatesEarned": 2
    },
    "levelInfo": {
      "currentLevel": 5,
      "totalXP": 1850,
      "xpForCurrentLevel": 50,
      "xpRequiredForNextLevel": 1118,
      "progressToNextLevel": 4
    },
    "streak": 7,
    "recentXP": 450    // XP in last 7 days
  }
}
```

---

#### `GET /api/users/stats`
**Get detailed statistics for the authenticated user**

**Authentication**: Required

**Example Request**:
```bash
GET /api/users/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCoursesEnrolled": 4,
      "coursesInProgress": 2,
      "coursesCompleted": 2,
      "totalXPEarned": 1850,
      "currentStreak": 7,
      "longestStreak": 15,
      "averageScore": 87,
      "totalTimeSpent": 420,
      "certificatesEarned": 2
    }
  }
}
```

---

## 🔐 Authentication

All authenticated endpoints require a valid session. The API uses NextAuth.js for authentication.

### How Authentication Works:

1. User logs in via NextAuth.js
2. Session is created with user ID and role
3. API routes call `getAuthenticatedUser()` or `requireAuth()`
4. If not authenticated, returns 401 error

### Helper Functions:

```typescript
// Get user if authenticated (returns null if not)
const user = await getAuthenticatedUser(request);

// Require authentication (throws error if not)
const user = await requireAuth(request);

// Check premium access
const isPremium = hasPremiumAccess(user);
```

---

## 🛡️ Error Handling

All API routes use standardized error responses:

### Error Response Format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional error information
    }
  }
}
```

### Error Codes:

| Code | Status | Description |
|------|--------|-------------|
| `AUTHENTICATION_ERROR` | 401 | User not authenticated |
| `AUTHORIZATION_ERROR` | 403 | User not authorized |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `ENROLLMENT_NOT_ALLOWED` | 403 | Cannot enroll (prerequisites, premium, limits) |
| `START_LESSON_FAILED` | 403 | Cannot start lesson (locked, not enrolled) |
| `COMPLETE_LESSON_FAILED` | 400 | Cannot complete lesson |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🎯 Usage Examples

### Example 1: Course Catalog Page

```typescript
// Fetch all free math courses
const response = await fetch('/api/courses?subject=math&isPremium=false');
const { data } = await response.json();

data.courses.forEach(course => {
  console.log(`${course.title} - ${course.totalXP} XP`);
});
```

### Example 2: Enroll in Course

```typescript
// Check if user can enroll
const eligibilityResponse = await fetch('/api/courses/clx123abc');
const { data: courseData } = await eligibilityResponse.json();

// Enroll
const enrollResponse = await fetch('/api/courses/clx123abc/enroll', {
  method: 'POST',
});

const { data } = await enrollResponse.json();
if (data.enrollment) {
  router.push(`/courses/${data.enrollment.courseId}`);
}
```

### Example 3: Complete Lesson Flow

```typescript
// 1. Start lesson
await fetch('/api/courses/clx123abc/lessons/clx456def/start', {
  method: 'POST',
});

// 2. User completes lesson content...

// 3. Submit completion with score
const completeResponse = await fetch(
  '/api/courses/clx123abc/lessons/clx456def/complete',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      score: 85,
      timeSpent: 300,
    }),
  }
);

const { data } = await completeResponse.json();

if (data.passed) {
  // Show XP animation
  showXPAnimation(data.xpAwarded);

  // Show level up if applicable
  if (data.leveledUp) {
    showLevelUpModal(data.newLevel);
  }

  // Navigate to next lesson
  if (data.nextLessonUnlocked) {
    router.push(`/courses/${courseId}/lessons/${data.nextLesson.order}`);
  }
} else {
  // Show retry dialog
  showRetryDialog(data.message);
}
```

### Example 4: Load Dashboard

```typescript
const response = await fetch('/api/users/dashboard');
const { data } = await response.json();

// Display in-progress courses
data.inProgress.forEach(enrollment => {
  console.log(`${enrollment.course.title} - ${enrollment.completedLessons} lessons done`);
});

// Display stats
console.log(`Level ${data.levelInfo.currentLevel}`);
console.log(`${data.streak} day streak! 🔥`);
console.log(`${data.stats.certificatesEarned} certificates earned`);
```

---

## 🔧 Helper Utilities

### API Helpers (app/api/lib/auth.ts):

```typescript
// Get authenticated user
getAuthenticatedUser(request)

// Require authentication (throws if not authenticated)
requireAuth(request)

// Check premium access
hasPremiumAccess(user)

// Custom error classes
AuthenticationError
AuthorizationError
ValidationError
```

### Response Helpers (app/api/lib/responses.ts):

```typescript
// Success response
successResponse(data, status?)

// Error response
errorResponse(message, code, status, details?)

// Handle errors automatically
handleApiError(error)

// Validate request body
validateRequestBody(request, requiredFields)

// Get query parameters
getQueryParam(url, param)
getQueryParamAsNumber(url, param, defaultValue?)
getQueryParamAsBoolean(url, param, defaultValue?)
```

---

## 📊 Complete API Flow Example

### User Journey: Enroll → Start → Complete → Level Up

```
1. Browse Courses
   GET /api/courses?subject=math
   → Returns: All math courses

2. View Course Details
   GET /api/courses/clx123abc?includeProgress=true
   → Returns: Course with user's progress (0%)

3. Enroll in Course
   POST /api/courses/clx123abc/enroll
   → Creates: CourseEnrollment + 7 CourseLessonProgress records
   → Lesson 1: NOT_STARTED, Lessons 2-7: LOCKED

4. Start Lesson 1
   POST /api/courses/clx123abc/lessons/lesson1/start
   → Updates: status = IN_PROGRESS

5. Complete Lesson 1 with 95%
   POST /api/courses/clx123abc/lessons/lesson1/complete
   Body: { score: 95, timeSpent: 720 }
   → Awards: 50 XP (no streak yet)
   → Unlocks: Lesson 2
   → Returns: { passed: true, xpAwarded: 50, nextLessonUnlocked: true }

6. Start Lesson 2 (next day)
   POST /api/courses/clx123abc/lessons/lesson2/start

7. Complete Lesson 2 with 78%
   POST /api/courses/clx123abc/lessons/lesson2/complete
   Body: { score: 78, timeSpent: 1200 }
   → Awards: 90 XP (75 base × 1.2 streak = 90)
   → Unlocks: Lesson 3
   → Returns: { passed: true, xpAwarded: 90, nextLessonUnlocked: true }
   → 2-day streak active!

8. View Dashboard
   GET /api/users/dashboard
   → Returns: inProgress courses, stats, level info, streak
   → Shows: Level 1 → Level 2 (140 XP earned)
```

---

## ✅ Phase 3 Complete

**What's Ready**:
- ✅ 9 API endpoints fully functional
- ✅ Authentication & authorization
- ✅ Standardized error handling
- ✅ Request validation
- ✅ Query parameter parsing
- ✅ Comprehensive documentation

**What's Next - Phase 4**:
Phase 4 will build the **Course Enrollment & Progress UI**:
- Course catalog page
- Course detail page with enrollment
- Lesson player
- Progress tracking UI
- XP animations and level-up modals

See `docs/course-system-plan.md` for full Phase 4 details.

---

*Last Updated: November 15, 2025*
*Phase 3: Complete ✅*
*Next: Phase 4 - Course Enrollment & Progress APIs*
