/**
 * Base Agent Class
 * Foundation for all specialized content creation agents
 */

import fs from 'fs/promises';
import path from 'path';
import {
  AgentType,
  AgentResult,
  AgentConfig,
  SkillKnowledge,
  ValidationResult,
} from './types';

export abstract class BaseAgent {
  protected type: AgentType;
  protected skillPaths: string[];
  protected maxRetries: number;
  protected timeout: number;
  protected validateOutput: boolean;
  protected loadedSkills: SkillKnowledge[] = [];

  constructor(config: AgentConfig) {
    this.type = config.type;
    this.skillPaths = config.skillPaths;
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 300000; // 5 minutes default
    this.validateOutput = config.validateOutput !== false;
  }

  /**
   * Load skills from file system
   * Skills are markdown files that contain specialized knowledge
   */
  async loadSkills(): Promise<SkillKnowledge[]> {
    if (this.loadedSkills.length > 0) {
      return this.loadedSkills;
    }

    const skills: SkillKnowledge[] = [];

    for (const skillPath of this.skillPaths) {
      try {
        // Resolve path relative to project root
        const fullPath = path.join(process.cwd(), '..', skillPath);
        const content = await fs.readFile(fullPath, 'utf-8');

        const skillName = path.basename(path.dirname(skillPath));

        skills.push({
          name: skillName,
          content,
          version: '1.0.0',
          loadedAt: new Date(),
        });
      } catch (error) {
        console.error(`Failed to load skill from ${skillPath}:`, error);
        throw new Error(`Skill loading failed: ${skillPath}`);
      }
    }

    this.loadedSkills = skills;
    return skills;
  }

  /**
   * Get skill content as formatted string for AI context
   */
  protected async getSkillContext(): Promise<string> {
    const skills = await this.loadSkills();

    return skills
      .map(
        (skill) => `
# Skill: ${skill.name}

${skill.content}
`
      )
      .join('\n\n---\n\n');
  }

  /**
   * Execute the agent's primary task
   * Must be implemented by concrete agent classes
   */
  abstract execute(input: any): Promise<AgentResult>;

  /**
   * Validate agent output
   * Can be overridden by concrete classes
   */
  protected validate(output: any): ValidationResult {
    // Basic validation - check if output exists
    if (!output) {
      return {
        valid: false,
        errors: ['Agent produced no output'],
        warnings: [],
      };
    }

    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry(input: any): Promise<AgentResult> {
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      attempts++;

      try {
        const startTime = Date.now();
        const result = await this.execute(input);
        const duration = Date.now() - startTime;

        // Update duration in result metadata
        result.metadata.duration = duration;

        // Validate output if enabled
        if (this.validateOutput) {
          const validation = this.validate(result.output);
          if (!validation.valid) {
            result.errors.push(...validation.errors);
            result.warnings.push(...validation.warnings);
            result.success = false;
          }
        }

        // If successful, return immediately
        if (result.success) {
          return result;
        }

        // If not successful but no exception, record error and retry
        lastError = new Error(`Execution failed: ${result.errors.join(', ')}`);

      } catch (error) {
        lastError = error as Error;
        console.error(`Agent ${this.type} attempt ${attempts} failed:`, error);

        // Wait before retry (exponential backoff)
        if (attempts < this.maxRetries) {
          await this.delay(Math.pow(2, attempts) * 1000);
        }
      }
    }

    // All retries exhausted
    return {
      success: false,
      output: null,
      errors: [`All ${this.maxRetries} attempts failed: ${lastError?.message}`],
      warnings: [],
      metadata: {
        duration: 0,
        timestamp: new Date(),
        version: '1.0.0',
      },
    };
  }

  /**
   * Utility: Delay execution
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Utility: Generate unique ID
   */
  protected generateId(): string {
    return `${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility: Format timestamp
   */
  protected formatTimestamp(date: Date = new Date()): string {
    return date.toISOString();
  }

  /**
   * Get agent information
   */
  getInfo(): { type: AgentType; skills: string[]; config: any } {
    return {
      type: this.type,
      skills: this.skillPaths,
      config: {
        maxRetries: this.maxRetries,
        timeout: this.timeout,
        validateOutput: this.validateOutput,
      },
    };
  }

  /**
   * Check if agent is ready (skills loaded)
   */
  async isReady(): Promise<boolean> {
    try {
      await this.loadSkills();
      return this.loadedSkills.length === this.skillPaths.length;
    } catch {
      return false;
    }
  }
}
