/**
 * Game Idea Generator Agent
 *
 * Brainstorms creative educational game concepts aligned with curriculum standards.
 * Generates 3-5 unique game concepts per request.
 */

import { BaseAgent } from './BaseAgent';
import type { AgentResult, GameConcept } from './types';

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

export class GameIdeaGeneratorAgent extends BaseAgent {
  constructor() {
    super(
      'game-idea-generator',
      [], // No specific skills required for ideation
      `You are a creative educational game designer specializing in K-12 learning experiences.

Your role is to generate innovative, engaging game concepts that:
- Align with curriculum standards and learning objectives
- Balance 70% engagement with 30% obvious learning
- Consider appropriate difficulty for the target grade level
- Incorporate research-based educational principles
- Suggest feasible implementation approaches

For each game concept, provide:
1. Title (creative and engaging)
2. Description (clear gameplay overview)
3. Learning objectives (specific skills/knowledge)
4. Gameplay mechanics (how students interact)
5. Educational value assessment (1-10 rating with justification)
6. Estimated play time
7. Difficulty level
8. Required skills for students

Generate 3-5 diverse concepts per request, exploring different gameplay styles.`
    );
  }

  /**
   * Generate game ideas based on requirements
   */
  public async execute(input: GameIdeaRequest): Promise<AgentResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate input
      if (!input.subject || !input.gradeLevel) {
        errors.push('Subject and grade level are required');
        return this.createErrorResult(errors, startTime);
      }

      // Build prompt
      const prompt = this.buildPrompt(input);

      // Call Claude (with retry logic)
      const response = await this.executeWithRetry(() =>
        this.callClaude({
          system: this.systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          maxTokens: 4000,
        })
      );

      // Parse response into game concepts
      const concepts = this.parseGameConcepts(response);

      // Validate concepts
      if (!this.validate(concepts)) {
        errors.push('Generated concepts failed validation');
        return this.createErrorResult(errors, startTime);
      }

      if (concepts.length < 3) {
        warnings.push('Generated fewer than 3 concepts');
      }

      return {
        success: true,
        output: concepts,
        errors,
        warnings,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date(),
          version: '1.0.0',
        },
      };
    } catch (error) {
      errors.push(`Execution failed: ${error}`);
      return this.createErrorResult(errors, startTime);
    }
  }

  /**
   * Build prompt from input
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
   * Parse Claude response into game concepts
   */
  private parseGameConcepts(response: string): GameConcept[] {
    // TODO: Implement actual parsing logic
    // For now, return mock concepts
    return [
      {
        title: 'Math Adventure Quest',
        description: 'An exciting journey where students solve math problems to progress',
        subject: 'math',
        gradeLevel: '3-5',
        difficulty: 'medium',
        skills: ['addition', 'subtraction', 'problem-solving'],
        learningObjectives: ['Master basic arithmetic operations'],
        estimatedTime: '10-15 minutes',
        gameplayMechanics: ['Problem solving', 'Level progression', 'Rewards system'],
        educationalValue: 8,
      },
      {
        title: 'Science Lab Explorer',
        description: 'Interactive science experiments in a virtual laboratory',
        subject: 'science',
        gradeLevel: '3-5',
        difficulty: 'easy',
        skills: ['observation', 'hypothesis testing', 'data collection'],
        learningObjectives: ['Understand scientific method'],
        estimatedTime: '15-20 minutes',
        gameplayMechanics: ['Experimentation', 'Observation', 'Recording results'],
        educationalValue: 9,
      },
      {
        title: 'Word Builder Challenge',
        description: 'Build vocabulary through engaging word puzzles',
        subject: 'english',
        gradeLevel: '3-5',
        difficulty: 'easy',
        skills: ['vocabulary', 'spelling', 'word recognition'],
        learningObjectives: ['Expand vocabulary', 'Improve spelling skills'],
        estimatedTime: '10 minutes',
        gameplayMechanics: ['Word puzzles', 'Timed challenges', 'Hints system'],
        educationalValue: 7,
      },
    ];
  }

  /**
   * Validate game concepts
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
        concept.skills &&
        concept.skills.length > 0 &&
        concept.educationalValue >= 1 &&
        concept.educationalValue <= 10
    );
  }

  /**
   * Create error result
   */
  private createErrorResult(errors: string[], startTime: number): AgentResult {
    return {
      success: false,
      output: null,
      errors,
      warnings: [],
      metadata: {
        duration: Date.now() - startTime,
        timestamp: new Date(),
        version: '1.0.0',
      },
    };
  }
}
