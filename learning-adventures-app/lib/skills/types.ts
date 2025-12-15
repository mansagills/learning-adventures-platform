/**
 * Universal Agent - Skill System Types
 *
 * This file defines the core types and interfaces for the skill-based agent system.
 * Skills are hybrid components combining TypeScript logic and markdown guidance.
 */

/**
 * Metadata describing a skill's capabilities and characteristics
 */
export interface SkillMetadata {
  /** Unique identifier for the skill */
  id: string;

  /** Human-readable name */
  name: string;

  /** Brief description of what the skill does */
  description: string;

  /** Keywords/patterns that trigger this skill */
  triggers: string[];

  /** List of capabilities this skill provides */
  capabilities: string[];

  /** Example requests that would use this skill */
  examples: string[];

  /** Version of the skill (for tracking updates) */
  version: string;

  /** Path to the markdown skill definition file */
  guidanceFile?: string;
}

/**
 * Context provided to a skill when executing
 */
export interface SkillContext {
  /** The user's original request/message */
  userRequest: string;

  /** Full conversation history */
  conversationHistory?: ConversationMessage[];

  /** Previously executed skill outputs (for chaining) */
  previousOutputs?: Map<string, any>;

  /** User-uploaded files for context */
  uploadedFiles?: UploadedFile[];

  /** User preferences and settings */
  userPreferences?: UserPreferences;

  /** Conversation ID for persistence */
  conversationId?: string;

  /** User ID for personalization */
  userId?: string;
}

/**
 * Message in a conversation
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  skillUsed?: string;
}

/**
 * Uploaded file reference
 */
export interface UploadedFile {
  id: string;
  filename: string;
  content: string;
  mimeType: string;
  size: number;
}

/**
 * User preferences for skill execution
 */
export interface UserPreferences {
  gradeLevel?: string;
  subjects?: string[];
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  accessibilityRequirements?: string[];
}

/**
 * Result returned by a skill after execution
 */
export interface SkillResult {
  /** Whether the skill executed successfully */
  success: boolean;

  /** The skill's output/response */
  output: any;

  /** Human-readable message */
  message: string;

  /** Structured metadata about the execution */
  metadata: {
    /** Time taken to execute (milliseconds) */
    executionTime?: number;

    /** Skill ID that was executed */
    skillId: string;

    /** Confidence score (0-100) of the execution */
    confidence: number;

    /** Suggested next skills to chain */
    suggestedNextSkills?: string[];

    /** Suggested next user actions */
    suggestedNextSteps?: string[];

    /** Any warnings or notices */
    warnings?: string[];
  };

  /** Error information if execution failed */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Result from skill detection
 */
export interface SkillDetectionResult {
  /** Skill ID */
  skillId: string;

  /** Confidence score (0-100) that this skill should handle the request */
  confidence: number;

  /** Reason why this skill was selected */
  reason: string;

  /** Matched triggers */
  matchedTriggers: string[];
}

/**
 * Skill detection algorithm configuration
 */
export interface SkillDetectionConfig {
  /** Minimum confidence threshold to auto-select a skill (default: 80) */
  autoSelectThreshold?: number;

  /** Minimum confidence to suggest a skill (default: 50) */
  suggestionThreshold?: number;

  /** Whether to use semantic analysis (Claude) for detection (default: true) */
  useSemanticAnalysis?: boolean;

  /** Whether to consider conversation context (default: true) */
  useConversationContext?: boolean;

  /** Maximum number of skills to chain automatically (default: 3) */
  maxChainLength?: number;
}

/**
 * Agent result (top-level response)
 */
export interface AgentResult {
  /** The agent's response message */
  response: string;

  /** Skill(s) used to generate the response */
  skillsUsed: string[];

  /** Overall confidence (0-100) */
  confidence: number;

  /** Structured output from skills */
  output?: any;

  /** Metadata about the execution */
  metadata: {
    /** Total execution time */
    totalExecutionTime?: number;

    /** Skill chain that was executed */
    skillChain?: string[];

    /** Suggested next steps for user */
    suggestedNextSteps?: string[];

    /** Any warnings */
    warnings?: string[];
  };

  /** Conversation ID */
  conversationId?: string;
}

/**
 * Game concept (from ideation skill)
 */
export interface GameConcept {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string[];
  learningObjectives: string[];
  gameplayMechanics: string[];
  estimatedPlayTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  educationalValue: number;
  engagementPotential: number;
}

/**
 * Generated game file
 */
export interface GameFile {
  filename: string;
  content: string;
  type: 'html' | 'react';
  size: number;
  metadata?: GameMetadata;
}

/**
 * Game metadata for catalog
 */
export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'game' | 'lesson';
  gradeLevel: string[];
  difficulty: string;
  skills: string[];
  estimatedTime: string;
  featured?: boolean;
  htmlPath?: string;
}

/**
 * Quality assurance report
 */
export interface QAReport {
  passed: boolean;
  score: number;
  checks: {
    name: string;
    passed: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }[];
  summary: string;
}

/**
 * Catalog entry for game catalog integration
 */
export interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'game' | 'lesson';
  gradeLevel: string[];
  difficulty: string;
  skills: string[];
  estimatedTime: string;
  featured: boolean;
  htmlPath?: string;
  targetArray: string;
  codeSnippet: string;
}
