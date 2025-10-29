# Agent-Skill Integration Guide

## 🎯 Purpose

This guide explains how Learning Adventures AI agents integrate with Claude Code skills to create high-quality, consistent educational content. It serves as the comprehensive reference for understanding the two-tier system that powers our content creation workflow.

## 📋 Table of Contents

1. [Overview](#overview)
2. [The Two-Tier System](#the-two-tier-system)
3. [Agent-Skill Matrix](#agent-skill-matrix)
4. [Integration Protocols](#integration-protocols)
5. [Workflow Examples](#workflow-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What Are Agents?

**Agents** are high-level role specifications that define:
- **Purpose**: What the agent is designed to accomplish
- **Capabilities**: What tasks the agent can perform
- **Workflows**: Step-by-step processes for common tasks
- **Context**: Files, standards, and resources to reference

Think of agents as **job descriptions** for specific content creation roles.

### What Are Skills?

**Skills** are detailed technical specifications that provide:
- **Patterns**: Code templates and structural guidelines
- **Standards**: Quality requirements and validation criteria
- **Checklists**: Step-by-step validation for output quality
- **Examples**: Working code demonstrating best practices

Think of skills as **technical manuals** or **style guides** that ensure consistency.

### Why Both?

Agents provide the **strategic direction** ("what to do and why"), while skills provide the **tactical implementation** ("how to do it correctly"). Together, they ensure:
- ✅ **Consistency**: All content follows the same patterns
- ✅ **Quality**: Built-in validation against platform standards
- ✅ **Efficiency**: No need to reinvent patterns each time
- ✅ **Scalability**: New team members can immediately create compliant content

---

## The Two-Tier System

### Tier 1: Built-in Claude Skills (Global)

**Location**: `/mnt/skills/` (Claude Code system directory)

**Purpose**: General-purpose development skills provided by Claude

**Examples**:
- Code refactoring patterns
- Testing frameworks
- Documentation generation
- General web development best practices

**When to Use**: For general development tasks not specific to Learning Adventures platform

---

### Tier 2: Custom Project Skills (Local)

**Location**: `docs/skills/` (Learning Adventures platform)

**Purpose**: Platform-specific content creation patterns and standards

**Available Skills**:

1. **educational-game-builder** (2,064 lines)
   - Single HTML file game creation
   - 70/30 engagement-to-learning ratio
   - WCAG 2.1 AA accessibility patterns
   - Mobile-responsive design templates

2. **react-game-component** (1,092 lines)
   - Platform-integrated React games
   - UseProgress and useAchievements hooks
   - GameContainer wrapper patterns
   - State management best practices

3. **catalog-metadata-formatter** (802 lines)
   - Complete TypeScript schema for catalog entries
   - Required and optional field validation
   - ID format conventions
   - Category and difficulty standards

4. **accessibility-validator** (1,103 lines)
   - 8 critical WCAG testing categories
   - Priority system (P0-P3)
   - Browser testing procedures
   - Assistive technology testing guides

**When to Use**: For all Learning Adventures content creation and validation tasks

---

## Agent-Skill Matrix

| Agent | Role | Required Skills | Optional Skills | Execution Pattern |
|-------|------|----------------|-----------------|-------------------|
| **Game Idea Generator** | Ideation | None | educational-game-builder<br>react-game-component<br>accessibility-validator | Pure creativity → Optional pattern awareness |
| **Interactive Content Builder** | Implementation | educational-game-builder<br>react-game-component | catalog-metadata-formatter | READ skills → Apply patterns → Validate |
| **Catalog Integration** | Metadata | catalog-metadata-formatter | None | READ skill → Format data → Validate schema |
| **Quality Assurance** | Validation | accessibility-validator | None | READ skill → Test systematically → Report issues |

### Skill Dependencies

```
educational-game-builder
├── Used by: Interactive Content Builder (PRIMARY)
├── Referenced by: Game Idea Generator (OPTIONAL)
└── Validated by: Quality Assurance (checks compliance)

react-game-component
├── Used by: Interactive Content Builder (PRIMARY)
└── Referenced by: Game Idea Generator (OPTIONAL)

catalog-metadata-formatter
├── Used by: Catalog Integration (PRIMARY)
└── Referenced by: Interactive Content Builder (SECONDARY)

accessibility-validator
├── Used by: Quality Assurance (PRIMARY)
└── Referenced by: Game Idea Generator (OPTIONAL)
```

---

## Integration Protocols

### Protocol 1: Required Skills (Critical Path)

**Applies to**: Interactive Content Builder, Catalog Integration, Quality Assurance

**Steps**:
1. **READ** the required skill file(s) using the Read tool
2. **UNDERSTAND** all patterns, templates, and validation criteria
3. **APPLY** skill knowledge during content creation
4. **VALIDATE** output against skill checklist before returning
5. **RETURN** compliant content that meets all standards

**Why Critical**: These skills contain non-negotiable platform requirements. Skipping them results in content that fails validation.

**Example**:
```
User: "Create an HTML multiplication game for 3rd graders"

Agent: Interactive Content Builder

Execution:
1. READ docs/skills/educational-game-builder/SKILL.md
2. Extract key requirements:
   - Single HTML file
   - 70/30 fun-to-learning ratio
   - WCAG 2.1 AA accessibility
   - Mobile-responsive design
   - Under 3MB file size
3. Create game applying all patterns
4. Self-validate against checklist:
   ✅ Keyboard navigation
   ✅ Color contrast 4.5:1
   ✅ ARIA labels
   ✅ Touch targets 44×44px
   ✅ Responsive layout
5. Return compliant game file
```

---

### Protocol 2: Optional Skills (Enhancement)

**Applies to**: Game Idea Generator

**Steps**:
1. **ASSESS** if technical awareness would enhance output quality
2. **READ** relevant skill(s) if beneficial (optional)
3. **APPLY** patterns as creative inspiration (not constraints)
4. **RETURN** ideas that balance creativity with feasibility

**Why Optional**: Ideation should not be constrained by technical limitations, but awareness of patterns can improve implementability.

**Example**:
```
User: "Generate 5 science game ideas about photosynthesis"

Agent: Game Idea Generator

Execution Path A (Pure Ideation):
1. Research photosynthesis concepts
2. Review existing science games
3. Generate creative concepts
4. Return 5 unique ideas

Execution Path B (Pattern-Aware Ideation):
1. Research photosynthesis concepts
2. Review existing science games
3. READ docs/skills/educational-game-builder/SKILL.md (optional)
4. Generate concepts that fit single HTML file pattern
5. Include technical notes ("Mobile-friendly", "Uses canvas API")
6. Return 5 implementable ideas with technical context
```

---

## Workflow Examples

### Example 1: Complete Content Creation Flow

**Scenario**: Create a new math game about fractions for 4th graders

#### Step 1: Ideation (Game Idea Generator)
```
User: "Generate game ideas for teaching fractions to 4th graders"

Agent: Game Idea Generator
Process:
1. Read existing math game ideas
2. Optionally read educational-game-builder skill for pattern awareness
3. Generate 3 game concepts:
   - "Fraction Pizza Party" (visual fraction manipulation)
   - "Recipe Reducer" (scaling recipes using fractions)
   - "Number Line Jump" (placing fractions on number line)
4. Return detailed concepts with mechanics and learning objectives

Output: 3 game concepts with implementation notes
```

#### Step 2: Implementation (Interactive Content Builder)
```
User: "Build 'Fraction Pizza Party' as an HTML game"

Agent: Interactive Content Builder
Process:
1. READ docs/skills/educational-game-builder/SKILL.md (REQUIRED)
2. READ docs/skills/react-game-component/SKILL.md (REQUIRED)
3. Extract requirements from educational-game-builder:
   - Single HTML file with embedded CSS/JS
   - 70% fun (pizza decoration) + 30% learning (fraction practice)
   - WCAG 2.1 AA accessibility
   - Mobile-responsive with 44×44px touch targets
4. Create game file:
   - Visual pizza builder interface
   - Fraction selection mechanic
   - Progress tracking
   - Immediate feedback
   - Colorful, child-friendly design
5. Validate against skill checklist:
   ✅ Keyboard navigation (Tab key works)
   ✅ Color contrast meets 4.5:1
   ✅ ARIA labels on all buttons
   ✅ Screen reader compatible
   ✅ Responsive layout
   ✅ Under 3MB
6. Return: fraction-pizza-party.html (compliant game file)

Output: Complete HTML game file
```

#### Step 3: Catalog Integration (Catalog Integration)
```
User: "Add Fraction Pizza Party to the catalog"

Agent: Catalog Integration
Process:
1. READ docs/skills/catalog-metadata-formatter/SKILL.md (REQUIRED)
2. Extract schema requirements:
   - ID: lowercase-hyphenated, max 50 chars
   - All required fields (id, title, description, type, category, etc.)
   - gradeLevel as string array
   - difficulty: "easy" | "medium" | "hard"
   - htmlPath for HTML games
3. Create catalog entry:
   {
     id: "fraction-pizza-party",
     title: "Fraction Pizza Party",
     description: "Build delicious pizzas while learning fractions...",
     type: "game",
     category: "math",
     gradeLevel: ["4"],
     difficulty: "medium",
     skills: ["Identify fractions", "Compare fractions", "Visual representation"],
     estimatedTime: "15-20 minutes",
     featured: false,
     htmlPath: "/games/fraction-pizza-party.html"
   }
4. Validate against schema:
   ✅ ID format correct
   ✅ All required fields present
   ✅ gradeLevel is array of strings
   ✅ difficulty is valid enum value
   ✅ htmlPath points to correct location
5. Add to catalogData.ts mathGames array
6. Verify file exists at public/games/fraction-pizza-party.html

Output: Updated catalogData.ts + confirmation
```

#### Step 4: Quality Assurance (Quality Assurance)
```
User: "Test Fraction Pizza Party before release"

Agent: Quality Assurance
Process:
1. READ docs/skills/accessibility-validator/SKILL.md (REQUIRED)
2. Extract testing requirements (8 categories):
   - Keyboard Navigation (Level A)
   - Color Contrast (Level AA)
   - Screen Reader Support (Level A/AA)
   - Focus Management (Level AA)
   - Text Resizing (Level AA)
   - Touch Targets (AAA)
   - Motion/Animation (Level A/AAA)
   - Forms/Error Handling (Level A/AA)
3. Open fraction-pizza-party.html in browser
4. Systematic testing:

   ✅ Keyboard Navigation:
      - Tab key navigates through buttons
      - Spacebar/Enter activates buttons
      - Escape closes modals
      - No keyboard traps detected

   ✅ Color Contrast (WebAIM Color Contrast Checker):
      - Background #FFE5B4 + Text #333333 = 9.8:1 (Pass AA)
      - Button #FF6B6B + Text #FFFFFF = 4.7:1 (Pass AA)
      - All UI components meet 3:1 minimum

   ✅ Screen Reader (NVDA testing):
      - All buttons have aria-labels
      - Pizza fractions announced as "One quarter", "One half"
      - Score updates use aria-live="polite"
      - Semantic HTML (header, main, button elements)

   ✅ Focus Management:
      - Visible focus rings (2px blue outline)
      - Focus moves to modal when opened
      - Focus returns to trigger on close

   ✅ Text Resizing:
      - Content readable at 200% zoom
      - No horizontal scrolling at 200%
      - Uses rem units for text

   ✅ Touch Targets:
      - All buttons 48×48px or larger
      - 12px spacing between targets
      - Touch-friendly on mobile

   ✅ Motion/Animation:
      - prefers-reduced-motion implemented
      - Pizza spin animation disables with preference
      - No auto-playing audio

   ✅ Forms (if applicable):
      - N/A for this game
5. Educational testing:
   ✅ Learning objectives met
   ✅ Feedback is immediate and specific
   ✅ Difficulty appropriate for 4th grade
   ✅ 70/30 engagement-to-learning ratio
6. Technical testing:
   ✅ Works in Chrome, Firefox, Safari
   ✅ Responsive on mobile/tablet/desktop
   ✅ Load time under 2 seconds
   ✅ No console errors
7. Generate test report:
   - PASS: 0 P0 issues, 0 P1 issues
   - 1 P2 issue: Add sound effects (optional enhancement)
   - 2 P3 issues: Consider high score persistence, add timer mode

Output: PASS - Ready for production with enhancement suggestions
```

#### Result
✅ **Production-Ready Game**: Fraction Pizza Party is live in the catalog, fully accessible, educationally sound, and technically robust.

---

### Example 2: Bulk Content Update

**Scenario**: Update 10 existing games to add missing catalog metadata

```
User: "Update catalog entries for 10 older HTML games to include skills array"

Agent: Catalog Integration

Process:
1. READ docs/skills/catalog-metadata-formatter/SKILL.md
2. Identify 10 games missing skills array
3. For each game:
   - Review game content and mechanics
   - Identify 2-5 specific learning objectives
   - Format as skills array per schema
   - Validate against catalog-metadata-formatter standards
4. Update catalogData.ts entries:

   Before:
   {
     id: "multiplication-master",
     title: "Multiplication Master",
     // ... other fields
     // skills field missing
   }

   After:
   {
     id: "multiplication-master",
     title: "Multiplication Master",
     // ... other fields
     skills: [
       "Multiply single-digit numbers",
       "Recognize multiplication patterns",
       "Apply times tables 1-12"
     ]
   }
5. Validate all 10 entries against schema
6. Return updated catalogData.ts

Output: 10 catalog entries updated with compliant skills arrays
```

---

### Example 3: Accessibility Audit

**Scenario**: Audit all 85 platform games for WCAG compliance

```
User: "Audit all games for accessibility issues"

Agent: Quality Assurance

Process:
1. READ docs/skills/accessibility-validator/SKILL.md
2. Create testing spreadsheet with 8 categories
3. For each of 85 games:
   - Test keyboard navigation
   - Check color contrast
   - Test screen reader compatibility
   - Verify focus management
   - Test text resizing
   - Measure touch targets
   - Check motion preferences
   - Test forms (if applicable)
4. Prioritize issues:
   - P0 (Critical): 12 games have keyboard traps → Block production
   - P1 (High): 27 games have color contrast issues → Fix in sprint
   - P2 (Medium): 45 games missing prefers-reduced-motion → Next cycle
   - P3 (Low): 30 games have small touch targets → Backlog
5. Generate comprehensive audit report:
   - Executive summary
   - Issues by priority
   - Recommended fix order
   - Effort estimates
6. Return audit report + action plan

Output: Complete accessibility audit with prioritized remediation plan
```

---

## Best Practices

### For Content Creators

1. **Always Start with the Agent**
   - Read the agent documentation first to understand the role
   - Follow the agent's workflow guidance
   - Let the agent direct you to the appropriate skills

2. **Read Skills Before Creating**
   - Don't guess at patterns or standards
   - Read the full skill file, not just the summary
   - Pay special attention to validation checklists

3. **Validate Before Submitting**
   - Self-check against skill validation criteria
   - Test with actual users when possible
   - Run automated tools (Lighthouse, WAVE, etc.)

4. **Iterate Based on Feedback**
   - QA findings should drive improvements
   - Update skills documentation if you discover better patterns
   - Share learnings with the team

### For Skill Maintainers

1. **Keep Skills Updated**
   - Document new patterns as they emerge
   - Update validation criteria when standards change
   - Add examples from real implementations

2. **Make Skills Scannable**
   - Use clear headings and structure
   - Include quick reference checklists
   - Provide code examples for every pattern

3. **Version Control Skills**
   - Note when significant changes are made
   - Communicate updates to content creators
   - Maintain backward compatibility when possible

4. **Cross-Reference**
   - Link related skills together
   - Reference agent documentation
   - Point to external resources (WCAG docs, MDN, etc.)

### For Agent Documentation

1. **Always Include Skill Integration Protocol**
   - Make skills a first-class part of the workflow
   - Explicitly list required and optional skills
   - Provide clear execution examples

2. **Update When Workflows Change**
   - Keep agent docs synchronized with actual practices
   - Document new capabilities as they're added
   - Remove outdated information

3. **Maintain Clear Examples**
   - Show complete workflows from start to finish
   - Include both successful and failed examples
   - Demonstrate skill validation in practice

---

## Troubleshooting

### Issue: Content Doesn't Match Platform Standards

**Symptom**: Games or lessons fail QA validation

**Diagnosis**: Skills were not read or applied during creation

**Solution**:
1. Read the agent documentation to identify required skills
2. Read the required skills in full
3. Recreate content applying skill patterns
4. Validate against skill checklist before resubmitting

---

### Issue: Catalog Entry Validation Fails

**Symptom**: catalogData.ts throws TypeScript errors

**Diagnosis**: Metadata doesn't match schema in catalog-metadata-formatter skill

**Solution**:
1. READ docs/skills/catalog-metadata-formatter/SKILL.md
2. Compare your entry to the TypeScript schema
3. Fix field names, data types, or missing required fields
4. Validate format (ID lowercase-hyphenated, gradeLevel as array, etc.)

---

### Issue: Accessibility Testing Reveals Many Issues

**Symptom**: QA report shows multiple P0/P1 accessibility violations

**Diagnosis**: Content created without reading accessibility-validator skill

**Solution**:
1. READ docs/skills/accessibility-validator/SKILL.md
2. For each P0/P1 issue, find the corresponding testing category in skill
3. Apply the recommended patterns/fixes from the skill
4. Re-test systematically using skill checklist
5. Only submit when all P0/P1 issues resolved

---

### Issue: Agent Doesn't Know How to Start

**Symptom**: Claude session as agent produces generic output

**Diagnosis**: Agent documentation wasn't read, or skills weren't loaded

**Solution**:
1. Start conversation with: "You are the [Agent Name] agent. Read the agent documentation at docs/agents/[agent-name].md"
2. Wait for agent to acknowledge and identify required skills
3. Confirm agent has read required skills
4. Proceed with task

**Example**:
```
User: "You are the Interactive Content Builder agent. Read your documentation."

Agent: "I've read the Interactive Content Builder documentation. I see I need to read two required skills before creating content:
- docs/skills/educational-game-builder/SKILL.md
- docs/skills/react-game-component/SKILL.md

Let me read those now..."

[Agent reads both skills]

Agent: "I'm now ready to build HTML or React games following platform standards. What would you like me to create?"
```

---

### Issue: Skills and Agent Docs Out of Sync

**Symptom**: Agent references patterns not in skills, or vice versa

**Diagnosis**: Documentation updated in one place but not the other

**Solution**:
1. Identify the source of truth (usually the skill has latest patterns)
2. Update the out-of-sync documentation
3. Verify integration protocol section in agent docs matches skill content
4. Update skills-usage-guide.md if workflows changed
5. Communicate changes to team

---

## Related Documentation

- **Agent Specifications**: [docs/agents/](../agents/)
  - [Game Idea Generator Agent](../agents/game-idea-generator-agent.md)
  - [Interactive Content Builder Agent](../agents/interactive-content-builder-agent.md)
  - [Catalog Integration Agent](../agents/catalog-integration-agent.md)
  - [Quality Assurance Agent](../agents/quality-assurance-agent.md)

- **Skill Documentation**: [docs/skills/](../skills/)
  - [Educational Game Builder Skill](../skills/educational-game-builder/SKILL.md)
  - [React Game Component Skill](../skills/react-game-component/SKILL.md)
  - [Catalog Metadata Formatter Skill](../skills/catalog-metadata-formatter/SKILL.md)
  - [Accessibility Validator Skill](../skills/accessibility-validator/SKILL.md)

- **Workflow Guides**: [docs/workflows/](../workflows/)
  - [Skills Usage Guide](./skills-usage-guide.md)

- **Platform Documentation**: [Root Directory](../../)
  - [CLAUDE.md](../../CLAUDE.md) - Platform development instructions
  - [GAME_DEVELOPMENT.md](../../GAME_DEVELOPMENT.md) - Game creation workflow
  - [COMPREHENSIVE_PLATFORM_PLAN.md](../../COMPREHENSIVE_PLATFORM_PLAN.md) - Platform roadmap

---

## Conclusion

The agent-skill integration system creates a powerful, scalable content creation workflow by separating strategic direction (agents) from tactical implementation (skills). By following the protocols in this guide, you ensure:

✅ **Consistency**: All content follows the same high-quality patterns
✅ **Efficiency**: No need to reinvent standards for each piece of content
✅ **Quality**: Built-in validation against platform requirements
✅ **Scalability**: New team members can immediately create compliant content
✅ **Maintainability**: Updates to standards propagate automatically

**Remember**: Agents tell you **what** to do, skills tell you **how** to do it. Together, they make content creation systematic, consistent, and high-quality.

---

**Last Updated**: October 2025
**Maintained By**: Learning Adventures Platform Team
**Version**: 1.0.0
