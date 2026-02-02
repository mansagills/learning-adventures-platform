# Game Ideation Skill

## Overview

The Game Ideation skill brainstorms creative educational game concepts aligned with curriculum standards. It generates 3-5 unique game ideas per request, balancing engagement with learning objectives.

## Purpose

Help educators and content creators quickly generate innovative, pedagogically-sound game concepts that can be implemented for K-12 learning experiences.

## Capabilities

- ✅ Generate 3-5 diverse game concepts per request
- ✅ Align concepts with curriculum standards and learning objectives
- ✅ Consider grade-appropriate difficulty levels
- ✅ Balance 70% engagement with 30% obvious learning
- ✅ Provide educational value assessment (1-10 rating)
- ✅ Suggest gameplay mechanics and estimated play time
- ✅ Recommend implementation approaches

## Trigger Keywords

This skill activates when user requests include:

- `game idea`
- `brainstorm`
- `concept`
- `create game`
- `educational game`
- `game concept`
- `new game`
- `design game`
- `think of a game`

## Example Requests

1. "Create a math game for 3rd graders"
2. "Brainstorm science game ideas for teaching photosynthesis"
3. "I need game concepts for teaching multiplication to elementary students"
4. "Think of engaging educational games about fractions"
5. "Design a game for 5th grade history about the American Revolution"

## Input Requirements

To provide the best game concepts, the skill needs:

- **Required:**
  - Subject area (Math, Science, English, History, or Interdisciplinary)
  - Grade level or age range

- **Optional:**
  - Specific learning objectives
  - Skills to practice
  - Game type preferences (puzzle, adventure, simulation, etc.)
  - Complexity level (simple, moderate, complex)
  - Desired play duration

## Output Format

For each generated concept, you'll receive:

```typescript
{
  title: string;                    // Creative, engaging title
  description: string;               // Clear gameplay overview
  subject: string;                   // Subject area
  gradeLevel: string[];              // Target grade levels
  difficulty: 'easy'|'medium'|'hard'; // Challenge level
  skills: string[];                  // Skills students will practice
  learningObjectives: string[];      // Specific educational goals
  estimatedTime: string;             // Expected play duration
  gameplayMechanics: string[];       // How students interact
  educationalValue: number;          // 1-10 rating with justification
  engagementPotential: number;       // 1-10 predicted student engagement
}
```

## Educational Principles

Game concepts are designed following research-based principles:

### 1. **Engagement First**

- 70% focus on fun, engaging gameplay
- 30% obvious educational content
- Intrinsic motivation through challenge and mastery

### 2. **Active Learning**

- Students actively participate, not passively consume
- Immediate feedback on actions
- Opportunities for experimentation

### 3. **Scaffolded Difficulty**

- Concepts progress from simple to complex
- Multiple difficulty levels or adaptive difficulty
- Support for diverse learning needs

### 4. **Clear Learning Objectives**

- Aligned with curriculum standards
- Measurable skill development
- Explicit connection between gameplay and learning

### 5. **Feasible Implementation**

- Practical to build with available technology
- Reasonable development scope
- Accessible to target age group

## Quality Standards

Each concept must include:

- ✅ Unique, memorable title
- ✅ Clear description (2-3 sentences)
- ✅ At least 3 specific skills to practice
- ✅ Concrete learning objectives
- ✅ Specific gameplay mechanics (not vague)
- ✅ Realistic estimated time (5-30 minutes)
- ✅ Educational value rating with justification
- ✅ Age-appropriate content and difficulty

## Next Steps After Ideation

After generating concepts, users typically:

1. **Select a favorite concept** - Choose which to implement
2. **Build the game** - Use the Game Builder or React Component skills
3. **Validate accessibility** - Use the Accessibility Validator skill
4. **Add to catalog** - Use the Metadata Formatter skill

## Tips for Best Results

- **Be specific** about subject and skills to practice
- **Mention constraints** (time limits, technology requirements)
- **Reference existing games** for style inspiration
- **Ask for variations** if initial concepts aren't quite right
- **Request specific gameplay styles** (puzzle, simulation, adventure, etc.)

## Example Interaction

**User:** "Create a math game for 3rd graders learning multiplication"

**Skill Output:**

```
🎮 Generated 3 game concepts for Math (Grade 3):

1. **Multiplication Mountain Climb**
   Race to the summit by solving multiplication problems at each checkpoint
   Educational Value: 8/10
   Difficulty: medium

2. **Times Table Treasure Hunt**
   Find hidden treasures by correctly answering multiplication questions
   Educational Value: 7/10
   Difficulty: easy

3. **Multiplication Mission Commander**
   Complete space missions using multiplication to navigate asteroids
   Educational Value: 9/10
   Difficulty: medium

Would you like me to implement any of these concepts as a game?
```

## Limitations

- Cannot implement games (only generates concepts)
- Requires subject and grade level to function
- Mock implementation returns preset concepts (will use Claude API in production)
- Does not validate against specific state curriculum standards

## Version

1.0.0

## Related Skills

- **Game Builder** - Implements HTML educational games from concepts
- **React Component** - Creates React-based games from concepts
- **Accessibility Validator** - Ensures games meet WCAG standards
- **Metadata Formatter** - Prepares games for catalog integration
