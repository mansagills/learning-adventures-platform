/**
 * Workflow Factory
 * Provides pre-built workflow patterns for common content creation tasks
 */

import { ContentAgentOrchestrator } from './ContentAgentOrchestrator';
import { GameBuilderAgent } from './GameBuilderAgent';
import { ReactComponentAgent } from './ReactComponentAgent';
import { MetadataFormatterAgent } from './MetadataFormatterAgent';
import { AccessibilityValidatorAgent } from './AccessibilityValidatorAgent';
import {
  HTMLGameWorkflowInput,
  ReactGameWorkflowInput,
  BatchContentWorkflowInput,
  AgentWorkflow,
  WorkflowStep,
} from './types';

export class WorkflowFactory {
  private orchestrator: ContentAgentOrchestrator;

  constructor() {
    this.orchestrator = new ContentAgentOrchestrator();
    this.initializeAgents();
  }

  /**
   * Initialize and register all agents
   */
  private initializeAgents(): void {
    this.orchestrator.registerAgent(new GameBuilderAgent());
    this.orchestrator.registerAgent(new ReactComponentAgent());
    this.orchestrator.registerAgent(new MetadataFormatterAgent());
    this.orchestrator.registerAgent(new AccessibilityValidatorAgent());
  }

  /**
   * Create HTML Game Workflow
   * Steps: Build Game → Validate Accessibility → Fix (if needed) → Format Metadata
   */
  async createHTMLGameWorkflow(input: HTMLGameWorkflowInput): Promise<string> {
    const steps: Omit<WorkflowStep, 'status' | 'stepNumber'>[] = [
      {
        agentType: 'game-builder',
        skillName: 'educational-game-builder',
        description: 'Building HTML game',
        input: input,
      },
      {
        agentType: 'accessibility-validator',
        skillName: 'accessibility-validator',
        description: 'Validating accessibility',
        input: { code: '{{step1.output.gameCode}}', format: 'html' },
      },
      {
        agentType: 'metadata-formatter',
        skillName: 'catalog-metadata-formatter',
        description: 'Formatting catalog metadata',
        input: {
          concept: '{{step1.output.metadata}}',
          format: 'html',
        },
      },
    ];

    const workflowId = await this.orchestrator.createWorkflow(
      'html-game',
      `Create HTML Game: ${input.gameIdea.substring(0, 50)}`,
      steps
    );

    return workflowId;
  }

  /**
   * Create React Game Workflow
   * Steps: Build Component → Validate Accessibility → Format Metadata
   */
  async createReactGameWorkflow(input: ReactGameWorkflowInput): Promise<string> {
    const steps: Omit<WorkflowStep, 'status' | 'stepNumber'>[] = [
      {
        agentType: 'react-component',
        skillName: 'react-game-component',
        description: 'Building React game component',
        input: input,
      },
      {
        agentType: 'accessibility-validator',
        skillName: 'accessibility-validator',
        description: 'Validating accessibility',
        input: { code: '{{step1.output.componentCode}}', format: 'react' },
      },
      {
        agentType: 'metadata-formatter',
        skillName: 'catalog-metadata-formatter',
        description: 'Formatting catalog metadata',
        input: {
          concept: '{{step1.output.metadata}}',
          format: 'react',
        },
      },
    ];

    const workflowId = await this.orchestrator.createWorkflow(
      'react-game',
      `Create React Game: ${input.gameIdea.substring(0, 50)}`,
      steps
    );

    return workflowId;
  }

  /**
   * Create Validation-Only Workflow
   * For validating existing games
   */
  async createValidationWorkflow(code: string, format: 'html' | 'react'): Promise<string> {
    const steps: Omit<WorkflowStep, 'status' | 'stepNumber'>[] = [
      {
        agentType: 'accessibility-validator',
        skillName: 'accessibility-validator',
        description: 'Validating accessibility',
        input: { code, format },
      },
    ];

    const workflowId = await this.orchestrator.createWorkflow(
      'validation-only',
      `Validate ${format.toUpperCase()} Game`,
      steps
    );

    return workflowId;
  }

  /**
   * Execute workflow and return results
   */
  async executeWorkflow(workflowId: string): Promise<AgentWorkflow> {
    return await this.orchestrator.executeWorkflow(workflowId);
  }

  /**
   * Get workflow progress
   */
  getProgress(workflowId: string) {
    return this.orchestrator.getProgress(workflowId);
  }

  /**
   * Get workflow details
   */
  getWorkflow(workflowId: string) {
    return this.orchestrator.getWorkflow(workflowId);
  }

  /**
   * Listen to workflow events
   */
  addEventListener(workflowId: string, callback: any) {
    this.orchestrator.addEventListener(workflowId, callback);
  }

  /**
   * Batch create games (sequential)
   */
  async createBatchWorkflowSequential(input: BatchContentWorkflowInput): Promise<string[]> {
    const workflowIds: string[] = [];

    for (const gameIdea of input.gameIdeas) {
      let workflowId: string;

      if (gameIdea.type === 'html') {
        workflowId = await this.createHTMLGameWorkflow({
          gameIdea: gameIdea.description,
          subject: gameIdea.subject as any,
          gradeLevel: gameIdea.gradeLevel,
          skills: gameIdea.skills,
        });
      } else {
        workflowId = await this.createReactGameWorkflow({
          gameIdea: gameIdea.description,
          subject: gameIdea.subject,
          gradeLevel: gameIdea.gradeLevel,
          complexity: 'moderate',
          features: [],
          skills: gameIdea.skills,
        });
      }

      workflowIds.push(workflowId);

      // Execute workflow immediately (sequential)
      await this.executeWorkflow(workflowId);
    }

    return workflowIds;
  }

  /**
   * Batch create games (parallel)
   */
  async createBatchWorkflowParallel(input: BatchContentWorkflowInput): Promise<string[]> {
    const workflowPromises = input.gameIdeas.map(async (gameIdea) => {
      let workflowId: string;

      if (gameIdea.type === 'html') {
        workflowId = await this.createHTMLGameWorkflow({
          gameIdea: gameIdea.description,
          subject: gameIdea.subject as any,
          gradeLevel: gameIdea.gradeLevel,
          skills: gameIdea.skills,
        });
      } else {
        workflowId = await this.createReactGameWorkflow({
          gameIdea: gameIdea.description,
          subject: gameIdea.subject,
          gradeLevel: gameIdea.gradeLevel,
          complexity: 'moderate',
          features: [],
          skills: gameIdea.skills,
        });
      }

      return workflowId;
    });

    const workflowIds = await Promise.all(workflowPromises);

    // Execute all workflows in parallel
    await Promise.all(workflowIds.map(id => this.executeWorkflow(id)));

    return workflowIds;
  }

  /**
   * Create workflow with custom steps
   */
  async createCustomWorkflow(
    name: string,
    type: AgentWorkflow['type'],
    steps: Omit<WorkflowStep, 'status' | 'stepNumber'>[]
  ): Promise<string> {
    return await this.orchestrator.createWorkflow(type, name, steps);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows() {
    return this.orchestrator.getAllWorkflows();
  }

  /**
   * Get workflows by status
   */
  getWorkflowsByStatus(status: any) {
    return this.orchestrator.getWorkflowsByStatus(status);
  }

  /**
   * Pause workflow
   */
  pauseWorkflow(workflowId: string) {
    return this.orchestrator.pauseWorkflow(workflowId);
  }

  /**
   * Resume workflow
   */
  async resumeWorkflow(workflowId: string) {
    return await this.orchestrator.resumeWorkflow(workflowId);
  }

  /**
   * Cancel workflow
   */
  cancelWorkflow(workflowId: string) {
    return this.orchestrator.cancelWorkflow(workflowId);
  }
}

/**
 * Example Usage:
 *
 * // Create workflow factory
 * const factory = new WorkflowFactory();
 *
 * // Create HTML game workflow
 * const workflowId = await factory.createHTMLGameWorkflow({
 *   gameIdea: 'A multiplication racing game where students race cars by solving problems',
 *   subject: 'math',
 *   gradeLevel: '3-5',
 *   skills: ['multiplication', 'mental math', 'speed calculation'],
 * });
 *
 * // Listen to workflow events
 * factory.addEventListener(workflowId, (event) => {
 *   console.log(`Workflow event: ${event.type} - ${event.message}`);
 * });
 *
 * // Execute workflow
 * const result = await factory.executeWorkflow(workflowId);
 *
 * // Check results
 * if (result.status === 'completed') {
 *   const gameCode = result.results.step1.gameCode;
 *   const catalogEntry = result.results.step3.catalogEntry;
 *   console.log('Game created successfully!');
 * }
 */
