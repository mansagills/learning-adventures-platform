# Course Design Brief Skill

## Purpose

Normalizes custom course intake form data (60+ fields) into a structured design brief for AI-powered course generation.

## What This Skill Does

This skill is the **first step** in the course generation pipeline. It takes raw course request data from the intake form and transforms it into a clean, structured format that downstream skills can use.

### Key Responsibilities:

1. **Data Normalization**: Extracts and organizes 60+ form fields into logical categories
2. **Calculation**: Determines appropriate course structure (total lessons, duration, etc.)
3. **Intelligence**: Infers difficulty level from student age, grade, and learning goals
4. **Validation**: Identifies ambiguous, contradictory, or missing critical data
5. **Clarification**: Flags issues that require human admin review

## Input Format

Expects a CourseRequest object (from database) with fields like:

- Student profile (name, age, grade, accommodations, challenges)
- Learning preferences (styles, interests, favorite characters)
- Course requirements (subject, topics, learning goals)
- Format preferences (length, session duration, components)
- Assessment criteria (success indicators, reporting)
- Logistics (urgency, budget, device preferences)

## Output Structure

Returns a `designBrief` object with normalized data:

```typescript
{
  designBrief: {
    student: {
      name: string
      age: number
      grade: string
      accommodations: string[]
      challenges: string[]
      learningProfile: {
        styles: string[]      // visual, hands-on, story-based
        interests: string[]   // sports, space, animals, etc.
        favoriteCharacters: string
      }
    },
    course: {
      subject: string         // MATH, SCIENCE, ENGLISH, etc.
      topics: string[]        // specific curriculum topics
      learningGoals: string   // CATCH_UP, REINFORCE, GET_AHEAD
      difficulty: string      // easy, medium, hard
      gradeLevel: string[]
    },
    format: {
      totalLessons: number    // calculated from courseLength
      lessonsPerWeek: number
      sessionDuration: number // minutes per session
      components: string[]    // games, quizzes, projects, videos
      deliveryModes: string[] // online, offline packets
    },
    assessment: {
      successIndicators: string[]
      reportingPreferences: string[]
      masteryThreshold: number  // % score to pass
    },
    flags: {
      requiresOfflinePackets: boolean
      urgencyLevel: string
      budgetTier: string
      allowReuse: boolean
    },
    clarifications: [
      {
        question: string      // What needs clarification
        field: string         // Which field is ambiguous
        reason: string        // Why it needs clarification
      }
    ]
  }
}
```

## Clarification Detection Rules

The skill flags data for clarification when:

### 1. Vague Topics

- **Trigger**: Topics like "just math" or "science stuff" without specifics
- **Action**: Suggests 3-5 curriculum-aligned topics based on grade level
- **Example**: "Math" → "Fractions, Multiplication, Word Problems, Geometry Basics"

### 2. Age/Grade Mismatches

- **Trigger**: Learning goals don't align with developmental stage
- **Example**: 6-year-old requesting "get ahead in calculus"
- **Action**: Flags for admin review with alternative suggestions

### 3. Contradictory Preferences

- **Trigger**: Conflicting requirements
- **Example**: "Wants interactive games" + "Student dislikes screens"
- **Action**: Requests clarification on delivery mode preference

### 4. Generic Interests

- **Trigger**: Interests too broad to theme a course effectively
- **Example**: "Likes everything" or "No specific interests"
- **Action**: Suggests asking follow-up questions about hobbies, shows, books

### 5. Unfeasible Accommodations

- **Trigger**: Requested accommodations not supported by current content types
- **Example**: "Requires sign language interpreter" (no video content with ASL)
- **Action**: Flags limitation and suggests alternatives (captions, visual-heavy games)

## Course Structure Calculations

### Total Lessons Formula:

- **SHORT** (1-2 weeks): 5-10 lessons
- **MEDIUM** (3-4 weeks): 12-20 lessons
- **LONG** (6-8 weeks): 25-40 lessons

### Difficulty Determination:

- **Easy**: Age matches grade level OR learning goal = CATCH_UP
- **Medium**: Age matches grade level AND learning goal = REINFORCE
- **Hard**: Age below grade level OR learning goal = GET_AHEAD

### Session Duration:

- Directly maps from form selection (15, 30, 45, or 60 minutes)

### Lessons Per Week:

- Calculated as: `totalLessons / (courseLength in weeks)`
- Example: 12 lessons over 3 weeks = 4 lessons/week

## Usage Example

```typescript
import { CourseDesignBriefSkill } from '@/lib/skills/course-design-brief/CourseDesignBriefSkill';

const skill = new CourseDesignBriefSkill();

// Check if skill can handle this request
const confidence = await skill.canHandle('Normalize this course request');

if (confidence > 70) {
  // Execute skill
  const result = await skill.execute({
    userRequest: 'Create design brief',
    previousOutputs: new Map([
      [
        'courseRequest',
        {
          studentName: 'Emma',
          studentAge: 8,
          gradeLevel: '3rd Grade',
          primarySubject: 'MATH',
          // ... 50+ more fields
        },
      ],
    ]),
  });

  if (result.success) {
    const { designBrief } = result.output;

    // Check if clarifications needed
    if (designBrief.clarifications.length > 0) {
      console.log('Admin review required:', designBrief.clarifications);
      // Update CourseRequest with clarification questions
    } else {
      console.log('Design brief ready for curriculum generation');
      // Pass to CurriculumDesignSkill
    }
  }
}
```

## Integration Points

### Input Sources:

- CourseRequest database record (via previousOutputs)
- JSON data in userRequest field
- Admin-edited clarification responses

### Output Consumers:

- **CurriculumDesignSkill**: Uses design brief to create lesson structure
- **NarrativeIntegrationSkill**: Uses student interests and favorite characters
- **CourseGenerationAgent**: Stores in aiMetadata for audit trail

## Error Handling

### Common Errors:

1. **MISSING_DATA**: No CourseRequest found in context
   - Resolution: Verify courseRequest in previousOutputs Map

2. **VALIDATION_ERROR**: Invalid output structure
   - Resolution: Check required fields (student.name, student.age, etc.)

3. **EXECUTION_ERROR**: Claude API failure
   - Resolution: Retry with exponential backoff (inherited from BaseSkill)

## Testing

### Test Cases:

1. **Complete Data**: All fields populated, no contradictions
   - Expected: `clarifications` array empty

2. **Vague Topics**: Subject = "MATH", topics = []
   - Expected: Clarification requesting specific math topics

3. **Age/Grade Mismatch**: Age 6, Grade "8th", Goal "GET_AHEAD"
   - Expected: Clarification about unrealistic expectations

4. **Contradictory Preferences**: Components includes "games", learningChallenges includes "dislikes screens"
   - Expected: Clarification about delivery mode

### Sample Test Data:

```json
{
  "id": "test-123",
  "studentName": "Test Student",
  "studentAge": 8,
  "gradeLevel": "3rd Grade",
  "primarySubject": "MATH",
  "specificTopics": [],
  "learningGoal": "CATCH_UP",
  "courseLength": "MEDIUM",
  "sessionDuration": "30 minutes",
  "urgencyLevel": "STANDARD",
  "budgetTier": "FREE"
}
```

## Performance Considerations

- **Execution Time**: 2-5 seconds (Claude API call)
- **Retry Logic**: Up to 3 attempts for transient failures
- **Rate Limiting**: Respects Anthropic API limits
- **Caching**: Design briefs stored in CourseRequest.aiMetadata

## Future Enhancements

1. **Intelligent Topic Suggestions**: Use RAG to suggest curriculum-aligned topics
2. **Multi-Language Support**: Normalize intake forms in multiple languages
3. **Learning Style Analysis**: ML model to infer optimal learning styles from student profile
4. **Historical Data**: Learn from past successful courses to improve suggestions
5. **Parent Interview Mode**: Generate follow-up questions for ambiguous requests

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintained By**: Learning Adventures Platform Team
