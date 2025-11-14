/**
 * Agent Workflow System - Type Definitions
 * Phase 5B: Agent Workflow Architecture
 */

// ============================================================================
// Core Agent Types
// ============================================================================

export type AgentType =
  | 'game-builder'
  | 'react-component'
  | 'metadata-formatter'
  | 'accessibility-validator';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// ============================================================================
// Agent Result Types
// ============================================================================

export interface AgentResult {
  success: boolean;
  output: any;
  errors: string[];
  warnings: string[];
  metadata: {
    duration: number;
    timestamp: Date;
    version: string;
    tokensUsed?: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface WorkflowStep {
  stepNumber: number;
  agentType: AgentType;
  skillName: string;
  description: string;
  input: any;
  output?: any;
  status: StepStatus;
  duration?: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  type: 'html-game' | 'react-game' | 'batch-creation' | 'validation-only';
  steps: WorkflowStep[];
  status: WorkflowStatus;
  currentStep: number;
  results: Record<string, any>;
  errors: WorkflowError[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalDuration?: number;
}

export interface WorkflowError {
  step: number;
  agentType: AgentType;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

// ============================================================================
// Content Creation Types
// ============================================================================

export interface GameConcept {
  title: string;
  description: string;
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string;
  skills: string[];
  learningObjectives: string[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameFile {
  code: string;
  path: string;
  format: 'html' | 'react';
  metadata: GameConcept;
  size?: number;
  checksum?: string;
}

export interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'lesson' | 'activity';
  category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  learningObjectives: string[];
  estimatedTime: number;
  featured: boolean;
  htmlPath?: string;
  componentPath?: string;
}

export interface AccessibilityReport {
  overallScore: number;
  wcagCompliant: boolean;
  issues: AccessibilityIssue[];
  recommendations: string[];
  testedAt: Date;
}

export interface AccessibilityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  element?: string;
  suggestedFix: string;
  wcagCriterion?: string;
}

// ============================================================================
// Workflow Input Types
// ============================================================================

export interface HTMLGameWorkflowInput {
  gameIdea: string;
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string;
  skills: string[];
  learningObjectives?: string[];
  additionalRequirements?: string;
}

export interface ReactGameWorkflowInput {
  gameIdea: string;
  subject: string;
  gradeLevel: string;
  complexity: 'simple' | 'moderate' | 'complex';
  features: string[];
  skills: string[];
  learningObjectives?: string[];
}

export interface BatchContentWorkflowInput {
  gameIdeas: Array<{
    title: string;
    type: 'html' | 'react';
    subject: string;
    gradeLevel: string;
    description: string;
    skills: string[];
  }>;
  execution: 'parallel' | 'sequential';
  maxConcurrent?: number;
}

// ============================================================================
// Workflow Output Types
// ============================================================================

export interface HTMLGameWorkflowOutput {
  gameFile: GameFile;
  catalogEntry: CatalogEntry;
  accessibilityReport: AccessibilityReport;
  filePath: string;
  success: boolean;
}

export interface ReactGameWorkflowOutput {
  componentDirectory: string;
  registrationFile: string;
  catalogEntry: CatalogEntry;
  accessibilityReport: AccessibilityReport;
  success: boolean;
}

export interface BatchWorkflowOutput {
  total: number;
  completed: number;
  failed: number;
  successfulGames: Array<HTMLGameWorkflowOutput | ReactGameWorkflowOutput>;
  failedGames: FailureReport[];
  aggregateReport: BatchReport;
}

export interface FailureReport {
  gameTitle: string;
  gameType: 'html' | 'react';
  failedStep: number;
  error: string;
  timestamp: Date;
}

export interface BatchReport {
  totalGames: number;
  successCount: number;
  failureCount: number;
  averageAccessibilityScore: number;
  totalTimeSpent: number;
  timePerGame: number;
  startedAt: Date;
  completedAt: Date;
}

// ============================================================================
// Agent Configuration Types
// ============================================================================

export interface AgentConfig {
  type: AgentType;
  skillPaths: string[];
  maxRetries?: number;
  timeout?: number;
  validateOutput?: boolean;
}

export interface SkillKnowledge {
  name: string;
  content: string;
  version: string;
  loadedAt: Date;
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

export interface WorkflowProgress {
  workflowId: string;
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
  status: WorkflowStatus;
  estimatedTimeRemaining?: number;
  currentActivity: string;
}

export interface WorkflowEvent {
  workflowId: string;
  type: 'started' | 'step_started' | 'step_completed' | 'step_failed' | 'completed' | 'failed';
  step?: number;
  message: string;
  timestamp: Date;
  data?: any;
}

// ============================================================================
// Agent Response Types
// ============================================================================

export interface GameBuilderResponse {
  gameCode: string;
  gameId: string;
  metadata: GameConcept;
  technicalSpecs: {
    fileSize: number;
    lineCount: number;
    hasAccessibilityFeatures: boolean;
  };
}

export interface MetadataFormatterResponse {
  catalogEntry: CatalogEntry;
  targetArray: string; // e.g., "mathGames", "scienceLessons"
  validation: ValidationResult;
}

export interface AccessibilityValidatorResponse {
  report: AccessibilityReport;
  passedValidation: boolean;
  criticalIssuesCount: number;
  recommendedFixes: string[];
}

export interface ReactComponentResponse {
  componentCode: string;
  componentDirectory: string;
  registrationCode: string;
  dependencies: string[];
  metadata: GameConcept;
}
