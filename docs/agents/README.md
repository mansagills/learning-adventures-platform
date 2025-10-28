# Learning Adventures Agents

This directory contains documentation for the AI agents that assist with content creation and platform management for the Learning Adventures educational platform.

## 🤖 Available Agents

### 1. [Game Idea Generator Agent](./game-idea-generator-agent.md)
**Purpose**: Generate creative, educationally sound game concepts

**Capabilities**:
- Create new game ideas based on learning objectives
- Analyze existing content to avoid duplication
- Ensure proper educational design (70% engagement, 30% learning)
- Generate detailed specifications for developers

**When to Use**: 
- Planning new content
- Brainstorming game mechanics
- Expanding subject areas

---

### 2. [Interactive Content Builder Agent](./interactive-content-builder-agent.md)
**Purpose**: Build complete, functional educational games and lessons

**Capabilities**:
- Create HTML games with embedded CSS/JavaScript
- Build React component games with platform integration
- Implement educational mechanics with progress tracking
- Generate accompanying teacher guides and worksheets

**When to Use**:
- Converting game concepts to code
- Building new games or lessons
- Creating platform-integrated content

---

### 3. [Catalog Integration Agent](./catalog-integration-agent.md)
**Purpose**: Integrate new content into the platform catalog

**Capabilities**:
- Validate metadata completeness and format
- Update catalogData.ts with new entries
- Verify file paths and component registration
- Ensure no duplicate IDs or conflicts

**When to Use**:
- Adding new games/lessons to platform
- Updating existing catalog entries
- Batch importing content

---

### 4. [Quality Assurance Agent](./quality-assurance-agent.md)
**Purpose**: Validate content quality and accessibility

**Capabilities**:
- Test educational effectiveness
- Validate technical functionality
- Check WCAG 2.1 AA accessibility compliance
- Measure performance and user experience
- Generate comprehensive QA reports

**When to Use**:
- Before releasing new content
- Auditing existing content
- Ensuring platform standards

---

## 🔄 Agent Workflow

The agents work together in a typical content creation flow:

```
1. Game Idea Generator
   ↓ (generates concept)
   
2. Interactive Content Builder
   ↓ (creates game/lesson)
   
3. Catalog Integration
   ↓ (adds to platform)
   
4. Quality Assurance
   ↓ (validates quality)
   
5. ✅ Production Ready
```

## 📚 Related Documentation

- **Skills**: See `../skills/` for Claude Skills that agents use
- **Workflows**: See `../workflows/` for detailed process guides
- **Platform Docs**: See root directory for platform-specific documentation
  - `CLAUDE.md` - Platform development instructions
  - `GAME_DEVELOPMENT.md` - Game creation workflow
  - `COMPREHENSIVE_PLATFORM_PLAN.md` - Platform roadmap

## 🚀 Getting Started

### For Developers
1. Review each agent's documentation
2. Understand agent capabilities and limitations
3. Reference skills that agents use (in `../skills/`)
4. Follow workflows in `../workflows/`

### For Content Creators
1. Start with Game Idea Generator for concepts
2. Work with Interactive Content Builder for implementation
3. Ensure Catalog Integration adds content properly
4. Verify with Quality Assurance before release

## 💡 Tips for Working with Agents

- **Be Specific**: Provide clear, detailed requirements
- **Review Output**: Always review agent-generated content
- **Iterate**: Agents work best with feedback and iteration
- **Use Skills**: Agents reference skill files for best practices
- **Follow Standards**: All output follows platform standards

## 📝 Contributing

When updating agent documentation:
1. Keep capabilities and examples up-to-date
2. Add new workflows as they emerge
3. Document lessons learned
4. Update this README when adding new agents

---

**Last Updated**: October 2024  
**Maintained By**: Learning Adventures Platform Team