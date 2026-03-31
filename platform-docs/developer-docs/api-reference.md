# Learning Adventures API Reference

This document provides comprehensive API documentation for the Learning Adventures platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

Most endpoints require authentication via NextAuth.js session.

### Session Header
```
Cookie: next-auth.session-token=<session-token>
```

### Role-Based Access
- **Public**: No authentication required
- **Authenticated**: Any logged-in user
- **Parent**: Users with 'parent' role
- **Admin**: Users with 'admin' role

---

## Authentication Endpoints

### POST /api/auth/signin
Initiate sign-in flow.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "url": "/api/auth/callback/credentials"
}
```

### POST /api/auth/signup
Create new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "John Parent",
  "role": "parent"
}
```

**Response:**
```json
{
  "id": "user_abc123",
  "email": "newuser@example.com",
  "name": "John Parent",
  "role": "parent",
  "createdAt": "2026-01-31T12:00:00Z"
}
```

### GET /api/auth/session
Get current session.

**Response:**
```json
{
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Parent",
    "role": "parent"
  },
  "expires": "2026-02-28T12:00:00Z"
}
```

---

## User Endpoints

### GET /api/user/profile
Get current user profile.

**Access:** Authenticated

**Response:**
```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "name": "John Parent",
  "role": "parent",
  "preferences": {
    "emailNotifications": true,
    "progressReports": "weekly"
  },
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### PUT /api/user/profile
Update user profile.

**Access:** Authenticated

**Request:**
```json
{
  "name": "John Updated",
  "preferences": {
    "emailNotifications": false
  }
}
```

**Response:**
```json
{
  "id": "user_abc123",
  "name": "John Updated",
  "preferences": {
    "emailNotifications": false
  }
}
```

---

## Parent & Child Endpoints

### GET /api/parent/children
List all children for authenticated parent.

**Access:** Parent

**Response:**
```json
{
  "children": [
    {
      "id": "child_xyz789",
      "displayName": "Alex",
      "username": "adventurer_42",
      "gradeLevel": "3",
      "avatar": "astronaut",
      "createdAt": "2026-01-20T14:00:00Z"
    }
  ],
  "count": 1,
  "maxAllowed": 5
}
```

### POST /api/parent/children
Create new child profile.

**Access:** Parent

**Request:**
```json
{
  "displayName": "Emma",
  "username": "star_learner",
  "pin": "5678",
  "gradeLevel": "2",
  "avatar": "princess"
}
```

**Response:**
```json
{
  "id": "child_new123",
  "displayName": "Emma",
  "username": "star_learner",
  "gradeLevel": "2",
  "avatar": "princess",
  "createdAt": "2026-01-31T12:00:00Z"
}
```

### PUT /api/parent/children/[id]
Update child profile.

**Access:** Parent (owner)

**Request:**
```json
{
  "displayName": "Emma Star",
  "gradeLevel": "3"
}
```

### DELETE /api/parent/children/[id]
Delete child profile.

**Access:** Parent (owner)

**Response:**
```json
{
  "success": true,
  "message": "Child profile deleted"
}
```

### PUT /api/parent/children/[id]/reset-pin
Reset child PIN.

**Access:** Parent (owner)

**Request:**
```json
{
  "newPin": "9876"
}
```

---

## Child Session Endpoints

### POST /api/child/login
Authenticate child with username and PIN.

**Access:** Public

**Request:**
```json
{
  "username": "adventurer_42",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "child_session_abc123",
  "child": {
    "id": "child_xyz789",
    "displayName": "Alex",
    "avatar": "astronaut",
    "gradeLevel": "3"
  }
}
```

### GET /api/child/session
Validate child session.

**Access:** Child Session

**Headers:**
```
X-Child-Session: child_session_abc123
```

**Response:**
```json
{
  "valid": true,
  "child": {
    "id": "child_xyz789",
    "displayName": "Alex"
  }
}
```

### POST /api/child/logout
End child session.

**Access:** Child Session

**Response:**
```json
{
  "success": true
}
```

---

## Progress Tracking Endpoints

### GET /api/progress/[childId]
Get progress for a child.

**Access:** Parent (owner) or Child Session

**Response:**
```json
{
  "childId": "child_xyz789",
  "summary": {
    "adventuresCompleted": 12,
    "adventuresInProgress": 3,
    "totalTimeMinutes": 245,
    "currentStreak": 5,
    "longestStreak": 10
  },
  "bySubject": {
    "math": { "completed": 5, "inProgress": 1 },
    "science": { "completed": 4, "inProgress": 2 },
    "english": { "completed": 3, "inProgress": 0 }
  },
  "recentActivity": [
    {
      "adventureId": "fraction-pizza-party",
      "title": "Fraction Pizza Party",
      "status": "completed",
      "score": 85,
      "completedAt": "2026-01-30T16:30:00Z"
    }
  ]
}
```

### POST /api/progress/[childId]/start
Start an adventure.

**Access:** Child Session

**Request:**
```json
{
  "adventureId": "planet-explorer-quest"
}
```

**Response:**
```json
{
  "progressId": "prog_abc123",
  "adventureId": "planet-explorer-quest",
  "status": "in_progress",
  "startedAt": "2026-01-31T14:00:00Z"
}
```

### POST /api/progress/[childId]/complete
Complete an adventure.

**Access:** Child Session

**Request:**
```json
{
  "adventureId": "planet-explorer-quest",
  "score": 90,
  "timeSpentMinutes": 18
}
```

**Response:**
```json
{
  "progressId": "prog_abc123",
  "status": "completed",
  "score": 90,
  "xpEarned": 150,
  "achievements": [
    {
      "id": "science_explorer",
      "name": "Science Explorer",
      "description": "Complete 5 science adventures"
    }
  ]
}
```

---

## Achievement Endpoints

### GET /api/achievements/[childId]
Get achievements for a child.

**Access:** Parent (owner) or Child Session

**Response:**
```json
{
  "earned": [
    {
      "id": "first_adventure",
      "name": "First Steps",
      "description": "Complete your first adventure",
      "icon": "star",
      "earnedAt": "2026-01-20T10:00:00Z"
    }
  ],
  "available": [
    {
      "id": "math_master",
      "name": "Math Master",
      "description": "Complete 10 math adventures",
      "icon": "calculator",
      "progress": {
        "current": 5,
        "required": 10
      }
    }
  ]
}
```

---

## Content Endpoints

### GET /api/catalog
Get all catalog content.

**Access:** Public (limited) / Authenticated (full)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| type | string | Filter by "game" or "lesson" |
| gradeLevel | string | Filter by grade level |
| difficulty | string | Filter by difficulty |
| featured | boolean | Only featured content |
| limit | number | Max results (default: 50) |
| offset | number | Pagination offset |

**Response:**
```json
{
  "adventures": [
    {
      "id": "fraction-pizza-party",
      "title": "Fraction Pizza Party",
      "description": "Learn fractions with pizza!",
      "type": "lesson",
      "category": "math",
      "gradeLevel": ["2", "3", "4"],
      "difficulty": "easy",
      "skills": ["Fractions", "Visual Math"],
      "estimatedTime": "15-20 mins",
      "featured": true,
      "htmlPath": "/lessons/fraction-pizza-party.html"
    }
  ],
  "total": 98,
  "limit": 50,
  "offset": 0
}
```

### GET /api/catalog/[adventureId]
Get single adventure details.

**Access:** Public

**Response:**
```json
{
  "id": "fraction-pizza-party",
  "title": "Fraction Pizza Party",
  "description": "Learn fractions with pizza!",
  "type": "lesson",
  "category": "math",
  "gradeLevel": ["2", "3", "4"],
  "difficulty": "easy",
  "skills": ["Fractions", "Visual Math"],
  "estimatedTime": "15-20 mins",
  "featured": true,
  "htmlPath": "/lessons/fraction-pizza-party.html",
  "playCount": 1250,
  "avgRating": 4.8
}
```

---

## Admin Content Upload Endpoints

### POST /api/internal/content-upload
Upload new content file.

**Access:** Admin

**Request (multipart/form-data):**
```
file: <HTML file>
type: "game" | "lesson"
metadata: {
  "title": "New Game",
  "description": "Game description",
  "category": "math",
  "gradeLevel": ["3", "4"],
  "difficulty": "medium",
  "skills": ["Addition", "Problem Solving"],
  "estimatedTime": "15-20 mins"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "id": "new-game",
    "title": "New Game",
    "path": "/games/new-game.html",
    "status": "published"
  }
}
```

### GET /api/internal/content-upload/list
List all uploaded content.

**Access:** Admin

**Response:**
```json
{
  "content": [
    {
      "id": "upload_abc123",
      "filename": "new-game.html",
      "type": "game",
      "status": "published",
      "uploadedAt": "2026-01-31T10:00:00Z",
      "uploadedBy": "admin@example.com"
    }
  ]
}
```

### POST /api/internal/upload-zip
Batch upload via ZIP file.

**Access:** Admin

**Request (multipart/form-data):**
```
file: <ZIP file>
type: "game" | "lesson"
```

**Response:**
```json
{
  "success": true,
  "uploaded": [
    { "filename": "game1.html", "status": "success" },
    { "filename": "game2.html", "status": "success" }
  ],
  "errors": []
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource",
    "status": 401
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

API requests are rate limited:
- **Anonymous**: 60 requests/minute
- **Authenticated**: 300 requests/minute
- **Admin**: 600 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 295
X-RateLimit-Reset: 1706713200
```

---

## Webhooks (Future)

Webhooks for external integrations (planned for future release):

| Event | Description |
|-------|-------------|
| child.created | New child profile created |
| progress.completed | Adventure completed |
| achievement.earned | Achievement unlocked |
| subscription.changed | Subscription status changed |

---

*API Version: 1.0*
*Last Updated: January 2026*
