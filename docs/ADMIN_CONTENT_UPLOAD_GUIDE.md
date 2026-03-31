# Admin Content Upload Guide

This guide explains how team members can upload games and courses to the Learning Adventures platform.

---

## Table of Contents

1. [Getting Admin Access](#getting-admin-access)
2. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
3. [Uploading Content](#uploading-content)
4. [ZIP File Formats](#zip-file-formats)
5. [Review & Approval Process](#review--approval-process)
6. [Promoting to Production](#promoting-to-production)
7. [Switching Between Views](#switching-between-views)

---

## Getting Admin Access

### Automatic Admin Access

Any team member with a `@learningadventures.org` email address automatically receives Admin privileges when they sign in:

1. Go to the Learning Adventures platform
2. Click **Sign In** or **Sign Up**
3. Use your `@learningadventures.org` email (Google OAuth or email/password)
4. You'll be automatically redirected to the Admin Dashboard

### Manual Admin Assignment

For team members without a `@learningadventures.org` email, an existing admin can manually assign the ADMIN role via the database.

---

## Accessing the Admin Dashboard

### After Login

When you log in with an `@learningadventures.org` email, you're automatically redirected to `/internal` (the Admin Dashboard).

### From the Main Platform

If you're browsing the main platform as a user, you can switch to the Admin Dashboard:

1. Look for the **Admin** button in the header (purple gradient button with a settings icon)
2. Click it to go to the Admin Dashboard

### Direct URL

You can also navigate directly to: `https://[your-domain]/internal`

---

## Uploading Content

### Step 1: Go to Content Upload

1. From the Admin Dashboard, click **Content Upload** in the left sidebar
2. Or navigate directly to `/internal/content-upload`

### Step 2: Prepare Your ZIP File

Package your game or course as a ZIP file (see [ZIP File Formats](#zip-file-formats) below).

### Step 3: Upload

1. Drag and drop your ZIP file onto the upload zone
2. Or click **Choose Files** to browse
3. Wait for the upload to complete

### Step 4: Review the Result

After upload, you'll see a success message with:

- The type detected (game or course)
- The staging path where files are stored
- A link to the Testing page for review

> **Note:** Uploaded content goes to **staging** first, not directly to production. It must be reviewed and approved before users can see it.

---

## ZIP File Formats

### Game ZIP Format

For uploading a single game:

```
my-game.zip
├── metadata.json      (required)
└── game.html          (required - the game file)
```

**metadata.json structure:**

```json
{
  "id": "my-awesome-game",
  "title": "My Awesome Game",
  "description": "A fun educational game about multiplication.",
  "category": "math",
  "type": "game",
  "gradeLevel": ["3", "4", "5"],
  "difficulty": "medium",
  "skills": ["multiplication", "problem-solving"],
  "estimatedTime": "10-15 mins",
  "gameFile": "game.html"
}
```

**Field Reference:**

| Field           | Required | Description                                                           |
| --------------- | -------- | --------------------------------------------------------------------- |
| `id`            | No       | Unique identifier (auto-generated from title if not provided)         |
| `title`         | Yes      | Display name of the game                                              |
| `description`   | Yes      | Brief description for the catalog                                     |
| `category`      | Yes      | Subject: `math`, `science`, `english`, `history`, `interdisciplinary` |
| `type`          | Yes      | `game` or `lesson`                                                    |
| `gradeLevel`    | Yes      | Array of grade levels: `["K", "1", "2", ...]`                         |
| `difficulty`    | Yes      | `easy`, `medium`, or `hard`                                           |
| `skills`        | Yes      | Array of learning skills/objectives                                   |
| `estimatedTime` | Yes      | Approximate completion time                                           |
| `gameFile`      | Yes      | Name of the HTML file in the ZIP                                      |

---

### Course ZIP Format

For uploading a multi-lesson course:

```
my-course.zip
├── metadata.json      (required)
├── lesson-1.html      (lesson file)
├── lesson-2.html      (lesson file)
├── lesson-3.html      (lesson file)
└── thumbnail.png      (optional)
```

**metadata.json structure:**

```json
{
  "title": "Introduction to Fractions",
  "slug": "intro-to-fractions",
  "description": "A comprehensive course teaching fraction fundamentals.",
  "subject": "math",
  "gradeLevel": ["3", "4", "5"],
  "difficulty": "beginner",
  "isPremium": false,
  "estimatedMinutes": 120,
  "totalXP": 500,
  "thumbnail": "thumbnail.png",
  "lessons": [
    {
      "order": 1,
      "title": "What are Fractions?",
      "description": "Introduction to the concept of fractions",
      "type": "interactive",
      "file": "lesson-1.html",
      "duration": 15,
      "xpReward": 50
    },
    {
      "order": 2,
      "title": "Parts of a Fraction",
      "description": "Understanding numerators and denominators",
      "type": "interactive",
      "file": "lesson-2.html",
      "duration": 20,
      "xpReward": 75
    },
    {
      "order": 3,
      "title": "Fraction Quiz",
      "type": "quiz",
      "file": "lesson-3.html",
      "duration": 10,
      "xpReward": 100,
      "requiredScore": 70
    }
  ]
}
```

**Lesson Types:**

- `interactive` - Interactive HTML lesson
- `video` - Video content
- `quiz` - Assessment/quiz
- `game` - Practice game
- `reading` - Text-based content
- `project` - Final project

---

## Review & Approval Process

### Step 1: Access the Testing Page

1. From the Admin Dashboard, click **Testing** in the left sidebar
2. Or navigate to `/internal/testing`

### Step 2: Select Content to Review

- Use the **Games** or **Courses** tab to switch between content types
- Filter by status: `NOT_TESTED`, `IN_TESTING`, `APPROVED`, etc.
- Click on an item to see its details

### Step 3: Preview the Content

**Inline Preview:**

- Click the **Preview Game** or **Preview Course** button to see an embedded preview

**Staging URL:**

- Click **Open Staging URL** to preview in a new tab
- Games: `/staging/games/[game-id]`
- Courses: `/staging/courses/[course-slug]`

### Step 4: Submit Your Review

1. Click **Approve/Review**
2. Select your decision:
   - **Approve** - Content is ready for production
   - **Request Changes** - Content needs modifications
   - **Reject** - Content is not suitable
3. Check the quality criteria:
   - Educational/Curriculum Quality
   - Technical Quality
   - Accessibility Compliant
   - Age Appropriate
4. Rate the engagement level (1-5 stars)
5. Add notes explaining your decision
6. Click **Submit Review**

### Step 5: Add Feedback (Optional)

Use the **Add Feedback** button to leave detailed notes:

- Bug reports
- Suggestions
- Content errors
- Accessibility issues
- For courses: specify which lesson the feedback relates to

---

## Promoting to Production

Once content is **APPROVED**, it can be promoted to production:

### For Games

1. Find the approved game in the Testing page
2. Click **Promote to Catalog**
3. Confirm the action
4. The game will be:
   - Moved from `/staging/games/` to `/public/games/`
   - Added to the catalog data
   - Visible to all users

### For Courses

1. Find the approved course in the Testing page
2. Click **Promote to Production**
3. Confirm the action
4. The course will be:
   - Moved from staging to production paths
   - Added to the Course database
   - Available for student enrollment

---

## Switching Between Views

### Admin Dashboard → Main Platform

- Click the **User View** button in the top-right header
- Or navigate to `/dashboard`

### Main Platform → Admin Dashboard

- Click the **Admin** button in the header (purple gradient)
- Or navigate to `/internal`

---

## Status Reference

| Status           | Meaning                                 |
| ---------------- | --------------------------------------- |
| `NOT_TESTED`     | Just uploaded, hasn't been reviewed yet |
| `IN_TESTING`     | Currently being reviewed by the team    |
| `APPROVED`       | Passed review, ready for production     |
| `NEEDS_REVISION` | Changes requested before approval       |
| `REJECTED`       | Not suitable for the platform           |

---

## Troubleshooting

### "Unauthorized" Error

- Make sure you're logged in with an `@learningadventures.org` email
- Or request ADMIN role assignment from another admin

### Upload Failed

- Check that your ZIP file follows the correct format
- Ensure `metadata.json` is valid JSON
- Verify all referenced files exist in the ZIP

### Can't See Content in Testing

- Check the status filter - you might be filtering by a different status
- Make sure you're on the correct tab (Games vs Courses)

---

## Questions?

Contact the platform team if you have questions about:

- Getting admin access
- ZIP file formatting
- Review criteria
- Technical issues

---

_Last updated: January 2026_
