/**
 * Workflow Executor
 *
 * Orchestrates multi-agent workflows by coordinating individual agents
 * and managing state between steps.
 */

import prisma from '@/lib/prisma';
import { GameIdeaGeneratorAgent } from './GameIdeaGeneratorAgent';

export interface WorkflowStep {
  agent: string;
  action: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  agent: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
}

export type ProgressCallback = (progress: WorkflowProgress) => void;

/**
 * Workflow definitions
 */
const WORKFLOWS: Record<string, WorkflowDefinition> = {
  'html-game-creation': {
    id: 'html-game-creation',
    name: 'HTML Game Creation',
    steps: [
      { agent: 'game-idea-generator', action: 'Brainstorm game concepts' },
      { agent: 'content-builder', action: 'Build HTML game file' },
      { agent: 'quality-assurance', action: 'Validate accessibility and quality' },
      { agent: 'content-builder', action: 'Apply fixes if needed' },
      { agent: 'catalog-manager', action: 'Format catalog metadata' },
    ],
  },
  'react-game-creation': {
    id: 'react-game-creation',
    name: 'React Component Game Creation',
    steps: [
      { agent: 'game-idea-generator', action: 'Generate game concept' },
      { agent: 'content-builder', action: 'Build React component' },
      { agent: 'quality-assurance', action: 'Validate and test component' },
      { agent: 'catalog-manager', action: 'Create catalog entry' },
    ],
  },
  'validation-only': {
    id: 'validation-only',
    name: 'Quality Validation',
    steps: [
      { agent: 'quality-assurance', action: 'Run accessibility checks' },
      { agent: 'quality-assurance', action: 'Generate QA report' },
      { agent: 'content-builder', action: 'Apply recommended fixes (optional)' },
    ],
  },
  'batch-creation': {
    id: 'batch-creation',
    name: 'Batch Content Creation',
    steps: [
      { agent: 'game-idea-generator', action: 'Generate ideas from brief' },
      { agent: 'content-builder', action: 'Build all games (parallel)' },
      { agent: 'quality-assurance', action: 'Validate all games' },
      { agent: 'catalog-manager', action: 'Format all metadata' },
    ],
  },
};

export class WorkflowExecutor {
  private executionId: string;
  private userId: string;

  constructor(executionId: string, userId: string) {
    this.executionId = executionId;
    this.userId = userId;
  }

  /**
   * Execute a complete workflow
   */
  async execute(
    workflowId: string,
    input: any,
    fileIds?: string[],
    onProgress?: ProgressCallback
  ): Promise<any> {
    const workflow = WORKFLOWS[workflowId];
    if (!workflow) {
      throw new Error(`Unknown workflow: ${workflowId}`);
    }

    // Update execution with total steps
    await prisma.workflowExecution.update({
      where: { id: this.executionId },
      data: { totalSteps: workflow.steps.length },
    });

    let context: any = { input, fileIds };
    const results: any[] = [];

    // Execute each step sequentially
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];

      // Update progress
      if (onProgress) {
        onProgress({
          currentStep: i + 1,
          totalSteps: workflow.steps.length,
          stepName: step.action,
          agent: step.agent,
          status: 'running',
        });
      }

      // Update database
      await prisma.workflowExecution.update({
        where: { id: this.executionId },
        data: { currentStep: i + 1 },
      });

      try {
        // Execute the step
        const stepResult = await this.executeStep(step, context);
        results.push(stepResult);

        // Update context for next step
        context = {
          ...context,
          previousStep: stepResult,
          allResults: results,
        };

        // Send completion update
        if (onProgress) {
          onProgress({
            currentStep: i + 1,
            totalSteps: workflow.steps.length,
            stepName: step.action,
            agent: step.agent,
            status: 'completed',
            output: stepResult.output,
          });
        }
      } catch (error) {
        console.error(`Step ${i + 1} failed:`, error);

        // Update execution as failed
        await prisma.workflowExecution.update({
          where: { id: this.executionId },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Step failed',
          },
        });

        if (onProgress) {
          onProgress({
            currentStep: i + 1,
            totalSteps: workflow.steps.length,
            stepName: step.action,
            agent: step.agent,
            status: 'failed',
          });
        }

        throw error;
      }
    }

    // Mark workflow as completed
    await prisma.workflowExecution.update({
      where: { id: this.executionId },
      data: {
        status: 'COMPLETED',
        output: results,
      },
    });

    return {
      workflowId,
      results,
    };
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: WorkflowStep, context: any): Promise<any> {
    const { agent, action } = step;

    // Route to appropriate agent
    switch (agent) {
      case 'game-idea-generator':
        return this.executeGameIdeaGenerator(action, context);

      case 'content-builder':
        return this.executeContentBuilder(action, context);

      case 'quality-assurance':
        return this.executeQualityAssurance(action, context);

      case 'catalog-manager':
        return this.executeCatalogManager(action, context);

      default:
        throw new Error(`Unknown agent: ${agent}`);
    }
  }

  /**
   * Game Idea Generator execution
   */
  private async executeGameIdeaGenerator(action: string, context: any): Promise<any> {
    const agent = new GameIdeaGeneratorAgent();

    // Build prompt based on action and context
    let prompt = '';
    if (context.input?.topic) {
      prompt = `Generate 3 educational game ideas for the topic: ${context.input.topic}`;
      if (context.input.gradeLevel) {
        prompt += ` (Grade level: ${context.input.gradeLevel})`;
      }
      if (context.input.subject) {
        prompt += ` (Subject: ${context.input.subject})`;
      }
    } else {
      prompt = 'Generate 3 creative educational game ideas for elementary students';
    }

    const response = await agent.processMessage(prompt, [], context.fileIds);

    return {
      agent: 'game-idea-generator',
      action,
      output: response,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Content Builder execution
   */
  private async executeContentBuilder(action: string, context: any): Promise<any> {
    // TODO: Implement ContentBuilderAgent
    // For now, return mock response
    await this.delay(2000);

    return {
      agent: 'content-builder',
      action,
      output: `[Content Builder] ${action} - Implementation pending. Would create game files based on the concept from previous step.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Quality Assurance execution
   */
  private async executeQualityAssurance(action: string, context: any): Promise<any> {
    // TODO: Implement QualityAssuranceAgent
    // For now, return mock response
    await this.delay(2000);

    return {
      agent: 'quality-assurance',
      action,
      output: `[Quality Assurance] ${action} - Implementation pending. Would validate accessibility and quality standards.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Catalog Manager execution
   */
  private async executeCatalogManager(action: string, context: any): Promise<any> {
    // TODO: Implement CatalogManagerAgent
    // For now, return mock response
    await this.delay(2000);

    return {
      agent: 'catalog-manager',
      action,
      output: `[Catalog Manager] ${action} - Implementation pending. Would format metadata for catalogData.ts integration.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Utility: Delay for simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
