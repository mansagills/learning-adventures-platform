# API Documentation - Learning Adventures Platform

## Overview
Complete API reference for the Learning Adventures Platform course system. All endpoints follow REST conventions and return JSON responses.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via NextAuth.js session cookies. Include credentials in requests:

```javascript
fetch('/api/endpoint', {
  method: 'POST',
  credentials: 'include', // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `ENROLLMENT_NOT_ALLOWED` - Cannot enroll in course
- `COURSE_NOT_COMPLETED` - Course must be completed first
- `PREREQUISITE_NOT_MET` - Missing prerequisite courses

---

## Courses

### GET /api/courses
Get list of all courses with optional filtering

**Authentication**: Optional (returns more data if authenticated)

**Query Parameters**:
- `includeProgress` (boolean): Include user's progress data
- `search` (string): Search by title or description
- `subject` (string): Filter by subject (math, science, etc.)
- `difficulty` (string): Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED)

**Example Request**:
```bash
GET /api/courses?includeProgress=true&subject=math
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "clx123...",
        "title": "Multiplication Mastery",
        "description": "Master multiplication tables...",
        "slug": "multiplication-mastery",
        "subject": "math",
        "gradeLevel": ["3", "4", "5"],
        "difficulty": "BEGINNER",
        "isPremium": false,
        "isPublished": true,
        "totalXP": 575,
        "estimatedMinutes": 180,
        "prerequisiteCourseIds": [],
        "enrollment": {
          "id": "enr123...",
          "status": "IN_PROGRESS",
          "progressPercent": 42,
          "totalXPEarned": 240
        },
        "lessons": [
          {
            "id": "lesson123...",
            "order": 1,
            "title": "Introduction to Multiplication",
            "type": "INTERACTIVE",
            "duration": 15,
            "xpReward": 50
          }
        ]
      }
    ],
    "count": 3
  }
}
```

---

### GET /api/courses/[courseId]
Get detailed information about a specific course

**Authentication**: Optional

**Path Parameters**:
- `courseId` (string): Course ID

**Query Parameters**:
- `includeProgress` (boolean): Include user's enrollment and lesson progress

**Example Request**:
```bash
GET /api/courses/clx123?includeProgress=true
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "clx123...",
      "title": "Multiplication Mastery",
      // ... (same fields as courses list)
      "lessons": [/* array of lessons */],
      "enrollment": {/* enrollment data if enrolled */},
      "lessonsCompleted": 3,
      "progressPercentage": 42
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

### POST /api/courses/[courseId]/enroll
Enroll in a course

**Authentication**: Required

**Path Parameters**:
- `courseId` (string): Course ID to enroll in

**Request Body**: None

**Example Request**:
```bash
POST /api/courses/clx123/enroll
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "enr123...",
      "userId": "user123...",
      "courseId": "clx123...",
      "status": "IN_PROGRESS",
      "totalLessons": 7,
      "completedLessons": 0,
      "progressPercent": 0,
      "totalXPEarned": 0,
      "enrolledAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Response** (400 - Premium Required):
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Cannot enroll in this course",
    "details": {
      "eligible": false,
      "requiresPremium": true,
      "hasPremiumAccess": false,
      "prerequisitesMet": true,
      "freeCourseLimit": 2,
      "freeCoursesEnrolled": 1
    }
  }
}
```

**Error Response** (400 - Free Limit Reached):
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Cannot enroll in this course",
    "details": {
      "eligible": false,
      "requiresPremium": false,
      "hasPremiumAccess": false,
      "freeCourseLimit": 2,
      "freeCoursesEnrolled": 2,
      "prerequisitesMet": true
    }
  }
}
```

---

### DELETE /api/courses/[courseId]/enroll
Unenroll from a course

**Authentication**: Required

**Path Parameters**:
- `courseId` (string): Course ID to unenroll from

**Request Body**: None

**Example Request**:
```bash
DELETE /api/courses/clx123/enroll
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Successfully unenrolled from course"
  }
}
```

---

### POST /api/courses/[courseId]/lessons/[lessonId]/complete
Mark a lesson as complete

**Authentication**: Required

**Path Parameters**:
- `courseId` (string): Course ID
- `lessonId` (string): Lesson ID

**Request Body**:
```json
{
  "score": 95,
  "timeSpent": 15
}
```

**Example Request**:
```bash
POST /api/courses/clx123/lessons/lesson456/complete
Content-Type: application/json

{
  "score": 95,
  "timeSpent": 15
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "lessonProgress": {
      "id": "prog123...",
      "status": "COMPLETED",
      "score": 95,
      "xpEarned": 50,
      "completedAt": "2025-01-15T10:30:00.000Z"
    },
    "enrollment": {
      "progressPercent": 14,
      "completedLessons": 1,
      "totalXPEarned": 50
    },
    "levelUp": false,
    "courseCompleted": false
  }
}
```

**Success Response with Level Up** (200):
```json
{
  "success": true,
  "data": {
    "lessonProgress": {/* ... */},
    "enrollment": {/* ... */},
    "levelUp": true,
    "newLevel": 2,
    "courseCompleted": false
  }
}
```

**Success Response with Course Completion** (200):
```json
{
  "success": true,
  "data": {
    "lessonProgress": {/* ... */},
    "enrollment": {
      "status": "COMPLETED",
      "progressPercent": 100,
      "completedLessons": 7,
      "totalXPEarned": 575
    },
    "levelUp": false,
    "courseCompleted": true
  }
}
```

---

## Certificates

### POST /api/courses/[courseId]/certificate
Generate or retrieve certificate for completed course

**Authentication**: Required

**Path Parameters**:
- `courseId` (string): Course ID

**Request Body**: None

**Example Request**:
```bash
POST /api/courses/clx123/certificate
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "cert123...",
      "certificateNumber": "CERT-2025-000042",
      "studentName": "John Doe",
      "courseTitle": "Multiplication Mastery",
      "completionDate": "2025-01-15T00:00:00.000Z",
      "totalXPEarned": 575,
      "averageScore": 95.5,
      "totalLessons": 7,
      "timeSpent": 120,
      "issuedAt": "2025-01-15T12:00:00.000Z"
    }
  }
}
```

**Error Response** (400 - Course Not Completed):
```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_COMPLETED",
    "message": "You must complete the course before generating a certificate"
  }
}
```

---

### GET /api/certificates/[certificateId]
Get certificate by ID (public endpoint for verification)

**Authentication**: Not required

**Path Parameters**:
- `certificateId` (string): Certificate ID

**Example Request**:
```bash
GET /api/certificates/cert123
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "cert123...",
      "certificateNumber": "CERT-2025-000042",
      "verificationCode": "A1B2C3D4E5F6",
      "studentName": "John Doe",
      "courseTitle": "Multiplication Mastery",
      "completionDate": "2025-01-15T00:00:00.000Z",
      "totalXPEarned": 575,
      "averageScore": 95.5,
      "totalLessons": 7,
      "timeSpent": 120,
      "issuedAt": "2025-01-15T12:00:00.000Z"
    }
  }
}
```

---

### GET /api/certificates/user
Get all certificates for authenticated user

**Authentication**: Required

**Example Request**:
```bash
GET /api/certificates/user
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": "cert123...",
        "certificateNumber": "CERT-2025-000042",
        "studentName": "John Doe",
        "courseTitle": "Multiplication Mastery",
        "completionDate": "2025-01-15T00:00:00.000Z",
        "totalXPEarned": 575,
        "averageScore": 95.5,
        "totalLessons": 7,
        "timeSpent": 120,
        "issuedAt": "2025-01-15T12:00:00.000Z"
      }
    ],
    "count": 3
  }
}
```

---

## XP & Leveling

### GET /api/level/status
Get user's level, XP, and streak information

**Authentication**: Required

**Example Request**:
```bash
GET /api/level/status
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "level": {
      "currentLevel": 5,
      "totalXP": 1250,
      "xpToNextLevel": 250,
      "xpInCurrentLevel": 50
    },
    "streak": {
      "currentStreak": 7,
      "longestStreak": 14,
      "lastActivityDate": "2025-01-15T10:00:00.000Z",
      "streakBonus": 1.5
    },
    "dailyXP": {
      "date": "2025-01-15",
      "xpFromLessons": 150,
      "xpFromGames": 50,
      "totalXP": 200,
      "lessonsCompleted": 3,
      "gamesCompleted": 2
    }
  }
}
```

---

## Dashboard

### GET /api/courses/user/dashboard
Get dashboard data for authenticated user

**Authentication**: Required

**Example Request**:
```bash
GET /api/courses/user/dashboard
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "recentCourses": [
      {
        "id": "clx123...",
        "title": "Multiplication Mastery",
        "slug": "multiplication-mastery",
        "subject": "math",
        "difficulty": "BEGINNER",
        "isPremium": false,
        "progressPercent": 42,
        "lessonsCompleted": 3,
        "totalLessons": 7,
        "totalXPEarned": 150,
        "lastAccessedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "inProgressCount": 2,
    "completedCount": 1,
    "totalCourseXP": 750
  }
}
```

---

## User Progress

### GET /api/user/progress
Get all progress for authenticated user

**Authentication**: Required

**Query Parameters**:
- `category` (string, optional): Filter by category (math, science, etc.)
- `status` (string, optional): Filter by status (COMPLETED, IN_PROGRESS)

**Example Request**:
```bash
GET /api/user/progress?category=math&status=COMPLETED
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "id": "prog123...",
        "adventureId": "multiplication-adventure",
        "adventureType": "game",
        "category": "math",
        "status": "COMPLETED",
        "score": 95,
        "timeSpent": 15,
        "completedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "stats": {
      "totalAdventures": 25,
      "completedAdventures": 15,
      "totalTimeSpent": 450,
      "averageScore": 87.5
    }
  }
}
```

---

### POST /api/user/progress
Create or update progress for an adventure

**Authentication**: Required

**Request Body**:
```json
{
  "adventureId": "multiplication-adventure",
  "adventureType": "game",
  "category": "math",
  "status": "COMPLETED",
  "score": 95,
  "timeSpent": 15
}
```

**Example Request**:
```bash
POST /api/user/progress
Content-Type: application/json

{
  "adventureId": "multiplication-adventure",
  "adventureType": "game",
  "category": "math",
  "status": "COMPLETED",
  "score": 95,
  "timeSpent": 15
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "progress": {
      "id": "prog123...",
      "adventureId": "multiplication-adventure",
      "status": "COMPLETED",
      "score": 95,
      "completedAt": "2025-01-15T10:00:00.000Z"
    },
    "achievements": [
      {
        "type": "completion",
        "title": "First Game Completed!",
        "description": "You completed your first game",
        "category": "math"
      }
    ]
  }
}
```

---

## Achievements

### GET /api/user/achievements
Get all achievements for authenticated user

**Authentication**: Required

**Example Request**:
```bash
GET /api/user/achievements
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "ach123...",
        "type": "completion",
        "title": "First Game Completed!",
        "description": "You completed your first game",
        "category": "math",
        "earnedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "ach124...",
        "type": "streak",
        "title": "Week Warrior",
        "description": "7-day learning streak",
        "category": null,
        "earnedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "count": 12
  }
}
```

---

## Health Check

### GET /api/health
Check API and database health

**Authentication**: Not required

**Example Request**:
```bash
GET /api/health
```

**Success Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "database": "connected"
}
```

**Error Response** (500):
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "database": "disconnected",
  "error": "Connection timeout"
}
```

---

## Rate Limiting

All API endpoints are subject to rate limiting:

- **Authenticated requests**: 100 requests per minute
- **Unauthenticated requests**: 20 requests per minute
- **Certificate generation**: 10 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642258800
```

---

## Webhooks (Future)

*Webhooks are not yet implemented but planned for future releases*

Potential webhook events:
- `course.enrolled` - User enrolled in course
- `course.completed` - User completed course
- `certificate.generated` - Certificate was generated
- `level.up` - User leveled up

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// API Client Wrapper
class CoursesAPI {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async enrollInCourse(courseId: string) {
    const response = await fetch(`${this.baseURL}/courses/${courseId}/enroll`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  }

  async getCourses(includeProgress = false) {
    const url = `${this.baseURL}/courses?includeProgress=${includeProgress}`;
    const response = await fetch(url, {
      credentials: 'include',
    });

    const data = await response.json();
    return data.success ? data.data.courses : [];
  }

  async completeLesson(courseId: string, lessonId: string, score: number, timeSpent: number) {
    const response = await fetch(
      `${this.baseURL}/courses/${courseId}/lessons/${lessonId}/complete`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, timeSpent }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  }
}

// Usage
const api = new CoursesAPI();

try {
  await api.enrollInCourse('clx123');
  console.log('Enrolled successfully!');
} catch (error) {
  console.error('Enrollment failed:', error.message);
}
```

---

## Changelog

### Version 1.0 (2025-01-15)
- Initial API release
- Course enrollment system
- Lesson progression tracking
- XP and leveling system
- Certificate generation
- Premium access control

### Upcoming Features
- Batch operations
- Webhooks
- GraphQL API
- Advanced filtering
- Pagination for large datasets
- CSV/JSON export

---

## Support

For API support:
- GitHub Issues: https://github.com/your-repo/issues
- Documentation: https://docs.your-domain.com
- Email: support@your-domain.com

---

**Last Updated**: 2025-11-16
**API Version**: 1.0
**Status**: Production
