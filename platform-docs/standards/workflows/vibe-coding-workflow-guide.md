# Cross-Platform Vibe Coding Workflow Guide

## Overview

This guide enables any team member to create Learning Adventures content using ANY AI coding tool while maintaining platform standards. Whether you use Claude, Cursor, Bolt, Lovable, Replit, v0, or any other tool, following this workflow ensures consistent, high-quality output.

**Key Principle**: The PRD template is your source of truth. Fill it out completely, and any AI tool can produce compliant content.

> **Building React games or courses?** This guide covers HTML-based content. For platform-integrated content, see [Advanced Content Workflow](./advanced-content-workflow.md).

---

## The Universal Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: PLAN                                               │
│  Choose content type, gather requirements                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: FILL PRD                                           │
│  Complete the appropriate PRD template                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: GENERATE                                           │
│  Use any AI tool with your filled PRD                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: ITERATE                                            │
│  Test, refine, request fixes                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: VALIDATE                                           │
│  Complete pre-submission checklist                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: INTEGRATE                                          │
│  Add to platform (files + metadata)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Plan

### Choose Your Content Type

| If you need... | Create a... | Use Template |
|----------------|-------------|--------------|
| Gamified skill practice | Educational Game | `educational-game-prd-template.md` |
| Instructional content with learning | Interactive Lesson | `interactive-lesson-prd-template.md` |
| Multi-lesson learning path | Course | `course-prd-template.md` |

### Gather Requirements

Before filling out the PRD, know:
- **Subject area** (math, science, english, history, interdisciplinary)
- **Target grade levels** (K-2, 3-4, 5-6)
- **Learning objectives** (what students will learn)
- **Time estimate** (how long to complete)
- **Specific content** (the actual problems, questions, facts)

---

## Step 2: Fill the PRD Template

### Get the Template

1. Navigate to `/docs/standards/prd-templates/`
2. Copy the appropriate template
3. Create a new file or paste into a document

### Fill Every Section

**Critical sections to complete:**

1. **Overview** - Title, subject, grades, difficulty, time
2. **Learning Objectives** - Primary and supporting objectives
3. **Content Design** - Game mechanics OR lesson structure
4. **Educational Content** - Actual problems, questions, facts
5. **Visual Design** - Theme, colors, style
6. **Catalog Metadata** - Pre-formatted for catalogData.ts

### PRD Filling Tips

- **Be specific**: "Add fractions with denominators 2, 4, 8" not "Add fractions"
- **Include examples**: Provide 5-10 actual content examples
- **Define difficulty**: Easy/medium/hard with specific criteria
- **Describe feedback**: What happens on correct/incorrect answers

---

## Step 3: Generate with AI Tool

### Universal Prompt Structure

```
I need you to create an educational [game/lesson] for an elementary
education platform. Please follow this PRD exactly:

[PASTE YOUR COMPLETE FILLED PRD HERE]

CRITICAL REQUIREMENTS:
1. Create a SINGLE HTML file with all CSS and JavaScript embedded
2. Do NOT use any external dependencies:
   - No CDN links (Bootstrap, jQuery, Tailwind, etc.)
   - No external fonts (Google Fonts, etc.)
   - No external images (use inline SVG or CSS shapes)
   - No external JavaScript libraries
3. The file must work completely offline
4. Include full keyboard accessibility
5. Make it mobile responsive

Please generate the complete HTML file.
```

### Tool-Specific Instructions

#### Claude (claude.ai or Claude Code)

**Strengths**: Handles long, detailed PRDs well; excellent for complex logic

**Best Practices:**
1. Paste the entire PRD in one message
2. Be explicit about requirements
3. Ask for accessibility audit after generation:
   ```
   Please review the code for accessibility:
   - Keyboard navigation
   - ARIA labels
   - Color contrast
   - Focus indicators
   ```

**Example prompt suffix:**
```
After generating, please list any accessibility considerations
I should verify.
```

---

#### Cursor

**Strengths**: Integrated development; good for iteration

**Best Practices:**
1. Save your PRD as a file in the project (e.g., `prd.md`)
2. Reference it in prompts: "Following the PRD in prd.md..."
3. Use Composer for initial generation
4. Use inline edits for refinements

**Setup:**
```
1. Create new folder: learning-adventures-content/
2. Save PRD as: prd.md
3. Open Cursor in this folder
4. Use Composer: "Create game.html following prd.md"
```

---

#### Bolt.new

**Strengths**: Fast prototyping; live preview

**Best Practices:**
1. Paste PRD as your initial prompt
2. Use the live preview to test interactions immediately
3. Iterate in conversation: "Make the buttons larger"
4. Export as single HTML when complete

**Workflow:**
```
1. Go to bolt.new
2. Paste: "Create an educational game: [PRD]"
3. Wait for generation
4. Test in preview panel
5. Request changes conversationally
6. Download final HTML
```

**Export tip:** Bolt may create multiple files. Ask:
```
Please combine everything into a single HTML file with
embedded CSS and JavaScript, no external dependencies.
```

---

#### Lovable

**Strengths**: Good visual design; component-based

**Best Practices:**
1. Create a new project with PRD as specification
2. Let it generate initial structure
3. Manually verify accessibility (Lovable may miss some)
4. Request single-file export

**Workflow:**
```
1. Create new Lovable project
2. Describe: "Educational game following this spec: [PRD]"
3. Review generated components
4. Test all interactions
5. Request: "Export as single HTML file"
6. Download and verify no external deps
```

**Watch for:** External dependencies - verify the exported HTML is self-contained.

---

#### Replit Agent

**Strengths**: Full development environment; easy testing

**Best Practices:**
1. Create new HTML Repl
2. Paste PRD to agent in chat
3. Test directly in Replit's preview
4. Download index.html when complete

**Workflow:**
```
1. Create new Repl (HTML, CSS, JS template)
2. Chat: "Create an educational game: [PRD]"
3. Agent creates files
4. Click Run to preview
5. Request changes in chat
6. Download index.html
```

**Tip:** Ask agent to consolidate: "Put all code in index.html, no separate CSS/JS files"

---

#### v0 (Vercel)

**Strengths**: Modern React components; good design

**Best Practices:**
1. Submit PRD as design specification
2. v0 generates React components
3. Request conversion to plain HTML
4. Verify no external dependencies

**Important:** v0 defaults to React. You'll need to:
```
Please convert this to a single HTML file with plain JavaScript.
No React, no npm packages, no external dependencies.
All CSS and JS embedded in the HTML file.
```

---

#### Windsurf (Codeium)

**Strengths**: Context-aware; good for complex projects

**Best Practices:**
1. Use PRD in Cascade context
2. Start with file creation request
3. Iterate with specific fix requests
4. Good for accessibility refinements

**Workflow:**
```
1. Open Windsurf
2. Add PRD to context (paste or file)
3. "Create game.html following this PRD"
4. Review and test
5. "Fix: [specific issue]"
```

---

## Step 4: Iterate and Refine

### Common Fix Requests

**Accessibility:**
```
Please add:
1. Keyboard navigation - all buttons reachable via Tab
2. Focus indicators - 3px outline on focused elements
3. ARIA labels on all interactive elements
4. aria-live region for score updates
```

**Mobile Responsiveness:**
```
Make this mobile responsive:
1. Add @media query for max-width: 768px
2. Stack elements vertically on mobile
3. Increase touch targets to 44px minimum
4. Test at 375px width
```

**Performance:**
```
Optimize this code:
1. Remove any unused CSS
2. Combine duplicate styles
3. Use CSS classes instead of inline styles
4. Ensure file size is under 500KB
```

**External Dependencies:**
```
I see external dependencies. Please:
1. Remove all CDN links
2. Remove Google Fonts - use system fonts
3. Convert external images to inline SVG
4. Embed all JavaScript (no external libraries)
```

### Testing During Iteration

1. **Save the HTML file locally**
2. **Open in browser** (just double-click)
3. **Test these things:**
   - Does it load?
   - Do all buttons work?
   - Can you complete the game/lesson?
   - Does it work on mobile? (use browser dev tools)
   - Does Tab navigate through all elements?

---

## Step 5: Validate

### Complete the Pre-Submission Checklist

Go through `/docs/standards/quality-assurance/pre-submission-checklist.md`

### Key Validation Steps

#### Technical Validation
```bash
# Check file size
ls -la game.html   # Should be < 2MB, ideally < 500KB

# Search for external dependencies
grep -i "cdn\|googleapis\|cloudflare\|unpkg\|jsdelivr" game.html
# Should return nothing

# Check for external fonts
grep -i "fonts.google\|font-face.*url" game.html
# Should return nothing
```

#### Browser Testing
Test in:
- [ ] Chrome (desktop)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (use Chrome DevTools device mode)

#### Accessibility Testing
1. **Keyboard only**: Unplug mouse, navigate entire interface
2. **Contrast check**: Use browser DevTools or WebAIM checker
3. **Screen reader**: Test with VoiceOver (Mac) or NVDA (Windows)

---

## Step 6: Integrate

### Save Files to Correct Location

```bash
# For games
cp game.html /path/to/learning-adventures-app/public/games/my-game-name.html

# For lessons
cp lesson.html /path/to/learning-adventures-app/public/lessons/my-lesson-name.html
```

### Add Catalog Metadata

Edit `/learning-adventures-app/lib/catalogData.ts`:

```typescript
// Add to the appropriate array (mathGames, scienceLessons, etc.)
{
  id: 'my-game-name',
  title: 'My Game Title',
  description: 'One or two sentences describing the game.',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4', '5'],
  difficulty: 'medium',
  skills: ['Skill 1', 'Skill 2', 'Skill 3'],
  estimatedTime: '15-20 mins',
  featured: false,
  htmlPath: '/games/my-game-name.html'
}
```

### Test Integration

```bash
# Start the dev server
cd learning-adventures-app
npm run dev

# Test direct URL
open http://localhost:3000/games/my-game-name.html

# Check catalog
open http://localhost:3000/catalog
```

---

## Troubleshooting

### Problem: Generated code has external dependencies

**Symptoms:** Code includes CDN links, Google Fonts, or npm imports

**Solution:**
```
Please remove all external dependencies:
1. Replace Google Fonts with: font-family: 'Segoe UI', Tahoma, sans-serif;
2. Remove Bootstrap/Tailwind CDN - write plain CSS
3. Remove jQuery - use vanilla JavaScript
4. Convert Font Awesome icons to inline SVG
```

---

### Problem: Not keyboard accessible

**Symptoms:** Can't Tab through interface; buttons don't respond to Enter

**Solution:**
```
Please add keyboard accessibility:
1. Add tabindex="0" to all interactive divs
2. Add onkeydown handlers for Enter/Space on buttons
3. Add visible focus states: outline: 3px solid #005fcc;
4. Ensure logical tab order
```

---

### Problem: Looks broken on mobile

**Symptoms:** Elements overlap; text too small; buttons too small

**Solution:**
```
Please make mobile responsive:
1. Add viewport meta tag if missing
2. Use flexbox with flex-wrap: wrap;
3. Set font-size: 16px minimum
4. Set button min-width/min-height: 44px
5. Add @media (max-width: 768px) for mobile layout
```

---

### Problem: File is too large

**Symptoms:** HTML file > 2MB; slow to load

**Solution:**
```
Please reduce file size:
1. Remove unused CSS rules
2. Simplify SVG graphics
3. Remove console.log statements
4. Minimize comments
5. Use CSS shorthand properties
```

---

### Problem: Game/lesson doesn't work offline

**Symptoms:** Works online but breaks without internet

**Solution:** Usually means there's a hidden external dependency. Check:
```bash
grep -E "https?://" game.html
```
Remove any external URLs.

---

## Quick Reference Card

### Prompt Template

```
Create an educational [game/lesson] for elementary students.

Requirements:
- Single HTML file, all CSS/JS embedded
- No external dependencies
- Mobile responsive
- Keyboard accessible
- File size under 500KB

[PASTE PRD HERE]
```

### File Naming

```
[category]-[descriptive-name].html

Examples:
- math-fraction-pizza.html
- science-ecosystem-builder.html
- english-grammar-detective.html
```

### Catalog Metadata Format

```typescript
{
  id: 'exact-filename-without-extension',
  title: 'Display Title',
  description: 'Brief engaging description.',
  type: 'game' | 'lesson',
  category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary',
  gradeLevel: ['3', '4', '5'],  // Strings, not numbers!
  difficulty: 'easy' | 'medium' | 'hard',
  skills: ['Skill 1', 'Skill 2'],
  estimatedTime: '15-20 mins',
  htmlPath: '/games/filename.html'  // or /lessons/
}
```

---

## Advanced Workflows

For content requiring more than simple HTML files:

### React Game Development

If you need platform integration (progress tracking, achievements, shared components):

1. **Use the React PRD**: [react-game-prd-template.md](../prd-templates/react-game-prd-template.md)
2. **Recommended tools**: Claude Code, Cursor
3. **Follow**: [Advanced Content Workflow](./advanced-content-workflow.md)

### Course Development

If you're building multi-lesson learning paths with XP and progression:

1. **Use the Course PRD**: [course-prd-template.md](../prd-templates/course-prd-template.md)
2. **Recommended tools**: Claude Code
3. **Follow**: [Advanced Content Workflow](./advanced-content-workflow.md)

### Deciding Between Simple and Advanced

Not sure which workflow to use? See [Tech Stack Decision Guide](../technical-standards/tech-stack-decision-guide.md).

**Quick rules:**
- Shareable standalone file? → Use this guide (HTML)
- Progress tracking needed? → Use Advanced Workflow (React)
- Multiple lessons with XP? → Use Advanced Workflow (Course)

---

## Support

If you encounter issues:

1. **Check the standards docs** in `/docs/standards/`
2. **Review existing games** in `/public/games/` for patterns
3. **Consult the pre-submission checklist**
4. **Ask in team chat** with specific error/issue description

---

*Last Updated: January 2026*
