import { BaseSkill } from '../BaseSkill';
import type { SkillMetadata, SkillContext, SkillResult } from '../types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface LessonContent {
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  contentType: string;
  filePath?: string;
  htmlContent?: string;
  quizJson?: any;
  metadata: {
    generatedAt: string;
    tokenCount?: number;
    fileSize?: number;
  };
}

interface InteractiveContentOutput {
  generatedContent: LessonContent[];
  summary: {
    totalLessons: number;
    gamesGenerated: number;
    quizzesGenerated: number;
    interactivesGenerated: number;
    totalFiles: number;
  };
}

export class InteractiveContentSkill extends BaseSkill {
  getMetadata(): SkillMetadata {
    return {
      id: 'interactive-content',
      name: 'Interactive Content Generator',
      description: 'Generates HTML games, interactive widgets, and quiz JSON for curriculum lessons',
      triggers: [
        'generate content',
        'create games',
        'generate interactive lessons',
        'create quiz content'
      ],
      capabilities: [
        'Generate standalone HTML games with embedded CSS/JS',
        'Create interactive educational widgets',
        'Generate quiz questions in JSON format',
        'Apply student interests as theming',
        'Ensure mobile-responsive design',
        'Include accessibility features',
        'Generate age-appropriate content',
        'Create engaging visual designs'
      ],
      examples: [
        'Generate content for this curriculum',
        'Create HTML games for game lessons',
        'Generate quiz questions for assessment lessons'
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md'
    };
  }

  async canHandle(userRequest: string, context?: Partial<SkillContext>): Promise<number> {
    const lowerRequest = userRequest.toLowerCase();

    // High confidence triggers
    if (lowerRequest.includes('generate content') ||
        lowerRequest.includes('create games') ||
        lowerRequest.includes('interactive content')) {
      return 95;
    }

    // Medium confidence triggers
    if (lowerRequest.includes('generate') &&
        (lowerRequest.includes('lesson') || lowerRequest.includes('quiz'))) {
      return 75;
    }

    // Check if curriculum is in context
    if (context?.previousOutputs?.has('curriculum')) {
      return 90;
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

      // Generate content for each lesson that needs it
      const generatedContent: LessonContent[] = [];
      let gamesGenerated = 0;
      let quizzesGenerated = 0;
      let interactivesGenerated = 0;

      for (const lesson of curriculum.lessons) {
        // Only generate content for types that need it
        if (['GAME', 'INTERACTIVE', 'QUIZ'].includes(lesson.type)) {
          console.log(`Generating content for Lesson ${lesson.order}: ${lesson.title} (${lesson.type})`);

          const content = await this.generateLessonContent(
            lesson,
            designBrief,
            curriculum.courseTitle,
            guidance
          );

          generatedContent.push(content);

          // Track counts
          if (lesson.type === 'GAME') gamesGenerated++;
          if (lesson.type === 'QUIZ') quizzesGenerated++;
          if (lesson.type === 'INTERACTIVE') interactivesGenerated++;
        }
      }

      const output: InteractiveContentOutput = {
        generatedContent,
        summary: {
          totalLessons: curriculum.lessons.length,
          gamesGenerated,
          quizzesGenerated,
          interactivesGenerated,
          totalFiles: generatedContent.length
        }
      };

      const executionTime = Date.now() - startTime;

      return this.buildSuccessResult(
        output,
        `Generated ${generatedContent.length} interactive content files: ${gamesGenerated} games, ${interactivesGenerated} interactives, ${quizzesGenerated} quizzes`,
        executionTime,
        95,
        ['narrative-integration', 'assessment-generation']
      );

    } catch (error) {
      return this.buildErrorResult(
        `Failed to generate interactive content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTION_ERROR',
        { error: error instanceof Error ? error.stack : error }
      );
    }
  }

  protected validate(output: any): boolean {
    if (!output || typeof output !== 'object') return false;
    if (!output.generatedContent || !Array.isArray(output.generatedContent)) return false;
    if (!output.summary) return false;

    return true;
  }

  private extractCurriculum(context: SkillContext): any {
    if (context.previousOutputs?.has('curriculum')) {
      return context.previousOutputs.get('curriculum');
    }

    try {
      const jsonMatch = context.userRequest.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.curriculum) {
          return parsed.curriculum;
        }
      }
    } catch (e) {
      // Not valid JSON
    }

    return null;
  }

  private extractDesignBrief(context: SkillContext): any {
    if (context.previousOutputs?.has('designBrief')) {
      return context.previousOutputs.get('designBrief');
    }
    return null;
  }

  private async generateLessonContent(
    lesson: any,
    designBrief: any,
    courseTitle: string,
    guidance: string
  ): Promise<LessonContent> {

    if (lesson.type === 'QUIZ') {
      return this.generateQuizContent(lesson, designBrief, courseTitle, guidance);
    } else if (lesson.type === 'GAME' || lesson.type === 'INTERACTIVE') {
      return this.generateHTMLContent(lesson, designBrief, courseTitle, guidance);
    }

    throw new Error(`Unsupported lesson type: ${lesson.type}`);
  }

  private async generateQuizContent(
    lesson: any,
    designBrief: any,
    courseTitle: string,
    guidance: string
  ): Promise<LessonContent> {

    const prompt = this.buildQuizPrompt(lesson, designBrief, courseTitle, guidance);
    const quizJson = await this.callClaudeForQuiz(prompt);

    const content: LessonContent = {
      lessonId: `lesson-${lesson.order}`,
      lessonTitle: lesson.title,
      lessonType: lesson.type,
      contentType: 'quiz_json',
      quizJson,
      metadata: {
        generatedAt: new Date().toISOString(),
        tokenCount: JSON.stringify(quizJson).length
      }
    };

    return content;
  }

  private async generateHTMLContent(
    lesson: any,
    designBrief: any,
    courseTitle: string,
    guidance: string
  ): Promise<LessonContent> {

    const prompt = this.buildHTMLPrompt(lesson, designBrief, courseTitle, guidance);
    const htmlContent = await this.callClaudeForHTML(prompt);

    // Generate filename
    const sanitizedTitle = lesson.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const filename = `lesson-${lesson.order}-${sanitizedTitle}.html`;

    const content: LessonContent = {
      lessonId: `lesson-${lesson.order}`,
      lessonTitle: lesson.title,
      lessonType: lesson.type,
      contentType: 'html',
      filePath: filename,
      htmlContent,
      metadata: {
        generatedAt: new Date().toISOString(),
        fileSize: Buffer.byteLength(htmlContent, 'utf8')
      }
    };

    return content;
  }

  private buildQuizPrompt(lesson: any, designBrief: any, courseTitle: string, guidance: string): string {
    const studentAge = designBrief?.student?.age || 10;
    const interests = designBrief?.student?.learningProfile?.interests || [];
    const gradeLevel = designBrief?.student?.grade || 'Elementary';

    return `You are an educational assessment designer. Create quiz questions for this lesson.

COURSE: ${courseTitle}
LESSON: ${lesson.title}
DESCRIPTION: ${lesson.description}

LEARNING OBJECTIVES:
${lesson.learningObjectives.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}

STUDENT PROFILE:
- Age: ${studentAge}
- Grade: ${gradeLevel}
- Interests: ${interests.join(', ') || 'General'}

QUIZ REQUIREMENTS:
- Create ${lesson.requiredScore ? '10-12' : '8-10'} questions
- Difficulty: ${lesson.difficulty}
- Assessment format: ${lesson.contentRequirements?.assessmentFormat || 'multiple-choice'}
- Questions must align with learning objectives
- Use age-appropriate language
- Include explanations for correct/incorrect answers

GUIDANCE:
${guidance}

OUTPUT FORMAT: Return ONLY valid JSON matching this structure:
{
  "quiz": {
    "title": "${lesson.title}",
    "passingScore": ${lesson.requiredScore || 70},
    "questions": [
      {
        "id": "q1",
        "question": "Question text here?",
        "type": "multiple-choice",
        "options": [
          { "id": "a", "text": "Option A", "correct": false },
          { "id": "b", "text": "Option B", "correct": true },
          { "id": "c", "text": "Option C", "correct": false },
          { "id": "d", "text": "Option D", "correct": false }
        ],
        "explanation": "Explanation why B is correct...",
        "points": 10
      }
    ]
  }
}`;
  }

  private buildHTMLPrompt(lesson: any, designBrief: any, courseTitle: string, guidance: string): string {
    const studentAge = designBrief?.student?.age || 10;
    const interests = designBrief?.student?.learningProfile?.interests || [];
    const favoriteCharacters = designBrief?.student?.learningProfile?.favoriteCharacters || '';
    const gradeLevel = designBrief?.student?.grade || 'Elementary';

    return `You are an expert HTML game developer for educational content. Create a complete, standalone HTML file for this lesson.

COURSE: ${courseTitle}
LESSON: ${lesson.title}
TYPE: ${lesson.type}
DESCRIPTION: ${lesson.description}

LEARNING OBJECTIVES:
${lesson.learningObjectives.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}

STUDENT PROFILE:
- Age: ${studentAge}
- Grade: ${gradeLevel}
- Interests: ${interests.join(', ') || 'General'}
- Favorite Characters: ${favoriteCharacters || 'None specified'}

CONTENT REQUIREMENTS:
- Game Type: ${lesson.contentRequirements?.gameType || 'interactive'}
- Interaction Pattern: ${lesson.contentRequirements?.interactionPattern || 'engaging'}
- Difficulty: ${lesson.difficulty}
- Duration: ${lesson.duration} minutes

TECHNICAL REQUIREMENTS:
- Single standalone HTML file with embedded CSS and JavaScript
- Mobile-responsive design (works on tablets and phones)
- Colorful, child-friendly interface
- Clear instructions
- Immediate feedback on interactions
- Progress tracking (if applicable)
- Sound effects (optional, with mute button)
- Accessibility features (keyboard navigation, alt text)

DESIGN GUIDELINES:
- Use bright, engaging colors appropriate for age ${studentAge}
- Large, easy-to-click buttons (min 44px for touch targets)
- Clear, readable fonts (min 16px for body text)
- Visual rewards (stars, badges, animations) for correct answers
- Encouraging feedback messages
- Theme the content around: ${interests.join(', ') || 'general educational themes'}

GUIDANCE:
${guidance}

CRITICAL: Return ONLY the complete HTML file content. Start with <!DOCTYPE html> and include everything in one file.
NO markdown code blocks, NO explanations, ONLY the raw HTML.`;
  }

  private async callClaudeForQuiz(prompt: string): Promise<any> {
    const { callClaudeWithRetry, extractTextFromResponse, COURSE_GENERATION_MODEL } = await import('@/lib/anthropic/client');

    try {
      const response = await callClaudeWithRetry({
        model: COURSE_GENERATION_MODEL,
        max_tokens: 4096,
        temperature: 0.5,
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
        throw new Error('No JSON found in quiz response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      throw new Error(
        `Failed to call Claude API for quiz generation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async callClaudeForHTML(prompt: string): Promise<string> {
    const { callClaudeWithRetry, extractTextFromResponse, COURSE_GENERATION_MODEL } = await import('@/lib/anthropic/client');

    try {
      const response = await callClaudeWithRetry({
        model: COURSE_GENERATION_MODEL,
        max_tokens: 16000,
        temperature: 0.6, // Higher for creative HTML/CSS/JS
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      let html = extractTextFromResponse(response);

      // Remove markdown code blocks if present
      html = html.replace(/```html\s*/g, '');
      html = html.replace(/```\s*$/g, '');
      html = html.trim();

      // Validate it starts with DOCTYPE
      if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<!doctype')) {
        throw new Error('Generated HTML does not start with DOCTYPE declaration');
      }

      return html;

    } catch (error) {
      throw new Error(
        `Failed to call Claude API for HTML generation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
