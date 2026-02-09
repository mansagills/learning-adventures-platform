/**
 * Base Agent Class
 *
 * Abstract base class for all specialized AI agents.
 * Provides common functionality for skill loading, Claude SDK integration,
 * retry logic, and output validation.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { AgentResult, SkillKnowledge } from './types';

export abstract class BaseAgent {
  protected agentId: string;
  protected skillPaths: string[];
  protected systemPrompt: string;
  protected maxRetries: number = 3;
  protected retryDelay: number = 1000; // ms

  constructor(agentId: string, skillPaths: string[], systemPrompt: string) {
    this.agentId = agentId;
    this.skillPaths = skillPaths;
    this.systemPrompt = systemPrompt;
  }

  /**
   * Load skills from markdown files
   */
  protected async loadSkills(): Promise<SkillKnowledge[]> {
    const skills: SkillKnowledge[] = [];

    for (const skillPath of this.skillPaths) {
      try {
        const fullPath = path.join(process.cwd(), skillPath);
        const content = await fs.readFile(fullPath, 'utf-8');

        // Extract skill name from path
        const skillName = path.basename(path.dirname(skillPath));

        skills.push({
          name: skillName,
          content,
          version: '1.0.0',
        });
      } catch (error) {
        console.error(`Failed to load skill from ${skillPath}:`, error);
        throw new Error(`Skill loading failed: ${skillPath}`);
      }
    }

    return skills;
  }

  /**
   * Execute agent with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retry attempt ${retryCount + 1} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Call Claude SDK (placeholder for actual implementation)
   * TODO: Integrate with @anthropic-ai/sdk
   */
  protected async callClaude(params: {
    system: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
  }): Promise<string> {
    // TODO: Replace with actual Claude SDK call
    // For now, return a mock response
    console.log('Claude API called with:', {
      system: params.system.substring(0, 100) + '...',
      messageCount: params.messages.length,
    });

    // Mock response
    return `This is a mock response from the ${this.agentId} agent.

In a production environment, this would use the Claude SDK to generate actual responses based on the loaded skills and system prompt.`;
  }

  /**
   * Stream Claude response (placeholder)
   * TODO: Implement streaming with Claude SDK
   */
  protected async *streamClaude(params: {
    system: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
  }): AsyncGenerator<string> {
    // TODO: Replace with actual streaming implementation
    const response = await this.callClaude(params);
    const words = response.split(' ');

    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Validate output (override in subclasses)
   */
  protected abstract validate(output: any): boolean;

  /**
   * Execute agent (override in subclasses)
   */
  public abstract execute(input: any): Promise<AgentResult>;

  /**
   * Get agent metadata
   */
  public getMetadata() {
    return {
      id: this.agentId,
      skillPaths: this.skillPaths,
      systemPrompt: this.systemPrompt.substring(0, 200) + '...',
    };
  }
}
