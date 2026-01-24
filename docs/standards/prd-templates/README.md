# PRD Templates Guide

## What Are These Templates?

PRD (Product Requirements Document) templates are **platform-agnostic specifications** that you can use with ANY AI coding tool to create educational content that meets Learning Adventures platform standards.

**Key Benefit**: Copy, fill in, paste into any AI tool, and get consistent results.

---

## Available Templates

### Simple Content (HTML Files)

| Template | Use When | Output |
|----------|----------|--------|
| [Educational Game PRD](./educational-game-prd-template.md) | Creating a gamified learning experience | Single HTML game file |
| [Interactive Lesson PRD](./interactive-lesson-prd-template.md) | Creating a structured learning experience | Single HTML lesson file |
| [Course PRD](./course-prd-template.md) | Creating a multi-lesson learning path | Course structure + lesson files |

### Advanced Content (React / Platform Integration)

| Template | Use When | Output |
|----------|----------|--------|
| [React Game PRD](./react-game-prd-template.md) | Games requiring platform integration, progress tracking, TypeScript | React component + registration |

**Not sure which to use?** See [Tech Stack Decision Guide](../technical-standards/tech-stack-decision-guide.md) for help choosing.

---

## How to Use These Templates

### Step 1: Choose the Right Template

**Choose Educational Game (HTML) when:**
- Learning should feel like play
- Competition, points, or challenges are appropriate
- Content suits quick, repeatable sessions (10-20 mins)
- No platform integration needed (standalone file)
- Example: Math facts practice, vocabulary matching, science simulations

**Choose React Game when:**
- Need platform progress tracking and achievements
- Complex state management (adaptive difficulty, multi-phase)
- Using shared UI components (GameContainer, ScoreBoard)
- TypeScript type safety is important
- Example: Multi-level adventure games, achievement-based games

**Choose Interactive Lesson when:**
- Structured instruction is needed
- New concepts require explanation before practice
- Content benefits from guided learning progression
- Example: Introducing fractions, teaching grammar rules, explaining ecosystems

**Choose Course when:**
- Multiple related topics need sequencing
- Learning builds progressively over time
- XP rewards and leveling are desired
- Certification or completion tracking is important
- Example: "Introduction to Multiplication" (5-lesson course)

### Step 2: Copy the Template

Copy the entire template file content to your clipboard or a new document.

### Step 3: Fill In All Sections

Replace all placeholder text (marked with `[BRACKETS]`) with your specific content:

```markdown
## 1. Overview

- **Title**: [YOUR GAME TITLE]          →  "Fraction Pizza Party"
- **Subject**: [SUBJECT]                 →  "math"
- **Grade Level**: [GRADES]              →  "3, 4, 5"
- **Difficulty**: [easy/medium/hard]     →  "medium"
- **Estimated Time**: [X-Y mins]         →  "15-20 mins"
```

**Important**: Fill in EVERY section. Incomplete PRDs produce incomplete results.

### Step 4: Use with Your AI Tool

Paste the filled PRD into your preferred AI coding tool with this prompt structure:

```
I need you to create an educational [game/lesson] for an elementary
education platform. Please follow this PRD exactly:

[PASTE YOUR FILLED PRD HERE]

Create a complete, working HTML file with all CSS and JavaScript embedded.
No external dependencies.
```

### Step 5: Iterate

After generation, test and request specific improvements:

```
Please make these changes:
1. Add keyboard navigation for all buttons
2. Increase the font size to 18px minimum
3. Add a celebration animation when the player wins
```

---

## Template Sections Explained

### Overview Section
Basic metadata about your content. This maps directly to catalog entries.

### Learning Objectives
What students will learn. Be specific and measurable:
- ✅ "Students will identify equivalent fractions"
- ❌ "Students will understand fractions"

### Content Design
The meat of your PRD. Describes exactly what should be built:
- **For Games**: Game mechanics, scoring, levels, feedback
- **For Lessons**: Learning progression, activities, assessments
- **For Courses**: Lesson sequence, prerequisites, completion criteria

### Technical Requirements
Standard platform requirements (same across all templates):
- Single HTML file
- No external dependencies
- Mobile responsive
- Works offline

### Accessibility Requirements
WCAG 2.1 AA requirements (same across all templates):
- Keyboard navigation
- Color contrast
- Screen reader support

### Visual Design
UI/UX guidelines (same across all templates):
- Child-friendly colors
- Large touch targets
- Clear feedback

### Catalog Metadata
Pre-formatted metadata entry for catalogData.ts.

### Quality Checklist
Validation items specific to content type.

---

## Tips for Each AI Tool

### Claude (claude.ai / Claude Code)
- Paste the entire PRD in one message
- Claude handles long, detailed specifications well
- Ask for an accessibility audit after initial generation
- Request specific ARIA labels if missing

### Cursor
- Save the PRD as a context file in your project
- Reference it: "Following the PRD in context..."
- Use Composer for multi-file course generation
- Enable inline completions for faster iteration

### Bolt.new
- Paste PRD as your initial prompt
- Use the live preview to test interactions
- Good for rapid prototyping
- Export as single HTML when complete

### Lovable
- Create new project with PRD as specification
- Works well for visual design iteration
- May need manual accessibility fixes
- Export/download completed HTML

### Replit Agent
- Paste PRD to the agent chat
- Test directly in Replit's preview
- Download index.html when satisfied
- Good for testing on multiple devices

### v0 (Vercel)
- Submit PRD as design specification
- May generate React components initially
- Request conversion to single HTML file
- Verify no external dependencies in output

### Windsurf
- Use PRD in Cascade context
- Good for iterative improvements
- Handles complex logic well
- Request specific accessibility fixes

---

## Common Issues and Fixes

### Problem: AI adds external dependencies
**Fix**: Add to your prompt:
```
IMPORTANT: Do not use any external libraries, CDN links, or external fonts.
All CSS and JavaScript must be embedded in the single HTML file.
Use system fonts only.
```

### Problem: Missing keyboard navigation
**Fix**: Request specifically:
```
Add keyboard navigation:
- All buttons must be focusable with Tab
- Enter/Space should activate buttons
- Escape should close modals
- Add visible focus indicators (3px outline)
```

### Problem: Not mobile responsive
**Fix**: Request:
```
Make fully responsive:
- Use flexbox for layouts
- Add @media query for max-width: 768px
- Touch targets must be 44x44px minimum
- Test at 375px width
```

### Problem: Generated file is too large
**Fix**: Request:
```
Optimize file size:
- Remove any unused CSS
- Use CSS classes instead of inline styles
- Minimize JavaScript
- Use inline SVG instead of images where possible
Target: under 500KB, maximum 2MB
```

---

## Validation Before Submission

After generating content, validate using:
1. [Pre-Submission Checklist](../quality-assurance/pre-submission-checklist.md)
2. [Accessibility Checklist](../technical-standards/accessibility-checklist.md)
3. Browser testing (Chrome, Firefox, Safari, mobile)

---

## Examples

See existing games and lessons for reference:
- Games: `/public/games/` (e.g., `math-race-rally.html`, `planet-explorer-quest.html`)
- Lessons: `/public/lessons/`

---

*Last Updated: January 2026*
