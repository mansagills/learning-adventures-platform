/**
 * Content Agent Orchestrator
 * Coordinates multi-agent workflows for content creation
 */

import {
  AgentWorkflow,
  WorkflowStep,
  WorkflowStatus,
  StepStatus,
  WorkflowError,
  WorkflowEvent,
  WorkflowProgress,
  HTMLGameWorkflowInput,
  HTMLGameWorkflowOutput,
  ReactGameWorkflowInput,
  ReactGameWorkflowOutput,
  BatchContentWorkflowInput,
  BatchWorkflowOutput,
} from './types';
import { BaseAgent } from './BaseAgent';

export class ContentAgentOrchestrator {
  private workflows: Map<string, AgentWorkflow> = new Map();
  private agents: Map<string, BaseAgent> = new Map();
  private eventListeners: Map<string, ((event: WorkflowEvent) => void)[]> = new Map();

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: BaseAgent): void {
    const info = agent.getInfo();
    this.agents.set(info.type, agent);
    console.log(`Agent registered: ${info.type}`);
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(
    type: AgentWorkflow['type'],
    name: string,
    steps: Omit<WorkflowStep, 'status' | 'stepNumber'>[]
  ): Promise<string> {
    const workflowId = this.generateWorkflowId();

    const workflow: AgentWorkflow = {
      id: workflowId,
      name,
      type,
      steps: steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
        status: 'pending' as StepStatus,
      })),
      status: 'pending',
      currentStep: 0,
      results: {},
      errors: [],
      createdAt: new Date(),
    };

    this.workflows.set(workflowId, workflow);
    this.emitEvent(workflowId, 'started', `Workflow "${name}" created`);

    return workflowId;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string): Promise<AgentWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'running';
    workflow.startedAt = new Date();

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        workflow.currentStep = i;
        const step = workflow.steps[i];

        // Execute step
        await this.executeStep(workflowId, step);

        // Check if step failed
        if (step.status === 'failed') {
          workflow.status = 'failed';
          throw new Error(`Step ${step.stepNumber} failed: ${step.error}`);
        }

        // Store step output in results
        workflow.results[`step${step.stepNumber}`] = step.output;
      }

      // All steps completed successfully
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      workflow.totalDuration = workflow.completedAt.getTime() - workflow.startedAt.getTime();

      this.emitEvent(workflowId, 'completed', `Workflow completed successfully`);

    } catch (error) {
      workflow.status = 'failed';
      workflow.completedAt = new Date();

      const workflowError: WorkflowError = {
        step: workflow.currentStep,
        agentType: workflow.steps[workflow.currentStep]?.agentType,
        message: (error as Error).message,
        timestamp: new Date(),
        recoverable: false,
      };

      workflow.errors.push(workflowError);
      this.emitEvent(workflowId, 'failed', `Workflow failed: ${workflowError.message}`);
    }

    return workflow;
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(workflowId: string, step: WorkflowStep): Promise<void> {
    const agent = this.agents.get(step.agentType);
    if (!agent) {
      throw new Error(`Agent ${step.agentType} not registered`);
    }

    step.status = 'running';
    step.startedAt = new Date();
    this.emitEvent(workflowId, 'step_started', `Executing step ${step.stepNumber}: ${step.description}`, step.stepNumber);

    try {
      // Resolve template strings in input using previous step outputs
      const workflow = this.workflows.get(workflowId);
      const resolvedInput = workflow ? this.resolveTemplates(step.input, workflow) : step.input;

      // Execute agent with resolved input
      const result = await agent.executeWithRetry(resolvedInput);

      if (!result.success) {
        step.status = 'failed';
        step.error = result.errors.join('; ');
        this.emitEvent(workflowId, 'step_failed', `Step ${step.stepNumber} failed`, step.stepNumber);
        return;
      }

      // Step succeeded
      step.status = 'completed';
      step.output = result.output;
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();

      this.emitEvent(workflowId, 'step_completed', `Step ${step.stepNumber} completed`, step.stepNumber);

    } catch (error) {
      step.status = 'failed';
      step.error = (error as Error).message;
      step.completedAt = new Date();
      this.emitEvent(workflowId, 'step_failed', `Step ${step.stepNumber} failed: ${step.error}`, step.stepNumber);
    }
  }

  /**
   * Get workflow status
   */
  getWorkflow(workflowId: string): AgentWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get workflow progress
   */
  getProgress(workflowId: string): WorkflowProgress | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    const percentComplete = (completedSteps / workflow.steps.length) * 100;

    const currentStep = workflow.steps[workflow.currentStep];
    const currentActivity = currentStep
      ? `${currentStep.description} (Step ${currentStep.stepNumber}/${workflow.steps.length})`
      : 'Idle';

    return {
      workflowId,
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      percentComplete,
      status: workflow.status,
      currentActivity,
    };
  }

  /**
   * Event system for workflow monitoring
   */
  addEventListener(workflowId: string, callback: (event: WorkflowEvent) => void): void {
    if (!this.eventListeners.has(workflowId)) {
      this.eventListeners.set(workflowId, []);
    }
    this.eventListeners.get(workflowId)!.push(callback);
  }

  private emitEvent(
    workflowId: string,
    type: WorkflowEvent['type'],
    message: string,
    step?: number,
    data?: any
  ): void {
    const event: WorkflowEvent = {
      workflowId,
      type,
      message,
      step,
      timestamp: new Date(),
      data,
    };

    const listeners = this.eventListeners.get(workflowId) || [];
    listeners.forEach(callback => callback(event));

    // Also log to console
    console.log(`[Workflow ${workflowId}] ${type}: ${message}`);
  }

  /**
   * Utility: Generate workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Pause a running workflow
   */
  pauseWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'running') {
      return false;
    }

    workflow.status = 'paused';
    this.emitEvent(workflowId, 'step_completed', 'Workflow paused');
    return true;
  }

  /**
   * Resume a paused workflow
   */
  async resumeWorkflow(workflowId: string): Promise<AgentWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'paused') {
      throw new Error('Workflow not found or not paused');
    }

    return this.executeWorkflow(workflowId);
  }

  /**
   * Cancel a workflow
   */
  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.status = 'failed';
    workflow.completedAt = new Date();

    const error: WorkflowError = {
      step: workflow.currentStep,
      agentType: workflow.steps[workflow.currentStep]?.agentType,
      message: 'Workflow cancelled by user',
      timestamp: new Date(),
      recoverable: false,
    };

    workflow.errors.push(error);
    this.emitEvent(workflowId, 'failed', 'Workflow cancelled');
    return true;
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): AgentWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by status
   */
  getWorkflowsByStatus(status: WorkflowStatus): AgentWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.status === status);
  }

  /**
   * Clear completed workflows (cleanup)
   */
  clearCompletedWorkflows(): number {
    let cleared = 0;
    for (const [id, workflow] of this.workflows.entries()) {
      if (workflow.status === 'completed') {
        this.workflows.delete(id);
        this.eventListeners.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Resolve template strings in input data
   * Replaces {{stepN.output.field}} with actual values from previous steps
   */
  private resolveTemplates(input: any, workflow: AgentWorkflow): any {
    // Helper function to resolve a single template string
    const resolveString = (str: string): any => {
      // Match patterns like {{step1.output.metadata}}
      const templateRegex = /\{\{([^}]+)\}\}/g;
      let match;
      let result = str;

      while ((match = templateRegex.exec(str)) !== null) {
        const path = match[1].trim(); // e.g., "step1.output.metadata"
        const value = this.getValueFromPath(path, workflow);

        // If the entire string is just the template, return the value directly
        if (str === match[0]) {
          return value;
        }

        // Otherwise, replace the template in the string
        result = result.replace(match[0], JSON.stringify(value));
      }

      return result;
    };

    // Recursively process objects and arrays
    const processValue = (value: any): any => {
      if (typeof value === 'string') {
        return resolveString(value);
      } else if (Array.isArray(value)) {
        return value.map(processValue);
      } else if (value !== null && typeof value === 'object') {
        const result: any = {};
        for (const key in value) {
          result[key] = processValue(value[key]);
        }
        return result;
      }
      return value;
    };

    return processValue(input);
  }

  /**
   * Get value from a path like "step1.output.metadata"
   */
  private getValueFromPath(path: string, workflow: AgentWorkflow): any {
    const parts = path.split('.');

    // Handle stepN references
    if (parts[0].startsWith('step')) {
      const stepNum = parseInt(parts[0].replace('step', ''));
      const stepData = workflow.results[`step${stepNum}`];

      if (!stepData) {
        return null;
      }

      // Navigate through the remaining path
      let value: any = stepData;
      for (let i = 1; i < parts.length; i++) {
        if (value && typeof value === 'object') {
          value = value[parts[i]];
        } else {
          return null;
        }
      }

      return value;
    }

    return null;
  }
}
