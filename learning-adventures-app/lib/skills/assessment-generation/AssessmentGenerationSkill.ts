import { BaseSkill } from '../BaseSkill';
import type { SkillMetadata, SkillContext, SkillResult } from '../types';

interface DiagnosticTest {
  title: string;
  purpose: string;
  passingScore: number;
  questions: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'short-answer';
    options?: Array<{
      id: string;
      text: string;
      correct: boolean;
    }>;
    correctAnswer?: string;
    explanation: string;
    skillAssessed: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
  }>;
}

interface ProjectRubric {
  lessonOrder: number;
  lessonTitle: string;
  rubricTitle: string;
  totalPoints: number;
  criteria: Array<{
    dimension: string;
    description: string;
    points: number;
    levels: Array<{
      level: string;
      score: number;
      description: string;
    }>;
  }>;
}

interface AdditionalQuizQuestions {
  lessonOrder: number;
  lessonTitle: string;
  questionBank: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
    options?: Array<{
      id: string;
      text: string;
      correct: boolean;
    }>;
    correctAnswer?: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
  }>;
}

interface AssessmentOutput {
  diagnosticPreTest?: DiagnosticTest;
  diagnosticPostTest?: DiagnosticTest;
  projectRubrics: ProjectRubric[];
  additionalQuizQuestions: AdditionalQuizQuestions[];
  assessmentStrategy: {
    formativeApproach: string;
    summativeApproach: string;
    feedbackGuidelines: string;
    retakePolicy: string;
  };
}

export class AssessmentGenerationSkill extends BaseSkill {
  getMetadata(): SkillMetadata {
    return {
      id: 'assessment-generation',
      name: 'Assessment Generation Specialist',
      description: 'Generates diagnostic tests, project rubrics, and additional quiz questions for comprehensive course assessment',
      triggers: [
        'generate assessments',
        'create diagnostic test',
        'create rubrics',
        'generate quiz questions'
      ],
      capabilities: [
        'Create diagnostic pre/post tests',
        'Generate project rubrics with clear criteria',
        'Build question banks for quiz lessons',
        'Align assessments to learning objectives',
        'Design formative and summative assessments',
        'Create age-appropriate rubric language',
        'Define mastery criteria and scoring',
        'Provide actionable feedback guidelines'
      ],
      examples: [
        'Generate assessments for this curriculum',
        'Create diagnostic tests and rubrics',
        'Build question bank for quizzes'
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md'
    };
  }

  async canHandle(userRequest: string, context?: Partial<SkillContext>): Promise<number> {
    const lowerRequest = userRequest.toLowerCase();

    // High confidence triggers
    if (lowerRequest.includes('assessment') ||
        lowerRequest.includes('diagnostic') ||
        lowerRequest.includes('rubric')) {
      return 95;
    }

    // Medium confidence triggers
    if (lowerRequest.includes('test') || lowerRequest.includes('quiz')) {
      return 75;
    }

    // Check if curriculum is in context
    if (context?.previousOutputs?.has('curriculum')) {
      return 85;
    }

    return 0;
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      // Extract curriculum and design brief from context
      const curriculum = this.extractCurriculum(context);
      const designBrief = this.extractDesignBrief(context);

      if (!curriculum) {
        return this.buildErrorResult(
          'No curriculum found in context',
          'MISSING_DATA',
          { hint: 'Expected curriculum in previousOutputs from CurriculumDesignSkill' }
        );
      }

      // Load guidance from SKILL.md
      const guidance = this.loadGuidance();

      // Generate assessments
      const assessmentData = await this.generateAssessments(curriculum, designBrief, guidance);

      // Validate output structure
      if (!this.validate(assessmentData)) {
        return this.buildErrorResult(
          'Invalid assessment structure returned',
          'VALIDATION_ERROR',
          { output: assessmentData }
        );
      }

      const executionTime = Date.now() - startTime;

      const summary = this.buildSummary(assessmentData);

      return this.buildSuccessResult(
        assessmentData,
        summary,
        executionTime,
        95,
        [] // Final skill - no suggestions
      );

    } catch (error) {
      return this.buildErrorResult(
        `Failed to generate assessments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTION_ERROR',
        { error: error instanceof Error ? error.stack : error }
      );
    }
  }

  protected validate(output: any): boolean {
    if (!output || typeof output !== 'object') return false;
    if (!output.assessmentStrategy) return false;
    if (!Array.isArray(output.projectRubrics)) return false;
    if (!Array.isArray(output.additionalQuizQuestions)) return false;

    return true;
  }

  private extractCurriculum(context: SkillContext): any {
    if (context.previousOutputs?.has('curriculum')) {
      return context.previousOutputs.get('curriculum');
    }
    return null;
  }

  private extractDesignBrief(context: SkillContext): any {
    if (context.previousOutputs?.has('designBrief')) {
      return context.previousOutputs.get('designBrief');
    }
    return null;
  }

  private async generateAssessments(
    curriculum: any,
    designBrief: any,
    guidance: string
  ): Promise<AssessmentOutput> {

    const prompt = this.buildPrompt(curriculum, designBrief, guidance);
    const assessmentData = await this.callClaudeForAssessments(prompt);

    return assessmentData;
  }

  private buildPrompt(curriculum: any, designBrief: any, guidance: string): string {
    const studentAge = designBrief?.student?.age || 10;
    const gradeLevel = designBrief?.student?.grade || 'Elementary';
    const masteryThreshold = designBrief?.assessment?.masteryThreshold || 70;

    // Identify project lessons
    const projectLessons = curriculum.lessons.filter((l: any) => l.type === 'PROJECT');
    const quizLessons = curriculum.lessons.filter((l: any) => l.type === 'QUIZ');

    return `You are an educational assessment expert. Create comprehensive assessments for this course.

COURSE INFORMATION:
Title: ${curriculum.courseTitle}
Total Lessons: ${curriculum.lessons.length}
Chapters: ${curriculum.chapters.length}

LEARNING OBJECTIVES (All):
${curriculum.chapters.map((ch: any) =>
  ch.learningObjectives.map((obj: string) => `- ${obj}`).join('\n')
).join('\n')}

STUDENT PROFILE:
- Age: ${studentAge}
- Grade: ${gradeLevel}
- Mastery Threshold: ${masteryThreshold}%

PROJECT LESSONS (need rubrics):
${projectLessons.map((l: any) =>
  `Lesson ${l.order}: ${l.title} - ${l.description}`
).join('\n') || 'None'}

QUIZ LESSONS (need additional questions):
${quizLessons.map((l: any) =>
  `Lesson ${l.order}: ${l.title} - ${l.learningObjectives.join(', ')}`
).join('\n') || 'None'}

ASSESSMENT REQUIREMENTS:

1. DIAGNOSTIC PRE-TEST:
   - 8-10 questions covering prerequisite skills
   - Identify knowledge gaps before course starts
   - Multiple choice format
   - Age-appropriate language

2. DIAGNOSTIC POST-TEST:
   - 10-12 questions covering all course objectives
   - Measure growth from pre to post
   - Mix of easy/medium/hard
   - Celebrate learning achievement

3. PROJECT RUBRICS:
   - Create rubric for each PROJECT lesson
   - 4-5 assessment criteria per rubric
   - 3-4 performance levels (Emerging, Developing, Proficient, Advanced)
   - Total 100 points per rubric
   - Clear, student-friendly language

4. ADDITIONAL QUIZ QUESTIONS:
   - 15-20 questions per QUIZ lesson (question bank)
   - Allow randomization and retakes
   - Vary difficulty levels
   - Include explanations

5. ASSESSMENT STRATEGY:
   - Formative approach (ongoing feedback)
   - Summative approach (final evaluation)
   - Feedback guidelines for teachers/parents
   - Retake policy

GUIDANCE:
${guidance}

REQUIRED OUTPUT STRUCTURE:
{
  "diagnosticPreTest": {
    "title": "string",
    "purpose": "string",
    "passingScore": number,
    "questions": [/* question objects */]
  },
  "diagnosticPostTest": {
    "title": "string",
    "purpose": "string",
    "passingScore": number,
    "questions": [/* question objects */]
  },
  "projectRubrics": [
    {
      "lessonOrder": number,
      "lessonTitle": "string",
      "rubricTitle": "string",
      "totalPoints": 100,
      "criteria": [
        {
          "dimension": "string",
          "description": "string",
          "points": number,
          "levels": [
            {
              "level": "Advanced | Proficient | Developing | Emerging",
              "score": number,
              "description": "string"
            }
          ]
        }
      ]
    }
  ],
  "additionalQuizQuestions": [
    {
      "lessonOrder": number,
      "lessonTitle": "string",
      "questionBank": [/* question objects */]
    }
  ],
  "assessmentStrategy": {
    "formativeApproach": "string",
    "summativeApproach": "string",
    "feedbackGuidelines": "string",
    "retakePolicy": "string"
  }
}

OUTPUT FORMAT: Return ONLY valid JSON matching the structure above. No markdown formatting, no explanations outside the JSON.`;
  }

  private async callClaudeForAssessments(prompt: string): Promise<AssessmentOutput> {
    const { callClaudeWithRetry, extractTextFromResponse, COURSE_GENERATION_MODEL } = await import('@/lib/anthropic/client');

    try {
      const response = await callClaudeWithRetry({
        model: COURSE_GENERATION_MODEL,
        max_tokens: 16000, // Large for comprehensive assessments
        temperature: 0.4, // Balanced for structured content
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const text = extractTextFromResponse(response);
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in assessment response');
      }

      const assessmentOutput = JSON.parse(jsonMatch[0]) as AssessmentOutput;

      return assessmentOutput;

    } catch (error) {
      throw new Error(
        `Failed to call Claude API for assessment generation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildSummary(data: AssessmentOutput): string {
    const parts = [];

    if (data.diagnosticPreTest) {
      parts.push(`Pre-test: ${data.diagnosticPreTest.questions.length} questions`);
    }

    if (data.diagnosticPostTest) {
      parts.push(`Post-test: ${data.diagnosticPostTest.questions.length} questions`);
    }

    if (data.projectRubrics.length > 0) {
      parts.push(`${data.projectRubrics.length} project rubrics`);
    }

    if (data.additionalQuizQuestions.length > 0) {
      const totalQuestions = data.additionalQuizQuestions.reduce((sum, quiz) => sum + quiz.questionBank.length, 0);
      parts.push(`${totalQuestions} additional quiz questions`);
    }

    return `Assessments generated: ${parts.join(', ')}`;
  }
}
