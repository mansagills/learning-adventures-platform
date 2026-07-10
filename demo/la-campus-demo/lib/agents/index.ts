/**
 * AI Agent Studio - Main Export
 *
 * Exports all agents, types, and utilities for the AI Agent Studio.
 * Based on Plan 6 specifications.
 */

// Type exports
export type {
  AgentResult,
  WorkflowStep,
  AgentWorkflow,
  WorkflowError,
  GameConcept,
  GameFile,
  CatalogEntry,
  QAReport,
  QAIssue,
  ContentAgent,
  ConversationContext,
  SkillKnowledge,
} from './types';

// Base agent
export { BaseAgent } from './BaseAgent';

// Specialized agents
export { GameIdeaGeneratorAgent } from './GameIdeaGeneratorAgent';

// TODO: Export remaining agents when implemented:
// export { ContentBuilderAgent } from './ContentBuilderAgent';
// export { CatalogManagerAgent } from './CatalogManagerAgent';
// export { QualityAssuranceAgent } from './QualityAssuranceAgent';

// TODO: Export workflow orchestration:
// export { WorkflowOrchestrator } from './WorkflowOrchestrator';
// export { WorkflowFactory } from './WorkflowFactory';

/**
 * Quick Start Example:
 *
 * ```typescript
 * import { GameIdeaGeneratorAgent } from '@/lib/agents';
 *
 * const agent = new GameIdeaGeneratorAgent();
 * const result = await agent.execute({
 *   subject: 'math',
 *   gradeLevel: '3-5',
 *   learningObjectives: ['Master multiplication facts'],
 * });
 *
 * if (result.success) {
 *   console.log('Generated concepts:', result.output);
 * }
 * ```
 */
