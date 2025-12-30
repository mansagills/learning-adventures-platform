# Curriculum Design Skill

## Purpose
Designs comprehensive learning objectives, lesson sequences, and progression strategies from a normalized design brief.

## What This Skill Does

This skill is the **second step** in the course generation pipeline. It takes the structured design brief and creates a complete curriculum with:
- Course structure (chapters and lessons)
- Learning objectives aligned to Bloom's Taxonomy
- Lesson type distribution optimized for engagement
- XP rewards calibrated to difficulty
- Progression strategy with scaffolding

### Key Responsibilities:
1. **Course Structure**: Create 3-5 chapters that organize lessons thematically
2. **Lesson Planning**: Design detailed lesson plans with objectives, duration, and requirements
3. **Type Distribution**: Balance lesson types (40% games, 20% quizzes, etc.)
4. **XP System**: Assign rewards that motivate progression
5. **Scaffolding**: Design difficulty progression that builds on prior knowledge
6. **Assessment Strategy**: Plan when and how to assess mastery

## Input Format

Expects a `designBrief` object from CourseDesignBriefSkill with:
- Student profile (age, grade, interests, challenges)
- Course requirements (subject, topics, difficulty, total lessons)
- Learning preferences and accommodations
- Format requirements (session duration, components)

**Critical**: Design brief must have NO pending clarifications.

## Output Structure

Returns a `curriculum` object with complete course structure:

```typescript
{
  curriculum: {
    courseTitle: string           // Engaging, descriptive title
    courseDescription: string     // 2-3 sentence overview
    estimatedTotalMinutes: number // Sum of all lesson durations
    totalXP: number              // Sum of all XP rewards

    chapters: [
      {
        number: number
        title: string
        description: string
        learningObjectives: string[] // Chapter-level goals
      }
    ],

    lessons: [
      {
        order: number               // Sequential 1, 2, 3...
        chapterNumber: number       // Which chapter this belongs to
        title: string
        description: string
        type: 'VIDEO' | 'INTERACTIVE' | 'GAME' | 'QUIZ' | 'READING' | 'PROJECT'
        learningObjectives: string[] // 2-4 specific, measurable objectives
        priorKnowledge: string[]     // What student needs to know first
        skills: string[]             // Skills practiced in this lesson
        difficulty: 'easy' | 'medium' | 'hard'
        duration: number             // Minutes
        xpReward: number            // Points earned
        requiredScore: number       // For quizzes only (e.g., 70%)
        contentType: 'html' | 'react' | 'video' | 'quiz_json'
        contentRequirements: {
          gameType?: string          // e.g., "drag-drop", "multiple-choice"
          interactionPattern?: string // e.g., "timed challenges", "exploratory"
          assessmentFormat?: string   // For quizzes
        }
      }
    ],

    progression: {
      scaffolding: string         // How difficulty increases
      reinforcement: string       // How concepts are repeated
      assessmentStrategy: string  // When/how to assess
    }
  }
}
```

## Lesson Type Distribution

### Target Ratios (with ±10% tolerance):

**40% GAME Lessons** - Practice through play
- Interactive, engaging practice of concepts
- Immediate feedback
- Multiple attempts encouraged
- Examples: Math Race Rally, Fraction Pizza Shop, Word Builder Challenge

**20% INTERACTIVE Lessons** - Guided exploration
- Scaffolded learning with hints
- Self-paced discovery
- Visual/hands-on manipulatives
- Examples: Virtual Science Lab, Equation Balance Beam, Reading Detective

**20% QUIZ Lessons** - Formative assessment
- Check understanding
- Spaced throughout course (every 4-5 lessons)
- Provide hints for wrong answers
- Examples: Chapter Review Quiz, Mid-Course Check, Mastery Assessment

**10% VIDEO/READING Lessons** - Direct instruction
- Introduce new concepts
- Provide worked examples
- Short (5-15 minutes)
- Examples: Concept Introduction, Worked Example Walkthrough, Story-Based Lesson

**10% PROJECT Lessons** - Summative assessment
- Apply multiple concepts
- Creative expression
- Real-world application
- Examples: Final Project, Portfolio Piece, Problem-Solving Challenge

## Learning Objectives Framework

### Bloom's Taxonomy Verbs by Level:

**Remember**: define, list, recall, identify, name
**Understand**: explain, describe, summarize, interpret, classify
**Apply**: demonstrate, solve, use, calculate, implement
**Analyze**: compare, contrast, examine, categorize, investigate
**Evaluate**: judge, critique, assess, justify, argue
**Create**: design, construct, develop, compose, plan

### Objective Writing Rules:

1. **Be Specific**: "Students will add two-digit numbers with regrouping" (not "understand addition")
2. **Be Measurable**: "Students will solve 8/10 multiplication problems correctly" (not "get better at multiplication")
3. **Build Progressively**: Each lesson's objectives should build on previous lessons
4. **Align to Bloom's**: Start with Remember/Understand, progress to Apply/Analyze/Create

## XP Reward Calibration

### By Difficulty:
- **Easy**: 50-100 XP (onboarding, review, simple practice)
- **Medium**: 100-200 XP (core concepts, multi-step problems)
- **Hard**: 200-300 XP (synthesis, projects, mastery challenges)

### By Engagement Level:
- **Games**: +20% bonus (high engagement)
- **Projects**: +30% bonus (high effort)
- **Quizzes**: Base XP (performance-based)
- **Videos**: -10% (passive consumption)

### Total Course XP:
Sum of all lesson rewards, typically:
- SHORT course (5-10 lessons): 800-1,500 XP
- MEDIUM course (12-20 lessons): 2,000-3,500 XP
- LONG course (25-40 lessons): 4,500-8,000 XP

## Chapter Structure Guidelines

### Number of Chapters:
- SHORT courses: 2-3 chapters
- MEDIUM courses: 3-4 chapters
- LONG courses: 4-5 chapters

### Chapter Themes:
1. **Chapter 1**: Introduction & Foundations
   - Easy difficulty
   - Core vocabulary and concepts
   - Build confidence

2. **Middle Chapters**: Core Content
   - Progressive difficulty
   - Thematic groupings
   - Varied lesson types

3. **Final Chapter**: Synthesis & Mastery
   - Hard difficulty
   - Combine earlier concepts
   - Projects and comprehensive quizzes

## Progression Strategies

### Scaffolding Approaches:

**Spiral Progression**
- Introduce concept simply
- Revisit with added complexity
- Apply in new contexts
- Example: Fractions → Simple fractions → Mixed numbers → Operations with fractions

**Linear Progression**
- Master topic A before topic B
- Each lesson prerequisite for next
- Example: Addition → Subtraction → Multiplication → Division

**Thematic Progression**
- Organize by real-world application
- Connect multiple skills
- Example: "Space Math" course covering measurement, geometry, and data within space theme

### Reinforcement Techniques:

1. **Distributed Practice**: Space similar lessons across chapters
2. **Retrieval Practice**: Include review questions in later lessons
3. **Varied Contexts**: Same skill practiced in different game types
4. **Cumulative Challenges**: Final lessons combine all prior skills

### Assessment Strategy:

**Formative (During Learning)**
- Quizzes every 4-5 lessons
- Immediate feedback with hints
- No penalty for retakes
- Track progress toward mastery

**Summative (End of Learning)**
- Final project or comprehensive quiz
- Demonstrates synthesis of concepts
- Certificate criteria (90%+ recommended)

## Lesson Sequencing Best Practices

### First 2-3 Lessons:
- **Difficulty**: Easy
- **Type**: Mix of VIDEO and INTERACTIVE
- **Purpose**: Onboarding, build confidence, assess baseline
- **Duration**: Shorter sessions (10-15 min)

### Middle Lessons:
- **Difficulty**: Gradual increase (easy → medium → hard)
- **Type**: Heavy on GAME and INTERACTIVE (engagement critical)
- **Purpose**: Core skill development
- **Duration**: Target session length from design brief

### Final 2-3 Lessons:
- **Difficulty**: Hard
- **Type**: QUIZ and PROJECT (mastery checks)
- **Purpose**: Demonstrate learning, earn certificate
- **Duration**: Longer sessions acceptable (30-45 min)

## Content Requirements Specification

For each lesson, specify:

### For GAME Lessons:
```typescript
{
  gameType: "drag-drop" | "multiple-choice" | "fill-in-blank" | "matching" | "sequencing" | "sorting"
  interactionPattern: "timed-challenges" | "progressive-difficulty" | "exploratory" | "puzzle-based"
}
```

### For INTERACTIVE Lessons:
```typescript
{
  gameType: "simulation" | "virtual-manipulative" | "choose-your-path" | "discovery-lab"
  interactionPattern: "guided-exploration" | "scaffolded-hints" | "self-paced"
}
```

### For QUIZ Lessons:
```typescript
{
  assessmentFormat: "multiple-choice" | "mixed-format" | "true-false" | "short-answer"
  requiredScore: 70 // Typical passing threshold
}
```

### For PROJECT Lessons:
```typescript
{
  gameType: "open-ended-creation" | "problem-solving-challenge" | "portfolio-piece"
  interactionPattern: "multi-step-guided" | "creative-freedom"
}
```

## Validation Rules

### Course-Level Checks:
- ✅ Course title is engaging and descriptive
- ✅ Total lessons matches design brief requirement
- ✅ Total XP is sum of all lesson XP
- ✅ Estimated time is sum of all lesson durations
- ✅ 3-5 chapters created

### Lesson-Level Checks:
- ✅ Lessons numbered sequentially (1, 2, 3...)
- ✅ Each lesson belongs to valid chapter
- ✅ Learning objectives use Bloom's Taxonomy verbs
- ✅ Prior knowledge references previous lesson objectives
- ✅ XP rewards within range for difficulty level
- ✅ Quizzes have requiredScore field

### Distribution Checks:
- ✅ GAME lessons: 30-50% of total
- ✅ INTERACTIVE lessons: 10-30% of total
- ✅ QUIZ lessons: 10-30% of total
- ✅ VIDEO/READING lessons: 0-20% of total
- ✅ PROJECT lessons: 0-20% of total

## Usage Example

```typescript
import { CurriculumDesignSkill } from '@/lib/skills/curriculum-design/CurriculumDesignSkill';

const skill = new CurriculumDesignSkill();

const result = await skill.execute({
  userRequest: 'Design curriculum',
  previousOutputs: new Map([
    ['designBrief', {
      student: { name: 'Emma', age: 8, grade: '3rd Grade' },
      course: { subject: 'MATH', topics: ['Multiplication', 'Division'], difficulty: 'medium' },
      format: { totalLessons: 16, sessionDuration: 30 }
      // ... other fields
    }]
  ])
});

if (result.success) {
  const { curriculum } = result.output;

  console.log(`Course: ${curriculum.courseTitle}`);
  console.log(`Chapters: ${curriculum.chapters.length}`);
  console.log(`Lessons: ${curriculum.lessons.length}`);
  console.log(`Total XP: ${curriculum.totalXP}`);
  console.log(`Duration: ${curriculum.estimatedTotalMinutes} minutes`);

  // Lesson type breakdown
  const types = curriculum.lessons.reduce((acc, lesson) => {
    acc[lesson.type] = (acc[lesson.type] || 0) + 1;
    return acc;
  }, {});
  console.log('Lesson types:', types);
}
```

## Integration Points

### Input Source:
- **CourseDesignBriefSkill**: Receives normalized design brief

### Output Consumers:
- **InteractiveContentSkill**: Uses lesson requirements to generate HTML games
- **NarrativeIntegrationSkill**: Uses course structure for story arcs
- **AssessmentGenerationSkill**: Uses quiz lessons for question generation
- **CourseGenerationAgent**: Stores in Course and CourseLesson database records

## Error Handling

### Common Errors:

1. **MISSING_DATA**: No design brief in context
   - Resolution: Ensure CourseDesignBriefSkill ran first

2. **PENDING_CLARIFICATIONS**: Design brief has unresolved questions
   - Resolution: Admin must answer clarifications before curriculum design

3. **VALIDATION_ERROR**: Invalid curriculum structure
   - Resolution: Check lesson count, XP values, chapter assignments

4. **DISTRIBUTION_WARNING**: Lesson types outside target ratios
   - Note: This is a warning, not a blocker (±10% tolerance)

## Performance Considerations

- **Execution Time**: 15-30 seconds (longer than design brief due to lesson detail)
- **Token Usage**: 4,000-8,000 tokens (comprehensive curriculum)
- **Model**: Claude Sonnet 4.5
- **Temperature**: 0.4 (balanced creativity and structure)

## Future Enhancements

1. **Adaptive Difficulty**: Adjust lesson difficulty based on student progress data
2. **Curriculum Templates**: Pre-built structures for common subjects
3. **Standards Alignment**: Map objectives to Common Core, NGSS, etc.
4. **Prerequisite Graphs**: Visualize lesson dependencies
5. **Multi-Path Courses**: Allow students to choose learning paths

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintained By**: Learning Adventures Platform Team
