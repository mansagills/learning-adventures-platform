import { BaseSkill } from '../BaseSkill';
import type { SkillMetadata, SkillContext, SkillResult } from '../types';

interface Chapter {
  number: number;
  title: string;
  description: string;
  learningObjectives: string[];
}

interface Lesson {
  order: number;
  chapterNumber: number;
  title: string;
  description: string;
  type: 'VIDEO' | 'INTERACTIVE' | 'GAME' | 'QUIZ' | 'READING' | 'PROJECT';
  learningObjectives: string[];
  priorKnowledge: string[];
  skills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  xpReward: number;
  requiredScore?: number;
  contentType: 'html' | 'react' | 'video' | 'quiz_json';
  contentRequirements: {
    gameType?: string;
    interactionPattern?: string;
    assessmentFormat?: string;
  };
}

interface Progression {
  scaffolding: string;
  reinforcement: string;
  assessmentStrategy: string;
}

interface CurriculumOutput {
  curriculum: {
    courseTitle: string;
    courseDescription: string;
    estimatedTotalMinutes: number;
    totalXP: number;
    chapters: Chapter[];
    lessons: Lesson[];
    progression: Progression;
  };
}

export class CurriculumDesignSkill extends BaseSkill {
  getMetadata(): SkillMetadata {
    return {
      id: 'curriculum-design',
      name: 'Curriculum Design Specialist',
      description:
        'Designs comprehensive learning objectives, lesson sequences, and progression strategies for courses',
      triggers: [
        'design curriculum',
        'create lesson structure',
        'design learning objectives',
        'plan course progression',
      ],
      capabilities: [
        'Create course title and description',
        'Design chapter structure (3-5 chapters)',
        'Create detailed lesson plans with learning objectives',
        'Distribute lesson types following pedagogical ratios',
        'Assign XP rewards based on difficulty and engagement',
        'Define progression strategy with scaffolding',
        "Apply Bloom's Taxonomy for learning objectives",
        'Ensure lesson sequencing builds on prior knowledge',
      ],
      examples: [
        'Design curriculum for this course',
        'Create lesson structure from the design brief',
        'Plan learning progression for math course',
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md',
    };
  }

  async canHandle(
    userRequest: string,
    context?: Partial<SkillContext>
  ): Promise<number> {
    const lowerRequest = userRequest.toLowerCase();

    // High confidence triggers
    if (
      lowerRequest.includes('curriculum') ||
      lowerRequest.includes('lesson structure') ||
      lowerRequest.includes('learning objectives')
    ) {
      return 95;
    }

    // Medium confidence triggers
    if (lowerRequest.includes('design') && lowerRequest.includes('course')) {
      return 75;
    }

    // Check if design brief is in context
    if (context?.previousOutputs?.has('designBrief')) {
      return 90;
    }

    return 0;
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      // Extract design brief from context
      const designBrief = this.extractDesignBrief(context);

      if (!designBrief) {
        return this.buildErrorResult(
          'No design brief found in context',
          'MISSING_DATA',
          {
            hint: 'Expected designBrief in previousOutputs from CourseDesignBriefSkill',
          }
        );
      }

      // Check if design brief has clarifications
      if (designBrief.clarifications && designBrief.clarifications.length > 0) {
        return this.buildErrorResult(
          'Cannot design curriculum with pending clarifications',
          'PENDING_CLARIFICATIONS',
          {
            clarifications: designBrief.clarifications,
            hint: 'Resolve clarifications in design brief before proceeding to curriculum design',
          }
        );
      }

      // Load guidance from SKILL.md
      const guidance = this.loadGuidance();

      // Build prompt for Claude
      const prompt = this.buildPrompt(designBrief, guidance);

      // Call Claude API to design curriculum
      const curriculumData = await this.callClaudeForCurriculum(prompt);

      // Validate output structure
      if (!this.validate(curriculumData)) {
        return this.buildErrorResult(
          'Invalid curriculum structure returned',
          'VALIDATION_ERROR',
          { output: curriculumData }
        );
      }

      // Validate lesson type distribution
      const distributionWarnings = this.validateLessonTypeDistribution(
        curriculumData.curriculum.lessons
      );

      const executionTime = Date.now() - startTime;

      return this.buildSuccessResult(
        curriculumData,
        `Curriculum designed successfully: ${curriculumData.curriculum.lessons.length} lessons across ${curriculumData.curriculum.chapters.length} chapters`,
        executionTime,
        95,
        ['interactive-content', 'narrative-integration'] // Suggest next skills
      );
    } catch (error) {
      return this.buildErrorResult(
        `Failed to design curriculum: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTION_ERROR',
        { error: error instanceof Error ? error.stack : error }
      );
    }
  }

  protected validate(output: any): boolean {
    if (!output || typeof output !== 'object') return false;
    if (!output.curriculum) return false;

    const curriculum = output.curriculum;

    // Validate required fields
    if (!curriculum.courseTitle || !curriculum.courseDescription) {
      return false;
    }

    if (!curriculum.totalXP || curriculum.totalXP <= 0) {
      return false;
    }

    if (
      !curriculum.estimatedTotalMinutes ||
      curriculum.estimatedTotalMinutes <= 0
    ) {
      return false;
    }

    // Validate chapters
    if (
      !Array.isArray(curriculum.chapters) ||
      curriculum.chapters.length === 0
    ) {
      return false;
    }

    for (const chapter of curriculum.chapters) {
      if (!chapter.number || !chapter.title || !chapter.description) {
        return false;
      }
      if (!Array.isArray(chapter.learningObjectives)) {
        return false;
      }
    }

    // Validate lessons
    if (!Array.isArray(curriculum.lessons) || curriculum.lessons.length === 0) {
      return false;
    }

    for (const lesson of curriculum.lessons) {
      if (!lesson.order || !lesson.title || !lesson.type) {
        return false;
      }
      if (!lesson.duration || lesson.duration <= 0) {
        return false;
      }
      if (!lesson.xpReward || lesson.xpReward <= 0) {
        return false;
      }
      if (
        !Array.isArray(lesson.learningObjectives) ||
        lesson.learningObjectives.length === 0
      ) {
        return false;
      }
    }

    // Validate progression
    if (!curriculum.progression || !curriculum.progression.scaffolding) {
      return false;
    }

    return true;
  }

  private extractDesignBrief(context: SkillContext): any {
    // Try to get from previousOutputs
    if (context.previousOutputs?.has('designBrief')) {
      return context.previousOutputs.get('designBrief');
    }

    // Try to parse from userRequest as JSON
    try {
      const jsonMatch = context.userRequest.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.designBrief) {
          return parsed.designBrief;
        }
      }
    } catch (e) {
      // Not valid JSON
    }

    return null;
  }

  private buildPrompt(designBrief: any, guidance: string): string {
    return `You are a curriculum design expert. Create a complete course structure with learning objectives, lesson sequence, and progression strategy.

DESIGN BRIEF:
${JSON.stringify(designBrief, null, 2)}

GUIDANCE:
${guidance}

TASK:
1. Design course title, description, and chapter structure (3-5 chapters)
2. Create detailed lesson plan for each lesson (total lessons = ${designBrief.format.totalLessons})
3. Distribute lesson types following recommended ratios (40% games, 20% interactive, 20% quizzes, 10% video, 10% projects)
4. Assign XP rewards (easy: 50-100, medium: 100-200, hard: 200-300)
5. Define progression strategy (how difficulty increases over time)

LEARNING OBJECTIVES RULES:
- Use Bloom's Taxonomy verbs (understand, analyze, apply, create)
- Each lesson should have 2-4 specific, measurable objectives
- Objectives should build on prior lessons (scaffolding)
- Final lessons should synthesize earlier concepts

LESSON SEQUENCING:
- Chapters should represent major concept groups
- First 2-3 lessons should be easy (onboarding)
- Middle lessons should introduce core concepts with varied practice
- Final 2-3 lessons should be mastery checks (quizzes or projects)

XP CALCULATION:
- Total course XP = sum of all lesson XP rewards
- Distribute XP to reward engagement: games and projects get higher XP
- Quiz XP should be conditional on passing score

LESSON TYPE DISTRIBUTION TARGET:
- 40% GAME lessons (practice through play)
- 20% INTERACTIVE lessons (guided exploration)
- 20% QUIZ lessons (formative assessment)
- 10% VIDEO/READING lessons (direct instruction)
- 10% PROJECT lessons (summative assessment)

REQUIRED OUTPUT STRUCTURE:
{
  "curriculum": {
    "courseTitle": "string",
    "courseDescription": "string",
    "estimatedTotalMinutes": number,
    "totalXP": number,
    "chapters": [
      {
        "number": number,
        "title": "string",
        "description": "string",
        "learningObjectives": ["string"]
      }
    ],
    "lessons": [
      {
        "order": number,
        "chapterNumber": number,
        "title": "string",
        "description": "string",
        "type": "VIDEO | INTERACTIVE | GAME | QUIZ | READING | PROJECT",
        "learningObjectives": ["string"],
        "priorKnowledge": ["string"],
        "skills": ["string"],
        "difficulty": "easy | medium | hard",
        "duration": number,
        "xpReward": number,
        "requiredScore": number (optional, for quizzes only),
        "contentType": "html | react | video | quiz_json",
        "contentRequirements": {
          "gameType": "string (optional)",
          "interactionPattern": "string (optional)",
          "assessmentFormat": "string (optional)"
        }
      }
    ],
    "progression": {
      "scaffolding": "string (explain how difficulty increases)",
      "reinforcement": "string (explain how concepts are repeated)",
      "assessmentStrategy": "string (explain when/how to assess)"
    }
  }
}

OUTPUT FORMAT: Return ONLY valid JSON matching the curriculum structure. No markdown formatting, no explanations outside the JSON.`;
  }

  private async callClaudeForCurriculum(
    prompt: string
  ): Promise<CurriculumOutput> {
    const {
      callClaudeWithRetry,
      extractTextFromResponse,
      COURSE_GENERATION_MODEL,
    } = await import('@/lib/anthropic/client');

    try {
      const response = await callClaudeWithRetry({
        model: COURSE_GENERATION_MODEL,
        max_tokens: 16000, // Very large for comprehensive curriculum with many lessons
        temperature: 0.4, // Slightly higher for creative lesson design
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text first to debug
      const text = extractTextFromResponse(response);

      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const curriculumOutput = JSON.parse(jsonMatch[0]) as CurriculumOutput;

      return curriculumOutput;
    } catch (error) {
      throw new Error(
        `Failed to call Claude API for curriculum design: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateLessonTypeDistribution(lessons: Lesson[]): string[] {
    const warnings: string[] = [];
    const total = lessons.length;

    // Count each type
    const typeCounts = {
      GAME: 0,
      INTERACTIVE: 0,
      QUIZ: 0,
      VIDEO: 0,
      READING: 0,
      PROJECT: 0,
    };

    for (const lesson of lessons) {
      if (lesson.type in typeCounts) {
        typeCounts[lesson.type]++;
      }
    }

    // Calculate percentages
    const percentages = {
      GAME: (typeCounts.GAME / total) * 100,
      INTERACTIVE: (typeCounts.INTERACTIVE / total) * 100,
      QUIZ: (typeCounts.QUIZ / total) * 100,
      VIDEO: ((typeCounts.VIDEO + typeCounts.READING) / total) * 100,
      PROJECT: (typeCounts.PROJECT / total) * 100,
    };

    // Target ratios with ±10% tolerance
    const targets = {
      GAME: { target: 40, min: 30, max: 50 },
      INTERACTIVE: { target: 20, min: 10, max: 30 },
      QUIZ: { target: 20, min: 10, max: 30 },
      VIDEO: { target: 10, min: 0, max: 20 },
      PROJECT: { target: 10, min: 0, max: 20 },
    };

    // Check each type
    for (const [type, range] of Object.entries(targets)) {
      const actual = percentages[type as keyof typeof percentages];
      if (actual < range.min || actual > range.max) {
        warnings.push(
          `${type} lessons: ${actual.toFixed(1)}% (target: ${range.target}%, acceptable: ${range.min}-${range.max}%)`
        );
      }
    }

    return warnings;
  }
}
