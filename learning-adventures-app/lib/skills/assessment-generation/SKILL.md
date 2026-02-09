# Assessment Generation Skill

## Purpose

Generates comprehensive assessment materials including diagnostic tests, project rubrics, and additional quiz questions to support formative and summative evaluation of student learning.

## What This Skill Does

This skill is the **fifth (optional) step** in the course generation pipeline. It creates assessment infrastructure beyond the basic quizzes generated in Phase 3:

- Diagnostic pre/post tests to measure growth
- Detailed rubrics for project-based assessments
- Question banks for quiz randomization and retakes
- Assessment strategy and feedback guidelines

### Key Responsibilities:

1. **Diagnostic Tests**: Create pre-tests (baseline) and post-tests (growth measurement)
2. **Project Rubrics**: Design detailed scoring criteria for open-ended work
3. **Question Banks**: Build additional questions for each quiz lesson
4. **Assessment Strategy**: Define formative/summative approaches
5. **Feedback Guidelines**: Provide guidance for teachers/parents

## Input Format

Expects:

- **curriculum** object from CurriculumDesignSkill
- **designBrief** object (optional but recommended for age-appropriate content)

Uses from curriculum:

- All learning objectives
- Project lessons (need rubrics)
- Quiz lessons (need question banks)
- Total lesson count

Uses from design brief:

- Student age and grade
- Mastery threshold (passing score)

## Output Structure

Returns comprehensive assessment materials:

```typescript
{
  diagnosticPreTest: {
    title: string
    purpose: string
    passingScore: number
    questions: [
      {
        id: string
        question: string
        type: 'multiple-choice' | 'short-answer'
        options: [/* for multiple choice */]
        correctAnswer: string
        explanation: string
        skillAssessed: string
        difficulty: 'easy' | 'medium' | 'hard'
        points: number
      }
    ]
  },

  diagnosticPostTest: {
    // Same structure as pre-test
    // Questions cover all course objectives
  },

  projectRubrics: [
    {
      lessonOrder: number
      lessonTitle: string
      rubricTitle: string
      totalPoints: 100
      criteria: [
        {
          dimension: string          // e.g., "Content Accuracy"
          description: string        // What this dimension assesses
          points: number            // Max points for this criterion
          levels: [
            {
              level: 'Advanced' | 'Proficient' | 'Developing' | 'Emerging'
              score: number         // Points for this level
              description: string   // What performance looks like
            }
          ]
        }
      ]
    }
  ],

  additionalQuizQuestions: [
    {
      lessonOrder: number
      lessonTitle: string
      questionBank: [
        // 15-20 questions per quiz
        // Allows randomization and retakes
      ]
    }
  ],

  assessmentStrategy: {
    formativeApproach: string       // Ongoing feedback during learning
    summativeApproach: string       // Final evaluation of mastery
    feedbackGuidelines: string      // How to provide actionable feedback
    retakePolicy: string            // Guidelines for allowing retakes
  }
}
```

## Diagnostic Test Design

### Pre-Test vs. Post-Test

**Pre-Test Purpose**:

- Establish baseline knowledge
- Identify prerequisite skills student already has
- Detect knowledge gaps to address
- Set expectations for learning journey
- **Not graded** - purely diagnostic

**Post-Test Purpose**:

- Measure growth from pre to post
- Assess mastery of course objectives
- Celebrate learning achievement
- Identify areas needing reinforcement
- **Can be graded** - summative assessment

### Question Count

**Pre-Test**: 8-10 questions

- Cover prerequisite skills
- Quick to complete (10-15 minutes)
- Lower stakes

**Post-Test**: 10-12 questions

- Cover all course objectives
- Comprehensive (20-30 minutes)
- Higher stakes (optional grading)

### Difficulty Distribution

**Pre-Test**:

- 60% easy (baseline skills)
- 30% medium (stretch skills)
- 10% hard (preview of course content)

**Post-Test**:

- 30% easy (foundational mastery)
- 50% medium (core competencies)
- 20% hard (advanced application)

### Age-Appropriate Language

**Ages 5-7**:

- Very simple sentences
- Concrete examples (pictures help)
- Avoid abstract concepts
- Use familiar contexts

**Ages 8-10**:

- Clear, direct language
- Some abstract thinking OK
- Mix concrete and conceptual
- Age-appropriate vocabulary

**Ages 11-13**:

- More complex sentences acceptable
- Abstract reasoning expected
- Academic vocabulary with context
- Multi-step problems OK

## Project Rubric Design

### Rubric Structure

**4-Level Performance Scale** (recommended):

1. **Advanced** (90-100% of points): Exceeds expectations
2. **Proficient** (75-89% of points): Meets expectations
3. **Developing** (60-74% of points): Approaching expectations
4. **Emerging** (0-59% of points): Beginning to develop skills

**Alternative: 3-Level Scale** (for younger students):

1. **Got It!** (80-100%): Shows mastery
2. **Getting There** (60-79%): Shows progress
3. **Keep Trying** (0-59%): Needs more practice

### Assessment Criteria (Dimensions)

**For Math Projects**:

- Mathematical Accuracy (30 points)
- Problem-Solving Strategy (25 points)
- Explanation/Reasoning (25 points)
- Presentation/Organization (20 points)

**For Science Projects**:

- Scientific Accuracy (30 points)
- Investigation Process (25 points)
- Data Collection & Analysis (25 points)
- Communication of Findings (20 points)

**For English Projects**:

- Content & Ideas (30 points)
- Organization & Structure (25 points)
- Language & Vocabulary (25 points)
- Creativity & Engagement (20 points)

### Student-Friendly Language

**Instead of**: "Demonstrates proficient application of multiplication strategies"
**Use**: "Shows you know how to use multiplication tricks to solve problems"

**Instead of**: "Exhibits emergent understanding of narrative structure"
**Use**: "Your story is starting to have a beginning, middle, and end"

### Example Rubric

```
PROJECT: Safari Math Master Project
TOTAL POINTS: 100

CRITERION 1: Problem Accuracy (30 points)
- Advanced (27-30): All problems correct, shows work clearly
- Proficient (24-26): Most problems correct, minor calculation errors
- Developing (18-23): Some problems correct, needs to show more work
- Emerging (0-17): Many problems incorrect, work not shown

CRITERION 2: Real-World Connection (25 points)
- Advanced (23-25): Creates original, realistic animal problems
- Proficient (20-22): Uses animal examples from lessons
- Developing (15-19): Animal connection is basic
- Emerging (0-14): No clear animal connection

[... more criteria ...]
```

## Question Bank Design

### Why Question Banks?

**Benefits**:

- **Randomization**: Different students get different questions
- **Retakes**: Student can retake quiz with new questions
- **Practice**: Extra questions for additional practice
- **Fairness**: Reduces cheating, collaborative work

### Bank Size

**Per Quiz Lesson**:

- Minimum: 15 questions (for 10-question quiz)
- Recommended: 20-25 questions
- Allows 2-3 unique quiz versions

### Question Distribution

For 20-question bank:

- 6-8 easy questions (30-40%)
- 8-10 medium questions (40-50%)
- 4-6 hard questions (20-30%)

### Question Variety

**Mix Question Types**:

- 60% multiple choice (quick assessment)
- 25% true/false (concept checks)
- 15% fill-in-blank (recall)

**Vary Content**:

- Some questions test recall
- Some test application
- Some test analysis
- Some test synthesis

## Assessment Strategy Components

### Formative Assessment Approach

**Definition**: Ongoing feedback during learning process

**Strategies**:

- Check-ins after each lesson (thumbs up/down)
- Exit tickets (1-2 questions at lesson end)
- Practice problems with immediate feedback
- Self-assessments ("How confident are you?")
- Peer review of project drafts

**Purpose**: Identify struggles early, adjust instruction

### Summative Assessment Approach

**Definition**: Final evaluation of learning

**Tools**:

- Chapter quizzes (check understanding of section)
- Post-test (measure overall growth)
- Final projects (demonstrate synthesis)
- Portfolio review (collection of best work)

**Purpose**: Determine if student met learning objectives

### Feedback Guidelines

**Effective Feedback is**:

- **Specific**: "Your multiplication strategy in problem 3 was creative" vs. "Good job"
- **Actionable**: "Try using arrays to visualize this problem" vs. "This is wrong"
- **Timely**: Within 24-48 hours of submission
- **Encouraging**: Acknowledge effort, frame mistakes as learning opportunities

**Feedback Framework**:

1. **Glow**: What student did well
2. **Grow**: One specific area to improve
3. **Goal**: Next step for learning

### Retake Policy

**Recommended Policy**:

- Allow retakes for quizzes (different questions from bank)
- Allow project revisions (with rubric feedback)
- No penalty for retakes (learning is goal)
- Max 2-3 retakes per assessment

**Rationale**: Mastery is goal, not speed. Students learn from mistakes.

## Alignment to Learning Objectives

### Ensuring Validity

**Each Assessment Must**:

- Map to specific learning objectives
- Cover Bloom's Taxonomy levels addressed in lessons
- Use similar format/language to lesson practice
- Test what was actually taught

### Assessment Mapping Table

```
Learning Objective → Lesson(s) → Assessment Item(s)

"Recall multiplication facts 2-5" →
  Lessons 1-3 →
    Pre-test Q2, Q4
    Quiz 1 Q1-5
    Post-test Q3, Q5

"Apply multiplication to word problems" →
  Lessons 4, 8, 12 →
    Quiz 2 Q7-10
    Final Project Criterion 1
    Post-test Q9, Q11
```

## Age-Appropriate Rubric Examples

### For Ages 5-7 (Simplified)

```
My Animal Drawing Project

⭐⭐⭐ Amazing! (You did it!)
- Drew 3 or more animals
- Animals look like real animals
- Used lots of colors
- Told me about your animals

⭐⭐ Great Try! (Keep going!)
- Drew 1-2 animals
- Animals are a little tricky to see
- Used some colors
- Told me a little bit

⭐ Keep Practicing! (You can do it!)
- Drew something, but needs more work
- Hard to tell what it is
- Not many colors
- Didn't tell me about it
```

### For Ages 8-10 (Standard)

```
Multiplication Safari Master Project
Total: 100 points

Problem Accuracy (30 points)
✓ Advanced (27-30): All 10 problems solved correctly with clear work shown
✓ Proficient (24-26): 8-9 problems correct, work shown for most
✓ Developing (18-23): 6-7 problems correct, some work shown
✓ Emerging (0-17): Fewer than 6 correct, work not shown

[... additional criteria ...]
```

### For Ages 11-13 (Detailed)

```
Scientific Investigation Project Rubric
Total: 100 points

Hypothesis & Variables (25 points)
Advanced (23-25):
- Testable hypothesis clearly stated
- Independent and dependent variables identified
- Controls explained
- Prediction with scientific reasoning

Proficient (20-22):
- Hypothesis stated
- Variables mostly identified
- Some controls mentioned
- Prediction included

[... additional levels and criteria ...]
```

## Validation Criteria

### Diagnostic Tests:

- ✅ Pre-test covers prerequisite skills
- ✅ Post-test covers all course objectives
- ✅ Questions age-appropriate
- ✅ Explanations clear and helpful
- ✅ Points total 100

### Project Rubrics:

- ✅ Total points = 100
- ✅ 4-5 assessment criteria
- ✅ 3-4 performance levels
- ✅ Descriptors specific and observable
- ✅ Language student-friendly

### Question Banks:

- ✅ 15+ questions per quiz
- ✅ Varied difficulty levels
- ✅ All questions have explanations
- ✅ Questions align to objectives

## Usage Example

```typescript
import { AssessmentGenerationSkill } from '@/lib/skills/assessment-generation/AssessmentGenerationSkill';

const skill = new AssessmentGenerationSkill();

const result = await skill.execute({
  userRequest: 'Generate assessments',
  previousOutputs: new Map([
    [
      'curriculum',
      {
        courseTitle: 'Animal Math Safari',
        lessons: [
          /* lesson objects */
        ],
        chapters: [
          /* chapter objects */
        ],
      },
    ],
    [
      'designBrief',
      {
        student: { age: 8, grade: '3rd Grade' },
        assessment: { masteryThreshold: 70 },
      },
    ],
  ]),
});

if (result.success) {
  const { diagnosticPreTest, projectRubrics, assessmentStrategy } =
    result.output;

  // Store in database
  await prisma.course.update({
    where: { id: courseId },
    data: {
      preTestData: JSON.stringify(diagnosticPreTest),
      postTestData: JSON.stringify(diagnosticPostTest),
      assessmentStrategy: JSON.stringify(assessmentStrategy),
    },
  });

  // Store rubrics with project lessons
  for (const rubric of projectRubrics) {
    await prisma.courseLesson.update({
      where: { order: rubric.lessonOrder },
      data: { rubricData: JSON.stringify(rubric) },
    });
  }
}
```

## Integration Points

### Input Sources:

- **CurriculumDesignSkill**: Learning objectives, lesson structure
- **CourseDesignBriefSkill**: Student age, mastery threshold

### Output Consumers:

- **Course Record**: Store diagnostic tests and assessment strategy
- **CourseLesson Records**: Store rubrics with PROJECT lessons
- **CourseLesson Records**: Store question banks with QUIZ lessons
- **Teacher/Parent Dashboard**: Display assessment strategy

## Performance Considerations

- **Execution Time**: 40-60 seconds
- **Token Usage**: 8,000-14,000 tokens
- **Model**: Claude Sonnet 4.5
- **Temperature**: 0.4 (structured but flexible)

## Future Enhancements

1. **Automated Grading**: AI grading for short-answer questions
2. **Adaptive Testing**: Questions adjust based on performance
3. **Analytics Dashboard**: Visualize student performance data
4. **Peer Assessment**: Rubrics for students to review each other
5. **Standards Alignment**: Map to Common Core, NGSS automatically

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintained By**: Learning Adventures Platform Team
