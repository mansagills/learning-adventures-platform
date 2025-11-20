/**
 * Type definitions for AI Agent Studio
 *
 * Based on Plan 6 specifications
 */

// Agent result interface
export interface AgentResult {
  success: boolean;
  output: any;
  errors: string[];
  warnings: string[];
  metadata: {
    duration: number;
    timestamp: Date;
    version: string;
  };
}

// Workflow step definition
export interface WorkflowStep {
  stepNumber: number;
  agentType: 'game-builder' | 'react-component' | 'metadata-formatter' | 'accessibility-validator';
  skillName: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

// Workflow definition
export interface AgentWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  results: Record<string, any>;
  errors: WorkflowError[];
}

// Workflow error
export interface WorkflowError {
  step: number;
  agentType: string;
  message: string;
  timestamp: Date;
}

// Game concept from Game Idea Generator
export interface GameConcept {
  title: string;
  description: string;
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  learningObjectives: string[];
  estimatedTime: string;
  gameplayMechanics: string[];
  educationalValue: number; // 1-10 rating
}

// Game file from Content Builder
export interface GameFile {
  code: string;
  path?: string;
  format: 'html' | 'react';
  metadata: GameConcept;
  dependencies?: string[];
}

// Catalog entry from Catalog Manager
export interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'lesson';
  category: string;
  gradeLevel: string[];
  difficulty: string;
  skills: string[];
  estimatedTime: string;
  featured: boolean;
  htmlPath?: string;
  reactPath?: string;
}

// QA report from Quality Assurance Agent
export interface QAReport {
  overallScore: number; // 0-100
  a11yScore: number; // 0-100
  eduScore: number; // 0-100
  wcagCompliant: boolean;
  issues: QAIssue[];
  fixes: string[];
  recommendations: string[];
}

export interface QAIssue {
  category: 'accessibility' | 'educational' | 'technical' | 'content';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  suggestedFix?: string;
}

// Content agent interface
export interface ContentAgent {
  id: string;
  type: string;
  skillPath: string;
  execute(input: any): Promise<AgentResult>;
  validate(output: any): boolean;
}

// Conversation context
export interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  metadata?: Record<string, any>;
}

// Skill knowledge
export interface SkillKnowledge {
  name: string;
  content: string;
  version: string;
}
