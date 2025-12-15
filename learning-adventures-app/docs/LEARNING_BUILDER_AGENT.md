# Learning Builder Agent

## Overview
The Learning Builder Agent is an intelligent AI assistant that automatically detects and uses appropriate skills to create interactive learning content and educational games. It replaces the previous multi-agent system with a single, streamlined interface.

## What Changed?

### Before: Multi-Agent System
- 4 separate agents (Game Idea Generator, Content Builder, Catalog Manager, Quality Assurance)
- Users had to manually choose which agent to use
- Required switching between different agent interfaces
- Complex workflow orchestration

### After: Learning Builder Agent
- **Single intelligent agent** with 5 specialized skills
- **Automatic skill detection** based on user requests
- **Seamless skill chaining** for complex tasks
- **Unified chat interface** for all content creation

## Features

### 🎯 Automatic Skill Detection
The agent analyzes your request and automatically uses the right skill(s):

```
User: "Create a math game for 3rd graders"
→ Agent detects: Game Ideation skill (85% confidence)
→ Generates 3-5 game concepts automatically
```

### 🔗 Intelligent Skill Chaining
For complex requests, the agent chains multiple skills together:

```
User: "Build the first concept as an HTML game"
→ Agent uses: Game Builder skill
→ Uses previous game concept from ideation
→ Generates complete HTML game
```

### 💡 5 Specialized Skills

1. **Game Ideation** (💡)
   - Brainstorm creative game concepts
   - Generate 3-5 ideas per request
   - Educational value assessment

2. **HTML Game Builder** (🎮)
   - Create complete HTML games
   - Single-file with embedded CSS/JS
   - WCAG 2.1 AA accessible

3. **React Component Builder** (⚛️)
   - Build React-based games
   - TypeScript support
   - Platform integration

4. **Metadata Formatter** (📋)
   - Format catalog entries
   - Validate metadata
   - Generate code snippets

5. **Accessibility Validator** (✅)
   - WCAG compliance checks
   - Accessibility scoring
   - Detailed recommendations

## How to Use

### Access the Learning Builder
1. Navigate to **Internal → Learning Builder Studio**
2. Or go directly to `/internal/agent-studio`
3. Requires ADMIN role

### Example Interactions

#### Brainstorming Game Ideas
```
You: "Brainstorm 3 science game ideas for 5th graders about ecosystems"

Agent: [Uses Game Ideation skill]
🎮 Generated 3 game concepts for Science (Grade 5):

1. **Ecosystem Builder**
   Build and balance a thriving ecosystem
   Educational Value: 9/10
   Difficulty: medium

2. **Food Chain Challenge**
   ...
```

#### Building an HTML Game
```
You: "Build an HTML game for teaching multiplication tables"

Agent: [Uses Game Builder skill]
🎮 Successfully built "Multiplication Master"!

**Game Details:**
- File Size: 24.5 KB
- Lines of Code: 342
- Accessibility Features: ✅ Yes

**Next Steps:**
1. Save to public/games/multiplication-master.html
2. Test in browser
3. Run accessibility validation
```

#### Checking Accessibility
```
You: "Check if my game is accessible"

Agent: [Uses Accessibility Validator skill]
✅ Accessibility Score: 92/100

**Checks Passed:**
✅ Semantic HTML
✅ ARIA Labels
✅ Keyboard Navigation
✅ Color Contrast

**Recommendations:**
- Add skip navigation links
- Include reduced motion support
```

## Quick Actions

When you first open the chat, you'll see quick action buttons:

- 💡 Brainstorm game ideas
- 🎮 Build HTML game
- ⚛️ Create React game
- ✅ Check accessibility

Click any to pre-fill your message.

## API Endpoints

### Chat with Agent
```bash
POST /api/agent/chat

# Request
{
  "message": "Create a math game for 3rd graders",
  "conversationId": "optional-id"
}

# Response
{
  "response": "🎮 Generated 3 game concepts...",
  "skillsUsed": ["game-ideation"],
  "confidence": 85,
  "output": [...],
  "metadata": {
    "totalExecutionTime": 1250,
    "suggestedNextSteps": ["Build one of these concepts?"]
  }
}
```

### List Available Skills
```bash
GET /api/agent/skills

# Response
{
  "count": 5,
  "skills": [
    {
      "id": "game-ideation",
      "name": "Game Ideation",
      "description": "Brainstorm educational game concepts",
      "triggers": ["game idea", "brainstorm", "concept"],
      ...
    }
  ]
}
```

### Detect Skills for Request
```bash
POST /api/agent/skills/detect

# Request
{
  "message": "Build a React game about fractions"
}

# Response
{
  "detectedSkills": [
    {
      "skillId": "react-component",
      "confidence": 90,
      "reason": "Matched keywords: react, build"
    }
  ],
  "bestMatch": { "skillId": "react-component", ... }
}
```

## Features

### Conversation History
- Last 20 messages preserved per conversation
- Contextual awareness across messages
- Previous skill outputs available for chaining

### Skill Confidence Display
Each response shows:
- Which skill was used
- Confidence level (0-100%)
- Execution time

### Suggested Next Steps
Agent suggests logical next actions:
- After ideation → "Build one of these concepts?"
- After building → "Would you like to validate accessibility?"
- After validation → "Ready to add to catalog?"

## Migration Guide

### For Content Creators

**Old Way:**
1. Choose "Game Idea Generator" agent
2. Generate concepts
3. Switch to "Content Builder" agent
4. Build game
5. Switch to "Quality Assurance" agent
6. Validate game

**New Way:**
1. Open Learning Builder Agent
2. Say: "Create and build a math game for 3rd graders"
3. Agent automatically handles ideation → building → validation

### For Developers

**Old Import:**
```typescript
import { GameIdeaGeneratorAgent } from '@/lib/agents/GameIdeaGeneratorAgent';
const agent = new GameIdeaGeneratorAgent();
```

**New Import:**
```typescript
import { LearningBuilderAgent } from '@/lib/agents/LearningBuilderAgent';
const agent = new LearningBuilderAgent();
await agent.initialize(); // Load all skills
const result = await agent.execute("Create a math game");
```

## Technical Details

### Architecture
- **Frontend**: React component with real-time chat UI
- **Backend**: Learning Builder Agent with skill registry
- **Skills**: 5 modular skill implementations
- **Detection**: Keyword-based with confidence scoring
- **Chaining**: Automatic based on skill suggestions

### File Structure
```
lib/
├── agents/
│   └── LearningBuilderAgent.ts (main agent)
├── skills/
│   ├── BaseSkill.ts (abstract base)
│   ├── SkillRegistry.ts (singleton)
│   ├── types.ts (type definitions)
│   ├── game-ideation/
│   ├── game-builder/
│   ├── react-component/
│   ├── metadata-formatter/
│   └── accessibility-validator/
└── ...

components/agents/
└── LearningBuilderChat.tsx (UI component)

app/api/agent/
├── chat/route.ts (chat endpoint)
└── skills/route.ts (skills endpoint)
```

### Database
- `AgentConversation` model tracks conversations
- `SkillExecution` model logs skill usage
- Analytics on skill performance

## Tips for Best Results

1. **Be Specific**: "Create a multiplication game for grade 3" is better than "make a math game"
2. **Use Context**: After ideation, say "build the first one" instead of repeating details
3. **Ask for Help**: "What skills do you have?" or "How can you help me?"
4. **Chain Actions**: "Create, build, and validate a science game about plants"

## Troubleshooting

### Agent Not Responding
- Check network connection
- Verify you're logged in as ADMIN
- Check browser console for errors

### Wrong Skill Selected
- Be more specific in your request
- Use skill names: "use the game builder skill to..."
- Check detection with `/api/agent/skills/detect`

### No Suggestions Shown
- Some skills don't provide suggestions
- Try asking "what should I do next?"

## Future Enhancements

- [ ] Voice input support
- [ ] Image/file uploads
- [ ] Skill marketplace (custom skills)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Skill performance learning

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Status**: ✅ Production Ready
