/**
 * Universal Agent - Skill Registry
 *
 * Singleton that manages all available skills.
 * Handles skill registration, discovery, and detection.
 */

import { BaseSkill } from './BaseSkill';
import {
  SkillMetadata,
  SkillContext,
  SkillDetectionResult,
  SkillDetectionConfig,
} from './types';

export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, BaseSkill> = new Map();
  private initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  /**
   * Initialize the registry by loading all skills
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🎯 Initializing Skill Registry...');

    try {
      // Skills will be registered individually by their modules
      // This is a placeholder for dynamic skill loading if needed

      this.initialized = true;
      console.log(
        `✅ Skill Registry initialized with ${this.skills.size} skills`
      );
    } catch (error) {
      console.error('❌ Error initializing Skill Registry:', error);
      throw error;
    }
  }

  /**
   * Register a skill
   * @param skill - Skill instance to register
   */
  public registerSkill(skill: BaseSkill): void {
    const metadata = skill.getMetadata();

    if (this.skills.has(metadata.id)) {
      console.warn(
        `Skill ${metadata.id} is already registered. Overwriting...`
      );
    }

    this.skills.set(metadata.id, skill);
    console.log(`📦 Registered skill: ${metadata.id} (${metadata.name})`);
  }

  /**
   * Unregister a skill
   * @param skillId - ID of skill to unregister
   */
  public unregisterSkill(skillId: string): boolean {
    const result = this.skills.delete(skillId);

    if (result) {
      console.log(`🗑️  Unregistered skill: ${skillId}`);
    }

    return result;
  }

  /**
   * Get a skill by ID
   * @param skillId - Skill ID
   * @returns Skill instance or null
   */
  public getSkill(skillId: string): BaseSkill | null {
    return this.skills.get(skillId) || null;
  }

  /**
   * Get all registered skills
   * @returns Array of all skills
   */
  public getAllSkills(): BaseSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get all skill metadata
   * @returns Array of skill metadata
   */
  public getAllSkillMetadata(): SkillMetadata[] {
    return this.getAllSkills().map((skill) => skill.getMetadata());
  }

  /**
   * Detect which skills can handle the user request
   * @param userRequest - User's request/message
   * @param context - Optional context for better detection
   * @param config - Detection configuration
   * @returns Sorted array of detection results (highest confidence first)
   */
  public async detectSkills(
    userRequest: string,
    context?: Partial<SkillContext>,
    config?: SkillDetectionConfig
  ): Promise<SkillDetectionResult[]> {
    const defaultConfig: SkillDetectionConfig = {
      autoSelectThreshold: 80,
      suggestionThreshold: 50,
      useSemanticAnalysis: true,
      useConversationContext: true,
      maxChainLength: 3,
      ...config,
    };

    const detectionResults: SkillDetectionResult[] = [];

    // Query all skills for their confidence
    for (const skill of Array.from(this.skills.values())) {
      try {
        const confidence = await skill.canHandle(userRequest, context);

        if (confidence >= (defaultConfig.suggestionThreshold || 50)) {
          const metadata = skill.getMetadata();

          // Find matched triggers
          const matchedTriggers = metadata.triggers.filter((trigger) =>
            userRequest.toLowerCase().includes(trigger.toLowerCase())
          );

          detectionResults.push({
            skillId: metadata.id,
            confidence,
            reason: this.buildDetectionReason(
              metadata,
              confidence,
              matchedTriggers
            ),
            matchedTriggers,
          });
        }
      } catch (error) {
        console.error(
          `Error detecting skill ${skill.getMetadata().id}:`,
          error
        );
      }
    }

    // Sort by confidence (highest first)
    detectionResults.sort((a, b) => b.confidence - a.confidence);

    // Log detection results
    console.log('🔍 Skill Detection Results:');
    detectionResults.forEach((result) => {
      console.log(
        `  ${result.skillId}: ${result.confidence}% - ${result.reason}`
      );
    });

    return detectionResults;
  }

  /**
   * Get the best skill for a request
   * @param userRequest - User's request
   * @param context - Optional context
   * @param config - Detection configuration
   * @returns Best skill ID or null
   */
  public async getBestSkill(
    userRequest: string,
    context?: Partial<SkillContext>,
    config?: SkillDetectionConfig
  ): Promise<string | null> {
    const results = await this.detectSkills(userRequest, context, config);

    if (results.length === 0) {
      return null;
    }

    const threshold = config?.autoSelectThreshold || 80;
    const topResult = results[0];

    if (topResult.confidence >= threshold) {
      return topResult.skillId;
    }

    return null;
  }

  /**
   * Get skills that could be chained together
   * @param userRequest - User's request
   * @param context - Optional context
   * @param maxSkills - Maximum number of skills in chain
   * @returns Array of skill IDs to chain
   */
  public async getSkillChain(
    userRequest: string,
    context?: Partial<SkillContext>,
    maxSkills: number = 3
  ): Promise<string[]> {
    const results = await this.detectSkills(userRequest, context);

    // Take top skills up to maxSkills
    return results
      .slice(0, Math.min(maxSkills, results.length))
      .filter((r) => r.confidence >= 60) // Only include reasonably confident matches
      .map((r) => r.skillId);
  }

  /**
   * Build a human-readable detection reason
   * @param metadata - Skill metadata
   * @param confidence - Confidence score
   * @param matchedTriggers - Triggers that matched
   * @returns Reason string
   */
  private buildDetectionReason(
    metadata: SkillMetadata,
    confidence: number,
    matchedTriggers: string[]
  ): string {
    if (matchedTriggers.length === 0) {
      return `${metadata.name} (semantic match)`;
    }

    if (matchedTriggers.length === 1) {
      return `Matched keyword: "${matchedTriggers[0]}"`;
    }

    return `Matched keywords: ${matchedTriggers.slice(0, 3).join(', ')}`;
  }

  /**
   * Check if a skill exists
   * @param skillId - Skill ID to check
   * @returns True if skill exists
   */
  public hasSkill(skillId: string): boolean {
    return this.skills.has(skillId);
  }

  /**
   * Get count of registered skills
   * @returns Number of skills
   */
  public getSkillCount(): number {
    return this.skills.size;
  }

  /**
   * Clear all registered skills (useful for testing)
   */
  public clear(): void {
    this.skills.clear();
    this.initialized = false;
    console.log('🗑️  Cleared all skills from registry');
  }

  /**
   * Get skills by capability
   * @param capability - Capability to search for
   * @returns Array of skills with that capability
   */
  public getSkillsByCapability(capability: string): BaseSkill[] {
    return this.getAllSkills().filter((skill) => {
      const metadata = skill.getMetadata();
      return metadata.capabilities.includes(capability);
    });
  }

  /**
   * Get skills by trigger keyword
   * @param trigger - Trigger keyword
   * @returns Array of skills with that trigger
   */
  public getSkillsByTrigger(trigger: string): BaseSkill[] {
    const lowerTrigger = trigger.toLowerCase();

    return this.getAllSkills().filter((skill) => {
      const metadata = skill.getMetadata();
      return metadata.triggers.some((t) => t.toLowerCase() === lowerTrigger);
    });
  }

  /**
   * Export registry state (for debugging)
   * @returns Registry state as JSON
   */
  public exportState(): {
    skillCount: number;
    skills: SkillMetadata[];
    initialized: boolean;
  } {
    return {
      skillCount: this.skills.size,
      skills: this.getAllSkillMetadata(),
      initialized: this.initialized,
    };
  }
}

// Export singleton instance getter
export const getSkillRegistry = () => SkillRegistry.getInstance();
