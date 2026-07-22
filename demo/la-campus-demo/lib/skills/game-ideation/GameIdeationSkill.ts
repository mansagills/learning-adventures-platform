/**
 * Game Ideation Skill
 *
 * Brainstorms creative educational game concepts aligned with curriculum standards.
 * Converted from GameIdeaGeneratorAgent.
 */

import { BaseSkill } from '../BaseSkill';
import {
  SkillMetadata,
  SkillContext,
  SkillResult,
  GameConcept,
} from '../types';

interface GameIdeaRequest {
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string;
  learningObjectives?: string[];
  skills?: string[];
  preferences?: {
    gameType?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    duration?: string;
  };
}

export class GameIdeationSkill extends BaseSkill {
  /**
   * Get skill metadata
   */
  public getMetadata(): SkillMetadata {
    return {
      id: 'game-ideation',
      name: 'Game Ideation',
      description:
        'Brainstorm creative educational game concepts aligned with curriculum standards',
      triggers: [
        'game idea',
        'brainstorm',
        'concept',
        'create game',
        'educational game',
        'game concept',
        'new game',
        'design game',
        'think of a game',
      ],
      capabilities: [
        'Generate 3-5 unique game concepts',
        'Align with curriculum standards',
        'Consider grade-appropriate difficulty',
        'Balance engagement and learning',
        'Provide educational value assessment',
      ],
      examples: [
        'Create a math game for 3rd graders',
        'Brainstorm science game ideas',
        'I need game concepts for teaching multiplication',
        'Think of engaging educational games for elementary students',
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md',
    };
  }

  /**
   * Determine if this skill can handle the request
   */
  public async canHandle(
    userRequest: string,
    context?: Partial<SkillContext>
  ): Promise<number> {
    const metadata = this.getMetadata();
    let confidence = this.calculateKeywordConfidence(
      userRequest,
      metadata.triggers
    );

    // Boost confidence if user explicitly asks for ideation/brainstorming
    if (
      userRequest.toLowerCase().includes('idea') ||
      userRequest.toLowerCase().includes('brainstorm') ||
      userRequest.toLowerCase().includes('concept')
    ) {
      confidence = Math.min(confidence + 15, 100);
    }

    // Reduce confidence if user mentions implementation
    if (
      userRequest.toLowerCase().includes('build') ||
      userRequest.toLowerCase().includes('code') ||
      userRequest.toLowerCase().includes('implement')
    ) {
      confidence = Math.max(confidence - 20, 0);
    }

    return confidence;
  }

  /**
   * Execute the skill
   */
  public async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      // Parse user request for game requirements
      const request = this.parseUserRequest(context.userRequest, context);

      // Validate parsed request
      if (!request.subject || !request.gradeLevel) {
        return this.buildErrorResult(
          'Could not determine subject and grade level from request. Please specify what subject and grade level the game should be for.',
          'INVALID_REQUEST'
        );
      }

      // Build prompt
      const prompt = this.buildPrompt(request);

      // Load guidance from markdown file
      const guidance = this.loadGuidance();

      // In a real implementation, this would call Claude API
      // For now, we'll use the mock implementation
      const concepts = await this.generateGameConcepts(
        prompt,
        guidance,
        request
      );

      // Validate generated concepts
      if (!this.validate(concepts)) {
        return this.buildErrorResult(
          'Generated concepts failed validation. Please try again.',
          'VALIDATION_FAILED'
        );
      }

      const executionTime = Date.now() - startTime;

      // Build success message
      const message = this.buildSuccessMessage(concepts, request);

      // Determine suggested next skills
      const suggestedNextSkills = ['game-builder', 'react-component'];

      return this.buildSuccessResult(
        concepts,
        message,
        executionTime,
        95,
        suggestedNextSkills
      );
    } catch (error) {
      return this.buildErrorResult(
        `Skill execution failed: ${error}`,
        'EXECUTION_ERROR',
        error
      );
    }
  }

  /**
   * Validate output
   */
  protected validate(concepts: GameConcept[]): boolean {
    if (!Array.isArray(concepts) || concepts.length === 0) {
      return false;
    }

    // Validate each concept has required fields
    return concepts.every(
      (concept) =>
        concept.title &&
        concept.description &&
        concept.subject &&
        concept.gradeLevel &&
        concept.difficulty &&
        concept.educationalValue >= 1 &&
        concept.educationalValue <= 10
    );
  }

  /**
   * Parse user request into structured game idea request
   */
  private parseUserRequest(
    userRequest: string,
    context: SkillContext
  ): GameIdeaRequest {
    const parsed = this.parseRequest(userRequest);

    // Extract from context if available
    const subject =
      (parsed.subject?.toLowerCase() as any) ||
      context.userPreferences?.subjects?.[0]?.toLowerCase() ||
      'math';

    const gradeLevel =
      parsed.gradeLevel?.[0] || context.userPreferences?.gradeLevel || '3';

    // Extract learning objectives and skills from request
    const learningObjectives = this.extractLearningObjectives(userRequest);
    const skills = this.extractSkills(userRequest);

    return {
      subject,
      gradeLevel,
      learningObjectives,
      skills,
      preferences: {
        gameType: parsed.gameType,
        complexity: 'moderate',
        duration: '10-15 minutes',
      },
    };
  }

  /**
   * Extract learning objectives from user request
   */
  private extractLearningObjectives(userRequest: string): string[] {
    const objectives: string[] = [];

    // Common educational keywords
    if (userRequest.includes('multiplication')) {
      objectives.push('Master multiplication tables');
    }
    if (userRequest.includes('fractions')) {
      objectives.push('Understand fractions');
    }
    if (userRequest.includes('photosynthesis')) {
      objectives.push('Learn about photosynthesis');
    }

    return objectives;
  }

  /**
   * Extract skills from user request
   */
  private extractSkills(userRequest: string): string[] {
    const skills: string[] = [];

    if (userRequest.includes('multiplication')) {
      skills.push('multiplication', 'problem-solving');
    }
    if (userRequest.includes('addition')) {
      skills.push('addition', 'mental math');
    }
    if (userRequest.includes('reading')) {
      skills.push('reading comprehension', 'vocabulary');
    }

    return skills;
  }

  /**
   * Build prompt for Claude
   */
  private buildPrompt(input: GameIdeaRequest): string {
    let prompt = `Generate 3-5 creative educational game concepts for:\n\n`;
    prompt += `- Subject: ${input.subject}\n`;
    prompt += `- Grade Level: ${input.gradeLevel}\n`;

    if (input.learningObjectives && input.learningObjectives.length > 0) {
      prompt += `- Learning Objectives: ${input.learningObjectives.join(', ')}\n`;
    }

    if (input.skills && input.skills.length > 0) {
      prompt += `- Skills to Practice: ${input.skills.join(', ')}\n`;
    }

    if (input.preferences) {
      prompt += `\nPreferences:\n`;
      if (input.preferences.gameType) {
        prompt += `- Game Type: ${input.preferences.gameType}\n`;
      }
      if (input.preferences.complexity) {
        prompt += `- Complexity: ${input.preferences.complexity}\n`;
      }
      if (input.preferences.duration) {
        prompt += `- Duration: ${input.preferences.duration}\n`;
      }
    }

    prompt += `\nFor each concept, provide all required fields in JSON format.`;

    return prompt;
  }

  /**
   * Generate game concepts
   * TODO: Replace with actual Claude API call
   */
  private async generateGameConcepts(
    prompt: string,
    guidance: string,
    request: GameIdeaRequest
  ): Promise<GameConcept[]> {
    // Check if Claude API is configured
    const { isClaudeConfigured, callClaude } =
      await import('../../claude-client');

    if (!isClaudeConfigured()) {
      console.warn(
        '⚠️  ANTHROPIC_API_KEY not configured, using mock game concepts'
      );
      return this.getMockGameConcepts(request);
    }

    try {
      // Combine skill guidance with specific prompt
      const fullPrompt = `${guidance}

${prompt}

Please provide 3-5 game concepts in JSON array format. Each concept should be a JSON object with the following structure:
{
  "title": "Game Title",
  "description": "Brief description of the game",
  "subject": "${request.subject}",
  "gradeLevel": ["${request.gradeLevel}"],
  "difficulty": "easy|medium|hard",
  "skills": ["skill1", "skill2"],
  "learningObjectives": ["objective1", "objective2"],
  "estimatedTime": "10-15 minutes",
  "gameplayMechanics": ["mechanic1", "mechanic2"],
  "educationalValue": 8,
  "engagementPotential": 9
}

Return ONLY a valid JSON array of game concepts, no markdown formatting or explanations.`;

      const response = await callClaude(fullPrompt, {
        model: 'claude-3-7-sonnet-20250219',
        maxTokens: 2000,
        temperature: 1.0,
      });

      // Extract JSON if wrapped in markdown code blocks
      let jsonStr = response.trim();
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Parse the JSON response
      const concepts: GameConcept[] = JSON.parse(jsonStr);

      // Validate and return
      if (Array.isArray(concepts) && concepts.length > 0) {
        return concepts.slice(0, 5); // Limit to 5 concepts
      }

      // Fallback if parsing failed
      console.warn(
        '⚠️  Could not parse Claude response as valid game concepts, using mock data'
      );
      return this.getMockGameConcepts(request);
    } catch (error) {
      console.error('❌ Error generating game concepts with Claude:', error);
      console.warn('⚠️  Falling back to mock game concepts');
      return this.getMockGameConcepts(request);
    }
  }

  /**
   * Get mock game concepts (fallback when API not available)
   */
  private getMockGameConcepts(request: GameIdeaRequest): GameConcept[] {
    const subjectGames: Record<string, GameConcept[]> = {
      math: [
        {
          title: 'Number Race Rally',
          description:
            'Race against time solving arithmetic problems to advance your car',
          subject: 'Math',
          gradeLevel: [request.gradeLevel],
          difficulty: 'medium',
          estimatedPlayTime: '',
          learningObjectives: ['Practice core skills'],
          gameplayMechanics: [
            'Timed challenges',
            'Progressive difficulty',
            'Power-ups',
          ],
          educationalValue: 8,
          engagementPotential: 9,
        },
        {
          title: 'Fraction Builder Construction',
          description: 'Build structures by correctly combining fractions',
          subject: 'Math',
          gradeLevel: [request.gradeLevel],
          difficulty: 'medium',
          estimatedPlayTime: '',
          learningObjectives: ['Practice core skills'],
          gameplayMechanics: ['Building', 'Matching', 'Rewards'],
          educationalValue: 9,
          engagementPotential: 8,
        },
        {
          title: 'Geometry Island Adventure',
          description:
            'Explore an island where geometry shapes unlock treasures',
          subject: 'Math',
          gradeLevel: [request.gradeLevel],
          difficulty: 'easy',
          estimatedPlayTime: '',
          learningObjectives: ['Practice core skills'],
          gameplayMechanics: ['Exploration', 'Collection', 'Puzzles'],
          educationalValue: 7,
          engagementPotential: 9,
        },
      ],
      science: [
        {
          title: 'Ecosystem Builder',
          description: 'Create and balance a thriving ecosystem',
          subject: 'Science',
          gradeLevel: [request.gradeLevel],
          difficulty: 'medium',
          estimatedPlayTime: '',
          learningObjectives: ['Practice core skills'],
          gameplayMechanics: ['Simulation', 'Strategy', 'Resource management'],
          educationalValue: 9,
          engagementPotential: 9,
        },
        {
          title: 'Plant Growth Lab',
          description:
            'Experiment with different conditions to grow the perfect plant',
          subject: 'Science',
          gradeLevel: [request.gradeLevel],
          difficulty: 'easy',
          estimatedPlayTime: '',
          learningObjectives: ['Practice core skills'],
          gameplayMechanics: [
            'Experimentation',
            'Observation',
            'Data collection',
          ],
          educationalValue: 8,
          engagementPotential: 7,
        },
        {
          title: 'Weather Predictor Challenge',
          description:
            'Use clues to predict weather patterns and save the town',
          subject: 'Science',
          gradeLevel: [request.gradeLevel],
          difficulty: 'medium',
          estimatedPlayTime: '',
          learningObjectives: ['Practice core skills'],
          gameplayMechanics: ['Prediction', 'Analysis', 'Time-based'],
          educationalValue: 8,
          engagementPotential: 8,
        },
      ],
    };

    return subjectGames[request.subject] || subjectGames.math;
  }

  /**
   * Build success message
   */
  private buildSuccessMessage(
    concepts: GameConcept[],
    request: GameIdeaRequest
  ): string {
    let message = `🎮 Generated ${concepts.length} game concepts for ${request.subject} (Grade ${request.gradeLevel}):\n\n`;

    concepts.forEach((concept, index) => {
      message += `${index + 1}. **${concept.title}**\n`;
      message += `   ${concept.description}\n`;
      message += `   Educational Value: ${concept.educationalValue}/10\n`;
      message += `   Difficulty: ${concept.difficulty}\n\n`;
    });

    message += `\nWould you like me to implement any of these concepts as a game?`;

    return message;
  }
}
