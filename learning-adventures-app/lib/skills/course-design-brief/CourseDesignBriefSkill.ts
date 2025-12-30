import { BaseSkill } from '../BaseSkill';
import type { SkillMetadata, SkillContext, SkillResult } from '../types';

interface DesignBriefOutput {
  designBrief: {
    student: {
      name: string;
      age: number;
      grade: string;
      accommodations: string[];
      challenges: string[];
      learningProfile: {
        styles: string[];
        interests: string[];
        favoriteCharacters: string;
      };
    };
    course: {
      subject: string;
      topics: string[];
      learningGoals: string;
      difficulty: string;
      gradeLevel: string[];
    };
    format: {
      totalLessons: number;
      lessonsPerWeek: number;
      sessionDuration: number;
      components: string[];
      deliveryModes: string[];
    };
    assessment: {
      successIndicators: string[];
      reportingPreferences: string[];
      masteryThreshold: number;
    };
    flags: {
      requiresOfflinePackets: boolean;
      urgencyLevel: string;
      budgetTier: string;
      allowReuse: boolean;
    };
    clarifications: Array<{
      question: string;
      field: string;
      reason: string;
    }>;
  };
}

export class CourseDesignBriefSkill extends BaseSkill {
  getMetadata(): SkillMetadata {
    return {
      id: 'course-design-brief',
      name: 'Course Design Brief Normalizer',
      description: 'Normalizes custom course intake form data (60+ fields) into structured design brief for course generation',
      triggers: [
        'normalize course request',
        'create design brief',
        'process course intake',
        'analyze course request data'
      ],
      capabilities: [
        'Extract and normalize course request data',
        'Calculate appropriate course structure from preferences',
        'Determine difficulty level based on student profile',
        'Identify ambiguous or missing critical data',
        'Suggest specific topics from vague requests',
        'Flag contradictory preferences for clarification'
      ],
      examples: [
        'Normalize this course request into a design brief',
        'Create a design brief from the intake form data',
        'Process course request ID 123 and extract learning requirements'
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md'
    };
  }

  async canHandle(userRequest: string, context?: Partial<SkillContext>): Promise<number> {
    const lowerRequest = userRequest.toLowerCase();

    // High confidence triggers
    if (lowerRequest.includes('design brief') ||
        lowerRequest.includes('normalize course request') ||
        lowerRequest.includes('course intake')) {
      return 95;
    }

    // Medium confidence triggers
    if (lowerRequest.includes('course request') &&
        (lowerRequest.includes('analyze') || lowerRequest.includes('process'))) {
      return 75;
    }

    // Check if CourseRequest data is in context
    if (context?.previousOutputs?.has('courseRequest') ||
        context?.userRequest?.includes('CourseRequest')) {
      return 85;
    }

    return 0;
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      // Extract CourseRequest data from context
      const courseRequestData = this.extractCourseRequestData(context);

      if (!courseRequestData) {
        return this.buildErrorResult(
          'No course request data found in context',
          'MISSING_DATA',
          { hint: 'Expected courseRequest in previousOutputs or as JSON in userRequest' }
        );
      }

      // Load guidance from SKILL.md
      const guidance = this.loadGuidance();

      // Build prompt for Claude
      const prompt = this.buildPrompt(courseRequestData, guidance);

      // Call Claude API to normalize data
      const normalizedData = await this.callClaudeForNormalization(prompt);

      // Validate output structure
      if (!this.validate(normalizedData)) {
        return this.buildErrorResult(
          'Invalid design brief structure returned',
          'VALIDATION_ERROR',
          { output: normalizedData }
        );
      }

      // Check if clarifications are needed
      const hasClarifications = normalizedData.designBrief.clarifications.length > 0;
      const executionTime = Date.now() - startTime;

      if (hasClarifications) {
        return this.buildSuccessResult(
          normalizedData,
          `Design brief created with ${normalizedData.designBrief.clarifications.length} clarification(s) needed`,
          executionTime,
          80, // Lower confidence when clarifications needed
          [] // No next skills - need human intervention
        );
      }

      return this.buildSuccessResult(
        normalizedData,
        'Design brief successfully created - all data clear',
        executionTime,
        95,
        ['curriculum-design'] // Suggest next skill in chain
      );

    } catch (error) {
      return this.buildErrorResult(
        `Failed to create design brief: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTION_ERROR',
        { error: error instanceof Error ? error.stack : error }
      );
    }
  }

  protected validate(output: any): boolean {
    if (!output || typeof output !== 'object') return false;
    if (!output.designBrief) return false;

    const brief = output.designBrief;

    // Validate required student fields
    if (!brief.student?.name || !brief.student?.age || !brief.student?.grade) {
      return false;
    }

    // Validate course fields
    if (!brief.course?.subject || !brief.course?.learningGoals) {
      return false;
    }

    // Validate format fields
    if (!brief.format?.totalLessons || brief.format.totalLessons <= 0) {
      return false;
    }

    // Validate clarifications array exists (can be empty)
    if (!Array.isArray(brief.clarifications)) {
      return false;
    }

    // Validate clarification structure if any exist
    for (const clarification of brief.clarifications) {
      if (!clarification.question || !clarification.field || !clarification.reason) {
        return false;
      }
    }

    return true;
  }

  private extractCourseRequestData(context: SkillContext): any {
    // Try to get from previousOutputs first
    if (context.previousOutputs?.has('courseRequest')) {
      return context.previousOutputs.get('courseRequest');
    }

    // Try to parse from userRequest as JSON
    try {
      const jsonMatch = context.userRequest.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Not valid JSON in userRequest
    }

    return null;
  }

  private buildPrompt(courseRequestData: any, guidance: string): string {
    return `You are an educational course designer. Analyze this custom course request and create a structured design brief.

INTAKE FORM DATA:
${JSON.stringify(courseRequestData, null, 2)}

GUIDANCE:
${guidance}

TASK:
1. Extract and normalize all relevant information into the required JSON structure
2. Calculate appropriate course structure (total lessons based on courseLength preference)
3. Determine difficulty level based on age/grade/learning goals
4. Identify any ambiguous or missing critical data that requires clarification

CRITICAL RULES:
- If topics are vague, suggest 3-5 specific curriculum-aligned topics
- If learning goals conflict with age/grade, flag for clarification
- Calculate total lessons: SHORT (1-2 weeks) = 5-10 lessons, MEDIUM (3-4 weeks) = 12-20 lessons, LONG (6-8 weeks) = 25-40 lessons
- Flag if accommodations require special considerations not feasible with current content types
- If student interests are generic, suggest specific themed approaches

CLARIFICATION TRIGGERS:
- Topics too broad (e.g., "just math" without specifics)
- Age/grade mismatch with learning goals (e.g., 6-year-old "get ahead" in calculus)
- Contradictory preferences (e.g., wants games but also says student dislikes screens)

REQUIRED OUTPUT STRUCTURE:
{
  "designBrief": {
    "student": {
      "name": "string",
      "age": number,
      "grade": "string",
      "accommodations": ["string"],
      "challenges": ["string"],
      "learningProfile": {
        "styles": ["string"],
        "interests": ["string"],
        "favoriteCharacters": "string"
      }
    },
    "course": {
      "subject": "string",
      "topics": ["string"],
      "learningGoals": "string",
      "difficulty": "easy | medium | hard",
      "gradeLevel": ["string"]
    },
    "format": {
      "totalLessons": number,
      "lessonsPerWeek": number,
      "sessionDuration": number,
      "components": ["string"],
      "deliveryModes": ["string"]
    },
    "assessment": {
      "successIndicators": ["string"],
      "reportingPreferences": ["string"],
      "masteryThreshold": number
    },
    "flags": {
      "requiresOfflinePackets": boolean,
      "urgencyLevel": "string",
      "budgetTier": "string",
      "allowReuse": boolean
    },
    "clarifications": [
      {
        "question": "string",
        "field": "string",
        "reason": "string"
      }
    ]
  }
}

OUTPUT FORMAT: Return ONLY valid JSON matching the designBrief structure. No markdown formatting, no explanations outside the JSON.`;
  }

  private async callClaudeForNormalization(prompt: string): Promise<DesignBriefOutput> {
    const { callClaudeWithRetry, extractJSONFromResponse, COURSE_GENERATION_MODEL } = await import('@/lib/anthropic/client');

    try {
      const response = await callClaudeWithRetry({
        model: COURSE_GENERATION_MODEL,
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for more consistent structured output
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Extract and parse JSON from response
      const designBriefOutput = extractJSONFromResponse<DesignBriefOutput>(response);

      return designBriefOutput;

    } catch (error) {
      throw new Error(
        `Failed to call Claude API for course normalization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
