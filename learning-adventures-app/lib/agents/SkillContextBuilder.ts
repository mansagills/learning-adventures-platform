/**
 * Skill Context Builder
 * Builds execution context for skills from user requests and conversation history
 */

import {
  SkillContext,
  ConversationMessage,
  UserPreferences,
} from '../skills/types';

export class SkillContextBuilder {
  /**
   * Build skill context from user request and optional parameters
   */
  public static build(
    userRequest: string,
    options?: {
      conversationHistory?: ConversationMessage[];
      previousOutputs?: Map<string, any>;
      uploadedFiles?: any[];
      userPreferences?: UserPreferences;
      conversationId?: string;
      userId?: string;
    }
  ): SkillContext {
    return {
      userRequest,
      conversationHistory: options?.conversationHistory || [],
      previousOutputs: options?.previousOutputs || new Map(),
      uploadedFiles: options?.uploadedFiles || [],
      userPreferences: options?.userPreferences || {},
      conversationId: options?.conversationId,
      userId: options?.userId,
    };
  }

  /**
   * Add conversation message to context
   */
  public static addMessage(
    context: SkillContext,
    role: 'user' | 'assistant' | 'system',
    content: string,
    skillUsed?: string
  ): SkillContext {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date(),
      skillUsed,
    };

    return {
      ...context,
      conversationHistory: [...(context.conversationHistory || []), message],
    };
  }

  /**
   * Add skill output to context
   */
  public static addSkillOutput(
    context: SkillContext,
    skillId: string,
    output: any
  ): SkillContext {
    const previousOutputs = new Map(context.previousOutputs);
    previousOutputs.set(skillId, output);

    return {
      ...context,
      previousOutputs,
    };
  }

  /**
   * Set user preferences
   */
  public static setUserPreferences(
    context: SkillContext,
    preferences: UserPreferences
  ): SkillContext {
    return {
      ...context,
      userPreferences: preferences,
    };
  }
}
