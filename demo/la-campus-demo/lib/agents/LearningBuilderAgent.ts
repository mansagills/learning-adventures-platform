/**
 * Learning Builder Agent
 * Intelligent agent that automatically detects and uses appropriate skills
 * to create interactive learning content and educational games.
 */

import { SkillRegistry } from '../skills/SkillRegistry';
import { BaseSkill } from '../skills/BaseSkill';
import { SkillContextBuilder } from './SkillContextBuilder';
import {
  AgentResult,
  SkillContext,
  SkillResult,
  SkillDetectionConfig,
  ConversationMessage,
} from '../skills/types';

export class LearningBuilderAgent {
  private skillRegistry: SkillRegistry;
  private conversationHistory: Map<string, ConversationMessage[]>;
  private skillOutputs: Map<string, Map<string, any>>; // conversationId -> (skillId -> output)

  constructor() {
    this.skillRegistry = SkillRegistry.getInstance();
    this.conversationHistory = new Map();
    this.skillOutputs = new Map();
  }

  /**
   * Initialize the agent by loading all skills
   */
  public async initialize(): Promise<void> {
    await this.skillRegistry.initialize();

    // Register all skills for learning content creation
    const { GameIdeationSkill } = await import('../skills/game-ideation');
    const { GameBuilderSkill } = await import('../skills/game-builder');
    const { ReactComponentSkill } = await import('../skills/react-component');
    const { MetadataFormatterSkill } =
      await import('../skills/metadata-formatter');
    const { AccessibilityValidatorSkill } =
      await import('../skills/accessibility-validator');

    this.skillRegistry.registerSkill(new GameIdeationSkill());
    this.skillRegistry.registerSkill(new GameBuilderSkill());
    this.skillRegistry.registerSkill(new ReactComponentSkill());
    this.skillRegistry.registerSkill(new MetadataFormatterSkill());
    this.skillRegistry.registerSkill(new AccessibilityValidatorSkill());

    console.log(
      '🎓 Learning Builder Agent initialized with',
      this.skillRegistry.getSkillCount(),
      'skills'
    );
  }

  /**
   * Execute user request with automatic skill detection
   */
  public async execute(
    userRequest: string,
    conversationId?: string,
    userId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // Build execution context with previous skill outputs
      const convId = conversationId || 'default';
      const history = this.conversationHistory.get(convId) || [];
      const previousOutputs = this.skillOutputs.get(convId) || new Map();

      const context = SkillContextBuilder.build(userRequest, {
        conversationHistory: history,
        previousOutputs,
        conversationId,
        userId,
      });

      // Detect required skills
      const detectionResults = await this.detectRequiredSkills(
        userRequest,
        context
      );

      if (detectionResults.length === 0) {
        return this.buildNoSkillResult(userRequest, startTime);
      }

      // Execute skill(s)
      const topSkill = detectionResults[0];
      const skill = this.skillRegistry.getSkill(topSkill.skillId);

      if (!skill) {
        return this.buildErrorResult('Skill not found', startTime);
      }

      // Check if we should chain multiple skills
      if (detectionResults.length > 1 && topSkill.confidence < 90) {
        // Multiple skills detected, might need chaining
        return await this.executeSkillChain(
          detectionResults.map((r) => r.skillId),
          context,
          startTime
        );
      }

      // Execute single skill
      const skillResult = await this.executeSkill(skill, context);

      // Store skill output for future context
      this.storeSkillOutput(convId, topSkill.skillId, skillResult.output);

      // Update conversation history
      this.addToHistory(convId, {
        role: 'user',
        content: userRequest,
        timestamp: new Date(),
      });

      this.addToHistory(convId, {
        role: 'assistant',
        content: skillResult.message,
        timestamp: new Date(),
        skillUsed: topSkill.skillId,
      });

      // Build agent result
      return {
        response: skillResult.message,
        skillsUsed: [topSkill.skillId],
        confidence: topSkill.confidence,
        output: skillResult.output,
        metadata: {
          totalExecutionTime: Date.now() - startTime,
          skillChain: [topSkill.skillId],
          suggestedNextSteps: skillResult.metadata.suggestedNextSteps,
          warnings: skillResult.metadata.warnings,
        },
        conversationId,
      };
    } catch (error) {
      console.error('Universal Agent execution error:', error);
      return this.buildErrorResult(`Execution failed: ${error}`, startTime);
    }
  }

  /**
   * Detect which skills should handle the request
   */
  private async detectRequiredSkills(
    userRequest: string,
    context: SkillContext,
    config?: SkillDetectionConfig
  ): Promise<Array<{ skillId: string; confidence: number }>> {
    const results = await this.skillRegistry.detectSkills(
      userRequest,
      context,
      config
    );

    console.log(
      '🔍 Detected skills:',
      results.map((r) => `${r.skillId} (${r.confidence}%)`).join(', ')
    );

    return results.map((r) => ({
      skillId: r.skillId,
      confidence: r.confidence,
    }));
  }

  /**
   * Execute a single skill
   */
  private async executeSkill(
    skill: BaseSkill,
    context: SkillContext
  ): Promise<SkillResult> {
    console.log(`🎯 Executing skill: ${skill.getMetadata().id}`);

    try {
      const result = await skill.execute(context);
      return result;
    } catch (error) {
      console.error(`Skill ${skill.getMetadata().id} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute multiple skills in sequence (skill chaining)
   */
  private async executeSkillChain(
    skillIds: string[],
    initialContext: SkillContext,
    startTime: number
  ): Promise<AgentResult> {
    const maxChain = 3;
    const skillsToExecute = skillIds.slice(0, maxChain);
    const executedSkills: string[] = [];
    let currentContext = initialContext;
    let finalResult: SkillResult | null = null;

    console.log('⛓️  Executing skill chain:', skillsToExecute.join(' → '));

    for (const skillId of skillsToExecute) {
      const skill = this.skillRegistry.getSkill(skillId);

      if (!skill) {
        console.warn(`Skill ${skillId} not found, skipping`);
        continue;
      }

      const result = await this.executeSkill(skill, currentContext);

      if (!result.success) {
        console.warn(`Skill ${skillId} failed, stopping chain`);
        break;
      }

      executedSkills.push(skillId);
      finalResult = result;

      // Add skill output to context for next skill
      currentContext = SkillContextBuilder.addSkillOutput(
        currentContext,
        skillId,
        result.output
      );
    }

    if (!finalResult) {
      return this.buildErrorResult('Skill chain failed', startTime);
    }

    return {
      response: finalResult.message,
      skillsUsed: executedSkills,
      confidence: 85,
      output: finalResult.output,
      metadata: {
        totalExecutionTime: Date.now() - startTime,
        skillChain: executedSkills,
        suggestedNextSteps: finalResult.metadata.suggestedNextSteps,
      },
      conversationId: currentContext.conversationId,
    };
  }

  /**
   * Build result when no skill can handle request
   */
  private buildNoSkillResult(
    userRequest: string,
    startTime: number
  ): AgentResult {
    return {
      response: `I'm not sure how to help with that request. I can help you with:
- Creating game ideas (e.g., "brainstorm math game ideas")
- Building HTML games (e.g., "build a multiplication game")
- Creating React games (e.g., "create a React game for fractions")
- Validating accessibility (e.g., "check accessibility")
- Formatting metadata (e.g., "add to catalog")

What would you like to do?`,
      skillsUsed: [],
      confidence: 0,
      metadata: {
        totalExecutionTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Build error result
   */
  private buildErrorResult(message: string, startTime: number): AgentResult {
    return {
      response: `An error occurred: ${message}`,
      skillsUsed: [],
      confidence: 0,
      metadata: {
        totalExecutionTime: Date.now() - startTime,
        warnings: [message],
      },
    };
  }

  /**
   * Add message to conversation history
   */
  private addToHistory(
    conversationId: string,
    message: ConversationMessage
  ): void {
    const history = this.conversationHistory.get(conversationId) || [];
    history.push(message);

    // Keep only last 20 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    this.conversationHistory.set(conversationId, history);
  }

  /**
   * Store skill output for future context
   */
  private storeSkillOutput(
    conversationId: string,
    skillId: string,
    output: any
  ): void {
    let outputs = this.skillOutputs.get(conversationId);

    if (!outputs) {
      outputs = new Map();
      this.skillOutputs.set(conversationId, outputs);
    }

    outputs.set(skillId, output);

    // Keep only last 5 skill outputs to prevent memory bloat
    if (outputs.size > 5) {
      const firstKey = outputs.keys().next().value;
      if (firstKey) {
        outputs.delete(firstKey);
      }
    }
  }

  /**
   * Get available skills
   */
  public getAvailableSkills() {
    return this.skillRegistry.getAllSkillMetadata();
  }

  /**
   * Get conversation history
   */
  public getConversationHistory(conversationId: string): ConversationMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Clear conversation history
   */
  public clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
    this.skillOutputs.delete(conversationId);
  }
}
