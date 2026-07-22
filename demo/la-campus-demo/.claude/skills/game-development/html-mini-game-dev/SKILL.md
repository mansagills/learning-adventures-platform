---
name: html-mini-game-dev
description: HTML mini-game development for Learning Adventures. Use when creating, iterating on, or importing a standalone HTML educational game — including games drafted in Sorceress and refined here. Chains game-designer agent (design) → game-developer agent (implementation) → create-adventure skill (save + register).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# HTML Mini-Game Development

> Platform-specific skill for Learning Adventures' standalone HTML educational games in `public/games/`.
> Sub-skill of `game-development`. Also consult `game-development/web-games` and `game-development/game-design`.

---

## Three Entry Points

| How you're starting | Go to |
|---------------------|-------|
| New game idea from scratch | Step 1: Design Phase |
| Imported rough draft from Sorceress | Step 3: Refine Sorceress Draft |
| Iterating/fixing an existing game | Step 4: Implementation |

---

## Step 1: Design Phase — Invoke `game-designer` Agent

Before writing any code, invoke the `game-designer` agent to define:

- **Learning objective** — what specific skill/concept does this teach?
- **Target grade level** — K-2 / 3-5 / 6-8 / 9-12
- **Core loop** — the 30-second action → feedback → reward cycle
- **Difficulty curve** — how does challenge progress across the session?
- **Educational feedback** — how does the game reinforce correct answers?
- **70/30 balance** — is it 70% fun / 30% obvious learning?

Output from game-designer: a mini GDD (1 page) with mechanics spec and progression notes.

---

## Step 2: Template & Pattern Research

Read 2-3 existing games from `public/games/free/` to understand established patterns before building. Look for:
- Color schemes and UI components
- How feedback (correct/incorrect) is shown
- Score and progress tracking approach
- Mobile responsiveness patterns

Also read the game prompt template:
`/Users/mansagills/Documents/GitHub/learning-adventures-platform/final-content/interactive-game-prompts.txt`

---

## Step 3: Refine Sorceress Draft (if applicable)

If starting from a Sorceress-exported HTML file:

1. Read the exported file fully before touching it
2. Check against the game-designer spec — does the core loop match?
3. Identify gaps: missing feedback, no progress tracking, non-mobile layout, etc.
4. Invoke `game-developer` agent to implement fixes systematically
5. Ensure it meets the platform's HTML file standards (see Step 4)

**Common Sorceress draft issues to fix:**
- External asset URLs that may break (replace with CSS/emoji/inline SVG)
- Missing score or progress tracking
- No mobile-responsive layout
- Non-educational feedback (just right/wrong, no explanation)
- Missing educational objective display

---

## Step 4: Implementation — Invoke `game-developer` Agent

Invoke `game-developer` for the build phase. The game must be:

### File Requirements
- Single self-contained HTML file
- All CSS embedded in `<style>` tags
- All JS embedded in `<script>` tags
- No external stylesheets or scripts (exception: CDN libraries from cdn.jsdelivr.net only)
- No server-side dependencies — must work as a static file

### Design Standards
- Child-friendly, colorful, encouraging tone
- Clear learning objective visible to player
- Immediate feedback on every interaction
- Progress indicator (score, stars, level, percentage)
- Mobile-responsive layout (works on tablet/phone)
- Accessible: keyboard navigable, sufficient color contrast

### Vanilla JS Patterns

```javascript
// Game state — keep it simple
const state = {
  score: 0,
  level: 1,
  currentQuestion: null,
  totalQuestions: 10,
  answered: 0
};

// Question generation
function generateQuestion() {
  // Generate level-appropriate content
}

// Feedback display
function showFeedback(correct, explanation) {
  const feedback = document.getElementById('feedback');
  feedback.className = correct ? 'feedback correct' : 'feedback incorrect';
  feedback.textContent = correct
    ? `Correct! ${explanation}`
    : `Not quite. ${explanation}`;
  feedback.style.display = 'block';
}

// Progress update
function updateProgress() {
  document.getElementById('score').textContent = state.score;
  const pct = (state.answered / state.totalQuestions) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}
```

### CSS Pattern

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.game-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.feedback.correct { background: #d4edda; color: #155724; border-radius: 10px; padding: 10px; }
.feedback.incorrect { background: #f8d7da; color: #721c24; border-radius: 10px; padding: 10px; }
```

---

## Step 5: Testing Loop

Use the `develop-web-game` skill's Playwright testing approach for interactive validation:

1. Start dev server: `cd learning-adventures-app && npm run dev`
2. Test at: `http://localhost:3000/games/free/[filename].html`
3. Verify: game loads, interactions work, score tracks, mobile layout holds
4. Check browser console for errors

Manual test checklist:
- [ ] Game loads without errors
- [ ] Core interaction works (click/keyboard input)
- [ ] Correct answers give positive feedback with explanation
- [ ] Incorrect answers give constructive feedback
- [ ] Score/progress updates correctly
- [ ] Game ends gracefully (win state or completion)
- [ ] Works on mobile viewport (375px wide)
- [ ] No external assets that could fail to load

---

## Step 6: Save and Register

Follow the `create-adventure` skill for saving and registration:

**Save location:**
- Free game: `public/games/free/[subject]-[topic]-game.html`
- Premium game: `public/games/premium/[subject]-[topic]-game.html`

**Naming:** `[subject]-[topic]-[type].html`
- Examples: `math-fractions-game.html`, `science-cells-lesson.html`

**Register in test-games.md** (NOT catalogData.ts yet):
```
| Title | URL | Grade | Subject | Status |
|-------|-----|-------|---------|--------|
| Fraction Frenzy | http://localhost:3000/games/free/math-fractions-game.html | 3-5 | Math | NEEDS_TESTING |
```

**NEVER add to `lib/catalogData.ts` automatically.** That step requires user testing and approval.

---

## Catalog Integration (User-Approved Only)

When the user confirms testing is complete and approves publishing:

```typescript
// In lib/catalogData.ts
export const mathGames = [
  {
    id: 'math-fractions-game',
    title: 'Fraction Frenzy',
    description: 'Master fractions through fast-paced matching challenges',
    type: 'game',
    category: 'math',
    gradeLevel: '3-5',
    difficulty: 'intermediate',
    skills: ['fractions', 'number-sense'],
    estimatedTime: '15 min',
    featured: false,
    htmlPath: '/games/free/math-fractions-game.html'
  }
];
```

---

> Sub-skills to also consult: `game-development/web-games` (browser constraints, audio), `game-development/game-design` (core loop, difficulty balancing, player psychology).
> Related skills: `create-adventure` (full 9-step workflow), `develop-web-game` (Playwright testing loop).
