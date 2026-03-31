# Learning Adventures Claude Skills

This directory contains custom Claude Skills for the Learning Adventures platform. These skills provide specialized knowledge, templates, and best practices that enhance Claude's ability to assist with content creation and platform development.

## 🎯 What are Claude Skills?

Claude Skills are knowledge packages that give Claude access to:
- Specialized templates and patterns
- Domain-specific best practices
- Quality standards and checklists
- Code examples and workflows

When Claude reads a skill file before performing a task, it produces higher-quality, more consistent output.

## 📚 Available Custom Skills

### 1. [Educational Game Builder](./educational-game-builder/SKILL.md)
**Purpose**: Create HTML educational games following platform standards

**What it provides**:
- Complete HTML game template
- Educational design principles (70/30 rule)
- Category-specific patterns (math, science, etc.)
- Quality checklist and validation rules

**When to use**: 
- Building new HTML games
- Converting game concepts to code
- Ensuring educational effectiveness

---

### 2. [React Game Component](./react-game-component/SKILL.md)
**Purpose**: Build React component games with platform integration

**What it provides**:
- React component template with hooks
- Platform integration patterns (useGameState, useGameTimer)
- Component patterns (drag-drop, canvas, card matching)
- Registration and deployment guide

**When to use**:
- Building React-based games
- Integrating with platform features
- Using shared game utilities

---

### 3. [Catalog Metadata Formatter](./catalog-metadata-formatter/SKILL.md)
**Purpose**: Format metadata entries for the platform catalog

**What it provides**:
- Complete metadata schema and examples
- Validation rules for all fields
- Subject-specific guidelines
- Target array mapping

**When to use**:
- Adding new content to catalog
- Validating metadata format
- Ensuring catalog consistency

---

### 4. [Accessibility Validator](./accessibility-validator/SKILL.md)
**Purpose**: Ensure WCAG 2.1 AA accessibility compliance

**What it provides**:
- WCAG 2.1 AA testing checklist
- Common accessibility fixes
- Testing tools and procedures
- Priority levels for issues

**When to use**:
- Validating new content
- Fixing accessibility issues
- Ensuring inclusive design

---

## 🔧 Built-in Claude Skills (Also Available)

In addition to these custom skills, Claude has access to built-in skills for document creation:

- **docx** (`/mnt/skills/public/docx/SKILL.md`) - Word documents
- **pdf** (`/mnt/skills/public/pdf/SKILL.md`) - PDF files
- **pptx** (`/mnt/skills/public/pptx/SKILL.md`) - Presentations
- **xlsx** (`/mnt/skills/public/xlsx/SKILL.md`) - Spreadsheets

## 📖 How Skills Work

### 1. Agent Reads Skill
```javascript
// Agent reads skill before performing task
await file_read('docs/skills/educational-game-builder/SKILL.md');
```

### 2. Agent Applies Knowledge
The agent now has access to:
- Templates for creating content
- Best practices to follow
- Quality standards to meet
- Common patterns to use

### 3. Higher Quality Output
With skill knowledge, the agent produces:
- Consistent formatting
- Platform-compliant code
- Educationally sound content
- Accessible implementations

## 🔄 Skill Usage by Agent

| Agent | Uses These Skills |
|-------|-------------------|
| **Game Idea Generator** | docx, pptx (for documentation) |
| **Interactive Content Builder** | educational-game-builder, react-game-component, catalog-metadata-formatter, docx, pdf |
| **Catalog Integration** | catalog-metadata-formatter, xlsx |
| **Quality Assurance** | accessibility-validator, xlsx, pdf |

See `../workflows/skills-usage-guide.md` for detailed usage patterns.

## ✅ Skill Quality Standards

Each skill file should:
- Provide complete, working examples
- Include quality checklists
- Show both good and bad examples
- Be updated as platform evolves
- Include troubleshooting guides

## 🚀 Using Skills in Your Workflow

### For Developers
1. Review relevant skills before building
2. Follow templates and patterns provided
3. Use checklists to validate work
4. Reference skills in agent prompts

### Example Agent Prompt
```
Please create a new math game about fractions.
Before starting, read the educational-game-builder skill 
at docs/skills/educational-game-builder/SKILL.md
```

## 📝 Creating New Skills

When creating a new skill:

1. **Identify the Need**
   - Repeated patterns across content
   - Specialized domain knowledge
   - Quality standards to enforce

2. **Structure the Skill**
   ```markdown
   # Skill Name
   
   ## Purpose
   ## When to Use This Skill
   ## Templates/Patterns
   ## Quality Checklist
   ## Examples
   ## Common Issues & Solutions
   ```

3. **Add to Skills Directory**
   - Create folder: `docs/skills/new-skill-name/`
   - Add file: `SKILL.md`
   - Update this README

4. **Reference in Agent Docs**
   - Update agent documentation
   - Add to workflow guides
   - Include in training materials

## 🔍 Skill Development Best Practices

### DO:
- ✅ Include complete, working examples
- ✅ Show both good and bad patterns
- ✅ Provide clear quality criteria
- ✅ Update as platform evolves
- ✅ Include troubleshooting guides

### DON'T:
- ❌ Include outdated information
- ❌ Make assumptions about prior knowledge
- ❌ Provide incomplete examples
- ❌ Forget to include validation steps
- ❌ Skip the "why" behind patterns

## 🔄 Skill Maintenance

Skills should be reviewed and updated:
- When platform standards change
- After identifying common issues
- When new patterns emerge
- Quarterly as a best practice

## 📚 Related Documentation

- **Agents**: See `../agents/` for agent documentation
- **Workflows**: See `../workflows/` for process guides
- **Platform Docs**: See root directory for:
  - `GAME_DEVELOPMENT.md` - Technical requirements
  - `Learning_Adventures_Design.pdf` - Design principles

## 💡 Tips for Best Results

1. **Read Skills First**: Always read relevant skills before starting work
2. **Follow Templates**: Use provided templates as starting points
3. **Check Examples**: Reference good/bad examples for guidance
4. **Validate Output**: Use checklists to ensure quality
5. **Update Skills**: Contribute improvements back to skills

---

**Last Updated**: October 2024  
**Maintained By**: Learning Adventures Platform Team