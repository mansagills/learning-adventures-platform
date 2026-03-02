# Demo Accounts for Presentations

This document contains login credentials for demonstrating the Learning Adventures platform to investors, grant reviewers, and potential partners.

---

## Quick Start

**Platform URL**: `http://localhost:3000` (development) or your production URL

---

## Demo Accounts (Recommended for Presentations)

All demo accounts use the password: `demo2024`

### Parent Demo

- **Email**: `demo.parent@learningadventures.io`
- **Password**: `demo2024`
- **Features to show**:
  - Parent Dashboard (`/parent/dashboard`)
  - Manage Children (`/parent/children`)
  - Progress monitoring for children
  - Premium subscription features

### Teacher Demo

- **Email**: `demo.teacher@learningadventures.io`
- **Password**: `demo2024`
- **Features to show**:
  - Teacher Classroom (`/teacher/classroom`)
  - Student progress oversight
  - Class management features

### Admin Demo

- **Email**: `demo.admin@learningadventures.io`
- **Password**: `demo2024`
- **Features to show**:
  - Admin Panel (`/internal`)
  - Content Upload System
  - Content Testing/Approval Workflow
  - AI Agent Studio (Gemini integration)

---

## Child Login Demo

Child accounts use username + 4-digit PIN (no email required - COPPA compliant)

**Login URL**: `/child/login`

| Child | Username     | PIN    | Details                |
| ----- | ------------ | ------ | ---------------------- |
| Emma  | `DemoChild1` | `1234` | Grade 3, Fox avatar    |
| Liam  | `DemoChild2` | `1234` | Grade 5, Dragon avatar |

### Child Demo Flow

1. Go to `/child/login`
2. Enter username (e.g., `DemoChild1`)
3. Enter PIN: `1234`
4. Shows child-friendly dashboard
5. Browse adventures by subject
6. Exit logs out safely

---

## Development Test Accounts

For internal testing (password: `password123`)

| Role    | Email              | Use Case                             |
| ------- | ------------------ | ------------------------------------ |
| Student | `student@test.com` | Student dashboard, progress tracking |
| Teacher | `teacher@test.com` | Teacher features, classroom          |
| Parent  | `parent@test.com`  | Parent features (not verified)       |
| Admin   | `admin@test.com`   | Admin features                       |

---

## Demo Walkthrough Script

### For Investors (5-minute demo)

1. **Start at homepage** - Show catalog with 85+ adventures
2. **Login as Demo Parent** - Show parent dashboard, children listed
3. **Show Child Login** - Quick demo of child-friendly login (DemoChild1/1234)
4. **Browse Catalog** - Show subject categories, game/lesson variety
5. **Play a game** - Quick demo of an HTML game
6. **Show Admin Panel** - Content upload and AI Studio (if time permits)

### For Grant Reviewers (10-minute demo)

1. **Platform overview** - Homepage, catalog browsing
2. **Role-based access** - Show all 4 user types
3. **COPPA compliance** - Child account flow (no email required)
4. **Progress tracking** - Achievements, XP, streaks
5. **Content management** - Admin upload and approval workflow
6. **Scalability** - AI content creation tools

---

## Resetting Demo Data

To reset all demo accounts to fresh state:

```bash
cd learning-adventures-app
npm run db:seed
```

This will:

- Reset all test and demo accounts
- Clear progress data
- Re-create demo children
- Reset subscriptions

---

## Troubleshooting

**"Invalid credentials" error**

- Ensure database is seeded: `npm run db:seed`
- Check PostgreSQL is running: `brew services start postgresql@14`

**Child login not working**

- Verify parent is verified: Demo parent is pre-verified
- Check username case sensitivity: Use exact username (e.g., `DemoChild1`)

**Admin panel not showing**

- Only visible to ADMIN role users
- Login with demo.admin@learningadventures.io

---

_Last updated: January 2026_
