# Tech Stack Decision Guide

## Overview

Learning Adventures supports three levels of technical complexity for educational content. This guide helps you choose the right approach based on your content's requirements.

**Key Principle**: Start simple. Only use more complex stacks when features require it.

---

## Quick Decision Flowchart

```
START: What are you building?
  │
  ├─► Standalone game/lesson for quick sharing?
  │   │
  │   └─► Does it need platform features?
  │       │
  │       ├─► NO → Use HTML (Simple)
  │       │        Template: educational-game-prd-template.md
  │       │
  │       └─► YES → Continue below...
  │
  ├─► Game needing platform features?
  │   │
  │   ├─► Progress tracking across sessions?
  │   ├─► Achievement/badge system?
  │   ├─► Complex state (adaptive difficulty)?
  │   ├─► Shared UI components?
  │   │
  │   └─► ANY YES → Use React Components (Medium)
  │                  Template: react-game-prd-template.md
  │
  └─► Multi-lesson course with progression?
      │
      ├─► XP and leveling system?
      ├─► Lesson prerequisites?
      ├─► Quiz assessments with passing scores?
      ├─► Certificates on completion?
      │
      └─► ANY YES → Use Course System (Complex)
                     Template: course-prd-template.md
```

---

## The Three Tech Stacks

### 1. Simple: Single HTML Files

**Best For:** Self-contained games and lessons without platform integration

**Characteristics:**
- Single `.html` file with embedded CSS and JavaScript
- No external dependencies
- No build process required
- Can be shared/downloaded as standalone files
- Works offline immediately

**Output Location:** `/public/games/` or `/public/lessons/`

**Catalog Entry:**
```typescript
{
  id: 'game-id',
  title: 'Game Title',
  // ... other metadata
  htmlPath: '/games/game-id.html',  // Direct path to file
}
```

**PRD Template:** [educational-game-prd-template.md](../prd-templates/educational-game-prd-template.md)

---

### 2. Medium: React Components

**Best For:** Games requiring platform integration, complex interactions, or shared components

**Characteristics:**
- TypeScript React components
- Uses platform's shared hooks and components
- Requires build process (Next.js)
- Integrated with platform's progress tracking
- Type-safe with full IDE support

**Output Location:** `/components/games/[game-name]/`

**Required Files:**
```
components/games/[game-name]/
├── GameName.tsx    # Main component
├── index.ts        # Registration
├── types.ts        # TypeScript interfaces (optional)
└── components/     # Sub-components (optional)
```

**Catalog Entry:**
```typescript
{
  id: 'game-id',
  title: 'Game Title',
  // ... other metadata
  componentGame: true,  // Required - no htmlPath
}
```

**PRD Template:** [react-game-prd-template.md](../prd-templates/react-game-prd-template.md)

---

### 3. Complex: Course System

**Best For:** Multi-lesson learning paths with XP, progression, and assessments

**Characteristics:**
- Database-backed course structure
- XP and leveling system
- Lesson prerequisites and unlocking
- Quiz assessments with passing requirements
- Progress persistence across sessions
- Optional premium access gating
- Completion certificates

**Output Components:**
- Course metadata in database
- Individual lesson files (HTML or React)
- Quiz configurations
- Enrollment and progress tracking

**PRD Template:** [course-prd-template.md](../prd-templates/course-prd-template.md)

---

## Feature Comparison Matrix

| Feature | HTML (Simple) | React (Medium) | Course System |
|---------|:-------------:|:--------------:|:-------------:|
| **Development** |
| Single file output | ✅ | ❌ | ❌ |
| No build required | ✅ | ❌ | ❌ |
| TypeScript support | ❌ | ✅ | ✅ |
| Shareable as file | ✅ | ❌ | ❌ |
| **Platform Features** |
| Progress tracking | ❌ | ✅ | ✅ |
| Shared UI components | ❌ | ✅ | ✅ |
| Achievement system | ❌ | ✅ | ✅ |
| State persistence | ❌ | ✅ | ✅ |
| **Course Features** |
| XP / Leveling | ❌ | ⚠️ Manual | ✅ |
| Lesson unlocking | ❌ | ❌ | ✅ |
| Quiz assessments | ⚠️ In-game only | ⚠️ In-game only | ✅ |
| Prerequisites | ❌ | ❌ | ✅ |
| Certificates | ❌ | ❌ | ✅ |
| Premium gating | ❌ | ❌ | ✅ |
| **Complexity** |
| Setup difficulty | Low | Medium | High |
| AI tool compatibility | All tools | Claude, Cursor | Claude recommended |
| Team skill required | Basic HTML/CSS/JS | React + TypeScript | Full-stack |

**Legend:** ✅ Full support | ⚠️ Partial/manual | ❌ Not available

---

## Detailed Decision Criteria

### Choose HTML (Simple) When:

✅ **Do use HTML when:**
- Creating quick prototypes or demos
- Building standalone games without platform features
- Content needs to be exported/shared as files
- Simple interactions (click, drag-drop, basic forms)
- No need for progress to persist between sessions
- Team members have basic HTML/CSS/JS skills
- Using AI tools that don't handle React well (Bolt, Lovable, v0)

❌ **Don't use HTML when:**
- Need to track user progress across sessions
- Want to use platform's achievement system
- Require complex state management
- Need shared styling with platform UI

**Typical Use Cases:**
- Simple math drill games
- Vocabulary flashcard activities
- Basic science simulations
- Story-based lessons
- Interactive quizzes (single session)

---

### Choose React Components (Medium) When:

✅ **Do use React when:**
- Need platform progress tracking
- Want consistent UI with shared components
- Require complex state management
- Building games with adaptive difficulty
- Need TypeScript type safety
- Creating games with multiple phases/modes
- Want real-time updates or animations
- Using Claude Code or Cursor

❌ **Don't use React when:**
- Content needs to be shared as standalone files
- Team lacks React/TypeScript experience
- Using AI tools that don't generate React well
- Simple games that don't need platform features

**Typical Use Cases:**
- Multi-level adventure games
- Adaptive learning games
- Games with achievement badges
- Interactive simulations
- Timed challenges with leaderboards

---

### Choose Course System (Complex) When:

✅ **Do use Course System when:**
- Building multi-lesson learning paths
- Need sequential lesson unlocking
- Want XP rewards and level progression
- Requiring quiz assessments with passing scores
- Tracking detailed progress per lesson
- Issuing completion certificates
- Gating content for premium users
- Creating prerequisite chains

❌ **Don't use Course System when:**
- Single standalone game or lesson
- No need for lesson sequencing
- Don't need XP/leveling features
- Quick prototype or demo
- Team unfamiliar with database concepts

**Typical Use Cases:**
- "Multiplication Mastery" 5-lesson course
- "Solar System Explorer" learning path
- "Grammar Fundamentals" with quizzes
- Certification programs
- Premium educational tracks

---

## AI Tool Recommendations by Stack

### For HTML (Simple)

| Tool | Compatibility | Notes |
|------|:-------------:|-------|
| Claude | ⭐⭐⭐⭐⭐ | Excellent for detailed HTML |
| Cursor | ⭐⭐⭐⭐⭐ | Great with file context |
| Bolt.new | ⭐⭐⭐⭐⭐ | Live preview helpful |
| Lovable | ⭐⭐⭐⭐ | Good but verify accessibility |
| Replit | ⭐⭐⭐⭐ | Easy testing environment |
| v0 | ⭐⭐⭐ | May need conversion from React |
| Windsurf | ⭐⭐⭐⭐ | Good context handling |

**Prompt Keywords:**
```
"Create a single HTML file with embedded CSS and JavaScript"
"No external dependencies"
"No React, no npm packages"
```

---

### For React Components (Medium)

| Tool | Compatibility | Notes |
|------|:-------------:|-------|
| Claude Code | ⭐⭐⭐⭐⭐ | Best for React + platform integration |
| Cursor | ⭐⭐⭐⭐⭐ | Excellent with project context |
| v0 | ⭐⭐⭐⭐ | Good React but may need adjustments |
| Bolt.new | ⭐⭐⭐ | Can do React but simpler is better |
| Lovable | ⭐⭐⭐ | May add unwanted dependencies |
| Replit | ⭐⭐⭐ | Works but needs manual setup |
| Windsurf | ⭐⭐⭐⭐ | Good for iterative development |

**Prompt Keywords:**
```
"Create a React component with TypeScript"
"Use Tailwind CSS"
"Import shared components from @/components/games/shared"
"Use useGameState and useGameTimer hooks"
"Accept GameProps: onExit, onComplete, onProgress"
```

---

### For Course System (Complex)

| Tool | Compatibility | Notes |
|------|:-------------:|-------|
| Claude Code | ⭐⭐⭐⭐⭐ | Best understanding of system |
| Cursor | ⭐⭐⭐⭐ | Good with full project context |
| Windsurf | ⭐⭐⭐ | May need detailed guidance |
| Others | ⭐⭐ | Recommend Claude Code instead |

**Prompt Keywords:**
```
"Follow the course-builder skill"
"Create course with XP system"
"Design lesson sequence with unlock conditions"
"Include quiz assessments"
```

---

## Migration Paths

### HTML → React

When a simple HTML game needs platform features:

1. Extract game logic into TypeScript
2. Convert DOM manipulation to React state
3. Wrap in GameContainer
4. Add useGameState for score/lives
5. Register with createGameRegistration
6. Update catalog entry (add `componentGame: true`, remove `htmlPath`)

### Standalone Game → Course

When multiple games should become a course:

1. Plan lesson sequence and XP distribution
2. Keep existing games (HTML or React)
3. Create course metadata in database
4. Define unlock conditions
5. Add quizzes between games
6. Configure certificate on completion

---

## Quick Reference Card

### Deciding Factors

| Question | HTML | React | Course |
|----------|:----:|:-----:|:------:|
| Shareable as file? | ✅ | ❌ | ❌ |
| Track progress? | ❌ | ✅ | ✅ |
| Multiple lessons? | ❌ | ❌ | ✅ |
| XP rewards? | ❌ | ⚠️ | ✅ |
| Team has React skills? | N/A | Required | Required |

### File Locations

| Stack | Location |
|-------|----------|
| HTML | `/public/games/` or `/public/lessons/` |
| React | `/components/games/[game-name]/` |
| Course | Multiple locations + database |

### Catalog Metadata

| Stack | Key Fields |
|-------|------------|
| HTML | `htmlPath: '/games/name.html'` |
| React | `componentGame: true` |
| Course | Managed in database |

---

## Examples

### Example 1: Simple Multiplication Drill

**Requirements:**
- Flash card style practice
- No progress tracking needed
- Team wants to share with other schools

**Decision:** Use **HTML (Simple)**
- Self-contained file
- Easy to share
- Quick to build

---

### Example 2: Space Adventure Math Game

**Requirements:**
- Multi-level progression
- Track high scores
- Award badges for achievements
- Adaptive difficulty

**Decision:** Use **React (Medium)**
- Needs progress tracking
- Achievement system
- Complex state management

---

### Example 3: Fraction Fundamentals Course

**Requirements:**
- 5 lessons building on each other
- Quiz after each lesson
- Students must pass to continue
- Certificate on completion
- XP rewards for motivation

**Decision:** Use **Course System (Complex)**
- Multi-lesson structure
- Assessment requirements
- Certificate functionality
- Full progression tracking

---

## Summary Cheat Sheet

```
┌─────────────────────────────────────────────────────────────┐
│                    CHOOSING YOUR STACK                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Quick & Simple?          → HTML                            │
│                                                             │
│  Platform Features?       → React                           │
│                                                             │
│  Multi-Lesson Path?       → Course System                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  When in doubt:                                             │
│  1. Start with HTML                                         │
│  2. Upgrade to React if you need platform features          │
│  3. Use Course System only for structured learning paths    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Last Updated: January 2026*
