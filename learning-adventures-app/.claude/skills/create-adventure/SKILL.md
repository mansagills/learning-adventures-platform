---
name: create-adventure
description: Creates a new educational game or lesson for the Learning Adventures Platform. Follows the platform's 9-step workflow: read prompt templates, study existing patterns, build a self-contained HTML file, save to the correct directory, and register in test-games.md. Does NOT add to catalogData.ts until testing is confirmed complete.
---

# Create Adventure Skill

You are helping create a new educational game or lesson for the Learning Adventures Platform.

## Step-by-Step Workflow

### 1. Gather Requirements
Ask the user (if not already specified):
- Type: **game** or **lesson**
- Subject: math / science / english / history / interdisciplinary
- Grade level: K-2 / 3-5 / 6-8 / 9-12
- Topic/concept to teach
- Tier: free / premium / course / custom (default: free)

### 2. Read Prompt Templates
Read the appropriate template to understand quality standards:
- Games: `/final-content/interactive-game-prompts.txt`
- Lessons: `/final-content/interactive-learning-prompts.txt`

Note: These files are in the parent directory `/Users/mansagills/Documents/GitHub/learning-adventures-platform/final-content/`

### 3. Study Existing Patterns
Read 2-3 existing HTML files from the target directory to understand established design patterns:
- `public/games/free/` — existing free games
- `public/lessons/free/` — existing free lessons

Look for: color schemes, UI components, feedback patterns, progress tracking approaches.

### 4. Build the HTML File
Create a single self-contained HTML file with:
- Embedded CSS (no external stylesheets)
- Embedded JavaScript (no external scripts beyond trusted CDNs like cdn.jsdelivr.net)
- Child-friendly, colorful, encouraging design
- Clear learning objective
- Interactive elements with immediate feedback
- Score or progress tracking
- Mobile-responsive layout
- 70% entertainment / 30% obvious learning balance (for games)
- Progressive scaffolding (for lessons)

File naming: `[subject]-[topic]-[type].html` (e.g., `math-fractions-game.html`, `science-cells-lesson.html`)

### 5. Save the File
Save to the correct directory based on type and tier:
- Free game: `public/games/free/[filename].html`
- Free lesson: `public/lessons/free/[filename].html`
- Premium game: `public/games/premium/[filename].html`
- etc.

### 6. Register in Test Games
Add an entry to `docs/test-games.md` with:
- Game/lesson title
- Direct URL: `http://localhost:3000/games/free/[filename].html` or `http://localhost:3000/lessons/free/[filename].html`
- Grade level and subject
- Status: NEEDS_TESTING

### 7. Output Summary
Tell the user:
- File saved at: [path]
- Test URL: [url]
- Next step: Start dev server (`npm run dev`) and test at the URL
- When ready to publish: Add to `lib/catalogData.ts` with metadata

## Key Rules
- NEVER add to `lib/catalogData.ts` automatically — that step requires user testing and approval
- Always read existing examples before building to maintain visual consistency
- Files must work as standalone HTML — no server-side dependencies
- No external fonts or images that could fail; use emoji and CSS shapes for visuals
