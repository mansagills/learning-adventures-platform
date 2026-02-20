/**
 * Universal Agent - Base Skill Class
 *
 * Abstract base class that all skills inherit from.
 * Provides common functionality for skill detection, execution, and validation.
 */

import fs from 'fs';
import path from 'path';
import {
  SkillMetadata,
  SkillContext,
  SkillResult,
  SkillDetectionResult,
} from './types';

export abstract class BaseSkill {
  /**
   * Get skill metadata (id, name, triggers, capabilities, etc.)
   */
  abstract getMetadata(): SkillMetadata;

  /**
   * Determine if this skill can handle the given user request
   * @param userRequest - The user's message/request
   * @param context - Optional context for more intelligent detection
   * @returns Confidence score (0-100)
   */
  abstract canHandle(
    userRequest: string,
    context?: Partial<SkillContext>
  ): Promise<number>;

  /**
   * Execute the skill with the given context
   * @param context - Full execution context
   * @returns Skill execution result
   */
  abstract execute(context: SkillContext): Promise<SkillResult>;

  /**
   * Validate the skill's output
   * @param output - The output to validate
   * @returns Whether the output is valid
   */
  protected abstract validate(output: any): boolean;

  /**
   * Load the markdown guidance file for this skill
   * @returns The markdown content as a string
   */
  protected loadGuidance(): string {
    const metadata = this.getMetadata();

    if (!metadata.guidanceFile) {
      return '';
    }

    try {
      const guidancePath = path.join(
        process.cwd(),
        'lib',
        'skills',
        metadata.id,
        'SKILL.md'
      );

      if (fs.existsSync(guidancePath)) {
        return fs.readFileSync(guidancePath, 'utf-8');
      }

      // Fallback to docs/skills if not in lib/skills
      const fallbackPath = path.join(
        process.cwd(),
        'docs',
        'skills',
        metadata.id,
        'SKILL.md'
      );

      if (fs.existsSync(fallbackPath)) {
        return fs.readFileSync(fallbackPath, 'utf-8');
      }

      console.warn(`Guidance file not found for skill: ${metadata.id}`);
      return '';
    } catch (error) {
      console.error(`Error loading guidance for skill ${metadata.id}:`, error);
      return '';
    }
  }

  /**
   * Calculate confidence score based on keyword matching
   * @param userRequest - User's request
   * @param triggers - Trigger keywords
   * @returns Confidence score (0-100)
   */
  protected calculateKeywordConfidence(
    userRequest: string,
    triggers: string[]
  ): number {
    const lowerRequest = userRequest.toLowerCase();
    let matchedCount = 0;
    const matchedTriggers: string[] = [];

    for (const trigger of triggers) {
      if (lowerRequest.includes(trigger.toLowerCase())) {
        matchedCount++;
        matchedTriggers.push(trigger);
      }
    }

    if (matchedCount === 0) return 0;

    // Improved scoring algorithm:
    // - 1 match: 60-70% base confidence
    // - 2 matches: 75-85% confidence
    // - 3+ matches: 85-95% confidence

    let confidence = 0;

    if (matchedCount === 1) {
      confidence = 65; // Strong base for single match
    } else if (matchedCount === 2) {
      confidence = 80; // Very confident with two matches
    } else if (matchedCount >= 3) {
      confidence = 90; // Extremely confident with multiple matches
    }

    // Bonus for partial trigger coverage (more triggers = higher potential bonus)
    const triggerCoverage = matchedCount / Math.min(triggers.length, 5);
    const coverageBonus = triggerCoverage * 10;

    return Math.min(confidence + coverageBonus, 98);
  }

  /**
   * Build a detection result
   * @param confidence - Confidence score
   * @param reason - Reason for selection
   * @param matchedTriggers - Triggers that matched
   * @returns SkillDetectionResult
   */
  protected buildDetectionResult(
    confidence: number,
    reason: string,
    matchedTriggers: string[] = []
  ): SkillDetectionResult {
    const metadata = this.getMetadata();

    return {
      skillId: metadata.id,
      confidence,
      reason,
      matchedTriggers,
    };
  }

  /**
   * Build a success result
   * @param output - The skill's output
   * @param message - Human-readable message
   * @param executionTime - Execution time in milliseconds
   * @param confidence - Confidence in the result
   * @param suggestedNextSkills - Skills that could follow this one
   * @returns SkillResult
   */
  protected buildSuccessResult(
    output: any,
    message: string,
    executionTime?: number,
    confidence: number = 95,
    suggestedNextSkills: string[] = []
  ): SkillResult {
    const metadata = this.getMetadata();

    return {
      success: true,
      output,
      message,
      metadata: {
        executionTime,
        skillId: metadata.id,
        confidence,
        suggestedNextSkills,
      },
    };
  }

  /**
   * Build an error result
   * @param message - Error message
   * @param code - Error code
   * @param details - Additional error details
   * @returns SkillResult
   */
  protected buildErrorResult(
    message: string,
    code: string = 'EXECUTION_ERROR',
    details?: any
  ): SkillResult {
    const metadata = this.getMetadata();

    return {
      success: false,
      output: null,
      message,
      metadata: {
        skillId: metadata.id,
        confidence: 0,
      },
      error: {
        code,
        message,
        details,
      },
    };
  }

  /**
   * Execute with retry logic
   * @param context - Skill context
   * @param maxRetries - Maximum number of retries
   * @returns SkillResult
   */
  protected async executeWithRetry(
    context: SkillContext,
    maxRetries: number = 3
  ): Promise<SkillResult> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.execute(context);

        if (result.success) {
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error;
        console.error(
          `Skill ${this.getMetadata().id} failed on attempt ${attempt}:`,
          error
        );

        if (attempt < maxRetries) {
          // Exponential backoff
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    return this.buildErrorResult(
      `Skill failed after ${maxRetries} attempts`,
      'MAX_RETRIES_EXCEEDED',
      lastError
    );
  }

  /**
   * Sleep utility for retry backoff
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Parse user request for specific entities
   * @param userRequest - User's request
   * @returns Parsed entities
   */
  protected parseRequest(userRequest: string): {
    subject?: string;
    gradeLevel?: string[];
    difficulty?: string;
    gameType?: string;
  } {
    const lowerRequest = userRequest.toLowerCase();
    const parsed: any = {};

    // Extract subject
    const subjects = [
      'math',
      'science',
      'english',
      'history',
      'social studies',
    ];
    for (const subject of subjects) {
      if (lowerRequest.includes(subject)) {
        parsed.subject = subject.charAt(0).toUpperCase() + subject.slice(1);
        break;
      }
    }

    // Extract grade level
    const gradeMatch = lowerRequest.match(/grade\s+(\d+)/i);
    if (gradeMatch) {
      parsed.gradeLevel = [gradeMatch[1]];
    } else if (lowerRequest.includes('elementary')) {
      parsed.gradeLevel = ['1', '2', '3', '4', '5'];
    } else if (lowerRequest.includes('middle school')) {
      parsed.gradeLevel = ['6', '7', '8'];
    } else if (lowerRequest.includes('high school')) {
      parsed.gradeLevel = ['9', '10', '11', '12'];
    }

    // Extract difficulty
    if (lowerRequest.includes('easy') || lowerRequest.includes('beginner')) {
      parsed.difficulty = 'easy';
    } else if (
      lowerRequest.includes('hard') ||
      lowerRequest.includes('advanced') ||
      lowerRequest.includes('challenging')
    ) {
      parsed.difficulty = 'hard';
    } else if (
      lowerRequest.includes('medium') ||
      lowerRequest.includes('intermediate')
    ) {
      parsed.difficulty = 'medium';
    }

    // Extract game type
    if (lowerRequest.includes('html')) {
      parsed.gameType = 'html';
    } else if (
      lowerRequest.includes('react') ||
      lowerRequest.includes('component')
    ) {
      parsed.gameType = 'react';
    }

    return parsed;
  }

  /**
   * Format output as markdown for better readability
   * @param data - Data to format
   * @returns Markdown string
   */
  protected formatAsMarkdown(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object') {
      return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
    }

    return String(data);
  }
}
