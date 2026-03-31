# Child Account System

This document describes the COPPA-compliant child account system for the Learning Adventures platform.

---

## Overview

The child account system allows parents to create and manage learning accounts for their children without requiring children to have email addresses. This design ensures compliance with COPPA (Children's Online Privacy Protection Act) requirements.

---

## Architecture

### Two-Tier Authentication

The platform uses two separate authentication systems:

1. **Adult Authentication (NextAuth.js)**
   - For Parents, Teachers, and Admins
   - Uses email + password, Google OAuth, or Apple OAuth
   - Standard JWT-based sessions

2. **Child Authentication (Custom)**
   - For children under 13
   - Uses username + 4-digit PIN
   - Custom JWT sessions with separate cookie
   - No email required

### Database Models

```prisma
// Parent-managed child accounts
model ChildProfile {
  id            String   @id
  parentId      String   // Links to parent User
  displayName   String   // Parent's nickname for child
  username      String   @unique  // Auto-generated (e.g., "BraveEagle42")
  authCode      String   // Hashed 4-digit PIN
  gradeLevel    String   // K, 1, 2, ... 12
  avatarId      String   // Selected avatar
  sessions      ChildSession[]
}

// Separate session tracking for children
model ChildSession {
  id            String   @id
  childId       String
  sessionToken  String   @unique
  expires       DateTime
}
```

---

## User Flows

### Parent Flow

1. **Sign Up** as Parent (email + password or OAuth)
2. **Verify Identity** (COPPA requirement)
3. **Add Children** at `/parent/children`
   - Enter display name, grade level, avatar
   - Create 4-digit PIN
   - System generates unique username
4. **Share Credentials** with child
   - Username (e.g., "BraveEagle42")
   - PIN (4 digits)
5. **Monitor Progress** at `/parent/dashboard`

### Child Flow

1. Go to `/child/login`
2. Enter username and 4-digit PIN
3. Access `/child/dashboard`
4. Browse and play adventures
5. Session expires after 4 hours

---

## API Endpoints

### Parent Child Management

| Method | Endpoint                    | Description                             |
| ------ | --------------------------- | --------------------------------------- |
| GET    | `/api/parent/children`      | List all children for parent            |
| POST   | `/api/parent/children`      | Create new child account                |
| GET    | `/api/parent/children/[id]` | Get child details                       |
| PUT    | `/api/parent/children/[id]` | Update child (name, grade, avatar, PIN) |
| DELETE | `/api/parent/children/[id]` | Delete child account                    |

### Child Authentication

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/child/login`   | Authenticate with username + PIN |
| POST   | `/api/child/logout`  | End child session                |
| GET    | `/api/child/session` | Get current child session info   |

### Parent Verification

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| POST   | `/api/parent/verify` | Mark parent as verified adult |
| GET    | `/api/parent/verify` | Check verification status     |

---

## Security Features

### COPPA Compliance

- **No child email**: Children don't need email addresses
- **Parent verification**: Parents must verify before adding children
- **Parental control**: Parents manage all child account settings
- **Anonymous usernames**: Auto-generated usernames (e.g., "BraveEagle42")
- **No PII collection**: Only display name (chosen by parent) is stored

### Authentication Security

- **PIN hashing**: 4-digit PINs are hashed with bcrypt
- **JWT sessions**: Signed tokens with 4-hour expiration
- **HTTP-only cookies**: Session tokens stored in HTTP-only cookies
- **Database sessions**: Sessions tracked in database for revocation

### Route Protection

The middleware protects routes based on authentication type:

- `/parent/*` - Requires parent/admin NextAuth session
- `/child/dashboard` - Requires child session cookie
- `/child/login` - Public (redirects if already logged in)

---

## Username Generation

Usernames are auto-generated in the format: `AdjectiveAnimal##`

Examples:

- BraveEagle42
- HappyDolphin17
- CleverFox03

Components:

- 24 adjectives (Brave, Happy, Clever, Swift, etc.)
- 24 animals (Eagle, Dolphin, Fox, Tiger, etc.)
- 2-digit number (00-99)

Total combinations: 24 × 24 × 100 = 57,600 unique usernames

---

## Available Avatars

Children can choose from 16 avatars:

| ID      | Emoji | Name    |
| ------- | ----- | ------- |
| tiger   | 🐯    | Tiger   |
| dragon  | 🐉    | Dragon  |
| eagle   | 🦅    | Eagle   |
| dolphin | 🐬    | Dolphin |
| fox     | 🦊    | Fox     |
| lion    | 🦁    | Lion    |
| bear    | 🐻    | Bear    |
| wolf    | 🐺    | Wolf    |
| panda   | 🐼    | Panda   |
| owl     | 🦉    | Owl     |
| phoenix | 🔥    | Phoenix |
| turtle  | 🐢    | Turtle  |
| penguin | 🐧    | Penguin |
| koala   | 🐨    | Koala   |
| cheetah | 🐆    | Cheetah |
| rocket  | 🚀    | Rocket  |

---

## Environment Variables

```bash
# Required for child sessions
CHILD_SESSION_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
```

---

## Pages

| Path                 | Description                         |
| -------------------- | ----------------------------------- |
| `/parent/children`   | Manage children (add, edit, delete) |
| `/parent/dashboard`  | View all children's progress        |
| `/parent/child/[id]` | Detailed progress for one child     |
| `/child/login`       | Child login page (username + PIN)   |
| `/child/dashboard`   | Child's learning dashboard          |

---

## Future Enhancements

### Progress Tracking for Children

Currently, the `ChildProfile` model is separate from the `User` model. To add full progress tracking:

1. Link `ChildProfile` to `UserProgress` and `UserAchievement`
2. Or create parallel `ChildProgress` and `ChildAchievement` models
3. Update the child dashboard to show real progress

### Production Parent Verification

The current verification is a mock. For production, implement:

- **Stripe Identity**: Document verification
- **Credit Card Micro-charge**: $0.30 verification charge
- **Knowledge-Based Verification**: Questions only a parent would know

### Session Management

- Add "Sign out all devices" for parents
- Implement session refresh for longer play sessions
- Add activity logging for parental monitoring

---

_Last updated: January 2026_
