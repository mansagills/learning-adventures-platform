# Skills Usage Guide for Learning Adventures Platform
## Agent Instructions for Optimal Workflow Efficiency

---

## 🎯 Overview

This guide provides comprehensive instructions for AI agents working on the Learning Adventures Platform. There are TWO types of skills available:

1. **Built-in Claude Skills** (`/mnt/skills/`) - Pre-installed skills available in every Claude session
2. **Custom Project Skills** (`learning-adventures-platform/docs/skills/`) - Custom skills specific to your educational platform

**Core Principle**: Always read the appropriate SKILL.md file BEFORE starting work on any task that involves creating files, documents, or structured content.

---

## 📚 Skills Architecture

### Two-Tier Skills System

```
┌─────────────────────────────────────────────────────────┐
│  Built-in Claude Skills (Always Available)              │
│  Location: /mnt/skills/                                 │
│  - docx, pdf, pptx, xlsx (document creation)           │
│  - theme-factory, canvas-design (visual design)         │
│  - No setup required - just use them!                   │
└─────────────────────────────────────────────────────────┘
                            ↓
                    Uses in combination with
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Custom Learning Adventures Skills                       │
│  Location: learning-adventures-platform/docs/skills/     │
│  - educational-game-builder (HTML games)                │
│  - react-game-component (React games)                   │
│  - catalog-metadata-formatter (catalog entries)         │
│  - accessibility-validator (WCAG compliance)            │
│  - Already created and ready to use!                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Available Skills Reference

### Built-in Claude Skills (Always Available - No Setup)

### Built-in Claude Skills (Always Available - No Setup)

These skills are part of Claude's system and available in every session at `/mnt/skills/`. No installation or setup required.

#### 1. **Document Creation (docx)**
- **Location**: `/mnt/skills/public/docx/SKILL.md`
- **When to Use**: 
  - Creating Word documents
  - Writing reports, proposals, or documentation
  - Editing or modifying existing .docx files
  - Working with tracked changes or comments
  - Formatting professional documents
- **Example Triggers**:
  - "Write a project report"
  - "Create a lesson plan document"
  - "Fix formatting in this doc"
  - "Add comments to this document"

#### 2. **Presentation Creation (pptx)**
- **Location**: `/mnt/skills/public/pptx/SKILL.md`
- **When to Use**:
  - Creating PowerPoint presentations
  - Building slide decks for lessons or training
  - Designing educational presentations
  - Modifying existing presentations
- **Example Triggers**:
  - "Make a presentation about fractions"
  - "Create slides for this lesson"
  - "Build a teacher training deck"
  - "Design a student showcase presentation"

#### 3. **Spreadsheet Creation (xlsx)**
- **Location**: `/mnt/skills/public/xlsx/SKILL.md`
- **When to Use**:
  - Creating Excel spreadsheets
  - Building data analysis tools
  - Working with formulas and calculations
  - Creating grade trackers or progress reports
  - Data visualization in spreadsheets
- **Example Triggers**:
  - "Create a grade tracker"
  - "Build a student progress spreadsheet"
  - "Analyze this data in Excel"
  - "Make a budget spreadsheet"

#### 4. **PDF Creation (pdf)**
- **Location**: `/mnt/skills/public/pdf/SKILL.md`
- **When to Use**:
  - Creating PDF documents programmatically
  - Filling in PDF forms
  - Extracting text or tables from PDFs
  - Merging or splitting PDFs
  - Converting other formats to PDF
- **Example Triggers**:
  - "Fill in this PDF form"
  - "Create a printable worksheet"
  - "Extract data from this PDF"
  - "Merge these PDFs together"

#### 5. **Product Self-Knowledge**
- **Location**: `/mnt/skills/public/product-self-knowledge/SKILL.md`
- **When to Use**:
  - Questions about Claude's capabilities
  - Platform feature inquiries
  - Pricing or access questions
  - API documentation needs
- **Example Triggers**:
  - "What can Claude do?"
  - "How do I access the API?"
  - "What are the pricing tiers?"

#### 6. **Theme Factory**
- **Location**: `/mnt/skills/examples/theme-factory/SKILL.md`
- **When to Use**:
  - Applying consistent styling to artifacts
  - Creating branded documents or presentations
  - Theming slides, reports, or landing pages
  - Using pre-set color schemes and fonts
- **Example Triggers**:
  - "Apply a professional theme to this"
  - "Style this presentation with a science theme"
  - "Use consistent branding"

#### 7. **Canvas Design**
- **Location**: `/mnt/skills/examples/canvas-design/SKILL.md`
- **When to Use**:
  - Creating visual art or posters
  - Designing static graphics
  - Building educational visuals
  - Creating PNG or PDF designs
- **Example Triggers**:
  - "Design a poster for..."
  - "Create a visual for..."
  - "Make artwork showing..."

#### 8. **Algorithmic Art**
- **Location**: `/mnt/skills/examples/algorithmic-art/SKILL.md`
- **When to Use**:
  - Creating generative art with code
  - Building interactive visualizations
  - Using p5.js for creative coding
- **Example Triggers**:
  - "Create generative art that..."
  - "Build an algorithmic visualization..."

### Custom Learning Adventures Skills (Your Project)

These are custom skills YOU'VE ALREADY CREATED in your `learning-adventures-platform/docs/skills/` directory. They contain patterns specific to your educational platform.

#### 1. **Educational Game Builder**
- **Location**: `learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md`
- **When to Use**:
  - Creating HTML educational games
  - Building single-file interactive lessons
  - Following platform game patterns
  - Implementing 70/30 engagement-to-learning ratio
- **Example Triggers**:
  - "Create a multiplication game"
  - "Build an interactive science lesson"
  - "Generate a fraction practice game"
- **Status**: ✅ Already created and ready to use

#### 2. **React Game Component**
- **Location**: `learning-adventures-platform/docs/skills/react-game-component/SKILL.md`
- **When to Use**:
  - Building React-based educational games
  - Using platform's shared hooks (useGameState, useGameTimer)
  - Integrating with GameContainer and platform components
  - Creating modern, stateful games
- **Example Triggers**:
  - "Create a React multiplication game"
  - "Build a component-based science quiz"
  - "Use the platform hooks for a new game"
- **Status**: ✅ Already created and ready to use

#### 3. **Catalog Metadata Formatter**
- **Location**: `learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md`
- **When to Use**:
  - Adding games/lessons to the catalog
  - Formatting metadata correctly
  - Ensuring all required fields are present
  - Following catalogData.ts patterns
- **Example Triggers**:
  - "Add this game to the catalog"
  - "Generate catalog metadata"
  - "Format this entry for catalogData.ts"
- **Status**: ✅ Already created and ready to use

#### 4. **Accessibility Validator**
- **Location**: `learning-adventures-platform/docs/skills/accessibility-validator/SKILL.md`
- **When to Use**:
  - Validating WCAG 2.1 AA compliance
  - Checking keyboard navigation
  - Testing screen reader compatibility
  - Ensuring child-friendly accessibility
- **Example Triggers**:
  - "Check accessibility of this game"
  - "Validate WCAG compliance"
  - "Test keyboard navigation"
- **Status**: ✅ Already created and ready to use

---

## 🔄 Workflow Protocol

### Standard Development Session Protocol

```
1. READ CONTEXT
   ↓
2. IDENTIFY TASK TYPE
   ↓
3. READ RELEVANT BUILT-IN SKILL(S) from /mnt/skills/
   ↓
4. READ RELEVANT CUSTOM SKILL(S) from learning-adventures-platform/docs/skills/
   ↓
5. EXECUTE TASK USING BEST PRACTICES FROM BOTH
   ↓
6. VALIDATE OUTPUT
   ↓
7. UPDATE DOCUMENTATION
```

### Step-by-Step Instructions

#### Step 1: READ CONTEXT
**Always start by reading**:
- `CLAUDE.md` - Platform instructions and current status
- `COMPREHENSIVE_PLATFORM_PLAN.md` - Current development phase
- Any relevant project documentation

#### Step 2: IDENTIFY TASK TYPE
**Determine which skills are relevant**:
- Creating documents → docx skill (built-in)
- Creating presentations → pptx skill (built-in)
- Creating spreadsheets → xlsx skill (built-in)
- Creating/filling PDFs → pdf skill (built-in)
- Creating HTML games → educational-game-builder skill (custom)
- Creating React games → react-game-component skill (custom)
- Adding to catalog → catalog-metadata-formatter skill (custom)
- Checking accessibility → accessibility-validator skill (custom)

#### Step 3: READ RELEVANT BUILT-IN SKILL(S)
**Use file_read tool for built-in Claude skills**:
```typescript
// Example for creating a teacher guide document
file_read('/mnt/skills/public/docx/SKILL.md')

// Example for creating a themed presentation
file_read('/mnt/skills/public/pptx/SKILL.md')
file_read('/mnt/skills/examples/theme-factory/SKILL.md')
```

#### Step 4: READ RELEVANT CUSTOM SKILL(S)
**Use view tool for your project's custom skills**:
```bash
# Example for building an HTML game
view('learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md')

# Example for creating a React component game
view('learning-adventures-platform/docs/skills/react-game-component/SKILL.md')

# Example for adding game to catalog
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')
```

#### Step 5: EXECUTE TASK
**Combine patterns from both skill types**:
- Use built-in skills for general file creation (docs, PDFs, etc.)
- Use custom skills for platform-specific patterns
- Follow code structure examples from both
- Apply formatting guidelines from both
- Implement best practices from both

#### Step 6: VALIDATE OUTPUT
**Check that**:
- Files are created in `/mnt/user-data/outputs/`
- Output matches requirements
- Best practices from ALL skills were applied
- Platform-specific patterns are followed
- Files are accessible via computer:// links

#### Step 7: UPDATE DOCUMENTATION
**Update relevant files**:
- Mark phases complete in `COMPREHENSIVE_PLATFORM_PLAN.md`
- Add session notes to `CLAUDE.md` if needed
- Update TodoWrite with progress

---

## 🎓 Learning Adventures Platform Specific Usage

### Creating Educational Content

#### HTML Educational Games (Use custom + built-in skills)
```bash
# 1. Read the custom educational game builder skill
view('learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md')

# 2. Review lesson requirements
view('Learning_Adventures_Design.pdf')

# 3. Check game ideas for inspiration
view('learning-adventures-platform/games/math-game-ideas.txt')

# 4. Create the HTML game following the template patterns

# 5. Create teacher documentation using built-in docx skill
file_read('/mnt/skills/public/docx/SKILL.md')
# Generate "Teacher Guide.docx"

# 6. Add to catalog using custom catalog skill
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')
```

#### React Component Games (Use custom + built-in skills)
```bash
# 1. Read the custom React game component skill
view('learning-adventures-platform/docs/skills/react-game-component/SKILL.md')

# 2. Review GAME_DEVELOPMENT.md for integration patterns
view('learning-adventures-platform/GAME_DEVELOPMENT.md')

# 3. Check existing games for reference
view('learning-adventures-platform/learning-adventures-app/components/games/')

# 4. Build component using shared hooks and utilities

# 5. Validate accessibility with custom validator skill
view('learning-adventures-platform/docs/skills/accessibility-validator/SKILL.md')

# 6. Create presentation for stakeholders using built-in pptx skill
file_read('/mnt/skills/public/pptx/SKILL.md')
# Generate "New Game Demo.pptx"
```

#### Student Presentations (Use built-in skill)
```bash
# 1. Read the built-in pptx skill
file_read('/mnt/skills/public/pptx/SKILL.md')

# 2. Check design guidelines
view('Learning_Adventures_Design.pdf')

# 3. Create engaging slides with:
# - Child-friendly visuals
# - Interactive elements
# - Educational objectives
# - Progress indicators
```

#### Progress Trackers (Use built-in skill)
```bash
# 1. Read the built-in xlsx skill
file_read('/mnt/skills/public/xlsx/SKILL.md')

# 2. Review platform data structure
view('learning-adventures-app/prisma/schema.prisma')

# 3. Build spreadsheet with:
# - Student data
# - Progress metrics
# - Achievement tracking
# - Formulas and calculations
```

#### Printable Worksheets (Use built-in skill)
```bash
# 1. Read the built-in pdf skill
file_read('/mnt/skills/public/pdf/SKILL.md')

# 2. Check content ideas
view('learning-adventures-platform/interactive-learning/math-ideas.txt')

# 3. Generate PDF with:
# - Educational activities
# - Answer keys
# - Grade-appropriate content
```

### Platform Development Tasks

#### Creating Admin Reports
```bash
# Read multiple built-in skills for comprehensive reporting
file_read('/mnt/skills/public/docx/SKILL.md')
file_read('/mnt/skills/public/xlsx/SKILL.md')
file_read('/mnt/skills/examples/theme-factory/SKILL.md')

# Create branded report with data analysis
# Use docx for narrative, xlsx for data tables
```

#### Building Teacher Dashboards
```bash
# For dashboard documentation using built-in skill
file_read('/mnt/skills/public/pptx/SKILL.md')

# Create presentation showing:
# - Dashboard features
# - Usage instructions
# - Best practices
```

#### Student Progress Reports
```bash
# Combine built-in skills for comprehensive reports
file_read('/mnt/skills/public/pdf/SKILL.md')
file_read('/mnt/skills/public/xlsx/SKILL.md')

# Generate PDF report with embedded data
# Include charts and progress visualizations
```

### Full Workflow Example: Creating a New Math Game

```bash
# Step 1: Read custom educational game builder skill
view('learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md')

# Step 2: Create the HTML game file
# - Use template from skill
# - Follow 70/30 engagement ratio
# - Implement feedback mechanisms
# Output: /mnt/user-data/outputs/multiplication-master.html

# Step 3: Add to catalog using custom catalog skill
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')
# Generate proper metadata entry for catalogData.ts

# Step 4: Validate accessibility using custom validator skill
view('learning-adventures-platform/docs/skills/accessibility-validator/SKILL.md')
# Check WCAG compliance, keyboard navigation, etc.

# Step 5: Create teacher guide using built-in docx skill
file_read('/mnt/skills/public/docx/SKILL.md')
# Output: /mnt/user-data/outputs/multiplication-master-teacher-guide.docx

# Step 6: Create student worksheet using built-in pdf skill
file_read('/mnt/skills/public/pdf/SKILL.md')
# Output: /mnt/user-data/outputs/multiplication-practice-worksheet.pdf

# Step 7: Create demo presentation using built-in pptx skill
file_read('/mnt/skills/public/pptx/SKILL.md')
# Output: /mnt/user-data/outputs/multiplication-master-demo.pptx
```

---

## 🚨 Critical Rules & Best Practices

### ALWAYS Follow These Rules

1. **Read Skills FIRST - Both Types**
   - Read built-in skills (`/mnt/skills/`) for file creation
   - Read custom skills (`learning-adventures-platform/docs/skills/`) for platform patterns
   - Skills contain critical best practices from extensive testing
   - Following skills dramatically improves output quality

2. **Use Multiple Skills When Needed**
   - Complex tasks often require BOTH built-in AND custom skills
   - Example: HTML game = educational-game-builder (custom) + docx (built-in) for teacher guide
   - Example: React game = react-game-component (custom) + pptx (built-in) for demo
   - Don't limit yourself to one skill per task

3. **Know Which Tool to Use for Each Skill Type**
   - Built-in skills: Use `file_read('/mnt/skills/...')`
   - Custom skills: Use `view('learning-adventures-platform/docs/skills/...')`
   - Both are necessary for complete workflows

4. **Custom Skills Are Platform-Specific**
   - Educational game builder → HTML game patterns specific to this platform
   - React game component → Platform's shared hooks and components
   - Catalog metadata formatter → Exact format for catalogData.ts
   - Accessibility validator → WCAG + child-friendly requirements

5. **Output to Correct Directory**
   - Final files MUST go to `/mnt/user-data/outputs/`
   - Use `/home/claude` for temporary work
   - Never output to read-only skill directories
   - Never output to the project's skills/ directory

6. **Provide Computer Links**
   - Always give users: `computer:///mnt/user-data/outputs/filename`
   - Use "View" not "Download" in link text
   - Don't over-explain, just provide access

### Common Mistakes to Avoid

❌ **Don't**: Create games without reading educational-game-builder skill
✅ **Do**: Always read custom game skills before creating educational content

❌ **Don't**: Add to catalog without reading catalog-metadata-formatter skill
✅ **Do**: Use the catalog skill to ensure proper formatting

❌ **Don't**: Use placeholder formats like [tool: action]
✅ **Do**: Use proper `<function_calls>` format

❌ **Don't**: Mix up file_read and view commands
✅ **Do**: Use file_read for `/mnt/skills/`, view for project files

❌ **Don't**: Forget to move files to outputs directory
✅ **Do**: Always copy final work to `/mnt/user-data/outputs/`

❌ **Don't**: Quote or reproduce copyrighted content
✅ **Do**: Paraphrase and cite sources properly

❌ **Don't**: Create React games without checking GAME_DEVELOPMENT.md
✅ **Do**: Read both react-game-component skill AND GAME_DEVELOPMENT.md

### Skill Combination Patterns

**Pattern 1: HTML Game Creation**
```
educational-game-builder (custom)
    ↓
catalog-metadata-formatter (custom)
    ↓
accessibility-validator (custom)
    ↓
docx (built-in) for teacher guide
    ↓
pdf (built-in) for student worksheet
```

**Pattern 2: React Game Creation**
```
react-game-component (custom)
    +
GAME_DEVELOPMENT.md (reference doc)
    ↓
catalog-metadata-formatter (custom)
    ↓
accessibility-validator (custom)
    ↓
pptx (built-in) for demo presentation
```

**Pattern 3: Platform Documentation**
```
docx (built-in) for written docs
    +
xlsx (built-in) for data/metrics
    +
theme-factory (built-in) for branding
```

---

## 📋 Quick Reference Checklist

### Before Starting Any Task

- [ ] Read `CLAUDE.md` for current status
- [ ] Check `COMPREHENSIVE_PLATFORM_PLAN.md` for phase
- [ ] Identify which built-in skills are relevant (`/mnt/skills/`)
- [ ] Identify which custom skills are relevant (`learning-adventures-platform/docs/skills/`)
- [ ] Use `file_read` to load all relevant built-in skills
- [ ] Use `view` to load all relevant custom skills
- [ ] Review any project-specific documentation

### During Task Execution

- [ ] Follow patterns from loaded built-in skills
- [ ] Follow patterns from loaded custom skills
- [ ] Use recommended libraries and approaches
- [ ] Apply formatting guidelines from skills
- [ ] Work in `/home/claude` for temporary files
- [ ] Test functionality as you build
- [ ] Validate against both skill types

### After Task Completion

- [ ] Move final files to `/mnt/user-data/outputs/`
- [ ] Provide computer:// links to user
- [ ] Update comprehensive plan if phase complete
- [ ] Mark tasks done in TodoWrite
- [ ] Add session notes if significant progress made
- [ ] Verify all custom skill patterns were followed

---

## 🎯 Task-Specific Workflows

### Creating Interactive Lesson HTML

```bash
# 1. Review lesson ideas
view('learning-adventures-platform/interactive-learning/math-ideas.txt')
view('learning-adventures-platform/interactive-learning/science-ideas.txt')

# 2. Read custom educational game builder skill
view('learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md')

# 3. Check existing lessons for patterns
view('learning-adventures-app/public/lessons/')

# 4. Create HTML file following skill template

# 5. Validate accessibility with custom skill
view('learning-adventures-platform/docs/skills/accessibility-validator/SKILL.md')

# 6. Add to catalog with custom skill
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')
```

### Building React Component Games

```bash
# 1. Read custom React game component skill
view('learning-adventures-platform/docs/skills/react-game-component/SKILL.md')

# 2. Review game development documentation
view('learning-adventures-platform/GAME_DEVELOPMENT.md')

# 3. Check existing game components
view('learning-adventures-app/components/games/')

# 4. Review shared utilities
view('learning-adventures-app/components/games/shared/')

# 5. Create component following skill patterns
# Use TypeScript and React best practices
# Integrate with platform hooks and state management

# 6. Add to catalog with custom skill
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')
```

### Updating Platform Documentation

```bash
# 1. For formal docs: Use built-in docx skill
file_read('/mnt/skills/public/docx/SKILL.md')

# 2. For technical docs: Use markdown

# 3. Update appropriate files:
# - CLAUDE.md for instructions
# - COMPREHENSIVE_PLATFORM_PLAN.md for progress
# - README files for specific features

# 4. Ensure consistency across all documentation
```

### Creating Educational Reports

```bash
# 1. Determine report components and read skills
# Narrative: built-in docx skill
file_read('/mnt/skills/public/docx/SKILL.md')

# Data tables: built-in xlsx skill
file_read('/mnt/skills/public/xlsx/SKILL.md')

# Final output: built-in pdf skill
file_read('/mnt/skills/public/pdf/SKILL.md')

# 2. Create components separately
# 3. Combine into final professional report
# 4. Apply theming if needed (built-in theme-factory skill)
file_read('/mnt/skills/examples/theme-factory/SKILL.md')
```

### Complete Game Development Cycle

```bash
# Step 1: Plan and research
view('learning-adventures-platform/games/math-game-ideas.txt')
view('Learning_Adventures_Design.pdf')

# Step 2: Build the game (HTML or React)
# For HTML:
view('learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md')
# For React:
view('learning-adventures-platform/docs/skills/react-game-component/SKILL.md')

# Step 3: Add to catalog
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')

# Step 4: Validate accessibility
view('learning-adventures-platform/docs/skills/accessibility-validator/SKILL.md')

# Step 5: Create teacher materials (built-in docx)
file_read('/mnt/skills/public/docx/SKILL.md')

# Step 6: Create student worksheets (built-in pdf)
file_read('/mnt/skills/public/pdf/SKILL.md')

# Step 7: Create demo presentation (built-in pptx)
file_read('/mnt/skills/public/pptx/SKILL.md')
```

---

## 🔍 Skill Selection Decision Tree

```
Is the task about creating/editing files?
├─ YES → Continue to next question
└─ NO → Proceed without skills, use direct knowledge

What type of content?
├─ Educational game (HTML) → Read educational-game-builder (custom)
├─ Educational game (React) → Read react-game-component (custom)
├─ Catalog entry → Read catalog-metadata-formatter (custom)
├─ Accessibility check → Read accessibility-validator (custom)
├─ Word Document (.docx) → Read docx (built-in)
├─ PowerPoint (.pptx) → Read pptx (built-in)
├─ Excel (.xlsx) → Read xlsx (built-in)
├─ PDF (.pdf) → Read pdf (built-in)
└─ Other → Check both skill types

Does it need styling/theming?
├─ YES → Also read theme-factory (built-in)
└─ NO → Proceed with primary skills

Is it a complex multi-format task?
├─ YES → Read all relevant skills (custom + built-in)
└─ NO → Single skill may be sufficient

Is it a full game development cycle?
├─ YES → Read multiple custom skills + supporting built-in skills:
│         1. educational-game-builder OR react-game-component (custom)
│         2. catalog-metadata-formatter (custom)
│         3. accessibility-validator (custom)
│         4. docx for teacher guide (built-in)
│         5. pdf for worksheets (built-in)
│         6. pptx for demo (built-in)
└─ NO → Use relevant individual skills

Which tool to use for reading?
├─ Built-in skills (/mnt/skills/) → file_read
├─ Custom skills (learning-adventures-platform/docs/skills/) → view
└─ Project docs → view
```

---

## 📞 When to Ask for Clarification

### Ask User When:

1. **Multiple approaches possible**
   - "Would you like this as a Word document or PDF?"
   - "Should I create a presentation or a written guide?"

2. **Unclear requirements**
   - "What grade level should this target?"
   - "How many slides do you want?"
   - "What specific data should I include?"

3. **Missing information**
   - "Which subject category is this for?"
   - "Do you have specific branding requirements?"
   - "What's the target completion time?"

### Don't Ask When:

1. **Best practices are clear from skills**
   - Skills provide definitive guidance
   - Follow skill patterns without asking

2. **Standard platform conventions exist**
   - Use established patterns from CLAUDE.md
   - Follow COMPREHENSIVE_PLATFORM_PLAN.md structure

3. **Minor stylistic choices**
   - Make reasonable decisions
   - Apply professional judgment

---

## 🎓 Learning Resources

### Essential Reading for All Agents

1. **Platform Instructions**
   - `/mnt/project/CLAUDE.md` - Current status and workflow
   - `/mnt/project/COMPREHENSIVE_PLATFORM_PLAN.md` - Development roadmap

2. **Design Guidelines**
   - `/mnt/project/Learning_Adventures_Design.pdf` - UI/UX principles
   - Design philosophy and educational best practices

3. **Development Guides**
   - `/mnt/project/GAME_DEVELOPMENT.md` - Component game creation
   - Technical architecture and patterns

4. **Content Ideas**
   - `/mnt/project/interactive-learning/` - Lesson concepts
   - `/mnt/project/games/` - Game concepts

### Skills Documentation

- All skills have comprehensive SKILL.md files
- Read skills before attempting related tasks
- Skills are updated based on real-world testing
- Trust the skills over general knowledge

---

## 📊 Success Metrics

### How to Know You're Using Skills Correctly

✅ **Good Indicators**:
- You read relevant skills before starting
- Output quality matches professional standards
- Files work correctly on first try
- User doesn't need to request revisions
- Documentation is comprehensive

❌ **Warning Signs**:
- Creating files without reading skills
- Output has formatting issues
- User requests multiple revisions
- Files don't work as expected
- Missing key features from skills

---

## 🔄 Continuous Improvement

### Update This Guide When:

1. New skills are added to the platform
2. Workflow patterns change significantly
3. Common mistakes are identified
4. Best practices evolve
5. User feedback indicates gaps

### Version History

- **v1.0** (October 2024): Initial creation based on Learning Adventures Platform development workflow
- Contains guidance for all public and example skills
- Includes platform-specific workflows
- Provides decision trees and checklists

---

## 📝 Final Reminders

### The Golden Rules

1. **Always read the relevant SKILL.md file(s) before creating ANY document, presentation, spreadsheet, PDF, or educational content.**

2. **Use BOTH skill types**:
   - Built-in skills (`/mnt/skills/`) for general file creation
   - Custom skills (`learning-adventures-platform/docs/skills/`) for platform-specific patterns

3. **Know which tool to use**:
   - `file_read` for built-in skills in `/mnt/skills/`
   - `view` for custom skills in your project

### The Skills Advantage

**Built-in Skills** represent:
- Hundreds of hours of trial-and-error testing
- Proven approaches that work
- Common pitfalls to avoid
- Best libraries and tools
- Optimal file structures
- Professional formatting standards

**Custom Skills** provide:
- Platform-specific patterns and templates
- Educational design best practices
- Integration requirements
- Catalog formatting rules
- Accessibility standards for children
- React component patterns with shared hooks

### Your Responsibility

As an AI agent working on this platform:
- **Prioritize quality over speed**
- **Read built-in skills** for file creation fundamentals
- **Read custom skills** for platform-specific patterns
- **Follow established patterns** from both skill types
- **Update documentation consistently**
- **Provide excellent user experience**

### Quick Command Reference

```bash
# Reading built-in skills (always use file_read)
file_read('/mnt/skills/public/docx/SKILL.md')
file_read('/mnt/skills/public/pptx/SKILL.md')
file_read('/mnt/skills/public/xlsx/SKILL.md')
file_read('/mnt/skills/public/pdf/SKILL.md')
file_read('/mnt/skills/examples/theme-factory/SKILL.md')

# Reading custom skills (always use view)
view('learning-adventures-platform/docs/skills/educational-game-builder/SKILL.md')
view('learning-adventures-platform/docs/skills/react-game-component/SKILL.md')
view('learning-adventures-platform/docs/skills/catalog-metadata-formatter/SKILL.md')
view('learning-adventures-platform/docs/skills/accessibility-validator/SKILL.md')

# Reading project documentation (always use view)
view('learning-adventures-platform/CLAUDE.md')
view('learning-adventures-platform/COMPREHENSIVE_PLATFORM_PLAN.md')
view('learning-adventures-platform/GAME_DEVELOPMENT.md')
view('Learning_Adventures_Design.pdf')
```

### Remember

Skills exist to make you more effective. Use them every time:
- Read built-in skills for professional file creation
- Read custom skills for platform-specific patterns
- Combine skills for comprehensive workflows
- Follow their guidance meticulously
- The result will be dramatically better outputs that delight users and reduce revision cycles

### Success Metrics

You're using skills correctly when:
- ✅ You read both skill types before starting
- ✅ Output quality matches professional standards
- ✅ Platform patterns are followed consistently
- ✅ Files work correctly on first try
- ✅ User doesn't need to request revisions
- ✅ Educational content meets learning objectives
- ✅ Accessibility standards are met
- ✅ Documentation is comprehensive

---

**Remember**: This two-tier skills system (built-in + custom) is designed to give you both general file creation excellence AND platform-specific educational patterns. Use both to create the best possible outputs!

---

*Last Updated: October 2024*
*Platform: Learning Adventures Platform*
*For: AI Agents and Development Assistants*
*Version: 2.0 - Updated with custom skills structure*