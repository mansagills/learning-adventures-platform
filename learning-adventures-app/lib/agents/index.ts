/**
 * Agent Workflow System - Main Export
 * Phase 5B: Agent Workflow Architecture
 *
 * This module provides a complete agent-based workflow system for automating
 * educational content creation.
 */

// Core components
export { BaseAgent } from './BaseAgent';
export { ContentAgentOrchestrator } from './ContentAgentOrchestrator';
export { WorkflowFactory } from './WorkflowFactory';

// Specialized agents
export { GameBuilderAgent } from './GameBuilderAgent';
export { ReactComponentAgent } from './ReactComponentAgent';
export { MetadataFormatterAgent } from './MetadataFormatterAgent';
export { AccessibilityValidatorAgent } from './AccessibilityValidatorAgent';

// Type definitions
export type {
  // Core types
  AgentType,
  WorkflowStatus,
  StepStatus,
  AgentResult,
  ValidationResult,

  // Workflow types
  AgentWorkflow,
  WorkflowStep,
  WorkflowError,
  WorkflowEvent,
  WorkflowProgress,

  // Content types
  GameConcept,
  GameFile,
  CatalogEntry,
  AccessibilityReport,
  AccessibilityIssue,

  // Input types
  HTMLGameWorkflowInput,
  ReactGameWorkflowInput,
  BatchContentWorkflowInput,

  // Output types
  HTMLGameWorkflowOutput,
  ReactGameWorkflowOutput,
  BatchWorkflowOutput,

  // Agent response types
  GameBuilderResponse,
  ReactComponentResponse,
  MetadataFormatterResponse,
  AccessibilityValidatorResponse,

  // Config types
  AgentConfig,
  SkillKnowledge,
} from './types';

/**
 * Quick Start Guide:
 *
 * 1. Create a workflow factory:
 *    ```ts
 *    import { WorkflowFactory } from '@/lib/agents';
 *    const factory = new WorkflowFactory();
 *    ```
 *
 * 2. Create an HTML game workflow:
 *    ```ts
 *    const workflowId = await factory.createHTMLGameWorkflow({
 *      gameIdea: 'A fun multiplication game',
 *      subject: 'math',
 *      gradeLevel: '3-5',
 *      skills: ['multiplication', 'mental math'],
 *    });
 *    ```
 *
 * 3. Execute the workflow:
 *    ```ts
 *    const result = await factory.executeWorkflow(workflowId);
 *    ```
 *
 * 4. Get the results:
 *    ```ts
 *    if (result.status === 'completed') {
 *      const gameCode = result.results.step1.gameCode;
 *      const catalogEntry = result.results.step3.catalogEntry;
 *    }
 *    ```
 *
 * See /lib/agents/examples/ for more detailed usage examples.
 */
