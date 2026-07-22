# Learning Adventures Content Creation Standards

## Overview

This documentation establishes **platform-agnostic standards** for creating educational content (courses, interactive lessons, and educational games) for the Learning Adventures platform. These standards ensure consistency regardless of which AI coding tool your team uses.

**Key Principle**: Any team member using ANY vibe coding tool (Claude, Cursor, Bolt, Lovable, Replit, v0, Windsurf, etc.) can create content that seamlessly integrates with our platform.

---

## Content Types

| Type | Description | Duration | Output |
|------|-------------|----------|--------|
| **Educational Game** | Gamified learning experience with 70% entertainment, 30% learning | 10-25 mins | Single HTML file |
| **Interactive Lesson** | Structured educational experience with instruction and practice | 15-30 mins | Single HTML file |
| **Course** | Multi-lesson learning path with progression and XP | 1-5 hours | Multiple files + metadata |

---

## Quick Start

### 1. Choose Your Content Type
Determine what you're building based on the learning goals and format.

### 2. Get the PRD Template
Copy the appropriate template from [prd-templates/](./prd-templates/):
- [Educational Game PRD Template](./prd-templates/educational-game-prd-template.md)
- [Interactive Lesson PRD Template](./prd-templates/interactive-lesson-prd-template.md)
- [Course PRD Template](./prd-templates/course-prd-template.md)

### 3. Fill In the Template
Complete all sections with your specific content details.

### 4. Use Any AI Coding Tool
Paste the filled PRD into your preferred tool:
- Claude (claude.ai or Claude Code)
- Cursor
- Bolt.new
- Lovable
- Replit Agent
- v0 (Vercel)
- Windsurf
- Any other LLM-based coding assistant

### 5. Iterate and Test
Test locally, request fixes for accessibility/mobile/performance.

### 6. Validate
Complete the [Pre-Submission Checklist](./quality-assurance/pre-submission-checklist.md).

### 7. Submit for Integration
Save files to correct location and add catalog metadata.

---

## Documentation Structure

```
docs/standards/
│
├── README.md                          # You are here
│
├── prd-templates/                     # PRD templates for any AI tool
│   ├── README.md                      # How to use templates
│   ├── educational-game-prd-template.md
│   ├── interactive-lesson-prd-template.md
│   └── course-prd-template.md
│
├── technical-standards/               # Platform requirements
│   ├── file-format-standards.md       # HTML structure, dependencies
│   ├── accessibility-checklist.md     # WCAG 2.1 AA compliance
│   └── visual-design-guidelines.md    # UI/UX standards
│
├── educational-standards/             # Learning design
│   ├── learning-objectives-guide.md   # Writing objectives
│   └── age-appropriate-content.md     # Grade-level guidelines
│
├── workflows/                         # Creation process
│   └── vibe-coding-workflow-guide.md  # Step-by-step workflow
│
└── quality-assurance/                 # Validation
    └── pre-submission-checklist.md    # Universal checklist
```

---

## Platform Requirements Summary

### Technical Requirements
- Single HTML file with embedded CSS and JavaScript
- NO external dependencies (CDN, libraries, fonts)
- File size under 2MB
- Mobile responsive (375px - 1920px+)
- Works offline after first load
- Load time under 3 seconds

### Accessibility Requirements (WCAG 2.1 AA)
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators visible (3px minimum)
- Color contrast 4.5:1 (text), 3:1 (UI)
- Touch targets 44x44px minimum
- Screen reader compatible

### Educational Requirements
- Clear, measurable learning objectives
- Age-appropriate for target grade level
- Progressive difficulty
- Immediate feedback on interactions
- For games: 70% entertainment, 30% learning

See individual standards documents for complete details.

---

## Subject Categories

| Category | ID | Examples |
|----------|-----|----------|
| Mathematics | `math` | Fractions, geometry, multiplication |
| Science | `science` | Planets, ecosystems, weather |
| English | `english` | Grammar, vocabulary, reading |
| History | `history` | Ancient civilizations, US history |
| Interdisciplinary | `interdisciplinary` | STEM projects, cross-subject |

---

## Grade Levels

| Grade Range | Ages | Difficulty Guidance |
|-------------|------|---------------------|
| K-2 | 5-8 | Simple concepts, heavy scaffolding, lots of visuals |
| 3-4 | 8-10 | Building skills, some independence, clear instructions |
| 5-6 | 10-12 | Complex concepts, more text, challenging problems |

---

## File Locations

| Content Type | Location | Example |
|--------------|----------|---------|
| Games | `/public/games/` | `/public/games/math-race-rally.html` |
| Lessons | `/public/lessons/` | `/public/lessons/fraction-basics.html` |
| Catalog Metadata | `/lib/catalogData.ts` | Add entry to appropriate array |

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PLAN: Choose content type, fill in PRD template          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BUILD: Use any AI coding tool with filled PRD            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. TEST: Browser testing, mobile, accessibility             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. VALIDATE: Complete pre-submission checklist              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. INTEGRATE: Add to platform (files + catalog metadata)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Choosing Your Tech Stack

Not all content needs the same level of complexity. Choose based on your requirements:

| Stack | Best For | PRD Template |
|-------|----------|--------------|
| **HTML (Simple)** | Standalone games, quick prototypes, shareable files | [educational-game-prd-template.md](./prd-templates/educational-game-prd-template.md) |
| **React (Medium)** | Platform integration, complex state, shared components | [react-game-prd-template.md](./prd-templates/react-game-prd-template.md) |
| **Course System** | Multi-lesson paths, XP, quizzes, certificates | [course-prd-template.md](./prd-templates/course-prd-template.md) |

**Quick Decision:**
- Need to share as a file? → **HTML**
- Need progress tracking? → **React**
- Multiple lessons with progression? → **Course System**

See [Tech Stack Decision Guide](./technical-standards/tech-stack-decision-guide.md) for detailed guidance.

---

## Related Documentation

### Claude-Specific Skills
If using Claude Code, these skills provide detailed implementation patterns:
- [Educational Game Builder](/docs/skills/educational-game-builder/SKILL.md)
- [React Game Component](/docs/skills/react-game-component/SKILL.md)
- [Course Builder](/docs/skills/course-builder/SKILL.md)
- [Catalog Metadata Formatter](/docs/skills/catalog-metadata-formatter/SKILL.md)
- [Accessibility Validator](/docs/skills/accessibility-validator/SKILL.md)

### Prompt Templates
For detailed prompts with code examples:
- [Interactive Game Prompts](/final-content/interactive-game-prompts.txt)
- [Interactive Learning Prompts](/final-content/interactive-learning-prompts.txt)

---

## Support

For questions about content creation standards:
1. Review the relevant standards documentation
2. Check existing games/lessons for patterns
3. Consult with the platform team

---

*Last Updated: January 2026*
